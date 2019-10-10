import React, { useState } from 'react';
import Camel from './camel'
import Tile from './tile'
import oasisTile from '../images/Button-Oasis.png'
import desertTile from '../images/Button-Mirage.png'
import blueCamel1 from '../images/Camel-Blue-1-0.png'
import blueCamel2 from '../images/Camel-Blue-2-0.png'
import blueCamel3 from '../images/Camel-Blue-3-0.png'
import blueCamel4 from '../images/Camel-Blue-4-0.png'

import greenCamel1 from '../images/Camel-Green-1-0.png'
import greenCamel2 from '../images/Camel-Green-2-0.png'
import greenCamel3 from '../images/Camel-Green-3-0.png'
import greenCamel4 from '../images/Camel-Green-4-0.png'
import orangeCamel1 from '../images/Camel-Orange-1-0.png'
import orangeCamel2 from '../images/Camel-Orange-2-0.png'
import orangeCamel3 from '../images/Camel-Orange-3-0.png'
import orangeCamel4 from '../images/Camel-Orange-4-0.png'
import whiteCamel1 from '../images/Camel-White-1-0.png'
import whiteCamel2 from '../images/Camel-White-2-0.png'
import whiteCamel3 from '../images/Camel-White-3-0.png'
import whiteCamel4 from '../images/Camel-White-4-0.png'
import yellowCamel1 from '../images/Camel-Yellow-1-0.png'
import yellowCamel2 from '../images/Camel-Yellow-2-0.png'
import yellowCamel3 from '../images/Camel-Yellow-3-0.png'
import yellowCamel4 from '../images/Camel-Yellow-4-0.png'

const blueCamelPieceView = [ blueCamel1, blueCamel2, blueCamel3, blueCamel4 ]
const greenCamelPieceView = [ greenCamel1, greenCamel2, greenCamel3, greenCamel4 ]
const yellowCamelPieceView = [ yellowCamel1, yellowCamel2, yellowCamel3, yellowCamel4 ]
const whiteCamelPieceView = [ whiteCamel1, whiteCamel2, whiteCamel3, whiteCamel4 ]
const orangeCamelPieceView = [ orangeCamel1, orangeCamel2, orangeCamel3, orangeCamel4 ]

const icons = {
    'blue': blueCamelPieceView, 
    'green': greenCamelPieceView, 
    'yellow': yellowCamelPieceView, 
    'white': whiteCamelPieceView, 
    'orange': orangeCamelPieceView
}

const CAMELS = ['blue', 'yellow', 'orange', 'green', 'white'];
const TILES = ['oasis', 'desert'].map((tile, index, array) => {
    const enumeratedTiles = []
    for (let i = 1; i < 6; i++) {
        enumeratedTiles[i - 1] = `${tile}${i}`
    }
    return enumeratedTiles
}).reduce((prev, current) => prev.concat(current))
const DRAGGABLES = CAMELS.concat(TILES)//['blue', 'orange', 'green', 'yellow', 'white', 'desert', 'oasis']
const tileLocationToIconSideMap = {
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
    10: 4,
    11: 4,
    12: 4,
    13: 4,
}
const tileLocations = {
    1: {
        top: '320px',
        left: '840px'
    },
    2: {
        top: '370px',
        left: '940px'
    },
    3: {
        top: '410px',
        left: '1000px'
    },
    4: {
        top: '460px',
        left: '900px'
    },
    5: {
        top: '510px',
        left: '800px'
    },
    6: {
        top: '560px',
        left: '700px'
    },
    7: {
        top: '600px',
        left: '620px'
    },
    8: {
        top: '550px',
        left: '520px'
    },
    9: {
        top: '500px',
        left: '420px'
    },
    10: {
        top: '450px',
        left: '320px'
    },
    11: {
        top: '410px',
        left: '230px'
    },
    12: {
        top: '360px',
        left: '330px'
    },
    13: {
        top: '310px',
        left: '430px'
    },
    14: {
        top: '260px',
        left: '530px'
    },
    15: {
        top: '210px',
        left: '630px'
    },
    16: {
        top: '260px',
        left: '730px'
    }
}

