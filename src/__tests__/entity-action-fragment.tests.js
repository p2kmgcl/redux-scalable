/* global describe, it, beforeEach, expect */

import { createStore } from 'redux'
import entity from '../entity-action-fragment'

describe('entity-action-fragment', () => {
  let store

  beforeEach(() => {
    store = createStore(entity.reducer)
  })

  it('has a type of entityActionFragment.type', () => {
    const fragment = entity.makeFragment()
    expect(entity.type).toEqual('entity')
    expect(fragment.type).toEqual('entity')
  })

  it('allows using the entityActionFragment.makeFragment', () => {
    const posts = {
      type: 'addPosts',
      payload: {fragments: [entity.makeFragment('Post', [])]}
    }
    const tweets = {
      type: 'addTweets',
      payload: {fragments: [entity.makeFragment('Tweet', [{id: 1, text: 'hi!'}], 1, 'timeline')]}
    }
    store.dispatch(posts)
    store.dispatch(tweets)
    expect(store.getState().toJS()).toEqual({
      Post: {
        elements: [],
        groups: {
          default: [[]]
        }
      },
      Tweet: {
        elements: [{id: 1, text: 'hi!'}],
        groups: {
          timeline: [
            undefined,
            [1]
          ]
        }
      }
    })
  })

  it('allows selecting elements with entityActionFragment.select', () => {
    const tweets = {
      type: 'addTweets',
      payload: {fragments: [entity.makeFragment('Tweet', [{id: 1, text: 'hi!'}], 1, 'timeline')]}
    }
    const selectPosts = entity.makeSelect('Post')
    const selectPageOne = entity.makeSelect('Tweet', 0, 'timeline')
    const selectPageTwo = entity.makeSelect('Tweet', 1, 'timeline')
    store.dispatch(tweets)
    const state = store.getState()
    expect(selectPosts(state).toJS()).toEqual([])
    expect(selectPageOne(state).toJS()).toEqual([])
    expect(selectPageTwo(state).toJS()).toEqual([{id: 1, text: 'hi!'}])
  })

  it('merges similar elements', () => {
    const tweetsA = {
      type: 'addTweetsA',
      payload: {
        fragments: [
          entity.makeFragment('Tweet', [{id: 1, text: 'hi!', author: 'Joe'}])
        ]
      }
    }
    const tweetsB = {
      type: 'addTweetsB',
      payload: {
        fragments: [
          entity.makeFragment('Tweet', [{id: 1, img: true, author: undefined}])
        ]
      }
    }
    store.dispatch(tweetsA)
    store.dispatch(tweetsB)
    expect(store.getState().toJS()).toEqual({
      Tweet: {
        groups: {
          default: [[1]]
        },
        elements: [
          {id: 1, text: 'hi!', img: true, author: 'Joe'}
        ]
      }
    })
  })

  it('creates an empty group if necessary', () => {
    const posts = {
      type: 'addPosts',
      payload: {fragments: [entity.makeFragment('Post')]}
    }
    const selectPosts = entity.makeSelect('Post')
    store.dispatch(posts)
    expect(store.getState().toJS()).toEqual({
      Post: {
        groups: {
          default: [[]]
        }
      }
    })
    expect(selectPosts(store.getState()).toJS()).toEqual([])
  })
})
