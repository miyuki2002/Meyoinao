const Discord = require('discord.js');

module.exports = async (client, player) => {
	const embed = new Discord.MessageEmbed()
		.setDescription('Queue ended.')
		.setColor(client.colors.main);
	player.textChannel.send(embed);
	return player.destroy();
};