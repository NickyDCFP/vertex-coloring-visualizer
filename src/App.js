import './App.css';
import {GraphViz} from './GraphViz';

//maybe have pitches deepen as the recursion stack grows

// things to ask aloupis about:
  // curved edges necessary? the internal graph can be sufficiently complex, i'm sure

const innerHeight = window.innerHeight;
const innerWidth = window.innerWidth;

const App = () => {
  return (
    <GraphViz
      innerHeight={innerHeight}
      innerWidth={innerWidth}
      radius={7}
    />
  );
}

export default App;