import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, Input, Label, PageHeader, Separator, toast,
} from "@kruzer/ds";
import { CheckCircle2, Minus, Plus, Search, Trash2 } from "lucide-react";
import { MOEDA } from "../config/programa";

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: "Identificar membro"  },
  { num: 2, label: "Selecionar itens"    },
  { num: 3, label: "Simulação"           },
  { num: 4, label: "Gerar documento"     },
];

// ── Mock data ─────────────────────────────────────────────────────────────────

const MEMBERS = [
  { id: "1", nome: "Aline P.",   cpf: "123.456.789-00", saldo: 5200, tier: "Diamante" },
  { id: "2", nome: "Bruno C.",   cpf: "987.654.321-00", saldo: 3200, tier: "Ouro"     },
  { id: "3", nome: "Cecília M.", cpf: "456.789.123-00", saldo: 1800, tier: "Prata"    },
  { id: "4", nome: "Danilo R.",  cpf: "321.654.987-00", saldo:  760, tier: "Bronze"   },
];

const CATALOGO = [
  { id: "p1", nome: "Voucher R$50",   sku: "VCH-050-BR",   custo: 1200,  reais: 50   },
  { id: "p2", nome: "Voucher R$100",  sku: "VCH-100-BR",   custo: 2400,  reais: 100  },
  { id: "p3", nome: "Frete Grátis",   sku: "FRET-001",     custo:  800,  reais: 30   },
  { id: "p4", nome: "Cupom 10%",      sku: "CUP-10PCT",    custo:  650,  reais: 50   },
  { id: "p5", nome: "Air Fryer XL",   sku: "AIRFRY-XL-02", custo: 18000, reais: 1800 },
  { id: "p6", nome: "Cashback 5%",    sku: "CASH-5PCT",    custo:  300,  reais: 30   },
  { id: "p7", nome: "Kit Skincare",   sku: "KIT-SKIN-01",  custo: 3500,  reais: 350  },
  { id: "p8", nome: "Fone Bluetooth", sku: "FONE-BT-02",   custo: 4200,  reais: 420  },
];

