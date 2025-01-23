export const createWordCloud = (data, elementId) => {
  const maxCount = Math.max(...Object.values(data));
  const minCount = Math.min(...Object.values(data));
  const wordEntries = Object.entries(data).map(([word, count]) => {
    const size =
      maxCount === minCount
        ? 30
        : 10 + ((count - minCount) / (maxCount - minCount)) * 50;
    return { text: word, size };
  });

  const width = window.innerWidth - 100;
  const height = 500;

  const layout = d3.layout
    .cloud()
    .size([width, height])
    .words(wordEntries)
    .padding(5)
    .rotate(() => ~~(Math.random() * 2) * 90)
    .fontSize((d) => d.size)
    .on("end", draw);

  layout.start();

  function draw(words) {
    const zoom = d3.zoom().scaleExtent([0.5, 10]).on("zoom", zoomed);

    const svg = d3
      .select(elementId)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(zoom);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    g.selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .style("font-size", (d) => `${d.size}px`)
      .style("fill", () => `hsl(${Math.random() * 360}, 100%, 50%)`)
      .attr("text-anchor", "middle")
      .attr("transform", (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
      .text((d) => d.text);

    function zoomed(event) {
      g.attr("transform", event.transform);
    }

    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2));
  }
};
