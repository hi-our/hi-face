export const FETCH_ACTION_NAME = Symbol('FETCH_DATA')

export const TYPES = {
  REQUESTING: Symbol('requesting'),
  SUCCESS: Symbol('success'),
  FAILURE: Symbol('failure')
}

export const SEP = '/'

export const mirrorLogger = {
  error: (e) => { console.error('[mirror]', e) },
  info:  (e) => { console.info('[mirror]', e) },
  warn: (e) => { console.warn('[mirror]', e) }
}

export const SUBTREE = Symbol('child')

// 相比redux的combineReducers移除warning检测
export function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers)
  const finalReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
  const finalReducerKeys = Object.keys(finalReducers)
  return function combination(state = {}, action) {
    let hasChanged = false
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]
      const reducer = finalReducers[key]
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(previousStateForKey, action) || {}
      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    return hasChanged ? nextState : state
  }
}