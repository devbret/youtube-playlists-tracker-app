export const createCalendarHeatmap = (data, elementId) => {
  const container = d3.select(elementId);

  container.selectAll("*").remove();

  const containerNode = container.node();

  if (!containerNode) {
    console.error(`Calendar heatmap container not found: ${elementId}`);
    return;
  }

  const parentWidth = containerNode.getBoundingClientRect().width;
  const parentHeight = containerNode.getBoundingClientRect().height;

  const margin = {
    top: 40,
    right: 30,
    bottom: 30,
    left: 60,
  };

  const availableHeight = parentHeight - margin.top - margin.bottom;

  const parseDate = d3.timeParse("%Y-%m-%d");
  const formatDate = d3.timeFormat("%Y-%m-%d");

  const heatmapData = Object.entries(data)
    .map(([date, count]) => ({
      date: parseDate(date),
      count: count || 0,
    }))
    .filter((d) => d.date);

  if (heatmapData.length === 0) {
    container
      .append("p")
      .text("No calendar heatmap data available.")
      .style("text-align", "center");

    return;
  }

  const minDate = d3.min(heatmapData, (d) => d.date);
  const maxDate = d3.max(heatmapData, (d) => d.date);

  const startDate = d3.timeWeek.floor(minDate);
  const endDate = d3.timeWeek.ceil(maxDate);

  const allDates = d3.timeDays(startDate, d3.timeDay.offset(endDate, 1));

  const dateMap = new Map(
    heatmapData.map((d) => [formatDate(d.date), d.count]),
  );

  const maxCount = d3.max(heatmapData, (d) => d.count) || 1;

  const colorScale = d3
    .scaleSequential(d3.interpolateBlues)
    .domain([0, maxCount]);

  const cellSize = Math.max(availableHeight / 7, 8);

  const weekCount = d3.timeWeek.count(startDate, endDate) + 1;
  const chartWidth = weekCount * cellSize;
  const chartHeight = cellSize * 7;

  const totalWidth = Math.max(
    parentWidth,
    chartWidth + margin.left + margin.right,
  );

  const totalHeight = parentHeight;

  const svg = container
    .append("svg")
    .attr("width", totalWidth)
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .style("display", "block");

  const chartGroup = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const existingTooltip = d3.select("body").select(".calendar-heatmap-tooltip");

  if (!existingTooltip.empty()) {
    existingTooltip.remove();
  }

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "calendar-heatmap-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#ffffff")
    .style("border", "1px solid #cccccc")
    .style("border-radius", "4px")
    .style("padding", "6px 8px")
    .style("font-size", "14px")
    .style("box-shadow", "0 2px 8px rgba(0, 0, 0, 0.15)")
    .style("pointer-events", "none")
    .style("z-index", "9999");

  chartGroup
    .selectAll(".calendar-cell")
    .data(allDates)
    .enter()
    .append("rect")
    .attr("class", "calendar-cell")
    .attr("x", (d) => d3.timeWeek.count(startDate, d) * cellSize)
    .attr("y", (d) => d.getDay() * cellSize)
    .attr("width", Math.max(cellSize - 2, 1))
    .attr("height", Math.max(cellSize - 2, 1))
    .attr("rx", 2)
    .attr("ry", 2)
    .style("fill", (d) => {
      const dateKey = formatDate(d);
      const count = dateMap.get(dateKey) || 0;

      return count === 0 ? "#eeeeee" : colorScale(count);
    })
    .on("mouseover", function (event, d) {
      const dateKey = formatDate(d);
      const count = dateMap.get(dateKey) || 0;

      d3.select(this).style("stroke", "#000000").style("stroke-width", 1);

      tooltip
        .style("visibility", "visible")
        .html(`<strong>${dateKey}</strong><br />Events: ${count}`);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", `${event.pageY - 40}px`)
        .style("left", `${event.pageX + 12}px`);
    })
    .on("mouseout", function () {
      d3.select(this).style("stroke", "none");

      tooltip.style("visibility", "hidden");
    });

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  chartGroup
    .selectAll(".calendar-day-label")
    .data(dayLabels)
    .enter()
    .append("text")
    .attr("class", "calendar-day-label")
    .attr("x", -10)
    .attr("y", (d, i) => i * cellSize + cellSize / 2)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .text((d) => d);

  const monthFormat = d3.timeFormat("%b");

  const months = d3.timeMonths(
    d3.timeMonth.floor(startDate),
    d3.timeMonth.offset(maxDate, 1),
  );

  chartGroup
    .selectAll(".calendar-month-label")
    .data(months)
    .enter()
    .append("text")
    .attr("class", "calendar-month-label")
    .attr("x", (d) => d3.timeWeek.count(startDate, d) * cellSize)
    .attr("y", -10)
    .attr("text-anchor", "start")
    .text((d) => monthFormat(d));

  const yearFormat = d3.timeFormat("%Y");

  const years = d3.timeYears(
    d3.timeYear.floor(startDate),
    d3.timeYear.offset(maxDate, 1),
  );

  chartGroup
    .selectAll(".calendar-year-label")
    .data(years)
    .enter()
    .append("text")
    .attr("class", "calendar-year-label")
    .attr("x", (d) => d3.timeWeek.count(startDate, d) * cellSize)
    .attr("y", chartHeight + 24)
    .attr("text-anchor", "start")
    .text((d) => yearFormat(d));
};
