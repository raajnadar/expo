import React from 'react';
import {
  Alert,
  View,
  StyleSheet,
  Text,
  Switch,
  TextInput,
  Picker,
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Button from '../components/Button';

const url = 'https://expo.io';
interface Package {
  label: string;
  value: string;
}

interface State {
  showTitle: boolean;
  colorText?: string;
  controlsColorText?: string;
  packages?: Package[];
  selectedPackage?: string;
  lastWarmedPackage?: string;
  barCollapsing: boolean;
}

export default class WebBrowserScreen extends React.Component<{}, State> {
  static navigationOptions = {
    title: 'WebBrowser',
  };

  readonly state: State = {
    showTitle: false,
    barCollapsing: false,
  };

  componentDidMount() {
    if (Platform.OS === 'android') {
      WebBrowser.getCustomTabsSupportingBrowsersAsync()
        .then(({ browserPackages }) => browserPackages.map(name => ({ label: name, value: name })))
        .then(packages => this.setState({ packages }));
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      WebBrowser.coolDownAsync(this.state.lastWarmedPackage);
    }
  }

  barCollapsingSwitchChanged = (barCollapsing: boolean) => {
    this.setState({ barCollapsing });
  }

  showPackagesAlert = async () => {
    const result = await WebBrowser.getCustomTabsSupportingBrowsersAsync();
    Alert.alert('Result', JSON.stringify(result, null, 2));
  }

  handleWarmUpClicked = async () => {
    const { selectedPackage: lastWarmedPackage } = this.state;
    this.setState({
      lastWarmedPackage,
    });
    const result = await WebBrowser.warmUpAsync(lastWarmedPackage);
    Alert.alert('Result', JSON.stringify(result, null, 2));
  }

  handleMayInitWithUrlClicke = async () => {
    const { selectedPackage: lastWarmedPackage } = this.state;
    this.setState({
      lastWarmedPackage,
    });
    const result = await WebBrowser.mayInitWithUrlAsync(url, lastWarmedPackage);
    Alert.alert('Result', JSON.stringify(result, null, 2));
  }

  handleCoolDownClicked = async () => {
    const result = await WebBrowser.coolDownAsync(this.state.selectedPackage);
    Alert.alert('Result', JSON.stringify(result, null, 2));
  }

  handleOpenWebUrlClicked = async () => {
    const args = {
      showTitle: this.state.showTitle,
      toolbarColor: this.state.colorText && `#${this.state.colorText}`,
      controlsColor: this.state.controlsColorText && `#${this.state.controlsColorText}`,
      browserPackage: this.state.selectedPackage,
      enableBarCollapsing: this.state.barCollapsing,
    };
    const result = await WebBrowser.openBrowserAsync(url, args);
    setTimeout(() => Alert.alert('Result', JSON.stringify(result, null, 2)), 1000);
  }

  handleToolbarColorInputChanged = (colorText: string) => this.setState({ colorText });

  handleControlsColorInputChanged = (controlsColorText: string) => this.setState({ controlsColorText });

  packageSelected = (value: string) => {
    this.setState({ selectedPackage: value });
  }

  handleShowTitleChanged = (showTitle: boolean) => this.setState({ showTitle });

  renderIOSChoices = () =>
    Platform.OS === 'ios' && (
      <View style={styles.label}>
        <Text>Controls color (#rrggbb):</Text>
        <TextInput
          style={styles.input}
          placeholder="RRGGBB"
          onChangeText={this.handleControlsColorInputChanged}
          value={this.state.controlsColorText}
        />
      </View>
    )

  renderAndroidChoices = () =>
    Platform.OS === 'android' && (
      <>
        <View style={styles.label}>
          <Text>Show Title</Text>
          <Switch
            style={styles.switch}
            onValueChange={this.handleShowTitleChanged}
            value={this.state.showTitle}
          />
        </View>
        <View style={styles.label}>
          <Text>Force package:</Text>
          <Picker
            style={styles.picker}
            selectedValue={this.state.selectedPackage}
            onValueChange={this.packageSelected}
          >
            {this.state.packages &&
              [{ label: '(none)', value: '' }, ...this.state.packages].map(
                ({ value, label }) => (
                  <Picker.Item key={value} label={label} value={value} />
                )
              )}
          </Picker>
        </View>
      </>
    )

  renderAndroidButtons = () =>
    Platform.OS === 'android' && (
      <>
        <Button style={styles.button} onPress={this.handleWarmUpClicked} title="Warm up." />
        <Button
          style={styles.button}
          onPress={this.handleMayInitWithUrlClicke}
          title="May init with url."
        />
        <Button style={styles.button} onPress={this.handleCoolDownClicked} title="Cool down." />
        <Button
          style={styles.button}
          onPress={this.showPackagesAlert}
          title="Show supporting browsers."
        />
      </>
    )

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.label}>
          <Text>Toolbar color (#rrggbb):</Text>
          <TextInput
            style={styles.input}
            placeholder="RRGGBB"
            onChangeText={this.handleToolbarColorInputChanged}
            value={this.state.colorText}
          />
        </View>
        {this.renderIOSChoices()}
        {this.renderAndroidChoices()}
        <View style={styles.label}>
          <Text>Bar collapsing</Text>
          <Switch
            style={styles.switch}
            onValueChange={this.barCollapsingSwitchChanged}
            value={this.state.barCollapsing}
          />
        </View>
        <Button style={styles.button} onPress={this.handleOpenWebUrlClicked} title="Open web url" />
        {this.renderAndroidButtons()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    padding: 10,
    width: 100,
  },
  switch: { padding: 5 },
  picker: {
    padding: 10,
    width: 150,
  },
  button: {
    margin: 10,
  },
});
