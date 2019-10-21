import React from 'react';
import BLACK_TRACK_MARKER from '../images/Trackmarker-Black.png'
import RED_TRACK_MARKER from '../images/Trackmarker-Red.png'

function preventDefault (e) {
    e.preventDefault();
}
function TrackSegment (props) {
    const image = props.validMove ? BLACK_TRACK_MARKER : RED_TRACK_MARKER
    const style = Object.assign({
        'opacity': props.beingCovered ? '0.6' : '0',
        'zIndex': props.camelBeingDragged ? '10': '1',
        'cursor': props.camelBeingDragged ? 'grabbing': 'unset'
    }, props.coordinates)
    return (<div className="track-tile" style={style} 
    onMouseDown={preventDefault} 
    onTouchStart={preventDefault} 
    onMouseOver={props.handleMouseOver} 
    onMouseOut={props.handleMouseOut}>
        <img src={image} alt={`track segment`}/>
    </div>);
};

export default TrackSegment;