"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslations } from "next-intl";
import { type Ticket } from "@/lib/profile";

interface TicketsTableProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
}

const TicketsTable: React.FC<TicketsTableProps> = ({ tickets, onTicketClick }) => {
  const t = useTranslations("Support");

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Open";
      case 1:
        return "Review";
      case 2:
        return "Close";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'text-green-600';
      case 1:
        return 'text-orange-600';
      case 2:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="bg-card rounded-xl border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          {t("ticketHistory.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tickets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-500 font-medium">#</TableHead>
                <TableHead className="text-gray-500 font-medium">{t("ticketHistory.ticket")}</TableHead>
                <TableHead className="text-gray-500 font-medium">{t("ticketHistory.date")}</TableHead>
                <TableHead className="text-gray-500 font-medium">{t("ticketHistory.topic")}</TableHead>
                <TableHead className="text-gray-500 font-medium">{t("ticketHistory.category")}</TableHead>
                <TableHead className="text-gray-500 font-medium">{t("ticketHistory.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket, index) => (
                <TableRow 
                  key={ticket.id} 
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onTicketClick(ticket)}
                >
                  <TableCell className="text-gray-400 font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-gray-900">
                    {truncateText(ticket.subject)}
                  </TableCell>
                  <TableCell className="text-gray-900">
                    {formatDate(ticket.created_at)}
                  </TableCell>
                  <TableCell className="text-gray-900">
                    {ticket.topic_name || "N/A"}
                  </TableCell>
                  <TableCell className="text-gray-900">
                    {ticket.category_name}
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getStatusColor(ticket.status)}`}>
                      {getStatusText(ticket.status)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No tickets found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketsTable;
