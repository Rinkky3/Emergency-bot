// Calling the package
const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const moment = require('moment'); // the moment package. to make this work u need to run "npm install moment --save 
const ms = require("ms"); // npm install ms -s
const badwords = require('./banned words.json') // for a list of curse words, run "npm install profanities" and require('profanities').


// Listener Event: Bot Launched
bot.on('ready', () => {
    console.log('Bot is running') // Runs when the bot is launched
    
    const botchat = bot.channels.find(x => x.name === "logs")
    botchat.send(`May the higher powers be with you..`)
    
    bot.user.setActivity("prefix ` | Watching Over You")

});

/*
// event listener: new guild members
bot.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find(x => x.name === 'general');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`The omens foretold your arrival, ${member}. We welcome you.`);
    
}); */

// Event listener: Message Received ( This will run every time a message is received)
bot.on('message', async message => {

    // Variables
    let prefix = '`'
    let msg = message.content.toLowerCase();
    let sender = message.author;
    let nick = sender.username;
    let Staff = message.guild.roles.find(x => x.name === "Guide");
    let logchannel = message.guild.channels.find(x => x.name === "logs");
    if (bot.user.id === sender.id) {return};



    //
    // ADMIN commands
    //

    // Ping / Pong command
    if (msg === prefix + 'ping') {
      if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {
        let m = await message.channel.send("Pong.");
        m.edit(`Latency: ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
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

        let botembed = new Discord.RichEmbed()
        .setDescription("Bot Information")
        .setColor(0x15f153)
        .setThumbnail(bot.user.displayAvatarURL)
        .addField("Bot Name", bot.user.username)
        .addField("Created At", bot.user.createdAt)

        message.channel.send(botembed)
    };


    // serverinfo command
    if (msg === prefix + "serverinfo") {
  
        if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {
          
          let serverembed = new Discord.RichEmbed()
          .setDescription("__**Server Information**__")
          .setColor(0x15f153)
          .setThumbnail(message.guild.displayAvatarURL)
          .addField("Server Name", message.guild.name)
          .addField("Created On", message.guild.createdAt)
          .addField("Total Members", message.guild.memberCount)
          .addField("Total roles:", message.member.roles)
  
          await message.channel.send(serverembed)
  
        } else {return}
    };


    // role checking
    if(msg.split(" ")[0] === prefix + "inrole") {
      //ex: `inrole Admin
      let args = msg.split(" ").slice(1);
      let role = message.mentions.roles.first();

      if(!role) {return await(message.reply("No role specified."))};

      if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {
        
        await(message.channel.send("```" + `Member count is: ${message.guild.members.filter(m =>!m.user.bot).filter(m => m.roles.get(role.id)).size} \n` + message.guild.members.filter(m =>!m.user.bot).filter(m => m.roles.get(role.id)).map(m => `\n[${m.user.username} : ${m.user.id}]`) + "```"))
      } else {return}
    };


    // member info
    if (msg.split(" ")[0] === prefix + "member") {
      //ex `member @Rinkky
      let args = msg.split(" ").slice(1);
      let rMember = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));

      if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {

        if(!rMember) {return await(message.reply("No user Specified"))};

          let memberembed = new Discord.RichEmbed()
          .setDescription("__**Member Information**__")
          .setColor(0x15f153)
          .setThumbnail(rMember.displayAvatarURL)
          .addField("Name/Nickname", rMember + '/' + nick)
          .addField("ID", rMember.id)
          .addField("Joined at", rMember.joinedAt)
          .addField("Account age:", rMember.user.createdAt)
  
        await message.channel.send(memberembed)

      } else {return}
    };
    

    // Bulk delete messages
    if (msg.split(" ")[0] === prefix + "del") {
      let args = msg.split(" ").slice(1);

      if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {
        if(!args[0]) {await(message.channel.send("Please specify how many messages should be deleted."))};
        message.channel.bulkDelete(args[0])
      } else {return}
      
    };


    // profanity filter
    let basement = message.guild.channels.find(x => x.name === "basement-directions")
  
    for (x=0; x<badwords.length; x++) {
      let regex = new RegExp(`(?:\\W)?${badwords[x]}\\W`, "gi")

      if(!regex.test(msg + " ")) continue;

          if(bot.user.id === sender.id || "186487324517859328" === sender.id) return;
          if(message.guild.channels.id !== basement) {
        
            let violationEmbed = {embed: {
              color: 0xff0000,
              title: "Violation Detected",
              description: '**Message sent by **' + sender + '** deleted in **<#' + message.channel.id + "> \n" + `"*${msg}*"`,
              timestamp: new Date(),
              footer: {
                icon_url: sender.avatarURL,
                text: `Username: ${nick} | ID: ${sender.id}`
              }
            }}

            await message.delete()
                .then(logchannel.send(violationEmbed))
                .catch(err => console.log(err));

                let tomute =  message.guild.members.get(sender.id)
                let muterole = message.guild.roles.find(x => x.name === "muted" || x.name === "Muted");
                  
                await(tomute.addRole(muterole.id));
                setTimeout(function(){
                  tomute.removeRole(muterole.id);
                },(6000))

                await(message.reply("**You violated rule 10.**")
                .then(msg => {
                  msg.delete(25000)
                })).catch(err => console.log(err))
                  

                message.guild.members.get(sender.id)
                .createDM()
                .then(dm => {
                  dm.send({embed: {
                    color: 0xff0000,
                    title: "Server Rule 10 Violated",
                    description: `You have violated our rules.\n  **Latest Violation:** "${msg}" 
                    \nWe do not take violations kindly.`,
                    timestamp: new Date(),
                    footer: {
                    icon_url: "186487324517859328".avatarURL,
                    text: "Warning!"
                    }
                  }}).catch(err => console.log(err))
                });
      
            return;
          } else return;
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
        let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
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
          logchannel.send(mailEmbed)
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

bot.on("messageUpdate", (messageUpdate) => {

  if (bot.user.id === messageUpdate.author.id) return;

  let editEmbed = new Discord.RichEmbed()
  .setTitle("**Edited message**")
  .setColor("#ffcc00")
  .addField("Author", messageUpdate.author.tag, true)
  .addField("Channel", messageUpdate.channel, true)
  .addField("Old Message", messageUpdate.content)
  .setFooter(`Message ID: ${messageUpdate.id} | Author ID: ${messageUpdate.author.id}`);

  let logchan = messageUpdate.guild.channels.find(x => x.name === "logs");
  if (messageUpdate.length >= 1024) {logchan.send("Updated message embed cannot be sent, for it exceeds 1024 characters.")}
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
