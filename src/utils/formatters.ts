export const parseNumber = (val: any) => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  
  let str = String(val).trim();
  str = str.replace(/[R$\s]/gi, ''); 
  if (!str) return 0;
  
  if (str.includes(',') && str.includes('.')) {
     const lastComma = str.lastIndexOf(',');
     const lastDot = str.lastIndexOf('.');
     if (lastComma > lastDot) {
         return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
     } else {
         return parseFloat(str.replace(/,/g, '')) || 0;
     }
  }
  
  if (str.includes(',')) {
      return parseFloat(str.replace(',', '.')) || 0;
  }
  
  return parseFloat(str) || 0;
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);
};

export const formatDateForInput = (dateVal: any) => {
  if (!dateVal) return '';
  if (!isNaN(dateVal) && Number(dateVal) > 20000 && Number(dateVal) < 70000) {
    const date = new Date((Number(dateVal) - 25569) * 86400 * 1000);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toISOString().split('T')[0];
  }
  if (typeof dateVal === 'string' && dateVal.includes('/')) {
    const parts = dateVal.split('/');
    if (parts.length >= 3) {
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      let y = parts[2].substring(0, 4);
      if (y.length === 2) y = '20' + y;
      return `${y}-${m}-${d}`;
    }
  }
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch (e) {}
  return '';
};

export const formatToBRDate = (isoDateStr?: string, fallbackTimestamp?: number) => {
  if (isoDateStr && isoDateStr.includes('-')) {
    const [y, m, d] = isoDateStr.split('-');
    return `${d}/${m}/${y}`;
  }
  if (fallbackTimestamp) {
    return new Date(fallbackTimestamp).toLocaleDateString('pt-BR');
  }
  return 'N/A';
};
