const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
const MongoClient = require('mongodb').MongoClient;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

var upload = multer({ storage: storage });

const uri =
  'mongodb+srv://render-latex:admin@cluster0.ibhfl.mongodb.net/exam?retryWrites=true&w=majority';

app.listen(3000, function () {
  console.log('listening on 3000');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  console.log('hello world');
  res.sendFile(__dirname + '/index.html');
});

MongoClient.connect(
  uri,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  },
  (err, client) => {
    if (err) return console.error(err);

    console.log('Connected to Database');

    const db = client.db('exam');
    const collection = db.collection('exams');

    app.post('/exam', upload.single('myFile'), (req, res) => {
      console.log('req', req.body);

      const file = req.file;
      if (!file) {
        const error = new Error('Please upload a file');
        error.httpStatusCode = 400;
        return next(error);
      }
      res.send(file);
      // collection
      //   .insertOne(req.body)
      //   .then((result) => {
      //     console.log(result);
      //   })
      //   .catch((error) => console.error(error));
    });
  }
);
