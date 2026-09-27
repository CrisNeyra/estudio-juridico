import { redirect } from "next/navigation";
import { LoginForms } from "@/components/portal/login-forms";
import { NotConfigured } from "@/components/portal/not-configured";
import { getAuthContext, safeNext } from "@/lib/auth";

export default async function LoginPage(props: PageProps<"/portal/login">) {
  const ctx = await getAuthContext();
  if (!ctx.configured) return <NotConfigured />;

  const { next, error } = await props.searchParams;
  if (ctx.user) redirect(safeNext(next));

  return (
    <div className="grid gap-16 md:grid-cols-12">
      <div className="md:col-span-5">
        <p className="eyebrow">Portal de clientes</p>
        <h1 className="mt-6 display text-5xl md:text-7xl">
          Tu caso,
          <br />
          <em>siempre a mano.</em>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Seguí el avance de tu caso, consultá documentos y próximos turnos. El acceso lo habilita
          el estudio.
        </p>
      </div>
      <div className="md:col-span-5 md:col-start-8">
        {error === "link" ? (
          <p role="alert" className="mb-8 border-l-2 border-destructive pl-4 text-destructive">
            El enlace es inválido o venció. Pedí uno nuevo.
          </p>
        ) : null}
        <LoginForms next={typeof next === "string" ? safeNext(next) : undefined} />
      </div>
    </div>
  );
}
