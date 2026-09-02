const dateFormatterId = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDateId(date: Date) {
  return dateFormatterId.format(date);
}
