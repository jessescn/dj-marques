/* eslint-disable @typescript-eslint/no-var-requires */
import { Message } from "discord.js";
import { getErrorMessage, getMessage } from "../../utils/botMessages";
import { existsSync } from 'fs';

export default class Effect {

  handleCommand(message: Message, prefix: string): Promise<Message> | undefined {
    const { channel } = message;
    try {
      const { content } = message;
      const command = content.split(/ (.+)/)[0].split(prefix)[1];
  
      if(['effect', 'fct'].includes(command)){
        return this.playEffect(message);
      }
  
      return;
    } catch (error){
      console.log(error);
      return channel.send(getErrorMessage('ERROR_EFFECT_MODULE'));
    }
  }

  async playEffect({ member, channel, content }: Message): Promise<Message>  {
    try {
      
      const voiceChannel  = member?.voice.channel;

      if(!voiceChannel) return channel.send(getMessage('NOT_IN_VOICE_CHANNEL'));

      const effectName = content.split(/ (.+)/)[1].toLowerCase();
      const path = require("path").join(__dirname, `/audios/${effectName}.mp3`);

      if(!existsSync(path)) return channel.send(getMessage('EFFECT_NOT_FOUND'));
  
      const connection = await voiceChannel.join();
  
      const dispatcher = connection.play(path)
      
      dispatcher.on('finish', () => {
        voiceChannel.leave();
      }).on('error', (err) => {
        console.log(err);
        voiceChannel.leave();
        return;
      })

      return channel.send(`tocando efeito: ${effectName}`);

    } catch(error) {
      console.log(error);
      return channel.send(getErrorMessage('ERROR_PLAYING_EFFECT'));
    }
  }
} 