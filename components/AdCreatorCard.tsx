"use client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, ChevronRight } from "lucide-react";
import { ChatBox } from "./ChatBox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";

interface AdCreatorCardProps {
  avatarUrl: string;
  name: string;
  company: string;
  adId: string;
  adCreatorUserId: string;
  onContact?: () => void;
  onChat?: () => void;
  onExpress?: () => void;
  isChatEnabled?: boolean;
  isContactInfoEnabled?: boolean;
  isExpressEnabled?: boolean;
  contactInfo?: Array<{ uuid: string; title: string; value: string }>;
}

export function AdCreatorCard({
  avatarUrl,
  name,
  company,
  adId,
  adCreatorUserId,
  onContact,
  onChat,
  onExpress,
  isChatEnabled = true,
  isContactInfoEnabled = true,
  isExpressEnabled = true,
  contactInfo = [],
}: AdCreatorCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatId, setChatId] = useState<number | null>(null);
  const [otherUserId, setOtherUserId] = useState<string>("");

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const handleOpenChat = async () => {
    const res = await fetch("https://api.hajjardevs.ir/chats/open", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-lang": "en", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ad_id: adId }),
    });
    const data = await res.json();
    setChatId(data.data.id); // Use data.data.id based on backend response
    setOtherUserId(adCreatorUserId);
    setChatOpen(true);
  };

  return (
    <Card className="bg-background rounded-xl p-4 flex flex-col gap-3 w-full max-w-md shadow-md">
      <div className="flex items-center gap-3">
        <Avatar className="w-14 h-14">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-foreground leading-tight">{name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {company}
          </div>
        </div>
        <ChevronRight className="text-muted-foreground cursor-pointer" />
      </div>
      <div className="flex gap-2 mt-2">
        <Button
          variant="secondary"
          className="flex-1 flex gap-2 items-center cursor-pointer"
          onClick={() => setDialogOpen(true)}
          disabled={!isContactInfoEnabled}
        >
          <Phone size={18} /> Contact Info
        </Button>
        <Button
          variant="destructive"
          className="flex-1 flex gap-2 items-center cursor-pointer"
          onClick={handleOpenChat}
          disabled={!isChatEnabled}
        >
          <MessageCircle size={18} /> Chat
        </Button>
      </div>
      <Button
        className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
        size="lg"
        onClick={onExpress}
        disabled={!isExpressEnabled}
      >
        Request Express
      </Button>

      {/* Contact Info Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Information</DialogTitle>
            <DialogDescription>
              {contactInfo && contactInfo.length === 0
                ? "No contact information available."
                : "Contact details for this user:"}
            </DialogDescription>
            {contactInfo && contactInfo.length > 0 && (
              <ul className="mt-2 space-y-2">
                {contactInfo.map((item) => (
                  <li key={item.uuid} className="flex flex-col">
                    <span className="font-semibold">{item.title}</span>
                    <span className="break-all">{item.value}</span>
                  </li>
                ))}
              </ul>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Chat Widget (bottom-right) */}
      {chatId && otherUserId && (
        <ChatBox
          avatarUrl={avatarUrl}
          name={name}
          company={company}
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          chatId={chatId}
          otherUserId={otherUserId}
        />
      )}
    </Card>
  );
}
