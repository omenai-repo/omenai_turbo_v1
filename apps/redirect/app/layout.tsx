import "./globals.css";
import { PT_Serif, Work_Sans } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";

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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <title>Omenai - Discover and collect contemporary African Art</title>
      </head>
      <body
        className={`${work_sans.variable} bg-white ${pt_serif.variable} font-sans flex flex-col justify-center`}
      >
        <NextTopLoader color="#0f172a" height={6} />

        <Toaster
          position="top-right"
          expand
          visibleToasts={3}
          closeButton
          duration={7000}
        />
        {children}
      </body>
    </html>
  );
}
