import { Page } from "@/types";
import { ListPagesItem } from "./page";
import { useEditor } from "@/hooks/useEditor";

export function ListPages() {
  const { pages, setPages, currentPage, setCurrentPage } = useEditor();
  return (
    <div className="w-full flex items-center justify-start bg-neutral-950 overflow-auto flex-nowrap">
      {pages.map((page: Page, i: number) => (
        <ListPagesItem
          key={page.path ?? i}
          page={page}
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          onDeletePage={(path) => {
            setPages(pages.filter((page) => page.path !== path));
            setCurrentPage("index.html");
          }}
          index={i}
        />
      ))}
    </div>
  );
}
