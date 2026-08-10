// Guard do admin — enquanto a versão for "Primeiro acesso" (V1), qualquer rota
// do admin redireciona pro onboarding obrigatório, com exceção das próprias
// páginas de destino dos passos do onboarding (senão o fluxo não teria como
// ser completado).

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ehV1 } from "../lib/versao";
import { onboardingCompleto } from "../lib/onboarding";

const PERMITIDAS_EM_V1 = ["/onboarding/regra", "/canais-filiais", "/campanhas/nova", "/catalogo-produtos"];

export default function RequireVersaoCompleta() {
  const location = useLocation();
  const path = location.pathname;
  // "/coordenador" (Visão do coordenador) fica fora do array acima de propósito —
  // "/coordenadores" (CRUD do admin) também começa com essa string, e não deve ser liberado.
  const permitido = PERMITIDAS_EM_V1.some((p) => path.startsWith(p)) || path === "/coordenador" || path.startsWith("/coordenador/");

  if (ehV1() && !onboardingCompleto() && !permitido) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}
