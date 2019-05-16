import React from 'react';
import * as MediaLibrary from 'expo-media-library';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Switch,
  ListRenderItem,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

import MonoText from '../../components/MonoText';

interface State {
  includeSmartAlbums: boolean;
  albums: MediaLibrary.Album[];
}

export default class MediaAlbumsScreen extends React.Component<
  NavigationScreenProps,
  State
> {
  static navigationOptions = {
    title: 'MediaLibrary Albums',
  };

  state: State = {
    includeSmartAlbums: false,
    albums: [],
  };

  componentDidMount() {
    this.fetchAlbums();
  }

  componentDidUpdate(_: {}, lastState: State) {
    if (lastState.includeSmartAlbums !== this.state.includeSmartAlbums) {
      this.fetchAlbums();
    }
  }

  async fetchAlbums() {
    const albums = await MediaLibrary.getAlbumsAsync({
      includeSmartAlbums: this.state.includeSmartAlbums,
    });
    this.setState({ albums });
  }

  keyExtractor = (item: MediaLibrary.Album) => item.id;

  openAlbum = (album: MediaLibrary.Album) => {
    this.props.navigation.navigate('MediaLibrary', { album });
  }

  renderItem: ListRenderItem<MediaLibrary.Album> = ({ item }) => {
    return (
      <TouchableOpacity style={styles.album} onPress={() => this.openAlbum(item)}>
        <View style={styles.albumHeader}>
          <Text>{item.title}</Text>
          <Text>{item.assetCount}</Text>
        </View>
        <MonoText>{JSON.stringify(item, null, 2)}</MonoText>
      </TouchableOpacity>
    );
  }

  renderContent() {
    const { albums } = this.state;

    if (albums.length === 0) {
      return (
        <View style={styles.noAlbums}>
          <Text>
            {'You don\'t have any media albums! You can create one from asset details screen.'}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={albums}
        numColumns={1}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderItem}
      />
    );
  }

  renderSmartAlbumsToggle() {
    return (
      <View style={styles.includeSmartAlbumsRow}>
        <Text style={styles.includeSmartAlbumsTitle}>Include smart albums</Text>
        <Switch
          value={this.state.includeSmartAlbums}
          onValueChange={() =>
            this.setState(state => ({ includeSmartAlbums: !state.includeSmartAlbums }))
          }
        />
      </View>
    );
  }

  render() {
    return (
      <View style={styles.fill}>
        {Platform.OS === 'ios' && this.renderSmartAlbumsToggle()}
        {this.renderContent()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  includeSmartAlbumsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  includeSmartAlbumsTitle: { flex: 1, fontSize: 16 },
  album: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'gray',
  },
  albumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noAlbums: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
