import * as d3 from 'd3';
import Heap from 'heap';
import Queue from 'queue';

const DEFAULTMAXKEMPEINTERCHANGES = 100;
const DEFAULTMAXVISITWANDER = 2;
const impasseResolvedColor = '#7cfc00';

// pull out the svg listener setup into its own method so you can temporarily quiet them
// during colorings


const rotate = (arr, k) => [...arr.slice(k % arr.length), ...arr.slice(0, k % arr.length)];

// Checks to see if two edges are the same
const edgeEquals = (edge1, edge2) =>
  (edge1.source.id === edge2.source.id &&
    edge1.target.id === edge2.target.id) ||
  (edge1.source.id === edge2.target.id && edge1.target.id === edge2.source.id);

const squareDistance = (x1, y1, x2, y2) => (x2 - x1) ** 2 + (y2 - y1) ** 2;

//Euclidean distance
const distance = (x1, y1, x2, y2) => Math.sqrt(squareDistance(x1, y1, x2, y2));

const crossProduct = (v1, v2) => v1[0] * v2[1] - v1[1] * v2[0];

const dotProduct = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1];

const getLinePointProduct = (line, x, y) => {
  const [leftPoint, rightPoint] =
    line.x1 < line.x2
      ? [
        [line.x1, line.y1],
        [line.x2, line.y2],
      ]
      : [
        [line.x2, line.y2],
        [line.x1, line.y1],
      ];
  const v1 = [rightPoint[0] - leftPoint[0], rightPoint[1] - leftPoint[1]];
  const v2 = [x - rightPoint[0], y - rightPoint[1]];
  return crossProduct(v1, v2);
};

//Checks if the points of line 2 are on opposing sides of line 1
const pointsWrapLine = (line1, line2) => {
  const [line1Prod1, line1Prod2] = [
    getLinePointProduct(line1, line2.x1, line2.y1),
    getLinePointProduct(line1, line2.x2, line2.y2),
  ];
  return line1Prod1 * line1Prod2 < 0;
};

// Check if two line segments overlap in 2d
const intersect2d = (line1, line2) => {
  if (!pointsWrapLine(line1, line2)) return false;
  return pointsWrapLine(line2, line1);
};

function pointDistanceToSegment(line, x, y) {
  const squareSegmentLength = squareDistance(
    line.x1,
    line.y1,
    line.x2,
    line.y2
  );
  const segmentVector = [line.x2 - line.x1, line.y2 - line.y1];
  const pointVector = [x - line.x1, y - line.y1];
  let normalizedProjection =
    dotProduct(segmentVector, pointVector) / squareSegmentLength;
  normalizedProjection = Math.max(0, Math.min(1, normalizedProjection));
  return distance(
    x,
    y,
    line.x1 + normalizedProjection * segmentVector[0],
    line.y1 + normalizedProjection * segmentVector[1]
  );
}

