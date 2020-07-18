const TelegramBot = require('node-telegram-bot-api');
const Capella = require('@codexteam/capella-pics');
const webp = require('webp-converter');
const request = require('request');
const fs = require('fs');
const token = ''; //Put your token here
var readFileSyncMember = fs.readFileSync(__dirname + "/member.json");
var jReadFileSyncMember = JSON.parse(readFileSyncMember);
var lengthMember = jReadFileSyncMember.member.length;
var sudo = ; //Enter your ID here (Important)
var channel = ''; //Put your username or channel link


const bot = new TelegramBot(token, {polling:true});
bot.on('message', (msg) => {
  var chatId = msg.chat.id;
  var text = msg.text;
  var url = `https://api.telegram.org/bot${token}/getChatMember?chat_id=${channel}&user_id=${msg.from.id}`
  request(url, function(error, response, body){
    const jsonUrl = JSON.parse(body);
    if(text == '/start' && jsonUrl.result.status === 'left'){
      bot.sendMessage(chatId, `- You cannot use the bot until after you subscribe to the bot channel\n- Channel:- ${channel}\nAfter subscribing to the channel, send (/start)`);
    }
   if(text == '/start' && jsonUrl.result.status === 'member' && jReadFileSyncMember.member.indexOf(msg.from.id) == -1){
      jReadFileSyncMember.member[lengthMember] = msg.from.id;
      fs.writeFileSync(__dirname + "/member.json",JSON.stringify(jReadFileSyncMember));
      bot.sendMessage(chatId, `You are welcome in\n- Bot convert poster to image and poster to png file at the same time\n- All you have to do is send the poster to the bot and wait a little longer, and the bot will send the image and file`);
    }
  });
});

bot.onText(/\/start/, (msg) =>{
  if(msg.from.id === sudo){
    bot.sendMessage(msg.chat.id, 'Welcome developers: - \n - To know the number of bot users please send the word (/co) \n - Send a message to all bot users Please send (/bc + text)')
  }
});
bot.onText(/\/co/, (msg) => {
  if(msg.from.id === sudo){
   bot.sendMessage(msg.chat.id, `Members:- *${lengthMember}*`,{
     'parse_mode':'Markdown',
   });
  }
});
bot.onText(/\/bc (.+)/, (msg, match) => {
  if(msg.from.id === sudo){
    jReadFileSyncMember.member.forEach(members => {
      bot.sendMessage(members, match[1]);
    });
    bot.sendMessage(msg.chat.id=sudo, 'Your message has been sent to ' + lengthMember);
  }
});

bot.onText(/\/start/, (msg) =>{
  var userName = msg.from.username;
  var lastName = msg.from.last_name;
  var firstName = msg.from.first_name;
  if(jReadFileSyncMember.member.indexOf(msg.from.id) == -1 && msg.from.id !== sudo){
    bot.sendMessage(msg.chat.id=sudo, `*Someone used the bot\n\n - His information:-\n   -> First_Name:- ${firstName}\n   -> Last_Name:- ${lastName}\n   -> UserName:- @${userName}*`,{
      'parse_mode':'Markdown'
    });
  }
});


// - Convert sticker to file (PNG) and to (JPG)
bot.on('sticker', (msg) => {
  const chatId = msg.chat.id,
        uploadsDir = './uploads';
  bot.downloadFile(msg.sticker.file_id, uploadsDir)
    .then(pathToImage => {
      const pathToImagePng = `${pathToImage}.png`;
      bot.sendChatAction(chatId, 'upload_photo');
      // - Send file (PNG) and (JPG)
      webp.dwebp(pathToImage, pathToImagePng, "-o", status => {
        const capella = new Capella();
        const chatId = msg.chat.id;
        capella.uploadFile(pathToImagePng, resp => {
          bot.sendPhoto(chatId, resp.url ,{caption: '*The image will be sent as (Png)\nWait a little*', 'parse_mode':"Markdown"});
          setTimeout(function(){
            bot.sendChatAction(chatId, 'upload_document')
            bot.sendDocument(chatId, pathToImagePng,{caption: '*The image has been converted to (Png)*','parse_mode':"Markdown"});
          }, 4000);
        });
      });
    })
    // - Error send Message
    .catch(error => {
      bot.sendMessage(chatId, 'I cannot transfer this poster. Please send another poster');
      console.log(error);
      
    });

});



