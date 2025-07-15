const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
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
    await interaction.deferReply();

    try {
      const url = interaction.options.getString('url');

      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        return interaction.editReply({ content: 'Você precisa estar em um canal de voz!', ephemeral: true });
      }

      if (!ytdl.validateURL(url)) {
        return interaction.editReply({ content: 'Esse não parece um link válido do YouTube.', ephemeral: true });
      }

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      // Aguarda conexão estar pronta
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
      console.log('🎧 Conectado ao canal de voz!');

      const stream = ytdl(url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25
      });

      const resource = createAudioResource(stream, { inlineVolume: true });
      resource.volume.setVolume(1.0); // 100% volume

      const player = createAudioPlayer();

      player.on('stateChange', (oldState, newState) => {
        console.log(`🎵 Player mudou de ${oldState.status} para ${newState.status}`);
      });

      player.on(AudioPlayerStatus.Idle, () => {
        console.log('🔇 Playback finalizado, desconectando...');
        connection.destroy();
      });

      player.on('error', error => {
        console.error('❌ Erro no player:', error);
        connection.destroy();
      });

      player.play(resource);
      connection.subscribe(player);

      await interaction.editReply(`🎶 Tocando agora: ${url}`);

    } catch (error) {
      console.error('❌ Erro no comando play:', error);
      await interaction.editReply({ content: `Ocorreu um erro: ${error.message}`, ephemeral: true });
    }
  }
};
