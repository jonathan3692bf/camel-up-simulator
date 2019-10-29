import { observable, action, computed } from "mobx";

export default class DiceStore {
    COLORS = [ 'blue', 'green', 'orange', 'white', 'yellow']

    @observable dieRolled = this.COLORS.reduce((accu, color) => {
        accu[color] = false
        return accu
    }, {})

    @computed get dieState () {
        return Object.assign({}, this.dieRolled)
    }
    
    @action handleDiceClick = (color) => {
        this.dieRolled[color] = !this.dieRolled[color]
    }
}