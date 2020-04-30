//LIBRARIES
const Telegraf = require('telegraf');
const fetch = require('node-fetch');
const shell = require('shelljs');

//API KEYs
const botKey = '1075658805:AAEyt1oljdw-DvDSU7pN691fnCetUNYeuUA';

//BOT
const bot = new Telegraf(botKey);

bot.start((ctx) => {
    console.log(ctx);
    ctx.reply('Welcome');
});

bot.command(['Enumeration', 'enumeration', 'ENUMERATION'], (ctx) =>{
    ctx.reply('sticker')
    fetch('http://localhost:3001/Enumeration')
        .then(res => {
            if(res.ok){
                ctx.reply('Ok!')
            }
        })
        .catch(err => console.log(err))
});

bot.command(['Monitoring','monitoring','MONITORING'], (ctx) =>{
    fetch('http://localhost:3001/Monitoring')
        .then(res => {
            if(res.ok){
                ctx.reply('Ok!')
            }
        })
        .catch(err => console.log(err))
});

bot.launch();