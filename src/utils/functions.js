const search = require('youtube-search');

const config = {
  maxResults: 2,
  key: process.env.YOUTUBE_TOKEN
};

exports.searchSongInfo = async (userSearch) => {
 
  const { results } = await search(userSearch, config);

  if(!results || results.length < 1) throw new Error('No youtube data found.');

  const { title, link } = results[0];

  return {
    title,
    url: link,
  }
}