'use strict';

const AWS  = require('aws-sdk');
const uuid = require('uuid');

const dynamoConfig = {
  sessionToken:    process.env.AWS_SESSION_TOKEN,
  region:          process.env.AWS_REGION
};
const docClient = new AWS.DynamoDB.DocumentClient(dynamoConfig);
const sitesTable = process.env.TABLE_NAME;

module.exports.createSite = (site) => {
  return new Promise((resolve, reject) => {
    site['id'] = uuid.v1();
    const params = {
      TableName: sitesTable,
      Item: site
    };
    docClient.put(params, (err, data) => {
      if (err) return reject(err);
      return resolve(site);
    });
  });
};

module.exports.getSites = () => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: sitesTable,
      AttributesToGet: [
        'id',
        'name',
        'url',
        'code'
      ]
    };
    docClient.scan(params, (err, data) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(data["Items"]);
    });
  });
};

module.exports.removeSite = (site) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: sitesTable,
      Key: site
    };
    docClient.delete(params, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  })
};

module.exports.updateSiteState = (site) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: sitesTable,
      Key: {
        "id": site.site.id
      },
      UpdateExpression: "set code = :code",
      ExpressionAttributeValues: {
        ":code":site.code
      },
      ReturnValues:"UPDATED_NEW"
    };
    console.log("Updating site statusCode...");
    docClient.update(params, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
};
