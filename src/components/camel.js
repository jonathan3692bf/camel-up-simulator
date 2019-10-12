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

import RANK_1_LEFT from '../images/Rank-1-Left.png'
import RANK_1_RIGHT from '../images/Rank-1-Right.png'
import RANK_2_LEFT from '../images/Rank-2-Left.png'
import RANK_2_RIGHT from '../images/Rank-2-Right.png'
import RANK_3_LEFT from '../images/Rank-3-Left.png'
import RANK_3_RIGHT from '../images/Rank-3-Right.png'
import RANK_4_LEFT from '../images/Rank-4-Left.png'
import RANK_4_RIGHT from '../images/Rank-4-Right.png'
import RANK_5_LEFT from '../images/Rank-5-Left.png'
import RANK_5_RIGHT from '../images/Rank-5-Right.png'


const ICONS = {
    'blue': [ BLUE_CAMEL1, BLUE_CAMEL2, BLUE_CAMEL3, BLUE_CAMEL4 ], 
    'green': [ GREEN_CAMEL1, GREEN_CAMEL2, GREEN_CAMEL3, GREEN_CAMEL4 ], 
    'yellow': [ YELLOW_CAMEL1, YELLOW_CAMEL2, YELLOW_CAMEL3, YELLOW_CAMEL4 ], 
    'white': [ WHITE_CAMEL1, WHITE_CAMEL2, WHITE_CAMEL3, WHITE_CAMEL4 ], 
    'orange': [ ORANGE_CAMEL1, ORANGE_CAMEL2, ORANGE_CAMEL3, ORANGE_CAMEL4 ]
}

const RANK_IMAGES = {
    'left': [ RANK_1_LEFT, RANK_2_LEFT, RANK_3_LEFT, RANK_4_LEFT, RANK_5_LEFT ],
    'right': [ RANK_1_RIGHT, RANK_2_RIGHT, RANK_3_RIGHT, RANK_4_RIGHT, RANK_5_RIGHT ]
}

function Camel (props) {
    const images = ICONS[`${props.color}`]
    const image = images[props.side > -1 ? props.side : 0]
    const rankSide = props.side % 2 === 0 ? 'right' : 'left'
    const rankImage = RANK_IMAGES[rankSide][props.rank - 1]
    const style = Object.assign({'zIndex': props.beingDragged ? '1' : props.zIndex + 2, 'cursor': props.beingDragged ? 'grabbing' : 'grab'}, props.coordinates)
    return (<div className="camel" style={style} onMouseDown={props.handleMouseDown} onTouchStart={props.handleMouseDown}>
        <img className="camel-image" src={image} alt={`${props.color} camel`}/>
        <img className={`camel-rank camel-rank-${rankSide}-${props.side}`} src={rankImage} alt={`rank: ${props.rank}`}/>
    </div>);
};

export default Camel;