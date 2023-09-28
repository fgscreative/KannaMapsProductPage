// + Imports +

// Custom
import * as config from '../../config';
import * as utils from './utils';
import renderCard from './renderCard';
import * as model from '../../model';

// + Exports +
export default function (showSkeleton: boolean) {
  // Values
  const state = window.KannaMaps;
  const detailsEl: HTMLElement = state.elements.productDetails;
  const communityEl: HTMLElement = state.elements.communityData;
  const apothecariesPopupEl: HTMLElement = state.elements.apothecariesPopup;
  const data = state.productData;
  const skeletonFadeDuration = parseFloat(
    config.SKELETON_FADE_DURATION.toString()
  );

  // + Guard +

  // Elements exist
  if (!utils.isElement(detailsEl)) {
    console.error(
      `KannaMaps -> render.ts: Couldn't find list and/or template!`,
      detailsEl
    );
    return false;
  }

  // Render new product data
  if (!showSkeleton) render();

  // + + + Show / hide skeleton + + +

  // Define
  const cssHide = { opacity: 0, display: 'none', pointerEvents: 'none' };
  const cssShow = {
    opacity: 1,
    display: 'block',
    pointerEvents: 'auto',
  };

  // GSAP
  let progress = 1;
  if (state.gsap) {
    progress = state.gsap.progress();
    state.gsap.kill();
  }
  const tl = gsap.timeline({ paused: true });
  state.gsap = tl;

  // Loop
  const skeletons: HTMLElement[] = [];
  const skeleton: HTMLElement | null =
    document.querySelector('[c-el="skeleton"]');

  // Push
  if (skeleton) skeletons.push(skeleton);

  // Animate
  tl.fromTo(
    skeletons,
    showSkeleton ? cssHide : cssShow,
    showSkeleton
      ? { ...cssShow, duration: skeletonFadeDuration, ease: 'power1.inOut' }
      : { ...cssHide, duration: skeletonFadeDuration, ease: 'power1.inOut' }
  );

  // Play
  tl.progress(1 - progress);
  tl.play();

  // + + + Render function + + +
  function render() {
    // Clear content
    console.log('rendering');
    renderProductDetails(detailsEl, data);
    renderCommunityData(communityEl, data);
    renderApothecariesPopup(apothecariesPopupEl, data);
  }
}

function renderApothecariesPopup(parentEl: HTMLElement, data: any) {
  console.log('renderApothecariesPopup', data);
  const apothecaries = data.data.apothecaries_data.detailed;
  const apothecaryListEl = parentEl.querySelector<HTMLElement>(
    '[c-el="apothecary-list"]'
  );
  const templateEl = apothecaryListEl
    ?.querySelector<HTMLElement>('[c-el="apothecary"]')
    ?.cloneNode(true) as HTMLElement | undefined;

  console.log('apothecaries', apothecaries);
  console.log('apothecaryListEl', apothecaryListEl);
  console.log('templateEl', templateEl);

  if (!apothecaryListEl || !templateEl) return;

  apothecaryListEl.innerHTML = '';

  apothecaries.forEach((apothecary: any) => {
    const apothecaryEl = templateEl.cloneNode(true) as HTMLElement;
    const nameEl = apothecaryEl.querySelector<HTMLElement>('[c-el="name"]');
    const priceEl = apothecaryEl.querySelector<HTMLElement>('[c-el="price"]');

    console.log('apothecaryEl', apothecaryEl);
    console.log('nameEl', nameEl);
    console.log('priceEl', priceEl);

    if (!nameEl || !priceEl) return;

    nameEl.innerHTML = apothecary.name || 'n.v.';
    priceEl.innerHTML = apothecary.price.toString() || 'n.v.';

    apothecaryListEl.appendChild(apothecaryEl);
  });
}

