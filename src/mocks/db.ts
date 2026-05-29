// In-memory mock store — mirrors backend seed data
// Arrays are mutable so POST/PUT handlers can update state within a session.

const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

export const IDS = {
  citizenUser:   'u-citizen-001',
  officerUser:   'u-officer-001',
  shopUser:      'u-shop-001',
  adminUser:     'u-admin-001',
  citizenProfile:'cp-001',
  permit1:       'permit-001',
  permit2:       'permit-002',
  permit3:       'permit-003',
  permit4:       'permit-004',
  promise1:      'promise-001',
  firearm1:      'firearm-001',
  firearm2:      'firearm-002',
  firearm3:      'firearm-003',
  firearm4:      'firearm-004',
  firearm5:      'firearm-005',
  firearm6:      'firearm-006',
  permitApp1:    'pa-001-approved',
  permitApp2:    'pa-002-submitted',
  promiseApp1:   'pra-001-approved',
  promiseApp2:   'pra-002-submitted',
  alert1:        'alert-001',
};

// ── Permits ───────────────────────────────────────────────────────────────────

export const permits: any[] = [
  {
    id: IDS.permit1,
    permitNumber: 'POZW-20240501-DEMO0001',
    permitType: 'Sport',
    permitTypeName: 'Sport',
    status: 'Active',
    statusName: 'Active',
    issueDate: daysAgo(365),
    expiryDate: daysFromNow(4 * 365),
    maxFirearms: 5,
    usedSlots: 1,
    availableSlots: 4,
    isValid: true,
    medicalExamExpiryDate: daysFromNow(20),
    psychologicalExamExpiryDate: daysFromNow(365),
    citizenId: IDS.citizenProfile,
  },
  {
    id: IDS.permit2,
    permitNumber: 'POZW-20240315-DEMO0002',
    permitType: 'Hunting',
    permitTypeName: 'Hunting',
    status: 'Active',
    statusName: 'Active',
    issueDate: daysAgo(300),
    expiryDate: daysFromNow(3 * 365),
    maxFirearms: 4,
    usedSlots: 2,
    availableSlots: 2,
    isValid: true,
    medicalExamExpiryDate: daysFromNow(180),
    psychologicalExamExpiryDate: daysFromNow(300),
    citizenId: 'citizen-002',
  },
  {
    id: IDS.permit3,
    permitNumber: 'POZW-20240601-DEMO0003',
    permitType: 'Collection',
    permitTypeName: 'Collection',
    status: 'Active',
    statusName: 'Active',
    issueDate: daysAgo(200),
    expiryDate: daysFromNow(2 * 365),
    maxFirearms: 10,
    usedSlots: 2,
    availableSlots: 8,
    isValid: true,
    medicalExamExpiryDate: daysFromNow(10),
    psychologicalExamExpiryDate: daysFromNow(200),
    citizenId: 'citizen-003',
  },
  {
    id: IDS.permit4,
    permitNumber: 'POZW-20240710-DEMO0004',
    permitType: 'Sport',
    permitTypeName: 'Sport',
    status: 'Active',
    statusName: 'Active',
    issueDate: daysAgo(150),
    expiryDate: daysFromNow(4 * 365),
    maxFirearms: 3,
    usedSlots: 1,
    availableSlots: 2,
    isValid: true,
    medicalExamExpiryDate: daysAgo(5),
    psychologicalExamExpiryDate: daysFromNow(90),
    citizenId: 'citizen-003',
  },
];

// ── Promises ──────────────────────────────────────────────────────────────────

export const promises: any[] = [
  {
    id: IDS.promise1,
    promiseNumber: 'PROM-20240515-DEMO0001',
    weaponType: 'Pistolet sportowy 9mm',
    quantity: 2,
    usedQuantity: 1,
    remainingQuantity: 1,
    status: 'Active',
    statusName: 'Active',
    feeAmount: 17.00,
    paymentStatus: 'Paid',
    paymentStatusName: 'Paid',
    qrToken: 'QR-TEST-TOKEN-12345678',
    issueDate: daysAgo(10),
    expiryDate: daysFromNow(90),
    isValid: true,
  },
];

