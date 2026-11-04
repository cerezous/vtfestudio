import { notFound } from "next/navigation";

import { EpicrisisDocument } from "@/modules/epicrisis/components/epicrisis-document";
import { PrintOnLoad } from "@/modules/epicrisis/components/print-on-load";
import { buildEpicrisisDocument } from "@/modules/epicrisis/model";
import { getEpicrisisPayload } from "@/modules/epicrisis/server";
import { patientFullName } from "@/modules/patients/display";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const payload = await getEpicrisisPayload(patientId);

  if (!payload) {
    return { title: "Epicrisis VMI" };
  }

  return {
    title: `Epicrisis VMI · ${patientFullName(payload.patient)}`,
  };
}

export default async function EpicrisisPrintPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const payload = await getEpicrisisPayload(patientId);

  if (!payload) {
    notFound();
  }

  const model = buildEpicrisisDocument(payload);

  return (
    <>
      <PrintOnLoad />
      <EpicrisisDocument
        model={model}
        patientId={payload.patient.id}
        variant="print"
      />
    </>
  );
}
