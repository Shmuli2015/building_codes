"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getAuthorizedEmails } from "./sheet-cache";
import { redirect } from "next/navigation";

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_PASSWORD || "default-secret-change-me"
);

const COOKIE_NAME = "auth_session";

export async function login(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "יש להזין אימייל וסיסמה" };
  }


  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (password !== expectedPassword) {
    return { error: "סיסמה שגויה" };
  }


  const authorizedEmails = await getAuthorizedEmails();
  if (!authorizedEmails.includes(email)) {
    return { error: "אימייל זה אינו מורשה גישה" };
  }


  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);


  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { email: string };
  } catch {
    return null;
  }
}
