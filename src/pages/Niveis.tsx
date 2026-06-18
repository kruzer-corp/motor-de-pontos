import { Navigate } from "react-router-dom";

// Tier management lives in Membros → Tier / Níveis (/membros/tier).
// This route redirects there to avoid duplicating the feature.
export default function Niveis() {
  return <Navigate to="/membros/tier" replace />;
}
