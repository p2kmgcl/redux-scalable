/* global describe, it, expect */

import makeActionCreator from '../make-action-creator'

describe('make-action-creator', () => {
  describe('makeActionCreator()', () => {
    it('makes an action creator', () => {
      const setStuff = makeActionCreator('set-stuff')
      expect(typeof setStuff).toBe('function')
      expect(setStuff().type).toEqual('set-stuff')
    })

    it('made action creator sets type, meta and payload attributes', () => {
      const setStuff = makeActionCreator('set-stuff', { name: '1' }, { name: '2' })
      const { type, meta, payload } = setStuff()
      expect(type).toEqual('set-stuff')
      expect(meta.name).toEqual('1')
      expect(payload.name).toEqual('2')
    })

    it('made action creator passes parameters to meta.actionParameters', () => {
      const setValue = makeActionCreator('set-value')
      expect(setValue().meta).toEqual({ actionParameters: [] })
      expect(setValue(1).meta).toEqual({ actionParameters: [1] })
      expect(setValue(2, 3).meta).toEqual({ actionParameters: [2, 3] })
    })

    it('made action creator returns action type from toString() method', () => {
      expect(makeActionCreator('dummy').toString()).toEqual('dummy')
    })
  })
})
