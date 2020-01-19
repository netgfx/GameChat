import { GameChat } from "./gamechat";
import _ from "lodash";
import jQuery from "jquery";
import { InputControl } from "./InputControl";
import * as firebase from "firebase/app";
import { firebaseConfig } from "./const";

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