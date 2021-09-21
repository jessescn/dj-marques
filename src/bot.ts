// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import Discord from 'discord.js';
import Player from './modules/play';

import { prefix } from './metadata.json';
import { isInvalidMessage } from './utils/functions';
import { getMessage } from './utils/botMessages';

const client = new Discord.Client();
const musicPlayer = new Player();

client.once('ready', () => {
  console.log('Ready!');
});

client.once('reconnecting', () => {
  console.log('Reconnecting...');
});

client.once('disconnect', () => {
  console.log('Disconnect!');
});

client.on('message', async (message) => {
  if (isInvalidMessage(message)) return;

  const response = musicPlayer.handleUserCommand(message, prefix);

  if(!response) return message.channel.send(getMessage('COMMAND_NOT_FOUND'));
});

client.login(process.env.BOT_TOKEN);
