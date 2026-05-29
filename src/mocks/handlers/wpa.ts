import { http, HttpResponse } from 'msw';
import * as db from '../db';
import { generatePermitNumber, generatePromiseNumber } from '../../lib/registryNumbers';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const OFFICER_NAME = 'sgt. Mariusz Nowak';

function qp(url: URL, key: string, fallback: number) {
  const v = url.searchParams.get(key);
  return v !== null ? Number(v) : fallback;
}

function getCitizenById(citizenId: string) {
  return db.wpaCitizens.find((c) => c.id === citizenId);
}

function getPermitForFirearm(firearm: { citizenId?: string }) {
  const citizenId = firearm.citizenId ?? db.IDS.citizenProfile;
  return db.permits.find((p) => p.citizenId === citizenId);
}

function mapFirearmToSearchResult(firearm: (typeof db.firearms)[number]) {
  const citizenId = firearm.citizenId ?? db.IDS.citizenProfile;
  const citizen = getCitizenById(citizenId);
  const permit = getPermitForFirearm(firearm);
  return {
    id: firearm.id,
    brand: firearm.brand,
    model: firearm.model,
    category: firearm.category,
    caliber: firearm.caliber,
    serialNumber: firearm.serialNumber,
    status: firearm.status,
    ownerName: citizen ? `${citizen.firstName} ${citizen.lastName}` : 'Jan Kowalski',
    ownerPesel: citizen?.pesel ?? '90010112345',
    permitNumber: permit?.permitNumber ?? '—',
    permitType: permit?.permitType ?? 'Sport',
    registeredAt: firearm.registeredAt,
  };
}

function getCitizenFirearms(citizenId: string) {
  return db.firearms
    .filter((f) => (f.citizenId ?? db.IDS.citizenProfile) === citizenId)
    .map(mapFirearmToSearchResult);
}

function buildWpaCitizenDetail(id: string) {
  const citizen = db.wpaCitizens.find((c) => c.id === id);
  if (!citizen) return null;

  const permitsFromRegistry = db.permits.filter((p) => p.citizenId === id);
  const summaryPermits = citizen.permits ?? [];

  const permits =
    permitsFromRegistry.length > 0
      ? permitsFromRegistry
      : summaryPermits.map(
          (summary: { permitNumber: string; permitTypeName: string }, index: number) => ({
            id: `permit-stub-${id}-${index}`,
            permitNumber: summary.permitNumber,
            permitType: summary.permitTypeName,
            permitTypeName: summary.permitTypeName,
            status: 'Active',
            statusName: 'Active',
            issueDate: citizen.createdAt,
            expiryDate: new Date(Date.now() + 365 * 86_400_000).toISOString(),
            maxFirearms: 5,
            usedSlots: citizen.totalFirearms ?? 0,
            availableSlots: Math.max(0, 5 - (citizen.totalFirearms ?? 0)),
            isValid: true,
            medicalExamExpiryDate: new Date(Date.now() + 60 * 86_400_000).toISOString(),
            psychologicalExamExpiryDate: new Date(Date.now() + 200 * 86_400_000).toISOString(),
            citizenId: id,
          }),
        );

  const activeAlerts = Math.max(
    citizen.activeAlerts ?? 0,
    db.medicalAlerts.filter((a) => a.citizenId === id && !a.isResolved).length,
  );

  const firearms = getCitizenFirearms(id);
  const totalFirearms = firearms.length;

  return {
    ...citizen,
    permits,
    firearms,
    totalFirearms,
    activeAlerts,
  };
}

