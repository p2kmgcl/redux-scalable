# redux-scalable

[![Travis build status](http://img.shields.io/travis/p2kmgcl/redux-scalable/master.svg?style=flat-square)](https://travis-ci.org/p2kmgcl/redux-scalable)
[![NPM version](http://img.shields.io/npm/v/redux-scalable.svg?style=flat-square)](https://www.npmjs.org/package/redux-scalable)

A set of reducers, selectors, middlewares and action creators that allows managing a predictable,
scalable and easy to use Redux state.

> _(Kind of) Disclaimer, do not overcomplicate_
>
> This library is not an attempt of extending or modifying redux in any way. It's just a set of
> generic __functions__ that can be used for reducing that necessary amount of boilerplate needed
> for managing a __complex__ redux project, which multiple collections of elements, pagination
> and/or data fetching. This means that __if you are trying to build a redux counter, maybe this
> project goes too far__.

__Needed for 1.0.0__:

- [ ] Set a _standard_ documentation method (flow, typescript, jsdocs...)
- [ ] Test semantic versioning publications
- [ ] Test library usage in production
- [ ] Complete _defining new fragment creators_ documentation

__Content index__:

- [Assumptions](#assumptions)
- [Fast setup](#fast-setup)
- [Creating actions](#creating-actions)
- [Middlewares](#middlewares):
  - [Functions as payloads](#functions-as-payloads)
  - [Promises as payloads](#promises-as-payloads)
- [Action fragments](#action-fragments):
  - [Inject action fragments](#inject-action-fragments)
- [Creating new action fragments](#creating-new-action-fragments)

__API index__:

- [makeActionCreator](#creating-actions)


- [functionMiddleware](#functions-as-payloads)


- [promiseMiddleware](#promises-as-payloads)
- [loadingReducer](#promises-as-payloads)
- [setLoadingStateKeyPath](#promises-as-payloads)
- [makeSelectLoading](#promises-as-payloads)


- [inject.makeFragment](#inject-action-fragments)
- [inject.reducer](#inject-action-fragments)
- [inject.makeSelect](#inject-action-fragments)
- [inject.setKeyPath](#inject-action-fragments)


- [entity.makeFragment](#entity-action-fragments)
- [entity.reducer](#entity-action-fragments)
- [entity.makeSelect](#entity-action-fragments)
- [entity.setKeyPath](#entity-action-fragments)

- [defineActionFragment](#creating-new-action-fragments)

## Assumptions

`redux-scalable` does not add any extra dependency, but it assumes the usage of some commons
Redux-environment libraries, so they are added as peer dependencies:

- [Redux](http://redux.js.org/) (awesome, I know)
- [Immutable](https://facebook.github.io/immutable-js/) for efficient state managing
- [Reselect](https://github.com/reactjs/reselect) for cache state observation

> If you find this approach incorrect and/or know how to improve this library, feel free to open an
> issue to suggest any change.

> ES6 support, with the standard module importing, is also assumed. However, if you are not using
> ES6 and do not want to add a compilation, you can use the provided `build/index.js` and
> `build/index.min.js` files. This builds __do__ include `immutable` and `reselect`, as it is
> needed.

Although there is a global export inside `redux-scalable/index.js`. Individual exports can be used
by importing files from `redux-scalable/src/**` files.

## Fast setup

I strongly recommend reading the whole README __before__ starting with this library. Although this
setup just shows which middlewares, reducers, actions and selectors are available, just importing
all the files maybe confusing.

### 1. Inject middlewares and reducers when creating your store

```js
import { createStore, applyMiddleware } from 'redux'
import { combineReducers } from 'redux-immutable'
import { fromJS } from 'immutable'
import {
  functionMiddleware,
  promiseMiddleware,
  loadingReducer,
  setLoadingStateKeyPath,
  inject,
  entity,
} from 'redux-scalable'

setLoadingStateKeyPath(['loading'])
inject.setKeyPath(['inject'])
entity.setKeyPath(['entity'])

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

### 2. Create and dispatch actions from anywhere

```js
import {
  makeActionCreator,
  inject,
  entity
} from 'redux-scalable'

const injectValue = makeActionCreator('inject-value', {}, (value) => ({
  fragments: [inject.makeFragment(['value'], value)]
}))

const getStuff = makeActionCreator('get-stuff', {}, async () => ({
  fragments: [entity.makeFragment('Stuff', await fetch(`/my/stuff/location`))]
}))

const getPaginatedStuff = makeActionCreator('get-paginated-stuff', {}, async (page) => ({
  fragments: [
    inject.makeFragment(['PaginatedStuff', 'page'], page),
    entity.makeFragment('PaginatedStuff', await fetch(`/my/stuff/location/${page}`, page))
  ]
}))
```

### 3. Get state information using selectors

```js
import { createSelector, createStructuredSelector } from 'reselect'
import { inject, entity } from 'redux-scalable'

const mySelector = createStructuredSelector({
  value: inject.makeSelect(['value']),
  stuff: entity.makeSelect('Stuff'),
  paginatedStuff: entity.makeSelect(
    'PaginatedStuff',
    inject.makeSelect(['PaginatedStuff', 'page'])
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
- The meta property of the action receives a new property `status`, being `LOADING_STATUS` the value
  of this property. This value is a symbol which can be imported as `PROMISE_LOADING_STATUS`
- The payloads becomes null, indicating that the content of the action is still not available

```js
const loadAction = {
  type: '[DEFINED_ACTION_TYPE]/load',
  meta: { status: 'LOADING_STATUS' /* [...action meta] */ },
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
  meta: { status: 'SUCCESS_STATUS' /* [...action meta] */ },
  payload: '[resolved value]'
}
```

__2b. The promise is rejected__

If the promise is resolved, a new action with the following shape is dispatched:

```js
const errorAction = {
  type: '[DEFINED_ACTION_TYPE]/success',
  meta: { status: 'ERROR_STATUS' /* [...action meta] */ },
  payload: '[rejected value (normally an error object)]'
}
```

> __Getting the promise status__
>
> Now that promises can be used as actions, we should have a way of extracting the status of our
> actions from the application state. Although you can implement your own process for getting each
> status, `redux-scalable` provides both

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
It's simple, but it also has some cool merging objects functionality. Almost everything is immutable
behaviour, but that is because immutable is so cool too. Usage:

```js
const setSecretValue = makeActionCreator('setSecretValue', {}, (value) => ({
  fragments: [inject.makeFragment(['super', 'secret', 'path'], value)]
}))
const selectSuperSecretValue = inject.makeSelect(['super', 'secret', 'path'], ':(')
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
an unique id that must be a standard js type (string, number, Symbol...). This attribute will be
used for identifying elements inside the store, so feel free to pass in your database id or
generating a new id for redux.

## Creating new action fragments

TODO
