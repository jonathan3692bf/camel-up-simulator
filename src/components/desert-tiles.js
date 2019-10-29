import React from 'react'
import { observer } from "mobx-react";
import { useStores } from '../hooks/use-stores'
import DesertTile from './desert-tile'

const DesertTiles = observer(() => {
    const { desertTileStore, uiStore } = useStores()
    return desertTileStore.tilesToBeRendered.map((name, index) => {
        return <DesertTile 
            type={name.slice(0, -1)} 
            name={name} 
            beingDragged={uiStore.piecesBeingDragged.indexOf(name) > -1} 
            handleMouseDown={uiStore.handleDragStart.bind(this, name)} 
            coordinates={uiStore.makeCoordinates(desertTileStore.getDesertTileCoordinates(name))} 
            key={name}/>
    })
})

export default DesertTiles