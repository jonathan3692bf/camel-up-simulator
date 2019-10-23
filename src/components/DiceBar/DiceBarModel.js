import { observable } from "mobx";

export default class DiceBarModel {
    colors = [ 'blue', 'green', 'orange', 'white', 'yellow']

    @observable dieRolled = this.colors.reduce((accu, color) => {
        accu[color] = false
        return accu
    }, {})
    
    onDiceClick = (color) => {
        this.dieRolled[color] = !this.dieRolled[color]
    }
}