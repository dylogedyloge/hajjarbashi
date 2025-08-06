import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useTranslations } from 'next-intl';

interface ChatListItemProps {
  conv: any;
  deletingChatId: number | null;
  onSelectChat: (conv: any) => void;
  onDeleteChat: (chatId: number) => void;
}

export default function ChatListItem({
  conv,
  deletingChatId,
  onSelectChat,
  onDeleteChat
}: ChatListItemProps) {
  const t = useTranslations('ChatBox');

  return (
    <div
      className="flex items-center gap-3 p-4 group cursor-pointer hover:bg-muted"
    >
      <div
        className="flex-1 flex items-center gap-3"
        onClick={() => onSelectChat(conv)}
      >
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={conv.avatar} alt={conv.name} />
            <AvatarFallback>{conv?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          {/* Availability dot */}
          <span
            className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-background ${conv.is_online ? "bg-green-500" : "bg-gray-400"}`}
            title={conv.is_online ? t('online') : t('offline')}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{conv.name}</div>
          <div className="text-xs text-muted-foreground truncate">{conv.message || ""}</div>
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {conv.last_message_created_at ? new Date(conv.last_message_created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
        </div>
      </div>
      
      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDeleteChat(conv.id);
            }}
            disabled={deletingChatId === conv.id}
            className="text-destructive focus:text-destructive"
          >
            {deletingChatId === conv.id ? (
              <div className="w-4 h-4 animate-spin border-2 border-destructive border-t-transparent rounded-full mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {t('deleteChat') || 'Delete Chat'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 