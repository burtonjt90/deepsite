import {
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
  MessageCircleCode,
} from "lucide-react";
import classNames from "classnames";

import { Button } from "@/components/ui/button";
import { useEditor } from "@/hooks/useEditor";

const TABS = [
  {
    value: "chat",
    label: "Chat",
    icon: MessageCircleCode,
  },
  {
    value: "preview",
    label: "Preview",
    icon: Eye,
  },
];

export const SwitchTab = ({ isMobile = false }: { isMobile?: boolean }) => {
  const { currentTab, setCurrentTab } = useEditor();

  if (isMobile) {
    return (
      <div className="flex items-center justify-center gap-1 bg-neutral-900 rounded-full p-1">
        {TABS.map((item) => (
          <Button
            key={item.value}
            variant={currentTab === item.value ? "default" : "ghost"}
            className={classNames("", {
              "opacity-60": currentTab !== item.value,
            })}
            size="sm"
            onClick={() => setCurrentTab(item.value)}
          >
            <item.icon className="size-4" />
            <span className="inline">{item.label}</span>
          </Button>
        ))}
      </div>
    );
  }
  return (
    <Button
      variant="ghost"
      size="iconXs"
      className="max-lg:hidden"
      onClick={() => setCurrentTab(currentTab === "chat" ? "preview" : "chat")}
    >
      {currentTab === "chat" ? <PanelLeftClose /> : <PanelLeftOpen />}
    </Button>
  );
};
