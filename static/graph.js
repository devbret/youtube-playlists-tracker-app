const width = window.innerWidth,
    height = window.innerHeight;

const svg = d3
    .select('#graph')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(
        d3.zoom().on('zoom', function (event) {
            container.attr('transform', event.transform);
        })
    );

const container = svg.append('g');
const tooltip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0).style('position', 'absolute');

const simulation = d3
    .forceSimulation()
    .force(
        'link',
        d3
            .forceLink()
            .id((d) => d.id)
            .distance(100)
    )
    .force('charge', d3.forceManyBody().strength(-400))
    .force('center', d3.forceCenter(width / 2, height / 2));

d3.json('/api/playlists.json')
    .then(function (data) {
        const nodes = [];
        const links = [];

        const gameMap = new Map();
        const youtuberMap = new Map();

        data.playlists.forEach((d) => {
            if (!gameMap.has(d.game)) {
                gameMap.set(d.game, { id: d.game, type: 'game' });
                nodes.push(gameMap.get(d.game));
            }
            if (!youtuberMap.has(d.youtuber)) {
                youtuberMap.set(d.youtuber, { id: d.youtuber, type: 'youtuber' });
                nodes.push(youtuberMap.get(d.youtuber));
            }
            links.push({ source: d.game, target: d.youtuber });
        });

        const graph = { nodes: nodes, links: links };

        const link = container
            .append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(graph.links)
            .enter()
            .append('line')
            .attr('stroke-width', 2)
            .attr('stroke', '#ccc');

        const node = container
            .append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(graph.nodes)
            .enter()
            .append('circle')
            .attr('r', 10)
            .attr('fill', (d) => (d.type === 'game' ? 'aqua' : 'magenta'))
            .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended))
            .on('mouseover', mouseOver)
            .on('mouseout', mouseOut)
            .on('click', (event, d) => {
                const urlToOpen = d.type === 'external' ? d.parentUrl : d.id;
                window.open(urlToOpen, '_blank');
            });

        const label = container
            .append('g')
            .attr('class', 'labels')
            .selectAll('text')
            .data(graph.nodes)
            .enter()
            .append('text')
            .attr('class', 'label')
            .text((d) => d.id);

        const linkedByIndex = {};
        graph.links.forEach((d) => {
            linkedByIndex[d.source.id + ',' + d.target.id] = 1;
            linkedByIndex[d.target.id + ',' + d.source.id] = 1;
        });

        function isConnected(a, b) {
            return linkedByIndex[a.id + ',' + b.id] || linkedByIndex[b.id + ',' + a.id] || a.id === b.id;
        }

        function mouseOver(event, d) {
            tooltip.transition().duration(300).style('opacity', 1);
            tooltip
                .html(d.id)
                .style('left', event.pageX + 5 + 'px')
                .style('top', event.pageY - 28 + 'px');

            node.classed('dimmed', true);
            link.classed('dimmed', true);
            node.filter((n) => n === d || links.some((l) => (l.source === d && l.target === n) || (l.target === d && l.source === n)))
                .classed('dimmed', false)
                .classed('highlight', true);
            link.filter((l) => l.source === d || l.target === d)
                .classed('dimmed', false)
                .classed('highlight', true);
        }

        function mouseOut(event, d) {
            tooltip.transition().duration(300).style('opacity', 0);
            node.classed('dimmed', false).classed('highlight', false);
            link.classed('dimmed', false).classed('highlight', false);
        }

        simulation.nodes(graph.nodes).on('tick', ticked);
        simulation.force('link').links(graph.links);

        function ticked() {
            link.attr('x1', (d) => d.source.x)
                .attr('y1', (d) => d.source.y)
                .attr('x2', (d) => d.target.x)
                .attr('y2', (d) => d.target.y);
            node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
            label.attr('x', (d) => d.x + 12).attr('y', (d) => d.y + 3);
        }

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        const legendData = [
            { label: 'Video Game', color: 'aqua' },
            { label: 'YouTuber', color: 'magenta' },
        ];

        const legend = svg
            .append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width - 200}, 20)`);

        legend
            .append('rect')
            .attr('x', -10)
            .attr('y', -10)
            .attr('width', 160)
            .attr('height', 65)
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', 1);

        legend
            .selectAll('rect.legend-color')
            .data(legendData)
            .enter()
            .append('rect')
            .attr('class', 'legend-color')
            .attr('x', 0)
            .attr('y', (d, i) => i * 25)
            .attr('width', 18)
            .attr('height', 18)
            .attr('fill', (d) => d.color);

        legend
            .selectAll('text')
            .data(legendData)
            .enter()
            .append('text')
            .attr('x', 25)
            .attr('y', (d, i) => i * 25 + 14)
            .text((d) => d.label)
            .attr('fill', '#333')
            .style('font-size', '14px')
            .style('font-family', 'Arial, sans-serif')
            .style('font-weight', 'bold');

        const homeLink = d3
            .select('body')
            .append('a')
            .attr('href', '/')
            .style('position', 'fixed')
            .style('top', '10px')
            .style('left', '10px')
            .style('padding', '10px 20px')
            .style('background-color', 'white')
            .style('color', 'black')
            .style('text-decoration', 'none')
            .style('border', '1px solid black')
            .style('border-radius', '5px')
            .style('font-family', 'Arial, sans-serif')
            .text('Home');
    })
    .catch(function (error) {
        console.error('Error loading or processing data:', error);
    });
