// ---- [ includes ] ----------------------------------------------------------

var curl = require("node-curl");
var request = require("request");
var settings = require("./settings.js");
var TwitterBot = require("node-twitterbot").TwitterBot;

// ---- [ setup ] -------------------------------------------------------------

var headers = {
  "User-Agent": "creativecommits"
};

var options = {
  "url": "https://api.github.com/events",
  "headers": headers
};

var bot = new TwitterBot(settings.twitterAccess);

// ---- [ helper functions ] --------------------------------------------------

function tweet(message) {
  t.post("statuses/update", {
    "status": message
  }, function(err, data, res) {
    console.log(data);
  });
}

function checkCommit(message) {
  return message.indexOf("fuck") > -1 && message.length < 125;
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
      shortenURL(json.html_url, function(u) {
        bot.tweet(json.commit.message + " " + u);
        console.log("Tweeting: " + json.commit.message + " " + u);
      });
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
  setTimeout(60000, function() {
    request(options, poll);
  });
}

request(options, poll);