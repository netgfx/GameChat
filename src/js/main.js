import { GameChat } from "./gamechat";
import _ from "lodash";
import jQuery from "jquery";
import { InputControl } from "./InputControl";
import * as firebase from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyCM3AjiSbID3M0MljhqEdboanwDvA5MIj4",
    authDomain: "gamechat-c40e9.firebaseapp.com",
    databaseURL: "https://gamechat-c40e9.firebaseio.com",
    projectId: "gamechat-c40e9",
    storageBucket: "gamechat-c40e9.appspot.com",
    messagingSenderId: "700416370695",
    appId: "1:700416370695:web:f554dd39966d2fcea0a2a2"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

(function() {

    function init() {

        var gameChat = new GameChat();
        console.log("game chat started...");
        var inputControl = new InputControl(gameChat);
        console.log(inputControl);


    }


    init();

})();