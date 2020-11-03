// Calling the package
`use strict`;
const Discord = require('discord.js');
const bot = new Discord.Client({disableEveryone: false});
const fs = require('fs');
const moment = require('moment'); // the moment package. to make this work u need to run "npm install moment --save 
const ms = require("ms"); // npm install ms -s
const { start } = require('repl');



// Listener Event: Bot Launched

  // REACTION STUFF
  let channel_id = "759070780000305183"; 
  let message_id = "770002153824845844";
  //REACTION STUFF

bot.on('ready', async () => {
    console.log('Bot is running') // Runs when the bot is launched
    
    const botchat = bot.channels.get("762666208121061386")
    botchat.send(`https://cdn.discordapp.com/attachments/759758089691201536/760482542901002271/iu.png`)
  
    bot.user.setActivity("Being Sus | prefix `" , {
      type: "PLAYING"
    })


    bot.channels.get(channel_id).fetchMessage(message_id).then(m => {
      console.log("Cached reaction message.");
    }).catch(e => {
      console.error("Error loading message.");
      console.error(e);
    });
});


// event listener: reaction
bot.on("messageReactionAdd", async (msgreaction, user) => {
  if(msgreaction.emoji.id == "agree" && msgreaction.message.id === message_id) {
          msgreaction.fetchMember(user) // fetch the user that reacted
              .then((user) => {
                  let Buds = msgreaction.guild.roles.find(role => role.name === "Buds");
                  user.addRole(Buds)
                  .then(() => {
                      console.log(`Added the Buds role to ${user.nickname}`);

                      const logchat = bot.channels.get("762666208121061386")
                      logchat.send(`Added the Buds role to ${user.nickname}`);
                  });
              });
  }

  if(msgreaction.emoji.id == "disagree" && msgreaction.message.id === message_id) {
    bot.fetchMember(user) // fetch the user that reacted
              .then((user) => {
                user.kick("Disagreed to the rules.").then(() => {
                    console.log(`Kicked ${user.nickname}`);
                    const logchat = bot.channels.get("762666208121061386")
                    logchat.send(`Kicked ${user.nickname} \nReason: Disagreed to the rules.`);
                });
              })
  }
});


// event listener: new guild members
bot.on('guildMemberAdd', async member => {
  const botchat = bot.channels.get("762666208121061386")
  botchat.send(`${member} joined.`)

  let inP = member.guild.roles.get("772807965576134667");
  let m = await member.addRole(inP);

  let Unick = member.guild.members.get(member.nickname)
  member.guild.members.get(member.id)
    .createDM()
      .then(dm => {
        dm.send(`Welcome ${Unick} to the server, we hope you have a great stay! Lets settle things up for you. But first..
           \n\n#welcome-rules \n https://cdn.discordapp.com/attachments/762666208121061386/773173344471220284/tenor.gif`).catch(err => console.log(err))
        });
    
});


// event listener: member remove
let Hrole = Discord.GuildMember.highestRole;
bot.on('guildMemberRemove', async member => {
  const botchat = bot.channels.get("762666208121061386")
    botchat.send(`${member} (${Hrole}) left.`)
});


//event listener: join/leave a voice channel
bot.on('voiceStateUpdate', async (oldMember, newMember) => {
  let newUserChannel = newMember.voiceChannel
  let oldUserChannel = oldMember.voiceChannel
  let VC = newMember.guild.roles.get("772813475231039488");

  if(oldUserChannel === undefined && newUserChannel !== undefined) { // User Joins a voice channel
    newMember.addRole(VC).catch(console.error);
  } else if(newUserChannel === undefined) { // User leaves a voice channel
    newMember.removeRole(VC).catch(console.error);
  }
});


