const fetch = require('node-fetch');

module.exports = {
  data: {
    name: "techfact",
    description: "Conta uma curiosidade tech usando API"
  },

  async execute(interaction, client) {
    try {
      const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en&category=technology');
      const data = await response.json();

      if (data && data.text) {
        await interaction.reply(data.text);
      } else {
        await interaction.reply('Não consegui pegar uma curiosidade tech agora, tenta de novo!');
      }
    } catch {
      await interaction.reply('Erro ao buscar a curiosidade tech.');
    }
  }
};
