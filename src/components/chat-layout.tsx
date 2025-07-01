"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { MessageSquare, User, Settings, Star } from "lucide-react";
import { users } from "@/lib/data";

const Logo = () => (
    <div className="flex items-center gap-2" data-ai-hint="logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
        <h1 className="text-xl font-bold font-headline text-foreground">DeltaZap</h1>
    </div>
)

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentUser = users.find(u => u.id === 'user1');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex">
        <Sidebar className="flex-col" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center justify-between">
                <div className="group-data-[collapsible=icon]:hidden">
                    <Logo />
                </div>
                <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/chat">
                  <SidebarMenuButton isActive={pathname.startsWith('/chat')} tooltip="Conversas">
                    <MessageSquare />
                    <span>Conversas</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/status">
                  <SidebarMenuButton isActive={pathname.startsWith('/status')} tooltip="Status">
                    <Star />
                    <span>Status</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/profile">
                  <SidebarMenuButton isActive={pathname.startsWith('/profile')} tooltip="Perfil">
                    <User />
                    <span>Perfil</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <Link href="/profile" className="w-full">
                <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                        <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="group-data-[collapsible=icon]:hidden text-left">
                        <p className="font-semibold text-sm">{currentUser?.name}</p>
                        <p className="text-xs text-muted-foreground">{currentUser?.status.length > 20 ? `${currentUser?.status.slice(0, 20)}...` : currentUser?.status}</p>
                    </div>
                </Button>
            </Link>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="max-h-screen overflow-hidden p-0 m-0 rounded-none shadow-none">
            {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
