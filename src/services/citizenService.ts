import api from './api';
import type {
  CitizenProfileDto,
  PermitApplicationAttachmentDto,
  PermitDto,
  PermitApplicationDto,
  CreatePermitApplicationRequest,
  UpdatePermitApplicationCorrectionRequest,
  PromiseDto,
  PromiseApplicationDto,
  CreatePromiseApplicationRequest,
  UpdatePromiseApplicationCorrectionRequest,
  FirearmDto,
  FirearmDetailDto,
  ReportLostRequest,
  TransferRequestDto,
  CreateTransferRequestRequest,
  CitizenMedicalAlertDto,
} from '../types/api';

const TRANSFER_TYPE_VALUES: Record<string, number> = {
  Sale: 0,
  Donation: 1,
  Inheritance: 2,
  AdministrativeCorrection: 3,
};

export function translateTransferError(message: string): string {
  if (!message) return '';
  if (message.includes('Buyer with provided PESEL not found')) return 'Nie znaleziono nabywcy o podanym numerze PESEL w systemie.';
  if (message.includes('Cannot transfer firearm to yourself')) return 'Nie możesz przekazać broni samemu sobie.';
  if (message.includes('Firearm is not in registered status')) return 'Broń nie jest w statusie pozwalającym na transfer (np. zgłoszona jako zgubiona).';
  if (message.includes('Buyer does not have a valid permit for this firearm category') ||
      message.includes('Buyer does not have a permit covering this firearm category')) {
    return 'Nie masz aktywnego pozwolenia, które obejmowałoby tę kategorię broni, ma wolne sloty i aktualne badania. Bez odpowiedniego pozwolenia transfer nie może zostać zaakceptowany (Ustawa o broni i amunicji, art. 21).';
  }
  if (message.includes("Buyer's matching permit is not active")) return 'Pozwolenie nabywcy obejmujące tę kategorię nie jest aktywne (zawieszone/cofnięte/wygasłe).';
  if (message.includes('Buyer has no free slots')) return 'Nabywca nie ma wolnych slotów w pozwoleniu — wszystkie pozwolone egzemplarze są już zarejestrowane.';
  if (message.includes("Buyer's medical or psychological exam has expired")) return 'Badania medyczne nabywcy są nieaktualne — transfer nie może zostać zaakceptowany.';
  if (message.includes('Transfer request is not pending acceptance')) return 'Ten transfer nie jest już w stanie oczekiwania (mógł zostać anulowany lub zaakceptowany).';
  if (message.includes('You are not the buyer')) return 'Nie jesteś nabywcą w tym transferze.';
  if (message.includes('Only the seller can cancel')) return 'Tylko zbywca może anulować transfer.';
  if (message.includes('Only pending transfer requests can be cancelled')) return 'Można anulować tylko transfer w statusie "Oczekuje".';
  return message;
}

export const citizenService = {
  async getProfile(): Promise<CitizenProfileDto> {
    return api.get<CitizenProfileDto>('/citizen/me');
  },

  async getPermitApplications(): Promise<PermitApplicationDto[]> {
    return api.get<PermitApplicationDto[]>('/citizen/me/permit-applications');
  },

  async createPermitApplication(data: CreatePermitApplicationRequest): Promise<PermitApplicationDto> {
    return api.post<PermitApplicationDto>('/citizen/me/permit-applications', data);
  },

  async updatePermitApplicationCorrection(id: string, data: UpdatePermitApplicationCorrectionRequest): Promise<PermitApplicationDto> {
    return api.put<PermitApplicationDto>(`/citizen/me/permit-applications/${id}/correction`, data);
  },

  async uploadPermitApplicationAttachments(
    id: string,
    files: {
      medicalCertificate?: File | null;
      psychologicalCertificate?: File | null;
      medicalExamExpiryDate?: string;
      psychologicalExamExpiryDate?: string;
    },
  ): Promise<PermitApplicationAttachmentDto[]> {
    const formData = new FormData();
    if (files.medicalCertificate) formData.append('medicalCertificate', files.medicalCertificate);
    if (files.psychologicalCertificate) formData.append('psychologicalCertificate', files.psychologicalCertificate);
    if (files.medicalExamExpiryDate) formData.append('medicalExamExpiryDate', files.medicalExamExpiryDate);
    if (files.psychologicalExamExpiryDate) {
      formData.append('psychologicalExamExpiryDate', files.psychologicalExamExpiryDate);
    }
    return api.postForm<PermitApplicationAttachmentDto[]>(`/citizen/me/permit-applications/${id}/attachments`, formData);
  },

  async getPermits(): Promise<PermitDto[]> {
    return api.get<PermitDto[]>('/citizen/me/permits');
  },

  async getPromiseApplications(): Promise<PromiseApplicationDto[]> {
    return api.get<PromiseApplicationDto[]>('/citizen/me/promise-applications');
  },

  async createPromiseApplication(data: CreatePromiseApplicationRequest): Promise<PromiseApplicationDto> {
    return api.post<PromiseApplicationDto>('/citizen/me/promise-applications', data);
  },

  async updatePromiseApplicationCorrection(id: string, data: UpdatePromiseApplicationCorrectionRequest): Promise<PromiseApplicationDto> {
    return api.put<PromiseApplicationDto>(`/citizen/me/promise-applications/${id}/correction`, data);
  },

  async getPromises(): Promise<PromiseDto[]> {
    return api.get<PromiseDto[]>('/citizen/me/promises');
  },

  async getFirearms(): Promise<FirearmDto[]> {
    return api.get<FirearmDto[]>('/citizen/me/firearms');
  },

  async getFirearmDetails(id: string): Promise<FirearmDetailDto> {
    return api.get<FirearmDetailDto>(`/citizen/me/firearms/${id}`);
  },

  async reportLost(id: string, data: ReportLostRequest): Promise<void> {
    return api.post<void>(`/citizen/me/firearms/${id}/report-lost`, data);
  },

  async getTransferRequests(): Promise<TransferRequestDto[]> {
    return api.get<TransferRequestDto[]>('/citizen/me/transfer-requests');
  },

  async createTransferRequest(data: CreateTransferRequestRequest): Promise<TransferRequestDto> {
    const payload = {
      ...data,
      transferType: typeof data.transferType === 'string' ? TRANSFER_TYPE_VALUES[data.transferType] : data.transferType,
    };
    return api.post<TransferRequestDto>('/citizen/me/transfer-requests', payload);
  },

  async acceptTransfer(id: string): Promise<void> {
    return api.post<void>(`/citizen/me/transfer-requests/${id}/accept`);
  },

  async rejectTransfer(id: string): Promise<void> {
    return api.post<void>(`/citizen/me/transfer-requests/${id}/reject`);
  },

  async cancelTransfer(id: string): Promise<void> {
    return api.post<void>(`/citizen/me/transfer-requests/${id}/cancel`);
  },

  async getMedicalAlerts(): Promise<CitizenMedicalAlertDto[]> {
    return api.get<CitizenMedicalAlertDto[]>('/citizen/me/medical-alerts');
  },
};
