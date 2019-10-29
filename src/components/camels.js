import React from 'react'
import { observer } from "mobx-react";
import { useStores } from '../hooks/use-stores'
import Camel from './camel'

const Camels = observer(() => {
    const { camelStore, trackStore, uiStore } = useStores()
    return camelStore.raceRank.map((color, index) => {
        const coordinates = uiStore.makeCoordinates(camelStore.getCamelCoordinates(color, 'current'))
        const trackSegment = camelStore.getCamelTrackSegmentLocation(color, 'current')
        const side = trackSegment >= 0 ? camelStore.TRACK_SEGMENT_TO_ICON_SIDE_MAP[trackSegment] - 1 : 0
        const positionInStack = trackSegment >= 0 ? trackStore.trackOccupants[trackSegment].indexOf(color) : 0
        
        return <Camel
            color={color}
            side={side}
            beingDragged={uiStore.piecesBeingDragged.indexOf(color) > -1 } 
            handleMouseDown={uiStore.handleDragStart.bind(this, color)} 
            coordinates={coordinates} 
            rank={index + 1} 
            zIndex={positionInStack}
            key={color}/> 
    })
})

export default Camels