export function CustomTag({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 ${className}`}>
      ⚡ Custom Fast PRO
    </span>
  );
}

export function CustomBanner({ label = "Esta seção é exclusiva Fast PRO" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
      <span className="font-bold text-[10px] uppercase tracking-wide border border-amber-300 rounded-full px-2 py-0.5">⚡ Custom Fast PRO</span>
      <span>{label}</span>
    </div>
  );
}
