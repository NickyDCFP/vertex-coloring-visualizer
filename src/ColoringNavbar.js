import React from 'react';
import Dropdown  from 'react-dropdown';
import { Play, ArrowLeft } from 'react-feather';
import { useEffect, useMemo } from 'react';
import { GithubButton } from './GithubButton';
export const ColoringNavbar = ({
    firstResolutionHeuristic,
    setFirstResolutionHeuristic,
    secondResolutionHeuristic,
    setSecondResolutionHeuristic,
    thirdResolutionHeuristic,
    setThirdResolutionHeuristic,
    orderingHeuristic,
    setOrderingHeuristic,
    consoleError,
    consoleMessage,
    toggleNavbar,
    startColor,
    color,
}) => {
    const defaultHeuristic1 = useMemo(() => ({value: null, label: "Heuristic 1..."}), []);
    const defaultHeuristic2 = useMemo(() => ({value: null, label: "Heuristic 2..."}), []);
    const defaultHeuristic3 = useMemo(() => ({value: null, label: "Heuristic 3..."}), []);

    const heuristics = [
        {value: "Kempe", label: "Kempe"},
        {value: "Wandering 5th", label: "Wandering 5th"},
        {value: "Backtracking", label: "Backtracking"},
    ];
    const heuristics1 = [defaultHeuristic1, ...heuristics]
        .filter(d => d.label !== firstResolutionHeuristic.label &&
                     d.label !== secondResolutionHeuristic.label &&
                     d.label !== thirdResolutionHeuristic.label);
    const heuristics2 = [defaultHeuristic2, ...heuristics]
        .filter(d => d.label !== firstResolutionHeuristic.label &&
            d.label !== secondResolutionHeuristic.label &&
            d.label !== thirdResolutionHeuristic.label);
    const heuristics3 = [defaultHeuristic3, ...heuristics]
        .filter(d => d.label !== firstResolutionHeuristic.label &&
            d.label !== secondResolutionHeuristic.label &&
            d.label !== thirdResolutionHeuristic.label);
    useEffect(() => {
        if(thirdResolutionHeuristic.value &&
           (!firstResolutionHeuristic.value ||
            !secondResolutionHeuristic.value ||
            !orderingHeuristic.value))
            setThirdResolutionHeuristic(defaultHeuristic3);
        if(secondResolutionHeuristic.value &&
           (!firstResolutionHeuristic.value ||
            !orderingHeuristic.value))
            setSecondResolutionHeuristic(defaultHeuristic2);
    }, [
        firstResolutionHeuristic,
        secondResolutionHeuristic,
        thirdResolutionHeuristic,
        setFirstResolutionHeuristic,
        setSecondResolutionHeuristic,
        setThirdResolutionHeuristic,
        orderingHeuristic,
        defaultHeuristic1,
        defaultHeuristic2,
        defaultHeuristic3,
    ]);
    const ordering_heuristics = [
        {value: null, label: "Ordering..."},
        {value: "Smallest-Last", label: "Smallest-Last"},
        {value: "Saturation", label: "Saturation"},
    ];
    return (
    <div className="user-interface">
        <button
            className="icon-button"
            onClick={toggleNavbar}
        ><ArrowLeft className="arrow-icon"/></button>
        <Dropdown
            className="heuristic-dropdown ordering-heuristic-dropdown"
            options={ordering_heuristics}
            value={orderingHeuristic}
            onChange={setOrderingHeuristic}
            placeholder="Ordering..."
        />
        <Dropdown
            className="heuristic-dropdown heuristic-dropdown-1"
            options={heuristics1}
            value={firstResolutionHeuristic}
            onChange={setFirstResolutionHeuristic}
        />
        {orderingHeuristic.value && firstResolutionHeuristic.value ?
            <>
                <Dropdown
                    className="heuristic-dropdown heuristic-dropdown-2"
                    options={heuristics2}
                    value={secondResolutionHeuristic}
                    onChange={setSecondResolutionHeuristic}
                />
                {secondResolutionHeuristic.value ? 
                <Dropdown
                    className="heuristic-dropdown heuristic-dropdown-3"
                    options={heuristics3}
                    value={thirdResolutionHeuristic}
                    onChange={setThirdResolutionHeuristic}
                /> : null}
                {color ?
                    null :
                    // <button
                    //     className="icon-button"
                    //     onClick={interrupt}
                    // ><Pause className="icon"/></button> : 
                    <button
                        className="icon-button"
                        onClick={startColor}
                        id="coloring-play-button"
                    ><Play className="icon"/></button>}
            </> : null}
        <GithubButton/>
        <div className={`console${consoleError ? `-error` : ``}`}>{consoleMessage}</div>
    </div>
    )
}