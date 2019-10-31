import { observable, action, computed, autorun } from 'mobx'
import requestProbabilities from '../helper-functions'

export default class UIStore {
    constructor (trackStore, camelStore, desertTileStore, scoreboardStore, diceStore) {
        this.trackStore = trackStore
        this.camelStore = camelStore
        this.desertTileStore = desertTileStore
        this.scoreboardStore = scoreboardStore
        this.diceStore = diceStore

        autorun(async () => {
            // Here we have our code which takes the state of the board and transforms it into a shape that
            // can be given to our probability function.
            // 1) Don't request new probabilities until the user is done dragging things around
            if (this.draggedState) return
            const gameState = {
                'state_of_play': { 'camels': [], 'tiles': [] },
                'sig_figs': 3
            }
            const diceRolled = this.diceStore.dieState
            let gameHasNotYetBegun = false
            this.camelStore.raceRank.forEach(color => {
                // Loop through the camel store to find each camel's location and whether their dice has been "turned on"
                const location = this.camelStore.getCamelTrackSegmentLocation(color, 'current')
                if (location === undefined) gameHasNotYetBegun = true
                gameState.state_of_play.camels.push({ color, location, 'already_moved': diceRolled[color]})
            })
            // 2) Don't request new probabilities until all the camels are on the board
            if (gameHasNotYetBegun) return
            this.desertTileStore.tilesToBeRendered.forEach(tile => {
                // Loop through the desert tile store to find which tiles have been placed on the board
                const location = this.desertTileStore.getDesertTileTrackSegmentLocation(tile)
                if (location >= 0) {
                    const effect = tile.slice(0,-1) === this.desertTileStore.DESERT_TILE_TYPES[0] ? 1 : -1
                    gameState.state_of_play.tiles.push({ location, effect })
                }
            })
            this.scoreboardStore.isUpdating = true
            const newProbabilities = await requestProbabilities(gameState)
            if (newProbabilities) {
                this.scoreboardStore.handleProbabilityUpdate(newProbabilities)
            }
            this.scoreboardStore.isUpdating = false
            // 3) Debounce requests by half a second to allow for corrections (e.g. when the user selects the wrong segment)
        }, { delay: 500 })
    }

    @observable beingDragged = false
    @observable draggedItems = []
    @observable mirageSelected = false
    @observable oasisSelected = false
    @observable validMove = true

    @computed get draggedState() {
        return this.draggedItems.length > 0
    }

    get piecesBeingDragged() {
        return this.draggedItems.slice()
    }

    set piecesBeingDragged(pieces) {
        this.draggedItems = pieces
        return pieces
    }

    @action handleTrackSegmentMouseOver = (segmentNumber, e) => {
        e.preventDefault()
        if (this.draggedState && this.trackStore.segmentBeingCovered !== segmentNumber) this.trackStore.segmentBeingCovered = segmentNumber
    }
    
    @action handleTrackSegmentMouseOut = (e) => {
        e.preventDefault()
        if (this.draggedState) this.trackStore.segmentBeingCovered = undefined
    }

    @action handleCamelDragStart = (camel) => {
        // Dragging a camel may also imply dragging a stack of camel, which can only happen once
        // camels have been moved on to the board.
        const startTrackSegement = this.camelStore.getCamelTrackSegmentLocation(camel, 'current')
        
        if (startTrackSegement >= 0) {
            // Once on the board, we should check to see if the dragged camel is occupying the
            // same space as other camels.
            // If so, we should find it's position in that stack, and "grab" all the pieces above it.
            const trackSegmentOccupants = this.trackStore.trackOccupants[startTrackSegement]
            if (trackSegmentOccupants.length) {
                const positionOfStack = trackSegmentOccupants.indexOf(camel)
                this.piecesBeingDragged = trackSegmentOccupants.slice(positionOfStack)
            }
        }
        
        this.piecesBeingDragged.forEach(camel => {
            this.camelStore.updateCamelCoordinates(camel, 'previous', this.camelStore.getCamelCoordinates(camel, 'current'), false)
            this.camelStore.updateCamelTrackSegmentLocation(camel, 'previous', startTrackSegement)
        })
    }

    @action handleDragStart = (draggedPiece, e) => {
        if (typeof e !== 'object') return
        e.preventDefault()
        this.validMove = true
        this.piecesBeingDragged = [ draggedPiece ]
        // Change the document.body class to help with scroll issues on mobile
        if (document && document.body) document.body.className = 'no-touch-scroll'
        
        if (this.desertTileStore.tilesToBeRendered.indexOf(draggedPiece) === -1) {
            return this.handleCamelDragStart(draggedPiece)
        }
    }

