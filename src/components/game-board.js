import React from 'react';
import Camel from './camel'
import Tile from './tile'
import TrackTile from './track-tile'

const CAMELS = ['blue', 'yellow', 'orange', 'green', 'white'];
const TILES = ['oasis', 'desert'].map((tile, index, array) => {
    const enumeratedTiles = []
    for (let i = 1; i < 6; i++) {
        enumeratedTiles[i - 1] = `${tile}${i}`
    }
    return enumeratedTiles
}).reduce((prev, current) => prev.concat(current))
const DRAGGABLES = CAMELS.concat(TILES)
const TILE_LOCATION_TO_ICON_SIDE_MAP = {
    1: 1,
    2: 1,
    15: 1,
    16: 1,
    3: 2,
    4: 2,
    5: 2,
    6: 2,
    7: 3,
    8: 3,
    9: 3, 
    10: 3,
    11: 4,
    12: 4,
    13: 4,
    14: 4,
}
const TRACK_TILE_LOCATIONS = [
    { top: '370px', left: '820px' },
    { top: '420px', left: '920px' },
    { top: '470px', left: '1020px' },
    { top: '520px', left: '920px' },
    { top: '570px', left: '820px' },
    { top: '620px', left: '720px' },
    { top: '670px', left: '620px' },
    { top: '620px', left: '520px' },
    { top: '570px', left: '420px' },
    { top: '520px', left: '320px' },
    { top: '470px', left: '220px' },
    { top: '420px', left: '320px' },
    { top: '370px', left: '420px' },
    { top: '320px', left: '520px' },
    { top: '270px', left: '620px' },
    { top: '320px', left: '720px' }
]

function calcTie () {

    // top + (rank - 1)*60px
}

class GameBoard extends React.Component {
    constructor (props) {
        super(props);
        const state = { 
            'beingDragged': false,
            'bluePosition': {'top': '160px', 'left': '940px'},
            'greenPosition': {'top': '270px', 'left': '1180px'},
            'yellowPosition': {'top': '360px', 'left': '1120px'},
            'whitePosition': {'top': '240px', 'left': '1050px'},
            'orangePosition': {'top': '280px', 'left': '940px'},
        }

        TILES.forEach(tile => {
            state[`${tile}Position`] = tile.includes('oasis') ? {'top': '620px', 'left': '1000px'} : {'top': '560px', 'left': '1090px'}
        })

        this.state = state

        this.handleDragStart = this.handleDragStart.bind(this)
        this.handleDrag = this.handleDrag.bind(this)
        this.handleDragEnd = this.handleDragEnd.bind(this)

        this.handleTrackTileMouseEnter = this.handleTrackTileMouseEnter.bind(this)
        this.handleTrackTileMouseOut = this.handleTrackTileMouseOut.bind(this)
    }

    componentDidMount () {
        // This needs to be here fore Safari because iOS has a passive event issue
        // link: https://stackoverflow.com/questions/49500339/cant-prevent-touchmove-from-scrolling-window-on-ios
        document.addEventListener('touchmove', ((e) => {
            if (this.state.beingDragged) return e.preventDefault()
        }).bind(this), {passive: false});
    }

    componentWillUnmount () {
        document.removeEventListener('touchmove', (e) => e.preventDefault());
    }

    handleDragStart (draggedItem, e) {
        if (DRAGGABLES.indexOf(draggedItem) < 0) return
        
        // e.stopPropagation()
        e.preventDefault()
        const state = { 'beingDragged': draggedItem, mousePosition: {} };
        
        document.body.className = 'no-touch-scroll'
        if (e.changedTouches && e.changedTouches.length) {
            e = e.changedTouches[e.changedTouches.length - 1]
        }
        state.mousePosition.top = e.pageY
        state.mousePosition.left = e.pageX
        state[`${draggedItem}LastPosition`] = this.state[`${draggedItem}Position`]
        
        this.setState(state)
    }

    handleDrag (e) {
        if (!this.state.beingDragged) return
        // e.stopPropagation()
        e.preventDefault()
        let TOUCHSCREEN = false
        if (e.changedTouches && e.changedTouches.length) {
            e = e.changedTouches[e.changedTouches.length - 1]
            TOUCHSCREEN = true
        }
        
        const draggedItem = this.state.beingDragged
        const previousMousePosition = this.state.mousePosition
        const previousItemPosition = Object.assign({}, this.state[`${draggedItem}Position`])
        
        if (typeof previousItemPosition.top === 'string') {
            previousItemPosition.top = Number(previousItemPosition.top.slice(0, -2))
        }
        
        if (typeof previousItemPosition.left === 'string') {
            previousItemPosition.left = Number(previousItemPosition.left.slice(0, -2))
        }

        const currentMousePosition = { top: e.pageY, left: e.pageX }
        
        const delta = {}
        delta.top = currentMousePosition.top - previousMousePosition.top
        delta.left = currentMousePosition.left - previousMousePosition.left
        
        const state = { 'mousePosition': currentMousePosition }
        state[`${draggedItem}Position`] = {
            'top': previousItemPosition.top + delta.top + 'px',
            'left': previousItemPosition.left + delta.left + 'px'
        }

        if (this.state.tileBeingCovered) {
            state[`${this.state.beingDragged}TrackLocation`] = this.state.tileBeingCovered
        }
        if (TOUCHSCREEN) {
            const closestTile = this.findClosestTrackTile(state[`${draggedItem}Position`])
            if (closestTile) {
                state.tileBeingCovered = closestTile
            }
        }
        

        this.setState(state)
    }

