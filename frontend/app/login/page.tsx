"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro(
        error.message === "Invalid login credentials"
          ? "Email ou senha incorretos."
          : error.message,
      );
      setCarregando(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Sistema de Medição de Temperatura</CardTitle>
            <CardDescription className="mt-1">
              Entre com sua conta para acessar o painel
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            {erro && (
              <p className="text-sm text-destructive" role="alert">
                {erro}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Acesso restrito. Não há registro aberto.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
