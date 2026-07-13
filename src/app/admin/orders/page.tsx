import { requireAdmin } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    include: { payments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display-lg text-3xl">Orders</h1>

      <div className="glass-card p-6 rounded-3xl border border-white/10 overflow-hidden">
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
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-4 pr-4 font-mono text-xs">{order.id.slice(-8).toUpperCase()}</td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-sm">{order.customerName}</div>
                    <div className="text-xs text-on-surface-variant">{order.customerEmail}</div>
                  </td>
                  <td className="py-4 px-4 text-sm text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-4 text-right font-bold">₦{(order.totalKobo / 100).toLocaleString()}</td>
                  <td className="py-4 pl-4 text-right">
                    <span className={`text-xs px-3 py-1 rounded-full ${order.status === 'PAID' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-on-surface-variant'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
