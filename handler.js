'use strict';

const dynamo = require('./lib/dynamo');
const lambda = require('./lib/lambda');

module.exports.dashboard = (event, context, callback) => {
  const fs  = require('fs');
  const ejs = require('ejs');

  dynamo.getSites().then((sites) => {
    const htmlpath = fs.readFileSync('./html/index.html', 'UTF-8');
    const html     = ejs.render(htmlpath, {sites: sites});

    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        "Access-Control-Allow-Origin" : "*"
      },
      body: html
    };
    callback(null, response);
  });
};

module.exports.register = (event, context, callback) => {
  const qs     = require('qs');
  
  const params = qs.parse(event.body);
  const site = {"name": params['name'], "url": params['url']};

  console.log(site);
  dynamo.createSite(site).then((result) => {
    console.log(result);
  });

  const response = {
    statusCode: 302,
    headers: {
      'Location': './',
    },
    body: ""
  };
  callback(null, response);
};

module.exports.remove = (event, context, callback) => {
  const qs  = require('qs');

  const params = qs.parse(event.body);
  const site = {"id": params['id']};
  console.log(site);

  dynamo.removeSite(site).then((result) => {
    console.log(result);
  });

  const response = {
    statusCode: 302,
    headers: {
      'Location': './',
    },
    body: ""
  };
  callback(null, response);
};

module.exports.trigger = (event, context, callback) => {
  dynamo.getSites().then((sites) => {
    sites.forEach((site) => {
      console.log(site);
      lambda.checkSite(site);
    });
    callback(null, { message: "Trigger Succeeded" });
  });
};
