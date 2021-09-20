import search from 'youtube-search';
import {prefix} from '../metadata.json';
import { Song } from '../types/play';
import { Message } from 'discord.js';

export const searchSongInfo = async (userSearch: string):Promise<Song> => {
  const config = {
    maxResults: 2,
    key: process.env.YOUTUBE_API_V3_TOKEN,
  };

  const {results} = await search(userSearch, config);

  if (!results || results.length < 1) throw new Error('No youtube data found.');

  const {title, link} = results[0];

  return {
    title,
    url: link,
  };
};

export const isInvalidMessage = ({author, content }: Message): boolean => {
  return author.bot || !content.startsWith(prefix);
};