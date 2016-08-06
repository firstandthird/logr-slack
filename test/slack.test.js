'use strict';
const expect = require('chai').expect;
const Logr = require('../../../index.js');
const path = require('path');

const logr_slack = require('../index.js');
it('can load the slack plugin ', (done) => {
  const server = {
    methods: {}
  };
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
        additionalTags: ['server-test.js', 'someAdditionalTag']
      }
    }
  });
  logr_slack({ server }, [], 'a sample message');
  done();
});

// it('can ')
