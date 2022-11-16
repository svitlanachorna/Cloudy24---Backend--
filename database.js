/* constants */
const MAX_CARD_NUMBER_SIZE = 16;
const CARD_ISSUE_TERM_YEARS = 7;
const SECONDS_IN_YEAR = 31536000;
const CURRENCY_RATE = {
    "USD_USD": 1,
    "USD_EUR": 0.920,
    "USD_UAH": 36.700,

    "EUR_USD": 1.087,
    "EUR_EUR": 1,
    "EUR_UAH": 39.900,

    "UAH_USD": 0.027,
    "UAH_EUR": 0.025,
    "UAH_UAH": 1
}

/* classes */
// the operation class serves as model, storage and manages CRUD (CR) operations on cards
class Operation {

    /* storage section */

    static #operationsByCardNumber = {}; // userid / value

    /* model section */
    timestamp = "";
    description = "";
    type = ""
    amount = 0;

    constructor (timestamp, description, type, amount) {
        this.timestamp = timestamp;
        this.description = description;
        this.type = type;
        this.amount = amount;
    }
    
    // adds new operation for a card
    static add(cardNumber, timestamp, description, type, amount) {
        if (!(cardNumber in Operation.#operationsByCardNumber)) {
            Operation.#operationsByCardNumber[cardNumber] = [];
        }

        const newOperation = new Operation(timestamp, description, type, amount);
        Operation.#operationsByCardNumber[cardNumber].push(newOperation);

        return newOperation;
    }

    // get all operations for a card number
    static get(cardNumber) {
        if (cardNumber in Operation.#operationsByCardNumber) {
            return Operation.#operationsByCardNumber[cardNumber];
        }

        return []
    }
}

// the Card class serves as model, storage and manages CRUD operations on cards
class Card {

    /* storage section */

    static #currentNumber = 0
    static #allCardsByNumber = {};
    static #allCardsByUserId = {};
    static #initializing = false;

    /* model section */

    number = "";
    name = "";
    validFrom = 0;
    expiresEnd = 0;
    balance = 0;
    active = true;
    currency = "";
    userId = -1;

    // model: constructor cannot be used publicly, use Card.create(...)
    constructor (userId, cardName, currency) {

        // guard against using constructor publicly
        if (!Card.#initializing) {
            throw new Error("Constructor cannot be used publicly. Use Card.create(...) instead.")
        }

        this.number = this.#getCardNumber();
        this.name = cardName ? cardName : "";
        this.validFrom = Card.getCurrentDate();
        this.expiresEnd = this.#getExpirationDate();
        this.currency = currency;
        this.userId = userId

        Card.#allCardsByNumber[this.number] = this;

        if ((this.userId in Card.#allCardsByUserId) === false) {
            Card.#allCardsByUserId[this.userId] = [];
        }

        Card.#allCardsByUserId[this.userId].push(this);
    }

    // model helper: gets unique card number
    #getCardNumber() {

        let max = 7776999999999999;
        let min = 7770000000000000;
        
        let newNumber = 0;
        do {
            newNumber = Math.random() * (max - min) + min;
        } while (newNumber in Card.#allCardsByNumber);

        return newNumber.toString();
    }

    // model helper: gets card's expiration date in epoch
    #getExpirationDate() {
        return this.validFrom + CARD_ISSUE_TERM_YEARS * SECONDS_IN_YEAR;
    }

    // model helper: gets card creation timestamp in epoch
    static getCurrentDate() {
        return Math.round(Date.now()/1000);
    }

    /* crud section */

    // crud: creates a new card, returns card instance
    static create(userId, cardName, currency) {
        let card = null;
        try {
            // disable guard for running constructor
            Card.#initializing = true;

            card = new Card(userId, cardName, currency);    
        }
        finally
        {
            Card.#initializing = false;
        }

        return card;
    }

    // crud: deletes card by card number, returns error string
    static delete(cardNumber) {
        if ((cardNumber in Card.#allCardsByNumber) === false) {
            return `Card with number:${cardNumber} does not exist`;
        }

        const card = Card.#allCardsByNumber[cardNumber];

        // delete from _allCardsByUserId
        Card.#allCardsByUserId[card.userId] = Card.#allCardsByUserId[card.userId].filter(c => {
            c.number !== cardNumber
        })

        // delete from _allCardsByNumber
        delete Card.#allCardsByNumber[cardNumber];

        return "";
    }

