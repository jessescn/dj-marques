const { name: botName } = require('../metadata.json');

const messages = {
  'COMMAND_NOT_FOUND': 'DJABO É ISSO!',
  'EMPTY_QUEUE': `A fila do ${botName} tá vazia! Aproveita e pede a tua!`,
  'LIST_QUEUE_TITLE': '**Toma a lista das mais pedidas que vão tocar!**\n',
  'NOT_IN_VOICE_CHANNEL': 'You have to be in a voice channel execute this action',
  'NO_VOICE_PERMISSION': 'I need the permissions to join and speak in your voice channel!',
  'NO_SONG_TO_SKIP': 'There is no song that I could skip!',
  'NO_SONG_TO_STOP': 'There is no song that I could stop!',
  'INVALID_REMOVE_POSITION': 'Sei dessa musica ai não bixo',
  'ERROR_PLAYING_SONG': 'Erro ao lançar a braba',
}

exports.getBotMessage = (type) => {
  return messages[type] ? messages[type] : 'Erro ao executar ação!';
}

exports.getComposedMessage = (type, song) => {
  let composedMessage = "Erro ao lançar a braba";

  switch(type){
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
    default:
      break;
  }

  return composedMessage;
} 
