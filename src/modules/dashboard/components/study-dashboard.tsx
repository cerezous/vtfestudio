import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { Profile } from "@/shared/types/database";

export function StudyDashboard({ profile }: { profile: Profile }) {
  const firstName = profile.full_name.split(" ")[0] ?? profile.full_name;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Centro de comando</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Hola, {firstName}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Estudio de pacientes en ventilación mecánica invasiva. El escaneo y
            el registro clínico se activan en el siguiente paso.
          </p>
        </div>
        <div className="rounded-full bg-special px-4 py-2 text-sm font-semibold text-special-foreground">
          En preparación
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[1.6rem]">
          <CardHeader>
            <CardTitle>Pacientes</CardTitle>
            <CardDescription>Censo del estudio</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">0</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Aún no hay ingresos.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-[1.6rem]">
          <CardHeader>
            <CardTitle>En VMI</CardTitle>
            <CardDescription>Activos ahora</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">0</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sin registros ventilatorios.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-[1.6rem]">
          <CardHeader>
            <CardTitle>Escaneos</CardTitle>
            <CardDescription>Identificación en cama</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">—</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cámara lista en el siguiente módulo.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[1.6rem]">
        <CardHeader>
          <CardTitle>Turno del estudio</CardTitle>
          <CardDescription>
            Cuando existan pacientes, aquí verás el censo y el atajo de escaneo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid min-h-40 place-items-center rounded-[1.4rem] border border-dashed bg-muted/40 px-6 text-center text-sm text-muted-foreground">
            Sin pacientes en seguimiento. El ingreso y el escaneo vienen después
            del login.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
