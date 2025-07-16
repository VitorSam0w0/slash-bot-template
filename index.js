const { Client, GatewayIntentBits, Collection } = require('discord.js');

class BotClient extends Client {
  constructor() {
    super({ intents: [GatewayIntentBits.Guilds] });
    this.commands = new Collection();
  }

  async start(config) {
    // carrega comandos, eventos etc

    await this.login(config.TOKEN);  // Aqui entra o token correto!
    console.log('Bot online!');
  }
}

module.exports = new BotClient();
