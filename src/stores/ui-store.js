import { observable, action, computed } from 'mobx'

export default class UIStore {
    constructor (trackStore, camelStore, desertTileStore) {
        this.trackStore = trackStore
        this.camelStore = camelStore
        this.desertTileStore = desertTileStore
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
        const startTrackSegement = this.camelStore.getCamelTrackSegmentLocation(camel, 'current')
        
        if (startTrackSegement >= 0) {
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
        if (document && document.body) document.body.className = 'no-touch-scroll'
        
        if (this.desertTileStore.DESERT_TILES.indexOf(draggedPiece) === -1) {
            return this.handleCamelDragStart(draggedPiece)
        }
    }

    @action handleDesertTileDrag = (tile, targetTrackSegment, targetTrackSegmentOccupants) => {
        const sourceTrackSegment = this.desertTileStore.getDesertTileTrackSegmentLocation(tile)
        if (targetTrackSegment >= 0) {
            if (targetTrackSegmentOccupants.length && sourceTrackSegment !== targetTrackSegment) {
                this.validMove = false
            } else {
                const positionOffset = 0
                const adjustedCoordinates = this.trackStore.adjustTrackSegmentCoordinates(targetTrackSegment, positionOffset, true)
                this.desertTileStore.updateDesertTileCoordinates(tile, adjustedCoordinates)
            }
            
        }
    }

    @action moveCamel = (sourceTrackSegment, targetTrackSegment, toBottomOfStack, camel, index) => {
        if (targetTrackSegment >= 0) {
            const targetTrackSegmentOccupants = this.trackStore.trackOccupants[targetTrackSegment]
            let positionOffset = toBottomOfStack ? index : targetTrackSegmentOccupants.length + index
            if (sourceTrackSegment === targetTrackSegment) {
                positionOffset = targetTrackSegmentOccupants.indexOf(camel)
            }
            const adjustedCoordinates = this.trackStore.adjustTrackSegmentCoordinates(targetTrackSegment, positionOffset, false)
            this.camelStore.updateCamelCoordinates(camel, 'current', adjustedCoordinates, false)
        }
        this.camelStore.updateCamelTrackSegmentLocation(camel, 'current', targetTrackSegment)
    }

    @action handleCamelDrag = (camels, targetTrackSegment, targetTrackSegmentOccupants) => {
        const sourceTrackSegment = this.camelStore.getCamelTrackSegmentLocation(camels[0], 'previous')
        if (targetTrackSegment >= 0) {
            const numberOfSegmentOccupants = targetTrackSegmentOccupants.length
        
            if (numberOfSegmentOccupants === 1) {
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
        const desertTile = this.desertTileStore.DESERT_TILES.indexOf(draggedPieces[0]) > -1
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
            // Here the move was either invalid or to a place on the board which was not a track segment
            // return desert tile to its previous location. 
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
            // iff the dragged pieces have gone somewhere new should we update the track state
            if (this.oasisSelected || this.mirageSelected) {
                targetTrackSegment += this.oasisSelected ? 1 : -1
                this.trackStore.updateTrackOccupants(camels, sourceTrackSegment, targetTrackSegment, this.mirageSelected)
                this.trackStore.trackOccupants[targetTrackSegment].forEach(this.moveCamel.bind(this, sourceTrackSegment, targetTrackSegment, true))
            } else if (sourceTrackSegment !== targetTrackSegment) {
                this.trackStore.updateTrackOccupants(camels, sourceTrackSegment, targetTrackSegment, this.mirageSelected)
            }
            this.camelStore.raceRank = this.trackStore.calculateRank
        } else {
            camels.forEach(camel => {
                // return camels to their previous locations.
                // may not be necessary.
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
        const desertTile = this.desertTileStore.DESERT_TILES.indexOf(draggedPieces[0]) > -1
        
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