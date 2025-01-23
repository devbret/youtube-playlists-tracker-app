export const fillMissingDates = (counts) => {
  const dates = Object.keys(counts).sort((a, b) => new Date(a) - new Date(b));
  const startDate = new Date(dates[0]);
  const endDate = new Date();
  const dateCounts = {};

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dateString = date.toISOString().split("T")[0];
    dateCounts[dateString] = counts[dateString] || 0;
  }

  return dateCounts;
};
