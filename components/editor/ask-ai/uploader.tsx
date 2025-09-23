import { useRef, useState } from "react";
import {
  CheckCircle,
  ImageIcon,
  Images,
  Link,
  Paperclip,
  Upload,
} from "lucide-react";
import Image from "next/image";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Project } from "@/types";
import Loading from "@/components/loading";
import { useUser } from "@/hooks/useUser";
import { useEditor } from "@/hooks/useEditor";
import { useAi } from "@/hooks/useAi";
import { useLoginModal } from "@/components/contexts/login-context";

export const Uploader = ({ project }: { project: Project | undefined }) => {
  const { user } = useUser();
  const { openLoginModal } = useLoginModal();
  const { uploadFiles, isUploading, files, globalEditorLoading } = useEditor();
  const { selectedFiles, setSelectedFiles, globalAiLoading } = useAi();

  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user)
    return (
      <Button
        size="xs"
        variant="outline"
        className="!rounded-md"
        disabled={globalAiLoading || globalEditorLoading}
        onClick={() => openLoginModal()}
      >
        <Paperclip className="size-3.5" />
        Attach
      </Button>
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <form className="h-[24px]">
        <PopoverTrigger asChild>
          <Button
            size="xs"
            variant={open ? "default" : "outline"}
            className="!rounded-md"
            disabled={globalAiLoading || globalEditorLoading}
          >
            <Paperclip className="size-3.5" />
            Attach
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="!rounded-2xl !p-0 !bg-white !border-neutral-100 min-w-xs text-center overflow-hidden"
        >
          <header className="bg-neutral-50 p-6 border-b border-neutral-200/60">
            <div className="flex items-center justify-center -space-x-4 mb-3">
              <div className="size-9 rounded-full bg-pink-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
                🎨
              </div>
              <div className="size-11 rounded-full bg-amber-200 shadow-2xl flex items-center justify-center text-2xl z-2">
                🖼️
              </div>
              <div className="size-9 rounded-full bg-sky-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
                💻
              </div>
            </div>
            <p className="text-xl font-semibold text-neutral-950">
              Add Custom Images
            </p>
            <p className="text-sm text-neutral-500 mt-1.5">
              Upload images to your project and use them with DeepSite!
            </p>
          </header>
          <main className="space-y-4 p-5">
            <div>
              <p className="text-xs text-left text-neutral-700 mb-2">
                Uploaded Images
              </p>
              {files?.length > 0 ? (
                <div className="grid grid-cols-4 gap-1 flex-wrap max-h-40 overflow-y-auto">
                  {files.map((file: string) => (
                    <div
                      key={file}
                      className="select-none relative cursor-pointer bg-white rounded-md border-[2px] border-white hover:shadow-2xl transition-all duration-300"
                      onClick={() =>
                        setSelectedFiles(
                          selectedFiles.includes(file)
                            ? selectedFiles.filter((f) => f !== file)
                            : [...selectedFiles, file]
                        )
                      }
                    >
                      <Image
                        src={file}
                        alt="uploaded image"
                        width={56}
                        height={56}
                        className="object-cover w-full rounded-sm aspect-square"
                      />
                      {selectedFiles.includes(file) && (
                        <div className="absolute top-0 right-0 h-full w-full flex items-center justify-center bg-black/50 rounded-md">
                          <CheckCircle className="size-6 text-neutral-100" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-mono flex flex-col items-center gap-1 pt-2">
                  <ImageIcon className="size-4" />
                  No images uploaded yet
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-left text-neutral-700 mb-2">
                Or import images from your computer
              </p>
              <Button
                variant="black"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loading
                      overlay={false}
                      className="ml-2 size-4 animate-spin"
                    />
                    Uploading image(s)...
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    Upload Images
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={(e) => uploadFiles(e.target.files, project!)}
              />
            </div>
          </main>
        </PopoverContent>
      </form>
    </Popover>
  );
};
