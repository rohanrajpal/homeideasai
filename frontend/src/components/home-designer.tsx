"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Upload,
  Image as ImageIcon,
  MessageCircle,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { useUser } from "@/components/user-context";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useProjectEvents } from "@/hooks/use-project-events";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

interface HomeProject {
  id: string;
  name: string;
  originalImageUrl: string;
  currentImageUrl: string;
  description?: string;
  roomType?: string;
  stylePreference?: string;
}

interface HomeDesignerProps {
  projectId?: string;
}

export function HomeDesigner({ projectId }: HomeDesignerProps = {}) {
  const { creditsAvailable, refreshUserData } = useUser();
  const router = useRouter();
  const [currentProject, setCurrentProject] = useState<HomeProject | null>(
    null
  );
  const [pastProjects, setPastProjects] = useState<HomeProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<HomeProject | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [viewingOriginal, setViewingOriginal] = useState(false);
  const [lastUpdatedImageUrl, setLastUpdatedImageUrl] = useState<string | null>(
    null
  );
  const [designAnalysis, setDesignAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showGeneratePrompt, setShowGeneratePrompt] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [isProcessingDesign, setIsProcessingDesign] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analysisInitiatedRef = useRef<Set<string>>(new Set());

  // Helper function to get authentication token
  const getAuthToken = useCallback(() => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];
  }, []);

  // Analyze image for design options
  const analyzeImageForDesign = useCallback(
    async (projectId: string) => {
      try {
        setIsAnalyzing(true);
        const token = getAuthToken();
        if (!token) {
          toast.error("Authentication required. Please log in again.");
          return;
        }

        const response = await fetch("/api/py/home-design/analyze-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ project_id: projectId }),
        });

        if (!response.ok) {
          let errorMessage = "Failed to analyze image. Please try again.";

          try {
            const errorData = await response.json();
            if (response.status === 404) {
              errorMessage =
                "Project not found. Please refresh the page and try again.";
            } else if (response.status === 500) {
              errorMessage =
                "Server error during analysis. Please try again in a moment.";
              if (errorData.detail) {
                console.error("Server error details:", errorData.detail);
              }
            } else if (errorData.detail) {
              errorMessage = `Analysis failed: ${errorData.detail}`;
            }
          } catch (parseError) {
            console.error("Error parsing error response:", parseError);
          }

          throw new Error(errorMessage);
        }

        const analysis = await response.json();
        setDesignAnalysis(analysis);

        // Add analysis message to chat
        const analysisMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: `${analysis.analysis}\n\nI've identified several design directions that would transform your space. Choose one that appeals to you:`,
          timestamp: new Date(),
        };
        setMessages([analysisMessage]);
      } catch (error) {
        console.error("Analysis error:", error);
        console.error("Project ID:", projectId);
        console.error("Auth token present:", !!getAuthToken());

        let errorMessage = "Failed to analyze image. Please try again.";

        if (error instanceof TypeError && error.message.includes("fetch")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);

        // Add fallback welcome message with helpful context
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Welcome! I'm having trouble analyzing your image right now, but I can still help you transform your space. Please describe what you'd like to change or improve, and I'll do my best to assist you.",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [getAuthToken]
  );

  // Load conversations for a project
  const loadProjectConversations = useCallback(
    async (projectId: string) => {
      try {
        setLoadingConversations(true);
        const token = getAuthToken();
        if (!token) {
          console.warn("No auth token available for loading conversations");
          return [];
        }

        const response = await fetch(
          `/api/py/home-design/conversations/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            console.log("No conversations found for project");
            return [];
          }
          throw new Error("Failed to load conversations");
        }

        const conversations = await response.json();
        console.log(`Loaded ${conversations.length} conversations for project`);

        return conversations;
      } catch (error) {
        console.error("Failed to load conversations:", error);
        return [];
      } finally {
        setLoadingConversations(false);
      }
    },
    [getAuthToken]
  );

  // Load all user projects
  const loadPastProjects = useCallback(async () => {
    try {
      setLoadingProjects(true);
      const token = getAuthToken();
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        router.push("/login");
        return;
      }

      const response = await fetch("/api/py/home-design/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load projects");
      }

      const projects = await response.json();

      // Convert snake_case to camelCase for frontend compatibility
      const formattedProjects: HomeProject[] = projects.map((project: any) => ({
        id: project.id,
        name: project.name,
        originalImageUrl: project.original_image_url,
        currentImageUrl: project.current_image_url,
        description: project.description,
        roomType: project.room_type,
        stylePreference: project.style_preference,
      }));

      setPastProjects(formattedProjects);
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast.error("Failed to load projects. Please try again.");
    } finally {
      setLoadingProjects(false);
    }
  }, [getAuthToken, router]);

  // Load existing project
  const loadProject = useCallback(
    async (id: string) => {
      try {
        const token = getAuthToken();
        if (!token) {
          toast.error("Authentication required. Please log in again.");
          router.push("/login");
          return;
        }

        const response = await fetch(`/api/py/home-design/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load project");
        }

        const project = await response.json();

        // Convert snake_case to camelCase for frontend compatibility
        const formattedProject: HomeProject = {
          id: project.id,
          name: project.name,
          originalImageUrl: project.original_image_url,
          currentImageUrl: project.current_image_url,
          description: project.description,
          roomType: project.room_type,
          stylePreference: project.style_preference,
        };

        setCurrentProject(formattedProject);

        // Check if this project has been updated (current differs from original)
        if (
          formattedProject.currentImageUrl !== formattedProject.originalImageUrl
        ) {
          setLastUpdatedImageUrl(formattedProject.currentImageUrl);
          setViewingOriginal(false);
        } else {
          setLastUpdatedImageUrl(null);
          setViewingOriginal(false);
        }

        // Load existing conversations for this project
        const conversations = await loadProjectConversations(
          formattedProject.id
        );

        if (conversations.length > 0) {
          // Use the most recent conversation (first in array since backend orders by updated_at desc)
          const latestConversation = conversations[0];
          setConversationId(latestConversation.id);

          // Restore messages from the conversation
          if (
            latestConversation.messages &&
            Array.isArray(latestConversation.messages)
          ) {
            const chatMessages: ChatMessage[] = latestConversation.messages.map(
              (msg: any, index: number) => ({
                id: `${latestConversation.id}-${index}`,
                role: msg.role as "user" | "assistant",
                content: msg.content,
                timestamp: new Date(
                  msg.timestamp || latestConversation.updated_at
                ),
                imageUrl: msg.image_url,
              })
            );
            setMessages(chatMessages);
            console.log(
              `Restored ${chatMessages.length} messages from existing conversation`
            );
          }
        } else {
          // No existing conversations, reset state
          setConversationId(null);
          setMessages([]);

          // For existing projects without conversations, show analysis options
          // Only trigger analysis if it hasn't been initiated for this project yet
          if (!analysisInitiatedRef.current.has(formattedProject.id)) {
            analysisInitiatedRef.current.add(formattedProject.id);
            analyzeImageForDesign(formattedProject.id);
          }
        }
      } catch (error) {
        console.error("Failed to load project:", error);
        toast.error("Failed to load project. Please try again.");
        router.push("/workspace");
      }
    },
    [getAuthToken, router, analyzeImageForDesign, loadProjectConversations]
  );

  // Delete project
  const deleteProject = async (project: HomeProject) => {
    try {
      setIsDeleting(true);
      const token = getAuthToken();
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        router.push("/login");
        return;
      }

      const response = await fetch(
        `/api/py/home-design/projects/${project.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Project not found. It may have been already deleted.");
        } else {
          throw new Error("Failed to delete project");
        }
      } else {
        toast.success(`"${project.name}" has been deleted.`);
      }

      // Remove from local state
      setPastProjects((prev) => prev.filter((p) => p.id !== project.id));

      // If we're currently viewing the deleted project, redirect to workspace
      if (currentProject?.id === project.id) {
        router.push("/workspace");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
      setOpenDropdownId(null); // Close any open dropdowns
    }
  };

  // Handle real-time design completion events
  const handleDesignComplete = useCallback(
    (imageUrl: string, conversationId: string) => {
      console.log("Design completed via SSE:", imageUrl);
      setIsProcessingDesign(false);
      setIsLoading(false);

      // Update current project image
      setLastUpdatedImageUrl(imageUrl);
      setCurrentProject((prev) =>
        prev
          ? {
              ...prev,
              currentImageUrl: imageUrl,
            }
          : null
      );
      setViewingOriginal(false);

      // Update the conversation messages to include the image
      setMessages((prev) => {
        const updatedMessages = [...prev];
        // Find the last assistant message and update it with the image
        for (let i = updatedMessages.length - 1; i >= 0; i--) {
          if (updatedMessages[i].role === "assistant") {
            updatedMessages[i] = {
              ...updatedMessages[i],
              imageUrl,
            };
            break;
          }
        }
        return updatedMessages;
      });

      // Clear design analysis since we've generated a design
      setDesignAnalysis(null);
      setSelectedOption(null);
      setShowGeneratePrompt(false);

      toast.success("🎨 Design transformation complete!");
      refreshUserData();
    },
    [refreshUserData]
  );

  const handleDesignError = useCallback((error: string) => {
    console.error("Design generation error via SSE:", error);
    setIsProcessingDesign(false);
    setIsLoading(false);

    toast.error(`Design generation failed: ${error}`);

    // Add error message to chat
    const errorMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: `I'm sorry, but I encountered an issue generating your design: ${error}. Please try again or try a different approach.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, errorMessage]);
  }, []);

  // Set up SSE connection for real-time updates
  useProjectEvents({
    projectId: currentProject?.id || null,
    onDesignComplete: handleDesignComplete,
    onDesignError: handleDesignError,
  });

  // Load project if projectId is provided, otherwise load past projects
  useEffect(() => {
    if (projectId && !currentProject) {
      loadProject(projectId);
    } else if (!projectId) {
      loadPastProjects();
    }
  }, [projectId, currentProject, loadProject, loadPastProjects]);

  // Image upload functionality
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload image to backend
      const uploadResponse = await fetch("/api/py/home-design/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const { image_url } = await uploadResponse.json();

      // Create a new project
      const projectResponse = await fetch("/api/py/home-design/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `New Project - ${new Date().toLocaleDateString()}`,
          original_image_url: image_url,
          description: "Uploaded via HomeIdeasAI",
        }),
      });

      if (!projectResponse.ok) {
        throw new Error("Failed to create project");
      }

      const project = await projectResponse.json();
      // Convert snake_case to camelCase for frontend compatibility
      const formattedProject: HomeProject = {
        id: project.id,
        name: project.name,
        originalImageUrl: project.original_image_url,
        currentImageUrl: project.current_image_url,
        description: project.description,
        roomType: project.room_type,
        stylePreference: project.style_preference,
      };
      setCurrentProject(formattedProject);

      // Update URL to include project ID (use replace to avoid back button confusion)
      router.replace(`/design/${formattedProject.id}`);

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Great! I can see your space. What would you like to change or improve? I can help you with interior design, colors, furniture placement, lighting, and more!",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);

      toast.success("Image uploaded successfully! Ready to start designing.");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: false,
  });

  // Helper function to send a message directly without using input state
  const sendDirectMessage = async (message: string) => {
    if (!message.trim() || !currentProject || isLoading) return;

    if (creditsAvailable !== null && creditsAvailable <= 0) {
      toast.error("Insufficient credits. Please upgrade your plan.");
      return;
    }

    setIsLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/py/home-design/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: currentProject.id,
          message: message.trim(),
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to send message. Please try again.";

        try {
          const errorData = await response.json();
          if (response.status === 400) {
            if (errorData.detail?.includes("Insufficient credits")) {
              errorMessage =
                "You don't have enough credits. Please upgrade your plan.";
            } else if (errorData.detail?.includes("content_policy_violation")) {
              errorMessage =
                "Content policy violation detected. Please rephrase your request.";
            } else {
              errorMessage =
                errorData.detail || "Invalid request. Please try again.";
            }
          } else if (response.status === 404) {
            errorMessage = "Project not found. Please refresh and try again.";
          } else if (response.status >= 500) {
            errorMessage = "Server error. Please try again in a moment.";
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }

        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      // Update conversation ID
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // Handle queued design generation
      if (data.type === "design_generation_queued" && data.processing) {
        setIsProcessingDesign(true);

        // Add assistant response indicating processing
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Don't set isLoading to false here - keep it true until SSE completes
      } else {
        // Regular response
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message.content,
          timestamp: new Date(),
          imageUrl: data.image_url,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }

      // Update current project image if a new one was generated
      if (data.image_url) {
        setLastUpdatedImageUrl(data.image_url);
        setCurrentProject((prev) =>
          prev
            ? {
                ...prev,
                currentImageUrl: data.image_url,
              }
            : null
        );
        setViewingOriginal(false);

        toast.success("Design updated successfully!");
      }

      // Set loading to false for non-processing responses
      if (data.type !== "design_generation_queued") {
        setIsLoading(false);
      }

      refreshUserData();
    } catch (error) {
      console.error("Chat error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        toast.error("Something went wrong. Please try again in a moment.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentProject || isLoading) return;

    if (creditsAvailable !== null && creditsAvailable <= 0) {
      toast.error("Insufficient credits. Please upgrade your plan.");
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Clear design analysis options when user sends custom message
    setDesignAnalysis(null);
    setSelectedOption(null);
    setShowGeneratePrompt(false);

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        setIsLoading(false);
        // Remove the user message since the request failed
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      const response = await fetch("/api/py/home-design/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: currentProject.id,
          message: inputMessage.trim(),
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to send message. Please try again.";

        try {
          const errorData = await response.json();
          if (response.status === 400) {
            if (errorData.detail?.includes("Insufficient credits")) {
              errorMessage =
                "You don't have enough credits. Please upgrade your plan.";
            } else if (errorData.detail?.includes("content_policy_violation")) {
              errorMessage =
                "Content policy violation detected. Please rephrase your request.";
            } else {
              errorMessage =
                errorData.detail || "Invalid request. Please try again.";
            }
          } else if (response.status === 404) {
            errorMessage = "Project not found. Please refresh and try again.";
          } else if (response.status >= 500) {
            errorMessage = "Server error. Please try again in a moment.";
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }

        // Remove the user message since the request failed
        setMessages((prev) => prev.slice(0, -1));
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      // Update conversation ID
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // Check if response contains design options
      if (data.type === "design_options" && data.options) {
        // Set design analysis to show options
        setDesignAnalysis({
          analysis: data.message.content,
          options: data.options,
        });

        // Add assistant response with the analysis message
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else if (data.type === "design_generation_queued" && data.processing) {
        // Design generation is queued - set processing state
        setIsProcessingDesign(true);

        // Add assistant response indicating processing
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Don't set isLoading to false here - keep it true until SSE completes
      } else {
        // Regular assistant response
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message.content,
          timestamp: new Date(),
          imageUrl: data.image_url,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Only set loading to false for non-queued responses
        if (data.type !== "design_generation_queued") {
          setIsLoading(false);
        }
      }

      // Update current project image if a new one was generated
      if (data.image_url) {
        setLastUpdatedImageUrl(data.image_url); // Store the updated image URL
        setCurrentProject((prev) =>
          prev
            ? {
                ...prev,
                currentImageUrl: data.image_url,
              }
            : null
        );
        setViewingOriginal(false); // We're now viewing the updated version

        // Clear design analysis since we've generated a design
        setDesignAnalysis(null);
        setSelectedOption(null);
        setShowGeneratePrompt(false);

        // Show success message for image edits
        toast.success("Design updated successfully!");
        setIsLoading(false);
      }

      // Set loading to false for non-processing responses
      if (data.type !== "design_generation_queued") {
        setIsLoading(false);
      }

      refreshUserData();
    } catch (error) {
      console.error("Chat error:", error);

      // Remove the user message since the request failed
      setMessages((prev) => prev.slice(0, -1));

      // Show user-friendly error message
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        toast.error("Something went wrong. Please try again in a moment.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">
            HomeIdeasAI Design Workspace
          </h1>
          {currentProject && (
            <span className="text-sm text-muted-foreground">
              {currentProject.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
            <span className="text-sm font-medium">Credits:</span>
            <span className="text-sm font-bold">
              {creditsAvailable ?? "..."}
            </span>
          </div>
          {creditsAvailable !== null && creditsAvailable <= 10 && (
            <Button asChild size="sm">
              <a href="/pricing">Upgrade</a>
            </Button>
          )}
        </div>
      </div>

      {!currentProject ? (
        // Projects dashboard with upload interface
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Upload interface */}
            <Card className="p-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? "border-primary bg-primary/5 scale-105"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/20"
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Create New Project
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {isDragActive
                      ? "Drop your image here..."
                      : "Drag and drop an image of your room, or click to select"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports JPG, PNG, WebP files
                  </p>
                </div>
              </div>
              {isLoading && (
                <div className="mt-4 text-center">
                  <div className="animate-pulse text-sm text-muted-foreground">
                    Uploading and creating your project...
                  </div>
                </div>
              )}
            </Card>

            {/* Past projects */}
            {loadingProjects ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-sm text-muted-foreground">
                  Loading your projects...
                </div>
              </div>
            ) : pastProjects.length > 0 ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="group relative hover:shadow-md transition-shadow"
                    >
                      {/* Project Actions */}
                      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu
                          open={openDropdownId === project.id}
                          onOpenChange={(open) =>
                            setOpenDropdownId(open ? project.id : null)
                          }
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setProjectToDelete(project);
                                setOpenDropdownId(null); // Close dropdown
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Project Content */}
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          // Close any open dropdown first, then navigate
                          setOpenDropdownId(null);
                          router.push(`/design/${project.id}`);
                        }}
                      >
                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={project.currentImageUrl}
                            alt={project.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = project.originalImageUrl;
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-sm mb-1 truncate">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                          <div className="flex gap-2 text-xs">
                            {project.roomType && (
                              <span className="bg-secondary px-2 py-1 rounded">
                                {project.roomType}
                              </span>
                            )}
                            {project.stylePreference && (
                              <span className="bg-secondary px-2 py-1 rounded">
                                {project.stylePreference}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground">
                  Upload your first room image to get started with AI-powered
                  interior design!
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Canvas-style interface
        <div className="flex-1 min-h-0">
          <PanelGroup direction="horizontal" className="h-full">
            {/* Chat Panel */}
            <Panel defaultSize={50} minSize={35}>
              <div className="flex flex-col h-full bg-gray-50 relative">
                {/* Chat Header */}
                <div className="border-b bg-white p-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Design Chat</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Describe what you&apos;d like to change
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
                  {loadingConversations && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-lg p-4 bg-white border shadow-sm mr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                            AI
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Design Assistant
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Loading conversation history...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-lg p-4 bg-white border shadow-sm mr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                            AI
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Design Analyzer
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Analyzing your space...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-4 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground ml-4"
                            : "bg-white border shadow-sm mr-4"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                              AI
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Design Assistant
                            </span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <div className="text-xs text-muted-foreground mt-2">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Design Options */}
                  {designAnalysis && designAnalysis.options && (
                    <div className="flex justify-start">
                      <div className="max-w-[90%] rounded-lg p-4 bg-white border shadow-sm mr-4">
                        <div className="space-y-3">
                          {designAnalysis.options.map(
                            (option: any, index: number) => (
                              <div
                                key={index}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                  selectedOption === option.name
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => {
                                  setSelectedOption(option.name);
                                  setShowGeneratePrompt(true);
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 mt-1 ${
                                      selectedOption === option.name
                                        ? "border-primary bg-primary"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {selectedOption === option.name && (
                                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm">
                                      {option.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {option.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {option.key_changes.map(
                                        (change: string, i: number) => (
                                          <span
                                            key={i}
                                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                          >
                                            {change}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>

                        {showGeneratePrompt && selectedOption && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium mb-2">
                              Ready to transform your space with{" "}
                              {selectedOption}?
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={async () => {
                                  if (isLoading || !currentProject) return;

                                  const generateMessage = `Generate ${selectedOption} design transformation`;
                                  setShowGeneratePrompt(false);
                                  setDesignAnalysis(null);

                                  // Add user selection message
                                  const userMessage: ChatMessage = {
                                    id: Date.now().toString(),
                                    role: "user",
                                    content: `I want to transform my space with ${selectedOption}`,
                                    timestamp: new Date(),
                                  };
                                  setMessages((prev) => [...prev, userMessage]);

                                  // Send the generation message directly without using input state
                                  await sendDirectMessage(generateMessage);
                                }}
                              >
                                Yes, Generate Design
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedOption(null);
                                  setShowGeneratePrompt(false);
                                }}
                              >
                                Choose Different Style
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(isLoading || isProcessingDesign) && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-lg p-4 bg-white border shadow-sm mr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                            AI
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Design Assistant
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {isProcessingDesign
                              ? "🎨 Generating your design transformation..."
                              : "Creating your design..."}
                          </span>
                        </div>
                        {isProcessingDesign && (
                          <div className="mt-2 text-xs text-blue-600 font-medium">
                            ✨ AI is transforming your space - this usually
                            takes 30-60 seconds
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t bg-white p-4 flex-shrink-0">
                  <div className="flex gap-3 items-end w-full">
                    <div className="flex-1 min-w-0">
                      <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={
                          creditsAvailable === null
                            ? "Loading..."
                            : creditsAvailable !== null && creditsAvailable <= 0
                              ? "Insufficient credits. Please upgrade your plan to continue."
                              : !currentProject
                                ? "Please upload an image first..."
                                : designAnalysis && designAnalysis.options
                                  ? "Choose a design style above, or describe your own ideas..."
                                  : "Describe what you'd like to change about this space..."
                        }
                        className="w-full min-h-[60px] max-h-[120px] resize-none border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-lg px-3 py-3 text-sm placeholder:text-gray-500"
                        disabled={
                          isLoading ||
                          !currentProject ||
                          creditsAvailable === null ||
                          (creditsAvailable !== null && creditsAvailable <= 0)
                        }
                      />
                    </div>
                    <Button
                      data-send-button
                      onClick={handleSendMessage}
                      disabled={
                        !inputMessage.trim() ||
                        isLoading ||
                        !currentProject ||
                        creditsAvailable === null ||
                        (creditsAvailable !== null && creditsAvailable <= 0)
                      }
                      size="icon"
                      className="h-[60px] w-[60px] flex-shrink-0 bg-primary hover:bg-primary/90 text-white rounded-lg"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle />

            {/* Image Panel */}
            <Panel defaultSize={50} minSize={30}>
              <div className="flex flex-col h-full">
                {/* Image Header */}
                <div className="border-b p-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    <h2 className="font-semibold">Your Design</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Updated in real-time as you chat
                  </p>
                </div>

                {/* Image Display */}
                <div className="flex-1 p-4 flex items-center justify-center bg-muted/20">
                  {currentProject.currentImageUrl ? (
                    <div className="relative w-full h-full max-w-2xl max-h-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentProject.currentImageUrl}
                        alt="Your space design"
                        className={`w-full h-full object-contain rounded-lg shadow-lg transition-opacity ${
                          isProcessingDesign ? "opacity-75" : "opacity-100"
                        }`}
                        onError={(e) => {
                          console.error(
                            "Image failed to load:",
                            currentProject.currentImageUrl
                          );
                        }}
                        onLoad={() => {
                          console.log(
                            "Image loaded successfully:",
                            currentProject.currentImageUrl
                          );
                        }}
                      />

                      {/* Processing Overlay */}
                      {isProcessingDesign && (
                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-lg max-w-sm text-center">
                            <div className="flex items-center justify-center mb-3">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                              </div>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">
                              🎨 Creating Your Design
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              AI is transforming your space
                            </p>
                            <div className="text-xs text-blue-600 font-medium">
                              Usually takes 30-60 seconds
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <div className="animate-pulse">
                        Loading your design...
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Actions */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = currentProject.currentImageUrl;
                          link.download = `home-design-${Date.now()}.png`;
                          link.click();
                        }}
                      >
                        Download
                      </Button>
                      {/* Toggle between original and updated */}
                      {lastUpdatedImageUrl &&
                        lastUpdatedImageUrl !==
                          currentProject.originalImageUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (viewingOriginal) {
                                // Switch back to updated version
                                setCurrentProject((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        currentImageUrl: lastUpdatedImageUrl,
                                      }
                                    : null
                                );
                                setViewingOriginal(false);
                              } else {
                                // Switch to original
                                setCurrentProject((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        currentImageUrl: prev.originalImageUrl,
                                      }
                                    : null
                                );
                                setViewingOriginal(true);
                              }
                            }}
                          >
                            {viewingOriginal
                              ? "Show Updated Design"
                              : "Show Original"}
                          </Button>
                        )}
                      {lastUpdatedImageUrl &&
                        lastUpdatedImageUrl !==
                          currentProject.originalImageUrl && (
                          <div className="flex items-center gap-2 ml-auto">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                viewingOriginal
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-primary text-primary-foreground"
                              }`}
                            >
                              {viewingOriginal ? "Original" : "Updated"}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!projectToDelete}
        onOpenChange={() => {
          setProjectToDelete(null);
          setOpenDropdownId(null); // Also close any open dropdowns
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{projectToDelete?.name}
              &quot;? This action cannot be undone and will permanently remove
              the project and all its chat history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => projectToDelete && deleteProject(projectToDelete)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
