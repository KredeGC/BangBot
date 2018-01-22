const Discord = require('discord.js');
const request = require('request');
const ytdl = require("ytdl-core");
const fs = require('fs');

const client = new Discord.Client();
const hook = new Discord.WebhookClient(process.env.WEBHOOK_ID, process.env.WEBHOOK_TOKEN);

var voice_connection = null;
var stream_handler = null;

const prefix = "-";
const minLength = 8;

const capitalistWords = [
	"i",
	"my",
	"me",
	"mine",
	"buy",
	"bought"
];



function get_video_id(string) {
	var regex = "/(?:\?v=|&v=|youtu\.be\/)(.*?)(?:\?|&|$)/";
	var matches = string.match(regex);

	if (matches) {
		return matches[1];
	} else {
		return string;
	}
}

function joinChannel( channel, run ) {
	leaveChannel( channel.guild );
	channel.join().then(connection => {
		voice_connection = connection;
		if (run != null) {
			run();
		}
	}).catch(console.error);
}

function leaveChannel() {
	if (voice_connection != null) {
		voice_connection.channel.leave();
		voice_connection = null;
		stream_handler = null;
	}
}

function playFile( file, channel ) {
	if (stream_handler != null) return;
	if (channel != null) {
		leaveChannel();
		joinChannel( channel, () => {
			stream_handler = voice_connection.playFile(file, { seek: 0, volume: 1 });
			
			stream_handler.once("end", reason => {
				voice_connection.channel.leave();
				voice_connection = null;
				stream_handler = null;
			});
		});
	}
}

function playVideo( video, channel ) {
	if (stream_handler != null) return;
	if (channel != null) {
		leaveChannel();
		joinChannel( channel, () => {
			var audio_stream = ytdl("https://www.youtube.com/watch?v=" + video, { filter : 'audioonly' });
			stream_handler = voice_connection.playStream(audio_stream, { seek: 0, volume: 1 });
			
			stream_handler.once("end", reason => {
				voice_connection.channel.leave();
				voice_connection = null;
				stream_handler = null;
			});
		});
	}
}


client.on('ready', () => {
    console.log('Bang bang into ze room!');
	client.user.setPresence({ game: { name: 'Bang Bang Bang', type: 0 } });
});

client.on('guildMemberAdded', (member) => {
	member.guild.defaultChannel.send("Velkommen " + member.guild.name + " til " + member.guild.name);
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
	if (voice_connection == null) return;
	var members = voice_connection.channel.members.array();
	if (members.length == 0) {
		leaveChannel();
	}
});

