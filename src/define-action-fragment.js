import { createSelector } from 'reselect'

export default ({ type, initialState, makeFragment, reducer, selector }) => {
  let keyPath
  let selectState

  const realReducer = (state = initialState, action) => {
    let nextState = state
    if (
      action.payload &&
      action.payload.fragments &&
      action.payload.fragments instanceof Array
    ) {
      action.payload.fragments
        .filter(fragment => fragment.type === type)
        .forEach(fragment => { nextState = reducer(nextState, action, fragment) })
    }
    return nextState
  }

  const makeSelect = (...selectorArguments) => {
    const selectorFunctions = selectorArguments.filter((arg) => typeof arg === 'function')
    return createSelector(
      [(state) => selectState(state)].concat(selectorFunctions),
      (actionFragmentState, ...selectorResults) => {
        const processedArgs = []
        selectorArguments.forEach((arg) => {
          if (typeof arg === 'function') processedArgs.push(selectorResults.shift())
          else processedArgs.push(arg)
        })
        return selector(actionFragmentState, ...processedArgs)
      }
    )
  }

  const setKeyPath = (newKeyPath) => {
    keyPath = newKeyPath instanceof Array && newKeyPath.length ? [].concat(newKeyPath) : []
    selectState = (state) => keyPath.reduce((subState, keyPathItem) =>
      (subState && typeof subState === 'object') ? subState[keyPathItem] : undefined
    , state)
  }

  setKeyPath()

  return Object.freeze({
    type,
    initialState,
    makeFragment,
    reducer: realReducer,
    makeSelect,
    setKeyPath
  })
}
