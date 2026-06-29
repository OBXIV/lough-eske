import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getDemoSessionByEmail, getDemoUserByEmail } from "@/lib/data/demo";
import { canAccess, getDefaultRoute } from "@/lib/rbac/permissions";
import type { PermissionKey, UserSession } from "@/types/domain";

const SESSION_COOKIE = "lough_eske_demo_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export async function getCurrentSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const email = cookieStore.get(SESSION_COOKIE)?.value;

  if (!email) {
    return null;
  }

  return getDemoSessionByEmail(email);
}

export async function requireSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requirePermission(permission: PermissionKey) {
  const session = await requireSession();

  if (!canAccess(session.permissions, permission)) {
    redirect(getDefaultRoute(session.permissions));
  }

  return session;
}

export async function setDemoSession(email: string) {
  const demoUser = getDemoUserByEmail(email);

  if (!demoUser) {
    throw new Error("Invalid demo user.");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, demoUser.email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return getDemoSessionByEmail(demoUser.email);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
