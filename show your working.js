

// JUST MY EXPERIMENTS


cloudlinux-selector create --json --interpreter nodejs --version 12 --app-root telebot --domain fi.co.uk --app-uri telebot

source /home/fi/nodevenv/telebot/12/bin/activate && cd /home/fi/telebot

npm install telebot --save
npm install -g node-gyp
npm config set scripts-prepend-node-path auto
npm install better-sqlite3 --save 

nohup node app.js &


pkill node



const TeleBot = require('telebot');
//const bot = new TeleBot('');

const bot = new TeleBot({
    token: '',
    webhook: {
        // Self-signed certificate:
        // key: './key.pem',
        // cert: './cert.pem',
        url: 'https://fintastic.co.uk',
        host: '134.209.203.205',
        port: 443
    }
});

bot.on('text', msg => bot.sendMessage(msg.from.id, msg.text));

const Database = require('better-sqlite3')
const db = new Database('fontana.db', {
    verbose: console.log
});


const stmt = db.prepare('SELECT *,  max(id) FROM orders WHERE served = ?');
const cat = stmt.get('no');
console.log(cat.item, cat.type, 'ting');
var type = "";

// On commands
bot.on(['/startold', '/back'], msg => {

    let replyMarkup = bot.keyboard([
        ['/Food', '/Drink', '/inlineKeyboard'],
        ['/start', '/hide']
    ], {
        resize: true
    });

    return bot.sendMessage(msg.from.id, 'Hey! What would you like to order?', {
        replyMarkup
    });

});

// DRINK
bot.on('/Drink', msg => {

    let replyMarkup = bot.keyboard([
        ['/Beer', '/Wine'],
        ['/Water', '/back']
    ], {
        resize: true
    });

    return bot.sendMessage(msg.from.id, 'Would you like a beer, wine or water?', {
        replyMarkup
    });

});

bot.on('/Beer', msg => {
    return bot.sendMessage(msg.from.id, 'Enjoy...');
});

// FOOD
bot.on('/Food', msg => {

    let replyMarkup = bot.keyboard([
        ['Pizza', '/Lasagne'],
        ['/Salad', '/back']
    ], {
        resize: true
    });

    return bot.sendMessage(msg.from.id, 'We have pizza, lasagne or salad.', {
        replyMarkup
    });

});

bot.on('Pizza', msg => {

    return bot.sendMessage(msg.from.id, 'One pizza coming up');

});


// Inline buttons
bot.on('/grouptest', msg => {

    let replyMarkup = bot.inlineKeyboard([
        [
            bot.inlineButton('Order a Drink', {
                callback: 'drink'
            }),
            bot.inlineButton('Order Food', {
                callback: 'food'
            }),

        ],
        [
            bot.inlineButton('Get the Bill', {
                callback: 'bill'
            }),
            bot.inlineButton('Pay the Bill', {
                callback: 'pay'
            }),

        ]
    ]);

    return bot.sendMessage('-471374679', 'Hey! What would you like to do?', {
        replyMarkup
    });

});


var emojis = {wine:"\u{1F377}", beer  :"\u{1F37A}", water:"\u{1F6B0}", pizza:"\u{1F355}", pasta:"\u{1F35D}", salad:"\u{1F957}"};

//TIMERS
// serve based on timestamp
function serve_drink() {
    order_ready = Date.now();// - (1000*60*3); // 3 mins
    const stmt = db.prepare('SELECT * FROM orders WHERE type = ? AND served = ? AND timestamp < ?');
    const order = stmt.get('drink', 'no', order_ready);
    if (typeof order !== 'undefined'){
        console.log(order.item, order.person, 'ting');
        console.log(order.id);
        const update = db.prepare('UPDATE orders SET served = ? WHERE id = ?');
        const info = update.run('yes', order.id);
        bot.sendMessage('-1001313360421', emojis[order.item] + ' for ' + order.person);
    }
}
function serve_food() {
    order_ready = Date.now(); // - (1000*60*10); // 10 mins
    const stmt = db.prepare('SELECT * FROM orders WHERE type = ? AND served = ? AND timestamp < ?');
    const order = stmt.get('food', 'no', order_ready);
    if (typeof order !== 'undefined'){
        console.log(order.item, order.type, 'ting');
        console.log(order.id);
        const update = db.prepare('UPDATE orders SET served = ? WHERE id = ?');
        const info = update.run('yes', order.id);
        bot.sendMessage('-1001313360421', emojis[order.item] + ' for ' + order.person);
    }
}
function algo_mas() {

    let replyMarkup = bot.inlineKeyboard([
        [
            bot.inlineButton('Order something', {url: 't.me/testpubbot_bot?start=123'})
        ]

    ]);

        bot.sendMessage('-1001313360421', 'Need something else?', {replyMarkup});
}

