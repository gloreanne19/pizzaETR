import { SalesRepository } from '../repositories/sales-repo';
import { Sale } from '../db/schema';

export class SalesService {
  static async getSalesAnalytics(
    productName?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    sales: Sale[];
    summary: {
      totalRevenue: number;
      totalQuantity: number;
      totalTransactions: number;
      productBreakdown: Record<string, { qty: number; revenue: number }>;
    };
  }> {
    const sales = await SalesRepository.getSales(productName, startDate, endDate);

    let totalRevenue = 0;
    let totalQuantity = 0;
    const productBreakdown: Record<string, { qty: number; revenue: number }> = {};

    for (const s of sales) {
      const lineRevenue = Number(s.price) * Number(s.qty);
      totalRevenue += lineRevenue;
      totalQuantity += Number(s.qty);

      const pName = s.product_name || `Product #${s.product_id}`;
      if (!productBreakdown[pName]) {
        productBreakdown[pName] = { qty: 0, revenue: 0 };
      }
      productBreakdown[pName].qty += Number(s.qty);
      productBreakdown[pName].revenue += lineRevenue;
    }

    return {
      sales,
      summary: {
        totalRevenue,
        totalQuantity,
        totalTransactions: sales.length,
        productBreakdown,
      },
    };
  }
}

