const { readdirSync } = require("node:fs");

module.exports = {
  async execute(client) {
    const commands = client.commands;
    const PATH = process.cwd() + "/src/Commands";

    const folders = readdirSync(PATH);
    for (let dir of folders) {
      const folder = readdirSync(`${PATH}/${dir}`);

      for (let file of folder) {
        const cmd = require(`${PATH}/${dir}/${file}`);

        // Verifica se o comando tem data e name
        if (!cmd?.data?.name) {
          console.log(`⚠️  O comando em ${PATH}/${dir}/${file} está sem 'data.name', comando ignorado.`);
          continue; // Pula esse comando
        }

        commands.set(cmd.data.name, cmd);
        console.log(`✅ Comando carregado: ${cmd.data.name}`);
      }
    }

    console.log("✅ Todos os comandos foram carregados com sucesso!");
  },
};