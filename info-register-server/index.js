//REFERENCE: https://github.com/googleapis/nodejs-pubsub/
//REFERENCE: https://github.com/googleapis/nodejs-bigquery

const { PubSub } = require('../node_modules/@google-cloud/pubsub');
const { BigQuery } = require('../node_modules/@google-cloud/bigquery');
const bigquery = new BigQuery();
const pubSubClient = new PubSub();
const sub = process.argv.slice(2)[0];
const datasetName = process.argv.slice(2)[1];
const tableName = process.argv.slice(2)[2];
async function listenForMessages(subscriptionName) {
    const subscription = pubSubClient.subscription(subscriptionName);
    const messageHandler = message => {
        async function query() {
            jsonObj = JSON.parse(message.data);
            var currentDate = new Date();
            var day = currentDate.getDate();
            var month = currentDate.getMonth() + 1;
            var year = currentDate.getFullYear();
            var date = day + "/" + month + "/" + year;
            const query = `INSERT INTO ${datasetName}.${tableName} VALUES('${jsonObj.type}','${jsonObj.session_id}','${jsonObj.event_name}',${jsonObj.event_time},'${date}','${jsonObj.page}','${jsonObj.country}','${jsonObj.region}','${jsonObj.city}','${jsonObj.user_id}');`;
            const options = {
                query: query,
                location: 'EU',
            };
            const [job] = await bigquery.createQueryJob(options);
            await job.getQueryResults();
        }
        query();
        message.ack();
    };
    subscription.on('message', messageHandler);
    setInterval(() => {
    }, 1 * 1000);
}

listenForMessages(sub);