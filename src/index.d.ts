import {Map as ImmutableMap} from 'immutable'
import {Selector} from 'reselect'
import {Action, ActionCreator, Middleware} from 'redux'

// Creating actions --------------------------------------------------------------------------------

function makeActionCreator(
  type: string,
  meta: object = {},
  payload: object|Promise|Function = {}
): ActionCreator

// Function middleware -----------------------------------------------------------------------------

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

interface defineActionFragmentCreator {
  type: string,
  initialState: any,
  makeFragment: (...args:any[]) => ActionFragment,
  reducer: (state: any, action: ActionWithFragments, fragment: ActionFragment) => any,
  selector: Selector<any, any>,
}

function defineActionFragment(defineActionFragmentCreator): ActionFragmentCreator

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
