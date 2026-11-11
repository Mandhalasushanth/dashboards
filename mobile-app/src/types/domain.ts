/**
 * Shared domain models for the Finsolz mobile app.
 *
 * These describe the mock data in `src/data`, the Zustand store shapes in
 * `src/store`, and the props that screens and components pass around.
 */
import type { Ionicons } from "@expo/vector-icons";

/** Any glyph name accepted by `<Ionicons name={...} />`. */
export type IconName = keyof typeof Ionicons.glyphMap;



export type ServiceCategoryId =
  | "GST"
  | "ITR"
  | "LOANS"
  | "INSURANCE"
  | "BUSINESS";

export type FormFieldType = "text" | "number" | "date" | "dropdown";

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  /** Present for `dropdown` fields. */
  options?: string[];
  required: boolean;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategoryId;
  description: string;
  icon: IconName;
  requiredDocs: string[];
  formFields: FormField[];
}

export interface ServiceCategory {
  id: ServiceCategoryId;
  name: string;
  icon: IconName;
  count: number;
  color: string;
}

export interface CatalogueItem {
  label: string;
  serviceId?: string;
}

export interface CatalogueSection {
  id: ServiceCategoryId;
  title: string;
  icon: IconName;
  tint: string;
  tintBg: string;
  items: CatalogueItem[];
}


export type DocumentStatus = "Uploaded" | "Pending" | "Rejected";

export interface ApplicationDocument {
  name: string;
  status: DocumentStatus;
  /** Local file URI once the customer has uploaded the document. */
  fileUri?: string;
  fileName?: string;
  fileSize?: string;
  category?: string;
  uploadedAt?: string;
  mimeType?: string;
}

export type TimelineStatus = "completed" | "current" | "pending";

export interface TimelineStep {
  title: string;
  description: string;
  status: TimelineStatus;
  date?: string;
}

export type ApplicationTimelineStep = TimelineStep;

export type ChatSender = "user" | "staff";

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  timestamp: string;
  imageUrl?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  caption?: string;
}

/** Answers captured by `DynamicForm`, keyed by `FormField.name`. */
export type ApplicationFormData = Record<string, any>;

export type PaymentStatus = "Paid" | "Pending";

export interface Application {
  id: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategoryId;
  status: string;
  progress: number;
  assignedExecutive: string;
  paymentAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  formData: ApplicationFormData;
  documents: ApplicationDocument[];
  timeline: TimelineStep[];
  chatHistory: ChatMessage[];
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export interface Payment {
  id: string;
  applicationId: string;
  serviceName: string;
  amount: number;
  status: PaymentStatus;
  /** Set while the payment is pending. */
  dueDate?: string;
  /** Set once the payment has been made. */
  paymentDate?: string;
  invoiceNo: string;
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

/**
 * Notification kinds. The service categories appear here in lower case
 * because a submitted application raises a notification tagged with its
 * category (see `app/service/[id].tsx`).
 */
export type NotificationType =
  | "gst"
  | "itr"
  | "loans"
  | "insurance"
  | "business"
  | "document"
  | "payment"
  | "general";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  /** Creation time as ISO 8601 UTC (e.g. "2026-09-25T06:30:00.000Z"). */
  createdAt?: string;
  /**
   * @deprecated Legacy display string (always "Just now"). Never shown; use
   * `createdAt` with formatRelativeTime instead.
   */
  timestamp?: string;
}

/* ------------------------------------------------------------------ */
/* Customer                                                            */
/* ------------------------------------------------------------------ */

/** Fields the customer fills in during registration. */
export interface CustomerProfile {
  name: string;
  email: string;
  dob: string;
  gender?: string;
  fatherSpouseName?: string;
  pan: string;
  aadhaar: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  pincode?: string;
  state?: string;
  customerType: string;
}

/** Editable fields of the registration / profile form. */
export type ProfileFormValues = Omit<CustomerProfile, "customerType">;

/** Validation messages for the registration / profile form. */
export type ProfileFormErrors = Partial<Record<keyof ProfileFormValues, string>>;

export interface Customer extends CustomerProfile {
  mobile: string;
  customerId: string;
  /** Local profile photo, stored as the picker's file URI on this device. */
  avatarUri?: string | null;
  profileCompleted?: boolean;
  hasPasscode?: boolean;
}
