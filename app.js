/**
 * Name: app.js
 * Desc: The main file for the Creative Commits Twitter bot.
 * Auth: Cezary Wojcik
 */

// ---- [ includes ] ----------------------------------------------------------

var logger = require("./logger.js");
var request = require("request");
var settings = require("./settings.js");
var TwitterBot = require("node-twitterbot").TwitterBot;

// ---- [ setup ] -------------------------------------------------------------

var headers = {
  "User-Agent": "creativecommits",
  "ETag": "a18c3bded88eb5dbb5c849a489412bf3"
};

var options = {
  "url": "https://api.github.com/events",
  "headers": headers,
  "auth": {
    "username": settings.githubToken + ":x-oauth-basic"
  }
};

var bot = new TwitterBot(settings.twitterAccess);

var yesWords = [
  "cunt",
  "fuck",
  "(thanks obama)"
];

var noWords = [
  "brainfuck",
  "brain-fuck",
  "(Merge pull request)",
  "(If you reading this go fuck yourself)"
];

var lastTweet = "";

var loggingEnabled = process.argv.indexOf("-l") !== -1;

// ---- [ helper functions ] --------------------------------------------------

function checkCommit(message) {
  var yesPattern = new RegExp(yesWords.join("|"));
  var noPattern = new RegExp(noWords.join("|"));
  return message.length < 125 &&
  yesPattern.test(message.toLowerCase()) &&
  !noPattern.test(message.toLowerCase());
}

function shortenURL(url, callback) {
  request.post({
    "url": "http://git.io",
    "form": {
      "url": url
    }
  }, function (err, response, body) {
    callback(response.headers.location);
  });
}

function postCommitAtURL(url) {
  request({
      "url": url,
      "headers": headers
    }, function (err, res, body) {
      var json = JSON.parse(body);
      if (json.commit.message != lastTweet) {
        lastTweet = json.commit.message;
        shortenURL(json.html_url, function (u) {
          bot.tweet(json.commit.message + " " + u);
          console.log("+tweeting: " + json.commit.message + " " + u);
        });
      }
  });
}

function poll(err, res, body) {
  try {
    if (res.statusCode !== 304) {
      var r = [].concat.apply([], JSON.parse(body)
        .filter(function (e) { return e.type === "PushEvent" })
        .map(function (e) {
          return e.payload.commits.filter(function (f) {
            if (loggingEnabled) {
              logger.logCommit(e.created_at, f.message);
            }
            return checkCommit(f.message);
          })
        }).filter(function (e) { return e.length > 0; }));
      for (i in r) {
        postCommitAtURL(r[i].url);
      }
    }
  } catch (e) {
    console.log("-ERROR: " + e.message);
  }
  setTimeout(function () {
    request(options, poll);
  }, 1000);
}

// ---- [ init ] --------------------------------------------------------------

logger.initLogger();
request(options, poll);
