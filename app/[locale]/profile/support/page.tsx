"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { 
  fetchTickets, 
  fetchTicketCategories, 
  fetchTicketTopics,
  createTicket,
  type Ticket,
  type TicketCategory,
  type TicketTopic
} from "@/lib/profile";

// Import components
import SupportHeader from "@/components/support/SupportHeader";
import TicketsTable from "@/components/support/TicketsTable";
import CreateTicketForm from "@/components/support/CreateTicketForm";
import SupportChatView from "@/components/support/SupportChatView";

const Support = () => {
  const t = useTranslations("Support");
  const { token, isAuthenticated } = useAuth();
  const locale = useLocale();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Ticket detail view state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  
  // Categories and topics state
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [topics, setTopics] = useState<TicketTopic[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch ticket categories
  const fetchCategories = async () => {
    if (!token) return;
    
    try {
      setLoadingCategories(true);
      const data = await fetchTicketCategories(token, locale);
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch topics for selected category
  const fetchTopics = async (categoryId: number) => {
    if (!token || !categoryId) return;
    
    try {
      setLoadingTopics(true);
      const data = await fetchTicketTopics(token, locale, categoryId);
      if (data.success) {
        setTopics(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
    } finally {
      setLoadingTopics(false);
    }
  };

  // Fetch tickets from API
  const fetchTicketsData = async (page: number = 1) => {
    if (!token || !isAuthenticated) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await fetchTickets(token, locale, page, itemsPerPage);
      
      if (data.success) {
        setTickets(data.data);
        setCurrentPage(page);
        
        // Calculate pagination info
        if (data.data.length > 0) {
          // If we get a full page, there might be more
          if (data.data.length === itemsPerPage) {
            setTotalPages(Math.max(page + 1, totalPages));
          } else {
            // This is likely the last page
            setTotalPages(page);
          }
        } else {
          setTotalPages(1);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch tickets');
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsData(currentPage);
    fetchCategories(); // Fetch categories on mount
  }, [token, isAuthenticated, locale]);

  // Handle page change
  // const handlePageChange = (page: number) => {
  //   fetchTicketsData(page);
  // };

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

  // Handle send message
  const handleSendMessage = (message: string) => {
    // Here you would typically send the message to the API
    // For now, we'll just show a toast
    toast.success('Message sent successfully!');
    console.log(message);
  };

  // Handle form submission
  const handleSubmit = async (formData: any, attachments: File[]) => {
    try {
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      setSubmitting(true);
      const data = await createTicket({
        category_id: parseInt(formData.department),
        topic_id: parseInt(formData.topic),
        subject: formData.subject,
        message: formData.description,
        priority: parseInt(formData.priority),
        attachments: attachments
      }, token, locale);

      if (data.success) {
        toast.success('Ticket created successfully!');
        setShowCreateForm(false);
        fetchTicketsData(currentPage); // Refresh tickets
      } else {
        toast.error('Failed to create ticket: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      toast.error('Failed to create ticket: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowCreateForm(false);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId) {
      fetchTopics(parseInt(categoryId));
    } else {
      setTopics([]);
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
          <Button onClick={() => fetchTicketsData(currentPage)} className="mt-4">
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
        onSendMessage={handleSendMessage}
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