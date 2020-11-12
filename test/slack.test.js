const Logr = require('logr');
const Hapi = require('@hapi/hapi');
const logrSlack = require('../index.js');
const tap = require('tap');

tap.test('can load the slack plugin ', (t) => {
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
  t.end();
});

tap.test('can use logr to do a basic post to slack', async (t) => {
  t.plan(1);
  const expectedPayload = {
    channel: '#hapi-slack-test',
    attachments: [{
      fallback: 'a string',
      title: 'a string',
      fields: [{
        title: 'Tags',
        value: 'test'
      }],
    }],
  };
  const server = Hapi.server({ port: 8080 });
  server.route({
    method: '*',
    path: '/',
    handler: (request, h) => {
      t.strictSame(request.payload, expectedPayload, 'should return the payload in the appropriate format');
      return 'ok';
    }
  });
  await server.start();
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
  await new Promise(resolve => setTimeout(resolve, 2000));
  await server.stop();
  await t.end();
});

tap.test('can use logr to post with fields to slack', async (t) => {
  t.plan(1);
  const expectedPayload = {
    attachments: [{
      fields: [{ title: 'a', value: true },
        { title: 'b', value: false },
        { title: 'c', value: 'yes' }]
    }],
    channel: '#hapi-slack-test'
  };
  const server = Hapi.server({ port: 8080 });
  server.route({
    method: '*',
    path: '/',
    handler: (request, h) => {
      t.deepEqual(request.payload, expectedPayload, 'should return the payload in the appropriate format');
      return 'ok';
    }
  });
  await server.start();
  const log = Logr.createLogger({
    type: 'slack',
    reporters: {
      slack: {
        reporter: logrSlack,
        options: {
          slackHook: 'http://localhost:8080/',
          json2Fields: true,
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
  log({ a: true, b: false, c: 'yes' });
  await new Promise(resolve => setTimeout(resolve, 2000));
  await server.stop();
  await t.end();
});
