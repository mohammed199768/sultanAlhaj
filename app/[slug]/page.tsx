import { notFound, redirect } from "next/navigation";
import { getAllWorkSlugs } from "@/lib/data/resolveWork";

export function generateStaticParams() {
  return getAllWorkSlugs().map((slug) => ({ slug }));
}

export default function RootWorkRedirect({
  params,
}: {
  params: { slug: string };
}) {
  if (!getAllWorkSlugs().includes(params.slug)) notFound();

  redirect(`/work/${params.slug}`);
}