function renderProductDetails(parentEl: HTMLElement, data: any) {
  // availability
  const isProductAvialable =
    data.data.apothecaries_data.availability_status === 'available';
  const availableEl = parentEl.querySelector<HTMLElement>('[c-el="available"]');
  const notAvailableEl = parentEl.querySelector<HTMLElement>(
    '[c-el="not-available"]'
  );
  console.log('isProductAvialable', isProductAvialable);
  console.log('availableEl', availableEl);
  console.log('notAvailableEl', notAvailableEl);

  if (isProductAvialable) {
    notAvailableEl?.classList.add('hide');
  } else {
    availableEl?.classList.add('hide');
  }

  // terpendichte
  const terpendichte = data.data.detailed['Terpendichte—mg/g'];
  const terpendichteEl = parentEl.querySelector<HTMLElement>(
    '[c-el="terpendichte"]'
  );

  if (terpendichteEl) {
    terpendichteEl.innerHTML = terpendichte ? `${terpendichte} mg/g` : 'n.v.';
  }

  // lowest/highest price
  const minPrice = data.data.apothecaries_data.price_min;
  const maxPrice = data.data.apothecaries_data.price_max;
  const minPriceEl = parentEl.querySelector<HTMLElement>('[c-el="min-price"]');
  const maxPriceEl = parentEl.querySelector<HTMLElement>('[c-el="max-price"]');

  if (minPriceEl) {
    minPriceEl.innerHTML = minPrice ? minPrice : 'n.v.';
  }

  if (maxPriceEl) {
    maxPriceEl.innerHTML = maxPrice ? maxPrice : 'n.v.';
  }

  // terpenes
  const terpenes = getTerpenes(data.data.detailed);
  const terpenesEls =
    parentEl.querySelectorAll<HTMLElement>('[c-el="terpene"]');

  terpenesEls.forEach((el, index) => {
    const terpene = terpenes[index];
    const terpeneNameEl = el.querySelector<HTMLElement>('[c-el="name"]');
    const terpeneColorEl = el.querySelector<HTMLElement>('[c-el="color"]');

    if (!terpeneNameEl || !terpeneColorEl) return;

    terpeneColorEl.classList.remove(
      'alpha-humulene',
      'linalool',
      'd-limonene',
      'fenchyl'
    );

    if (terpene) {
      terpeneNameEl.innerHTML = terpene.key;
      terpeneColorEl.classList.add(terpene.key.toLowerCase().replace(' ', '-'));
    } else {
      terpeneNameEl.innerHTML = 'n.v.';
    }
  });

  // top area of application
  const topAreaOfApplication = getAreasOfApplication(
    data.data.community_data.area_of_application_rough
  )[0];
  const topAreaOfApplicationEl = parentEl.querySelector<HTMLElement>(
    '[c-el="area-of-application"]'
  );

  if (topAreaOfApplicationEl) {
    topAreaOfApplicationEl.innerHTML = topAreaOfApplication
      ? topAreaOfApplication.text
      : 'n.v.';
  }

  // top effect
  const topEffect = getEffects(data.data.community_data.effects, 'effect')[0];
  const topEffectEl = parentEl.querySelector<HTMLElement>('[c-el="effect"]');

  if (topEffectEl) {
    topEffectEl.innerHTML = topEffect ? topEffect.text : 'n.v.';
  }

  // top taste
  const topTaste = getTastes(data.data.community_data.taste)[0];
  const topTasteEl = parentEl.querySelector<HTMLElement>('[c-el="taste"]');

  if (topTasteEl) {
    topTasteEl.innerHTML = topTaste ? topTaste.text : 'n.v.';
  }

  // review stars
  const rating = data.data.community_data.rating;
  const ratings = data.data.community_data.ratings;
  const ratingStarsEl = parentEl.querySelector<HTMLElement>(
    '[c-el="rating-stars"]'
  );

  if (ratingStarsEl) {
    renderStars(ratingStarsEl, rating, ratings);
  }
}

function renderStars(parentEl: HTMLElement, rating: number, ratings: number) {
  const starsEls = parentEl?.querySelectorAll<HTMLElement>('[c-el="star"]');
  const ratingCountEl = parentEl?.querySelector<HTMLElement>('[c-el="count"]');

  if (starsEls && rating) {
    starsEls.forEach((el, index) => {
      const offset = Math.round((Math.min(index + 1, rating) - index) * 100);

      if (offset < 0) return;

      const gradientId = `gradient-${getRandomID()}-${index}`;
      const svgEl = el.querySelector<HTMLElement>('svg');

      if (!svgEl) return;

      svgEl
        .querySelector<HTMLElement>('linearGradient')
        ?.setAttribute('id', gradientId);

      // get last stop
      const stopEls = svgEl.querySelectorAll<HTMLElement>('stop');
      const lastStopEl = stopEls[stopEls.length - 1];
      const secondToLastStopEl = stopEls[stopEls.length - 2];

      if (!lastStopEl || !secondToLastStopEl) return;

      lastStopEl.setAttribute('offset', `${offset}%`);
      secondToLastStopEl.setAttribute('offset', `${offset}%`);

      // set id on path
      const pathEl = svgEl.querySelector<HTMLElement>('path');

      if (!pathEl) return;

      pathEl.setAttribute('fill', `url(#${gradientId})`);
    });
  }

  if (ratingCountEl) {
    ratingCountEl.innerHTML = ratings.toString();
  }
}

