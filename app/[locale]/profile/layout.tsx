"use client";
import { ReactNode, Suspense } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  List,
  Wallet,
  Crown,
  Settings,
  LogOut,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTranslations } from "next-intl";

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
  const { user } = useAuth();
  const t = useTranslations("Profile.Sidebar");

  const sidebarLinks = [
    { label: t("overview"), href: "/profile/overview", icon: LayoutDashboard },
    { label: t("viewYourAds"), href: "/profile/view-your-ads", icon: List },
    {
      label: t("settings"),
      href: "/profile/settings",
      icon: Settings,
    },
    { label: t("signOut"), href: "/profile/sign-out", icon: LogOut },
  ];

  const handleTabClick = (href: string) => {
    // Navigate to the specific route
    router.push(href);
  };

  const isActive = (href: string) => {
    const normalize = (str: string) => str.replace(/\/$/, "");
    return normalize(pathname).endsWith(normalize(href));
  };

  // No need for getActiveContent since we're rendering children directly

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
      <div className="hidden md:flex w-full min-h-screen bg-background flex-col md:flex-row md:justify-center md:items-start md:py-12">
        <div className="flex md:gap-x-8 w-full md:max-w-screen-lg">
          {/* Sidebar (Desktop only) */}
          <div className="w-80 bg-card border-r flex-col justify-between min-h-[700px] rounded-xl shadow-sm">
            <div>
              <div className="flex flex-col items-center gap-2 py-8 px-6">
                <Avatar className="w-20 h-20">
                  {user?.avatar_thumb ? (
                    <AvatarImage
                      src={user.avatar_thumb}
                      alt={user.name || user.email || "User"}
                    />
                  ) : null}
                  <AvatarFallback className="text-2xl font-semibold">
                    {user?.name
                      ? user.name.charAt(0).toUpperCase()
                      : user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-lg font-semibold">{user?.name || ""}</div>
                <div className="text-sm text-muted-foreground">
                  {user?.email || ""}
                </div>
              </div>
              <SidebarMenu>
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <SidebarMenuItem key={link.label}>
                      <Button
                        variant="ghost"
                        onClick={() => handleTabClick(link.href)}
                        className={
                          "w-full justify-start " +
                          (active
                            ? "!bg-primary !text-white hover:!bg-primary"
                            : "hover:bg-accent hover:text-accent-foreground")
                        }
                      >
                        <Icon className="mr-2 size-5" />
                        {link.label}
                      </Button>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          </div>
          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center w-full px-0 sm:px-4 md:px-0">
            <Suspense fallback={<ContentSkeleton />}>{children}</Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
