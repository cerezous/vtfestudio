import { ROUTES } from "@/shared/lib/constants";

export function epicrisisPrintHref(patientId: string) {
  return `${ROUTES.printEpicrisis}/${patientId}`;
}
