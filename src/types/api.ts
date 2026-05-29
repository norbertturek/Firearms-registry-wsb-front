// API Types for EWeaponRegistry Backend

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole = 'Citizen' | 'Shop' | 'WpaOfficer' | 'Admin';

export type PermitType = 'Sport' | 'Collection' | 'Protection' | 'Hunting' | 'Other';

export type PermitStatus = 'Active' | 'Suspended' | 'Revoked' | 'Expired';

export type PermitApplicationStatus =
  | 'Submitted'
  | 'UnderReview'
  | 'Approved'
  | 'Rejected'
  | 'RequiresCorrection';

export type PromiseApplicationStatus =
  | 'Submitted'
  | 'Paid'
  | 'UnderReview'
  | 'Approved'
  | 'Rejected'
  | 'RequiresCorrection';

export type PromiseStatus =
  | 'Draft'
  | 'Submitted'
  | 'Paid'
  | 'UnderReview'
  | 'Approved'
  | 'Rejected'
  | 'Active'
  | 'Used'
  | 'Expired';

export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Overdue';

export type FirearmCategory = 'A' | 'B' | 'C';

export type FirearmStatus = 'Registered' | 'Transferred' | 'Lost' | 'Archived';

export type TransferType = 'Sale' | 'Donation' | 'Inheritance' | 'AdministrativeCorrection';

export type TransferRequestStatus =
  | 'PendingAcceptance'
  | 'Accepted'
  | 'Rejected'
  | 'Cancelled'
  | 'Completed';

export type MedicalAlertType =
  | 'MedicalExamExpiring'
  | 'PsychologicalExamExpiring'
  | 'MedicalExamExpired'
  | 'PsychologicalExamExpired';

// ============================================================================
// AUTH
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
  };
}

export interface UserDto {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

// ============================================================================
// CITIZEN PROFILE
// ============================================================================

export interface CitizenProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  peselMasked: string;
  address: string;
  documentNumber: string;
  weaponBookNumber: string;
  createdAt: string;
}

// ============================================================================
// PERMITS
// ============================================================================

export interface PermitDto {
  id: string;
  permitNumber: string;
  permitType: PermitType;
  permitTypeName: string;
  status: PermitStatus;
  statusName: string;
  issueDate: string;
  expiryDate: string;
  maxFirearms: number;
  usedSlots: number;
  availableSlots: number;
  isValid: boolean;
  medicalExamExpiryDate: string | null;
  psychologicalExamExpiryDate: string | null;
}

// ============================================================================
// PERMIT APPLICATIONS
// ============================================================================

export interface PermitApplicationDto {
  id: string;
  requestedPermitType: PermitType;
  requestedPermitTypeName: string;
  reason: string;
  medicalExamExpiryDate: string | null;
  psychologicalExamExpiryDate: string | null;
  status: PermitApplicationStatus;
  statusName: string;
  rejectionReason: string | null;
  correctionNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  attachments: PermitApplicationAttachmentDto[];
}

export interface PermitApplicationAttachmentDto {
  id: string;
  attachmentType: string;
  attachmentTypeName: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}

export interface CreatePermitApplicationRequest {
  requestedPermitType: PermitType;
  reason: string;
  medicalExamExpiryDate?: string;
  psychologicalExamExpiryDate?: string;
}

export interface UpdatePermitApplicationCorrectionRequest extends CreatePermitApplicationRequest {}

// ============================================================================
// PROMISE APPLICATIONS
// ============================================================================

