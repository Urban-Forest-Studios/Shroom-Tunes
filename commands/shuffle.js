const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Shuffles the queue'),
	async execute(interaction, client) {
		await interaction.reply(`Hey hey! Latency is ${Date.now() - interaction.createdTimestamp}ms, and the API Latency is ${Math.round(client.ws.ping)}ms.`)
	},
};