'use strict';
const Post2Slack = require('post2slack');

module.exports.log = function(options, tags, message) {
  const post2slack = new Post2Slack(options);
  post2slack.postFormatted(tags, message, (err) => {
    if (err) {
      console.log(err);
    }
  });
};