// ── Firearms ──────────────────────────────────────────────────────────────────

export const firearms: any[] = [
  {
    id: IDS.firearm1,
    brand: 'Glock',
    model: '17 Gen5',
    category: 'B',
    categoryName: 'B',
    caliber: '9x19mm Parabellum',
    serialNumber: 'GLOCK-2024-00001',
    productionYear: 2024,
    status: 'Registered',
    statusName: 'Registered',
    registeredAt: daysAgo(180),
    citizenId: IDS.citizenProfile,
    ownershipHistory: [
      {
        id: 'hist-001',
        previousOwnerName: null,
        newOwnerName: 'Jan Kowalski',
        transferType: 'Sale',
        transferTypeName: 'Sale',
        transferDate: daysAgo(180),
        notes: 'Initial purchase from authorized dealer',
      },
    ],
  },
  {
    id: IDS.firearm2,
    brand: 'CZ',
    model: '527',
    category: 'C',
    categoryName: 'C',
    caliber: '.223 Rem',
    serialNumber: 'CZ527-2023-00042',
    productionYear: 2023,
    status: 'Registered',
    statusName: 'Registered',
    registeredAt: daysAgo(240),
    citizenId: 'citizen-002',
    ownershipHistory: [],
  },
  {
    id: IDS.firearm3,
    brand: 'Beretta',
    model: '686 Silver Pigeon',
    category: 'B',
    categoryName: 'B',
    caliber: '12/70',
    serialNumber: 'BER686-2023-00018',
    productionYear: 2023,
    status: 'Registered',
    statusName: 'Registered',
    registeredAt: daysAgo(210),
    citizenId: 'citizen-002',
    ownershipHistory: [],
  },
  {
    id: IDS.firearm4,
    brand: 'Mauser',
    model: '98K',
    category: 'A',
    categoryName: 'A',
    caliber: '7.92x57mm',
    serialNumber: 'MAUSER-2024-00011',
    productionYear: 1943,
    status: 'Registered',
    statusName: 'Registered',
    registeredAt: daysAgo(120),
    citizenId: 'citizen-003',
    ownershipHistory: [],
  },
  {
    id: IDS.firearm5,
    brand: 'Walther',
    model: 'PPK',
    category: 'B',
    categoryName: 'B',
    caliber: '.380 ACP',
    serialNumber: 'WALPPK-2024-00022',
    productionYear: 2022,
    status: 'Registered',
    statusName: 'Registered',
    registeredAt: daysAgo(90),
    citizenId: 'citizen-003',
    ownershipHistory: [],
  },
  {
    id: IDS.firearm6,
    brand: 'Remington',
    model: '700',
    category: 'C',
    categoryName: 'C',
    caliber: '.308 Win',
    serialNumber: 'REM700-2024-00033',
    productionYear: 2024,
    status: 'Registered',
    statusName: 'Registered',
    registeredAt: daysAgo(60),
    citizenId: 'citizen-003',
    ownershipHistory: [],
  },
];

// ── Permit applications ───────────────────────────────────────────────────────

