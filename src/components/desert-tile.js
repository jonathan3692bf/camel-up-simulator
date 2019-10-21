import React from 'react'
import OASIS_TILE from '../images/Button-Oasis.png'
import MIRAGE_TILE from '../images/Button-Mirage.png'

function DesertTile (props) {
    const image = props.type === 'oasis' ? OASIS_TILE : MIRAGE_TILE
    const style = Object.assign({'cursor': props.beingDragged ? 'grabbing' : 'grab'}, props.coordinates)
    return (<div className="desert-tile" style={style} onMouseDown={props.handleMouseDown} onTouchStart={props.handleMouseDown}>
        <img src={image} alt={`${props.type} tile`}/>
    </div>);
};

export default DesertTile;