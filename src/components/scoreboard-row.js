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

function renderRow (place, probability, color) {
    return (<div className={`scoreboard-row ${place === 1 ? 'first-place' : 'not-first-place'}`}>
    <span className="scoreboard-row__place">Place {place}:</span>
    <span className="scoreboard-row__probability">{probability}</span>
    <img className="scoreboard-row__camel-icon no-select" src={symbols[`${color.toUpperCase()}_CAMEL`]} alt={`${color} camel`}/>
</div>)
}

const ScoreboardRow = observer((props) => {
    if (props.text) {
        return (<div className={`scoreboard-row first-place`}>
            <span className="scoreboard-row__place">{props.text}</span>
        </div>)
    } else {
        return renderRow(props.place, props.probability, props.color)
    }
})

export default ScoreboardRow