    @action handleDesertTileDrag = (tile, targetTrackSegment, targetTrackSegmentOccupants) => {
        const sourceTrackSegment = this.desertTileStore.getDesertTileTrackSegmentLocation(tile)
        if (targetTrackSegment >= 0) {
            if (targetTrackSegmentOccupants.length && sourceTrackSegment !== targetTrackSegment) {
                // This is the easiest case to check for. Desert tiles cannot be placed where there are
                // other desert tiles or camels
                this.validMove = false
            } else {
                // This is the trickier case where we now need to follow the game rules which state that
                // desert tiles may not be placed adjacent to other desert tiles
                const adjacentOccupants = [ this.trackStore.trackOccupants[targetTrackSegment + 1], this.trackStore.trackOccupants[targetTrackSegment - 1] ]
                // Camel Up rules dictate that desert tiles may not be placed on the 1st track segment
                if (targetTrackSegment === 0) {
                    adjacentOccupants.splice(0, adjacentOccupants.length)
                    this.validMove = false
                }
                // We also need to avoid out of bounds issues by not trying to check the (last + 1) track segment
                if (targetTrackSegment === this.trackStore.trackOccupants.length - 1) {
                    adjacentOccupants.shift()
                }
                for (let i = 0; i < adjacentOccupants.length; i++) {
                    // Avoid the situation where moving an existing tile is impossible because 
                    // the tile is still on the track segment until the drag is over.
                    // To do this, we first check to see if there is anything on the adjacent tile.
                    if (adjacentOccupants[i].length) {
                        // Then we check that the occupant there is neither the desert tile currently being dragged, 
                        // nor any other legally placed desert tile
                        if (adjacentOccupants[i][0] !== tile && this.desertTileStore.tilesToBeRendered.indexOf(adjacentOccupants[i][0]) > -1)
                            this.validMove = false
                    }
                    
                }
                // At this point, the currently dragged desert tile is neither laying on an occupied track segment, nor surrounded by other desert tiles.
                const positionOffset = 0
                const adjustedCoordinates = this.trackStore.adjustTrackSegmentCoordinates(targetTrackSegment, positionOffset, true)
                this.desertTileStore.updateDesertTileCoordinates(tile, adjustedCoordinates)
            }
            
        }
    }

    @action moveCamel = (sourceTrackSegment, targetTrackSegment, toBottomOfStack, camel, index) => {
        // Here we only "move" the camel if it's target is a track segment.
        if (targetTrackSegment >= 0) {
            const targetTrackSegmentOccupants = this.trackStore.trackOccupants[targetTrackSegment]
            // Where that camel lands on the stack, however, depends on where it is coming from.
            // Camels affected by Mirages and Oases effectively rebuild the whole stack, and thus
            // must start from the bottom.
            // Conversely, camels moved via normal drag and drop, will sit on top of the stack.
            let positionOffset = toBottomOfStack ? index : targetTrackSegmentOccupants.length + index
            if (sourceTrackSegment === targetTrackSegment) {
                positionOffset = targetTrackSegmentOccupants.indexOf(camel)
            }
            const adjustedCoordinates = this.trackStore.adjustTrackSegmentCoordinates(targetTrackSegment, positionOffset, false)
            this.camelStore.updateCamelCoordinates(camel, 'current', adjustedCoordinates, false)
        }
        // targetTrackSegment === 'undefined' will send the camel back from whence it came.
        this.camelStore.updateCamelTrackSegmentLocation(camel, 'current', targetTrackSegment)
    }

    @action handleCamelDrag = (camels, targetTrackSegment, targetTrackSegmentOccupants) => {
        const sourceTrackSegment = this.camelStore.getCamelTrackSegmentLocation(camels[0], 'previous')
        if (targetTrackSegment >= 0) {
            const numberOfSegmentOccupants = targetTrackSegmentOccupants.length
            // We should check that whether a user is attempting to drop a camel atop a mirage or oasis
            if (numberOfSegmentOccupants === 1) {
                // Here we abuse desertTileStore.DESERT_TILE_TYPES to determine which type of tile
                // is being covered. This requires strict value checking (either 0, or 1).
                const occupantType = targetTrackSegmentOccupants[0].slice(0, -1)
                const desertType = this.desertTileStore.DESERT_TILE_TYPES.indexOf(occupantType)
                if (desertType === 0) {
                    this.oasisSelected = true
                } else if (desertType === 1) {
                    this.mirageSelected = true
                }
            }
        }
            
        camels.forEach(this.moveCamel.bind(this, sourceTrackSegment, targetTrackSegment, false))
    }

