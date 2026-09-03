import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { ClinicalChart } from "@/modules/clinical-chart/components/clinical-chart";
import { getPatient } from "@/modules/patients/server";
import { patientFullName } from "@/modules/patients/display";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const patient = await getPatient(patientId);

  if (!patient) {
    return { title: "Ficha" };
  }

  return { title: patientFullName(patient) };
}

export default async function PatientChartLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const patient = await getPatient(patientId);

  if (!patient) {
    notFound();
  }

  return (
    <>
      <ClinicalChart patient={patient} />
      {children}
    </>
  );
}
