/* Copyright G. Hemingway @2019 - All rights reserved */
"use strict";

let Joi = require("joi");
const _ = require("underscore");
const {
  initialState,
  filterGameForProfile,
  filterMoveForResults,
  validateMove
} = require("../../solitare");

module.exports = app => {
  /**
   * Create a new game
   *
   * @param {req.body.game} Type of game to be played
   * @param {req.body.color} Color of cards
   * @param {req.body.draw} Number of cards to draw
   * @return {201 with { id: ID of new game }}
   */
  app.post("/v1/game", (req, res) => {
    if (!req.session.user) {
      res.status(401).send({ error: "unauthorized" });
    } else {
      // Schema for user info validation
      let schema = Joi.object().keys({
        game: Joi.string()
          .lowercase()
          .required(),
        color: Joi.string()
          .lowercase()
          .required(),
        draw: Joi.any()
      });
      // Validate user input
      Joi.validate(
        req.body,
        schema,
        { stripUnknown: true },
        async (err, data) => {
          if (err) {
            const message = err.details[0].message;
            console.log(`Game.create validation failure: ${message}`);
            res.status(400).send({ error: message });
          } else {
            // Set up the new game
            let newGame = {
              owner: req.session.user._id,
              active: true,
              cards_remaining: 52,
              color: data.color,
              game: data.game,
              score: 0,
              start: Date.now(),
              winner: "",
              state: []
            };
            switch (data.draw) {
              case "Draw 1":
                newGame.drawCount = 1;
                break;
              case "Draw 3":
                newGame.drawCount = 3;
                break;
              default:
                newGame.drawCount = 1;
            }
            //console.log(newGame);
            // Generate a new initial game state
            newGame.state = initialState();
            let game = new app.models.Game(newGame);
            try {
              await game.save();
              const query = { $push: { games: game._id } };
              // Save game to user's document too
              await app.models.User.findByIdAndUpdate(
                req.session.user._id,
                query
              );
              res.status(201).send({ id: game._id });
            } catch (err) {
              console.log(`Game.create save failure: ${err}`);
              res.status(400).send({ error: "failure creating game" });
              // TODO: Much more error management needs to happen here
            }
          }
        }
      );
    }
  });

  /**
   * Fetch game information
   *
   * @param (req.params.id} Id of game to fetch
   * @return {200} Game information
   */
  app.get("/v1/game/:id", async (req, res) => {
    try {
      let game = await app.models.Game.findById(req.params.id);
      if (!game) {
        res.status(404).send({ error: `unknown game: ${req.params.id}` });
      } else {
        const state = game.state.toJSON();
        let results = filterGameForProfile(game);
        results.start = Date.parse(results.start);
        results.cards_remaining =
          52 -
          (state.stack1.length +
            state.stack2.length +
            state.stack3.length +
            state.stack4.length);
        // Do we need to grab the moves
        if (req.query.moves === "") {
          const moves = await app.models.Move.find({ game: req.params.id });
          state.moves = moves.map(move => filterMoveForResults(move));
        }
        state.drawCount = game.drawCount;
        res.status(200).send(_.extend(results, state));
      }
    } catch (err) {
      console.log(`Game.get failure: ${err}`);
      res.status(404).send({ error: `unknown game: ${req.params.id}` });
    }
  });

  /**
   * Request a game move
   *
   * @param (req.params.id} Id of game to play move on
   * @param (req.body) Move to be executed
   * @return {200 || 400 } New game state || error with move
   */
  app.put("/v1/game/:id", async (req, res) => {
    if (req.session.user) {
      let schema = Joi.object().keys({
        cards: Joi.array(),
        src: Joi.string().required(),
        dst: Joi.string().required()
      });
      Joi.validate(
        req.body,
        schema,
        { stripUnknown: true },
        async (err, data) => {
          if (err) {
            res.status(400).send({ error: err.details[0].message });
          } else {
            try {
              // the request move is not validated send the appropriate error back
              let game = await app.models.Game.findById(req.params.id);
              if (!game) {
                res.status(404).send({ error: "Unknown Game" });
              } else if (req.session.user._id !== game.owner.toString()) {
                // check whether the user is the owner of the game
                res.status(404).send({ error: "Unauthorized User" });
              } else if (!game.active) {
                res.status(404).send({ error: "Game Completed" });
              } else {
                // update and save
                let newState = await validateMove(data, game.state);
                await app.models.Game.findOneAndUpdate(
                  { _id: game._id },
                  { $set: { moves: game.moves + 1 } }
                );
                await app.models.Game.findOneAndUpdate(
                  { _id: game.id },
                  { $set: { state: newState } }
                );
                let newMove = {
                  user: req.session.user._id,
                  username: req.session.user.username,
                  game: game._id,
                  cards: data.cards,
                  src: data.src,
                  dst: data.dst,
                  start: Date.now(),
                  state: newState
                };
                let move = await new app.models.Move(newMove);
                // save the executed move
                move.save();
                // send success and new state back to the client
                res.status(200).send(newState);
              }
            } catch (err) {
              res.status(400).send({ error: err });
            }
          }
        }
      );
    }else{
      res.status(401).send({ error: "unauthorized" });
    }
  });
};
