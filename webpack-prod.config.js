var config = require("./webpack.config");

config.output.filename = '[name].min.js';
config.entry = {
    "calendar": "./src/calendar/calendar.directive"
};

module.exports = config;