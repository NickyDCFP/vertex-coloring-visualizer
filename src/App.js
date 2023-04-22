import './App.css';
import {GraphViz} from './GraphViz';
import {useState} from 'react';

// Down the road:
    // Add icon/better meta tags
    // sounds for coloring, maybe have pitches deepen as the recursion stack grows
    // Maybe include a little mini-console at the top right

// things to ask aloupis about:
  // curved edges necessary? the internal graph can be sufficiently complex, i'm sure

const innerHeight = window.innerHeight;
const innerWidth = window.innerWidth;


const App = () => {
  const [planarity, setPlanarity] = useState(false);
  const [addNodes, setAddNodes] = useState(false);
  const [triangulate, setTriangulate] = useState(false);
  const [clear, setClear] = useState(false);

  const togglePlanarity = () => setPlanarity(!planarity);
  const toggleAddNodes = () => setAddNodes(!addNodes);
  const toggleTriangulate = () => setTriangulate(!triangulate);
  const toggleClear = () => setClear(!clear);

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
        >{addNodes ? 'Stop Adding' : 'Add Nodes'}</button>
        <button
          onClick={toggleTriangulate}
          className={`state-button-${triangulate ? `on` : `off`}`}
        >{planarity ? (triangulate ? `Stop` : `Triangulate`) : 
                      (triangulate ? `Stop` : `Complete`)}</button>
        <button
          onClick={toggleClear}
          className="toggle-button"
        >{clear ? `Clearing` : `Clear`}</button>
    </div>
    <GraphViz
      innerHeight={innerHeight}
      innerWidth={innerWidth}
      radius={9}
      planar={planarity}
      addNodes={addNodes}
      triangulate={triangulate}
      toggleTriangulate={toggleTriangulate}
      clear={clear}
      toggleClear = {toggleClear}
    />
    </>
  );
}

export default App;