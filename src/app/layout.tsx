import type { Metadata } from "next";
import localFont from 'next/font/local'
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from './providers'

const circular = localFont({
  src: './fonts/circular/circular-medium.ttf', // adjust file extension if different (.ttf, .otf, etc.)
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Your Music Stats",
  description: "Your personal music statistics dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={circular.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
        >
          <main className="min-h-screen bg-background">
            <Providers>{children}</Providers>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
