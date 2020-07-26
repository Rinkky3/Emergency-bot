﻿// Calling the package
const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const moment = require('moment'); // the moment package. to make this work u need to run "npm install moment --save 
const ms = require("ms"); // npm install ms -s
const profanities = require('./banned words.json') // for this to work run "npm install profanities", for real profanity muting.


// Listener Event: Bot Launched
bot.on(x => x.name === 'ready', () => {
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
bot.on(x => x.name === 'message', async message => {

    // Variables
    let prefix = '`'
    let msg = message.content.toLowerCase();
    let sender = message.author;
    let nick = sender.username
    let Staff = message.guild.roles.find(x => x.name === "Guide");
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
      let rmembers = message.guild.roles.get(role.id).members.map(m => m.user.tag);

      if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {
        
        await(message.channel.send("```" + `Member count is: ${message.guild.members.filter(m =>!m.user.bot).filter(m => m.roles.get(role.id)).size} \n` + message.guild.members.filter(m =>!m.user.bot).filter(m => m.roles.get(role.id)).map(m => `\n[${m.user.username} : ${m.user.id}]`) + "```"))
      } else {return}
    };


    // member info
    if (msg.split(" ")[0] === prefix + "member") {
      //ex `member @Rinkky
      let args = msg.split(" ").slice(1);
      let rMember = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
      let micon = rMember.displayAvatarURL;

      if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {

        if(!rMember) 
          return message.reply("No user Specified")

          let memberembed = new Discord.RichEmbed()
          .setDescription("__**Member Information**__")
          .setColor(0x15f153)
          .setThumbnail(micon)
          .addField("Name/Nickname", rMember + '/' + nick)
          .addField("ID", rMember.id)
          .addField("Joined at", rMember.joinedAt)
          .addField("Account age:", rMember.user.createdAt)
  
        await message.channel.send(memberembed)

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


    // Bulk delete messages
    Xnum = Number

    if (msg.split(" ")[0] === prefix + "del " + Xnum) {
      
      if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {
        for(i=0; i < Xnum; i++){
        message.delete()
        }
      } else {return}
      
    };


    // profanity filter
    let basement = message.guild.channels.find(x => x.name === "basement-directions")
  
    for (x=0; x<profanities.length; x++) {
      if (msg.includes(profanities[x])) {
          if(bot.user.id === sender.id || "186487324517859328" === sender.id) {return}
          if(message.guild.channels.id() === basement) {return}
        
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
              .catch(console.error);

              let tomute =  message.guild.members.get(sender.id)
              let muterole = message.guild.roles.find(x => x.name === "muted" || x.name === "Muted");
                
                //start of create role
                if(!muterole){
                  try{
                    muterole = await message.guild.createRole({
                      name: "muted",
                      color: "#505050",
                      permissions:[]
                    })
                    message.guild.channels.forEach(async (channel, id) => {
                      await channel.overwritePermissions(muterole, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false
                      })
                    })
                  }catch(e){
                    console.log(e.stack);
                  }
                }
                //end of create role
                
              await(tomute.addRole(muterole.id));
              setTimeout(function(){
                tomute.removeRole(muterole.id);
              },(6000))

              await(message.reply("**You violated rule 10.**")
              .then(msg => {
                msg.delete(25000)
              }))
                

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
                }}).catch(error)
              });
    
          return;
      };

      //
      //USER commands
      //

      // admin mails
      if (msg.split(" ")[0] === prefix + "adminmail") {
        //ex `adminmail @Rinkky 'mail'
        let args = msg.split(" ").slice(1);
        let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        let rreason = args.join(" ").slice(22);
        let logchannel = message.guild.channels.find(x => x.name === "logs");

          if(!rreason) return message.reply("You can't send an empty paper.");

          let mailEmbed = new Discord.RichEmbed()
          .setDescription("Today's Mail")
          .setColor(0xe0782b)
          .addField("Sent by:", `${sender} with ID: ${sender.id}`)
          .addField("Recipient:", rUser)
          .addField("Mail", rreason)
          .addField("Sent At", message.createdAt)
          
          msg.delete()
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
                })
      }
    };

}); //the end of bot.on ------------------------------

bot.on(x => x.name === "messageDelete", (messageDelete) => {

  let DeleteEmbed = new Discord.RichEmbed()
  .setTitle("**Deleted Message**")
  .setColor("#fc3c3c")
  .addField("Author", messageDelete.author.tag, true)
  .addField("Channel", messageDelete.channel, true)
  .addField("Message", messageDelete.content)
  .addField("")
  .setFooter(`Message ID: ${messageDelete.id} | Author ID: ${messageDelete.author.id}`);

  let logchan = messageDelete.guild.channels.find(x => x.name === "logs");
  logchan.send(DeleteEmbed);
});

bot.on(x => x.name === "messageEdit", (messageEdit) => {

  let editEmbed = new Discord.RichEmbed()
  .setTitle("**Edited message**")
  .setColor("#fc3c3c")
  .addField("Author", messageEdit.author.tag, true)
  .addField("Channel", messageEdit.channel, true)
  .addField("Message", messageEdit.content)
  .setFooter(`Message ID: ${messageEdit.id} | Author ID: ${messageEdit.author.id}`);

  let logchan = messageEdit.guild.channels.find(x => x.name === "logs");
  logchan.send(editEmbed);
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