export const permitApplications: any[] = [
  {
    id: IDS.permitApp1,
    citizenId: IDS.citizenProfile,
    citizenName: 'Jan Kowalski',
    citizenPesel: '90010*****',
    requestedPermitType: 'Sport',
    requestedPermitTypeName: 'Sport',
    reason: 'Uprawianie sportu strzeleckiego w klubie sportowym. Planuję uczestniczyć w zawodach regionalnych i ogólnopolskich.',
    medicalExamExpiryDate: daysFromNow(365),
    psychologicalExamExpiryDate: daysFromNow(365),
    status: 'Approved',
    statusName: 'Approved',
    rejectionReason: null,
    correctionNotes: null,
    createdAt: daysAgo(400),
    reviewedAt: daysAgo(370),
    reviewedByOfficerName: 'sgt. Mariusz Nowak',
    attachments: [
      {
        id: 'att-001',
        attachmentType: 'MedicalCertificate',
        attachmentTypeName: 'MedicalCertificate',
        fileName: 'zaswiadczenie_lekarskie.pdf',
        contentType: 'application/pdf',
        fileSize: 245760,
        createdAt: daysAgo(400),
      },
      {
        id: 'att-002',
        attachmentType: 'PsychologicalCertificate',
        attachmentTypeName: 'PsychologicalCertificate',
        fileName: 'zaswiadczenie_psychologiczne.pdf',
        contentType: 'application/pdf',
        fileSize: 189440,
        createdAt: daysAgo(400),
      },
    ],
  },
  {
    id: IDS.permitApp2,
    citizenId: IDS.citizenProfile,
    citizenName: 'Jan Kowalski',
    citizenPesel: '90010*****',
    requestedPermitType: 'Collection',
    requestedPermitTypeName: 'Collection',
    reason: 'Kolekcjonowanie historycznej broni palnej z okresu II Rzeczpospolitej. Posiadam odpowiednie warunki przechowywania i ubezpieczenie.',
    medicalExamExpiryDate: null,
    psychologicalExamExpiryDate: null,
    status: 'Submitted',
    statusName: 'Submitted',
    rejectionReason: null,
    correctionNotes: null,
    createdAt: daysAgo(14),
    reviewedAt: null,
    reviewedByOfficerName: null,
    attachments: [
      {
        id: 'att-003',
        attachmentType: 'MedicalCertificate',
        attachmentTypeName: 'MedicalCertificate',
        fileName: 'badanie_lekarskie_2024.pdf',
        contentType: 'application/pdf',
        fileSize: 320000,
        createdAt: daysAgo(14),
      },
    ],
  },
];

// ── Promise applications ──────────────────────────────────────────────────────

export const promiseApplications: any[] = [
  {
    id: IDS.promiseApp1,
    citizenId: IDS.citizenProfile,
    citizenName: 'Jan Kowalski',
    citizenPesel: '90010*****',
    permitId: IDS.permit1,
    permitNumber: 'POZW-20240501-DEMO0001',
    permitType: 'Sport',
    requestedWeaponType: 'Pistolet sportowy 9mm',
    requestedQuantity: 2,
    status: 'Approved',
    statusName: 'Approved',
    rejectionReason: null,
    correctionNotes: null,
    createdAt: daysAgo(25),
    reviewedAt: daysAgo(15),
    reviewedByOfficerName: 'sgt. Mariusz Nowak',
  },
  {
    id: IDS.promiseApp2,
    citizenId: IDS.citizenProfile,
    citizenName: 'Jan Kowalski',
    citizenPesel: '90010*****',
    permitId: IDS.permit1,
    permitNumber: 'POZW-20240501-DEMO0001',
    permitType: 'Sport',
    requestedWeaponType: 'Karabinek sportowy CZ 457, kaliber .22LR',
    requestedQuantity: 1,
    status: 'Submitted',
    statusName: 'Submitted',
    rejectionReason: null,
    correctionNotes: null,
    createdAt: daysAgo(3),
    reviewedAt: null,
    reviewedByOfficerName: null,
  },
];

// ── Transfer requests (starts empty) ─────────────────────────────────────────

export const transferRequests: any[] = [];

// ── Medical alerts (synced from permit exam dates) ────────────────────────────

export const medicalAlerts: any[] = [];

const WARN_DAYS = 30;

