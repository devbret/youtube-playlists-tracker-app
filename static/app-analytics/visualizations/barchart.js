export const createBarChart = (data, elementId, title, color) => {
  const aggregatedData = Object.keys(data).map((hour) => ({
    hour: hour,
    count: data[hour],
  }));

  const sortedAggregatedData = aggregatedData.sort((a, b) => a.hour - b.hour);

  const margin = { top: 20, right: 10, bottom: 30, left: 55 },
    width = window.innerWidth * 0.45 - 50 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const svg = d3
    .select(elementId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleBand()
    .domain(sortedAggregatedData.map((d) => d.hour))
    .range([0, width])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(sortedAggregatedData, (d) => d.count)])
    .nice()
    .range([height, 0]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.append("g").call(d3.axisLeft(y));

  svg
    .selectAll(".bar")
    .data(sortedAggregatedData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.hour))
    .attr("y", (d) => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.count))
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
