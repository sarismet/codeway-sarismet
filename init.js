//REFERENCE: https://github.com/googleapis/nodejs-pubsub/
//REFERENCE: https://github.com/googleapis/nodejs-bigquery

const { PubSub } = require('@google-cloud/pubsub');
const { BigQuery } = require('@google-cloud/bigquery');
const pubSubClient = new PubSub();
const bigquery = new BigQuery();

async function createSubscriptionTable(topicName, subscriptionName) {
    await pubSubClient.createTopic(topicName);
    console.log(`Topic ${topicName} created.`);

    await pubSubClient.topic(topicName).createSubscription(subscriptionName);
    console.log(`Subscription ${subscriptionName} created.`);
}

async function createTable(datasetId, tableId) {
    schema = [
        { name: 'Type', type: 'STRING' },
        { name: 'session_id', type: 'STRING', mode: 'REQUIRED' },
        { name: 'event_name', type: 'STRING' },
        { name: 'event_time', type: 'INTEGER' },
        { name: 'event_date', type: 'STRING' },
        { name: 'page', type: 'STRING' },
        { name: 'country', type: 'STRING' },
        { name: 'region', type: 'STRING' },
        { name: 'city', type: 'STRING' },
        { name: 'user_id', type: 'STRING', mode: 'REQUIRED' },

    ]
    const optionsDataSet = {
        location: 'EU',
    };
    const [dataSet] = await bigquery.createDataset(datasetId, optionsDataSet);
    console.log(`Dataset ${dataSet.id} created.`);

    const optionsTable = {
        schema: schema,
        location: 'EU',
    };
    // Create a new table in the dataset
    const [table] = await bigquery
        .dataset(datasetId)
        .createTable(tableId, optionsTable);

    console.log(`Table ${table.id} created.`);
}

const argv = process.argv.slice(2);
createSubscriptionTable(argv[0], argv[1]);
createTable(argv[2], argv[3]);
