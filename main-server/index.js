//REFERENCE: https://github.com/googleapis/nodejs-pubsub/
//REFERENCE: https://github.com/googleapis/nodejs-bigquery

const express = require('../node_modules/express');
const { PubSub } = require('../node_modules/@google-cloud/pubsub');
const { BigQuery } = require('../node_modules/@google-cloud/bigquery');
const bigquery = new BigQuery();
const pubsub = new PubSub();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const topicName = process.argv.slice(2)[0];
const datasetName = process.argv.slice(2)[1];
const tableName = process.argv.slice(2)[2];
const TOPIC_POST = pubsub.topic(topicName);

async function datas(row) {
    var daily_stats_obj = {}
    const row_date = row.event_date;
    daily_stats_obj.date = row.event_date;
    const average_session_duration_query = `select AVG(diff) as avg from (select *, (e-start) as diff from 
                                            (select  distinct session_id , first_value(event_time) over (partition by session_id order by event_time)
                                            as start, first_value(event_time) over (partition by session_id order by event_time desc) as e 
                                            from ${datasetName}.${tableName}  where event_date = '${row_date}') dt) dt2;`;
    // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
    const average_session_duration_query_options = {
        query: average_session_duration_query,
        location: 'EU',
    };
    const [average_session_duration_query_job] = await bigquery.createQueryJob(average_session_duration_query_options);
    const [average_session_duration_rows] = await average_session_duration_query_job.getQueryResults();
    daily_stats_obj.average_session_duration = average_session_duration_rows[0].avg;

    const active_user_count_query = `SELECT COUNT(*) as count FROM (select distinct user_id from ${datasetName}.${tableName}  where event_date = '${row_date}') dt;`;
    const active_user_count_query_options = {
        query: active_user_count_query,
        location: 'EU',
    };
    const [active_user_count_query_job] = await bigquery.createQueryJob(active_user_count_query_options);
    const [active_user_count_rows] = await active_user_count_query_job.getQueryResults();
    daily_stats_obj.active_user_count = active_user_count_rows[0].count;

    const new_user_count_query = `select count(*) as count from 
                                (select distinct user_id from ${datasetName}.${tableName}  where event_date = '${row_date}' 
                                and user_id not in (select user_id from ${datasetName}.${tableName}  
                                where PARSE_DATE('%d/%m/%Y',event_date) < PARSE_DATE('%d/%m/%Y','${row_date}'))) dt;`;
    // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
    const new_user_count_query_options = {
        query: new_user_count_query,
        location: 'EU',
    };
    const [new_user_count_query_job] = await bigquery.createQueryJob(new_user_count_query_options);
    const [new_user_count_rows] = await new_user_count_query_job.getQueryResults();
    daily_stats_obj.new_user_count = new_user_count_rows[0].count;

    return daily_stats_obj
};


async function query() {
    var total_users = 0;
    var daily_stats = [];
    const total_users_query = `SELECT COUNT(*) as count FROM (select distinct user_id from ${datasetName}.${tableName} ) dt;`;
    const total_users_query_options = {
        query: total_users_query,
        location: 'EU',
    };
    const [total_users_job] = await bigquery.createQueryJob(total_users_query_options);
    const [total_users_rows] = await total_users_job.getQueryResults();
    total_users = Number(total_users_rows[0].count);

    const event_date_query = `SELECT event_date, COUNT(*) as count FROM ${datasetName}.${tableName}  group by event_date;`;
    // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
    const event_date_query_options = {
        query: event_date_query,
        location: 'EU',
    };
    const [event_date_job] = await bigquery.createQueryJob(event_date_query_options);
    const [event_date_rows] = await event_date_job.getQueryResults();
    for (const row of event_date_rows) {
        const row_daily_stats_obj = await datas(row);
        daily_stats.push(row_daily_stats_obj);
    }
    return { total_users: total_users, daily_stats: daily_stats };
}
app.get('/analyze', async (req, res) => {
    var analysis = await query()
    res.status(200).send(JSON.stringify(analysis));
});

app.post('/insert', async (req, res) => {
    if (!req.body) {
        res.status(400).send('Missing payload');
        return;
    }
    const data = Buffer.from(JSON.stringify(req.body));
    try {
        const messageId = await TOPIC_POST.publish(data);
        res.status(200).send(`Message ${messageId} sent.`);
    } catch (error) {
        console.log("error", error);
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

module.exports = app;