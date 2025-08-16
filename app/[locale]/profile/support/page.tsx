"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { 
  type Ticket,
  type TicketCategory,
  type TicketTopic
} from "@/lib/profile";
import { 
  useTickets, 
  useTicketCategories, 
  useTicketTopics,
  useCreateTicket
} from "@/hooks/useProfile";

// Import components
import SupportHeader from "@/components/support/SupportHeader";
import TicketsTable from "@/components/support/TicketsTable";
import CreateTicketForm from "@/components/support/CreateTicketForm";
import SupportChatView from "@/components/support/SupportChatView";

const Support = () => {
  const t = useTranslations("Support");
  const { token, isAuthenticated } = useAuth();
  const locale = useLocale();
  

  
  // Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Ticket detail view state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  
  // Category selection state
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // React Query hooks
  const ticketsQuery = useTickets(token, locale, 1, 10);
  const categoriesQuery = useTicketCategories(token, locale);
  const topicsQuery = useTicketTopics(token, locale, selectedCategoryId);
  const createTicketMutation = useCreateTicket();

  // Extract data from queries
  const tickets: Ticket[] = ticketsQuery.data?.data || [];
  const loading = ticketsQuery.isLoading;
  const error = ticketsQuery.error?.message || null;
  const categories: TicketCategory[] = categoriesQuery.data?.data || [];
  const topics: TicketTopic[] = topicsQuery.data?.data || [];
  const loadingCategories = categoriesQuery.isLoading;
  const loadingTopics = topicsQuery.isLoading;
  const submitting = createTicketMutation.isPending;

  // Handle ticket selection
  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDetail(true);
  };

  // Handle back to ticket list
  const handleBackToList = () => {
    setShowTicketDetail(false);
    setSelectedTicket(null);
  };

  // Handle form submission
  const handleSubmit = async (formData: any, attachments: File[]) => {
    try {
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      createTicketMutation.mutate(
        {
          data: {
            category_id: parseInt(formData.department),
            topic_id: parseInt(formData.topic),
            subject: formData.subject,
            message: formData.description,
            priority: parseInt(formData.priority),
            attachments: attachments
          },
          token,
          locale
        },
        {
          onSuccess: (response) => {
            if (response.success) {
              toast.success('Ticket created successfully!');
              setShowCreateForm(false);
            } else {
              toast.error('Failed to create ticket: ' + (response.message || 'Unknown error'));
            }
          },
          onError: (error) => {
            console.error('Error creating ticket:', error);
            toast.error('Failed to create ticket: ' + (error instanceof Error ? error.message : 'Unknown error'));
          },
        }
      );
    } catch (err) {
      console.error('Error creating ticket:', err);
      toast.error('Failed to create ticket: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowCreateForm(false);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId) {
      setSelectedCategoryId(parseInt(categoryId));
    } else {
      setSelectedCategoryId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">{t("createTicket.title")}</h2>
          <p className="text-muted-foreground">Please sign in to access support</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">{t("createTicket.title")}</h2>
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">{t("createTicket.title")}</h2>
          <p className="text-destructive">{error}</p>
          <Button onClick={() => ticketsQuery.refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show create ticket form
  if (showCreateForm) {
    return (
      <CreateTicketForm
        categories={categories}
        topics={topics}
        loadingCategories={loadingCategories}
        loadingTopics={loadingTopics}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onCategoryChange={handleCategoryChange}
      />
    );
  }

  // Show ticket detail view
  if (showTicketDetail && selectedTicket) {
    return (
      <SupportChatView
        ticket={selectedTicket}
        onBackToList={handleBackToList}
      />
    );
  }

  // Main view with header and tickets table
  return (
    <div className="w-full space-y-6">
      <SupportHeader onCreateTicket={() => setShowCreateForm(true)} />
      <TicketsTable tickets={tickets} onTicketClick={handleTicketClick} />
    </div>
  );
};

export default Support;