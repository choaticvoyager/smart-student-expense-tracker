export function formatMoney(amount: number): string {
  const negative = amount < 0;
  const fixed = Math.abs(amount).toFixed(2);
  const [whole, fraction] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}Rs. ${grouped}.${fraction}`;
}

export function parseAmount(value: string): number | null {
  const normalized = value.replace(/,/g, '').trim();
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) {
    return null;
  }
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 999999.99) {
    return null;
  }
  return Math.round(amount * 100) / 100;
}
