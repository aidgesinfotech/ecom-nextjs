import PolicyContent from "@/components/PolicyContent";
import { getPolicies } from "@/lib/policies";
import { getPolicyPageBySlug } from "@/lib/policy-defaults";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/styles/policy-page.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getPolicyPageBySlug(slug);
  if (!page) return { title: "Policy" };
  return { title: `${page.title} | Aikvis` };
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params;
  const page = getPolicyPageBySlug(slug);
  if (!page) notFound();

  let content = "";
  try {
    const policies = await getPolicies();
    content = policies[page.field];
  } catch {
    const { DEFAULT_POLICIES } = await import("@/lib/policy-defaults");
    content = DEFAULT_POLICIES[page.field];
  }

  return (
    <div className="policy-page container section-padding">
      <h1 className="policy-page-title">{page.title}</h1>
      <PolicyContent html={content} />
    </div>
  );
}