function renderCommunityData(parentEl: HTMLElement, data: any) {
  // effects
  const effects = getEffects(data.data.community_data.effects, 'effect');
  const effectsEls = parentEl.querySelectorAll<HTMLElement>('[c-el="effect"]');

  effectsEls.forEach((el, index) => {
    const effect = effects[index];
    const effectNameEl = el.querySelector<HTMLElement>('[c-el="name"]');
    const effectPercentageEl = el.querySelector<HTMLElement>(
      '[c-el="percentage"]'
    );
    const effectLinkEl = el.querySelector<HTMLAnchorElement>('[c-el="link"]');

    if (!effectNameEl || !effectPercentageEl || !effectLinkEl) return;

    if (effect) {
      effectNameEl.innerHTML = effect.text;
      effectPercentageEl.innerHTML = `(${effect.percentage}%)`;
      effectLinkEl.href = `/?effekt=${slugify(effect.text)}`;
    } else {
      effectNameEl.innerHTML = 'n.v.';
      effectPercentageEl.innerHTML = '(n.v.%)';
    }
  });

  // side effects
  const sideEffects = getEffects(
    data.data.community_data.effects,
    'side_effect'
  );
  const sideEffectsEls = parentEl.querySelectorAll<HTMLElement>(
    '[c-el="side-effect"]'
  );

  sideEffectsEls.forEach((el, index) => {
    const sideEffect = sideEffects[index];
    const sideEffectNameEl = el.querySelector<HTMLElement>('[c-el="name"]');
    const sideEffectPercentageEl = el.querySelector<HTMLElement>(
      '[c-el="percentage"]'
    );
    const sideEffectLinkEl =
      el.querySelector<HTMLAnchorElement>('[c-el="link"]');

    if (!sideEffectNameEl || !sideEffectPercentageEl || !sideEffectLinkEl)
      return;

    if (sideEffect) {
      sideEffectNameEl.innerHTML = sideEffect.text;
      sideEffectPercentageEl.innerHTML = `(${sideEffect.percentage}%)`;
      sideEffectLinkEl.href = `/?nebenwirkung=${slugify(sideEffect.text)}`;
    } else {
      sideEffectNameEl.innerHTML = 'n.v.';
      sideEffectPercentageEl.innerHTML = '(n.v.%)';
    }
  });

  // activities
  // TODO: implement

  // tastes
  const tastes = getTastes(data.data.community_data.taste);
  const tastesEls = parentEl.querySelectorAll<HTMLElement>('[c-el="taste"]');

  tastesEls.forEach((el, index) => {
    const taste = tastes[index];
    const tasteNameEl = el.querySelector<HTMLElement>('[c-el="name"]');
    const tastePercentageEl = el.querySelector<HTMLElement>(
      '[c-el="percentage"]'
    );
    const tasteLinkEl = el.querySelector<HTMLAnchorElement>('[c-el="link"]');

    if (!tasteNameEl || !tastePercentageEl || !tasteLinkEl) return;

    if (taste) {
      tasteNameEl.innerHTML = taste.text;
      tastePercentageEl.innerHTML = `(${taste.percentage}%)`;
      tasteLinkEl.href = `/?geschmack=${slugify(taste.text)}`;
    } else {
      tasteNameEl.innerHTML = 'n.v.';
      tastePercentageEl.innerHTML = '(n.v.%)';
    }
  });

  // areas of application
  const areasOfApplication = getAreasOfApplication(
    data.data.community_data.area_of_application_rough
  );
  const areasOfApplicationEls = parentEl.querySelectorAll<HTMLElement>(
    '[c-el="area-of-application"]'
  );

  areasOfApplicationEls.forEach((el, index) => {
    const areaOfApplication = areasOfApplication[index];
    const areaOfApplicationNameEl =
      el.querySelector<HTMLElement>('[c-el="name"]');
    const areaOfApplicationPercentageEl = el.querySelector<HTMLElement>(
      '[c-el="percentage"]'
    );
    const areaOfApplicationLinkEl =
      el.querySelector<HTMLAnchorElement>('[c-el="link"]');

    if (
      !areaOfApplicationNameEl ||
      !areaOfApplicationPercentageEl ||
      !areaOfApplicationLinkEl
    )
      return;

    if (areaOfApplication) {
      areaOfApplicationNameEl.innerHTML = areaOfApplication.text;
      areaOfApplicationPercentageEl.innerHTML = `(${areaOfApplication.percentage}%)`;
      areaOfApplicationLinkEl.href = `/?anwendungsgebiet=${slugify(
        areaOfApplication.text
      )}`;
    } else {
      areaOfApplicationNameEl.innerHTML = 'n.v.';
      areaOfApplicationPercentageEl.innerHTML = '(n.v.%)';
    }
  });

  // qualities
  const qualities = getQualities(data.data.community_data.quality);
  const qualitiesEls =
    parentEl.querySelectorAll<HTMLElement>('[c-el="quality"]');

  qualitiesEls.forEach((el, index) => {
    const quality = qualities[index];
    const qualityNameEl = el.querySelector<HTMLElement>('[c-el="name"]');
    const qualityPercentageEl = el.querySelector<HTMLElement>(
      '[c-el="percentage"]'
    );
    const qualityLinkEl = el.querySelector<HTMLAnchorElement>('[c-el="link"]');

    if (!qualityNameEl || !qualityPercentageEl || !qualityLinkEl) return;

    if (quality) {
      qualityNameEl.innerHTML = quality.text;
      qualityPercentageEl.innerHTML = `(${quality.percentage}%)`;
      qualityLinkEl.href = `/?qualität=${slugify(quality.text)}`;
    } else {
      qualityNameEl.innerHTML = 'n.v.';
      qualityPercentageEl.innerHTML = '(n.v.%)';
    }
  });

  // review stars
  const rating = data.data.community_data.rating;
  const ratings = data.data.community_data.ratings;
  const ratingStarsEl = parentEl.querySelector<HTMLElement>(
    '[c-el="rating-stars"]'
  );

  if (ratingStarsEl) {
    renderStars(ratingStarsEl, rating, ratings);
  }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '+') // Replace spaces with +
    .replace(/--+/g, '-') // Replace multiple - with single -
    .trim();
}

