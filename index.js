require('dotenv').config();
const { token } = require('./config.json');
const { version } = require('./version.json');
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');
const {REST} = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, GatewayIntentBits, Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Player, RepeatMode } = require("discord-player")

const fs = require('fs');
const path = require('path');


const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates]
});

// Add the player on the client
client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
})

client.on("ready", () => {
    console.log('ready')
});

const applyText = (canvas, text) => {
	const context = canvas.getContext('2d');
	let fontSize = 70;

	do {
		context.font = `${fontSize -= 10}px sans-serif`;
	} while (context.measureText(text).width > canvas.width - 300);

	return context.font;
};

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const {commandName} = interaction;

	if(commandName === 'ping') {
        await interaction.reply(`Hey hey! Latency is ${Date.now() - interaction.createdTimestamp}ms, and the API Latency is ${Math.round(client.ws.ping)}ms.`)
    }

    if(commandName == 'exit'){
        const queue = client.player.getQueue(interaction.guildId)
		if (!queue)
		{
			await interaction.reply("There are no songs in the queue")
			return;
		}

        // Deletes all the songs from the queue and exits the channel
		queue.destroy();

        await interaction.reply("Why you do this to me?")
    }
    if(commandName == 'pause'){
        const queue = client.player.getQueue(interaction.guildId)
        if (!queue)
		{
			await interaction.reply("There are no songs in the queue")
			return;
		}

        // Pause the current song
		queue.setPaused(true);

        await interaction.reply("Player has been paused.")
    }
    if(commandName == 'play'){
        // Make sure the user is inside a voice channel
		if (!interaction.member.voice.channel) return interaction.reply("You need to be in a Voice Channel to play a song.");

        // Create a play queue for the server
		const queue = await client.player.createQueue(interaction.guild);

        // Wait until you are connected to the channel
		if (!queue.connection) await queue.connect(interaction.member.voice.channel)

		//let embed = new EmbedBuilder();
        let embed;

		if (interaction.options.getSubcommand() === "song") {
            let url = interaction.options.getString("url")
            
            // Search for the song using the discord-player
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
            })

            // finish if no tracks were found
            if (result.tracks.length === 0)
                return interaction.reply("No results")

            // Add the track to the queue
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}`})

		}
        else if (interaction.options.getSubcommand() === "playlist") {

            // Search for the playlist using the discord-player
            let url = interaction.options.getString("url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
            })

            if (result.tracks.length === 0)
                return interaction.reply(`No playlists found with ${url}`)
            
            // Add the tracks to the queue
            const playlist = result.playlist
            await queue.addTracks(result.tracks)
            embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setDescription(`**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** have been added to the Queue`)

		} 
        else if (interaction.options.getSubcommand() === "search") {

            // Search for the song using the discord-player
            let url = interaction.options.getString("searchterms")
            const result = await client.player.search(url, {
                requestedBy: interaction.user
            })

            // finish if no tracks were found
            if (result.tracks.length === 0)
                return interaction.editReply("No results")
            
            // Add the track to the queue
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}`})
		}

        // Play the song
        if (!queue.playing) await queue.play()
        
        // Respond with the embed containing information about the player
        await interaction.reply({
            embeds: [embed]
        })
    }
    if(commandName == 'queue'){
        const queue = client.player.getQueue(interaction.guildId)
        if (!queue || !queue.playing)
        {
            await interaction.reply("There are no songs in the queue");
            return;
        }

        /*const queueString = queue.tracks.slice(0, 10).map((song, i) => {
            return `${i}) [${song.duration}]\` ${song.title} - <@${song.requestedBy.id}>`
        }).join("\n")*/
    
        // Create a 700x250 pixel canvas and get its context
		// The context will be used to modify the canvas
		const canvas = Canvas.createCanvas(700, 250);
		const context = canvas.getContext('2d');

        const background = await Canvas.loadImage('./Images/bg1.png');

	    // This uses the canvas dimensions to stretch the image onto the entire canvas
	    context.drawImage(background, 0, 0, canvas.width, canvas.height);

        context.font = '28px sans-serif';
		context.fillStyle = '#ffffff';
		context.fillText('queue', 150, 50);

        let space = 80;

        //limit to 40 char
        function truncate(str, length) {
            if (str.length > length) {
              return str.slice(0, length) + '...';
            } else return str;
          }

        queue.tracks.slice(0, 6).map((song, i) => {
            //return `${i}) [${song.duration}]\` ${song.title} - <@${song.requestedBy.id}>`
            context.font = '16px sans-serif';
		    context.fillStyle = '#ffffff';
		    context.fillText(`${truncate(`${i + 1}) [${song.duration}] ${song.title}`, 45)}`, 150, space);
            space += 30;
        })

        // Set the color of the stroke
	    context.strokeStyle = '#00ff00';

	    // Draw a rectangle with the dimensions of the entire canvas
	    context.strokeRect(545, 5, 150, canvas.height - 10);
	    // ...

        const currentSong = queue.current

        const thumbnail = await Canvas.loadImage(currentSong.thumbnail);
        context.drawImage(thumbnail, 550, 10, 140, 78);

        context.font = '12px sans-serif';
		context.fillStyle = '#ffffff';
		context.fillText(`${truncate(currentSong.title, 20)}`, 550, 108);
        context.fillText(`Duration: ${currentSong.duration}`, 550, 122);
    

        // Pick up the pen
	    context.beginPath();

	    // Start the arc to form a circle
	    context.arc(75, 75, 50, 0, Math.PI * 2, true);

	    // Put the pen down
	    context.closePath();

	    // Clip off the region you drew on
	    context.clip();

        // Using undici to make HTTP requests for better performance
	    const { body } = await request(client.user.avatarURL({ extension: 'jpg' }));
	    const avatar = await Canvas.loadImage(await body.arrayBuffer());

	    // If you don't care about the performance of HTTP requests, you can instead load the avatar using
	    // const avatar = await Canvas.loadImage(interaction.user.displayAvatarURL({ extension: 'jpg' }));

	    // Draw a shape onto the main canvas
	    context.drawImage(avatar, 25, 25, 100, 100);


	    // Use the helpful Attachment class structure to process the file for you
	    const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'queue-image.png' });

	    interaction.reply({ files: [attachment] });

        /*const queue = client.player.getQueue(interaction.guildId)
        // check if there are songs in the queue
        if (!queue || !queue.playing)
        {
            await interaction.reply("There are no songs in the queue");
            return;
        }

        // Get the first 10 songs in the queue
        const queueString = queue.tracks.slice(0, 10).map((song, i) => {
            return `${i}) [${song.duration}]\` ${song.title} - <@${song.requestedBy.id}>`
        }).join("\n")

        // Get the current song
        const currentSong = queue.current

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**Currently Playing**\n` + 
                        (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} - <@${currentSong.requestedBy.id}>` : "None") +
                        `\n\n**Queue**\n${queueString}`
                    )
                    .setThumbnail(currentSong.setThumbnail)
            ]
        })*/
    }
    if(commandName == 'skip'){
        const queue = client.player.getQueue(interaction.guildId)
        if(!queue)
        {
            await interaction.reply("There are no songs in the queue");
            return;
        }

        const currentSong = queue.current

        // Skip the current song
        //console.log(queue)
		queue.skipTo(0);
        // Return an embed to the user saying the song has been skipped
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#00ff00')
                    .setDescription(`${currentSong.title} has been skipped!`)
                    .setThumbnail(currentSong.thumbnail)
            ]
        })
    }
    if(commandName == 'resume'){
        const queue = client.player.getQueue(interaction.guildId)
        if (!queue)
        {
            await interaction.reply("No songs in the queue");
            return;
        }

        // Pause the current song
		queue.setPaused(false);

        await interaction.reply("Player has been resumed.")
    }
    if(commandName == 'loop'){
        const queue = client.player.getQueue(interaction.guildId)
        /*queue.setRepeatMode(2);
        await interaction.reply("queue is now set to loop.")*/
        if (interaction.options.getSubcommand() === "queue"){
            queue.setRepeatMode(2);
            await interaction.reply("queue is now set to loop.")
        }
        else if (interaction.options.getSubcommand() === "song"){
            queue.setRepeatMode(1);
            await interaction.reply("song is now set to loop.")
        }
        else if (interaction.options.getSubcommand() === "remove"){
            queue.setRepeatMode(0);
            await interaction.reply("loop removed from queue")
        }
        else await interaction.reply('error')
    }
    if(commandName == "shuffle"){
        const queue = client.player.getQueue(interaction.guildId)
        queue.shuffle(); //why is the method name not capitalized lmfao
        await interaction.reply('queue has been shuffled!')
    }
    if(commandName == "about"){
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor('#00ff00')
                    .setTitle("About Shroom Tunes:")
                    .setDescription("Developed by: Luca Thompson\nLicense: GNU 3.0\nVersion: " + version)
            ]
        })
    }
});
client.login(token);