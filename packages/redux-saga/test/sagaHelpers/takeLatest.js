/* eslint-disable no-unused-vars, no-constant-condition */

import sagaMiddleware from '../../src';
import { createStore, applyMiddleware } from 'redux'
import { arrayOfDeffered } from '../../src/utils'
import { take, fork, cancel, takeLatest } from '../../src/effects'

test('takeLatest', done => {
  expect.assertions(1)

  const defs = arrayOfDeffered(4)

  const actual = []
  const middleware = sagaMiddleware()
  const store = applyMiddleware(middleware)(createStore)(() => {})
  middleware.run(root)

  function* root() {
    const task = yield takeLatest('ACTION', worker, 'a1', 'a2')
    yield take('CANCEL_WATCHER')
    yield cancel(task)
  }

  function* worker(arg1, arg2, action) {
    const idx = action.payload - 1
    const response = yield defs[idx].promise
    actual.push([arg1, arg2, response])
  }

  Promise.resolve(1)
    .then(() => store.dispatch({ type: 'ACTION', payload: 1 }))
    .then(() => store.dispatch({ type: 'ACTION', payload: 2 }))
    .then(() => defs[0].resolve('w-1'))
    .then(() => store.dispatch({ type: 'ACTION', payload: 3 }))
    .then(() => defs[1].resolve('w-2'))
    .then(() => defs[2].resolve('w-3'))
    .then(() => {
      store.dispatch({ type: 'ACTION', payload: 4 })
      /*
      We immediately cancel the watcher after firing the action
      The watcher should be canceleld after this
      no further task should be forked
      the last forked task should also be cancelled
    */
      store.dispatch({ type: 'CANCEL_WATCHER' })
    })
    .then(() => defs[3].resolve('w-4'))
    .then(() => {
      // this one should be ignored by the watcher
      store.dispatch({ type: 'ACTION', payload: 5 })
    })
    .then(() => {
      expect(actual).toEqual([['a1', 'a2', 'w-3']])
      done()
    })
    .catch(err => done.fail(err))
})
