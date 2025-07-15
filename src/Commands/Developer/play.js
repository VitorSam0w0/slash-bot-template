const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const playdl = require('play-dl');

module.exports = {
  data: {
    name: "play",
    description: "Toca música ou vídeo do YouTube no canal de voz",
    options: [
      {
        name: 'url',
        description: 'Link do YouTube para tocar',
        type: 3,
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

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
      console.log('🎧 Conectado ao canal de voz!');

      // Usar só play-dl
      const stream = await playdl.stream(url);
      const resource = createAudioResource(stream.stream, { inputType: stream.type, inlineVolume: true });
      resource.volume.setVolume(1);

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
