import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao Painel Administrativo</CardTitle>
          <CardDescription>
            Use o menu à esquerda para gerenciar as configurações e o conteúdo do aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Este é o seu centro de controle para o DeltaZap.</p>
        </CardContent>
      </Card>
    </div>
  );
}
