// Klass nomlarini birlashtirish (false/null/undefined tashlab yuboriladi)
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
