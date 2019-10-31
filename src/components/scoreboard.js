import React from 'react'
import { observer } from "mobx-react";
import { useStores } from '../hooks/use-stores'
import ScoreboardRow from './scoreboard-row'

const ScoreBoard = observer(() => {
    const { scoreboardStore } = useStores()
    const display = scoreboardStore.isUpdating ? [ { text: 'Calculating...' } ] : scoreboardStore.raceProbabilities
    return (<div className="scoreboard-container">
        {display.map(({ color, probability, text }, index) => 
            <ScoreboardRow key={index} color={color} place={index + 1} probability={`${Math.round(probability * 100)}%`} text={text}/>
        )}
    </div>)
})

export default ScoreBoard