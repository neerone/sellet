export function reachGoals(goalName) {
    if (!window.Object.keys) return
    var metrika = null
    getKeys(window).map(windowProperty => {
        if (windowProperty && windowProperty.indexOf('yaCounter') !== -1) {metrika = window[windowProperty]}
    })
    if (!metrika) return
    metrika.reachGoal(goalName)
}


export function getKeys(obj) {
    if (!window.Object || !window.Object.keys) return []
    return window.Object.keys(obj)
}
