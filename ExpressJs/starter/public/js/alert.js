/*eslint-disable*/
export const showAlert = (type, description) => {
  hideAlert();
  const markup = `<div class = 'alert alert--${type}'> ${description}</div>'`;
  console.log(markup);
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};

export const hideAlert = () => {
  const alertElement = document.querySelector('.alert');
  if (alertElement) alertElement.parentElement.removeChild(alertElement);
};
