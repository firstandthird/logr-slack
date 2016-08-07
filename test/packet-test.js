'use strict';

const expect = require('chai').expect;
// this is a logr plugin, so it should be
// installed as a package inside logr using
// 'npm install logr-slack':
const Logr = require('../../../index.js');
const path = require('path');
const _ = require('lodash');

let log = false;
let methods = false;

describe('packet creation', function(){
  beforeEach((done) => {
    methods = {};
    log = new Logr({
      type: 'slack',
      plugins: {
        slack: 'logr-slack'
      },
      renderOptions: {
        slack: {
          methods,
          slackHook: process.env.SLACK_WEBHOOK,
        }
      }
    });
    done();
  });
  it('converts a basic message passed as string ', (done) => {
    const expectedPacket = {
      attachments: [{
        fallback: 'a string',
        title: 'a string',
        fields: [{
          title: 'Tags',
          value: 'test'
        }]
      }],
    };
    const packetString = methods.makeSlackPayload(['test'], 'a string');
    expect(typeof packetString).to.equal('string');
    const packet = JSON.parse(packetString);
    expect(packet).to.deep.equal(expectedPacket);
    done();
  });
  it('lets you post an object as the message', (done) => {
    const expectedPacket = {
      attachments: [{
        text: '``` {\n  "data": "this is an object"\n} ```',
        mrkdwn_in: ['text'],
        fields: []
      }],
    };
    const packet = JSON.parse(methods.makeSlackPayload([], {
      data: 'this is an object'
    }));
    expect(packet).to.deep.equal(expectedPacket);
    done();
  });
  it ('"error" tag will set the "danger" color option', (done) => {
    const expectedPacket = {
      attachments: [{
        color: 'danger',
        title: 'some text',
        fallback: 'some text',
        fields: [{
          title: 'Tags',
          value: 'error'
        }]
      }],
    };
    const packet = JSON.parse(methods.makeSlackPayload(['error'], 'some text'));
    expect(packet).to.deep.equal(expectedPacket);
    done();
  });
  it('warning tags will have a yellow swatch', (done) => {
    const expectedPacket = {
      attachments: [{
        color: 'warning',
        title: 'test msg',
        fallback: 'test msg',
        fields: [{
          title: 'Tags',
          value: 'warning'
        }]
      }],
    };
    const packet = JSON.parse(methods.makeSlackPayload(['warning'], 'test msg'));
    expect(packet).to.deep.equal(expectedPacket);
    done();
  });
  it('"success" tags will have a "good" color', (done) => {
    const expectedPacket = {
      attachments: [{
        color: 'good',
        title: 'a string',
        fallback: 'a string',
        fields: [{
          title: 'Tags',
          value: 'success'
        }]
      }],
    };
    const packet = JSON.parse(methods.makeSlackPayload(['success'], 'a string'));
    expect(packet).to.deep.equal(expectedPacket);
    done();
  });
  it('lets you post an object with a special "message" field', (done) => {
    const expectedPacket = {
      attachments: [{
        title: 'this is the message that was pulled out of the object below',
        fallback: 'this is the message that was pulled out of the object below',
        text: '``` {\n  "data": "this is an object and should be formatted"\n} ```',
        mrkdwn_in: ['text'],
        fields: []
      }],
    };
    const packet = JSON.parse(methods.makeSlackPayload([], {
      message: 'this is the message that was pulled out of the object below',
      data: 'this is an object and should be formatted'
    }));
    expect(packet).to.deep.equal(expectedPacket);
    done();
  });
  it('lets you post an object without a "message" field', (done) => {
    const expectedPacket = {
      attachments: [{
        text: '``` {\n  "data": "this is an object and should be formatted"\n} ```',
        mrkdwn_in: ['text'],
        fields: []
      }],
    };
    const packet = JSON.parse(methods.makeSlackPayload([], {
      data: 'this is an object and should be formatted'
    }));
    expect(packet).to.deep.equal(expectedPacket);
    done();
  });
  it('lets you set the title_link with a url field', (done) => {
    const expectedPacket = {
      attachments: [{
        fields: [],
        title: 'this is the message that was pulled out of the object below',
        fallback: 'this is the message that was pulled out of the object below',
        title_link: 'http://example.com',
        text: '``` {\n  "data": "this is an object and should be formatted"\n} ```',
        mrkdwn_in: ['text'],
      }],
    };
    const packet = JSON.parse(methods.makeSlackPayload([], {
      message: 'this is the message that was pulled out of the object below',
      data: 'this is an object and should be formatted',
      url: 'http://example.com'
    }));
    expect(packet).to.deep.equal(expectedPacket);
    done();
  });
  it('will use a supplied username', (done) => {
    const expectedPacket = {
      username: 'Jared',
      attachments: [{
        title: 'a string',
        fallback: 'a string',
        fields: []
      }],
    };
    log = new Logr({
      type: 'slack',
      plugins: {
        slack: 'logr-slack'
      },
      renderOptions: {
        slack: {
          methods,
          slackHook: process.env.SLACK_WEBHOOK,
          username: 'Jared'
        }
      }
    });
    const packet = JSON.parse(methods.makeSlackPayload([], 'a string'));
    expect(packet).to.deep.equal(expectedPacket);
    done();
  });
  it('will let you specify additional fields in options', (done) => {
    const expectedPacket = {
      attachments: [{
        fields: [
          { title: 'hi', value: 'there' },
          { title: 'go', value: 'away' }
        ],
        fallback: 'hi there',
        title: 'hi there'
      }],
    };
    log = new Logr({
      type: 'slack',
      plugins: {
        slack: 'logr-slack'
      },
      renderOptions: {
        slack: {
          methods,
          slackHook: process.env.SLACK_WEBHOOK,
          additionalFields: [
            { title: 'hi', value: 'there' },
            { title: 'go', value: 'away' }
          ]
        }
      }
    });
    const packet = JSON.parse(methods.makeSlackPayload([], 'hi there'));
    expect(_.isEqual(packet.attachments[0], expectedPacket.attachments[0])).to.equal(true);
    done();
  });
  it('will hide tags when indicated', (done) => {
    const expectedPacket = {
      attachments: [{
        title: 'hi there',
        fallback: 'hi there',
        fields: []
      }],
    };
    log = new Logr({
      type: 'slack',
      plugins: {
        slack: 'logr-slack'
      },
      renderOptions: {
        slack: {
          methods,
          slackHook: process.env.SLACK_WEBHOOK,
          hideTags: true
        }
      }
    });
    const packet = JSON.parse(methods.makeSlackPayload(['tags', 'more tags'], 'hi there'));
    expect(packet).to.deep.equal(expectedPacket);
    done();
  });
  it('will post to a specific channel', (done) => {
    const expectedPacket = {
      attachments: [{
        title: 'a message',
        fallback: 'a message',
        fields: []
      }],
      channel: 'MTV'
    };
    log = new Logr({
      type: 'slack',
      plugins: {
        slack: 'logr-slack'
      },
      renderOptions: {
        slack: {
          methods,
          slackHook: process.env.SLACK_WEBHOOK,
          channel: 'MTV'
        }
      }
    });
    const packet = JSON.parse(methods.makeSlackPayload([], 'a message'));
    expect(packet).to.deep.equal(expectedPacket);
    done();
  });
  it('will post with a provided icon URL', (done) => {
    const expectedPacket = {
      attachments: [{
        title: 'a string',
        fallback: 'a string',
        fields: []
      }],
      icon_url: 'http://image.com'
    };
    log = new Logr({
      type: 'slack',
      plugins: {
        slack: 'logr-slack'
      },
      renderOptions: {
        slack: {
          methods,
          slackHook: process.env.SLACK_WEBHOOK,
          iconURL: 'http://image.com'
        }
      }
    });
    const packet = JSON.parse(methods.makeSlackPayload([], 'a string'));
    expect(packet).to.deep.equal(expectedPacket);
    done();
  });
});
