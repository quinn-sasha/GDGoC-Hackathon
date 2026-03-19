export const dynamic = "force-dynamic";
import React from "react";
import SearchClient from "@/components/SearchClient";

type Props = {
  searchParams?: { q?: string };
};

export default function SearchPage({ searchParams }: Props) {
  const q = searchParams?.q ?? "";
  return <SearchClient initialQuery={q} />;
}
