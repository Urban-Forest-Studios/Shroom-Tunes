const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const {guildID, clientID, token} = require('./config.json');

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('check bot status!'),
    new SlashCommandBuilder().setName('add').setDescription('add a song to  queue!'),
    new SlashCommandBuilder().setName('del').setDescription('deletes a song at a specific index in the queue!'),
    new SlashCommandBuilder().setName('queue').setDescription('send the current queue of songs!'),
    new SlashCommandBuilder().setName('pause').setDescription('pause playback'),
    new SlashCommandBuilder().setName('play').setDescription('resume playback'),
    new SlashCommandBuilder().setName('loop').setDescription('loop the queue or the current song'),
    new SlashCommandBuilder().setName('shuffle').setDescription('shuffle the indexes of all songs in the queue'),
]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands("1072746891382628413"), //make this the client ID
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();