"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  // Bell,
  // ChevronDown,
  Menu,
  // User as UserIcon,
  Wallet,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  // MessageCircle,
  // Search,
  // Bookmark,
  Gem,
  Box,
  // Square,
  // Grid3X3,
  MapPin,
  Truck,
  // Package,
  // Building,
  // Factory,
} from "lucide-react";
import { GB, IR } from "country-flag-icons/react/3x2";
import SearchInput from "./search-input";
import CreateAdvertisementButton from "./create-advertisement-button";
// import SignInSignUpButton from "./sign-in-sign-up-button";
import ThemeToggler from "./theme-toggler";
import { useTranslations } from "next-intl";
import { usePathname, useRouter as useIntlRouter } from "@/i18n/navigation";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  // navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import dynamic from "next/dynamic";
const ChatBox = dynamic(() => import("./ChatBox"), { ssr: false });
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DialogTitle } from "@/components/ui/dialog";
import { useLocaleDirection } from "@/hooks/useLocaleDirection";
import { updateLanguage } from "@/lib/profile";
import { SquareBookmarkTop, ChatBubbleRectangle, User } from "@/components/icons";
import AuthDialog from "./auth-dialog";
import { cn } from "@/utils/cn";
import { useSearch } from "@/lib/search-context";
// import { useRef } from "react";

