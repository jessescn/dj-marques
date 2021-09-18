require('dotenv').config();
const Discord = require("discord.js");
const Player = require('./modules/play');

const { prefix } = require("./metadata.json");
const { isInvalidMessage } = require("./utils/functions");
const { getReplyMessage } = require('./utils/botMessages');

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
  if (isInvalidMessage(message)) return;

  const { content, channel } = message;
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
    channel.send(getReplyMessage('COMMAND_NOT_FOUND'));
  }
});

client.login(process.env.BOT_TOKEN);
