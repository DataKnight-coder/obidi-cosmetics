import { LayoutDashboard, ShoppingBag, Box, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import Image from "next/image";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#160516] flex flex-col md:flex-row relative overflow-hidden">
      <div className="bg-bloom bloom-1 opacity-20" />
      <div className="bg-bloom bloom-2 opacity-20" />
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-card border-r border-white/10 p-6 flex flex-col shrink-0 z-10 sticky top-0 md:h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
            <Image src="/assets/obidi logo.jpg" alt="Logo" fill className="object-cover" sizes="40px" />
          </div>
          <span className="font-display-sm max-w-[190px] text-sm font-bold uppercase leading-tight tracking-wide text-primary">OBIDI SEE MY HOUSE I STILL DEY WAKA COSMETICS ADMIN</span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-on-surface-variant hover:text-primary">
            <LayoutDashboard size={20} />
            <span className="font-label-sm tracking-wide">Dashboard</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-on-surface-variant hover:text-primary">
            <ShoppingBag size={20} />
            <span className="font-label-sm tracking-wide">Orders</span>
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-on-surface-variant hover:text-primary">
            <Box size={20} />
            <span className="font-label-sm tracking-wide">Products</span>
          </Link>
        </nav>

        <div className="mt-auto border-t border-white/10 pt-6">
          <div className="mb-4 px-4 text-sm text-on-surface-variant">
            <p className="font-bold text-on-surface truncate">{session?.user?.name}</p>
            <p className="text-xs truncate opacity-70">{(session?.user as any)?.role}</p>
          </div>
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-error/10 transition-colors text-on-surface-variant hover:text-error w-full text-left">
              <LogOut size={20} />
              <span className="font-label-sm tracking-wide">Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 relative z-10 max-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
