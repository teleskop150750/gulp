// header

import paddingScroll from '../../js/global/padding-scroll';

export default () => {
  const padding = paddingScroll();
  const button = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  const body = document.querySelector('.page__body');

  const closeNav = (e) => {
    e.stopPropagation();
    if (!(e.target.classList.contains('header__nav') || !!e.target.closest('.header__nav'))) {
      nav.classList.remove('header__nav--open');
      body.classList.remove('page__body--overflow');
      padding.removePadding();
      body.removeEventListener('click', closeNav);
    }
  };

  const toggleNav = (e) => {
    e.stopPropagation();
    nav.classList.toggle('header__nav--open');
    if (nav.classList.contains('header__nav--open')) {
      padding.addPadding();
      body.classList.add('page__body--overflow');
      body.addEventListener('click', closeNav);
    } else {
      body.classList.remove('page__body--overflow');
      padding.removePadding();
      body.removeEventListener('click', closeNav);
    }
  };

  button.addEventListener('click', toggleNav);
};
