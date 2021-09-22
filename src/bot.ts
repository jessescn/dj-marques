// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { prefix } from './metadata.json';
import { isInvalidMessage } from './utils/functions';
import { getMessage } from './utils/botMessages';
import Client from './modules';
import Player from './modules/player';
import Effect from './modules/effects';

const client = new Client();

client.addModule(new Player());
client.addModule(new Effect());

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
  if (isInvalidMessage(message, prefix)) return;

  for(const mod of client.modules) {
    const response = await mod.handleCommand(message, prefix);

    if(response) return response;
  }

  return message.channel.send(getMessage('COMMAND_NOT_FOUND'));
});

client.login(process.env.BOT_TOKEN);
