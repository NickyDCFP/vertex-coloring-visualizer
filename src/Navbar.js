import { GithubButton } from "./GithubButton";
export const Navbar = ({
    togglePlanarity,
    planarity,
    toggleAddNodes,
    addNodes,
    toggleTriangulate,
    triangulate,
    toggleClear,
    clear,
    consoleError,
    consoleMessage,
    toggleNavbar,
  }) => 
    <div className="user-interface">
      <button
        onClick={togglePlanarity}
        className="toggle-button"
        id="planar-button"
      >{planarity ? 'Non-Planar' : 'Planar'}</button>
      <button
        onClick={toggleAddNodes}
        className={`state-button-${addNodes ? `on` : `off`}`}
        id="add-nodes-button"
      >{addNodes ? 'Stop' : 'Add Nodes'}</button>
      <button
        onClick={() => toggleTriangulate(false)}
        className={`state-button-${triangulate ? `on` : `off`}`}
        id="triangulate-button"
      >{planarity ? (triangulate ? `Stop` : `Connect`) :
        (triangulate ? `Stop` : `Complete`)}</button>
      <button
        onClick={toggleClear}
        className="toggle-button"
        id="clear-button"
      >{clear ? `Clearing` : `Clear`}</button>
      {planarity ?
        <button
          onClick={toggleNavbar}
          className="toggle-button"
          id="color-button"
        >Color</button> : null}
      <GithubButton/>
      <div className={`console${consoleError ? `-error` : ``}`} id="console">{consoleMessage}</div>
    </div>