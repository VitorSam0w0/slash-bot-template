const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

module.exports = {
  data: {
    name: "joke",
    description: "Conta uma piada brasileira engraçada"
  },

  async execute(interaction, client) {
    try {
      const response = await fetch('https://api.b7web.com.br/piadas/api/piadas.json');
      const data = await response.json();

      // Escolhe uma piada aleatória
      const randomIndex = Math.floor(Math.random() * data.length);
      const joke = data[randomIndex];

      // Resposta: a piada fica no campo 'piada'
      await interaction.reply(joke.piada);
    } catch {
      await interaction.reply('Ops, não consegui pegar a piada agora!');
    }
  }
};
