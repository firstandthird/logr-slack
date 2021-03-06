const Post2Slack = require('post2slack');

module.exports.log = async function(options, tags, message) {
  const post2slack = new Post2Slack(options);
  try {
    await post2slack.postFormatted(tags, message);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
};
