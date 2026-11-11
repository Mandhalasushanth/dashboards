import { BrandColors } from "../../../shared/theme";
import { ItrServiceItem } from "../types/itr.types";

export const ITR_SERVICES: ItrServiceItem[] = [
  {
    id: "itr-filing",
    title: "ITR Filing",
    description: "File your income tax return with expert help",
    iconName: "clipboard",
    iconColor: BrandColors.PRIMARY_BLUE,
    iconBg: "#EAF2FF",
    iconImage: require("../../../../assets/images/services/itr/itr_filing.png"),
    route: "/service/itr-filing",
  },
  {
    id: "tds-refund",
    title: "TDS Refund",
    description: "Claim your TDS refund and file TDS returns efficiently",
    iconName: "calculator",
    iconColor: BrandColors.PRIMARY_ORANGE,
    iconBg: "#FFF1E6",
    iconImage: require("../../../../assets/images/services/itr/tds_refund.png"),
    route: "/service/tds-refund",
  },
  /* {
    id: "previous-year-itr",
    title: "Previous Year ITR",
    description: "File pending ITRs for previous years",
    iconName: "calendar",
    iconColor: BrandColors.PRIMARY_BLUE,
    iconBg: "#EAF2FF",
    iconImage: require("../../../../assets/images/services/itr/previous_year_itr.png"),
    route: "/service/previous-year-itr",
  }, */
  {
    id: "revised-itr",
    title: "Revised ITR",
    description: "Revise your already filed return",
    iconName: "create",
    iconColor: BrandColors.PRIMARY_ORANGE,
    iconBg: "#FFF1E6",
    iconImage: require("../../../../assets/images/services/itr/revised_itr.png"),
    route: "/service/revised-itr",
  },
  /* {
    id: "tax-notice-assistance",
    title: "Tax Notice Assistance",
    description: "Get expert help with income tax notices",
    iconName: "warning",
    iconColor: BrandColors.PRIMARY_BLUE,
    iconBg: "#EAF2FF",
    iconImage: require("../../../../assets/images/services/itr/tax_notice_assistance.png"),
    route: "/service/tax-notice-assistance",
  }, */
];
