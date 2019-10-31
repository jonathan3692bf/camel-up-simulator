import { observable, action } from "mobx";

export default class ScoreboardStore {
    COLORS = [ 'blue', 'green', 'orange', 'white', 'yellow']
    @observable probabilities = this.COLORS.map(color => {
        return { color, probability: 0.20 }
    })

    get raceProbabilities () {
        return this.probabilities.slice()
    }

    set raceProbabilities (newProbabilities) {
        this.probabilities = newProbabilities
        return newProbabilities
    }

    @action handleProbabilityUpdate = (response) => {
        const newProbabilities = response.probs
        this.raceProbabilities = newProbabilities.map(probability => {
            const max = Object.entries(probability).sort(([color1, probability1], [color2, probability2]) => {
                return probability1 < probability2
            }).shift()
            return { color: max[0], probability: Math.round(max[1] * 100)/100 }
        })
    }
}