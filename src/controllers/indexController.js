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
const allDir = `${resultDir}All/`;
const todayDir = CreateTodayDir(date);

const allSubdomainsFile = `${allDir}AllSubdomains.txt`;
const newSubdomainsFile = `${todayDir}NewSubdomains.txt`;

const programsFile = `${allDir}Programs2.txt`;
const goDir =`~/go/bin/`;

//TOOLS

const assetfinderTool = `~/go/bin/assetfinder`;
const gitTool = `python3 ~/tools/github-search/github-subdomains.py`;
const waybackTool = `${goDir}waybackurls`;
const dirsearchTool = `python3 ~/tools/dirsearch/dirsearch.py`;
const arjunTool = `python3 ~/tools/Arjun/arjun.py`;
const gospiderTool = `${goDir}gospider`;
const getjsTool = `${goDir}getJS`;

//TOKEN & APIKEYS. 
const gitToken = `dcef34578292f6c0cd1922d2cd1fa8146755b0ea`;

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
            var gitSubExecuted = await ExecuteGitSubdomains(allDir)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing GitHub Subdomains: ", err);
                                            });
        }

        if(gitSubExecuted){
            var altdnsExecuted = await ExecuteAltDNS(allDir)
                                            .then (data => {
                                                return data
                                            })
                                            .catch((err)=> {
                                                console.log("Break Executing AltDNS: ", err);
                                            });
        }

        if(altdnsExecuted){
            res.status(200).json({
                ok:true,
                msg: 'Complete Subdomain Enumeration Finish...'
            });
        }
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

        // if(aquatoneExecuted){
        //     var jsscannerExecuted = await ExecuteJSScanner(todayDir)
        //                                     .then (data => {
        //                                         return data
        //                                     })
        //                                     .catch((err)=> {
        //                                         console.log("Break Executing JSSCanner: ", err);
        //                                     });
        // }

        // if(jsscannerExecuted){
        //     var dataConsExecuted = await ExecuteDataConsumer(todayDir)  
        //                                     .then(data => {
        //                                         return data
        //                                     })
        //                                     .catch(err => {
        //                                         console.log("Break when executes DataConsumer: ", err);   
        //                                     });
        // }

        // if(dataConsExecuted){
        //     var waybackExecuted = await ExecuteWaybackurls(todayDir)
        //                                     .then(data => {
        //                                         return data
        //                                     })
        //                                     .catch(err => {
        //                                         console.log("Break when executes Waybackurls: ", err);   
        //                                     });
        // }

        // if(waybackExecuted){
        //     var dirsearchExecuted = await ExecuteDirsearch(todayDir)
        //                                     .then(data => {
        //                                         return data
        //                                     })
        //                                     .catch(err => {
        //                                         console.log("Break when executes Dirsearch: ", err);   
        //                                     });
        // }
        
        // if(dirsearchExecuted){
        //     var arjunExecuted = await ExecuteArjun(todayDir)
        //                                     .then(data => {
        //                                         return data
        //                                     })
        //                                     .catch(err => {
        //                                         console.log("Break when executes Arjun: ", err);   
        //                                     });
        // }

        // if(arjunExecuted){

        //     var gospiderExecuted = await ExecuteGoSpider(todayDir)
        //                                     .then(data => {
        //                                         return data
        //                                     })
        //                                     .catch(err => {
        //                                         console.log("Break when executes GoSpider: ", err);   
        //                                     });
        // }

        // if(gospiderExecuted){
        //     var getjsExecuted = await ExecuteGetJs(todayDir)
        //                                 .then(data => {
        //                                     return data
        //                                 })
        //                                 .catch(err => {
        //                                     console.log("Break when executes GetJs: ", err);  
        //                                 });
        // }

        // if(getjsExecuted){
        //     var savedSubdomains = await SaveNewSubdomains()
        //     .then(data => {
        //         return data
        //     })
        //     .catch(err => {
        //         console.log("Break when execute SaveSubdomains: ", err);   
        //     });
        // }

        console.log('Bot HIJOP DE PUTAAAAAAAAA');

        res.status(200).json({
            ok:true,
            msg: 'Complete Subdomain Enumeration Finish...'
        });
    }
    catch(err){
        console.log(err);
    }
};

//################################################################################
//##############################---ENDPOINTS---###################################
//################################################################################


//////////////////////////////////////////////////////////////////////////////////


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

//////////////////////////////////////////////////////////////////////////////////

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

async function ExecuteAltDNS(dir){   
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

        shell.exec(`sed 's/Found: //g' ${altdnsFile} >> ${allSubdomainsFile}`);
        shell.exec(`sort -u ${allSubdomainsFile} -o ${allSubdomainsFile}`); //Removing duplicate entries.

        console.log('############################################################################################');
        console.log('###############################---AltDNS Finish---##########################################');
        console.log('############################################################################################');

        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

//################################################################################
//###############---SUBDOMAIN ENUMERATION FUNCTIONS---############################
//################################################################################


//////////////////////////////////////////////////////////////////////////////////


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

async function ExecuteAquatone(dir){
    try {
        
        let aquatoneDir = await CreateAquatoneDir(dir)
                                    .catch((err)=> {
                                        console.log('Aquatone Directory Failed: ', err);
                                        return err;
                                    });

        let syntax = `cat ${dir}/Alive.txt | ~/go/bin/aquatone -ports large -out ${aquatoneDir}`;

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

async function ExecuteJSScanner(dir){
    try {

        let syntax = `./scripts/JSScanner/script.sh ${dir}`;

        console.log('Extracting JS Files!');

        shell.exec(syntax);

        return true;
    }
    catch(err){
        return err;
    }
}

async function ExecuteWaybackurls(dir){
    try {

        let syntax = `cat ${dir}Alive.txt | ${waybackTool} >> ${dir}Waybackurls.txt`;

        console.log('Searching Waybackurls!');

        shell.exec(syntax);

        console.log('Waybackurls Finish!');

        return true;
    }
    catch(err){
        return err;
    }
}

async function ExecuteDirsearch(dir){
    try {

        let syntax = `${dirsearchTool} -L ${dir}Alive.txt -t 70 -w ${dirsearchDict} -e html,js,php,png,jpg,sql,json,xml,htm,css,asp,jsp,aspx,jspx,git -x 404,301,400,500,302,403,401,503 --simple-report=${dir}Dirsearch.txt`;

        console.log('Executing Dirsearch');

        shell.exec(syntax);

        console.log('Dirsearch Finish!');

        return true;
    }
    catch(err){
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
        return err;
    }
}

//################################################################################
//###############---SUBDOMAIN MONITORING FUNCTIONS---#############################
//################################################################################

//################################################################################
//########################---OTHER FUNCTIONS \+_+/---#############################
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
//########################---OTHER FUNCTIONS \+_+/---#############################
//################################################################################


module.exports = {
    SubdomainEnumeration,
    ExecuteMonitoring,
    test
}