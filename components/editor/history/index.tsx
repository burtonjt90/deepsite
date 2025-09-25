import { History as HistoryIcon } from "lucide-react";
import { useState } from "react";

import { Commit } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useEditor } from "@/hooks/useEditor";
import classNames from "classnames";

export function History() {
  const { commits, currentCommit, setCurrentCommit } = useEditor();
  const [open, setOpen] = useState(false);

  if (commits.length === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="xs"
          variant={open ? "default" : "outline"}
          className="!rounded-md max-lg:hidden"
        >
          <HistoryIcon className="size-3.5" />
          {commits?.length} edit{commits?.length !== 1 ? "s" : ""}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="!rounded-2xl !p-0 overflow-hidden !bg-neutral-900"
        align="start"
      >
        <header className="text-sm px-4 py-3 border-b gap-2 bg-neutral-950 border-neutral-800 font-semibold text-neutral-200">
          History
        </header>
        <main className="space-y-3">
          <ul className="max-h-[250px] overflow-y-auto">
            {commits?.map((item: Commit, index: number) => (
              <li
                key={index}
                className={classNames(
                  "px-4 text-gray-200 py-2 border-b border-gray-800 last:border-0 space-y-1",
                  {
                    "bg-blue-500/10":
                      currentCommit === item.oid ||
                      (index === 0 && currentCommit === null),
                  }
                )}
              >
                <p className="line-clamp-1 text-sm">{item.title}</p>
                <div className="w-full flex items-center justify-between gap-2">
                  <p className="text-gray-500 text-[10px]">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "2-digit",
                    }) +
                      " " +
                      new Date(item.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                  </p>
                  {currentCommit === item.oid ||
                  (index === 0 && currentCommit === null) ? (
                    <span className="text-blue-500 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] px-2 py-0.5">
                      Current version
                    </span>
                  ) : (
                    <Button
                      variant="link"
                      size="xss"
                      className="text-gray-400 hover:text-gray-200"
                      onClick={() => {
                        if (index === 0) {
                          setCurrentCommit(null);
                        } else {
                          setCurrentCommit(item.oid);
                        }
                      }}
                    >
                      See version
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </main>
      </PopoverContent>
    </Popover>
  );
}
