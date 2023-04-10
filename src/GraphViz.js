import * as d3 from 'd3';
import {useEffect, useRef} from 'react';
import {Graph} from './Graph';

export const GraphViz = ({innerHeight, innerWidth, radius}) => {
    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;
    const containerRef = useRef(null);
    useEffect(() => {
      const svg = d3.select(containerRef.current)
        .append('svg')
        .classed('graph-display', true)
        .attr('width', innerWidth)
        .attr('height', innerHeight);
      const graph = new Graph(svg, centerX, centerY, '#45d097', true, radius);
      for(let i = 0; i < 5; ++i) graph.addNode(0, 0);
      for(let i = 0; i < 5; ++i) 
        graph.addEdge(Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
  
      graph.simulation.alpha(0.2).restart();
      console.log(graph.adj);
      console.log(graph.nodes);
      console.log(graph.edges);
    }, []);
  
    return <div data-testid="graphElement" ref={containerRef} />
  }