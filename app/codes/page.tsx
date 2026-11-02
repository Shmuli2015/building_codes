import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getCodesWithIndices } from "@/lib/sheet-actions";
import { getSession } from "@/lib/auth-actions";
import { AllCodesView } from "./components/AllCodesView";

async function CodesLoader() {
  await connection();

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const data = await getCodesWithIndices();

  return (
    <AllCodesView
      initialRows={data.rows}
      warnings={data.warnings}
      addCodeEnabled={Boolean(process.env.ADD_CODE_PASSWORD)}
    />
  );
}

function CodesFallback() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 text-sm text-slate-500">
      טוען רשימת קודים…
    </div>
  );
}

export default function CodesPage() {
  return (
    <Suspense fallback={<CodesFallback />}>
      <CodesLoader />
    </Suspense>
  );
}
