import './App.css';
import { GraphViz } from './GraphViz';
import { Navbar } from './Navbar';
import { ColoringNavbar } from './ColoringNavbar'
import { useSetupStates } from './useSetupStates';

// Known bugs:
  // Edges don't properly delete after coloring
  // (ghost edges, can still be caught by planarity checks but aren't visible)

// Down the road:
  // Add icon/better meta tags
  // sounds for coloring, maybe have pitches deepen as the recursion stack grows
  // maybe merge the three dropdowns for heuristic selection into
  // one dropdown where you can select a few?

// to alter:
  // allow user to move nodes --> click on a menu and they can move or remove 
  // once explanations are in -- allow user to "step back" and "step back to the most interesting step recently"
  // mention limitations: this generates plane graphs, not planar graphs
    // you can technically draw any planar graph in the plane with straight edges
    // note that you only need an ordering heuristic and one resolution heuristic to color,
    // but you can select up to three.

const innerHeight = window.innerHeight;
const innerWidth = window.innerWidth;

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
    firstResolutionHeuristic,
    setFirstResolutionHeuristic,
    secondResolutionHeuristic,
    setSecondResolutionHeuristic,
    thirdResolutionHeuristic,
    setThirdResolutionHeuristic,
    defaultNavbar,
    toggleNavbar,
    orderingHeuristic,
    setOrderingHeuristic
  ] = useSetupStates();
  return (
    <>
      {defaultNavbar ? 
        <Navbar
          togglePlanarity={togglePlanarity}
          planarity={planarity}
          toggleAddNodes={toggleAddNodes}
          addNodes={addNodes}
          toggleTriangulate={toggleTriangulate}
          triangulate={triangulate}
          toggleClear={toggleClear}
          clear={clear}
          consoleError={consoleError}
          consoleMessage={consoleMessage}
          toggleNavbar={toggleNavbar}
        /> :
        <ColoringNavbar
          firstResolutionHeuristic={firstResolutionHeuristic}
          setFirstResolutionHeuristic={setFirstResolutionHeuristic}
          secondResolutionHeuristic={secondResolutionHeuristic}
          setSecondResolutionHeuristic={setSecondResolutionHeuristic}
          thirdResolutionHeuristic={thirdResolutionHeuristic}
          setThirdResolutionHeuristic={setThirdResolutionHeuristic}
          orderingHeuristic={orderingHeuristic}
          setOrderingHeuristic={setOrderingHeuristic}
          consoleError={consoleError}
          consoleMessage={consoleMessage}
          toggleNavbar={toggleNavbar}
          startColor={startColor}
          color={color}
        />}
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
        firstResolutionHeuristic={firstResolutionHeuristic}
        secondResolutionHeuristic={secondResolutionHeuristic}
        thirdResolutionHeuristic={thirdResolutionHeuristic}
        orderingHeuristic={orderingHeuristic}
      />
    </>
  );
}

export default App;