import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useLocalStorage, useUpdateEffect } from "react-use";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { defaultHTML } from "@/lib/consts";
import { Commit, HtmlHistory, Page, Project } from "@/types";
import { api } from "@/lib/api";

export const useEditor = (namespace?: string, repoId?: string) => {
  const client = useQueryClient();
  const router = useRouter();
  const [pagesStorage,, removePagesStorage] = useLocalStorage<Page[]>("pages");

  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ["editor.project"],
    queryFn: async () => {
      try {
        const response = await api.get(`/me/projects/${namespace}/${repoId}`);
        const { project, pages, files, commits } = response.data;
        if (pages?.length > 0) {
          setPages(pages);
        }
        if (files?.length > 0) {
          setFiles(files);
        }
        if (commits?.length > 0) {
          setCommits(commits);
        }
        return project;
      } catch (error: any) {
        toast.error(error.response.data.error);
        router.push("/projects");
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: 'always',
    staleTime: 0,
    gcTime: 0,
    enabled: !!namespace && !!repoId,
  });
  const setProject = (newProject: any) => {
    const { project, pages, files, commits } = newProject;
    if (pages?.length > 0) {
      setPages(pages);
    }
    if (files?.length > 0) {
      setFiles(files);
    }
    if (commits?.length > 0) {
      setCommits(commits);
    }
    client.setQueryData(["editor.project"], project);
  };

  const { data: pages = [] } = useQuery<Page[]>({
    queryKey: ["editor.pages"],
    queryFn: async (): Promise<Page[]> => {
      return pagesStorage ?? [
        {
          path: "index.html",
          html: defaultHTML,
        },
      ];
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
    initialData: pagesStorage ?? [
      {
        path: "index.html",
        html: defaultHTML,
      },
    ],
  });
  const setPages = (newPages: Page[] | ((prev: Page[]) => Page[])) => {
    if (typeof newPages === "function") {
      const currentPages = client.getQueryData<Page[]>(["editor.pages"]) ?? [];
      client.setQueryData(["editor.pages"], newPages(currentPages));
    } else {
      client.setQueryData(["editor.pages"], newPages);
    }
  };

  const { data: currentPage = "index.html" } = useQuery({
    queryKey: ["editor.currentPage"],
    queryFn: async () => "index.html",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
  const setCurrentPage = (newCurrentPage: string) => {
    client.setQueryData(["editor.currentPage"], newCurrentPage);
  };

  const { data: prompts = [] } = useQuery({
    queryKey: ["editor.prompts"],
    queryFn: async () => [],
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
    initialData: [],
  });
  const setPrompts = (newPrompts: string[] | ((prev: string[]) => string[])) => {
    if (typeof newPrompts === "function") {
      const currentPrompts = client.getQueryData<string[]>(["editor.prompts"]) ?? [];
      client.setQueryData(["editor.prompts"], newPrompts(currentPrompts));
    } else {
      client.setQueryData(["editor.prompts"], newPrompts);
    }
  };

  const { data: files = [] } = useQuery({
    queryKey: ["editor.files"],
    queryFn: async () => [],
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
    initialData: [],
  });
  const setFiles = (newFiles: string[] | ((prev: string[]) => string[])) => {
    if (typeof newFiles === "function") {
      const currentFiles = client.getQueryData<string[]>(["editor.files"]) ?? [];
      client.setQueryData(["editor.files"], newFiles(currentFiles));
    } else {
      client.setQueryData(["editor.files"], newFiles);
    }
  };

  const { data: commits = [] } = useQuery({
    queryKey: ["editor.commits"],
    queryFn: async () => [],
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    initialData: [],
  });
  const setCommits = (newCommits: Commit[] | ((prev: Commit[]) => Commit[])) => {
    if (typeof newCommits === "function") {
      const currentCommits = client.getQueryData<Commit[]>(["editor.commits"]) ?? [];
      client.setQueryData(["editor.commits"], newCommits(currentCommits));
    } else {
      client.setQueryData(["editor.commits"], newCommits);
    }
  };

  const { data: device = "desktop" } = useQuery<string>({
    queryKey: ["editor.device"],
    queryFn: async () => "desktop",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    initialData: "desktop",
  });
  const setDevice = (newDevice: string | ((prev: string) => string)) => {
    client.setQueryData(["editor.device"], newDevice);
  };

  const { data: currentTab = "chat" } = useQuery({
    queryKey: ["editor.currentTab"],
    queryFn: async () => "chat",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
  const setCurrentTab = (newCurrentTab: string | ((prev: string) => string)) => {
    client.setQueryData(["editor.currentTab"], newCurrentTab);
  };

  const { data: currentCommit = null } = useQuery<string | null>({
    queryKey: ["editor.currentCommit"],
    queryFn: async () => null,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
  const setCurrentCommit = (newCurrentCommit: string | null) => {
    client.setQueryData(["editor.currentCommit"], newCurrentCommit);
  };

  const currentPageData = useMemo(() => {
    return pages.find((page) => page.path === currentPage) ?? { path: "index.html", html: defaultHTML };
  }, [pages, currentPage]);

  const uploadFilesMutation = useMutation({
    mutationFn: async ({ files, project }: { files: FileList; project: Project }) => {
      const images = Array.from(files).filter((file) => {
        return file.type.startsWith("image/");
      });

      const data = new FormData();
      images.forEach((image) => {
        data.append("images", image);
      });

      const response = await fetch(
        `/api/me/projects/${project.space_id}/images`,
        {
          method: "POST",
          body: data,
        }
      );
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setFiles((prev) => [...prev, ...data.uploadedFiles]);
    },
  });

  const uploadFiles = (files: FileList | null, project: Project) => {
    if (!files || !project) return;
    uploadFilesMutation.mutate({ files, project });
  };

  useUpdateEffect(() => {
    if (namespace && repoId) {
      client.invalidateQueries({ queryKey: ["editor.project"] });
      client.invalidateQueries({ queryKey: ["editor.pages"] });
      client.invalidateQueries({ queryKey: ["editor.files"] });
      client.invalidateQueries({ queryKey: ["editor.commits"] });
      client.invalidateQueries({ queryKey: ["editor.currentPage"] });
      client.invalidateQueries({ queryKey: ["editor.currentCommit"] });
    }
  }, [namespace, repoId])

  return {
    isLoadingProject,
    project,
    prompts,
    pages,
    setPages,
    setPrompts,
    files,
    setFiles,
    device,
    setDevice,
    currentPage,
    setCurrentPage,
    currentPageData,
    currentTab,
    setCurrentTab,
    uploadFiles,
    commits,
    currentCommit,
    setCurrentCommit,
    setProject,
    isUploading: uploadFilesMutation.isPending,
    globalEditorLoading: uploadFilesMutation.isPending || isLoadingProject,
  };
};
