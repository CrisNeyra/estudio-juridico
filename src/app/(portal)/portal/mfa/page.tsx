import { redirect } from "next/navigation";
import { MfaChallenge } from "@/components/portal/mfa";
import { NotConfigured } from "@/components/portal/not-configured";
import { getAuthContext, safeNext } from "@/lib/auth";

export default async function MfaPage(props: PageProps<"/portal/mfa">) {
  const ctx = await getAuthContext();
  if (!ctx.configured) return <NotConfigured />;
  if (!ctx.user) redirect("/portal/login");

  const { next } = await props.searchParams;
  const target = safeNext(next);
  if (ctx.aal.current === "aal2" || ctx.aal.next !== "aal2") redirect(target);

  return (
    <div className="max-w-xl">
      <p className="eyebrow">Verificación en dos pasos</p>
      <h1 className="mt-6 display text-5xl">Un paso más.</h1>
      <p className="mt-6 mb-12 text-lg text-muted-foreground">
        Ingresá el código de tu app de autenticación.
      </p>
      <MfaChallenge next={target} />
    </div>
  );
}
