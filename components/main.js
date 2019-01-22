import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Camera from "./camera"
import Functionality from "./functionality"

export default class Main extends React.Component {
  render() {
    return (
      <View>
        <Camera />
        <Functionality />        
      </View>
    );
  }
}

