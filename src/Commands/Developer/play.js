// In your commands file (commands.js)

const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

module.exports.execute = async (client) => {
    client.commands.set('play', {
        name: 'play',
        description: 'Plays music from a YouTube URL.',
        async execute(message, args) {
            if (!message.member.voice.channel) {
                return message.reply('You need to be in a voice channel to play music!');
            }

            const voiceChannel = message.member.voice.channel;

            if (!args.length) {
                return message.reply('Please provide a YouTube URL to play!');
            }

            const url = args[0];

            if (!ytdl.validateURL(url)) {
                return message.reply('Please provide a valid YouTube URL!');
            }

            try {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });

                const stream = ytdl(url, { filter: 'audioonly' });
                const resource = createAudioResource(stream, {
                    inputType: StreamType.Arbitrary,
                });

                const player = createAudioPlayer();
                connection.subscribe(player);
                player.play(resource);

                await message.reply(`Now playing: ${url}`);

                player.on('error', error => {
                    console.error('Error playing audio:', error);
                    connection.destroy();
                    message.channel.send('An error occurred while playing the audio.');
                });

                connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                    try {
                        await Promise.race([
                            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                        ]);
                        // Seems to be reconnecting to voice channel.
                    } catch (error) {
                        // Seems to be fully disconnected, clean up modules
                        connection.destroy();
                    }
                });

            } catch (error) {
                console.error(error);
                return message.reply('Failed to join the voice channel or play the audio.');
            }
        },
    });
};