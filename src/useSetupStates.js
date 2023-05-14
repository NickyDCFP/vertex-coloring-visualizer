import { useState, useCallback } from 'react';

export const useSetupStates = ({defaultConsoleMessage}) => {
    const [planarity, setPlanarity] = useState(true);
    const [addNodes, setAddNodes] = useState(false);
    const [triangulate, setTriangulate] = useState(false);
    const [clear, setClear] = useState(false);
    const [color, setColor] = useState(false);
    const [consoleMessage, setConsoleMessage] = useState(defaultConsoleMessage);
    const [consoleError, setConsoleError] = useState(false);
  
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
      setColor(true);
      printConsole(`Coloring...`);
    }
    const resetColor = () => setColor(false);
    const printConsole = useCallback((message, isError = false) => {
      setConsoleMessage(message);
      setConsoleError(isError);
    }, []);
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
    ]
  }
  