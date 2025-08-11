"use client";

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Paperclip } from "lucide-react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { type Ticket } from "@/lib/profile";

interface SupportChatViewProps {
  ticket: Ticket;
  onBackToList: () => void;
  onSendMessage: (message: string) => void;
}

const SupportChatView: React.FC<SupportChatViewProps> = ({
  ticket,
  onBackToList,
  onSendMessage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messageText, setMessageText] = useState('');

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    onSendMessage(messageText);
    setMessageText('');
    toast.success('Message sent successfully!');
  };

  return (
    <div className="w-full space-y-6">
      <Card className="bg-card rounded-xl border shadow-sm">
        {/* Header Section */}
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{ticket.subject}</h2>
              <div className="text-sm text-gray-600 mt-1">
                <span>Department: {ticket.category_name}</span>
                <span className="mx-2">•</span>
                <span>Topic: {ticket.topic_name || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Report: User/Ads</div>
              <div className="text-sm text-gray-900 font-medium">Negro Marquina Travertine Blocks</div>
            </div>
            <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-600 text-xs">Stone</span>
            </div>
            <Button
              variant="outline"
              onClick={onBackToList}
              className="px-4 py-2 border-gray-300 bg-white text-gray-600 rounded-lg hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </CardHeader>

        {/* Chat Conversation Area */}
        <CardContent className="pt-0">
          <div className="border-2 border-blue-200 rounded-lg p-4 min-h-[400px] bg-blue-50">
            {/* Initial System Message */}
            <div className="bg-gray-800 text-white p-4 rounded-lg mb-4 max-w-4xl">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">Lorem Ipsum</span>
              </div>
              <p className="text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Egestas purus viverra. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Egestas purus viverra
              </p>
              <div className="flex justify-end items-center gap-2 mt-3 text-xs text-gray-300">
                <span>✓</span>
                <span>14 July 2025</span>
              </div>
            </div>

            {/* Agent Message */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 text-xs">A</span>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm max-w-md">
                <div className="font-medium text-sm text-gray-900 mb-1">Aida</div>
                <p className="text-sm text-gray-700">Hi, how can I help you today?</p>
                <div className="text-xs text-gray-500 mt-2">14 July 2025</div>
              </div>
            </div>

            {/* User Message */}
            <div className="flex justify-end mb-4">
              <div className="bg-gray-800 text-white p-3 rounded-lg shadow-sm max-w-md">
                <p className="text-sm">Hey, I'm having trouble with my account.</p>
                <div className="flex justify-end items-center gap-2 mt-2 text-xs text-gray-300">
                  <span>✓</span>
                  <span>1h</span>
                </div>
              </div>
            </div>

            {/* Agent Response */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 text-xs">A</span>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm max-w-md">
                <div className="font-medium text-sm text-gray-900 mb-1">Aida</div>
                <p className="text-sm text-gray-700">What seems to be the problem?</p>
                <div className="text-xs text-gray-500 mt-2">1m</div>
              </div>
            </div>

            {/* Latest User Message */}
            <div className="flex justify-end mb-4">
              <div className="bg-gray-800 text-white p-3 rounded-lg shadow-sm max-w-md">
                <p className="text-sm">I can't log in.</p>
                <div className="flex justify-end items-center gap-2 mt-2 text-xs text-gray-300">
                  <span>✓</span>
                  <span>Now</span>
                </div>
              </div>
            </div>

            {/* Separator Lines */}
            <div className="border-t border-dotted border-gray-300 my-4"></div>
          </div>

          {/* Input Section */}
          <div className="mt-4 flex items-center gap-3">
            <Label htmlFor="message-input" className="sr-only">Type your message</Label>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-full border-gray-300 bg-white hover:bg-gray-50"
              onClick={triggerFileInput}
            >
              <Paperclip className="w-4 h-4 text-gray-600" />
            </Button>
            <Input
              id="message-input"
              placeholder="Type your message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 border-gray-300 rounded-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              className="w-10 h-10 bg-gray-900 text-white hover:bg-gray-800 rounded-lg"
              disabled={!messageText.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportChatView;
