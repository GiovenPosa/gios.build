import { useEffect, useState } from 'react';

// How many masonry columns fit, matching the home work grid's breakpoints:
// 3 above 900px, 2 below (phones included).
const queries = [
  ['(max-width: 900px)', 2],
] as const;

function current(): number {
  if (typeof window === 'undefined') return 3;
  for (const [query, count] of queries) {
    if (window.matchMedia(query).matches) return count;
  }
  return 3;
}

export function useColumnCount(): number {
  const [count, setCount] = useState(current);

  useEffect(() => {
    const lists = queries.map(([query]) => window.matchMedia(query));
    const update = () => setCount(current());
    lists.forEach((list) => list.addEventListener('change', update));
    return () => lists.forEach((list) => list.removeEventListener('change', update));
  }, []);

  return count;
}
