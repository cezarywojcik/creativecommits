/**
 * Name: logger.js
 * Desc: The logging and analytics system portion of the Creative Commits
 *       Twitter bot.
 * Auth: Cezary Wojcik
 */

// ---- [ includes ] ----------------------------------------------------------

var fs = require("fs");
var mkdirp = require("mkdirp");
var settings = require("./settings.js");

// ---- [ misc ] --------------------------------------------------------------

var days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

exports.lastMessageLogged = "";

// ---- [ private functions ] -------------------------------------------------

function ensureLogDirExists() {
  if (!fs.existsSync(settings.logDir)) {
    mkdirp(settings.logDir, function(e) {
      if (e !== null) {
        console.log("-ERROR creating log dir: " + e);
      }
    })
  }
}

function ensureFileExists(path, defaultString) {
  if (!fs.existsSync(path)) {
    fs.writeFile(path, defaultString, function(e) {
      if (e !== null) {
        console.log("-ERROR creating log file: " + e);
      }
    });
  }
}

// ---- [ exported functions ] ------------------------------------------------

exports.initLogger = function() {
  ensureLogDirExists();
  ensureFileExists(settings.logDir + settings.logFile,
    "day,hour,minute,numfucks\n");
  ensureFileExists(settings.logDir + settings.messagesFile, "");
}

exports.logCommit = function(dateString, message) {
  if (message !== exports.lastMessageLogged) {
    exports.lastMessageLogged = message;
    var fucks = message.toLowerCase().match(/fuck/g);
    if (fucks !== null) {
      console.log("Logging " + fucks.length + " fuck" + (fucks.length > 1
        ? "s" : "") + ".");
      fs.appendFile(settings.logDir + settings.messagesFile, message + "\n",
        function(e) {
          if (e !== null) {
            console.log("-ERROR writing to messages file: " + e);
          }
      });
      var date = new Date(dateString);
      fs.appendFile(settings.logDir + settings.logFile,
        days[date.getDay()] + "," + date.getHours() + "," + date.getMinutes()
          + "," + fucks.length + "\n",
        function(e) {
          if (e !== null) {
            console.log("-ERROR writing to log file: " + e);
          }
      });
    }
  }
};
