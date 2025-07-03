"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

const sidebarLinks = [
  { label: "Overview", href: "/profile/overview", icon: LayoutDashboard },
  { label: "View your Ads", href: "/profile/view-your-ads", icon: List },
  {
    label: "Plans & Billing",
    href: "/profile/plans-and-billing",
    icon: Wallet,
  },
  { label: "Royalty Club", href: "/profile/royalty-club", icon: Crown },
  {
    label: "Account Setting",
    href: "/profile/account-setting",
    icon: Settings,
  },
  { label: "Sign Out", href: "/profile/sign-out", icon: LogOut },
];

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const normalize = (str: string) => str.replace(/\/$/, "");
  return (
    <SidebarProvider>
      {/* Mobile: Navigation menu and content stacked vertically */}
      <div className="flex flex-col w-full min-h-screen bg-background md:hidden">
        <div className="w-full px-2 pt-4 pb-2 sticky top-0 z-20 bg-background">
          <NavigationMenu className="w-full">
            <NavigationMenuList className="w-screen justify-center p-4">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = normalize(pathname).endsWith(
                  normalize(link.href)
                );
                return (
                  <NavigationMenuItem key={link.label} className="flex-1">
                    <NavigationMenuLink
                      href={link.href}
                      active={isActive}
                      className={
                        "flex flex-col items-center justify-center flex-1 text-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium transition-colors " +
                        (isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground")
                      }
                    >
                      <Icon className="size-5 mx-auto" />
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <main className="flex-1 flex flex-col items-center w-full px-0 sm:px-4 md:px-0">
          {children}
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
                  <AvatarImage
                    src="https://placehold.co/800.png?text=Hajjar+Bashi&font=poppins"
                    alt="Ali Motiei"
                  />
                  <AvatarFallback className="text-2xl font-semibold">
                    AM
                  </AvatarFallback>
                </Avatar>
                <div className="text-lg font-semibold">Ali Motiei</div>
                <div className="text-sm text-muted-foreground">
                  ali.motiei@example.com
                </div>
              </div>
              <SidebarMenu>
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = normalize(pathname).endsWith(
                    normalize(link.href)
                  );
                  return (
                    <SidebarMenuItem key={link.label}>
                      <Link href={link.href}>
                        <SidebarMenuButton
                          isActive={isActive}
                          className={
                            isActive
                              ? "!bg-primary !text-white hover:!bg-primary"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }
                        >
                          <Icon className="mr-2 size-5" />
                          {link.label}
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          </div>
          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center w-full px-0 sm:px-4 md:px-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
