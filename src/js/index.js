import webp from './global/webp';
import burger from '../blocks/header/header';
import main from '../blocks/main/main';
import sectionList from '../blocks/section-list/section-list';

webp();
burger();
main();
sectionList();

(() => {
  const a = 2;
  const b = 4;
  const result = b ** a;
  console.log(result);
})();
