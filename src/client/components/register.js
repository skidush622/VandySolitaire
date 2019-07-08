/* Copyright G. Hemingway, 2019 - All rights reserved */
"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  ErrorMessage,
  FormBase,
  FormInput,
  FormLabel,
  FormButton,
  ModalNotify
} from "./shared";
import { validPassword, validUsername } from "../../shared";

/*************************************************************************/

export class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      first_name: "",
      last_name: "",
      city: "",
      primary_email: "",
      password: "",
      error: ""
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onAcceptRegister = this.onAcceptRegister.bind(this);
  }

  onChange(ev) {
    // Update from form and clear errors
    this.setState({ [ev.target.name]: ev.target.value, error: "" });
    // Make sure the username is valid
    if (ev.target.name === "username") {
      let usernameInvalid = validUsername(ev.target.value);
      if (usernameInvalid)
        this.setState({ error: `Error: ${usernameInvalid.error}` });
    }
    // Make sure password is valid
    if (ev.target.name === "password") {
      let pwdInvalid = validPassword(this.state.password);
      if (pwdInvalid) this.setState({ error: `Error: ${pwdInvalid.error}` });
    }
  }

  onSubmit(ev) {
    ev.preventDefault();
    // Only proceed if there are no errors
    if (!this.state.hasOwnProperty("error") || this.state.error !== "") return;
    fetch("/v1/user", {
      method: "POST",
      body: JSON.stringify(this.state),
      credentials: "include",
      headers: {
        "content-type": "application/json"
      }
    })
      .then(res => {
        if (res.ok) {
          // Notify users
          this.setState({
            notify: `${
              this.state.username
            } successfully registered.  You will now need to log in.`
          });
        } else res.json().then(error => this.setState(error));
      })
      .catch(err => console.log(err));
  }

  onAcceptRegister() {
    this.props.history.push("/login");
  }

  componentDidMount() {
    document.getElementById("username").focus();
  }

  render() {
    return (
      <div style={{ gridArea: "main" }}>
        {this.state.notify ? (
          <ModalNotify
            msg={this.state.notify}
            onAccept={this.onAcceptRegister}
          />
        ) : null}
        <ErrorMessage msg={this.state.error} />
        <FormBase>
          <FormLabel htmlFor="username">Username:</FormLabel>
          <FormInput
            id="username"
            name="username"
            placeholder="Username"
            onChange={this.onChange}
            value={this.state.username}
          />

          <FormLabel htmlFor="first_name">First Name:</FormLabel>
          <FormInput
            name="first_name"
            placeholder="First Name"
            onChange={this.onChange}
            value={this.state.first_name}
          />

          <FormLabel htmlFor="last_name">Last Name:</FormLabel>
          <FormInput
            name="last_name"
            placeholder="Last Name"
            onChange={this.onChange}
            value={this.state.last_name}
          />

          <FormLabel htmlFor="city">City:</FormLabel>
          <FormInput
            name="city"
            placeholder="City"
            onChange={this.onChange}
            value={this.state.city}
          />

          <FormLabel htmlFor="primary_email">Email:</FormLabel>
          <FormInput
            name="primary_email"
            type="email"
            placeholder="Email Address"
            onChange={this.onChange}
            value={this.state.primary_email}
          />
          <FormLabel htmlFor="password">Password:</FormLabel>
          <FormInput
            name="password"
            type="password"
            placeholder="Password"
            onChange={this.onChange}
            value={this.state.password}
          />
          <div />
          <FormButton onClick={this.onSubmit}>Register</FormButton>
        </FormBase>
      </div>
    );
  }
}

Register.propTypes = {
  history: PropTypes.object.isRequired
};
