'use strict';
const _ = require('lodash');
const Wreck = require('wreck');

let options = {};
const makeSlackPayload = (tags, data) => {
  let slackPayload = {};
  if (_.isString(data)) {
    slackPayload = {
      attachments: [{
        text: `${data} [${tags}] `
      }]
    };
  } else if (_.isObject(data)) {
    // if it's a json object then format it so
    // it displays all nicely on slack:
    if (!data.message) {
      // slack uses ``` to format text like an object:
      slackPayload = {
        attachments: [{
          text: ` [${tags}] \`\`\` ${JSON.stringify(data, null, '  ')} \`\`\``,
          mrkdwn_in: ['text']
        }]
      };
    // if it's a json object that has a 'message' field then pull that out:
    } else {
      const message = data.message;
      delete data.message;
      slackPayload = {
        attachments: [{
          text: `${message} [${tags}] \`\`\` ${JSON.stringify(data, null, '  ')} \`\`\``,
          mrkdwn_in: ['text']
        }]
      };
    }
  }
  // set any colors for special tags:
  if (tags.indexOf('success') > -1) {
    slackPayload.attachments[0].color = 'good';
  }
  if (tags.indexOf('warning') > -1) {
    slackPayload.attachments[0].color = 'warning';
  }
  if (tags.indexOf('error') > -1) {
    slackPayload.attachments[0].color = 'danger';
  }
  // set any special channel:
  if (options.channel) {
    slackPayload.channel = options.channel;
  }
  return JSON.stringify(slackPayload);
};

// will format and doPost a server.log style message to slack:
const postMessageToSlack = (tags, data) => {
  let slackPayload;
  // when called directly, tags is just an array:
  if (_.isArray(tags)) {
    slackPayload = makeSlackPayload(_.union(tags, tags).join(', '), data);
  // when called as an event on server.log, tags will be an object
  // // in which they keys are the tag names:
  } else if (_.isObject(tags)) {
    slackPayload = makeSlackPayload(_.union(_.keys(tags), tags).join(', '), data);
  }
  doPost(slackPayload);
};

// sends a payload string to slack:
const doPost = (slackPayload) => {
  if (_.isObject(slackPayload)) {
    slackPayload = JSON.stringify(slackPayload);
  }
  console.log('posting now to %s', options.slackHook)
  Wreck.request('POST', options.slackHook, {
    headers: { 'Content-type': 'application/json' },
    payload: slackPayload
  }, (err) => {
    if (err) {
      server.log(['hapi-slack'], err);
    }
  });
};

module.exports.register = (passedOptions, callback) => {
  options = passedOptions;
  let server = options.server ? options.server : undefined;
  if (server) {
    server.methods.postMessageToSlack = postMessageToSlack;
    server.methods.postRawDataToSlack = doPost;
    server.methods.makeSlackPayload = makeSlackPayload;
  }
  callback();
};

module.exports.render = (options, tags, message) => {
  postMessageToSlack(tags, message);
};
