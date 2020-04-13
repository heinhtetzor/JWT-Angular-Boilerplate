const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/jwt-angular', {useNewUrlParser: true}).then(() => {
    console.log('Connected to db successfully.');
}).catch((e) => {
    console.log('Error connecting.');
    console.log(e);
})

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

module.exports = mongoose;