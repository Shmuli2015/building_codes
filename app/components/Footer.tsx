import { HideOnLogin } from "./HideOnLogin";

export function Footer() {
  return (
    <HideOnLogin>
      <footer className="w-full border-t border-slate-200/60 bg-white/30 py-6 text-center backdrop-blur-sm">
        <p className="text-sm font-medium text-slate-500">
          נבנה ע"י <span className="font-semibold text-slate-700">שמואל רוזנברג</span>
        </p>
      </footer>
    </HideOnLogin>
  );
}
