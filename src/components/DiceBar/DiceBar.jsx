import React from 'react'
import { observer } from "mobx-react";

import BLUE_DICE from '../../images/Die-Blue.png'
import GREEN_DICE from '../../images/Die-Green.png'
import ORANGE_DICE from '../../images/Die-Orange.png'
import WHITE_DICE from '../../images/Die-White.png'
import YELLOW_DICE from '../../images/Die-Yellow.png'

const DIE_IMAGES = { BLUE_DICE, GREEN_DICE, ORANGE_DICE, WHITE_DICE, YELLOW_DICE }

const DiceBar = observer(({ store }) => {
    const { dieRolled, onDiceClick } = store
    
    return (<div className="gameboard-dice-bar">
        {Object.entries(dieRolled).map(([color, rolled]) => (
        <div className="gameboard-dice-bar-hitbox" onClick={() => onDiceClick(color)} key={color}>
            <img src={DIE_IMAGES[`${color.toUpperCase()}_DICE`]} className={rolled ? 'rolled' : ''} alt={`${color} dice`} />
        </div>
        ))}
    </div>)
})

export default DiceBar