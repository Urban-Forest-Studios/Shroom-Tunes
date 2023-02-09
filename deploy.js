const { REST, Routes } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { token } = require('./config.json');

const commands = [
    new SlashCommandBuilder()
        .setName('exit')
        .setDescription('Leave the current channel.'),

    new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Change queue loop settings.')
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

    new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause current song'),

    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency and API latency.'),

    new SlashCommandBuilder()
        .setName('play')
        .setDescription('Add a song to the queue.')
        .addSubcommand(subcommand =>
			subcommand
				.setName("song")
				.setDescription("loops the current queue")
                .addStringOption(option => option.setName("url").setDescription("the song's url").setRequired(true))
		)
        .addSubcommand(subcommand =>
			subcommand
				.setName("playlist")
				.setDescription("loops the current queue")
                .addStringOption(option => option.setName("url").setDescription("the playlist's url").setRequired(true))
		)
        .addSubcommand(subcommand =>
			subcommand
				.setName("search")
				.setDescription("loops the current queue")
                .addStringOption(option =>
					option.setName("searchterms").setDescription("search keywords").setRequired(true)
				)
		),

    new SlashCommandBuilder()
        .setName('queue')
        .setDescription('List the current queue.'),

    new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the current song.'),

    new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the current queue.'),

    new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song.'),

    new SlashCommandBuilder()
        .setName('about')
        .setDescription('About shroom tunes.'),

]
    .map(command => command.toJSON());

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands("1072746891382628413"),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();


//1072746891382628413