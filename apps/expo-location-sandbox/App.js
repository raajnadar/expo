import React from 'react';
import { Location, Permissions } from 'expo';
import { StyleSheet, Text, View } from 'react-native';

class MyLocation extends React.Component {
  state = {
    location: null,
  };

  async componentDidMount() {
    try {
      await Permissions.askAsync(Permissions.LOCATION);

      if (this.props.watch) {
        await Location.watchPositionAsync({ timeInterval: 1000, distanceInterval: 0 }, location => {
          console.log(location);
          this.setState({ location });
        });
      } else {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
        this.setState({ location });
      }
    } catch (error) {
      console.error(error.code);
    }
  }

  render() {
    const { location } = this.state;

    if (!location) {
      return null;
    }

    return (
      <Text>#{this.props.id}: {location.coords.latitude}, {location.coords.longitude}</Text>
    );
  }
}

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>

        <MyLocation id="1" />
        <MyLocation id="2" />
        <MyLocation id="3" watch />
        <MyLocation id="4" watch />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
