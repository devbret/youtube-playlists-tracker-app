export const createScatterPlot = (
  data1,
  data2,
  elementId,
  title,
  color1,
  color2
) => {
  const aggregatedData1 = Object.keys(data1).map((date) => ({
    date: new Date(date),
    count: data1[date],
  }));
  const aggregatedData2 = Object.keys(data2).map((date) => ({
    date: new Date(date),
    count: data2[date],
  }));

  const margin = { top: 20, right: 30, bottom: 30, left: 40 },
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
    .domain(d3.extent(aggregatedData1, (d) => d.date))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(aggregatedData1, (d) => d.count)])
    .nice()
    .range([height, 0]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));
  svg.append("g").call(d3.axisLeft(y));

  svg
    .selectAll(".dot1")
    .data(aggregatedData1)
    .enter()
    .append("circle")
    .attr("class", "dot1")
    .attr("r", 5)
    .attr("cx", (d) => x(d.date))
    .attr("cy", (d) => y(d.count))
    .attr("fill", color1);

  svg
    .selectAll(".dot2")
    .data(aggregatedData2)
    .enter()
    .append("circle")
    .attr("class", "dot2")
    .attr("r", 5)
    .attr("cx", (d) => x(d.date))
    .attr("cy", (d) => y(d.count))
    .attr("fill", color2);

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text(title);
};
