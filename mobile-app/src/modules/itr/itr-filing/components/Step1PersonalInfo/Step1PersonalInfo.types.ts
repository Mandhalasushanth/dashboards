import {
  ItrPersonalInfo,
  ItrBankDetails,
  ItrSelectableBank,
  ItrPriorFilingAndNotice,
} from "../../types/itrFiling.types";

export interface Step1PersonalInfoProps {
  isLoading?: boolean;
  isEditing?: boolean;
  personalInfo: ItrPersonalInfo;
  onUpdatePersonalInfo: (info: Partial<ItrPersonalInfo>) => void;
  bankDetails: ItrBankDetails;
  bankAccountsList: ItrSelectableBank[];
  onSelectRefundBank: (bankId: string) => void;
  onAddBankAccount: (bank: ItrSelectableBank) => void;
  onUpdateBankAccount?: (bank: ItrSelectableBank) => void;
  priorItrNotice: ItrPriorFilingAndNotice;
  onUpdatePriorItrNotice: (data: Partial<ItrPriorFilingAndNotice>) => void;
  onImportPriorItrData: (selectedKeys: {
    income?: boolean;
    deductions?: boolean;
    losses?: boolean;
    bank?: boolean;
    filing?: boolean;
  }) => void;
  onContinue: () => void;
  onUpdateAndContinue?: () => void;
  onSectionLayout?: (section: string, y: number) => void;
}

