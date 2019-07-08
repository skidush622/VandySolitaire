/* Copyright G. Hemingway, 2019 - All rights reserved */
"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Pile } from "./pile";
import styled from "styled-components";

/*************************************************************************/

const CardRow = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 2em;
`;

const CardRowGap = styled.div`
  flex-grow: 2;
`;

const GameBase = styled.div`
  grid-row: 2;
  grid-column: sb / main;
`;

export class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      target: undefined,
      startDrag: { x: 0, y: 0 },
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
      discard: [],
      drawCount: 0,
    };
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    fetch(`/v1/game/${this.props.match.params.id}`)
      .then(res => res.json())
      .then(data => {
        this.setState({
          pile1: data.pile1,
          pile2: data.pile2,
          pile3: data.pile3,
          pile4: data.pile4,
          pile5: data.pile5,
          pile6: data.pile6,
          pile7: data.pile7,
          stack1: data.stack1,
          stack2: data.stack2,
          stack3: data.stack3,
          stack4: data.stack4,
          draw: data.draw,
          discard: data.discard,
          drawCount: data.drawCount,
        });
      })
      .catch(err => console.log(err));
  }

  onClick(ev, position) {
    if(ev && position)
    {
      //empty discard cannot click
      if(position==="discard"&&this.state.discard.length===0)
      {
        this.clearSession();
        return;
      }

      if(sessionStorage.length<2)
      {
        //first click
        //empty stack cannot be first click
        if(position.slice(0,5)==="stack"&&this.state[position].length===0)
        {
          this.clearSession();
          return;
        }
        //
       let target = {
        "suit": ev.target.id.split(":")[0], 
        "value": ev.target.id.split(":")[1],
       };
       sessionStorage.setItem("src", position);
       for(var i=0; i<this.state[position].length; i++)
       {
         if(target.suit===this.state[position][i].suit && target.value===this.state[position][i].value)
         {
           console.log("i="+i);
           if(this.state[position][i].up)
           {
             sessionStorage.setItem("cards", JSON.stringify({cards: this.state[position].slice(i)}));
           }else{
             //down card found, cannot click on downside card
             this.clearSession();
           }
           break;
         }
       }
     }
     else{
       //second click
       sessionStorage.setItem("dst", position);
       let structure = {
        cards: JSON.parse(sessionStorage.getItem("cards")).cards,
        src: sessionStorage.getItem("src"),
        dst: sessionStorage.getItem("dst"),
       }
       console.log(structure);
       this.sendStructure(structure);
     }
    }else{
      this.clearSession();
    }
  }

  clearSession()
  {
    console.log("clear");
    sessionStorage.removeItem("src");
    sessionStorage.removeItem("cards");
    sessionStorage.removeItem("dst");
  }

  talonClick(ev)
  { 
    let structure = {
      cards: [],
      src: "draw",
      dst: "discard",
    }

    for(var i=0; i<this.state.draw.length; i++)
    {
      if(ev.target.id.split(":")[0]===this.state.draw[i].suit && ev.target.id.split(":")[1]===this.state.draw[i].value)
      {
        structure.cards = this.state.draw.slice(i, i+this.state.drawCount);
      }
    }
    console.log(structure);
    this.sendStructure(structure);
  }

  sendStructure(structure)
  {
     sessionStorage.removeItem("src");
     sessionStorage.removeItem("cards");
     sessionStorage.removeItem("dst");
    fetch(`/v1/game/${this.props.match.params.id}`, {
      body: JSON.stringify(structure),
      method: "PUT",
      credentials: "include",
      headers: {
        "content-type": "application/json"
      }
    })
    .then(res => res.json())
    .then(data => {
      //console.log(data);
      this.setState(data);
    })
    .catch(err => console.log(err));
  }

  render() {
    return (
      <GameBase>
        <CardRow>
          <Pile cards={this.state.stack1} spacing={0} onClick={(event) => this.onClick(event, "stack1")} />
          <Pile cards={this.state.stack2} spacing={0} onClick={(event) => this.onClick(event, "stack2")} />
          <Pile cards={this.state.stack3} spacing={0} onClick={(event) => this.onClick(event, "stack3")} />
          <Pile cards={this.state.stack4} spacing={0} onClick={(event) => this.onClick(event, "stack4")} />
          <CardRowGap />
          <Pile cards={this.state.draw} spacing={0} onClick={(event) => this.talonClick(event)} />
          <Pile cards={this.state.discard} spacing={0} onClick={(event) => this.onClick(event, "discard")} />
        </CardRow>
        <CardRow>
          <Pile cards={this.state.pile1} onClick={(event) => this.onClick(event, "pile1")} />
          <Pile cards={this.state.pile2} onClick={(event) => this.onClick(event, "pile2")} />
          <Pile cards={this.state.pile3} onClick={(event) => this.onClick(event, "pile3")} />
          <Pile cards={this.state.pile4} onClick={(event) => this.onClick(event, "pile4")} />
          <Pile cards={this.state.pile5} onClick={(event) => this.onClick(event, "pile5")} />
          <Pile cards={this.state.pile6} onClick={(event) => this.onClick(event, "pile6")} />
          <Pile cards={this.state.pile7} onClick={(event) => this.onClick(event, "pile7")} />
        </CardRow>
      </GameBase>
    );
  }
}

Game.propTypes = {
  match: PropTypes.object.isRequired
};
