/* Copyright G. Hemingway, 2019 - All rights reserved */
"use strict";

// Necessary modules
import React, { Component } from "react";
import { render } from "react-dom";
import styled from "styled-components";
import { BrowserRouter, Route, Redirect } from "react-router-dom";

import { Header } from "./components/header";
import { Landing } from "./components/landing";
import { Login } from "./components/login";
import { Logout } from "./components/logout";
import { Register } from "./components/register";
import { Profile } from "./components/profile";
import { Start } from "./components/start";
import { Results } from "./components/results";
import { Game } from "./components/game";

/*************************************************************************/

const defaultUser = {
  username: "",
  first_name: "",
  last_name: "",
  primary_email: "",
  city: "",
  games: []
};

const GridBase = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "hd"
    "main"
    "ft";

  @media (min-width: 500px) {
    grid-template-columns: 40px 50px 1fr 50px 40px;
    grid-template-rows: auto auto auto;
    grid-template-areas:
      "hd hd hd hd hd"
      "sb sb main main main"
      "ft ft ft ft ft";
  }
`;

class MyApp extends Component {
  constructor(props) {
    super(props);
    // If the user has logged in, grab info from sessionStorage
    const data = window.__PRELOADED_STATE__;
    this.state = data.username ? data : defaultUser;
    console.log(`Starting as user: ${this.state.username}`);
    // Bind all instance methods
    this.loggedIn = this.loggedIn.bind(this);
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  loggedIn() {
    return this.state.username && this.state.primary_email;
  }

  logIn(username) {
    fetch(`/v1/user/${username}`)
      .then(res => res.json())
      .then(user => {
        this.setState(user);
      })
      .catch(() => {
        alert("An unexpected error occurred.");
        this.logOut();
      });
  }

  logOut() {
    fetch("/v1/session", {
      method: "DELETE",
      credentials: "include"
    }).then(() => {
      // Reset user state
      this.setState(defaultUser);
    });
  }

  render() {
    return (
      <BrowserRouter>
        <GridBase>
          <Header user={this.state.username} email={this.state.primary_email} />
          <Route exact path="/" component={Landing} />
          <Route
            path="/login"
            render={props =>
              this.loggedIn() ? (
                <Redirect to={`/profile/${this.state.username}`} />
              ) : (
                <Login {...props} logIn={this.logIn} />
              )
            }
          />
          <Route
            path="/logout"
            render={props => <Logout {...props} logOut={this.logOut} />}
          />
          <Route
            path="/register"
            render={props => {
              return this.loggedIn() ? (
                <Redirect to={`/profile/${this.state.username}`} />
              ) : (
                <Register {...props} />
              );
            }}
          />
          <Route
            path="/profile/:username"
            render={props => (
              <Profile {...props} currentUser={this.state.username} />
            )}
          />
          <Route
            path="/start"
            render={props => {
              return this.loggedIn() ? (
                <Start {...props} />
              ) : (
                <Redirect to={"/login"} />
              );
            }}
          />
          <Route
            path="/game/:id"
            render={props => {
              return this.loggedIn() ? (
                <Game {...props} user={this.props.user} />
              ) : (
                <Redirect to={"/login"} />
              );
            }}
          />
          <Route
            path="/results/:id"
            render={props => <Results {...props} user={this.props.user} />}
          />
        </GridBase>
      </BrowserRouter>
    );
  }
}

render(<MyApp />, document.getElementById("mainDiv"));
