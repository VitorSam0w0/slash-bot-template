const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const playdl = require('play-dl');
const ytdl = require('ytdl-core');

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

      let resource;
      try {
        // Tenta tocar com play-dl
        const stream = await playdl.stream(url);
        console.log('🎶 Stream com play-dl iniciado');
        resource = createAudioResource(stream.stream, { inputType: stream.type, inlineVolume: true });
      } catch (err) {
        console.warn('⚠️ Falha com play-dl, tentando ytdl-core...');
        // fallback para ytdl-core
        if (!ytdl.validateURL(url)) throw new Error('URL inválido para ytdl-core também');
        const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 });
        resource = createAudioResource(stream, { inlineVolume: true });
      }

      resource.volume.setVolume(1.0);

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
