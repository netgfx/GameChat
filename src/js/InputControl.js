import _ from "lodash";
import filter from "profanity-filter";

export class InputControl {


    constructor(gameChat) {

        this.gameChat = gameChat;
        this.gameChat.attachInputControl(this);
        this.score = 0;
        this.penalty = 200; // Penalty can be fine-tuned.
        this.lastact = new Date();
        this.globalList = [];
        this.whisperList = [];
        this.state = {
            channel: "global",
            whisperTarget: null
        };
        ///
        filter.setReplacementMethod('stars');
        filter.seed('profanity');
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

                this.score = (this.score < 0) ? 0 : this.score;

                var elem = document.getElementById("chatarea");
                // flood control //
                if ((this.score += this.penalty) < 1000) {
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

                    if (txtbox.value.indexOf("/a") !== -1 && this.state.channel !== "global") {
                        this.setChannel("global");
                        txtbox.value = "";
                        return;
                    }

                    if (txtbox.value.indexOf("/w") !== -1 || this.state.channel === "whisper") {
                        if (txtbox.value.indexOf("/w") !== -1) {
                            console.log("initial whisper");
                            let valueSplit = txtbox.value.split(" ");
                            let values = [];
                            for (var i = 2; i < valueSplit.length; i++) {
                                values.push(valueSplit[i]);
                            }

                            let text = _.join(_.flatten(values), " "); //txtbox.value.split(", ")[1];
                            let name = this.state.whisperTarget === null ? valueSplit[1] : this.state.whisperTarget;
                            let renderHTML = this.getHtmlToRender("whisper-out", text);
                            this.gameChat.sendWhisper(name, renderHTML);
                            txtbox.value = "";
                            this.setChannel("whisper", name);
                            return;
                        } else {
                            console.log("send to saved: ", this.state.whisperTarget);
                            let renderHTML = this.getHtmlToRender("whisper-out", txtbox.value);
                            this.gameChat.sendWhisper(this.state.whisperTarget, renderHTML);
                            txtbox.value = "";
                            this.setChannel("whisper", name);
                            return;
                        }
                    }

                    /* The smaller the distance, more time has to pass in order
                     * to negate the score penalty cause{d,s}.
                     */
                    this.score -= (new Date() - this.lastact) * 0.05;

                    console.log(this.score);
                    // Score shouldn't be less than zero.

                    let renderHTML = this.getHtmlToRender("default", txtbox.value);
                    this.gameChat.sendDataToGlobal(renderHTML);
                    //elem.innerHTML += renderHTML; // to show it locally only
                    txtbox.value = "";
                    this.setChannel("global");
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

        let renderHTML;
        if (type !== "error") {
            var prom = this.splitInput(value, type);
            // TODO: the rest of the FN should wait for the sorting to end, promise (?)
            prom.then((finalStr) => {
                var elem = document.getElementById("chatarea");

                if (addOnly == true && type === "whisper") {
                    renderHTML = this.getHtmlToRender("whisper-in", finalStr); //value.replace(/\|\|\|/gi, ""));
                    elem.innerHTML = renderHTML;
                } else if (addOnly === null && type !== undefined && type !== null) {
                    renderHTML = this.getHtmlToRender(type, finalStr); //value.replace(/\|\|\|/gi, ""));
                    elem.innerHTML = renderHTML;
                } else {
                    renderHTML = this.getHtmlToRender("default", finalStr); //value.replace(/\|\|\|/gi, ""));
                    elem.innerHTML = renderHTML;
                }
                this.scrollToBottom();
            }).catch(err => {
                console.log("ERROR: ", err);
            });
        } else {
            renderHTML = this.getHtmlToRender("error", value); //value.replace(/\|\|\|/gi, ""));
            elem.innerHTML += renderHTML;
        }
    }

    /**
     *
     *
     * @param {*} values
     * @memberof InputControl
     */
    splitInput(values, type) {

        var that = this;
        let parseProm = new Promise((resolve, reject) => {
            let splitResult = values.split("|||");
            this.finalList = [];
            if (type === "global") {
                this.globalList = splitResult;
                this.finalList = splitResult.concat(this.whisperList);
            } else if (type === "whisper") {
                this.whisperList = splitResult;
                this.finalList = splitResult.concat(this.globalList);
            }

            var domElem;
            var elementsObject = [];
            // convert to html //
            this.finalList.forEach(elem => {
                domElem = that.stringToDiv(elem, type);
                if (domElem !== false && domElem !== null && domElem !== undefined) {
                    var _timestamp = domElem.dataset.timestamp;
                    elementsObject.push({
                        elem: domElem,
                        timestamp: _timestamp
                    });
                }
            });

            // sort by timestamp //

            var sortedArr = elementsObject.sort((item1, item2) => {
                return item1.timestamp - item2.timestamp;
            });

            let finalStr = "";
            sortedArr.forEach(item => {
                finalStr += item.elem.outerHTML;
            });

            resolve(finalStr);
        });

        return parseProm;
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
        if (type === "default" || type === undefined) {
            return "<div>" + filter.clean(text) + "</div>";
        } else if (type === "error") {
            return "<section><div style='color:red !Important;'>" + text + "</div></section>";
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
     * @param {*} str
     * @returns
     * @memberof InputControl
     */
    stringToDiv(str) {
        if (str === null || str === undefined || str === "") {
            return false;
        }

        var htmlObject = document.createElement('div');
        htmlObject.innerHTML = str;
        // detect type //
        let type = "";
        if (str.indexOf("global") !== -1) {
            type = "global";
        } else if (str.indexOf("whisper") !== -1) {
            type = "whisper";
        }

        let result = htmlObject.querySelector('.' + type);

        return result;
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

    /**
     *
     *
     * @param {*} type
     * @memberof InputControl
     */
    setChannel(type, target) {
        this.state.channel = type;
        this.state.whisperTarget = target !== undefined ? target : null;
        let channelLabel = document.getElementById("channeltag");
        if (type == "whisper") {
            channelLabel.innerHTML = "<div class='inner-tag'>[Whisper]:</div>";
        } else if (type === "global") {
            channelLabel.innerHTML = "<div class='inner-tag'>[Global]:</div>";
        } else if (type === "guild") {
            channelLabel.innerHTML = "<div class='inner-tag guild-tag'>[Guild]:</div>";
        }
    }
}