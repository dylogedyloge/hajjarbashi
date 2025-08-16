"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Wallet, Gift, Plus, Minus, Loader2, AlertCircle, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { type PaymentReceipt, type Payable } from "@/lib/profile";
import { usePaymentReceipts } from "@/hooks/useProfile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function PlansAndBillingPage() {
  const { token } = useAuth();
  const locale = useLocale();
  const t = useTranslations("PlansAndBilling");
  const [currentPage, setCurrentPage] = useState(1);
  const [topUpAmount, setTopUpAmount] = useState<number>(15);
  const [dialogStep, setDialogStep] = useState<"amount" | "review">("amount");
  const [selectedPayment, setSelectedPayment] = useState<"wallet" | "paypal">("paypal");
  const [promoCode, setPromoCode] = useState<string>("");
  const [discount, setDiscount] = useState<number>(24.25);

  // React Query hook for payment receipts
  const paymentReceiptsQuery = usePaymentReceipts(token, locale, currentPage, 10);

  // Extract data from query
  const data: PaymentReceipt[] = paymentReceiptsQuery.data?.data || [];
  const loading = paymentReceiptsQuery.isLoading;
  const error = paymentReceiptsQuery.error?.message || null;

  // Calculate pagination data
  const totalItems = paymentReceiptsQuery.data?.pagination?.total_items || 0;
  const totalPages = paymentReceiptsQuery.data?.pagination?.total_pages || 1;

  // Helper functions
  const getStatusText = (receiptStatus: number, transactionStatus: number | null) => {
    if (receiptStatus === 2 && transactionStatus === 1) {
      return t("table.published");
    } else if (receiptStatus === 0) {
      return t("table.pending");
    } else {
      return t("table.unpublished");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case t("table.published"):
        return "text-green-600";
      case t("table.pending"):
        return "text-orange-600";
      case t("table.unpublished"):
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
    console.log("receiptStatus", receiptStatus);
    console.log("transactionStatus", transactionStatus);
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
              <p className="text-red-600 mb-2">{t("error")}</p>
              <p className="text-sm text-gray-600">{error}</p>
              <Button
                onClick={() => paymentReceiptsQuery.refetch()}
                className="mt-2"
              >
                {t("retry")}
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
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-sm font-medium text-gray-500">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-orange-50">
                  <Wallet className="size-4 text-orange-500" />
                </span>
                {t("walletBalance")}
              </CardTitle>
              <div className="text-2xl font-extrabold text-gray-900">$20.0</div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-5 text-sm leading-6 text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Egestas purus viverra accumsan in nisl nisi
            </p>
            <Dialog onOpenChange={(open) => (open ? undefined : setDialogStep("amount"))}>
              <DialogTrigger asChild>
                <Button className="h-11 w-full rounded-lg bg-gray-900 text-white hover:bg-gray-800">
                  <Plus className="size-4" />
                  {t("addBalance")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-xl" showCloseButton={false}>
                {dialogStep === "amount" ? (
                  <>
                    <DialogHeader className="text-left">
                      <DialogTitle className="text-xl text-center font-semibold text-gray-900">{t("addBalanceDialog.title")}</DialogTitle>
                      <DialogDescription className="text-center text-gray-500">
                        {t("addBalanceDialog.description")}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg border bg-white p-2 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setTopUpAmount((v) => Math.max(0, v - 1))}
                          className="size-10 rounded-md border-0 bg-gray-100 text-gray-600 hover:bg-gray-200"
                          aria-label="Decrease amount"
                        >
                          <Minus className="size-4" />
                        </Button>
                        <div className="min-w-[96px] text-center text-xl font-extrabold text-gray-900">
                          ${topUpAmount}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setTopUpAmount((v) => v + 1)}
                          className="size-10 rounded-md border-0 bg-gray-900 text-white hover:bg-gray-800"
                          aria-label="Increase amount"
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-center text-gray-400">
                      {t("addBalanceDialog.bonusText")}
                    </p>
                    <Alert className="flex gap-2 justify-start items-center">
                      <AlertTitle>
                        <AlertCircle className="size-4 text-blue-500" />
                      </AlertTitle>
                      <AlertDescription>Lorem ipsum dolor sit amet</AlertDescription>
                    </Alert>

                    <DialogFooter className="mt-1 flex-row gap-3">
                      <DialogClose asChild>
                        <Button variant="outline" className="h-10 flex-1 rounded-lg border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
                          {t("addBalanceDialog.cancel")}
                        </Button>
                      </DialogClose>
                      <Button onClick={() => setDialogStep("review")} className="h-10 flex-1 rounded-lg bg-gray-900 text-white hover:bg-gray-800">
                        {t("addBalanceDialog.payment")}
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <DialogHeader >
                      <DialogTitle className="text-center text-xl font-semibold text-gray-900">{t("previewDialog.title")}</DialogTitle>
                      <DialogDescription className=" text-center text-gray-500">
                        {t("previewDialog.description")}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg border bg-white p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t("previewDialog.addBalance")}</span>
                        <span className="font-semibold text-gray-900">${topUpAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t("previewDialog.promoCode")}</span>
                        <span className="font-semibold text-emerald-600">-{(discount).toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-gray-100" />
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-medium">{t("previewDialog.total")}</span>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">+${15} {t("previewDialog.bonus")}</span>
                        </div>
                        <span className="font-semibold text-gray-900">${(Math.max(0, topUpAmount - discount)).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-900">{t("previewDialog.paymentMethod")}</div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSelectedPayment("wallet")}
                          className={`justify-start gap-3 rounded-lg border ${selectedPayment === "wallet" ? "ring-1 ring-gray-300" : ""}`}
                        >
                          <span className="inline-flex size-7 items-center justify-center rounded bg-orange-50">
                            <Wallet className="size-4 text-orange-500" />
                          </span>
                          <span className="text-gray-700">{t("previewDialog.wallet")}</span>
                          <span className="ml-auto text-sm font-medium text-gray-500">${(24.25).toFixed(2)}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSelectedPayment("paypal")}
                          className={`justify-start gap-3 rounded-lg border ${selectedPayment === "paypal" ? "ring-1 ring-orange-400" : ""}`}
                        >
                          <span className="inline-flex size-7 items-center justify-center rounded bg-blue-50">
                            <span className="text-blue-600 text-base font-bold">P</span>
                          </span>
                          <span className="text-gray-700">{t("previewDialog.paypal")}</span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-900">{t("previewDialog.promoCodeSection")}</div>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={t("previewDialog.typeCode")}
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="h-10 rounded-lg"
                        />
                        <Button
                          type="button"
                          size="icon"
                          className="h-10 w-10 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                          onClick={() => setDiscount(promoCode ? 24.25 : 0)}
                          aria-label="Apply promo code"
                        >
                          <Check className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <DialogFooter className="mt-1 flex-row gap-3">
                      <Button variant="outline" onClick={() => setDialogStep("amount")} className="h-10 flex-1 rounded-lg border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
                        {t("addBalanceDialog.cancel")}
                      </Button>
                      <Button className="h-10 flex-1 rounded-lg bg-gray-900 text-white hover:bg-gray-800">
                        {t("addBalanceDialog.payment")}
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Bonus Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-sm font-medium text-gray-500">



                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-blue-50">
                  <Gift className="size-4 text-blue-500" />
                </span>
                {t("bonus")}
              </CardTitle>
              <Badge className="rounded-full border-0 bg-emerald-100 px-3 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100">
                3 {t("itemAvailable")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-5 text-sm leading-6 text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Egestas purus viverra accumsan in nisl nisi
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-11 w-full rounded-lg bg-gray-900 text-white hover:bg-gray-800">
                  {t("selectBonus")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl rounded-xl" showCloseButton={true}>
                <DialogHeader className="text-center">
                  <DialogTitle className="text-xl text-center font-semibold text-gray-900">{t("bonusDialog.title")}</DialogTitle>
                  <DialogDescription className="text-center text-gray-500">
                    {t("bonusDialog.description")}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Plane 1 */}
                  <Card>
                    <CardHeader >

                      <Image src="/images/plan-1.png" alt="Plan 1" width={300} height={300} className="w-full h-full object-cover" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 items-center justify-center">
                          <div className="text-2xl font-bold text-gray-900">15</div>
                          <div className="text-sm text-gray-500 line-through">10 {t("bonusDialog.ads")}</div>
                        </div>
                        <Badge className="bg-orange-500 text-white hover:bg-orange-500">
                          20% Off
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit
                      </p>
                      <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-md">
                        {t("bonusDialog.buyBonus")}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Plane 2 */}
                  <Card>
                    <CardHeader >
                      <Image src="/images/plan-2.png" alt="Plan 2" width={300} height={300} className="w-full h-full object-cover" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 items-center justify-center">
                          <div className="text-2xl font-bold text-gray-900">30</div>
                          <div className="text-sm text-gray-500 line-through">20 {t("bonusDialog.ads")}</div>
                        </div>
                        <Badge className="bg-orange-500 text-white hover:bg-orange-500">
                          20% Off
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit
                      </p>
                      <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-md">
                        {t("bonusDialog.buyBonus")}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Plane 3 */}
                  <Card>
                    <CardHeader >
                      <Image src="/images/plan-3.png" alt="Plan 3" width={300} height={300} className="w-full h-full object-cover" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 items-center justify-center">
                          <div className="text-2xl font-bold text-gray-900">60</div>
                          <div className="text-sm text-gray-500 line-through">50 {t("bonusDialog.ads")}</div>
                        </div>
                        <Badge className="bg-orange-500 text-white hover:bg-orange-500">
                          20% Off
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit
                      </p>
                      <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-md">
                        {t("bonusDialog.buyBonus")}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area - Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("transactionHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.number")}</TableHead>
                <TableHead>{t("table.item")}</TableHead>
                <TableHead>{t("table.date")}</TableHead>
                <TableHead>{t("table.total")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.processes")}</TableHead>
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
                {t("pagination.showingPage", { current: currentPage, total: totalPages })} ({t("pagination.totalItems", { count: totalItems })})
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