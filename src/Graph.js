import * as d3 from 'd3';

// Control stuff with react dropdowns

// Things to do before push:
    // Make triangulation stoppable, etc.

////////////////////////////////////////////////////////////////////////////////////////////////////

// Checks to see if two edges are the same
const edgeEquals = (edge1, edge2) =>
    (edge1.source.id === edge2.source.id && edge1.target.id === edge2.target.id) ||
    (edge1.source.id === edge2.target.id && edge1.target.id === edge2.source.id);

const squareDistance = (x1, y1, x2, y2) => (x2 - x1) ** 2 + (y2 - y1) ** 2;

//Euclidean distance
const distance = (x1, y1, x2, y2) => Math.sqrt(squareDistance(x1, y1, x2, y2));

const crossProduct = (v1, v2) => v1[0] * v2[1] - v1[1] * v2[0];

const dotProduct = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1];

const getLinePointProduct = (line, x, y) => {
    const [leftPoint, rightPoint] = (line.x1 < line.x2) ? 
                                    [[line.x1, line.y1], [line.x2, line.y2]] : 
                                    [[line.x2, line.y2], [line.x1, line.y1]];
    const v1 = [rightPoint[0] - leftPoint[0], rightPoint[1] - leftPoint[1]];
    const v2 = [x - rightPoint[0], y - rightPoint[1]];
    return crossProduct(v1, v2); 
}

//Checks if the points of line 2 are on opposing sides of line 1
const pointsWrapLine = (line1, line2) => {
    const [line1Prod1, line1Prod2] = [getLinePointProduct(line1, line2.x1, line2.y1),
                                      getLinePointProduct(line1, line2.x2, line2.y2)];
    return line1Prod1 * line1Prod2 < 0;
}

// Check if two line segments overlap in 2d
const intersect2d = (line1, line2) => {
    if(!pointsWrapLine(line1, line2)) return false;
    return pointsWrapLine(line2, line1);
}

function pointDistanceToSegment(line, x, y) {
    const squareSegmentLength = squareDistance(line.x1, line.y1, line.x2, line.y2);
    const segmentVector = [line.x2 - line.x1, line.y2 - line.y1];
    const pointVector = [x - line.x1, y - line.y1];
    let normalizedProjection = dotProduct(segmentVector, pointVector) / squareSegmentLength;
    normalizedProjection = Math.max(0, Math.min(1, normalizedProjection));
    return distance(x, y, line.x1 + normalizedProjection * segmentVector[0],
                          line.y1 + normalizedProjection * segmentVector[1]);
}

