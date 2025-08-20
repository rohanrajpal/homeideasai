"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, Upload, Image as ImageIcon, MessageCircle } from "lucide-react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { useUser } from "@/components/user-context";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

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

export function HomeDesigner() {
  const { creditsAvailable, refreshUserData } = useUser();
  const [currentProject, setCurrentProject] = useState<HomeProject | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload image to backend
      const uploadResponse = await fetch("/api/py/home-design/upload-image", {
        method: "POST",
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
      setCurrentProject(project);

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentProject || isLoading) return;

    if (creditsAvailable <= 0) {
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

    try {
      const response = await fetch("/api/py/home-design/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: currentProject.id,
          message: inputMessage.trim(),
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Update conversation ID
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message.content,
        timestamp: new Date(),
        imageUrl: data.image_url,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update current project image if a new one was generated
      if (data.image_url) {
        setCurrentProject((prev) =>
          prev
            ? {
                ...prev,
                currentImageUrl: data.image_url,
              }
            : null
        );
      }

      refreshUserData();
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
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
    <div className="h-screen bg-background">
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">HomeIdeasAI Designer</h1>
          {currentProject && (
            <span className="text-sm text-muted-foreground">
              {currentProject.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
            <span className="text-sm font-medium">Credits:</span>
            <span className="text-sm font-bold">{creditsAvailable}</span>
          </div>
          {creditsAvailable <= 10 && (
            <Button asChild size="sm">
              <a href="/pricing">Upgrade</a>
            </Button>
          )}
        </div>
      </div>

      {!currentProject ? (
        // Upload interface
        <div className="flex items-center justify-center h-full p-8">
          <Card className="max-w-md w-full p-8 text-center">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Your Space</h3>
              <p className="text-muted-foreground mb-4">
                {isDragActive
                  ? "Drop your image here..."
                  : "Drag and drop an image of your room, or click to select"}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG, WebP files
              </p>
            </div>
            {isLoading && (
              <div className="mt-4">
                <div className="animate-pulse text-sm text-muted-foreground">
                  Uploading and creating your project...
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : (
        // Canvas-style interface
        <PanelGroup direction="horizontal" className="h-full">
          {/* Chat Panel */}
          <Panel defaultSize={40} minSize={30}>
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="border-b p-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <h2 className="font-semibold">Design Chat</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Describe what you'd like to change
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Describe what you'd like to change..."
                    className="min-h-[60px] resize-none"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="icon"
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle />

          {/* Image Panel */}
          <Panel defaultSize={60} minSize={40}>
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
                <div className="relative max-w-full max-h-full">
                  <img
                    src={currentProject.currentImageUrl}
                    alt="Your space design"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>

              {/* Image Actions */}
              <div className="border-t p-4">
                <div className="flex gap-2">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Reset to original
                      setCurrentProject((prev) =>
                        prev
                          ? {
                              ...prev,
                              currentImageUrl: prev.originalImageUrl,
                            }
                          : null
                      );
                    }}
                  >
                    Reset to Original
                  </Button>
                </div>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      )}
    </div>
  );
}
