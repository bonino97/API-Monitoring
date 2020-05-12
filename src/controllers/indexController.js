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
const MonitoringDB = require('../config/monitoring-db');

//CONSTANTS
const date = dateFormat(new Date(), "yyyy-mm-dd");

//DIR & FILES
const resultDir = `../MonitoringResults/`;
const allDir = CreateAllDir(resultDir);

const logsDir = CreateLogs();
const allSubdomainsFile = CreateSubdomainsFile(allDir);

const programsFile = `../programs/programs.txt`;
const goDir =`~/go/bin/`;

//TOOLS

const gitTool = `python3 ~/tools/github-search/github-subdomains.py`;
const dirsearchTool = `python3 ~/tools/dirsearch/dirsearch.py`;
const arjunTool = `python3 ~/tools/Arjun/arjun.py`;
const zileTool = `python3 ~/tools/new-zile/zile.py`;

const subjackTool = `${goDir}subjack`;
const gospiderTool = `${goDir}gospider`;
const getjsTool = `${goDir}getJS`;
const assetfinderTool = `${goDir}assetfinder`;
const waybackTool = `${goDir}waybackurls`;
const hakrawlerTool = `${goDir}hakrawler`;
const gauTool = `${goDir}gau`;

//TOKEN & APIKEYS. 
const gitToken = `dcef34578292f6c0cd1922d2cd1fa8146755b0ea`;
const executeApiKeys = ExecuteApiKeys();

//DICCS
const dnsSmallDict = `./scripts/gobuster-dnslists/new-100.txt`;
const dnsBigDict = `./scripts/gobuster-dnslists/dnslist.txt`;
const dirsearchDict = `./scripts/dirsearch-list/RAFT-medium-directories.txt`;
const paramsDict = `~/tools/Arjun/db/params.txt`; 
const altdnsDict = `~/tools/altdns/words.txt`; 

//DB


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

    const clientPool = await monitPool.connect();
    const newSubFile = fs.readFileSync(allSubdomainsFile, 'UTF-8');
    const newSubArray = newSubFile.split('\n');
    
    try{
        console.log('Init Insert.');
        await clientPool.query('BEGIN');
        
        newSubArray.forEach(async elem => {
            const queryText = `INSERT INTO urls (url) VALUES('${elem}');`
            console.log(elem);
            await clientPool.query(queryText).then(data => console.log(data));
        });
        console.log("\x1b[32m",'New Subdomains added in Monitoring Database...');
        await clientPool.query('COMMIT');
    }
    catch(err){
        fs.appendFileSync(logsDir, err);
        await clientPool.query('ROLLBACK');
        return false;
    }
    finally{
        res.status(200).json({
            ok:true,
            msg: 'Updated Complete...'
        });
    }

};

const Welcome = async(req,res) => {
    try{
        return res.status(200).json({
            ok:true,
            msg: `Welcome to Lemon-Monitoring API`
        });
    }
    catch(err){
        console.log("Welcome Page Fail: ", err);
        fs.appendFileSync(logsDir,err+'\n');
        return res.status(400).json({
            ok: false,
            msg: `Welcome Page Fail - Review logs in ${logsDir}...`
        });
    }
};

const SubdomainEnumeration = async (req,res) => {
    
    const logsDir = CreateLogs();

    try{

        const todayDir = CreateTodayDir();
        const newSubdomainsFile = `${todayDir}NewSubdomains.txt`;

        if(allDir){
            var findomainExecuted = await ExecuteFindomain(allDir, true, newSubdomainsFile)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing Findomain: ", err);
                                                fs.appendFileSync(logsDir,err+'\n');
                                                return res.status(400).json({
                                                    ok: false,
                                                    msg: `Break Executing Findomain - Review logs in ${logsDir}...`
                                                });
                                            });
        }

        if(findomainExecuted){
            var assetfinderExecuted = await ExecuteAssetfinder(allDir, true, newSubdomainsFile)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing AssetFinder: ", err);
                                                fs.appendFileSync(logsDir,err+'\n');
                                                return res.status(400).json({
                                                    ok: false,
                                                    msg: `Break Executing AssetFinder - Review logs in ${logsDir}...`
                                                });
                                            });
        }

        if(assetfinderExecuted){
            var subfinderExecuted = await ExecuteSubfinder(allDir, true, newSubdomainsFile)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing Subfinder: ", err);
                                                fs.appendFileSync(logsDir,err+'\n');
                                                return res.status(400).json({
                                                    ok: false,
                                                    msg: `Break Executing Subfinder - Review logs in ${logsDir}...`
                                                });
                                            });
        }

        if(subfinderExecuted){
            var gobusterExecuted = await ExecuteGobusterDNS(allDir, dnsBigDict, true, newSubdomainsFile)
                                    .then (data => {
                                        return data
                                    })
                                    .catch((err)=> {
                                        console.log("Break Executing Gobuster: ", err);
                                        fs.appendFileSync(logsDir,err+'\n');
                                        return res.status(400).json({
                                            ok: false,
                                            msg: `Break Executing Gobuster - Review logs in ${logsDir}...`
                                        });
                                    });
        }

        if(gobusterExecuted){
            var gitSubExecuted = await ExecuteGitSubdomains(allDir, newSubdomainsFile)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing GitHub Subdomains: ", err);
                                                fs.appendFileSync(logsDir,err+'\n');
                                                return res.status(400).json({
                                                    ok: false,
                                                    msg: `Break Executing GitHub Subdomains - Review logs in ${logsDir}...`
                                                });
                                            });
        }

        if(gitSubExecuted){
            var altdnsExecuted = await ExecuteAltDNS(allDir, newSubdomainsFile)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing AltDNS: ", err);
                                                fs.appendFileSync(logsDir,err+'\n');
                                                return res.status(400).json({
                                                    ok: false,
                                                    msg: `Break Executing AltDNS - Review logs in ${logsDir}...`
                                                });
                                            });
        }

        if(altdnsExecuted){
            return res.status(200).json({
                ok:true,
                msg: 'Complete Subdomain Enumeration Finish...'
            });
        }
    }
    catch(err){
        console.log("Break Executing Subdomain Enumeration: ", err);
        fs.appendFileSync(logsDir,err+'\n');
        return res.status(400).json({
            ok: false,
            msg: `Error in Subdomain Enumeration - Review logs in ${logsDir}...`
        });
    }
};

