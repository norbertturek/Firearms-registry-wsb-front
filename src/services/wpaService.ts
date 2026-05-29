import api from './api';
import type {
  WpaCitizenDto,
  WpaPermitApplicationDto,
  WpaPromiseApplicationDto,
  ApprovePermitApplicationRequest,
  UpdatePermitApplicationExamDatesRequest,
  RejectApplicationRequest,
  RequireCorrectionRequest,
  WpaFirearmSearchResult,
  WpaMedicalAlertDto,
  SuspendPermitRequest,
  RevokePermitRequest,
  RestorePermitRequest,
  UpdateMedicalExamsRequest,
  PaginatedResult,
  PaginationParams,
  PermitApplicationStatus,
  PromiseApplicationStatus,
  PermitType,
} from '../types/api';

const PERMIT_TYPE_VALUES: Record<string, number> = {
  Sport: 0,
  Collection: 1,
  Protection: 2,
  Hunting: 3,
  Other: 4,
};

const PERMIT_APPLICATION_STATUS_VALUES: Record<string, number> = {
  Submitted: 0,
  UnderReview: 1,
  RequiresCorrection: 2,
  Approved: 3,
  Rejected: 4,
};

const PROMISE_APPLICATION_STATUS_VALUES: Record<string, number> = {
  Submitted: 0,
  Paid: 1,
  UnderReview: 2,
  RequiresCorrection: 3,
  Approved: 4,
  Rejected: 5,
};

export const wpaService = {
  // PERMIT APPLICATIONS
  async getPermitApplications(params?: PaginationParams & { status?: PermitApplicationStatus }): Promise<PaginatedResult<WpaPermitApplicationDto>> {
    const query: Record<string, unknown> = { ...params };
    if (params?.status) query.status = PERMIT_APPLICATION_STATUS_VALUES[params.status];
    return api.get<PaginatedResult<WpaPermitApplicationDto>>('/wpa/permit-applications', query);
  },

  async getPermitApplicationById(id: string): Promise<WpaPermitApplicationDto> {
    return api.get<WpaPermitApplicationDto>(`/wpa/permit-applications/${id}`);
  },

  async markPermitApplicationUnderReview(
    id: string,
    data?: UpdatePermitApplicationExamDatesRequest,
  ): Promise<void> {
    return api.post<void>(`/wpa/permit-applications/${id}/mark-under-review`, data);
  },

  async approvePermitApplication(id: string, data: ApprovePermitApplicationRequest): Promise<void> {
    return api.post<void>(`/wpa/permit-applications/${id}/approve`, data);
  },

  async rejectPermitApplication(id: string, data: RejectApplicationRequest): Promise<void> {
    return api.post<void>(`/wpa/permit-applications/${id}/reject`, data);
  },

  async requirePermitApplicationCorrection(id: string, data: RequireCorrectionRequest): Promise<void> {
    return api.post<void>(`/wpa/permit-applications/${id}/require-correction`, data);
  },

  async downloadPermitApplicationAttachment(applicationId: string, attachmentId: string): Promise<Blob> {
    return api.getBlob(`/wpa/permit-applications/${applicationId}/attachments/${attachmentId}`);
  },

  // PROMISE APPLICATIONS
  async getPromiseApplications(params?: PaginationParams & { status?: PromiseApplicationStatus }): Promise<PaginatedResult<WpaPromiseApplicationDto>> {
    const query: Record<string, unknown> = { ...params };
    if (params?.status) query.status = PROMISE_APPLICATION_STATUS_VALUES[params.status];
    return api.get<PaginatedResult<WpaPromiseApplicationDto>>('/wpa/promise-applications', query);
  },

  async getPromiseApplicationById(id: string): Promise<WpaPromiseApplicationDto> {
    return api.get<WpaPromiseApplicationDto>(`/wpa/promise-applications/${id}`);
  },

  async markPromiseApplicationUnderReview(id: string): Promise<void> {
    return api.post<void>(`/wpa/promise-applications/${id}/mark-under-review`);
  },

  async approvePromiseApplication(id: string): Promise<void> {
    return api.post<void>(`/wpa/promise-applications/${id}/approve`);
  },

  async rejectPromiseApplication(id: string, data: RejectApplicationRequest): Promise<void> {
    return api.post<void>(`/wpa/promise-applications/${id}/reject`, data);
  },

  async requirePromiseApplicationCorrection(id: string, data: RequireCorrectionRequest): Promise<void> {
    return api.post<void>(`/wpa/promise-applications/${id}/require-correction`, data);
  },

  // CITIZENS
  async getCitizens(params?: PaginationParams & {
    q?: string;
    searchBy?: "all" | "name" | "pesel" | "permitNumber";
    permitType?: PermitType;
    hasAlerts?: boolean;
  }): Promise<PaginatedResult<WpaCitizenDto>> {
    const query: Record<string, unknown> = { ...params };
    if (params?.permitType) query.permitType = PERMIT_TYPE_VALUES[params.permitType];
    if (params?.hasAlerts !== undefined) query.hasAlerts = params.hasAlerts;
    return api.get<PaginatedResult<WpaCitizenDto>>('/wpa/citizens', query);
  },

  async getCitizenById(id: string): Promise<WpaCitizenDto> {
    return api.get<WpaCitizenDto>(`/wpa/citizens/${id}`);
  },

  // FIREARMS SEARCH
  async searchFirearms(params?: PaginationParams & { serialNumber?: string; pesel?: string; permitNumber?: string; permitType?: PermitType }): Promise<PaginatedResult<WpaFirearmSearchResult>> {
    const query: Record<string, unknown> = { ...params };
    if (params?.permitType) query.permitType = PERMIT_TYPE_VALUES[params.permitType];
    return api.get<PaginatedResult<WpaFirearmSearchResult>>('/wpa/firearms', query);
  },

  // MEDICAL ALERTS
  async getMedicalAlerts(params?: PaginationParams & { resolved?: boolean }): Promise<PaginatedResult<WpaMedicalAlertDto>> {
    return api.get<PaginatedResult<WpaMedicalAlertDto>>('/wpa/medical-alerts', params);
  },

  // PERMIT MANAGEMENT
  async suspendPermit(id: string, data: SuspendPermitRequest): Promise<void> {
    return api.post<void>(`/wpa/permits/${id}/suspend`, data);
  },

  async revokePermit(id: string, data: RevokePermitRequest): Promise<void> {
    return api.post<void>(`/wpa/permits/${id}/revoke`, data);
  },

  async restorePermit(id: string, data: RestorePermitRequest): Promise<void> {
    return api.post<void>(`/wpa/permits/${id}/restore`, data);
  },

  async updateMedicalExams(id: string, data: UpdateMedicalExamsRequest): Promise<void> {
    return api.patch<void>(`/wpa/permits/${id}/medical-exams`, data);
  },
};
