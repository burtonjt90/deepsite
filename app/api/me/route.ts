export const dynamic = 'force-dynamic';
import { listSpaces } from "@huggingface/hub";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const authHeaders = await headers();
  const token = authHeaders.get("Authorization");
  if (!token) {
    return NextResponse.json({ user: null, errCode: 401 }, { status: 401 });
  }

  const userResponse = await fetch("https://huggingface.co/api/whoami-v2", {
    headers: {
      Authorization: `${token}`,
    },
  });

  if (!userResponse.ok) {
    return NextResponse.json(
      { user: null, errCode: userResponse.status },
      { status: userResponse.status }
    );
  }
  const user = await userResponse.json();
  const projects = [];
  for await (const space of listSpaces({
    accessToken: token.replace("Bearer ", "") as string,
    additionalFields: ["author", "cardData"],
    search: {
      owner: user.name,
    }
  })) {
    if (
      space.sdk === "static" &&
      Array.isArray((space.cardData as { tags?: string[] })?.tags) &&
      (
        ((space.cardData as { tags?: string[] })?.tags?.includes("deepsite-v3")) ||
        ((space.cardData as { tags?: string[] })?.tags?.includes("deepsite"))
      )
    ) {
      projects.push(space);
    }
  }

  return NextResponse.json({ user, projects, errCode: null }, { status: 200 });
}
