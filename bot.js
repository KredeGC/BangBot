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
	command = command.slice(prefix.length);
	
	var args = message.content.split("").slice(1);
	
	if (command == "help") {
		message.channel.send((message.author.nickname || message.author.username) + ", er du autist eller noget?");
	}
	
	if (command == "meme") {
		message.channel.send("Finder en dank meme...");
		var att = new Discord.Attachment();
		att.setAttachment("http://thefern.netau.net/api/meme/generator?meme=thot&top=begone&bottom=thot", "thot.jpg");
		message.channel.send('file.jpg', {
			files: [att]
		});
	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);