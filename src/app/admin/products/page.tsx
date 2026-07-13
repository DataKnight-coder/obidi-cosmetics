import { requireAdmin } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit3, Trash2 } from "lucide-react";

export default async function AdminProductsPage() {
  await requireAdmin();

  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="font-display-lg text-3xl">Products</h1>
        <Link 
          href="/admin/products/new" 
          className="bg-primary text-on-primary font-label-sm px-6 py-3 rounded-full uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Plus size={18} /> New Product
        </Link>
      </div>

      <div className="glass-card p-6 rounded-3xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-on-surface-variant font-label-sm uppercase tracking-wider">
                <th className="pb-4 pr-4">Name</th>
                <th className="pb-4 px-4">Category</th>
                <th className="pb-4 px-4">Variants</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="font-bold text-sm max-w-[250px] truncate">{product.name}</div>
                  </td>
                  <td className="py-4 px-4 text-sm text-on-surface-variant">{String(product.categoryId) || 'Category'}</td>
                  <td className="py-4 px-4 text-sm">{product.variants.length}</td>
                  <td className="py-4 px-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${product.status === 'ACTIVE' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-on-surface-variant'}`}>
                      {product.status === 'ACTIVE' ? 'Available' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-4 pl-4 flex justify-end gap-3">
                    <Link href={`/admin/products/${product.id}/edit`} className="text-on-surface-variant hover:text-primary transition-colors">
                      <Edit3 size={18} />
                    </Link>
                    {/* Add delete logic in later steps via server actions */}
                    <button className="text-on-surface-variant hover:text-error transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
