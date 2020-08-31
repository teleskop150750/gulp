// header

(() => {
  const content = {
    browsers: { 
      title: 'Браузеры',
      list: [
        {
          imgName: 'logo-firefox',
          description: 'Firefox',
        },
        {
          imgName: 'logo-firefox-dev',
          description: 'Firefox Developer Edition',
        },
        {
          imgName: 'logo-firefox-nightly',
          description: 'Firefox Nightly',
        },
        {
          imgName: 'logo-microsoft-edge',
          description: 'Microsoft Edge',
        },
        {
          imgName: 'logo-microsoft-edge-canary',
          description: 'Microsoft Edge Сanary',
        },
        {
          imgName: 'logo-google-chrome',
          description: 'Google Chrome',
        },
        {
          imgName: 'logo-google-chrome-canary',
          description: 'Google Chrome Сanary',
        },
        {
          imgName: 'logo-opera',
          description: 'Opera',
        },
        {
          imgName: 'logo-microsoft-edge-html',
          description: 'Microsoft Edge на EdgeHTML',
        },
      ],
    },
    editors: {
      title: 'Редакторы кода',
      list: [
        {
          imgName: 'logo-visual_studio_code',
          description: 'Visual Studio Code',
        },
        {
          imgName: 'logo-PhpStorm',
          description: 'PhpStorm',
        },
        {
          imgName: 'logo-atom',
          description: 'Atom',
        },
        {
          imgName: 'logo-sublime-text',
          description: 'Sublime Text',
        },
      ],
    },
  };

  const heading = document.querySelector('.section-list__title');
  const containerList = document.querySelector('.section-list__list');
  const links = document.querySelectorAll('.header__link');

  const template = ({ imgName, description }) => {
    const li = document.createElement('li');
    li.classList.add('section-list__list-item');

    const figure = document.createElement('figure');
    figure.classList.add('section-list__list-figure');

    const div = document.createElement('div');
    div.classList.add('section-list__list-img-wrapper');

    const picture = document.createElement('picture');

    const source = document.createElement('source');
    source.srcset = `img/${imgName}.webp`;
    source.type = 'image/webp';

    const img = document.createElement('img');
    img.classList.add('section-list__list-img');
    img.src = `img/${imgName}.png`;
    img.alt = `Логотип ${description}`;

    const figcaption = document.createElement('figcaption');
    figcaption.classList.add('section-list__list-figcaption');
    figcaption.textContent = description;

    picture.append(source);
    picture.append(img);
    div.append(picture);
    figure.append(div);
    figure.append(figcaption);
    li.append(figure);

    return li;
  };

  const render = ({ title, list }) => {
    heading.textContent = title;
    containerList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    list.forEach((item) => {
      const li = template(item);
      fragment.append(li);
    });
    containerList.append(fragment);
  };

  const handler = (e) => {
    e.preventDefault();
    const item = e.target;
    if (!item.classList.contains('header__link--active')) {
      const itemHref = item.getAttribute('href');
      links.forEach((link) => {
        link.classList.remove('header__link--active');
      });
      item.classList.add('header__link--active');
      render(content[itemHref]);
    }
  };

  links.forEach((link) => {
    link.addEventListener('click', handler);
  });
})();

(() => {
  const button = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  const body = document.querySelector('.page__body');

  const closeNav = (e) => {
    e.stopPropagation();
    if (!(!!e.target.closest('.header__nav') || e.target.classList.contains('header__nav'))) {
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
})();
