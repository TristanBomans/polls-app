import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { EnvironmentSetupPanel } from "@/components/system/environment-setup-panel";
import { getMissingEnvironmentKeys, getPublicEnvironment } from "@/lib/env";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Polls App",
    template: "%s | Polls App",
  },
  description: "Production-oriented polling app foundation built with Next.js, Convex, Clerk, and Cloudflare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const missingEnvironmentKeys = getMissingEnvironmentKeys();
  const { clerkPublishableKey, convexUrl } = getPublicEnvironment();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {missingEnvironmentKeys.length > 0 ? (
          <EnvironmentSetupPanel missingKeys={missingEnvironmentKeys} />
        ) : (
          <Providers
            clerkPublishableKey={clerkPublishableKey}
            convexUrl={convexUrl}
          >
            <AppShell>{children}</AppShell>
          </Providers>
        )}
      </body>
    </html>
  );
}
