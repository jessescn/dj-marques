const search = require('youtube-search');
const { prefix } = require('../metadata.json')

exports.searchSongInfo = async (userSearch) => {
  
  const config = {
    maxResults: 2,
    key: process.env.YOUTUBE_API_V3_TOKEN,
  };

  const { results } = await search(userSearch, config);

  if(!results || results.length < 1) throw new Error('No youtube data found.');

  const { title, link } = results[0];

  return {
    title,
    url: link,
  }
}

exports.isInvalidMessage = ({ author, content }) => {
  return author.bot || !content.startsWith(prefix);
}