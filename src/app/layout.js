import "./globals.css";

export const metadata = {
  title: "eCash Social",
  description: "On chain social platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