    removePX (position) {
        position = Object.assign({}, position)
        const top = Number(position.top.slice(0, -2))
        const left = Number(position.left.slice(0, -2))
        return { top, left }
    }

    findClosestTrackTile (position) {
        position = this.removePX(position)
        position.top += 100
        position.left += 55
        
        for (let i = 0; i < TRACK_TILE_LOCATIONS.length; i++) {
            const tileCoordinates = this.removePX(TRACK_TILE_LOCATIONS[i])
            const tileTop = tileCoordinates.top
            const tileBottom = tileTop + 95
            const tileLeft = tileCoordinates.left
            const tileRight = tileLeft + 202

            if (position.top < tileBottom && position.top >= tileTop) {
                if (position.left >= tileLeft && position.left < tileRight) {
                    return i + 1
                }
            }
        }
    }

    handleDragEnd (e) {
        const draggedItem = this.state.beingDragged
        if (!draggedItem) return
        // e.stopPropagation()
        e.preventDefault()
        document.body.className = ''

        const state = { 'beingDragged': false, 'tileBeingCovered': false }

        if (this.state.tileBeingCovered) {
            state[`${draggedItem}Position`] = Object.assign({}, TRACK_TILE_LOCATIONS[this.state.tileBeingCovered - 1 ])
            
            const position = state[`${draggedItem}Position`]
            // adjust for camel and tile size differnce
            const top = typeof position.top === 'number' ? position.top : Number(position.top.slice(0, -2))
            const left = typeof position.left === 'number' ? position.left : Number(position.left.slice(0, -2))
            if (draggedItem.includes('oasis') || draggedItem.includes('desert')) {
                state[`${draggedItem}Position`].top = top - 50 + 'px'
                state[`${draggedItem}Position`].left = left - 20 + 'px'
            } else {
                state[`${draggedItem}Position`].top = top - 60 + 'px'
            }
            
        } else {
            state[`${draggedItem}Position`] = this.state[`${draggedItem}LastPosition`]
        }
        
        this.setState(state)
    }

    handleTrackTileMouseEnter (tileNumber, e) {
        e.preventDefault()
        if (!this.state.beingDragged) return 
        console.log(tileNumber)
        this.setState({ 'tileBeingCovered': tileNumber })
    }

    handleTrackTileMouseOut (e) {
        // console.log( e)
        e.preventDefault()
        this.setState({ 'tileBeingCovered': false })
    }

    renderCamels () {
        return CAMELS.map((camelColor) => {
            const location = this.state[`${camelColor}Position`];
            const trackLocation = this.state[`${camelColor}TrackLocation`]
            const side = TILE_LOCATION_TO_ICON_SIDE_MAP[trackLocation] - 1
            return <Camel color={camelColor} side={side} beingDragged={this.state.beingDragged == camelColor} handleMouseDown={this.handleDragStart.bind(this, camelColor)} tileLocation={location} rank={3} key={camelColor}/>
        })
    }

    renderTiles () {
        return TILES.map((tileName) => {
            const location = this.state[`${tileName}Position`]
            return <Tile 
                type={tileName.replace(/\d+/, '')} 
                name={tileName} 
                beingDragged={this.state.beingDragged === tileName} 
                handleMouseDown={this.handleDragStart.bind(this, tileName)} 
                tileLocation={location} 
                key={tileName}/>
        })
    }

    renderTrackTiles () {
        return TRACK_TILE_LOCATIONS.map((tileLocation, index) => {
            const tileNumber = index + 1
            return <TrackTile 
                camelBeingDragged={this.state.beingDragged} 
                beingCovered={this.state.tileBeingCovered === tileNumber}
                location={tileLocation} 
                trackTileNumber={tileNumber} 
                handleMouseEnter={this.handleTrackTileMouseEnter.bind(this, tileNumber)}
                handleMouseOut={this.handleTrackTileMouseOut} 
                key={index}/>
        })
    }

    render () {
        
        return (<div className="gameboard" onMouseMove={this.handleDrag} onTouchMove={this.handleDrag} onMouseUp={this.handleDragEnd} onTouchEnd={this.handleDragEnd}>
            {this.renderTrackTiles()}
            {this.renderTiles()}
            {this.renderCamels()}
        </div>);
    }
}
export default GameBoard;