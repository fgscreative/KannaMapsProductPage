// + Imports +

// Custom
import * as config from '../../config';
import * as utils from './utils';

// + Exports +
export default function (clone: HTMLElement, index: number) {
  // Values
  const state = window.KannaMaps;
  const data = state.productData.items[index];
  const list: HTMLElement = state.elements.productList;
  const notAvailableString =
    list.getAttribute('data-not-available-string') || 'n.v.';

  // Elements exist
  if (!data) {
    console.error(
      `KannaMaps -> render.ts: Couldn't find product datta!`,
      clone,
      index
    );
    return false;
  }

  // + Manipulate +

  // Terpenes
  const terpenes = clone.querySelector('[c-el="terpenes-wrapper"]');
  const terpeneWrappers = terpenes?.querySelectorAll('.p-relative-2.center');
  const nonAvailableTerpenes = terpenes?.querySelector(
    '[c-el="data-unavailable"]'
  );
  if (terpenes && nonAvailableTerpenes && terpeneWrappers?.length === 3) {
    // Your original object
    const originalObject = data.data.detailed;

    // Keys to filter out (specified in a variable)
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

    // Create an array of key-value objects without the specified keys
    const e = Object.keys(originalObject)
      .filter(
        key => !keysToFilterOut.includes(key) && originalObject[key] !== null
      )
      .map(key => ({
        key: utils.capitalizeEveryWord(key.replace('—', ' ')),
        value: originalObject[key],
      }));

    // Sort the array by the "value" property in descending order
    e.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

    // Logic
    if (e.length) {
      // Render
      terpeneWrappers.forEach((el, index) => {
        // Elements
        const text = el.querySelector('.product-card-tag.p-small');
        const dot = el.querySelector('.terpen-gradient-wrapper');

        // Color logic
        dot?.classList.remove('alpha', 'linalool', 'd-limone');
        dot?.classList.add(e[index]?.key?.toLowerCase().replace(' ', '-'));

        // Logic
        if (text && e[index]) {
          // Manipulate HTML
          text.innerHTML = e[index].key;
        } else el.classList.add('cc-inactive');
      });
    } else {
      // Hide
      terpenes.childNodes.forEach((node: any) =>
        node.classList.add('cc-inactive')
      );
      nonAvailableTerpenes.classList.remove('cc-inactive');
    }
  }

  // Effects
  const effects = clone.querySelector('[c-el="effects-wrapper"]');
  const effectWrappers = effects?.querySelectorAll('.flex-column.center');
  const nonAvailableEffects = effects?.querySelector(
    '[c-el="data-unavailable"]'
  );
  if (effects && nonAvailableEffects && effectWrappers?.length === 3) {
    // Logic
    const e: any[] = data.data.community_data.effects;
    if (e.length) {
      // Sort
      e.sort((a, b) => b.confirmations - a.confirmations);

      // Render
      effectWrappers.forEach((el, index) => {
        // Elements
        const text = el.querySelector('.product-card-tag.p-small');

        // Logic
        if (text && e[index]) text.innerHTML = e[index].text;
        else el.classList.add('cc-inactive');
      });
    } else {
      // Hide
      effects.childNodes.forEach((node: any) =>
        node.classList.add('cc-inactive')
      );
      nonAvailableEffects.classList.remove('cc-inactive');
    }
  }

  // Price
  const price = clone.querySelector('[c-el="price-from"]');
  const priceText = clone.querySelector('[c-el="price-text"]');
  const priceParent = clone.querySelector('[c-el="price-parent"]');
  if (price && priceText && priceParent) {
    // Values & logic
    const p: number | null = data.data.apothecaries_data.price_min;
    if (p !== null) {
      // Overwrite
      price.innerHTML = p.toString().replace('.', ',');
    } else {
      // Inactivate
      priceText.innerHTML = notAvailableString;
      priceParent.classList.add('inactive');
    }
  }

  // Images
  const indica = clone.querySelector('[c-el="indica"]');
  const sativa = clone.querySelector('[c-el="sativa"]');
  const hybrid = clone.querySelector('[c-el="hybrid"]');
  if (indica && sativa && hybrid) {
    // Values
    const elements = [indica, sativa, hybrid];

    // Loop
    elements.forEach(el => {
      // Hide all elements
      el.classList.add('cc-inactive');

      // Show specific
      if (el.getAttribute('c-el') === data.data.genetics.toLowerCase())
        el.classList.remove('cc-inactive');
    });
  }

  // Ratings
  const rating = clone.querySelector('[c-el="rating-wrapper"]');
  const ratingEmpty = clone.querySelector(
    '[c-el="rating-wrapper-empty-state"]'
  );
  if (rating && ratingEmpty) {
    // Elements
    const ratingNumber = rating.querySelector('[c-el="rating"]');
    const ratingsTotal = rating.querySelector('[c-el="ratings"]');
    const stars: NodeListOf<HTMLElement> = rating.querySelectorAll(
      '[c-el="rating-star-background"]'
    );

    // Guard
    if (!ratingNumber || !ratingsTotal || stars.length !== 5) {
      console.error(
        `KannaMaps -> render.ts: Couldn't find template rating elements!`,
        clone,
        index
      );
      return false;
    }

    // Edit if data is given
    const r: number | null = data.data.community_data.rating;
    if (r && data.data.community_data.ratings) {
      // Numbers
      ratingNumber.innerHTML = r.toString().replace('.', ',');
      ratingsTotal.innerHTML = data.data.community_data.ratings;

      // Stars
      stars.forEach((star, i) => {
        // Math
        const x = (Math.min(i + 1, r) - i) * 100;

        // Modify gradient
        star.style.backgroundImage = `linear-gradient(to right, #000, #000 ${x}%, #f9f8f8 ${x}%)`;
      });
    } else {
      // Show / hide
      rating.classList.add('cc-inactive');
      ratingEmpty.classList.remove('cc-inactive');
    }
  }

  // Strain
  const strain = clone.querySelector('[c-el="strain"]');
  if (strain) strain.innerHTML = data.data.strain || notAvailableString;

  // Type
  const type = clone.querySelector('[custom-identifier="type"]');
  if (type) type.innerHTML = data.data.type || notAvailableString;

  // Url
  const urls = clone.querySelectorAll('[c-el="url"]');
  const dataUrl =
    data.wf_slug !== ''
      ? (list.getAttribute('data-slug-prefix') || '/info/') + data.wf_slug
      : undefined;
  if (urls.length && dataUrl)
    urls.forEach(url => {
      url.setAttribute(
        'href',
        dataUrl + (url.getAttribute('data-suffix') || '')
      );
      url.addEventListener('click', () => url.classList.add('cc-loading'));
    });

  // Genetics
  const genetic = clone.querySelector(
    '[custom-identifier="productcard-genetics"]'
  );
  if (genetic) genetic.innerHTML = data.data.genetics || notAvailableString;

  // Availability
  const availibitly = clone.querySelector('[c-el="availibitly"]');
  if (availibitly) {
    if (data.data.apothecaries_data.availability_status !== 'available')
      availibitly.classList.add('cc-inactive');
  }

  // Thc
  const thc = clone.querySelector('[c-el="thc"]');
  if (thc) thc.innerHTML = data.data.thc_concentration || notAvailableString;

  // Cbd
  const cbd = clone.querySelector('[c-el="cbd"]');
  if (cbd) cbd.innerHTML = data.data.cbd_concentration || notAvailableString;
}
