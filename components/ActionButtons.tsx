"use client";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useOpenChat } from "@/hooks/useChat";
import { useParams } from "next/navigation";

interface ActionButtonsProps {
  adId: string;
  adCreatorUserId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorCompany: string;
  contactInfo: Array<{ uuid: string; title: string; value: string }>;
  isChatEnabled?: boolean;
  isContactInfoEnabled?: boolean;
  isExpressEnabled?: boolean;
}

export default function ActionButtons({
  adId,
  adCreatorUserId,
  creatorName,
  creatorAvatar,
  creatorCompany,
  contactInfo,
  isChatEnabled = true,
  isContactInfoEnabled = true,
  isExpressEnabled = true,
}: ActionButtonsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { token } = useAuth();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const openChatMutation = useOpenChat();

  const handleContactInfo = () => {
    setDialogOpen(true);
  };

  const handleChat = async () => {
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    openChatMutation.mutate(
      { adId, token, locale },
      {
        onSuccess: () => {
          window.dispatchEvent(new CustomEvent('open-chatbox', {
            detail: {
              userId: adCreatorUserId,
              name: creatorName,
              avatarUrl: creatorAvatar,
              company: creatorCompany,
            },
          }));
        },
        onError: (error) => {
          console.error('Failed to open chat:', error);
        },
      }
    );
  };

  const handleExpress = () => {
    // Express request functionality
    console.log('Express request for ad:', adId);
    // Add your express request logic here
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          className="flex-1 bg-green-100 hover:bg-green-500 text-green-500 hover:text-white border-0"
          onClick={handleContactInfo}
          disabled={!isContactInfoEnabled}
        >
          <Phone className="w-4 h-4 mr-2" />
          Contact Info
        </Button>
        <Button 
          className="flex-1 bg-blue-100 hover:bg-blue-500 text-blue-500 hover:text-white border-0"
          onClick={handleChat}
          disabled={!isChatEnabled}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat
        </Button>
        <Button 
          className="flex-1 bg-orange-100 hover:bg-orange-500 text-orange-500 hover:text-white border-0"
          onClick={handleExpress}
          disabled={!isExpressEnabled}
        >
          <Zap className="w-4 h-4 mr-2" />
          Request Express
        </Button>
      </div>

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
    </>
  );
} 