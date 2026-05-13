"use client";

import { usePathname } from "next/navigation";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function ContactWhatsAppBanner() {
  const pathname = usePathname();
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_E164?.trim();
  const phone = raw ? digitsOnly(raw) : "";


  if (!phone || pathname === "/login") {
    return null;
  }

  const href = `https://wa.me/${phone}`;

  return (
    <div
      role="region"
      aria-label="יצירת קשר להוספת קוד כניסה לבניין"
      className="border-b border-emerald-600/15 bg-emerald-600/9 px-4 py-2.5 text-center text-sm text-slate-800 backdrop-blur-sm"
    >
      <p className="mx-auto max-w-2xl leading-relaxed flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1">
        <span>להוספת או עדכון קוד כניסה לבניין:</span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-emerald-800 underline decoration-emerald-600/40 underline-offset-2 transition-colors hover:text-emerald-900 hover:decoration-emerald-700/60"
        >
          שלחו לנו הודעה בוואטסאפ
        </a>
      </p>
    </div>
  );
}
