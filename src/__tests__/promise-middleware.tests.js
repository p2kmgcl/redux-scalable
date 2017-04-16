/* global describe, beforeEach, it, expect */

import { combineReducers } from 'redux-immutable'
import { createStore, applyMiddleware } from 'redux'
import promiseMiddleware, {
  loadingReducer,
  setLoadingStateKeyPath,
  makeSelectLoading,
  PROMISE_LOADING_STATUS,
  PROMISE_SUCCESS_STATUS,
  PROMISE_ERROR_STATUS
} from '../promise-middleware'

describe('promise-middleware', () => {
  let store
  const delayUnit = 25
  const dummyReducer = (state, action) => action
  const wait = (callback, done) => setTimeout(() => {
    try {
      callback()
      done()
    } catch (error) {
      done.fail(error)
    }
  }, delayUnit * 2)
  const resolveWithValue = (value, delay = delayUnit) => new Promise((resolve) => {
    setTimeout(() => resolve(value), delay)
  })
  const rejectWithValue = (value, delay = delayUnit) => new Promise((resolve, reject) => {
    setTimeout(() => reject(value), delay)
  })

  beforeEach(() => {
    store = createStore(
      combineReducers({
        loading: loadingReducer,
        dummy: dummyReducer
      }),
      applyMiddleware(promiseMiddleware)
    )
  })

  describe('promiseMiddleware()', () => {
    it('ignores non-promise actions', () => {
      store.dispatch({type: 'nice'})
      expect(store.getState().toJS().dummy).toEqual({type: 'nice'})
    })

    it('sets payload as promise status description', (done) => {
      const action = {type: 'nice', payload: resolveWithValue('payload')}
      const loadingExpected = {type: 'nice', meta: {status: PROMISE_LOADING_STATUS}, payload: null}
      const successExpected = {
        type: 'nice',
        meta: {status: PROMISE_SUCCESS_STATUS},
        payload: 'payload'
      }
      store.dispatch(action)
      expect(store.getState().toJS().dummy).toEqual(loadingExpected)
      wait(() => expect(store.getState().toJS().dummy).toEqual(successExpected), done)
    })

    it('allows rejecting promises', (done) => {
      const action = {type: 'nice', payload: rejectWithValue('payload')}
      const loadingExpected = {type: 'nice', meta: {status: PROMISE_LOADING_STATUS}, payload: null}
      const errorExpected = {type: 'nice', meta: {status: PROMISE_ERROR_STATUS}, payload: 'payload'}
      store.dispatch(action)
      expect(store.getState().toJS().dummy).toEqual(loadingExpected)
      wait(() => expect(store.getState().toJS().dummy).toEqual(errorExpected), done)
    })
  })

  describe('loadingReducer()', () => {
    it('stores loading promise states inside store', () => {
      const okAction = {type: 'okAction', payload: resolveWithValue('payload')}
      const failAction = {type: 'failAction', payload: rejectWithValue('payload')}
      store.dispatch(okAction)
      store.dispatch(failAction)
      expect(store.getState().toJS().loading).toEqual(['okAction', 'failAction'])
    })

    it('clears finished promises', (done) => {
      const actionA = {type: 'actionA', payload: resolveWithValue('payload')}
      const actionB = {type: 'actionB', payload: rejectWithValue('payload', delayUnit * 10)}
      store.dispatch(actionA)
      store.dispatch(actionB)
      expect(store.getState().toJS().loading).toEqual(['actionA', 'actionB'])
      wait(() => expect(store.getState().toJS().loading).toEqual(['actionB']), done)
    })
  })

  describe('setLoadingStateKeyPath() & makeSelectLoading()', () => {
    it('gets the loading state of an action with a promise', (done) => {
      const action = {type: 'action', payload: resolveWithValue('payload')}
      const selector = makeSelectLoading('action')
      const unexsistingSelector = makeSelectLoading('asdfasdf')
      store.dispatch(action)
      setLoadingStateKeyPath(null)
      expect(selector(store.getState())).toBe(false)
      setLoadingStateKeyPath(['loading'])
      expect(selector(store.getState())).toBe(true)
      expect(unexsistingSelector(store.getState())).toBe(false)
      wait(() => expect(selector(store.getState())).toBe(false), done)
    })
  })
})
