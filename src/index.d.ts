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
declare function makeActionCreator(
  type: string,
  meta?: object,
  payload?: object|Promise<object>|(() => object)
): ActionCreator<Action>

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

/**
 * @type function
 * Redux Middleware that allows processing action's payloads as promises by resolving/rejecting
 * them before being sent to the store. When a promise payload is received by this middleware, it
 * sends an action to the store with the following shape:
 *
 * ```
 *   {
 *     type,
 *     meta: { promiseStatus: PROMISE_STATUS_LOADING, ...},
 *     payload: null
 *   }
 * ```
 *
 * This "loading" action indicates that an action of the given type has a promise, and the mentioned
 * promise is on loading state. With this behaviour, the loading reducer (if being used, @see
 * loadingReducer) will store this state. The null payload represents that no information is
 * available yet.
 *
 * Then, the promise must be resolved or rejected (otherwise the middleware will be waiting forever)
 * , and the middleware produces a second action dispatched to the store:
 *
 * ```
 *   {
 *     type,
 *     meta: { promiseStatus: PROMISE_STATUS_SUCCESS/PROMISE_STATUS_ERROR, ...},
 *     payload: [resolved or rejected payload]
 *   }
 * ```
 *
 * This action is taken by the loading reducer (if being used), and unchecks the action being
 * loaded.
 *
 * For using this middleware just inject it to redux using the `applyMiddleware` function provided
 * by them.
 */
interface promiseMiddleware extends Middleware {
}

/**
 * @type function
 * This reducer will process actions that have a `meta.promiseStatus` property and produces an
 * array of the actions being loaded (pending promises), each element of the array is the action
 * type being loaded, and if two actions of the same type are dispatched, two equal elements will
 * appear in the array:
 *
 * - If the `meta.promiseStatus` equals to the PROMISE_STATUS_LOADING constant, the action type
 *   is appened to the state.
 * - If the `meta.promiseStatus` is either PROMISE_STATUS_SUCCESS or PROMISE_STATUS_ERROR, the
 *   action type (if existing) is removed from the state. Only one element is removed at a time.
 * - If the action dispatched has no `meta` property, has no `meta.promiseStatus` property, or
 *   it's `meta.promiseStatus` property has a different value, the action is ignored.
 *
 * @param {[]} [state=[]] List of actions being loaded.
 * @param {object} action Action being processed as described before.
 * @return {[]}
 */
declare function loadingReducer(state: any, action: Action): any

/**
 * @type function
 * Function that sets where the loading selector maker (@see makeSelectLoading) will operate
 * inside the state. if null or an empty array is passed, it will check the root state as base.
 *
 * @param {string|null} [keyPath=null]
 */
declare function setLoadingStateKeyPath(keyPath: string|null): void

/**
 * @type function
 * Produces a selector that will check if a given action (by type) is being loaded. It uses the
 * specified keyPath as state root (@see setLoadingStateKeyPath) and checks if it is a list of
 * elements. Then it looks for the given string, and returns true if it is present. If any of
 * these conditions is not met, the created selector will return false.
 *
 * @param {string} actionType Action type that will be checked by the produced selector
 * @return {Selector<*, boolean>} A selector that when executed, will return true if an
 *   action with `actionType` is being loaded, or false otherwise.
 */
declare function makeSelectLoading(actionType: string): Selector<any, boolean>

/**
 * @type String
 * Constant that represents a promise action whose promise is being loaded.
 * It will be present inside `meta.promiseStatus`
 */
interface PROMISE_LOADING_STATUS extends String {
}

/**
 * @type String
 * Constant that represents a promise action whose promise has been resolved.
 * It will be present inside `meta.promiseStatus`
 */
interface PROMISE_SUCCESS_STATUS extends String {
}

/**
 * @type String
 * Constant that represents a promise action whose promise has been rejected.
 * It will be present inside `meta.promiseStatus`
 */
interface PROMISE_ERROR_STATUS extends String {
}

/**
 * Fragment that can be processed by an entity action fragment.
 *
 * @prop {string} [type='inject'] Fixed value which identifies the action fragment
 * @prop {string} keyPath Place where the value will be injected.
 * @prop {*} [value=undefined] Value to be stored. If no value is specified, the given path
 *   will be deleted from the store.
 */
interface InjectActionFragment extends ActionFragment {
  type: 'inject',
  keyPath: string,
  value: any
}

/**
 * @type object
 * Frozen object that represents the interface of the "inject" fragment type (@see
 * defineActionFragment for more information, this documentation describes the functionality
 * of this concrete interface).
 *
 * @prop {string} inject Constant representing the fragment type
 * @prop {{}} initialState Initial state of the redux store
 * @prop {function} makeFragment Function for generating new fragments
 * @prop {function} reducer Reducer to be injected to the store
 * @prop {function} makeSelect Function that produces selectors
 * @prop {function} setKeyPath Function that modifies the scope of the generated selectors. Keep
 *   it in sync with the injected reducer.
 */
