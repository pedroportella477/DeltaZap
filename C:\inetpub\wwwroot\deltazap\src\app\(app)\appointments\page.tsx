
"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAppointments, addAppointment, deleteAppointment, Appointment } from "@/lib/data";
import { useXmpp } from "@/context/xmpp-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const appointmentSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres.").max(100, "O título não pode ter mais de 100 caracteres."),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);
  const { toast } = useToast();
  const { userId } = useXmpp();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
  });
  
  useEffect(() => {
    if (!userId) return;
    const fetchAppointments = async () => {
      try {
        const userAppointments = await getAppointments(userId);
        setAppointments(userAppointments);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os compromissos.' });
      }
    };
    fetchAppointments();
  }, [userId, toast]);
  
  useEffect(() => {
    if (!appointments.length || hasShownToast || !userId) return;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todaysAppointments = appointments.filter(a => a.date === todayStr);

    if (todaysAppointments.length > 0) {
      toast({
        title: "🔔 Lembrete de Compromissos!",
        description: (
          <div className="w-full mt-2">
            <p className="font-semibold">Você tem os seguintes compromissos hoje:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {todaysAppointments.map(appt => (
                <li key={appt.id}>{appt.title}</li>
              ))}
            </ul>
          </div>
        ),
        duration: 10000,
      });
      setHasShownToast(true);
    }
  }, [appointments, hasShownToast, toast, userId]);


  const onSubmit = async (data: AppointmentForm) => {
    if (!userId || !selectedDate) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Usuário ou data não selecionada.' });
      return;
    }
    
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const newAppointment = await addAppointment(userId, dateStr, data.title);
      setAppointments(prev => [...prev, newAppointment]);
      toast({ title: "Compromisso adicionado!" });
      setIsDialogOpen(false);
      reset();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao adicionar', description: error.message });
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await deleteAppointment(id);
      setAppointments(prev => prev.filter(appt => appt.id !== id));
      toast({ title: "Compromisso removido!" });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível remover o compromisso.' });
    }
  };

  const appointmentDates = useMemo(() => {
    return appointments.map(a => {
        const [year, month, day] = a.date.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    });
  }, [appointments]);

  const modifiers = { hasAppointment: appointmentDates };
  
  const appointmentsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return appointments.filter(a => a.date === dateStr);
  }, [selectedDate, appointments]);

  return (
    <>
      <style>{`
        .has-appointment:not([aria-selected]) .rdp-day_date {
          position: relative;
        }
        .has-appointment:not([aria-selected]) .rdp-day_date::after {
          content: '';
          position: absolute;
          bottom: 1px;
          left: 50%;
          transform: translateX(-50%);
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: hsl(var(--primary));
        }
      `}</style>
      <div className="h-full flex flex-col p-4 md:p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="font-headline text-2xl">Meus Compromissos</CardTitle>
          <CardDescription>Gerencie sua agenda e não perca nenhuma data importante.</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
          <Card className="lg:col-span-2">
            <CardContent className="p-2 sm:p-4 flex justify-center items-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                modifiers={modifiers}
                modifiersClassNames={{ hasAppointment: 'has-appointment' }}
                className="p-0"
              />
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">
                {selectedDate ? format(selectedDate, "'Compromissos de' dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
              {selectedDate && (
                appointmentsForSelectedDay.length > 0 ? (
                  <ul className="space-y-3">
                    {appointmentsForSelectedDay.map(appt => (
                      <li key={appt.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                        <span className="font-medium">{appt.title}</span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover o compromisso "{appt.title}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAppointment(appt.id)} className="bg-destructive hover:bg-destructive/90">
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-muted-foreground pt-8">
                    <CalendarIcon className="mx-auto h-12 w-12 opacity-50" />
                    <p className="mt-4 font-medium">Nenhum compromisso para este dia.</p>
                  </div>
                )
              )}
            </CardContent>
            <CardFooter>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" disabled={!selectedDate}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Compromisso
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo compromisso em {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : ""}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="title">Título do Compromisso</Label>
                      <Input id="title" {...register("title")} />
                      {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button type="submit">Salvar</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
