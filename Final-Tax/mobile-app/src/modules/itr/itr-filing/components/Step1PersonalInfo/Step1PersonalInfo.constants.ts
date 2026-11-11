import { ResidentialStatus, FilingType } from "../../types/itrFiling.types";

export const RESIDENTIAL_STATUS_OPTIONS: { id: ResidentialStatus; label: string }[] = [
  { id: "Resident", label: "Resident" },
  { id: "NRI", label: "Non-Resident (NRI)" },
  { id: "RNOR", label: "Resident but NOR" },
];

export const FILING_TYPES: { id: FilingType; title: string; section: string; sub: string }[] = [
  {
    id: "139_1_original",
    title: "Original Return",
    section: "u/s 139(1)",
    sub: "Filing on or before statutory due date.",
  },
  {
    id: "139_4_belated",
    title: "Belated Return",
    section: "u/s 139(4)",
    sub: "Filing after statutory due date with applicable late fees.",
  },
  {
    id: "139_5_revised",
    title: "Revised Return",
    section: "u/s 139(5)",
    sub: "Correct omission or error in previously filed return.",
  },
  {
    id: "139_8a_updated",
    title: "Updated Return (ITR-U)",
    section: "u/s 139(8A)",
    sub: "Filing within 24 months from the end of relevant AY.",
  },
];

