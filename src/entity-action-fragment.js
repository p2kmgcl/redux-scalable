import defineActionFragment from './define-action-fragment'

export default defineActionFragment({
  type: 'entity',
  initialState: {},

  makeFragment: (name, elements, page = 0, group = 'default') =>
    ({ type: 'entity', name, elements, page, group }),

  reducer: (state, action, { name, elements, page, group }) => {
    let nextState = Object.assign({}, state)
    nextState[name] = nextState[name] || { groups: { [group]: [] }, elements: [] }
    nextState[name].groups[group] = nextState[name].groups[group] || []
    if (elements instanceof Array && elements.length > 0) {
      const newElementsIds = []
      elements.forEach((element) => {
        let newCleanElement = JSON.parse(JSON.stringify(element))
        const existingIndex = nextState[name].elements.findIndex(
          (existingElement) => existingElement.id === newCleanElement.id
        )
        if (existingIndex > -1) {
          newCleanElement = Object.assign(
            {},
            nextState[name].elements[existingIndex],
            newCleanElement
          )
          nextState[name].elements[existingIndex] = newCleanElement
        } else {
          nextState[name].elements.push(newCleanElement)
        }
        newElementsIds.push(newCleanElement.id)
      })
      nextState[name].groups[group][page] = newElementsIds
    } else {
      nextState[name].groups[group][page] = []
    }
    return nextState
  },

  selector: (state, name, page = 0, group = 'default') => {
    if (!state[name]) return []
    const ids = state[name].groups[group][page] || []
    return state[name].elements.filter((element) => ids.indexOf(element.id) !== -1)
  }
})
