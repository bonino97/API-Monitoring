//LIBRARIES
const { Op } = require("sequelize");
const { Pool } = require('pg');
const Cursor = require('pg-cursor')
const fs = require('fs');
const dateFormat = require('dateformat');
const shell = require('shelljs');

//MODELS
const Subdomains = require('../models/Subdomains');
const Headers = require('../models/Headers');
const Stacks = require('../models/Stacks');
const Information = require('../models/Information');
const Urls = require('../models/Urls');
//DB CONFIGS
const FindomainDB = require('../config/findomain-db');
const MonitoringDB = require('../config/monitoring-db');

//CONSTANTS
const date = dateFormat(new Date(), "yyyy-mm-dd");


//DIR & FILES
const resultDir = `../MonitoringResults/`;
const allDir = `${resultDir}All/`;
const todayDir = CreateTodayDir(date);

const allSubdomainsFile = `${allDir}AllSubdomains.txt`;
const newSubdomainsFile = `${todayDir}NewSubdomains.txt`;

const programsFile = `${allDir}Programs2.txt`;
const goDir =`~/go/bin/`;

//TOOLS
const assetfinderTool = `~/go/bin/assetfinder`;
const gitTool = `python3 ~/tools/github-search/github-subdomains.py`;

//TOKEN & APIKEYS.
const gitToken = `dcef34578292f6c0cd1922d2cd1fa8146755b0ea`;

//DICCS
const dnsSmallDict = `./scripts/gobuster-dnslists/new-100.txt`;
const dnsBigDict = `./scripts/gobuster-dnslists/dnslist.txt`;

//DB

const findoPool = new Pool({
                host: FindomainDB.host,
                user: FindomainDB.user,
                password: FindomainDB.password,
                database: FindomainDB.database,
                port: FindomainDB.port
            });

const monitPool = new Pool({
                        host: MonitoringDB.host,
                        user: MonitoringDB.user,
                        password: MonitoringDB.password,
                        database: MonitoringDB.database,
                        port: MonitoringDB.port
                    });

//################################################################################
//##############################---ENDPOINTS---###################################
//################################################################################


const test = async (req,res) => {

    try {
        


        res.status(200).json({
            ok:true,
            msg: 'Complete Subdomain Enumeration Finish...'
        });


    }
    catch(err){
        console.log(err);
        return false;
    }

};

const SubdomainEnumeration = async (req,res) => {
    try{

        if(allDir){
            var findomainExecuted = await ExecuteFindomain(allDir, true)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing Findomain: ", err);
                                            });
        }

        if(findomainExecuted){
            var assetfinderExecuted = await ExecuteAssetfinder(allDir, true)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing AssetFinder: ", err);
                                            });
        }

        if(assetfinderExecuted){
            var subfinderExecuted = await ExecuteSubfinder(allDir, true)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing Subfinder: ", err);
                                            });
        }

        if(subfinderExecuted){
            var gobusterExecuted = await ExecuteGobusterDNS(allDir, dnsBigDict, true)
                                    .then (data => {
                                        return data
                                    })
                                    .catch((err)=> {
                                        console.log("Break Executing Gobuster: ", err);
                                    });
        }

        if(gobusterExecuted){
            // var gitSubExecuted = await ExecuteGitSubdomains(allDir)
            //                                 .then (data => {
            //                                     return data
            //                                 })
            //                                 .catch((err)=> {
            //                                     console.log("Break Executing GitHub Subdomains: ", err);
            //                                 });
        }



        res.status(200).json({
            ok:true,
            msg: 'Complete Subdomain Enumeration Finish...'
        });

    }
    catch(err){
        console.log(err);
    }
};

