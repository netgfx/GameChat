// admin plugin to manage guilds //
const GuildAdmin = require("./GuildAdmin");


var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);
let guildAdmin = new GuildAdmin();

switch (myArgs[0]) {
    case 'g_make':
        console.log("making guild: ", myArgs[1]);
        guildAdmin.registerGuild(myArgs[1]);
        break;
    case 'g_remove':
        console.log("removing guild: ", myArgs[1]);
        guildAdmin.deleteGuild(myArgs[1]);
        break;
    case "g_add_member":
        console.log("adding a member to guild: ", myArgs[1]);
        guildAdmin.addMemberToGuild(myArgs[1], myArgs[2]);
        break;
    default:
        console.log('Sorry, that is not something I know how to do.');
}