"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Wallet, Gift, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "next-intl";
import { fetchPaymentReceipts, type PaymentReceipt, type Payable } from "@/lib/profile";

export default function PlansAndBillingPage() {
  const { token } = useAuth();
  const locale = useLocale();
  const [data, setData] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch payment receipts data
  const fetchData = async (page: number = 1) => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchPaymentReceipts(token, locale, page, 10);
      
      if (result.success) {
        setData(result.data);
        
        console.log('API Response:', result);
        console.log('Data length:', result.data.length);
        console.log('Current page:', page);
        
        // Check if we have pagination metadata from API
        if (result.pagination) {
          setCurrentPage(result.pagination.current_page);
          setTotalPages(result.pagination.total_pages);
          setTotalItems(result.pagination.total_items);
        } else {
          // If no pagination metadata, check if we have a full page of data
          // If we get exactly 10 items, there might be more pages
          // If we get less than 10 items, this is the last page
          const itemsPerPage = 10;
          const hasMorePages = result.data.length === itemsPerPage;
          
          if (hasMorePages) {
            // Assume there are more pages if we got a full page
            // This is a fallback - ideally the API should provide pagination metadata
            setTotalPages(Math.max(currentPage + 1, totalPages));
            setTotalItems((currentPage * itemsPerPage) + result.data.length);
          } else {
            // This is likely the last page
            setTotalPages(currentPage);
            setTotalItems((currentPage - 1) * itemsPerPage + result.data.length);
          }
          
          setCurrentPage(page);
        }
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching payment receipts:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, token, locale]);

  // Helper functions
  const getStatusText = (receiptStatus: number, transactionStatus: number | null) => {
    if (receiptStatus === 2 && transactionStatus === 1) {
      return "Published";
    } else if (receiptStatus === 0) {
      return "Pending";
    } else {
      return "Unpublished";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "text-green-600";
      case "Pending":
        return "text-orange-600";
      case "Unpublished":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getItemDescription = (payables: Payable[]) => {
    const types = payables.map(p => p.type.replace('_', ' ')).join(', ');
    return types.charAt(0).toUpperCase() + types.slice(1);
  };

  const getProcessAction = (receiptStatus: number, transactionStatus: number | null) => {
    if (receiptStatus === 0) {
      return "Payment";
    }
    return "-";
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Show first page
      items.push(1);
      
      if (currentPage > 3) {
        items.push('ellipsis-start');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          items.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        items.push('ellipsis-end');
      }
      
      // Show last page
      if (totalPages > 1) {
        items.push(totalPages);
      }
    }
    
    return items;
  };

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading data</p>
              <p className="text-sm text-gray-600">{error}</p>
              <Button 
                onClick={() => fetchData(currentPage)}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Section - Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Balance Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="w-5 h-5 text-orange-500" />
                Wallet Balance:
              </CardTitle>
              <Button className="bg-gray-800 text-white hover:bg-gray-700 rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                + Add Balance
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">$20.0</div>
            <p className="text-sm text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Egestas purus viverra accumsan in nisl nisi
            </p>
          </CardContent>
        </Card>

        {/* Bonus Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift className="w-5 h-5 text-blue-400" />
                Bonus
              </CardTitle>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                3 Item Available
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Egestas purus viverra accumsan in nisl nisi
            </p>
            <Button className="bg-gray-800 text-white hover:bg-gray-700 rounded-lg">
              Select Bonus
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area - Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          {/* Debug info - remove in production */}
          {/* <div className="text-sm text-gray-500 space-y-1">
            <div>Current Page: {currentPage} | Total Pages: {totalPages} | Total Items: {totalItems} | Data Items: {data.length}</div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                Page 1
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handlePageChange(2)}
                disabled={currentPage === 2}
              >
                Page 2
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handlePageChange(3)}
                disabled={currentPage === 3}
              >
                Page 3
              </Button>
            </div>
          </div> */}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Processes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((receipt, index) => {
                const status = getStatusText(receipt.receipt_status, receipt.transaction_status);
                const processAction = getProcessAction(receipt.receipt_status, receipt.transaction_status);
                
                return (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">
                      #{((currentPage - 1) * 10) + index + 1}
                    </TableCell>
                    <TableCell>{getItemDescription(receipt.payables)}</TableCell>
                    <TableCell>{formatDate(receipt.created_at)}</TableCell>
                    <TableCell className="font-medium">
                      ${receipt.total_amount}
                    </TableCell>
                    <TableCell>
                      <span className={getStatusColor(status)}>
                        {status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {processAction !== "-" ? (
                        <Button variant="outline" size="sm" className="bg-gray-800 text-white hover:bg-gray-700 border-gray-800">
                          {processAction}
                        </Button>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Shadcn Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              {/* Debug info - remove in production */}
              <div className="text-sm text-gray-500 mb-2 text-center">
                Showing page {currentPage} of {totalPages} (Total items: {totalItems})
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          handlePageChange(currentPage - 1);
                        }
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {generatePaginationItems().map((item, index) => (
                    <PaginationItem key={index}>
                      {item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(item as number);
                          }}
                          isActive={currentPage === item}
                          className={currentPage === item ? "bg-gray-800 text-white hover:bg-gray-700 border-gray-800" : ""}
                        >
                          {item}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          handlePageChange(currentPage + 1);
                        }
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 