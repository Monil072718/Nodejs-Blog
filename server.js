const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app = express();
const { connectDb } = require('./database/db');
const BlogModal = require('./model/blogModal');
const UserModal = require('./model/userModal');

connectDb();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.use(express.static('upload'));
app.use(express.static('public'));
const multer = require('multer');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const auth = (req, res, next) => {
    if (!req.cookies.user) {
        res.redirect('/login');
    } else {
        next();
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, 'upload');
    },
    filename: (req, file, cb) => {
        return cb(null, Date.now() + file.originalname);
    }
});

const upload = multer({ storage: storage }).single('file');

app.get('/', async (req, res) => {
    const blog = await BlogModal.find({});
    res.render('pages/index', { blogs: blog, user: req.cookies.user });
});

app.get('/add', auth, (req, res) => {
    res.render('pages/add', { user: req.cookies.user });
});

app.post('/add', async (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Error uploading file.');
        }
        if (req.file) {
            var details = {
                title: req.body.title,
                description: req.body.description,
                username: req.body.username,
                date: req.body.date,
                image: req.file.filename
            };
            try {
                const blog = new BlogModal(details);
                const result = await blog.save();
                res.redirect('/');
            } catch (error) {
                console.error(error);
                res.status(500).send('Error saving blog details.');
            }
        } else {
            res.status(400).send('No file uploaded.');
        }
    });
});

app.get('/signup', (req, res) => {
    res.render('pages/signup');
});

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const user = new UserModal({ name, email, password });
    try {
        const result = await user.save();
        console.log(result);
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.redirect('/signup');
    }
});

app.get('/login', function (req, res) {
    if (req.cookies.user) {
        res.redirect('/add');
    }
    res.render('pages/login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModal.findOne({ email: email });
    if (user) {
        if (user.password === password) {
            let minute = 60 * 200000;
            res.cookie('user', user, { maxAge: minute });
            res.redirect('/add');
        } else {
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
});

app.get('/signout', function (req, res) {
    if (req.cookies.user) {
        res.clearCookie('user');
        res.redirect('/login');
    }
});

app.listen(7500, () => {
    console.log('Listening on port 7500');
});
