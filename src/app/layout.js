import "./globals.css";

export const metadata = {
  title: "eCash Social",
  description: "On chain social platform",
};

export default function RootLayout({ children }) {
  return (
    <html className="h-full bg-white" lang="en">
      <body className="h-full">{children}</body>
    </html>
  );
}
