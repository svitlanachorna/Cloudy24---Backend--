// import modules
const cors = require('cors');
const bodyParser = require('body-parser')
const express = require('express');
const database = require("./database");

// set constant for which port server will listen to
const PORT = process.env.PORT || 7777;

// create and configure express server
const app = express();                              // create server instance
app.use(cors());                                    // use cors middleware to allow cross-origin data acess
app.options('*', cors());                           // use all cors options
app.use(bodyParser.json());                         // use middleware to parse json objects from requests
app.use(bodyParser.urlencoded({extended: true}));   // use middleware that only parses urlencoded bodies 

// user api
app.post("/login", (req, res) => {
    // example: 
    // url: http://localhost:7777/login
    // body: { "phone": "+380689005030", "password": "kotikMeow11+" }

    const item = req.body;
    const error = database.User.login(item);
    if (error === "") {
        res.status(200).send('Login successfull');
    }
    else {
        res.status(401).send(`Error" ${error}`);
    } 
});
app.get("/user/%2b:phone", (req, res) => {
    // example: http://localhost:7777/user/%2b380689005030

    const phone = req.params["phone"];
    const user = database.User.getByPhone(`+${phone}`);
    res.status(200).send(user);
});
app.get("/user/:userId(\\d+)", (req, res) => {
    // example: http://localhost:7777/user/2

    const userId = req.params["userId"];
    const user = database.User.getById(userId);
    res.status(200).send(user);
});
app.get("/user/create", (req, res) => {
    // example: http://localhost:7777/user/create?firstName=kek&lastName=mek&birthday=123123123&phone=324234234&password=efwefwefqwe

    const firstName = req.query.firstName;
    const lastName = req.query.lastName;
    const birthday = req.query.birthday;
    const phone = req.query.phone;
    const password = req.query.password;
    
    const user = database.User.create(firstName, lastName, birthday, phone, password);
    res.status(200).send(user);
});
app.post("/user", (req, res) => {
    // example: 
    // url: http://localhost:7777/user
    // body: { "id": 1, "firstName": "Cat", "lastName": "Kek", "birthday": "2000.01.01", "phone": "+380689005030", "password": "kotikMeow11+" }

    const item = req.body;
    const error = database.User.update(item);
    if (error === "") {
        res.status(200).send('Updates successfully');
    }
    else {
        res.status(400).send(`Error" ${error}`);
    } 
});
app.post("/user/delete/:userId", (req, res) => {
    // example: 
    // url: http://localhost:7777/user/delete/1

    const userId = req.params["userId"];
    let error = database.User.delete(userId);
        
    if (error === "") {
        res.status(200).send('Updates successfully');
    }
    else {
        res.status(400).send(`Error" ${error}`);
    } 
});