client.on('message', message => {
	if (message.author.bot) return;
	
	var user = message.member;
	var name = user.displayName;
	var msg = message.content;
	
	if (!msg.startsWith(prefix)) {
		var txt = msg.split(" ");
		for (var x in txt) {
			var word = txt[x];
			if (capitalistWords.indexOf(word) > -1) {
				message.channel.send("'**" + word.toUpperCase() + "**' is __CAPITALIST__ word. now off to *GULAG*", {
					files: ["server.jpg"]
				});
				break;
			}
		}
	}
	
	if (msg.length > minLength) {
		if (Math.random() > 0.95) {
			message.channel.send("10+ meme points to **" + name + "**", {
				files: ["10points.png"]
			});
		}
	}
	
	if (!msg.startsWith(prefix)) return;
	
	var command = msg.split(" ")[0];
	command = command.slice(prefix.length).toLowerCase();
	var args = msg.split(" ").slice(1);
	
	message.delete();
	
	if (command == "help") {
		message.channel.send("**Kommandoer** for **" + name + "**" +
		"\n  **" + prefix + "memelist** : Få en liste over meehm templates" +
		"\n  **" + prefix + "meme** `<template>` `<top;bottom>` : Lav en dank mehmay" +
		"\n  **" + prefix + "banned** : Konfiskeret kapitalistisk propaganda" +
		"\n  **" + prefix + "lectio** `<matfys|komit>`: Få en persons skema" +
		"\n**Voice Channel**" +
		"\n  **" + prefix + "communism** : Find da wey brudda" +
		"\n  **" + prefix + "kalinka** : Start kalinka session" +
		"\n  **" + prefix + "thot** : Begone Thot!" +
		"\n**Musik**" +
		"\n  **" + prefix + "join** : Join my meinkraft server" +
		"\n  **" + prefix + "leave** : Unsubscribble to my channel" +
		"\n  **" + prefix + "play** : Lyt til ulovlige youtube videoer!");
	} else if (command == "join") {
		if (message.member.voiceChannel) {
			joinChannel(message.member.voiceChannel);
		} else {
			message.channel.send(name + ", du skal være i en VoiceChannel din tard");
		}
	} else if (command == "leave") {
		leaveChannel();
	} else if (command == "play") {
		message.delete();
		if (message.member.voiceChannel) {
			var id = get_video_id( args[0] );
			playVideo( id, message.member.voiceChannel );
		}
	} else if (command == "thot") {
		if (message.member.voiceChannel) {
			playFile( "thot.mp3", message.member.voiceChannel );
		}
	} else if (command == "communism") {
		var redstar = message.guild.emojis.find("name", "redstar");
		var marx = message.guild.emojis.find("name", "marx");
		var stalin = message.guild.emojis.find("name", "stalin");
		message.channel.send(redstar + "Special tribute to " + marx + "**Marx**, " + stalin + "**Stalin** and **Lenin** from **" + name + "**" + redstar, {
			files: ["communism.gif"]
		});
		if (message.member.voiceChannel) {
			playVideo( "U06jlgpMtQs", message.member.voiceChannel );
		}
	} else if (command == "kalinka") {
		if (message.member.voiceChannel) {
			var redstar = message.guild.emojis.find("name", "redstar");
			message.channel.send(redstar + "Special kalinka session by **" + name + "**" + redstar);
			playVideo( "4xJoVCjBUco", message.member.voiceChannel );
		}
	} else if (command == "banned") {
		txt = "**Baned capitalist words**";
		for (var x in capitalistWords) {
			 txt += "\n  " + capitalistWords[x];
		}
		message.channel.send(txt);
	} else if (command == "lectio") {
		var arg = args[0];
		var id = '';
		var name = '';
		if (arg == "matfys") {
			id = '22303833699';
			name = '1.6';
		} else if(arg == "komit") {
			id = '22352172603';
			name = '1.4';
		}
		if (id == '') {
			message.channel.send("**-lectio** `matfys` eller `komit`");
		} else {
			request('http://thefern.netau.net/api/lectio/schedule?school=523&student=' + id, { json: true }, (err, res, body) => {
				if (err) { return console.log(err); }
				var noter = body['dayschedule']['notes'];
				var fag = body['dayschedule']['lessons'];
				var txt = "```glsl\n#" + body['day'] + " " + name;
				
				for (i = 0; i < fag.length; i++) {
					txt += "\n[" + fag[i].time + '] ' + fag[i].title + ' ' + fag[i].classroom;
				}
				
				txt += "\n#Noter";
				
				for (i = 0; i < noter.length; i++) {
					txt += "\n" + noter[i];
				}
				
				txt += "```";
				
				message.channel.send(txt);
			});
		}
	} else if (command == "memelist") {
		request('http://thefern.netau.net/api/meme/list', { json: true }, (err, res, body) => {
			if (err) { return console.log(err); }
			var txt = "**Holy list of meme templates**";
			for (i = 0; i < body.length; i++) {
				txt += "\n  " + body[i];
			}
			
			message.channel.send(txt);
		});
	} else if (command == "meme") {
		var meme = args[0];
		var txt = args.slice(1).join(" ");
		var tbl = txt.split(";");
		
		var url = "http://thefern.netau.net/api/meme/generator?meme=" + meme;
		
		if (tbl[1] != null) {
			url += "&top=" + tbl[0] + "&bottom=" + tbl[1];
		} else {
			url += "&top=" + tbl[0];
		}
		
		message.channel.send("Meme Copyright by **" + name + "**", {
			files: [url + "&type=.jpg"]
		});
	} else {
		hook.send(message.content, {
			username: name,
			avatarURL: message.author.avatarURL,
		});
	}
});

client.login(process.env.BOT_TOKEN);