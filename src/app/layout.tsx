import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loeffler | Antihypertensive Reference",
  description: "Reference tools for antihypertensive medications and treatment plans.",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body className={cn("min-h-screen bg-background text-foreground font-sans antialiased")}> 
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
