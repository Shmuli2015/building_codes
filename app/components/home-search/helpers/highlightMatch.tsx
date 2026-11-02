export function highlightMatch(text: string, query: string) {
  if (!query.trim()) return <span className="text-slate-700">{text}</span>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <span className="text-slate-700">{text}</span>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <span className="text-slate-700 font-medium">
      {before}
      <span className="font-extrabold text-blue-600">{match}</span>
      {after}
    </span>
  );
}