interface inject extends ActionFragmentCreator {
  type: 'inject',
  initialState: {},
  makeFragment: (keyPath: string, value: any) => InjectActionFragment,
  reducer: (state: any, action: ActionWithFragments, fragment: InjectActionFragment) => any,
  makeSelect: (keyPath: string|Selector<any, string>, defaultValue: any) => Selector<any, any>
}

/**
 * @type object
 * Single element managed by the entity fragment reducers. It may have any shape, but an
 * unique id property is needed for distinguish entities.
 *
 * @prop {*} id Property that identifies the entity
 */
interface EntityElement {
  id: any
}

/**
 * Fragment that can be processed by an entity action fragment. The only needed information
 * is the fragment type, the entity name, and the list of elements (which can be empty).
 *
 * @prop {string} [type='entity'] Fixed value which identifies the action fragment
 * @prop {string} name Name of the entity to be managed by this fragment
 * @prop {EntityElement[]|null} elements List of elements to be added to the state. This elements
 *   will be merged with the exiting ones, and the list of ids will be included in the given
 *   page and group.
 * @prop {number} [page=0] Page of elements to be stored (optional)
 * @prop {string} [group='default'] Optional parameter that allows maintaining different groups
 *   of elements with the same type (ex. popular and latest articles).
 */
interface EntityActionFragment extends ActionFragment {
  type: 'entity',
  name: string,
  elements: EntityElement[],
  page: number,
  group: string
}

/**
 * @type object
 * Frozen object that represents the interface of the "inject" fragment type (@see
 * defineActionFragment for more information, this documentation describes the functionality
 * of this concrete interface).
 *
 * @prop {string} inject Constant representing the fragment type
 * @prop {{}} initialState Initial state of the redux store
 * @prop {function} makeFragment Function for generating new fragments
 * @prop {function} reducer Reducer to be injected to the store
 * @prop {function} makeSelect Function that produces selectors
 * @prop {function} setKeyPath Function that modifies the scope of the generated selectors.
 *   Keep it in sync with the injected reducer.
 */
interface entity extends ActionFragmentCreator {
  type: 'entity',
  initialState: {},

  makeFragment: (
    name: string,
    elements: EntityElement[],
    page?: number,
    group?: string
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

/**
 * Fragment that can be processed by an action fragment processor. The only needed information
 * is the fragment type, and the needed values by the processor.
 *
 * @prop {string} type Fixed value which identifies the action fragment.
 */
interface ActionFragment {
  type: string
}

/**
 * Action which contains a list of fragments.
 */
interface ActionWithFragments extends Action {
  payload: {
    fragments: ActionFragment[]
  }
}

/**
 * @type object
 * Frozen object that represents the interface of a fragment type.
 *
 * @prop {string} type Constant representing the fragment type
 * @prop {*} initialState Initial state of the redux store
 * @prop {function} makeFragment Function for generating new fragments
 * @prop {function} reducer Reducer to be injected to the store
 * @prop {function} makeSelect Function that produces selectors
 * @prop {function} setKeyPath Function that modifies the scope of the generated selectors.
 *   Keep it in sync with the injected reducer.
 */
interface ActionFragmentCreator {
  type: string,
  initialState: any,
  makeFragment: (...args:any[]) => ActionFragment,
  reducer: (state: any, action: ActionWithFragments, fragment: ActionFragment) => any,
  makeSelect: (...args:any[]) => Selector<any, any>,
  setKeyPath: (keyPath: string|null) => void
}

/**
 * @type object
 * Object used for defining a new action fragment creator. Although this function is used
 * internally, it can be reused for adding customized action fragments.
 *
 * @prop {string} type Constant representing the fragment type
 * @prop {*} initialState Initial state of the redux store
 * @prop {function} makeFragment Function for generating new fragments
 * @prop {function} reducer Reducer to be injected to the store
 * @prop {function} selector Selector used for the generated wrapped selectors
 */
interface ActionFragmentCreatorDefinition {
  type: string,
  initialState: any,
  makeFragment: (...args:any[]) => ActionFragment,
  reducer: (state: any, action: ActionWithFragments, fragment: ActionFragment) => any,
  selector: Selector<any, any>,
}

/**
 * Function that produces a new ActionFragmentCreator (as the default ones provided by the
 * library). The intention of this function is being internally used, but this exports enables
 * the possibility of extending it's functionality on a project.
 *
 * @param {ActionFragmentCreatorDefinition} actionFragmentCreatorDefinition Definition of
 *  the fragment creator that will be generated. @see ActionFragmentCreatorDefinition
 *  and ActionFragmentCreator documentation for more information about it's usage.
 * @return {ActionFragmentCreator}
 */
declare function defineActionFragment(
  actionFragmentCreatorDefinition: ActionFragmentCreatorDefinition
): ActionFragmentCreator

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
