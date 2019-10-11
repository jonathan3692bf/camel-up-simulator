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
            'blueCoordinates': {'top': '160px', 'left': '940px'},
            'greenCoordinates': {'top': '270px', 'left': '1180px'},
            'yellowCoordinates': {'top': '360px', 'left': '1120px'},
            'whiteCoordinates': {'top': '240px', 'left': '1050px'},
            'orangeCoordinates': {'top': '280px', 'left': '940px'},
        }

        DESERT_TILES.forEach(tile => {
            state[`${tile}Coordinates`] = tile.includes(DESERT_TILE_TYPES[0]) ? {'top': '620px', 'left': '1000px'} : {'top': '530px', 'left': '1130px'}
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
        const state = { 'beingDragged': draggedItem, mouseCoordinates: {} };
        
        document.body.className = 'no-touch-scroll'
        if (e.changedTouches && e.changedTouches.length) {
            e = e.changedTouches[e.changedTouches.length - 1]
        }
        state.mouseCoordinates.top = e.pageY
        state.mouseCoordinates.left = e.pageX
        state[`${draggedItem}LastCoordinates`] = this.state[`${draggedItem}Coordinates`]
        
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
        const previousMouseCoordinates = this.state.mouseCoordinates
        const previousItemCoordinates = Object.assign({}, this.state[`${draggedItem}Coordinates`])
        
        if (typeof previousItemCoordinates.top === 'string') {
            previousItemCoordinates.top = Number(previousItemCoordinates.top.slice(0, -2))
        }
        
        if (typeof previousItemCoordinates.left === 'string') {
            previousItemCoordinates.left = Number(previousItemCoordinates.left.slice(0, -2))
        }

        const currentMouseCoordinates = { top: e.pageY, left: e.pageX }
        
        const delta = {}
        delta.top = currentMouseCoordinates.top - previousMouseCoordinates.top
        delta.left = currentMouseCoordinates.left - previousMouseCoordinates.left
        
        const state = { 'mouseCoordinates': currentMouseCoordinates }
        state[`${draggedItem}Coordinates`] = {
            'top': previousItemCoordinates.top + delta.top + 'px',
            'left': previousItemCoordinates.left + delta.left + 'px'
        }

        if (this.state.trackSegmentBeingCovered) {
            state[`${this.state.beingDragged}TrackSegment`] = this.state.trackSegmentBeingCovered
        }
        if (TOUCHSCREEN) {
            const closestTrackSegment = this.findClosestTrackSegment(state[`${draggedItem}Coordinates`])
            if (closestTrackSegment) {
                state.trackSegmentBeingCovered = closestTrackSegment
            }
        }
        

        this.setState(state)
    }

    removePX (coordinates) {
        coordinates = Object.assign({}, coordinates)
        const top = Number(coordinates.top.slice(0, -2))
        const left = Number(coordinates.left.slice(0, -2))
        return { top, left }
    }

    findClosestTrackSegment (coordinates) {
        coordinates = this.removePX(coordinates)
        coordinates.top += 100
        coordinates.left += 55
        
        for (let i = 0; i < TRACK_SEGMENT_COORDINATES.length; i++) {
            const trackSegmentCoordinates = this.removePX(TRACK_SEGMENT_COORDINATES[i])
            const trackSegmentTop = trackSegmentCoordinates.top
            const trackSegmentBottom = trackSegmentTop + 95
            const trackSegmentLeft = trackSegmentCoordinates.left
            const trackSegmentRight = trackSegmentLeft + 202

            if (coordinates.top < trackSegmentBottom && coordinates.top >= trackSegmentTop) {
                if (coordinates.left >= trackSegmentLeft && coordinates.left < trackSegmentRight) {
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
            state[`${draggedItem}Coordinates`] = Object.assign({}, TRACK_SEGMENT_COORDINATES[this.state.trackSegmentBeingCovered - 1 ])
            
            const coordinates = state[`${draggedItem}Coordinates`]
            // adjust for camel and tile size differnce
            const top = typeof coordinates.top === 'number' ? coordinates.top : Number(coordinates.top.slice(0, -2))
            const left = typeof coordinates.left === 'number' ? coordinates.left : Number(coordinates.left.slice(0, -2))
            if (DESERT_TILES.indexOf(draggedItem) > -1) {
                coordinates.top = top - 50 + 'px'
                coordinates.left = left - 20 + 'px'
            } else {
                coordinates.top = top - 60 + 'px'
            }
            
        } else {
            state[`${draggedItem}Coordinates`] = this.state[`${draggedItem}LastCoordinates`]
        }
        
        this.setState(state)
    }

    handleTrackSegmentMouseEnter (trackSegmentNumber, e) {
        e.preventDefault()
        if (!this.state.beingDragged) return 
        console.log(trackSegmentNumber)
        this.setState({ 'trackSegmentBeingCovered': trackSegmentNumber })
    }

    handleTrackSegmentMouseOut (e) {
        // console.log( e)
        e.preventDefault()
        this.setState({ 'trackSegmentBeingCovered': false })
    }

    renderCamels () {
        return CAMELS.map((camelColor) => {
            return <Camel 
                color={camelColor} 
                side={TRACK_SEGMENT_TO_ICON_SIDE_MAP[this.state[`${camelColor}TrackSegment`]] - 1} 
                beingDragged={this.state.beingDragged == camelColor} 
                handleMouseDown={this.handleDragStart.bind(this, camelColor)} 
                coordinates={this.state[`${camelColor}Coordinates`]} 
                rank={3} 
                key={camelColor}/>
        })
    }

    renderDesertTiles () {
        return DESERT_TILES.map((tileName) => {
            
            return <DesertTile 
                type={tileName.replace(/\d+/, '')} 
                name={tileName} 
                beingDragged={this.state.beingDragged === tileName} 
                handleMouseDown={this.handleDragStart.bind(this, tileName)} 
                coordinates={this.state[`${tileName}Coordinates`]} 
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