'use strict';
const expect = require('chai').expect;
// this is a logr plugin, so it should be
// installed as a package inside logr using
// 'npm install logr-slack':
const Logr = require('../../../index.js');
const path = require('path');
const Hapi = require('hapi');

it('can load the slack plugin ', (done) => {
  const server = new Hapi.Server({});
  const log = new Logr({
    type: 'logr-slack',
    plugins: {
      'logr-slack': 'logr-slack'
    },
    renderOptions: {
      'logr-slack': {
        server,
        moduleName: 'logr-slack',
        slackHook: process.env.SLACK_WEBHOOK,
        // you can provide a name for any channel allowed by the above slack webhook:
        channel: '#hapi-slack-test',
        // you can list which tags will cause a server.log call to post to slack:
        tags: ['warning', 'error', 'success', 'test'],
        // you can specify tags that will automatically be appended to each post to slack:
        additionalTags: ['server-test.js', 'someAdditionalTag']
      }
    }
  });
  expect(server.methods.postMessageToSlack).to.not.equal(undefined);
  expect(server.methods.postRawDataToSlack).to.not.equal(undefined);
  done();
});
