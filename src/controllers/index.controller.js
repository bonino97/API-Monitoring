//LIBRARIES
const { Op } = require("sequelize");
const { Pool }= require('pg');
const fs = require('fs');
const dateFormat = require('dateformat');
const shell = require('shelljs');
const Subdomains = require('../models/Subdomains');
const Headers = require('../models/Headers');
const Stacks = require('../models/Stacks');
const Information = require('../models/Information');

//CONSTANTS

const date = dateFormat(new Date(), "yyyy-mm-dd");


const pool = new Pool({
                host: 'localhost',
                user: 'postgres',
                password: 'ROOT',
                database: 'Findomain',
                port: '5432'
            });


const test = async (req,res) => {

    var path = './results/Monitoring-2020-04-16/Aquatone/aquatone_session.json';

    
    const aquatoneJson = fs.readFileSync(path, 'utf8');
    

    const jsonParsed = JSON.parse(aquatoneJson);
    const jsonPages = jsonParsed['pages']
    const jsonPagesKeys = Object.keys(jsonPages)

    jsonPagesKeys.forEach(async (elem, index) => {

        try {

            let jsonResult = jsonPages[elem];
            let jsonAddress = jsonResult.addrs;
            let jsonHeaders = jsonResult.headers;
            let jsonStacks = jsonResult.tags;

            //let jsonAddressKeys = Object.keys(jsonAddrs)
            let url = jsonResult.url;
            let status = jsonResult.status.slice(0,3).trim();
        
            let existByLikeSearch = await Subdomains.findOne({ where: {url: {[Op.like]: `%${url}%`}}})
            
            if( existByLikeSearch == null ){

                let existByEqualSearch = await Subdomains.findOne({ where: { url : url }})
                
                if( existByEqualSearch == null ){
                    let subdomain = Subdomains.create({
                        url: url,
                        statusCode: status
                    }).then( (subData) =>{
                        jsonAddress.forEach(address => {

                            let information = Information.create({
                                address: address,
                                subdomainId: subData.id
                            });

                        });

                        jsonHeaders.forEach(headerData => {

                            let header = Headers.create({
                                name: headerData.name,
                                value: headerData.value,
                                subdomainId: subData.id
                            });

                        });

                        if(jsonStacks !== null){
                            jsonStacks.forEach(stackData => {
                                
                                let stack = Stacks.create({
                                    stackName: stackData.text,
                                    subdomainId: subData.id
                                });

                            });
                        }

                    });
                    
                    subdomain.save();
                    
                }
            }
            
        }
        catch(err){
            return err;
        }
        
    })



    res.status(200).json({
        ok:true
    });
}



const getAllSubdomains = async (req,res) => {

    const allSubdomains = await pool.query(`SELECT name FROM subdomains;`);
    const allSubdomainsRows = allSubdomains.rows;

    const allDir = await createAllDir()
                            .then (data => {
                                return data
                            })
                            .catch((err)=> {
                                console.log("Break creating All Directory: ", err);
                            });

    const allSubdomainsFile = await createAllSubdomainsFile(allDir)
                                        .then (data => {
                                            return data
                                        })
                                        .catch((err)=> {
                                            console.log("Break creating All Subdomain File: ", err);
                                        });

    const subdomainExecuted = await executeAllSubdomainsScan(allSubdomainsRows, allSubdomainsFile)
                                    .then (data => {
                                        return data
                                    })
                                    .catch((err)=> {
                                        console.log("Break executing All Subdomains: ", err);
                                    });

    if(subdomainExecuted){
        res.status(200).json({
            ok:true,
            msg: 'Subdomain Update Completed'
        });
    }

    res.status(400).json({
        ok: false,
        msg: 'Subdomain Update Failed'
    })
} 

const getSubdomains = async (req,res) => {
    try{
        const latestSubdomains = await pool.query(`SELECT name FROM subdomains WHERE created > (NOW() - interval '24 hours')  AND created < (NOW() + interval '24 hours');`);
        //const allSubdomains = await pool.query(`SELECT name FROM subdomains;`);
        const latestSubdomainRows = latestSubdomains.rows;

        const todayDir = await createTodayDir(date)
                                    .then (data => {
                                        return data
                                    })
                                    .catch((err)=> {
                                        console.log("Break creating today Directory: ", err);
                                    });

        const todaySubdomainFile = await createSubdomainsFile(todayDir)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break creating today Subdomain File: ", err);
                                            });        
    
        let subdomainExecuted = await executeSubdomainScan(latestSubdomainRows, todaySubdomainFile)
                                                            .then (data => {
                                                                return data
                                                            })
                                                            .catch((err)=> {
                                                                console.log("Break executing Subdomain Scan: ", err);
                                                            });

        if(subdomainExecuted){
            var httprobeExecuted = await executeHttprobe(todayDir, todaySubdomainFile)
                                                .then (data => {
                                                    return data
                                                })
                                                .catch((err)=> {
                                                    console.log("Break executing Subdomain Scan: ", err);
                                                });
        }

        // if(httprobeExecuted){
        //     var scriptExecuted = await executeJSScanner(todayDir, todaySubdomainFile)
        //                                     .then (data => {
        //                                         return data
        //                                     })
        //                                     .catch((err)=> {
        //                                         console.log("Break executing Subdomain Scan: ", err);
        //                                     });
        // }

        if(httprobeExecuted){
            var aquatoneExecuted = await executeAquatone(todayDir)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break executing Aquatone: ", err);
                                            });
        }

        if(aquatoneExecuted){

        }

        res.status(200).json({
           ok:true
        });
    }
    catch(err){
        console.log(err);
    }
};