export class Graph {
    constructor(
        svg, 
        centerX,
        centerY,
        defaultColor,
        doText,
        radius,
        planar,
        nodeMinSpacing = 30,
        nodeEdgePadding = 1,
        nodeBoundaryPadding = 2
    ) {
        this.adj = new Map();
        this.nodes = [];
        this.edges = [];
        this.planar = planar;
        this.v = 0;
        this.defaultColor = defaultColor;
        this.simulation = d3.forceSimulation(this.nodes);
        this.svg = svg;
        this.rect = this.svg.node().getBoundingClientRect();
        this.circles = this.svg
            .append('g')
            .classed('node-group', true);
        this.circleSelection = this.circles
            .selectAll('.node');
        this.radius = radius;
        this.lines = this.svg
            .append('g')
            .classed('edge-group', true);
        this.lineSelection = this.lines.selectAll('.edge');
        this.lines.lower();
        this.doText = doText;
        this.text = this.svg
            .append('g')
            .classed('text-group', true);
        this.text.raise();
        this.textSelection = this.text.selectAll('.node-label');
        // Keeps track of the node that an edge is being drawn from
        this.selectedNode = null;
        // Visual indicator for edges as they're drawn
        this.potentialEdge = null;
        // Keeps track of whether a node should be created at mouse release
        this.createNode = false;
        // Minimum distance between nodes while planar
        this.nodeMinSpacing = nodeMinSpacing;
        // Minimum distance between nodes and edges while in planar mode
        this.nodeEdgePadding = nodeEdgePadding;
        // Adds a small margin so nodes don't bleed out of bounds in planar mode
        this.nodeBoundaryPadding = nodeBoundaryPadding;
        // Edges that could be generated via triangulation
        this.possibleEdges = [];
        this.setUpSimulation(centerX, centerY);
        for(let i = 0; i < 5; ++i) this.addNode();
        for(let i = 0; i < 5; ++i) 
          this.addEdge(Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
        this.simulation.alpha(0.2).restart();
    }
    ticked() {
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
    }
    setUpSimulation(centerX, centerY) {
        if(!this.planar)
            this.simulation
                .force('link', d3.forceLink(this.edges).strength(0))
                .force('collide', d3.forceCollide().radius(30))
                .force('x', d3.forceX().x(centerX).strength(0.2))
                .force('y', d3.forceY().y(centerY).strength(0.2)); 
        this.simulation.on('tick', () => this.ticked());
        this.svg
            .on('mouseup', (event) => this.handleMouseUp(event))
            .on('click', (event) => this.handleClick(event))
            .on('mousedown', (event) => this.handleMouseDown(event))
            .style("cursor", "crosshair");
    }
    handleClick(event) {
        event.stopPropagation();
        if(event.target.tagName === 'line') {
            const line = d3.select(event.target).datum()
            this.removeEdge(line.source, line.target);
        }
        else if(event.target.tagName === 'svg') {
            if(this.createNode) this.addPositionNode(event.clientX - this.rect.x, event.clientY - this.rect.y);
            this.selectedNode = null;
        }
        this.createNode = false;
    }
    handleMouseDown(event) {
        event.stopPropagation();
        if(event.target.tagName === 'circle') {
            const node = d3.select(event.target).datum();
            this.svg.on('mousemove', (event) => this.handleMouseMove(event))
            this.potentialLine = this.svg
                .append('line')
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
                .attr('x2', event.clientX - this.rect.x)
                .attr('y2', event.clientY - this.rect.y);
        }
    }
    updateNodes() {
        const circles = this.circles
            .selectAll('.node')
            .data(this.nodes)
        circles
            .exit()
            .remove();
        circles
            .enter()
            .append('circle')
            .classed('node', true)
            .attr('fill', node => node.color)
            .attr('r', this.radius);

        const text = this.text
            .selectAll('.node-label')
            .data(this.nodes)
        text
            .exit()
            .remove();
        text
            .enter()
            .append('text')
            .classed('node-label', true)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .text(node => this.doText ? node.id : "");
        this.circleSelection = this.circles.selectAll('.node');
        this.textSelection = this.text.selectAll('.node-label');
    }
    updateEdges() {
        if(!this.planar) this.simulation.force('link', d3.forceLink(this.edges));
        const lines = this.lines
            .selectAll('.edge')
            .data(this.edges);
        lines
            .exit()
            .remove();
        lines
            .enter()
            .append('line')
            .classed('edge', true)
            .on('mouseover', (event) => {
                d3.select(event.currentTarget)
                .raise();
            })
            .lower();
        this.lineSelection = this.lines.selectAll('.edge');
        this.simulation.alpha(0.2).restart();
    }
    // Nodes shouldn't spawn over other nodes or edges
    checkNodeOverlap(x, y) {
        for(const node of this.nodes)
            if(distance(x, y, node.x, node.y) < this.radius * 2 + this.nodeMinSpacing) return true;
        for(const edge of this.edges) {
            const line = {x1: edge.source.x, x2: edge.target.x,
                          y1: edge.source.y, y2: edge.target.y};
            if(pointDistanceToSegment(line, x, y) < this.radius + this.nodeEdgePadding) return true;
        }
        return false;
    }
    checkNodeInBounds(x, y) {
        return x > this.radius + this.nodeBoundaryPadding &&
               x + this.rect.x + this.radius + this.nodeBoundaryPadding + 1 < this.rect.width &&
               y > this.radius + this.nodeBoundaryPadding &&
               y + this.rect.y + this.radius + this.nodeBoundaryPadding + 1 < this.rect.height;
    }
    checkNodePlanarityConstraints(x, y) {
        return this.checkNodeInBounds(x, y) && !this.checkNodeOverlap(x, y);
    }
    //Keep trying to add a node till it works
    addNode() {
        let failedAttempts = 0;
        if(this.planar) 
            while(failedAttempts < 1000 && 
                  !this.addPositionNode(Math.random() * this.rect.width, 
                                       (Math.random() * this.rect.height))) ++failedAttempts;
        else while(!this.addPositionNode(0, 0)) for(let i = 0; i < 10; ++i) this.simulation.tick();
        return failedAttempts === 100;
    }
    addPositionNode(x, y) {
        if(this.planar && !this.checkNodePlanarityConstraints(x, y)) return false;
        const node = {id: this.v, color: this.defaultColor, x, y};
        this.nodes.push(node);
        this.adj.set(this.v++, {node, neighbors: []});
        this.simulation
            .nodes(this.nodes)
            .alpha(0.2)
            .restart();
        this.updateNodes();
        return true;
    }
    // Ensure there are no edge crossings and the edge doesn't pass through a node
    checkEdgePlanarity(source, target) {
        const line1 = {x1: source.x, x2: target.x, y1: source.y, y2: target.y};
        let line2;
        for(const edge of this.edges) {
            line2 = {x1: edge.source.x, x2: edge.target.x, y1: edge.source.y, y2: edge.target.y};
            if(intersect2d(line1, line2)) return false;
        }
        for(const node of this.nodes) {
            if(node === source || node === target) continue;
            if(pointDistanceToSegment(line1, node.x, node.y) <
               this.radius + this.nodeEdgePadding) return false;
        }
        return true;
    }
    addEdge(source, target) {
        const source_adj = this.adj.get(source);
        const target_adj = this.adj.get(target);
        if((source === target || source_adj.neighbors.includes(target)) ||
           (this.planar && 
            !this.checkEdgePlanarity(source_adj.node, target_adj.node))) return false;
        source_adj.neighbors.push(target);
        target_adj.neighbors.push(source);
        this.edges.push({source: source_adj.node, target: target_adj.node});
        this.updateEdges();
        return true;
    }
    initializeTriangulation() {
        let existingEdgeList = [];
        for(const edge of this.edges) existingEdgeList.push([edge.source.id, edge.target.id]);
        const existingEdgeSet = new Set(existingEdgeList);
        this.possibleEdges = [];
        for(let i = 0; i < this.nodes.length; ++i) {
            for(let j = i + 1; j < this.nodes.length; ++j) {
                const edge = [i, j];
                if(!existingEdgeSet.has(edge)) this.possibleEdges.push([i, j]);
            }
        }
        this.possibleEdges.sort(() => Math.random() - 0.5);
    }
    triangulateStep() {
        let count = 0;
        while(this.possibleEdges.length && count < 100) {
            const edge = this.possibleEdges.pop();
            if(this.addEdge(edge[0], edge[1])) return true;
        }
        if(this.possibleEdges.length === 0) return false;
        return true;
    }
    removeEdge(source, target) {
        this.adj.get(source.id).neighbors = this.adj.get(source.id).neighbors.filter(d => d !== target.id);
        this.adj.get(target.id).neighbors = this.adj.get(target.id).neighbors.filter(d => d !== source.id);
        this.edges = this.edges.filter(edge => !edgeEquals(edge, {source, target}));
        this.updateEdges();
    }
    clear() {
        this.adj.clear();
        this.nodes.splice(0, this.nodes.length);
        this.edges.splice(0, this.edges.length);
        this.v = 0;
        this.updateNodes();
        this.updateEdges();
    }
    recolor(vertex, color) {
        this.adj.get(vertex).node.color = color;
    }
};
