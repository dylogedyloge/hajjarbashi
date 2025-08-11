"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface SupportHeaderProps {
  onCreateTicket: () => void;
}

const SupportHeader: React.FC<SupportHeaderProps> = ({ onCreateTicket }) => {
  const t = useTranslations("Support");

  return (
    <Card className="bg-card rounded-xl border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {t("createTicket.title")}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            {t("createTicket.description")}
          </p>
        </div>
        <Button
          onClick={onCreateTicket}
          className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-6 py-2"
        >
          {t("createTicket.button")}
        </Button>
      </CardHeader>
    </Card>
  );
};

export default SupportHeader;
