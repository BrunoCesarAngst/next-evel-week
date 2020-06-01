import express from 'express';

const app = express();

app.get('/', (request, response) => {
  console.log('Bruno');

  response.json([
    'Bruno',
    'Bruno',
    'Bruno',
    'Bruno',
    'Bruno'
  ]);
});

app.listen(3333);