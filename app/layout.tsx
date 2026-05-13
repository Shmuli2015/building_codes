import type { Metadata, Viewport } from "next";
import { Noto_Sans_Hebrew } from "next/font/google";

import "./globals.css";

const noto = Noto_Sans_Hebrew({
  subsets: ["hebrew"],
  variable: "--font-hebrew",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: "קודי בניין — חיפוש קוד כניסה לפי כתובת",
    template: "%s · קודי בניין",
  },
  description:
    "מצאו במהירות קוד כניסה לבניין לפי שם רחוב ומספר בית. ממשק בעברית, מקור הנתונים מגוגל שיטס — אידיאלי לשליחים, אנשי מקצוע ודיירים.",
  keywords: [
    "קוד בניין",
    "קוד כניסה",
    "חיפוש כתובת",
    "שליחים",
    "בניין מגורים",
  ],
  openGraph: {
    type: "website",
    locale: "he_IL",
    title: "קודי בניין — חיפוש קוד כניסה לפי כתובת",
    description:
      "חיפוש קודי כניסה לפי רחוב ומספר בית, ממשק בעברית ונתונים מעודכנים מהגיליון שלכם.",
  },
  twitter: {
    card: "summary",
    title: "קודי בניין — חיפוש קוד כניסה לפי כתובת",
    description:
      "חיפוש קודי כניסה לפי רחוב ומספר בית, בעברית ובחיבור לגוגל שיטס.",
  },
  appleWebApp: {
    capable: true,
    title: "קודי בניין",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${noto.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col font-sans text-slate-900">
        <main className="flex w-full flex-1 flex-col">{children}</main>
        <footer className="mt-auto border-t border-slate-200/90 bg-slate-50/95 py-5 text-center text-sm text-slate-600 shadow-[0_-1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-sm">
          <p className="font-medium tracking-wide text-slate-700">
            נבנה ע״י שמואל רוזנברג
          </p>
        </footer>
      </body>
    </html>
  );
}
