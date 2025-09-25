import classNames from "classnames";
import { FileCode, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Page } from "@/types";

export function ListPagesItem({
  page,
  currentPage,
  onSelectPage,
  onDeletePage,
  index,
}: {
  page: Page;
  currentPage: string;
  onSelectPage: (path: string, newPath?: string) => void;
  onDeletePage: (path: string) => void;
  index: number;
}) {
  return (
    <div
      key={index}
      className={classNames(
        "pl-6 pr-1 py-3 text-neutral-400 cursor-pointer text-sm hover:bg-neutral-900 flex items-center justify-center gap-1 group text-nowrap border-r border-neutral-800",
        {
          "bg-neutral-900 !text-white": currentPage === page.path,
          "!pr-6": index === 0, // Ensure the first item has padding on the right
        }
      )}
      onClick={() => onSelectPage(page.path)}
      title={page.path}
    >
      <FileCode className="size-4 mr-1" />
      {page.path}
      {index > 0 && (
        <Button
          size="iconXsss"
          variant="ghost"
          className="group-hover:opacity-100 opacity-0 !h-auto"
          onClick={(e) => {
            e.stopPropagation();
            if (
              window.confirm(
                "Are you sure you want to delete this page? This action cannot be undone."
              )
            ) {
              onDeletePage(page.path);
            }
          }}
        >
          <XIcon className="h-3 text-neutral-400 cursor-pointer hover:text-neutral-300" />
        </Button>
      )}
    </div>
  );
}
