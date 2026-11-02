import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth-actions";
import { AuthorizedPageView } from "./components/AuthorizedPageView";

async function AuthorizedLoader() {
  await connection();

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const addAuthorizedEnabled = Boolean(process.env.ADD_AUTHORIZED_PASSWORD);

  return (
    <AuthorizedPageView
      currentUserEmail={session.email ?? null}
      addAuthorizedEnabled={addAuthorizedEnabled}
    />
  );
}

function AuthorizedFallback() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 text-sm text-slate-500">
      טוען נתונים...
    </div>
  );
}

export default function AuthorizedPage() {
  return (
    <Suspense fallback={<AuthorizedFallback />}>
      <AuthorizedLoader />
    </Suspense>
  );
}

