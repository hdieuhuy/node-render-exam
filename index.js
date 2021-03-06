const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const app = express();
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ExamSchema = require('./models/exam');
const port = process.env.PORT || 5000;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  fileFilter(req, file, cb) {
    if (file.mimetype !== 'application/json') {
      return cb(new Error('Something went wrong'), false);
    }
    cb(null, true);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

const uri =
  'mongodb+srv://render-latex:admin@cluster0.ibhfl.mongodb.net/exam?retryWrites=true&w=majority';

app.listen(port, () => {
  console.log(`listening on ${port}`);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
  // res.send('Welcome to server node');
  res.sendFile(__dirname + '/form.html');
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

    app.get('/api/exam/:examCode', (req, res) => {
      const { examCode } = req.params;

      if (!examCode)
        return res.status(201).send({
          error: true,
          message: 'thiếu trường examCode',
          data: {},
        });

      collection.findOne({ examCode }, (err, result) => {
        if (!result)
          return res.status(200).send({
            error: true,
            message: 'không tìm thấy trong database',
            data: {},
          });

        res.status(200).send({
          error: false,
          message: '',
          data: result,
        });
      });
    });

    app.post('/api/exam', upload.single('content'), async (req, response) => {
      if (req.fileValidationError) {
        return response.status(200).send({
          error: true,
          message: 'chỉ nhận file json',
          data: {},
        });
      }

      // info file upload
      const file = req.file;
      const nameFile = req.file.originalname.split('.')[0];
      const extFile = file.mimetype.split('/')[1];
      const pathFile = `./uploads/${file.originalname}`;
      const infoFile = fs.readFileSync(pathFile);
      const contentExam = JSON.stringify(JSON.parse(infoFile));

      const examModel = new ExamSchema({
        examCode: nameFile,
        contentExam,
      });

      // check ext file
      if (extFile !== 'json')
        return response.status(200).send({
          error: true,
          message: 'chỉ nhận file json',
          data: {},
        });

      collection.findOne({ examCode: nameFile }, (err, result) => {
        if (result)
          return response.status(200).send({
            error: true,
            message: `file ${nameFile} đang tồn tại trong database`,
            data: {},
          });

        collection.insertOne(examModel, async (err, result) => {
          if (err)
            return response.status(200).send({
              error: true,
              message: 'đã xảy ra lỗi khi update',
              data: {},
            });

          fs.stat(pathFile, (err, stats) => {
            if (err) {
              return console.error(err);
            }

            fs.unlink(pathFile, (err) => {
              if (err) return console.log(err);

              console.log('file deleted successfully');
              return response.status(200).send({
                error: false,
                message: 'thêm dữ liệu thành công',
                data: {
                  examCode: nameFile,
                },
              });
            });
          });
        });
      });
    });

    app.delete('/api/exam', (req, res) => {
      const { examCode } = req.body;

      if (!examCode)
        return res.status(200).send({
          error: true,
          message: 'thiếu trường examCode',
          data: {},
        });

      collection.deleteOne({ examCode }, (err, result) => {
        if (result) {
          return res.status(200).send({
            error: false,
            message: `Xoá exam ${examCode} thành công`,
            data: {},
          });
        }

        return res.status(200).send({
          error: false,
          message: `Không tìm thấy trong database`,
          data: {},
        });
      });
    });
  }
);
