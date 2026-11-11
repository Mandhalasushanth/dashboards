export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'action_required'
  | 'approved'
  | 'rejected'
  | 'completed';

export type ServiceCategoryId = 'GST' | 'ITR' | 'LOANS' | 'BUSINESS' | 'INSURANCE';

export interface ApplicationTimelineEvent {
  title: string;
  timestamp: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'REJECTED';
  detail?: string;
}

export interface ApplicationItem {
  id: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategoryId;
  categoryLabel: string;
  status: ApplicationStatus;
  statusLabel: string;
  submittedDate: string;
  estimatedCompletionDate?: string;
  progressPercent: number;
}
