export const format = {
  currency(value, currency = 'USD', locale = 'en-US') {
    if (value === undefined || value === null || value === '') return '';
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(value));
    } catch (e) {
      return value;
    }
  },
  date(value) {
    if (!value) return '';
    try {
      const d = new Date(value);
      return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
    } catch (e) { return value; }
  }
};
