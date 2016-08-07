'use strict';
const expect = require('chai').expect;
// this is a logr plugin, so it should be
// installed as a package inside logr using
// 'npm install logr-slack':
const Logr = require('../../../index.js');
const path = require('path');
const Hapi = require('hapi');

const logr_slack = require('../index.js');
it('can load the slack plugin ', (done) => {
  const server = new Hapi.Server({});
  const log = new Logr({
    type: 'slack',
    plugins: {
      slack: 'logr-slack'
    },
    renderOptions: {
      slack: {
        methods: server.methods,
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
  expect(server.methods.makeSlackPayload).to.not.equal(undefined);
  done();
});

it('can use the exposed server methods to make a simple slack payload', (done) => {
  const server = new Hapi.Server({});
  const log = new Logr({
    type: 'logr-slack',
    plugins: {
      'logr-slack': 'logr-slack'
    },
    renderOptions: {
      'logr-slack': {
        methods: server.methods,
        slackHook: process.env.SLACK_WEBHOOK
      }
    }
  });
  const expectedPacket = {
    attachments: [{
      fallback: 'this is a posting',
      title: 'this is a posting',
      fields: [{
        title: 'Tags',
        value: 'tag1'
      }]
    }],
  };
  const payload = server.methods.makeSlackPayload(['tag1'], 'this is a posting');
  expect(JSON.parse(payload)).to.deep.equal(expectedPacket);
  done();
});

it('can use logr to do a basic post to slack', (done) => {
  const server = new Hapi.Server({});
  server.connection({port: 8080});
  const expectedPayload = {
    attachments: [{
      fallback: 'a string',
      title: 'a string',
      fields: [{
        title: 'Tags',
        value: 'test'
      }]
    }],
  };

  server.route({
    method: 'POST',
    path: '/',
    handler: (request, reply) => {
      expect(request.payload).to.deep.equal(expectedPayload);
      done();
    }
  });
  server.start(() => {
    const log = new Logr({
      type: 'logr-slack',
      plugins: {
        'logr-slack': 'logr-slack'
      },
      renderOptions: {
        'logr-slack': {
          methods: server.methods,
          slackHook: 'http://localhost:8080/',
        }
      }
    });
    log(['test'], 'a string');
  });
});
