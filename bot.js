#!/usr/bin/env node

/*
* (C) 2018 precla
*
* This file is part of irc-bot-nodejs.
*
* irc-bot-nodejs is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; either version 3 of the License, or
* (at your option) any later version.
*
* irc-bot-nodejs is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program. If not, see <http://www.gnu.org/licenses/>.
*
*/

'use strict';

// Local libs and files

const config = require('./config'),

// node modules defined in package.json

	c = require('irc-colors'),
	cheerio = require('cheerio'),
	getYouTubeID = require('get-youtube-id'),
	irc = require('irc-upd'),
	moment = require('moment'),
	numeral = require('numeral'),
	ontime = require('ontime'),
	querystring = require('querystring'),
	request = require('request'),
	youtube = require('youtube-api'),
	_ = require('lodash'),
	google = require('google'),

	{ commands, listeners } = require("./globals"),
	{ zeroPad, nanToZero } = require("./util/util"),
	commandHandler = require("./handlers/command"),
	listenerHandler = require("./handlers/listeners");

require('moment-countdown');
require('moment-duration-format');

// bot configuration
var bot = new irc.Client(config.server, config.userNick, {
	port: config.port,
	debug: config.debug,
	secure: config.secure,
	selfSigned: config.selfSigned,
	certExpired: config.certExpired,
	autoConnect: config.autoConnect,
	userNick: config.userNick,
	userName: config.userName,
	realName: config.realName,
	adminNick: config.adminNick,
	channels: config.channels,
	showErrors: config.showErrors,
	floodProtectionDelay: config.floodProtectionDelay,
	messageSplit: config.messageSplit
});

commandHandler()
listenerHandler(bot)

// Youtube authentication key
youtube.authenticate({type: 'key', key: config.youtubeKey});