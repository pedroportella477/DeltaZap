import ChatLayout from "@/components/chat-layout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ChatLayout>{children}</ChatLayout>;
}
