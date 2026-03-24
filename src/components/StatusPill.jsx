const styles = {
  matched:   'bg-[#0d2620] text-[#00e5a0] border border-[#1a4a38]',
  unmatched: 'bg-[#1a1a10] text-[#ffb830] border border-[#3d3010]',
  exception: 'bg-[#2a1316] text-[#ff5c6a] border border-[#3d1a1e]',
  duplicate: 'bg-[#12172a] text-[#4d9fff] border border-[#1a2a4a]',
  pending:   'bg-[#13161a] text-[#5a6270] border border-[#252a32]',
};

export default function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium ${styles[status] || styles.pending}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}
