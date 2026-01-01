import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loeffler | Antihypertensive Reference",
  description: "Reference tools for antihypertensive medications and treatment plans.",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%233b82f6'/><path d='M50 25 L50 45 M50 55 L50 75 M35 40 Q40 35 50 35 Q60 35 65 40 M35 60 Q40 65 50 65 Q60 65 65 60' stroke='white' stroke-width='6' fill='none' stroke-linecap='round'/><circle cx='50' cy='50' r='3' fill='white'/></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body className={cn("min-h-screen bg-background text-foreground font-sans antialiased")}> 
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
