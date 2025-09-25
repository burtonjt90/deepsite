"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Save, X, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import classNames from "classnames";

import { Page } from "@/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";

interface SaveChangesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  hasUnsavedChanges: boolean;
  pages: Page[];
  project?: any;
}

export const SaveChangesPopup = ({
  isOpen,
  onClose,
  onSave,
  hasUnsavedChanges,
  pages,
  project,
}: SaveChangesPopupProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSave = async () => {
    if (!project || !hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      await onSave();
      toast.success("Changes saved successfully!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (!hasUnsavedChanges || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={classNames(
          "absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-xl shadow-lg transition-all duration-300 ease-in-out"
        )}
      >
        {isCollapsed ? (
          // Collapsed state
          <div className="flex items-center gap-2 p-3">
            <Save className="size-4 text-neutral-600" />
            <span className="text-xs text-neutral-600 font-medium">
              Unsaved Changes
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
              <Save className="size-4 text-neutral-600 translate-y-1.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-neutral-800">
                      Unsaved Changes
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
                  You have unsaved changes in your project. Save them to
                  preserve your work.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    variant="black"
                    className="!pr-3"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loading overlay={false} />
                    ) : (
                      <Save className="size-3" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    className="!text-neutral-600 !border-neutral-200"
                    disabled={isSaving}
                    onClick={onClose}
                  >
                    Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
