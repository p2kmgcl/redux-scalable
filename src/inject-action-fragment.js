import defineActionFragment from './define-action-fragment'

export default defineActionFragment({
  type: 'inject',
  initialState: {},
  makeFragment: (keyPath, value) => ({ type: 'inject', keyPath, value }),
  reducer: (state, action, { keyPath, value }) => {
    const keyPathClone = keyPath.split('.')
    const nextState = Object.assign({}, state)
    const lastKeyPathItem = keyPathClone.pop()

    let subState = nextState
    keyPathClone.map((keyPathItem) => {
      let nextSubState = subState[keyPathItem]
      if (!nextSubState || typeof nextSubState !== 'object') {
        nextSubState = {}
      }
      subState[keyPathItem] = nextSubState
      subState = nextSubState
    })

    subState[lastKeyPathItem] = value
    return nextState
  },
  selector: (state = {}, keyPath, defaultValue) =>
    keyPath.split('.').reduce((subState, keyPathItem) => (
      subState &&
      typeof subState === 'object' &&
      typeof subState[keyPathItem] !== 'undefined'
    ) ? subState[keyPathItem] : defaultValue, state)
})
