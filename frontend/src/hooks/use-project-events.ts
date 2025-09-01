import { useEffect, useRef, useCallback } from "react";

export interface ProjectEvent {
  type: string;
  project_id: string;
  new_image_url?: string;
  conversation_id?: string;
  error?: string;
  timestamp: string;
}

interface UseProjectEventsOptions {
  projectId: string | null;
  onDesignComplete?: (imageUrl: string, conversationId: string) => void;
  onDesignError?: (error: string) => void;
  onConnected?: () => void;
}

export function useProjectEvents({
  projectId,
  onDesignComplete,
  onDesignError,
  onConnected,
}: UseProjectEventsOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const getAuthToken = useCallback(() => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];
  }, []);

  const connectToEvents = useCallback(() => {
    if (!projectId) return;

    const token = getAuthToken();
    if (!token) {
      console.warn("No auth token available for SSE connection");
      return;
    }

    try {
      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const sseUrl = `${apiBaseUrl}/home-design/events/${projectId}?token=${encodeURIComponent(token)}`;

      // Create new EventSource connection
      const eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        console.log("SSE connection opened");
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data: ProjectEvent = JSON.parse(event.data);

          switch (data.type) {
            case "connected":
              onConnected?.();
              break;

            case "design_generation_complete":
              if (data.new_image_url && data.conversation_id) {
                onDesignComplete?.(data.new_image_url, data.conversation_id);
              }
              break;

            case "design_generation_error":
              console.error("Design generation error:", data.error);
              onDesignError?.(data.error || "Unknown error occurred");
              break;

            case "keepalive":
              // Keepalive message, no action needed
              break;

            default:
              console.log("Unhandled SSE event type:", data.type);
          }
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        eventSource.close();

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          reconnectAttempts.current++;

          console.log(
            `Attempting to reconnect SSE in ${delay}ms (attempt ${reconnectAttempts.current})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connectToEvents();
          }, delay);
        } else {
          console.error("Max SSE reconnection attempts reached");
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error("Failed to create SSE connection:", error);
    }
  }, [projectId, getAuthToken, onDesignComplete, onDesignError, onConnected]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    reconnectAttempts.current = 0;
  }, []);

  useEffect(() => {
    if (projectId) {
      connectToEvents();
    } else {
      disconnect();
    }

    return disconnect;
  }, [projectId, connectToEvents, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return disconnect;
  }, [disconnect]);

  return {
    disconnect,
    reconnect: connectToEvents,
  };
}
