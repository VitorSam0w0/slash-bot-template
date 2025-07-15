const { REST } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: {
    name: "joke",
    description: "Conta uma piada engraçada usando API"
  },

  async execute(interaction, client) {
    try {
      const response = await fetch('https://official-joke-api.appspot.com/jokes/random');
      const data = await response.json();
      await interaction.reply(`${data.setup} ... ${data.punchline}`);
    } catch {
      await interaction.reply('Ops, não consegui pegar a piada agora!');
    }
  }
};