// card api
app.get("/card/user/:userId(\\d+)", (req, res) => {
    // example: http://localhost:7777/card/user/2

    const userId = req.params["userId"];
    const cards = database.Card.getByUserId(userId);
    res.status(200).send(cards);
});
app.get("/card/number/:cardNumber(\\d+)", (req, res) => {
    // example: http://localhost:7777/card/number/1111222233334444

    const cardNumber = req.params["cardNumber"];
    const card = database.Card.getByCardNumber(cardNumber);
    res.status(200).send(card);
});
app.get("/card/create", (req, res) => {
    // example: http://localhost:7777/card/create?userId=1&cardName=Hahaha

    const userId = req.query.userId;
    const cardName = req.query.cardName;
    const currency = req.query.currency;

    const card = database.Card.create(userId, cardName, currency);
    res.status(200).send(card);
});
app.post("/card", (req, res) => {
    // example: 
    // url: http://localhost:7777/card
    // body: { "number" = 1111222233334444, "name" = "", "validFrom" = 0, "expiresEnd" = 0, "balance" = 0, "active" = true, "currency" = "USD", "userId" = 1 }
    
    const item = req.body;
    const error = database.Card.update(item);
    if (error === "") {
        res.status(200).send('Updates successfully');
    }
    else {
        res.status(400).send(`Error" ${error}`);
    } 
});
app.post("/card/delete/:cardNumber", (req, res) => {
    // example: 
    // url: http://localhost:7777/card/delete/1

    const cardNumber = req.params["cardNumber"];
    let error = database.Card.delete(cardNumber);

    if (error === "") {
        res.status(200).send('Updates successfully');
    }
    else {
        res.status(400).send(`Error" ${error}`);
    } 
});
app.post("/card/topup", (req, res) => {
    // example: http://localhost:7777/card/topup?cardNumber=1111222233334444&amount=100&targetCurrency=USD&description=Topup%20from%20bank&operationType=topup

    const cardNumber = req.query.cardNumber;
    const amount = req.query.amount;
    const targetCurrency = req.query.targetCurrency;
    const description = req.query.description;
    const operationType = req.query.operationType;

    const error = database.Card.topUp(cardNumber, amount, targetCurrency, description, operationType);
    if (error === "") {
        res.status(200).send('Updates successfully');
    }
    else {
        res.status(400).send(`Error" ${error}`);
    } 
});
app.post("/card/withdraw", (req, res) => {
    // example: http://localhost:7777/card/withdraw?cardNumber=1111222233334444&amount=100&targetCurrency=USD&description=Withdraw%20cash%20from%20atm&operationType=withdraw

    const cardNumber = req.query.cardNumber;
    const amount = req.query.amount;
    const targetCurrency = req.query.targetCurrency;
    const description = req.query.description;
    const operationType = req.query.operationType;

    const error = database.Card.withdraw(cardNumber, amount, targetCurrency, description, operationType);
    if (error === "") {
        res.status(200).send('Updates successfully');
    }
    else {
        res.status(400).send(`Error" ${error}`);
    } 
});
app.post("/card/transfer", (req, res) => {
    // example: http://localhost:7777/card/transfer?sourceCardNumber=1111222233334444&targetCardNumber=5555666677778888&amount=100

    const sourceCardNumber = req.query.sourceCardNumber;
    const targetCardNumber = req.query.targetCardNumber;
    const amount = req.query.amount;

    const error = database.Card.transfer(sourceCardNumber, targetCardNumber, amount);
    if (error === "") {
        res.status(200).send('Updates successfully');
    }
    else {
        res.status(400).send(`Error" ${error}`);
    } 
});
app.get("/card/operations/:cardNumber", (req, res) => {
    // example: http://localhost:7777/card/operations/0000000000000005

    const cardNumber = req.params["cardNumber"];
    let operations = database.Operation.get(cardNumber);

    res.status(200).send(operations);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// initialize database ----------------------------------------------------

let userOlenaMelnyk = database.User.create("Olena", "Melnyk", "1990.02.17", "+380681111111", "olena1990");
let userOlenaMelnyk_card1 = database.Card.create(userOlenaMelnyk.id, "CLOUDY", "USD");
let userOlenaMelnyk_card2 = database.Card.create(userOlenaMelnyk.id, "БІЛА", "UAH");
let userOlenaMelnyk_card3 = database.Card.create(userOlenaMelnyk.id, "PLATINUM", "EUR");

let userBogdanShevchyk = database.User.create("Bogdan", "Shevchyk", "1970.07.30", "+380682222222", "bogdan1970");
let userBogdanShevchyk_card1 = database.Card.create(userBogdanShevchyk.id, "PLATINUM", "USD");
let userBogdanShevchyk_card2 = database.Card.create(userBogdanShevchyk.id, "єПІДТРИМКА", "UAH");
let userBogdanShevchyk_card3 = database.Card.create(userBogdanShevchyk.id, "ЧОРНА", "UAH");
let userBogdanShevchyk_card4 = database.Card.create(userBogdanShevchyk.id, "CLOUDY", "EUR");

let userMarynaKovalenko = database.User.create("Maryna", "Kovalenko", "2001.10.03", "+380683333333", "maryna2001");
let userMarynaKovalenko_card1 = database.Card.create(userMarynaKovalenko.id, "PLATINUM", "EUR");
let userMarynaKovalenko_card2 = database.Card.create(userMarynaKovalenko.id, "єПІДТРИМКА", "UAH");
let userMarynaKovalenko_card3 = database.Card.create(userMarynaKovalenko.id, "ЧОРНА", "UAH");
let userMarynaKovalenko_card4 = database.Card.create(userMarynaKovalenko.id, "CLOUDY", "UAH");
let userMarynaKovalenko_card5 = database.Card.create(userMarynaKovalenko.id, "БІЛА", "USD");

let userDmytroShevchyk = database.User.create("Dmytro", "Shevchyk", "2010.05.24", "+380685555555", "dmytro2010");
let userDmytroShevchyk_card1 = database.Card.create(userDmytroShevchyk.id, "ДИТЯЧА", "UAH");



// OlenaMelnyk
database.Card.topUp(userOlenaMelnyk_card1.number, 3420, "USD", 'Заробітня-плата вересень 2022', 'topup');
database.Card.transfer(userOlenaMelnyk_card1.number, userMarynaKovalenko_card1.number, 1200);
database.Card.withdraw(userOlenaMelnyk_card1.number, 560, "USD", description='Зняття готівки Термінал #8594');
database.Card.withdraw(userOlenaMelnyk_card1.number, 500, "USD", description='Зняття готівки Термінал #7396');
database.Card.topUp(userOlenaMelnyk_card2.number, 10500, "UAH", 'Поповнення картки через термінал #9864', 'topup');
database.Card.withdraw(userOlenaMelnyk_card2.number, 8500, 'UAH', description='Благодійний фонд Армія дронів', operationType='charity');
database.Card.withdraw(userOlenaMelnyk_card2.number, 1300, 'UAH', description='Сільпо', operationType='shopping');
database.Card.withdraw(userOlenaMelnyk_card2.number, 246, 'UAH', description='Аптека Доброго дня', operationType='shopping');
database.Card.topUp(userOlenaMelnyk_card3.number, 7500, "EUR", 'Поповнення картки через термінал #5371', 'topup');
database.Card.transfer(userOlenaMelnyk_card3.number, userBogdanShevchyk_card3.number, 1500);
database.Card.transfer(userOlenaMelnyk_card3.number, userBogdanShevchyk_card4.number, 700);


// BogdanShevchyk
database.Card.topUp(userBogdanShevchyk_card1.number, 1000, "USD", 'Поповнення картки через термінал #1749', 'topup');
database.Card.withdraw(userBogdanShevchyk_card1.number, 548, "USD", description='Інтернет-магазин Будівельник', operationType='shopping');
database.Card.topUp(userBogdanShevchyk_card2.number, 1000, 'UAH', 'Допомога від держави', 'topup');
database.Card.withdraw(userBogdanShevchyk_card2.number, 800, 'UAH', description='Книжковий магазин Буква', operationType='shopping');
database.Card.topUp(userBogdanShevchyk_card3.number, 23500, "UAH", 'Поповнення картки через термінал #6937', 'topup');
database.Card.transfer(userBogdanShevchyk_card3.number, userMarynaKovalenko_card4.number, 12950);
database.Card.withdraw(userBogdanShevchyk_card3.number, 600, 'UAH', description='Поповнення мобільного +380682222222', operationType='mobile');
database.Card.withdraw(userBogdanShevchyk_card3.number, 799, 'UAH', description='Інтернет-магазин Розетка', operationType='shopping');
database.Card.topUp(userBogdanShevchyk_card4.number, 800, "USD", 'Заробітня-плата 09.2022', 'topup');
database.Card.withdraw(userBogdanShevchyk_card4.number, 600, "USD", description='Зняття готівки Термінал #9530');

// MarynaKovalenko
database.Card.topUp(userMarynaKovalenko_card1.number, 3700, "EUR", 'Поповнення картки через термінал #7382', 'topup');
database.Card.transfer(userMarynaKovalenko_card1.number, userMarynaKovalenko_card3.number, 3200);
database.Card.transfer(userMarynaKovalenko_card1.number, userMarynaKovalenko_card4.number, 300);
database.Card.topUp(userMarynaKovalenko_card2.number, 1000, 'UAH', 'Допомога від держави', 'topup');
database.Card.withdraw(userMarynaKovalenko_card2.number, 153, 'UAH', description='Аптека Подорожник', operationType='shopping');
database.Card.withdraw(userMarynaKovalenko_card2.number, 300, 'UAH', description='Спорт-клуб Iron', operationType='shopping');
database.Card.topUp(userMarynaKovalenko_card3.number, 1200, "UAH", 'Поповнення картки через термінал #5831', 'topup');
database.Card.withdraw(userMarynaKovalenko_card3.number, 1050, 'UAH', description='Благодійний фонд Сергія Притули', operationType='charity');
database.Card.topUp(userMarynaKovalenko_card4.number, 9500, "UAH", 'Заробітня-плата за 08.2022', 'topup');
database.Card.withdraw(userMarynaKovalenko_card4.number, 499, 'UAH', description='Магазин одягу Шафа', operationType='shopping');
database.Card.withdraw(userMarynaKovalenko_card4.number, 283.50, 'UAH', description='Продукти Фора', operationType='shopping');
database.Card.withdraw(userMarynaKovalenko_card4.number, 55, 'UAH', description='Поповнення мобільного +380683333333', operationType='mobile');
database.Card.transfer(userMarynaKovalenko_card4.number, userMarynaKovalenko_card5.number, 6000);
database.Card.withdraw(userMarynaKovalenko_card5.number, 100, "USD", description='Зняття валюти через касу банк Cloudy');


// DmytroShevchyk
database.Card.transfer(userBogdanShevchyk_card3.number, userDmytroShevchyk_card1.number, 1150);
database.Card.withdraw(userDmytroShevchyk_card1.number, 482.80, 'UAH', description='Дитячий магазин Містері', operationType='shopping');
database.Card.withdraw(userDmytroShevchyk_card1.number, 380, 'UAH', description='Дитячий магазин Бебі-ворлд', operationType='shopping');
database.Card.transfer(userBogdanShevchyk_card3.number, userDmytroShevchyk_card1.number, 200);
database.Card.withdraw(userDmytroShevchyk_card1.number, 50, 'UAH', description='Зняття готівки Термінал #7241');
database.Card.withdraw(userDmytroShevchyk_card1.number, 75, 'UAH', description='Поповнення мобільного +380685555555', operationType='mobile');
database.Card.withdraw(userDmytroShevchyk_card1.number, 90, 'UAH', description='Благодійний фонд Армія дронів', operationType='charity');


