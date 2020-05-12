const fs = require('fs');

var pathOld = './scripts/gobuster-dnslists/top-100.txt';
var pathNew = './scripts/gobuster-dnslists/new-100.txt';

const data = fs.readFileSync(pathOld, 'UTF-8');
const dataArr = data.split(',')


dataArr.forEach(element => {
    
    console.log(element.split('\n')[0])

    let dataTxt = element.split('\n')[0];

    fs.appendFileSync(pathNew, dataTxt+'\n', (err) => {
        
        if (err) {
            return fs.appendFileSync(logsDir, err);
        }
    });
    
});