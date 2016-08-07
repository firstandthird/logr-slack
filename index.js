'use strict';
const _ = require('lodash');
const Wreck = require('wreck');

let options = {};

// used by slackPostMessage to construct a nice payload:
const makeSlackPayload = (tags, data) => {
  //clone because we muck with data
  data = _.cloneDeep(data);
  const attachment = {
    fields: []
  };

  if (_.isString(data)) { //if string just pass as title and be done with it
    attachment.title = data;
    attachment.fallback = data;
  } else if (_.isObject(data)) { // if object, then lets make it look good
    //if it has a message, pull that out and display as title
    if (data.message) {
      attachment.title = data.message;
      attachment.fallback = data.message;
      delete data.message;
    }
    if (data.url) {
      attachment.title_link = data.url;
      delete data.url;
    }
    attachment.text = `\`\`\` ${JSON.stringify(data, null, '  ')} \`\`\``;
    attachment.mrkdwn_in = ['text'];
  }
  if (options.additionalFields) {
    attachment.fields = attachment.fields.concat(options.additionalFields);
  }
  if (options.additionalTags) {
    tags = _.union(options.additionalTags, tags);
  }
  if (options.hideTags !== true && tags.length > 0) {
    if (typeof tags === 'string') {
      attachment.fields.push({ title: 'Tags', value: tags });
    } else {
      attachment.fields.push({ title: 'Tags', value: tags.join(', ') });
    }
  }
  // set any colors for special tags:
  if (tags.indexOf('success') > -1) {
    attachment.color = 'good';
  }
  if (tags.indexOf('warning') > -1) {
    attachment.color = 'warning';
  }
  if (tags.indexOf('error') > -1) {
    attachment.color = 'danger';
  }
  // set any special channel:
  const slackPayload = {
    attachments: [attachment]
  };
  if (options.channel) {
    slackPayload.channel = options.channel;
  }
  if (options.iconURL) {
    slackPayload.icon_url = options.iconURL;
  }
  if (options.username) {
    slackPayload.username = options.username;
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
  let methods = options.methods ? options.methods : undefined;
  if (methods) {
    methods.postMessageToSlack = postMessageToSlack;
    methods.postRawDataToSlack = doPost;
    methods.makeSlackPayload = makeSlackPayload;
  }
  callback();
};

module.exports.render = (options, tags, message) => {
  postMessageToSlack(tags, message);
};
