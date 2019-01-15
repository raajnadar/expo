import * as React from 'react';

import { requireNativeViewManager } from 'expo-core';

export default class ExpoImageManipulatorView extends React.Component {
  static NativeView = requireNativeViewManager('ExpoImageManipulatorView');

  render() {
    return (
      <ExpoImageManipulatorView.NativeView />
    );
  }
}
