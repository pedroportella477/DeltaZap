
import { Toaster } from "@/components/ui/toaster";
import { Inter, Space_Grotesk } from "next/font/google";
import '../globals.css';
import AdminShell from "@/components/admin-shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-headline",
});


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased`}>
        <AdminShell>
            {children}
        </AdminShell>
        <Toaster />
      </body>
    </html>
  );
}
