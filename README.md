<h1 align="center">logr-slack</h1>

<p align="center">
  <a href="https://github.com/firstandthird/logr-slack/actions">
    <img src="https://img.shields.io/github/workflow/status/firstandthird/logr-slack/Test/main?label=Tests&style=for-the-badge" alt="Test Status"/>
  </a>
  <a href="https://github.com/firstandthird/logr-slack/actions">
    <img src="https://img.shields.io/github/workflow/status/firstandthird/logr-slack/Lint/main?label=Lint&style=for-the-badge" alt="Lint Status"/>
  </a>
</p>

For use exclusively with [logr-all](https://github.com/firstandthird/logr-all) and [logr](https://github.com/firstandthird/logr)

## Installation

```sh
npm install logr-slack
```

_or_

```sh
yarn add logr-slack
```

## Usage

```javascript
const Logr = require('logr');

Logr.createLogger({
  initLog: true,
  reporters: {
    slack: {
      reporter: require('logr-slack'),
      options: {
        enabled: process.env.SLACK_HOOK ? true : false,
        slackHook: process.env.SLACK_HOOK,
        channel: process.env.SLACK_CHANNEL,
        username: process.env.SLACK_USERNAME ? process.env.SLACK_USERNAME : 'logr',
        filter: process.env.LOGR_SLACK_FILTER ? process.env.LOGR_SLACK_FILTER.split(',') : ['error']
      }
    },
  }
});
```

---

<a href="https://firstandthird.com"><img src="https://firstandthird.com/_static/ui/images/safari-pinned-tab-62813db097.svg" height="32" width="32" align="right"></a>

_A [First + Third](https://firstandthird.com) Project_
