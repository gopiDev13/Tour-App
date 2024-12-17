/* eslint-disable */
// const axios = require('axios');
import '@babel/polyfill';
import axios from 'axios';
import { showAlert, hideAlert } from './alert';

export const login = async (email, password) => {
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (result.data.status === 'success') {
      showAlert('success', 'User logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const result = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });
    if (result.data.status == 'success') {
      location.reload();
    }
  } catch (err) {
    showAlert('error', 'Error logging out a user');
  }
};
