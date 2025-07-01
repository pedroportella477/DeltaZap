import { MessageSquare } from "lucide-react";

export function ChatEmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-xl border-muted-foreground/20">
        <MessageSquare className="h-20 w-20 text-muted-foreground/30" />
        <h2 className="mt-6 text-xl font-semibold font-headline">Selecione uma conversa</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha um contato na lista para começar a conversar.
        </p>
      </div>
    </div>
  );
}
