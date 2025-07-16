const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Toca uma música a partir de um link do YouTube.')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('O link da música para tocar.')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply('Você precisa estar em um canal de voz para usar este comando!');
    }

    const url = interaction.options.getString('url');

    let connection;
    try {
      if (!ytdl.validateURL(url)) {
        return interaction.editReply('Por favor, forneça um URL válido do YouTube!');
      }

      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      const stream = ytdl(url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
        dlChunkSize: 0,
      });

      const resource = createAudioResource(stream);
      player.play(resource);
      connection.subscribe(player);

      let isConnectionDestroyed = false;

      player.on(AudioPlayerStatus.Idle, () => {
        if (!isConnectionDestroyed) {
          connection.destroy();
          isConnectionDestroyed = true;
        }
      });

      player.on('error', error => {
        console.error('Erro no player:', error);
        interaction.editReply('Ocorreu um erro ao tentar tocar a música.');
        if (!isConnectionDestroyed) {
          connection.destroy();
          isConnectionDestroyed = true;
        }
      });

      await interaction.editReply(`Tocando música do link: ${url}`);
    } catch (error) {
      console.error('Erro ao executar o comando play:', error);
      await interaction.editReply('Ocorreu um erro ao processar o comando. Verifique o URL ou tente novamente mais tarde.');
      if (connection && connection.state.status !== 'destroyed') {
        connection.destroy();
      }
    }
  },
};