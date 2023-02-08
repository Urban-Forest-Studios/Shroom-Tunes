const { REST, Routes } = require('discord.js');
const { token } = require('./config.json');

const commands = [
    new SlashCommandBuilder().setName('exit')
        .setDescription('Leave the current channel.'),

    new SlashCommandBuilder().setName('loop')
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

    new SlashCommandBuilder().setName('pause')
        .setDescription('Pause current song'),

    new SlashCommandBuilder().setName('ping')
        .setDescription('Check bot latency and API latency.'),

    new SlashCommandBuilder().setName('play')
        .setDescription('Add a song to the queue.'),

    new SlashCommandBuilder().setName('queue')
        .setDescription('List the current queue.'),

    new SlashCommandBuilder().setName('resume')
        .setDescription('Resume the current song.'),

    new SlashCommandBuilder().setName('shuffle')
        .setDescription('Shuffle the current queue.'),

    new SlashCommandBuilder().setName('skip')
        .setDescription('Skips the current song.'),

    new SlashCommandBuilder().setName('about')
        .setDescription('About shroom tunes.'),

    new SlashCommandBuilder().setName('Help')
        .setDescription('How to use shroom tunes.'),

]
    .map(command => command.toJSON());

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '9' }).setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands("1072746891382628413"),//, "1072748068413386752"),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();