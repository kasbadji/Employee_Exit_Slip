import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employee Exit Manager",
  description: "Employee Exit Slip Management System Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
