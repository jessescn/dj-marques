/* eslint-disable max-len */
import { Song } from '../types/play';
import {name as botName} from '../metadata.json';

const messages: Record<string, string> = {
  COMMAND_NOT_FOUND: 'DJABO É ISSO!',
  EMPTY_QUEUE: `A fila do ${botName} tá vazia! Aproveita e pede a tua!`,
  LIST_QUEUE_TITLE: '**Toma a lista das mais pedidas que vão tocar!**\n',
  NOT_IN_VOICE_CHANNEL: 'You have to be in a voice channel execute this action',
  NO_VOICE_PERMISSION: 'I need the permissions to join and speak in your voice channel!',
  NO_SONG_TO_SKIP: 'There is no song that I could skip!',
  NO_SONG_TO_STOP: 'There is no song that I could stop!',
  INVALID_REMOVE_POSITION: 'Sei dessa musica ai não bixo',
  SONG_NOT_FOUND: 'Música não encontrada',
  ERROR_PLAYING_ACTION: 'Erro ao lançar a braba',
  ERROR_QUEUE_ACTION: 'Erro ao listar as músicas',
  ERROR_STOP_ACTION: 'Erro ao parar a música',
  ERROR_SKIP_ACTION: 'Erro ao passar música',
  ERROR_REMOVE_ACTION: 'Erro ao remover música',
  ERROR_CONNECTING_CHANNEL: 'Erro ao se conectar ao canal',
};

export const getBotMessage = (type: string): string => {
  return messages[type] ? messages[type] : 'Erro ao executar ação!';
};

export const getComposedMessage = (type: string, song: Song): string => {
  let composedMessage = 'Erro ao lançar a braba';

  switch (type) {
    case 'PLAY_SONG':
      composedMessage = `Deixa os garoto brincar ao som de **${song.title}**`;
      break;
    case 'ADD_SONG_TO_QUEUE':
      composedMessage = `Relaxe! jajá eu toco **${song.title}**`;
      break;
    case 'REMOVE_SONG_SUCCESSFULLY':
      composedMessage = `Sem bronca meu brother! toco ${song.title} mais não!`;
      break;
    case 'CURRENT_PLAYING':
      composedMessage = `${botName} tá mandando a boa ao som de **${song.title}**\n\n`;
      break;
    default:
      break;
  }

  return composedMessage;
};
