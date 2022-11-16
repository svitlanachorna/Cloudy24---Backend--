const database = require("../database");
const Card = database.Card;

test(`Create new card`, () => {
    const userId = 123;
    const newCard = Card.create(userId);

    expect(newCard).not.toBe(null);
    expect(newCard).not.toBe(undefined);
    expect(newCard.userId).toBe(userId);
});

test(`Get card by card number`, () => {
    const userId = 123;
    const cardNumber = Card.create(userId).number;
    const card = Card.getByCardNumber(cardNumber);

    expect(card).not.toBe(null);
    expect(card).not.toBe(undefined);
});


