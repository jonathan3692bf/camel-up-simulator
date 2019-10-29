import React from 'react'
import { observer } from "mobx-react"
import GameBoard from './components/game-board'
import './App.css'

function handleTouchMove (e) {
  if (document && document.body && document.body.className === 'no-touch-scroll') return e.preventDefault()
}

@observer class App extends React.PureComponent {
  componentDidMount () {
    // This needs to be here fore Safari because iOS has a passive event issue
    // link: https://stackoverflow.com/questions/49500339/cant-prevent-touchmove-from-scrolling-window-on-ios
    document.addEventListener('touchmove', handleTouchMove, {passive: false})
  }

  componentWillUnmount () {
      document.removeEventListener('touchmove', handleTouchMove)
  }
  render () {
    return <GameBoard />
  }
}

export default App
