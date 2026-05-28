import { http, HttpResponse } from 'msw';
import * as db from '../db';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const citizenHandlers = [
  // ── Profile ────────────────────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me`, () =>
    HttpResponse.json({
      id: db.IDS.citizenProfile,
      firstName: 'Jan',
      lastName: 'Kowalski',
      peselMasked: '90010*****',
      address: 'ul. Testowa 1, 00-001 Warszawa',
      documentNumber: 'ABC123456',
      weaponBookNumber: 'WB-2024-00001',
      createdAt: new Date(Date.now() - 400 * 86_400_000).toISOString(),
    })
  ),

  // ── Permits ────────────────────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me/permits`, () => HttpResponse.json(db.permits)),

  // ── Permit applications ────────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me/permit-applications`, () =>
    HttpResponse.json(db.permitApplications.map(({ citizenId, citizenName, citizenPesel, reviewedByOfficerName, ...rest }) => rest))
  ),

  http.post(`${BASE}/citizen/me/permit-applications`, async ({ request }) => {
    const body = await request.json() as any;
    const app = {
      id: db.uid(),
      citizenId: db.IDS.citizenProfile,
      citizenName: 'Jan Kowalski',
      citizenPesel: '90010*****',
      requestedPermitType: body.requestedPermitType,
      requestedPermitTypeName: body.requestedPermitType,
      reason: body.reason,
      medicalExamExpiryDate: body.medicalExamExpiryDate ?? null,
      psychologicalExamExpiryDate: body.psychologicalExamExpiryDate ?? null,
      status: 'Submitted',
      statusName: 'Submitted',
      rejectionReason: null,
      correctionNotes: null,
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedByOfficerName: null,
      attachments: [],
    };
    db.permitApplications.push(app);
    return HttpResponse.json(app, { status: 201 });
  }),

  http.put(`${BASE}/citizen/me/permit-applications/:id/correction`, async ({ params, request }) => {
    const app = db.permitApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const body = await request.json() as any;
    Object.assign(app, {
      requestedPermitType: body.requestedPermitType,
      requestedPermitTypeName: body.requestedPermitType,
      reason: body.reason,
      status: 'Submitted',
      statusName: 'Submitted',
      correctionNotes: null,
    });
    return HttpResponse.json(app);
  }),

  http.post(`${BASE}/citizen/me/permit-applications/:id/attachments`, ({ params }) => {
    const app = db.permitApplications.find((a) => a.id === params.id);
    const att = {
      id: db.uid(),
      attachmentType: 'MedicalCertificate',
      attachmentTypeName: 'MedicalCertificate',
      fileName: 'dokument.pdf',
      contentType: 'application/pdf',
      fileSize: 102_400,
      createdAt: new Date().toISOString(),
    };
    if (app) app.attachments.push(att);
    return HttpResponse.json([att], { status: 201 });
  }),

  // ── Promise applications ───────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me/promise-applications`, () =>
    HttpResponse.json(db.promiseApplications.map(({ citizenId, citizenName, citizenPesel, reviewedByOfficerName, ...rest }) => rest))
  ),

  http.post(`${BASE}/citizen/me/promise-applications`, async ({ request }) => {
    const body = await request.json() as any;
    const permit = db.permits.find((p) => p.id === body.permitId);
    const app = {
      id: db.uid(),
      citizenId: db.IDS.citizenProfile,
      citizenName: 'Jan Kowalski',
      citizenPesel: '90010*****',
      permitId: body.permitId,
      permitNumber: permit?.permitNumber ?? '',
      permitType: permit?.permitTypeName ?? '',
      requestedWeaponType: body.requestedWeaponType,
      requestedQuantity: body.requestedQuantity,
      status: 'Submitted',
      statusName: 'Submitted',
      rejectionReason: null,
      correctionNotes: null,
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedByOfficerName: null,
    };
    db.promiseApplications.push(app);
    return HttpResponse.json(app, { status: 201 });
  }),

  http.put(`${BASE}/citizen/me/promise-applications/:id/correction`, async ({ params, request }) => {
    const app = db.promiseApplications.find((a) => a.id === params.id);
    if (!app) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const body = await request.json() as any;
    Object.assign(app, {
      requestedWeaponType: body.requestedWeaponType,
      requestedQuantity: body.requestedQuantity,
      status: 'Submitted',
      statusName: 'Submitted',
      correctionNotes: null,
    });
    return HttpResponse.json(app);
  }),

  // ── Promises ───────────────────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me/promises`, () => HttpResponse.json(db.promises)),

  // ── Firearms ───────────────────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me/firearms`, () =>
    HttpResponse.json(db.firearms.map(({ ownershipHistory, ...f }) => f))
  ),

  http.get(`${BASE}/citizen/me/firearms/:id`, ({ params }) => {
    const f = db.firearms.find((f) => f.id === params.id);
    if (!f) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(f);
  }),

  http.post(`${BASE}/citizen/me/firearms/:id/report-lost`, ({ params }) => {
    const f = db.firearms.find((f) => f.id === params.id);
    if (f) { f.status = 'Lost'; f.statusName = 'Lost'; }
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Transfer requests ──────────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me/transfer-requests`, () => HttpResponse.json(db.transferRequests)),

  http.post(`${BASE}/citizen/me/transfer-requests`, async ({ request }) => {
    const body = await request.json() as any;
    const firearm = db.firearms.find((f) => f.id === body.firearmId);
    const req = {
      id: db.uid(),
      firearmId: body.firearmId,
      firearmDescription: firearm
        ? `${firearm.brand} ${firearm.model} (${firearm.serialNumber})`
        : body.firearmId,
      buyerName: null,
      transferType: body.transferType,
      transferTypeName: body.transferType,
      status: 'PendingAcceptance',
      statusName: 'PendingAcceptance',
      transactionDate: null,
      createdAt: new Date().toISOString(),
      isSeller: true,
      isBuyer: false,
    };
    db.transferRequests.push(req);
    return HttpResponse.json(req, { status: 201 });
  }),

  http.post(`${BASE}/citizen/me/transfer-requests/:id/accept`, ({ params }) => {
    const req = db.transferRequests.find((r) => r.id === params.id);
    if (req) { req.status = 'Accepted'; req.statusName = 'Accepted'; }
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/citizen/me/transfer-requests/:id/reject`, ({ params }) => {
    const req = db.transferRequests.find((r) => r.id === params.id);
    if (req) { req.status = 'Rejected'; req.statusName = 'Rejected'; }
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/citizen/me/transfer-requests/:id/cancel`, ({ params }) => {
    const req = db.transferRequests.find((r) => r.id === params.id);
    if (req) { req.status = 'Cancelled'; req.statusName = 'Cancelled'; }
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Medical alerts ─────────────────────────────────────────────────────────
  http.get(`${BASE}/citizen/me/medical-alerts`, () => {
    db.syncMedicalAlertsFromPermits();
    return HttpResponse.json(db.medicalAlerts.filter((a) => !a.isResolved));
  }),
];
