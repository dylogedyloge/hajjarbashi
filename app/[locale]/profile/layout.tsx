"use client";

import { ReactNode, Suspense } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  List,
  CreditCard,
  Headphones,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

// Loading component for better UX
const ContentSkeleton = () => (
  <div className="w-full max-w-3xl bg-card rounded-xl border p-8 flex flex-col gap-8 shadow-sm mb-12">
    <Skeleton className="h-8 w-48 mb-4" />
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const sidebarLinks = [
    { label: "Profile & Account", href: "/profile/overview", icon: User },
    { label: "View your Ads", href: "/profile/view-your-ads", icon: List },
    { label: "Plans & Billing", href: "/profile/plans-and-billing", icon: CreditCard },
    { label: "Support", href: "/profile/support", icon: Headphones },
    { label: "Settings", href: "/profile/settings", icon: Settings },
  ];

  const handleTabClick = (href: string) => {
    // Navigate to the specific route
    router.push(href);
  };

  const isActive = (href: string) => {
    const normalize = (str: string) => str.replace(/\/$/, "");
    return normalize(pathname).endsWith(normalize(href));
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <SidebarProvider>
      {/* Mobile: Navigation menu and content stacked vertically */}
      <div className="flex flex-col w-full min-h-screen bg-background md:hidden">
        <div className="w-full px-2 pt-4 pb-2 sticky top-0 z-20 bg-background">
          <NavigationMenu className="w-full">
            <NavigationMenuList className="w-screen justify-center p-4">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <NavigationMenuItem key={link.label} className="flex-1">
                    <Button
                      variant="ghost"
                      onClick={() => handleTabClick(link.href)}
                      className={
                        "flex flex-col items-center justify-center flex-1 text-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium transition-colors " +
                        (active
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground")
                      }
                    >
                      <Icon className="size-5 mx-auto" />
                    </Button>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <main className="flex-1 flex flex-col items-center w-full px-0 sm:px-4 md:px-0">
          <Suspense fallback={<ContentSkeleton />}>{children}</Suspense>
        </main>
      </div>
      {/* Desktop: Sidebar and main content */}
      <div className="hidden md:flex w-full min-h-screen bg-background flex-col md:flex-row md:justify-center md:items-start md:p-6">
        <div className="flex justify-between gap-4 w-full">
          {/* Sidebar (Desktop only) */}
          <Card className="w-80 bg-card border flex-col justify-between min-h-[700px] rounded-xl shadow-sm">
            <div className="flex flex-col h-full">
              {/* User Info Section */}
              <div className="p-6 border-b">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    {user?.avatar_thumb ? (
                      <AvatarImage
                        src={user.avatar_thumb.startsWith('http') 
                          ? user.avatar_thumb 
                          : user.avatar_thumb.startsWith('/files/')
                            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${user.avatar_thumb}`
                            : `${process.env.NEXT_PUBLIC_API_BASE_URL}/${user.avatar_thumb}`
                        }
                        alt={user.name || user.email || "User"}
                      />
                    ) : null}
                    <AvatarFallback className="text-xl font-semibold">
                      {user?.name
                        ? user.name.charAt(0).toUpperCase()
                        : user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="text-lg font-semibold">{user?.name || ""}</div>
                    <div className="text-sm text-muted-foreground">
                      {user?.email || ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="flex-1 p-4">
                <div className="space-y-2">
                  {sidebarLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Button
                        key={link.label}
                        variant="ghost"
                        onClick={() => handleTabClick(link.href)}
                        className={
                          "w-full justify-start h-12 px-4 rounded-lg transition-all duration-200 " +
                          (active
                            ? "text-gray-900 hover:bg-gray-50"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700")
                        }
                      >
                        <Icon className={`mr-3 size-8 p-2 rounded-md ${
                          active ? "text-white bg-orange-500" : "text-gray-400 hover:text-orange-500"
                        }`} />
                        {link.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Logout Button */}
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full h-12 border-muted-foreground/25 text-red-500 hover:bg-red-50 hover:border-red-300"
                >
                  <LogOut className="mr-2 size-4" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>
          {/* Main Content */}
          <Card className="flex-1 flex flex-col items-center w-full px-0 sm:px-4 md:px-4 ">
            <Suspense fallback={<ContentSkeleton />}>{children}</Suspense>
          </Card>
        </div>
      </div>
    </SidebarProvider>
  );
}
