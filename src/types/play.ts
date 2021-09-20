import { VoiceChannel, TextChannel, DMChannel, NewsChannel, VoiceConnection } from 'discord.js';

export type ServerQueue = {
  textChannel: TextChannel | DMChannel | NewsChannel,
  voiceChannel: VoiceChannel,
  connection: VoiceConnection | undefined,
  songs: Song[],
  volume: number,
  playing: Song | undefined,
  next: (self: ServerQueue) => Song | undefined,
};

export type Song = {
  title: string;
  url: string;
}