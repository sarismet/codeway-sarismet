//REFERENCE: https://github.com/googleapis/nodejs-pubsub/
const { PubSub } = require('../node_modules/@google-cloud/pubsub');
const { BigQuery } = require('../node_modules/@google-cloud/bigquery');
const bigquery = new BigQuery();
const pubSubClient = new PubSub();

async function listenForMessages(subscriptionName) {
    const subscription = pubSubClient.subscription(subscriptionName);
    let messageCount = 0;
    const messageHandler = message => {
        console.log(`Received message ${message.id}:`);
        console.log(`\tData: ${message.data}`);
        console.log(`\tAttributes: ${message.attributes}`);
        messageCount += 1;

        async function query() {
            jsonObj = JSON.parse(message.data);
            var currentDate = new Date();
            var day = currentDate.getDate();
            var month = currentDate.getMonth() + 1;
            var year = currentDate.getFullYear();

            var date = day + "/" + month + "/" + year;
            const query = `INSERT INTO postdataset.posttable VALUES('${jsonObj.type}','${jsonObj.session_id}','${jsonObj.event_name}',${jsonObj.event_time},'${date}','${jsonObj.page}','${jsonObj.country}','${jsonObj.region}','${jsonObj.city}','${jsonObj.user_id}');`;

            console.log("query", query);

            const options = {
                query: query,
                // Location must match that of the dataset(s) referenced in the query.
                location: 'US',
            };

            // Run the query as a job
            const [job] = await bigquery.createQueryJob(options);
            console.log(`Job ${job.id} started.`);

            // Wait for the query to finish
            const [rows] = await job.getQueryResults();

            // Print the results
            console.log('Rows:');
            rows.forEach(row => console.log(row));
        }


        query();
        // "Ack" (acknowledge receipt of) the message
        message.ack();
    };

    // Listen for new messages until timeout is hit
    subscription.on('message', messageHandler);

    setInterval(() => {

        console.log(`${messageCount} message(s) received.`);
    }, 1 * 1000);
}

listenForMessages('sub-post-main3');