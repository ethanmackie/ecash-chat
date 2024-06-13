import "./globals.css";
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { Analytics } from '@vercel/analytics/react';


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "eCash Chat",
  description: "On chain messaging platform",
};

export default function RootLayout({ children }) {
  return (
    <html className="h-full bg-white" lang="en">
      <head>
        <meta name="twitter:title" content="eCash Chat" />
        <meta name="twitter:image" content="/preview-card.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={cn(
          "h-full font-sans",
          fontSans.variable
        )}>
            {children}
            <Analytics />
      </body>
    </html>
  );
}
