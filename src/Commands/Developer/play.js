// commands/play.js
const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song from YouTube.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The YouTube URL or song name.')
                .setRequired(true)),
    async execute(interaction) {
        const query = interaction.options.getString('query');
        const queue = useQueue(interaction.guildId);

        if (!interaction.member.voice.channel) {
            return await interaction.reply({ content: 'You need to be in a voice channel!', ephemeral: true });
        }

        if (queue && queue.channelId !== interaction.member.voice.channelId) {
            return await interaction.reply({ content: 'You are not in the same voice channel as the bot!', ephemeral: true });
        }

        try {
            await interaction.deferReply();
            const searchResult = await interaction.client.player.search(query, { requestedBy: interaction.user });

            if (!searchResult.hasTracks()) {
                return await interaction.editReply(`No tracks found for "${query}"`);
            }

            const { track } = await interaction.client.player.play(interaction.member.voice.channel, searchResult.tracks[0]);

            return await interaction.editReply(`Now playing: **${track.title}** by ${track.author}`);

        } catch (error) {
            console.error(error);
            await interaction.editReply('There was an error trying to play the music!');
        }
    },
};