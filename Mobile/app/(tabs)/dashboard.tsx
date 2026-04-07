import {Text,StyleSheet, ImageBackground} from "react-native";
import {Button} from "react-native-paper"
import { router } from "expo-router";

export default function DashBoard(){
    return(
       <ImageBackground 
       source={require("../../assets/images/mibribackground.jpg")}
       style={style.wholescreen}
       resizeMode="cover">
       <Text style={style.title}>MIBRI</Text>
       <Button mode="contained" style={style.button} 
                contentStyle={style.buttontext} 
                labelStyle={style.buttonLabel} onPress={()=>router.push("")}>Upload Resume</Button>
       </ImageBackground>
    );
}

const style=StyleSheet.create({
       title:{
        position:"absolute",
        top:100,
        fontWeight:"bold",
        fontSize:40,
        color:"#ffff00",
       },

       button:{
        borderRadius:30,
        width:250,  
        backgroundColor:"#ffff00",
       },

       buttontext:{
        height:60,
        justifyContent:"center",
       },

       buttonLabel:{
          fontWeight:"bold",
          fontSize:20,
        color:"#ffffff",
       },

        wholescreen:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
    },
})