// Event listener: Message Received ( This will run every time a message is received)
bot.on('message', async message => {

    // Variables
    let prefix = '`'
    let msg = message.content.toLowerCase();
    let sender = message.author;
    let nick = sender.username;
    let logchannel = bot.channels.get("762666208121061386");
    if (bot.user.id === sender.id) {return};
    let Staff = message.guild.roles.find(x => x.name === "Guards");

    // DM forward

    /*if (message.channel.type == "dm") {

      let DMembed = new Discord.RichEmbed()
        .setDescription("DM Message")
        .setColor(0xe0782b)
        .setThumbnail(sender.displayAvatarURL)
        .addField("Username", nick)
        .addField("Sent at:", message.createdAt)

        message.logchannel.send(DMembed)
  };*/


    //
    // ADMIN commands
    //

    // Ping / Pong command
    if (msg === prefix + 'ping') {
      if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {
        message.channel.startTyping(500)
        let m = await message.channel.send("Pong.");
        m.edit(`Latency: ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`)
        let m15 = message.channel.stopTyping(true)
      } else {return}
    };
    

    // poll
    if (msg.startsWith("poll:")) {
        if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {
              let m = await message.react("👍")
              let m2 = await message.react("👎")
            } else {return};
    };


    // bot info command
    if (msg === prefix + "botinfo") {

      message.channel.startTyping(500)
        let botembed = new Discord.RichEmbed()
        .setDescription("Bot Information")
        .setColor(0x15f153)
        .setThumbnail(bot.user.displayAvatarURL)
        .addField("Bot Name", bot.user.username)
        .addField("Created At", bot.user.createdAt)

        message.channel.send(botembed)
        message.channel.stopTyping(true)
    };


    // serverinfo command
    if (msg === prefix + "serverinfo") {
  
        if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {
          message.channel.startTyping(500)
          
          let serverembed = new Discord.RichEmbed()
          .setDescription("__**Server Information**__")
          .setColor(0x15f153)
          .setThumbnail(message.guild.displayAvatarURL)
          .addField("Server Name", message.guild.name)
          .addField("Created On", message.guild.createdAt)
          .addField("Total Members", message.guild.memberCount)
          .addField("Total roles:", message.guild.roles.size)
  
          message.channel.send(serverembed)
          let m15 = message.channel.stopTyping(true)
        } else {return}
    };


    // role checking
    if(msg.split(" ")[0] === prefix + "inrole") {
      //ex: `inrole Admin
      let args = msg.split(" ").slice(1);
      let role = message.mentions.roles.first();

      if(!role) {return await(message.reply("No role specified."))};

      if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {
        message.channel.startTyping(500)
        message.channel.send("```" + `Member count is: ${message.guild.members.filter(m =>!m.user.bot).filter(m => m.roles.get(role.id)).size} \n` + message.guild.members.filter(m =>!m.user.bot).filter(m => m.roles.get(role.id)).map(m => `\n[${m.user.username} : ${m.user.id}]`) + "```")
      let m15 = message.channel.stopTyping(true)
      } else {return}
    };


    // member info
    if (msg.split(" ")[0] === prefix + "member") {
      //ex `member @Rinkky
      let args = msg.split(" ").slice(1);
      let rMember = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));

      if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {
        message.channel.startTyping(500)

        if(!rMember) {return await(message.reply("No user Specified"))};

          let memberembed = new Discord.RichEmbed()
          .setDescription("__**Member Information**__")
          .setColor(0x15f153)
          .setThumbnail(rMember.displayAvatarURL)
          .addField("Name/Nickname", rMember + '/' + rMember.nickname)
          .addField("ID", rMember.id)
          .addField("Joined at", rMember.joinedAt)
          .addField("Account age:", rMember.user.createdAt)
  
          message.channel.send(memberembed)

      let m15 = message.channel.stopTyping(true)
        } else {return}
    };
    

    // Bulk delete messages
    if (msg.split(" ")[0] === prefix + "del") {
      let args = msg.split(" ").slice(1);

      if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {
        message.channel.startTyping(500)
        if(!args[0]) {await(message.channel.send("Please specify how many messages should be deleted."))};
        message.channel.bulkDelete(args[0])
      let m15 = message.channel.stopTyping(true)
      } else {return}
      
    };


    // `news "among us at etc etc etc"

    if (msg.startsWith(prefix + "news")) {
      let args = msg.split(prefix + "news ");


      if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {
        message.channel.startTyping(500)
        let newchat = message.guild.channels.get("772811482035519488")
        
        let m = await newchat.send('@everyone', {files: ["./storage/Emeeting.png"]})
        let m2 = await newchat.send(args)

        .then(message.reply('Done!').catch(err => console.log(err)))
      let m15 = message.channel.stopTyping(true)
      } else {return}
      
    };
    
    
    // eval
    if (msg.startsWith(prefix + "eval")) {
      if(sender.id !== "186487324517859328") return;
      const args = message.content.split(" ").slice(1);
      try {
        const code = args.join(" ");
        let evaled = eval(code);
  
        if (typeof evaled !== "string")
          evaled = require("util").inspect(evaled);
  
        message.channel.send(clean(evaled), {code:"xl"});
      } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
      }
    }


      //
      //USER commands
      //

      // admin mails
      if (msg.split(" ")[0] === prefix + "adminmail") {
        //ex `adminmail @Rinkky 'mail'
        let args = msg.split(" ").slice(1);
        let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]) || message.mentions.roles.first());
        let rreason = args.join(" ").slice(22);

          let mailEmbed = new Discord.RichEmbed()
          .setDescription("Today's Mail")
          .setColor(0xe0782b)
          .addField("Sent by:", `${sender} with ID: ${sender.id}`)
          .addField("Recipient:", rUser)
          .addField("Mail", rreason)
          .addField("Sent At", message.createdAt)

          let mailEmbedA = new Discord.RichEmbed()
          .setDescription("Today's Mail")
          .setColor(0xe0782b)
          .addField("Sent by:", `${sender} with ID: ${sender.id}`)
          .addField("Mail", args[0])
          .addField("Sent At", message.createdAt)


          //mentioning a role = return
          //
          // need to add


          if(!rUser) {
            message.delete()
             logchannel.send(mailEmbedA)
            .catch(err => console.log(err))

            message.guild.members.get(sender.id)
          .createDM()
                .then(dm => {
                  dm.send({embed: {
                    color: 0x15f153,
                    title: "Thank you for the mail!" ,
                  description: `Your mail to ${rUser} was sent!`,
                  timestamp: new Date(),
                    footer: {
                    icon_url: "186487324517859328".avatarURL,
                    text: "Any abuse of the mailing system will result to a penalty"
                    }
                  }})
                }).catch(err => console.log(err))

            return;
          }

          if(!rreason) return message.reply("You can't send an empty paper.");
          
          message.delete()
          let m = await logchannel.send(mailEmbed)
          message.guild.members.get(sender.id)
          .createDM()
                .then(dm => {
                  dm.send({embed: {
                    color: 0x15f153,
                    title: "Thank you for the mail!" ,
                  description: `Your mail to ${rUser} was sent!`,
                  timestamp: new Date(),
                    footer: {
                    icon_url: "186487324517859328".avatarURL,
                    text: "Any abuse of the mailing system will result to a penalty"
                    }
                  }})
                }).catch(err => console.log(err))
      };

}); //the end of bot.on ------------------------------

