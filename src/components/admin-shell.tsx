"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Settings, Link as LinkIcon, BookOpen, LogOut } from 'lucide-react';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('admin-auth');
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/settings', label: 'Configurações', icon: Settings },
    { href: '/admin/links', label: 'Gerenciar Links', icon: LinkIcon },
    { href: '/admin/support', label: 'Material de Apoio', icon: BookOpen },
  ];
  
  return (
    <div className="min-h-screen flex bg-muted/40">
      <aside className="w-64 bg-background border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold font-headline text-primary">Admin DeltaZap</h1>
        </div>
        <nav className="flex-grow p-2 space-y-1">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              <Button
                variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
                className="w-full justify-start"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t">
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
