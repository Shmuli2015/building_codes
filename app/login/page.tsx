import LoginForm from "../components/LoginForm";
import { getSession } from "@/lib/auth-actions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "התחברות | קודי בניין",
  description: "דף התחברות למערכת קודי בניין למשתמשים מורשים",
};

export default async function LoginPage() {
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
