import { notFound } from "next/navigation";
import { mockExams } from "@/data/practice";
import { MockExamPlayer } from "@/components/practice/MockExamPlayer";

export function generateStaticParams() {
  return mockExams.map((exam) => ({ mockId: exam.id }));
}

export default async function MockExamPage({
  params,
}: {
  params: Promise<{ mockId: string }>;
}) {
  const { mockId } = await params;
  const exam = mockExams.find((e) => e.id === mockId);
  if (!exam || exam.sections.length === 0) {
    notFound();
  }
  return <MockExamPlayer exam={exam} />;
}
