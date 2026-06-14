import type { Metadata, Viewport } from "next";
import { Heebo, Noto_Sans_Hebrew } from "next/font/google";

import { ContactWhatsAppBanner } from "./components/ContactWhatsAppBanner";
import { Footer } from "./components/Footer";
import "./globals.css";


const noto = Noto_Sans_Hebrew({
  subsets: ["hebrew"],
  variable: "--font-hebrew",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: "קודי בניין — חיפוש קוד כניסה לפי כתובת",
    template: "%s · קודי בניין",
  },
  description:
    "חיפוש קוד כניסה לבניין לפי רחוב, מספר בית ואופציונלית שכונה. ממשק בעברית.",
  keywords: [
    "קוד בניין",
    "קוד כניסה",
    "חיפוש כתובת",
    "בניין מגורים",
  ],
  openGraph: {
    type: "website",
    locale: "he_IL",
    title: "קודי בניין — חיפוש קוד כניסה לפי כתובת",
    description:
      "חיפוש קודי כניסה לפי רחוב ומספר בית, ממשק בעברית.",
  },
  twitter: {
    card: "summary",
    title: "קודי בניין — חיפוש קוד כניסה לפי כתובת",
    description:
      "חיפוש קודי כניסה לפי רחוב ומספר בית, ממשק בעברית.",
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
    <html
      lang="he"
      dir="rtl"
      className={`${noto.variable} ${heebo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col font-sans text-slate-900 selection:bg-blue-500/18 selection:text-slate-900">
        <ContactWhatsAppBanner />
        <main className="flex min-h-[min(100dvh,max-content)] w-full flex-1 flex-col">
          {children}
        </main>
        <Footer />


      </body>
    </html>
  );
}
