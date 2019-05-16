import React from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
export default class BlurViewScreen extends React.Component {
  static navigationOptions = {
    title: 'BlurView',
  };

  state = {
    intensity: new Animated.Value(0),
  };

  componentDidMount() {
    this._animate();
  }

  _animate = () => {
    const { intensity } = this.state;
    const animateInConfig = {
      duration: 2500,
      toValue: 100,
      isInteraction: false,
    };
    const animateOutconfig = { duration: 2500, toValue: 0, isInteraction: false };

    Animated.timing(intensity, animateInConfig).start(() => {
      Animated.timing(intensity, animateOutconfig).start(this._animate);
    });
  }

  render() {
    const uri = 'https://s3.amazonaws.com/exp-brand-assets/ExponentEmptyManifest_192.png';

    return (
      <View
        style={{
          flex: 1,
          padding: 50,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {['default', 'light', 'dark'].map(tint => (
          <View
            key={tint}
            style={{
              padding: 6,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image style={{ width: 180, height: 180 }} source={{ uri }} />

            <AnimatedBlurView
              tint={tint}
              intensity={this.state.intensity}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ))}
      </View>
    );
  }
}
