import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link as LinkIcon } from "lucide-react";

export default function LinksPage() {
  return (
    <div className="h-full flex flex-col">
      <CardHeader className="p-4 border-b">
        <CardTitle className="font-headline text-2xl">Links Internos</CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex-grow overflow-y-auto flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-xl border-muted-foreground/20">
            <LinkIcon className="h-20 w-20 text-muted-foreground/30" />
            <h2 className="mt-6 text-xl font-semibold font-headline">Em Construção</h2>
            <p className="mt-2 text-sm text-muted-foreground">
                A funcionalidade de Links Internos está sendo preparada. Volte em breve!
            </p>
        </div>
      </CardContent>
    </div>
  );
}
