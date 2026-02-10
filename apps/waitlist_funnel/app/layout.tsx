import type { Metadata, Viewport } from "next";
import { Work_Sans, PT_Serif } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { headers } from "next/headers";

const work_sans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work_sans",
  display: "swap",
});
const pt_serif = PT_Serif({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-pt_serif",
  display: "swap",
});

const baseUrl = "https://join.omenai.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  title: "Join the Omenai Waitlist | The Future of African Art",
  description:
    "Secure early access to the premier ecosystem for African contemporary art. Connect with vetted artists and serious collectors.",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    title: "Join the Omenai Waitlist | The Future of African Art",
    description:
      "The new standard for discovering, buying, and selling African contemporary art. Reserve your spot today.",
    url: baseUrl,
    siteName: "Omenai",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Omenai | Join the Waitlist",
    description:
      "Discover, buy, and sell African contemporary art online. Early access is now open.",
  },

  manifest: "/site.webmanifest",
};
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") || "";

  return (
    <html lang="en">
      <body
        className={`${work_sans.variable} ${pt_serif.variable} bg-white font-serif flex flex-col justify-center`}
      >
        {children}
        <GoogleAnalytics gaId={process.env.GAID as string} />
      </body>
    </html>
  );
}
