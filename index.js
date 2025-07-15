const { Client, Collection, GatewayIntentBits } = require('discord.js');
const commandLoader = require('./CommandsLoader'); // Ajuste o caminho conforme seu projeto

class BotClient extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
  }

  async start(config) {
    // Carregar comandos
    await commandLoader.execute(this);

    // Login do bot
    this.login(config.TOKEN);

    // Aqui você pode adicionar outros eventos, por exemplo:
    this.on('ready', () => {
      console.log(`🤖 Bot online como ${this.user.tag}`);
    });

    this.on('interactionCreate', async interaction => {
      if (!interaction.isCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, this);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Erro ao executar o comando!', ephemeral: true });
      }
    });
  }
}

module.exports = { start: (config) => {
  const client = new BotClient({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });
  client.start(config);
}};
