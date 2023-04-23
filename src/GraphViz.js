import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { Graph } from './Graph';

export const GraphViz = ({
  innerHeight,
  innerWidth,
  radius,
  planar,
  addNodes,
  triangulate,
  toggleTriangulate,
  clear,
  toggleClear,
  color,
  resetColor
}) => {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState(null);
  const [graph, setGraph] = useState(null);
  const [graphExists, setGraphExists] = useState(false);
  const [triangulationBegun, setTriangulationBegun] = useState(false);

  useEffect(() => {
    setSvg(d3.select(containerRef.current)
      .append('svg')
      .classed('graph-display', true)
      .attr('width', innerWidth)
      .attr('height', innerHeight));
  }, [innerWidth, innerHeight]);

  useEffect(() => {
    if (svg) {
      const colors = ['#45d097', '#f2da57', '#f6b656', '#42a5b3', '#b396ad', 'black'];
      svg.selectAll('*').remove();
      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;
      setGraph(new Graph(svg, centerX, centerY, colors, true, radius, planar));
      setGraphExists(true);
    }
  }, [svg, containerRef, innerHeight, innerWidth, radius, planar]);

  useEffect(() => {
    let interval = null;

    if (graphExists && addNodes) {
      interval = setInterval(() => {
        if (!graph.addNode()) graph.addNode()
      }, 50);
    }
    else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [addNodes, graph, graphExists]);

  useEffect(() => {
    if (triangulate && graphExists && !triangulationBegun) {
      graph.initializeTriangulation();
      setTriangulationBegun(true);
    }
  }, [graph, graphExists, triangulate, triangulationBegun])

  useEffect(() => { //fix console error getting generated, max update depth exceeded
    let interval = null;

    if (graphExists && triangulate) {
      interval = setInterval(() => {
        if (!graph.triangulateStep()) { clearInterval(interval); toggleTriangulate(); }
      }, 3)
    }
    else {
      setTriangulationBegun(false);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [triangulate, graph, graphExists, toggleTriangulate]);

  useEffect(() => {
    if (graphExists && clear) {
      graph.clear();
      toggleClear();
    }
  }, [graph, graphExists, clear, toggleClear])

  useEffect(() => {
    if (graphExists && color) {
      graph.color();
      resetColor();
    }
  }, [graph, graphExists, color, resetColor])

  return <div data-testid="graphElement" ref={containerRef} />
}