const SubdomainTakeover = async (req,res) => {

    const todayDir = CreateTodayDir();
    const logsDir = CreateLogs();

    try{

        if(todayDir){

            var subjackExecuted = await ExecuteSubjack(todayDir)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing Subjack: ", err);
                                                fs.appendFileSync(logsDir,err+'\n');
                                                return res.status(400).json({
                                                    ok: false,
                                                    msg: `Break Executing Subjack - Review logs in ${logsDir}...`
                                                });
                                            });
        }

        if(subjackExecuted){
            return res.status(200).json({
                ok:true,
                msg: 'Complete Subdomain Enumeration Finish...'
            });
        }
    }
    catch(err){
        console.log("Break Executing Subdomain Takeover: ", err);
        fs.appendFileSync(logsDir,err+'\n');
        return res.status(400).json({
            ok: false,
            msg: `Break Executing Subdomain Takeover - Review logs in ${logsDir}...`
        });
    }
};

const ExecuteMonitoring = async (req,res) => {
    
    const logsDir = CreateLogs();
    const todayDir = CreateTodayDir();
    const newSubdomainsFile = `${todayDir}NewSubdomains.txt`;

    try{

        if(todayDir){

            var findomainExecuted = await ExecuteFindomain(todayDir, false, newSubdomainsFile)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing Findomain: ", err);
                                                fs.appendFileSync(logsDir,err+'\n');
                                                return res.status(400).json({
                                                    ok: false,
                                                    msg: `Break Executing Findomain - Review logs in ${logsDir}...`
                                                });
                                            });
        }
    
        if(findomainExecuted){
            var assetfinderExecuted = await ExecuteAssetfinder(todayDir, false, newSubdomainsFile)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing AssetFinder: ", err);
                                                fs.appendFileSync(logsDir,err+'\n');
                                                return res.status(400).json({
                                                    ok: false,
                                                    msg: `Break Executing AssetFinder - Review logs in ${logsDir}...`
                                                });
                                            });
        }

        if(assetfinderExecuted){
            var subfinderExecuted = await ExecuteSubfinder(todayDir, false, newSubdomainsFile)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing Subfinder: ", err);
                                                fs.appendFileSync(logsDir,err+'\n');
                                                return res.status(400).json({
                                                    ok: false,
                                                    msg: `Break Executing Subfinder - Review logs in ${logsDir}...`
                                                });
                                            });
        }
        
        // if(subfinderExecuted){
        //     var gobusterExecuted = await ExecuteGobusterDNS(todayDir, dnsSmallDict, false, newSubdomainsFile)
        //                                 .then (data => {
        //                                     return data
        //                                 })
        //                                 .catch((err)=> {
        //                                     console.log("Break Executing GoBuster: ", err);
        //                                     fs.appendFileSync(logsDir,err+'\n');
        //                                     return res.status(400).json({
        //                                         ok: false,
        //                                         msg: `Break Executing GoBuster - Review logs in ${logsDir}...`
        //                                     });
        //                                 });
        // }

        if(subfinderExecuted){

            shell.exec(`sort -u ${newSubdomainsFile} -o ${newSubdomainsFile}`);

            var saveNewSubExecuted = await SaveNewSubdomains(newSubdomainsFile)                                            
                                            .then ( data => { 
                                                return data 
                                            })
                                            .catch( err => { 
                                                console.log("Break Saving New Subdomains: ", err);
                                                fs.appendFileSync(logsDir,err+'\n');
                                                return res.status(400).json({
                                                    ok: false,
                                                    msg: `Break Saving New Subdomains - Review logs in ${logsDir}...`
                                                });
                                            })
        }

        if(saveNewSubExecuted){

            var httprobeExecuted = await ExecuteHttprobe(todayDir, newSubdomainsFile)
                                            .then ( data => { 
                                                return data 
                                            })
                                            .catch( err => { 
                                                console.log("Break Executing Httprobe: ", err);
                                                fs.appendFileSync(logsDir,err+'\n');
                                                return res.status(400).json({
                                                    ok: false,
                                                    msg: `Break Executing Httprobe - Review logs in ${logsDir}...`
                                                });
                                            });
        }

        if(httprobeExecuted){
            var aquatoneExecuted = await ExecuteAquatone(todayDir)
                                        .then (data => {
                                            return data
                                        })
                                        .catch((err)=> {
                                            console.log("Break Executing Aquatone: ", err);
                                            fs.appendFileSync(logsDir,err+'\n');
                                            return res.status(400).json({
                                                ok: false,
                                                msg: `Break Executing Aquatone - Review logs in ${logsDir}...`
                                            });
                                        });
        }

        if(aquatoneExecuted){
            var jsscannerExecuted = await ExecuteJSScanner(todayDir)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing JSSCanner: ", err);
                                                fs.appendFileSync(logsDir,err+'\n');
                                                return res.status(400).json({
                                                    ok: false,
                                                    msg: `Break Executing JSSCanner - Review logs in ${logsDir}...`
                                                });
                                            });
        }

        if(jsscannerExecuted){
            var dataConsExecuted = await ExecuteDataConsumer(todayDir)  
                                            .then(data => {
                                                return data
                                            })
                                            .catch(err => {
                                                console.log("Break Executing DataConsumer: ", err);
                                                fs.appendFileSync(logsDir,err+'\n');
                                                return res.status(400).json({
                                                    ok: false,
                                                    msg: `Break Executing DataConsumer - Review logs in ${logsDir}...`
                                                });
                                            });
        }

        if(dataConsExecuted){
            var waybackExecuted = await ExecuteWaybackurls(todayDir)
                                            .then(data => {
                                                return data
                                            })
                                            .catch(err => {
                                                console.log("Break Executing Waybackurls: ", err);
                                                fs.appendFileSync(logsDir,err+'\n');
                                                return res.status(400).json({
                                                    ok: false,
                                                    msg: `Break Executing Waybackurls - Review logs in ${logsDir}...`
                                                });
                                            });
        }

        // if(waybackExecuted){
        //     var dirsearchExecuted = await ExecuteDirsearch(todayDir)
        //                                     .then(data => {
        //                                         return data
        //                                     })
        //                                     .catch(err => {
        //                                         console.log("Break Executing Dirsearch: ", err);
        //                                         fs.appendFileSync(logsDir,err+'\n');
        //                                         return res.status(400).json({
        //                                             ok: false,
        //                                             msg: `Break Executing Dirsearch - Review logs in ${logsDir}...`
        //                                         });
        //                                     });
        // }
        
        // if(dirsearchExecuted){
        //     var arjunExecuted = await ExecuteArjun(todayDir)
        //                                     .then(data => {
        //                                         return data
        //                                     })
        //                                     .catch(err => {
        //                                         console.log("Break Executing Arjun: ", err);
        //                                         fs.appendFileSync(logsDir,err+'\n');
        //                                         return res.status(400).json({
        //                                             ok: false,
        //                                             msg: `Break Executing Arjun - Review logs in ${logsDir}...`
        //                                         });
        //                                     });
        // }

        if(waybackExecuted){

            var gospiderExecuted = await ExecuteGoSpider(todayDir)
                                            .then(data => {
                                                return data
                                            })
                                            .catch(err => {
                                                console.log("Break Executing GoSpider: ", err);
                                                fs.appendFileSync(logsDir,err+'\n');
                                                return res.status(400).json({
                                                    ok: false,
                                                    msg: `Break Executing GoSpider - Review logs in ${logsDir}...`
                                                });
                                            });
        }

        if(gospiderExecuted){
            var getjsExecuted = await ExecuteGetJs(todayDir)
                                        .then(data => {
                                            return data
                                        })
                                        .catch(err => {
                                            console.log("Break Executing GetJS: ", err);
                                            fs.appendFileSync(logsDir,err+'\n');
                                            return res.status(400).json({
                                                ok: false,
                                                msg: `Break Executing GetJS - Review logs in ${logsDir}...`
                                            });
                                        });
        }

        if(getjsExecuted){
            var hakrawlerExecuted = await ExecuteHakrawler(todayDir, newSubdomainsFile)
                                        .then(data => {
                                            return data
                                        })
                                        .catch(err => {
                                            console.log("Break Executing Hakrawler: ", err);
                                            fs.appendFileSync(logsDir,err+'\n');
                                            return res.status(400).json({
                                                ok: false,
                                                msg: `Break Executing Hakrawler - Review logs in ${logsDir}...`
                                            });
                                        });
        }

        if(hakrawlerExecuted){
            var gauExecuted = await ExecuteGau(todayDir, newSubdomainsFile)
                                .then(data => {
                                    return data
                                })
                                .catch(err => {
                                    console.log("Break Executing Gau: ", err);
                                    fs.appendFileSync(logsDir,err+'\n');
                                    return res.status(400).json({
                                        ok: false,
                                        msg: `Break Executing Gau - Review logs in ${logsDir}...`
                                    });
                                });
        }

        if(gauExecuted){
            var zileExecuted = await ExecuteZile(todayDir)
            .then(data => {
                return data
            })
            .catch(err => {
                console.log("Break Executing Zile: ", err);
                fs.appendFileSync(logsDir,err+'\n');
                return res.status(400).json({
                    ok: false,
                    msg: `Break Executing Zile - Review logs in ${logsDir}...`
                });
            });
        }

        if(zileExecuted){
            return res.status(200).json({
                ok:true,
                msg: 'Complete Subdomain Enumeration Finish...'
            });
        }
    }
    catch(err){
        console.log("Break Executing Monitoring: ", err);
        fs.appendFileSync(logsDir,err+'\n');
        return res.status(400).json({
            ok: false,
            msg: `Break Executing Monitoring - Review logs in ${logsDir}...`
        });
    }
};


