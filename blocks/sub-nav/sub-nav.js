import { createElement, decorateButtons, getTextLabel } from '../../scripts/scripts.js';

const MQ = window.matchMedia('(min-width: 1140px)');
const subscribeText = getTextLabel('SUBSCRIBE TO BULLDOG');
const overviewText = getTextLabel('Overview');
let fullHeight = 0;

function toggleHeightList(ul) {
  const isOpen = ul.classList.contains('open');
  if (ul.offsetHeight >= fullHeight) fullHeight = ul.offsetHeight;
  ul.style.maxHeight = `${isOpen ? fullHeight : 0}px`;
}

function setDefaultHeight(ul) {
  fullHeight = ul.offsetHeight;
  ul.style.maxHeight = 0;
}

function setOverviewUrl(ref, currentUrl) {
  const subNavPath = ref.replace('sub-nav', '');
  const subNavUrl = new URL(currentUrl);
  subNavUrl.pathname = subNavPath;
  return subNavPath.pathname === currentUrl.pathname ? currentUrl.href : subNavUrl.href;
}

async function createSubNav(block, ref) {
  const resp = await fetch(`${ref}.plain.html`);
  if (!resp.ok) return;
  const currentUrl = new URL(window.location);
  const { pathname } = currentUrl;
  const overviewUrl = setOverviewUrl(ref, currentUrl);
  const text = await resp.text();
  const fragment = document.createRange().createContextualFragment(text);
  const title = fragment.querySelector('p');
  const ul = fragment.querySelector('ul');
  const overview = createElement('li', '');
  const overviewLink = createElement('a', '', { href: overviewUrl });
  const subNavWrapper = createElement('div', 'sub-nav-container');
  const buttons = [...fragment.querySelectorAll('p:has(em), p:has(strong)')];
  const ctasWrapper = buttons.length > 0 && createElement('li', 'sub-nav-cta-wrapper');
  // add a caret arrow for mobile version
  const caretIcon = createElement('div', ['fa', 'fa-caret-down', 'icon']);
  // set the active link, if is not found then use overview as default
  const activeLink = ul && [...ul.querySelectorAll('li a')].find((a) => new URL(a.href).pathname === pathname);
  const activeLi = activeLink ? activeLink.closest('li') : overview;

  title.className = 'sub-nav-title';
  activeLi.className = 'active';
  overviewLink.textContent = overviewText;
  overview.appendChild(overviewLink);
  ul.prepend(overview);
  if (ctasWrapper) {
    buttons.forEach((btn) => {
      ctasWrapper.appendChild(btn);
    });
    ul.appendChild(ctasWrapper);
    decorateButtons(ctasWrapper);
  }
  subNavWrapper.append(caretIcon, title, ul);
  block.appendChild(subNavWrapper);
  if (!MQ.matches) setDefaultHeight(ul);

  window.onresize = () => {
    const isDesktop = MQ.matches;
    if (isDesktop) {
      caretIcon.classList.remove('fa-caret-up');
      ul.classList.remove('open');
      ul.style.maxHeight = null;
    } else if (ul.style.maxHeight === '') {
      setDefaultHeight(ul);
    }
  };

  caretIcon.onclick = () => {
    caretIcon.classList.toggle('fa-caret-up');
    ul.classList.toggle('open');
    toggleHeightList(ul);
  };
}

function toggleListMagazine(el) {
  el.classList.toggle('open');
}

async function buildMagazineSubNav(block, ref) {
  const resp = await fetch(`${ref}.plain.html`);
  if (!resp.ok) return;
  const text = await resp.text();
  const fragment = document.createRange().createContextualFragment(text);
  const mainTitleImgWrapper = fragment.querySelector('div');
  // bar main section
  const mainTitleImg = mainTitleImgWrapper.querySelector('picture');
  const mainTitleLink = mainTitleImgWrapper.querySelector('a');
  const subNavContainer = createElement('div', 'sub-nav-container');
  const subNavTitle = createElement('p', 'sub-nav-title');
  const mainSubNav = createElement('div', 'sub-nav-content');
  // add (hamburger menu)/(down arrow) to open close the sub-nav-list
  const iconClass = MQ.matches ? 'fa-bars' : 'fa-caret-down';
  const listIcon = createElement('div', ['fa', iconClass, 'icon']);
  // add a cta button to open an eloqua form (subscribe to bulldog)
  const subscribeBtnContainer = createElement('div', 'button-container');
  const subscribeBtn = createElement('button', 'subscribe-button', { type: 'button' });
  // list section overlay
  const closeBtn = createElement('div', ['fa', 'fa-close', 'icon']);
  const listSubscribeBtnContainer = createElement('div', 'list-button-container');
  const listSubscribeBtn = createElement('button', 'list-subscribe-button', { type: 'button' });
  const supR = createElement('sup', '');
  const listContainer = createElement('div', 'sub-nav-list-container');
  const listWrapper = fragment.querySelector('div:has(ul)');
  const dogIconWrapper = listWrapper.querySelector('p:has(picture)');
  const mainList = listWrapper.querySelector('ul');
  const innerList = mainList.querySelector('ul');
  listWrapper.className = 'sub-nav-list-wrapper';
  dogIconWrapper.className = 'sub-nav-list-icon';
  mainList.className = 'sub-nav-list main';
  innerList.className = 'sub-nav-list inner';
  listSubscribeBtn.textContent = subscribeText;
  supR.textContent = '®';
  listSubscribeBtn.appendChild(supR);
  listSubscribeBtnContainer.appendChild(listSubscribeBtn);
  listWrapper.appendChild(closeBtn);
  listContainer.append(listWrapper, listSubscribeBtnContainer);

  // adding it to the block
  mainTitleLink.textContent = '';
  mainTitleLink.title = mainTitleImg.lastElementChild.alt;
  subscribeBtn.textContent = subscribeText;
  subscribeBtnContainer.appendChild(subscribeBtn);
  mainTitleLink.appendChild(mainTitleImg);
  subNavTitle.appendChild(mainTitleLink);
  mainSubNav.appendChild(subNavTitle);
  subNavContainer.append(listIcon, mainSubNav, subscribeBtnContainer, listContainer);
  block.appendChild(subNavContainer);

  window.onresize = () => {
    const isDesktop = MQ.matches;
    listIcon.classList.toggle('fa-bars', isDesktop);
    listIcon.classList.toggle('fa-caret-down', !isDesktop);
  };

  listIcon.onclick = () => {
    toggleListMagazine(listContainer);
  };

  closeBtn.onclick = () => {
    toggleListMagazine(listContainer);
  };
}

export default async function decorate(block) {
  const { content } = document.head.querySelector('meta[name="sub-navigation"]');
  if (content.includes('magazine')) {
    block.classList.add('magazine');
    buildMagazineSubNav(block, content);
    return;
  }
  createSubNav(block, content);
}
