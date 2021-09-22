import { VoiceChannel, TextChannel, DMChannel, NewsChannel, VoiceConnection } from 'discord.js';
import Effect from '../modules/effects';
import MusicPlayer from '../modules/player';

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

export type CustomTextChannel = TextChannel | DMChannel | NewsChannel;

export type BotModule = MusicPlayer | Effect;