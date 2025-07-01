
"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Clock() {
  const [isMounted, setIsMounted] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
        const now = new Date();
        setTime(now.toLocaleTimeString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit',
        }));
        setDate(format(now, 'dd/MM/yyyy', { locale: ptBR }));
    };

    setIsMounted(true);
    updateDateTime(); // Set initial time immediately
    const intervalId = setInterval(updateDateTime, 1000 * 60); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  if (!isMounted) {
    // Render a placeholder on the server to avoid layout shift
    return <div className="text-xs text-muted-foreground font-mono">--/--/---- | --:--</div>;
  }

  return (
    <div className="text-xs text-muted-foreground font-mono">
      <span>{date}</span>
      <span className="mx-1">|</span>
      <span>{time}</span>
    </div>
  );
}
