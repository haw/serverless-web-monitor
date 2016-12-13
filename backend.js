'use strict';

const AWS    = require('aws-sdk');
const dynamo = require('./lib/dynamo');
const lambda = require('./lib/lambda');

module.exports.trigger = (event, context, callback) => {
	dynamo.getSites().then((sites) => {
    sites.forEach((site) => {
      console.log(site);
      lambda.checkSite(site);
    });
    callback(null, { message: "Trigger Succeeded" });
  });
};

module.exports.probe = (event, context, callback) => {
  const rp     = require('request-promise');
  const errors = require('request-promise/errors');

  return new Promise((resolve, reject) => {
    rp({uri: event.url, resolveWithFullResponse: true}).then((response) => {
      const statusCode = response.statusCode.toString(10);
      const array = {
        site: event,
        date: response.headers.date,
        state: "OK",
        code: statusCode,
        message: response.statusMessage
      };
      return resolve(array);
    }).catch(errors.StatusCodeError, (error) => {
      const statusCode = error.statusCode.toString(10);
      const array = {
        site: event,
        date: error.response.headers.date,
        state: "Fail",
        code: statusCode,
        message: error.error
      };
      return resolve(array);
    }).catch(errors.RequestError, (error) => {
      const now = new Date().toUTCString();
      const array = {
        site: event,
        date: now,
        state: "Fail",
        code: error.error.code,
        message: error.message
      };
      return resolve(array);
    });
  }).then((array) => {
    console.log(array);
    if (event.code == undefined || event.code != array.code) {
      console.log("Accessing DynamoDB...");
      dynamo.updateSiteState(array);
      lambda.callSNS(array);
    }
    return resolve(null, array);
  });
};

module.exports.sns = (event, context, callback) => {
	const snsConfig = {
    sessionToken:   process.env.AWS_SESSION_TOKEN,
    region:         process.env.AWS_REGION,
  };
  const sns = new AWS.SNS(snsConfig);
  const params = {
    TopicArn: process.env.SNS_TOPIC_ARN, 
		Subject: "Status " + event['state'] + " - " + event.site['name'],
  	Message: "Date      : " + event['date'] + "\n" +
             "StatusCode: " + event['code'] + "\n" +
             "Check     : " + event['state'] + "\n" +
             "Name      : " + event.site['name'] + "\n" +
             "URL       : " + event.site['url'] + "\n" +
             "Response  : " + event['message']
	};
  
  console.log("Start SNS Publish");
  sns.publish(params, function(err, data){
    if (err) console.log(err, err.stack);
    else {
      console.log(data);
    }
  });

  callback(null, {
    message: "SNS function success!"
  });
};
