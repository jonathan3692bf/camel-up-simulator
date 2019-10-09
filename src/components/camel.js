import React from 'react';

function Camel (props) {
    const style = Object.assign({'zIndex': props.rank, 'cursor': props.beingDragged ? 'grabbing' : 'grab'}, props.tileLocation)
    return (<div className="camel" style={style} onMouseDown={props.handleMouseDown} onTouchStart={props.handleMouseDown}>
        <img src={props.icon} alt={`${props.color} camel`}/>
    </div>);
};

export default Camel;