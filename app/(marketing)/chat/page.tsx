"use client";

import { useState, useRef, useEffect } from "react";
import { useOptionalAuth } from "@/lib/use-optional-auth";
import { useChat, type ChatMessage } from "@/lib/use-chat";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import PromptBuilder from "@/components/ai/prompt-builder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Lock, Trash2, StopCircle, Bot, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useOptionalAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Sign in to continue</CardTitle>
          <CardDescription>
            Access AI chat features by signing in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/sign-in?redirect_url=/chat">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc ml-4 my-2 space-y-1 text-sm">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal ml-4 my-2 space-y-1 text-sm">{children}</ol>
                ),
                li: ({ children }) => <li className="text-sm">{children}</li>,
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-background/50 rounded px-1 py-0.5 text-xs font-mono">
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-background/50 rounded p-2 overflow-x-auto my-2">
                      <code className="text-xs font-mono">{children}</code>
                    </pre>
                  );
                },
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
              }}
            >
              {message.content || ""}
            </ReactMarkdown>
            {message.isStreaming && (
              <span className="inline-block animate-pulse text-primary font-bold ml-1">
                |
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [context, setContext] = useState("");

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    stop,
  } = useChat({
    onError: (err) => {
      toast.error(err.message || "Failed to send message");
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (prompt: string) => {
    await sendMessage(prompt, context);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] max-h-[800px] min-h-[500px]">
      {/* Messages Area */}
      <div className="flex-1 min-h-0 mb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
            <p className="text-muted-foreground max-w-md">
              Ask me anything! I can help with questions, explanations, code, and more.
              For video-specific questions, paste a YouTube transcript in the context field.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Controls */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            {isLoading && (
              <Button variant="outline" size="sm" onClick={stop} className="gap-2">
                <StopCircle className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
            Clear chat
          </Button>
        </div>
      )}

      {/* Context Input (collapsible) */}
      <details className="mb-4 group">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
          <span className="group-open:rotate-90 transition-transform">&#9654;</span>
          Add context (optional - paste transcript or background info)
        </summary>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Paste a YouTube transcript or any context here..."
          className="mt-2 w-full h-24 p-3 text-sm rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </details>

      {/* Input Area */}
      <PromptBuilder
        onSubmit={handleSubmit}
        isLoading={isLoading}
        placeholder="Ask me anything..."
      />

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error.message}
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              AI Chat
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Chat with AI
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Ask questions, get explanations, and explore ideas with AI assistance
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <AuthGate>
              <ChatInterface />
            </AuthGate>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