    @action handleDrag = (e) => {
        if (!this.draggedState) return
        e.preventDefault()
        
        if (e.changedTouches && e.changedTouches.length) {
            e = e.changedTouches[e.changedTouches.length - 1]
            this.trackStore.findClosestSegment([e.pageY, e.pageX])
        }
        
        this.validMove = true
        this.oasisSelected = false
        this.mirageSelected = false
        const draggedPieces = this.piecesBeingDragged
        const targetTrackSegment = this.trackStore.segmentBeingCovered
        const targetTrackSegmentOccupants = this.trackStore.trackOccupants[targetTrackSegment]
        const desertTile = this.desertTileStore.tilesToBeRendered.indexOf(draggedPieces[0]) > -1
        if (desertTile) {
            return this.handleDesertTileDrag(draggedPieces[0], targetTrackSegment, targetTrackSegmentOccupants)
        } else {
            return this.handleCamelDrag(draggedPieces, targetTrackSegment, targetTrackSegmentOccupants)
        }
    }

    @action handleDesertTileDragEnd = (tile, targetTrackSegment) => {
        const sourceTrackSegment = this.desertTileStore.getDesertTileTrackSegmentLocation(tile)
        
        if (targetTrackSegment >= 0 && this.validMove) {
            // iff the dragged pieces have gone somewhere new should we update the track state
            if (sourceTrackSegment !== targetTrackSegment) {
                this.trackStore.updateTrackOccupants([ tile ], sourceTrackSegment, targetTrackSegment)
                this.desertTileStore.updateDesertTileTrackSegmentLocation(tile, targetTrackSegment)   
            }
        } else {
            // Here the move was either invalid or to a place on the board which was not a track segment,
            // in either case: return desert tile to its previous location. 
            // If sourceTrackSegment === undefined, then it goes back to its default posiiton
            let reset
            if (!this.validMove) {
                reset = sourceTrackSegment
            } else if (targetTrackSegment === undefined) {
                reset = targetTrackSegment
            } else {
                reset = sourceTrackSegment
            }
            const positionOffset = 0
            const adjustedCoordinates = this.trackStore.adjustTrackSegmentCoordinates(reset, positionOffset, true)
            this.desertTileStore.updateDesertTileCoordinates(tile, adjustedCoordinates)
            this.desertTileStore.updateDesertTileTrackSegmentLocation(tile, reset)
            
            this.trackStore.updateTrackOccupants([ tile ], sourceTrackSegment, reset)
        }
        this.resetUIState()
    }

    @action handleCamelDragEnd = (camels, targetTrackSegment) => {
        const sourceTrackSegment = this.camelStore.getCamelTrackSegmentLocation(camels[0], 'previous')

        if (targetTrackSegment >= 0 && this.validMove) {
            // Check if camels are about to be dropped over a desert tile
            if (this.oasisSelected || this.mirageSelected) {
                targetTrackSegment += this.oasisSelected ? 1 : -1
                // Update the whole track, AND then move all the camels based on the track update
                this.trackStore.updateTrackOccupants(camels, sourceTrackSegment, targetTrackSegment, this.mirageSelected)
                this.trackStore.trackOccupants[targetTrackSegment].forEach(this.moveCamel.bind(this, sourceTrackSegment, targetTrackSegment, true))
            } else if (sourceTrackSegment !== targetTrackSegment) {
                this.trackStore.updateTrackOccupants(camels, sourceTrackSegment, targetTrackSegment, this.mirageSelected)
            }
            this.camelStore.raceRank = this.trackStore.calculateRank
        } else {
            // targetTrackSegement === undefined, return camels to their previous locations.
            camels.forEach(camel => {
                this.camelStore.updateCamelTrackSegmentLocation(camel, 'current', this.camelStore.getCamelTrackSegmentLocation(camel, 'previous'))
                this.camelStore.updateCamelCoordinates(camel, 'current', this.camelStore.getCamelCoordinates(camel, 'previous'), false)
            })
        }
        
        this.resetUIState()
    }

    @action handleDragEnd = (e) => {
        e.preventDefault()
        if (document && document.body) document.body.className = ''
        if (!this.draggedState) {
            // This is the case where a user clicks on something but doesn't move the mouse
            return
        }
        
        const draggedPieces = this.piecesBeingDragged
        const targetTrackSegment = this.trackStore.segmentBeingCovered
        const desertTile = this.desertTileStore.tilesToBeRendered.indexOf(draggedPieces[0]) > -1
        
        if (desertTile) {
            return this.handleDesertTileDragEnd(draggedPieces[0], targetTrackSegment)
        } else {
            return this.handleCamelDragEnd(draggedPieces, targetTrackSegment)
        }
    }

    @action resetUIState = () => {
        this.validMove = true
        this.mirageSelected = false
        this.oasisSelected = false
        this.piecesBeingDragged = []
        this.trackStore.segmentBeingCovered = undefined
    }

    makeCoordinates ([top, left]) {
        return { top: top + 'px', left: left + 'px'}
    }
}