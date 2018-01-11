const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

var rank = JSON.parse(fs.readFileSync("rank.json", "utf8"));

const prefix = "-";

client.on('ready', () => {
    console.log('Bang bang into the room!');
	client.user.setGame('BANG');
	client.user.setPresence({ game: { name: 'Bang Bang Bang', type: 0 } });
});

client.on('guildMemberAdded', member => {
	member.guild.defaultChannel.send("Velkommen " + member.guild.name + " til " + member.guild.name);
});

client.on('message', message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;
    
	var user = message.author;
	var command = message.content.split(" ")[0];
	command = command.slice(prefix.length).toLowerCase();
	var args = message.content.split(" ").slice(1);
	
	if (!rank[user.id]) rank[user.id] = 0;
	
	rank[user.id]++;
	
	if (rank[user.id] % 2 == 0) {
		message.channel.send("");
	}
	
	fs.writeFile("rank.json", JSON.stringify(rank), (err) => {
		if (err) console.error(err);
	});
	
	if (command == "help") {
		message.channel.send("**Kommandoer**" +
		"\n  **" + prefix + "meme** `<template>` `<top;bottom>` : Lav en dank mehmay" +
		"\n  **" + prefix + "communism** : Vi er alle lige");
	}
	
	if (command == "rank") {
		message.channel.send(user.nickname + " har sendt " + rank[user.id] + " beskeder. Sikke en nørd");
	}
	
	if (command == "communism") {
		message.delete();
		message.channel.send('', {
			files: ["communism.gif"]
		});
	}
	
	if (command == "meme" || command == "maymay") {
		message.delete();
		var meme = args[0];
		var txt = args.slice(1).join(" ");
		var tbl = txt.split(";");
		
		var url = "http://thefern.netau.net/api/meme/generator?meme=";
		var end = "&type=.jpg";
		
		if (tbl[1] != null) {
			message.channel.send('', {
				files: [url + meme + "&top=" + tbl[0] + "&bottom=" + tbl[1] + end]
			});
		} else {
			message.channel.send('', {
				files: [url + meme + "&top=" + tbl[0] + end]
			});
		}
	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);