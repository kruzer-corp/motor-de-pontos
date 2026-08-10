import { useState } from "react";
import {
  Avatar, AvatarFallback, Button, Pill,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  TableCell, TableRow,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@kruzer/ds";
import { Phone, Check, X as XIcon, UserPlus, UserCog, MoreHorizontal } from "lucide-react";
import { type Afiliado, type AfiliadoTipo } from "../lib/afiliados";

// Compartilhado entre a Carteira do admin (só consulta) e a Carteira do
// coordenador (onde a ação de contatar/aprovar/reprovar acontece de verdade).

export const TIPO_LABEL: Record<AfiliadoTipo, string> = {
  arquiteto: "Arquiteto",
  integrador: "Integrador",
  planejador: "Planejador",
  engenheiro: "Engenheiro",
};

export function ehNovo(a: Afiliado): boolean {
  return a.status === "pendente" && !a.contactadoEm;
}

// ── Modal: escolher perfil — reaproveitado por "Aprovar" (aprova + define
// perfil juntos) e por "Atribuir perfil" (só define/corrige o perfil) ───────

export function PerfilModal({ afiliado, titulo, textoBotao, onClose, onConfirmar }: {
  afiliado: Afiliado; titulo: string; textoBotao: string; onClose: () => void; onConfirmar: (tipo: AfiliadoTipo) => void;
}) {
  const [tipo, setTipo] = useState<AfiliadoTipo | "">(afiliado.tipo ?? "");
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-bold">{titulo} {afiliado.nome}</h2>
          <button onClick={onClose}><XIcon className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Perfil do afiliado <span className="text-destructive">*</span></label>
          <Select value={tipo} onValueChange={(v) => setTipo(v as AfiliadoTipo)}>
            <SelectTrigger><SelectValue placeholder="Selecione o perfil" /></SelectTrigger>
            <SelectContent>
              {(Object.keys(TIPO_LABEL) as AfiliadoTipo[]).map((t) => (
                <SelectItem key={t} value={t}>{TIPO_LABEL[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Esse perfil define o regulamento e os benefícios do afiliado.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Voltar</Button>
          <Button className="flex-1" disabled={!tipo} onClick={() => tipo && onConfirmar(tipo)}>{textoBotao}</Button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: reprovar (motivo) ──────────────────────────────────────────────

export function ReprovarModal({ afiliado, onClose, onReprovar }: {
  afiliado: Afiliado; onClose: () => void; onReprovar: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-bold">Reprovar {afiliado.nome}</h2>
          <button onClick={onClose}><XIcon className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Motivo <span className="text-destructive">*</span></label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Por que esse cadastro não deve entrar no programa?"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Voltar</Button>
          <Button variant="destructive" className="flex-1" disabled={!motivo.trim()} onClick={() => onReprovar(motivo)}>
            Confirmar recusa
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Linha de afiliado ────────────────────────────────────────────────────────
// onContactar/onAprovar/onReprovar ausentes = linha só de leitura (admin).

export function AfiliadoRow({ afiliado, onContactar, onAprovar, onReprovar, onAtribuirPerfil, onAtribuir, onAbrirDetalhe }: {
  afiliado: Afiliado;
  onContactar?: (a: Afiliado) => void;
  onAprovar?: (a: Afiliado) => void;
  onReprovar?: (a: Afiliado) => void;
  onAtribuirPerfil?: (a: Afiliado) => void;
  onAtribuir?: (a: Afiliado) => void;
  onAbrirDetalhe?: (a: Afiliado) => void;
}) {
  const novo = ehNovo(afiliado);
  const initials = afiliado.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const nomeEmail = (
    <>
      <div className="relative shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
        </Avatar>
        {novo && (
          <span
            className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-background"
            title="Novo, ainda não contactado"
          />
        )}
      </div>
      <div>
        <div className="font-medium text-sm">{afiliado.nome}</div>
        <div className="text-xs text-muted-foreground">{afiliado.email}</div>
      </div>
    </>
  );
  return (
    <TableRow className="[&>td]:py-3.5">
      <TableCell>
        {onAbrirDetalhe ? (
          <button className="flex items-center gap-3 text-left hover:underline" onClick={() => onAbrirDetalhe(afiliado)}>
            {nomeEmail}
          </button>
        ) : (
          <div className="flex items-center gap-3">{nomeEmail}</div>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{afiliado.cidade}/{afiliado.uf}</TableCell>
      <TableCell>
        {afiliado.status === "pendente" && (
          <Pill color={novo ? "warning" : "muted"} variant="soft" size="sm" dot>
            {novo ? "Novo" : "Pendente"}
          </Pill>
        )}
        {afiliado.status === "aprovado" && <Pill color="success" variant="soft" size="sm">Aprovado</Pill>}
        {afiliado.status === "reprovado" && <Pill color="destructive" variant="soft" size="sm">Reprovado</Pill>}
      </TableCell>
      <TableCell className="text-sm">
        {afiliado.tipo ? TIPO_LABEL[afiliado.tipo] : <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell>
        {(() => {
          const podeContactar = afiliado.status === "pendente" && !afiliado.contactadoEm && onContactar;
          const podeAprovar = afiliado.status === "pendente" && onAprovar;
          const podeReprovar = afiliado.status === "pendente" && onReprovar;
          const podeAtribuirPerfil = afiliado.status !== "reprovado" && !!onAtribuirPerfil;
          const podeAtribuir = !!onAtribuir;
          if (!podeContactar && !podeAprovar && !podeReprovar && !podeAtribuirPerfil && !podeAtribuir) return null;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {podeContactar && (
                  <DropdownMenuItem onClick={() => onContactar!(afiliado)}>
                    <Phone className="size-3.5 mr-2" />Marquei que liguei
                  </DropdownMenuItem>
                )}
                {podeAprovar && (
                  <DropdownMenuItem onClick={() => onAprovar!(afiliado)}>
                    <Check className="size-3.5 mr-2" />Aprovar
                  </DropdownMenuItem>
                )}
                {podeReprovar && (
                  <DropdownMenuItem onClick={() => onReprovar!(afiliado)} className="text-destructive">
                    <XIcon className="size-3.5 mr-2" />Reprovar
                  </DropdownMenuItem>
                )}
                {podeAtribuirPerfil && (
                  <DropdownMenuItem onClick={() => onAtribuirPerfil!(afiliado)}>
                    <UserCog className="size-3.5 mr-2" />
                    {afiliado.tipo ? "Alterar perfil" : "Atribuir perfil"}
                  </DropdownMenuItem>
                )}
                {podeAtribuir && (
                  <DropdownMenuItem onClick={() => onAtribuir!(afiliado)}>
                    <UserPlus className="size-3.5 mr-2" />Atribuir coordenador
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })()}
      </TableCell>
    </TableRow>
  );
}
