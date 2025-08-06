import { useTranslations } from 'next-intl';
import { Message } from "@/types/chat";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { File } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  senderName: string;
}

export default function MessageBubble({ message, senderName }: MessageBubbleProps) {
  const t = useTranslations('ChatBox');
  const isMe = message.sender === "me";

  const getAttachmentUrl = (attachment: string) => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.10.6:3001';
    return `${apiBaseUrl}/${attachment}`;
  };

  return (
    <div className={`flex w-full mb-4 ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
        {/* Message bubble */}
        <Card className={`px-4 py-3 shadow-sm border-0 ${
          isMe 
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md" 
            : "bg-muted text-foreground rounded-2xl rounded-bl-md"
        }`}>
          {message.text && (
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message.text}
            </p>
          )}
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((att, i) => {
                const url = typeof att === 'string' ? getAttachmentUrl(att) : '#';
                const filename = typeof att === 'string' ? att.split('/').pop() : att.name || 'Attachment';
                const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'webm'];
                const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
                const ext = filename.split('.').pop()?.toLowerCase();
                
                if (audioExts.includes(ext || '')) {
                  return (
                    <div key={i} className="flex flex-col items-start w-full">
                      <audio
                        src={url}
                        controls
                        className="max-w-[200px] h-8"
                        style={{
                          background: 'none',
                          boxShadow: 'none',
                          border: 'none',
                        }}
                      />
                    </div>
                  );
                }
                
                if (imageExts.includes(ext || '')) {
                  return (
                    <div key={i} className="flex flex-col items-start w-full">
                      <div className="relative group">
                        <img
                          src={url}
                          alt={filename}
                          className="max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(url, '_blank')}
                        />
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={i} className="flex flex-col items-start w-full">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {t('file') || 'File'}
                    </Badge>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 text-xs underline hover:no-underline transition-all p-2 rounded border ${
                        isMe ? "text-primary-foreground/80 border-primary-foreground/20" : "text-muted-foreground border-muted-foreground/20"
                      }`}
                    >
                      <File className="w-4 h-4" />
                      <span className="truncate max-w-[150px]">{filename}</span>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        
        {/* Message metadata */}
        <div className={`flex items-center gap-2 mt-2 text-xs ${
          isMe ? "text-muted-foreground" : "text-muted-foreground"
        }`}>
          <span className="font-medium">
            {isMe ? t('you') : senderName}
          </span>
          <span>•</span>
          <span>
            {message.time 
              ? new Date(message.time).toLocaleTimeString([], { 
                  hour: "2-digit", 
                  minute: "2-digit" 
                })
              : ""
            }
          </span>
          {isMe && message.seen && (
            <>
              <span>•</span>
              <span className="text-green-500">✓✓</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 