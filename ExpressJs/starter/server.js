/* eslint-disable import/no-extraneous-dependencies */
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const http = require('http');

/* To handle uncaught exception globally */

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UnCaught Exception Shutting down');
  process.exit(1);
});
dotenv.config({ path: './config.env' });
const app = require('./app');

/* For Running Server 8*/
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('Server running ');
});
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connected successfully');
  });
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, world!\n');
});
/* To handle unhandled rejection globally */
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection Shutting down');
  server.close(() => {
    process.exit(1);
  });
});
