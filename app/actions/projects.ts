"use server";

import { isAuthenticated } from "@/lib/auth";
import { NextResponse } from "next/server";
import { listSpaces } from "@huggingface/hub";
import { ProjectType } from "@/types";

export async function getProjects(): Promise<{
  ok: boolean;
  projects: ProjectType[];
  isEmpty?: boolean;
}> {
  const user = await isAuthenticated();

  if (user instanceof NextResponse || !user) {
    return {
      ok: false,
      projects: [],
    };
  }

  // await dbConnect();
  // const projects = await Project.find({
  //   user_id: user?.id,
  // })
  //   .sort({ _createdAt: -1 })
  //   .limit(100)
  //   .lean();
  // if (!projects) {
  //   return {
  //     ok: true,
  //     isEmpty: true,
  //     projects: [],
  //   };
  // }

  // const mappedProjects = []

  // for (const project of projects) {
  //   const space = await spaceInfo({
  //     name: project.space_id,
  //     accessToken: user.token as string,
  //     additionalFields: ["author", "cardData"],
  //   });
  //   if (!space.private) {
  //     mappedProjects.push({
  //       ...project,
  //       name: space.name,
  //       cardData: space.cardData,
  //     });
  //   }
  // }
  const projects = [];
  // get user spaces from Hugging Face
  for await (const space of listSpaces({
    accessToken: user.token as string,
    additionalFields: ["author", "cardData"],
    search: {
      owner: user.name,
    }
  })) {
    if (
      !space.private &&
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

  return {
    ok: true,
    projects,
  };
}
