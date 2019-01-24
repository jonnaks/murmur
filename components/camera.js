import React from 'react';
import { Text, View, TouchableOpacity, Image, CameraRoll, PixelRatio, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera, Permissions, ImagePicker, ScrollView, LinearGradient, takeSnapshotAsync } from 'expo';
import { filter} from 'lodash'
import { Button } from 'react-native-elements';
import { loadingQuotes } from '../assets/loadingQuotes';
const Clarifai = require('clarifai');

export default class CameraEx extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    cameraIsRecording:false,
    bcolor: "red",
    imageUri: "",
    quote: "",
    loading: false,
    loadingQuote: "",
    loadingQuoteTimeout: null,
    loadingQuoteSequence: [0,1,2,3,4],
    loadingQuoteIndex: 0
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

  setLoadingQuoteTimout() {
    this.setState({loadingQuoteSequence: this.shuffle(Array.from(Array(loadingQuotes.length).keys()))});
    this.setState({loadingQuotesIndex: 0});
    const timeout = setInterval(() => {
      if(this.state.loadingQuoteIndex < (loadingQuotes.length - 1)) {
        this.setState({loadingQuoteIndex: (this.state.loadingQuoteIndex + 1)});
      }
      const loadingQuote = this.getLoadingQuote(this.state.loadingQuoteSequence[this.state.loadingQuoteIndex]);
      console.log(loadingQuote);
      console.log(this.state.loadingQuoteSequence[this.state.loadingQuoteIndex]);
      console.log(this.state.loadingQuoteIndex);
      console.log(loadingQuotes);
      this.setState({loadingQuote: loadingQuote})
    }, 2000);
    this.setState({loadingQuoteTimeout: timeout});
  }
  destroyLoadingQuoteTimeout() {
    clearInterval(this.state.loadingQuoteTimeout);
    this.setState({loadingQuoteTimeout: null});
    this.setState({loadingQuoteSequence: this.shuffle(Array.from(Array(loadingQuotes.length).keys()))});
    this.setState({loadingQuotesIndex: 0});
    this.setState({loadingQuote: ""});
  }

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  takeFilm(){
    if (this.camera){
      this.setState({ loading: true });
      this.setLoadingQuoteTimout();
      this.camera.takePictureAsync({ base64: true }).then(data => {
      let self = this;

      // Instantiate a new Clarifai app by passing in your API key.
      const app = new Clarifai.App({apiKey: 'e24a91041aae4be2bb0876443bdbec6f'});

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
              self.destroyLoadingQuoteTimeout();
            })
            .catch(error => console.error("Error3", error));
          } else {
            self.setState({ loading: false });
            self.destroyLoadingQuoteTimeout();
          }

        })
        .catch(err => {
          console.log("ERR2", JSON.stringify(err));
          this.setState({loading: false});
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
        result: "file",
        height: pixels,
        width: pixels,
        quality: 1,
        format: "png",
      });            
      if(result){
        CameraRoll.saveToCameraRoll(result);
      }
    }
  };

  retakePhoto() {
    this.setState({ imageUri: "" });
  }

  getLoadingQuote(index) {
    return loadingQuotes[index];
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
            (this.state.loading) ?
            <Camera ref={ref=> this.camera = ref } style={{ width: "100%", height:"95%" }} type={this.state.type}>
              <LinearGradient
              colors={['transparent', 'rgba(148,75,187, 0.3)', 'rgba(148,75,187, 0.7)', 'rgba(148,75,187, 1)']}
              style={{height:"50%", width:"100%", position:"absolute", bottom:"0%"}}>
              </LinearGradient>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#ffffff" />
                <View style={{height:"20%", width:"100%", position:"absolute", bottom:"0%", flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{color:"white", opacity:1, fontSize:15}}>{ this.state.loadingQuote }</Text>
                </View>
              </View>
            </Camera> :
            <View>
              <View ref={ref=> this.photo = ref } style={{ width: "100%", height:"95%" }}>
                <Image source={{ uri: this.state.imageUri }}
                  style={{
                    height:"100%",
                    width:"100%"}}>
                </Image>
                <View style={{height:"auto", width:"100%", position:"absolute", bottom:"20%", marginLeft:"5%", marginRight:"20%", paddingRight:"5%", paddingLeft:"5%", paddingTop:"3%", paddingBottom:"3%", backgroundColor:"black",opacity:0.7, borderRadius:40}}>
                  <Text style={{color:"white", opacity:1, fontSize:15}}>{this.state.quote}</Text>
                </View>
              </View>
              <TouchableOpacity
                  style={[styles.button, {bottom:"14%"}]}
                  onPress={() => {
                    this.retakePhoto();
                  }}>
                  <Text
                    style={{ fontSize: 18, color: 'white', flex: 1,
                    margin:"8%" }}>
                    {' '}Retake photo{' '}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    this.takeSnapshot();
                  }}>
                  <Text
                    style={{ fontSize: 18, color: 'white', flex: 1,
                    margin:"8%" }}>
                    {' '}Save photo{' '}
                  </Text>
                </TouchableOpacity>
              </View>
          }
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  button: {
    width:"20%",
    height:"10%",
    alignSelf: 'flex-end',
    alignItems: 'center',
    width:"60%",
    borderColor:"white",
    borderWidth: 1,
    borderRadius: 50,
    position:"absolute",
    bottom:"2%",
    left:"20%"
  }
});
