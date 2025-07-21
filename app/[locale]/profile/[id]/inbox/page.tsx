"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChatBox } from "@/components/ChatBox";

// Types
export type Conversation = {
  id: number; // chat_id
  ad_id: string;
  other_user: { id: string; name: string; avatarUrl: string; company: string };
  lastMessage: string;
  lastTime: string;
};

export type ChatMessage = {
  id: number;
  chat_id: number;
  sender_id: string;
  message: string;
  time: string;
  attachments?: string[];
  self?: boolean;
};

export default function InboxPage() {
  const params = useParams();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        const res = await fetch(`https://api.hajjardevs.ir/chats?limit=20&page=1`, {
          headers: { Authorization: `Bearer ${token}`, "x-lang": "en" },
        });
        if (!res.ok) throw new Error("Failed to fetch chats");
        const data = await res.json();
        // Adjust this based on your backend's response structure
        setConversations(data.chats || data.results || []);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Unknown error");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="secondary" onClick={() => router.push(`/profile/${params.id}/overview`)}>
          Back to Profile
        </Button>
        <h1 className="text-2xl font-bold flex-1">Inbox</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Conversation List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-muted-foreground">No conversations yet.</div>
          ) : (
            conversations.map((conv) => (
              <Card
                key={conv.id}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted ${activeChat?.id === conv.id ? "border-blue-500 border-2" : ""}`}
                onClick={() => setActiveChat(conv)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={conv.other_user.avatarUrl} alt={conv.other_user.name} />
                  <AvatarFallback>{conv.other_user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{conv.other_user.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{conv.lastMessage}</div>
                </div>
                <div className="text-xs text-muted-foreground">{conv.lastTime}</div>
              </Card>
            ))
          )}
        </div>
        {/* ChatBox */}
        <div>
          {activeChat ? (
            <ChatBox
              avatarUrl={activeChat.other_user.avatarUrl}
              name={activeChat.other_user.name}
              company={activeChat.other_user.company}
              open={true}
              onClose={() => setActiveChat(null)}
              chatId={activeChat.id}
              otherUserId={activeChat.other_user.id}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="flex flex-col items-center justify-center">
                <div className="text-2xl font-bold">No conversations yet</div>
                <div className="text-sm text-muted-foreground">Select a conversation to start chatting</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 