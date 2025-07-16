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
    // Defer a resposta para evitar timeout em operações demoradas
    await interaction.deferReply();

    // Obtém o canal de voz do usuário
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply('Você precisa estar em um canal de voz para usar este comando!');
    }

    // Obtém o URL fornecido pelo usuário
    const url = interaction.options.getString('url');

    try {
      // Verifica se o URL é válido
      if (!ytdl.validateURL(url)) {
        return interaction.editReply('Por favor, forneça um URL válido do YouTube!');
      }

      // Cria a conexão com o canal de voz
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      // Cria o player de áudio
      const player = createAudioPlayer();

      // Obtém o stream da música
      const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
      const resource = createAudioResource(stream);

      // Toca a música
      player.play(resource);
      connection.subscribe(player);

      // Evento para quando a música termina
      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy(); // Desconecta o bot após a música terminar
      });

      // Tratamento de erros do player
      player.on('error', error => {
        console.error('Erro no player:', error);
        interaction.editReply('Ocorreu um erro ao tentar tocar a música.');
        connection.destroy();
      });

      // Responde ao usuário
      await interaction.editReply(`Tocando música do link: ${url}`);
    } catch (error) {
      console.error('Erro ao executar o comando play:', error);
      await interaction.editReply('Ocorreu um erro ao processar o comando.');
    }
  },
};