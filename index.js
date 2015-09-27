/*jslint node: true */

'use strict';

// POSTS a message to Slack via incoming webhook

 require('dotenv').load();

 // dependencies
 var request = require('request');
 var format = require('util').format;
 var moment = require('moment');
 var environment = process.env.NODE_ENV ? process.env.NODE_ENV : 'testing';


 exports.handler = function(event, context) {

   var users = [ "trevormunoz", "edsu", "kirstenkeister", "raffazizzi", "ssapienza" ];
   var sprintStart = moment(event.chime)
                      .subtract(11, 'days')
                      .format("dddd, MMMM Do YYYY");
   var sprintHalf = moment(event.chime)
                      .format("dddd, MMMM Do YYYY");
   var sprintEnd = moment(event.chime)
                    .add(7, 'days')
                    .format("dddd, MMMM Do YYYY");

   function messageUser(user) {
     var message = [
       "The current sprint is halfway over.",
       "Please review and update your cards",
       format("on <%s|Trello>", process.env.TRELLO_BOARD),
       "with any blocking issues that might prevent tasks from being completed"
     ].join(" ");

     var payload = {
       "username": "MITH Sprint Update Bot",
       "icon_emoji": ":turtle:",
       "channel": format('@%s', user),
       "attachments": [
         {
           "fallback": "Current sprint is halfway over",
           "title": "Current Sprint — halfway mark!",
           "title_link": format("%s", process.env.TRELLO_BOARD),
           "pretext": format('_Reminder for %s_', sprintHalf),
           "text": message,
           "mrkdwn_in": ["pretext"],
           "fields": [
             {
               "title": "Start Date",
               "value": sprintStart,
               "short": true
             },
             {
               "title": "End Date",
               "value": sprintEnd,
               "short": true
             }
           ],
           "color": "#afbc21"
         }
       ]
     };

     if (environment === 'production' && process.env.hasOwnProperty('SLACK_WEBHOOK')) {
       request.post({
         headers: {'content-type': 'application/json'},
         uri: process.env.SLACK_WEBHOOK,
         method: 'POST',
         json: payload
       }, function(error, response, body) { context.succeed(body); });

     } else {
       context.succeed(payload);
     }
   }

   for(var i=0; i < users.length; i++) {
     console.log("Notifying " + users[i]);
     messageUser(users[i]);
   }
 };
