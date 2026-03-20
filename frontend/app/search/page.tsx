export const dynamic = "force-dynamic";
import React from "react";
import SearchClient from "@/components/SearchClient";

type Props = {
  // searchParams may be a Promise in Next.js 15; accept either shape
  searchParams?: { q?: string } | Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q: query } = (await searchParams) ?? {};
  const q = query ?? "";
  return <SearchClient initialQuery={q} />;
}