// serve one at a time in order
//function serve_drink() {
//    const stmt = db.prepare('SELECT *,  max(id) FROM orders WHERE served = ?');
//    const cat = stmt.get('no');
//    console.log(cat.item, cat.type, 'ting');
//    console.log(cat.id);
//    const update = db.prepare('UPDATE orders SET served = ? WHERE id = ?');
//    const info = update.run('yes', cat.id);
//}


// service interval - one item per call
setInterval(serve_drink, 5000);
setInterval(serve_food, 5000);
setInterval(algo_mas,1000*60*2); // something else?



const wait = require('util').promisify(setTimeout);

(async (x) => {
    console.log('Wait...');
    await wait(x);
    console.log('...a second.');
})();



// Bot start
bot.on('/start', msg => {

msg => bot.sendMessage(msg.from.id, msg.text);
console.log('---');
console.log(msg.text);
console.log('----');

    let replyMarkup = bot.inlineKeyboard([
        [
            bot.inlineButton('Order something', {
                callback: 'order'
            })
        ],
        [
            bot.inlineButton('Chat', {url: 'https://t.me/joinchat/H3_eJRwYm1fit4VBbSGzhg'})
        ]

    ]);

const messages = ['Welcome to vFontana','Would xxxx you like to order something','or sit down to chat?'];

setImmediate( () => {wait(1000)
              .then( () => bot.sendMessage(msg.from.id, messages[0]) )
              .then( () => wait(2000) )
              .then( () => bot.sendMessage(msg.from.id, messages[1]) )
              .then( () => wait(2000) )
              .then( () => bot.sendMessage(msg.from.id, messages[2], {replyMarkup}) )
             });
});


bot.on('/text', msg => bot.sendMessage(msg.from.id, msg.text));


//

// Inline button callback
bot.on('callbackQuery', msg => {
    console.log('callbacked called');
    if (msg.data == 'order') {
    let replyMarkup = bot.inlineKeyboard([
        [
            bot.inlineButton('Order a Drink', {
                callback: 'drink'
            }),
            bot.inlineButton('Order Food', {
                callback: 'food'
            }),

        ],
        [
            bot.inlineButton('Get the Bill', {
                callback: 'bill'
            }),
            bot.inlineButton('Pay the Bill', {
                callback: 'pay'
            }),

        ],
        [
            bot.inlineButton('Back to Table', {url: 'https://t.me/joinchat/H3_eJRwYm1fit4VBbSGzhg'})
        ]

    ]);
    bot.sendMessage(msg.from.id, 'What would you like to order?', {replyMarkup});
    return bot.answerCallbackQuery(msg.id, {text: '', show_alert:false});
    }


    if (msg.data == 'drink') {
        console.log(msg.data);
        let replyMarkup = bot.inlineKeyboard([
            [
                bot.inlineButton('Beer', {
                    callback: 'beer'
                }),
                bot.inlineButton('Wine', {
                    callback: 'wine'
                }),
                bot.inlineButton('Water', {
                    callback: 'water'
                }),
            ],
            [
                bot.inlineButton('Back to Table', {url: 'https://t.me/joinchat/H3_eJRwYm1fit4VBbSGzhg'})
            ]

        ]);

        bot.sendMessage(msg.from.id, 'Would you like a beer, wine or water?', {replyMarkup});
        return bot.answerCallbackQuery(msg.id, {text: '', show_alert:false});
    }


    if (msg.data == 'food') {
        console.log(msg.data);
        let replyMarkup = bot.inlineKeyboard([
            [
                bot.inlineButton('Pizza', {
                    callback: 'pizza'
                }),
                bot.inlineButton('Pasta', {
                    callback: 'pasta'
                }),
                bot.inlineButton('Salad', {
                    callback: 'salad'
                }),
            ],
            [
            bot.inlineButton('Back to Table', {url: 'https://t.me/joinchat/H3_eJRwYm1fit4VBbSGzhg'})
            ]

        ]);
        bot.sendMessage(msg.from.id, 'We have pizza, pasta or salad.', {replyMarkup});
        return bot.answerCallbackQuery(msg.id, {text: '', show_alert:false});
    }

     if (['beer', 'wine', 'water'].indexOf(msg.data) >= 0) {type = 'drink'};
     if (['pizza', 'pasta', 'salad'].indexOf(msg.data) >= 0) {type = 'food'};
     const insert = db.prepare('INSERT INTO orders (person, type, item, timestamp, served) VALUES (?, ?, ?, ?, ?)');
     const info = insert.run(msg.from.first_name, type, msg.data, Date.now(), 'no');

     bot.sendMessage(msg.from.id, 'One '+msg.data+' coming up...');
     return bot.answerCallbackQuery(msg.id,'');

});


// Inline query
bot.on('inlineQuery', msg => {

    const query = msg.query;
    const answers = bot.answerList(msg.id);

    answers.addArticle({
        id: 'query',
        title: 'Inline Query',
        description: `Your query: ${ query }`,
        message_text: 'Click!'
    });

    return bot.answerQuery(answers);

});


bot.start();
