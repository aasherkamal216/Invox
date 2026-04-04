import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const interHeading = Inter({ subsets: ['latin'], variable: '--font-heading' });

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Invox — Create Beautiful Invoices with AI",
  description:
    "AI-powered invoice generator for freelancers and small businesses. Create professional invoices in seconds with intelligent automation, stunning templates, and seamless PDF export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, playfair.variable, "font-sans", inter.variable, interHeading.variable)}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Sora:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500;700&family=Manrope:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&family=Figtree:wght@400;500;700&family=Urbanist:wght@400;500;700&family=Lexend:wght@400;500;700&family=Public+Sans:wght@400;500;700&family=Bitter:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">

        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}

