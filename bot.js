const Discord = require('discord.js');
const client = new Discord.Client();

const prefix = "-";

client.on('ready', () => {
    console.log('BangBot has intensified!');
	client.user.setGame('BANG');
});

client.on('guildMemberAdded', member => {
	member.guild.defaultChannel.send("Velkommen " + member.guild.name + " til **Ingen Y-Kromosomer**");
});

client.on('message', message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;
    
	var command = message.content.split(" ")[0];
	command = command.slice(prefix.length).toLowerCase();
	
	var args = message.content.split(" ").slice(1);
	
	if (command == "help") {
		message.channel.send("**Kommandoer**" +
		"\n  **" + prefix + "meme** `<template>` `<top;bottom>`");
	}
	
	if (command == "meme" || command == "maymay") {
		var meme = args[0];
		var txt = args.slice(1).join(" ");
		var tbl = txt.split(";");
		if (tbl[1] != null) {
			message.channel.send('', {
				files: ["http://thefern.netau.net/api/meme/generator?meme=" + meme + "&top=" + tbl[0] + "&bottom=" + tbl[1] + "&type=.jpg"]
			});
		} else {
			message.channel.send('', {
				files: ["http://thefern.netau.net/api/meme/generator?meme=" + meme + "&top=" + tbl[0] + "&type=.jpg"]
			});
		}
	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);