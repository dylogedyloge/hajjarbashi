"use client";
import { Button } from "@/components/ui/button";
import {
  Bell,
  ChevronDown,
  Menu,
  User,
  Wallet,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { GB, IR } from "country-flag-icons/react/3x2";
import SearchInput from "./search-input";
import CreateAdvertisementButton from "./create-advertisement-button";
import SignInSignUpButton from "./sign-in-sign-up-button";
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
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const Header = () => {
  const t = useTranslations("Header");
  const intlRouter = useIntlRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as string) || "en";
  const [language, setLanguage] = useState(currentLocale.toUpperCase());
  const { user, isAuthenticated, logout } = useAuth();

  // Update language state when locale changes
  useEffect(() => {
    setLanguage(currentLocale.toUpperCase());
  }, [currentLocale]);

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    const locale = newLanguage.toLowerCase();
    intlRouter.replace(pathname, { locale });
  };

  return (
    <header className="w-full flex items-center justify-between px-4 md:px-8 py-4 bg-background border-b border">
      {/* Desktop: Logo and Nav */}
      <div className="hidden md:flex items-center gap-8">
        <Link className="  text-lg text-foreground" href="/">
          {t("appName")}
        </Link>
        <div className="flex items-center gap-2 bg-muted rounded-full px-2 py-1">
          <Button variant="default" size="sm" className="rounded-full px-6 ">
            {t("home")}
          </Button>
          <button className="px-4 py-2 rounded-full text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
            {t("bookmark")}
          </button>
        </div>
      </div>
      {/* Mobile: Menu Icon */}
      <div className="flex md:hidden items-center">
        <Menu size={28} className="text-foreground" />
      </div>

      {/* Desktop: Search Bar */}
      <div className="hidden md:flex flex-1 justify-center px-8">
        <SearchInput />
      </div>

      {/* Desktop: Create Ad Button */}
      {isAuthenticated && user && (
        <div className="hidden md:flex">
          <CreateAdvertisementButton />
        </div>
      )}

      {/* Right Controls (always visible, but layout changes) */}
      <div className="flex items-center gap-4 mx-0 md:mx-6">
        <div className="flex items-center gap-1   text-sm cursor-pointer select-none text-foreground">
          {t("metric")}
          <ChevronDown size={16} className="text-foreground" />
        </div>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="border-none bg-transparent">
            <SelectValue>
              <div className="flex items-center gap-2">
                {language === "EN" ? (
                  <>
                    <GB className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <IR className="w-4 h-4" />
                  </>
                )}
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
        <ThemeToggler />
        <Bell size={20} className="cursor-pointer" />
        {/* Desktop: Sign In/Up Button or User Profile */}
        <div className="hidden md:block">
          {isAuthenticated && user ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 p-2 hover:bg-accent rounded-full"
                >
                  {user.avatar_thumb ? (
                    <img
                      src={user.avatar_thumb}
                      alt={user.name || user.email}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {user.name
                        ? user.name.charAt(0).toUpperCase()
                        : user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-medium">
                      {user.name || user.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                  <ChevronDown size={16} className="text-muted-foreground" />
                </Button>
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
                    <User size={16} />
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
                  <div className="border-t border-border my-1" />
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
            <SignInSignUpButton />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
