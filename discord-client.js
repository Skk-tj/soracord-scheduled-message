const { Client, Intents } = require("discord.js");

const discordClient = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS] });

discordClient.once('ready', (c) => {
    console.log(`Discord Client Ready. Logged in as ${c.user.tag}`);
});

discordClient.login(process.env.DISCORD_TOKEN).then();

module.exports = discordClient;
