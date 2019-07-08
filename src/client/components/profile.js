/* Copyright G. Hemingway, 2019 - All rights reserved */
"use strict";

import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { GravHash } from "./header";
import { GameList } from "./game-list";
import {
  ErrorMessage,
  InfoBlock,
  InfoData,
  InfoLabels,
  ShortP
} from "./shared";

/*************************************************************************/

const ProfileBlockBase = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto;
  grid-template-areas: "pic" "profile";
  padding: 1em;

  @media (min-width: 500px) {
    grid-template-columns: auto 1fr;
    grid-template-areas: "pic profile";
    padding: 2em;
  }
`;

const ProfileImage = styled.img`
  grid-area: pic;
  max-width: 150px;
  padding: 1em;
  @media (min-width: 500px) {
    padding: 0.5em;
    max-width: 200px;
  }
`;

const ProfileBlock = props => {
  return (
    <ProfileBlockBase>
      <ProfileImage src={GravHash(props.primary_email, 200)} />
      <InfoBlock>
        <InfoLabels>
          <p>Username:</p>
          <p>First Name:</p>
          <p>Last Name:</p>
          <p>City:</p>
          <p>Email Address:</p>
        </InfoLabels>
        <InfoData>
          <ShortP>{props.username}</ShortP>
          <ShortP>{props.first_name}</ShortP>
          <ShortP>{props.last_name}</ShortP>
          <ShortP>{props.city}</ShortP>
          <ShortP>{props.primary_email}</ShortP>
        </InfoData>
      </InfoBlock>
    </ProfileBlockBase>
  );
};

/*************************************************************************/

const EditLinkBase = styled.div`
  grid-area: sb;
  display: none;
  & > a {
    cursor: not-allowed;
  }
  @media (min-width: 500px) {
    display: inherit;
  }
`;

const EditLink = ({ show }) => {
  return show ? (
    <EditLinkBase>
      <Link to="/edit">Edit Profile</Link>
    </EditLinkBase>
  ) : null;
};

/*************************************************************************/

const ProfileBase = styled.div`
  grid-area: main;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      first_name: "",
      last_name: "",
      primary_email: "",
      city: "",
      games: [],
      error: ""
    };
  }

  fetchUser(username) {
    this.setState({ error: null });
    fetch(`/v1/user/${username}`)
      .then(res => res.json())
      .then(data => {
        this.setState(data);
      })
      .catch(err => console.log(err));
  }

  componentDidMount() {
    // Is this the same as logged in user
    this.fetchUser(this.props.match.params.username);
  }

  componentWillReceiveProps(nextProps) {
    const username = nextProps.match.params.username;
    if (username !== this.props.currentUser || username !== this.state.username)
      this.fetchUser(username);
  }

  render() {
    // Is the logged in user viewing their own profile
    const isUser = this.state.username === this.props.currentUser;
    return (
      <Fragment>
        <EditLink show={isUser} />
        <ProfileBase>
          <ErrorMessage msg={this.state.error} hide={true} />
          <ProfileBlock {...this.state} />
          <GameList
            toCreateGame={isUser}
            games={this.state.games}
            username={this.state.username}
          />
        </ProfileBase>
      </Fragment>
    );
  }
}

Profile.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  gridPlacement: PropTypes.string,
  user: PropTypes.string
};
