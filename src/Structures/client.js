// src/Structures/client.js
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { Player } = require("discord-player");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates, // Essential for voice commands
        GatewayIntentBits.MessageContent,   // If you plan to handle text commands in future
    ],
    presence: {
        activities: [{ name: "inicializando o Paradoxo...", type: 0 }],
        status: "dnd",
    },
});

client.commands = new Collection();
client.player = new Player(client); // Initialize discord-player

module.exports.start = async (config) => {
    client.config = config;

    console.log("loading commands...");
    await require("../handlers/command.js").execute(client);
    console.log("loading events...");
    await require("../handlers/event.js").execute(client);

    client.once("ready", () => {
        console.log(`✅ Bot online como ${client.user.tag}`);

        // 🌀 Troca de presença a cada 1 minuto
        const statusList = [
            { name: "o fIM dEsse mUndo foDido", type: 0 },
            { name: "você tentando entender", type: 3 },
            { name: "o tempo se dobrar", type: 2 },
            { name: "um paradoxo sem fim", type: 0 },
            { name: "o caos acontecer", type: 3 },
        ];

        let i = 0;
        setInterval(() => {
            client.user.setPresence({
                activities: [statusList[i]],
                status: "dnd",
            });
            i = (i + 1) % statusList.length;
        }, 60 * 1000); // troca a cada 1 minuto

        // 🖼️ Troca de avatar a cada 1 hora
        const avatarFolder = path.join(__dirname, "../../avatars");
        const avatars = fs.readdirSync(avatarFolder).filter(file => file.endsWith(".png"));

        if (avatars.length === 0) {
            console.warn("⚠️ Nenhum avatar encontrado na pasta /avatars");
        } else {
            let a = 0;
            setInterval(() => {
                const avatarPath = path.join(avatarFolder, avatars[a]);
                client.user.setAvatar(fs.readFileSync(avatarPath))
                    .then(() => console.log(`🖼️ Avatar alterado para ${avatars[a]}`))
                    .catch(console.error);

                a = (a + 1) % avatars.length;
            }, 60 * 60 * 1000); // troca a cada 1 hora
        }
    });

    await client.login(config.TOKEN);
};