export function syncMedicalAlertsFromPermits() {
  medicalAlerts.length = 0;
  let alertCounter = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  permits
    .filter((p) => p.status === 'Active' || p.statusName === 'Active')
    .forEach((permit) => {
      const fields: { type: string; expiring: string; expired: string; label: string; date?: string }[] = [
        {
          type: 'medical',
          expiring: 'MedicalExamExpiring',
          expired: 'MedicalExamExpired',
          label: 'Badanie lekarskie',
          date: permit.medicalExamExpiryDate,
        },
        {
          type: 'psych',
          expiring: 'PsychologicalExamExpiring',
          expired: 'PsychologicalExamExpired',
          label: 'Badanie psychologiczne',
          date: permit.psychologicalExamExpiryDate,
        },
      ];

      fields.forEach(({ expiring, expired, label, date }) => {
        if (!date) return;
        const expiry = new Date(date);
        expiry.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
        const citizenId = permit.citizenId ?? IDS.citizenProfile;
        const citizen = wpaCitizens.find((c) => c.id === citizenId);
        const citizenName = citizen ? `${citizen.firstName} ${citizen.lastName}` : 'Jan Kowalski';
        const citizenPesel = citizen?.pesel ?? '90010112345';

        if (daysLeft <= 0) {
          medicalAlerts.push({
            id: `alert-${++alertCounter}`,
            citizenId,
            citizenName,
            citizenPesel,
            permitId: permit.id,
            permitNumber: permit.permitNumber,
            alertType: expired,
            alertTypeName: expired,
            message: `${label} wygasło. Pozwolenie ${permit.permitNumber} wymaga odnowienia badań.`,
            dueDate: date,
            isResolved: false,
            createdAt: daysAgo(1),
          });
        } else if (daysLeft <= WARN_DAYS) {
          medicalAlerts.push({
            id: `alert-${++alertCounter}`,
            citizenId,
            citizenName,
            citizenPesel,
            permitId: permit.id,
            permitNumber: permit.permitNumber,
            alertType: expiring,
            alertTypeName: expiring,
            message: `${label} wygasa za ${daysLeft} dni (pozwolenie ${permit.permitNumber}).`,
            dueDate: date,
            isResolved: false,
            createdAt: daysAgo(1),
          });
        }
      });
    });

  if (typeof wpaCitizen !== 'undefined') {
    wpaCitizen.activeAlerts = medicalAlerts.filter((a) => !a.isResolved).length;
  }
}

// ── WPA citizen snapshot ──────────────────────────────────────────────────────

export const wpaCitizen: any = {
  id: IDS.citizenProfile,
  userId: IDS.citizenUser,
  firstName: 'Jan',
  lastName: 'Kowalski',
  pesel: '90010112345',
  address: 'ul. Testowa 1, 00-001 Warszawa',
  documentNumber: 'ABC123456',
  weaponBookNumber: 'WB-2024-00001',
  createdAt: daysAgo(400),
  permits: [{ permitNumber: 'POZW-20240501-DEMO0001', permitTypeName: 'Sport' }],
  totalFirearms: 1,
  activeAlerts: 1,
};

export const wpaCitizens: any[] = [
  wpaCitizen,
  {
    id: 'citizen-002',
    userId: 'user-citizen-002',
    firstName: 'Anna',
    lastName: 'Nowak',
    pesel: '85050567890',
    address: 'ul. Polna 12, 30-001 Kraków',
    documentNumber: 'DEF789012',
    weaponBookNumber: 'WB-2023-00042',
    createdAt: daysAgo(320),
    permits: [{ permitNumber: 'POZW-20240315-DEMO0002', permitTypeName: 'Hunting' }],
    totalFirearms: 2,
    activeAlerts: 0,
  },
  {
    id: 'citizen-003',
    userId: 'user-citizen-003',
    firstName: 'Piotr',
    lastName: 'Wiśniewski',
    pesel: '92021234567',
    address: 'ul. Leśna 5, 80-001 Gdańsk',
    documentNumber: 'GHI345678',
    weaponBookNumber: 'WB-2024-00018',
    createdAt: daysAgo(180),
    permits: [
      { permitNumber: 'POZW-20240601-DEMO0003', permitTypeName: 'Collection' },
      { permitNumber: 'POZW-20240710-DEMO0004', permitTypeName: 'Sport' },
    ],
    totalFirearms: 3,
    activeAlerts: 2,
  },
];

syncMedicalAlertsFromPermits();
wpaCitizen.activeAlerts = medicalAlerts.filter((a) => !a.isResolved).length;

// ── Helpers ───────────────────────────────────────────────────────────────────

export function paginate<T>(items: T[], page = 1, pageSize = 20) {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((safePage - 1) * pageSize, safePage * pageSize),
    totalCount,
    page: safePage,
    pageSize,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}

export function uid() {
  return Math.random().toString(36).slice(2, 11);
}
