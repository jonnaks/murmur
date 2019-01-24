import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// import { Button } from 'react-native-elements';
// import Icon from 'react-native-vector-icons/FontAwesome';



export default class Functionality extends React.Component {
  render() {
    return (
      <View>
        {/* <Button
        style={styles.button}
        icon={
          <Icon
          style={styles.iconPlay}
          name='play'
          color="#ccc"
          size={25}/>
        }
        /> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ffff",
    height: 50,
    width: 50
  },
  iconPlay: {
  }
});