import { Suspense } from "react";
import { redirect } from "next/navigation";

import LoginForm from "../components/LoginForm";
import { getSession } from "@/lib/auth-actions";

export const metadata = {
  title: "התחברות | קודי בניין",
  description: "דף התחברות למערכת קודי בניין למשתמשים מורשים",
};

async function LoginGate() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  return (
    <div className="flex flex-1 flex-col justify-center items-center p-4 py-6 sm:py-12 min-h-dvh">
      <div className="w-full max-w-sm my-auto">
        <LoginForm />
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 text-sm text-slate-500">
      טוען…
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginGate />
    </Suspense>
  );
}
