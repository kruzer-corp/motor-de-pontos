import { Link } from "react-router-dom";

export function renderCrumbLink({ label, to }: { label: string; to: string }) {
  return <Link to={to} className="hover:text-foreground transition-colors">{label}</Link>;
}
