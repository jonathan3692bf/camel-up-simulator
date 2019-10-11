import React from 'react';

import BLUE_CAMEL1 from '../images/Camel-Blue-1-0.png'
import BLUE_CAMEL2 from '../images/Camel-Blue-2-0.png'
import BLUE_CAMEL3 from '../images/Camel-Blue-3-0.png'
import BLUE_CAMEL4 from '../images/Camel-Blue-4-0.png'

import GREEN_CAMEL1 from '../images/Camel-Green-1-0.png'
import GREEN_CAMEL2 from '../images/Camel-Green-2-0.png'
import GREEN_CAMEL3 from '../images/Camel-Green-3-0.png'
import GREEN_CAMEL4 from '../images/Camel-Green-4-0.png'

import ORANGE_CAMEL1 from '../images/Camel-Orange-1-0.png'
import ORANGE_CAMEL2 from '../images/Camel-Orange-2-0.png'
import ORANGE_CAMEL3 from '../images/Camel-Orange-3-0.png'
import ORANGE_CAMEL4 from '../images/Camel-Orange-4-0.png'

import WHITE_CAMEL1 from '../images/Camel-White-1-0.png'
import WHITE_CAMEL2 from '../images/Camel-White-2-0.png'
import WHITE_CAMEL3 from '../images/Camel-White-3-0.png'
import WHITE_CAMEL4 from '../images/Camel-White-4-0.png'

import YELLOW_CAMEL1 from '../images/Camel-Yellow-1-0.png'
import YELLOW_CAMEL2 from '../images/Camel-Yellow-2-0.png'
import YELLOW_CAMEL3 from '../images/Camel-Yellow-3-0.png'
import YELLOW_CAMEL4 from '../images/Camel-Yellow-4-0.png'

const icons = {
    'blue': [ BLUE_CAMEL1, BLUE_CAMEL2, BLUE_CAMEL3, BLUE_CAMEL4 ], 
    'green': [ GREEN_CAMEL1, GREEN_CAMEL2, GREEN_CAMEL3, GREEN_CAMEL4 ], 
    'yellow': [ YELLOW_CAMEL1, YELLOW_CAMEL2, YELLOW_CAMEL3, YELLOW_CAMEL4 ], 
    'white': [ WHITE_CAMEL1, WHITE_CAMEL2, WHITE_CAMEL3, WHITE_CAMEL4 ], 
    'orange': [ ORANGE_CAMEL1, ORANGE_CAMEL2, ORANGE_CAMEL3, ORANGE_CAMEL4 ]
}

function Camel (props) {
    const images = icons[`${props.color}`]
    const image = images[props.side > -1 ? props.side : 0]
    const style = Object.assign({'zIndex': props.beingDragged ? '1' : props.rank, 'cursor': props.beingDragged ? 'grabbing' : 'grab'}, props.coordinates)
    return (<div className="camel" style={style} onMouseDown={props.handleMouseDown} onTouchStart={props.handleMouseDown}>
        <img src={image} alt={`${props.color} camel`}/>
    </div>);
};

export default Camel;