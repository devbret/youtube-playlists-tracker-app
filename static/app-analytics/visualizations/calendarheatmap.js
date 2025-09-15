const margin = { top: 20, right: 10, bottom: 30, left: 40 },
  width = window.innerWidth * 0.45 - 50 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

export function createCalendarHeatmap(dataObj, selector) {
  const parseISO = d3.timeParse("%Y-%m-%d");
  const entries = Object.entries(dataObj)
    .map(([k, v]) => ({ date: parseISO(k), value: +v }))
    .filter((d) => d.date instanceof Date && !isNaN(d.date));

  const container = d3.select(selector).html("");
  const containerNode = container.node();

  const graphParent =
    containerNode && containerNode.closest
      ? containerNode.closest(".graph-container")
      : null;

  if (graphParent) {
    graphParent.style.minHeight = `580px`;
    graphParent.style.maxHeight = `580px`;
    if (!graphParent.style.display) graphParent.style.display = "block";
  }

  if (!entries.length) {
    container.html("<p>No data available.</p>");
    return;
  }

  const [minDate, maxDate] = d3.extent(entries, (d) => d.date);
  const allDays = d3.timeDay.range(
    d3.timeDay.floor(minDate),
    d3.timeDay.offset(d3.timeDay.ceil(maxDate), 1)
  );
  const keyISO = d3.timeFormat("%Y-%m-%d");
  const valueMap = new Map(entries.map((d) => [keyISO(d.date), d.value]));
  const dense = allDays.map((d) => ({
    date: d,
    value: valueMap.get(keyISO(d)) ?? 0,
  }));

  const byYear = d3.groups(dense, (d) => d.date.getFullYear());
  byYear.sort((a, b) => d3.ascending(a[0], b[0]));

  const cellPad = 2;
  const leftPadForLabels = 30;
  const topPadForLabels = 18;
  const yearGap = 26;

  const maxVal = d3.max(dense, (d) => d.value) || 1;
  const color = d3
    .scaleLinear()
    .domain([0, maxVal])
    .range(["#eef2ff", "#1f77b4"]);

  const fmtMonth = d3.timeFormat("%b");
  const fmtISO = d3.timeFormat("%Y-%m-%d");

  byYear.forEach(([year, days]) => {
    const firstDay = d3.timeDay.floor(new Date(year, 0, 1));
    const lastDay = d3.timeDay.floor(new Date(year, 11, 31));

    const weeks =
      d3.timeWeek.count(
        d3.timeWeek.floor(firstDay),
        d3.timeWeek.ceil(lastDay)
      ) + 1;

    const parentInnerWidth = graphParent
      ? Math.max(120, graphParent.clientWidth - 50 - margin.left - margin.right)
      : Math.max(120, width);

    const innerGridHeight = Math.max(120, height);

    const maxCellSizeFromWidth =
      (parentInnerWidth - leftPadForLabels - 2) / weeks - cellPad;
    const maxCellSizeFromHeight =
      (innerGridHeight - topPadForLabels - 2) / 7 - cellPad;

    const baseCell = 14;
    const cellSize = Math.max(
      6,
      Math.min(baseCell, maxCellSizeFromWidth, maxCellSizeFromHeight)
    );

    const svgWidth = margin.left + parentInnerWidth + margin.right;
    const svgHeight =
      margin.top +
      (topPadForLabels + 7 * (cellSize + cellPad) + 2) +
      margin.bottom;

    const svg = container
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .style("display", "block")
      .style("margin-bottom", yearGap + "px");

    svg
      .append("text")
      .attr("x", margin.left)
      .attr("y", margin.top - 8)
      .attr("dominant-baseline", "baseline")
      .attr("font-size", 12)
      .attr("font-weight", 600)
      .attr("fill", "#444")
      .text(year);

    const g = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left + leftPadForLabels},${
          margin.top + topPadForLabels
        })`
      );

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const wl = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${margin.top + topPadForLabels})`
      );
    weekdays.forEach((w, i) => {
      if (i % 2 === 0) {
        wl.append("text")
          .attr("x", leftPadForLabels - 6)
          .attr("y", i * (cellSize + cellPad) + cellSize * 0.75)
          .attr("text-anchor", "end")
          .attr("font-size", 10)
          .attr("fill", "#666")
          .text(w);
      }
    });

    const firstOfMonths = d3.timeMonths(
      new Date(year, 0, 1),
      new Date(year + 1, 0, 1)
    );
    const ml = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left + leftPadForLabels},${
          margin.top + topPadForLabels - 5
        })`
      );
    firstOfMonths.forEach((m0) => {
      const x =
        d3.timeWeek.count(d3.timeWeek.floor(firstDay), d3.timeWeek.floor(m0)) *
        (cellSize + cellPad);
      ml.append("text")
        .attr("x", x + 2)
        .attr("y", -2)
        .attr("font-size", 10)
        .attr("fill", "#666")
        .text(fmtMonth(m0));
    });

    const cells = g
      .selectAll("rect")
      .data(days)
      .enter()
      .append("rect")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr(
        "x",
        (d) =>
          d3.timeWeek.count(
            d3.timeWeek.floor(firstDay),
            d3.timeWeek.floor(d.date)
          ) *
          (cellSize + cellPad)
      )
      .attr("y", (d) => d.date.getDay() * (cellSize + cellPad))
      .attr("fill", (d) => color(d.value))
      .attr("stroke", "rgba(0,0,0,0.06)");

    cells
      .append("title")
      .text(
        (d) => `${fmtISO(d.date)} — ${d.value} event${d.value === 1 ? "" : "s"}`
      );
  });
}
