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

#### Get analysis
 
Request  

```http
  GET http://localhost:8080/analyze
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `-` | `-` | `-`. |

Response  

```
response
```
