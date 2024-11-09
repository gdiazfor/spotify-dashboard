import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from './providers'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TopTrackz",
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
      <body className={inter.className}>
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