const ExecuteMonitoring = async (req,res) => {
    try{

        // if(todayDir){
        //     shell.exec(`rm -r ${newSubdomainsFile}`);
        //     var findomainExecuted = await ExecuteFindomain(todayDir, false)
        //                                     .then (data => {
        //                                         return data
        //                                     })
        //                                     .catch((err)=> {
        //                                         console.log("Break Executing Findomain: ", err);
        //                                     });
        // }
        

        // if(findomainExecuted){
        //     var assetfinderExecuted = await ExecuteAssetfinder(todayDir, false)
        //                                     .then (data => {
        //                                         return data
        //                                     })
        //                                     .catch((err)=> {
        //                                         console.log("Break Executing AssetFinder: ", err);
        //                                     });
        // }

        // if(assetfinderExecuted){
        //     var subfinderExecuted = await ExecuteSubfinder(todayDir, false)
        //                                     .then (data => {
        //                                         return data
        //                                     })
        //                                     .catch((err)=> {
        //                                         console.log("Break Executing Subfinder: ", err);
        //                                     });
        // }


        // if(subfinderExecuted){
        //     var gobusterExecuted = await ExecuteGobusterDNS(todayDir, dnsSmallDict, false)
        //                                 .then (data => {
        //                                     return data
        //                                 })
        //                                 .catch((err)=> {
        //                                     console.log("Break Executing GoBuster: ", err);
        //                                 });
        // }

        // if(gobusterExecuted){

        //     var saveNewSubExecuted = await SaveNewSubdomains()                                            
        //                                     .then ( data => { 
        //                                         return data 
        //                                     })
        //                                     .catch( err => { 
        //                                         console.log("Break Saving new Subdomains: ", err) 
        //                                     })

        // }

        // if(saveNewSubExecuted){

        //     var httprobeExecuted = await ExecuteHttprobe(todayDir, newSubdomainsFile)
        //                                     .then ( data => { 
        //                                         return data 
        //                                     })
        //                                     .catch( err => { 
        //                                         console.log("Break Executing Httprobe: ", err) 
        //                                     });
        // }

        // if(httprobeExecuted){
        //     var aquatoneExecuted = await ExecuteAquatone(todayDir)
        //                                 .then (data => {
        //                                     return data
        //                                 })
        //                                 .catch((err)=> {
        //                                     console.log("Break Executing Aquatone: ", err);
        //                                 });
        // }

        let aquatoneExecuted = true;

        if(aquatoneExecuted){
            var jsscannerExecuted = await ExecuteJSScanner(todayDir)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing JSSCanner: ", err);
                                            });
        }
                    
    }
    catch(err){
        console.log(err);
    }
};

const FindomainSubdomains = async (req,res) => {

    const allSubdomains = await findoPool.query(`SELECT name FROM subdomains;`);
    const allSubdomainsRows = allSubdomains.rows;

    const allDir = await CreateAllDir()
                            .then (data => {
                                return data
                            })
                            .catch((err)=> {
                                console.log("Break creating All Directory: ", err);
                            });

    // const allSubdomainsFile = await createAllSubdomainsFile(allDir)
    //                                     .then (data => {
    //                                         return data
    //                                     })
    //                                     .catch((err)=> {
    //                                         console.log("Break creating All Subdomain File: ", err);
    //                                     });

    const subdomainExecuted = await ExecuteAllSubdomainsScan(allSubdomainsRows, allSubdomainsFile)
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
};

