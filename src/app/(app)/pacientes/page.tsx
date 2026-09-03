import { PatientsWorkspace } from "@/modules/patients/components/patients-workspace";
import { getPatients } from "@/modules/patients/server";

export const metadata = {
  title: "Pacientes",
};

export default async function PacientesPage() {
  const patients = await getPatients();

  return <PatientsWorkspace initialPatients={patients} />;
}
