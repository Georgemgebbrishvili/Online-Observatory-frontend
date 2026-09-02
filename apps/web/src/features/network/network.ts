import { observatories } from "@/features/observatory/observatories";

export const networkNodeKinds = ["FIRST_PARTY", "PARTNER"] as const;
export const networkApprovalStatuses = [
  "DRAFT",
  "UNDER_REVIEW",
  "APPROVED",
  "SUSPENDED",
] as const;
export const networkCapabilities = ["PLANETARY", "LUNAR", "BRIGHT_DEEP_SKY"] as const;

export type NetworkNode = {
  id: string;
  ownerType: "DARKVIEW" | "EXTERNAL_PARTNER";
  observatoryId: string;
  primaryTelescope: string;
  kind: (typeof networkNodeKinds)[number];
  approvalStatus: (typeof networkApprovalStatuses)[number];
  capabilities: readonly (typeof networkCapabilities)[number][];
  availabilityMode: "CONFIGURED_WINDOWS";
};

export const networkNodes: NetworkNode[] = [
  {
    id: "network-tbilisi-01",
    ownerType: "DARKVIEW",
    observatoryId: observatories[0].id,
    primaryTelescope: `${observatories[0].telescope.manufacturer} ${observatories[0].telescope.model}`,
    kind: "FIRST_PARTY",
    approvalStatus: "APPROVED",
    capabilities: networkCapabilities,
    availabilityMode: "CONFIGURED_WINDOWS",
  },
];

export const networkReviewStages = [
  "OWNERSHIP_AND_SITE",
  "EQUIPMENT_AND_CAPABILITIES",
  "SAFETY_AND_ADAPTER",
  "MANUAL_APPROVAL",
] as const;

export function getNetworkNodeObservatory(node: NetworkNode) {
  return observatories.find((observatory) => observatory.id === node.observatoryId);
}
