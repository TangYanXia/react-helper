import proc from '../../src/internal/proc'
import * as io from '../../src/effects'
import { deferred } from '../../src/utils'

test('processor select/getState handling', done => {
  expect.assertions(1)

  let actual = []

  const state = { counter: 0, arr: [1, 2] }
  const counterSelector = s => s.counter
  const arrSelector = (s, idx) => s.arr[idx]

  const def = deferred()

  function* genFn() {
    actual.push((yield io.select()).counter)
    actual.push(yield io.select(counterSelector))
    actual.push(yield io.select(arrSelector, 1))
    yield def.promise

    actual.push((yield io.select()).counter)
    actual.push(yield io.select(counterSelector))
  }

  proc(genFn(), undefined, undefined, () => state).done.catch(err => done.fail(err))

  const expected = [0, 0, 2, 1, 1]

  Promise.resolve(1)
    .then(() => {
      def.resolve()
      state.counter++
    })
    .then(() => {
      expect(actual).toEqual(expected)
    })
    .then(done)
})
