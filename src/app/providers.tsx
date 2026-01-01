"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

export const Providers = ({ children }: { children: ReactNode }) => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    {children}
  </TooltipProvider>
);
