import { auth } from "@/auth";

export type AdminRoleType = "SUPER_ADMIN" | "CATALOG_MANAGER" | "ORDER_MANAGER";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

export async function requireRole(allowedRoles: AdminRoleType[]) {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !allowedRoles.includes(role as AdminRoleType)) {
    throw new Error("Forbidden");
  }

  return session;
}
