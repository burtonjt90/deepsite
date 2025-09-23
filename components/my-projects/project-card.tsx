import Link from "next/link";
import { formatDistance } from "date-fns";
import { EllipsisVertical, Settings, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectType } from "@/types";

// from-red-500 to-red-500
// from-yellow-500 to-yellow-500
// from-green-500 to-green-500
// from-purple-500 to-purple-500
// from-blue-500 to-blue-500
// from-pink-500 to-pink-500
// from-gray-500 to-gray-500
// from-indigo-500 to-indigo-500

export function ProjectCard({
  project,
  onDelete,
}: {
  project: ProjectType;
  onDelete: () => void;
}) {
  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      onDelete();
    }
  };

  return (
    <div className="text-neutral-200 space-y-4 group cursor-pointer">
      <Link
        href={`/projects/${project.name}`}
        className="relative bg-neutral-900 rounded-2xl overflow-hidden h-44 w-full flex items-center justify-end flex-col px-3 border border-neutral-800"
      >
        <iframe
          src={`/api/proxy/?spaceId=${encodeURIComponent(project.name)}`}
          className="absolute inset-0 w-full h-full top-0 left-0"
        />

        <Button
          variant="default"
          className="w-full transition-all duration-200 translate-y-full group-hover:-translate-y-3"
        >
          Open project
        </Button>
      </Link>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-neutral-200 text-base font-semibold line-clamp-1">
            {project?.cardData?.title ?? project.name}
          </p>
          <p className="text-sm text-neutral-500">
            Updated{" "}
            {formatDistance(
              new Date(project.updatedAt || Date.now()),
              new Date(),
              {
                addSuffix: true,
              }
            )}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVertical className="text-neutral-400 size-5 hover:text-neutral-300 transition-colors duration-200 cursor-pointer" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuGroup>
              <a
                href={`https://huggingface.co/spaces/${project.name}/settings`}
                target="_blank"
              >
                <DropdownMenuItem>
                  <Settings className="size-4 text-neutral-100" />
                  Project Settings
                </DropdownMenuItem>
              </a>
              <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                <Trash className="size-4 text-red-500" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
