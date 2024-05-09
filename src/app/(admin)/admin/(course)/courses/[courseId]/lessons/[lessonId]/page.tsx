import { API_URL_LOCAL } from "@/lib/constants";
import { Lesson } from "@/lib/models";
import { validateResponse } from "@/lib/validate-response";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LessonEditPage from "./lesson-edit-page";

const getLesson = async (courseId: string, lessonId: string) => {
  const url = `${API_URL_LOCAL}/admin/courses/${courseId}/lessons/${lessonId}`;

  const resp = await fetch(url, {
    headers: {
      Cookie: cookies().toString(),
    },
  });

  await validateResponse(resp);

  if (resp.status === 204) {
    return undefined;
  }

  return resp
    .json()
    .then((json) => json as Lesson)
    .catch((e) => undefined);
};

export default async function LessonEdit({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const lesson = await getLesson(params.courseId, params.lessonId);

  if (!lesson) {
    redirect(`/admin/courses/${params.courseId}`);
  }

  if (lesson.course?.id !== params.courseId) {
    redirect(`/admin/courses/${params.courseId}`);
  }

  return <LessonEditPage lesson={lesson} />;
}
