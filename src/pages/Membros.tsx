import { Navigate } from "react-router-dom";

// Consolidado em "Membros e movimentações" — mantido como redirect pra não quebrar links antigos.
export default function Membros() {
  return <Navigate to="/membros/extrato" replace />;
}
