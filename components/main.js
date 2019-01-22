import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import CameraEx from "./camera"
import Functionality from "./functionality"

export default class Main extends React.Component {
  render() {
    return (
      <View style={{ width: "100%"}}>
        <Text style={styles.heading}>MurMur</Text>
        <CameraEx />
        {/* <Functionality />         */}
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