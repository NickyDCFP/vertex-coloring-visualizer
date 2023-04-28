import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { Graph } from './Graph';

export const GraphViz = ({
  innerHeight,
  innerWidth,
  radius,
  printConsole,
  planar,
  addNodes,
  triangulate,
  toggleTriangulate,
  clear,
  toggleClear,
  color,
  resetColor,
}) => {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState(null);
  const [graph, setGraph] = useState(null);
  const [graphExists, setGraphExists] = useState(false);
  const [nodeInterval, setNodeInterval] = useState(null);
  const [triangulateInterval, setTriangulateInterval] = useState(null);
  const [coloringStarted, setColoringStarted] = useState(false);

  useEffect(() => {
    setSvg(d3.select(containerRef.current)
      .append('svg')
      .classed('graph-display', true)
      .attr('width', innerWidth)
      .attr('height', innerHeight));
  }, [innerWidth, innerHeight]);

  useEffect(() => {
    if (svg) {
      const colors = ['#45d097', '#f7a4a3', '#f6b656', '#42a5b3', '#b396ad', 'black'];
      svg.selectAll('*').remove();
      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;
      setGraph(new Graph(svg, centerX, centerY, colors, true, radius, planar));
      setGraphExists(true);
    }
  }, [svg, containerRef, innerHeight, innerWidth, radius, planar]);

  useEffect(() => {
    if (graphExists && graph.printConsole === null) {
      graph.configureConsole(printConsole);
    }
  }, [printConsole, graphExists, graph]);

  useEffect(() => {
    if (graphExists && addNodes && !nodeInterval) {
      setNodeInterval(setInterval(() => {
        graph.addNode();
      }, 30));
    }
    else if (!addNodes) {
      clearInterval(nodeInterval);
      setNodeInterval(null);
    }
  }, [addNodes, graph, graphExists, nodeInterval, setNodeInterval]);

  useEffect(() => {
    if (graphExists && triangulate && !triangulateInterval) {
      graph.initializeTriangulation();
      setTriangulateInterval(setInterval(() => {
        if (clear || !graph.triangulateStep()) { toggleTriangulate(true); }
      }, 1));
    }
    else if (!triangulate) {
      clearInterval(triangulateInterval);
      setTriangulateInterval(null);
    }
  },  [
        triangulate,
        clear,
        graph,
        graphExists,
        toggleTriangulate,
        triangulateInterval,
        setTriangulateInterval
      ]);

  useEffect(() => {
    if (graphExists && clear) {
      graph.clear();
      toggleClear();
      clearInterval(triangulateInterval);
      if(triangulate) toggleTriangulate();
      setTriangulateInterval(null);
    }
  }, [graph, graphExists, clear, toggleClear, triangulateInterval, toggleTriangulate, triangulate]);

  useEffect(() => {
    if (graphExists && color && !coloringStarted) {
      graph.color(resetColor);
      setColoringStarted(true);
    }
    else if(!color && coloringStarted) {
      setColoringStarted(false);
      printConsole('Finished coloring!');
    }
  },  [graph, graphExists, color, resetColor, coloringStarted, setColoringStarted, printConsole]);

  return <div data-testid="graphElement" ref={containerRef} />
}