// ---- [ includes ] ----------------------------------------------------------

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
  "thanks obama"
];

var noWords = [
  "brainfuck",
  "brain-fuck",
  "less-of-a-clusterfuck"
];

var lastTweet = "";

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
  }, function(err, response, body) {
    callback(response.headers.location);
  });
}

function postCommitAtURL(url) {
  request({
      "url": url,
      "headers": headers
    }, function(err, res, body) {
      var json = JSON.parse(body);
      if (json.commit.message != lastTweet) {
        lastTweet = json.commit.message;
        shortenURL(json.html_url, function(u) {
          bot.tweet(json.commit.message + " " + u);
          console.log("+tweeting: " + json.commit.message + " " + u);
        });
      }
  });
}

function poll(err, res, body) {
  var json = JSON.parse(body);
  for (var i in json) {
    if (json[i].type == "PushEvent") {
      var commits = json[i].payload.commits;
      var url = json[i].repo.url;
      for (var j in commits) {
        var message = commits[j].message;
        if (checkCommit(message)) {
          postCommitAtURL(commits[j].url);
        }
      }
    }
  }
  setTimeout(function() {
    request(options, poll);
  }, 1000);
}

// ---- [ init ] --------------------------------------------------------------

request(options, poll);
