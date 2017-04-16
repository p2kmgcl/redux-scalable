/* global describe, it, expect, beforeEach */

import { combineReducers } from 'redux-immutable'
import { createStore } from 'redux'
import inject from '../inject-action-fragment'

describe('inject-action-fragment', () => {
  let store

  beforeEach(() => {
    store = createStore(inject.reducer)
  })

  it('inject.type', () => {
    expect(inject.type).toEqual('inject')
  })

  it('inject.initialState', () => {
    expect(inject.initialState.toJS()).toEqual({})
  })

  it('sets values to the given keyPath', () => {
    const actionA = {
      type: 'actionA',
      payload: {fragments: [inject.makeFragment(['value'], 10)]}
    }
    const actionB = {
      type: 'actionB',
      payload: {fragments: [inject.makeFragment(['deep', 'value'], 13)]}
    }
    const selectValue = inject.makeSelect(['value'])
    const selectDeepValue = inject.makeSelect(['deep', 'value'])
    store.dispatch(actionA)
    store.dispatch(actionB)
    const state = store.getState()
    expect(selectValue(state)).toEqual(10)
    expect(selectDeepValue(state)).toEqual(13)
  })

  it('allows modifying the base keyPath', () => {
    store = createStore(combineReducers({ custom: inject.reducer }))
    inject.setKeyPath(['custom'])
    const action = {
      type: 'action',
      payload: {
        fragments: [inject.makeFragment(['value'], 3)]
      }
    }
    store.dispatch(action)
    expect(store.getState().toJS()).toEqual({ custom: { value: 3 } })
  })

  it('gets the given default value', () => {
    const selectDefault = inject.makeSelect(['unexisting', 'path'], 'default')
    expect(selectDefault(store.getState())).toEqual('default')
  })
})
