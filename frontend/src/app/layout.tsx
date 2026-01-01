'use client';

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning prevents noisy console warnings when browser
    // extensions (or other client-only code) inject attributes into the DOM
    // that differ from the server-rendered HTML. Prefer disabling extensions
    // during development, but this reduces spurious warnings while debugging.
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
