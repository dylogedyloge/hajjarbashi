"use client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, ChevronRight } from "lucide-react";

export function AdCreatorCard({
  avatarUrl,
  name,
  company,
  adId,
  onContact,
  onChat,
  onExpress,
}: {
  avatarUrl: string;
  name: string;
  company: string;
  adId: string;
  onContact?: () => void;
  onChat?: () => void;
  onExpress?: () => void;
}) {
  return (
    <Card className="bg-background rounded-xl p-4 flex flex-col gap-3 w-full max-w-md shadow-md">
      <div className="flex items-center gap-3">
        <Avatar className="w-14 h-14">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-foreground leading-tight">{name}</div>
          <div className="text-xs text-muted-foreground truncate">{company}</div>
          <div className="text-xs text-muted-foreground">AD-ID: {adId}</div>
        </div>
        <ChevronRight className="text-muted-foreground" />
      </div>
      <div className="flex gap-2 mt-2">
        <Button
          variant="secondary"
          className="flex-1 flex gap-2 items-center"
          onClick={onContact}
        >
          <Phone size={18} /> Contact Info
        </Button>
        <Button
          variant="destructive"
          className="flex-1 flex gap-2 items-center"
          onClick={onChat}
        >
          <MessageCircle size={18} /> Chat
        </Button>
      </div>
      <Button
        className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white"
        size="lg"
        onClick={onExpress}
      >
        Request Express
      </Button>
    </Card>
  );
} 