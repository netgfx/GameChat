import jQuery from "jquery";
import _ from "lodash";
import filter from "profanity-filter";

export class InputControl {


    constructor(gameChat) {

        this.gameChat = gameChat;
        this.gameChat.attachInputControl(this);
        this.score = 0;
        this.penalty = 200; // Penalty can be fine-tuned.
        this.lastact = new Date();
        ///
        filter.setReplacementMethod('stars');
        filter.seed('profanity');
        //filter.addWord('ass', 'badonkadonk');
        this.addEventListeners();
    }

    /**
     *
     *
     * @memberof InputControl
     */
    addEventListeners() {
        var txtbox = document.getElementById('chatinput');
        txtbox.onkeydown = function(e) {
            if (e.key == "Enter") {

                // check for register script //
                if (txtbox.value.indexOf("u: ") !== -1 && txtbox.value.indexOf("p: ") !== -1) {
                    // parse //
                    let splits = txtbox.value.split(",");
                    let username = splits[0].replace("u: ", "").trim();
                    let password = splits[1].replace("p: ", "").trim();

                    this.gameChat.createUser(username, password);
                    txtbox.value = "";
                    return;
                }

                if (txtbox.value.indexOf("/w") !== -1) {
                    let valueSplit = txtbox.value.split(" ");
                    let values = [];
                    for (var i = 2; i < valueSplit.length; i++) {
                        values.push(valueSplit[i]);
                    }

                    let text = _.join(_.flatten(values), " "); //txtbox.value.split(", ")[1];
                    let name = valueSplit[1];
                    console.log(text, name);
                    let renderHTML = this.getHtmlToRender("whisper-out", text);
                    console.log(renderHTML);
                    this.gameChat.sendWhisper(name, renderHTML);
                    txtbox.value = "";
                    return;
                }

                /* The smaller the distance, more time has to pass in order
                 * to negate the score penalty cause{d,s}.
                 */
                this.score -= (new Date() - this.lastact) * 0.05;

                console.log(this.score);
                // Score shouldn't be less than zero.
                this.score = (this.score < 0) ? 0 : this.score;

                var elem = document.getElementById("chatarea");

                if ((this.score += this.penalty) < 1000) {
                    let renderHTML = this.getHtmlToRender("default", txtbox.value);
                    this.gameChat.sendDataToGlobal(renderHTML);
                    //elem.innerHTML += renderHTML; // to show it locally only
                    txtbox.value = "";

                    this.scrollToBottom();

                    // reset //
                    this.lastact = new Date();
                } else {
                    console.log("too soon, please wait a little ", this.score);
                    let renderHTML = this.getHtmlToRender("error", "too much, too soon!");
                    elem.innerHTML += renderHTML;
                    txtbox.value = "";

                    this.scrollToBottom();

                    // reset //
                    this.lastact = new Date();
                }
                e.preventDefault();
            }

        }.bind(this);
    }

    /**
     *
     *
     * @param {*} value
     * @param {*} isOwn
     * @memberof InputControl
     */
    updateChatArea(value, addOnly, type) {
        this.splitInput(value);
        var elem = document.getElementById("chatarea");
        let renderHTML;
        if (addOnly) {
            renderHTML = this.getHtmlToRender("whisper-in", value.replace(/\|\|\|/gi, ""));
            elem.innerHTML += renderHTML;
        } else if (addOnly === null && type !== undefined && type !== null) {
            renderHTML = this.getHtmlToRender(type, value.replace(/\|\|\|/gi, ""));
            elem.innerHTML = renderHTML;
        } else {
            renderHTML = this.getHtmlToRender("default", value.replace(/\|\|\|/gi, ""));
            elem.innerHTML = renderHTML;
        }
        this.scrollToBottom();
    }

    splitInput(values) {
        let splitResult = values.split("|||");
        console.log(values, splitResult);
    }

    /**
     *
     *
     * @memberof InputControl
     */
    scrollToBottom() {
        const out = document.getElementById("chatarea");
        const isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;

        if (!isScrolledToBottom) {
            out.scrollTop = out.scrollHeight - out.clientHeight;
        }
    }

    /**
     *
     *
     * @param {*} type
     * @param {*} text
     * @returns
     * @memberof InputControl
     */
    getHtmlToRender(type, text) {
        console.log(type, text);
        if (type === "default" || type === undefined) {
            return "<div>" + filter.clean(text) + "</div>";
        } else if (type === "error") {
            return "<div style='color:red !Important;'>" + text + "</div>";
        } else if (type === "whisper-in") {
            return text;
        } else if (type === "whisper-out") {
            return "<div style='color:#ff3265 !important;'>" + filter.clean(text) + "</div>";
        }
    }

    /**
     *
     *
     * @param {*} str
     * @returns
     * @memberof InputControl
     */
    stringToHTML(str) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(str, 'text/html');
        return doc.body;
    }

    /**
     *
     *
     * @param {*} id
     * @memberof InputControl
     */
    registerStyleForId(id, guild) {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = '.' + id + ' { color: #21daff; }';
        document.getElementsByTagName('head')[0].appendChild(style);

        if (guild) {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = '.' + guild + ' { color: #00e50f; }';
            document.getElementsByTagName('head')[0].appendChild(style);
        }
    }
}