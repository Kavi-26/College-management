const bcrypt = require('bcryptjs');
const fs = require('fs');

async function gen() {
    const hash = await bcrypt.hash('password123', 10);
    console.log(hash);
    fs.writeFileSync('hash_out.txt', hash);
}

gen();
