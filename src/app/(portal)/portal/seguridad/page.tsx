import { redirect } from "next/navigation";
import { MfaManager, PasswordForm } from "@/components/portal/mfa";
import { NotConfigured } from "@/components/portal/not-configured";
import { getAuthContext, isStaff } from "@/lib/auth";

export default async function SecurityPage(props: PageProps<"/portal/seguridad">) {
  const ctx = await getAuthContext();
  if (!ctx.configured) return <NotConfigured />;
  if (!ctx.user) redirect("/portal/login");
  if (ctx.aal.next === "aal2" && ctx.aal.current !== "aal2")
    redirect("/portal/mfa?next=/portal/seguridad");

  const { mfa } = await props.searchParams;
  const staff = isStaff(ctx.profile?.role);

  return (
    <div className="space-y-20">
      <header>
        <p className="eyebrow">Cuenta</p>
        <h1 className="mt-6 display text-5xl md:text-7xl">Seguridad</h1>
        <p className="mt-4 text-muted-foreground">{ctx.user.email}</p>
      </header>

      {mfa === "required" ? (
        <p role="alert" className="max-w-2xl border-l-2 border-brand pl-4">
          {staff
            ? "Para acceder a la administración necesitás activar y verificar la verificación en dos pasos."
            : "Esta sección requiere verificación en dos pasos."}
        </p>
      ) : null}

      <section aria-labelledby="mfa">
        <h2 id="mfa" className="mb-8 display text-3xl">
          Verificación en dos pasos
        </h2>
        <MfaManager />
      </section>

      <section aria-labelledby="password">
        <h2 id="password" className="mb-8 display text-3xl">
          Contraseña
        </h2>
        <PasswordForm />
      </section>
    </div>
  );
}
