import type { ClinicalMilestone } from "@/shared/types/database";
import type { HitoKind } from "@/modules/hitos/constants";

export const VMI_AIRWAY_KINDS = ["iot", "tqt"] as const satisfies readonly HitoKind[];

export type VmiAirwayKind = (typeof VMI_AIRWAY_KINDS)[number];

export function isVmiAirwayKind(kind: string): kind is VmiAirwayKind {
  return (VMI_AIRWAY_KINDS as readonly string[]).includes(kind);
}

export function hasVmiAirway(
  milestones: Array<Pick<ClinicalMilestone, "kind">>,
) {
  return milestones.some((item) => isVmiAirwayKind(item.kind));
}
