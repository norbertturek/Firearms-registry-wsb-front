import { http, HttpResponse } from 'msw';
import * as db from '../db';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const shopHandlers = [
  http.post(`${BASE}/shop/verify-permit`, async ({ request }) => {
    const body = await request.json() as { qrToken?: string; promiseNumber?: string };

    const promise = db.promises.find(
      (p) =>
        (body.qrToken && p.qrToken === body.qrToken) ||
        (body.promiseNumber && p.promiseNumber === body.promiseNumber)
    );

    if (!promise || !promise.isValid) {
      return HttpResponse.json({
        isValid: false,
        message: 'Promesa nie istnieje lub jest nieważna',
        citizenName: '',
        permitNumber: '',
        permitType: '',
        availableSlots: 0,
        weaponType: '',
        remainingPromiseQuantity: 0,
        promiseExpiryDate: '',
        medicalExamsValid: false,
      });
    }

    const permit = db.permits.find((p) =>
      db.promises.some((pr) => pr.id === promise.id)
    ) ?? db.permits[0];

    return HttpResponse.json({
      isValid: true,
      message: 'Promesa jest ważna',
      citizenName: 'Jan Kowalski',
      permitNumber: permit?.permitNumber ?? 'POZW-20240501-DEMO0001',
      permitType: permit?.permitTypeName ?? 'Sport',
      availableSlots: permit?.availableSlots ?? 4,
      weaponType: promise.weaponType,
      remainingPromiseQuantity: promise.remainingQuantity,
      promiseExpiryDate: promise.expiryDate ?? '',
      medicalExamsValid: true,
    });
  }),

  http.post(`${BASE}/shop/firearms/register-sale`, async ({ request }) => {
    const body = await request.json() as any;
    const newId = db.uid();

    db.firearms.push({
      id: newId,
      brand: body.brand,
      model: body.model,
      category: body.category,
      categoryName: body.category,
      caliber: body.caliber,
      serialNumber: body.serialNumber,
      productionYear: body.productionYear,
      status: 'Registered',
      statusName: 'Registered',
      registeredAt: new Date().toISOString(),
      ownershipHistory: [
        {
          id: db.uid(),
          previousOwnerName: null,
          newOwnerName: 'Jan Kowalski',
          transferType: 'Sale',
          transferTypeName: 'Sale',
          transferDate: new Date().toISOString(),
          notes: 'Purchase from shop',
        },
      ],
    });

    const promise = db.promises.find((p) => p.qrToken === body.qrToken);
    if (promise && promise.remainingQuantity > 0) {
      promise.usedQuantity += 1;
      promise.remainingQuantity -= 1;
      if (promise.remainingQuantity === 0) {
        promise.status = 'Used';
        promise.statusName = 'Used';
        promise.isValid = false;
      }
    }

    return HttpResponse.json({
      success: true,
      message: 'Sprzedaż zarejestrowana pomyślnie',
      firearmId: newId,
      registrationNumber: `REJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 90_000) + 10_000}`,
    });
  }),
];
