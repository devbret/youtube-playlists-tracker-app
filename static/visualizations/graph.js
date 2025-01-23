export const createGraph = (data, elementId, title, color) => {
  const aggregatedData = Object.keys(data).map((date) => ({
    date: new Date(date),
    count: data[date] instanceof Set ? data[date].size : data[date],
  }));

  const margin = { top: 20, right: 10, bottom: 30, left: 40 },
    width = window.innerWidth - 100 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const svg = d3
    .select(elementId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleTime()
    .domain(d3.extent(aggregatedData, (d) => d.date))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(aggregatedData, (d) => d.count)])
    .nice()
    .range([height, 0]);

  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.count));

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("path")
    .datum(aggregatedData)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 1.5)
    .attr("d", line);

  svg
    .selectAll("dot")
    .data(aggregatedData)
    .enter()
    .append("circle")
    .attr("r", 5)
    .attr("cx", (d) => x(d.date))
    .attr("cy", (d) => y(d.count))
    .attr("fill", color);

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text(title);
};
