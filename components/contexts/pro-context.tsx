"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ProModal } from "@/components/pro-modal";
import { Page } from "@/types";
import { useEditor } from "@/hooks/useEditor";

interface ProContextType {
  isOpen: boolean;
  openProModal: (pages: Page[]) => void;
  closeProModal: () => void;
}

const ProContext = createContext<ProContextType | undefined>(undefined);

export function ProProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { pages } = useEditor();

  const openProModal = () => {
    setIsOpen(true);
  };

  const closeProModal = () => {
    setIsOpen(false);
  };

  const value = {
    isOpen,
    openProModal,
    closeProModal,
  };

  return (
    <ProContext.Provider value={value}>
      {children}
      <ProModal open={isOpen} onClose={setIsOpen} pages={pages} />
    </ProContext.Provider>
  );
}

export function useProModal() {
  const context = useContext(ProContext);
  if (context === undefined) {
    throw new Error("useProModal must be used within a ProProvider");
  }
  return context;
}
