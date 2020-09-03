// webp

export default () => {
  const html = document.documentElement;
  const webP = new Image();
  webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

  webP.onload = () => {
    if (webP.height === 2) {
      html.classList.add('webp');
    } else {
      html.classList.add('no-webp');
    }
  };

  webP.onerror = () => {
    html.classList.add('no-webp');
  };
};
