async execute(interaction, client) {
  const { TOKEN } = client.config;
  const guild = interaction.guild;
  const rest = new REST({ version: "10" });
  rest.setToken(TOKEN);

  const name = interaction.options.getString("name").toUpperCase();
  const type = interaction.options.getString("type").toUpperCase();
  const command = client.commands.get(name.toLowerCase());

  if (!command) {
    return await interaction.reply({
      embeds: [{ title: `${name} ⊗ NOT FOUND in the FILE`, color: 0xd8303b }],
      ephemeral: true,
    });
  }

  try {
    if (type === "GLOBAL") {
      await rest.post(Routes.applicationCommands(client.user.id), {
        body: command.data.toJSON(),
      });
    } else {
      await rest.post(Routes.applicationGuildCommands(client.user.id, guild.id), {
        body: command.data.toJSON(),
      });
    }

    await interaction.reply({
      embeds: [{ title: `${name} ⊕ ADDED to ${type}`, color: 0x00ffaa }],
      ephemeral: true,
    });
  } catch (error) {
    console.error('Erro ao adicionar comando:', error);
    await interaction.reply({
      content: '❌ Ocorreu um erro ao adicionar o comando.',
      ephemeral: true,
    });
  }
}
