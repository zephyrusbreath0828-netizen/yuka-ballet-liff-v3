import LessonDetail from "./lesson-detail";

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LessonDetail lessonId={id} />;
}
