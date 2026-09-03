import { OrderRepository } from '../repositories/order-repo';
import { CartRepository } from '../repositories/cart-repo';
import { UserRepository } from '../repositories/user-repo';
import { SalesRepository } from '../repositories/sales-repo';
import { withTransaction } from '../db';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { Order, OrderItem, SavedAddress } from '../db/schema';

export class OrderService {
  static async placeOrder(
    userId: number,
    orderData: {
      name: string;
      number: string;
      method: string;
      address: string;
      delivery_notes?: string;
      payment_proof?: string;
      order_type?: 'delivery' | 'pickup';
      lat?: number | null;
      lng?: number | null;
      save_address_label?: string;
    }
  ): Promise<{ success: boolean; message: string; orderId?: number }> {
    const cartItems = await CartRepository.getByUserId(userId);
    if (!cartItems || cartItems.length === 0) {
      return { success: false, message: 'Your cart is empty!' };
    }

    const total_products = cartItems.map((c) => `${c.name} (${c.quantity})`).join(', ');
    const total_price = cartItems.reduce((sum, c) => sum + Number(c.price) * Number(c.quantity), 0);

    const orderType = orderData.order_type || 'delivery';

    const orderId = await withTransaction(async (conn) => {
      const newOrderId = await OrderRepository.create(
        {
          user_id: userId,
          name: orderData.name,
          number: orderData.number,
          method: orderData.method,
          address: orderData.address,
          delivery_notes: orderData.delivery_notes,
          payment_proof: orderData.payment_proof,
          order_type: orderType,
          order_status: 'pending',
          lat: orderData.lat,
          lng: orderData.lng,
          total_products,
          total_price,
        },
        conn
      );

      for (const item of cartItems) {
        await OrderRepository.createItem(
          {
            order_id: newOrderId,
            product_id: item.pid,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.options || item.sizename || undefined,
            customizations: item.customIDS || undefined,
          },
          conn
        );
      }

      await CartRepository.clearUserCart(userId, conn);
      return newOrderId;
    });

    // Optionally save customer address with label (e.g. Home, Work) along with exact coordinates
    if (orderType === 'delivery' && orderData.save_address_label && orderData.address) {
      await UserRepository.addSavedAddress(userId, {
        id: `addr_${Date.now()}`,
        label: orderData.save_address_label.trim() || 'Home',
        address: orderData.address,
        details: orderData.delivery_notes,
        lat: orderData.lat || undefined,
        lng: orderData.lng || undefined,
      });
    }

    const user = await UserRepository.findById(userId);
    const customerEmail = user?.email || (orderData as any).email || '';

    if (customerEmail) {
      sendOrderConfirmationEmail({
        orderId,
        customerName: orderData.name,
        customerEmail,
        totalPrice: total_price,
        items: cartItems.map((c) => ({ name: c.name, quantity: c.quantity, price: c.price })),
      }).catch(console.error);
    }

    return { success: true, message: 'Order placed successfully! We will review and prepare it soon.', orderId };
  }

  static async getUserOrders(userId: number): Promise<Array<Order & { items: OrderItem[] }>> {
    const orders = await OrderRepository.getByUserId(userId);
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderRepository.getItemsByOrderId(order.id);
        return { ...order, items };
      })
    );
    return ordersWithItems;
  }

  static async getAllOrders(search?: string, status?: string, orderType?: string): Promise<Array<Order & { items: OrderItem[] }>> {
    const orders = await OrderRepository.getAll(search, status, orderType);
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderRepository.getItemsByOrderId(order.id);
        return { ...order, items };
      })
    );
    return ordersWithItems;
  }

  static async updateOrderStatus(
    orderId: number,
    newStatus: 'pending' | 'ready' | 'completed' | 'cancelled' | 'preparing',
    cancellationReason?: string
  ): Promise<{ success: boolean; message: string }> {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    if (newStatus === 'completed') {
      await withTransaction(async (conn) => {
        await OrderRepository.updateOrderStatus(orderId, 'completed', 'completed', conn);
        const items = await OrderRepository.getItemsByOrderId(orderId, conn);

        for (const item of items) {
          await SalesRepository.create(
            {
              product_id: item.product_id,
              price: item.price,
              qty: item.quantity,
              sizeID: item.size || '',
              cusIDs: item.customizations || '',
            },
            conn
          );
        }
      });
      return { success: true, message: 'Order marked as completed and sales recorded.' };
    }

    const updated = await OrderRepository.updateOrderStatus(
      orderId,
      newStatus,
      undefined,
      undefined,
      cancellationReason
    );
    if (updated) {
      const labelMap: Record<string, string> = {
        pending: 'Pending Review',
        preparing: 'Kitchen Preparing',
        ready: order.order_type === 'pickup' ? 'Ready for Pickup' : 'En Route',
        completed: 'Completed',
        cancelled: 'Cancelled',
      };
      return { success: true, message: `Order #${orderId} is now ${labelMap[newStatus] || newStatus}.` };
    }

    return { success: false, message: 'Failed to update status' };
  }

  static async completePayment(orderId: number): Promise<{ success: boolean; message: string }> {
    return this.updateOrderStatus(orderId, 'completed');
  }

  static async deleteOrder(orderId: number): Promise<{ success: boolean; message: string }> {
    const deleted = await OrderRepository.delete(orderId);
    if (deleted) {
      return { success: true, message: 'Order deleted successfully' };
    }
    return { success: false, message: 'Order not found' };
  }
}
