// webp

(() => {
  const body = document.documentElement;
  body.classList.remove('no-webp');
  const webP = new Image();
  webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

  webP.onerror = () => {
    if (webP.height === 2) {
      body.classList.add('webp');
    } else {
      body.classList.add('no-webp');
    }
  };

  webP.onload = webP.onerror;
})();
