import { fromJS, Map as ImmutableMap, List as ImmutableList } from 'immutable'
import defineActionFragment from './define-action-fragment'

export default defineActionFragment({
  type: 'entity',
  initialState: new ImmutableMap(),

  makeFragment: (name, elements, page = 0, group = 'default') =>
    ({ type: 'entity', name, elements, page, group }),

  reducer: (state, action, { name, elements, page, group }) => {
    const newElements = elements
    const groupIndex = page
    let nextState = state
    if (newElements instanceof Array) {
      let groupContent = nextState.getIn([name, 'groups', group], new ImmutableList())
      groupContent = groupContent.set(groupIndex, fromJS(newElements.map((element) => element.id)))
      let elements = nextState.getIn([name, 'elements'], new ImmutableList())
      newElements.forEach((element) => {
        let immutableElement = fromJS(JSON.parse(JSON.stringify(element)))
        const elementIndex = elements.findIndex(
          (potentialElement) => potentialElement.get('id') === immutableElement.get('id')
        )
        if (elementIndex > -1) {
          const existingElement = elements.get(elementIndex)
          immutableElement = existingElement.merge(immutableElement)
          elements = elements.set(elementIndex, immutableElement)
        } else {
          elements = elements.push(immutableElement)
        }
      })
      nextState = nextState
        .setIn([name, 'groups', group], groupContent)
        .setIn([name, 'elements'], elements)
    } else {
      let groupContent = nextState.getIn([name, 'groups', group], new ImmutableList())
      groupContent = groupContent.set(groupIndex, new ImmutableList())
      nextState = nextState.setIn([name, 'groups', group], groupContent)
    }
    return nextState
  },

  selector: (state, name, page = 0, group = 'default') => {
    const ids =
      state.getIn([name, 'groups', group, page], new ImmutableList()) ||
      new ImmutableList()
    const elements = state.getIn([name, 'elements'], new ImmutableList())
    return elements.filter((element) => ids.contains(element.get('id')))
  }
})
