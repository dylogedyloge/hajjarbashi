import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Mic, SendHorizontal, X } from "lucide-react";
import { useReactMediaRecorder } from "react-media-recorder";
import { useTranslations } from 'next-intl';

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob) => Promise<void>;
  disabled?: boolean;
}

export default function VoiceRecorder({ onSendVoice, disabled = false }: VoiceRecorderProps) {
  const t = useTranslations('ChatBox');
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sendingVoice, setSendingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const {
    startRecording,
    stopRecording,
    clearBlobUrl,
  } = useReactMediaRecorder({
    audio: true,
    onStop: (url, blob) => {
      setAudioBlob(blob);
      setAudioUrl(url);
    },
  });

  const handleStartVoice = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecording(true);
    setRecordingTime(0);
    if (recordingInterval.current) clearInterval(recordingInterval.current);
    recordingInterval.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    startRecording();
  };

  const handleStopVoice = () => {
    stopRecording();
    setRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
  };

  const handleSendVoice = async () => {
    if (!audioBlob) return;
    setSendingVoice(true);
    try {
      await onSendVoice(audioBlob);
      setAudioBlob(null);
      setAudioUrl(null);
      clearBlobUrl();
    } catch (error) {
      console.error('Failed to send voice message:', error);
    } finally {
      setSendingVoice(false);
    }
  };

  const handleCancel = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    clearBlobUrl();
  };

  // Reset timer on cancel
  useEffect(() => {
    if (!recording && recordingTime !== 0 && !audioBlob) {
      setRecordingTime(0);
    }
  }, [recording, audioBlob, recordingTime]);

  return (
    <div className="flex items-center gap-2 ">
      {/* Idle: show mic button with tooltip */}
      {!recording && !audioBlob && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={handleStartVoice}
              className="shrink-0 "
              disabled={disabled || sendingVoice}
            >
              <Mic className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('sendVoiceMessage')}</TooltipContent>
        </Tooltip>
      )}
      
      {/* Recording: show stop button and timer in a Card with tooltip */}
      {recording && (
        <Card className="flex flex-row items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1 animate-pulse mb-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                type="button"
                onClick={handleStopVoice}
                className="shrink-0"
              >
                <Mic className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('stopRecording')}</TooltipContent>
          </Tooltip>
          <span className="font-mono text-xs text-red-600 min-w-[40px] text-center">
            {`${Math.floor(recordingTime / 60).toString().padStart(2, '0')}:${(recordingTime % 60).toString().padStart(2, '0')}`}
          </span>
          <span className="text-xs text-red-400">{t('recording')}</span>
        </Card>
      )}
      
      {/* Preview: show audio player, send/cancel in a Card with tooltips */}
      {audioBlob && audioUrl && !recording && (
        <Card className="flex flex-row items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1 mb-0">
          <audio src={audioUrl} controls className="max-w-[120px]" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                type="button"
                onClick={handleSendVoice}
                className="shrink-0"
                disabled={sendingVoice}
              >
                {sendingVoice ? (
                  <span className="w-5 h-5 animate-spin border-2 border-blue-400 border-t-transparent rounded-full inline-block align-middle" />
                ) : (
                  <SendHorizontal className="w-5 h-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('sendVoiceMessage')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleCancel}
                className="shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('cancel')}</TooltipContent>
          </Tooltip>
        </Card>
      )}
    </div>
  );
} 