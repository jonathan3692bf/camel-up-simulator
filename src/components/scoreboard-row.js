import React from 'react'
import { observer } from "mobx-react";

import BLUE_CAMEL from '../images/Camel-Blue-Symbol.png'
import GREEN_CAMEL from '../images/Camel-Green-Symbol.png'
import ORANGE_CAMEL from '../images/Camel-Orange-Symbol.png'
import WHITE_CAMEL from '../images/Camel-White-Symbol.png'
import YELLOW_CAMEL from '../images/Camel-Yellow-Symbol.png'

const symbols = {
    BLUE_CAMEL,
    GREEN_CAMEL,
    ORANGE_CAMEL,
    WHITE_CAMEL,
    YELLOW_CAMEL
}

const ScoreboardRow = observer((props) => {
    const style = {}//Object.assign({'cursor': props.beingDragged ? 'grabbing' : 'grab'}, props.coordinates)
    return (<div className={`scoreboard-row ${props.place === 1 ? 'first-place' : 'not-first-place'}`} style={style} >
        <span className="scoreboard-row__place">Place {props.place}:</span>
        <span className="scoreboard-row__probability">{props.probability}</span>
        <img className="scoreboard-row__camel-icon" src={symbols[`${props.color.toUpperCase()}_CAMEL`]} alt={`${props.color} camel`}/>
    </div>);
})

export default ScoreboardRow