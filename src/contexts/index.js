import React from 'react'
import ScoreboardStore from '../stores/scoreboard-store'
import DiceStore from '../stores/dice-store'
import TrackStore from '../stores/track-store'
import CamelStore from '../stores/camel-store'
import DesertTileStore from  '../stores/desert-tile-store'
import UIStore from '../stores/ui-store'

const scoreboardStore = new ScoreboardStore()
const diceStore = new DiceStore()
const trackStore = new TrackStore()
const camelStore = new CamelStore()
const desertTileStore = new DesertTileStore()
const uiStore = new UIStore(trackStore, camelStore, desertTileStore, scoreboardStore, diceStore)

export const storesContext = React.createContext({
  scoreboardStore,
  diceStore,
  trackStore,
  camelStore,
  desertTileStore,
  uiStore
})