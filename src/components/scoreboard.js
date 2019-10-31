import React from 'react'
import { observer } from "mobx-react";
import { useStores } from '../hooks/use-stores'
import ScoreboardRow from './scoreboard-row'

const ScoreBoard = observer(() => {
    const { scoreboardStore } = useStores()
    return (<div className="scoreboard-container">
        {scoreboardStore.raceProbabilities.map(({ color, probability }, index) => 
            <ScoreboardRow key={index} color={color} place={index + 1} probability={`${Math.round(probability * 100)}%`}/>
        )}
    </div>)
})

export default ScoreBoard