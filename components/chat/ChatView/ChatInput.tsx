import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, SendHorizontal } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useLocaleDirection } from "@/hooks/useLocaleDirection";
import VoiceRecorder from "../VoiceRecorder/VoiceRecorder";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: (e?: React.FormEvent) => void;
  onAttachFile: (file: File) => Promise<void>;
  onSendVoice: (audioBlob: Blob) => Promise<void>;
  uploadingAttachment: boolean;
  attachmentError: string | null;
  connected: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  input,
  onInputChange,
  onSend,
  onAttachFile,
  onSendVoice,
  uploadingAttachment,
  attachmentError,
  connected,
  disabled = false
}: ChatInputProps) {
  const t = useTranslations('ChatBox');
  const { isRTL } = useLocaleDirection();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await onAttachFile(files[0]);
    }
  };

  return (
    <div className="border-t bg-background">
      <form
        className="flex items-center gap-2 p-4"
        onSubmit={onSend}
      >
        {/* File attachment button */}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground transition-colors"
          title={t('attachFile')}
          disabled={uploadingAttachment || disabled}
        >
          {uploadingAttachment ? (
            <div className="w-5 h-5 animate-spin border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleAttach}
          />
        </Button>
        
        {/* Voice recorder */}
        <VoiceRecorder 
          onSendVoice={onSendVoice}
          disabled={uploadingAttachment || disabled}
        />
        
        {/* Error message */}
        {attachmentError && (
          <div className="text-xs text-destructive px-2 py-1 bg-destructive/10 rounded">
            {attachmentError}
          </div>
        )}
        
        {/* Message input */}
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t('typeMessage')}
          className="flex-1  border-1 bg-muted/50 focus:bg-background transition-colors"
          disabled={!connected || disabled}
        />
        
        {/* Send button */}
        <Button
          variant="default"
          type="submit"
          size="icon"
          className=" shrink-0"
          disabled={!connected || !input.trim() || disabled}
          title={t('send')}
        >
          <SendHorizontal className={`w-5 h-5${isRTL ? ' rotate-180' : ''}`} />
        </Button>
      </form>
    </div>
  );
} 