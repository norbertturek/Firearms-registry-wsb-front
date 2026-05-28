/** Mirrors backend WpaService numbering: POZW-/PROM-{yyyyMMdd}-{8 hex chars} */

function dateStamp(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function randomSuffix(length = 8) {
  return crypto.randomUUID().slice(0, length).toUpperCase();
}

export function generatePermitNumber(now = new Date()) {
  return `POZW-${dateStamp(now)}-${randomSuffix()}`;
}

export function generatePromiseNumber(now = new Date()) {
  return `PROM-${dateStamp(now)}-${randomSuffix()}`;
}

export function formatApplicationId(id: string) {
  return id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}
