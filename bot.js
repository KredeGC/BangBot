/* When updating to a newer version:
    'channel.sendMessageMessage' becomes 'channel.sendMessage'
*/

const Discord = require('discord.js');
const request = require('request');
const ytdl = require("ytdl-core");
const fs = require('fs');

const client = new Discord.Client();

var voice_connection = null;
var stream_handler = null;

const prefix = "-";
const minLength = 8;

var active_hooks = [];
var afk_users = [];

var sound_files = [];
fs.readdir('./sound/', (err, files) => {
	files.forEach(file => {
		var snd = file.replace(/\.[^/.]+$/, "");
		sound_files.push(snd);
	});
})

const lies = [
	"lies",
	"deceit",
	"deception",
	"lying",
	"lie"
]

const capitalistWords = [
	"i",
	"my",
	"me",
	"mine",
	"buy",
	"bought",
	"jeg",
	"mig",
	"min"
];

const replies = [
	"Absolutely",
	"Absolutely Haram",
	"Bang Approves",
	"Beep",
	"Boop",
	"Communism will rise",
	"*confusement*",
	"(X) Doubt",
	"Good job",
	"Haram",
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
	"Yeah boii",
	"You do not no de wey"
];


function getVideoId(string) {
	var regex = /(?:\?v=|&v=|youtu\.be\/)(.*?)(?:\?|&|$)/;
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

function playStream( url, channel ) {
	if (stream_handler != null) return;
	if (channel != null) {
		leaveChannel( channel.guild );
		joinChannel( channel, connection => {
			stream_handler = connection.playStream(url, { seek: 0, volume: 1 });
			
			stream_handler.once("end", (reason) => {
				voice_connection.channel.leave();
				voice_connection = null;
				stream_handler = null;
			});
		});
	}
}

function playFile( file, channel ) {
	if (stream_handler != null) return;
	if (channel != null) {
		leaveChannel( channel.guild );
		joinChannel( channel, connection => {
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
		joinChannel( channel, connection => {
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

function createTemporaryWebhook(channel) { // Returns a promise with a hook
	return channel.createWebhook("Temporary Webhook").then(hook => {
		active_hooks.push(hook);
		return hook;
	}).catch(console.error);
}

function removeTemporaryWebhook(hook) { // Remove a temporary hook
	var pos = active_hooks.indexOf(hook);
	if (pos > -1) {
		active_hooks.splice(pos, 1);
		hook.delete();
	}
}

function sendTemporaryMessage(hook, user, msg) { // Sends a message by the user via the specified hook
	hook.sendMessage(msg, {
		username: user.username,
		avatarURL: user.avatarURL
	}).then(() => {
		removeTemporaryWebhook(hook);
	}).catch(console.error);
}

function clearTemporaryWebhooks(guild) { // Clear all non-active hooks
	guild.fetchWebhooks().then(collection => {
		var hooks = collection.array();
		for (var i in hooks) {
			var hook = hooks[i]
			if (hook.name != "Temporary Webhook") continue;
			if (hook.channelID in active_hooks) continue;
			hook.delete();
		}
	}).catch(console.error);
}

function sendAFKMessages(channel) { // Send AFK messages to channel
	if (afk_users.length > 0) {
		for (var i in afk_users) {
			var id = afk_users[i];
			setTimeout(() => {
				createTemporaryWebhook(channel).then(hook => {
					client.fetchUser(id).then(user => {
						var reply = replies[Math.floor(Math.random() * replies.length)];
						sendTemporaryMessage(hook, user, reply);
					}).catch(console.error);
				}).catch(console.error);
			}, 500 + Math.random()*1500);
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
	return true;
}

function begoneAFK(user) {
	var pos = afk_users.indexOf(user.id);
	if (pos > -1) {
		afk_users.splice(pos, 1);
		return true;
	}
	return false;
}

client.on('ready', () => {
    console.log('Bang bang into the room!');
	client.user.setPresence({ game: { name: '-help', type: 0 } });
});

/*client.on('messageReactionAdd', (react, user) => {
	if (user.bot) return;
	var name = react.emoji.name;
	if (name == "👌" || name == "⭐") {
		react.message.channel.sendMessage("10+ meme points to **" + user.username + "**", {
			files: ["http://thefern.netau.net/img/10points.png"]
		});
	}
	react.remove(user);
});*/

client.on('guildMemberAdd', member => {
	member.guild.defaultchannel.sendMessage("Velkommen " + member.displayName + " til " + member.guild.name);
});

client.on('message', message => {
	if (message.author.bot) return;
	if (!message.guild.available) return;
	
	var user = message.author;
	var member = message.member;
	var name = member && member.displayName || "";
	var msg = message.content;
	
	if (!msg.startsWith(prefix)) {
		if (isAFK(user)) {
			message.delete();
			user.send("Du er AFK. Skriv `" + prefix + "afk` for at blive aktiv");
			return;
		}
		
		var msg = msg.replace(/[^a-z]/gmi, "").toLowerCase();
		var txt = msg.split(" ");
		for (var x in txt) {
			var word = txt[x];
			if (capitalistWords.indexOf(word) > -1) {
				message.channel.sendMessage("'**" + word.toUpperCase() + "**' is __CAPITALIST__ word. now off to *GULAG*", {
					files: ["http://thefern.netau.net/img/server.jpg"]
				});
				return;
			} else if (lies.indexOf(word) > -1) {
				message.channel.sendMessage("", {
					files: ["http://thefern.netau.net/img/deception.png"]
				});
				return;
			} else if (word == "anna") {
				message.delete();
				user.send("Fuck dig");
				return;
			}
		}
		
		if (msg.length > minLength) {
			if (Math.random() > 0.95) {
				message.channel.sendMessage("10+ meme points to **" + name + "**", {
					files: ["http://thefern.netau.net/img/10points.png"]
				});
			}
		}
		
		clearTemporaryWebhooks(message.guild);
		
		sendAFKMessages(message.channel);
	} else {
		var command = msg.split(" ")[0];
		command = command.slice(prefix.length).toLowerCase();
		var args = msg.replace(/\n/g, " ").split(" ").slice(1);
		
		message.delete();
		
		if (command == "help") {
			message.channel.sendMessage("**Kommandoer** for **" + name + "**" +
			"\n  **" + prefix + "meme** `<template>` `<top;bottom>` : Lav en dank mehmay" +
			"\n  **" + prefix + "afk**: Detroit: Become human" +
			"\n  **" + prefix + "banned** : Ulovlig kapitalistisk propaganda" +
			"\n  **" + prefix + "lectio** `<2.6|2.4>`: F� skemaet" +
			"\n**Voice Channel**" +
			"\n  **" + prefix + "communism** : Comrade Stalin approves" +
			"\n  **" + prefix + "kalinka** : Start kalinka session" +
			"\n  **" + prefix + "skadoo** : Do u no de wey" +
			"\n  **" + prefix + "sound** `<sound>` : Soundboard" +
			"\n  **" + prefix + "tts** `<text>` : Text-to-speech" +
			"\n**Musik**" +
			"\n  **" + prefix + "join** : Join my meinkraft server" +
			"\n  **" + prefix + "leave** : Unsubscribble to my channel" +
			"\n  **" + prefix + "play** : Lyt til ulovlige youtube videoer");
		}
		
		// Commands
		
		if (command == "afk") {
			if (isAFK(user)) {
				begoneAFK(user);
			} else {
				becomeAFK(user);
				createTemporaryWebhook(message.channel).then(hook => {
					sendTemporaryMessage(hook, user, "am bot gib data, beep");
				}).catch(err => {
					console.error(err);
				});
			}
		}
		
		if (command == "role") {
			
		}
		
		if (command == "meme") {
			if (args[0] && args[1]) {
				var txt = args.slice(1).join(" ");
				var tbl = txt.split(";");
				
				var url = "http://thefern.netau.net/api/meme/generator?meme=" + args[0];
				
				if (tbl[1] != null) {
					url += "&top=" + tbl[0] + "&bottom=" + tbl[1];
				} else {
					url += "&top=" + tbl[0];
				}
				
				message.channel.sendMessage("Meme Copyright by **" + name + "**", {
					files: [url + "&type=.jpg"]
				});
			} else {
				request('http://thefern.netau.net/api/meme/list', { json: true }, (err, res, body) => {
					if (err) return console.log(err);
					var txt = "**Holy list of meme templates**";
					for (i = 0; i < body.length; i++) {
						txt += "\n  " + body[i];
					}
					
					message.channel.sendMessage(txt);
				});
			}
		}
		
		if (command == "banned") {
			txt = "**Banned capitalist words**";
			for (var x in capitalistWords) {
				 txt += "\n  " + capitalistWords[x];
			}
			message.channel.sendMessage(txt);
		}
		
		if (command == "item") {
			var id =  args[0]; // 76561198077944666
			var search = args.slice(1).join(" ").toLowerCase();
			if (id != null && search != null) {
				request('http://steamcommunity.com/inventory/' + id + '/440/2?l=english&count=5000', { json: true }, (err, res, body) => {
					if (err) return console.log(err);
					if (!body['descriptions']) return;
					var inv = body['descriptions'];
					var item = null;
					for (var i in inv) {
						var name = inv[i]['name'].toLowerCase();
						if (name.indexOf(search) > -1) {
							item = inv[i];
							break;
						}
					}
					if (item != null) {
						var name = item['name'] || 'Unknown';
						var desc = '';
						var type = item['type'];
						var color = '#' + (item['name_color'] || 'FFFFFF');
						var img = 'http://community.edgecast.steamstatic.com/economy/image/' + item['icon_url_large'];
						
						for (var i in item['descriptions']) {
							desc += '\n' + item['descriptions'][i]['value'];
						}
						
						var embed = new Discord.RichEmbed()
							.setTitle(name)
							.setDescription(desc)
							.setThumbnail(img)
							.setColor(color)
							.setFooter('Taken from Steam');
						
						if (type) {
							embed.addField('Type', type);
						}
						
						if (item['tradable'] && item['tradable'] == '1') {
							embed.addField('Tradable', 'Yes');
						} else {
							embed.addField('Tradable', 'No');
						}
						
						if (item['marketable'] && item['marketable'] == '1') {
							embed.addField('Marketable', 'Yes');
						} else {
							embed.addField('Marketable', 'No');
						}
						
						message.channel.sendMessage({embed});
					} else {
						message.channel.sendMessage('Could not find any item `' + search + '`');
					}
				});
			} else {
				message.channel.sendMessage('A Steam-ID is required');
			}
		}
		
		if (command == "lectio") {
			var arg = args[0];
			var id = '';
			var name = '';
			if (arg == "2.6") {
				id = '22303833699';
				name = arg;
			} else if(arg == "2.4") {
				id = '22352172603';
				name = arg;
			}
			if (id == '') {
				message.channel.sendMessage("**-lectio** `2.6` eller `2.4`");
			} else {
				request('http://thefern.netau.net/api/lectio/schedule?school=523&student=' + id, { json: true }, (err, res, body) => {
					if (err) return console.log(err);
					var noter = body['dayschedule']['notes'];
					var lessons = body['dayschedule']['lessons'];
					var txt = "```glsl\n#" + body['day'] + " " + name;
					
					for (time in lessons) {
						var lesson = lessons[time];
						txt += "\n[" + time + '] ' + lesson.title + ' ' + lesson.classroom.join(", ");
					}
					
					txt += "\n#Noter";
					
					for (i = 0; i < noter.length; i++) {
						txt += "\n" + noter[i];
					}
					
					txt += "```";
					
					message.channel.sendMessage(txt);
				});
			}
		}
		
		// Voice
		
		if (command == "communism") {
			var redstar = message.guild.emojis.find("name", "redstar");
			var marx = message.guild.emojis.find("name", "marx");
			var stalin = message.guild.emojis.find("name", "stalin");
			message.channel.sendMessage(redstar + "Special tribute to " + marx + "**Marx**, " + stalin + "**Stalin** and **Lenin** from **" + name + "**" + redstar, {
				files: ["http://thefern.netau.net/img/communism.gif"]
			});
			if (member.voiceChannel) {
				playVideo( "U06jlgpMtQs", member.voiceChannel );
			}
		}
		
		if (command == "kalinka") {
			if (member.voiceChannel) {
				var redpower = message.guild.emojis.find("name", "redpower");
				message.channel.sendMessage(redpower + "Special kalinka session by **" + name + "**" + redpower);
				playVideo( "4xJoVCjBUco", member.voiceChannel );
			}
		}
		
		if (command == "skadoo") {
			if (member.voiceChannel) {
				playVideo( "ZUODMHX7ZuU", member.voiceChannel );
			}
		}
		
		if (command == "fine") {
			if (member.voiceChannel) {
				playVideo( "5PdXIHGvMpk", member.voiceChannel );
			}
		}
		
		if (command == "sound") {
			if (member.voiceChannel) {
				var arg = args[0];
				if (sound_files.indexOf(arg) > -1) {
					playFile( "sound/" + arg + ".mp3", member.voiceChannel );
				} else {
					var txt = "**" + prefix + "sound**";
					for (var x in sound_files) {
						txt += "\n  " + sound_files[x];
					}
					message.channel.sendMessage(txt);
				}
			}
		}
		
		if (command == "tts") {
			var url = "https://talk.moustacheminer.com/api/gen.wav?dectalk=";
			var talk = args.join("%20");
			playStream( url + talk, member.voiceChannel );
		}
		
		// Music
		
		if (command == "join") {
			if (member.voiceChannel) {
				joinChannel(member.voiceChannel);
			} else {
				message.channel.sendMessage(name + ", du skal være i en VoiceChannel din tard");
			}
		}
		
		if (command == "leave") {
			leaveChannel( message.guild );
		}
		
		if (command == "play") {
			if (member.voiceChannel) {
				var id = getVideoId( args[0] );
				playVideo( id, member.voiceChannel );
			}
		}
	}
});

client.login(process.env.BOT_TOKEN);