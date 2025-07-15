const axios = require("axios");

const BING_API_KEY = "SUA_CHAVE_AQUI";
const BING_ENDPOINT = "https://api.bing.microsoft.com/v7.0/images/search";

async function buscarImagem(termo) {
    try {
        const response = await axios.get(BING_ENDPOINT, {
            headers: { "Ocp-Apim-Subscription-Key": BING_API_KEY },
            params: { q: termo, count: 1 },
        });

        if (response.data.value.length > 0) {
            return response.data.value[0].contentUrl;
        } else {
            return "Nenhuma imagem encontrada.";
        }
    } catch (error) {
        console.error("Erro ao buscar imagem:", error);
        return "Erro ao buscar imagem.";
    }
}

module.exports = {
    data: {
        name: "imagem",
        description: "Busca uma imagem pela pesquisa desejada",
        options: [
            {
                name: "pesquisa",
                description: "O que você quer buscar?",
                type: 3, // STRING
                required: true,
            },
        ],
    },

    async execute(interaction, client) {
        const termo = interaction.options.getString("pesquisa");
        await interaction.reply("🔎 Buscando imagem...");

        const imagemUrl = await buscarImagem(termo);
        await interaction.editReply(imagemUrl);
    },
};
