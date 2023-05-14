export const Navbar = ({
    togglePlanarity,
    planarity,
    toggleAddNodes,
    addNodes,
    toggleTriangulate,
    triangulate,
    toggleClear,
    clear,
    startColor,
    color,
    consoleError,
    consoleMessage
  }) => 
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
      >{planarity ? (triangulate ? `Stop` : `Connect`) :
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