import "./globals.css";

export const metadata = {
  title: "eCash Chat",
  description: "On chain messaging platform",
};

export default function RootLayout({ children }) {
  return (
    <html className="h-full bg-white" lang="en">
      <body className="h-full">{children}</body>
    </html>
  );
}
