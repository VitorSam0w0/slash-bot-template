const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

module.exports = {
  data: {
    name: "namegen",
    description: "Gera um nome aleatório para personagem ou gamertag"
  },

  async execute(interaction, client) {
    try {
      const response = await fetch('https://uinames.com/api/');
      const data = await response.json();

      const fullName = `${data.name} ${data.surname}`;
      await interaction.reply(`Aqui está um nome para você: **${fullName}**`);
    } catch {
      await interaction.reply('Não consegui gerar um nome agora, tenta novamente!');
    }
  }
};
