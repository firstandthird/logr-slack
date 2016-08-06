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
  expect(server.methods.makeSlackPayload).to.not.equal(undefined);
  done();
});

it('can use the exposed server methods to make a valid slack payload', (done) => {
  const server = new Hapi.Server({});
  const log = new Logr({
    type: 'logr-slack',
    plugins: {
      'logr-slack': 'logr-slack'
    },
    renderOptions: {
      'logr-slack': {
        server,
        slackHook: process.env.SLACK_WEBHOOK,
        // you can provide a name for any channel allowed by the above slack webhook:
        channel: '#hapi-slack-test'
      }
    }
  });
  const expectedPayload = '{"attachments":[{"text":"this is a posting [tag1] "}],"channel":"#hapi-slack-test"}';
  const payload = server.methods.makeSlackPayload(['tag1'], 'this is a posting');
  expect(payload).to.equal(expectedPayload);
  done();
});

it('can use logr to do a post to slack', (done) => {
  const server = new Hapi.Server({});
  server.connection({port: 8080});
  const expectedPayload = {"attachments":[{"text":"this is a posting [tag1] "}],"channel":"#hapi-slack-test"};
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
          server,
          slackHook: 'http://localhost:8080/',
          // you can provide a name for any channel allowed by the above slack webhook:
          channel: '#hapi-slack-test'
        }
      }
    });
    log(['tag1'], 'this is a posting');
  });
});
