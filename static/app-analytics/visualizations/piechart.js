export const createPieChart = (data, elementId, title) => {
  const width = window.innerWidth * 0.45 - 50;
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
    .range(["#007bff", "#eb6834", "#1baf7a", "#4a3aa7"]);

  const pie = d3.pie().value((d) => d.value);

  const dataReady = pie(
    Object.entries(data).map(([key, value]) => ({
      key,
      value,
    })),
  );

  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  svg
    .selectAll("path")
    .data(dataReady)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.key))
    .attr("stroke", "#fafafa")
    .style("stroke-width", "2px");

  svg
    .selectAll(".slice-label")
    .data(dataReady)
    .enter()
    .append("text")
    .attr("class", "slice-label")
    .text((d) =>
      d.endAngle - d.startAngle > 0.25
        ? `${d.data.key} (${d.data.value})`
        : "",
    )
    .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", (d) => (d3.lab(color(d.data.key)).l > 60 ? "#222" : "#fff"));

  const legend = svg
    .append("g")
    .attr("transform", `translate(${-width / 2 + 20},${-height / 2 + 16})`);

  Object.keys(data).forEach((key, i) => {
    const row = legend
      .append("g")
      .attr("transform", `translate(0,${i * 20})`);

    row.append("circle").attr("r", 5).attr("cy", 4).attr("fill", color(key));

    row
      .append("text")
      .attr("x", 12)
      .attr("y", 8)
      .style("font-size", "13px")
      .style("fill", "#555")
      .text(`${key} (${data[key]})`);
  });

  svg
    .append("text")
    .attr("x", 0)
    .attr("y", -height / 2 + margin)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text(title);
};
