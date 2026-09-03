import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import { ROUTES } from "@/shared/lib/constants";

export default function PatientChartNotFound() {
  return (
    <div className="grid min-h-80 place-items-center px-6 py-16 text-center">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Paciente no encontrado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No está en el censo del estudio.
        </p>
        <Button className="mt-6" asChild>
          <Link href={ROUTES.patients}>Volver a pacientes</Link>
        </Button>
      </div>
    </div>
  );
}
