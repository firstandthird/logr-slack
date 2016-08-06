'use strict';
const expect = require('chai').expect;
const Logr = require('../');
const path = require('path');
const Hapi = require('hapi');

it('can load the slack plugin ', (done) => {
  const server = new Hapi.Server({});
  const log = new Logr({
    type: 'slack',
    plugins: {
      slack: 'logr-slack'
    },
    renderOptions: {
      slack: {
        server,
        slackHook: process.env.SLACK_WEBHOOK,
        // you can provide a name for any channel allowed by the above slack webhook:
        channel: '#hapi-slack-test',
        // you can list which tags will cause a server.log call to post to slack:
        tags: ['warning', 'error', 'success', 'test'],
        // you can specify tags that will automatically be appended to each post to slack:
        additionalTags: ['server-test.js', 'someAdditionalTag'],

      }
    }
  });
  log('there');
  expect(server.methods.postMessageToSlack).to.not.equal(undefined);
  done();
});
