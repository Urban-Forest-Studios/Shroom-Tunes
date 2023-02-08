const { EmbedBuilder } = require("discord.js")
const { SlashCommandBuilder } = require('discord.js');
const { QueryType } = require("discord-player")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('set queue loop')
        .addSubcommand(subcommand =>
			subcommand
				.setName("queue")
				.setDescription("loops the current queue")
		)
        .addSubcommand(subcommand =>
			subcommand
				.setName("song")
				.setDescription("loops the current song")
		)
        .addSubcommand(subcommand =>
			subcommand
				.setName("remove")
				.setDescription("removes the loop from the queue or song")
		),
	async execute(interaction, client) {
		await interaction.reply(`Hey hey! Latency is ${Date.now() - interaction.createdTimestamp}ms, and the API Latency is ${Math.round(client.ws.ping)}ms.`)
	},
};