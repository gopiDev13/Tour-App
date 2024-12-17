/* eslint-disable */

import { mapContent } from './map.js';
import { login, logout } from './login.js';
import { updateUserDetails } from './settingsUpdate.js';
//DOM Elements

const mapElement = document.getElementById('map');
const loginForm = document.querySelector('.form-login');
const logoutForm = document.querySelector('.nav__el--logout');
const updateUserDetailsForm = document.querySelector('.form-user-data');
const updateUserPasswordForm = document.querySelector('.form-user-password');
//Condition For Tour Map
if (mapElement) {
  // Retrieve the locations from the data-locations attribute and parse the JSON
  const locations = JSON.parse(mapElement.getAttribute('data-locations'));
  console.log(locations);
  mapContent(locations);
}
//Login Functionality
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (logoutForm) {
  logoutForm.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}

if (updateUserDetailsForm) {
  updateUserDetailsForm.addEventListener('submit', (e) => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const photo = document.getElementById('user-img').value;
    e.preventDefault();
    updateUserDetails({ name, email, photo }, 'data');
  });
}

if (updateUserPasswordForm) {
  updateUserPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').innerHTML = 'Updating...';
    const currentPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const passwordConfirmation =
      document.getElementById('password-confirm').value;
    await updateUserDetails(
      { currentPassword, newPassword, passwordConfirmation },
      'password',
    );
    document.querySelector('.btn--save-password').innerHTML = 'Save Password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
