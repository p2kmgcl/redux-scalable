/* global beforeEach, describe, it, expect */

import { createStore, applyMiddleware } from 'redux'
import functionMiddleware from '../function-middleware'

describe('function-middleware', () => {
  describe('functionMiddleware()', () => {
    let store
    const dummyReducer = (state = {}, action) => action

    beforeEach(() => {
      store = createStore(
        dummyReducer,
        applyMiddleware(functionMiddleware)
      )
    })

    it('ignores non function payloads', () => {
      const noFnAction = {type: 'noFnAction', payload: 'sample'}
      store.dispatch(noFnAction)
      expect(store.getState()).toEqual(noFnAction)
    })

    it('executes payload functions', () => {
      const fnAction = {type: 'fnAction', payload: () => 'hi!'}
      store.dispatch(fnAction)
      expect(store.getState()).toEqual({type: 'fnAction', payload: 'hi!'})
    })

    it('passes arguments setted as meta.actionParameters', () => {
      const fnAction = {
        type: 'fnAction',
        meta: { actionParameters: [3, 7] },
        payload: (value1, value2) => value1 + value2
      }
      store.dispatch(fnAction)
      expect(store.getState()).toEqual({
        type: 'fnAction',
        meta: { actionParameters: [3, 7] },
        payload: 10
      })
    })

    it('sends previous state to executed functions as parameter', () => {
      const noFnAction = {
        type: 'noFnAction',
        payload: 'bye!'
      }
      const fnAction = {
        type: 'fnAction',
        payload: (prevState) => prevState.payload.split('').reverse().join('')
      }
      store.dispatch(noFnAction)
      store.dispatch(fnAction)
      expect(store.getState()).toEqual({
        type: 'fnAction',
        payload: '!eyb'
      })
      store.dispatch(fnAction)
      expect(store.getState()).toEqual({
        type: 'fnAction',
        payload: 'bye!'
      })
    })

    it('combines action parameters with previous state', () => {
      const setBase = { type: 'setBase', payload: 2 }
      const calculatePow = {
        type: 'calculatePow',
        meta: { actionParameters: [3] },
        payload: (pow, prevState) => Math.pow(prevState.payload, pow)
      }
      store.dispatch(setBase)
      expect(store.getState()).toEqual({ type: 'setBase', payload: 2 })
      store.dispatch(calculatePow)
      expect(store.getState()).toEqual({
        type: 'calculatePow',
        meta: { actionParameters: [3] },
        payload: 8
      })
    })
  })
})
