const md5 = require("../../../node_modules/md5");
const _ = require("../../../node_modules/lodash");
const firebase = require("firebase/app");
const auth = require("firebase/auth");
const database = require("firebase/database");

const config = require("./config");

class GuildAdmin {

    constructor() {
        //console.log(config);
        // Initialize Firebase
        firebase.initializeApp(config);
        this.guilds = {};
    }

    /**
     *
     *
     * @memberof GuildAdmin
     */
    signIn() {
        let that = this;
        firebase.auth().signInWithEmailAndPassword(username, password).then(result => {
            that.readGlobalDataOnce();
            that.persistentGlobalListener();
            that.persistentInboxListener();
            that.inputControl.registerStyleForId(that.getUser().uid);
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
        });
    }

    /**
     *
     *
     * @param {*} guildName
     * @memberof GuildAdmin
     */
    registerGuild(guildName) {
        let that = this;
        let id = md5(guildName + _.random(1, 999999999));
        let name = guildName
        let chat = { textarea: "" };
        let members = { ref: "novalue" };

        firebase.database().ref('mothership/guilds/guild-' + id).set({
            name: name,
            id: id,
            members: members,
            chat: chat
        }, result => {
            console.log("member added: ", result);
            that.readGuildsDataOnce();
        });
    }

    /**
     *
     *
     * @returns
     * @memberof GuildAdmin
     */
    readGuildsDataOnce() {
        var that = this;
        let ref = firebase.database().ref('mothership/guilds');
        return ref.once('value').then(function(snapshot) {
            console.log("guilds snapshot: ", snapshot.val());
            that.guilds = snapshot.val();
        });
    }

    /**
     *
     *
     * @returns
     * @memberof GuildAdmin
     */
    getGuilds() {
        return this.guilds;
    }

    /**
     *
     *
     * @param {*} guildName
     * @param {*} guildId
     * @memberof GuildAdmin
     */
    deleteGuild(guildName, guildId) {

    }

    /**
     *
     *
     * @param {*} guildName
     * @param {*} userId
     * @memberof GuildAdmin
     */
    addMemberToGuild(guildName, userId) {

    }

    /**
     *
     *
     * @param {*} currentGuildName
     * @param {*} nextGuildName
     * @param {*} userId
     * @memberof GuildAdmin
     */
    moveMemberFromGuildToGuild(currentGuildName, nextGuildName, userId) {

    }

    /**
     *
     *
     * @param {*} guildName
     * @param {*} userId
     * @memberof GuildAdmin
     */
    removeMemberFromGuild(guildName, userId) {

    }
}

module.exports = GuildAdmin;