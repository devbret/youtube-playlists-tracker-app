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

            data.forEach((row) => {
                const { Timestamp, Message, User } = row;
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
                }
            });

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

            createGraph(dateCounts, '#graph1', '', 'steelblue');
            createGraph(postCounts, '#graph2', '', 'green');
            createGraph(getCounts, '#graph3', '', 'red');
            createGraph(youtuberCounts, '#graph4', '', 'purple');
            createGraph(updateCounts, '#graph5', '', 'orange');
            createGraph(deleteCounts, '#graph6', '', 'grey');
            createGraph(searchCounts, '#graph7', '', 'magenta');

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
                const wordEntries = Object.entries(data).map(([word, count]) => ({ text: word, size: count * 10 }));

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
                    d3.select(elementId)
                        .append('svg')
                        .attr('width', width)
                        .attr('height', height)
                        .append('g')
                        .attr('transform', `translate(${width / 2},${height / 2})`)
                        .selectAll('text')
                        .data(words)
                        .enter()
                        .append('text')
                        .style('font-size', (d) => `${d.size}px`)
                        .style('fill', () => `hsl(${Math.random() * 360}, 100%, 50%)`)
                        .attr('text-anchor', 'middle')
                        .attr('transform', (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
                        .text((d) => d.text);
                }
            };

            createWordCloud(searchQueries, '#wordCloud');
        })
        .catch(function (error) {
            console.error('Error fetching or parsing data:', error);
        });
});