const Header = () => {
  const t = useTranslations("Header");
  const intlRouter = useIntlRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as string) || "en";
  const [language, setLanguage] = useState(currentLocale.toUpperCase());
  const { user, isAuthenticated, logout, token } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInitialUser, setChatInitialUser] = useState(null);
  const { isRTL } = useLocaleDirection();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const searchContext = useSearch();

  // Helper function to validate URL
  const isValidUrl = (url: string | null): boolean => {
    if (!url || url.trim() === "") return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Update language state when locale changes
  useEffect(() => {
    setLanguage(currentLocale.toUpperCase());
  }, [currentLocale]);

  // Listen for global open-chatbox event
  useEffect(() => {
    const handler = (e:any) => {
      if (e.detail) {
        setChatInitialUser(e.detail);
      }
      setChatOpen(true);
    };
    window.addEventListener('open-chatbox', handler);
    return () => window.removeEventListener('open-chatbox', handler);
  }, []);

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    // First, immediately change the language on client side
    const locale = newLanguage.toLowerCase();
    intlRouter.replace(pathname, { locale });
    
    // Then, try to save the preference to the server (don't block the UI)
    if (!token) {
      // If no token, just change the language locally without showing error
      return;
    }

    // Convert language code to API format (EN -> en, FA -> fa)
    const apiLanguage = newLanguage.toLowerCase();
    
    // Call API to update language preference (fire and forget)
    updateLanguage({ language: apiLanguage, token: token || undefined }).catch((error) => {
      console.error("Failed to update language on server:", error);
      // Don't show error toast to avoid disrupting the user experience
      // The language change still worked locally
    });
  };

  // Handle chat icon click
  const handleChatClick = () => {
    if (!isAuthenticated) {
      // Open auth dialog for unauthenticated users
      setAuthDialogOpen(true);
      return;
    }
    // Regular chat functionality for authenticated users
    setChatOpen((v) => !v);
  };

  // Handle create ad button click
  const handleCreateAdClick = () => {
    if (!isAuthenticated) {
      // Open auth dialog for unauthenticated users
      setAuthDialogOpen(true);
      return;
    }
    // For authenticated users, the CreateAdvertisementButton component handles the logic
  };

  const handleSearchChange = (search: string) => {
    console.log('🔍 Search term changed:', search);
    searchContext.onSearchChange(search);
  };

  return (
    <header className="sticky top-0 z-50 w-full flex items-center justify-between px-4 md:px-8 py-4 bg-background border-b border">
      {/* Left Section: Logo and Language Selector */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link className="text-lg text-foreground flex items-center" href="/">
          <Image
            src="/logo-2.svg"
            alt="Hajjarbashi"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </Link>

        {/* Language Selector */}
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="border-none bg-transparent p-0 h-auto">
            <SelectValue>
              <div className="flex items-center gap-2 cursor-pointer">
                {language === "EN" ? (
                  <GB className="w-4 h-4" />
                ) : (
                  <IR className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{language}</span>
                {/* <ChevronDown size={14} className="text-muted-foreground" /> */}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EN">
              <div className="flex items-center gap-2">
                <GB className="w-4 h-4" />
                {t("english")}
              </div>
            </SelectItem>
            <SelectItem value="FA">
              <div className="flex items-center gap-2">
                <IR className="w-4 h-4" />
                {t("persian")}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Center Section: Category and Search */}
      <div className="flex-1 flex items-center justify-center gap-8">
        {/* Category Navigation */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>{t("navigation.categories")}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-[.75fr_1fr] lg:w-[600px]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/"
                      >
                        <Gem className="h-6 w-6" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          {t("navigation.stoneCategories")}
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          {t("navigation.stoneCategoriesDescription")}
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/category/marble" title={t("navigation.marble")}>
                    {t("navigation.marbleDescription")}
                  </ListItem>
                  <ListItem href="/category/granite" title={t("navigation.granite")}>
                    {t("navigation.graniteDescription")}
                  </ListItem>
                  <ListItem href="/category/onyx" title={t("navigation.onyx")}>
                    {t("navigation.onyxDescription")}
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>{t("navigation.form")}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-[.75fr_1fr] lg:w-[600px]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/"
                      >
                        <Box className="h-6 w-6" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          {t("navigation.stoneForms")}
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          {t("navigation.stoneFormsDescription")}
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/form/blocks" title={t("navigation.blocks")}>
                    {t("navigation.blocksDescription")}
                  </ListItem>
                  <ListItem href="/form/slabs" title={t("navigation.slabs")}>
                    {t("navigation.slabsDescription")}
                  </ListItem>
                  <ListItem href="/form/tiles" title={t("navigation.tiles")}>
                    {t("navigation.tilesDescription")}
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>{t("navigation.location")}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-[.75fr_1fr] lg:w-[600px]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/"
                      >
                        <MapPin className="h-6 w-6" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          {t("navigation.locations")}
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          {t("navigation.locationsDescription")}
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/location/iran" title={t("navigation.iran")}>
                    {t("navigation.iranDescription")}
                  </ListItem>
                  <ListItem href="/location/turkey" title={t("navigation.turkey")}>
                    {t("navigation.turkeyDescription")}
                  </ListItem>
                  <ListItem href="/location/china" title={t("navigation.china")}>
                    {t("navigation.chinaDescription")}
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>{t("navigation.services")}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-[.75fr_1fr] lg:w-[600px]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/"
                      >
                        <Truck className="h-6 w-6" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          {t("navigation.services")}
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          {t("navigation.servicesDescription")}
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/services/transport" title={t("navigation.transport")}>
                    {t("navigation.transportDescription")}
                  </ListItem>
                  <ListItem href="/services/processing" title={t("navigation.processing")}>
                    {t("navigation.processingDescription")}
                  </ListItem>
                  <ListItem href="/services/installation" title={t("navigation.installation")}>
                    {t("navigation.installationDescription")}
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <SearchInput onSearchChange={handleSearchChange} />
        </div>
      </div>

      {/* Right Section: Action Icons and Create Ad Button */}
      <div className="flex items-center gap-4">
        {/* Action Icons */}
        <div className="flex items-center gap-3">
          {/* Bookmark Icon */}
          <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
            <SquareBookmarkTop 
              className={`w-5 h-5 ${pathname.includes("/bookmarks") ? "text-primary" : "text-foreground"}`}
              onClick={() => intlRouter.push("/bookmarks")}
            />
          </div>

          {/* Chat Icon with Notification */}
          <div className="relative w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
            <ChatBubbleRectangle 
              className="w-5 h-5 text-foreground"
              onClick={handleChatClick}
            />
            {/* Notification dot - only show for authenticated users */}
            {isAuthenticated && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            )}
          </div>

          {/* User Profile Icon */}
          {isAuthenticated && user ? (
            <Popover>
              <PopoverTrigger asChild>
                <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                  {isValidUrl(user.avatar_thumb) ? (
                    <Image
                      src={user.avatar_thumb!}
                      alt={user.name || user.email}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector(
                            ".avatar-fallback"
                          ) as HTMLElement;
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium avatar-fallback"
                    style={{
                      display: isValidUrl(user.avatar_thumb) ? "none" : "flex",
                    }}
                  >
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : user.email.charAt(0).toUpperCase()}
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-9"
                    onClick={() => {
                      intlRouter.push("/profile/overview");
                    }}
                  >
                    {/* <UserIcon size={16} /> */}
                    <User  />
                    
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-9"
                    onClick={() => {
                      // TODO: Navigate to balance page
                    }}
                  >
                    <Wallet size={16} />
                    Balance
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-9"
                    onClick={() => {
                      // TODO: Navigate to my ads page
                    }}
                  >
                    <FileText size={16} />
                    My Ads
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-9"
                    onClick={() => {
                      // TODO: Navigate to settings page
                    }}
                  >
                    <Settings size={16} />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-9"
                    onClick={() => {
                      // TODO: Navigate to support page
                    }}
                  >
                    <HelpCircle size={16} />
                    Support
                  </Button>
                    <ThemeToggler />
                    <span className="text-sm font-medium">{t("theme")}</span>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-9 text-destructive hover:text-destructive"
                    onClick={logout}
                  >
                    <LogOut size={16} />
                    Logout
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div 
              className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted transition-colors"
              onClick={() => setAuthDialogOpen(true)}
            >
              <User className="w-5 h-5 text-foreground" />
            </div>
          )}
        </div>

        {/* Create Ad Button - Always visible */}
        <div onClick={handleCreateAdClick}>
          <CreateAdvertisementButton />
        </div>
      </div>

      {/* Mobile Menu Icon (hidden on desktop) */}
      <div className="flex md:hidden items-center">
        <Menu size={28} className="text-foreground" />
      </div>

      {/* ChatBox in a Sheet (slide-in from right-bottom) */}
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent side={isRTL ? "left" : "right"} fitContent={true} className="!bottom-0 !top-auto max-w-md w-full p-0 border-none shadow-none bg-transparent">
          {/* Visually hidden title for accessibility */}
          <DialogTitle className="sr-only">Chat</DialogTitle>
          {chatOpen && <ChatBox onClose={() => setChatOpen(false)} initialSelectedUser={chatInitialUser} />}
        </SheetContent>
      </Sheet>

      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </header>
  );
};

const ListItem = React.forwardRef<
  React.ComponentRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export default Header;


