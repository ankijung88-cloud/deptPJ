const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin1234', 10);
console.log(hash);
