# Creative Commits

https://twitter.com/creativecommits

This is a simple Twitter bot that is currently set to post any "creative" commits it happens to come across.

To run, `npm install` and then `node app.js`.

If you want to log some statistics, run `node app.js -l` instead.

## Settings

The format of the `settings.js` file is as follows:

```
exports.twitterAccess = {
  "consumer_key": "",
  "consumer_secret": "",
  "access_token": "",
  "access_token_secret": ""
};

exports.githubToken = "";

exports.logDir = "./logs/";

exports.logFile = "log.csv";
```
