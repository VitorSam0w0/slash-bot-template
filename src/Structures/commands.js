const { readdirSync } = require('node:fs');
const path = require('node:path');

module.exports = {
  async execute(client) {
    const commands = client.commands;
    const PATH = path.join(process.cwd(), 'src', 'Commands');

    const folders = readdirSync(PATH);

    for (const dir of folders) {
      const folderPath = path.join(PATH, dir);
      const files = readdirSync(folderPath);

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        try {
          const cmd = require(filePath);

          if (!cmd?.data?.name) {
            console.log(`⚠️ O comando em ${filePath} está sem 'data.name', comando ignorado.`);
            continue;
          }

          commands.set(cmd.data.name, cmd);
          console.log(`✅ Comando carregado: ${cmd.data.name}`);
        } catch (err) {
          console.log(`❌ Erro ao carregar comando em ${filePath}:`, err);
          continue;
        }
      }
    }

    console.log('✅ Todos os comandos foram carregados com sucesso!');
  },
};
