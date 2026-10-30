import { Building2, MapPin, Coins, FileText, LucideIcon } from "lucide-react";

export interface AssetTypeMeta {
  type: "RealEstate" | "Plot" | "Gold" | "Bond";
  label: string;
  icon: LucideIcon;
  highlight: string;
  incomeLabel: string | null;
  disclaimer: string;
}

export const ASSET_META: Record<"RealEstate" | "Plot" | "Gold" | "Bond", AssetTypeMeta> = {
  RealEstate: {
    type: "RealEstate",
    label: "Real Estate",
    icon: Building2,
    highlight: "Earns rent",
    incomeLabel: "Distribute rent",
    disclaimer: "Simulated rental yield. Token does not represent legal property registry in India.",
  },
  Plot: {
    type: "Plot",
    label: "Land Plot",
    icon: MapPin,
    highlight: "Land appreciation",
    incomeLabel: null,
    disclaimer: "Land plot appreciation model. No live registry deed.",
  },
  Gold: {
    type: "Gold",
    label: "Digital Gold",
    icon: Coins,
    highlight: "1 token = 0.01 g",
    incomeLabel: null,
    disclaimer: "Simulated gold rate, not a live price. 1 token = 0.01 g.",
  },
  Bond: {
    type: "Bond",
    label: "Bond",
    icon: FileText,
    highlight: "8% coupon",
    incomeLabel: "Pay coupon",
    disclaimer: "Sample corporate bond with 8% coupon. Simulated issuer.",
  },
};

