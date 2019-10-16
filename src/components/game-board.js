import React from 'react';
import Camel from './camel'
import DesertTile from './desert-tile'
import TrackSegment from './track-segment'
import DiceBar from './dice-bar'

const CAMELS = ['blue', 'yellow', 'orange', 'green', 'white'];
const DESERT_TILE_TYPES = ['oasis', 'mirage']
const DESERT_TILES = DESERT_TILE_TYPES.map(tile => {
    const enumeratedTiles = []
    for (let i = 1; i < 6; i++) {
        enumeratedTiles[i - 1] = `${tile}${i}`
    }
    return enumeratedTiles
}).reduce((prev, current) => prev.concat(current))
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

class GameBoard extends React.PureComponent {
    constructor (props) {
        super(props);
        const state = { 
            'beingDragged': false,
            'draggedItems': [],
            'blueCoordinates': {'top': '160px', 'left': '940px'},
            'greenCoordinates': {'top': '270px', 'left': '1180px'},
            'yellowCoordinates': {'top': '360px', 'left': '1120px'},
            'whiteCoordinates': {'top': '240px', 'left': '1050px'},
            'orangeCoordinates': {'top': '280px', 'left': '940px'},
            'trackSegmentOccupants': Array(TRACK_SEGMENT_COORDINATES.length).fill([])
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

        this.handleDiceClick = this.handleDiceClick.bind(this)
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
        if (typeof e !== 'object') return
        
        // e.stopPropagation()
        e.preventDefault()
        let draggedItems = [ draggedItem ]
        const startTrackSegement = this.state[`${draggedItem}TrackSegment`] - 1
        if (startTrackSegement) {
            const trackSegmentOccupants = this.state.trackSegmentOccupants[startTrackSegement]
            if (trackSegmentOccupants.length) {
                const positionOfStack = trackSegmentOccupants.indexOf(draggedItems[0])
                draggedItems = trackSegmentOccupants.slice(positionOfStack)
            }
        }
        
        const state = { draggedItems, mouseCoordinates: {} };
        
        document.body.className = 'no-touch-scroll'
        if (e.changedTouches && e.changedTouches.length) {
            e = e.changedTouches[e.changedTouches.length - 1]
        }
        state.mouseCoordinates.top = e.pageY
        state.mouseCoordinates.left = e.pageX
        draggedItems.forEach(item => {
            state[`${item}LastCoordinates`] = this.state[`${item}Coordinates`]
            state[`${item}SourceTrackSegment`] = startTrackSegement
        })
        
        this.setState(state)
    }

    handleDrag (e) {
        if (this.state.draggedItems.length === 0) return
        
        // e.stopPropagation()
        e.preventDefault()
        let TOUCHSCREEN = false
        if (e.changedTouches && e.changedTouches.length) {
            e = e.changedTouches[e.changedTouches.length - 1]
            TOUCHSCREEN = true
        }
        
        const draggedItems = this.state.draggedItems
        const previousMouseCoordinates = this.state.mouseCoordinates
        const currentMouseCoordinates = { top: e.pageY, left: e.pageX }
        
        const delta = {}
        delta.top = currentMouseCoordinates.top - previousMouseCoordinates.top
        delta.left = currentMouseCoordinates.left - previousMouseCoordinates.left
        
        const state = { 'beingDragged': true, 'mouseCoordinates': currentMouseCoordinates }
        draggedItems.forEach((draggedItem, index) => {
            const previousItemCoordinates = this.removePX(this.state[`${draggedItem}Coordinates`])
            state[`${draggedItem}Coordinates`] = {
                'top': previousItemCoordinates.top + delta.top + 'px',
                'left': previousItemCoordinates.left + delta.left + 'px'
            }

            if (this.state.trackSegmentBeingCovered) {
                state[`${draggedItem}TrackSegment`] = this.state.trackSegmentBeingCovered
            }

            if (TOUCHSCREEN && index === 0) {
                const closestTrackSegment = this.findClosestTrackSegment(state[`${draggedItem}Coordinates`])
                if (closestTrackSegment) {
                    state.trackSegmentBeingCovered = closestTrackSegment
                }
            }
        })
        
        this.setState(state)
    }

    removePX (coordinates) {
        const coords = Object.assign({}, coordinates)
        const top = Number(coords.top.slice(0, -2))
        const left = Number(coords.left.slice(0, -2))
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
        const beingDragged = this.state.beingDragged
        const draggedItems = this.state.draggedItems
        if (!beingDragged || draggedItems.length === 0) {
            // This is the case where a user clicks on something but doesn't move the mouse
            return this.setState({ 
                'beingDragged': false, 
                'draggedItems': [],
                'trackSegmentBeingCovered': false
            })
        }
        // e.stopPropagation()
        e.preventDefault()
        document.body.className = ''

        const state = { 
            'beingDragged': false, 
            'draggedItems': [],
            'trackSegmentBeingCovered': false,
            'trackSegmentOccupants': this.state.trackSegmentOccupants.slice()
        }
        let targetTrackSegment = this.state.trackSegmentBeingCovered
        if (targetTrackSegment) {
            targetTrackSegment--
            const currentTrackSegmentOccupants = this.state.trackSegmentOccupants[targetTrackSegment]
            if (currentTrackSegmentOccupants.length) {
                state.trackSegmentOccupants[targetTrackSegment] = state.trackSegmentOccupants[targetTrackSegment].concat(draggedItems)
            } else {
                state.trackSegmentOccupants[targetTrackSegment] = draggedItems
            }
        }
        
        draggedItems.forEach(draggedItem => {
            if (targetTrackSegment) {
                state[`${draggedItem}Coordinates`] = this.removePX(TRACK_SEGMENT_COORDINATES[targetTrackSegment])
                
                const coordinates = state[`${draggedItem}Coordinates`]
                // adjust for camel and tile size differnce
                if (DESERT_TILES.indexOf(draggedItem) > -1) {
                    coordinates.top = coordinates.top - 50 + 'px'
                    coordinates.left = coordinates.left - 20 + 'px'
                } else {
                    coordinates.top = coordinates.top - 60 + 'px'
                    coordinates.left += 'px'
                }

                const sourceTrackSegment = this.state[`${draggedItem}SourceTrackSegment`]
                if (sourceTrackSegment) {
                    state.trackSegmentOccupants[sourceTrackSegment] = state.trackSegmentOccupants[sourceTrackSegment].filter(item => item !== draggedItem)
                }
            } else {
                state[`${draggedItem}Coordinates`] = this.state[`${draggedItem}LastCoordinates`]
            }
        })
        if (targetTrackSegment && state.trackSegmentOccupants[targetTrackSegment].length > 1) {
            state.trackSegmentOccupants[targetTrackSegment].forEach((item, index) => {
                let coordinates
                if (state[`${item}Coordinates`]) {
                    coordinates = this.removePX(state[`${item}Coordinates`])
                    coordinates.top = coordinates.top - 60*(index) + 'px'
                    coordinates.left += 'px'
                } else if (this.state[`${item}Coordinates`]) {
                    coordinates = Object.assign({}, this.state[`${item}Coordinates`])
                }
                
                state[`${item}Coordinates`] = coordinates
            })
        }
        
        this.setState(state)
    }

    handleTrackSegmentMouseEnter (trackSegmentNumber, e) {
        e.preventDefault()
        if (!this.state.beingDragged) return 
        this.setState({ 'trackSegmentBeingCovered': trackSegmentNumber })
    }

    handleTrackSegmentMouseOut (e) {
        // console.log( e)
        e.preventDefault()
        if (!this.state.beingDragged) return 
        this.setState({ 'trackSegmentBeingCovered': false })
    }

    calculateRank () {
        const rank = []
        this.state.trackSegmentOccupants.forEach(trackSegment => {
            if (!trackSegment.length) return
            if (DESERT_TILES.indexOf(trackSegment[0]) > -1) return
            trackSegment.forEach(occupant => rank.unshift(occupant))
        })
        if (!rank.length) {
            return CAMELS
        } else if (rank.length < 5) {
            return rank.concat(CAMELS.filter(camel => {
                return rank.indexOf(camel) < 0
            }))
        }
        
        return rank
    }

    renderCamels () {
        const rankList = this.calculateRank()
        return rankList.map((color, index) => {
            const rank = index + 1
            const trackSegment = this.state[`${color}TrackSegment`] ? this.state[`${color}TrackSegment`] : 0
            const side = trackSegment > 0 ? TRACK_SEGMENT_TO_ICON_SIDE_MAP[trackSegment] - 1 : 0
            const positionInStack = trackSegment > 0 ? this.state.trackSegmentOccupants[trackSegment - 1].indexOf(color) : 0
            console.log(color, rank, trackSegment, side, positionInStack)
            return <Camel
                color={color}
                side={side}
                beingDragged={this.state.draggedItems.indexOf(color) > -1 } 
                handleMouseDown={this.handleDragStart.bind(this, color)} 
                coordinates={this.state[`${color}Coordinates`]} 
                rank={rank} 
                zIndex={positionInStack}
                key={color}/> 
        })
    }

    renderDesertTiles () {
        return DESERT_TILES.map((tileName) => {
            
            return <DesertTile 
                type={tileName.replace(/\d+/, '')} 
                name={tileName} 
                beingDragged={this.state.draggedItems.indexOf(tileName) > -1} 
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

    handleDiceClick(color) {
        const state = {}
        if (this.state[`${color}DiceRolled`]) {
            state[`${color}DiceRolled`] = false
            
        } else {
            state[`${color}DiceRolled`] = true
        }
        this.setState(state)
    }

    render () {
        
        return (<div className="gameboard" onMouseMove={this.handleDrag} onTouchMove={this.handleDrag} onMouseUp={this.handleDragEnd} onTouchEnd={this.handleDragEnd}>
            <div className="gameboard-top"></div>
        
            {this.renderTrackSegments()}
            {this.renderDesertTiles()}
            {this.renderCamels()}
            <DiceBar onDiceClick={this.handleDiceClick} 
                blueDiceRolled={this.state.blueDiceRolled}
                greenDiceRolled={this.state.greenDiceRolled}
                orangeDiceRolled={this.state.orangeDiceRolled}
                whiteDiceRolled={this.state.whiteDiceRolled}
                yellowDiceRolled={this.state.yellowDiceRolled}
            />
            <div className="gameboard-bottom"></div>
        </div>);
    }
}
export default GameBoard;