const FindomainMonitoring = async (req,res) => {
    try{
        const latestSubdomains = await findoPool.query(`SELECT name FROM subdomains WHERE created > (NOW() - interval '24 hours')  AND created < (NOW() + interval '24 hours');`);

        const latestSubdomainRows = latestSubdomains.rows;

        const todaySubdomainFile = await CreateSubdomainsFile(todayDir)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break creating today Subdomain File: ", err);
                                            });        
    
        const subdomainExecuted = await ExecuteSubdomainScan(latestSubdomainRows, todaySubdomainFile)
                                                            .then (data => {
                                                                return data
                                                            })
                                                            .catch((err)=> {
                                                                console.log("Break executing Subdomain Scan: ", err);
                                                            });

        if(subdomainExecuted){
            var httprobeExecuted = await ExecuteHttprobe(todayDir, todaySubdomainFile)
                                                .then (data => {
                                                    return data
                                                })
                                                .catch((err)=> {
                                                    console.log("Break executing Subdomain Scan: ", err);
                                                });
        }


        if(httprobeExecuted){
            var aquatoneExecuted = await ExecuteAquatone(todayDir)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break executing Aquatone: ", err);
                                            });
        }

        if(aquatoneExecuted){
            var dataConsExecuted = await ExecuteDataConsumer(todayDir)  
                                            .then(data => {
                                                return data
                                            })
                                            .catch(err => {
                                                console.log("API Break when executes DataConsumer: ", err);   
                                            });
        }

        if(dataConsExecuted){
            var scriptExecuted = await ExecuteJSScanner(todayDir)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break executing Subdomain Scan: ", err);
                                            });
        }

        res.status(200).json({
           ok:true
        });
    }
    catch(err){
        console.log(err);
    }
};


//################################################################################
//##############################---ENDPOINTS---###################################
//################################################################################


//################################################################################
//#######################---DIRECTORY FUNCTIONS---################################
//################################################################################

async function CreateAllDir(){
    try{

        if(fs.existsSync(resultDir )){
            console.log('Results Directory Exists.');
        } else { 
            shell.exec(`mkdir ${resultDir}`)
        }

        if( fs.existsSync(allDir) ){
            console.log('All Directory Exists.');
        } else { 
            shell.exec(`mkdir ${allDir}`)
        }

        return allDir;
    }
    catch(err){
        return err;
    }
}

