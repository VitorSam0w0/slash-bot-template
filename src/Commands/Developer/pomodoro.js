const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pomodoro')
    .setDescription('Inicia um timer Pomodoro para foco ou descanso.')
    .addStringOption(option =>
      option.setName('modo')
        .setDescription('Escolha o tipo de sessão.')
        .setRequired(true)
        .addChoices(
          { name: 'Foco Curto (25 min)', value: '25' },
          { name: 'Foco Longo (50 min)', value: '50' },
          { name: 'Pausa Curta (5 min)', value: '5' },
          { name: 'Pausa Longa (15 min)', value: '15' },
        )
    ),

  async execute(interaction) {
    const tempoEscolhido = interaction.options.getString('modo');
    const tempoEmMinutos = parseInt(tempoEscolhido);
    const usuario = interaction.user;

    await interaction.reply(`🍅 Pomodoro iniciado por **${tempoEmMinutos} minutos**. Eu aviso você, ${usuario}, quando acabar!`);

    setTimeout(() => {
      interaction.followUp(`⏰ Ei ${usuario}, seu tempo de **${tempoEmMinutos} minutos** acabou! ${tempoEmMinutos > 15 ? 'Hora da pausa!' : 'Volte ao foco!'}`);
    }, tempoEmMinutos * 60 * 1000);
  },
};
