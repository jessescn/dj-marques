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
  const userCmd = content.split(/ (.+)/)[0];

  if ([`${prefix}play`, `${prefix}p`].includes(userCmd)) {
    musicPlayer.play(message);
  } else if ([`${prefix}skip`, `${prefix}skp`].includes(userCmd)) {
    musicPlayer.skip(message);
  } else if ([`${prefix}stop`, `${prefix}stp`].includes(userCmd)) {
    musicPlayer.stop(message);
  } else if ([`${prefix}queue`, `${prefix}qeue`, `${prefix}queu`].includes(userCmd)) {
    musicPlayer.queue(message);
  } else if ([`${prefix}remove`, `${prefix}rmv`].includes(userCmd)) {
    const position = content.split(/ (.+)/)[1];
    if(!position) return channel.send('You must provide song position to remove');
    musicPlayer.remove(message, parseInt(position));
  } else {
    channel.send(getReplyMessage('COMMAND_NOT_FOUND'));
  }
});

client.login(process.env.BOT_TOKEN);
