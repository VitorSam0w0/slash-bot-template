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

    let connection; // Definir connection fora do try para acesso no bloco catch
    try {
      // Valida o URL
      if (!ytdl.validateURL(url)) {
        return interaction.editReply('Por favor, forneça um URL válido do YouTube!');
      }

      // Cria a conexão com o canal de voz
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      // Cria o player de áudio
      const player = createAudioPlayer();

      // Obtém o stream da música com opções mais robustas
      const stream = ytdl(url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25, // Aumenta o buffer para evitar travamentos
        dlChunkSize: 0, // Desativa chunking para melhor compatibilidade
      });

      const resource = createAudioResource(stream);
      player.play(resource);
      connection.subscribe(player);

      // Estado para rastrear se a conexão já foi destruída
      let isConnectionDestroyed = false;

      // Evento para quando a música termina
      player.on(AudioPlayerStatus.Idle, () => {
        if (!isConnectionDestroyed) {
          connection.destroy();
          isConnectionDestroyed = true;
        }
      });

      // Tratamento de erros do player
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
      if (connection && !connection.state.status === 'destroyed') {
        connection.destroy();
      }
    }
  },
};