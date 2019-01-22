import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Camera, Permissions } from 'expo';

export default class CameraEx extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    cameraIsRecording:false,
    bcolor: "red",
  };

  async componentDidMount() {
    const {status} = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
    if (status === 'granted'){
      let audioResponse = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      if (audioResponse.status == 'granted'){
        this.setState({ permissionsGranted: true });
      }
    }  
  }; 
  
  takeFilm(){    
    if (this.camera){
      this.camera.recordAsync().then(data => alert("DONE"));
    }    
  };

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <Text>No access to camera, null</Text>;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ backgroundColor:"red", width:"100%"}}>
          <Camera ref={ref=> this.camera = ref } style={{ width: "100%", height:"100%" }} type={this.state.type}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                borderColor:"red",
              }}>
              <TouchableOpacity
                style={{
                  width:"20%",
                  height:"20%",
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  color: 'black'
                }}
                onPress={() => {
                  this.setState({
                    type: this.state.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back,
                  });
                }}>
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  {' '}Flip{' '}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width:"20%",
                  height:"20%",
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  backgroundColor:this.state.bcolor, 
                }}
                onPress={() => {
                  const quality = Camera.Constants.VideoQuality['720p']
                  if(this.state.cameraIsRecording){
                    this.setState({cameraIsRecording:false, bcolor:"red"})
                    this.camera.stopRecording();
                  }
                  else{
                    this.setState({cameraIsRecording:true, bcolor:"green"})
                    this.takeFilm();
                  }
                  // Camera.recordAsync();
                }}>
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  {' '}Record{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  cameraViewer: {
    alignSelf: 'stretch'
  }
});
