const Discord = require('discord.js');
const client = new Discord.Client();

const http = require('http');
const fs = require('fs');

const prefix = "-";

client.on('ready', () => {
    console.log('BangBot intensifies!');
	client.user.setGame('BANG');
});

client.on('guildMemberAdded', member => {
	member.guild.defaultChannel.send("Velkommen " + member.guild.name + " til **Ingen Y-Kromosomer**");
});

client.on('message', message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;
    
	var command = message.content.split(" ")[0];
	command = command.slice(prefix.length);
	
	var args = message.content.split("").slice(1);
	
	if (command == "help") {
		message.channel.send((message.author.nickname || message.author.username) + ", er du autist eller noget?");
	}
	
	if (command == "meme") {
		message.channel.send("Finder en dank meme...");
		var file = fs.createWriteStream("file.jpg");
		var request = http.get("http://thefern.netau.net/api/meme/generator?meme=thot&top=begone&bottom=thot", function(response) {
			response.pipe(file);
			message.channel.send('', {
				files: ["file.jpg"]
			})
			fs.unlinkSync("file.jpg");
		});
	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);