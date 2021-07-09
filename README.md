Clone the project in a path you wish

```bash
  git clone https://github.com/sarismet/codeway-sarismet
```

Go to the project directory

```bash
  cd codeway-sarismet
```
Make sure you have already npm installed in your machine. 
To check if you have or not
```
  node -v
```
If you do not have and reasonable response then install node from [here](https://nodejs.org/en/)

After that install dependencies

```bash
   npm i express
   npm i @google-cloud/pubsub
   npm i @google-cloud/bigquery
```
or 
```bash
   npm install
```
To use the google cloud services we have to login our account. To login you might follow these [instructions](https://cloud.google.com/sdk/gcloud/reference/auth/login) 

We must prepare the dataset, table, topic and subscription before running our servers. You need to give the names of them as argument. 
```bash
   node init.js topic_test sub_test dataset_test table_test
```
After this command we will have our bigquery dataset and table to store our data and topic and subscription on that topic to communication for main server with the server inserting data.

We have two different services. The one under directory named main-server is to catch API request. If the request is 'GET' then we start to analyze data executing some queries. On the other hand, if the request is 'POST' then we transmit the request data to our second server. We established the comminication via google pub/sub. The other server under path named info-register-server is to insert the data taken from main-server into Bigquery table. 

To run main server
```bash
   cd main-server
   node index.js topic_test dataset_test table_test
```
To run info register server
```bash
   cd info-register-server
   node index.js sub_test dataset_test table_test
```

## Important Notes
- Since we have two different servers you need to wait for the other server responsible for insertion if you send a post request to main server to send another request to analyze. The first request can last a little bit longer than the other due to the SSL handshake.
- Daily average session duration can be 0. We substract the last one from the first one and since first one and the second one are the same the substraction result equals to 0. Therefore it can affect the average session duration. Consider the case we have average session duration 500 then if another session with different id comes to the server then our analysis would have average session duration as lower than 500 since the denominator increases even though numerator remains as it is.
- In the server we insert the data coming from main server we run the insertion mechanism every second.

## Scalability
- We get the post request from user or another server ve transmit the data without processing it to the server running under info-register-server. Since the main do not have to wait that server the main server can be available to get another post request. Besides, since we use google cloud's pub/sub server, it helps us run our server under huge traffic. 

#### Get analysis
Returns a basic analysis of data in Bigquery.

Request  

```http
  GET http://localhost:8080/analyze
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `-` | `-` | `-` |

Response  

| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `total_users` | `int` | `total user count` |
| `daily_stats` | `array` | `daily stats informations` |

```
{
    "total_users": 2,
    "daily_stats": [
        {
            "date": "9/7/2021",
            "average_session_duration": 32,
            "active_user_count": 3,
            "new_user_count": 1
        },
        {
            "date": "8/7/2021",
            "average_session_duration": 24,
            "active_user_count": 2,
            "new_user_count": 2
        }
    ]
}
```

#### Post Info 
 
Request  
```http
  POST http://localhost:8080/insert
```
| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `type` | `string` | `type of event` |
| `session_id` | `string` | `session id` |
| `event_name` | `string` | `event namet` |
| `event time` | `int` | `event time` |
| `page` | `string` | `page location` |
| `country` | `string` | `country code` |
| `region` | `string` | `region` |
| `city` | `string` | `city` |
| `user_id` | `string` | `user id` |

```
  {
      "type": "event",
      "session_id": "9FDA743232C2-AB57-483240-87D0-64324772B5A2",
      "event_name": "click",
      "event_time": 1589627711,
      "page": "main",
      "country": "TR",
      "region": "Marmara",
      "city": "Istanbul",
      "user_id": "Uu1qJzlfrxYxOSsds5z2321kfAbmSA5pF3"
  }
```



Response  
| Body  | Type     | Description                |
| :------- | :------- | :------------------------- |
| `Message`| `String` | `The message id, which is to the server running under info-register-server directory`|

```
Message {messageID} sent.
```

## Deployment
I left a dockerfile for deployment process however you need to login the google cloud in that container. When I built it and run it the error message was "Unable to detect a Project Id in the current environment.".

## Tech Stack
**Server:** [Nodejs](https://nodejs.org/en/), [express](https://www.npmjs.com/package/express), [@google-cloud/pubsub](https://www.npmjs.com/package/@google-cloud/pubsub), [@google-cloud/bigquery](https://www.npmjs.com/package/@google-cloud/bigquery)

I have used nodejs and expressjs for the server side. We have two different servers and I needed to establish communication between them so the google cloud's pub/sub meets this requirement. In order to store data I used google cloud's bigquery.

## How we can improve it
- The analysis report plot the analsis for each date. However, the dates are not in order. While you scroll down you can see all the analysis of 07/07/2021 earlier than analysis of 05/07/2021. I should have order the list before response. 
- We execute five different queries for each field of analysis. We can enhance this process to speed up by developing two complex queries to extract all the data from Bigquery. - We could use Redis to cache the data so that we do not have to execute query for the dates that we already have in Redis. 

## REFERENCE
I have used many piece of code from readme tutorials of these repositorys below.
- https://github.com/googleapis/nodejs-pubsub/
- https://github.com/googleapis/nodejs-bigquery
