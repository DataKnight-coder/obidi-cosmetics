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
  if (!session?.user) {
    throw new Error("Unauthorized: Admin access required");
  }

  const userRole = (session.user as any).role as AdminRoleType;
  if (!allowedRoles.includes(userRole)) {
    throw new Error(`Forbidden: Requires one of roles: ${allowedRoles.join(", ")}`);
  }
  
  return session;
}
