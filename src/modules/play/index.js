
const { searchSongInfo } = require('../../utils/functions');
const ytdl = require('ytdl-core');

module.exports = class MusicPlayer {

  constructor(){
    this.serversQueue = new Map();
  }

  queue({ channel, guild }){
    const serverQueue = this.serversQueue.get(guild.id);

    if(!serverQueue) return channel.send('A fila do DJ André Marques tá vazia! Aproveita e pede a tua!');

    let queueMessage = "**Toma a lista das mais pedidas que vão tocar!**\n";

    for(let i = 0; i < serverQueue.songs.length; i++){
      const { title } = serverQueue.songs[i];
      queueMessage += `${i + 1}. ${title}\n`;
    }

    return channel.send(queueMessage);
  }

  skip({ member, guild, channel }){
    const serverQueue = this.serversQueue.get(guild.id);
    if (!member.voice.channel)
      return channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    if (!serverQueue)
      return channel.send("There is no song that I could skip!");

    this.playSong(guild, serverQueue.songs.shift());
  }

  stop({ member, guild, channel }){
    const serverQueue = this.serversQueue.get(guild.id);
    if (!member.voice.channel)
    return channel.send(
      "You have to be in a voice channel to stop the music!"
    );
    
    if (!serverQueue)
      return channel.send("There is no song that I could stop!");
      
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }

  remove(message, position){
    console.log(position);
    const { channel, guild } = message;
    const serverQueue = this.serversQueue.get(guild.id);
    
    if(position > serverQueue.songs.length + 1) return channel.send("Sei dessa musica ai não bixo");
    
    const song = serverQueue.songs.splice(position - 1, 1)[0];
    console.log(song);
    if(song){
      channel.send(`Sem bronca meu brother! toco ${song.title} mais não`);
      return this.queue(message);
    }
  }

  async play({ guild, content, member, channel, client }){
    try {
      const serverQueue = this.serversQueue.get(guild.id);
      const voiceChannel = member.voice.channel;
  
      if (!voiceChannel)
        return channel.send(
          "You need to be in a voice channel to play music!"
        );
  
      const permissions = voiceChannel.permissionsFor(client.user);
      if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return channel.send(
          "I need the permissions to join and speak in your voice channel!"
        );
      }

      const args = content.split(/ (.+)/); // split only on first space occurrence
      const song = await searchSongInfo(args[1]);

      if(!serverQueue){
        const queueContruct = {
          textChannel: channel,
          voiceChannel: voiceChannel,
          connection: null,
          songs: [],
          volume: 5,
          playing: true
        };

        this.serversQueue.set(guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
          var connection = await voiceChannel.join();
          queueContruct.connection = connection;
          this.playSong(guild, queueContruct.songs.shift());
        } catch (err) {
          this.serversQueue.delete(guild.id);
          return channel.send(err);
        }

      }else {
        serverQueue.songs.push(song);
        return channel.send(`Relaxe! jajá eu toco **${song.title}**, meu bom!`);
      }

    } catch(err){
      console.log(err);
      return channel.send('Erro ao lançar a braba');
    }
  }

  playSong(guild, song){
    const serverQueue = this.serversQueue.get(guild.id);

    try {
      if(!song){
        serverQueue.voiceChannel.leave();
        this.serversQueue.delete(guild.id);
        return;
      }
  
      const dispatcher = serverQueue.connection
      .play(ytdl(song.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        this.playSong(guild, serverQueue.songs.shift());
      })
        .on("error", error => console.error(error));
      dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
      serverQueue.textChannel.send(`Deixa o garoto brincar ao som de **${song.title}**`);
    } catch(err){
      this.playSong(guild, serverQueue.songs.shift());
    }
  }
}