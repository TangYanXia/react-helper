import {
  mappingVal,
} from './mapping';
import { getValKeyPath } from './obj_key_path_ops';
import {
  stick$refToState,
  setASymlink,
} from './$ref';

export function getMappingVal(obj, keyPath, mapping) {
  const rawRes = getValKeyPath(obj, keyPath);
  if (mapping) {
    return mappingVal(rawRes, mapping);
  }
  return rawRes;
}

export { default as getCachedFunction } from './cached_function';

export {
  stick$refToState,
  setASymlink,
};
