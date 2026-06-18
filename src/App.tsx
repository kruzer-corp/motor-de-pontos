import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import Membros from "./pages/Membros";
import MembrosTier from "./pages/MembrosTier";
import MembrosSegmentos from "./pages/MembrosSegmentos";
import MembrosAjuste from "./pages/MembrosAjuste";
import Extrato from "./pages/Extrato";
import Catalogo from "./pages/Catalogo";
import CatalogoDetalhe from "./pages/CatalogoDetalhe";
import CatalogoGrupos from "./pages/CatalogoGrupos";
import Campanhas from "./pages/Campanhas";
import CampanhasNova from "./pages/CampanhasNova";
import CampanhasDetail from "./pages/CampanhasDetail";
import Recompensas from "./pages/Recompensas";
import ResgateCatalogo from "./pages/ResgateCatalogo";
import ResgateDocumental from "./pages/ResgateDocumental";
import Conformidade from "./pages/Conformidade";
import Comunicacoes from "./pages/Comunicacoes";
import MinhaConta from "./pages/MinhaConta";
import CatalogoAtualizacao from "./pages/CatalogoAtualizacao";
import Comunicados from "./pages/Comunicados";
import Pedidos from "./pages/Pedidos";
import Homepage from "./pages/Homepage";
import Banners from "./pages/Banners";
import Conteudo from "./pages/Conteudo";
import LoginConfig from "./pages/LoginConfig";
import IndicacaoVenda from "./pages/IndicacaoVenda";
import DashboardResultados from "./pages/DashboardResultados";
import ProdutoMapa from "./pages/ProdutoMapa";
import Webhooks from "./pages/Webhooks";
import Carteiras from "./pages/Carteiras";
import Niveis from "./pages/Niveis";
import Canais from "./pages/Canais";
import Afiliados from "./pages/Afiliados";
import Config from "./pages/Config";
import Ranking from "./pages/Ranking";
import Logs from "./pages/Logs";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="config" element={<Config />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="membros" element={<Membros />} />
        <Route path="membros/tier" element={<MembrosTier />} />
        <Route path="membros/segmentos" element={<MembrosSegmentos />} />
        <Route path="membros/ajuste" element={<MembrosAjuste />} />
        <Route path="membros/extrato" element={<Extrato />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="catalogo/grupos" element={<CatalogoGrupos />} />
        <Route path="catalogo/:id" element={<CatalogoDetalhe />} />
        <Route path="catalogo/atualizacao" element={<CatalogoAtualizacao />} />
        <Route path="campanhas" element={<Campanhas />} />
        <Route path="campanhas/nova" element={<CampanhasNova />} />
        <Route path="campanhas/:id" element={<CampanhasDetail />} />
        <Route path="recompensas" element={<Recompensas />} />
        <Route path="recompensas/catalogo" element={<ResgateCatalogo />} />
        <Route path="recompensas/documental" element={<ResgateDocumental />} />
        <Route path="conformidade" element={<Conformidade />} />
        <Route path="comunicacoes" element={<Comunicacoes />} />
        <Route path="minha-conta" element={<MinhaConta />} />
        <Route path="comunicados" element={<Comunicados />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="homepage" element={<Homepage />} />
        <Route path="banners" element={<Banners />} />
        <Route path="conteudo" element={<Conteudo />} />
        <Route path="login-config" element={<LoginConfig />} />
        <Route path="indicacoes" element={<IndicacaoVenda />} />
        <Route path="dashboard-resultados" element={<DashboardResultados />} />
        <Route path="produto-mapa" element={<ProdutoMapa />} />
        <Route path="webhooks" element={<Webhooks />} />
        <Route path="carteiras" element={<Carteiras />} />
        <Route path="niveis" element={<Niveis />} />
        <Route path="canais" element={<Canais />} />
        <Route path="afiliados" element={<Afiliados />} />
        <Route path="ranking" element={<Ranking />} />
        <Route path="logs" element={<Logs />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
