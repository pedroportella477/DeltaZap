
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
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
import { MessageSquare, User, Star, StickyNote, Link as LinkIcon, LogOut, Coffee, Utensils, MinusCircle, Circle } from "lucide-react";
import { users } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useXmpp } from "@/context/xmpp-context";

const Logo = () => (
    <div className="flex items-center gap-2" data-ai-hint="logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
        <h1 className="text-xl font-bold font-headline text-foreground">DeltaZap</h1>
    </div>
)

const presenceOptions: { value: string; label: string; icon: React.ReactNode; xmpp: { show?: 'chat' | 'away' | 'dnd' | 'xa'; type?: 'unavailable'; status?: string } }[] = [
    { value: 'online', label: 'Online', icon: <Circle className="h-2.5 w-2.5 text-green-500 fill-current" />, xmpp: { show: 'chat' } },
    { value: 'ocupado', label: 'Ocupado', icon: <MinusCircle className="h-2.5 w-2.5 text-red-500" />, xmpp: { show: 'dnd', status: 'Ocupado' } },
    { value: 'cafe', label: 'Pausa para o café', icon: <Coffee className="h-2.5 w-2.5 text-amber-500" />, xmpp: { show: 'away', status: 'Pausa para o café' } },
    { value: 'almoco', label: 'Em almoço', icon: <Utensils className="h-2.5 w-2.5 text-orange-500" />, xmpp: { show: 'away', status: 'Em almoço' } },
    { value: 'offline', label: 'Invisível', icon: <Circle className="h-2.5 w-2.5 text-gray-400" />, xmpp: { type: 'unavailable' } },
];


export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser] = useState(users.find((u) => u.id === "user1")!);
  const { disconnect, jid, sendPresence, sendUnavailablePresence } = useXmpp();
  const [presence, setPresence] = useState('online');

  const handleLogout = async () => {
    await disconnect();
    Cookies.remove('auth-jid');
    toast({ title: "Você saiu!", description: "Até a próxima!" });
    router.push('/login');
  };
  
  const handlePresenceChange = (value: string) => {
    setPresence(value);
    const option = presenceOptions.find(p => p.value === value);
    if (option) {
        if (option.xmpp.type === 'unavailable') {
            sendUnavailablePresence();
        } else {
            sendPresence(option.xmpp.show, option.xmpp.status);
        }
    }
    toast({ title: "Status alterado!", description: `Você agora está ${option?.label}.`});
  }

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
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                        <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="group-data-[collapsible=icon]:hidden text-left">
                        <p className="font-semibold text-sm">{currentUser?.name}</p>
                        <p className="text-xs text-muted-foreground">{jid?.split('@')[0]}</p>
                    </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mb-2" side="top" align="start">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-normal text-muted-foreground text-xs">Definir status</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={presence} onValueChange={handlePresenceChange}>
                  {presenceOptions.map(option => (
                     <DropdownMenuRadioItem key={option.value} value={option.value} className="flex items-center gap-2 cursor-pointer">
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
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col max-h-screen overflow-hidden p-0 m-0 rounded-none shadow-none">
            <div className="flex-grow overflow-auto">
              {children}
            </div>
            <footer className="text-center py-2 px-4 text-xs text-muted-foreground border-t bg-background">
                © {new Date().getFullYear()} - Desenvolvido por Pedro Portella Dev
            </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
