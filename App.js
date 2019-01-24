import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { SplashScreen } from 'expo';
import Main from './components/main';

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
  };
  componentDidMount() {
    this._loadAsync();
  }
  _loadAsync = async () => {
    try {
      await this._loadResourcesAsync();
    } catch (e) {
      this._handleLoadingError(e);
    } finally {
      this._handleFinishLoading();
    }
  };
  _loadResourcesAsync(){
    // TODO set resources we try to load
    /*return Promise.all([
      Asset.loadAsync([
        require('./assets/images/murmur.png'),
      ]),
      Font.loadAsync({
        ...Icon.Ionicons.font,
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);*/
    setTimeout(function(){ return; }, 3000);
  };
  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
  render() {
    if (this.state.isLoadingComplete) {
    return (
      <View style={styles.container}>
        <Main />
      </View>
    );
    }else{
      return <View>
        <Image
        source={{uri: './assets/murmur-splash.gif'}}/>
      </View>
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '#944bbb',
    paddingVertical: 34
  }
});
