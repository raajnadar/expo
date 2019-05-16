import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Image,
  TouchableOpacityProps,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import * as ImageManipulator from 'expo-image-manipulator';
import { Asset } from 'expo-asset';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/Colors';

interface State {
  ready: boolean;
  image?: Asset | ImageManipulator.ImageResult;
  original?: Asset;
}

export default class ImageManipulatorScreen extends React.Component<{}, State> {
  static navigationOptions = {
    title: 'ImageManipulator',
  };

  readonly state: State = {
    ready: false,
  };

  componentWillMount() {
    (async () => {
      const image = Asset.fromModule(
        require('../../assets/images/example2.jpg')
      );
      await image.downloadAsync();
      this.setState({
        ready: true,
        image,
        original: image,
      });
    })();
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={{ padding: 10 }}>
          <View style={styles.actionsButtons}>
            <Button style={styles.button} onPress={() => this._rotate(90)}>
              <Ionicons name="ios-refresh" size={16} color="#ffffff" /> 90
            </Button>
            <Button style={styles.button} onPress={() => this._rotate(45)}>
              45
            </Button>
            <Button style={styles.button} onPress={() => this._rotate(-90)}>
              -90
            </Button>
            <Button
              style={styles.button}
              onPress={() => this._flip(ImageManipulator.FlipType.Horizontal)}
            >
              Flip horizontal
            </Button>
            <Button
              style={styles.button}
              onPress={() => this._flip(ImageManipulator.FlipType.Vertical)}
            >
              Flip vertical
            </Button>
            <Button
              style={styles.button}
              onPress={() => this._resize({ width: 250 })}
            >
              Resize width
            </Button>
            <Button
              style={styles.button}
              onPress={() => this._resize({ width: 300, height: 300 })}
            >
              Resize both to square
            </Button>
            <Button style={styles.button} onPress={() => this._compress(0.1)}>
              90% compression
            </Button>
            <Button style={styles.button} onPress={this._crop}>
              Crop - half image
            </Button>
            <Button style={styles.button} onPress={this._combo}>
              Cccombo
            </Button>
          </View>

          {this.state.ready && this._renderImage()}
          <View style={styles.footerButtons}>
            <Button style={styles.button} onPress={this._pickPhoto}>
              Pick a photo
            </Button>
            <Button style={styles.button} onPress={this._reset}>
              Reset photo
            </Button>
          </View>
        </View>
      </ScrollView>
    );
  }

  _renderImage = () => {
    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: (this.state.image! as Asset).localUri || this.state.image!.uri }}
          style={styles.image}
        />
      </View>
    );
  }

  _pickPhoto = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status !== 'granted') {
      alert('Permission to CAMERA_ROLL not granted!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
    });
    if (result.cancelled) {
      alert('No image selected!');
      return;
    }
    this.setState({ image: result });
  }

  _rotate = async (deg: number) => {
    await this._manipulate([{ rotate: deg }], {
      format: ImageManipulator.SaveFormat.PNG,
    });
  }

  _resize = async (size: { width?: number; height?: number }) => {
    await this._manipulate([{ resize: size }]);
  }

  _flip = async (flip: ImageManipulator.FlipType) => {
    await this._manipulate([{ flip }]);
  }

  _compress = async (compress: number) => {
    await this._manipulate([], { compress });
  }

  _crop = async () => {
    await this._manipulate([
      {
        crop: {
          originX: 0,
          originY: 0,
          width: this.state.image!.width! / 2,
          height: this.state.image!.height!,
        },
      },
    ]);
  }

  _combo = async () => {
    await this._manipulate([
      { rotate: 180 },
      { flip: ImageManipulator.FlipType.Vertical },
      {
        crop: {
          originX: this.state.image!.width! / 4,
          originY: this.state.image!.height! / 4,
          width: this.state.image!.width! / 2,
          height: this.state.image!.width! / 2,
        },
      },
    ]);
  }

  _reset = () => {
    this.setState({ image: this.state.original });
  }

  _manipulate = async (actions: ImageManipulator.Action[], saveOptions?: ImageManipulator.SaveOptions) => {
    const manipResult = await ImageManipulator.manipulateAsync(
      (this.state.image! as Asset).localUri || this.state.image!.uri,
      actions,
      saveOptions
    );
    this.setState({ image: manipResult });
  }
}

const Button: React.FunctionComponent<TouchableOpacityProps> = ({ onPress, style, children }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.button, style]}
  >
    <Text style={styles.buttonText}>{children}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  button: {
    padding: 8,
    borderRadius: 3,
    backgroundColor: Colors.tintColor,
    marginRight: 10,
    marginBottom: 10,
  },
  actionsButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
  },
});
