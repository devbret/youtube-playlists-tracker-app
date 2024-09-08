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
            const hourCounts = {};
            const hourlyData = {};
            const dayCounts = {
                Monday: 0,
                Tuesday: 0,
                Wednesday: 0,
                Thursday: 0,
                Friday: 0,
                Saturday: 0,
                Sunday: 0,
            };

            data.forEach((row) => {
                const { Timestamp, Time } = row;
                if (!Timestamp || !Time) return;

                const date = new Date(Timestamp);
                const dayOfWeek = date.toLocaleString('en-us', { weekday: 'long' });
                const hour = Time.split(':')[0];

                const key = `${dayOfWeek}-${hour}`;

                if (!hourlyData[key]) {
                    hourlyData[key] = 0;
                }
                hourlyData[key]++;
            });

            data.forEach((row) => {
                const { Timestamp } = row;
                if (!Timestamp) return;

                const date = new Date(Timestamp.split(',')[0]);
                const dayOfWeek = date.getDay();

                switch (dayOfWeek) {
                    case 0:
                        dayCounts.Sunday++;
                        break;
                    case 1:
                        dayCounts.Monday++;
                        break;
                    case 2:
                        dayCounts.Tuesday++;
                        break;
                    case 3:
                        dayCounts.Wednesday++;
                        break;
                    case 4:
                        dayCounts.Thursday++;
                        break;
                    case 5:
                        dayCounts.Friday++;
                        break;
                    case 6:
                        dayCounts.Saturday++;
                        break;
                }
            });

            data.forEach((row) => {
                const { Time, Message } = row;
                if (!Time || !Message) return;

                const hour = Time.split(':')[0];

                if (!hourCounts[hour]) {
                    hourCounts[hour] = 0;
                }
                hourCounts[hour]++;

                const date = row.Timestamp.split(',')[0];

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
                const endDate = new Date();
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
                const maxCount = Math.max(...Object.values(data));
                const minCount = Math.min(...Object.values(data));
                const wordEntries = Object.entries(data).map(([word, count]) => {
                    const size = maxCount === minCount ? 30 : 10 + ((count - minCount) / (maxCount - minCount)) * 50;
                    return { text: word, size };
                });

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

            const createBarChart = (data, elementId, title, color) => {
                const aggregatedData = Object.keys(data).map((hour) => ({
                    hour: hour,
                    count: data[hour],
                }));

                const sortedAggregatedData = aggregatedData.sort((a, b) => a.hour - b.hour);

                const margin = { top: 20, right: 10, bottom: 30, left: 55 },
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
                    .scaleBand()
                    .domain(sortedAggregatedData.map((d) => d.hour))
                    .range([0, width])
                    .padding(0.1);

                const y = d3
                    .scaleLinear()
                    .domain([0, d3.max(sortedAggregatedData, (d) => d.count)])
                    .nice()
                    .range([height, 0]);

                svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));

                svg.append('g').call(d3.axisLeft(y));

                svg.selectAll('.bar')
                    .data(sortedAggregatedData)
                    .enter()
                    .append('rect')
                    .attr('class', 'bar')
                    .attr('x', (d) => x(d.hour))
                    .attr('y', (d) => y(d.count))
                    .attr('width', x.bandwidth())
                    .attr('height', (d) => height - y(d.count))
                    .attr('fill', color);

                svg.append('text')
                    .attr('x', width / 2)
                    .attr('y', 0 - margin.top / 2)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '16px')
                    .style('text-decoration', 'underline')
                    .text(title);
            };

            createBarChart(hourCounts, '#hourlyActions', '', 'blue');

            const createBarChartTwo = (data, elementId, title, color) => {
                const aggregatedData = Object.keys(data).map((day) => ({
                    day: day,
                    count: data[day],
                }));

                const margin = { top: 20, right: 10, bottom: 30, left: 55 },
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
                    .scaleBand()
                    .domain(aggregatedData.map((d) => d.day))
                    .range([0, width])
                    .padding(0.1);

                const y = d3
                    .scaleLinear()
                    .domain([0, d3.max(aggregatedData, (d) => d.count)])
                    .nice()
                    .range([height, 0]);

                svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));

                svg.append('g').call(d3.axisLeft(y));

                svg.selectAll('.bar')
                    .data(aggregatedData)
                    .enter()
                    .append('rect')
                    .attr('class', 'bar')
                    .attr('x', (d) => x(d.day))
                    .attr('y', (d) => y(d.count))
                    .attr('width', x.bandwidth())
                    .attr('height', (d) => height - y(d.count))
                    .attr('fill', color);

                svg.append('text')
                    .attr('x', width / 2)
                    .attr('y', 0 - margin.top / 2)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '16px')
                    .style('text-decoration', 'underline')
                    .text(title);
            };

            createBarChartTwo(dayCounts, '#weeklyActions', '', 'blue');

            const createActivityHeatmap = (data, elementId) => {
                const heatmapData = [];
                const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

                Object.keys(data).forEach((key) => {
                    const [day, hour] = key.split('-');
                    const count = data[key];
                    const dayIndex = daysOfWeek.indexOf(day);

                    heatmapData.push({
                        day: dayIndex,
                        hour: parseInt(hour, 10),
                        count: count || 0,
                    });
                });

                const margin = { top: 33, right: 20, bottom: 30, left: 100 },
                    width = window.innerWidth * 0.43 - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom,
                    gridSizeX = width / 24,
                    gridSizeY = height / 7;

                const svg = d3
                    .select(elementId)
                    .append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);

                const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(heatmapData, (d) => d.count)]);

                svg.selectAll('.dayLabel')
                    .data(daysOfWeek)
                    .enter()
                    .append('text')
                    .text((d) => d)
                    .attr('x', -80)
                    .attr('y', (d, i) => i * gridSizeY)
                    .attr('transform', `translate(-20, ${gridSizeY / 1.5})`)
                    .attr('class', 'dayLabel');

                const hours = Array.from(Array(24).keys());
                svg.selectAll('.hourLabel')
                    .data(hours)
                    .enter()
                    .append('text')
                    .text((d) => d)
                    .attr('x', (d, i) => i * gridSizeX)
                    .attr('y', -5)
                    .attr('transform', `translate(${gridSizeX / 2 - 5}, 0)`)
                    .attr('class', 'hourLabel');

                svg.selectAll('.hour')
                    .data(heatmapData)
                    .enter()
                    .append('rect')
                    .attr('x', (d) => d.hour * gridSizeX)
                    .attr('y', (d) => d.day * gridSizeY)
                    .attr('width', gridSizeX)
                    .attr('height', gridSizeY)
                    .style('fill', (d) => colorScale(d.count));
            };
            createActivityHeatmap(hourlyData, '#activityHeatmap');
        })
        .catch(function (error) {
            console.error('Error fetching or parsing data:', error);
        });
});
