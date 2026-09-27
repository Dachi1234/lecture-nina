import { apiGet } from "./api";

type Curriculum = { courses: { blocks: { topics: { id: string; number: number; titleKa: string }[] }[] }[] };

export async function loadTopics() {
  const data = await apiGet<Curriculum>("/v1/admin/curriculum");
  return data.courses
    .flatMap((course) => course.blocks.flatMap((block) => block.topics))
    .map((topic) => ({ id: topic.id, number: topic.number, titleKa: topic.titleKa }))
    .sort((a, b) => a.number - b.number);
}