export class Graph {
  constructor(
    svg,
    centerX,
    centerY,
    colors,
    doText,
    radius,
    planar,
    nodeMinSpacing = 20,
    nodeEdgePadding = 1,
    nodeBoundaryPadding = 2,
    coloringSpeed = 20
  ) {
    this.printConsole = null;
    this.adj = {};
    this.nodes = [];
    this.edges = [];
    this.planar = planar;
    this.v = 0;
    // [uncolored, 1, 2, 3, 4, wandering 5th]
    this.colors = colors;
    this.simulation = d3.forceSimulation(this.nodes);
    this.svg = svg;
    this.rect = this.svg.node().getBoundingClientRect();
    this.circles = this.svg.append('g').classed('node-group', true);
    this.circleSelection = this.circles.selectAll('.node');
    this.radius = radius;
    this.lines = this.svg.append('g').classed('edge-group', true);
    this.lineSelection = this.lines.selectAll('.edge');
    this.lines.lower();
    this.doText = doText;
    this.text = this.svg.append('g').classed('text-group', true);
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
    // Stack used for coloring
    this.smallestLast = [];
    // Queue of functions to be called regularly during coloring
    this.coloringQueue = new Queue();
    this.coloringSpeed = coloringSpeed;
    // Helper variables for coloring
    this.wander_visited = {};
    this.backtrackingRecolorings = 0;
    this.setUpSimulation(centerX, centerY);
    for (let i = 0; i < 5; ++i) this.addNode();
    for (let i = 0; i < 5; ++i)
      this.addEdge(
        Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 4)
      );
    this.simulation.alpha(0.2).restart();
  }
  ticked() {
    this.circleSelection
      .attr('cx', (node) => node.x)
      .attr('cy', (node) => node.y);
    this.textSelection
      .attr('x', (node) => node.x)
      .attr('y', (node) => node.y + 1);
    this.lineSelection
      .attr('x1', (edge) => edge.source.x)
      .attr('x2', (edge) => edge.target.x)
      .attr('y1', (edge) => edge.source.y)
      .attr('y2', (edge) => edge.target.y);
  }
  setUpSimulation(centerX, centerY) {
    if (!this.planar)
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
      .style('cursor', 'crosshair');
  }
  configureConsole(printConsole) {
    this.printConsole = printConsole;
  }
  handleClick(event) {
    event.stopPropagation();
    if (event.target.tagName === 'line') {
      const line = d3.select(event.target).datum();
      this.removeEdge(line.source, line.target);
    } else if (event.target.tagName === 'svg') {
      if (this.createNode)
        this.addPositionNode(
          event.clientX - this.rect.x,
          event.clientY - this.rect.y,
          true
        );
      this.selectedNode = null;
    }
    this.createNode = false;
  }
  handleMouseDown(event) {
    event.stopPropagation();
    if (event.target.tagName === 'circle') {
      const node = d3.select(event.target).datum();
      this.svg.on('mousemove', (event) => this.handleMouseMove(event));
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
    if (this.potentialLine) {
      this.potentialLine.remove();
      this.potentialLine = null;
    } else if (event.target.tagName === 'svg') this.createNode = true;
    if (event.target.tagName === 'circle') {
      const node = d3.select(event.target).datum();
      if (this.selectedNode) this.addEdge(this.selectedNode.id, node.id, true);
    }
    this.selectedNode = null;
  }
  handleMouseMove(event) {
    if (this.potentialLine) {
      this.potentialLine
        .attr('x2', event.clientX - this.rect.x)
        .attr('y2', event.clientY - this.rect.y);
    }
  }
  updateNodes() {
    const circles = this.circles.selectAll('.node').data(this.nodes);
    circles.exit().remove();
    circles
      .enter()
      .append('circle')
      .classed('node', true)
      .attr('fill', (node) => this.colors[node.color])
      .attr('r', this.radius);

    const text = this.text.selectAll('.node-label').data(this.nodes);
    text.exit().remove();
    text
      .enter()
      .append('text')
      .classed('node-label', true)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .text((node) => (this.doText ? node.id : ''));
    this.circleSelection = this.circles.selectAll('.node');
    this.textSelection = this.text.selectAll('.node-label');
  }
  updateNode(node, animate = false) {
    this.circles
      .append('circle')
      .datum(node)
      .classed('node', true)
      .attr('fill', (node) => this.colors[node.color])
      .attr('cx', (node) => node.x)
      .attr('cy', (node) => node.y)
      .attr('r', this.radius * 3 / 4)
      .transition()
      .ease(d3.easeElasticOut.amplitude(2).period(0.25))
      .duration(animate * 1500)
      .attr('r', this.radius);
    this.text
      .append('text')
      .datum(node)
      .classed('node-label', true)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .text((node) => (this.doText ? node.id : ''))
      .attr('x', (node) => node.x)
      .attr('y', (node) => node.y + 1);
    this.circleSelection = this.circles.selectAll('.node');
    this.textSelection = this.text.selectAll('.node-label');
    this.circleSelection.enter();
    this.textSelection.enter();
  }
  updateEdges() {
    if (!this.planar) this.simulation.force('link', d3.forceLink(this.edges));
    const lines = this.lines.selectAll('.edge').data(this.edges);
    lines.exit().remove();
    lines
      .enter()
      .append('line')
      .classed('edge', true)
      .on('mouseover', (event) => {
        d3.select(event.currentTarget).raise();
      })
      .lower();
    this.lineSelection = this.lines.selectAll('.edge');
  }
  updateEdge(edge, animate = false) {
    if (!this.planar) this.simulation.force('link', d3.forceLink(this.edges));
    this.lines
      .append('line')
      .datum(edge)
      .classed('edge', true)
      .on('mouseover', (event) => { d3.select(event.currentTarget).raise(); })
      .lower()
      .attr('x1', (edge) => edge.source.x)
      .attr('x2', (edge) => edge.source.x)
      .attr('y1', (edge) => edge.source.y)
      .attr('y2', (edge) => edge.source.y)
      .transition()
      .duration(animate * 200)
      .attr('x1', (edge) => edge.source.x)
      .attr('x2', (edge) => edge.target.x)
      .attr('y1', (edge) => edge.source.y)
      .attr('y2', (edge) => edge.target.y);
    this.lineSelection = this.lines.selectAll('.edge');
    this.lineSelection.enter();
  }
  // Nodes shouldn't spawn over other nodes or edges
  checkNodeOverlap(x, y) {
    for (const node of this.nodes)
      if (
        distance(x, y, node.x, node.y) <
        this.radius * 2 + this.nodeMinSpacing
      )
        return true;
    for (const edge of this.edges) {
      const line = {
        x1: edge.source.x,
        x2: edge.target.x,
        y1: edge.source.y,
        y2: edge.target.y,
      };
      if (
        pointDistanceToSegment(line, x, y) <
        this.radius + this.nodeEdgePadding
      )
        return true;
    }
    return false;
  }
  checkNodeInBounds(x, y) {
    return (
      x > this.radius + this.nodeBoundaryPadding &&
      x + this.rect.x + this.radius + this.nodeBoundaryPadding + 1 <
      this.rect.width &&
      y > this.radius + this.nodeBoundaryPadding &&
      y + this.rect.y + this.radius + this.nodeBoundaryPadding + 1 <
      this.rect.height
    );
  }
  checkNodePlanarityConstraints(x, y, warn = false) {
    if (!this.checkNodeInBounds(x, y)) {
      if (warn) this.printConsole(`Oops! That node is too close to the boundary.`, true);
      return false;
    }
    if (this.checkNodeOverlap(x, y)) {
      if (warn) this.printConsole(`Oops! That node is too close to another node or edge.`, true);
      return false;
    }
    return true;
  }
  //Keep trying to add a node till it works
  addNode() {
    let failedAttempts = 0;
    if (this.planar)
      while (
        failedAttempts < 100 &&
        !this.addPositionNode(
          Math.random() * this.rect.width,
          Math.random() * this.rect.height
        )
      )
        ++failedAttempts;
    else
      while (!this.addPositionNode(0, 0))
        for (let i = 0; i < 10; ++i) this.simulation.tick();
    return failedAttempts === 100;
  }
  addPositionNode(x, y, warn = false) {
    if (this.planar && !this.checkNodePlanarityConstraints(x, y, warn)) return false;
    const node = { id: this.v, color: 0, x, y };
    this.nodes.push(node);
    this.adj[this.v++] = { node, neighbors: [] };
    if(this.planar) this.simulation.nodes(this.nodes);
    else this.simulation.nodes(this.nodes).alpha(0.2).restart();
    this.updateNode(node, this.planar);
    return true;
  }
  reintroduceNode(adjReference) {
    const neighbors = [...adjReference.neighbors];
    const node = adjReference.node;
    adjReference.neighbors = [];
    this.adj[node.id] = adjReference;
    this.nodes.push(node);
    for (const neighbor of neighbors) this.addEdge(node.id, neighbor, false, true);
    this.coloringQueue.push({
      'func': this.updateNode,
      'params': [node],
      'self': true
    });
    this.updateEdges();
  }
  // Ensure there are no edge crossings and the edge doesn't pass through a node
  checkEdgePlanarity(source, target, warn = false) {
    const line1 = { x1: source.x, x2: target.x, y1: source.y, y2: target.y };
    let line2;
    for (const edge of this.edges) {
      line2 = {
        x1: edge.source.x,
        x2: edge.target.x,
        y1: edge.source.y,
        y2: edge.target.y,
      };
      if (intersect2d(line1, line2)) {
        if (warn) this.printConsole(
          'Oops, that edge crosses another edge, violating the plane embedding!',
          true
        );
        return false;
      }
    }
    for (const node of this.nodes) {
      if (node === source || node === target) continue;
      if (
        pointDistanceToSegment(line1, node.x, node.y) <
        this.radius + this.nodeEdgePadding
      ) {
        if (warn) this.printConsole(`Oops, that edge is too close to a node!
                                    (for visual clarity)`, true);
        return false;
      }
    }
    return true;
  }
  addEdge(source, target, warn = false, delay = false) {
    const source_adj = this.adj[source];
    const target_adj = this.adj[target];
    if (
      source === target ||
      source_adj.neighbors.includes(target) ||
      (this.planar &&
        !this.checkEdgePlanarity(source_adj.node, target_adj.node, warn))
    )
      return false;
    source_adj.neighbors.push(target);
    target_adj.neighbors.push(source);
    const edge = { source: source_adj.node, target: target_adj.node };
    this.edges.push(edge);
    if (delay)
      this.coloringQueue.push({
        'func': this.updateEdge,
        'params': [edge, true],
        'self': true
      })
    else this.updateEdge(edge, this.planar && !warn);
    return true;
  }
  initializeTriangulation() {
    let existingEdgeList = [];
    for (const edge of this.edges)
      existingEdgeList.push([edge.source.id, edge.target.id]);
    const existingEdgeSet = new Set(existingEdgeList);
    this.possibleEdges = [];
    for (let i = 0; i < this.nodes.length; ++i) {
      for (let j = i + 1; j < this.nodes.length; ++j) {
        const edge = [i, j];
        if (!existingEdgeSet.has(edge)) this.possibleEdges.push([i, j]);
      }
    }
    this.possibleEdges.sort(() => Math.random() - 0.5);
  }
  triangulateStep() {
    let count = 0;
    while (this.possibleEdges.length && count < 100) {
      const edge = this.possibleEdges.pop();
      if (this.addEdge(edge[0], edge[1])) return true;
    }
    if (this.possibleEdges.length === 0) return false;
    return true;
  }
  removeNode(vertex) {
    vertex = Number(vertex);
    const adjReference = { ...this.adj[vertex] };
    const neighbors = this.adj[vertex].neighbors;
    const node = this.nodes.find(node => node.id === vertex);
    for (const neighbor of neighbors) {
      const neighborNode = this.nodes.find(node => node.id === neighbor);
      this.removeEdge(node, neighborNode);
    }
    delete this.adj[vertex];
    this.nodes = this.nodes.filter(node => node.id !== vertex);
    this.updateNodes();
    return adjReference;
  }
  removeEdge(source, target) {
    this.adj[source.id].neighbors = this.adj[source.id].neighbors.filter((d) => d !== target.id);
    this.adj[target.id].neighbors = this.adj[target.id].neighbors.filter((d) => d !== source.id);
    this.edges = this.edges.filter(
      (edge) => !edgeEquals(edge, { source, target })
    );
    this.updateEdges();
  }
  clear() {
    Object.keys(this.adj).forEach(key => delete this.adj[key]);
    this.nodes.splice(0, this.nodes.length);
    this.edges.splice(0, this.edges.length);
    this.v = 0;
    this.updateNodes();
    this.updateEdges();
  }
  coloringStep(interval, resetColor, resolutionHeuristics, orderingHeuristic, doRestart = false) {
    if (this.coloringQueue.length === 0) {
      clearInterval(interval);
      this.updateNodes();
      this.updateEdges();
      if(doRestart) {
        this.printConsole(`Darn, out of heuristics! Restarting...`, true);
        this.color(resetColor, resolutionHeuristics, orderingHeuristic);
      }
      else resetColor();
    }
    const step = this.coloringQueue.shift();
    if (step === undefined) return;
    if (step['self']) step['func'].call(this, ...step['params']);
    else step['func'](...step['params']);
  }
  exhaustQueue(resetColor, resolutionHeuristics, orderingHeuristic, doRestart) {
    let interval = setTimeout(() => // Delay so the interval can compute before we pass it
      setInterval(() => 
        this.coloringStep(
          interval,
          resetColor,
          resolutionHeuristics,
          orderingHeuristic,
          doRestart
        ), this.coloringSpeed), 0);
  }
  color(
    resetColor,
    resolutionHeuristics,
    orderingHeuristic
  ) {
    if (!this.planar) return;
    let doRestart = false;
    this.wander_visited = {};
    for (const id in this.adj) this.wander_visited[id] = 0;
    let wasColored = this.nodes[0].color !== 0;
    for (const node of this.nodes) node.color = 0;
    if(orderingHeuristic === "Smallest-Last") {
      this.slOrder();
      while (this.smallestLast.length > 0) {
        const adjReference = this.smallestLast.pop();
        this.reintroduceNode(adjReference);
        if (!this.triviallyColor(adjReference.node.id) &&
            !this.impasse(adjReference.node.id, resolutionHeuristics)) {
              doRestart = true;
              this.coloringQueue.push({
                'func': this.printConsole,
                'params': [`Rebuilding the graph and restarting...`, true],
                'self': false
              });
              while(this.smallestLast.length > 0) this.reintroduceNode(this.smallestLast.pop());
              break;
            }
      }
    }
    else {
      if(wasColored) {
        this.printConsole('Resetting colors...');
        this.circleSelection
          .transition()
          .duration(200)
          .attr('fill', '#ffffff')
          .attr('r', this.radius + 5)
          .transition()
          .duration(600)
          .attr('r', this.radius)
          .attr('fill', this.colors[0]);
      }
      const satHeap = new Heap((a, b) => {
        if(a.sat !== b.sat) return b.sat - a.sat;
        return b.uncolored - a.uncolored;
      });
      const heapPointers = {};
      for (const id in this.adj) {
        heapPointers[id] = satHeap.push({
          id,
          sat: 0,
          uncolored: this.adj[id].neighbors.length
        });
      }
      while(!satHeap.empty()) {
        const vertex = satHeap.pop();
        if (!this.triviallyColor(this.adj[vertex.id].node.id) &&
            !this.impasse(this.adj[vertex.id].node.id, resolutionHeuristics)) {
              doRestart = true;
              break;
            }
        for(const neighbor of this.adj[vertex.id].neighbors) {
          ++heapPointers[neighbor].sat;
          --heapPointers[neighbor].uncolored;
          satHeap.updateItem(heapPointers[neighbor]);
        }
      }
    }
    if(wasColored) setTimeout(() => this.exhaustQueue(resetColor), 1000);
    else this.exhaustQueue(resetColor, resolutionHeuristics, orderingHeuristic, doRestart);
  }
  slOrder() {
    const vertexHeap = new Heap((a, b) => a.degree - b.degree); // min-heap
    const heapPointers = {};
    for (const id in this.adj)
      heapPointers[id] = vertexHeap.push({ id, degree: this.adj[id].neighbors.length });
    while (!vertexHeap.empty()) {
      const vertex = vertexHeap.pop();
      for (const neighbor of this.adj[vertex.id].neighbors) {
        --heapPointers[neighbor].degree;
        vertexHeap.updateItem(heapPointers[neighbor]);
      }
      this.smallestLast.push(this.removeNode(vertex.id));
    }
  }
  updateColor(vertex, transitionColor = '#ffffff', finalColor = this.adj[vertex].node.color) {
    this.circleSelection
      .filter(d => d.id === vertex)
      .transition()
      .duration(200)
      .attr('fill', transitionColor)
      .attr('r', this.radius + 5)
      .transition()
      .duration(600)
      .attr('r', this.radius)
      .attr('fill', this.colors[finalColor]);
  }
  recolor(vertex, color, transitionColor = '#ffffff') {
    this.adj[vertex].node.color = color;
    this.coloringQueue.push({
      'func': this.updateColor,
      'params': [vertex, transitionColor],
      'self': true
    });
  }
  triviallyColor(vertex, wasImpasse = false) {
    let freeColors = [1, 2, 3, 4];
    for (const neighbor of this.adj[vertex].neighbors) {
      freeColors = freeColors.filter(color => color !== this.adj[neighbor].node.color);
    }
    if (freeColors.length === 0) return false;
    let transitionColor = '#ffffff';
    if (wasImpasse) transitionColor = impasseResolvedColor;
    this.recolor(vertex, freeColors[Math.floor(Math.random() * freeColors.length)], transitionColor);
    return true;
  }
  impasse(vertex, resolutionHeuristics) {
    this.coloringQueue.push({
      'func': this.printConsole,
      'params': [`Impasse at node ${vertex}...`, true],
      'self': false
    });
    const heuristicMapping = {"Kempe" : this.kempe,
                              "Wandering 5th" : this.wander,
                              "Backtracking" : this.localizedDeepBacktracking}
    const heuristics = [];
    for(const heur of resolutionHeuristics) {
      if(heur) heuristics.push(heuristicMapping[heur]);
      else break;
    }
    for(const heur of heuristics) {
      if(heur.call(this, vertex)) return true;
    }
    return false;
  }
  kempe(vertex, maxKempeInterchanges = DEFAULTMAXKEMPEINTERCHANGES) {
    const randomizedNeighbors = [...this.adj[vertex].neighbors].sort(() => Math.random() - 0.5);
    let interchanges = 0;
    for (const neighbor of randomizedNeighbors) {
      if (interchanges === maxKempeInterchanges) return false;
      const neighborColor = this.adj[neighbor].node.color;
      let freeColors = [1, 2, 3, 4].filter(color => color !== neighborColor);
      for (const color of freeColors) {
        this.coloringQueue.push({
          'func': this.updateColor,
          'params': [vertex, 'red', 0],
          'self': true
        });
        ++interchanges;
        this.interchange(neighbor, color);
        if (this.triviallyColor(vertex, true)) {
          this.coloringQueue.push({
            'func': this.printConsole,
            'params': [`Resolved in ${interchanges} Kempe
                      ${interchanges === 1 ? `chain` : `chains`}!`],
            'self': false
          });
          return true;
        }
      }
    }
    return false;
  }
  // Iterative DFS to avoid stack overflows
  interchange(vertex, color) {
    let visited = {};
    for (const id in this.adj) visited[id] = false;
    let nextVertices = [[vertex, color]];
    while (nextVertices.length !== 0) {
      [vertex, color] = nextVertices.pop();
      visited[vertex] = true;
      const v_color = this.adj[vertex].node.color;
      this.recolor(vertex, color, 'black');
      for (const neighbor of this.adj[vertex].neighbors)
        if (!visited[neighbor] && this.adj[neighbor].node.color === color)
          nextVertices.push([neighbor, v_color]);
    }
  }
  wander(vertex, T = DEFAULTMAXVISITWANDER) {
    this.wander_visited[vertex] = 1;
    this.recolor(vertex, 5, 'red');
    let success = this.wander_helper(vertex, vertex, T);
    this.wander_visited[vertex] = 0;
    if(success) {
      this.coloringQueue.push({
        'func': this.printConsole,
        'params': [`Impasse wandered away!`],
        'self': false
      });
    }
    else {
      this.coloringQueue.push({
        'func': this.printConsole,
        'params': [`Failed to wander impasse at node ${vertex}...`, true],
        'self': false
      });
      this.recolor(vertex, 0, 'red');
    }
    return success;
  }
  wander_helper(vertex, parent, T) {
    if(this.wander_visited[vertex] >= T) return false;
    ++this.wander_visited[vertex];
    const colorUnique = [-2, -1, -1, -1, -1];
    for(const neighbor of this.adj[vertex].neighbors) {
      const neighborColor = this.adj[neighbor].node.color;
      if(colorUnique[neighborColor] === -1) colorUnique[neighborColor] = neighbor;
      else colorUnique[neighborColor] = -2;
    }
    for(const uniqueNeighbor of colorUnique) {
      if(uniqueNeighbor < 0 || uniqueNeighbor === parent) continue;
      if(this.tryColorNeighbor(vertex, uniqueNeighbor)) return true;
    }
    let success = false;
    for(const uniqueNeighbor of colorUnique) {
      if(uniqueNeighbor < 0 || uniqueNeighbor === parent) continue;
      ++this.wander_visited[uniqueNeighbor];
      this.swapColors(vertex, uniqueNeighbor);
      success |= this.wander_helper(uniqueNeighbor, vertex, T);
      if(success) return true;
      this.swapColors(vertex, uniqueNeighbor);
      --this.wander_visited[uniqueNeighbor];
    }
    return false;
  }
  tryColorNeighbor(vertex, uniqueNeighbor) {
    this.swapColors(vertex, uniqueNeighbor);
    if(this.triviallyColor(uniqueNeighbor, true)) { return true; }
    this.swapColors(vertex, uniqueNeighbor);
    return false;
  }
  swapColors(v1, v2) {
    [
      this.adj[v1].node.color,
      this.adj[v2].node.color
    ] = 
      [
        this.adj[v2].node.color,
        this.adj[v1].node.color
      ];
    this.coloringQueue.push({
      'func': this.updateColor,
      'params': [v1, 'black'],
      'self': true
    });
    this.coloringQueue.push({
      'func': this.updateColor,
      'params': [v2, 'black'],
      'self': true
    });
  }
  // L = 17 because it's a similar ratio of graph size to 150 / 2000
  localizedDeepBacktracking(vertex, L = 17, B = 300) {
    this.coloringQueue.push({
      'func': this.printConsole,
      'params': [`Trying localized deep backtracking!`],
      'self': false
    });
    if(this.adj[vertex].node.color === 0) this.adj[vertex].node.color = 1;
    const q = new Queue();
    const neighborhood = [];
    q.push(vertex);
    const visited = {};
    for(const id in this.adj) visited[id] = false;
    while(q.length !== 0 && neighborhood.length < L) {
      const node = q.pop();
      visited[node] = true;
      neighborhood.push(node);
      for(const neighbor of this.adj[node].neighbors) {
        if(!visited[neighbor] && this.adj[neighbor].node.color !== 0) q.push(neighbor);
      }
    }
    const origColoring = [];
    for(const node of neighborhood) origColoring.push(this.adj[node].node.color);
    const colors = [1, 2, 3, 4];
    const neighborhood_colors = [];
    for(const v of neighborhood)
      neighborhood_colors.push(rotate([...colors], this.adj[v].node.color - 1));
    this.backtrackingRecolorings = 0;
    if(this.deepBacktrackingHelper(neighborhood, neighborhood_colors, neighborhood.length - 1, B)) {
      for(const node of neighborhood) {
        this.coloringQueue.push({
          'func': this.updateColor,
          'params': [node, impasseResolvedColor],
          'self': true
        });
      }
      this.coloringQueue.push({
        'func': this.printConsole,
        'params': [`Localized deep backtracking successful!`],
        'self': false
      });
      return true;
    }
    this.coloringQueue.push({
      'func': this.printConsole,
      'params': [`Failed to resolve impasse with localized deep backtracking.`],
      'self': true
    });
    for(let i = 0; i < neighborhood.size; ++i) this.recolor(neighborhood[i], origColoring[i], 'red');
    return false;
  }
  deepBacktrackingHelper(neighborhood, neighborhood_colors, i, B) {
    if(this.backtrackingRecolorings >= B) return false;
    for(const color of neighborhood_colors[i]) {
      ++this.backtrackingRecolorings;
      this.recolor(neighborhood[i], color, 'black');
      if(i > 0) {
        if(this.deepBacktrackingHelper(neighborhood, neighborhood_colors, i - 1, B)) return true;
      }
      else if(this.validNeighborhoodColoring(neighborhood, neighborhood[i])) return true;
    }
    return false;
  }
  validNeighborhoodColoring(neighborhood, start) {
    const visited = {};
    for(const id in this.adj) visited[id] = false;
    visited[start] = true;
    let nextVertices = [start];
    while (nextVertices.length !== 0) {
      const vertex = nextVertices.pop();
      const v_color = this.adj[vertex].node.color;
      for (const neighbor of this.adj[vertex].neighbors) {
        if (!visited[neighbor] && this.adj[neighbor].node.color !== 0) {
          visited[neighbor] = true;
          if(this.adj[neighbor].node.color === v_color) return false; 
          if(neighbor in neighborhood) nextVertices.push([neighbor]);
        }
      }
    }
    return true;
  }
  fastRecolor(vertex, color) {
    this.adj[vertex].node.color = color;
    this.coloringQueue.push({
      'func': this.fastUpdateColor,
      'params': [vertex, color],
      'self': true
    });
  }
  fastUpdateColor(vertex, color) {
    this.circleSelection
    .filter(d => d.id === vertex)
    .transition()
    .duration(10)
    .attr('fill', this.colors[color]);
  }
}