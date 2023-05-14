import './App.css';
import { GraphViz } from './GraphViz';
import { Navbar } from './Navbar';
import { useSetupStates } from './useSetupStates';

// Known bugs:
  // Edges don't properly delete after coloring
  // (ghost edges, can still be caught by planarity checks but aren't visible)

// Down the road:
  // Add icon/better meta tags
  // sounds for coloring, maybe have pitches deepen as the recursion stack grows
  // control stuff with react dropdowns

// to alter:
  // allow user to move nodes --> click on a menu and they can move or remove 
  // once explanations are in -- allow user to "step back" and "step back to the most interesting step recently"
  // mention limitations: this generates plane graphs, not planar graphs
    // you can technically draw any planar graph in the plane with straight edges

const innerHeight = window.innerHeight;
const innerWidth = window.innerWidth;
const defaultConsoleMessage = `Add nodes and edges for a more complex graph. Let's color!`;

const App = () => {
  const [
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
  ] = useSetupStates(defaultConsoleMessage);
  return (
    <>
      <Navbar
        togglePlanarity={togglePlanarity}
        planarity={planarity}
        toggleAddNodes={toggleAddNodes}
        addNodes={addNodes}
        toggleTriangulate={toggleTriangulate}
        triangulate={triangulate}
        toggleClear={toggleClear}
        clear={clear}
        startColor={startColor}
        color={color}
        consoleError={consoleError}
        consoleMessage={consoleMessage}
      />
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