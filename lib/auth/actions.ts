"use server";

import { redirect } from "next/navigation";

import { clearSession, setDemoSession } from "@/lib/auth/session";
import { getDefaultRoute } from "@/lib/rbac/permissions";

export async function signInDemoAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const session = await setDemoSession(email).catch(() => null);

  if (!session) {
    redirect("/login");
  }

  redirect(getDefaultRoute(session.permissions));
}

export async function signOutAction() {
  await clearSession();
  redirect("/login");
}
