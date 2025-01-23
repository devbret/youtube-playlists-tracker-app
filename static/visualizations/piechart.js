export const createPieChart = (data, elementId, title) => {
  const width = window.innerWidth - 100;
  const height = 500;
  const margin = 40;

  const radius = Math.min(width, height) / 2 - margin;

  const svg = d3
    .select(elementId)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const color = d3
    .scaleOrdinal()
    .domain(Object.keys(data))
    .range(d3.schemeCategory10);

  const pie = d3.pie().value((d) => d.value);

  const dataReady = pie(
    Object.entries(data).map(([key, value]) => ({
      key,
      value,
    }))
  );

  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  svg
    .selectAll("path")
    .data(dataReady)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.key))
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 0.8);

  svg
    .selectAll("text")
    .data(dataReady)
    .enter()
    .append("text")
    .text((d) => `${d.data.key} (${d.data.value})`)
    .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    .style("text-anchor", "middle")
    .style("font-size", "12px");

  svg
    .append("text")
    .attr("x", 0)
    .attr("y", -height / 2 + margin)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text(title);
};
