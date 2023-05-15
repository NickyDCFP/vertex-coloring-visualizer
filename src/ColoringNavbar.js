import React from 'react';
import Dropdown  from 'react-dropdown';
import { Pause, Play, Square } from 'react-feather';
const interrupt = () => {return;}
export const ColoringNavbar = ({
    firstResolutionHeuristic,
    setFirstResolutionHeuristic,
    orderingHeuristic,
    setOrderingHeuristic,
    consoleError,
    consoleMessage,
    toggleNavbar,
    startColor,
    color,
}) => {
    const heuristics = ["Kempe", "Wandering 5th"];
    const ordering_heuristics = ["Smallest-Last", "Saturation"];
    // make hover same color as dropdown part
    return (
    <div className="user-interface">
        <Dropdown
            className="heuristic-dropdown"
            options={heuristics}
            value={firstResolutionHeuristic}
            onChange={setFirstResolutionHeuristic}
            placeholder="Heuristic 1..."
        />
        <Dropdown
            className="heuristic-dropdown"
            options={ordering_heuristics}
            value={orderingHeuristic}
            onChange={setOrderingHeuristic}
            placeholder="Ordering..."
        />
        {color ?
            <button
                className="icon-button"
                onClick={interrupt}
            ><Pause className="icon"/></button> : 
            <button
                className="icon-button"
                onClick={startColor}
            ><Play className="icon"/></button>
        }
        <button
            className="icon-button"
            onClick={toggleNavbar}
        ><Square className="icon"/></button>
        <div className={`console${consoleError ? `-error` : ``}`}>{consoleMessage}</div>
    </div>
    )
}