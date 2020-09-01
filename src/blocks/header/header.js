// header

export default () => {
  const button = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  const body = document.querySelector('.page__body');

  const closeNav = (e) => {
    e.stopPropagation();
    if (!(e.target.classList.contains('header__nav') || !!e.target.closest('.header__nav'))) {
      nav.classList.remove('header__nav--open');
      body.classList.remove('page__body--overflow');
    }
  };

  const openNav = (e) => {
    e.stopPropagation();
    nav.classList.toggle('header__nav--open');
    body.classList.toggle('page__body--overflow');
    if (nav.classList.contains('header__nav--open')) {
      body.addEventListener('click', closeNav);
    } else {
      body.removeEventListener('click', closeNav);
    }
  };

  button.addEventListener('click', openNav);
};
