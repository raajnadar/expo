# expo-image-manipulator

`expo-image-manipulator` module allows image manipulation.

## Installation

*If your app is running in [Expo](https://expo.io) then everything is already set up for you, just `import { ImageManipulator } from 'expo';`*

Otherwise you need to install the package from `npm` registry:

`yarn add expo-image-manipulator` or `npm install expo-image-manipulator`

<!-- Write about Expo dependencies for your module -->
Also, make sure that you have dependecies like [expo-core](https://github.com/expo/tree/master/packages/expo-core) installed.

#### iOS

Add the dependency to your `Podfile`:

```ruby
pod 'EXImageManipulator', path: '../node_modules/expo-image-manipulator/ios'
```

and run `pod install` under the parent directory of your `Podfile`.

#### Android

1.  Append the following lines to `android/settings.gradle`:
    ```gradle
    include ':expo-image-manipulator'
    project(':expo-image-manipulator').projectDir = new File(rootProject.projectDir, '../node_modules/expo-image-manipulator/android')
    ```
2.  Insert the following lines inside the dependencies block in `android/app/build.gradle`:
    ```gradle
    compile project(':expo-image-manipulator')
    ```
3.  Add `new ImageManipulatorPackage()` to your module registry provider in `MainApplication.java`.

## Usage

This code snippet takes advantage of `expo-asset` module.

```javascript
import React, { Component } from 'react';
import { Button, View, StyleSheet } from 'react-native';
import { Asset } from 'expo-asset';
import * as ImageManipulator from 'expo-image-manipulator';

export default class App extends Component {
  state = { image: null };

  componentDidMount() {
    this.loadImage();
  }

  loadImage = async () => {
    const image = Asset.fromModule(require('../path/to/image.png'));
    await image.downloadAsync();
    this.setState({ image });
  };

  manipulateImage = async () => {
    if (this.state.image) {
      alert('Image is unavailable ... :(');
      return;
    }
    const result = await ImageManipulator.manipulateAsync(
      this.state.image.localUri || this.state.image.uri,
      [{
        rotate: 180,
      }, {
        flip: { vertical: true },
      }, {
        crop: {
          originX: this.state.image.width / 4,
          originY: this.state.image.height / 4,
          width: this.state.image.width / 2,
          height: this.state.image.width / 2,
        },
      }],
    );
    this.setState({ image: result });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>'expo-image-manipulator' example</Text>
        <View style={styles.imageContainer}>
          {this.state.image && (
            <Image
              source={{ uri: this.state.image.localUri || this.state.image.uri }}
              style={styles.image}
            />
          )}
        </View>
        <TouchableOpacity onPress={this.manipulateImage} style={styles.button}>
          <Text style={styles.buttonText}>Manipulate photo</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    padding: 8,
    borderRadius: 3,
    backgroundColor: Colors.tintColor,
    marginRight: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
  },
  imageContainer: {
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
});
```

## API & further documentation

See [Expo docs](https://docs.expo.io/versions/latest/sdk/imagemanipulator) for this universal module API documentation.