async function createAllDir(){
    try{
        let resultDir = `./results/`;
        let AllDir = `${resultDir}All/`;

        if( fs.existsSync(resultDir ) ){
            console.log('Results Directory Exists.');
        } else { 
            shell.exec(`mkdir ${resultDir}`)
        }

        if( fs.existsSync(AllDir) ){
            console.log('All Directory Exists.');
        } else { 
            shell.exec(`mkdir ${AllDir}`)
        }

        return AllDir;
    }
    catch(err){
        return err;
    }
}

async function createAllSubdomainsFile(allDir){
    try{

        const defaultFile = `${allDir}AllSubdomains.txt`;

        if( fs.existsSync(defaultFile) ){
            
            console.log('AllSubdomains File Exists.');
        } else { 
            shell.exec(`> ${defaultFile}`)
        }

        return defaultFile;
    }
    catch(err){
        return err;
    }
}

async function createTodayDir(date){
    try{
        let resultDir = `./results/`;
        let todayDir = `${resultDir}Monitoring-${date}/`;

        if( fs.existsSync(resultDir ) ){
            console.log('Results Directory Exists.');
        } else { 
            shell.exec(`mkdir ${resultDir}`)
        }

        if( fs.existsSync(todayDir) ){
            console.log('Today Directory Exists.');
        } else { 
            shell.exec(`mkdir ${todayDir}`)
        }

        return todayDir;
    }
    catch(err){
        return err;
    }
}

async function createSubdomainsFile(todayDir){
    try{

        const defaultFile = `${todayDir}Subdomains.txt`;

        if( fs.existsSync(defaultFile) ){
            
            console.log('Today Subdomain File Exists.');
        } else { 
            shell.exec(`> ${defaultFile}`)
        }

        return defaultFile;
    }
    catch(err){
        return err;
    }
}

async function createAquatoneDir(todayDir){
    try{

        let aquatoneDir = `${todayDir}Aquatone/`;

        if( fs.existsSync(todayDir) ){
            shell.exec(`mkdir ${aquatoneDir}`);
        } 

        return aquatoneDir;
    }
    catch(err){
        return err;
    }
}

async function executeAllSubdomainsScan(allSubdomainsRows, allSubdomainsFile){
    try{

        console.log('Starting update of Subdomains! - This may take a while...');

        allSubdomainsRows.forEach(element => {
            
            fs.appendFileSync(allSubdomainsFile, element.name+'\n', (err) => {
                
                if (err) {
                    return console.log(err);
                }
    
            });
        });

        console.log('Removing duplicate entries!');

        shell.exec(`sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`);

        return true;
    }
    catch(err){
        return err;
    }
}



async function executeSubdomainScan(latestSubdomainRows, todaySubdomainFile){
    try{

        latestSubdomainRows.forEach(element => {
            
            fs.appendFileSync(todaySubdomainFile, element.name+'\n', (err) => {
                
                if (err) {
                    return console.log(err);
                }
    
            });
        });

        console.log('Removing duplicate entries!');

        shell.exec(`sort -u ${todaySubdomainFile} -o ${todaySubdomainFile}`);

        return true;
    }
    catch(err){
        return err;
    }
}

async function executeHttprobe(todayDir, todaySubdomainFile){
    try {
        
        console.log('Discovering alive domains!');

        shell.exec(`cat ${todaySubdomainFile} | ~/go/bin/httprobe | tee -a ${todayDir}Alive.txt`);

        return true;
    }
    catch(err){
        return err;
    }
}

async function executeAquatone(todayDir){
    try {
        
        let aquatoneDir = await createAquatoneDir(todayDir)
                                    .catch((err)=> {
                                        console.log('Aquatone Directory Failed: ', err);
                                        return err;
                                    });

        let syntax = `cat ${todayDir}/Alive.txt | ~/go/bin/aquatone -ports large -out ${aquatoneDir}`;

        console.log('Screenshoting Alive Domains!');

        shell.exec(syntax);

        return true;
    }
    catch(err){
        return err;
    }
}


async function updateAllSubdomains(allSubdomains){

}


module.exports = {
    getSubdomains,
    getAllSubdomains,
    test
}