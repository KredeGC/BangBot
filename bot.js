const Discord = require('discord.js');
const request = require('request');
const ytdl = require("ytdl-core");
const fs = require('fs');

const client = new Discord.Client();
const hook = new Discord.WebhookClient(process.env.WEBHOOK_ID, process.env.WEBHOOK_TOKEN);

var voice_connection = null;
var stream_handler = null;
var afk_users = [];
var afk_timer = null;
var afk_hook = null;

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

const replies = [
	"Bang Approves",
	"Beep",
	"Boop",
	"Communism will rise",
	"confusement",
	"Doubt",
	"Good job",
	"Impossible",
	"kys",
	"Magnificent",
	"Marvellous",
	"No",
	"Perhaps",
	"Possibly",
	"*spits*",
	"S U C C",
	"Leaving a dot here .",
	"Undoubtedly",
	"Well done",
	"Yee",
	"Yeah boii"
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
			run( connection );
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

function playFile( file, channel ) {
	if (stream_handler != null) return;
	if (channel != null) {
		leaveChannel( channel.guild );
		joinChannel( channel, (connection) => {
			stream_handler = connection.playFile(file, { seek: 0, volume: 1 });
			
			stream_handler.once("end", (reason) => {
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
		leaveChannel( channel.guild );
		joinChannel( channel, (connection) => {
			var audio_stream = ytdl("https://www.youtube.com/watch?v=" + video, { filter : 'audioonly' });
			stream_handler = connection.playStream(audio_stream, { seek: 0, volume: 1 });
			
			stream_handler.once("end", reason => {
				voice_connection.channel.leave();
				voice_connection = null;
				stream_handler = null;
			});
		});
	}
}

function doAFKBot() {
	for (var i in afk_users) {
		var user = afk_users[i];
		var reply = replies[Math.floor(Math.random()*replies.length)];
		console.log(i-afk_users.length+1);
		if (i == afk_users.length-1) {
			afk_hook.send(reply, {
				username: user.name,
				avatarURL: user.avatar,
			}).then(message => {
				afk_hook.delete();
				afk_hook = null;
				afk_timer = null;
			});
		} else {
			afk_hook.send(reply, {
				username: user.name,
				avatarURL: user.avatar,
			});
		}
	}
}

function isAFK(user) {
	if (afk_users.indexOf(user.id) > -1) return true;
	return false
}

function becomeAFK(user) {
	if (isAFK(user)) return false;
	afk_users.push( user.id );
}

function begoneAFK(user) {
	var pos = afk_users.indexOf(user.id);
	if (pos > -1) {
		afk_users.slice(pos);
	}
}


client.on('ready', () => {
    console.log('Bang bang into the room!');
	client.user.setPresence({ game: { name: 'bobs and vagene', type: 0 } });
});

client.on('messageReactionAdd', (react, user) => {
	if (user.bot) return;
	if (isAFK(user)) {
		var name = react.emoji.name;
		react.remove(user);
	}
});

client.on('guildMemberAdd', (member) => {
	member.guild.defaultChannel.send("Velkommen " + member.guild.name + " til " + member.guild.name);
});

client.on('message', message => {
	if (message.author.bot) return;
	
	var user = message.author;
	var member = message.member
	var name = member.displayName;
	var msg = message.content;
	
	if (!msg.startsWith(prefix)) {
		/*if (isAFK(user)) {
			message.delete();
			user.send("Du er inaktiv. Skriv `" + prefix + "afk` for at blive aktiv");
			return;
		}
		
		var txt = msg.split(" ");
		for (var x in txt) {
			var word = txt[x];
			if (capitalistWords.indexOf(word) > -1) {
				message.channel.send("'**" + word.toUpperCase() + "**' is __CAPITALIST__ word. now off to *GULAG*", {
					files: ["server.jpg"]
				});
				return;
			}
		}
		
		if (msg.length > minLength) {
			if (Math.random() > 0.95) {
				message.channel.send("10+ meme points to **" + name + "**", {
					files: ["10points.png"]
				});
			}
		}*/
		
		if (afk_timer != null) {
			clearTimeout(afk_timer);
		}
		
		message.channel.createWebhook("AFK Webhook").then(wb => {
			afk_hook = wb;
			afk_timer = setTimeout(doAFKBot, 1000 + Math.random()*1000);
		});
	} else {
		var command = msg.split(" ")[0];
		command = command.slice(prefix.length).toLowerCase();
		var args = msg.split(" ").slice(1);
		
		message.delete();
		
		if (command == "help") {
			message.channel.send("**Kommandoer** for **" + name + "**" +
			"\n  **" + prefix + "memelist** : Få en liste over meehm templates" +
			"\n  **" + prefix + "meme** `<template>` `<top;bottom>` : Lav en dank mehmay" +
			"\n  **" + prefix + "afk**: Become a bot" +
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
		}
		
		// Commands
		
		if (command == "afk") {
			if (afk_users[user.id]) {
				begoneAFK(user);
			} else {
				becomeAFK(user);
				/*hook.send("am bot gib data, beep", {
					username: name,
					avatarURL: user.avatarURL,
				});*/
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
		}
		
		if (command == "banned") {
			txt = "**Baned capitalist words**";
			for (var x in capitalistWords) {
				 txt += "\n  " + capitalistWords[x];
			}
			message.channel.send(txt);
		}
		
		if (command == "lectio") {
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
		}
		
		// Voice
		
		if (command == "communism") {
			var redstar = message.guild.emojis.find("name", "redstar");
			var marx = message.guild.emojis.find("name", "marx");
			var stalin = message.guild.emojis.find("name", "stalin");
			message.channel.send(redstar + "Special tribute to " + marx + "**Marx**, " + stalin + "**Stalin** and **Lenin** from **" + name + "**" + redstar, {
				files: ["communism.gif"]
			});
			if (member.voiceChannel) {
				playVideo( "U06jlgpMtQs", member.voiceChannel );
			}
		}
		
		if (command == "kalinka") {
			if (member.voiceChannel) {
				var redpower = message.guild.emojis.find("name", "redpower");
				message.channel.send(redpower + "Special kalinka session by **" + name + "**" + redpower);
				playVideo( "4xJoVCjBUco", member.voiceChannel );
			}
		}
		
		if (command == "thot") {
			if (member.voiceChannel) {
				playFile( "thot.mp3", member.voiceChannel );
			}
		}
		
		// Music
		
		if (command == "join") {
			if (member.voiceChannel) {
				joinChannel(member.voiceChannel);
			} else {
				message.channel.send(name + ", du skal være i en VoiceChannel din tard");
			}
		}
		
		if (command == "leave") {
			leaveChannel( message.guild );
		}
		
		if (command == "play") {
			if (member.voiceChannel) {
				var id = get_video_id( args[0] );
				playVideo( id, member.voiceChannel );
			}
		}
	}
});

client.login(process.env.BOT_TOKEN);