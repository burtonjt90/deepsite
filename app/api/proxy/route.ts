import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user: any = await isAuthenticated();

  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  const commitId = searchParams.get('commitId');
  const path = searchParams.get('path') || '/';
  
  if (!spaceId) {
    return NextResponse.json({ error: "spaceId parameter required" }, { status: 400 });
  }

  try {
    const spaceDomain = `${spaceId.replace("/", "-")}${commitId !== null? `--rev-${commitId.slice(0, 7)}` : ""}.static.hf.space`;
    const targetUrl = `https://${spaceDomain}${path}`;
        
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': req.headers.get('user-agent') || '',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch from HF space:', response.status, response.statusText);
      return NextResponse.json({ 
        error: "Failed to fetch content", 
        details: `${response.status} ${response.statusText}`,
        targetUrl 
      }, { status: response.status });
    }

    let content = await response.text();
    const contentType = response.headers.get('content-type') || 'text/html';

    // Rewrite relative URLs to go through the proxy
    if (contentType.includes('text/html')) {
      const baseUrl = `https://${spaceDomain}`;
      
      // Fix relative URLs in href attributes
      content = content.replace(/href="([^"]+)"/g, (match, url) => {
        if (url.startsWith('/') && !url.startsWith('//')) {
          // Relative URL starting with /
          return `href="${baseUrl}${url}"`;
        } else if (!url.includes('://') && !url.startsWith('#') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
          // Relative URL not starting with /
          return `href="${baseUrl}/${url}"`;
        }
        return match;
      });
      
      // Fix relative URLs in src attributes
      content = content.replace(/src="([^"]+)"/g, (match, url) => {
        if (url.startsWith('/') && !url.startsWith('//')) {
          return `src="${baseUrl}${url}"`;
        } else if (!url.includes('://')) {
          return `src="${baseUrl}/${url}"`;
        }
        return match;
      });
      
      // Add base tag to ensure relative URLs work correctly
      const baseTag = `<base href="${baseUrl}/">`;
      if (content.includes('<head>')) {
        content = content.replace('<head>', `<head>${baseTag}`);
      } else if (content.includes('<html>')) {
        content = content.replace('<html>', `<html><head>${baseTag}</head>`);
      } else {
        content = `<head>${baseTag}</head>` + content;
      }
    }

    const injectedScript = `
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
            // Only prevent default if edit mode is enabled
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
            } else {
              // In non-edit mode, handle link clicks to maintain proxy context
              const link = event.target.closest('a');
              if (link && link.href) {
                event.preventDefault();
                
                const url = new URL(link.href);
                
                // If it's an external link (different domain than the space), open in new tab
                if (url.hostname !== '${spaceDomain}') {
                  window.open(link.href, '_blank');
                } else {
                  // For internal links within the space, navigate through the proxy
                  // Extract the path and query parameters from the original link
                  const targetPath = url.pathname + url.search + url.hash;
                  
                  // Get current proxy URL parameters
                  const currentUrl = new URL(window.location.href);
                  const spaceId = currentUrl.searchParams.get('spaceId') || '';
                  const commitId = currentUrl.searchParams.get('commitId') || '';
                  
                  // Construct new proxy URL with the target path
                  const proxyUrl = '/api/proxy/?' + 
                    'spaceId=' + encodeURIComponent(spaceId) +
                    (commitId ? '&commitId=' + encodeURIComponent(commitId) : '') +
                    '&path=' + encodeURIComponent(targetPath);
                  
                  // Navigate to the new URL through the parent window
                  parent.postMessage({
                    type: 'NAVIGATE_TO_PROXY',
                    data: {
                      proxyUrl: proxyUrl,
                      targetPath: targetPath
                    }
                  }, '*');
                }
              }
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
    
    let modifiedContent;
    if (content.includes('</body>')) {
      modifiedContent = content.replace(
        /<\/body>/i,
        `${injectedScript}</body>`
      );
    } else {
      modifiedContent = content + injectedScript;
    }
    
    return new NextResponse(modifiedContent, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ 
      error: "Proxy request failed", 
      details: error instanceof Error ? error.message : String(error),
      spaceId 
    }, { status: 500 });
  }
}
