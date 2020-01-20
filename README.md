# GameChat
A simple yet powerful chat for your games, using Firebase

## Install

`npm install`

```
We use parcel to compile the code so be sure to have Parcel installed https://parceljs.org/ 

npm install -g parcel-bundler
```

Then simply run: 

```
parcel ./src/index.html --open
```

- To login or create a user, type on the chat input: 
    
    -  `u: <username>, p: <password>` 

- To send a whisper type: 

    - `/w <name-to-send-to> <message>`


## Guilds

- How to register a guild
    
    - `node GuildFunctions.js g_make <guildname>`

- How to add a member to a guild

    - `node GuildFunctions.js g_add_member <member-name>`

- How to remove a guild

    - `node GuildFunctions.js g_remove <guildname>`
 