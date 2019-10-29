import { observable, action, computed } from 'mobx'

export default class DesertTileStore {
  DESERT_TILE_TYPES = ['oasis', 'mirage']
  DESERT_TILE_DEFAULT_POSITIONS = [ [560, 1160], [650, 1030] ]
  DESERT_TILES = this.DESERT_TILE_TYPES.map(tile => {
    const enumeratedTiles = []
    for (let i = 5; i > 0; i--) {
        enumeratedTiles.push(`${tile}${i}`)
    }
    return enumeratedTiles
  }).reduce((prev, current) => prev.concat(current))

  @observable coordinates = this.DESERT_TILES.reduce((accu, current) => {
    const [ OASIS_COORDINATES, MIRAGE_COORDINATES ] = this.DESERT_TILE_DEFAULT_POSITIONS
    accu[current] = current.slice(0,-1) === this.DESERT_TILE_TYPES[0] ? OASIS_COORDINATES : MIRAGE_COORDINATES
    return accu
  }, {})

  @observable trackSegmentLocation = this.DESERT_TILES.reduce((accu, current) => {
    accu[current] = undefined
    return accu
  }, {})

  getDesertTileCoordinates = (name) => {
    return this.coordinates[name].slice()
  }

  @action updateDesertTileCoordinates = (name, coordinates) => {
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

  @computed get numberOfPlacedTiles () {
    let number = 0
    // for (let tile in this.coordinates) {
    //   const currentCoordinates = this.getDesertTileCoordinates(tile)
    //   const [ OASIS_COORDINATES, MIRAGE_COORDINATES ] = this.DESERT_TILE_DEFAULT_POSITIONS
    //   const DEFAULT_COORDINATES = this.DESERT_TILE_TYPES[0] ? OASIS_COORDINATES : MIRAGE_COORDINATES
    //   if (currentCoordinates == DEFAULT_COORDINATES) number++
    // }
    for (let tile in this.trackSegmentLocation) {
      if (this.getDesertTileTrackSegmentLocation(tile) !== undefined) number++
    }
    return number
  }
}