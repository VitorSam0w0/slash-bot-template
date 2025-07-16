const { Client, Collection, GatewayIntentBits } = require('discord.js');

class BotClient extends Client {
  constructor() {
    super({ intents: [GatewayIntentBits.Guilds] });
    this.commands = new Collection();
  }

  async start(config) {
    // Aqui você pode carregar comandos e eventos
    console.log('Iniciando carregamento dos comandos...');

    // Exemplo: carregar comandos (você pode adaptar para sua estrutura)
    // await this.loadCommands();

    this.once('ready', () => {
      console.log(`Bot online! Usuário: ${this.user.tag}`);
    });

    await this.login(config.TOKEN);
  }
}

module.exports = new BotClient();
