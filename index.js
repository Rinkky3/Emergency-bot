// Calling the package
const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const moment = require('moment'); // the moment package. to make this work u need to run "npm install moment --save 
const ms = require("ms"); // npm install ms -s
const ytdl = require("ytdl-core");
const opus = require("opusscript");
const YouTube = require("simple-youtube-api")


const queue = new Map();
const youtube = new YouTube(process.env.ytapi)
var stopping = false;
var voteSkipPass = 0;
var voted = 0;
var playerVoted = [];

const commands = ["play", "skip", "volume", "np", "queue"]

// Listener Event: Bot Launched
bot.on('ready', () => {
    console.log('Power Level Stabilised') // Runs when the bot is launched
    
    bot.user.setActivity("prefix ` | Watching Over")

});


// event listener: new guild members
bot.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find('name', 'general');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`The omens foretold your arrival, ${member}. The Soul Sorcerer and High priests welcome you.`);
    
  });

// Event listener: Message Received ( This will run every time a message is received)
bot.on('message', async message => {
    // Variables
    let sender = message.author; // The person who sent the message
    let msg = message.content.toLowerCase();
    let prefix = '`' // The text before commands
    if (bot.user.id === sender.id) { return }
    let nick = sender.username

    
    // commands

    // Ping / Pong command
    if (msg === prefix + 'ping') {
      if(sender.id === "186487324517859328" || message.member.roles.has(Staff.id)) {
        let m = await message.channel.send("Ping?");
        m.edit(`Pong. Latency: ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
      } else {return}
    };
    
	
	// Help
    if(msg.split(' ')[0] === prefix + 'help'){
	console.log('HELP INITIATED!')
      	let args = msg.split(" ").slice(1);
	console.log(args[0])
	
	if(!args[0]){
		let embed = new Discord.RichEmbed()
		.setDescription("All available chants")
		.setColor(0x00fff3)
		for(var i = 0; i < commands.length; i++){
			embed.addField("Command:", commands[i])
		}
		await message.channel.send(embed)
		return await message.channel.send("For info on a specific chant, do `help (chant)")
	}

	
	if(args[0] === "play"){
		let embed = new Discord.RichEmbed()
		.setDescription("Play a song")
		.setColor(0x00fff3)
		.addField("Usage:", "`play (Search term/URL)")
		.addField("Description:", "Channel the frequencies of the divine")
		return await message.channel.send(embed)
	} 
	if(args[0] === "skip"){
		let embed = new Discord.RichEmbed()
		.setDescription("Skip a song")
		.setColor(0x00fff3)
		.addField("Usage:", "`skip")
		.addField("Description:", "You are bound to channel wrong frequencies from times to times.")
		return await message.channel.send(embed)
	}  
	if(args[0] === "np"){
		let embed = new Discord.RichEmbed()
		.setDescription("Now playing")
		.setColor(0x00fff3)
		.addField("Usage:", "`np")
		.addField("Description:", "Ask for the frequency name")
		return await message.channel.send(embed)
	}      
	if(args[0] === "volume"){
		let embed = new Discord.RichEmbed()
		.setDescription("Check/set the volume")
		.setColor(0x00fff3)
		.addField("Usage:", "`volume OR `volume (num)")
		.addField("Description:", "Sometimes we need a little boost.")
		return await message.channel.send(embed)
	}  
	if(args[0] === "queue"){
		let embed = new Discord.RichEmbed()
		.setDescription("List the queue")
		.setColor(0x00fff3)
		.addField("Usage:", "`queue")
		.addField("Description:", "Channeling requires magic, but there's always a limit to the flow. Are you a big enough vessel?")
		return await message.channel.send(embed)
	}}


    //bot info command
    if (msg === prefix + "botinfo") {
        let bicon = bot.user.displayAvatarURL

        let botembed = new Discord.RichEmbed()
        .setDescription("Bot Information")
        .setColor(0x15f153)
        .setThumbnail(bicon)
        .addField("Bot Name", bot.user.username)
        .addField("Created At", bot.user.createdAt)

        message.channel.send(botembed)
    };

    
    //MUSIC STUFF

    const serverQueue = queue.get(message.guild.id);
    if(message.content.split(" ")[0] === prefix + "play"){
        let args = message.content.split(" ").slice(1)
        const searchString = args.join(' ')
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) return message.channel.send('Thou shalt be in a Voice channel.')
        const permissions = voiceChannel.permissionsFor(bot.user)
        if(!permissions.has('CONNECT')) return message.channel.send('Spirits like me have been warded away from your voice channel.')
        if(!permissions.has('SPEAK')) return message.channel.send('The soul Sorcerer has cast a curse on this place, may i enter shall i be silenced. In other words, im muted.')
	    
	if(!args[0]) return message.reply('i do not have access to this dimension. (url or playlist link not found)')
	if(stopping) stopping = false;
        
        if(args[0].match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)){
            const playlist = await youtube.getPlaylist(args[0]);
            var videos = await playlist.getVideos();
            for(const video of Object.values(videos)){
                var video2 = await youtube.getVideoByID(video.id);
                await handleVideo(video2, message, voiceChannel, true)
            }
            return await message.channel.send(`Playlist: **${playlist.title}** has been added to the queue!`);
        }else{
            try{
                var video = await youtube.getVideo(args[0])
            }catch(error){
                try{
                    var videos = await youtube.searchVideos(searchString, 10);
                    let index = 0;
                    let videosEmbed = new Discord.RichEmbed()
                    .setDescription("Song selection")
                    .setColor(0x15f153)
                    .addField("Songs:", videos.map(video2 => `**${++index} -** ${video2.title}`))
                    message.channel.send(videosEmbed)
                    message.channel.send("Thou shalt provide a value from 1 to 10 to select a video! Time is short.")
                    try{
                        var response = await message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 11, {
                      		      	maxMatches: 1,
					time: 10000,
					errors: ['time']
				});
                    }catch(err){
                        return message.channel.send('No value given, or value was invalid, video selection canceled.')
                    }
		    	const videoIndex = parseInt(response.first().content);
                    	var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                }catch(err){
                    console.log(err)
                    return await message.channel.send("There is no such thing!");
                }
            }
            return handleVideo(video, message, voiceChannel);
        }
    } else if(msg === prefix + "mstop"){
        if(!message.member.voiceChannel) return await message.channel.send("Thou shalt enter a voice channel.")
        if(!serverQueue) return await message.channel.send("Nothing is playing.")
	stopping = true;
	serverQueue.voiceChannel.leave();
        return serverQueue.textChannel.send('Cya, I\'m leaving!');
    }else if(msg === prefix + "skip"){
            if(!message.member.voiceChannel) return await message.channel.send("Thou shalt enter a voice channel.")
            if(!serverQueue) return await message.channel.send("Nothing is playing.")
	    const voiceChannel = message.member.voiceChannel;
	    for (var x = 0; x < playerVoted.length; x++) {
	    	if(sender === playerVoted[x]){
			return message.channel.send(`${sender.username}, i am an immortal being, a timeless creature. i cannot be fooled, you only get one vote.`)
		}
	    }
	    voted++;
	    playerVoted.push(sender);
	    if(voteSkipPass === 0){
		    voiceChannel.members.forEach(function() {
			 voteSkipPass++;
		    })
	    }
	    var voteSkipPass1 = voteSkipPass - 1;
	    var voteSkip = Math.floor(voteSkipPass1/2);
	    if(voteSkip === 0) voteSkip = 1;
	    if(voted >= voteSkip){
		await message.channel.send('Vote skip has passed!')
	    	serverQueue.connection.dispatcher.end();
		voted = 0;
		voteSkipPass = 0;
		playerVoted = [];
	    }else{
	    	await message.channel.send(voted + '\/' + voteSkip + ' players voted to skip!')
	    }
        return undefined;
    }else if(msg === prefix + "np"){
        if(!serverQueue) return await message.channel.send("Nothing is playing!")
        
        return await message.channel.send(`Now playing: **${serverQueue.songs[0].title}**`)
    }else if(msg.split(" ")[0] === prefix + "volume"){
        let args = msg.split(" ").slice(1)
        if(!message.member.voiceChannel) return await message.channel.send("Thou shalt enter a voice channel.")
        if(!serverQueue) return await message.channel.send("Nothing is playing!");
        if(!args[0]) return await message.channel.send(`The current volume is **${serverQueue.volume}**`);
	if(args[0] > 10 || args[0] < 0) return await message.channel.send('Please choose a number between 0 and 10!');
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[0] / 5)
        serverQueue.volume = args[0];
        return await message.channel.send(`I set the volume to: **${args[0]}**`);
    }else if(msg === prefix + "queue"){
        if(!serverQueue) return await message.channel.send("Nothing is playing!");
        let queueEmbed = new Discord.RichEmbed()
        .setDescription("Queue")
        .setColor(0x15f153)
        .addField("Now playing:", `**${serverQueue.songs[0].title}**`)
        .addField("Songs:", serverQueue.songs.map(song => `**-** ${song.title}`))
        return await message.channel.send(queueEmbed)
    }


    // I no touch dw

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

}); //the end of bot.on ------------------------------


