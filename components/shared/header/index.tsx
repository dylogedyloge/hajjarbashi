import { Button } from "@/components/ui/button";
import { Globe, Bell, ChevronDown, Menu } from "lucide-react";
import SearchInput from "./search-input";
import CreateAdvertisementButton from "./create-advertisement-button";
import SignInSignUpButton from "./sign-in-sign-up-button";
import ThemeToggler from "./theme-toggler";
import Link from "next/link";

const Header = () => {
  return (
    <header className="w-full flex items-center justify-between px-4 md:px-8 py-4 bg-background border-b border">
      {/* Desktop: Logo and Nav */}
      <div className="hidden md:flex items-center gap-8">
        <Link className="font-semibold text-lg text-foreground" href="/">
          Hajjar Bashi
        </Link>
        <div className="flex items-center gap-2 bg-muted rounded-full px-2 py-1">
          <Button
            variant="default"
            size="sm"
            className="rounded-full px-6 font-semibold"
          >
            Home
          </Button>
          <button className="px-4 py-2 rounded-full text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
            Bookmark
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
      <div className="hidden md:flex">
        <CreateAdvertisementButton />
      </div>

      {/* Right Controls (always visible, but layout changes) */}
      <div className="flex items-center gap-4 ml-0 md:ml-6">
        <div className="flex items-center gap-1 font-semibold text-sm cursor-pointer select-none text-foreground">
          Metric <ChevronDown size={16} className="text-foreground" />
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-md border border">
          <Globe size={18} className="text-muted-foreground" />
        </div>
        <span className="text-sm font-medium flex items-center gap-1 text-foreground">
          EN <ChevronDown size={16} className="inline text-foreground" />
        </span>
        <ThemeToggler />
        <Bell size={20} className="text-muted-foreground cursor-pointer" />
        {/* Desktop: Sign In/Up Button */}
        <div className="hidden md:block">
          <SignInSignUpButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
