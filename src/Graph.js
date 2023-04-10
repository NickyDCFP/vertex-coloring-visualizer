import * as d3 from 'd3';
// if you add event listeners, be sure to remove them when you delete the node or destroy
// the graph

// Control stuff with react dropdowns

// Move the graph into its own component, GraphViz component or something
const radius = 7;

const edgeEquals = (edge1, edge2) => {
    return (edge1.source.id === edge2.source.id && edge1.target.id === edge2.target.id) ||
           (edge1.source.id === edge2.target.id && edge1.target.id === edge2.source.id);
}

export class Graph {
    constructor(svg, centerX, centerY, defaultColor, doText) {
        this.adj = new Map();
        this.nodes = [];
        this.edges = [];
        this.v = 0;
        this.defaultColor = defaultColor;
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.edges).strength(0))
            .force('collide', d3.forceCollide().radius(30))
            .force('x', d3.forceX().x(centerX).strength(0.2))
            .force('y', d3.forceY().y(centerY).strength(0.2));
        this.svg = svg.on('mouseup', (event) => this.handleMouseUp(event))
            .on('click', (event) => this.handleClick(event))
            .on('mousedown', (event) => this.handleMouseDown(event))
            .style("cursor", "crosshair");
        this.circles = this.svg.append('g')
            .classed('node-group', true);
        this.circleSelection = this.circles.selectAll('.node');
        this.lines = this.svg.append('g')
            .classed('edge-group', true);
        this.lineSelection = this.lines.selectAll('.edge');
        this.lines.lower();
        this.doText = doText;
        this.text = this.svg.append('g')
            .classed('text-group', true);
        this.text.raise();
        this.textSelection = this.text.selectAll('.node-label');
        this.selectedNode = null;
        this.potentialEdge = null;
        this.createNode = false;
        this.simulation.on('tick', () => {
            this.circleSelection
                .attr('cx', node => node.x)
                .attr('cy', node => node.y);
            this.textSelection
                .attr('x', node => node.x)
                .attr('y', node => node.y + 1);
            this.lineSelection
                .attr('x1', edge => edge.source.x)
                .attr('x2', edge => edge.target.x)
                .attr('y1', edge => edge.source.y)
                .attr('y2', edge => edge.target.y);
        });
    }
    handleClick(event) {
        event.stopPropagation();
        if(event.target.tagName === 'line') {
            const line = d3.select(event.target).datum()
            this.removeEdge(line.source, line.target);
        }
        else if(event.target.tagName === 'svg') {
            if(this.createNode) this.addNode(event.clientX, event.clientY);
            this.selectedNode = null;
        }
        this.createNode = false;
    }
    handleMouseDown(event) {
        event.stopPropagation();
        if(event.target.tagName === 'circle') {
            const node = d3.select(event.target).datum();
            this.svg.on('mousemove', (event) => this.handleMouseMove(event))
            this.potentialLine = this.svg.append('line')
                .classed('edge', true)
                .attr('x1', node.x)
                .attr('y1', node.y)
                .attr('x2', node.x)
                .attr('y2', node.y)
                .attr('stroke', 'gray')
                .lower();
            this.selectedNode = node;
        }
    }
    handleMouseUp(event) {
        event.stopPropagation();
        this.svg.on('mousemove', null);
        if(this.potentialLine) {
            this.potentialLine.remove();
            this.potentialLine = null;
        }
        else if(event.target.tagName === 'svg') this.createNode = true;
        if(event.target.tagName === 'circle') {
            const node = d3.select(event.target).datum();
            if(this.selectedNode) this.addEdge(this.selectedNode.id, node.id);
        }
        this.selectedNode = null;
    }
    handleMouseMove(event) {
        if(this.potentialLine) {
            this.potentialLine
                .attr('x2', event.clientX)
                .attr('y2', event.clientY);
        }
    }
    updateNodes() {
        this.circles
            .selectAll('.node')
            .data(this.nodes)
            .enter()
            .append('circle')
            .classed('node', true)
            .attr('fill', node => node.color)
            .attr('r', radius);
        this.circles.exit().remove();
        this.text
            .selectAll('.node-label')
            .data(this.nodes)
            .enter()
            .append('text')
            .classed('node-label', true)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .style('pointer-events', 'none')
            .style('user-select', 'none')
            .style('font-size', '0.5em')
            .text(node => this.doText ? node.id : "");
        this.text.exit().remove();
        this.circleSelection = this.circles.selectAll('.node');
        this.textSelection = this.text.selectAll('.node-label');
    }
    updateEdges() {
        this.simulation.force('link', d3.forceLink(this.edges));
        const lines = this.lines
            .selectAll('.edge')
            .data(this.edges);
        lines.exit().remove();
        lines.enter()
            .append('line')
            .classed('edge', true)
            .on('mouseover', (event) => {
                d3.select(event.currentTarget)
                .style('stroke', 'red')
                .raise();
            })
            .on('mouseout', (event) => {
                d3.select(event.currentTarget)
                .style('stroke', 'gray')
            })
            .lower();
        this.lineSelection = this.lines.selectAll('.edge');
        this.simulation.alpha(0.2).restart();
    }
    addNode(x, y) {
        const node = {id: this.v, color: this.defaultColor, x, y}
        this.nodes.push(node);
        this.adj.set(this.v++, {node, neighbors: []});
        this.simulation.nodes(this.nodes).alpha(0.2).restart();
        this.updateNodes();
    }
    addEdge(source, target) {
        if(source === target || this.adj.get(source).neighbors.includes(target)) return;
        this.adj.get(source).neighbors.push(target);
        this.adj.get(target).neighbors.push(source);
        this.edges.push({source: this.adj.get(source).node, target: this.adj.get(target).node});
        this.updateEdges();
    }
    removeEdge(source, target) {
        this.adj.get(source.id).neighbors = this.adj.get(source.id).neighbors.filter(d => d !== target.id);
        this.adj.get(target.id).neighbors = this.adj.get(target.id).neighbors.filter(d => d !== source.id);
        this.edges = this.edges.filter(edge => !edgeEquals(edge, {source, target}));
        this.updateEdges();
    }
    recolor(vertex, color) {
        this.adj.get(vertex).node.color = color;
    }
};
