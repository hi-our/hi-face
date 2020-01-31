import { createStore as _createStore, applyMiddleware } from 'redux'
import { combineReducers }  from './consts'
import { getModels } from './model'

export let store = null

let initialReducers = {}
let isCreateStoreInMirror = false
let _passedReplaceReducers = null


export function createStore({
  middlewares = [],
  initialState = {},
  reducers = {}
} = {}) {
  isCreateStoreInMirror = true
  const models = getModels()
  initialReducers = reducers
  const reducer = createReducer(models, initialReducers)
  store = _createStore(reducer, initialState, applyMiddleware(...middlewares))
  return store
}


export function bindStore(_store, _replaceReducers) {
  store = _store
  _passedReplaceReducers = _replaceReducers
}

export function replaceReducer(newReducer) {
  if (isCreateStoreInMirror) {
    const models = getModels()
    const reducer = createReducer(models, initialReducers)
    store.replaceReducer(reducer)
  } else {
    _passedReplaceReducers(newReducer)
  }
}

function createReducer(models, reducers) {
  const modelReducers = models.reduce((acc, cur) => {
    acc[cur.name] = cur.reducer
    return acc
  }, {})

  return combineReducers({
    ...reducers,
    ...modelReducers
  })
}


