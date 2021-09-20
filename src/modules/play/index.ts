
import { getBotMessage, getComposedMessage } from '../../utils/botMessages';
import { searchSongInfo } from '../../utils/functions';
import { Message, Guild } from 'discord.js';
import { Song, ServerQueue } from '../../types/play';
import ytdl from 'ytdl-core';

export default class MusicPlayer {
  servers: Map<string, ServerQueue>;
  constructor() {
    this.servers = new Map();
  }

  queue({channel, guild}: Message): Promise<Message> {
    try {
      if(!guild) throw new Error('guild not defined')

      const serverQueue = this.servers.get(guild.id);
  
      if (!serverQueue) return channel.send(getBotMessage('EMPTY_QUEUE'));
  
      const { songs, playing } = serverQueue;
  
      let queueMessage = "";
  
      if(playing) queueMessage = getComposedMessage('CURRENT_PLAYING', playing);
  
      queueMessage += songs.length > 0 ? getBotMessage('LIST_QUEUE_TITLE') : getBotMessage('EMPTY_QUEUE');
  
      for (let i = 0; i < songs.length; i++) {
        queueMessage += `${i + 1}. ${songs[i].title}\n`;
      }
  
      return channel.send(queueMessage);
    } catch(error) {
      console.log(error);
      return channel.send(getBotMessage('ERROR_QUEUE_ACTION'));
    }
  }

  skip({member, guild, channel}: Message): Promise<Message> | void {
    try {
      if(!guild) throw new Error('guild not defined')

      if (!member || !member.voice.channel) {
        return channel.send(getBotMessage('NOT_IN_VOICE_CHANNEL'));
      }
  
      const serverQueue = this.servers.get(guild.id);
  
      if (!serverQueue) {
        return channel.send(getBotMessage('NO_SONG_TO_SKIP'));
      }
  
      this.playSong(guild, serverQueue.songs.shift());
    } catch (error) {
      console.log(error);
      return channel.send(getBotMessage('ERROR_SKIP_ACTION'));
    }
  }

  stop({member, guild, channel}: Message): Promise<Message> | void  {
    try {
      if(!guild) throw new Error('guild not defined');

      if (!member || !member.voice.channel) {
        return channel.send(getBotMessage('NOT_IN_VOICE_CHANNEL'));
      }
  
      const serverQueue = this.servers.get(guild.id);
  
      if (!serverQueue) {
        return channel.send(getBotMessage('NO_SONG_TO_STOP'));
      }
  
      serverQueue.songs = [];
      if(serverQueue.connection) serverQueue.connection.dispatcher.end();

    } catch(error){
      console.log(error);
      return channel.send(getBotMessage('ERROR_STOP_ACTION'));
    }
  }

  remove({ channel, guild }: Message, position: number): Promise<Message> {
    try {
      if(!guild) throw new Error('guild not defined');

      const serverQueue = this.servers.get(guild.id);
  
      if (!serverQueue || position > serverQueue.songs.length + 1) return channel.send(getBotMessage('INVALID_REMOVE_POSITION'));
  
      const song = serverQueue.songs.splice(position - 1, 1)[0];
  
      if (!song) return channel.send(getBotMessage('SONG_NOT_FOUND'));
  
      return channel.send(getComposedMessage('REMOVE_SONG_SUCCESSFULLY', song));
    } catch(error) {
      console.log(error);
      return channel.send(getBotMessage('ERROR_REMOVE_ACTION'));
    }
  }

  async play({guild, content, member, channel, client}: Message): Promise<Message | undefined>  {
    try {
      if (!member || !guild || !client.user) throw new Error('props not defined');

      const voiceChannel = member.voice.channel;

      if (!voiceChannel) return channel.send(getBotMessage('NOT_IN_VOICE_CHANNEL'));
      
      const permissions = voiceChannel.permissionsFor(client.user);

      if (!permissions || !permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return channel.send(getBotMessage('NO_VOICE_PERMISSION'));
      }

      const serverQueue = this.servers.get(guild.id);
      const args = content.split(/ (.+)/); // split only on first space occurrence
      const song = await searchSongInfo(args[1]);

      if (!serverQueue) {
        const newQueue: ServerQueue = {
          textChannel: channel,
          voiceChannel: voiceChannel,
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
        newQueue.songs.push(song);

        try {
          const connection = await voiceChannel.join();
          newQueue.connection = connection;
          this.playSong(guild, newQueue.next(newQueue));
        } catch (err) {
          this.servers.delete(guild.id);
          return channel.send(getBotMessage('ERROR_CONNECTING_CHANNEL'));
        }
      } else {
        serverQueue.songs.push(song);
        return channel.send(getComposedMessage('ADD_SONG_TO_QUEUE', song));
      }
    } catch (err) {
      console.log(err);
      return channel.send(getBotMessage('ERROR_PLAYING_ACTION'));
    }
  }

  playSong(guild: Guild, song: Song | undefined): void {
    const serverQueue = this.servers.get(guild.id);
    if (!serverQueue || !serverQueue.connection) return

    try {
      if (!song) {
        serverQueue.voiceChannel.leave();
        this.servers.delete(guild.id);
        return;
      }

      const dispatcher = serverQueue.connection
          .play(ytdl(song.url, { filter: 'audioonly' }))
          .on('finish', () => {
            this.playSong(guild, serverQueue.next(serverQueue));
          })
          .on('error', (error) => console.error(error));

      dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
      serverQueue.textChannel.send(getComposedMessage('PLAY_SONG', song));
    } catch (err) {
      console.log(err);
      serverQueue.textChannel.send(getBotMessage('ERROR_PLAYING_SONG'));
      this.playSong(guild, serverQueue.next(serverQueue));
    }
  }
}
