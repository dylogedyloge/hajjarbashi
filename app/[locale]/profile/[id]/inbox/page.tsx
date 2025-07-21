"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChatBox } from "@/components/ChatBox";

// Mock conversations data
const mockConversations = [
  {
    id: "userB",
    name: "User B",
    company: "Company B",
    avatarUrl: "/public/logo-1.svg",
    lastMessage: "Hi, I am interested in your ad.",
    lastTime: "09:01",
  },
  {
    id: "userC",
    name: "User C",
    company: "Company C",
    avatarUrl: "/public/logo-2.svg",
    lastMessage: "Can you send more details?",
    lastTime: "10:15",
  },
];

export default function InboxPage() {
  const params = useParams();
  const router = useRouter();
  const [activeChat, setActiveChat] = useState<any | null>(null);

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
          {mockConversations.map((conv) => (
            <Card
              key={conv.id}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted ${activeChat?.id === conv.id ? "border-blue-500 border-2" : ""}`}
              onClick={() => setActiveChat(conv)}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={conv.avatarUrl} alt={conv.name} />
                <AvatarFallback>{conv.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{conv.name}</div>
                <div className="text-xs text-muted-foreground truncate">{conv.lastMessage}</div>
              </div>
              <div className="text-xs text-muted-foreground">{conv.lastTime}</div>
            </Card>
          ))}
        </div>
        {/* ChatBox */}
        <div>
          {activeChat ? (
            <ChatBox
              avatarUrl={activeChat.avatarUrl}
              name={activeChat.name}
              company={activeChat.company}
              open={true}
              onClose={() => setActiveChat(null)}
            />
          ) : (
            // <div className="flex items-center justify-center h-full text-muted-foreground">Select a conversation to start chatting</div>
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