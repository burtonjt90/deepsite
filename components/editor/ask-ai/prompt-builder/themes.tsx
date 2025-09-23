import { Theme } from "@/types";
import classNames from "classnames";
import { Moon, Sun } from "lucide-react";
import { useRef } from "react";

export const Themes = ({
  value,
  onChange,
}: {
  value: Theme;
  onChange: (value: Theme) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="flex items-center justify-start gap-3 overflow-x-auto px-5 scrollbar-hide"
    >
      <div
        className={classNames(
          "flex flex-col items-center justify-center p-3 size-16 min-w-32 gap-2 rounded-lg border border-neutral-800 bg-neutral-800/30 hover:brightness-120 cursor-pointer",
          {
            "!border-neutral-700 !bg-neutral-800/80 hover:!brightness-100":
              value === "light",
          }
        )}
        onClick={() => onChange("light")}
      >
        <Sun className="size-4 text-amber-500" />
        <p className="text-xs capitalize text-neutral-200 truncate">Light</p>
      </div>
      <div
        className={classNames(
          "flex flex-col items-center justify-center p-3 size-16 min-w-32 gap-2 rounded-lg border border-neutral-800 bg-neutral-800/30 hover:brightness-120 cursor-pointer",
          {
            "!border-neutral-700 !bg-neutral-800/80 hover:!brightness-100":
              value === "dark",
          }
        )}
        onClick={() => onChange("dark")}
      >
        <Moon className="size-4 text-indigo-500" />
        <p className="text-xs capitalize text-neutral-200 truncate">Dark</p>
      </div>
    </div>
  );
};
