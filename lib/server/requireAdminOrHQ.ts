import { cookies } from "next/headers";

type AuthorizedResult = {
  authorized: true;
  role: "admin" | "hq";
  sessionToken: string;
};

type UnauthorizedResult = {
  authorized: false;
};

export type AdminOrHQAuthResult = AuthorizedResult | UnauthorizedResult;

export async function requireAdminOrHQ(): Promise<AdminOrHQAuthResult> {
  const cookieStore = await cookies();

  const adminSession = cookieStore.get("admin_session");
  if (adminSession?.value) {
    return { authorized: true, role: "admin", sessionToken: adminSession.value };
  }

  const hqSession = cookieStore.get("hq_session");
  if (hqSession?.value) {
    return { authorized: true, role: "hq", sessionToken: hqSession.value };
  }

  return { authorized: false };
}
