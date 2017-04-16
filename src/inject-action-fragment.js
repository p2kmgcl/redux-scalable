import { Map as ImmutableMap } from 'immutable'
import defineActionFragment from './define-action-fragment'

export default defineActionFragment({
  type: 'inject',
  initialState: new ImmutableMap(),
  makeFragment: (keyPath, value) => ({ type: 'inject', keyPath, value }),
  reducer: (state, action, { keyPath, value }) => state.setIn(keyPath, value),
  selector: (state = new ImmutableMap(), keyPath, defaultValue) =>
    state.getIn(keyPath, defaultValue)
})