bot.on("messageDelete", (messageDelete) => {

  if (bot.user.id === messageDelete.author.id) return;
  //if (messageDelete.content !== isString) return;

  let DeleteEmbed = new Discord.RichEmbed()
  .setTitle("**Deleted Message**")
  .setColor("#ffcc00")
  .addField("Author", messageDelete.author.tag, true)
  .addField("Channel", messageDelete.channel, true)
  .addField("Message", messageDelete.content)
  .setFooter(`Message ID: ${messageDelete.id} | Author ID: ${messageDelete.author.id}`);
  
  let logchan = messageDelete.guild.channels.find(x => x.name === "logs");
  if (messageDelete.length >= 1024) {logchan.send("deleted message embed cannot be sent, for it exceeds 1024 characters.")}
   logchan.send(DeleteEmbed).catch(err => console.log(err));
});

bot.on("messageUpdate", async (oldMessage, newMessage) => {

  if (bot.user.id === oldMessage.author.id) return;
  if (bot.user.id === newMessage.author.id) return;
  if (oldMessage === newMessage) return;
  //if (oldMessage.content !== isString) return;

  let editEmbed = new Discord.RichEmbed()
  .setTitle("**Edited message**")
  .setColor("#ffcc00")
  .addField("Author", oldMessage.author.tag, true)
  .addField("Channel", oldMessage.channel, true)
  .addField("Old Message", oldMessage.content)
  .addField("New message:", newMessage.content)
  .setFooter(`Message ID: ${oldMessage.id} | Author ID: ${oldMessage.author.id}`);

  let logchan = oldMessage.guild.channels.find(x => x.name === "logs");
  if (oldMessage.length >= 1024) {logchan.send("Updated message embed cannot be sent, for it exceeds 1024 characters.")}
   logchan.send(editEmbed).catch(err => console.log(err));

});

function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

//  Login

// the bot.token('token')
bot.login(process.env.token);
