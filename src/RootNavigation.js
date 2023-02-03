// import {NavigationActions} from 'react-navigation';
import * as React from 'react';

export const navigationRef = React.createRef();

// function setTopLevelNavigator(navigatorRef) {
//   navigator = navigatorRef;
// }

function popToTop(routeName, params) {
  navigator.dispatch(
    navigationRef.current?.popToTop({
      routeName,
      params,
    }),
  );
}

export function navigate(routeName, params) {
  navigationRef.current?.navigate(routeName, params);
}

// add other navigation functions that you need and export them

export default {
  navigate,
  popToTop,
};
