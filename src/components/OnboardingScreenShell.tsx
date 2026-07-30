// Moldura visual compartilhada pelas telas do onboarding obrigatório (Configure
// seu programa, Cadastre e importe, Cadastre canais e filiais) — tela cheia,
// sem sidebar, mesmo tratamento em todas.

import type { ReactNode } from "react";
import VersaoSwitcher from "./VersaoSwitcher";

export function OnboardingScreenShell({ title, subtitle, maxWidth = "max-w-2xl", children }: {
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-svh bg-muted/30 flex justify-center px-4 py-10 md:py-16">
      <div className={`w-full ${maxWidth} space-y-6`}>
        <div className="text-center space-y-1">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">Primeiro acesso</div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {children}
      </div>
      <VersaoSwitcher />
    </div>
  );
}
