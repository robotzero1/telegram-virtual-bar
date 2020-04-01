const TeleBot = require('telebot');
const Database = require('better-sqlite3')

// EDIT BELOW
const bot = new TeleBot('TELEGRAMTOKEN');
const groupid = '-100123123123';
const groupurl = 'https://t.me/joinchat/ABC';
const boturl = 't.me/yourbotname_bot';
// EDIT ABOVE

const database = 'database.db';

var emojis = {
    wine: "\u{1F377}",
    beer: "\u{1F37A}",
    water: "\u{1F6B0}",
    pizza: "\u{1F355}",
    pasta: "\u{1F35D}",
    salad: "\u{1F957}"
};
var prices = {
    wine: 3,
    beer: 2,
    water: 1,
    pizza: 10,
    pasta: 8,
    salad: 7
};
var types = {
    wine: "drink",
    beer: "drink",
    water: "drink",
    pizza: "food",
    pasta: "food",
    salad: "food"
};

const db = new Database(database, {
    //verbose: console.log
});

// TIMERS
// serve based on timestamp
function serve(type, serve_time) { // drink or food, minutes delay before serving
    order_ready = Date.now() - (1000 * 60 * serve_time);
    const stmt = db.prepare('SELECT * FROM orders WHERE type = ? AND served = ? AND timestamp < ?');
    const order = stmt.get(type, 'no', order_ready);
    if (typeof order !== 'undefined') {
        const update = db.prepare('UPDATE orders SET served = ? WHERE id = ?');
        const info = update.run('yes', order.id);
        bot.sendMessage(groupid, emojis[order.item] + ' for ' + order.person);
    }
}

function algo_mas() {
    let replyMarkup = bot.inlineKeyboard([
        [
            bot.inlineButton('Order something', {
                url: boturl
            })
        ]
    ]);
    bot.sendMessage(groupid, 'Need something else?', {
        replyMarkup
    });
}

setInterval(serve, 5000, 'drink', 3); // every 5 seconds, check for drink orders over 3 minutes old
setInterval(serve, 5000, 'food', 10);
setInterval(algo_mas, 1000 * 60 * 20); // something else? 20 mins

// MESSAGES
const wait = require('util').promisify(setTimeout);

(async (x) => {
    console.log('Wait...');
    await wait(x);
    console.log('...a second.');
})();

bot.on('/start', msg => {
    let replyMarkup = bot.inlineKeyboard([
        [
            bot.inlineButton('Order something', {
                callback: 'order'
            })
        ],
        [
            bot.inlineButton('Chat', {
                url: groupurl
            })
        ]

    ]);

    const messages = ['Welcome to the Raven Hotel', 'Would you like to order something', 'or sit down to chat?'];

    setImmediate(() => {
        wait(1000)
            .then(() => bot.sendMessage(msg.from.id, messages[0]))
            .then(() => wait(1000))
            .then(() => bot.sendMessage(msg.from.id, messages[1]))
            .then(() => wait(1000))
            .then(() => bot.sendMessage(msg.from.id, messages[2], {
                replyMarkup
            }))
    });
});


// ORDER OPTIONS
bot.on('callbackQuery', msg => {

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
                bot.inlineButton('Back to Table', {
                    url: groupurl
                })
            ]

        ]);
        bot.sendMessage(msg.from.id, 'What would you like to order?', {
            replyMarkup
        });
        return bot.answerCallbackQuery(msg.id, {
            text: '',
            show_alert: false
        });
    }

    // drink
    if (msg.data == 'drink') {
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
                bot.inlineButton('Back to Table', {
                    url: groupurl
                })
            ]

        ]);
        var botinfo = bot.sendMessage(msg.from.id, 'Would you like a beer, wine or water?', {
            replyMarkup
        });
        return bot.answerCallbackQuery(msg.id, {
            text: '',
            show_alert: false
        });
    }
  
    // food
    if (msg.data == 'food') {
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
                bot.inlineButton('Back to Table', {
                    url: groupurl
                })
            ]

        ]);
        bot.sendMessage(msg.from.id, 'We have pizza, pasta or salad.', {
            replyMarkup
        });
        return bot.answerCallbackQuery(msg.id, {
            text: '',
            show_alert: false
        });
    }
  
    // the bill
    if (msg.data == 'bill') {
        let replyMarkup = bot.inlineKeyboard([
            [
                bot.inlineButton('Pay', {
                    callback: 'pay'
                }),
            ],
            [
                bot.inlineButton('Back to Table', {
                    url: groupurl
                })
            ]

        ]);

        const orders = db.prepare('SELECT SUM(price) FROM orders WHERE person = ? AND paid = 0');
        const bill = orders.get(msg.from.first_name);
        if (typeof bill !== 'undefined' && bill['SUM(price)'] !== null) {
            bot.sendMessage(msg.from.id, 'The bill - \u{20AC}' + bill['SUM(price)'] + ' for ' + msg.from.first_name, {
                replyMarkup
            });
        } else {
            bot.sendMessage(msg.from.id, 'No orders found. Maybe you paid already?');
        }

        return bot.answerCallbackQuery(msg.id, {
            text: '',
            show_alert: false
        });
    }
  
    // pay
    if (msg.data == 'pay') {
        let replyMarkup = bot.inlineKeyboard([
            [
                bot.inlineButton('Back to Table', {
                    url: groupurl
                })
            ]
        ]);

        const orders = db.prepare('SELECT SUM(price) FROM orders WHERE person = ? AND paid = 0');
        const bill = orders.get(msg.from.first_name);
        if (typeof bill !== 'undefined' && bill['SUM(price)'] !== null) {
            console.log(bill);
            bot.sendMessage(msg.from.id, 'Thank you. You have paid - \u{20AC}' + bill['SUM(price)'], {
                replyMarkup
            });
            const update = db.prepare('UPDATE orders SET paid = ? WHERE person = ?');
            const info = update.run('1', msg.from.first_name);

        } else {
            bot.sendMessage(msg.from.id, 'No orders found. Maybe you paid already?');
        }

        return bot.answerCallbackQuery(msg.id, {
            text: '',
            show_alert: false
        });
    }

    const insert = db.prepare('INSERT INTO orders (person, type, item, price, timestamp, served) VALUES (?, ?, ?, ?, ?, ?)');
    const info = insert.run(msg.from.first_name, types[msg.data], msg.data, prices[msg.data], Date.now(), 'no');

    bot.sendMessage(msg.from.id, 'One ' + msg.data + ' coming up...');
    return bot.answerCallbackQuery(msg.id, '');

});

bot.start();