function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

async function handleVideo(video, message, voiceChannel, playlist = false){
    const serverQueue = queue.get(message.guild.id)
    const song = {
                id: video.id,
                title: video.title,
                url: `https://www.youtube.com/watch?v=${video.id}`
            }
        
    if(!serverQueue) {
        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };
        queue.set(message.guild.id, queueConstruct);
        queueConstruct.songs.push(song);
        message.channel.send(`Yo bro, you wont believe it ${song.title} has been added to the queue`)
        try {
            var connection = await voiceChannel.join();
            queueConstruct.connection = connection;
            play(message.guild, queueConstruct.songs[0]);
        } catch (error) {
            console.error(error)
            queue.delete(message.guild.id)
            return message.channel.send('Sorry bro, there was an error')
        }
    } else {
        serverQueue.songs.push(song);
        if(playlist) return undefined
        return message.channel.send(`Yo bro, you wont believe it ${song.title} has been added to the queue`)
    }
    return undefined;
}

function play(guild, song){
    const serverQueue = queue.get(guild.id)
    if(stopping){
       queue.delete(guild.id);
       return;
    }
    
    if(!song){
	console.log('No song')
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return undefined;
    }
    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
        .on('end', () =>{
                console.log('Song ended');
		if(!serverQueue.songs){
		        serverQueue.voiceChannel.leave();
        		queue.delete(guild.id);
        		voted = 0;
			voteSkipPass = 0;
			playerVoted = [];
        		return undefined;
		}
		serverQueue.songs.shift();
		voted = 0;
		voteSkipPass = 0;
		playerVoted = [];
                play(guild, serverQueue.songs[0]);
            })
        .on('error', error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    if(song){
    	serverQueue.textChannel.send(`Now playing: **${song.title}**`)
    }
}

function sortObject() {
	var arr = [];
	for (var prop in userData) {
		if (userData.hasOwnProperty(prop)) {
		    arr.push({
			'key': prop,
			'value': userData[prop].money
		    });
		}
	}
	arr.sort(function(a, b) { return b.value - a.value; });
	return arr;
}

//  Login

// the bot.token('token')
bot.login(process.env.token);
