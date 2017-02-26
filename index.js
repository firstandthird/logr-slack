'use strict';
const Post2Slack = require('post2slack');

module.exports.log = function(options, tags, message) {
  if (!message) {
    message = tags;
    tags = options;
    options = false;
  }
  const settings = options || {};
  const post2slack = new Post2Slack(settings);
  post2slack.postFormatted(tags, message, (err) => {
    if (err) {
      console.log(err);
    }
  });
};
