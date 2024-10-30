import { EnrolledCourseGridItem } from "@/components/course";
import { API_URL_LOCAL } from "@/lib/constants";
import { validateResponse } from "@/lib/validate-response";
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Pagination,
} from "@elearning/ui";
import { EnrolledCourse, Page } from "@elearning/lib/models";
import { buildQueryParams } from "@elearning/lib/utils";
import { cookies } from "next/headers";
import Link from "next/link";

interface Props {
  searchParams: { [key: string]: string | undefined };
}

const getEnrollments = async ({ searchParams }: Props) => {
  const query = buildQueryParams({ page: searchParams["page"], limit: 15 });

  const url = `${API_URL_LOCAL}/profile/enrollments${query}`;

  console.log("token", cookies().toString());
  const resp = await fetch(url, {
    headers: {
      Cookie: cookies().toString(),
    },
  });

  validateResponse(resp);

  return resp
    .json()
    .then((json) => json as Page<EnrolledCourse>)
    .catch((e) => undefined);
};

export default async function Learnings(props: Props) {
  const enrollments = await getEnrollments(props);

  const content = () => {
    if (!enrollments || enrollments.contents.length === 0) {
      return (
        <Alert>
          No courses enrolled.&nbsp;
          <Link href="/browse" className="font-semibold underline">
            Browse
          </Link>
          &nbsp;courses.
        </Alert>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.contents.map((ec, i) => {
            return <EnrolledCourseGridItem key={i} data={ec} />;
          })}
        </div>

        <div className="flex justify-center lg:justify-end mt-10 xl:mt-8">
          <Pagination
            totalPage={enrollments.totalPage}
            currentPage={enrollments.currentPage}
            LinkComponent={Link}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <Breadcrumb className="mb-5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/profile">Profile</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-nowrap">Learnings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {content()}
    </>
  );
}
