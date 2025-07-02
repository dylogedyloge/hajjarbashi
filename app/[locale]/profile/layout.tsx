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
      <div className="w-full min-h-screen bg-background flex justify-center items-start py-12">
        <div className="flex gap-x-8 max-w-screen-lg w-full">
          {/* Sidebar */}
          <div className="w-80 bg-card border-r flex flex-col justify-between min-h-[700px] rounded-xl shadow-sm">
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
          <main className="flex-1 flex flex-col items-center">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
