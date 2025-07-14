import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import ContextProvider from "@/app/context";
import { CidProvider } from "./context/CidContext";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Life Ledger - Own Your Health. Securely. Forever",
  description: "Secure blockchain-based health records management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        <ContextProvider>
          <CidProvider>{children}</CidProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