    // crud: gets list of cards by user id, or returns empty list
    static getByUserId(userId) {
        if ((userId in Card.#allCardsByUserId) === false) {
            return [];
        }

        return Card.#allCardsByUserId[userId];
    }

    // crud: gets card by card number, or returns null
    static getByCardNumber(cardNumber) {
        if ((cardNumber in Card.#allCardsByNumber) === false) {
            return null;
        }

        return Card.#allCardsByNumber[cardNumber];
    }

    // crud: updates a card, returns error string
    static update(card) {
        if ((card.number in Card.#allCardsByNumber) === false) {
            return `Card with number:${card.number} does not exist`;
        }

        const cardInstance = Card.#allCardsByNumber[card.number];

        for (const [key, value] of Object.entries(card)) {
            if (key in cardInstance) {
                cardInstance[key] = value;
            }
        }

        return "";
    }

    // withdraw funds from a card, return error message
    static withdraw(cardNumber, amount, targetCurrency, description=null, operationType=null, date=null) {
        if ((cardNumber in Card.#allCardsByNumber) === false) {
            return `Card with number:${cardNumber} does not exist`;
        }

        const card = Card.#allCardsByNumber[cardNumber];
        const totalAmount = Card.#convertCurrency(targetCurrency, card.currency, amount)

        const withdrawPossible = Card.#isWithdrawPossible(card, totalAmount, targetCurrency);
        if (!withdrawPossible) {
            return `Not enough funds on card balance`;
        }

        card.balance -= totalAmount;

        const currentDate = (date === null || date === undefined) ? Card.getCurrentDate() : date;
        const currentDescription = (description === null || description === undefined) ? 'Зняття готівки або валюти' : description;
        const currentOperationType = (operationType === null || operationType === undefined) ? 'withdraw' : operationType;
        Operation.add(cardNumber, currentDate, currentDescription, currentOperationType, -totalAmount);

        return "";
    }

    static topUp(cardNumber, amount, targetCurrency, description=null, operationType=null, date=null) {
        if ((cardNumber in Card.#allCardsByNumber) === false) {
            return `Card with number:${cardNumber} does not exist`;
        }

        const card = Card.#allCardsByNumber[cardNumber];
        const totalAmount = Card.#convertCurrency(targetCurrency, card.currency, amount)

        const topUpPossible = Card.#isTopUpPossible(card);
        if (!topUpPossible) {
            return `Top up not possible`;
        }

        card.balance += totalAmount;

        const currentDate = (date === null || date === undefined) ? Card.getCurrentDate() : date;
        const currentDescription = (description === null || description === undefined) ? 'Поповнення картки' : description;
        const currentOperationType = (operationType === null || operationType === undefined) ? 'topup' : operationType;
        Operation.add(cardNumber, currentDate, currentDescription, currentOperationType, totalAmount);

        return "";
    }

    static transfer(sourceCardNumber, targetCardNumber, amount) {
        // check source card
        if ((sourceCardNumber in Card.#allCardsByNumber) === false) {
            return `Card with number:${sourceCardNumber} does not exist`;
        }

        const sourceCard = Card.#allCardsByNumber[sourceCardNumber];
        if (!Card.#isWithdrawPossible(sourceCard, amount, sourceCard.currency)) {
            return `Cant perform operation for card :${sourceCardNumber}`;
        }

        // check target card
        if ((targetCardNumber in Card.#allCardsByNumber) === false) {
            return `Card with number:${targetCardNumber} does not exist`;
        }

        const targetCard = Card.#allCardsByNumber[sourceCardNumber];
        const totalAmount = Card.#convertCurrency(sourceCard.currency, targetCard.currency, amount)

        if (!Card.#isTopUpPossible(targetCard, totalAmount)) {
            return `Cant perform operation for card :${sourceCardNumber}`;
        }

        const shortTargetCardNumber = `${targetCardNumber[0]}${targetCardNumber[1]}**${targetCardNumber[14]}${targetCardNumber[15]}`;
        const sourceDescription = `Переказ ${amount} ${sourceCard.currency} на ${shortTargetCardNumber} `;
        const sourceOperationType = 'transfer_to';
        let error = Card.withdraw(sourceCardNumber, amount, sourceCard.currency, sourceDescription, sourceOperationType);
        if (error !== "") {
            return error;
        }

        const shortSourceCardNumber = `${sourceCardNumber[0]}${sourceCardNumber[1]}**${sourceCardNumber[14]}${sourceCardNumber[15]}`;
        const targetDescription = `Переказ ${totalAmount} ${sourceCard.currency} з ${shortSourceCardNumber} `;
        const targetOperationType = 'transfer_from';
        error = Card.topUp(targetCardNumber, totalAmount, sourceCard.currency, targetDescription, targetOperationType);
        if (error !== "") {
            return error;
        }

        return '';
    }

    // helpers
    static #getConversionName(sourceCurrency, targetCurrency) {
        return `${sourceCurrency}_${targetCurrency}`;
    }

    static #isExpired(card) {

        const currentDate = Card.getCurrentDate();

        if (currentDate >= +card.expiresEnd) return true;

        return false;
    }

    static #isWithdrawPossible(card, amount, targetCurrency) {

        // 1. check card active
        if (!card.active) return false;

        // 2. check card expired
        if (Card.#isExpired(card)) return false;

        // 3. check available balance
        const totalAmount = Card.#convertCurrency(card.currency, targetCurrency, amount)
        if (card.balance < totalAmount) return false;

        return true;
    }

    static #isTopUpPossible(card) {
        // 1. check card active
        if (!card.active) return false;

        // 2. check card expired
        if (Card.#isExpired(card)) return false;
    
        return true;
    }

    static #convertCurrency(from, to, amount) {
        const conversion = Card.#getConversionName(from, to);    
        const totalAmount = amount * CURRENCY_RATE[conversion];
        return totalAmount;
    }
}

// the User class serves as model, storage and manages CRUD operations on users
class User {

    /* storage section */

    static #currentId = 0;
    static #usersById = {};
    static #usersByPhone = {};
    static #initializing = false;

    /* model section */

    id = "";
    firstName = "";
    lastName = "";
    birthday = "";
    phone = "";
    password = "";

    constructor (firstName, lastName, birthday, phone, password) {

        // guard against using constructor publicly
        if (!User.#initializing) {
            throw new Error("Constructor cannot be used publicly. Use User.create(...) instead.")
        }
        
        this.id = this.#getId();
        this.firstName = firstName; 
        this.lastName = lastName; 
        this.birthday = birthday;
        this.phone = phone;
        this.password = password;

        User.#usersById[this.id] = this;
        User.#usersByPhone[this.phone] = this;
    }
    
    // model helper: gets unique user id
    #getId() {
        return ++User.#currentId;
    }

    /* Login section */
    static login({phone, password}) {
        // yes, I know about salt, hashing two factor authentication etc, 
        // but this is intended to be a simple insecure implementation

        const error = `Login or password is incorrect`;
        const userInfo = User.getByPhone(phone);

        // check login/phone
        if (userInfo === null) return error;

        // check password
        if (userInfo['password'] !== password) return error;

        return '';
    }

    /* crud section */
    // crud: create new user
    static create(firstName, lastName, birthday, phone, password) {
        let user = null;
        try {
            // disable guard for running constructor
            User.#initializing = true;

            user = new User(firstName, lastName, birthday, phone, password);
        }
        finally
        {
            User.#initializing = false;
        }

        return user;
    }

    // crud: delete user
    static delete(userId) {
        
        let error = "";

        if ((userId in User.#usersById) === false) {
            return `User with id:${userId} does not exist`;
        }

        const user = User.#usersById[userId];
        const phone = user.phone;

        delete User.#usersById[userId];

        delete User.#usersByPhone[phone];

        // handle cascade delete cards
        const cards = Card.getByUserId(userId)
        
        for (let i = 0; i < cards.length; i++) {
            error = Card.delete(cards[i].number);
    
            if (error !== "") break;
        }


        return error;
    }

    // crud: update user
    static update(user) {
        if ((user.id in User.#usersById) === false) {
            return `User with id:${user.id} does not exist`;
        }

        const userInstance = User.#usersById[user.id];

        for (const [key, value] of Object.entries(user)) {
            if (key in userInstance) {
                userInstance[key] = value;
            }
        }

        return "";
    }

    // model helper: get user by id
    static getById(userId) {
        if ((userId in User.#usersById) === false) {
            return null;
        }

        return User.#usersById[userId];
    }

    // model helper: get user by phone
    static getByPhone(phone) {
        if ((phone in User.#usersByPhone) === false) {
            return null;
        }

        return User.#usersByPhone[phone];
    }
}

module.exports = { Card, User, Operation };