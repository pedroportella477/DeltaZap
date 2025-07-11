
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { MessageSquare, User, Star, StickyNote, Link as LinkIcon, LogOut, Coffee, Utensils, MinusCircle, Circle, CalendarDays, BookOpen, ClipboardCheck } from "lucide-react";
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
import { Clock } from "./clock";

const Logo = () => (
    <div className="flex items-center gap-2" data-ai-hint="logo chat">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
             <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
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
  const { disconnect, jid, userId, sendPresence, sendUnavailablePresence } = useXmpp();
  const [presence, setPresence] = useState('online');

  const currentUserName = userId === 'master@deltazap.com' ? 'Master' : (jid?.split('@')[0] || 'Usuário');

  const handleLogout = async () => {
    await disconnect();
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
                <Link href="/demands">
                  <SidebarMenuButton isActive={pathname.startsWith('/demands')} tooltip="Demandas">
                    <ClipboardCheck />
                    <span>Demandas</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/support">
                  <SidebarMenuButton isActive={pathname.startsWith('/support')} tooltip="Material de Apoio">
                    <BookOpen />
                    <span>Material de Apoio</span>
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
                <Link href="/appointments">
                  <SidebarMenuButton isActive={pathname.startsWith('/appointments')} tooltip="Meus Compromissos">
                    <CalendarDays />
                    <span>Compromissos</span>
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
                        <AvatarImage src={'https://placehold.co/100x100.png'} alt={currentUserName} />
                        <AvatarFallback>{currentUserName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="group-data-[collapsible=icon]:hidden text-left">
                        <p className="font-semibold text-sm">{currentUserName}</p>
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
            <footer className="flex items-center justify-between py-2 px-4 text-xs text-muted-foreground border-t bg-background">
                <span>© {new Date().getFullYear()} Pedro H F Portella. Todos os direitos reservados.</span>
                <Clock />
            </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
