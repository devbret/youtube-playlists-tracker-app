export const createActivityHeatmap = (data, elementId) => {
  const heatmapData = [];
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  Object.keys(data).forEach((key) => {
    const [day, hour] = key.split("-");
    const count = data[key];
    const dayIndex = daysOfWeek.indexOf(day);

    heatmapData.push({
      day: dayIndex,
      hour: parseInt(hour, 10),
      count: count || 0,
    });
  });

  const margin = { top: 33, right: 20, bottom: 30, left: 100 },
    width = window.innerWidth - 100 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    gridSizeX = width / 24,
    gridSizeY = height / 7;

  const svg = d3
    .select(elementId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const colorScale = d3
    .scaleSequential(d3.interpolateBlues)
    .domain([0, d3.max(heatmapData, (d) => d.count)]);

  svg
    .selectAll(".dayLabel")
    .data(daysOfWeek)
    .enter()
    .append("text")
    .text((d) => d)
    .attr("x", -80)
    .attr("y", (d, i) => i * gridSizeY)
    .attr("transform", `translate(-20, ${gridSizeY / 1.5})`)
    .attr("class", "dayLabel");

  const hours = Array.from(Array(24).keys());
  svg
    .selectAll(".hourLabel")
    .data(hours)
    .enter()
    .append("text")
    .text((d) => d)
    .attr("x", (d, i) => i * gridSizeX)
    .attr("y", -5)
    .attr("transform", `translate(${gridSizeX / 2 - 5}, 0)`)
    .attr("class", "hourLabel");

  svg
    .selectAll(".hour")
    .data(heatmapData)
    .enter()
    .append("rect")
    .attr("x", (d) => d.hour * gridSizeX)
    .attr("y", (d) => d.day * gridSizeY)
    .attr("width", gridSizeX)
    .attr("height", gridSizeY)
    .style("fill", (d) => colorScale(d.count));
};
