import "./globals.css";
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"

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
      <body
        className={cn(
          "h-full font-sans",
          fontSans.variable
        )}>{children}</body>
    </html>
  );
}
