import "./globals.css";
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "eCash Chat",
  description: "On chain social platform",
  metadataBase: new URL("https://www.ecashchat.com"),
};

export default function RootLayout({ children }) {
  return (
    <html className="h-full" lang="en">
      <head>
       {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="eCash Chat" />
        <meta name="twitter:description" content="On chain social platform" />
        <meta name="twitter:image" content="https://im.gurl.eu.org/file/a53a1ce61457c72ec55c7.jpg" />
        
        {/* Open Graph meta tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="eCash Chat" />
        <meta property="og:description" content="On chain messaging platform" />
        <meta property="og:image" content="https://im.gurl.eu.org/file/a53a1ce61457c72ec55c7.jpg" />
        <meta property="og:url" content="https://www.ecashchat.com" />
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
           <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Analytics />
            <Toaster />
            </ThemeProvider>
      </body>
    </html>
  );
}
