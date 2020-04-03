/* When updating to a newer version:
    'channel.sendMessage' becomes 'channel.send'
*/
'use strict';

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
var afk_members = [];

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
    "lie",
    "liar"
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
    "Certainly",
	"Communism will rise",
	"*confusement*",
	"(X) Doubt",
	"Good job",
    "haha yes",
    "Haram",
	"Impossible",
	"kys",
	"Magnificent",
    "Marvellous",
    "My mom said no",
	"No",
	"Perhaps",
	"Possibly",
	"*spits*",
	"S U C C",
	"Leaving a dot here .",
	"Undoubtedly",
	"Well done",
	"Yeah boii",
	"Yee",
    "You do not no de wey",
	"Yoink"
];


function getVideoId(string) {
	var regex = /(?:\?v=|&v=|youtu\.be\/)(.*?)(?:\?|&|$)/; // /^[a-zA-Z0-9-_]{11}$/
	var matches = string.match(regex);

	if (matches) {
		return matches[1];
	} else {
		return string;
	}
}

function joinChannel( channel, run ) {
	leaveChannel();
	channel.join().then(connection => {
		voice_connection = connection;
		if (run != null) {
			run( connection );
		}
	}).catch(console.error);
}

function leaveChannel() {
	if (voice_connection != null) {
        if (voice_connection.channel != null) {
            voice_connection.channel.leave();
        }
		voice_connection = null;
		stream_handler = null;
	}
}

function playFile( file, channel ) {
	if (stream_handler != null) return;
	if (channel != null) {
		leaveChannel();
		joinChannel( channel, connection => {
			stream_handler = connection.play(file, { seek: 0, volume: 1 });
			
			stream_handler.on("finish", () => {
				if (voice_connection.channel != null) {
					voice_connection.channel.leave();
				}
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
		joinChannel( channel, connection => {
			var audio_stream = ytdl(video, { filter : 'audioonly', quality: 'highestaudio' });
			stream_handler = connection.play(audio_stream, { seek: 0, volume: 1 });
			
			stream_handler.on("finish", () => {
				if (voice_connection.channel != null) {
					voice_connection.channel.leave();
				}
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

function sendTemporaryMessage(hook, member, msg) { // Sends a message by the user via the specified hook
	hook.send(msg, {
		username: member.displayName,
		avatarURL: member.user.displayAvatarURL()
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
	if (afk_members.length > 0) {
		for (let i in afk_members) {
			let member = afk_members[i];
			setTimeout(() => {
				createTemporaryWebhook(channel).then(hook => {
                    let reply = replies[Math.floor(Math.random() * replies.length)];
                    sendTemporaryMessage(hook, member, reply);
				}).catch(console.error);
			}, 500 + Math.random()*1500);
		}
	}
}

function isAFK(member) {
	if (afk_members.indexOf(member) > -1) return true;
	return false
}

function becomeAFK(member) {
	if (isAFK(member)) return false;
	afk_members.push( member );
	return true;
}

function begoneAFK(member) {
	var pos = afk_members.indexOf(member);
	if (pos > -1) {
		afk_members.splice(pos, 1);
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
	member.guild.defaultchannel.send("Velkommen " + member.displayName + " til " + member.guild.name);
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
                message.channel.send("'**" + word.toUpperCase() + "**' is __CAPITALIST__ word. now off to *GULAG*");
				message.channel.send({
					files: ["http://thefern.netau.net/img/server.jpg"]
				});
				return;
			} else if (lies.indexOf(word) > -1) {
				message.channel.send({
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
                message.channel.send("10+ meme points to **" + name + "**");
				message.channel.send({
					files: ["http://gphone.icu/10points.png"]
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
			message.channel.send("**Kommandoer** for **" + name + "**" +
			"\n  **" + prefix + "afk**: Detroit: Become human" +
			"\n  **" + prefix + "banned** : Ulovlig kapitalistisk propaganda" +
			"\n**Musik**" +
			"\n  **" + prefix + "sound** `<sound>` : Soundboard" +
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
					sendTemporaryMessage(hook, member, "am bot gib data, beep");
				}).catch(console.error);
			}
		}
		
		if (command == "banned") {
			txt = "**Banned capitalist words**";
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
						
						message.channel.send({embed: embed});
					} else {
						message.channel.send('Could not find any item `' + search + '`');
					}
				});
			} else {
				message.channel.send('A Steam-ID is required');
			}
		}
		
		// Voice
		
		if (command == "sound") {
			if (member.voice.channel) {
                var filename = args[0];
                // var channel = guild.channels.cache.find(channel => channel.name === args[1]);
                
				if (sound_files.indexOf(filename) > -1) {
					playFile( "sound/" + filename + ".mp3", member.voice.channel );
				} else {
					var txt = "**" + prefix + "sound**";
					for (var x in sound_files) {
						txt += "\n  " + sound_files[x];
					}
					message.channel.send(txt);
				}
			}
		}
		
		// Music
		
		if (command == "leave") {
			leaveChannel( message.guild );
		}
		
		if (command == "play") {
			if (member.voice.channel) {
				var id = getVideoId( args[0] );
				playVideo( id, member.voice.channel );
			}
		}
	}
});

client.login(process.env.BOT_TOKEN);