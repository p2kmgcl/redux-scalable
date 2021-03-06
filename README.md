# redux-scalable

[![Travis build status](http://img.shields.io/travis/p2kmgcl/redux-scalable/master.svg)](https://travis-ci.org/p2kmgcl/redux-scalable)
[![NPM version](http://img.shields.io/npm/v/redux-scalable.svg)](https://www.npmjs.org/package/redux-scalable)
[![Test Coverage](https://coveralls.io/repos/github/p2kmgcl/redux-scalable/badge.svg)](https://coveralls.io/r/p2kmgcl/redux-scalable)
[![Dev dependencies](https://david-dm.org/p2kmgcl/redux-scalable/dev-status.svg)](https://david-dm.org/p2kmgcl/redux-scalable?type=dev)
[![Peer dependencies](https://david-dm.org/p2kmgcl/redux-scalable/peer-status.svg)](https://david-dm.org/p2kmgcl/redux-scalable?type=peer)

A set of reducers, selectors, middlewares and action creators that allows managing a predictable,
scalable and easy to use Redux state.

> _(Kind of) Disclaimer, do not overcomplicate_
>
> This library is not an attempt of extending or modifying redux in any way. It's just a set of
> generic __functions__ that can be used for reducing that necessary amount of boilerplate needed
> for managing a __complex__ redux project, which multiple collections of elements, pagination
> and/or data fetching. This means that __if you are trying to build a redux counter, maybe this
> project goes too far__.

## Content index

- [Assumptions](#assumptions)
- [Fast setup](#fast-setup)
- [Creating actions](#creating-actions)
- [Middlewares](#middlewares):
  - [Functions as payloads](#functions-as-payloads)
  - [Promises as payloads](#promises-as-payloads)
- [Action fragments](#action-fragments):
  - [Inject action fragments](#inject-action-fragments)
- [Creating new action fragments](#creating-new-action-fragments)

> __For information about the API check [the index.d.ts file](./src/index.d.ts)__, which keeps all
> the typing and the updated docs. Note that you do not need Typescript for using the library, this
> files can be read and processed by many editors.

## Assumptions

`redux-scalable` does not add any extra dependency, but it assumes the usage of some commons
Redux-environment libraries, so they are added as peer dependencies:

- [Redux](http://redux.js.org/) (awesome, I know)
- [Reselect](https://github.com/reactjs/reselect) for cache state observation

> If you find this approach incorrect and/or know how to improve this library, feel free to open an
> issue to suggest any change.

## Usage

I strongly recommend reading the whole README __before__ starting with this library. Although this
setup just shows which middlewares, reducers, actions and selectors are available, just importing
all the files maybe confusing.

### Install redux-scalable and it's peer-dependencies

```
npm install --save \
  redux-scalable \
  redux@^3.6.0 \
  reselect@^3.0.0
```

### Inject middlewares and reducers when creating your store

```js
import { createStore, combineReducers, applyMiddleware } from 'redux'
import {
  functionMiddleware,
  promiseMiddleware,
  loadingReducer,
  setLoadingStateKeyPath,
  inject,
  entity,
} from 'redux-scalable'

setLoadingStateKeyPath('loading')
inject.setKeyPath('inject')
entity.setKeyPath('entity')

createStore(
  combineReducers({
    loading: loadingReducer,
    inject: inject.reducer,
    entity: entity.reducer
  }),
  fromJS({}),
  applyMiddleware(
    functionMiddleware,
    promiseMiddleware
  )
)
```

### Create and dispatch actions from anywhere

```js
import {
  makeActionCreator,
  inject,
  entity
} from 'redux-scalable'

const injectValue = makeActionCreator('inject-value', {}, (value) => ({
  fragments: [inject.makeFragment('value', value)]
}))

const getStuff = makeActionCreator('get-stuff', {}, async () => ({
  fragments: [entity.makeFragment('Stuff', await fetch(`/my/stuff/location`))]
}))

const getPaginatedStuff = makeActionCreator('get-paginated-stuff', {}, async (page) => ({
  fragments: [
    inject.makeFragment('PaginatedStuff.page', page),
    entity.makeFragment('PaginatedStuff', await fetch(`/my/stuff/location/${page}`, page))
  ]
}))
```

### Get state information using selectors

```js
import { createSelector, createStructuredSelector } from 'reselect'
import { inject, entity } from 'redux-scalable'

const mySelector = createStructuredSelector({
  value: inject.makeSelect('value'),
  stuff: entity.makeSelect('Stuff'),
  paginatedStuff: entity.makeSelect(
    'PaginatedStuff',
    inject.makeSelect('PaginatedStuff.page')
  )
})
```

## Creating actions

> Along this library usage, you will see that `meta` and `payload` are always treated as objects.
> This behaviour is necessary for sharing information through the entire action lifecycle.

Although actions are plain JavaScript objects, using action creators is a common approach which
allows reducing the needed boilerplate for action creation. In our case, some promises and functions
may be involved in the action content, and for that purpose action creators become ideal. So this is
the API:

```js
import { makeActionCreator } from 'redux-scalable'

const myActionCreator = makeActionCreator(
  'my-action-type',
  {/* action meta information */},
  {/* action payload */}
)
```

As it can be seen, the functionality is quite simple: it allows setting the action type, the
metadata and the payload. Once the generated action creator is called, the passed parameters are
copied to an `actionParameters` attribute in the action meta, and then followed to the payload if
it is a function. Continue with the next part for more information.

## Middlewares

The following part of the library pretends to extends the payload attribute to new types, so action
creators become more flexible and async actions become possible.

### Functions as payloads

As described before, action creators may received a function as payload. This middleware allows
executing the payload and setting the result inside the action. A last parameter will be added with
the previous state. In this example two counter actions will be created, taking the previous state
and increasing/decreasing the value:

```js
import { createStore } from 'redux'
import { makeActionCreator } from 'redux-scalable'

const increase = makeActionCreator('increase', {}, (amount, state) => state + amount)
const decrease = makeActionCreator('decrease', {}, (amount, state) => state - amount)

const store = createStore(/* initialState = 0 */)
store.dispatch(increase(1)) // 1
store.dispatch(decrease(2)) // -1
```

### Promises as payloads

This middleware can be injected into a Redux store in order to allow using Promises as action
payload. When an action has a Promise as payload the state flow is:

__1. The promise is created__

A load action is dispatched, storing inside the redux state the following information:

- The string `/load` is appended to the action type
- The meta property of the action receives a new property `promiseStatus`,
  being `LOADING_STATUS` the value of this property. This value is a unique string which can be
  imported as `PROMISE_LOADING_STATUS`
- The payloads becomes null, indicating that the content of the action is still not available

```js
const loadAction = {
  type: '[DEFINED_ACTION_TYPE]/load',
  meta: { promiseStatus: 'LOADING_STATUS' /* [...action meta] */ },
  payload: null
}
```

> After dispatching [1], only [2a] or [2b] will be dispatched, as this is the normal standard
> Promise flow.

__2a. The promise is resolved__

If the promise is resolved, a new action with the following shape is dispatched:

```js
const successAction = {
  type: '[DEFINED_ACTION_TYPE]/success',
  meta: { promiseStatus: 'SUCCESS_STATUS' /* [...action meta] */ },
  payload: '[resolved value]'
}
```

__2b. The promise is rejected__

If the promise is rejected, a new action with the following shape is dispatched:

```js
const errorAction = {
  type: '[DEFINED_ACTION_TYPE]/success',
  meta: { promiseStatus: 'ERROR_STATUS' /* [...action meta] */ },
  payload: '[rejected value (normally an error object)]'
}
```

> __Getting the promise status__
>
> Now that promises can be used as actions, we should have a way of extracting the status of our
> actions from the application state. Although you can implement your own process for getting each
> status, `redux-scalable` provides a reducer and a selector for managing the behaviour

TODO document or refer reducer and selector

## Action fragments

An action fragment represents a part of the action that can be handled by a action fragment reducer.
With this approach, actions can be handled by various generic reducers with no conflicts. An action
fragment is this:

```js
const actionFragment = {
  type: 'action-fragment-reducer-name'
}
```

Done. It's quite similar to an action, but they are appended inside the `fragments` property of
an action payload:

```js
const actionWithFragment = {
  type: 'my-magnificent-action',
  payload: {
    fragments: [
      { type: 'action-fragment-reducer-name' },
      { type: 'another-one' }
    ]
  }
}
```

And that is all. The following functions are helpers for creating each type of action fragment. Each
one treats the store in a different way, but is your choice if you want to combine them or keep them
separated (the example shown before keeps them separated). The structure of any fragment creator is:

```js
const fragmentCreator = {
  type: 'fragment',       // Type added to any generated fragment
  initialState: {},       // Initial state of the substate managed by the fragment creator
  makeFragment: () => {}, // Function that returns a fragment, part of the action's payload
  reducer: () => {},      // Reducer that must be injected to the store in order to let it work
  makeSelect: () => {},   // Selector creator for fetching information generated by this
                          // fragment creator
  setKeyPath: () => {}    // Function that store the substate location where this fragment creator
                          // manages information. Use an empty array or null for the root path
}
```

> There is a little secret that makes `makeSelect` quite powerful: if you pass functions as
> arguments, they will be treated as selectors, and the selected state will be sent to the
> given callback. Checkout the real world tests for an example of this behaviour

### Inject action fragments

The __Inject Action Fragment__ (aka. _The Magnificent Action Fragment Which Probably Is Included And
Recreated On Every Project But Not Anymore_) takes a value and stores it in the specified `keyPath`.
It's simple, but it also has some cool merging objects functionality. Usage:

```js
const setSecretValue = makeActionCreator('setSecretValue', {}, (value) => ({
  fragments: [inject.makeFragment('super.secret.path', value)]
}))
const selectSuperSecretValue = inject.makeSelect('super.secret.path', ':(')
store.dispatch(setSecretValue('1234'))
selectSuperSecretValue(store.getState()) // '1234'
```

### Entity action fragments

And finally we have reached the fragment creator that motivated this project: it allows managing
groups of paginated elements that are efficiently organized inside redux's state. It also checks
duplicated information and merges objects removing undefined attributes. Check this sample:

```js
const addPost = makeActionCreator('addPost', {}, (id, content, stars) => ({
  fragments: [entity.makeFragment('Post', [{id, content, stars}])]
}))
const getPosts = entity.makeSelect('Post')
store.dispatch(addPost(1, 'awesome'))
getPosts(store.getState()) // [{id: 1, content: 'awesome'}]
store.dispatch(addPost(1, undefined, 12))
getPosts(store.getState()) // [{id: 1, content: 'awesome', stars: 12}]
```

Cool, right? There is a single condition, and it is that every element in the store must have
an unique id that must be a standard js type (string, number...). This attribute will be
used for identifying elements inside the store, so feel free to pass in your database id or
generating a new id for redux.

## Creating new action fragments

In order to define action each fragment, `redux-scalable` uses an internal function called
`defineActionFragment`, which provides the necesary reducer, selector, and action creator. You can
extend `redux-scalable` inside your application by defining new action fragments. See the API index
in order to use this functionality
