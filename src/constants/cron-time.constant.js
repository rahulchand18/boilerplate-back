/*
 ┌────────────── second (optional)
 │ ┌──────────── minute
 │ │ ┌────────── hour
 │ │ │ ┌──────── day of month
 │ │ │ │ ┌────── month
 │ │ │ │ │ ┌──── day of week
 │ │ │ │ │ │
 │ │ │ │ │ │
 * * * * * *
**/

const CRON_TIME = {
    IMPORT_EMPLOYEE: '0 */1 * * 1-5' // Every hour, Monday through Friday,
};

export default CRON_TIME;
