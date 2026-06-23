import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Switch } from "@kruzer/ds";
import { LogIn, ExternalLink, Eye, CheckCheck } from "lucide-react";

export default function LoginConfig() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    institutionalLabel: "Conheça a FAST PRO",
    institutionalUrl: "https://www.fastpro.com.br",
    supportLabel: "Central de ajuda",
    supportUrl: "https://www.fastpro.com.br/ajuda",
    showInstitutional: true,
    showSupport: true,
    loginTitle: "Acesse o FAST PRO",
    loginSubtitle: "Programa de pontos para parceiros e colaboradores.",
    allowSSOGoogle: true,
    allowSSOMS: false,
    twoFactorRequired: false,
  });

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => setSaved(true);

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LogIn className="size-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Configuração da Página de Login</h2>
            <p className="text-sm text-muted-foreground">Links institucionais, textos e SSO.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="size-3.5 mr-1.5" />
            Prévia
          </Button>
          <Button size="sm" onClick={handleSave}>
            {saved ? <><CheckCheck className="size-3.5 mr-1.5" />Salvo</> : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Live preview */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm">Prévia da tela de login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-border bg-gradient-to-br from-violet-50 to-indigo-50 p-8 text-center space-y-3">
            <div className="mx-auto h-10 w-32 rounded-xl bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
              FAST SHOP PRO
            </div>
            <div className="text-base font-semibold">{form.loginTitle}</div>
            <div className="text-xs text-muted-foreground">{form.loginSubtitle}</div>
            <div className="space-y-2 mt-4">
              <div className="h-8 rounded-xl bg-background border border-border flex items-center px-3 text-xs text-muted-foreground">
                E-mail ou CPF
              </div>
              <div className="h-8 rounded-xl bg-background border border-border flex items-center px-3 text-xs text-muted-foreground">
                Senha
              </div>
              <div className="h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                Entrar
              </div>
              {form.allowSSOGoogle && (
                <div className="h-8 rounded-xl border border-border bg-background flex items-center justify-center gap-2 text-xs">
                  <span className="font-bold text-red-500">G</span> Entrar com Google
                </div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-3 text-xs text-primary">
              {form.showInstitutional && <span>{form.institutionalLabel} ↗</span>}
              {form.showSupport && <span>{form.supportLabel} ↗</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Texts */}
      <Card>
        <CardHeader><CardTitle>Textos da página</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Título principal</label>
            <Input value={form.loginTitle} onChange={(e) => set("loginTitle", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Subtítulo</label>
            <Input value={form.loginSubtitle} onChange={(e) => set("loginSubtitle", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Institutional links */}
      <Card>
        <CardHeader><CardTitle>Links institucionais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { labelKey: "institutionalLabel" as const, urlKey: "institutionalUrl" as const, toggleKey: "showInstitutional" as const, title: "Link institucional" },
            { labelKey: "supportLabel" as const, urlKey: "supportUrl" as const, toggleKey: "showSupport" as const, title: "Central de suporte" },
          ].map(({ labelKey, urlKey, toggleKey, title }) => (
            <div key={title} className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{title}</span>
                <Switch checked={form[toggleKey] as boolean} onCheckedChange={(v) => set(toggleKey, v)} size="sm" />
              </div>
              {form[toggleKey] && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Texto do link</label>
                    <Input value={form[labelKey] as string} onChange={(e) => set(labelKey, e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">URL</label>
                    <div className="flex gap-1.5">
                      <Input value={form[urlKey] as string} onChange={(e) => set(urlKey, e.target.value)} />
                      <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10" asChild>
                        <a href={form[urlKey] as string} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="size-3.5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SSO & Security */}
      <Card>
        <CardHeader><CardTitle>Autenticação & Segurança</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "allowSSOGoogle" as const, label: "SSO via Google", desc: "Permite login com conta Google corporativa." },
            { key: "allowSSOMS" as const, label: "SSO via Microsoft", desc: "Permite login com conta Microsoft 365." },
            { key: "twoFactorRequired" as const, label: "2FA obrigatório", desc: "Exige autenticação de dois fatores para todos os usuários." },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4 rounded-xl bg-muted/20 px-4 py-3">
              <div>
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
              <Switch checked={form[key] as boolean} onCheckedChange={(v) => set(key, v)} size="sm" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
