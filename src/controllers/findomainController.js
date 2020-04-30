
// const FindomainDB = require('../config/findomain-db');
// const findoPool = new Pool({
//     host: FindomainDB.host,
//     user: FindomainDB.user,
//     password: FindomainDB.password,
//     database: FindomainDB.database,
//     port: FindomainDB.port
// });


// const FindomainSubdomains = async (req,res) => {

//     const allSubdomains = await findoPool.query(`SELECT name FROM subdomains;`);
//     const allSubdomainsRows = allSubdomains.rows;

//     const allDir = await CreateAllDir()
//                             .then (data => {
//                                 return data
//                             })
//                             .catch((err)=> {
//                                 console.log("Break creating All Directory: ", err);
//                             });

//     // const allSubdomainsFile = await createAllSubdomainsFile(allDir)
//     //                                     .then (data => {
//     //                                         return data
//     //                                     })
//     //                                     .catch((err)=> {
//     //                                         console.log("Break creating All Subdomain File: ", err);
//     //                                     });

//     const subdomainExecuted = await ExecuteAllSubdomainsScan(allSubdomainsRows, allSubdomainsFile)
//                                     .then (data => {
//                                         return data
//                                     })
//                                     .catch((err)=> {
//                                         console.log("Break executing All Subdomains: ", err);
//                                     });

//     if(subdomainExecuted){
//         res.status(200).json({
//             ok:true,
//             msg: 'Subdomain Update Completed'
//         });
//     }

//     res.status(400).json({
//         ok: false,
//         msg: 'Subdomain Update Failed'
//     })
// };

// const FindomainMonitoring = async (req,res) => {
//     try{
//         const latestSubdomains = await findoPool.query(`SELECT name FROM subdomains WHERE created > (NOW() - interval '24 hours')  AND created < (NOW() + interval '24 hours');`);

//         const latestSubdomainRows = latestSubdomains.rows;

//         const todaySubdomainFile = await CreateSubdomainsFile(todayDir)
//                                             .then (data => {
//                                                 return data
//                                             })
//                                             .catch((err)=> {
//                                                 console.log("Break creating today Subdomain File: ", err);
//                                             });        
    
//         const subdomainExecuted = await ExecuteSubdomainScan(latestSubdomainRows, todaySubdomainFile)
//                                                             .then (data => {
//                                                                 return data
//                                                             })
//                                                             .catch((err)=> {
//                                                                 console.log("Break executing Subdomain Scan: ", err);
//                                                             });

//         if(subdomainExecuted){
//             var httprobeExecuted = await ExecuteHttprobe(todayDir, todaySubdomainFile)
//                                                 .then (data => {
//                                                     return data
//                                                 })
//                                                 .catch((err)=> {
//                                                     console.log("Break executing Subdomain Scan: ", err);
//                                                 });
//         }


//         if(httprobeExecuted){
//             var aquatoneExecuted = await ExecuteAquatone(todayDir)
//                                             .then (data => {
//                                                 return data
//                                             })
//                                             .catch((err)=> {
//                                                 console.log("Break executing Aquatone: ", err);
//                                             });
//         }

//         if(aquatoneExecuted){
//             var dataConsExecuted = await ExecuteDataConsumer(todayDir)  
//                                             .then(data => {
//                                                 return data
//                                             })
//                                             .catch(err => {
//                                                 console.log("API Break when executes DataConsumer: ", err);   
//                                             });
//         }

//         if(dataConsExecuted){
//             var scriptExecuted = await ExecuteJSScanner(todayDir)
//                                             .then (data => {
//                                                 return data
//                                             })
//                                             .catch((err)=> {
//                                                 console.log("Break executing Subdomain Scan: ", err);
//                                             });
//         }

//         res.status(200).json({
//            ok:true
//         });
//     }
//     catch(err){
//         console.log(err);
//     }
// };