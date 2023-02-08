// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const {commandName} = interaction;
    let ni = "This command isn't implemented yet!"; //Not Implemented

    if(commandName === 'ping') {
        await interaction.reply(`Hey hey! Latency is ${Date.now() - interaction.createdTimestamp}ms, and the API Latency is ${Math.round(client.ws.ping)}ms.`)
    }
    if(commandName === "add"){
        await interaction.reply(ni)
    }
    if (commandName === "del"){
        await interaction.reply(ni)
    }
    if (commandName === "loop"){
        await interaction.reply(ni)
    }
    if (commandName === "shuffle"){
        await interaction.reply(ni)
    }
    if (commandName === "pause"){
        await interaction.reply(ni)
    }
    if (commandName === "play"){
        await interaction.reply(ni)
    }
    if (commandName === "queue"){
        await interaction.reply(ni)
    }
});

// Log in to Discord with your client's token
client.login(token);

