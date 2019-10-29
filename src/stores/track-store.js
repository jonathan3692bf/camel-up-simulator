import { observable, action, computed } from "mobx";
const DESERT_TILE_TYPES = ['oasis', 'mirage']
const CAMELS = ['blue', 'green','orange', 'white', 'yellow']

export default class TrackStore {
    SEGMENT_COORDINATES = [
        [370, 820],
        [420, 920],
        [470, 1020],
        [520, 920],
        [570, 820],
        [620, 720],
        [670, 620],
        [620, 520],
        [570, 420],
        [520, 320],
        [470, 220],
        [420, 320],
        [370, 420],
        [320, 520],
        [270, 620],
        [320, 720]
    ]
    @observable coveredSegment = undefined

    get segmentBeingCovered() {
        return this.coveredSegment
    }

    set segmentBeingCovered(segment) {
        this.coveredSegment = segment
        return segment
    }

    @observable segmentOccupants = Array(this.SEGMENT_COORDINATES.length).fill([])

    get trackOccupants() {
        return this.segmentOccupants.slice()
    }

    set trackOccupants(track) {
        this.segmentOccupants = track
        return track
    }

    @action updateTrackOccupants = (pieces, sourceSegment, targetSegment, fromMirage) => {
        // It is possible that source or target could be undefined, that's alright
        // when the target is undefined, the source likely is, and thus this results in removing a piece from the list
        // when source is undefined, but target is, this means a pieces is just coming on to the board for the first time
        const newTrack = this.trackOccupants
        
        if (sourceSegment >= 0) {
            // we remove our pieces from their previous track segment
            const positionOfStack = newTrack[sourceSegment].indexOf(pieces[0])
            newTrack[sourceSegment].splice(positionOfStack, pieces.length)
        }

        if (targetSegment >= 0) {
            // we add all the pieces being dragged to their new segment
            if (fromMirage) {
                newTrack[targetSegment] = pieces.concat(newTrack[targetSegment])
            } else {
                newTrack[targetSegment] = newTrack[targetSegment].concat(pieces)
            }
        }
        
        // update the track and recalculate rank
        this.trackOccupants = newTrack
    }

    @action findClosestSegment = ([top, left]) => {
        // Use classic hit-box rationale to find which segment the mouse is within.
        for (let i = 0; i < this.SEGMENT_COORDINATES.length; i++) {
            const [ segmentTop, segmentLeft ] = this.SEGMENT_COORDINATES[i]
            const segmentBottom = segmentTop + 95
            const segmentRight = segmentLeft + 202
            if (top < segmentBottom && top >= segmentTop) {
                if (left >= segmentLeft && left < segmentRight) {
                    this.segmentBeingCovered = i
                    return i
                }
            }
        }
    }

    adjustTrackSegmentCoordinates (trackSegment, positionInStack, desertTile) {
        if (trackSegment >= 0 && positionInStack >= 0) {
            const coordinates = this.SEGMENT_COORDINATES[trackSegment].slice()
        
            if (desertTile) {
                coordinates[0] -= 50
                coordinates[1] -= 20
            } else {
                coordinates[0] -= 60*(positionInStack + 1)
            }
            
        
            return coordinates
        }
    }

    @computed get calculateRank() {
        const rank = []
        this.segmentOccupants.forEach(occupants => {
            if (!occupants.length) return
            if (DESERT_TILE_TYPES.indexOf(occupants[0].slice(0,-1)) > -1) return
            occupants.forEach(occupant => rank.unshift(occupant))
        })
        if (!rank.length) {
            return CAMELS
        } else if (rank.length < 5) {
            return rank.concat(CAMELS.filter(camel => rank.indexOf(camel) < 0))
        }
        
        return rank
    }
}