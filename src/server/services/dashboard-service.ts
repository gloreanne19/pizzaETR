import { OrderRepository } from '../repositories/order-repo';
import { ProductRepository } from '../repositories/product-repo';
import { UserRepository } from '../repositories/user-repo';
import { AdminRepository } from '../repositories/admin-repo';
import { SalesRepository } from '../repositories/sales-repo';
import { CategoryRepository } from '../repositories/category-repo';
import { ensureDatabaseSchema } from '../db/auto-migrate';

export interface DashboardAnalytics {
  pendingOrdersCount: number;
  pendingOrdersTotal: number;
  completedOrdersCount: number;
  completedOrdersTotal: number;
  totalOrdersCount: number;
  totalProductsCount: number;
  availableProductsCount: number;
  soldOutProductsCount: number;
  inactiveProductsCount: number;
  totalUsersCount: number;
  totalAdminsCount: number;
  totalSalesRevenue: number;
  averageOrderValue: number;
  fulfillmentRate: number;
  categoryBreakdown: Record<string, number>;
  recentOrders: any[];
}

export class DashboardService {
  static async getOverviewStats(): Promise<DashboardAnalytics> {
    await ensureDatabaseSchema();

    const [orders, products, users, admins, sales, categories] = await Promise.all([
      OrderRepository.getAll(),
      ProductRepository.getAll(undefined, undefined, undefined, true),
      UserRepository.getAll(),
      AdminRepository.getAll(),
      SalesRepository.getSales(),
      CategoryRepository.getAll(),
    ]);

    const pendingOrders = orders.filter((o) => o.payment_status === 'pending');
    const completedOrders = orders.filter((o) => o.payment_status === 'completed');

    const pendingOrdersTotal = pendingOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
    const completedOrdersTotal = completedOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
    const totalSalesRevenue = sales.reduce((sum, s) => sum + Number(s.price) * Number(s.qty), 0) || completedOrdersTotal;

    const availableProductsCount = products.filter((p) => !p.status || p.status === 'available').length;
    const soldOutProductsCount = products.filter((p) => p.status === 'sold_out' || p.status === 'unavailable').length;
    const inactiveProductsCount = products.filter((p) => p.status === 'inactive').length;

    const categoryBreakdown: Record<string, number> = {};
    categories.forEach((cat) => {
      categoryBreakdown[cat] = 0;
    });
    products.forEach((p) => {
      const c = p.category || 'Pizza';
      categoryBreakdown[c] = (categoryBreakdown[c] || 0) + 1;
    });

    const averageOrderValue = completedOrders.length > 0 ? completedOrdersTotal / completedOrders.length : 0;
    const fulfillmentRate = orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0;

    const recentOrders = orders.slice(0, 5).map((o) => ({
      id: o.id,
      name: o.name,
      total_price: o.total_price,
      payment_status: o.payment_status,
      placed_on: o.placed_on,
    }));

    return {
      pendingOrdersCount: pendingOrders.length,
      pendingOrdersTotal,
      completedOrdersCount: completedOrders.length,
      completedOrdersTotal,
      totalOrdersCount: orders.length,
      totalProductsCount: products.length,
      availableProductsCount,
      soldOutProductsCount,
      inactiveProductsCount,
      totalUsersCount: users.length,
      totalAdminsCount: admins.filter((a) => a.name.toLowerCase() !== 'root').length,
      totalSalesRevenue,
      averageOrderValue,
      fulfillmentRate,
      categoryBreakdown,
      recentOrders,
    };
  }
}
