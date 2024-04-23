"use server";

import { getSession } from "@/lib/auth";
import { API_URL } from "@/lib/constants";
import { validateResponse } from "@/lib/validate-response";

export async function createSkill(body: object) {
  const session = await getSession();

  const url = `${API_URL}/admin/skills`;

  const resp = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      Cookie: session.cookie,
      "Content-Type": "application/json",
    },
  });

  await validateResponse(resp);

  return (await resp.json()) as number;
}
