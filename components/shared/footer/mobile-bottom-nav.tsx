"use client";
import { Home, MessageSquare, Bookmark, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateAdvertisementButton from "@/components/shared/header/create-advertisement-button";
import { useTranslations } from "next-intl";
import SignInSignUpButton from "@/components/shared/header/sign-in-sign-up-button";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "@/i18n/navigation";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import dynamic from "next/dynamic";
import { DialogTitle } from "@/components/ui/dialog";
const ChatBox = dynamic(() => import("@/components/shared/header/ChatBox"), { ssr: false });
import { useState } from "react";

const MobileBottomNav = () => {
  const t = useTranslations("MobileBottomNav");
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  const handleProfileClick = () => {
    router.push("/profile/overview");
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-background border-t border flex justify-center items-end pt-1.5 pb-3">
      <div className="relative w-full max-w-md flex justify-between items-end gap-x-4 ">
        {/* Home */}
        <Button
          variant="ghost"
          className="flex flex-col items-center flex-1 text-primary data-[state=active]:bg-transparent py-1 px-0 gap-0"
          tabIndex={0}
        >
          <Home className="size-5 mb-0.5" strokeWidth={2} />
          <span className="text-xs mt-0.5 font-medium leading-none">
            {t("home")}
          </span>
        </Button>
        {/* Chat */}
        <Button
          variant="ghost"
          className="flex flex-col items-center flex-1 text-foreground py-1 px-0 gap-0 pr-4"
          tabIndex={0}
          onClick={() => setChatDrawerOpen(true)}
        >
          <MessageSquare className="size-5 mb-0.5" strokeWidth={2} />
          <span className="text-xs mt-0.5 font-medium leading-none">
            {t("chat")}
          </span>
        </Button>
        {/* Spacer for Plus Floating */}
        <div className="w-12" aria-hidden />
        {/* Plus Floating */}
        {isAuthenticated && user && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-7 flex flex-col items-center">
            <CreateAdvertisementButton floating />
          </div>
        )}
        {/* Spacer for Plus Floating */}
        <div className="w-12" aria-hidden />
        {/* Bookmark */}
        <Button
          variant="ghost"
          className="flex flex-col items-center flex-1 text-foreground py-1 px-0 gap-0 pl-4"
          tabIndex={0}
        >
          <Bookmark className="size-5 mb-0.5" strokeWidth={2} />
          <span className="text-xs mt-0.5 font-medium leading-none">
            {t("bookmark")}
          </span>
        </Button>
        {/* Profile */}
        <div className="flex-1 flex justify-center items-center">
          {isAuthenticated && user ? (
            <Button
              variant="ghost"
              className="flex flex-col items-center flex-1 text-foreground py-1 px-0 gap-0"
              onClick={handleProfileClick}
            >
              <User className="size-5 mb-0.5" strokeWidth={2} />
              <span className="text-xs mt-0.5 font-medium leading-none">
                {t("profile")}
              </span>
            </Button>
          ) : (
            <SignInSignUpButton
              icon={<User className="size-5 mb-0.5" strokeWidth={2} />}
              variant="ghost"
              size={undefined}
              className="flex flex-col items-center flex-1 text-foreground py-1 px-0 gap-0"
              labelClassName="text-xs mt-0.5 font-medium leading-none"
            />
          )}
        </div>
      </div>
      {/* ChatBox Drawer for mobile */}
      <Drawer open={chatDrawerOpen} onOpenChange={setChatDrawerOpen}>
        <DrawerContent className="max-w-md mx-auto rounded-t-2xl p-0 h-[500px] flex flex-col justify-end">
          <DialogTitle className="sr-only">Chat</DialogTitle>
          {chatDrawerOpen && <ChatBox onClose={() => setChatDrawerOpen(false)} />}
        </DrawerContent>
      </Drawer>
    </nav>
  );
};

export default MobileBottomNav;
