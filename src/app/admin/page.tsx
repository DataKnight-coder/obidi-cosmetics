import { requireAdmin } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Users, ShoppingBag, AlertCircle } from "lucide-react";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const totalOrders = await prisma.order.count();
  const successfulPayments = await prisma.payment.aggregate({
    where: { status: "SUCCESS" },
    _sum: { paidAmountKobo: true },
  });
  const totalRevenue = (successfulPayments._sum.paidAmountKobo || 0) / 100;

  const lowStockVariants = await prisma.productVariant.findMany({
    where: { stockQuantity: { lt: 5 } },
    include: { product: true },
  });

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { payments: true }
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display-lg text-3xl">Dashboard Overview</h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-on-surface-variant font-label-sm uppercase tracking-wider">Total Revenue</h3>
            <div className="bg-primary/20 text-primary p-2 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="font-display-lg text-3xl">₦{totalRevenue.toLocaleString()}</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-on-surface-variant font-label-sm uppercase tracking-wider">Total Orders</h3>
            <div className="bg-primary/20 text-primary p-2 rounded-xl">
              <ShoppingBag size={20} />
            </div>
          </div>
          <p className="font-display-lg text-3xl">{totalOrders.toLocaleString()}</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-on-surface-variant font-label-sm uppercase tracking-wider">Low Stock Items</h3>
            <div className="bg-error/20 text-error p-2 rounded-xl">
              <AlertCircle size={20} />
            </div>
          </div>
          <p className="font-display-lg text-3xl">{lowStockVariants.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/10">
          <h2 className="font-headline-lg text-xl mb-6">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-on-surface-variant font-label-sm uppercase tracking-wider">
                  <th className="pb-4 pr-4">Order ID</th>
                  <th className="pb-4 px-4">Customer</th>
                  <th className="pb-4 px-4">Date</th>
                  <th className="pb-4 px-4 text-right">Amount</th>
                  <th className="pb-4 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 last:border-0">
                    <td className="py-4 pr-4 font-mono text-xs">{order.id.slice(-8).toUpperCase()}</td>
                    <td className="py-4 px-4">{order.customerName}</td>
                    <td className="py-4 px-4 text-sm text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-right font-bold">₦{(order.totalKobo / 100).toLocaleString()}</td>
                    <td className="py-4 pl-4 text-right">
                      <span className={`text-xs px-3 py-1 rounded-full ${order.status === 'PAID' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-on-surface-variant'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant">No recent orders.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card p-6 rounded-3xl border border-white/10">
          <h2 className="font-headline-lg text-xl mb-6 text-error">Low Stock Alerts</h2>
          <div className="flex flex-col gap-4">
            {lowStockVariants.map((variant) => (
              <div key={variant.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                <div className="flex flex-col">
                  <span className="font-bold text-sm truncate max-w-[150px]">{variant.product.name}</span>
                  <span className="text-xs text-on-surface-variant">Variant: {variant.name}</span>
                </div>
                <span className="bg-error/20 text-error font-bold text-xs px-3 py-1 rounded-full">{variant.stockQuantity} left</span>
              </div>
            ))}
            {lowStockVariants.length === 0 && (
              <p className="text-on-surface-variant text-center py-4">All stock levels look good!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
