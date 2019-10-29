import React from 'react'
import { observer } from "mobx-react";
import { useStores } from '../hooks/use-stores'
import TrackSegment from './track-segment'

const Track = observer(() => {
    const { trackStore, uiStore } = useStores()
    return trackStore.SEGMENT_COORDINATES.map((coordinates, index) => {
        const tileNumber = index
        return <TrackSegment 
            validMove={uiStore.validMove}
            camelBeingDragged={uiStore.draggedState} 
            beingCovered={trackStore.segmentBeingCovered === tileNumber}
            coordinates={uiStore.makeCoordinates(coordinates)} 
            trackTileNumber={tileNumber} 
            handleMouseOver={uiStore.handleTrackSegmentMouseOver.bind(this, tileNumber)}
            handleMouseOut={uiStore.handleTrackSegmentMouseOut} 
            key={index}/>
    })
})

export default Track