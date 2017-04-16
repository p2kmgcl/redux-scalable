export default (store) => (next) => (action) => {
  if (action && typeof action.payload === 'function') {
    let actionParameters = []
    if (action.meta && action.meta.actionParameters instanceof Array) {
      actionParameters = action.meta.actionParameters
    }
    const parsedAction = Object.assign({}, action, {
      payload: action.payload(...actionParameters, store.getState())
    })
    return next(parsedAction)
  }
  return next(action)
}
