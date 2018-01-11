const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const req = require('request');

const rank = JSON.parse(fs.readFileSync("rank.json", "utf8"));

const prefix = "-";
const minLength = 10;

client.on('ready', () => {
    console.log('Bang bang into the room!');
	client.user.setGame('BANG');
	client.user.setPresence({ game: { name: 'Bang Bang Bang', type: 0 } });
});

client.on('guildMemberAdded', member => {
	member.guild.defaultChannel.send("Velkommen " + member.guild.name + " til " + member.guild.name);
});

client.on('message', message => {
	var user = message.author;
	var name = user.nickname || user.username;
	
	if (user.bot) return;
	
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
		"\n  **" + prefix + "communism** : Her er vi alle lige");
	}
	
	if (command == "rank") {
		message.channel.send("**" + name + "** har sendt " + (rank[user.id] || 0) + " beskeder. Sikke en nørd");
	}
	
	if (command == "repost") {
		message.channel.send("__**MEME THIEF SPOTTED**__", {
			files: ["theft.jpg"]
		});
	}
	
	if (command == "communism") {
		message.delete();
		message.channel.send('', {
			files: ["communism.gif"]
		});
	}
	
	if (command == "memelist") {
		request('http://thefern.netau.net/api/meme/list', { json: true }, (err, res, body) => {
			if (err) { return console.log(err); }
			console.log(body.url);
			console.log(body.explanation);
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