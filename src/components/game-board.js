import React from 'react';
import Camel from './camel'
import DesertTile from './desert-tile'
import TrackSegment from './track-segment'

const CAMELS = ['blue', 'yellow', 'orange', 'green', 'white'];
const DESERT_TILE_TYPES = ['oasis', 'mirage']
const DESERT_TILES = DESERT_TILE_TYPES.map(tile => {
    const enumeratedTiles = []
    for (let i = 1; i < 6; i++) {
        enumeratedTiles[i - 1] = `${tile}${i}`
    }
    return enumeratedTiles
}).reduce((prev, current) => prev.concat(current))
const DRAGGABLES = CAMELS.concat(DESERT_TILES)
const TRACK_SEGMENT_TO_ICON_SIDE_MAP = {
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
const TRACK_SEGMENT_COORDINATES = [
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

        DESERT_TILES.forEach(tile => {
            state[`${tile}Position`] = tile.includes(DESERT_TILE_TYPES[0]) ? {'top': '620px', 'left': '1000px'} : {'top': '530px', 'left': '1130px'}
        })

        this.state = state

        this.handleDragStart = this.handleDragStart.bind(this)
        this.handleDrag = this.handleDrag.bind(this)
        this.handleDragEnd = this.handleDragEnd.bind(this)

        this.handleTrackSegmentMouseEnter = this.handleTrackSegmentMouseEnter.bind(this)
        this.handleTrackSegmentMouseOut = this.handleTrackSegmentMouseOut.bind(this)
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

        if (this.state.trackSegmentBeingCovered) {
            state[`${this.state.beingDragged}TrackSegment`] = this.state.trackSegmentBeingCovered
        }
        if (TOUCHSCREEN) {
            const closestTrackSegment = this.findClosestTrackSegment(state[`${draggedItem}Position`])
            if (closestTrackSegment) {
                state.trackSegmentBeingCovered = closestTrackSegment
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

    findClosestTrackSegment (position) {
        position = this.removePX(position)
        position.top += 100
        position.left += 55
        
        for (let i = 0; i < TRACK_SEGMENT_COORDINATES.length; i++) {
            const tileCoordinates = this.removePX(TRACK_SEGMENT_COORDINATES[i])
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

        const state = { 'beingDragged': false, 'trackSegmentBeingCovered': false }

        if (this.state.trackSegmentBeingCovered) {
            state[`${draggedItem}Position`] = Object.assign({}, TRACK_SEGMENT_COORDINATES[this.state.trackSegmentBeingCovered - 1 ])
            
            const position = state[`${draggedItem}Position`]
            // adjust for camel and tile size differnce
            const top = typeof position.top === 'number' ? position.top : Number(position.top.slice(0, -2))
            const left = typeof position.left === 'number' ? position.left : Number(position.left.slice(0, -2))
            if (DESERT_TILES.indexOf(draggedItem) > -1) {
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

    handleTrackSegmentMouseEnter (tileNumber, e) {
        e.preventDefault()
        if (!this.state.beingDragged) return 
        console.log(tileNumber)
        this.setState({ 'trackSegmentBeingCovered': tileNumber })
    }

    handleTrackSegmentMouseOut (e) {
        // console.log( e)
        e.preventDefault()
        this.setState({ 'trackSegmentBeingCovered': false })
    }

    renderCamels () {
        return CAMELS.map((camelColor) => {
            const location = this.state[`${camelColor}Position`];
            const trackSegment = this.state[`${camelColor}TrackSegment`]
            const side = TRACK_SEGMENT_TO_ICON_SIDE_MAP[trackSegment] - 1
            return <Camel color={camelColor} side={side} beingDragged={this.state.beingDragged == camelColor} handleMouseDown={this.handleDragStart.bind(this, camelColor)} tileLocation={location} rank={3} key={camelColor}/>
        })
    }

    renderDesertTiles () {
        return DESERT_TILES.map((tileName) => {
            const coordinates = this.state[`${tileName}Position`]
            return <DesertTile 
                type={tileName.replace(/\d+/, '')} 
                name={tileName} 
                beingDragged={this.state.beingDragged === tileName} 
                handleMouseDown={this.handleDragStart.bind(this, tileName)} 
                coordinates={coordinates} 
                key={tileName}/>
        })
    }

    renderTrackSegments () {
        return TRACK_SEGMENT_COORDINATES.map((coordinates, index) => {
            const tileNumber = index + 1
            return <TrackSegment 
                camelBeingDragged={this.state.beingDragged} 
                beingCovered={this.state.trackSegmentBeingCovered === tileNumber}
                coordinates={coordinates} 
                trackTileNumber={tileNumber} 
                handleMouseEnter={this.handleTrackSegmentMouseEnter.bind(this, tileNumber)}
                handleMouseOut={this.handleTrackSegmentMouseOut} 
                key={index}/>
        })
    }

    render () {
        
        return (<div className="gameboard" onMouseMove={this.handleDrag} onTouchMove={this.handleDrag} onMouseUp={this.handleDragEnd} onTouchEnd={this.handleDragEnd}>
            {this.renderTrackSegments()}
            {this.renderDesertTiles()}
            {this.renderCamels()}
        </div>);
    }
}
export default GameBoard;