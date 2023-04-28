import './App.css';
import { GraphViz } from './GraphViz';
import { useState, useCallback } from 'react';

// Known bugs:
  // Edges don't properly delete after coloring
  // (ghost edges, can still be caught by planarity checks but aren't visible)

// Down the road:
  // Add icon/better meta tags
  // sounds for coloring, maybe have pitches deepen as the recursion stack grows
  // control stuff with react dropdowns

// to alter:
  // allow user to move nodes --> click on a menu and they can move or remove 
  // instead of "triangulate" have something like "make a dense plane graph"
  // allow user to "step back" and "step back to the most interesting step recently"
  // mention limitations: this generates plane graphs, not planar graphs
    // you can technically draw any planar graph in the plane with straight edges
  // make the colors more distinctive

const innerHeight = window.innerHeight;
const innerWidth = window.innerWidth;
const defaultConsoleMessage = 'Welcome! Please swap to Planar mode for vertex coloring!';


const App = () => {
  const [planarity, setPlanarity] = useState(false);
  const [addNodes, setAddNodes] = useState(false);
  const [triangulate, setTriangulate] = useState(false);
  const [clear, setClear] = useState(false);
  const [color, setColor] = useState(false);
  const [consoleMessage, setConsoleMessage] = useState(defaultConsoleMessage);
  const [consoleError, setConsoleError] = useState(false);

  const togglePlanarity = () => {
    setPlanarity(!planarity);
    let message;
    if (!planarity) message = `Planar! Add nodes and triangulate for a more complex graph.
                              Let's color!`;
    else message = 'Non-planar!';
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
    if (!triangulate) message = planarity ? `Triangulating...` : `Completing...`;
    else if (finished === true) message = `Finished ${planarity ? `triangulating` : `completing`}!`;
    else message = `Stopped ${planarity ? `triangulating` : `completing`}.`;
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

  return (
    <>
      <div className="user-interface">
        <button
          onClick={togglePlanarity}
          className="toggle-button"
        >{planarity ? 'Non-Planar' : 'Planar'}</button>
        <button
          onClick={toggleAddNodes}
          className={`state-button-${addNodes ? `on` : `off`}`}
        >{addNodes ? 'Stop' : 'Add Nodes'}</button>
        <button
          onClick={() => toggleTriangulate(false)}
          className={`state-button-${triangulate ? `on` : `off`}`}
        >{planarity ? (triangulate ? `Stop` : `Triangulate`) :
          (triangulate ? `Stop` : `Complete`)}</button>
        <button
          onClick={toggleClear}
          className="toggle-button"
        >{clear ? `Clearing` : `Clear`}</button>
        {planarity ?
          <button
            onClick={startColor}
            className="toggle-button"
          >{color ? `Coloring` : `Color`}</button> : null}
        <div className={`console${consoleError ? `-error` : ``}`}>{consoleMessage}</div>
      </div>
      <GraphViz
        innerHeight={innerHeight}
        innerWidth={innerWidth}
        radius={9}
        printConsole={printConsole}
        planar={planarity}
        addNodes={addNodes}
        triangulate={triangulate}
        toggleTriangulate={toggleTriangulate}
        clear={clear}
        toggleClear={toggleClear}
        color={color}
        resetColor={resetColor}
      />
    </>
  );
}

export default App;