function calcTie () {

    // top + (rank - 1)*60px
}

class GameBoard extends React.Component {
    constructor (props) {
        super(props);
        this.state = { 
            'beingDragged': false,
            'bluePosition': {'top': '160px', 'left': '940px'},
            'greenPosition': {'top': '270px', 'left': '1180px'},
            'yellowPosition': {'top': '360px', 'left': '1120px'},
            'whitePosition': {'top': '240px', 'left': '1050px'},
            'orangePosition': {'top': '280px', 'left': '940px'},
        }

        TILES.forEach(tile => {
            this.state[`${tile}Position`] = tile.includes('oasis') ? {'top': '620px', 'left': '1000px'} : {'top': '560px', 'left': '1090px'}
        })

        /*
        'desertPosition': {'top': '560px', 'left': '1090px'},
        'oasisPosition':  {'top': '620px', 'left': '1000px'},
        'bluePosition': tileLocations[1],
        */
        
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
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
        
        e.stopPropagation()
        e.preventDefault()
        const state = { 'beingDragged': draggedItem, mousePosition: {} };
        
        document.body.className = 'no-touch-scroll'
        if (e.changedTouches && e.changedTouches.length) {
            e = e.changedTouches[e.changedTouches.length - 1]
        }
        state.mousePosition.top = e.pageY
        state.mousePosition.left = e.pageX
        state[`${draggedItem}LastPosition`] = this.state[`${draggedItem}Position`]
        
        this.setState(state)
    }

    handleDrag (e) {
        if (!this.state.beingDragged) return
        e.stopPropagation()
        e.preventDefault()
        if (e.changedTouches && e.changedTouches.length) {
            e = e.changedTouches[e.changedTouches.length - 1]
        }
        
        const draggedItem = this.state.beingDragged
        const previousMousePosition = this.state.mousePosition
        const previousItemPosition = this.state[`${draggedItem}Position`]
        
        previousItemPosition.top = Number(previousItemPosition.top.slice(0, -2))
        previousItemPosition.left = Number(previousItemPosition.left.slice(0, -2))

        const currentMousePosition = { top: e.pageY, left: e.pageX }
        
        const delta = {}
        delta.top = currentMousePosition.top - previousMousePosition.top
        delta.left = currentMousePosition.left - previousMousePosition.left
        
        const state = { 'mousePosition': currentMousePosition }
        state[`${draggedItem}Position`] = {
            'top': previousItemPosition.top + delta.top + 'px',
            'left': previousItemPosition.left + delta.left + 'px'
        }

        this.setState(state)
    }

    handleDragEnd (e) {
        if (!this.state.beingDragged) return
        e.stopPropagation()
        e.preventDefault()
        document.body.className = ''

        const state = { 'beingDragged': false }
        this.setState(state)
    }

    renderCamels () {
        return CAMELS.map((camelColor, index) => {
            const location = this.state[`${camelColor}Position`];
            const image = icons[`${camelColor}`]
            return <Camel color={camelColor} icon={image[0]} beingDragged={this.state.beingDragged == camelColor} handleMouseDown={this.handleDragStart.bind(this, camelColor)} tileLocation={location} rank={index} key={camelColor}/>
        })
    }

    renderTiles () {
        return TILES.map((tileName) => {
            const icon = tileName.includes('oasis') ? oasisTile : desertTile
            const location = this.state[`${tileName}Position`]
            return <Tile type={tileName} icon={icon} beingDragged={this.state.beingDragged === tileName} handleMouseDown={this.handleDragStart.bind(this, tileName)} tileLocation={location} key={tileName}/>
        })
    }

    render () {
        
        return (<div className="gameboard" onMouseMove={this.handleDrag} onTouchMove={this.handleDrag} onMouseUp={this.handleDragEnd} onTouchEnd={this.handleDragEnd}>
            {this.renderTiles()}
            {this.renderCamels()}
        </div>);
    }
}
export default GameBoard;