const PROMISE_LOADING_STATUS = 'redux-scalable/promise-middleware/PROMISE_LOADING_STATUS'
const PROMISE_SUCCESS_STATUS = 'redux-scalable/promise-middleware/PROMISE_SUCCESS_STATUS'
const PROMISE_ERROR_STATUS = 'redux-scalable/promise-middleware/PROMISE_ERROR_STATUS'
let loadingStateKeyPath = null

const promiseMiddleware = (store) => (next) => (action) => {
  if (action.payload instanceof Promise) {
    const loadingAction = {
      type: action.type,
      meta: Object.assign({
        promiseStatus: PROMISE_LOADING_STATUS
      }, action.meta || {}),
      payload: null
    }

    action.payload.then(
      (value) => next({
        type: action.type,
        meta: Object.assign({
          promiseStatus: PROMISE_SUCCESS_STATUS
        }, action.meta || {}),
        payload: value
      }),
      (value) => {
        let parsedValue = value
        if (value instanceof Error) {
          parsedValue = {
            name: parsedValue.name,
            message: parsedValue.message,
            stack: parsedValue.stack
          }
        }

        next({
          type: action.type,
          meta: Object.assign({
            promiseStatus: PROMISE_ERROR_STATUS
          }, action.meta || {}),
          payload: parsedValue
        })
      }
    )

    return next(loadingAction)
  }

  return next(action)
}

const loadingReducer = (state = [], action) => {
  let nextState = state.splice(0)
  if (action && action.meta && action.meta.promiseStatus) {
    if (action.meta.promiseStatus === PROMISE_LOADING_STATUS) {
      nextState.push(action.type)
    } else {
      const index = nextState.indexOf(action.type)
      if (index > -1) nextState = nextState.splice(index + 1, 1)
    }
  }
  return nextState
}

const setLoadingStateKeyPath = (keyPath) => {
  if (typeof keyPath === 'string') {
    if (keyPath.length) {
      loadingStateKeyPath = keyPath.split('.')
    } else {
      loadingStateKeyPath = []
    }
  } else if (keyPath instanceof Array) {
    loadingStateKeyPath = keyPath.splice(0)
  } else {
    loadingStateKeyPath = []
  }
}

const makeSelectLoading = (actionType) => (state) => {
  let subState = loadingStateKeyPath.reduce((subState, keyPathItem) =>
      (subState && typeof subState === 'object') ? subState[keyPathItem] : undefined
  , state)
  if (subState && typeof subState.indexOf === 'function') {
    return subState.indexOf(actionType) !== -1
  }
  return false
}

export default promiseMiddleware
export {
  loadingReducer,
  setLoadingStateKeyPath,
  makeSelectLoading,
  PROMISE_LOADING_STATUS,
  PROMISE_SUCCESS_STATUS,
  PROMISE_ERROR_STATUS
}
