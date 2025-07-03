
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, PlusCircle,ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useXmpp } from "@/context/xmpp-context";
import { useToast } from "@/hooks/use-toast";
import { addDemand, getDemandsForUser, Demand, DemandPriority, DemandStatus, updateDemand } from "@/lib/data";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";


const demandSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  description: z.string().min(1, "A descrição é obrigatória."),
  assigneeId: z.string().min(1, "Selecione um responsável."),
  priority: z.enum(["Baixa", "Média", "Alta", "Urgente"]),
  dueDate: z.date({ required_error: "A data limite é obrigatória." }),
});

type DemandForm = z.infer<typeof demandSchema>;
type AssignableUser = { id: string; name: string };

const priorityOptions: DemandPriority[] = ["Baixa", "Média", "Alta", "Urgente"];
const statusOptions: DemandStatus[] = ["Pendente", "Em andamento", "Concluída", "Cancelada"];

export default function DemandsPage() {
  const [demands, setDemands] = useState<{ assignedToMe: Demand[], createdByMe: Demand[] }>({ assignedToMe: [], createdByMe: [] });
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userId, roster, jid } = useXmpp();
  const { toast } = useToast();

  const form = useForm<DemandForm>({
    resolver: zodResolver(demandSchema),
  });

  const refreshDemands = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const userDemands = await getDemandsForUser(userId);
      setDemands(userDemands);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar as demandas." });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    refreshDemands();
  }, [refreshDemands]);

  useEffect(() => {
    if (roster && userId) {
      const users = roster
        .filter(r => r.subscription === 'both')
        .map(r => ({ id: r.jid, name: r.name || r.jid.split('@')[0] }));
      
      const currentUserInRoster = users.find(u => u.id === userId);
      if(!currentUserInRoster){
        users.unshift({id: userId, name: jid?.split('@')[0] || 'Eu'});
      }
      
      setAssignableUsers(users);
    }
  }, [roster, userId, jid]);


  const onSubmit = async (data: DemandForm) => {
    if (!userId) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
      return;
    }
    const creator = assignableUsers.find(u => u.id === userId);
    const assignee = assignableUsers.find(u => u.id === data.assigneeId);

    try {
      await addDemand({
        ...data,
        creatorId: userId,
        creatorName: creator?.name || userId,
        assigneeName: assignee?.name || data.assigneeId,
        status: 'Pendente',
      });
      toast({ title: "Demanda criada com sucesso!" });
      await refreshDemands();
      setIsDialogOpen(false);
      form.reset();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao criar demanda', description: error.message });
    }
  };

  const handleStatusChange = async (demandId: string, status: DemandStatus) => {
    try {
        await updateDemand(demandId, { status });
        toast({ title: `Status da demanda atualizado para "${status}"!` });
        await refreshDemands();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o status.' });
    }
  }

  const getPriorityBadgeVariant = (priority: DemandPriority): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case "Urgente": return "destructive";
      case "Alta": return "default";
      case "Média": return "secondary";
      case "Baixa": return "outline";
    }
  };
  
  const DemandsTable = ({ demandsList }: { demandsList: Demand[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Prioridade</TableHead>
          <TableHead>Prazo</TableHead>
          <TableHead>Criador/Responsável</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {demandsList.length > 0 ? demandsList.map((demand) => (
          <TableRow key={demand.id}>
            <TableCell className="font-medium">{demand.title}</TableCell>
            <TableCell>
                <Badge variant={getPriorityBadgeVariant(demand.priority)}>{demand.priority}</Badge>
            </TableCell>
            <TableCell>{demand.dueDate ? format(demand.dueDate.toDate(), 'dd/MM/yyyy') : '-'}</TableCell>
             <TableCell>{demand.creatorId === userId ? demand.assigneeName : demand.creatorName}</TableCell>
            <TableCell>
                 <Select value={demand.status} onValueChange={(value) => handleStatusChange(demand.id, value as DemandStatus)}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Mudar status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
            </TableCell>
          </TableRow>
        )) : (
            <TableRow>
                <TableCell colSpan={5} className="text-center h-24">Nenhuma demanda encontrada.</TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="h-full flex flex-col p-4 md:p-6">
      <CardHeader className="p-0 mb-4 flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-2xl flex items-center gap-2"><ClipboardCheck /> Gestão de Demandas</CardTitle>
          <CardDescription>Crie, atribua e gerencie tarefas e tickets da sua equipe.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Nova Demanda</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Demanda</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-1">
                <Label htmlFor="title">Título da Demanda</Label>
                <Input id="title" {...form.register("title")} />
                {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" {...form.register("description")} />
                {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <Controller
                    control={form.control}
                    name="assigneeId"
                    render={({ field }) => (
                      <div className="space-y-1">
                          <Label>Atribuir a</Label>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Selecione um usuário" /></SelectTrigger>
                                <SelectContent>
                                    {assignableUsers.map(user => (
                                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             {form.formState.errors.assigneeId && <p className="text-sm text-destructive mt-1">{form.formState.errors.assigneeId.message}</p>}
                      </div>
                    )}
                 />
                 <Controller
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <div className="space-y-1">
                           <Label>Prioridade</Label>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Defina a prioridade" /></SelectTrigger>
                                <SelectContent>
                                    {priorityOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.priority && <p className="text-sm text-destructive mt-1">{form.formState.errors.priority.message}</p>}
                      </div>
                    )}
                 />
                <Controller
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                       <div className="space-y-1">
                         <Label>Data Limite</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                           {form.formState.errors.dueDate && <p className="text-sm text-destructive mt-1">{form.formState.errors.dueDate.message}</p>}
                       </div>
                    )}
                />
              </div>

              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                <Button type="submit">Salvar Demanda</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <Card className="flex-grow">
          <CardContent className="p-0">
             <Tabs defaultValue="assignedToMe" className="w-full">
                <TabsList className="m-4">
                    <TabsTrigger value="assignedToMe">Atribuídas a mim</TabsTrigger>
                    <TabsTrigger value="createdByMe">Criadas por mim</TabsTrigger>
                </TabsList>
                <TabsContent value="assignedToMe">
                  {isLoading ? <Skeleton className="h-48 w-full" /> : <DemandsTable demandsList={demands.assignedToMe} />}
                </TabsContent>
                <TabsContent value="createdByMe">
                  {isLoading ? <Skeleton className="h-48 w-full" /> : <DemandsTable demandsList={demands.createdByMe} />}
                </TabsContent>
             </Tabs>
          </CardContent>
      </Card>
    </div>
  );
}
