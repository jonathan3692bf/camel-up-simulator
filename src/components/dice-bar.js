import React from 'react'
import BLUE_DICE from '../images/Die-Blue.png'
import GREEN_DICE from '../images/Die-Green.png'
import ORANGE_DICE from '../images/Die-Orange.png'
import WHITE_DICE from '../images/Die-White.png'
import YELLOW_DICE from '../images/Die-Yellow.png'

const DIE_COLORS = [ 'blue', 'green', 'orange', 'white', 'yellow']
const DIE_IMAGES = { BLUE_DICE, GREEN_DICE, ORANGE_DICE, WHITE_DICE, YELLOW_DICE }

function DiceBar (props) {
    // const image = props.type === 'oasis' ? OASIS_TILE : MIRAGE_TILE
    const style = Object.assign({}, props.coordinates)
    return (<div className="gameboard-dice-bar" style={style} onMouseDown={props.handleMouseDown} onTouchStart={props.handleMouseDown}>
        {DIE_COLORS.map(color => {
            return (<div className="gameboard-dice-bar-hitbox" onClick={() => props.onDiceClick(color)} key={color}>
                <img src={DIE_IMAGES[`${color.toUpperCase()}_DICE`]} className={props[`${color}DiceRolled`] ? 'rolled' : ''} alt={`${color} dice`} />
            </div>)
        })

        }
        {/* <div className="gameboard-dice-bar-hitbox" onClick={props.handleDiceClick('blue')}>
            <img src={BLUE_DICE} className={props.blueDiceRolled ? 'rolled' : ''} alt="blue dice" />
        </div>
        <div className="gameboard-dice-bar-hitbox" onClick={props.handleDiceClick('green')}>
            <img src={GREEN_DICE} className={props.greenDiceRolled ? 'rolled' : ''} alt="green dice" />
        </div>
        <div className="gameboard-dice-bar-hitbox" onClick={props.handleDiceClick('orange')}>
            <img src={ORANGE_DICE} className={props.orangeDiceRolled ? 'rolled' : ''} alt="orange dice" /> 
        </div>
        <div className="gameboard-dice-bar-hitbox" onClick={props.handleDiceClick('white')}>
            <img src={WHITE_DICE} className={props.whiteDiceRolled ? 'rolled' : ''} alt="white dice" />
        </div>
        <div className="gameboard-dice-bar-hitbox" onClick={props.handleDiceClick('yellow')}>
            <img src={YELLOW_DICE} className={props.yellowDiceRolled ? 'rolled' : ''} alt="yellow dice" />
        </div> */}
    </div>);
};

export default DiceBar;