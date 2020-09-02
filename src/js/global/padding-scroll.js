/* eslint-disable no-param-reassign */
export default () => ({
  addPadding() {
    const elements = document.querySelectorAll('.js-scroll');
    console.log(elements);
    elements.forEach((item) => {
      const { paddingRight } = getComputedStyle(item);
      console.log('add');
      console.log(paddingRight);
      item.style.paddingRight = `${parseFloat(paddingRight) + window.innerWidth - document.documentElement.clientWidth}px`;
      console.log(parseFloat(paddingRight), 'parseFloat(paddingRight');
      console.log(window.innerWidth, 'ширина 1');
      console.log(document.documentElement.clientWidth, 'ширина 2');
      console.log(
        parseFloat(paddingRight)
        + window.innerWidth
        - document.documentElement.clientWidth, 'ширина pad',
      );
    });
  },
  removePadding() {
    const elements = document.querySelectorAll('.js-scroll');
    console.log(elements);
    elements.forEach((item) => {
      const { paddingRight } = getComputedStyle(item);
      console.log('remove');
      console.log(paddingRight, 'padding css');
      item.style.paddingRight = `${parseFloat(paddingRight) - (window.innerWidth - document.documentElement.clientWidth)}px`;
      console.log(parseFloat(paddingRight), 'parseFloat(paddingRight');
      console.log(window.innerWidth, 'ширина 1');
      console.log(document.documentElement.clientWidth, 'ширина 2');
      console.log(
        parseFloat(paddingRight)
        - (window.innerWidth
        - document.documentElement.clientWidth), 'ширина pad',
      );
    });
  },
});
