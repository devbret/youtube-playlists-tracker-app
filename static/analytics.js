document.addEventListener('DOMContentLoaded', function () {
    d3.csv('/data/app_log.csv')
        .then(function (data) {
            const dateCounts = {};
            const postCounts = {};
            const getCounts = {};
            const youtuberCounts = {};
            const updateCounts = {};
            const deleteCounts = {};
            const searchCounts = {};
            const searchQueries = {};
            const accessedAnalyticsCounts = {};
            const accessedNetworkGraphCounts = {};

            data.forEach((row) => {
                const { Timestamp, Message } = row;
                const date = Timestamp.split(',')[0];

                if (Message.includes('Added new playlist')) {
                    if (!dateCounts[date]) {
                        dateCounts[date] = 0;
                    }
                    dateCounts[date]++;

                    const youtuber = Message.split(' by ')[1];
                    if (!youtuberCounts[date]) {
                        youtuberCounts[date] = new Set();
                    }
                    youtuberCounts[date].add(youtuber);
                }

                if (Message.includes('POST request to /api/playlists')) {
                    if (!postCounts[date]) {
                        postCounts[date] = 0;
                    }
                    postCounts[date]++;
                }

                if (Message.includes('GET request to /api/playlists')) {
                    if (!getCounts[date]) {
                        getCounts[date] = 0;
                    }
                    getCounts[date]++;
                }

                if (Message.includes('Updated playlist')) {
                    if (!updateCounts[date]) {
                        updateCounts[date] = 0;
                    }
                    updateCounts[date]++;
                }

                if (Message.includes('Deleted playlist')) {
                    if (!deleteCounts[date]) {
                        deleteCounts[date] = 0;
                    }
                    deleteCounts[date]++;
                }

                if (Message.includes('Search term used:')) {
                    if (!searchCounts[date]) {
                        searchCounts[date] = 0;
                    }
                    searchCounts[date]++;
                    const searchTermIndicator = 'Search term used: ';
                    const startIndex = Message.indexOf(searchTermIndicator) + searchTermIndicator.length;
                    const searchTerm = Message.substring(startIndex).trim();
                    if (searchTerm != '') {
                        if (!searchQueries[searchTerm]) {
                            searchQueries[searchTerm] = 1;
                        } else {
                            searchQueries[searchTerm] += 1;
                        }
                    }
                    console.log(searchQueries);
                }

                if (Message.includes('Accessed analytics page.')) {
                    if (!accessedAnalyticsCounts[date]) {
                        accessedAnalyticsCounts[date] = 0;
                    }
                    accessedAnalyticsCounts[date]++;
                }

                if (Message.includes('Accessed network graph page.')) {
                    if (!accessedNetworkGraphCounts[date]) {
                        accessedNetworkGraphCounts[date] = 0;
                    }
                    accessedNetworkGraphCounts[date]++;
                }
            });

            const fillMissingDates = (counts) => {
                const dates = Object.keys(counts).sort((a, b) => new Date(a) - new Date(b));
                const startDate = new Date(dates[0]);
                const endDate = new Date(dates[dates.length - 1]);
                const dateCounts = {};

                for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                    const dateString = date.toISOString().split('T')[0];
                    dateCounts[dateString] = counts[dateString] || 0;
                }

                return dateCounts;
            };

            const createGraph = (data, elementId, title, color) => {
                const aggregatedData = Object.keys(data).map((date) => ({
                    date: new Date(date),
                    count: data[date] instanceof Set ? data[date].size : data[date],
                }));

                const margin = { top: 20, right: 10, bottom: 30, left: 40 },
                    width = window.innerWidth * 0.43 - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom;

                const svg = d3
                    .select(elementId)
                    .append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);

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

                svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));

                svg.append('g').call(d3.axisLeft(y));

                svg.append('path').datum(aggregatedData).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 1.5).attr('d', line);

                svg.selectAll('dot')
                    .data(aggregatedData)
                    .enter()
                    .append('circle')
                    .attr('r', 5)
                    .attr('cx', (d) => x(d.date))
                    .attr('cy', (d) => y(d.count))
                    .attr('fill', color);

                svg.append('text')
                    .attr('x', width / 2)
                    .attr('y', 0 - margin.top / 2)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '16px')
                    .style('text-decoration', 'underline')
                    .text(title);
            };

            const filledDateCounts = fillMissingDates(dateCounts);
            const filledPostCounts = fillMissingDates(postCounts);
            const filledGetCounts = fillMissingDates(getCounts);
            const filledYoutuberCounts = fillMissingDates(youtuberCounts);
            const filledUpdateCounts = fillMissingDates(updateCounts);
            const filledDeleteCounts = fillMissingDates(deleteCounts);
            const filledSearchCounts = fillMissingDates(searchCounts);
            const filledAccessedAnalyticsCounts = fillMissingDates(accessedAnalyticsCounts);
            const filledAccessedNetworkGraphCounts = fillMissingDates(accessedNetworkGraphCounts);

            createGraph(filledDateCounts, '#graph1', '', 'steelblue');
            createGraph(filledPostCounts, '#graph2', '', 'green');
            createGraph(filledGetCounts, '#graph3', '', 'red');
            createGraph(filledYoutuberCounts, '#graph4', '', 'purple');
            createGraph(filledUpdateCounts, '#graph5', '', 'orange');
            createGraph(filledDeleteCounts, '#graph6', '', 'grey');
            createGraph(filledSearchCounts, '#graph7', '', 'magenta');
            createGraph(filledAccessedAnalyticsCounts, '#graph8', '', 'aqua');
            createGraph(filledAccessedNetworkGraphCounts, '#graph9', '', 'lime');

            const createScatterPlot = (data1, data2, elementId, title, color1, color2) => {
                const aggregatedData1 = Object.keys(data1).map((date) => ({
                    date: new Date(date),
                    count: data1[date],
                }));
                const aggregatedData2 = Object.keys(data2).map((date) => ({
                    date: new Date(date),
                    count: data2[date],
                }));

                const margin = { top: 20, right: 30, bottom: 30, left: 40 },
                    width = window.innerWidth * 0.43 - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom;

                const svg = d3
                    .select(elementId)
                    .append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);

                const x = d3
                    .scaleTime()
                    .domain(d3.extent(aggregatedData1, (d) => d.date))
                    .range([0, width]);

                const y = d3
                    .scaleLinear()
                    .domain([0, d3.max(aggregatedData1, (d) => d.count)])
                    .nice()
                    .range([height, 0]);

                svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
                svg.append('g').call(d3.axisLeft(y));

                svg.selectAll('.dot1')
                    .data(aggregatedData1)
                    .enter()
                    .append('circle')
                    .attr('class', 'dot1')
                    .attr('r', 5)
                    .attr('cx', (d) => x(d.date))
                    .attr('cy', (d) => y(d.count))
                    .attr('fill', color1);

                svg.selectAll('.dot2')
                    .data(aggregatedData2)
                    .enter()
                    .append('circle')
                    .attr('class', 'dot2')
                    .attr('r', 5)
                    .attr('cx', (d) => x(d.date))
                    .attr('cy', (d) => y(d.count))
                    .attr('fill', color2);

                svg.append('text')
                    .attr('x', width / 2)
                    .attr('y', 0 - margin.top / 2)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '16px')
                    .style('text-decoration', 'underline')
                    .text(title);
            };

            createScatterPlot(updateCounts, deleteCounts, '#scatterPlot', '', 'orange', 'grey');

            const createWordCloud = (data, elementId) => {
                const wordEntries = Object.entries(data).map(([word, count]) => ({ text: word, size: count * 5 }));

                const width = window.innerWidth * 0.43;
                const height = 500;

                const layout = d3.layout
                    .cloud()
                    .size([width, height])
                    .words(wordEntries)
                    .padding(5)
                    .rotate(() => ~~(Math.random() * 2) * 90)
                    .fontSize((d) => d.size)
                    .on('end', draw);

                layout.start();

                function draw(words) {
                    const zoom = d3.zoom().scaleExtent([0.5, 10]).on('zoom', zoomed);

                    const svg = d3.select(elementId).append('svg').attr('width', width).attr('height', height).call(zoom);

                    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

                    g.selectAll('text')
                        .data(words)
                        .enter()
                        .append('text')
                        .style('font-size', (d) => `${d.size}px`)
                        .style('fill', () => `hsl(${Math.random() * 360}, 100%, 50%)`)
                        .attr('text-anchor', 'middle')
                        .attr('transform', (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
                        .text((d) => d.text);

                    function zoomed(event) {
                        g.attr('transform', event.transform);
                    }

                    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2));
                }
            };

            createWordCloud(searchQueries, '#wordCloud');
        })
        .catch(function (error) {
            console.error('Error fetching or parsing data:', error);
        });
});
