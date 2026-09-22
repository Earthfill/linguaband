import { notFound } from "next/navigation";
import { getMock } from "@/lib/store";
import { MockExamPlayer } from "@/components/practice/MockExamPlayer";

export default async function MockExamPage({
  params,
}: {
  params: Promise<{ mockId: string }>;
}) {
  const { mockId } = await params;
  const found = await getMock(mockId);
  if (!found || found.exam.sections.length === 0) {
    notFound();
  }
  return <MockExamPlayer exam={found.exam} audioEntries={found.audio} />;
}