export interface PromiseApplicationDto {
  id: string;
  permitId: string;
  permitNumber: string;
  requestedWeaponType: string;
  requestedQuantity: number;
  status: PromiseApplicationStatus;
  statusName: string;
  rejectionReason: string | null;
  correctionNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface CreatePromiseApplicationRequest {
  permitId: string;
  requestedWeaponType: string;
  requestedQuantity: number;
}

export interface UpdatePromiseApplicationCorrectionRequest extends CreatePromiseApplicationRequest {}

// ============================================================================
// PROMISES
// ============================================================================

export interface PromiseDto {
  id: string;
  promiseNumber: string;
  weaponType: string;
  quantity: number;
  usedQuantity: number;
  remainingQuantity: number;
  status: PromiseStatus;
  statusName: string;
  feeAmount: number;
  paymentStatus: PaymentStatus;
  paymentStatusName: string;
  qrToken: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  isValid: boolean;
}

// ============================================================================
// FIREARMS
// ============================================================================

export interface FirearmDto {
  id: string;
  brand: string;
  model: string;
  category: FirearmCategory;
  categoryName: string;
  caliber: string;
  serialNumber: string;
  productionYear: number | null;
  status: FirearmStatus;
  statusName: string;
  registeredAt: string;
}

export interface FirearmDetailDto extends FirearmDto {
  ownershipHistory: OwnershipHistoryDto[];
}

export interface OwnershipHistoryDto {
  id: string;
  previousOwnerName: string | null;
  newOwnerName: string;
  transferType: TransferType;
  transferTypeName: string;
  transferDate: string;
  notes: string | null;
}

export interface ReportLostRequest {
  description?: string;
}

// ============================================================================
// TRANSFERS
// ============================================================================

export interface TransferRequestDto {
  id: string;
  firearmId: string;
  firearmDescription: string;
  buyerName: string | null;
  transferType: TransferType;
  transferTypeName: string;
  status: TransferRequestStatus;
  statusName: string;
  transactionDate: string | null;
  createdAt: string;
  isSeller: boolean;
  isBuyer: boolean;
}

export interface CreateTransferRequestRequest {
  firearmId: string;
  buyerPesel: string;
  transferType: TransferType;
}

// ============================================================================
// MEDICAL ALERTS (Citizen view — synced from permit exam dates via API)
// ============================================================================

export interface CitizenMedicalAlertDto {
  id: string;
  permitId: string | null;
  permitNumber: string | null;
  alertType: MedicalAlertType;
  alertTypeName: string;
  message: string;
  dueDate: string | null;
  isResolved: boolean;
  createdAt: string;
}

// ============================================================================
// SHOP
// ============================================================================

export interface VerifyPermitRequest {
  qrToken?: string;
  promiseNumber?: string;
}

export interface VerifyPermitResponse {
  isValid: boolean;
  message: string;
  citizenName: string;
  permitNumber: string;
  permitType: string;
  availableSlots: number;
  weaponType: string;
  remainingPromiseQuantity: number;
  promiseExpiryDate: string;
  medicalExamsValid: boolean;
}

export interface RegisterSaleRequest {
  qrToken: string;
  brand: string;
  model: string;
  category: FirearmCategory;
  caliber: string;
  serialNumber: string;
  productionYear: number;
}

export interface RegisterSaleResponse {
  success: boolean;
  message: string;
  firearmId: string;
  registrationNumber: string;
}

// ============================================================================
// WPA
// ============================================================================

export interface WpaCitizenDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  pesel: string;
  address: string;
  documentNumber: string;
  weaponBookNumber: string;
  createdAt: string;
  permits: PermitDto[];
  firearms?: WpaFirearmSearchResult[];
  totalFirearms: number;
  activeAlerts: number;
}

export interface WpaFirearmSearchResult {
  id: string;
  brand: string;
  model: string;
  category: string;
  caliber: string;
  serialNumber: string;
  status: string;
  ownerName: string;
  ownerPesel: string;
  permitNumber: string;
  permitType: string;
  registeredAt: string;
}

export interface WpaPermitApplicationDto {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenPesel: string;
  requestedPermitType: PermitType;
  requestedPermitTypeName: string;
  reason: string;
  medicalExamExpiryDate: string | null;
  psychologicalExamExpiryDate: string | null;
  status: PermitApplicationStatus;
  statusName: string;
  rejectionReason: string | null;
  correctionNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByOfficerName: string | null;
  attachments: WpaPermitApplicationAttachmentDto[];
}

export interface WpaPermitApplicationAttachmentDto {
  id: string;
  attachmentType: string;
  attachmentTypeName: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}

export interface UpdatePermitApplicationExamDatesRequest {
  medicalExamExpiryDate: string;
  psychologicalExamExpiryDate: string;
}

export interface ApprovePermitApplicationRequest {
  maxFirearms: number;
  medicalExamExpiryDate: string;
  psychologicalExamExpiryDate: string;
}

export interface RejectApplicationRequest {
  reason?: string;
  medicalExamExpiryDate?: string;
  psychologicalExamExpiryDate?: string;
}

export interface RequireCorrectionRequest {
  reason?: string;
  medicalExamExpiryDate?: string;
  psychologicalExamExpiryDate?: string;
}

export interface WpaPromiseApplicationDto {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenPesel: string;
  permitId: string;
  permitNumber: string;
  permitType: string;
  requestedWeaponType: string;
  requestedQuantity: number;
  status: PromiseApplicationStatus;
  statusName: string;
  rejectionReason: string | null;
  correctionNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByOfficerName: string | null;
}

export interface WpaMedicalAlertDto {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenPesel: string;
  permitId: string | null;
  permitNumber: string | null;
  alertType: MedicalAlertType;
  alertTypeName: string;
  message: string;
  dueDate: string | null;
  isResolved: boolean;
  createdAt: string;
}

export interface SuspendPermitRequest {
  reason?: string;
}

export interface RevokePermitRequest {
  reason?: string;
}

export interface RestorePermitRequest {
  reason?: string;
}

export interface UpdateMedicalExamsRequest {
  medicalExamExpiryDate: string;
  psychologicalExamExpiryDate: string;
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ============================================================================
// COMMON
// ============================================================================

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface HealthCheckResponse {
  status: string;
  version: string;
  timestamp: string;
}
