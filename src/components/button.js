import React from 'react';

function Button (props) {
    const style = Object.assign({'cursor': props.beingDragged ? 'grabbing' : 'grab'}, props.tileLocation)
    return (<div className="button" style={style} onMouseDown={props.handleMouseDown} onTouchStart={props.handleMouseDown}>
        <img src={props.icon} alt={`${props.type} button`}/>
    </div>);
};

export default Button;