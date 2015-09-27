# MITH Sprintbot

A silly little Slack bot to help the MITH team stay on track with sprints.

It sends a reminder (as a direct message) to each member of the
team at the halfway point of a sprint by POSTing to an [Incoming Webhook](https://api.slack.com/incoming-webhooks) integration in our Slack.

No server is required. The project [Gulpfile](https://github.com/trevormunoz/mith-slackbot/blob/master/gulpfile.js) packages and deploys the code to run on [AWS Lambda](https://aws.amazon.com/lambda/). This is connected to a custom API end point on the [AWS API Gateway](https://aws.amazon.com/api-gateway/) so our function can be triggered by another simple POST request. (Currently, a Google Calendar event kicks off the whole shebang so we can control the timing.)

### To Install
1. `git clone https://github.com/trevormunoz/mith-slackbot.git`
2. `cd mith-slackbot`
3. `npm install`
4. `mv sample.env .env`
5. Fill out the necessary information in `.env`
6. `gulp deploy`

### Acknowledgements
I learned from the following projects while putting this together:

* [slack-newswire](https://github.com/aendrew/slack-newswire)
* [eyespi-lambda](https://github.com/bennettrogers/eyespi-lambda) (for the gulpfile)
* ["A Gulp Workflow for Amazon Lambda"](https://medium.com/@AdamRNeary/a-gulp-workflow-for-amazon-lambda-61c2afd723b6), by @AdamRNeary on Medium
