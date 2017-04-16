import makeActionCreator from './make-action-creator'

import functionMiddleware from './function-middleware'

import promiseMiddleware, {
  loadingReducer,
  setLoadingStateKeyPath,
  makeSelectLoading,
  PROMISE_LOADING_STATUS,
  PROMISE_SUCCESS_STATUS,
  PROMISE_ERROR_STATUS
} from './promise-middleware'

import inject from './inject-action-fragment'
import entity from './entity-action-fragment'
import defineActionFragment from './define-action-fragment'

export {
  makeActionCreator,

  functionMiddleware,

  promiseMiddleware,
  loadingReducer,
  setLoadingStateKeyPath,
  makeSelectLoading,
  PROMISE_LOADING_STATUS,
  PROMISE_SUCCESS_STATUS,
  PROMISE_ERROR_STATUS,

  inject,
  entity,
  defineActionFragment
}
