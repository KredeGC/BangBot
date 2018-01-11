const Discord = require('discord.js');
const client = new Discord.Client();

const prefix = "-";

client.on('ready', () => {
    console.log('Bang bang into the room!');
	client.user.setGame('BANG');
});

client.on('guildMemberAdded', member => {
	member.guild.defaultChannel.send("Velkommen " + member.guild.name + " til " + member.guild.name);
});

client.on('message', message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;
    
	var command = message.content.split(" ")[0];
	command = command.slice(prefix.length).toLowerCase();
	
	var args = message.content.split(" ").slice(1);
	
	if (command == "help") {
		message.channel.send("**Kommandoer**" +
		"\n  **" + prefix + "meme** `<template>` `<top;bottom>` : Lav en dank mehmay" +
		"\n  **" + prefix + "communism** : Vi er alle lige");
	}
	
	if (command = "communism") {
		message.channel.send("https://media1.tenor.com/images/a79ad7b03efb0fd3750efa7b7d4b56fc/tenor.gif?itemid=5148606");
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