import {Map as ImmutableMap} from 'immutable'
import {Selector} from 'reselect'
import {Action, ActionCreator, Middleware} from 'redux'

/**
 * @type function
 * Makes an action creator which allow dispatching actions of the given type.
 * The generated function has a few special conditions:
 *
 * - The `toString()` method returns the action type that will be used
 * - Any parameter passed to the function will be stored inside `action.meta.actionParameters[]`,
 *   then, if the payload is an action (@see functionMiddleware), it will receive the list of
 *   parameters. This way you can process them either inside the payload or a custom created
 *   reducer.
 *
 * @param {string} type Action type of that will be used for the dispatched actions
 * @param {object} [meta={}] Information of every dispatched action. This attribute is part
 *  of a "Flux Standard Action", and is used by redux scalable for some extra information providing
 *  (like the `actionParameters` array). You can add any extra information if you want.
 * @param {object|Promise|function} [payload={}] The content itself. As payloads represent the main
 *  part of the actions, the vast majority of changes happen here. If you specify a function, it
 *  will be executed with `actionParameters` (@see functionMiddleware), if you use a promise, it
 *  will be resolved/rejected (@see promiseMiddleware), and if you use a simple object... well,
 *  nothing will happen :). Generally you want to wrap a promise inside a function to prevent it
 *  from immediately start, or you may use the fancy `async` operator.
 *
 * @return {ActionCreator} The generated action creator with the described functionality.
 */
function makeActionCreator(
  type: string,
  meta: object = {},
  payload: object|Promise|Function = {}
): ActionCreator

/**
 * @type function
 * Redux Middleware that allows processing actions' payloads as function by executing them
 * before being sent to the store. When a function payload is received by this middleware, it
 * checks if the corresponding action has an `meta.actionParameters` property. If it happens,
 * this array of parameters is passed to the function payload. Then, the result of this execution
 * is set as real payload and the action is passed to the next middleware.
 *
 * For using this middleware just inject it to redux using the `applyMiddleware` function provided
 * by them.
 */
interface functionMiddleware extends Middleware {
}

// Promise middleware ------------------------------------------------------------------------------

interface promiseMiddleware extends Middleware {
}

function loadingReducer(state: any, action: Action): any

function setLoadingStateKeyPath(keyPath: string[]|null): void

function makeSelectLoading(actionType: string): Selector<any, boolean>

interface PROMISE_LOADING_STATUS extends Symbol {
}

interface PROMISE_SUCCESS_STATUS extends Symbol {
}

interface PROMISE_ERROR_STATUS extends Symbol {
}

// Inject ------------------------------------------------------------------------------------------

interface InjectActionFragment extends ActionFragment {
  type: 'inject',
  keyPath: string[],
  value: any
}

interface inject extends ActionFragmentCreator {
  type: 'inject',
  initialState: ImmutableMap,
  makeFragment: (keyPath: string[], value: any) => InjectActionFragment,
  reducer: (state: any, action: ActionWithFragments, fragment: InjectActionFragment) => any,
  makeSelect: (keyPath: string[]|Selector<any, string[]>, defaultValue: any) => Selector<any, any>
}

// Entity ------------------------------------------------------------------------------------------

interface EntityElement {
  id: any
}

interface EntityActionFragment extends ActionFragment {
  type: 'entity',
  name: string,
  elements: EntityElement[],
  page: number,
  group: string
}

interface entity extends ActionFragmentCreator {
  type: 'entity',
  initialState: ImmutableMap,

  makeFragment: (
    name: string,
    elements: EntityElement[],
    page: number = 0,
    group: string = 'default'
  ) => EntityActionFragment,

  reducer: (
    state: any,
    action: ActionWithFragments,
    fragment: EntityActionFragment
  ) => any,

  makeSelect: (
    name: string|Selector<any, string>,
    page: number|Selector<any, number>,
    group: string|Selector<any, string>
  ) => Selector<any, EntityElement[]>
}

// Define action fragment --------------------------------------------------------------------------

interface ActionFragment {
  type: string
}

interface ActionWithFragments extends Action {
  payload: {
    fragments: ActionFragment[]
  }
}

function makeFragment(...args:any[]): ActionFragment

interface ActionFragmentCreator {
  type: string,
  initialState: any,
  makeFragment: (...args:any[]) => ActionFragment,
  reducer: (state: any, action: ActionWithFragments, fragment: ActionFragment) => any,
  makeSelect: (...args:any[]) => Selector<any, any>,
  setKeyPath: (keyPath: string[]|null) => void
}

interface ActionFragmentCreatorDefinition {
  type: string,
  initialState: any,
  makeFragment: (...args:any[]) => ActionFragment,
  reducer: (state: any, action: ActionWithFragments, fragment: ActionFragment) => any,
  selector: Selector<any, any>,
}

function defineActionFragment(ActionFragmentCreatorDefinition): ActionFragmentCreator

// Export ------------------------------------------------------------------------------------------

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
