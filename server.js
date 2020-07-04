const connect = require('connect');
const serveStatic = require('serve-static');

const DEFAULT_PORT = 5501;

connect().use(serveStatic(__dirname)).listen(DEFAULT_PORT, () =>{
    console.log(`Server is running on port ${DEFAULT_PORT}`);
});