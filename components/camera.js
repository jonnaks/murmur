import React from 'react';
import { Text, View, TouchableOpacity, Image, CameraRoll, PixelRatio } from 'react-native';
import { Camera, Permissions, ImagePicker, ScrollView, LinearGradient } from 'expo';
import { filter} from 'lodash'
import { Button } from 'react-native-elements';
const Clarifai = require('clarifai');

export default class CameraEx extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    cameraIsRecording:false,
    bcolor: "red",
    imageUri: "",
    quote: "",
    loading: false
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    const { statusCamera } = await Permissions.askAsync(Permissions.CAMERA_ROLL);  
    if (status === 'granted' && statusCamera === 'granted'){
      this.setState({ hasCameraPermission: status === 'granted' });
    } else {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      const { statusCamera } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      this.setState({ hasCameraPermission: status === 'granted' });
    }
  }; 
  postData() {
    const url = "https://forismatic.com/api/1.0/"
    let formData = new FormData();
    formData.append('method', 'getQuote');
    formData.append('format', 'json');
    formData.append('param', 'ms');
    formData.append('lang', 'en');
    return fetch(url, {
        method: "POST",
        mode: "cors", 
        body: formData, 
    })
    .then(response => {
      return response.json();
    });
  };

  getData() {
    categoryArr = [1, 2 ,7];
    console.log(categoryArr[Math.floor(Math.random() * categoryArr.length)].toString());
    return fetch("https://api.thecatapi.com/v1/images/search?category_ids=" +  categoryArr[Math.floor(Math.random() * categoryArr.length)].toString() , {
        method: "GET",
        mode: "cors",
    })
    .then(response => {
      return response;
    });
  };
  
  takeFilm(){    
    if (this.camera){
      this.setState({ loading: true });
      this.camera.takePictureAsync({ base64: true }).then(data => {
      let self = this;
      
      // Instantiate a new Clarifai app by passing in your API key.
      const app = new Clarifai.App({apiKey: '4e0cbc5cea174b859b3daa4de3dcf47c'});

      this.setState({ imageUri: data.uri });

      // Get quote
      this.postData()
        .then(json => {
          self.setState({ quote: json["quoteText"] });
        })
        .catch(error => console.error("Error1", error));

      // Check if cat exist in pic
      app.models.predict(Clarifai.GENERAL_MODEL, {base64: data.base64})
        .then(response => {
          const cat = filter(response["outputs"][0]["data"]["concepts"], (obj) => {
            return obj.name === "cat"
          })
          // No cat detected, get cat picture
          if(!cat.length){
            this.getData()
            .then(json => {
              const res = JSON.parse(json["_bodyInit"])
              self.setState({ imageUri: res[0]["url"] });
              self.setState({ loading: false });
            })
            .catch(error => console.error("Error3", error));
          } else {
            self.setState({ loading: false });
          }
           
        })
        .catch(err => {
          console.log("ERR2", err.status)
        });
        
      });
    }    
  };

  async takeSnapshot() {
    const targetPixelCount = 1080; // If you want full HD pictures
    const pixelRatio = PixelRatio.get();
    const pixels = targetPixelCount / pixelRatio;
    if(this.photo) {
      const result = await takeSnapshotAsync(this.photo, {
        result: 'file',
        height: pixels,
        width: pixels,
        quality: 1,
        format: 'png',
      });
      console.log("Result", result);
    }
  };

  retakePhoto() {
    this.setState({ imageUri: "" });
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <Text>No access to camera, null</Text>;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ backgroundColor:"transperant", width:"100%"}}>
          { (!this.state.imageUri) ?           
            <Camera ref={ref=> this.camera = ref } style={{ width: "100%", height:"95%" }} type={this.state.type}>
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
                    alignSelf: 'flex-start',
                    alignItems: 'center',
                    marginTop:"5%",
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
                <LinearGradient  
                colors={['transparent', 'rgba(148,75,187, 0.3)', 'rgba(148,75,187, 0.7)', 'rgba(148,75,187, 1)']}
                style={{height:"50%", width:"100%", position:"absolute", bottom:"0%"}}>
                  <TouchableOpacity
                    style={{
                      width:"20%",
                      height:"20%",
                      alignSelf: 'flex-end',
                      alignItems: 'center',
                      width:"60%",
                      borderColor:"white",
                      borderWidth: 1,
                      borderRadius: 50,
                      position:"absolute",
                      bottom:"5%",
                      left:"20%"
                    }}
                    onPress={() => {
                      this.takeFilm();
                    }}>
                  <Text
                    style={{ fontSize: 18, color: 'white', flex: 1,
                    margin:"8%"}}>
                    {' '}Take photo{' '}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
              </View>
              
            </Camera> : 
            (this.state.loading) ? null : 
            <View ref={ref=> this.photo = ref } style={{ width: "100%", height:"95%" }}>
              <Image source={{ uri: this.state.imageUri }} 
                style={{
                  height:"100%",
                  width:"100%"}}>
              </Image>
              <View style={{height:"auto", width:"100%", position:"absolute", bottom:"20%", marginLeft:"5%", marginRight:"20%", paddingRight:"5%", paddingLeft:"5%", paddingTop:"3%", paddingBottom:"3%", backgroundColor:"black",opacity:0.7, borderRadius:40}}>
                <Text style={{color:"white", opacity:1, fontSize:15}}>{this.state.quote}</Text>
              </View>
              
              <TouchableOpacity
                  style={{
                    width:"20%",
                    height:"10%",
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                    width:"60%",
                    borderColor:"white",
                    borderWidth: 1,
                    borderRadius: 50,
                    position:"absolute",
                    bottom:"5%",
                    left:"20%"
                  }}
                  onPress={() => {
                    this.retakePhoto();
                  }}>
                  <Text
                    style={{ fontSize: 18, color: 'white', flex: 1,
                    margin:"8%" }}>
                    {' '}Retake photo{' '}
                  </Text>
                </TouchableOpacity>
            </View>
          }
        </View>
      );
    }
  }
}

