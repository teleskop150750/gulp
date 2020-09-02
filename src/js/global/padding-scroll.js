/* eslint-disable no-param-reassign */

export default () => ({
  addPadding() {
    const elements = document.querySelectorAll('.js-scroll');
    elements.forEach((item) => {
      const { paddingRight } = getComputedStyle(item);
      item.style.paddingRight = `${parseFloat(paddingRight) + window.innerWidth - document.documentElement.clientWidth}px`;
    });
  },
  removePadding() {
    const elements = document.querySelectorAll('.js-scroll');
    elements.forEach((item) => {
      const { paddingRight } = getComputedStyle(item);
      item.style.paddingRight = `${parseFloat(paddingRight) - (window.innerWidth - document.documentElement.clientWidth)}px`;
    });
  },
});
