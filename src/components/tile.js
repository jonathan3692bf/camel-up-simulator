import React from 'react'
import OASIS_TILE from '../images/Button-Oasis.png'
import DESERT_TILE from '../images/Button-Mirage.png'

function Tile (props) {
    const image = props.type === 'oasis' ? OASIS_TILE : DESERT_TILE
    const style = Object.assign({'cursor': props.beingDragged ? 'grabbing' : 'grab'}, props.tileLocation)
    return (<div className="tile" style={style} onMouseDown={props.handleMouseDown} onTouchStart={props.handleMouseDown}>
        <img src={image} alt={`${props.type} tile`}/>
    </div>);
};

export default Tile;