"use client";

import { useState } from "react";
import classNames from "classnames";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
import {
  History,
  ChevronUp,
  ChevronDown,
  MousePointerClick,
} from "lucide-react";

interface HistoryNotificationProps {
  /** Whether the historical version notification should be visible */
  isVisible: boolean;
  /** Whether the version promotion is in progress */
  isPromotingVersion: boolean;
  /** Function to promote the current historical version */
  onPromoteVersion: () => void;
  /** Function to go back to the current version */
  onGoBackToCurrent: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const HistoryNotification = ({
  isVisible,
  isPromotingVersion,
  onPromoteVersion,
  onGoBackToCurrent,
  className,
}: HistoryNotificationProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={classNames(
        "absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-xl shadow-lg transition-all duration-300 ease-in-out",
        className
      )}
    >
      {isCollapsed ? (
        // Collapsed state
        <div className="flex items-center gap-2 p-3">
          <History className="size-4 text-neutral-600" />
          <span className="text-xs text-neutral-600 font-medium">
            Historical Version
          </span>
          <Button
            variant="outline"
            size="iconXs"
            className="!rounded-md !border-neutral-200"
            onClick={() => setIsCollapsed(false)}
          >
            <ChevronUp className="text-neutral-400 size-3" />
          </Button>
        </div>
      ) : (
        // Expanded state
        <div className="p-4 max-w-sm w-full">
          <div className="flex items-start gap-3">
            <History className="size-4 text-neutral-600 translate-y-1.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-neutral-800">
                    Historical Version
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="iconXs"
                  className="!rounded-md !border-neutral-200"
                  onClick={() => setIsCollapsed(true)}
                >
                  <ChevronDown className="text-neutral-400 size-3" />
                </Button>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                You're viewing a previous version of this project. Promote this
                version to make it current and deploy it live.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="black"
                  className="!pr-3"
                  onClick={onPromoteVersion}
                  disabled={isPromotingVersion}
                >
                  {isPromotingVersion ? (
                    <Loading overlay={false} />
                  ) : (
                    <MousePointerClick className="size-3" />
                  )}
                  Promote Version
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  className=" !text-neutral-600 !border-neutral-200"
                  disabled={isPromotingVersion}
                  onClick={onGoBackToCurrent}
                >
                  Go back to current
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
