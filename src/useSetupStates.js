import { useState, useCallback } from 'react';

const defaultConsoleMessage = `Add nodes and edges for a more complex graph. Let's color!`; 

export const useSetupStates = () => {
    const [planarity, setPlanarity] = useState(true);
    const [addNodes, setAddNodes] = useState(false);
    const [triangulate, setTriangulate] = useState(false);
    const [clear, setClear] = useState(false);
    const [color, setColor] = useState(false);
    const [consoleMessage, setConsoleMessage] = useState(defaultConsoleMessage);
    const [consoleError, setConsoleError] = useState(false);
    const [firstResolutionHeuristic, setFirstResolutionHeuristic] = useState(null);
    const [defaultNavbar, setDefaultNavbar] = useState(true);
    const [orderingHeuristic, setOrderingHeuristic] = useState(null);
  
    const togglePlanarity = () => {
      setPlanarity(!planarity);
      let message;
      if (!planarity) message = `Planar!`;
      else message = 'Non-planar! (Just for fun, no coloring here!)';
      printConsole(message);
    }
    const toggleAddNodes = () => {
      setAddNodes(!addNodes);
      let message;
      if (!addNodes) message = `Adding nodes... Please stop this manually.`;
      else message = `Stopped adding nodes.`;
      printConsole(message);
    }
    const toggleTriangulate = (finished = false) => {
      setTriangulate(!triangulate);
      let message;
      if (!triangulate) message = planarity ? `Connecting...` : `Completing...`;
      else if (finished === true) message = `Finished ${planarity ? `connecting` : `completing`}!`;
      else message = `Stopped ${planarity ? `connecting` : `completing`}.`;
      printConsole(message);
    }
    const toggleClear = () => {
      setClear(!clear);
      if(!clear) printConsole(`Cleared!`);
    }
    const startColor = () => {
      if(!firstResolutionHeuristic) {
        printConsole('Please choose your first resolution heuristic.', true);
        return;
      }
      else if(!orderingHeuristic) {
        printConsole('Please choose an ordering heuristic.', true);
        return;
      }
      setColor(true);
      printConsole(`Coloring...`);
    }
    const resetColor = () => setColor(false);
    const printConsole = useCallback((message, isError = false) => {
      setConsoleMessage(message);
      setConsoleError(isError);
    }, []);
    const toggleNavbar = () => setDefaultNavbar(!defaultNavbar);
    return [
      planarity,
      togglePlanarity,
      addNodes,
      toggleAddNodes,
      triangulate,
      toggleTriangulate,
      clear,
      toggleClear,
      color,
      startColor,
      resetColor,
      consoleMessage,
      consoleError,
      printConsole,
      firstResolutionHeuristic,
      setFirstResolutionHeuristic,
      defaultNavbar,
      toggleNavbar,
      orderingHeuristic,
      setOrderingHeuristic,
    ]
  }
  