const Discord = require('discord.js');
const request = require('request');
const ytdl = require("ytdl-core");
const fs = require('fs');

const client = new Discord.Client();

var rank = JSON.parse(fs.readFileSync("rank.json", "utf8"));

const prefix = "-";
const minLength = 10;

var voice_connection = null;
var stream_handler = null;


function joinChannel( channel, id ) {
	leaveChannel( channel.guild );
	channel.join().then(connection => {
		voice_connection = connection;
		if (id != null) {
			playVideo( id );
		}
	}).catch(console.error);
}

function leaveChannel( guild ) {
	if (voice_connection != null) {
		voice_connection.channel.leave();
		voice_connection = null;
		stream_handler = null;
	}
}

function playVideo( video ) {
	if (stream_handler != null) return;
	if (voice_connection == null) return;
	
	var audio_stream = ytdl("https://www.youtube.com/watch?v=" + video, { filter : 'audioonly' });
	stream_handler = voice_connection.playStream(audio_stream, { seek: 0, volume: 1 });
	
	stream_handler.once("end", reason => {
		voice_connection.channel.leave();
		voice_connection = null;
		stream_handler = null;
	});
}


client.on('ready', () => {
    console.log('Bang bang into the room!');
	client.user.setPresence({ game: { name: 'Bang Bang Bang', type: 0 } });
});

client.on('guildMemberAdded', member => {
	member.guild.defaultChannel.send("Velkommen " + member.guild.name + " til " + member.guild.name);
});

client.on('message', message => {
	if (message.author.bot) return;
	
	var user = message.member;
	var name = user.displayName;
	
	if (message.content.length > minLength) {
		if (!rank[user.id]) rank[user.id] = 0;
		
		rank[user.id] += message.content.length - minLength;
		
		if (rank[user.id] % 10 == 0) {
			message.channel.send("10+ meme points to **" + name + "**", {
				files: ["10points.png"]
			});
		}
		
		fs.writeFile("rank.json", JSON.stringify(rank), (err) => {
			if (err) console.error(err);
		});
	}
	
	var command = message.content.split(" ")[0];
	command = command.slice(prefix.length).toLowerCase();
	var args = message.content.split(" ").slice(1);
	
	if (!message.content.startsWith(prefix)) return;
	
	if (command == "help") {
		message.channel.send("**Kommandoer**" +
		"\n  **" + prefix + "meme** `<template>` `<top;bottom>` : Lav en dank mehmay" +
		"\n  **" + prefix + "repost** : Fortæl alle at der er en meme tyv" +
		"\n  **" + prefix + "communism** : Her er vi alle lige" +
		"**Music**" +
		"\n  **" + prefix + "join** : Join my minekraft server" +
		"\n  **" + prefix + "leave** : Unsub to my channel" +
		"\n  **" + prefix + "play** : Nastrovia!");
	}
	
	if (command == "rank") {
		message.channel.send("**" + name + "** har sendt " + (rank[user.id] || 0) + " beskeder. Sikke en nørd");
	}
	
	if (command == "repost") {
		message.channel.send("__**MEME THIEF SPOTTED**__", {
			files: ["theft.jpg"]
		});
	}
	
	if (command == "join") {
		if (message.member.voiceChannel) {
			joinChannel(message.member.voiceChannel);
		} else {
			message.channel.send("Du skal være i en VoiceChannel din tard");
		}
	}
	
	if (command == "leave") {
		leaveChannel( message.guild );
	}
	
	if (command == "play") {
		if (message.member.voiceChannel) {
			var id = args[0];
			playVideo( id );
		}
	}
	
	if (command == "communism") {
		message.delete();
		message.channel.send('', {
			files: ["communism.gif"]
		});
		if (message.member.voiceChannel) {
			joinChannel( message.member.voiceChannel, "U06jlgpMtQs" );
		}
	}
	
	if (command == "memelist") {
		request('http://thefern.netau.net/api/meme/list', { json: true }, (err, res, body) => {
			if (err) { return console.log(err); }
			var txt = "**Holy list of meme templates**";
			for (i = 0; i < body.length; i++) {
				txt += "\n  " + body[i];
			}
			
			message.channel.send(txt);
		});
	}
	
	if (command == "meme") {
		message.delete();
		var meme = args[0];
		var txt = args.slice(1).join(" ");
		var tbl = txt.split(";");
		
		var url = "http://thefern.netau.net/api/meme/generator?meme=" + meme;
		
		if (tbl[1] != null) {
			url += "&top=" + tbl[0] + "&bottom=" + tbl[1];
		} else {
			url += "&top=" + tbl[0];
		}
		
		message.channel.send("Courtesy of **" + name + "**", {
			files: [url + "&type=.jpg"]
		});
	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);