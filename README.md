## Run Locally

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
If you do not have ant reasonable response then install node from [here](https://nodejs.org/en/)

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

Preparation the dataset, table, Topic and Subscription 
```bash
   node init.js
```
After this command we will have our bigquery dataset and table to store our data and 
topic and subscription on that topic to communication for main server with the server inserting data.

- We have two different services. The one under directory named main-server is to catch API request. If the request is 'GET' then we start to analyze data executing some queries. On the other hand if the request is 'POST' then we transmit the request data to our second server. We established the comminication via google pub/sub. The other server under path named info-register-server is to insert the data taken from main-server into Bigquery table.
 
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


| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `-` | `-` | `-`. |

Response  

```
Message {messageID} sent.
```