//################################################################################
//##############################---ENDPOINTS---###################################
//################################################################################


//////////////////////////////////////////////////////////////////////////////////


//################################################################################
//#######################---DIRECTORY FUNCTIONS---################################
//################################################################################

function CreateAllDir(dir){
    try{

        const allDir = `${dir}All/`;

        if(fs.existsSync(dir)){
            console.log('Results Directory Exists.');
        } else { 
            shell.exec(`mkdir ${dir}`)
        }

        if( fs.existsSync(allDir) ){
            console.log('All Directory Exists.');
        } else { 
            shell.exec(`mkdir ${allDir}`)
        }

        return allDir;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

function CreateLogs(){
    try{

        const logsDir = `${resultDir}Logs/`;
        const logsFile = `${logsDir}Logs-${date}.txt`;

        if(fs.existsSync(logsDir)){
            console.log('Logs Directory Exists.');
        } else { 
            shell.exec(`mkdir ${logsDir}`)
        }

        if(fs.existsSync(logsFile)){
            console.log('Logs File Exists');
        } else {
            shell.exec(`>> ${logsFile}`);
        }

        return logsFile;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

function CreateTodayDir(){
    try{
        const date = dateFormat(new Date(), "yyyy-mm-dd");
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
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

function CreateSubdomainsFile(dir){
    try{

        const defaultFile = `${dir}AllSubdomains.txt`;

        if( fs.existsSync(defaultFile) ){
            
            console.log('Today Subdomain File Exists.');
        } else { 
            shell.exec(`> ${defaultFile}`)
        }

        return defaultFile;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
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
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

//################################################################################
//#######################---DIRECTORY FUNCTIONS---################################
//################################################################################

//////////////////////////////////////////////////////////////////////////////////

//################################################################################
//###############---SUBDOMAIN ENUMERATION FUNCTIONS---############################
//################################################################################

async function ExecuteFindomain(dir, enumeration, newSubdomainsFile){
    try {

        const findomainFile = `${dir}FindomainDomains.txt`;

        if(fs.existsSync(findomainFile)){
            shell.exec(`rm -r ${findomainFile}`);
        }

        console.log('############################################################################################');
        console.log('###############################---Findomain Started---######################################');
        console.log('############################################################################################');

        shell.exec(`findomain -f ${programsFile} -u ${findomainFile}`);

        if(enumeration){
            shell.exec(`awk 'NR == FNR{ a[$0] = 1;next } !a[$0]' ${allSubdomainsFile} ${findomainFile} >> ${newSubdomainsFile}`);
            shell.exec(`sed 's/Found: //g' ${findomainFile} >> ${allSubdomainsFile}`);
            shell.exec(`sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`); //Removing duplicate entries.
        } else {
            shell.exec(`awk 'NR == FNR{ a[$0] = 1;next } !a[$0]' ${allSubdomainsFile} ${findomainFile} >> ${newSubdomainsFile}`);
        }

        console.log('############################################################################################');
        console.log('###############################---Findomain Finish---#######################################');
        console.log('############################################################################################');

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

async function ExecuteAssetfinder(dir, enumeration, newSubdomainsFile){
    try {

        const assetfinderFile = `${dir}AssetFinderDomains.txt`;
        
        if(fs.existsSync(assetfinderFile)){
            shell.exec(`rm -r ${assetfinderFile}`);
        }

        console.log('############################################################################################');
        console.log('###############################---AssetFinder Stated---#####################################');
        console.log('############################################################################################');
        
        shell.exec(`cat ${programsFile} | ${assetfinderTool} --subs-only | tee -a ${assetfinderFile}`);

        if(enumeration){
            shell.exec(`awk 'NR == FNR{ a[$0] = 1;next } !a[$0]' ${allSubdomainsFile} ${assetfinderFile} >> ${newSubdomainsFile}`);
            shell.exec(`sed 's/Found: //g' ${assetfinderFile} >> ${allSubdomainsFile}`);
            shell.exec(`sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`);
        } else {
            shell.exec(`awk 'NR == FNR{ a[$0] = 1;next } !a[$0]' ${allSubdomainsFile} ${assetfinderFile} >> ${newSubdomainsFile}`);
        }



        console.log('############################################################################################');
        console.log('###############################---AssetFinder Finish---#####################################');
        console.log('############################################################################################');

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

async function ExecuteSubfinder(dir, enumeration, newSubdomainsFile){
    try {
        
        const subfinderFile = `${dir}/SubfinderDomains.txt`;

        if(fs.existsSync(subfinderFile)){
            shell.exec(`rm -r ${subfinderFile}`);
        }

        console.log('############################################################################################');
        console.log('###############################---Subfinder Started---######################################');
        console.log('############################################################################################');

        shell.exec(`subfinder -dL ${programsFile} -t 85 -timeout 15 -o ${subfinderFile}`);

        if(enumeration){
            shell.exec(`awk 'NR == FNR{ a[$0] = 1;next } !a[$0]' ${allSubdomainsFile} ${subfinderFile} >> ${newSubdomainsFile}`);
            shell.exec(`sed 's/Found: //g' ${subfinderFile} >> ${allSubdomainsFile}`);
            shell.exec(`sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`);
        } else {
            shell.exec(`awk 'NR == FNR{ a[$0] = 1;next } !a[$0]' ${allSubdomainsFile} ${subfinderFile} >> ${newSubdomainsFile}`);
        }

        console.log('############################################################################################');
        console.log('###############################---Subfinder Finish---#######################################');
        console.log('############################################################################################');

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

async function ExecuteGobusterDNS(dir,gobusterDict, enumeration, newSubdomainsFile){
    try {
        const data = fs.readFileSync(programsFile, 'UTF-8');
        const dataArr = data.split('\n');
        const gobusterFile = `${dir}GobusterDomains.txt`;

        if(fs.existsSync(gobusterFile)){
            shell.exec(`rm -r ${gobusterFile}`);
        }

        console.log('############################################################################################');
        console.log('###############################---Gobuster Started---#######################################');
        console.log('############################################################################################');

        fs.appendFileSync(gobusterFile, '', (err) => {
            if (err) {
                return fs.appendFileSync(logsDir, err);
            }
        });

        dataArr.forEach(element => {
            shell.exec(`${goDir}gobuster dns -d ${element.trim()} -w ${gobusterDict} -t 100 -o ${dir}AuxGobusterDomains.txt`);
            shell.exec(`sed 's/Found: //g' ${dir}AuxGobusterDomains.txt >> ${gobusterFile}`);
            shell.exec(`rm -r ${dir}AuxGobusterDomains.txt`);
        });

        if(enumeration){
            shell.exec(`awk 'NR == FNR{ a[$0] = 1;next } !a[$0]' ${allSubdomainsFile} ${gobusterFile} >> ${newSubdomainsFile}`);
            shell.exec(`sed 's/Found: //g' ${gobusterFile} >> ${allSubdomainsFile}`);
            shell.exec(`sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`);
        } else {
            shell.exec(`awk 'NR == FNR{ a[$0] = 1;next } !a[$0]' ${allSubdomainsFile} ${gobusterFile} >> ${newSubdomainsFile}`);
        }

        console.log('############################################################################################');
        console.log('###############################---Gobuster Finish---########################################');
        console.log('############################################################################################');
    
        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

async function ExecuteGitSubdomains(dir, newSubdomainsFile){
    try {
        
        const data = fs.readFileSync(programsFile, 'UTF-8');
        const dataArr = data.split('\n');
        const gitTxt = `${dir}/GitSubdomains.txt`;

        if(fs.existsSync(gitTxt)){
            shell.exec(`rm -r ${gitTxt}`);
        }

        console.log('############################################################################################');
        console.log('###############################---GitSubdomains Started---##################################');
        console.log('############################################################################################');

        fs.appendFileSync(gitTxt, '', (err) => {
            if (err) {
                return fs.appendFileSync(logsDir, err);
            }
        });

        dataArr.forEach(element => {
            shell.exec(`${gitTool} -d ${element.trim()} -t ${gitToken} | tee -a ${dir}AuxGitSubdomains.txt`);
            shell.exec(`sed 's/Found: //g' ${dir}AuxGitSubdomains.txt >> ${gitTxt}`);
            shell.exec(`rm -r ${dir}AuxGitSubdomains.txt`);
        });

        shell.exec(`awk 'NR == FNR{ a[$0] = 1;next } !a[$0]' ${allSubdomainsFile} ${gitTxt} >> ${newSubdomainsFile}`);
        shell.exec(`sed 's/Found: //g' ${gitTxt} >> ${allSubdomainsFile}`);
        shell.exec(`sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`);


        
        console.log('############################################################################################');
        console.log('###############################---GitSubdomains Finish---###################################');
        console.log('############################################################################################');
    
        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

async function ExecuteAltDNS(dir, newSubdomainsFile){   
    try {

        const altdnsFile = `${dir}AltdnsDomains.txt`;
        const altdnsFileAux = `${dir}AltdnsAuxDomains.txt`;
        const permAltdnsFile = `${dir}AltdnsPermutatedDomains.txt`;

        console.log('############################################################################################');
        console.log('###############################---AltDNS Started---#########################################');
        console.log('############################################################################################');

        shell.exec(`rm -r ${altdnsFile}`);
        shell.exec(`rm -r ${altdnsFileAux}`);

        shell.exec(`altdns -i ${programsFile} -o ${permAltdnsFile} -r -s ${altdnsFileAux} -t 50 -w ${altdnsDict}`);

        let altdnsReadFile = fs.readFileSync(altdnsFileAux, 'UTF-8');
        let altdnsArray = altdnsReadFile.split('\n');
        
        altdnsArray.forEach(elem => {
            console.log(elem.split(':')[0]);

            fs.appendFileSync(altdnsFile,elem.split(':')[0]+'\n');
            
        })
        
        shell.exec(`rm -r ${altdnsFileAux}`);
        shell.exec(`rm -r ${permAltdnsFile}`);

        shell.exec(`awk 'NR == FNR{ a[$0] = 1;next } !a[$0]' ${allSubdomainsFile} ${altdnsFile} >> ${newSubdomainsFile}`);
        shell.exec(`sed 's/Found: //g' ${altdnsFile} >> ${allSubdomainsFile}`);
        shell.exec(`sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`); //Removing duplicate entries.

        console.log('############################################################################################');
        console.log('###############################---AltDNS Finish---##########################################');
        console.log('############################################################################################');

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

//################################################################################
//###############---SUBDOMAIN ENUMERATION FUNCTIONS---############################
//################################################################################


//////////////////////////////////////////////////////////////////////////////////


//################################################################################
//###############---SUBDOMAIN MONITORING FUNCTIONS---#############################
//################################################################################

async function SaveNewSubdomains(newSubdomainsFile){
    
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
        await clientPool.query('ROLLBACK');
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
    finally{
        shell.exec(`cat ${newSubdomainsFile} >> ${allSubdomainsFile} | sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`);
        clientPool.release();
        return true;
    }
}

async function ExecuteHttprobe(dir, file){
    try {
        
        shell.exec(`sort -u ${file} -o ${file}`); //REMOVE DUPLICATE ENTRIES IN NEW SUBDOMAINS.

        console.log('Discovering alive domains!');

        shell.exec(`cat ${file} | ~/go/bin/httprobe | tee -a ${dir}Alive.txt`);

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

async function ExecuteAquatone(dir){
    try {
        
        let aquatoneDir = await CreateAquatoneDir(dir)
                                    .catch((err)=> {
                                        console.log('Aquatone Directory Failed: ', err);
                                        return err;
                                    });

        let syntax = `cat ${dir}/Alive.txt | ~/go/bin/aquatone -screenshot-timeout 10 -out ${aquatoneDir}`;

        console.log('Screenshoting Alive Domains!');

        shell.exec(syntax);

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

async function ExecuteDataConsumer(todayDir){

    try {
        var path = `${todayDir}Aquatone/aquatone_session.json`;

    
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
                fs.appendFileSync(logsDir,err+'\n');
                return err;
            }
            
        });
    
        console.log('Finish :)');
        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
    

}

async function ExecuteJSScanner(dir){
    try {

        let syntax = `./scripts/JSScanner/script.sh ${dir}`;

        console.log('Extracting JS Files!');

        shell.exec(syntax);

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

async function ExecuteWaybackurls(dir){
    try {
        var waybackDir = `${dir}Crawled/`;
        var waybackFile = `${waybackDir}Waybackurls.txt`;
        var syntax = `cat ${dir}Alive.txt | ${waybackTool} >> ${waybackFile}`;

        if(fs.existsSync(dir)){
            shell.exec(`mkdir ${waybackDir}`);
        } 

        console.log('Searching Waybackurls!');

        shell.exec(syntax);

        if(fs.existsSync(waybackFile)){
            shell.exec(`sort -u ${waybackFile} -o ${waybackFile}`);
            
            shell.exec(`cat ${waybackFile} | grep "forward=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "dest=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "redirect=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "uri=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "path=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "continue=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "url=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "window=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "to=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "out=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "view=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "dir=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "show=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "navigation=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "open=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "domain=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "callback=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "return=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "page=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "feed=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "host=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "site=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "html=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "reference=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "file=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "return_to=" >> ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "fetch=" >> ${waybackDir}OpenRedirectsParams.txt`);
    
            shell.exec(`cat ${waybackFile} | grep "select=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "report=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "role=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "update=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "query=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "user=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "name=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "sort=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "where=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "search=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "params=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "process=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "row=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "view=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "table=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "from=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "sel=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "results=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "sleep=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "fetch=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "order=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "keyword=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "column=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "field=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "delete=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "filter=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "alter=" >> ${waybackDir}SQLiParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "create=" >> ${waybackDir}SQLiParams.txt`);
    
            shell.exec(`cat ${waybackFile} | grep "file=" >> ${waybackDir}LFIParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "document=" >> ${waybackDir}LFIParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "pg=" >> ${waybackDir}LFIParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "root=" >> ${waybackDir}LFIParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "folder=" >> ${waybackDir}LFIParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "path=" >> ${waybackDir}LFIParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "style=" >> ${waybackDir}LFIParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "pdf=" >> ${waybackDir}LFIParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "template=" >> ${waybackDir}LFIParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "php_path=" >> ${waybackDir}LFIParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "doc=" >> ${waybackDir}LFIParams.txt`);
    
            shell.exec(`cat ${waybackFile} | grep "access=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "admin=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "dbg=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "debug=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "edit=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "grant=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "test=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "alter=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "clone=">> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "create=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "delete=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "disable=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "enable=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "exec=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "execute=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "load=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "make=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "modify=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "rename=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "reset=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "shell=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "toggle=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "adm=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "root=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "cfg=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "dest=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "redirect=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "uri=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "path=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "continue=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "url=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "window=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "next=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "data=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "reference=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "site=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "html=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "val=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "validate=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "domain=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "callback=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "return=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "page=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "feed=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "host=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "port=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "to=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "out=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "view=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "dir=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "show=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "navigation=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "open=" >> ${waybackDir}SSRFParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "file=" >> ${waybackDir}SSRFParams.txt`);
    
            shell.exec(`cat ${waybackFile} | grep "daemon=" >> ${waybackDir}RCEParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "upload=" >> ${waybackDir}RCEParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "dir=" >> ${waybackDir}RCEParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "execute=" >> ${waybackDir}RCEParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "download=" >> ${waybackDir}RCEParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "log=" >> ${waybackDir}RCEParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "ip=" >> ${waybackDir}RCEParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "cli=" >> ${waybackDir}RCEParams.txt`);
            shell.exec(`cat ${waybackFile} | grep "cmd=" >> ${waybackDir}RCEParams.txt`);
    
            shell.exec(`sort -u ${waybackDir}OpenRedirectsParams.txt -o ${waybackDir}OpenRedirectsParams.txt`);
            shell.exec(`sort -u ${waybackDir}SQLiParams.txt -o ${waybackDir}SQLiParams.txt`);
            shell.exec(`sort -u ${waybackDir}LFIParams.txt -o ${waybackDir}LFIParams.txt`);
            shell.exec(`sort -u ${waybackDir}SSRFParams.txt -o ${waybackDir}SSRFParams.txt`);
            shell.exec(`sort -u ${waybackDir}RCEParams.txt -o ${waybackDir}RCEParams.txt`);

        }

        console.log('Waybackurls Finish!');

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

async function ExecuteDirsearch(dir){
    try {

        let syntax = `${dirsearchTool} -L ${dir}Alive.txt -t 80 -w ${dirsearchDict} -e html,js,php,png,jpg,sql,json,xml,htm,css,asp,jsp,aspx,jspx,git -x 404,301,400,500,302,403,401,503 --simple-report=${dir}Dirsearch.txt`;

        console.log('Executing Dirsearch');

        shell.exec(syntax);

        console.log('Dirsearch Finish!');

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

async function ExecuteArjun(dir){
    try {

        let syntax = `${arjunTool} --urls ${dir}Alive.txt --get -f ${paramsDict} -t 40 -o ${dir}/Arjun.json`;

        console.log('Executing Arjun');

        shell.exec(syntax);

        console.log('Arjun Finish!');

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

async function ExecuteGoSpider(dir){
    try {

        let syntax = `${gospiderTool} -S ${dir}Alive.txt -d 0 -t 3 --sitemap -o ${dir}/GoSpider`;

        console.log('Executing GoSpider');

        shell.exec(syntax);

        console.log('GoSpider Finish!');

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

async function ExecuteGetJs(dir){
    try {

        let syntax = `cat ${dir}Alive.txt | ${getjsTool} -resolve -complete -output=${dir}GetJS.txt`;

        console.log('Executing GetJS');

        shell.exec(syntax);

        console.log('GetJS Finish!');

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

async function ExecuteZile(dir){
    try {

        const apikeyDir = `${dir}APIKeys/`;

        if(fs.existsSync(dir)){
            shell.exec(`mkdir ${apikeyDir}`);
        } 

        let getJsFile = `${dir}GetJS.txt`;
        let dirsearchFile = `${dir}Dirsearch.txt`;
        let waybackFile = `${dir}Crawled/Waybackurls.txt`;
        let aliveFile = `${dir}Alive.txt`;
        let zileFile = `${dir}Zile.txt`;
        let hakrawlerFile = `${dir}Crawled/Hakrawler.txt`;
        let apikeysFile = `${apikeyDir}APIKeys.txt`;

        if(fs.existsSync(waybackFile)){
            shell.exec(`cat ${waybackFile} >> ${zileFile}`);
        }

        if(fs.existsSync(aliveFile)){
            shell.exec(`cat ${aliveFile} >> ${zileFile}`);
        }

        if(fs.existsSync(dirsearchFile)){
            shell.exec(`cat ${dirsearchFile} >> ${zileFile}`);
        }

        if(fs.existsSync(getJsFile)){
            shell.exec(`cat ${getJsFile} >> ${zileFile}`);
        }

        if(fs.existsSync(hakrawlerFile)){
            shell.exec(`cat ${hakrawlerFile} >> ${zileFile}`);
        }

        shell.exec(`sort -u ${zileFile} -o ${zileFile}`);
        
        shell.exec(`cat ${zileFile} | ${zileTool} --request | tee -a ${apikeysFile}`);

        if(fs.existsSync(apikeysFile)){
            shell.exec(`sort -u ${apikeysFile} -o ${apikeysFile}`);
            shell.exec(`cat ${apikeysFile} | sort -u | grep "amazon" > ${apikeyDir}AWS-Info.txt`);
        }

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

async function ExecuteHakrawler(dir, newSubdomainsFile){
    try {
        let hakrawlerDir = `${dir}Crawled/`;
        let hakrawlerFile = `${hakrawlerDir}Hakrawler.txt`;
        let syntax = `cat ${newSubdomainsFile} | ${hakrawlerTool} -plain -depth 3 | tee -a ${hakrawlerFile}`;

        console.log('Executing Hakrawler');

        if(fs.existsSync(dir)){
            shell.exec(`mkdir ${hakrawlerDir}`);
        } 

        shell.exec(syntax);

        if(fs.existsSync(hakrawlerFile)){
            shell.exec(`sort -u ${hakrawlerFile} -o ${hakrawlerFile}`);
            
            shell.exec(`cat ${hakrawlerFile} | grep "forward=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "dest=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "redirect=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "uri=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "path=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "continue=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "url=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "window=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "to=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "out=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "view=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "dir=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "show=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "navigation=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "open=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "domain=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "callback=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "return=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "page=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "feed=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "host=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "site=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "html=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "reference=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "file=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "return_to=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "fetch=" >> ${hakrawlerDir}OpenRedirectsParams.txt`);
    
            shell.exec(`cat ${hakrawlerFile} | grep "select=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "report=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "role=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "update=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "query=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "user=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "name=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "sort=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "where=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "search=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "params=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "process=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "row=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "view=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "table=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "from=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "sel=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "results=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "sleep=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "fetch=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "order=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "keyword=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "column=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "field=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "delete=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "filter=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "alter=" >> ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "create=" >> ${hakrawlerDir}SQLiParams.txt`);
    
            shell.exec(`cat ${hakrawlerFile} | grep "file=" >> ${hakrawlerDir}LFIParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "document=" >> ${hakrawlerDir}LFIParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "pg=" >> ${hakrawlerDir}LFIParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "root=" >> ${hakrawlerDir}LFIParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "folder=" >> ${hakrawlerDir}LFIParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "path=" >> ${hakrawlerDir}LFIParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "style=" >> ${hakrawlerDir}LFIParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "pdf=" >> ${hakrawlerDir}LFIParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "template=" >> ${hakrawlerDir}LFIParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "php_path=" >> ${hakrawlerDir}LFIParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "doc=" >> ${hakrawlerDir}LFIParams.txt`);
    
            shell.exec(`cat ${hakrawlerFile} | grep "access=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "admin=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "dbg=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "debug=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "edit=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "grant=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "test=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "alter=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "clone=">> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "create=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "delete=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "disable=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "enable=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "exec=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "execute=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "load=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "make=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "modify=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "rename=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "reset=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "shell=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "toggle=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "adm=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "root=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "cfg=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "dest=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "redirect=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "uri=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "path=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "continue=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "url=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "window=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "next=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "data=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "reference=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "site=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "html=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "val=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "validate=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "domain=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "callback=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "return=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "page=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "feed=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "host=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "port=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "to=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "out=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "view=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "dir=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "show=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "navigation=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "open=" >> ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "file=" >> ${hakrawlerDir}SSRFParams.txt`);
    
            shell.exec(`cat ${hakrawlerFile} | grep "daemon=" >> ${hakrawlerDir}RCEParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "upload=" >> ${hakrawlerDir}RCEParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "dir=" >> ${hakrawlerDir}RCEParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "execute=" >> ${hakrawlerDir}RCEParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "download=" >> ${hakrawlerDir}RCEParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "log=" >> ${hakrawlerDir}RCEParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "ip=" >> ${hakrawlerDir}RCEParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "cli=" >> ${hakrawlerDir}RCEParams.txt`);
            shell.exec(`cat ${hakrawlerFile} | grep "cmd=" >> ${hakrawlerDir}RCEParams.txt`);
    
            shell.exec(`sort -u ${hakrawlerDir}OpenRedirectsParams.txt -o ${hakrawlerDir}OpenRedirectsParams.txt`);
            shell.exec(`sort -u ${hakrawlerDir}SQLiParams.txt -o ${hakrawlerDir}SQLiParams.txt`);
            shell.exec(`sort -u ${hakrawlerDir}LFIParams.txt -o ${hakrawlerDir}LFIParams.txt`);
            shell.exec(`sort -u ${hakrawlerDir}SSRFParams.txt -o ${hakrawlerDir}SSRFParams.txt`);
            shell.exec(`sort -u ${hakrawlerDir}RCEParams.txt -o ${hakrawlerDir}RCEParams.txt`);

        }

        console.log('Hakrawler Finish!');

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

async function ExecuteGau(dir, newSubdomainsFile){
    try {
        var gauDir = `${dir}Crawled/`;
        var gauFile = `${gauDir}Gau.txt`;
        var syntax = `cat ${newSubdomainsFile} | ${gauTool} | tee -a ${gauFile}`;

        if(fs.existsSync(dir)){
            shell.exec(`mkdir ${gauDir}`);
        } 

        console.log('Executing Gau');

        shell.exec(syntax);

        if(fs.existsSync(gauFile)){
            shell.exec(`sort -u ${gauFile} -o ${gauFile}`);
            
            shell.exec(`cat ${gauFile} | grep "forward=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "dest=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "redirect=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "uri=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "path=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "continue=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "url=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "window=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "to=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "out=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "view=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "dir=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "show=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "navigation=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "open=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "domain=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "callback=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "return=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "page=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "feed=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "host=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "site=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "html=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "reference=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "file=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "return_to=" >> ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`cat ${gauFile} | grep "fetch=" >> ${gauDir}OpenRedirectsParams.txt`);
    
            shell.exec(`cat ${gauFile} | grep "select=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "report=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "role=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "update=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "query=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "user=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "name=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "sort=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "where=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "search=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "params=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "process=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "row=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "view=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "table=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "from=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "sel=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "results=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "sleep=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "fetch=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "order=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "keyword=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "column=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "field=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "delete=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "filter=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "alter=" >> ${gauDir}SQLiParams.txt`);
            shell.exec(`cat ${gauFile} | grep "create=" >> ${gauDir}SQLiParams.txt`);
    
            shell.exec(`cat ${gauFile} | grep "file=" >> ${gauDir}LFIParams.txt`);
            shell.exec(`cat ${gauFile} | grep "document=" >> ${gauDir}LFIParams.txt`);
            shell.exec(`cat ${gauFile} | grep "pg=" >> ${gauDir}LFIParams.txt`);
            shell.exec(`cat ${gauFile} | grep "root=" >> ${gauDir}LFIParams.txt`);
            shell.exec(`cat ${gauFile} | grep "folder=" >> ${gauDir}LFIParams.txt`);
            shell.exec(`cat ${gauFile} | grep "path=" >> ${gauDir}LFIParams.txt`);
            shell.exec(`cat ${gauFile} | grep "style=" >> ${gauDir}LFIParams.txt`);
            shell.exec(`cat ${gauFile} | grep "pdf=" >> ${gauDir}LFIParams.txt`);
            shell.exec(`cat ${gauFile} | grep "template=" >> ${gauDir}LFIParams.txt`);
            shell.exec(`cat ${gauFile} | grep "php_path=" >> ${gauDir}LFIParams.txt`);
            shell.exec(`cat ${gauFile} | grep "doc=" >> ${gauDir}LFIParams.txt`);
    
            shell.exec(`cat ${gauFile} | grep "access=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "admin=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "dbg=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "debug=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "edit=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "grant=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "test=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "alter=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "clone=">> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "create=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "delete=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "disable=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "enable=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "exec=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "execute=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "load=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "make=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "modify=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "rename=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "reset=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "shell=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "toggle=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "adm=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "root=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "cfg=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "dest=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "redirect=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "uri=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "path=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "continue=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "url=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "window=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "next=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "data=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "reference=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "site=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "html=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "val=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "validate=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "domain=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "callback=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "return=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "page=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "feed=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "host=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "port=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "to=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "out=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "view=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "dir=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "show=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "navigation=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "open=" >> ${gauDir}SSRFParams.txt`);
            shell.exec(`cat ${gauFile} | grep "file=" >> ${gauDir}SSRFParams.txt`);
    
            shell.exec(`cat ${gauFile} | grep "daemon=" >> ${gauDir}RCEParams.txt`);
            shell.exec(`cat ${gauFile} | grep "upload=" >> ${gauDir}RCEParams.txt`);
            shell.exec(`cat ${gauFile} | grep "dir=" >> ${gauDir}RCEParams.txt`);
            shell.exec(`cat ${gauFile} | grep "execute=" >> ${gauDir}RCEParams.txt`);
            shell.exec(`cat ${gauFile} | grep "download=" >> ${gauDir}RCEParams.txt`);
            shell.exec(`cat ${gauFile} | grep "log=" >> ${gauDir}RCEParams.txt`);
            shell.exec(`cat ${gauFile} | grep "ip=" >> ${gauDir}RCEParams.txt`);
            shell.exec(`cat ${gauFile} | grep "cli=" >> ${gauDir}RCEParams.txt`);
            shell.exec(`cat ${gauFile} | grep "cmd=" >> ${gauDir}RCEParams.txt`);
    
            shell.exec(`sort -u ${gauDir}OpenRedirectsParams.txt -o ${gauDir}OpenRedirectsParams.txt`);
            shell.exec(`sort -u ${gauDir}SQLiParams.txt -o ${gauDir}SQLiParams.txt`);
            shell.exec(`sort -u ${gauDir}LFIParams.txt -o ${gauDir}LFIParams.txt`);
            shell.exec(`sort -u ${gauDir}SSRFParams.txt -o ${gauDir}SSRFParams.txt`);
            shell.exec(`sort -u ${gauDir}RCEParams.txt -o ${gauDir}RCEParams.txt`);

        }

        console.log('Gau Finish!');

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

//################################################################################
//###############---SUBDOMAIN MONITORING FUNCTIONS---#############################
//################################################################################

//////////////////////////////////////////////////////////////////////////////////

//################################################################################
//###############---SUBDOMAIN TAKEOVER FUNCTION---################################
//################################################################################

async function ExecuteSubjack(dir){
    try {
        let subjackDir = `${dir}Subjack.txt`;
        let syntax = `${subjackTool} -w ${allSubdomainsFile} -ssl -t 75 -timeout 15 -o ${subjackDir} -c ~/go/src/github.com/haccer/subjack/fingerprints.json`;

        console.log('Executing Subjack');
        shell.exec(syntax);
        shell.exec(`sed '/github.com/d;/statuspage.io/d' -i ${subjackDir}`);
        console.log('Subjack Finish!');

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

//################################################################################
//###############---SUBDOMAIN TAKEOVER FUNCTION---################################
//################################################################################

//////////////////////////////////////////////////////////////////////////////////

//################################################################################
//########################---OTHER FUNCTIONS \+_+/---#############################
//################################################################################

function ExecuteApiKeys(){
    try{
        shell.exec('chmod +x ./config/apikeys.sh');
        shell.exec('./config/apikeys.sh');
    }
    catch(err){
        fs.appendFileSync(logsDir,err+'\n');
        return err;
    }
}

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
                return fs.appendFileSync(logsDir, err);
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
                fs.appendFileSync(logsDir, err);
            }

            cursor.close(() => {
                clientPool.release();
            });

        });


    }
    catch(err){
        fs.appendFileSync(logsDir, err);
        return false;
    }
    finally{
        return true;
    }
}

async function ExecuteAllSubdomainsScan(allSubdomainsRows, allSubdomainsFile){
    try{

        console.log('Starting update of Subdomains! - This may take a while...');

        allSubdomainsRows.forEach(element => {
            
            fs.appendFileSync(allSubdomainsFile, element.name+'\n', (err) => {
                
                if (err) {
                    return fs.appendFileSync(logsDir, err);
                }
    
            });
        });

        console.log('Removing duplicate entries!');

        shell.exec(`sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`);

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir, err);
        return err;
    }
}

async function ExecuteSubdomainScan(latestSubdomainRows, todaySubdomainFile){
    try{

        latestSubdomainRows.forEach(element => {
            
            fs.appendFileSync(todaySubdomainFile, element.name+'\n', (err) => {
                
                if (err) {
                    return fs.appendFileSync(logsDir, err);
                }
    
            });
        });

        console.log('Removing duplicate entries!');

        shell.exec(`sort -u ${todaySubdomainFile} -o ${todaySubdomainFile}`);

        return true;
    }
    catch(err){
        fs.appendFileSync(logsDir, err);
        return err;
    }
}

//################################################################################
//########################---OTHER FUNCTIONS \+_+/---#############################
//################################################################################

//////////////////////////////////////////////////////////////////////////////////

module.exports = {
    Welcome,
    SubdomainEnumeration,
    ExecuteMonitoring,
    SubdomainTakeover,
    test
}