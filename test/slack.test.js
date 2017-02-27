'use strict';
const Logr = require('logr');
const Hapi = require('hapi');
const logrSlack = require('../index.js');
const test = require('tape');

test('can load the slack plugin ', (t) => {
  t.plan(1);
  const log = Logr.createLogger({
    type: 'slack',
    reporters: {
      slack: {
        reporter: logrSlack,
        slackHook: 'no hook',
        // you can provide a name for any channel allowed by the above slack webhook:
        channel: '#hapi-slack-test',
        // you can list which tags will cause a server.log call to post to slack:
        tags: ['warning', 'error', 'success', 'test'],
        // you can specify tags that will automatically be appended to each post to slack:
        additionalTags: ['server-test.js', 'someAdditionalTag']
      }
    }
  });
  t.equal(typeof log, 'function', 'should register a "log" function');
});

test('can use logr to do a basic post to slack', (t) => {
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
  const server = new Hapi.Server({});
  server.connection({ port: 8080 });
  server.route({
    method: 'POST',
    path: '/',
    handler: (request, reply) => {
      t.deepEqual(request.payload, expectedPayload, 'should return the payload in the appropriate format');
      // setTimeout(() => {
        server.stop(t.end);
      // }, 1000);
    }
  });
  server.start(() => {
    const log = Logr.createLogger({
      type: 'slack',
      reporters: {
        slack: {
          reporter: logrSlack,
          options: {
            slackHook: 'http://localhost:8080/',
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
