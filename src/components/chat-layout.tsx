"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
import { MessageSquare, User, Star, Circle, MinusCircle, Coffee, Utensils, StickyNote, Link as LinkIcon } from "lucide-react";
import { users, updateUserPresence, UserPresence } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";

const Logo = () => (
    <div className="flex items-center gap-2" data-ai-hint="logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
        <h1 className="text-xl font-bold font-headline text-foreground">DeltaZap</h1>
    </div>
)

const presenceIndicatorColors: Record<UserPresence, string> = {
  online: "bg-green-500",
  ocupado: "bg-red-500",
  cafe: "bg-amber-500",
  almoco: "bg-orange-500",
  offline: "bg-gray-400",
};

const presenceOptions: { value: UserPresence; label: string; icon: React.ReactNode }[] = [
  { value: 'online', label: 'Online', icon: <Circle className="h-3 w-3 text-green-500 fill-current" /> },
  { value: 'ocupado', label: 'Ocupado', icon: <MinusCircle className="h-3 w-3 text-red-500" /> },
  { value: 'cafe', label: 'Café', icon: <Coffee className="h-3 w-3 text-amber-500" /> },
  { value: 'almoco', label: 'Almoço', icon: <Utensils className="h-3 w-3 text-orange-500" /> },
  { value: 'offline', label: 'Offline', icon: <Circle className="h-3 w-3 text-gray-400" /> },
]

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(users.find((u) => u.id === "user1")!);

  const handlePresenceChange = (value: string) => {
    const newPresence = value as UserPresence;
    updateUserPresence("user1", newPresence);
    setCurrentUser(prev => ({ ...prev, presence: newPresence }));
  };

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
                <Link href="/notes">
                  <SidebarMenuButton isActive={pathname.startsWith('/notes')} tooltip="Minhas Anotações">
                    <StickyNote />
                    <span>Anotações</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/links">
                  <SidebarMenuButton isActive={pathname.startsWith('/links')} tooltip="Links Internos">
                    <LinkIcon />
                    <span>Links Internos</span>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto">
                    <div className="relative">
                      <Avatar className="h-9 w-9">
                          <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                          <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={cn("absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card", presenceIndicatorColors[currentUser.presence])} />
                    </div>
                    <div className="group-data-[collapsible=icon]:hidden text-left">
                        <p className="font-semibold text-sm">{currentUser?.name}</p>
                        <p className="text-xs text-muted-foreground">{currentUser?.status.length > 20 ? `${currentUser?.status.slice(0, 20)}...` : currentUser?.status}</p>
                    </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mb-2" side="top" align="start">
                <DropdownMenuLabel>Definir status</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={currentUser.presence} onValueChange={handlePresenceChange}>
                  {presenceOptions.map(option => (
                     <DropdownMenuRadioItem key={option.value} value={option.value} className="gap-2">
                        {option.icon}
                        <span>{option.label}</span>
                     </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="max-h-screen overflow-hidden p-0 m-0 rounded-none shadow-none">
            {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
