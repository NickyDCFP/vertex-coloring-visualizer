import './App.css';
import * as d3 from 'd3';
import {useEffect, useRef} from 'react';
import {Graph} from './Graph'

//current issues: duplicates are present in the adjacency list (as in, 1: [0, 0, 1])
//                we still want the adjacency to go both ways, since this is an
//                undirected graph
//duplicates are present in the edges list, which is easy (just don't add the edge twice)

//although maybe want to make sure that the edge that
//they're adding, when they're adding it,
//doesn't already exist... but can do that check in the
//adjacency list in O(deg) time

//maybe have pitches deepen as the recursion stack grows

// things to ask aloupis about:
  // curved edges necessary? the internal graph can be sufficiently complex, i'm sure
  // how to host?
const innerHeight = window.innerHeight;
const innerWidth = window.innerWidth;
const centerX = innerWidth / 2;
const centerY = innerHeight / 2;
const radius = 7;

/*
const boundsCheck = (value, bound) => {
  if(value < radius) return radius + 10;
  if(value > bound - radius) return bound - 10;
  return value;
}
*/


const App = () => {
  const containerRef = useRef(null);
  useEffect(() => {
    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', innerWidth)
      .attr('height', innerHeight);
    const graph = new Graph(svg, centerX, centerY, '#45d097', true);
    for(let i = 0; i < 5; ++i) graph.addNode(0, 0);
    for(let i = 0; i < 5; ++i) {
      graph.addEdge(Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
    }

    graph.simulation.alpha(0.2).restart();
    console.log(graph.adj);
    console.log(graph.nodes);
    console.log(graph.edges);
  }, []);

  return <div ref={containerRef} />
}

export default App;