import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import { InputControl } from "./InputControl";


class GuildPlugin {

    constructor() {

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

    postToGuild(guildName, userId) {

    }

    getGuildSnapshot(guildId) {
        var that = this;
        let ref = firebase.database().ref('mothership/guilds/guild-' + guildId + '/chat/textarea');
        return ref.once('value').then(function(snapshot) {
            console.log("global snapshot: ", snapshot.val());
            that.inputControl.updateChatArea(snapshot.val());
        });
    }

    /**
     *
     *
     * @memberof GameChat
     */
    persistentGuildListener(guildId) {
        var that = this;
        let ref = firebase.database().ref('mothership/guilds/guild-' + guildId + '/chat/textarea');
        ref.on('value', function(snapshot) {
            console.log("updates received: ", snapshot.val());
            that.inputControl.updateChatArea(snapshot.val());
        });
    }
}