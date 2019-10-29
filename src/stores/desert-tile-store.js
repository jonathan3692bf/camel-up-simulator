import { observable, action, computed } from 'mobx'

export default class DesertTileStore {
  DESERT_TILE_TYPES = ['oasis', 'mirage']
  DESERT_TILE_DEFAULT_POSITIONS = [ [560, 1160], [650, 1030] ]
  DESERT_TILES = this.DESERT_TILE_TYPES.map(tile => {
    const enumeratedTiles = []
    for (let i = 1; i <= 5; i++) {
        enumeratedTiles.push(`${tile}${i}`)
    }
    return enumeratedTiles
  })

  @observable coordinates = this.DESERT_TILES
    .reduce((prev, current) => prev.concat(current))
    .reduce((accu, current) => {
      const [ OASIS_COORDINATES, MIRAGE_COORDINATES ] = this.DESERT_TILE_DEFAULT_POSITIONS
      accu[current] = current.slice(0,-1) === this.DESERT_TILE_TYPES[0] ? OASIS_COORDINATES : MIRAGE_COORDINATES
      return accu
    }, {})

  @observable trackSegmentLocation = this.DESERT_TILES.reduce((prev, current) => prev.concat(current)).reduce((accu, current) => {
    accu[current] = undefined
    return accu
  }, {})

  getDesertTileCoordinates = (name) => {
    return this.coordinates[name].slice()
  }

  @action updateDesertTileCoordinates = (name, coordinates) => {
    // If the user drags the tile to a place on the screen which is not a track segment, coordinates will be 'undefined'. 
    // In which case, we simply return the tile back to its default position
    if (coordinates) {
      this.coordinates[name] = coordinates
    } else {
      const [ OASIS_COORDINATES, MIRAGE_COORDINATES ] = this.DESERT_TILE_DEFAULT_POSITIONS
      this.coordinates[name] = name.slice(0,-1) === this.DESERT_TILE_TYPES[0] ? OASIS_COORDINATES : MIRAGE_COORDINATES
    }
  }

  getDesertTileTrackSegmentLocation = (name) => {
    return this.trackSegmentLocation[name]
  }

  @action updateDesertTileTrackSegmentLocation = (name, newTrackSegment) => {
    this.trackSegmentLocation[name] = newTrackSegment
    return newTrackSegment
  }

  @computed get tilesToBeRendered () {
    // Figure out which desert tiles to render based on which have been placed
    // plus and aditional set of oasis and mirage tiles. 
    const oasisPool = this.DESERT_TILES[0].slice()
    const miragePool = this.DESERT_TILES[1].slice()
    const tiles = []
    const numberOfAssignedTiles = [0, 0]
    const [ oasisRemainder, mirageRemainder ] = [oasisPool, miragePool].map((pool, index) => pool.map(tile => {
      // Map through both pools to find which desert tiles have been placed. Transform those into '' (empty strings)
      // to be filtered out. The filtered array becomes the 'remainder' by which we pull our additional set of tiles.
      if (this.getDesertTileTrackSegmentLocation(tile) !== undefined) {
        tiles.push(tile);
        numberOfAssignedTiles[index]++
        return ''
      }
      return tile
    }).filter(tile => tile !== ''))
    // Only put out an additional set of tiles if we are not at the limit (5) of playable tiles
    if (numberOfAssignedTiles[0] + numberOfAssignedTiles[1] < oasisPool.length) {
      tiles.push(oasisRemainder.shift(), mirageRemainder.shift())
    }
    return tiles
  }
}