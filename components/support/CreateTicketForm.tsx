"use client";

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { type TicketCategory, type TicketTopic } from "@/lib/profile";

interface CreateTicketFormProps {
  categories: TicketCategory[];
  topics: TicketTopic[];
  loadingCategories: boolean;
  loadingTopics: boolean;
  submitting: boolean;
  onSubmit: (formData: any, attachments: File[]) => Promise<void>;
  onCancel: () => void;
  onCategoryChange: (categoryId: string) => void;
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({
  categories,
  topics,
  loadingCategories,
  loadingTopics,
  submitting,
  onSubmit,
  onCancel,
  onCategoryChange
}) => {
  const t = useTranslations("Support");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    department: '',
    topic: '',
    subject: '',
    description: '',
    priority: '1'
  });
  
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreview, setAttachmentPreview] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      department: categoryId,
      topic: '',
      priority: '1'
    }));
    
    // Call parent callback to fetch topics
    onCategoryChange(categoryId);
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please select only image files');
      return;
    }

    // Check file size (max 5MB per file)
    const validFiles = imageFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Generate previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setAttachments(prev => [...prev, ...validFiles]);
    setAttachmentPreview(prev => [...prev, ...newPreviews]);
    
    toast.success(`${validFiles.length} image(s) attached successfully`);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setAttachmentPreview(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      return newPreviews.filter((_, i) => i !== index);
    });
    toast.success('Image removed successfully');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!formData.department || !formData.topic || !formData.subject || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    await onSubmit(formData, attachments);
  };

  const handleCancel = () => {
    setFormData({ department: '', topic: '', subject: '', description: '', priority: '1' });
    setAttachments([]);
    setAttachmentPreview([]);
    onCancel();
  };

  return (
    <div className="w-full space-y-6">
      <Card className="bg-card rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {t("createTicket.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Department and Topic Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-semibold text-gray-900">Department</Label>
              <Select value={formData.department} onValueChange={handleCategoryChange}>
                <SelectTrigger id="department" className="w-full border-gray-300 rounded-lg">
                  <SelectValue placeholder="Select your category" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCategories ? (
                    <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="no-categories" disabled>No categories found</SelectItem>
                  ) : (
                    categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
              
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-semibold text-gray-900">Topic</Label>
              <Select value={formData.topic} onValueChange={(value) => handleInputChange('topic', value)} disabled={!formData.department}>
                <SelectTrigger id="topic" className="w-full border-gray-300 rounded-lg" disabled={!formData.department}>
                  <SelectValue placeholder={formData.department ? "Select your topic" : "Select a category first"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingTopics ? (
                    <SelectItem value="loading" disabled>Loading topics...</SelectItem>
                  ) : topics.length === 0 ? (
                    <SelectItem value="no-topics" disabled>No topics found for this category</SelectItem>
                  ) : (
                    topics.map(topic => (
                      <SelectItem key={topic.id} value={topic.id.toString()}>
                        {topic.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Field */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold text-gray-900">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger id="priority" className="w-full border-gray-300 rounded-lg">
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">High</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-semibold text-gray-900">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter your Subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="w-full border-gray-300 rounded-lg"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-900">Description</Label>
            <Textarea
              id="description"
              placeholder="Write a Ticket ..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full border-gray-300 rounded-lg min-h-[120px]"
            />
          </div>

          {/* Attachment Section */}
          <div className="space-y-3">
            <Label htmlFor="attachments" className="text-sm font-semibold text-gray-900">Attachments (Optional)</Label>
            <p className="text-sm text-gray-600">Use the attachment button in the action section below to add images (max 5MB each)</p>
             
            {/* Attachment Previews */}
            {attachmentPreview.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {attachmentPreview.map((preview, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={preview}
                      alt={`Attachment ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeAttachment(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 border-0"
                    >
                      ×
                    </Button>
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {attachments[index]?.name || 'Image'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            {/* Attachment Button */}
            <div className="relative">
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileAttachment}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full border-gray-300 bg-white hover:bg-gray-50 cursor-pointer"
                onClick={triggerFileInput}
              >
                <Paperclip className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
             
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6 py-2 border-gray-300 bg-white text-gray-600 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Button>
             
            <Button
              onClick={handleSubmit}
              className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800"
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTicketForm;
