export const createBarChartTwo = (data, elementId, title, color) => {
  const aggregatedData = Object.keys(data).map((day) => ({
    day: day,
    count: data[day],
  }));

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
    .domain(aggregatedData.map((d) => d.day))
    .range([0, width])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(aggregatedData, (d) => d.count)])
    .nice()
    .range([height, 0]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.append("g").call(d3.axisLeft(y));

  const barWidth = Math.min(x.bandwidth(), 48);

  const roundedTopBar = (bx, by, w, h) => {
    const r = Math.min(4, w / 2, h);
    return `M${bx},${by + h}V${by + r}Q${bx},${by} ${bx + r},${by}H${bx + w - r}Q${bx + w},${by} ${bx + w},${by + r}V${by + h}Z`;
  };

  svg
    .selectAll(".bar")
    .data(aggregatedData)
    .enter()
    .append("path")
    .attr("class", "bar")
    .attr("d", (d) =>
      roundedTopBar(
        x(d.day) + (x.bandwidth() - barWidth) / 2,
        y(d.count),
        barWidth,
        height - y(d.count),
      ),
    )
    .attr("fill", color);

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text(title);
};
