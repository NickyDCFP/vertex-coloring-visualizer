import { ArrowLeft, ArrowRight, X } from 'react-feather';
import * as d3 from 'd3';
import { useRef, useEffect } from 'react';
const paperLink = `https://link.springer.com/article/10.1007/BF01759077`;

export const TutorialMessage = ({pageMessages, pageNumber, setPage}) => {
    const messageWindow = useRef(null);
    useEffect(() => {
        if(messageWindow) {
            const window = d3.select(messageWindow.current);
            d3.select('.tutorial-title')
              .call(
                d3
                  .drag()
                  .on('start', event => {
                      event.sourceEvent.stopPropagation();
                      event.sourceEvent.preventDefault();
                  })
                  .on("drag", event => {
                      window.style('left', 
                          (parseFloat(window.style('left')) + event.sourceEvent.movementX) + 'px');
                      window.style('top', 
                          (parseFloat(window.style('top')) + event.sourceEvent.movementY) + 'px');
                  }))
        }
    }, [messageWindow, pageNumber]);
    if(pageNumber >= pageMessages.length) return null;
    d3.selectAll('.blinking')
        .classed('blinking', false);
    for(const blinkId of pageMessages[pageNumber][2]) {
      console.log(d3.selectAll(blinkId));
        d3.selectAll(blinkId)
            .classed('blinking', true);
    }
    return <>
      <div className='tutorial-div' ref={messageWindow}>
          <h1 className='tutorial-title'>{pageMessages[pageNumber][0]}</h1>
          {pageMessages[pageNumber][1].map((d, idx) => <div key={idx} className="tutorial-text">{d}</div>)}
          {pageNumber > 0 ? 
          <button
            className="tutorial-back-button"
            onClick={() => setPage(pageNumber - 1)}
          ><ArrowLeft className="arrow-icon"/></button> : null}
          <button
            className="tutorial-next-button"
            onClick={() => setPage(pageNumber + 1)}
          >{pageNumber < pageMessages.length - 1 ? <ArrowRight className="arrow-icon"/> : `Start`}</button>
          <button
            className="tutorial-x-button"
            onClick={() => setPage(pageMessages.length)}
          ><X className="arrow-icon"/></button>
          <a
            className="button-link blinking"
            target="_blank"
            rel="noreferrer"
            id="paper-link"
            href={paperLink}
        >Paper</a>
      </div>
    </>
  }