import { observable, action } from 'mobx'

export default class CamelStore {
  TRACK_SEGMENT_TO_ICON_SIDE_MAP = [ 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 1, 1 ]

  @observable coordinates = {
    'blue': { 'current': [160, 940], 'previous': [160, 940] },
    'green': { 'current': [270, 1180], 'previous': [270, 1180] },
    'orange': { 'current': [280, 940], 'previous': [280, 940] },
    'white': { 'current': [240, 1050], 'previous': [240, 1050] },
    'yellow': { 'current': [360, 1120], 'previous': [360, 1120] }
  }

  @observable rank = [ 'blue', 'green', 'orange', 'white', 'yellow' ]

  get raceRank() {
    return this.rank.slice()
  }

  set raceRank(newRank) {
    this.rank = newRank
    return newRank
  }

  @observable trackSegmentLocation = {
    'blue': { 'current': undefined, 'previous': undefined},
    'green': { 'current': undefined, 'previous': undefined},
    'orange': { 'current': undefined, 'previous': undefined},
    'white': { 'current': undefined, 'previous': undefined},
    'yellow': { 'current': undefined, 'previous': undefined}
  }

  getCamelCoordinates(camel, state) {
    return this.coordinates[camel][state].slice()
  }

  getCamelTrackSegmentLocation(camel, state) {
    return this.trackSegmentLocation[camel][state]
  }

  @action updateCamelCoordinates = (camel, state, [top, left], delta) => {
    if (delta) {
      this.coordinates[camel][state][0] += top
      this.coordinates[camel][state][1] += left
    } else {
      this.coordinates[camel][state][0] = top
      this.coordinates[camel][state][1] = left
    }
  }

  @action updateCamelTrackSegmentLocation = (camel, state, trackSegementLocation) => {
    this.trackSegmentLocation[camel][state] = trackSegementLocation
  }
}