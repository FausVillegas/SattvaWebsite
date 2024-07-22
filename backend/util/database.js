// const mysql = require('mysql2');

// const config = require('../config/config.json');

// const pool = mysql.createPool({
//     host: config.host,
//     user: config.user,
//     database: config.database,
//     password: config.password,
// })

// module.exports = pool.promise();

import { createPool } from 'mysql2';

import config from '../config/config.json' assert { type: 'json' };


const pool = createPool({
    host: config.host,
    user: config.user,
    database: config.database,
    password: config.password,
})

export default pool.promise();