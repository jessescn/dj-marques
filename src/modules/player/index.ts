
import { getMessage, getComposedMessage, getErrorMessage } from '../../utils/botMessages';
import { searchSongInfo, isBotNotConnnected } from '../../utils/functions';
import { Message, Guild } from 'discord.js';
import { Song, ServerQueue, CustomTextChannel } from '../../types/play';
import ytdl from 'ytdl-core';

export default class MusicPlayer {
  servers: Map<string, ServerQueue>;

  constructor() {
    this.servers = new Map();
  }

  handleCommand(message: Message, prefix: string): Promise<Message> | undefined {
    const { content, channel } = message;
    
    try {
      const command = content.split(/ (.+)/)[0].split(prefix)[1];
  
      if(["play", "p"].includes(command)){
        return this.play(message);
      }
  
      if(["skip", "skp"].includes(command)){
        return this.skip(message);
      }
  
      if(["stop", "stp"].includes(command)){
        return this.stop(message);
      }
  
      if(["remove", "rmv"].includes(command)){
        const position = content.split(/ (.+)/)[1];
        return this.remove(message, parseInt(position));
      }
  
      if(["queue", "qeue", "queu"].includes(command)){
        return this.queue(message);
      }

      return;

    } catch(err){
      console.log(err);
      return channel.send(getErrorMessage('ERROR_PLAY_MODULE'));
    }
  }

  queue({channel, guild, member, client }: Message): Promise<Message> {
    try {

      if(!guild || !member) throw new Error('props not defined');

      const serverQueue = this.servers.get(guild.id);
  
      if (!serverQueue || isBotNotConnnected(member, client)) return channel.send(getMessage('EMPTY_QUEUE'));
  
      const { songs, playing } = serverQueue;
  
      let queueMessage = "";
  
      if(playing) queueMessage = getComposedMessage('CURRENT_PLAYING', playing);
  
      queueMessage += songs.length > 0 ? getMessage('LIST_QUEUE_TITLE') : getMessage('EMPTY_QUEUE');
  
      for (let i = 0; i < songs.length; i++) {
        queueMessage += `${i + 1}. ${songs[i].title}\n`;
      }
  
      return channel.send(queueMessage);
    } catch(error) {
      console.log(error);
      if(guild) this.servers.delete(guild.id);
      return channel.send(getErrorMessage('ERROR_QUEUE_ACTION'));
    }
  }

  skip({ member, guild, channel, client }: Message): Promise<Message> {
    try {
      if(!guild) throw new Error('guild not defined')

      if (!member || !member.voice.channel) {
        return channel.send(getMessage('NOT_IN_VOICE_CHANNEL'));
      }
  
      const serverQueue = this.servers.get(guild.id);
  
      if (!serverQueue || isBotNotConnnected(member, client)) {
        return channel.send(getMessage('NO_SONG_TO_SKIP'));
      }
  
      this.playSong(guild, channel, serverQueue.songs.shift());
      return channel.send(getMessage('SKIP_SONG_SUCESSFULLY'));
    } catch (error) {
      console.log(error);
      if(guild) this.servers.delete(guild.id);
      return channel.send(getErrorMessage('ERROR_SKIP_ACTION'));
    }
  }

  stop({ member, guild, channel, client }: Message): Promise<Message> {
    try {
      if(!guild) throw new Error('guild not defined');

      if (!member || !member.voice.channel) {
        return channel.send(getMessage('NOT_IN_VOICE_CHANNEL'));
      }
  
      const serverQueue = this.servers.get(guild.id);
  
      if (!serverQueue || isBotNotConnnected(member, client)) {
        return channel.send(getMessage('NO_SONG_TO_STOP'));
      }
  
      serverQueue.songs = [];
      if(serverQueue.connection) serverQueue.connection.dispatcher.end();

      return channel.send(getMessage('STOP_BOT_SUCESSFULLY'));

    } catch(error){
      console.log(error);
      if(guild) this.servers.delete(guild.id);
      return channel.send(getErrorMessage('ERROR_STOP_ACTION'));
    }
  }

