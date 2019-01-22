import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Camera from "./camera"
import Functionality from "./functionality"

export default class Main extends React.Component {
  render() {
    return (
      <View>
        <Text style={styles.heading}>MurMur</Text>
        <Camera />
        <Functionality />        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: "Helvetica",
    fontSize: 34,
    color: "#ffff",
    height: 50,
    textAlign: 'center',
    fontWeight: 'bold'
  }
});