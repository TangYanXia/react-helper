import React from 'react';
import { isValidElementType } from 'react-is';
import PropTypes from 'prop-types';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';

import RouterContext from './router-context';
import matchPath from './match-path';

function isEmptyChildren(children) {
  return React.Children.count(children) === 0;
}

/**
 * The public API for matching a single path and rendering.
 */
class Route extends React.Component {
  render() {
    const {
      location: givenLocation,
      computedMatch,
      path,
      component,
      render,
    } = this.props;
    return (
      <RouterContext.Consumer>
        {(context) => {
          invariant(context, 'You should not use <Route> outside a <Router>');

          const location = givenLocation || context.location;
          const match = computedMatch || (path
            ? matchPath(location.pathname, this.props)
            : context.match);

          const props = { ...context, location, match };

          let { children } = this.props;

          // Preact uses an empty array as children by
          // default, so use null if that's the case.
          if (Array.isArray(children) && children.length === 0) {
            children = null;
          }

          if (typeof children === 'function') {
            children = children(props);

            if (children === undefined) {
              if (process.env.NODE_ENV !== 'production') {
                warning(
                  false,
                  'You returned `undefined` from the `children` function of '
                  + `<Route${path ? ` path="${path}"` : ''}>, but you `
                  + 'should have returned a React element or `null`'
                );
              }

              children = null;
            }
          }

          let renderChildren = null;

          if (children && !isEmptyChildren(children)) {
            renderChildren = children;
          } else if (props.match) {
            if (component) {
              renderChildren = React.createElement(component, props);
            } else if (render) {
              renderChildren = render(props);
            }
          }

          return (
            <RouterContext.Provider value={props}>
              { renderChildren }
            </RouterContext.Provider>
          );
        }}
      </RouterContext.Consumer>
    );
  }
}

if (process.env.NODE_ENV !== 'production') {
  Route.propTypes = {
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    component: (props, propName) => {
      if (props[propName] && !isValidElementType(props[propName])) {
        return new Error(
          'Invalid prop \'component\' supplied to \'Route\': the prop is not a valid React component'
        );
      }
    },
    exact: PropTypes.bool,
    location: PropTypes.object,
    path: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    render: PropTypes.func,
    sensitive: PropTypes.bool,
    strict: PropTypes.bool,
    keepAlive: PropTypes.bool,
  };

  Route.defaultProps = {
    keepAlive: false,
  };

  Route.prototype.componentDidMount = function () {
    warning(
      !(
        this.props.children
        && !isEmptyChildren(this.props.children)
        && this.props.component
      ),
      'You should not use <Route component> and <Route children> in the same route; <Route component> will be ignored'
    );

    warning(
      !(
        this.props.children
        && !isEmptyChildren(this.props.children)
        && this.props.render
      ),
      'You should not use <Route render> and <Route children> in the same route; <Route render> will be ignored'
    );

    warning(
      !(this.props.component && this.props.render),
      'You should not use <Route component> and <Route render> in the same route; <Route render> will be ignored'
    );
  };

  Route.prototype.componentDidUpdate = function (prevProps) {
    warning(
      !(this.props.location && !prevProps.location),
      '<Route> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    );

    warning(
      !(!this.props.location && prevProps.location),
      '<Route> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    );
  };
}

export default Route;