type CartItem = { produtoId: string; qty: number };

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, idx) => {
        const done   = s.num < current;
        const active = s.num === current;
        const isLast = idx === STEPS.length - 1;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                done || active ? "bg-foreground border-foreground text-background" : "bg-background border-border text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : s.num}
              </div>
              <span className={`text-xs whitespace-nowrap text-center max-w-[100px] leading-tight ${
                active ? "font-semibold text-foreground" : "text-muted-foreground"
              }`}>{s.label}</span>
            </div>
            {!isLast && (
              <div className={`h-px w-14 mx-2 mb-5 shrink-0 ${s.num < current ? "bg-foreground" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── PDF generation ────────────────────────────────────────────────────────────

function gerarPDF(
  membro: typeof MEMBERS[0],
  itens: { nome: string; sku: string; qty: number; custo: number; reais: number }[],
  totalCusto: number,
  totalReais: number,
  codigo: string,
  validade: string,
) {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const rows = itens.map((i) => `
    <tr>
      <td>${i.nome}</td>
      <td style="text-align:center">${i.qty}</td>
      <td style="font-family:monospace;color:#6b7280">${i.sku}</td>
      <td style="text-align:right">${(i.custo * i.qty).toLocaleString("pt-BR")} ${MOEDA.abrev}</td>
      <td style="text-align:right">${(i.reais * i.qty).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
    </tr>`).join("");

  const saldoApos  = membro.saldo - totalCusto;
  const suficiente = saldoApos >= 0;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Orçamento ${codigo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; color: #111; padding: 40px; max-width: 720px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #111; }
    .logo { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .meta { text-align: right; color: #6b7280; font-size: 12px; line-height: 1.6; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 8px; }
    .member-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
    .member-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
    .member-meta { color: #6b7280; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
    td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
    .summary { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 16px; }
    .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
    .summary-row.total { font-weight: 700; font-size: 15px; padding-top: 12px; margin-top: 8px; border-top: 1px solid #e5e7eb; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .badge-ok  { background: #d1fae5; color: #065f46; }
    .badge-nok { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 11px; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Programa de Fidelidade</div>
      <div style="color:#6b7280;font-size:12px;margin-top:4px">Orçamento de Resgate</div>
    </div>
    <div class="meta">
      <div><strong>${codigo}</strong></div>
      <div>Emitido em ${hoje}</div>
      <div>Válido até ${validade}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Membro</div>
    <div class="member-box">
      <div class="member-name">${membro.nome}</div>
      <div class="member-meta">CPF: ${membro.cpf} &nbsp;·&nbsp; Tier: ${membro.tier} &nbsp;·&nbsp; Saldo atual: ${membro.saldo.toLocaleString("pt-BR")} ${MOEDA.abrev}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Itens selecionados</div>
    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th style="text-align:center">Qtd.</th>
          <th>SKU</th>
          <th style="text-align:right">${MOEDA.nome}</th>
          <th style="text-align:right">Valor R$</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  <div class="summary">
    <div class="summary-row"><span>Total em ${MOEDA.nome.toLowerCase()}</span><span><strong>${totalCusto.toLocaleString("pt-BR")} ${MOEDA.abrev}</strong></span></div>
    <div class="summary-row"><span>Equivalente em R$</span><span>${totalReais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></div>
    <div class="summary-row"><span>Saldo atual do membro</span><span>${membro.saldo.toLocaleString("pt-BR")} ${MOEDA.abrev}</span></div>
    <div class="summary-row total">
      <span>Saldo após resgate</span>
      <span>
        <span class="badge ${suficiente ? "badge-ok" : "badge-nok"}">${suficiente ? "Saldo suficiente" : "Saldo insuficiente"}</span>
        &nbsp; ${saldoApos.toLocaleString("pt-BR")} ${MOEDA.abrev}
      </span>
    </div>
  </div>

  <div class="footer">
    <div>Código de rastreio: <strong>${codigo}</strong></div>
    <div>Este orçamento é informativo e não constitui compromisso de resgate.</div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const w    = window.open(url, "_blank");
  if (w) { w.focus(); setTimeout(() => URL.revokeObjectURL(url), 5000); }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrcamentoNovo() {
  const navigate = useNavigate();
  const [step,           setStep]           = useState(1);
  const [membroQuery,    setMembroQuery]     = useState("");
  const [membroSel,      setMembroSel]       = useState<typeof MEMBERS[0] | null>(null);
  const [cart,           setCart]            = useState<CartItem[]>([]);
  const [validadeDias,   setValidadeDias]    = useState("7");

  const membrosFiltrados = MEMBERS.filter((m) =>
    membroQuery.length > 0 &&
    (m.nome.toLowerCase().includes(membroQuery.toLowerCase()) || m.cpf.includes(membroQuery))
  );

  const addToCart = (id: string) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.produtoId === id);
      return ex ? prev.map((c) => c.produtoId === id ? { ...c, qty: c.qty + 1 } : c) : [...prev, { produtoId: id, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.produtoId === id);
      if (!ex) return prev;
      return ex.qty === 1 ? prev.filter((c) => c.produtoId !== id) : prev.map((c) => c.produtoId === id ? { ...c, qty: c.qty - 1 } : c);
    });
  };

  const itensCarrinho = cart.map((c) => {
    const p = CATALOGO.find((x) => x.id === c.produtoId)!;
    return { ...p, qty: c.qty };
  });

  const totalCusto = itensCarrinho.reduce((s, i) => s + i.custo * i.qty, 0);
  const totalReais = itensCarrinho.reduce((s, i) => s + i.reais * i.qty, 0);
  const saldoApos  = (membroSel?.saldo ?? 0) - totalCusto;
  const suficiente = saldoApos >= 0;

  const codigo = `ORC-${Date.now().toString(36).toUpperCase().slice(-5)}`;
  const validade = (() => {
    const d = new Date();
    d.setDate(d.getDate() + Number(validadeDias));
    return d.toLocaleDateString("pt-BR");
  })();

  function handleGerarPDF() {
    if (!membroSel) return;
    gerarPDF(membroSel, itensCarrinho, totalCusto, totalReais, codigo, validade);
    toast.success("PDF aberto em nova aba — use Ctrl+P para salvar");
  }

  function handleConverter() {
    toast.success("Orçamento convertido em pedido com sucesso");
    navigate("/pedidos");
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Novo orçamento"
        path={[{ label: "Operação" }, { label: "Orçamentos" }]}
      />

      <div className="max-w-2xl mx-auto pt-6">
        <Stepper current={step} />

        {/* ── Step 1: Identificar membro ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold">Identificar o membro</h3>
              <p className="text-sm text-muted-foreground mt-1">Busque pelo nome ou CPF do membro.</p>
            </div>

            <div className="space-y-1.5">
              <Label>Nome ou CPF</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Ex: Aline ou 123.456…"
                  value={membroQuery}
                  onChange={(e) => { setMembroQuery(e.target.value); setMembroSel(null); }}
                />
              </div>

              {membrosFiltrados.length > 0 && !membroSel && (
                <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden">
                  {membrosFiltrados.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setMembroSel(m); setMembroQuery(m.nome); }}
                      className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/40 text-left border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{m.nome}</p>
                        <p className="text-xs text-muted-foreground">{m.cpf}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{m.tier}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {membroSel && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 px-5 py-4 space-y-3">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Membro selecionado</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{membroSel.nome}</p>
                    <p className="text-xs text-muted-foreground">{membroSel.cpf} · {membroSel.tier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Saldo atual</p>
                    <p className="text-lg font-bold text-primary">{membroSel.saldo.toLocaleString("pt-BR")} {MOEDA.abrev}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Selecionar itens ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold">Selecionar itens</h3>
              <p className="text-sm text-muted-foreground mt-1">Escolha os produtos do catálogo de resgate.</p>
            </div>

            <div className="space-y-2">
              {CATALOGO.map((p) => {
                const inCart = cart.find((c) => c.produtoId === p.id);
                return (
                  <div key={p.id} className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{p.nome}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-primary">{p.custo.toLocaleString("pt-BR")} {MOEDA.abrev}</p>
                      <p className="text-xs text-muted-foreground">{p.reais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {inCart ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => removeFromCart(p.id)} className="h-7 w-7 rounded border border-border flex items-center justify-center hover:bg-muted">
                            {inCart.qty === 1 ? <Trash2 className="size-3.5 text-muted-foreground" /> : <Minus className="size-3.5" />}
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{inCart.qty}</span>
                          <button onClick={() => addToCart(p.id)} className="h-7 w-7 rounded border border-border flex items-center justify-center hover:bg-muted">
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addToCart(p.id)}>
                          <Plus className="size-3 mr-1" /> Adicionar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {cart.length > 0 && (
              <div className="rounded-lg bg-muted/40 px-4 py-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{cart.reduce((s, c) => s + c.qty, 0)} item(ns) selecionado(s)</span>
                <span className="font-semibold">{totalCusto.toLocaleString("pt-BR")} {MOEDA.abrev}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Simulação ── */}
        {step === 3 && membroSel && (
          <div className="space-y-5">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold">Simulação</h3>
              <p className="text-sm text-muted-foreground mt-1">Verifique a viabilidade do resgate antes de gerar o documento.</p>
            </div>

            {/* Itens */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Itens selecionados</p>
              </div>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="px-4 py-2.5 text-xs font-medium">Produto</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-center">Qtd.</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-right">{MOEDA.nome}</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-right">R$</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {itensCarrinho.map((i) => (
                    <tr key={i.id}>
                      <td className="px-4 py-3">{i.nome}</td>
                      <td className="px-4 py-3 text-center">{i.qty}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{(i.custo * i.qty).toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{(i.reais * i.qty).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cálculo */}
            <div className={`rounded-lg border px-5 py-4 space-y-2.5 ${suficiente ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
              {[
                { label: `Total em ${MOEDA.nome.toLowerCase()}`, value: `${totalCusto.toLocaleString("pt-BR")} ${MOEDA.abrev}` },
                { label: "Equivalente em R$",                   value: totalReais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) },
                { label: `Saldo atual (${MOEDA.nome})`,         value: `${membroSel.saldo.toLocaleString("pt-BR")} ${MOEDA.abrev}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm font-bold">
                <span>Saldo após resgate</span>
                <span className={suficiente ? "text-emerald-700" : "text-rose-700"}>
                  {saldoApos.toLocaleString("pt-BR")} {MOEDA.abrev}
                  <span className={`ml-2 text-[10px] font-semibold rounded-full px-2 py-0.5 ${suficiente ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {suficiente ? "Suficiente" : `Faltam ${Math.abs(saldoApos).toLocaleString("pt-BR")} ${MOEDA.abrev}`}
                  </span>
                </span>
              </div>
            </div>

            {/* Validade */}
            <div className="space-y-1.5">
              <Label>Validade do orçamento (dias)</Label>
              <div className="w-32">
                <Input type="number" value={validadeDias} onChange={(e) => setValidadeDias(e.target.value)} min={1} />
              </div>
              <p className="text-xs text-muted-foreground">Válido até {validade}</p>
            </div>
          </div>
        )}

        {/* ── Step 4: Gerar documento ── */}
        {step === 4 && membroSel && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold">Documento pronto</h3>
              <p className="text-sm text-muted-foreground mt-1">Gere o PDF ou converta diretamente em pedido.</p>
            </div>

            {/* Preview resumo */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Resumo do orçamento</p>
                <span className="font-mono text-xs text-muted-foreground">{codigo}</span>
              </div>
              <div className="px-5 divide-y divide-border">
                {[
                  ["Membro",          membroSel.nome],
                  ["CPF",             membroSel.cpf],
                  ["Total de itens",  String(cart.reduce((s, c) => s + c.qty, 0))],
                  [`Total em ${MOEDA.nome.toLowerCase()}`, `${totalCusto.toLocaleString("pt-BR")} ${MOEDA.abrev}`],
                  ["Equivalente R$",  totalReais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })],
                  ["Válido até",      validade],
                  ["Situação",        suficiente ? "Saldo suficiente" : `Faltam ${Math.abs(saldoApos).toLocaleString("pt-BR")} pts`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-3 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleGerarPDF}>
                Gerar PDF
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleConverter} disabled={!suficiente}>
                Converter em pedido
              </Button>
            </div>
            {!suficiente && (
              <p className="text-xs text-muted-foreground text-center">
                Saldo insuficiente — não é possível converter em pedido.
              </p>
            )}
          </div>
        )}

        {/* Nav */}
        <div className="flex gap-3 mt-10 pt-6 border-t border-border">
          <Button
            variant="outline" className="flex-1"
            onClick={() => step > 1 ? setStep(step - 1) : navigate("/orcamentos")}
          >
            Voltar
          </Button>
          {step < 4 && (
            <Button
              className="flex-1"
              disabled={
                (step === 1 && !membroSel) ||
                (step === 2 && cart.length === 0)
              }
              onClick={() => setStep(step + 1)}
            >
              Continuar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
