import { NextRequest, NextResponse } from "next/server";
import { RepoDesignation, listFiles, spaceInfo, uploadFiles } from "@huggingface/hub";

import { isAuthenticated } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { 
    params: Promise<{ 
      namespace: string; 
      repoId: string; 
      commitId: string; 
    }> 
  }
) {
  const user = await isAuthenticated();

  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const param = await params;
  const { namespace, repoId, commitId } = param;

  try {
    const repo: RepoDesignation = {
      type: "space",
      name: `${namespace}/${repoId}`,
    };

    const space = await spaceInfo({
      name: `${namespace}/${repoId}`,
      accessToken: user.token as string,
      additionalFields: ["author"],
    });

    if (!space || space.sdk !== "static") {
      return NextResponse.json(
        { ok: false, error: "Space is not a static space." },
        { status: 404 }
      );
    }
    
    if (space.author !== user.name) {
      return NextResponse.json(
        { ok: false, error: "Space does not belong to the authenticated user." },
        { status: 403 }
      );
    }

    // Fetch files from the specific commit
    const files: File[] = [];
    const allowedExtensions = ["html", "md", "css", "js", "json", "txt"];
    
    // Get all files from the specific commit
    for await (const fileInfo of listFiles({
      repo,
      accessToken: user.token as string,
      revision: commitId,
    })) {
      const fileExtension = fileInfo.path.split('.').pop()?.toLowerCase();
      
      if (allowedExtensions.includes(fileExtension || "")) {
        // Fetch the file content from the specific commit
        const response = await fetch(
          `https://huggingface.co/spaces/${namespace}/${repoId}/raw/${commitId}/${fileInfo.path}`
        );
        
        if (response.ok) {
          const content = await response.text();
          let mimeType = "text/plain";
          
          switch (fileExtension) {
            case "html":
              mimeType = "text/html";
              break;
            case "css":
              mimeType = "text/css";
              break;
            case "js":
              mimeType = "application/javascript";
              break;
            case "json":
              mimeType = "application/json";
              break;
            case "md":
              mimeType = "text/markdown";
              break;
          }
          
          const file = new File([content], fileInfo.path, { type: mimeType });
          files.push(file);
        }
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No files found in the specified commit" },
        { status: 404 }
      );
    }

    // Upload the files to the main branch with a promotion commit message
    await uploadFiles({
      repo,
      files,
      accessToken: user.token as string,
      commitTitle: `Promote version ${commitId.slice(0, 7)} to main`,
      commitDescription: `Promoted commit ${commitId} to main branch`,
    });

    return NextResponse.json(
      { 
        ok: true, 
        message: "Version promoted successfully",
        promotedCommit: commitId,
        filesPromoted: files.length
      },
      { status: 200 }
    );

  } catch (error: any) {
    
    // Handle specific HuggingFace API errors
    if (error.statusCode === 404) {
      return NextResponse.json(
        { ok: false, error: "Commit not found" },
        { status: 404 }
      );
    }
    
    if (error.statusCode === 403) {
      return NextResponse.json(
        { ok: false, error: "Access denied to repository" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { ok: false, error: error.message || "Failed to promote version" },
      { status: 500 }
    );
  }
}
