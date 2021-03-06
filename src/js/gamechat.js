import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import { InputControl } from "./InputControl";

export class GameChat {
    //

    constructor() {
        // initialize variables //
        this.database = firebase.database();

        // autologin existing user //
        let credentials = this.getLocalUser();
        console.log(credentials);
        if (credentials !== null) {
            credentials = JSON.parse(credentials);
            this.loginUser(credentials.username, credentials.password);
        }
    }

    /**
     * Externally add an input control
     *
     * @param {*} inputControl
     * @memberof GameChat
     */
    attachInputControl(inputControl) {
        this.inputControl = inputControl;
    }

    /**
     *
     *
     * @param {*} username
     * @param {*} password
     * @memberof GameChat
     */
    createUser(username, password) {
        let that = this;

        // try to login first //
        this.loginUser(username, password, (error) => {
            // if user doesn't exist //
            firebase.auth().createUserWithEmailAndPassword(username, password).then(result => {
                that.saveUserLocally(username, password);
                that.addMemberToGlobal(result.user);
            }).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log("ERROR Creating user: ", error);
                // ...
            });
        });
    }

    /**
     *
     *
     * @param {*} userObj
     * @memberof GameChat
     */
    addMemberToGlobal(userObj) {
        let that = this;
        let userId = userObj.uid;
        let name = userObj.email.split("@")[0]; // probably need a nickname here
        let lives = "global";

        firebase.database().ref('mothership/global/members/' + userId).set({
            name: name,
            id: userId,
            lives: lives,
            inbox: ""
        }, result => {
            console.log("member added: ", result);
            that.readGlobalDataOnce();
            that.readWhisperDataOnce();
            that.persistentGlobalListener();
            that.persistentInboxListener();
            that.inputControl.registerStyleForId(that.getUser().uid);
        });
    }

    /**
     *
     *
     * @memberof GameChat
     */
    getUser() {
        var user = firebase.auth().currentUser;

        if (user) {
            // User is signed in.
            return user;
        } else {
            // No user is signed in.
            return false;
        }
    }

    /**
     *
     *
     * @memberof GameChat
     */
    getUserByName(name, callback) {
        var ref = firebase.database().ref('mothership/global/members').orderByChild("name").equalTo(name);

        ref.once('value').then(function(snapshot) {
            console.log("user found: ", snapshot.val(), snapshot.val().id);
            let userObj = {};
            let object = snapshot.val();
            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    userObj = object[key];
                }
            }

            if (callback) {
                console.log(userObj);
                callback(userObj);
            }
        });
    }

    /**
     *
     *
     * @param {*} id
     * @param {*} callback
     * @memberof GameChat
     */
    getUserById(id, callback) {
        var ref = firebase.database().ref('mothership/global/members').orderByChild("id").equalTo(id);

        ref.once('value').then(function(snapshot) {
            console.log("user found: ", snapshot.val(), snapshot.val().id);
            let userObj = {};
            let object = snapshot.val();
            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    userObj = object[key];
                }
            }

            if (callback) {
                console.log(userObj);
                callback(userObj);
            }
        });
    }

    /**
     *
     *
     * @param {*} text
     * @memberof GameChat
     */
    sendWhisper(name, text) {
        // TODO: send a copy to sender -> to info: ... 
        let currentUser = this.getUser();
        this.getUserByName(name, (userObj) => {
            let userId = userObj.id;
            let timestamp = new Date().getTime();
            let finalText = "<section data-timestamp='" + timestamp + "' class='whisper'><span class='" + currentUser.uid + "'>" + currentUser.email.split("@")[0] + ": </span>" + text + "</section>|||";
            let postRef = firebase.database().ref('mothership/global/members/' + userId + "/inbox");
            postRef.transaction(function(post) {
                if (post) {
                    console.log(post);
                    post += finalText;
                } else {
                    post = "";
                    post += finalText;
                }
                return post;
            }, result => {
                console.log("transaction ended: ", result);
            });
        });

        this.sendWhisperToSelf(name, text);
    }

    /**
     *
     *
     * @param {*} text
     * @memberof GameChat
     */
    sendWhisperToSelf(sendUser, text) {
        // TODO: send a copy to sender -> to info: ... 
        let currentUser = this.getUser();
        this.getUserByName(currentUser.email.split("@")[0], (userObj) => {
            let userId = userObj.id;
            let timestamp = new Date().getTime();
            let finalText = "<section data-timestamp='" + timestamp + "' class='whisper'><span class='" + currentUser.uid + "'>To " + sendUser + ": </span>" + text + "</section>|||";
            let postRef = firebase.database().ref('mothership/global/members/' + userId + "/inbox");
            postRef.transaction(function(post) {
                if (post) {
                    console.log(post);
                    post += finalText;
                } else {
                    post = "";
                    post += finalText;
                }
                return post;
            }, result => {
                console.log("transaction ended: ", result);
            });
        });
    }

    /**
     *
     *
     * @param {*} username
     * @param {*} password
     * @memberof GameChat
     */
    loginUser(username, password, errorCallback) {
        let that = this;
        firebase.auth().signInWithEmailAndPassword(username, password).then(result => {
            that.readGlobalDataOnce();
            that.readWhisperDataOnce();
            that.persistentGlobalListener();
            that.persistentInboxListener();
            that.inputControl.registerStyleForId(that.getUser().uid);
            that.saveUserLocally(username, password);
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode, errorMessage, error);
            errorCallback(error);
            // ...
        });
    }

    /**
     *   
     *
     * @memberof GameChat
     */
    signOut() {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
        }).catch(function(error) {
            // An error happened.
        });
    }

    /////////////// CHAT OPERATIONS /////////////////////////

    /**
     *
     *
     * @param {*} text
     * @param {*} uid
     * @memberof GameChat
     */
    sendDataToGlobal(text, uid) {
        let user = this.getUser();
        if (user) {
            this.getUserById(user.uid, (userObj) => {
                let timestamp = new Date().getTime();
                let finalText = "<section data-timestamp='" + timestamp + "' class='global'><span class='" + user.uid + " " + userObj.lives + "'>" + user.email.split("@")[0] + ": </span>" + text + "</section>|||";
                let postRef = firebase.database().ref('mothership/global/chat/textarea');
                postRef.transaction(function(post) {
                    if (post) {
                        post += finalText;
                    } else {
                        post = "";
                        post += finalText;
                    }
                    return post;
                }, result => {
                    console.log("transaction ended: ", result);
                });
            });
        } else {
            console.log("unauthorized, please login first");
            this.inputControl.updateChatArea("Unauthorized, please login first", null, "error");
        }

    }

    /**
     *
     *
     * @returns
     * @memberof GameChat
     */
    readGlobalDataOnce() {
        var that = this;
        let ref = firebase.database().ref('mothership/global/chat/textarea');
        return ref.once('value').then(function(snapshot) {
            that.inputControl.updateChatArea(snapshot.val(), false, "global");
        });
    }

    /**
     *
     *
     * @returns
     * @memberof GameChat
     */
    readWhisperDataOnce() {
        var that = this;
        let user = this.getUser();
        let ref = firebase.database().ref('mothership/global/members/' + user.uid + "/inbox");
        return ref.once('value').then(function(snapshot) {
            that.inputControl.updateChatArea(snapshot.val(), false, "whisper");
        });
    }

    /**
     *
     *
     * @memberof GameChat
     */
    persistentGlobalListener() {
        var that = this;
        let ref = firebase.database().ref('mothership/global/chat/textarea');
        ref.on('value', function(snapshot) {
            that.inputControl.updateChatArea(snapshot.val(), false, "global");
        });
    }

    /**
     *
     *
     * @memberof GameChat
     */
    persistentInboxListener() {
        var that = this;
        let user = this.getUser();
        let ref = firebase.database().ref('mothership/global/members/' + user.uid + "/inbox");
        ref.on('value', function(snapshot) {
            that.inputControl.updateChatArea(snapshot.val(), true, "whisper");
        });
    }

    removeGlobalListener() {
        let ref = firebase.database().ref('mothership/global/chat/textarea');
        ref.off();
    }


    /////////////////////// UTILS ///////////////////////////
    /////////////////////////////////////////////////////////'

    /**
     *
     *
     * @param {*} username
     * @param {*} password
     * @memberof GameChat
     */
    saveUserLocally(username, password) {
        let obj = {
            username: username,
            password: password
        };
        let path = 'gamechat-user';
        localStorage.setItem(path, JSON.stringify(obj));
    }

    /**
     *
     *
     * @memberof GameChat
     */
    getLocalUser() {
        let _path = 'gamechat-user';

        var result = localStorage.getItem(_path);

        if (result === null || result === undefined || result === 'undefined') {
            result = null;
        } else {
            return result;
        }

        return result;
    }

    /**
     *
     *
     * @memberof GameChat
     */
    removeLocalUser() {
        let _path = 'gamechat-user';
        localStorage.removeItem(_path);
    }


}