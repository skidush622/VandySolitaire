/* Copyright G. Hemingway, 2019 - All rights reserved */
"use strict";

import React, { Component } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { ErrorMessage, FormButton } from "./shared";

/*************************************************************************/

const gameNames = [
  "klondyke",
  "pyramid",
  "canfield",
  "golf",
  "yukon",
  "hearts"
];

const GameTypesBase = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 1em;
`;

const GameTypes = ({ selected, onChange }) => {
  const games = gameNames.map((game, i) => (
    <GameChoice
      key={i}
      game={game}
      selected={selected === game}
      onChange={onChange}
    />
  ));
  return <GameTypesBase>{games}</GameTypesBase>;
};

/*************************************************************************/

const GameLabel = styled.label``;

const GameTypeInput = styled.input``;

const GameChoice = ({ game, selected, onChange }) => {
  return (
    <GameLabel>
      <GameTypeInput
        type="radio"
        name="game"
        value={game}
        checked={selected}
        onChange={onChange}
      />
      {game}
    </GameLabel>
  );
};

GameChoice.propTypes = {
  game: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
};

/*************************************************************************/

const StartBase = styled.div`
  grid-area: main;
  margin: 1em;
`;

const StartForm = styled.span`
  display: flex;
  margin: 1em;
`;

const StartOptions = styled.div`
  display: flex;
  flex-flow: column;
  & > div {
    margin-bottom: 1em;
  }
  & > div > label {
    margin-right: 0.5em;
  }
`;

export class Start extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: "klondyke"
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onSubmit(ev) {
    ev.preventDefault();
    fetch("/v1/game", {
      body: JSON.stringify({
        game: this.state.selected,
        draw: document.getElementById("draw").value,
        color: document.getElementById("color").value
      }),
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json"
      }
    }).then(res => {
      res.json().then(data => {
        if (res.ok) {
          this.props.history.push(`/game/${data.id}`);
        } else {
          this.setState({ error: `Error: ${data.error}` });
        }
      });
    });
  }

  onChange(ev) {
    if (this.state.selected !== ev.target.value) {
      this.setState({ selected: ev.target.value });
    }
  }

  render() {
    return (
      <StartBase>
        <ErrorMessage msg={this.state.error} />
        <h4>Create New Game</h4>
        <StartForm>
          <GameTypes selected={this.state.selected} onChange={this.onChange} />
          <StartOptions>
            <div>
              <label htmlFor="draw">Draw:</label>
              <select id="draw" disabled={"hearts" === this.state.selected}>
                <option>Draw 1</option>
                <option>Draw 3</option>
              </select>
            </div>
            <div>
              <label htmlFor="color">Card Color:</label>
              <select id="color">
                <option>Red</option>
                <option>Green</option>
                <option>Blue</option>
                <option>Magical</option>
              </select>
            </div>
          </StartOptions>
        </StartForm>
        <FormButton onClick={this.onSubmit}>Start</FormButton>
      </StartBase>
    );
  }
}

Start.propTypes = {
  history: PropTypes.object.isRequired
};
