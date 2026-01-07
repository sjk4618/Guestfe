export const DEFAULT_CUTOFF_HOUR = 12;
export const DEFAULT_CUTOFF_MINUTE = 0;

export function getBusinessDateFor(
  date: Date,
  cutoffHour: number = DEFAULT_CUTOFF_HOUR,
  cutoffMinute: number = DEFAULT_CUTOFF_MINUTE,
) {
  const cutoff = new Date(date);
  cutoff.setHours(cutoffHour, cutoffMinute, 0, 0);

  const businessDate = new Date(date);
  if (date < cutoff) {
    businessDate.setDate(businessDate.getDate() - 1);
  }
  businessDate.setHours(0, 0, 0, 0);

  return businessDate;
}
