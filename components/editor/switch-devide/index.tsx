import classNames from "classnames";
import { Laptop, Smartphone } from "lucide-react";

import { useEditor } from "@/hooks/useEditor";

const DEVICES = [
  {
    name: "desktop",
    icon: Laptop,
  },
  {
    name: "mobile",
    icon: Smartphone,
  },
];

export const SwitchDevice = () => {
  const { device, setDevice } = useEditor();
  return (
    <div className="max-lg:hidden flex items-center justify-start gap-0.5 border border-neutral-700/70 text-neutral-200 rounded-md bg-neutral-800 px-0.5 py-0.5">
      {DEVICES.map((dvc) => (
        <button
          key={dvc.name}
          className={classNames(
            "capitalize rounded-sm pl-1.5 pr-1.5 py-0.5 text-[10px] flex items-center justify-start gap-1 cursor-pointer font-sans font-medium",
            {
              "bg-white text-neutral-900": dvc.name === device,
              "hover:bg-neutral-700/50": dvc.name !== device,
            }
          )}
          onClick={() => setDevice(dvc.name)}
        >
          <dvc.icon className="size-3" />
          {dvc.name}
        </button>
      ))}
    </div>
  );
};
