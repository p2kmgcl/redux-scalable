/* global describe, it, beforeEach, expect */

import { createStore, combineReducers } from 'redux'
import defineActionFragment from '../define-action-fragment'

describe('define-action-fragment', () => {
  describe('defineActionFragment()', () => {
    let fragment
    let store

    beforeEach(() => {
      fragment = defineActionFragment({
        type: 'sample',
        initialState: [],
        reducer: (state, action, fragment) => state.concat([fragment.value]),
        selector: (fragmentState, index) => fragmentState[index],
        makeFragment: (value) => ({ type: 'sample', value })
      })
      fragment.setKeyPath('sample')
      store = createStore(
        combineReducers({
          sample: fragment.reducer
        })
      )
    })

    it('stores action fragment type', () => {
      expect(fragment.type).toBe('sample')
    })

    it('applies the given reducer to each fragment of type', () => {
      const action = {
        type: 'action',
        payload: {
          fragments: [
            fragment.makeFragment(1),
            fragment.makeFragment(13)
          ]
        }
      }
      store.dispatch(action)
      expect(store.getState()).toEqual({ sample: [1, 13] })
    })

    it('applies the given selector', () => {
      const action = {
        type: 'action',
        payload: {
          fragments: [
            fragment.makeFragment(1),
            fragment.makeFragment(13),
            fragment.makeFragment(21)
          ]
        }
      }
      store.dispatch(action)
      const selectFirst = fragment.makeSelect(0)
      const selectSecond = fragment.makeSelect(1)
      const selectThird = fragment.makeSelect(2)
      const state = store.getState()
      expect(selectFirst(state)).toEqual(1)
      expect(selectSecond(state)).toEqual(13)
      expect(selectThird(state)).toEqual(21)
    })

    it('applies functions as selectors', () => {
      const action = {
        type: 'action',
        payload: {
          fragments: [
            fragment.makeFragment(1),
            fragment.makeFragment(13),
            fragment.makeFragment(21)
          ]
        }
      }
      const selectSecond = fragment.makeSelect(
        fragment.makeSelect(0) // [0] = 1 --> [1] = 13
      )
      store.dispatch(action)
      expect(selectSecond(store.getState())).toEqual(13)
    })
  })
})