function getTerpenes(data: Record<string, any>) {
  const keysToFilterOut = [
    'Sorte',
    'Kultivar',
    'Genetik',
    'Gehalt—THC',
    'Gehalt—CBD',
    'Hersteller',
    'Bestrahlung',
    'Terpendichte mg/g',
  ];

  const terpenes = Object.keys(data)
    .filter(key => !keysToFilterOut.includes(key) && data[key] !== null)
    .map(key => ({
      key: utils.capitalizeEveryWord(key.replace('—', ' ')),
      value: data[key],
    }));

  terpenes.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

  return terpenes;
}

function getEffects(data: any[], type: 'effect' | 'side_effect') {
  const effects = data.filter((effect: any) => effect.type === type);
  const totalConfirmations = effects.reduce(
    (acc, effect) => acc + effect.confirmations,
    0
  );
  effects.sort((a, b) => b.confirmations - a.confirmations);
  const effectsWithPercentage = effects.map(effect => ({
    ...effect,
    percentage: Math.round((effect.confirmations / totalConfirmations) * 100),
  }));

  return effectsWithPercentage;
}

function getTastes(data: any[]) {
  const tastes = data;
  const totalConfirmations = tastes.reduce(
    (acc, taste) => acc + taste.confirmations,
    0
  );
  tastes.sort((a, b) => b.confirmations - a.confirmations);
  const tastesWithPercentage = tastes.map(taste => ({
    ...taste,
    percentage: Math.round((taste.confirmations / totalConfirmations) * 100),
  }));

  return tastesWithPercentage;
}

function getAreasOfApplication(data: any[]) {
  const areasOfApplication = data;
  const totalConfirmations = areasOfApplication.reduce(
    (acc, areaOfApplication) => acc + areaOfApplication.confirmations,
    0
  );
  areasOfApplication.sort((a, b) => b.confirmations - a.confirmations);
  const areasOfApplicationWithPercentage = areasOfApplication.map(
    areaOfApplication => ({
      ...areaOfApplication,
      percentage: Math.round(
        (areaOfApplication.confirmations / totalConfirmations) * 100
      ),
    })
  );

  return areasOfApplicationWithPercentage;
}

function getQualities(data: any[]) {
  const qualities = data;
  const totalConfirmations = qualities.reduce(
    (acc, quality) => acc + quality.confirmations,
    0
  );
  qualities.sort((a, b) => b.confirmations - a.confirmations);
  const qualitiesWithPercentage = qualities.map(quality => ({
    ...quality,
    percentage: Math.round((quality.confirmations / totalConfirmations) * 100),
  }));

  return qualitiesWithPercentage;
}

function getRandomID() {
  const randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const uniqId = randLetter + Date.now();
  return uniqId;
}