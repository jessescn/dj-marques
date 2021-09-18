
const { getBotMessage, getComposedMessage } = require('../../utils/botMessages');
const { searchSongInfo } = require('../../utils/functions');
const ytdl = require('ytdl-core');

module.exports = class MusicPlayer {

  constructor(){
    this.servers = new Map();
  }

  queue({ channel, guild }){
    const serverQueue = this.servers.get(guild.id);

    if(!serverQueue) return channel.send(getBotMessage('EMPTY_QUEUE'));

    const { songs, playing } = serverQueue;

    let queueMessage = getComposedMessage('CURRENT_PLAYING', playing);

    queueMessage += songs.length > 0 ? getBotMessage('LIST_QUEUE_TITLE') : getBotMessage('EMPTY_QUEUE');

    for(let i = 0; i < songs.length; i++){
      queueMessage += `${i + 1}. ${songs[i].title}\n`;
    }

    return channel.send(queueMessage);
  }

  skip({ member, guild, channel }){
    if (!member.voice.channel)
    return channel.send(getBotMessage('NOT_IN_VOICE_CHANNEL'));

    const serverQueue = this.servers.get(guild.id);

    if (!serverQueue)
      return channel.send(getBotMessage('NO_SONG_TO_SKIP'));

    this.playSong(guild, serverQueue.songs.shift());
  }

  stop({ member, guild, channel }){
    if (!member.voice.channel)
      return channel.send(getBotMessage('NOT_IN_VOICE_CHANNEL'));

    const serverQueue = this.servers.get(guild.id);
    
    if (!serverQueue)
      return channel.send(getBotMessage('NO_SONG_TO_STOP'));
      
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }

  remove(message, position){;
    const { channel, guild } = message;
    const serverQueue = this.servers.get(guild.id);
    
    if(position > serverQueue.songs.length + 1) return channel.send(getBotMessage('INVALID_REMOVE_POSITION'));
    
    const song = serverQueue.songs.splice(position - 1, 1)[0];

    if(song){
      return channel.send(getComposedMessage('REMOVE_SONG_SUCCESSFULLY', song));
    }
  }

  async play({ guild, content, member, channel, client }){
    try {
      const voiceChannel = member.voice.channel;
  
      if (!voiceChannel)
        return channel.send(getBotMessage('NOT_IN_VOICE_CHANNEL'));
  
      const permissions = voiceChannel.permissionsFor(client.user);

      if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return channel.send(getBotMessage('NO_VOICE_PERMISSION'));
      }

      const serverQueue = this.servers.get(guild.id);
      const args = content.split(/ (.+)/); // split only on first space occurrence
      const song = await searchSongInfo(args[1]);

      if (!serverQueue){

        const newQueue = {
          textChannel: channel,
          voiceChannel: voiceChannel,
          connection: null,
          songs: [],
          volume: 5,
          playing: null,
          next: (self) => {
            const song = self.songs.shift();
            self.playing = song;
            return song;
          }
        };

        this.servers.set(guild.id, newQueue);

        newQueue.songs.push(song);

        try {
          const connection = await voiceChannel.join();
          newQueue.connection = connection;
          this.playSong(guild, newQueue.next(newQueue));
        } catch (err) {
          this.servers.delete(guild.id);
          return channel.send(err);
        }

      } else {
        serverQueue.songs.push(song);
        return channel.send(getComposedMessage('ADD_SONG_TO_QUEUE', song));
      }

    } catch(err){
      console.log(err);
      return channel.send(getBotMessage('ERROR_PLAYING_SONG'));
    }
  }

  playSong(guild, song){
    const serverQueue = this.servers.get(guild.id);

    try {
      if(!song){
        serverQueue.voiceChannel.leave();
        this.servers.delete(guild.id);
        return;
      }
  
      const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
          this.playSong(guild, serverQueue.next(serverQueue));
        })
        .on("error", error => console.error(error));
      
      dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
      serverQueue.textChannel.send(getComposedMessage('PLAY_SONG', song));
    } catch(err){
      this.playSong(guild, serverQueue.next(serverQueue));
    }
  }
}