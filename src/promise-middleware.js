import { fromJS } from 'immutable'

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
      (value) => next({
        type: action.type,
        meta: Object.assign({
          promiseStatus: PROMISE_ERROR_STATUS
        }, action.meta || {}),
        payload: value
      })
    )

    return next(loadingAction)
  }

  return next(action)
}

const loadingReducer = (state = fromJS([]), action) => {
  let nextState = state
  if (action && action.meta && action.meta.promiseStatus) {
    switch (action.meta.promiseStatus) {
      case PROMISE_LOADING_STATUS:
        nextState = nextState.push(action.type)
        break
      default:
        nextState = nextState.remove(nextState.indexOf(action.type))
        break
    }
  }
  return nextState
}

const setLoadingStateKeyPath = (keyPath) => {
  if (keyPath instanceof Array && keyPath.length) {
    loadingStateKeyPath = [].concat(keyPath)
  } else {
    loadingStateKeyPath = []
  }
}

const makeSelectLoading = (actionType) => (state) => {
  let subState = state.getIn(loadingStateKeyPath)
  if (typeof subState.indexOf === 'function') {
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
