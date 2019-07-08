/* Copyright G. Hemingway, 2019 - All rights reserved */
"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  ErrorMessage,
  FormBase,
  FormLabel,
  FormInput,
  FormButton
} from "./shared";

/*************************************************************************/

export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      error: ""
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(ev) {
    if (ev.target.name === "username")
      ev.target.value = ev.target.value.toLowerCase();
    this.setState({ [ev.target.name]: ev.target.value });
  }

  onSubmit(ev) {
    ev.preventDefault();
    fetch("/v1/session", {
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      }),
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json"
      }
    }).then(res => {
      res.json().then(data => {
        if (res.ok) {
          this.props.logIn(data.username);
        } else {
          this.setState({ error: `Error: ${data.error}` });
        }
      });
    });
  }

  componentDidMount() {
    document.getElementById("username").focus();
  }

  render() {
    return (
      <div style={{ gridArea: "main" }}>
        <ErrorMessage msg={this.state.error} />
        <FormBase>
          <FormLabel htmlFor="username">Username:</FormLabel>
          <FormInput
            id="username"
            name="username"
            type="text"
            placeholder="Username"
            value={this.state.username}
            onChange={this.onChange}
          />

          <FormLabel htmlFor="password">Password:</FormLabel>
          <FormInput
            name="password"
            type="password"
            placeholder="Password"
            value={this.state.password}
            onChange={this.onChange}
          />
          <div />
          <FormButton onClick={this.onSubmit}>Login</FormButton>
        </FormBase>
      </div>
    );
  }
}

Login.propTypes = {
  history: PropTypes.object.isRequired,
  logIn: PropTypes.func.isRequired
};
