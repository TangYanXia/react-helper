import genSaga from './sagas/gen-sage';
import transformReducer from './util/transform-reducer';

export default function adaptToMobx(obj, page) {
  const ctx = transformReducer(obj, page);
  // @TODO ctx is very magic!!! use inSaga to switch dispatch function
  const saga = genSaga(obj, page, Object.create(ctx, {
    inSaga: {
      value: true,
      configurable: false,
      writable: false,
    },
  }));
  ctx.saga = saga;
  return ctx;
}
