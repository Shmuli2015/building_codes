import LoginForm from "../components/LoginForm";

export const metadata = {
  title: "התחברות | קודי בניינים",
  description: "דף התחברות למערכת קודי בניינים",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
