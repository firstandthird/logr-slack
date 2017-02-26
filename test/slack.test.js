'use strict';
const expect = require('chai').expect;
const Logr = require('logr');
const Hapi = require('hapi');
const logrSlack = require('../index.js');

it('can load the slack plugin ', (done) => {
  const log = Logr.createLogger({
    type: 'slack',
    reporters: {
      slack: {
        reporter: logrSlack,
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
  expect(typeof log).to.equal('function');
  done();
});

it('can use logr to do a basic post to slack', (done) => {
  const server = new Hapi.Server({});
  server.connection({ port: 8080 });
  const expectedPayload = {
    channel: '#hapi-slack-test',
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
    const log = Logr.createLogger({
      type: 'slack',
      reporters: {
        slack: {
          reporter: logrSlack,
          options: {
            slackHook: 'http://localhost:8080',
            // you can provide a name for any channel allowed by the above slack webhook:
            channel: '#hapi-slack-test',
            // you can list which tags will cause a server.log call to post to slack:
            tags: ['warning', 'error', 'success', 'test'],
            // you can specify tags that will automatically be appended to each post to slack:
            additionalTags: ['server-test.js', 'someAdditionalTag']
          }
        }
      }
    });
    log(['test'], 'a string');
  });
});
