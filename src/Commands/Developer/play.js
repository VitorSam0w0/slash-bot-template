const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

module.exports = {
    data: {
        name: "play",
        description: "Toca música ou vídeo do YouTube no canal de voz",
        options: [
            {
                name: 'url',
                description: 'Link do YouTube para tocar',
                type: 3, // String
                required: true
            }
        ]
    },

    async execute(interaction, client) {
        const url = interaction.options.getString('url');

        // verifica se o usuário está em um canal de voz
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: 'Você precisa estar em um canal de voz!', ephemeral: true });
        }

        // verifica se o link é válido
        if (!ytdl.validateURL(url)) {
            return interaction.reply({ content: 'Esse não parece um link válido do YouTube.', ephemeral: true });
        }

        // conecta no canal de voz
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        const stream = ytdl(url, { filter: 'audioonly' });
        const resource = createAudioResource(stream);
        const player = createAudioPlayer();

        player.play(resource);
        connection.subscribe(player);

        await interaction.reply(`🎵 Tocando agora: ${url}`);

        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
        });

        player.on('error', error => {
            console.error('Erro no player:', error);
            connection.destroy();
        });
    }
};
