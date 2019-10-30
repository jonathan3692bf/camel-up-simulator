import React from 'react';
import { observer } from "mobx-react";
import { useStores } from '../hooks/use-stores'

import DiceBar from './dice-bar'
import Camels from './camels'
import Track from './track'
import DesertTiles from './desert-tiles'
import Scoreboard from './scoreboard'

const GameBoard = observer(() => {
    const { uiStore } = useStores()
    return (<div className="gameboard" onMouseMove={uiStore.handleDrag} onTouchMove={uiStore.handleDrag} onMouseUp={uiStore.handleDragEnd} onTouchEnd={uiStore.handleDragEnd}>
        <div className="gameboard-top"></div>
        <Scoreboard uiStore={uiStore}/>
        <Track />
        <Camels />
        <DesertTiles />
        <DiceBar />
        <div className="gameboard-bottom"></div>
    </div>);
    
})
export default GameBoard;