  remove({ channel, guild, member, client }: Message, position: number): Promise<Message> {
    try {
      if(!guild || !member ) throw new Error('props not defined');

      const serverQueue = this.servers.get(guild.id);
  
      if (!serverQueue || isBotNotConnnected(member, client) || position > serverQueue.songs.length + 1) 
        return channel.send(getMessage('INVALID_REMOVE_POSITION'));
  
      const song = serverQueue.songs.splice(position - 1, 1)[0];
  
      if (!song) return channel.send(getMessage('SONG_NOT_FOUND'));
  
      return channel.send(getComposedMessage('REMOVE_SONG_SUCCESSFULLY', song));
    } catch(error) {
      console.log(error);
      if(guild) this.servers.delete(guild.id);
      return channel.send(getErrorMessage('ERROR_REMOVE_ACTION'));
    }
  }

  async play(message: Message): Promise<Message>  {

    const { guild, content, member, channel, client } = message;

    try {
      if (!member || !guild || !client.user) throw new Error('props not defined');

      const voiceChannel = member.voice.channel;

      if (!voiceChannel) return channel.send(getMessage('NOT_IN_VOICE_CHANNEL'));
      
      const permissions = voiceChannel.permissionsFor(client.user);

      if (!permissions || !permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return channel.send(getMessage('NO_VOICE_PERMISSION'));
      }

      const serverQueue = this.servers.get(guild.id);
      const args = content.split(/ (.+)/); // split only on first space occurrence
      const song = await searchSongInfo(args[1]);
      

      if (!serverQueue || isBotNotConnnected(member, client)) {

        const newQueue = this.addNewServerQueue(message);

        if(!newQueue) return channel.send(getErrorMessage('ERROR_ADD_SERVER_QUEUE'));

        newQueue.songs.push(song);

        try {
          const connection = await voiceChannel.join();
          newQueue.connection = connection;
          return this.playSong(guild, channel, newQueue.next(newQueue));
        } catch (err) {
          this.servers.delete(guild.id);
          return channel.send(getErrorMessage('ERROR_CONNECTING_CHANNEL'));
        }
      } else {
        serverQueue.songs.push(song);
        return channel.send(getComposedMessage('ADD_SONG_TO_QUEUE', song));
      }
    } catch (err) {
      console.log(err);
      return channel.send(getErrorMessage('ERROR_PLAYING_ACTION'));
    }
  }

  playSong(guild: Guild, channel: CustomTextChannel, song: Song | undefined): Promise<Message> {
    const serverQueue = this.servers.get(guild.id);

    if (!serverQueue || !serverQueue.connection)
      return channel.send(getErrorMessage('ERROR_PLAYING_ACTION'));

    try {
      if (!song) {
        serverQueue.voiceChannel.leave();
        this.servers.delete(guild.id);
        return channel.send(getMessage('END_OF_SONGS'));
      }

      const dispatcher = serverQueue.connection
          .play(ytdl(song.url, { filter: 'audioonly' }))
          .on('finish', () => {
            this.playSong(guild, channel, serverQueue.next(serverQueue));
          })
          .on('error', (error) => console.error(error));

      dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
      return channel.send(getComposedMessage('PLAY_SONG', song));
    } catch (err) {
      console.log(err);
      channel.send(getErrorMessage('ERROR_PLAYING_SONG'));
      return this.playSong(guild, channel, serverQueue.next(serverQueue));
    }
  }

  addNewServerQueue({ channel, member, guild }: Message): ServerQueue | undefined {

    if (!guild || !member || !member.voice || !member.voice.channel) return;

    const newQueue: ServerQueue = {
      textChannel: channel,
      voiceChannel: member.voice.channel,
      connection: undefined,
      songs: [],
      volume: 5,
      playing: undefined,
      next: (self) => {
        const nextSong = self.songs.shift();
        self.playing = nextSong;
        return nextSong;
      },
    };

    this.servers.set(guild.id, newQueue);

    return newQueue;
  }
}
