/* global describe, beforeEach, it, expect */

import { createStore, applyMiddleware, combineReducers } from 'redux'
import {
  functionMiddleware,
  promiseMiddleware,
  loadingReducer,
  makeActionCreator,
  inject,
  entity
} from '../index'

describe('Real world usage sample', () => {
  let makeTweet
  let store
  let addRandomTweet
  let setView
  let selectTweets
  let getTweets

  const delayUnit = 25
  const wait = (callback, done) => setTimeout(() => {
    try {
      callback()
      done()
    } catch (error) {
      done.fail(error)
    }
  }, delayUnit * 2)

  beforeEach(() => {
    makeTweet = () => ({
      id: parseInt(Math.random().toString().substr(2, 5), 10),
      text: Math.random().toString()
    })

    inject.setKeyPath(['inject'])
    entity.setKeyPath(['entity'])

    store = createStore(
      combineReducers({
        loading: loadingReducer,
        inject: inject.reducer,
        entity: entity.reducer
      }),
      applyMiddleware(
        functionMiddleware,
        promiseMiddleware
      )
    )

    addRandomTweet = makeActionCreator('addRandomTweet', {},
      (tweet, page = 0, group = 'timeline') => new Promise((resolve) => {
        setTimeout(() => {
          resolve({fragments: [entity.makeFragment('Tweet', [tweet], page, group)]})
        }, delayUnit)
      })
    )

    setView = makeActionCreator('setPage', {}, (page = 0, group = 'timeline') => ({
      fragments: [
        inject.makeFragment(['page'], page),
        inject.makeFragment(['group'], group)
      ]
    }))

    selectTweets = entity.makeSelect(
      'Tweet',
      inject.makeSelect(['page'], 0),
      inject.makeSelect(['group'], 'timeline')
    )

    getTweets = () => selectTweets(store.getState())
  })

  it('has no tweets at the beginning', () => {
    expect(getTweets()).toEqual([])
  })

  it('stores a group of tweets on the timeline', (done) => {
    const tweet = makeTweet()
    store.dispatch(setView(0, 'timeline'))
    store.dispatch(addRandomTweet(tweet, 0, 'timeline'))
    expect(store.getState()).toEqual({
      loading: ['addRandomTweet'],
      inject: { page: 0, group: 'timeline' },
      entity: {}
    })
    wait(() => expect(store.getState()).toEqual({
      loading: [],
      inject: { page: 0, group: 'timeline' },
      entity: {
        Tweet: {
          groups: { timeline: [[tweet.id]] },
          elements: [tweet]
        }
      }
    }), done)
  })

  it('can get tweets from "favourite" group', (done) => {
    const simpleTweet = makeTweet()
    const favouriteTweet = makeTweet()
    store.dispatch(addRandomTweet(simpleTweet, 0, 'timeline'))
    store.dispatch(addRandomTweet(favouriteTweet, 1, 'favourite'))
    expect(store.getState()).toEqual({
      loading: ['addRandomTweet', 'addRandomTweet'],
      inject: {},
      entity: {}
    })
    wait(() => {
      expect(store.getState()).toEqual({
        loading: [],
        inject: {},
        entity: {
          Tweet: {
            groups: {
              timeline: [[simpleTweet.id]],
              favourite: [undefined, [favouriteTweet.id]]
            },
            elements: [simpleTweet, favouriteTweet]
          }
        }
      })

      store.dispatch(setView(1, 'favourite'))
      expect(getTweets(store.getState())).toEqual([favouriteTweet])
      store.dispatch(setView(1, 'timeline'))
      expect(getTweets(store.getState())).toEqual([])
      store.dispatch(setView(0, 'timeline'))
      expect(getTweets(store.getState())).toEqual([simpleTweet])
    }, done)
  })
})