function CreateTodayDir(date){
    try{
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

async function CreateSubdomainsFile(todayDir){
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

async function CreateAquatoneDir(todayDir){
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

//################################################################################
//#######################---DIRECTORY FUNCTIONS---################################
//################################################################################

async function ExecuteAllSubdomainsScan(allSubdomainsRows, allSubdomainsFile){
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

async function ExecuteSubdomainScan(latestSubdomainRows, todaySubdomainFile){
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

//################################################################################
//###############---SUBDOMAIN ENUMERATION FUNCTIONS---############################
//################################################################################

async function ExecuteFindomain(dir, enumeration){
    try {

        const findomainFile = `${dir}FindomainDomains.txt`;

        console.log('############################################################################################');
        console.log('###############################---Findomain Started---######################################');
        console.log('############################################################################################');
        
        shell.exec(`export findomain_fb_token="636867740443073|P8-mddEno6zbjHrN5beEKLgZP2Y"`);
        shell.exec(`export findomain_virustotal_token="4a4cbb62ef682d82998d241edd5797a4790ad977cce2302dba124d70dccd5693"`);
        shell.exec(`export findomain_securitytrails_token="SZYVBsbnVl6ms5vTiGiMBO|eyDCZTGKwz"`);

        shell.exec(`rm -r ${findomainFile}`);
        shell.exec(`findomain -f ${programsFile} -u ${findomainFile}`);

        if(enumeration){
            shell.exec(`sed 's/Found: //g' ${findomainFile} >> ${allSubdomainsFile}`);
            shell.exec(`sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`); //Removing duplicate entries.
        } else {
            shell.exec(`grep -xvf ${allSubdomainsFile} ${findomainFile} >> ${newSubdomainsFile}`);
        }

        console.log('############################################################################################');
        console.log('###############################---Findomain Finish---#######################################');
        console.log('############################################################################################');

        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

async function ExecuteAssetfinder(dir, enumeration){
    try {
        
        const assetfinderFile = `${dir}AssetFinderDomains.txt`;

        console.log('############################################################################################');
        console.log('###############################---AssetFinder Stated---#####################################');
        console.log('############################################################################################');
        
        shell.exec(`rm -r ${assetfinderFile}`);
        shell.exec(`cat ${programsFile} | ${assetfinderTool} --subs-only | tee -a ${assetfinderFile}`);

        

        if(enumeration){
            shell.exec(`sed 's/Found: //g' ${assetfinderFile} >> ${allSubdomainsFile}`);
            shell.exec(`sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`);
        } else {
            shell.exec(`grep -xvf ${allSubdomainsFile} ${assetfinderFile} >> ${newSubdomainsFile}`);
        }



        console.log('############################################################################################');
        console.log('###############################---AssetFinder Finish---#####################################');
        console.log('############################################################################################');

        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

async function ExecuteSubfinder(dir, enumeration){
    try {
        
        const subfinderFile = `${dir}/SubfinderDomains.txt`;

        console.log('############################################################################################');
        console.log('###############################---Subfinder Started---######################################');
        console.log('############################################################################################');

        shell.exec(`rm -r ${subfinderFile}`);
        shell.exec(`subfinder -dL ${programsFile} -o ${subfinderFile}`);

        if(enumeration){
            shell.exec(`sed 's/Found: //g' ${subfinderFile} >> ${allSubdomainsFile}`);
            shell.exec(`sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`);
        } else {
            shell.exec(`grep -xvf ${allSubdomainsFile} ${subfinderFile} >> ${newSubdomainsFile}`);
        }

        console.log('############################################################################################');
        console.log('###############################---Subfinder Finish---#######################################');
        console.log('############################################################################################');

        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

async function ExecuteGobusterDNS(dir,gobusterDict, enumeration){
    try {
        const data = fs.readFileSync(programsFile, 'UTF-8');
        const dataArr = data.split('\n');
        const gobusterFile = `${dir}GobusterDomains.txt`;

        console.log('############################################################################################');
        console.log('###############################---Gobuster Started---#######################################');
        console.log('############################################################################################');

        fs.appendFileSync(gobusterFile, '', (err) => {
            if (err) {
                return console.log(err);
            }
        });

        dataArr.forEach(element => {
            shell.exec(`${goDir}gobuster dns -d ${element.trim()} -w ${gobusterDict} -t 100 -o ${dir}AuxGobusterDomains.txt`);
            shell.exec(`sed 's/Found: //g' ${dir}AuxGobusterDomains.txt >> ${gobusterFile}`);
            shell.exec(`rm -r ${dir}AuxGobusterDomains.txt`);
        });

        if(enumeration){
            shell.exec(`sed 's/Found: //g' ${gobusterFile} >> ${allSubdomainsFile}`);
            shell.exec(`sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`);
        } else {
            shell.exec(`grep -xvf ${allSubdomainsFile} ${gobusterFile} >> ${newSubdomainsFile}`);
        }

        console.log('############################################################################################');
        console.log('###############################---Gobuster Finish---########################################');
        console.log('############################################################################################');
    
        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

async function ExecuteGitSubdomains(dir){
    try {
        
        const data = fs.readFileSync(programsFile, 'UTF-8');
        const dataArr = data.split('\n');
        const gitTxt = `${dir}/GitSubdomains.txt`;

        //python3 ~/tools/github-search/github-subdomains.py -d youporn.com -t ${gitToken}

        console.log('############################################################################################');
        console.log('###############################---GitSubdomains Started---##################################');
        console.log('############################################################################################');


        shell.exec(`rm -r ${gitTxt}`);

        fs.appendFileSync(gitTxt, '', (err) => {
            if (err) {
                return console.log(err);
            }
        });

        dataArr.forEach(element => {
            shell.exec(`${gitTool} -d ${element.trim()} -t ${gitToken} | tee -a ${dir}AuxGitSubdomains.txt`);
            shell.exec(`sed 's/Found: //g' ${dir}AuxGitSubdomains.txt >> ${gitTxt}`);
            shell.exec(`rm -r ${dir}AuxGitSubdomains.txt`);
        });

        shell.exec(`sed 's/Found: //g' ${gitTxt} >> ${allSubdomainsFile}`);
        shell.exec(`sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`);


        
        console.log('############################################################################################');
        console.log('###############################---GitSubdomains Finish---###################################');
        console.log('############################################################################################');
    
        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

async function ExecuteAltDNS(allDir){   

}

//################################################################################
//###############---SUBDOMAIN ENUMERATION FUNCTIONS---############################
//################################################################################


//################################################################################
//###############---SUBDOMAIN MONITORING FUNCTIONS---#############################
//################################################################################

async function SaveNewSubdomains(){

    const clientPool = await monitPool.connect();
    const newSubFile = fs.readFileSync(newSubdomainsFile, 'UTF-8');
    const newSubArray = newSubFile.split('\n');
    
    try{
        await clientPool.query('BEGIN');
        
        newSubArray.forEach(async elem => {
            const queryText = `INSERT INTO urls (url) VALUES('${elem}');`
            await clientPool.query(queryText);
        });
        console.log("\x1b[32m",'New Subdomains added in Monitoring Database...');
        await clientPool.query('COMMIT');
    }
    catch(err){
        console.log(err);
        await clientPool.query('ROLLBACK');
        return false;
    }
    finally{
        shell.exec(`cat ${newSubdomainsFile} >> ${allSubdomainsFile} | sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`);
        clientPool.release();
        return true;
    }
}

async function ExecuteHttprobe(dir, file){
    try {
        
        shell.exec(`sort -u ${newSubdomainsFile} -o ${newSubdomainsFile}`); //REMOVE DUPLICATE ENTRIES IN NEW SUBDOMAINS.

        console.log('Discovering alive domains!');

        shell.exec(`cat ${file} | ~/go/bin/httprobe | tee -a ${dir}Alive.txt`);

        return true;
    }
    catch(err){
        return err;
    }
}

async function ExecuteAquatone(todayDir){
    try {
        
        let aquatoneDir = await CreateAquatoneDir(todayDir)
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

async function ExecuteDataConsumer(todayDir){

    try {
        var path = `${todayDir}/Aquatone/aquatone_session.json`;

    
        const aquatoneJson = fs.readFileSync(path, 'utf8');
        
    
        const jsonParsed = JSON.parse(aquatoneJson);
        const jsonPages = jsonParsed['pages']
        const jsonPagesKeys = Object.keys(jsonPages)
    
        console.log('Saving Collected Data in Monitoring Database...');
    
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
                        
                    }
                }
    
                
            }
            catch(err){
                return err;
            }
            
        });
    
        console.log('Finish :)');
        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
    

}

async function ExecuteJSScanner(todayDir){
    try {

        let syntax = `./scripts/JSScanner/script.sh ${todayDir}`;

        console.log('Screenshoting Alive Domains!');

        shell.exec(syntax);

        return true;
    }
    catch(err){
        return err;
    }
}

//################################################################################
//###############---SUBDOMAIN MONITORING FUNCTIONS---#############################
//################################################################################

async function TxtSpliter(){
    var pathOld = './scripts/gobuster-dnslists/top-100.txt';
    var pathNew = './scripts/gobuster-dnslists/new-100.txt';

    const data = fs.readFileSync(pathOld, 'UTF-8');
    const dataArr = data.split(',')


    dataArr.forEach(element => {
        
        console.log(element.split('\n')[0])

        let dataTxt = element.split('\n')[0];

        fs.appendFileSync(pathNew, dataTxt+'\n', (err) => {
            
            if (err) {
                return console.log(err);
            }
        });
        
    });
}

async function SelectUrls(){
    try{
        const clientPool = await monitPool.connect();
        const query = `SELECT url FROM urls`;
        const cursor = clientPool.query(new Cursor(query));
    

        cursor.read(4000000, async (err,row) => {

            if(err){
                console.log(err);
            }

            cursor.close(() => {
                clientPool.release();
            });

        });


    }
    catch(err){
        console.log(err);
        return false;
    }
    finally{
        return true;
    }
}



module.exports = {
    FindomainSubdomains,
    FindomainMonitoring,
    SubdomainEnumeration,
    ExecuteMonitoring,
    test
}