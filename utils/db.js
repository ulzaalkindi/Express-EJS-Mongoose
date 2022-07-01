const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/wpu', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
    // supaya ditambahkan index pada tiap-tiap document kita
});

// // Menambah 1 data
// const contact1 = new Contact({
//     nama: 'Doddy Alkindi',
//     nohp: '08522671919',
//     email: 'doddy@gmail.com'
// })

// // simpan ke collection
// contact1.save().then((contact) => console.log(contact));


