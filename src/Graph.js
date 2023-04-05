import * as d3 from 'd3';
// if you add event listeners, be sure to remove them when you delete the node or destroy
// the graph

// When you have a potential edge and let go, it creates a new node
// When you have no potential edge, are holding down, and release on top of a node, then it creates a new node :( (not a real issue when nodes
// will become stationary)

// Don't need a ton of event listeners on all of the nodes, just need one listener on the svg and
// you can read the target with "this"

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
        this.svg = svg.on('mouseup', (event, d) => this.handleMouseUp(event, d))
            .on('click', (event, d) => this.handleClick(event, d))
            .style("cursor", "crosshair");
        this.circles = this.svg.append('g')
            .classed('node-group', true);
        this.lines = this.svg.append('g')
            .classed('edge-group', true);
        this.lines.lower();
        this.doText = doText;
        this.text = this.svg.append('g')
            .classed('text-group', true);
        this.text.raise();
        this.selectedNode = null;
        this.potentialEdge = null;
        this.simulation.on('tick', () => {
            this.circles.selectAll('.node')
                .attr('cx', node => node.x)
                .attr('cy', node => node.y);
            this.text.selectAll('.node-label')
                .attr('x', node => node.x)
                .attr('y', node => node.y + 1);
            this.lines.selectAll('.edge')
                .attr('x1', edge => edge.source.x)
                .attr('x2', edge => edge.target.x)
                .attr('y1', edge => edge.source.y)
                .attr('y2', edge => edge.target.y);
        });
    }
    handleClick(event, clicked) {
        event.stopPropagation();
        if(event.target.tagName === 'line') {
            this.removeEdge(clicked.source, clicked.target);
        }
        else if(event.target.tagName === 'svg') {
            if(!this.selectedNode && !this.potentialLine) this.addNode(event.clientX, event.clientY);
            this.selectedNode = null;
        }
    }
    handleMouseDown(event, clicked) {
        event.stopPropagation();
        if(event.target.tagName === 'circle') {
            this.svg.on('mousemove', (event, clicked) => this.handleMouseMove(event, clicked))
            this.potentialLine = this.svg.append('line')
                .classed('edge', true)
                .attr('x1', clicked.x)
                .attr('y1', clicked.y)
                .attr('x2', clicked.x)
                .attr('y2', clicked.y)
                .attr('stroke', 'gray')
                .lower();
            this.selectedNode = clicked;
        }
    }
    handleMouseUp(event, clicked) {
        event.stopPropagation();
        this.svg.on('mousemove', null);
        if(this.potentialLine) {
            this.potentialLine.remove();
            this.potentialLine = null;
        }
        if(event.target.tagName === 'circle') {
            if(this.selectedNode) this.addEdge(this.selectedNode.id, clicked.id);
        }
        this.selectedNode = null;
    }
    handleMouseMove(event, clicked) {
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
            .attr('r', radius)
            .on('mousedown', (event, clicked) => this.handleMouseDown(event, clicked))
            .on('mouseup', (event, clicked) => this.handleMouseUp(event, clicked));
        this.circles.exit().remove();
        this.text
            .selectAll('.text-label')
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
            .on('click', (event, clicked) => this.handleClick(event, clicked))
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
