const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override')
const { body, validationResult, check } = require('express-validator');
require('./utils/db');
const Contact = require('./model/contact');
const app = express();
const port = 3000;
app.use(methodOverride('_method'));
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

// Setup EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));


// Konfigurasi Flash
app.use(cookieParser('secret'));
app.use(session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))

app.use(flash());


app.get('/', (req, res) => {
    const mahasiswa = [
        {
            name: 'Ulza Alkindi',
            email: 'ulza@gmail.com'
        },
        {
            name: 'Rendi Goldbart',
            email: 'rendi@gmail.com'
        },
        {
            name: 'Zuniah Alexandra',
            email: 'zunalex@gmail.com'
        },
    ];
    res.render('index', {
        layout: 'partials/main-layout',
        nama: 'Ulza Alkindi',
        title: 'Contact App Ulza',
        mahasiswa
    });
});

// Halaman About
app.get('/about', (req, res) => {
    res.render('about', {
        layout: 'partials/main-layout',
        title: 'Halaman about',
    });
});

// Halaman Contact
app.get('/contact', async (req, res) => {
    // Contact.find().then((contact) => {
    //     res.send(contact);
    // })
    const contacts = await Contact.find();
    res.render('contact', {
        layout: 'partials/main-layout',
        title: 'Halaman about',
        contacts,
        msg: req.flash('msg'),
    });
});

// Halaman Form tambah contact
app.get('/contact/add', (req, res) => {
    return res.render('add-contact', {
        layout: 'partials/main-layout',
        title: 'Add Contact',
    })
})

// proses tambah data data contact
app.post('/contact', [
    body('nama').custom(async (value) => {
        const duplikat = await Contact.findOne({ nama: value });
        if (duplikat) {
            throw new Error('Nama contact sudah terdaftar')
        }
        return true;
    }),
    check('email', 'Email tidak valid').isEmail(),
    check('nohp', 'No Hp tidak valid').isMobilePhone('id-ID'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('add-contact', {
            title: 'Form tambah data contact',
            layout: 'partials/main-layout',
            errors: errors.array()
        })
    } else {
        Contact.insertMany(req.body, (error, result) => {
            req.flash('msg', 'Data contact berhasil ditambahkan');
            res.redirect('/contact');
        });
    }
});
// Proses delete contact / jangan sampai dibawah contact karena url nya /contact/:nama
// app.get('/contact/delete/:nama', async (req, res) => {
//     const contact = await Contact.findOne({ nama: req.params.nama });
//     // jika contact tidak ada
//     if (!contact) {
//         res.status(404);
//         res.send('<h1>404</h1>');
//     } else {
//         Contact.deleteOne({ _id: contact._id }).then((result) => {
//             req.flash('msg', 'Data contact berhasil dihapus');
//             res.redirect('/contact');
//         });
//     }
// });
app.delete('/contact', (req, res) => {
    Contact.deleteOne({ nama: req.body.nama }).then((result) => {
        req.flash('msg', 'Data contact berhasil dihapus');
        res.redirect('/contact');
    });
})
// form ubah data contact
app.get('/contact/edit/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama });
    return res.render('edit-contact', {
        layout: 'partials/main-layout',
        title: 'Form Ubah Contact',
        contact,
    })
});
app.put('/contact', [
    body('nama').custom(async (value, { req }) => {
        const duplikat = await Contact.findOne({ nama: value });
        if (value !== req.body.oldNama && duplikat) {
            throw new Error('Nama contact sudah terdaftar')
        }
        return true;
    }),
    check('email', 'Email tidak valid').isEmail(),
    check('nohp', 'No Hp tidak valid').isMobilePhone('id-ID'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('edit-contact', {
            title: 'Form Edit data contact',
            layout: 'partials/main-layout',
            errors: errors.array(),
            contact: req.body
        })
    } else {
        Contact.updateOne(
            { _id: req.body._id },
            {
                $set: {
                    nama: req.body.nama,
                    email: req.body.email,
                    nohp: req.body.nohp,
                }
            }
        ).then((result) => {
            req.flash('msg', 'Data contact berhasil diubah');
            res.redirect('/contact');
        })
    }
})

// Halaman Detail
app.get('/contact/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama });
    res.render('detail', {
        layout: 'partials/main-layout',
        title: 'Halaman Detail Contact',
        contact
    });
});

app.listen(port, () => {
    console.log(`Mongo Contact APP | Listening at http://localhost:${port}`);
})