export const wpaHandlers = [
  // ── Permit applications ────────────────────────────────────────────────────
  http.get(`${BASE}/wpa/permit-applications`, ({ request }) => {
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');
    let items = db.permitApplications;
    if (statusFilter) items = items.filter((a) => a.status === statusFilter);
    return HttpResponse.json(db.paginate(items, qp(url, 'page', 1), qp(url, 'pageSize', 20)));
  }),

  http.get(`${BASE}/wpa/permit-applications/:id`, ({ params }) => {
    const app = db.permitApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(app);
  }),

  http.post(`${BASE}/wpa/permit-applications/:id/mark-under-review`, async ({ params, request }) => {
    const app = db.permitApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const body = (await request.json().catch(() => ({}))) as {
      medicalExamExpiryDate?: string;
      psychologicalExamExpiryDate?: string;
    };
    if (body.medicalExamExpiryDate) app.medicalExamExpiryDate = body.medicalExamExpiryDate;
    if (body.psychologicalExamExpiryDate) app.psychologicalExamExpiryDate = body.psychologicalExamExpiryDate;
    app.status = 'UnderReview';
    app.statusName = 'UnderReview';
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/wpa/permit-applications/:id/approve`, async ({ params, request }) => {
    const app = db.permitApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const body = await request.json() as any;
    Object.assign(app, {
      status: 'Approved',
      statusName: 'Approved',
      reviewedAt: new Date().toISOString(),
      reviewedByOfficerName: OFFICER_NAME,
      medicalExamExpiryDate: body.medicalExamExpiryDate,
      psychologicalExamExpiryDate: body.psychologicalExamExpiryDate,
    });
    db.permits.push({
      id: db.uid(),
      permitNumber: generatePermitNumber(),
      permitType: app.requestedPermitType,
      permitTypeName: app.requestedPermitTypeName,
      status: 'Active',
      statusName: 'Active',
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 5 * 365 * 86_400_000).toISOString(),
      maxFirearms: body.maxFirearms,
      usedSlots: 0,
      availableSlots: body.maxFirearms,
      isValid: true,
      medicalExamExpiryDate: body.medicalExamExpiryDate,
      psychologicalExamExpiryDate: body.psychologicalExamExpiryDate,
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/wpa/permit-applications/:id/reject`, async ({ params, request }) => {
    const app = db.permitApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const body = await request.json() as any;
    Object.assign(app, {
      status: 'Rejected', statusName: 'Rejected',
      rejectionReason: body.reason ?? null,
      medicalExamExpiryDate: body.medicalExamExpiryDate ?? app.medicalExamExpiryDate,
      psychologicalExamExpiryDate: body.psychologicalExamExpiryDate ?? app.psychologicalExamExpiryDate,
      reviewedAt: new Date().toISOString(),
      reviewedByOfficerName: OFFICER_NAME,
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/wpa/permit-applications/:id/require-correction`, async ({ params, request }) => {
    const app = db.permitApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const body = await request.json() as any;
    Object.assign(app, {
      status: 'RequiresCorrection', statusName: 'RequiresCorrection',
      correctionNotes: body.reason ?? null,
      medicalExamExpiryDate: body.medicalExamExpiryDate ?? app.medicalExamExpiryDate,
      psychologicalExamExpiryDate: body.psychologicalExamExpiryDate ?? app.psychologicalExamExpiryDate,
      reviewedAt: new Date().toISOString(),
      reviewedByOfficerName: OFFICER_NAME,
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${BASE}/wpa/permit-applications/:appId/attachments/:attId`, () =>
    new HttpResponse(new Blob(['mock pdf content'], { type: 'application/pdf' }))
  ),

  // ── Promise applications ───────────────────────────────────────────────────
  http.get(`${BASE}/wpa/promise-applications`, ({ request }) => {
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');
    let items = db.promiseApplications;
    if (statusFilter) items = items.filter((a) => a.status === statusFilter);
    return HttpResponse.json(db.paginate(items, qp(url, 'page', 1), qp(url, 'pageSize', 20)));
  }),

  http.get(`${BASE}/wpa/promise-applications/:id`, ({ params }) => {
    const app = db.promiseApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(app);
  }),

  http.post(`${BASE}/wpa/promise-applications/:id/mark-under-review`, ({ params }) => {
    const app = db.promiseApplications.find((a) => a.id === params.id);
    if (app) { app.status = 'UnderReview'; app.statusName = 'UnderReview'; }
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/wpa/promise-applications/:id/approve`, ({ params }) => {
    const app = db.promiseApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    Object.assign(app, {
      status: 'Approved', statusName: 'Approved',
      reviewedAt: new Date().toISOString(),
      reviewedByOfficerName: OFFICER_NAME,
    });
    db.promises.push({
      id: db.uid(),
      promiseNumber: generatePromiseNumber(),
      weaponType: app.requestedWeaponType,
      quantity: app.requestedQuantity,
      usedQuantity: 0,
      remainingQuantity: app.requestedQuantity,
      status: 'Active',
      statusName: 'Active',
      feeAmount: 17.00,
      paymentStatus: 'Paid',
      paymentStatusName: 'Paid',
      qrToken: `QR-${db.uid().toUpperCase()}`,
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 180 * 86_400_000).toISOString(),
      isValid: true,
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/wpa/promise-applications/:id/reject`, async ({ params, request }) => {
    const app = db.promiseApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const body = await request.json() as any;
    Object.assign(app, {
      status: 'Rejected', statusName: 'Rejected',
      rejectionReason: body.reason ?? null,
      reviewedAt: new Date().toISOString(),
      reviewedByOfficerName: OFFICER_NAME,
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/wpa/promise-applications/:id/require-correction`, async ({ params, request }) => {
    const app = db.promiseApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const body = await request.json() as any;
    Object.assign(app, {
      status: 'RequiresCorrection', statusName: 'RequiresCorrection',
      correctionNotes: body.reason ?? null,
      reviewedAt: new Date().toISOString(),
      reviewedByOfficerName: OFFICER_NAME,
    });
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Citizens ───────────────────────────────────────────────────────────────
  http.get(`${BASE}/wpa/citizens`, ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
    const searchBy = url.searchParams.get('searchBy') ?? 'all';
    const permitType = url.searchParams.get('permitType');
    const hasAlerts = url.searchParams.get('hasAlerts');

    let items = db.wpaCitizens.map((c) => ({
      ...c,
      activeAlerts: Math.max(
        c.activeAlerts ?? 0,
        db.medicalAlerts.filter((a) => a.citizenId === c.id && !a.isResolved).length,
      ),
      totalFirearms: getCitizenFirearms(c.id).length,
    }));

    if (q) {
      items = items.filter((c) => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        const permitNumbers = (c.permits ?? []).map((p: { permitNumber: string }) => p.permitNumber.toLowerCase());
        if (searchBy === 'name') return fullName.includes(q);
        if (searchBy === 'pesel') return String(c.pesel).includes(q);
        if (searchBy === 'permitNumber') return permitNumbers.some((n: string) => n.includes(q));
        return (
          fullName.includes(q)
          || String(c.pesel).includes(q)
          || permitNumbers.some((n: string) => n.includes(q))
          || String(c.weaponBookNumber ?? '').toLowerCase().includes(q)
        );
      });
    }

    if (permitType) {
      items = items.filter((c) =>
        (c.permits ?? []).some((p: { permitTypeName: string }) => p.permitTypeName === permitType),
      );
    }

    if (hasAlerts === 'true') {
      items = items.filter((c) => c.activeAlerts > 0);
    }

    return HttpResponse.json(db.paginate(items, qp(url, 'page', 1), qp(url, 'pageSize', 20)));
  }),

  http.get(`${BASE}/wpa/citizens/:id`, ({ params }) => {
    const detail = buildWpaCitizenDetail(String(params.id));
    if (!detail) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(detail);
  }),

  // ── Firearms search ────────────────────────────────────────────────────────
  http.get(`${BASE}/wpa/firearms`, ({ request }) => {
    const url = new URL(request.url);
    const serialNumber = url.searchParams.get('serialNumber')?.toLowerCase() ?? '';
    const pesel = url.searchParams.get('pesel') ?? '';
    const permitNumber = url.searchParams.get('permitNumber')?.toLowerCase() ?? '';

    const results = db.firearms
      .map(mapFirearmToSearchResult)
      .filter((f) => {
        if (serialNumber && !f.serialNumber.toLowerCase().includes(serialNumber)) return false;
        if (pesel && !f.ownerPesel.includes(pesel)) return false;
        if (permitNumber && !f.permitNumber.toLowerCase().includes(permitNumber)) return false;
        return true;
      });

    return HttpResponse.json(db.paginate(results, qp(url, 'page', 1), qp(url, 'pageSize', 20)));
  }),

  // ── Medical alerts ─────────────────────────────────────────────────────────
  http.get(`${BASE}/wpa/medical-alerts`, ({ request }) => {
    db.syncMedicalAlertsFromPermits();
    const url = new URL(request.url);
    const resolvedFilter = url.searchParams.get('resolved');
    const items = db.medicalAlerts.filter(
      (a) => resolvedFilter === null || a.isResolved === (resolvedFilter === 'true'),
    );
    return HttpResponse.json(db.paginate(items, qp(url, 'page', 1), qp(url, 'pageSize', 20)));
  }),

  // ── Permit management ──────────────────────────────────────────────────────
  http.post(`${BASE}/wpa/permits/:id/suspend`, ({ params }) => {
    const p = db.permits.find((p) => p.id === params.id);
    if (!p) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    Object.assign(p, { status: 'Suspended', statusName: 'Suspended', isValid: false });
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/wpa/permits/:id/revoke`, ({ params }) => {
    const p = db.permits.find((p) => p.id === params.id);
    if (!p) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    Object.assign(p, { status: 'Revoked', statusName: 'Revoked', isValid: false });
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/wpa/permits/:id/restore`, ({ params }) => {
    const p = db.permits.find((p) => p.id === params.id);
    if (!p) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    Object.assign(p, { status: 'Active', statusName: 'Active', isValid: true });
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch(`${BASE}/wpa/permits/:id/medical-exams`, async ({ params, request }) => {
    const p = db.permits.find((p) => p.id === params.id);
    if (!p) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const body = await request.json() as any;
    p.medicalExamExpiryDate = body.medicalExamExpiryDate;
    p.psychologicalExamExpiryDate = body.psychologicalExamExpiryDate;
    db.syncMedicalAlertsFromPermits();
    return new HttpResponse(null, { status: 204 });
  }),
];
