import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import PortalLayout from "./layout/PortalLayout";
import PortalCarteira from "./pages/portal/Carteira";
import PortalExtrato from "./pages/portal/Extrato";
import PortalCatalogo from "./pages/portal/Catalogo";
import PortalPedidos from "./pages/portal/MeusPedidos";
import PortalNivel from "./pages/portal/MeuNivel";
import PortalConta from "./pages/portal/MinhaConta";
import PortalProdutos from "./pages/portal/PortalProdutos";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import Membros from "./pages/Membros";
import MembrosV2 from "./pages/MembrosV2";
import MembrosTier from "./pages/MembrosTier";
import MembrosSegmentos from "./pages/MembrosSegmentos";
import MembrosAjuste from "./pages/MembrosAjuste";
import MembroDetalhe from "./pages/MembroDetalhe";
import Extrato from "./pages/Extrato";
import Catalogo from "./pages/Catalogo";
import CatalogoDetalhe from "./pages/CatalogoDetalhe";
import CatalogoGrupos from "./pages/CatalogoGrupos";
import Campanhas from "./pages/Campanhas";
import CampanhasNova from "./pages/CampanhasNova";
import CampanhasDetail from "./pages/CampanhasDetail";
import Recompensas from "./pages/Recompensas";
import ResgateCatalogo from "./pages/ResgateCatalogo";
import Comunicacoes from "./pages/Comunicacoes";
import MinhaConta from "./pages/MinhaConta";
import CatalogoAtualizacao from "./pages/CatalogoAtualizacao";
import Comunicados from "./pages/Comunicados";
import Pedidos from "./pages/Pedidos";
import PedidoDetalhe from "./pages/PedidoDetalhe";
import Orcamentos from "./pages/Orcamentos";
import CatalogoProdutos from "./pages/CatalogoProdutos";
import CanaisFiliais from "./pages/CanaisFiliais";
import Homepage from "./pages/Homepage";
import Banners from "./pages/Banners";
import Conteudo from "./pages/Conteudo";
import LoginConfig from "./pages/LoginConfig";
import DashboardResultados from "./pages/DashboardResultados";
import ProdutoMapa from "./pages/ProdutoMapa";
import Webhooks from "./pages/Webhooks";
import Carteiras from "./pages/Carteiras";
import Niveis from "./pages/Niveis";
import Canais from "./pages/Canais";
import Config from "./pages/Config";
import MecanicaPrograma from "./pages/MecanicaPrograma";
import Ranking from "./pages/Ranking";
import Logs from "./pages/Logs";
import Regulamento from "./pages/Regulamento";
import Indicacoes from "./pages/Indicacoes";
import PontosExpirando from "./pages/PontosExpirando";
import SaldoExpirado from "./pages/SaldoExpirado";
import Missoes from "./pages/Missoes";
import AlertasFraude from "./pages/AlertasFraude";
import TemplatesComunicacao from "./pages/TemplatesComunicacao";

export default function App() {
  return (
    <Routes>
      {/* ── Portal do membro (B2C) ── */}
      <Route element={<PortalLayout />}>
        <Route path="portal" element={<PortalCarteira />} />
        <Route path="portal/extrato" element={<PortalExtrato />} />
        <Route path="portal/catalogo" element={<PortalCatalogo />} />
        <Route path="portal/pedidos" element={<PortalPedidos />} />
        <Route path="portal/produtos" element={<PortalProdutos />} />
        <Route path="portal/nivel" element={<PortalNivel />} />
        <Route path="portal/conta" element={<PortalConta />} />
      </Route>

      {/* ── Admin (analista) ── */}
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/resgates" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="config" element={<Config />} />
        <Route path="mecanica" element={<MecanicaPrograma />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="canais-filiais" element={<CanaisFiliais />} />
        <Route path="membros" element={<Membros />} />
        <Route path="membros-v2" element={<MembrosV2 />} />
        <Route path="membros/tier" element={<MembrosTier />} />
        <Route path="membros/segmentos" element={<MembrosSegmentos />} />
        <Route path="membros/ajuste" element={<MembrosAjuste />} />
        <Route path="membros/extrato" element={<Extrato />} />
        <Route path="membros/:id" element={<MembroDetalhe />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="catalogo/grupos" element={<CatalogoGrupos />} />
        <Route path="catalogo/:id" element={<CatalogoDetalhe />} />
        <Route path="catalogo/atualizacao" element={<CatalogoAtualizacao />} />
        <Route path="campanhas" element={<Campanhas />} />
        <Route path="campanhas/nova" element={<CampanhasNova />} />
        <Route path="campanhas/:id" element={<CampanhasDetail />} />
        <Route path="recompensas" element={<Recompensas />} />
        <Route path="recompensas/catalogo" element={<ResgateCatalogo />} />
        <Route path="catalogo-produtos" element={<CatalogoProdutos />} />
        <Route path="conformidade" element={<Navigate to="/logs" replace />} />
        <Route path="comunicacoes" element={<Comunicacoes />} />
        <Route path="minha-conta" element={<MinhaConta />} />
        <Route path="comunicados" element={<Comunicados />} />
        <Route path="resgates" element={<Pedidos />} />
        <Route path="resgates/:id" element={<PedidoDetalhe />} />
        <Route path="orcamentos" element={<Orcamentos />} />
        <Route path="indicacoes" element={<Indicacoes />} />
        <Route path="pontos-expirando" element={<PontosExpirando />} />
        <Route path="saldo-expirado" element={<SaldoExpirado />} />
        <Route path="missoes" element={<Missoes />} />
        <Route path="alertas-fraude" element={<AlertasFraude />} />
        <Route path="templates-comunicacao" element={<TemplatesComunicacao />} />
        <Route path="homepage" element={<Homepage />} />
        <Route path="banners" element={<Banners />} />
        <Route path="conteudo" element={<Conteudo />} />
        <Route path="login-config" element={<LoginConfig />} />
        <Route path="dashboard-resultados" element={<DashboardResultados />} />
        <Route path="produto-mapa" element={<ProdutoMapa />} />
        <Route path="webhooks" element={<Webhooks />} />
        <Route path="carteiras" element={<Carteiras />} />
        <Route path="niveis" element={<Niveis />} />
        <Route path="canais" element={<Canais />} />
        <Route path="ranking" element={<Ranking />} />
        <Route path="logs" element={<Logs />} />
        <Route path="regulamento" element={<Regulamento />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
