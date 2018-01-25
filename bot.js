const Discord = require('discord.js');
const request = require('request');
const ytdl = require("ytdl-core");
const fs = require('fs');

const client = new Discord.Client();

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
	"confusement",
	"Doubt",
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


function get_video_id(string) {
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

function sendAFKMessages() {
	for (var i in afk_users) {
		var id = afk_users[i];
		client.fetchUser(id).then(user => {
			var reply = replies[Math.floor(Math.random()*replies.length)];
			afk_hook.send(reply, {
				username: user.username,
				avatarURL: user.avatarURL,
			}).then(message => {
				if (i == afk_users.length-1) {
					afk_hook.delete();
					afk_hook = null;
					afk_timer = null;
				}
			});
		});
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

// Inv Pics - http://community.edgecast.steamstatic.com/economy/image/[PIC]
// http://steamcommunity.com/inventory/76561198077944666/440/2?l=english&count=5000

client.on('ready', () => {
    console.log('Bang bang into the room!');
	client.user.setPresence({ game: { name: '-help', type: 0 } });
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
		if (isAFK(user)) {
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
		}
		
		if (afk_timer != null) {
			clearTimeout(afk_timer);
		} else {
			message.guild.fetchWebhooks().then(collection => {
				var hooks = collection.array();
				if (hooks) {
					for (var i in hooks) {
						console.log(hooks[i]);
						if (hooks[i].name === "AFK Webhook") {
							hooks[i].delete();
						}
					}
				}
			});
		}
		
		message.channel.createWebhook("AFK Webhook").then(hook => {
			afk_hook = hook;
			afk_timer = setTimeout(sendAFKMessages, 1000 + Math.random()*1000);
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
			if (isAFK(user)) {
				begoneAFK(user);
			} else {
				becomeAFK(user);
				message.channel.createWebhook("AFK Webhook").then(hook => {
					hook.send("am bot gib data, beep", {
						username: user.username,
						avatarURL: user.avatarURL,
					}).then(message => {
						hook.delete();
					});
				});
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
		
		if (command == "item") {
			var id =  args[0]; // 76561198077944666
			var search = args.slice(1).join(" ").toLowerCase();
			if (id != null && search != null) {
				request('http://steamcommunity.com/inventory/' + id + '/440/2?l=english&count=5000', { json: true }, (err, res, body) => {
					if (err) { return console.log(err); }
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
						
						message.channel.send({embed});
					} else {
						message.channel.send('Could not find any item `' + search + '`');
					}
				});
			} else {
				message.channel.send('A Steam-ID is required');
			}
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
				message.channel.send("**BEGONE THOT!**");
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