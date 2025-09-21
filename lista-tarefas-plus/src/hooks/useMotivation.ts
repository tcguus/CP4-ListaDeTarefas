import { useQuery } from "@tanstack/react-query";

async function fetchQuote() {
  const r = await fetch("https://api.quotable.io/random");
  if (!r.ok) throw new Error("failed");
  return r.json() as Promise<{ content: string; author: string }>;
}
export function useMotivation() {
  return useQuery({
    queryKey: ["quote"],
    queryFn: fetchQuote,
    staleTime: 1000 * 60 * 5,
  });
}
