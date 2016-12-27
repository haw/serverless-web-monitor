# Serverless Web Monitor

Serverless website monitoring tool using [Serverless Framework V1](https://serverless.com/).

Lambda function send http request every 5min(default). If the response changed, send alert message to AWS SNS.
Manage monitoring website in web page provided by API Gateway, Lambda and DynamoDB.

## Setup

This app will create

* API endpoints
* Lambda Functions
* DynamoDB Table
* SNS Topic

### Serverless Setup

Install serverless framework and setup AWS credential.
See: [Serverless Framework Documentation](http://docs.serverless.com)

### Deploy Application

```
$ git clone https://github.com/haw-itn/serverless-web-monitor.git
$ cd serverless-web-monitor
$ npm install
$ sls deploy
```

You can see the result of deploy like this.

```
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
.....
Serverless: Stack create finished...
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3 (2.01 MB)...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
......................................................................................................................
Serverless: Stack update finished...
Service Information
service: serverless-web-monitor
stage: dev
region: ap-northeast-1
api keys:
  None
endpoints:
  GET - https://xxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/sites
  POST - https://xxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/sites/register
  POST - https://xxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/sites/remove
functions:
  serverless-web-monitor-dev-sns: arn:aws:lambda:ap-northeast-1:1234567890:function:serverless-web-monitor-dev-sns
  serverless-web-monitor-dev-remove: arn:aws:lambda:ap-northeast-1:1234567890:function:serverless-web-monitor-dev-remove
  serverless-web-monitor-dev-probe: arn:aws:lambda:ap-northeast-1:1234567890:function:serverless-web-monitor-dev-probe
  serverless-web-monitor-dev-dashboard: arn:aws:lambda:ap-northeast-1:1234567890:function:serverless-web-monitor-dev-dashboard
  serverless-web-monitor-dev-register: arn:aws:lambda:ap-northeast-1:1234567890:function:serverless-web-monitor-dev-register
  serverless-web-monitor-dev-trigger: arn:aws:lambda:ap-northeast-1:1234567890:function:serverless-web-monitor-dev-trigger
```

### Regist Subscriber
To receive alert, create subscription to SNS topic. This app will create SNS topic named `serverless-web-monitor`.

## Access Control

We recommend to restrict access to these API endpoints.
(e.g. AWS WAF with CloudFront)

If you set `private: true` in `serverless.yml`, all API endpoints require API Key.

```serverless.yml
custom:
  private: true 
```

```
  +----------------+               
  |   CloudFront   |               +-------------+
  |        +       | -- API Key -> | API Gateway |
  |       WAF      |               +-------------+
  +----------------+               

```

## Further Improvements
* Authentication with Amazon Cognito
