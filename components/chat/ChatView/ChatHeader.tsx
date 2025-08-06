import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Ban, Undo2 } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTranslations } from 'next-intl';
import { useLocaleDirection } from "@/hooks/useLocaleDirection";
import { Conversation } from "@/types/chat";

interface ChatHeaderProps {
  selected: Conversation;
  isOnline: boolean;
  youBlockedUser: boolean;
  userBlockedYou: boolean;
  onBackToList: () => void;
  onClose: () => void;
  onBlockUser: () => void;
  onUnblockUser: () => void;
}

export default function ChatHeader({
  selected,
  isOnline,
  youBlockedUser,
  // userBlockedYou,
  onBackToList,
  onClose,
  onBlockUser,
  onUnblockUser
}: ChatHeaderProps) {
  const t = useTranslations('ChatBox');
  const { isRTL } = useLocaleDirection();

  return (
    <div className="flex items-center gap-3 p-4 border-b bg-background">
      <Button variant="ghost" size="icon" onClick={onBackToList}>
        {isRTL ? (
          <ArrowRight className="w-5 h-5" />
        ) : (
          <ArrowLeft className="w-5 h-5" />
        )}
      </Button>
      <div className="relative">
        <Avatar className="w-10 h-10">
          <AvatarImage src={selected.avatarUrl} alt={selected.name} />
          <AvatarFallback>{selected?.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        {/* Availability dot */}
        <span
          className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-background ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
          title={isOnline ? t('online') : t('offline')}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-lg truncate">{selected.name}</div>
        <div className={`text-xs ${isOnline ? "text-green-600" : "text-gray-400"}`}>
          {isOnline ? t('online') : t('offline')}
        </div>
      </div>
      {/* Block/Unblock Button - Always show, based on youBlockedUser */}
      <Tooltip>
        <TooltipTrigger asChild>
          {youBlockedUser ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onUnblockUser}
              className="shrink-0"
              title="Unblock user"
            >
              <Undo2 className="w-5 h-5 text-green-600" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBlockUser}
              className="shrink-0"
              title="Block user"
            >
              <Ban className="w-5 h-5 text-red-600" />
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent>
          {youBlockedUser ? t('unblockUser') || 'Unblock user' : t('blockUser') || 'Block user'}
        </TooltipContent>
      </Tooltip>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
} 