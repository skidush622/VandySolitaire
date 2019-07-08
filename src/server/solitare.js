/* Copyright G. Hemingway, 2019 - All rights reserved */
"use strict";

let shuffleCards = (includeJokers = false) => {
  /* Return an array of 52 cards (if jokers is false, 54 otherwise). Carefully follow the instructions in the README */
  let cards = [];
  ["spades", "clubs", "hearts", "diamonds"].forEach(suit => {
    ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"].forEach(
      value => {
        cards.push({ suit: suit, value: value });
      }
    );
  });
  // Add in jokers here
  if (includeJokers) {
    /*...*/
  }
  // Now shuffle
  let deck = [];
  while (cards.length > 0) {
    // Find a random number between 0 and cards.length - 1
    const index = Math.floor(Math.random() * cards.length);
    deck.push(cards[index]);
    cards.splice(index, 1);
  }
  return deck;
};

let initialState = () => {
  /* Use the above function.  Generate and return an initial state for a game */
  let state = {
    pile1: [],
    pile2: [],
    pile3: [],
    pile4: [],
    pile5: [],
    pile6: [],
    pile7: [],
    stack1: [],
    stack2: [],
    stack3: [],
    stack4: [],
    draw: [],
    discard: []
  };

  // Get the shuffled deck and distribute it to the players
  const deck = shuffleCards(false);
  // Setup the piles
  for (let i = 1; i <= 7; ++i) {
    let card = deck.splice(0, 1)[0];
    card.up = true;
    state[`pile${i}`].push(card);
    for (let j = i + 1; j <= 7; ++j) {
      card = deck.splice(0, 1)[0];
      card.up = false;
      state[`pile${j}`].push(card);
    }
  }
  // Finally, get the draw right
  state.draw = deck.map(card => {
    card.up = false;
    return card;
  });
  return state;
};

const filterGameForProfile = game => ({
  active: game.active,
  score: game.score,
  won: game.won,
  id: game._id,
  game: "klondyke",
  start: game.start,
  state: game.state,
  moves: game.moves,
  winner: game.winner,
  drawCount: game.drawCount
});

const filterMoveForResults = move => ({
  ...move
});

let checkSuit = (suit1, suit2) => {
  const cardSuits = ["spades", "hearts", "clubs", "diamonds"];
  return (cardSuits.indexOf(suit1) + cardSuits.indexOf(suit2)) % 2 === 1;
};

let checkValue = (value1, value2) => {
  const cardValues = [
    "ace",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "jack",
    "queen",
    "king"
  ];
  return (
    cardValues.indexOf(value1) ===
    (cardValues.indexOf(value2) + 1) % cardValues.length
  );
};

const validateMove = (move, state) => {
  if (move.dst.includes("pile")) {
    if (state[move.dst].length === 0) {
      if (move.cards[0].value !== "king") {
        throw "Only King can be put on Empty pile";
      }
    } 
    else if (!checkSuit(state[move.dst][state[move.dst].length - 1].suit,move.cards[0].suit)) 
    {
      throw "Invalid Suit";
    } 
    else if (!checkValue(state[move.dst][state[move.dst].length - 1].value,move.cards[0].value)) 
    {
      throw "Invalid Value";
    }
  }
  //
  if (move.dst.includes("stack")) {
    if (state[move.dst].length === 0) {
      if (move.cards[0].value !== "ace") {
        throw "Only Ace can be put on Empty Stacks";
      }
    } else if (move.cards.length !== 1) {
      throw "Only One Card can be put";
    } else if (move.cards[0].suit !== state[move.dst][0].suit) {
      throw "Invalid Suit";
    } else if (!checkValue(move.cards[0].value,state[move.dst][state[move.dst].length - 1].value)) 
    {
      throw "Invalid Value";
    }
  }
  //
  let newPile = [];
  for (let i = 0; i < state[move.src].length - move.cards.length; i++) {
    newPile.push(state[move.src][i]);
  }
  if (newPile.length > 0 && move.src !== "draw") {
    newPile[newPile.length - 1].up = true;
  }
  state[move.src] = newPile;
  if (move.dst === "draw") {
    move.cards.forEach(card => {
      state.draw.push({ suit: card.suit, value: card.value, up: false });
    });
  } else {
    move.cards.forEach(card => {
      state[move.dst].push({ suit: card.suit, value: card.value, up: true });
    });
  }
  return state;
};

module.exports = {
  shuffleCards: shuffleCards,
  initialState: initialState,
  filterGameForProfile: filterGameForProfile,
  filterMoveForResults: filterMoveForResults,
  validateMove: validateMove
};
