"use server";

import { getSession } from "@/lib/auth";
import { API_URL_LOCAL } from "@/lib/constants";
import { validateResponse } from "@/lib/validate-response";
import { revalidatePath } from "next/cache";

export async function unpublishPost(id: string) {
  const session = await getSession();

  const url = `${API_URL_LOCAL}/admin/posts/${id}/unpublish`;

  const resp = await fetch(url, {
    method: "PUT",
    headers: {
      Cookie: session.cookie,
    },
  });

  await validateResponse(resp);

  revalidatePath(`/admin/posts/${id}`);
}