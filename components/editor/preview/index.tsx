"use client";

import { useRef, useState, useEffect } from "react";
import { useUpdateEffect } from "react-use";
import classNames from "classnames";

import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/magic-ui/grid-pattern";
import { useEditor } from "@/hooks/useEditor";
import { useAi } from "@/hooks/useAi";
import { htmlTagToText } from "@/lib/html-tag-to-text";
import { AnimatedBlobs } from "@/components/animated-blobs";
import { AiLoading } from "../ask-ai/loading";
import { defaultHTML } from "@/lib/consts";
import { Button } from "@/components/ui/button";
import { LivePreview } from "../live-preview";
import {
  MousePointerClick,
  History,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Loading from "@/components/loading";

export const Preview = ({ isNew }: { isNew: boolean }) => {
  const {
    project,
    device,
    isLoadingProject,
    currentTab,
    currentCommit,
    setCurrentCommit,
    currentPageData,
  } = useEditor();
  const {
    isEditableModeEnabled,
    setSelectedElement,
    isAiWorking,
    setIsEditableModeEnabled,
  } = useAi();

  const iframeSrc = project?.space_id
    ? `/api/proxy/?spaceId=${encodeURIComponent(project.space_id)}${
        currentCommit ? `&commitId=${currentCommit}` : ""
      }`
    : "";

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // For private projects, use srcDoc instead of proxy URL
  const shouldUseCustomIframe = project?.private && currentPageData?.html;

  // Inject event handling script for private projects
  const injectInteractivityScript = (html: string) => {
    const interactivityScript = `
      <script>        
        // Add event listeners and communicate with parent
        document.addEventListener('DOMContentLoaded', function() {
          let hoveredElement = null;
          let isEditModeEnabled = false;
          
          document.addEventListener('mouseover', function(event) {
            if (event.target !== document.body && event.target !== document.documentElement) {
              hoveredElement = event.target;
              
              const rect = event.target.getBoundingClientRect();
              const message = {
                type: 'ELEMENT_HOVERED',
                data: {
                  tagName: event.target.tagName,
                  rect: {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                  },
                  element: event.target.outerHTML
                }
              };
              parent.postMessage(message, '*');
            }
          });
          
          document.addEventListener('mouseout', function(event) {
            hoveredElement = null;
            
            parent.postMessage({
              type: 'ELEMENT_MOUSE_OUT'
            }, '*');
          });
          
          // Handle clicks - prevent default only in edit mode
          document.addEventListener('click', function(event) {
            if (isEditModeEnabled) {
              event.preventDefault();
              event.stopPropagation();
              
              const rect = event.target.getBoundingClientRect();
              parent.postMessage({
                type: 'ELEMENT_CLICKED',
                data: {
                  tagName: event.target.tagName,
                  rect: {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                  },
                  element: event.target.outerHTML
                }
              }, '*');
            }
          });
          
          // Prevent form submissions when in edit mode
          document.addEventListener('submit', function(event) {
            if (isEditModeEnabled) {
              event.preventDefault();
              event.stopPropagation();
            }
          });
          
          // Prevent other navigation events when in edit mode
          document.addEventListener('keydown', function(event) {
            if (isEditModeEnabled && event.key === 'Enter' && (event.target.tagName === 'A' || event.target.tagName === 'BUTTON')) {
              event.preventDefault();
              event.stopPropagation();
            }
          });
          
          // Listen for messages from parent
          window.addEventListener('message', function(event) {
            if (event.data.type === 'ENABLE_EDIT_MODE') {
              isEditModeEnabled = true;
              document.body.style.userSelect = 'none';
              document.body.style.pointerEvents = 'auto';
            } else if (event.data.type === 'DISABLE_EDIT_MODE') {
              isEditModeEnabled = false;
              document.body.style.userSelect = '';
              document.body.style.pointerEvents = '';
            }
          });
          
          // Notify parent that script is ready
          parent.postMessage({
            type: 'PROXY_SCRIPT_READY'
          }, '*');
        });
      </script>
    `;

    // Inject the script before closing body tag, or at the end if no body tag
    if (html.includes("</body>")) {
      return html.replace("</body>", `${interactivityScript}</body>`);
    } else {
      return html + interactivityScript;
    }
  };
  const [hoveredElement, setHoveredElement] = useState<{
    tagName: string;
    rect: { top: number; left: number; width: number; height: number };
  } | null>(null);
  const [isHistoryNotificationCollapsed, setIsHistoryNotificationCollapsed] =
    useState(false);
  const [isPromotingVersion, setIsPromotingVersion] = useState(false);

  // Handle PostMessage communication with iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (!event.origin.includes(window.location.origin)) {
        return;
      }

      const { type, data } = event.data;
      switch (type) {
        case "PROXY_SCRIPT_READY":
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              {
                type: isEditableModeEnabled
                  ? "ENABLE_EDIT_MODE"
                  : "DISABLE_EDIT_MODE",
              },
              "*"
            );
          }
          break;
        case "ELEMENT_HOVERED":
          if (isEditableModeEnabled) {
            setHoveredElement(data);
          }
          break;
        case "ELEMENT_MOUSE_OUT":
          if (isEditableModeEnabled) {
            setHoveredElement(null);
          }
          break;
        case "ELEMENT_CLICKED":
          if (isEditableModeEnabled) {
            const mockElement = {
              tagName: data.tagName,
              getBoundingClientRect: () => data.rect,
              outerHTML: data.element,
            };
            setSelectedElement(mockElement as any);
            setIsEditableModeEnabled(false);
          }
          break;
        case "NAVIGATE_TO_PROXY":
          // Handle navigation within the iframe while maintaining proxy context
          if (iframeRef.current && data.proxyUrl) {
            iframeRef.current.src = data.proxyUrl;
          }
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setSelectedElement, isEditableModeEnabled]);

  // Send edit mode state to iframe and clear hover state when disabled
  useUpdateEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: isEditableModeEnabled
            ? "ENABLE_EDIT_MODE"
            : "DISABLE_EDIT_MODE",
        },
        "*"
      );
    }

    // Clear hover state when edit mode is disabled
    if (!isEditableModeEnabled) {
      setHoveredElement(null);
    }
  }, [
    isEditableModeEnabled,
    project?.space_id,
    shouldUseCustomIframe,
    currentPageData?.html,
  ]);

  const promoteVersion = async () => {
    setIsPromotingVersion(true);
    await api
      .post(
        `/me/projects/${project?.space_id}/commits/${currentCommit}/promote`
      )
      .then((res) => {
        if (res.data.ok) {
          setCurrentCommit(null);
          toast.success("Version promoted successfully");
        }
      })
      .catch((err) => {
        toast.error(err.response.data.error);
      });
    setIsPromotingVersion(false);
  };

  return (
    <div
      className={classNames(
        "bg-neutral-900/30 w-full h-[calc(100dvh-57px)] flex flex-col items-center justify-center relative z-1 lg:border-l border-neutral-800",
        {
          "max-lg:h-0": currentTab === "chat",
          "max-lg:h-full": currentTab === "preview",
        }
      )}
    >
      <GridPattern
        x={-1}
        y={-1}
        strokeDasharray={"4 2"}
        className={cn(
          "[mask-image:radial-gradient(900px_circle_at_center,white,transparent)] opacity-40"
        )}
      />
      {!isAiWorking && hoveredElement && isEditableModeEnabled && (
        <div
          className="cursor-pointer absolute bg-sky-500/10 border-[2px] border-dashed border-sky-500 rounded-r-lg rounded-b-lg p-3 z-10 pointer-events-none"
          style={{
            top: hoveredElement.rect.top,
            left: hoveredElement.rect.left,
            width: hoveredElement.rect.width,
            height: hoveredElement.rect.height,
          }}
        >
          <span className="bg-sky-500 rounded-t-md text-sm text-neutral-100 px-2 py-0.5 -translate-y-7 absolute top-0 left-0">
            {htmlTagToText(hoveredElement.tagName.toLowerCase())}
          </span>
        </div>
      )}
      {isNew && !isAiWorking ? (
        <iframe
          className={classNames(
            "w-full select-none transition-all duration-200 bg-black h-full",
            {
              "lg:max-w-md lg:mx-auto lg:!rounded-[42px] lg:border-[8px] lg:border-neutral-700 lg:shadow-2xl lg:h-[80dvh] lg:max-h-[996px]":
                device === "mobile",
            }
          )}
          srcDoc={defaultHTML}
        />
      ) : iframeSrc === "" ||
        isLoadingProject ||
        (isAiWorking && iframeSrc == "") ||
        (shouldUseCustomIframe && !currentPageData?.html) ? (
        <div className="w-full h-full flex items-center justify-center relative">
          <div className="py-10 w-full relative z-1 max-w-3xl mx-auto text-center">
            <AiLoading
              text={
                isAiWorking && iframeSrc === ""
                  ? undefined
                  : "Fetching your space..."
              }
              className="flex-col"
            />
            <AnimatedBlobs />
            <AnimatedBlobs />
          </div>
          <LivePreview
            currentPageData={currentPageData}
            isAiWorking={isAiWorking}
            defaultHTML={defaultHTML}
            className="bottom-4 left-4"
          />
        </div>
      ) : (
        <>
          <iframe
            id="preview-iframe"
            ref={iframeRef}
            className={classNames(
              "w-full select-none transition-all duration-200 bg-black h-full",
              {
                "lg:max-w-md lg:mx-auto lg:!rounded-[42px] lg:border-[8px] lg:border-neutral-700 lg:shadow-2xl lg:h-[80dvh] lg:max-h-[996px]":
                  device === "mobile",
              }
            )}
            {...(shouldUseCustomIframe
              ? {
                  srcDoc: injectInteractivityScript(
                    currentPageData?.html || ""
                  ),
                }
              : { src: iframeSrc })}
            allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; clipboard-read; clipboard-write; display-capture; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; serial; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking"
          />
          <div
            className={classNames(
              "absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-xl shadow-lg transition-all duration-300 ease-in-out",
              {
                hidden: !currentCommit,
              }
            )}
          >
            {isHistoryNotificationCollapsed ? (
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
                  onClick={() => setIsHistoryNotificationCollapsed(false)}
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
                        onClick={() => setIsHistoryNotificationCollapsed(true)}
                      >
                        <ChevronDown className="text-neutral-400 size-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                      You're viewing a previous version of this project. Promote
                      this version to make it current and deploy it live.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="xs"
                        variant="black"
                        className="!pr-3"
                        onClick={() => promoteVersion()}
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
                        onClick={() => setCurrentCommit(null)}
                      >
                        Go back to current
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
