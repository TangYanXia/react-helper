import React from 'react';
import createReactContext from './implementation';

export default React.createContext || createReactContext;
export function useContext(ctx, con) {
  if (React.createContext) {
    return ctx._currentValue;
  }
  return con[ctx.contextProp];
}
