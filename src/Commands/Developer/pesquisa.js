const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'pesquisa',
    description: 'Busca uma imagem pelo termo pesquisado',
    options: [
      {
        name: 'termo',
        description: 'O que você quer pesquisar?',
        type: 3, // STRING
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken('SEU_TOKEN_AQUI');

(async () => {
  try {
    console.log('Registrando comandos...');
    await rest.put(
      Routes.applicationGuildCommands('SEU_CLIENT_ID', 'SEU_GUILD_ID'),
      { body: commands }
    );
    console.log('Comandos registrados com sucesso!');
  } catch (error) {
    console.error(error);
  }
})();
