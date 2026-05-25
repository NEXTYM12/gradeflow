import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { Loader2, Send, MessageCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: degreeClass } = trpc.analytics.degreeClassification.useQuery();
  const { data: gpaHistory } = trpc.gpa.getHistory.useQuery();
  const aiChatMutation = trpc.ai.chat.useMutation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [loading, user, setLocation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await aiChatMutation.mutateAsync({ message: input });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Failed to get response from AI assistant");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 h-full">
        <div>
          <h1 className="text-4xl font-bold mb-2">AI Academic Assistant</h1>
          <p className="text-muted-foreground">
            Get personalized academic advice based on your performance
          </p>
        </div>

        <Card className="p-6 flex flex-col h-[600px]">
          <ScrollArea className="flex-1 pr-4 mb-6">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Start a conversation with your AI assistant
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ask about GPA improvement, study strategies, or academic
                    goals
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === "user"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-2 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your academics..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </Card>

        {/* Quick Tips */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-accent/10 rounded-lg">
              <p className="font-semibold mb-2">📚 Study Smart</p>
              <p className="text-sm text-muted-foreground">
                Use active recall and spaced repetition for better retention
              </p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg">
              <p className="font-semibold mb-2">⏰ Time Management</p>
              <p className="text-sm text-muted-foreground">
                Break tasks into smaller chunks and use the Pomodoro technique
              </p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg">
              <p className="font-semibold mb-2">🎯 Goal Setting</p>
              <p className="text-sm text-muted-foreground">
                Set SMART goals and track progress regularly
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
