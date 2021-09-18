require('dotenv').config();
const Discord = require("discord.js");
const Player = require('./modules/play');

const { prefix } = require("../config.json");

const client = new Discord.Client();
const musicPlayer = new Player();

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting...");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async message => {
  const { content, author, channel } = message;
  if (author.bot) return;
  if (!content.startsWith(prefix)) return;

  const command = content.split(/ (.+)/)[0];

  if (content.startsWith(`${prefix}play`) || command === `${prefix}p`) {
    musicPlayer.play(message);
    return;
  } else if (content.startsWith(`${prefix}skip`)) {
    musicPlayer.skip(message);
    return;
  } else if (content.startsWith(`${prefix}stop`)) {
    musicPlayer.stop(message);
    return;
  } else if (content.startsWith(`${prefix}queue`)) {
    musicPlayer.queue(message);
    return;
  } else if (content.startsWith(`${prefix}remove`)) {
    const position = content.split(/ (.+)/)[1];
    musicPlayer.remove(message, parseInt(position));
    return;
  } else {
    channel.send("DJABO É ISSO!");
  }
});

client.login(process.env.BOT_TOKEN);
