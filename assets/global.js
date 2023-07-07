function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', 'false');

  if(summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if(isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event !== undefined) {
      this.mainDetailsToggle.classList.remove('menu-opening');
      this.mainDetailsToggle.querySelectorAll('details').forEach(details =>  {
        details.removeAttribute('open');
        details.classList.remove('menu-opening');
      });
      document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
      removeTrapFocus(elementToFocus);
      this.closeAnimation(this.mainDetailsToggle);
    }
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus();
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.getElementById('shopify-section-header');
    this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target.nodeName === 'MODAL-DIALOG') this.hide();
      });
    }
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent() {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      this.appendChild(content.querySelector('video, model-viewer, iframe')).focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('ul');
    this.sliderItems = this.querySelectorAll('li');
    this.pageCount = this.querySelector('.slider-counter--current');
    this.pageTotal = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    const resizeObserver = new ResizeObserver(entries => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }

  initPages() {
    const sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
    this.sliderLastItem = sliderItemsToShow[sliderItemsToShow.length - 1];
    if (sliderItemsToShow.length === 0) return;
    this.slidesPerPage = Math.floor(this.slider.clientWidth / sliderItemsToShow[0].clientWidth);
    this.totalPages = sliderItemsToShow.length - this.slidesPerPage + 1;
    this.update();
  }

  update() {
    if (!this.pageCount || !this.pageTotal) return;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderLastItem.clientWidth) + 1;

    if (this.currentPage === 1) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (this.currentPage === this.totalPages) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }

    this.pageCount.textContent = this.currentPage;
    this.pageTotal.textContent = this.totalPages;
  }

  onButtonClick(event) {
    event.preventDefault();
    const slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + this.sliderLastItem.clientWidth : this.slider.scrollLeft - this.sliderLastItem.clientWidth;
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }
}

customElements.define('slider-component', SliderComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    
    var text = '';
    if (this.currentVariant != undefined) {
      var product_price = Intl.NumberFormat(Shopify.locale, {
        style: 'currency',
        currency: Shopify.currency.active
      }).format((this.currentVariant.price / 100));
      text = window.variantStrings.addToCart + ' • <span class="btn-price">' + product_price + '</span>';
    }
    
    this.toggleAddButton(false, text, false);
    this.updatePickupAvailability();
    //this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(false, text, true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
    
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    if (fieldsets.length > 0) {
      var colorOptions = fieldsets.map((fieldset) => {
        return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
      });
      this.options = this.options.concat(colorOptions);
    }
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
    
    if (this.currentVariant == undefined) {
      var optionsReverse = this.options.reverse();
      this.currentVariant = this.getVariantData().find((variant) => {
        return !variant.options.map((option, index) => {
          return optionsReverse[index] === option;
        }).includes(false);
      });
    }
  }

  updateMedia() {
    if (!this.currentVariant) return;
    
    if ($('.product__images-slider .swiper').length == 0) return false;
    
    if ($('.product__images-thumbnails .product__images-thumbnails-variant').length > 0) {
      $('.product__images-thumbnails .product__images-thumbnails-variant-all:not(.hidden), .product__images-thumbnails .product__images-thumbnails-variant:not(.hidden)').addClass('hidden');
      $('.product__images-thumbnails .product__images-thumbnails-variant.product__images-thumbnails-variant--' + this.currentVariant.id).removeClass('hidden');
      
      $('.product__images-slider .swiper-media:not(.hidden), .product__images-slider .swiper-media-variant:not(.hidden)').addClass('hidden');
      $('.product__images-slider .swiper-media-variant.swiper-media-variant--' + this.currentVariant.id).removeClass('hidden');
    } else {
      var swiperMedia = window.swiperMedia;
      if (swiperMedia == undefined) return false;

      var mediaId = this.currentVariant.featured_media.id;
      var thumb = $('.product__images-thumbnails a[data-image="' + mediaId + '"]');
      if (thumb.length > 0 && !thumb.hasClass('active')) {
        var index = parseInt(thumb.data('index'));
        swiperMedia.slideTo(index);
      } else {
        return false;
      }
    }
    
    this.stickyHeader = this.stickyHeader || document.querySelector('sticky-header');
    if(this.stickyHeader) {
      this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'));
    }
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      $('.product-form .require-select-variant').hide();
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const id = `price-${this.dataset.section}`;
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(id);
        const source = html.getElementById(id);
        const variantPickerDestination = document.querySelector('variant-radios') || document.querySelector('variant-selects');
        const variantPickerSource = html.querySelector('variant-radios') || html.querySelector('variant-selects');

        if (source && destination) destination.innerHTML = source.innerHTML;
        if (variantPickerSource && variantPickerDestination) variantPickerDestination.innerHTML = variantPickerSource.innerHTML;
      
      	colorSwatches();

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        if (!this.currentVariant.available) {
          this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
        } else {
          var product_price = Intl.NumberFormat(Shopify.locale, {
            style: 'currency',
            currency: Shopify.currency.active
          }).format((this.currentVariant.price / 100));
		  this.toggleAddButton(false, window.variantStrings.addToCart + ' • <span class="btn-price">' + product_price + '</span>');
        }
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');

    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
    } else {
      addButton.removeAttribute('disabled');
    }
    
    if (text != '') {
      addButtonText.innerHTML = text;
    } else {
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    if (this.currentVariant == undefined) {
      addButton.disabled = true;
      if (price) {
        price.classList.add('visibility-hidden');
      }
    } else if (this.currentVariant != undefined && this.currentVariant.available == false ) {
      addButton.disabled = true;
      addButtonText.textContent = window.variantStrings.unavailable;
    }
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);


$(document).ready(function() {
  if (free_shipping != '') {
    free_shipping = free_shipping * Shopify.currency.rate;
  }
  
  $('.select2').select2();
  
  $('.mobile-menu-toggle').on('click', function() {
    var mobileMenu = $('.mobile-menu');
    if (mobileMenu.css('left') == '0px') {
      $('.close', $(this)).hide();
      $('.open', $(this)).show();
      mobileMenu.stop().animate({
        left: '-100%'
      }, 400, function() {
        $('body').removeClass('overflow-hidden');
      });
    } else {
      $('.open', $(this)).hide();
      $('.close', $(this)).show();
      mobileMenu.stop().animate({
        left: 0
      }, 400, function() {
        $('body').addClass('overflow-hidden');
      });
    }
    return false;
  });
  $('.mobile-menu-close').on('click', function() {
    $('.mobile-menu').stop().animate({
      left: '-100%'
    }, 400, function() {
      $('.mobile-menu-toggle .close').hide();
      $('.mobile-menu-toggle .open').show();
      $('body').removeClass('overflow-hidden');
    });
    return false;
  });
  $('.mobile-menu-back').on('click', function() {
    var openedMenu = $(this).closest('.mobile-menu-sub');
    var backMenu = $(this).data('menu');
    openedMenu.stop().animate({
      left: '100%'
    }, 400);
    if (backMenu == '') {
      $('.mobile-menu-main').stop().animate({
        left: 0
      }, 400);
    } else {
      $('.mobile-menu-sub[data-submenu="' + backMenu + '"]').stop().animate({
        left: 0
      }, 400);
    }
    return false;
  });
  $('.mobile-menu a[data-menu]:not(.mobile-menu-back)').on('click', function() {
    var openedMenu = $(this).parent();
    var selectedMenu = $('.mobile-menu-sub[data-submenu="' + $(this).data('menu') + '"]');
    if (selectedMenu.length > 0) {
      openedMenu.stop().animate({
        left: '-100%'
      }, 400);
      selectedMenu.stop().animate({
        left: 0
      }, 400);
      return false;
    }
  });
  $('.main-menu .link-level-1').hover(function() {
    var $this = $(this);
    var level2 = $('ul.list-level-2', $this);
    if (level2.length > 0) {
      level2.stop().slideDown(250);
    }
  }, function() {
	var $this = $(this);
    var level2 = $('ul.list-level-2', $this);
    if (level2.length > 0) {
      level2.stop().slideUp(250);
    }
  });
  $('.main-menu .link-level-2').hover(function() {
    var $this = $(this);
    var level3 = $('ul.list-level-3', $this);
    if (level3.length > 0) {
      level3.stop().slideDown(250);
    }
  }, function() {
	var $this = $(this);
    var level3 = $('ul.list-level-3', $this);
    if (level3.length > 0) {
      level3.stop().slideUp(250);
    }
  });
  var menuTimer;
  $('.main-menu a[data-megamenu]').hover(function() {
    clearTimeout(menuTimer);
    var activeMegaMenu = $('.main-menu .menu-mega.active');
    var selectedMenu = $(this).data('megamenu');
    var megaMenu = $('.main-menu .menu-mega[data-megamenu="' + selectedMenu + '"]');
    if (activeMegaMenu.length > 0) {
      activeMegaMenu.hide().removeClass('active');
      if (megaMenu.length > 0) {
      	megaMenu.show().addClass('active');
      }
    } else if (megaMenu.length > 0) {
      megaMenu.stop().slideDown(250, function() {
        $(this).addClass('active');
      }); 
    }
  }, function() {
    var selectedMenu = $(this).data('megamenu');
    var megaMenu = $('.main-menu .menu-mega[data-megamenu="' + selectedMenu + '"]');
    menuTimer = setTimeout(function() {
      if (!megaMenu.is(':hover')) {
        megaMenu.stop().slideUp(250, function() {
          $(this).removeClass('active');
        });
      }
    }, 250);
  });
  $('.main-menu .menu-mega[data-megamenu]').on('mouseleave', function() {
    var $this = $(this);
	var selectedMenu = $(this).data('megamenu');
    var megaMenu = $('.main-menu a[data-megamenu="' + selectedMenu + '"]');
    menuTimer = setTimeout(function() {
      if (!megaMenu.is(':hover')) {
        $this.stop().slideUp(250);
      }
    }, 250);
  });
  $('.main-menu .menu-mega a[data-image]').hover(function() {
    $('.main-menu .menu-mega .menu-mega-column.menu-mega-column-large .menu-title, .main-menu .menu-mega .menu-mega-column.menu-mega-column-large .menu-mega-object:not(.hover-image)').hide();
    $('.main-menu .menu-mega .menu-mega-column.menu-mega-column-large .menu-mega-object.hover-image[data-menu="' + $(this).data('image') + '"]').show();
  }, function() {
    $('.main-menu .menu-mega .menu-mega-column.menu-mega-column-large .menu-mega-object.hover-image').hide();
    $('.main-menu .menu-mega .menu-mega-column.menu-mega-column-large .menu-title, .main-menu .menu-mega .menu-mega-column.menu-mega-column-large .menu-mega-object:not(.hover-image)').show();
  });
  $('.mobile-menu.compact').css('height', 'calc(100% - ' + (headerHeight - 1) + 'px)');
  
  var headerHeight = 60;
  if ($('#shopify-section-announcement-bar').length > 0) {
    headerHeight += $('#shopify-section-announcement-bar').height();
  }
  if ($('#shopify-section-announcement-bar-progress-bar').length > 0) {
    headerHeight += $('#shopify-section-announcement-bar-progress-bar').height();
  }
  
  $('.header__icon--cart').on('click', function() {
    $('body').addClass('cart--drawer-opened');
    $('.section-announcement-bar').height($('.announcement-bar-line').height());
    $('.cart--drawer').stop().animate({
      right: 0
    }, 400);
    return false;
  });
   
  $('.header__icon--search').on('click', function() {
	$('.header-search').stop().fadeIn(200);
    return false;
  });
  $('.modal__close-button').on('click', function() {
    $('.header-search').stop().fadeOut(200);
    return false;
  });
  
  $('details-disclosure').hover(function() {
    var item = $('.header__menu-item', $(this));
    var details = $('details', $(this));
    item.attr('aria-expanded', 'true');
    details.attr('open', '');
  }, function() {
    var item = $('.header__menu-item', $(this));
    var details = $('details', $(this));
    item.attr('aria-expanded', 'false');
    details.removeAttr('open');
  });

  $('.cart--drawer-close').on('click', function() {
    $('.cart--drawer').stop().animate({
      right: '-100%'
    }, 400, function() {
      $('body').removeClass('cart--drawer-opened');
    });
    return false;
  });

  $(document).on('click', '.quantity-plus', function() {
    var input = $('input', $(this).closest('div'));
    var qty = parseInt(input.val()) + 1;

    input.val(qty);

    var product = $(this).closest('.cart--drawer-product');
    $.ajax({
      type: 'POST',
      url: '/cart/update.js',
      data: 'updates[' + product.data('key') + ']=' + qty,
      dataType: 'json',
      success: function(data) {
        $.ajax({
          type: 'GET',
          url: '/cart.js',
          dataType: 'json',
          success: function(data) {
            $('.cart--drawer-products .cart--drawer-product').remove();
            var zeroAmountItems = 0;
            var discountsName = [];
            var discountsPrice = [];
            $.each(data.items, function(k, v) {
              if (v.discounts.length > 0) {
                $.each(v.discounts, function(dk, dv) {
                  var inArray = $.inArray(dv.title, discountsName);
                  if(inArray !== -1) {
                    discountsPrice[inArray] += dv.amount;
                  } else {
                    discountsName.push(dv.title);
                    discountsPrice.push(dv.amount);
                  }
                });
              }
              var product_price = Intl.NumberFormat(Shopify.locale, {
                style: 'currency',
                currency: Shopify.currency.active
              }).format((v.price / 100));
              var product_discounted_price = Intl.NumberFormat(Shopify.locale, {
                style: 'currency',
                currency: Shopify.currency.active
              }).format((v.discounted_price / 100));
              var variant_options = v.title.replace(v.product_title, '').replace(' - ', '');
              var properties = '';
              if (v.properties != null) {
                $.each(v.properties, function(k, v) {
                  properties += '<p>' + k + ': ' + v + '</p>';
                });
              }
              $('.cart--drawer-products').append('<div class="cart--drawer-product" data-key="' + v.key + '" data-product-variant-id="' + v.variant_id + '" data-product-id="' + v.id + '">\
                <div class="cart--drawer-product-image">\
                  <a href="' + v.url + '">\
                    <img src="' + v.image + '" alt="' + v.title + '">\
                  </a>\
                </div>\
                <div class="cart--drawer-product-info">\
                  <a href="/cart/change?id=' + v.key + '&amp;quantity=0" class="cart--drawer-product-remove">\
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">\
                      <path d="M11.89 6.7L10 8.59L8.11 6.7C7.72 6.31 7.09 6.31 6.7 6.7C6.31 7.09 6.31 7.72 6.7 8.11L8.59 10L6.7 11.89C6.31 12.28 6.31 12.91 6.7 13.3C7.09 13.69 7.72 13.69 8.11 13.3L10 11.41L11.89 13.3C12.28 13.69 12.91 13.69 13.3 13.3C13.69 12.91 13.69 12.28 13.3 11.89L11.41 10L13.3 8.11C13.69 7.72 13.69 7.09 13.3 6.7C12.91 6.32 12.27 6.32 11.89 6.7ZM10 0C4.47 0 0 4.47 0 10C0 15.53 4.47 20 10 20C15.53 20 20 15.53 20 10C20 4.47 15.53 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18Z" fill="black"></path>\
                    </svg>\
                  </a>\
                  <div class="cart--drawer-product-name">\
                    <a href="' + v.url + '">' + v.product_title + '</a>\
                  </div>\
				  ' + ((variant_options != '' || properties != '') ? '<div class="cart--drawer-product-variant">' + (variant_options != '' ? variant_options : '') + (properties != '' ? properties : '') + '</div>' : '') + '\
                  <div class="cart--drawer-product-price">\
					' + (v.discounted_price != v.price ? '<span class="old"><span class="money">' + product_price + '</span></span> <span class="money">' + product_discounted_price + '</span>' : '<span class="money">' + product_price + '</span>') + '\
                  </div>\
                  <div class="cart--drawer-product-quantity">\
					<div>\
                      <button type="button" class="quantity-minus">\
                        <svg width="10" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">\
                          <path d="M8.99992 1.66683H0.999919C0.633252 1.66683 0.333252 1.36683 0.333252 1.00016C0.333252 0.633496 0.633252 0.333496 0.999919 0.333496H8.99992C9.36659 0.333496 9.66659 0.633496 9.66659 1.00016C9.66659 1.36683 9.36659 1.66683 8.99992 1.66683Z" fill="black"></path>\
                        </svg>\
                      </button>\
                      <input type="text" name="quantity" value="' + v.quantity + '" min="1" readonly="readonly">\
                      <button type="button" class="quantity-plus">\
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">\
                          <path d="M8.99992 5.66683H5.66659V9.00016C5.66659 9.36683 5.36659 9.66683 4.99992 9.66683C4.63325 9.66683 4.33325 9.36683 4.33325 9.00016V5.66683H0.999919C0.633252 5.66683 0.333252 5.36683 0.333252 5.00016C0.333252 4.6335 0.633252 4.3335 0.999919 4.3335H4.33325V1.00016C4.33325 0.633496 4.63325 0.333496 4.99992 0.333496C5.36659 0.333496 5.66659 0.633496 5.66659 1.00016V4.3335H8.99992C9.36659 4.3335 9.66659 4.6335 9.66659 5.00016C9.66659 5.36683 9.36659 5.66683 8.99992 5.66683Z" fill="black"></path>\
                        </svg>\
                      </button>\
					</div>\
                  </div>\
                </div>\
              </div>');
              
              if ($('.cart--drawer-announcement-bar').length > 0 && $('.cart--drawer-announcement-bar').data('zero-amount-items') == true && v.discounted_price == 0) {
                zeroAmountItems++;
              }
            });
            
            $('.header__icon--cart span, .cart--drawer-count').text(data.item_count);

            var total_price = data.total_price / 100;
            var total = Intl.NumberFormat(Shopify.locale, {
              style: 'currency',
              currency: Shopify.currency.active
            }).format(total_price);
            $('.cart--drawer-summary-subtotal').text(total);
            
            if ($('.cart--drawer-announcement-bar').length > 0 && $('.cart--drawer-announcement-bar').data('type') == 'dollar') {
              var amountLeft = (parseInt($('.cart--drawer-announcement-bar').data('threshold')) * 100) - data.total_price;
              if (amountLeft > 0) {
                var amountLeft = Intl.NumberFormat(Shopify.locale, {
                  style: 'currency',
                  currency: Shopify.currency.active
                }).format((amountLeft / 100));
                if ($('.cart--drawer-announcement-bar .cart-drawer-dollar').length > 0) {
                  $('.cart--drawer-announcement-bar .cart-drawer-dollar').text(amountLeft);
                } else {
                  $('.cart--drawer-announcement-bar').html('Increase your bundle value by <span class="cart-drawer-dollar">' + amountLeft + '</span> to get ' + $('.cart--drawer-announcement-bar').data('discount') + '.');
                }
              } else {
                $('.cart--drawer-announcement-bar').text('You got ' + $('.cart--drawer-announcement-bar').data('discount') + '!');
              }
            } else if ($('.cart--drawer-announcement-bar').length > 0 && $('.cart--drawer-announcement-bar').data('type') == 'items') {
              var itemsLeft = parseInt($('.cart--drawer-announcement-bar').data('threshold')) - (data.item_count - zeroAmountItems);
              if (itemsLeft > 0) {
                if ($('.cart--drawer-announcement-bar .cart-drawer-item').length > 0) {
                  $('.cart--drawer-announcement-bar .cart-drawer-item').text(itemsLeft);
                } else {
                  $('.cart--drawer-announcement-bar').html('Buy <span class="cart-drawer-item">' + itemsLeft + '</span> more items for ' + $('.cart--drawer-announcement-bar').data('discount') + '.');
                }
              } else {
                $('.cart--drawer-announcement-bar').text('You got ' + $('.cart--drawer-announcement-bar').data('discount') + '!');
              }
            }

            if ($('.cart--drawer-free-shipping').length > 0) {
              var shipping = 'Free';
              if (total_price < free_shipping) {
                shipping = 'Calculated at checkout';

                $('.cart--drawer-free-shipping-success').removeClass('show');
                $('.cart--drawer-free-shipping').removeClass('hide');
                if ($('.announcement-bar-line').length > 0) {
                  $('.announcement-bar-text-success').removeClass('show');
                  $('.announcement-bar-text').removeClass('hide');
                }

                $('.cart--drawer-process-bar div').animate({
                  'width': (100 - (((free_shipping - total_price) * 100) / free_shipping)) + '%'
                }, 500);
                if ($('.section-announcement-bar').length > 0) {
                  $('.announcement-bar-progress-bar div').animate({
                    'width': (100 - (((free_shipping - total_price) * 100) / free_shipping)) + '%'
                  }, 500);
                }
              } else {
                $('.cart--drawer-free-shipping').addClass('hide');
                $('.cart--drawer-free-shipping-success').addClass('show');
                if ($('.announcement-bar-line').length > 0) {
                  $('.announcement-bar-text').addClass('hide');
                  $('.announcement-bar-text-success').addClass('show');
                }

                $('.cart--drawer-process-bar div').animate({
                  'width': '100%'
                }, 500);
                if ($('.section-announcement-bar').length > 0) {
                  $('.announcement-bar-progress-bar div').animate({
                    'width': '100%'
                  }, 500);
                }
              }

              var freeShippingPriceLeft = Intl.NumberFormat(Shopify.locale, {
                style: 'currency',
                currency: Shopify.currency.active
              }).format((free_shipping - total_price));
              $('.cart--drawer-free-shipping .money').text(freeShippingPriceLeft);
              if ($('.section-announcement-bar').length > 0) {
                $('.announcement-bar-text .money').text(freeShippingPriceLeft);
              }
              $('.cart--drawer-summary-shipping').text(shipping);
            }
            
            $('.cart--drawer-summary-prices .discounts').remove();
            if (discountsName.length > 0) {
              $.each(discountsName, function(dk, dv) {
                var discount_price = Intl.NumberFormat(Shopify.locale, {
                  style: 'currency',
                  currency: Shopify.currency.active
                }).format((discountsPrice[dk] / 100));
                
                $('<ul class="discounts list-unstyled" role="list" aria-label="Discount">\
                  <li class="discounts__discount discounts__discount--end">\
                  <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-discount color-foreground-text" viewBox="0 0 12 12">\
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7 0h3a2 2 0 012 2v3a1 1 0 01-.3.7l-6 6a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4l6-6A1 1 0 017 0zm2 2a1 1 0 102 0 1 1 0 00-2 0z" fill="currentColor"></path>\
                  </svg>\
                  ' + dv + ' (-' + discount_price + ')\
                  </li>\
                </ul>').insertBefore('.cart--drawer-summary-prices p');
              });
            }
            
            var cartDrawerContentMinusHeight = 0;
            if ($('.cart--drawer-announcement-bar').length > 0) {
              cartDrawerContentMinusHeight += $('.cart--drawer-announcement-bar').height();
            }
            if ($('.cart--drawer-header').length > 0) {
              cartDrawerContentMinusHeight += $('.cart--drawer-header').height();
            }
            $('.cart--drawer-content').css({
              'height': 'calc(100% - ' + cartDrawerContentMinusHeight + 'px)',
              'padding-bottom': ($('.cart--drawer-summary').height() + 26) + 'px'
            });
          }
        });
      }
    });
  });
  $(document).on('click', '.quantity-minus', function() {
    var input = $('input', $(this).closest('div'));
    var qty = parseInt(input.val()) - 1;

    input.val(qty);

    var product = $(this).closest('.cart--drawer-product');
    if (qty <= 0) {
      product.remove();
    }
    $.ajax({
      type: 'POST',
      url: '/cart/update.js',
      data: 'updates[' + product.data('key') + ']=' + qty,
      dataType: 'json',
      success: function(data) {
        $.ajax({
          type: 'GET',
          url: '/cart.js',
          dataType: 'json',
          success: function(data) {
            $('.cart--drawer-products .cart--drawer-product').remove();
            var zeroAmountItems = 0;
            var discountsName = [];
            var discountsPrice = [];
            $.each(data.items, function(k, v) {
              if (v.discounts.length > 0) {
                $.each(v.discounts, function(dk, dv) {
                  var inArray = $.inArray(dv.title, discountsName);
                  if(inArray !== -1) {
                    discountsPrice[inArray] += dv.amount;
                  } else {
                    discountsName.push(dv.title);
                    discountsPrice.push(dv.amount);
                  }
                });
              }
              var product_price = Intl.NumberFormat(Shopify.locale, {
                style: 'currency',
                currency: Shopify.currency.active
              }).format((v.price / 100));
              var product_discounted_price = Intl.NumberFormat(Shopify.locale, {
                style: 'currency',
                currency: Shopify.currency.active
              }).format((v.discounted_price / 100));
              var variant_options = v.title.replace(v.product_title, '').replace(' - ', '');
              var properties = '';
              if (v.properties != null) {
                $.each(v.properties, function(k, v) {
                  properties += '<p>' + k + ': ' + v + '</p>';
                });
              }
              $('.cart--drawer-products').append('<div class="cart--drawer-product" data-key="' + v.key + '" data-product-variant-id="' + v.variant_id + '" data-product-id="' + v.id + '">\
                <div class="cart--drawer-product-image">\
                  <a href="' + v.url + '">\
                    <img src="' + v.image + '" alt="' + v.title + '">\
                  </a>\
                </div>\
                <div class="cart--drawer-product-info">\
                  <a href="/cart/change?id=' + v.key + '&amp;quantity=0" class="cart--drawer-product-remove">\
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">\
                      <path d="M11.89 6.7L10 8.59L8.11 6.7C7.72 6.31 7.09 6.31 6.7 6.7C6.31 7.09 6.31 7.72 6.7 8.11L8.59 10L6.7 11.89C6.31 12.28 6.31 12.91 6.7 13.3C7.09 13.69 7.72 13.69 8.11 13.3L10 11.41L11.89 13.3C12.28 13.69 12.91 13.69 13.3 13.3C13.69 12.91 13.69 12.28 13.3 11.89L11.41 10L13.3 8.11C13.69 7.72 13.69 7.09 13.3 6.7C12.91 6.32 12.27 6.32 11.89 6.7ZM10 0C4.47 0 0 4.47 0 10C0 15.53 4.47 20 10 20C15.53 20 20 15.53 20 10C20 4.47 15.53 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18Z" fill="black"></path>\
                    </svg>\
                  </a>\
                  <div class="cart--drawer-product-name">\
                    <a href="' + v.url + '">' + v.product_title + '</a>\
                  </div>\
				  ' + ((variant_options != '' || properties != '') ? '<div class="cart--drawer-product-variant">' + (variant_options != '' ? variant_options : '') + (properties != '' ? properties : '') + '</div>' : '') + '\
                  <div class="cart--drawer-product-price">\
					' + (v.discounted_price != v.price ? '<span class="old"><span class="money">' + product_price + '</span></span> <span class="money">' + product_discounted_price + '</span>' : '<span class="money">' + product_price + '</span>') + '\
                  </div>\
                  <div class="cart--drawer-product-quantity">\
					<div>\
                      <button type="button" class="quantity-minus">\
                        <svg width="10" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">\
                          <path d="M8.99992 1.66683H0.999919C0.633252 1.66683 0.333252 1.36683 0.333252 1.00016C0.333252 0.633496 0.633252 0.333496 0.999919 0.333496H8.99992C9.36659 0.333496 9.66659 0.633496 9.66659 1.00016C9.66659 1.36683 9.36659 1.66683 8.99992 1.66683Z" fill="black"></path>\
                        </svg>\
                      </button>\
                      <input type="text" name="quantity" value="' + v.quantity + '" min="1" readonly="readonly">\
                      <button type="button" class="quantity-plus">\
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">\
                          <path d="M8.99992 5.66683H5.66659V9.00016C5.66659 9.36683 5.36659 9.66683 4.99992 9.66683C4.63325 9.66683 4.33325 9.36683 4.33325 9.00016V5.66683H0.999919C0.633252 5.66683 0.333252 5.36683 0.333252 5.00016C0.333252 4.6335 0.633252 4.3335 0.999919 4.3335H4.33325V1.00016C4.33325 0.633496 4.63325 0.333496 4.99992 0.333496C5.36659 0.333496 5.66659 0.633496 5.66659 1.00016V4.3335H8.99992C9.36659 4.3335 9.66659 4.6335 9.66659 5.00016C9.66659 5.36683 9.36659 5.66683 8.99992 5.66683Z" fill="black"></path>\
                        </svg>\
                      </button>\
					</div>\
                  </div>\
                </div>\
              </div>');
              
              if ($('.cart--drawer-announcement-bar').length > 0 && $('.cart--drawer-announcement-bar').data('zero-amount-items') == true && v.discounted_price == 0) {
                zeroAmountItems++;
              }
            });
            
            $('.header__icon--cart span, .cart--drawer-count').text(data.item_count);

            var total_price = data.total_price / 100;
            var total = Intl.NumberFormat(Shopify.locale, {
              style: 'currency',
              currency: Shopify.currency.active
            }).format(total_price);
            $('.cart--drawer-summary-subtotal').text(total);
            
            if ($('.cart--drawer-announcement-bar').length > 0 && $('.cart--drawer-announcement-bar').data('type') == 'dollar') {
              var amountLeft = (parseInt($('.cart--drawer-announcement-bar').data('threshold')) * 100) - data.total_price;
              if (amountLeft > 0) {
                var amountLeft = Intl.NumberFormat(Shopify.locale, {
                  style: 'currency',
                  currency: Shopify.currency.active
                }).format((amountLeft / 100));
                if ($('.cart--drawer-announcement-bar .cart-drawer-dollar').length > 0) {
                  $('.cart--drawer-announcement-bar .cart-drawer-dollar').text(amountLeft);
                } else {
                  $('.cart--drawer-announcement-bar').html('Increase your bundle value by <span class="cart-drawer-dollar">' + amountLeft + '</span> to get ' + $('.cart--drawer-announcement-bar').data('discount') + '.');
                }
              } else {
                $('.cart--drawer-announcement-bar').text('You got ' + $('.cart--drawer-announcement-bar').data('discount') + '!');
              }
            } else if ($('.cart--drawer-announcement-bar').length > 0 && $('.cart--drawer-announcement-bar').data('type') == 'items') {
              var itemsLeft = parseInt($('.cart--drawer-announcement-bar').data('threshold')) - (data.item_count - zeroAmountItems);
              if (itemsLeft > 0) {
                if ($('.cart--drawer-announcement-bar .cart-drawer-item').length > 0) {
                  $('.cart--drawer-announcement-bar .cart-drawer-item').text(itemsLeft);
                } else {
                  $('.cart--drawer-announcement-bar').html('Buy <span class="cart-drawer-item">' + itemsLeft + '</span> more items for ' + $('.cart--drawer-announcement-bar').data('discount') + '.');
                }
              } else {
                $('.cart--drawer-announcement-bar').text('You got ' + $('.cart--drawer-announcement-bar').data('discount') + '!');
              }
            }

            if ($('.cart--drawer-free-shipping').length > 0) {
              var shipping = 'Free';
              if (total_price < free_shipping) {
                shipping = 'Calculated at checkout';

                $('.cart--drawer-free-shipping-success').removeClass('show');
                $('.cart--drawer-free-shipping').removeClass('hide');
                if ($('.announcement-bar-line').length > 0) {
                  $('.announcement-bar-text-success').removeClass('show');
                  $('.announcement-bar-text').removeClass('hide');
                }

                $('.cart--drawer-process-bar div').animate({
                  'width': (100 - (((free_shipping - total_price) * 100) / free_shipping)) + '%'
                }, 500);
                if ($('.section-announcement-bar').length > 0) {
                  $('.announcement-bar-progress-bar div').animate({
                    'width': (100 - (((free_shipping - total_price) * 100) / free_shipping)) + '%'
                  }, 500);
                }
              } else {
                $('.cart--drawer-free-shipping').addClass('hide');
                $('.cart--drawer-free-shipping-success').addClass('show');
                if ($('.announcement-bar-line').length > 0) {
                  $('.announcement-bar-text').addClass('hide');
                  $('.announcement-bar-text-success').addClass('show');
                }

                $('.cart--drawer-process-bar div').animate({
                  'width': '100%'
                }, 500);
                if ($('.section-announcement-bar').length > 0) {
                  $('.announcement-bar-progress-bar div').animate({
                    'width': '100%'
                  }, 500);
                }
              }

              var freeShippingPriceLeft = Intl.NumberFormat(Shopify.locale, {
                style: 'currency',
                currency: Shopify.currency.active
              }).format((free_shipping - total_price));
              $('.cart--drawer-free-shipping .money').text(freeShippingPriceLeft);
              if ($('.section-announcement-bar').length > 0) {
                $('.announcement-bar-text .money').text(freeShippingPriceLeft);
              }
              $('.cart--drawer-summary-shipping').text(shipping);
            }
            
            $('.cart--drawer-summary-prices .discounts').remove();
            if (discountsName.length > 0) {
              $.each(discountsName, function(dk, dv) {
                var discount_price = Intl.NumberFormat(Shopify.locale, {
                  style: 'currency',
                  currency: Shopify.currency.active
                }).format((discountsPrice[dk] / 100));
                
                $('<ul class="discounts list-unstyled" role="list" aria-label="Discount">\
                  <li class="discounts__discount discounts__discount--end">\
                  <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-discount color-foreground-text" viewBox="0 0 12 12">\
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7 0h3a2 2 0 012 2v3a1 1 0 01-.3.7l-6 6a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4l6-6A1 1 0 017 0zm2 2a1 1 0 102 0 1 1 0 00-2 0z" fill="currentColor"></path>\
                  </svg>\
                  ' + dv + ' (-' + discount_price + ')\
                  </li>\
                </ul>').insertBefore('.cart--drawer-summary-prices p');
              });
            }
            
            var cartDrawerContentMinusHeight = 0;
            if ($('.cart--drawer-announcement-bar').length > 0) {
              cartDrawerContentMinusHeight += $('.cart--drawer-announcement-bar').height();
            }
            if ($('.cart--drawer-header').length > 0) {
              cartDrawerContentMinusHeight += $('.cart--drawer-header').height();
            }
            $('.cart--drawer-content').css({
              'height': 'calc(100% - ' + cartDrawerContentMinusHeight + 'px)',
              'padding-bottom': ($('.cart--drawer-summary').height() + 26) + 'px'
            });
          }
        });
      }
    });
  });

  $(document).on('click', '.cart--drawer-product-remove', function() {
    var product = $(this).closest('.cart--drawer-product');
    product.remove();
    $.ajax({
      type: 'POST',
      url: '/cart/update.js',
      data: 'updates[' + product.data('key') + ']=0',
      dataType: 'json',
      success: function(data) {
        $.ajax({
          type: 'GET',
          url: '/cart.js',
          dataType: 'json',
          success: function(data) {
            $('.cart--drawer-products .cart--drawer-product').remove();
            var zeroAmountItems = 0;
            var discountsName = [];
            var discountsPrice = [];
            $.each(data.items, function(k, v) {
              if (v.discounts.length > 0) {
                $.each(v.discounts, function(dk, dv) {
                  var inArray = $.inArray(dv.title, discountsName);
                  if(inArray !== -1) {
                    discountsPrice[inArray] += dv.amount;
                  } else {
                    discountsName.push(dv.title);
                    discountsPrice.push(dv.amount);
                  }
                });
              }
              var product_price = Intl.NumberFormat(Shopify.locale, {
                style: 'currency',
                currency: Shopify.currency.active
              }).format((v.price / 100));
              var product_discounted_price = Intl.NumberFormat(Shopify.locale, {
                style: 'currency',
                currency: Shopify.currency.active
              }).format((v.discounted_price / 100));
              var variant_options = v.title.replace(v.product_title, '').replace(' - ', '');
              var properties = '';
              if (v.properties != null) {
                $.each(v.properties, function(k, v) {
                  properties += '<p>' + k + ': ' + v + '</p>';
                });
              }
              $('.cart--drawer-products').append('<div class="cart--drawer-product" data-key="' + v.key + '" data-product-variant-id="' + v.variant_id + '" data-product-id="' + v.id + '">\
                <div class="cart--drawer-product-image">\
                  <a href="' + v.url + '">\
                    <img src="' + v.image + '" alt="' + v.title + '">\
                  </a>\
                </div>\
                <div class="cart--drawer-product-info">\
                  <a href="/cart/change?id=' + v.key + '&amp;quantity=0" class="cart--drawer-product-remove">\
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">\
                      <path d="M11.89 6.7L10 8.59L8.11 6.7C7.72 6.31 7.09 6.31 6.7 6.7C6.31 7.09 6.31 7.72 6.7 8.11L8.59 10L6.7 11.89C6.31 12.28 6.31 12.91 6.7 13.3C7.09 13.69 7.72 13.69 8.11 13.3L10 11.41L11.89 13.3C12.28 13.69 12.91 13.69 13.3 13.3C13.69 12.91 13.69 12.28 13.3 11.89L11.41 10L13.3 8.11C13.69 7.72 13.69 7.09 13.3 6.7C12.91 6.32 12.27 6.32 11.89 6.7ZM10 0C4.47 0 0 4.47 0 10C0 15.53 4.47 20 10 20C15.53 20 20 15.53 20 10C20 4.47 15.53 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18Z" fill="black"></path>\
                    </svg>\
                  </a>\
                  <div class="cart--drawer-product-name">\
                    <a href="' + v.url + '">' + v.product_title + '</a>\
                  </div>\
				  ' + ((variant_options != '' || properties != '') ? '<div class="cart--drawer-product-variant">' + (variant_options != '' ? variant_options : '') + (properties != '' ? properties : '') + '</div>' : '') + '\
                  <div class="cart--drawer-product-price">\
					' + (v.discounted_price != v.price ? '<span class="old"><span class="money">' + product_price + '</span></span> <span class="money">' + product_discounted_price + '</span>' : '<span class="money">' + product_price + '</span>') + '\
                  </div>\
                  <div class="cart--drawer-product-quantity">\
					<div>\
                      <button type="button" class="quantity-minus">\
                        <svg width="10" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">\
                          <path d="M8.99992 1.66683H0.999919C0.633252 1.66683 0.333252 1.36683 0.333252 1.00016C0.333252 0.633496 0.633252 0.333496 0.999919 0.333496H8.99992C9.36659 0.333496 9.66659 0.633496 9.66659 1.00016C9.66659 1.36683 9.36659 1.66683 8.99992 1.66683Z" fill="black"></path>\
                        </svg>\
                      </button>\
                      <input type="text" name="quantity" value="' + v.quantity + '" min="1" readonly="readonly">\
                      <button type="button" class="quantity-plus">\
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">\
                          <path d="M8.99992 5.66683H5.66659V9.00016C5.66659 9.36683 5.36659 9.66683 4.99992 9.66683C4.63325 9.66683 4.33325 9.36683 4.33325 9.00016V5.66683H0.999919C0.633252 5.66683 0.333252 5.36683 0.333252 5.00016C0.333252 4.6335 0.633252 4.3335 0.999919 4.3335H4.33325V1.00016C4.33325 0.633496 4.63325 0.333496 4.99992 0.333496C5.36659 0.333496 5.66659 0.633496 5.66659 1.00016V4.3335H8.99992C9.36659 4.3335 9.66659 4.6335 9.66659 5.00016C9.66659 5.36683 9.36659 5.66683 8.99992 5.66683Z" fill="black"></path>\
                        </svg>\
                      </button>\
					</div>\
                  </div>\
                </div>\
              </div>');
              
              if ($('.cart--drawer-announcement-bar').length > 0 && $('.cart--drawer-announcement-bar').data('zero-amount-items') == true && v.discounted_price == 0) {
                zeroAmountItems++;
              }
            });
            
            $('.header__icon--cart span, .cart--drawer-count').text(data.item_count);

            var total_price = data.total_price / 100;
            var total = Intl.NumberFormat(Shopify.locale, {
              style: 'currency',
              currency: Shopify.currency.active
            }).format(total_price);
            $('.cart--drawer-summary-subtotal').text(total);
            
            if ($('.cart--drawer-announcement-bar').length > 0 && $('.cart--drawer-announcement-bar').data('type') == 'dollar') {
              var amountLeft = (parseInt($('.cart--drawer-announcement-bar').data('threshold')) * 100) - data.total_price;
              if (amountLeft > 0) {
                var amountLeft = Intl.NumberFormat(Shopify.locale, {
                  style: 'currency',
                  currency: Shopify.currency.active
                }).format((amountLeft / 100));
                if ($('.cart--drawer-announcement-bar .cart-drawer-dollar').length > 0) {
                  $('.cart--drawer-announcement-bar .cart-drawer-dollar').text(amountLeft);
                } else {
                  $('.cart--drawer-announcement-bar').html('Increase your bundle value by <span class="cart-drawer-dollar">' + amountLeft + '</span> to get ' + $('.cart--drawer-announcement-bar').data('discount') + '.');
                }
              } else {
                $('.cart--drawer-announcement-bar').text('You got ' + $('.cart--drawer-announcement-bar').data('discount') + '!');
              }
            } else if ($('.cart--drawer-announcement-bar').length > 0 && $('.cart--drawer-announcement-bar').data('type') == 'items') {
              var itemsLeft = parseInt($('.cart--drawer-announcement-bar').data('threshold')) - (data.item_count - zeroAmountItems);
              if (itemsLeft > 0) {
                if ($('.cart--drawer-announcement-bar .cart-drawer-item').length > 0) {
                  $('.cart--drawer-announcement-bar .cart-drawer-item').text(itemsLeft);
                } else {
                  $('.cart--drawer-announcement-bar').html('Buy <span class="cart-drawer-item">' + itemsLeft + '</span> more items for ' + $('.cart--drawer-announcement-bar').data('discount') + '.');
                }
              } else {
                $('.cart--drawer-announcement-bar').text('You got ' + $('.cart--drawer-announcement-bar').data('discount') + '!');
              }
            }

            if ($('.cart--drawer-free-shipping').length > 0) {
              var shipping = 'Free';
              if (total_price < free_shipping) {
                shipping = 'Calculated at checkout';

                $('.cart--drawer-free-shipping-success').removeClass('show');
                $('.cart--drawer-free-shipping').removeClass('hide');
                if ($('.announcement-bar-line').length > 0) {
                  $('.announcement-bar-text-success').removeClass('show');
                  $('.announcement-bar-text').removeClass('hide');
                }

                $('.cart--drawer-process-bar div').animate({
                  'width': (100 - (((free_shipping - total_price) * 100) / free_shipping)) + '%'
                }, 500);
                if ($('.section-announcement-bar').length > 0) {
                  $('.announcement-bar-progress-bar div').animate({
                    'width': (100 - (((free_shipping - total_price) * 100) / free_shipping)) + '%'
                  }, 500);
                }
              } else {
                $('.cart--drawer-free-shipping').addClass('hide');
                $('.cart--drawer-free-shipping-success').addClass('show');
                if ($('.announcement-bar-line').length > 0) {
                  $('.announcement-bar-text').addClass('hide');
                  $('.announcement-bar-text-success').addClass('show');
                }

                $('.cart--drawer-process-bar div').animate({
                  'width': '100%'
                }, 500);
                if ($('.section-announcement-bar').length > 0) {
                  $('.announcement-bar-progress-bar div').animate({
                    'width': '100%'
                  }, 500);
                }
              }

              var freeShippingPriceLeft = Intl.NumberFormat(Shopify.locale, {
                style: 'currency',
                currency: Shopify.currency.active
              }).format((free_shipping - total_price));
              $('.cart--drawer-free-shipping .money').text(freeShippingPriceLeft);
              if ($('.section-announcement-bar').length > 0) {
                $('.announcement-bar-text .money').text(freeShippingPriceLeft);
              }
              $('.cart--drawer-summary-shipping').text(shipping);
            }
            
            $('.cart--drawer-summary-prices .discounts').remove();
            if (discountsName.length > 0) {
              $.each(discountsName, function(dk, dv) {
                var discount_price = Intl.NumberFormat(Shopify.locale, {
                  style: 'currency',
                  currency: Shopify.currency.active
                }).format((discountsPrice[dk] / 100));
                
                $('<ul class="discounts list-unstyled" role="list" aria-label="Discount">\
                  <li class="discounts__discount discounts__discount--end">\
                  <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-discount color-foreground-text" viewBox="0 0 12 12">\
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7 0h3a2 2 0 012 2v3a1 1 0 01-.3.7l-6 6a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4l6-6A1 1 0 017 0zm2 2a1 1 0 102 0 1 1 0 00-2 0z" fill="currentColor"></path>\
                  </svg>\
                  ' + dv + ' (-' + discount_price + ')\
                  </li>\
                </ul>').insertBefore('.cart--drawer-summary-prices p');
              });
            }
            
            var cartDrawerContentMinusHeight = 0;
            if ($('.cart--drawer-announcement-bar').length > 0) {
              cartDrawerContentMinusHeight += $('.cart--drawer-announcement-bar').height();
            }
            if ($('.cart--drawer-header').length > 0) {
              cartDrawerContentMinusHeight += $('.cart--drawer-header').height();
            }
            $('.cart--drawer-content').css({
              'height': 'calc(100% - ' + cartDrawerContentMinusHeight + 'px)',
              'padding-bottom': ($('.cart--drawer-summary').height() + 26) + 'px'
            });
          }
        });
      }
    });
    return false;
  });
  
  $(document).on('change', '.card-wrapper:not(.cart--drawer-product-big) .card-wrapper-option select, .card-wrapper:not(.cart--drawer-product-big) .card-wrapper-option input', function() {
    var $this = $(this);
    var val = $this.val();
    var cardWrapper = $this.closest('.card-wrapper');
    var button = $('button', cardWrapper);
    var variantRequired = $('.require-select-variant', cardWrapper);
    var variants = cardWrapper.data('variants');
    if (typeof variants == 'string') {
      variants = JSON.parse(decodeURI(variants));
    }
    var option1 = null;
    var option2 = null;
    var option3 = null;
    $.each($('.card-wrapper-option select, .card-wrapper-option input:checked', cardWrapper), function(k, v) {
      var option = $(v);
      if (option.data('option') == 1) {
        option1 = option.val();
      } else if (option.data('option') == 2) {
        option2 = option.val();
      } else if (option.data('option') == 3) {
        option3 = option.val();
      }
    });
    var variant = null;
    $.each(variants, function(k, v) {
      if (v.option1 == option1 && v.option2 == option2 && v.option3 == option3) {
        variant = v;
      }
    });
    if (variant == null) {
      $('.card-wrapper-top img', cardWrapper).css('display', '');
      if ($('.card-wrapper-top img.first', cardWrapper).length == 0) {
      	$('.card-wrapper-top img:first-child', cardWrapper).css('display', 'block');
      }
      button.attr('data-add-id', '').prop('disabled', 'disabled');
      $('> div:last-child', button).text('').hide();
    } else {
      if (variant.featured_media != undefined) {
        var variantImage = $('img.variant-' + variant.featured_media.id, $('.card-wrapper-top', cardWrapper));
        $('.card-wrapper-top img', cardWrapper).hide();
        if (variantImage.length > 0) {
          $('.card-wrapper-top img', cardWrapper).removeClass('first').removeClass('second');
          variantImage.show();
        } else {
          $('.card-wrapper-top img', cardWrapper).css('display', '');
        }
      }
      var product_price = Intl.NumberFormat(Shopify.locale, {
		style: 'currency',
		currency: Shopify.currency.active
	  }).format((variant.price / 100));
      var product_old_price = 0;
	  if (variant.compare_at_price > 0) {
		product_old_price = Intl.NumberFormat(Shopify.locale, {
		  style: 'currency',
		  currency: Shopify.currency.active
		}).format((variant.compare_at_price / 100));
	  }
      $('> div:last-child', button).html(product_price + (product_old_price != 0 ? ' <span class="old">' + product_old_price + '</span>' : '')).show();
      if (variant.available == false) {
        $('div:first-child span', button).text('Out of Stock');
      	button.attr('data-add-id', variant.id).prop('disabled', 'disabled');
      } else {
        $('div:first-child span', button).text((cardWrapper.hasClass('bundle-item') ? 'Add to Bundle' : 'Add to Cart'));
      	button.attr('data-add-id', variant.id).prop('disabled', '');
      }
      if (variantRequired.length > 0) {
        variantRequired.hide();
      }
    }
  });
  $('.color-picker.load-more').on('click', function() {
    var $this = $(this);
    var option = $this.parent();
    $this.hide();
    $('label:not(.load-more)', option).removeClass('hidden').show();
  });
  
  $(document).on('change', '.product__info-container variant-selects select', function() {
    var val = $(this).val();
    if (val == '') {
      $('.product-form__buttons .product-form__submit').prop('disabled', 'disabled');
      $('.product__info-container .product-form input[name="id"]').val('0');
    }
  });
  
  $(document).on('change', '.card-wrapper.cart--drawer-product-big .card-wrapper-option select', function() {
    var $this = $(this);
    var val = $this.val();
    var cardWrapper = $this.closest('.card-wrapper');
    $('button', cardWrapper).attr('data-add-id', val);
    if (val != '') {
      $('button[disabled]', cardWrapper).removeAttr('disabled');
    } else {
      $('button:not(disabled)', cardWrapper).prop('disabled', 'disabled');
    }
  });
  $(document).on('click', '.cart--drawer-product-big-button', function() {
    var productWrapper = $(this).closest('.cart--drawer-product-big');
    $(this).hide();
    $('.card-wrapper-option', productWrapper).show();
    $('button', productWrapper).removeAttr('disabled');
    return false;
  });
  
  if ($('.bundle-products .bundle-item .button:not(.button-already-added)').length == 0) {
    var button = $('.bundle-products .bundle-side button');
    button.addClass('button-already-added');
    $('svg', button).removeClass('hidden');
    $('span', button).text('Bundle added to cart');
    button.prop('disabled', 'disabled');
  }
  $('.bundle-products .bundle-side button').on('click', function() {
    var button = $(this);
    button.prop('disabled', 'disabled');
    $('.button-content', button).addClass('hidden');
    $('.loading-overlay__spinner', button).removeClass('hidden');
    
    var items = $('.bundle-items input[name="checked"][value="1"]', button.closest('.bundle-products'));
    $.each(items, function(k, v) {
      setTimeout(function() {
        var cardWrapperBottom = $(v).closest('.card-wrapper-bottom');
        var button = $('.button', cardWrapperBottom);
        var variant_id = button.data('add-id');
        var product_id = button.data('product-id');
        var collection_id = button.data('collection-id');
        addProduct(variant_id, 1, product_id, collection_id, '', '');
      }, 1000 * k);
    });
    
    setTimeout(function() {
      if (!$('body').hasClass('cart--drawer-opened')) {
        $('body').addClass('cart--drawer-opened');
        $('.cart--drawer').animate({
          right: 0
        }, 500);
      }
      button.addClass('button-already-added');
      $('.button-content svg', button).removeClass('hidden');
      $('.button-content span', button).text('Bundle added to cart');
      $('.loading-overlay__spinner', button).addClass('hidden');
      $('.button-content', button).removeClass('hidden');
    }, 1000 * items.length);
    return false;
  });

  $(document).on('click', '[data-add-id]', function() {
    var button = $(this);
    var wrapper = button.closest('.card-wrapper');
    if (wrapper.hasClass('bundle-item')) {
      $('input[name="checked"]', wrapper).val('1');
      $('.button', wrapper).addClass('button-already-added').prop('disabled', 'disabled');
      $('.button div:first-child span', wrapper).text('Added to bundle');
      $('.card-wrapper-option', wrapper).hide();
	  
      var bundleProducts = wrapper.closest('.bundle-products');
      var bundleButton = $('.bundle-side button', bundleProducts);
      if (bundleButton.hasClass('button-already-added')) {
        bundleButton.removeClass('button-already-added');
        $('svg', bundleButton).addClass('hidden');
        $('span', bundleButton).text('Add Bundle to Cart');
      }
      
      var totalPrice = 0;
      var discountPrice = 0;
      $.each($('.bundle-items .button.button-already-added', bundleProducts), function(k, v) {
        var productPrice = $('.button-price', button);
        totalPrice += parseFloat(productPrice.data('price'));
      });
      var bundlePrice = $('.bundle-price', bundleProducts);
      if (bundlePrice.data('discount-type') == 'percentage_discount') {
        var discountCalc = (parseInt(bundlePrice.data('discount')) / 100) * totalPrice;
      } else if (bundlePrice.data('discount-type') == 'dollar_value') {
        var discountCalc = parseInt(bundlePrice.data('discount')) * 100;
      }
      discountPrice = totalPrice - discountCalc;
      var totalPriceConv = Intl.NumberFormat(Shopify.locale, {
		style: 'currency',
		currency: Shopify.currency.active
	  }).format((totalPrice / 100));
      var discountPriceConv = Intl.NumberFormat(Shopify.locale, {
		style: 'currency',
		currency: Shopify.currency.active
	  }).format((discountPrice / 100));
      bundlePrice.html('<span class="old">' + totalPriceConv + '</span> ' + discountPriceConv);
      
      var bar = 100;
      var item_quantity = $('.bundle-products .bundle-side .item_quantity');
      var dollar_value = $('.bundle-products .bundle-side .dollar_value');
      if (item_quantity.length > 0) {
        var item_quantity_val = parseInt(item_quantity.text()) - 1;
        if (item_quantity_val > 0) {
          item_quantity.text(item_quantity_val);
        }
        if (parseInt(item_quantity.data('quantity')) >= item_quantity_val) {
          bar = 100 - ((item_quantity_val / parseInt(item_quantity.data('quantity'))) * 100);
        }
      } else if (dollar_value.length > 0) {
        var dollar_value_val = parseFloat(dollar_value.data('amount')) - totalPrice;
        if (dollar_value_val > 0) {
          var dollar_value_val_conv = Intl.NumberFormat(Shopify.locale, {
            style: 'currency',
            currency: Shopify.currency.active
          }).format((dollar_value_val / 100));
          dollar_value.text(dollar_value_val_conv);
        }
        if (parseFloat(dollar_value.data('amount')) >= dollar_value_val) {
          bar = 100 - ((dollar_value_val / parseFloat(dollar_value.data('amount'))) * 100);
        }
      }
      $('.bundle-products .bundle-bar div').css('width', bar + '%');
      
      if (bar >= 100) {
        bundleButton.removeAttr('disabled');
        $('.bundle-products .bundle-side p').remove();
      }
      
      return false;
    }
    var variant_id = button.data('add-id');
    var product_id = button.data('product-id');
    var collection_id = button.data('collection-id');
    var quantity = button.data('add-quantity');
    if (quantity == undefined) {
      quantity = 1;
    }
    $('span', button).addClass('hidden');
    $('.loading-overlay__spinner', button).removeClass('hidden');
    if (button.hasClass('buy-now')) {
      $.ajax({
        type: 'POST',
        url: '/cart/clear.js',
        success: function() {
          $.ajax({
            type: 'POST',
            url: '/cart/add.js',
            data: {
              id: variant_id,
              quantity: 1
            },
            dataType: 'json',
            success: function() {
              window.location.href = '/checkout';
            }
          });
        }
      });
    } else {
      addProduct(variant_id, quantity, product_id, collection_id, '', '');
      setTimeout(function() {
        $('.loading-overlay__spinner', button).addClass('hidden');
        $('span:not(.old)', button).removeClass('hidden');
        if (!$('body').hasClass('cart--drawer-opened')) {
          $('body').addClass('cart--drawer-opened');
          $('.cart--drawer').animate({
            right: 0
          }, 500);
        }
      }, 500);
    }
    return false;
  });
  
  $('button[name="add"]').on('click', function() {
    var button = $(this);
    var form = button.closest('form');
    var upsell = $('.upsell-product [name="upsell"]');
    var variant_id = $('[name="id"]', form).val();
    if (variant_id == 0) {
      $('html, body').animate({ scrollTop: (form.offset().top - 250) }, 1000);
      return false;
    }
    var selling_plan = '';
    if ($('[name="selling_plan"]').length > 0) {
      selling_plan = $('[name="selling_plan"]').val();
    }
    var properties = {};
    if ($('[name^="properties"]').length > 0) {
      var props = [];
      $('[name^="properties"]').each(function(k, prop) {
        props.push({
          key: $(prop).attr('name').replace('properties[', '').replace(']', ''), 
          value: $(prop).val()
        });
      });
      properties = props.reduce((obj, cur) => ({...obj, [cur.key]: cur.value}), {});
    }
    var product_id = $('[name="product_id"]', form).val();
    var collection_id = $('[name="collection_id"]', form).val();
    var quantity = $('quantity-input [name="quantity"]').val();
    if (quantity == undefined || quantity <= 0) {
      quantity = 1;
    }
    $('span', button).addClass('hidden');
    $('.loading-overlay__spinner', button).removeClass('hidden');
    var items = [
	  {
		quantity: quantity,
		id: variant_id,
		selling_plan: selling_plan,
		properties: properties
	  }
	];
    if (upsell.is(':checked') == true) {
      items.push({
        quantity: 1,
        id: upsell.val()
      });
    }
    if (gift_product != null && $('.cart--drawer-product[data-product-variant-id="' + gift_product + '"]').length == 0) {
      if (gift_option == 'all_purchases') {
        items.push({
          quantity: 1,
          id: gift_product
        });
      } else if (gift_option == 'specific_parameters') {
        if (gift_triggers_product != null && gift_triggers_product == product_id) {
		  items.push({
            quantity: 1,
            id: gift_product
          });
        } else if (gift_triggers_collection != null && collection_id.indexOf(gift_triggers_collection + ',') != -1) {
          items.push({
            quantity: 1,
            id: gift_product
          });
        } else if (customer_tags.length > 0 && gift_customer_tags != '') {
          $.each(customer_tags, function(k, v) {
            if (gift_customer_tags.indexOf(v) != -1) {
              items.push({
                quantity: 1,
                id: gift_product
              });
              return false;
            }
          });
        }
      }
    }
    $.ajax({
      type: 'POST',
      url: '/cart/add.js',
      data: {
        items: items
      },
      dataType: 'json',
      success: function() {
        $.ajax({
          type: 'GET',
          url: '/cart.js',
          dataType: 'json',
          success: function(data) {
            $('.cart--drawer-products .cart--drawer-product').remove();
            var pro_id = 0;
            var zeroAmountItems = 0;
            var discountsName = [];
            var discountsPrice = [];
            $.each(data.items, function(k, v) {
              if (v.discounts.length > 0) {
                $.each(v.discounts, function(dk, dv) {
                  var inArray = $.inArray(dv.title, discountsName);
                  if(inArray !== -1) {
                    discountsPrice[inArray] += dv.amount;
                  } else {
                    discountsName.push(dv.title);
                    discountsPrice.push(dv.amount);
                  }
                });
              }
              if (variant_id == v.variant_id) {
                pro_id = v.product_id;
              }
              var product_price = Intl.NumberFormat(Shopify.locale, {
                style: 'currency',
                currency: Shopify.currency.active
              }).format((v.price / 100));
              var product_discounted_price = Intl.NumberFormat(Shopify.locale, {
                style: 'currency',
                currency: Shopify.currency.active
              }).format((v.discounted_price / 100));
              var variant_options = v.title.replace(v.product_title, '').replace(' - ', '');
              var properties = '';
              if (v.properties != null) {
                $.each(v.properties, function(k, v) {
                  properties += '<p>' + k + ': ' + v + '</p>';
                });
              }
              $('.cart--drawer-products').prepend('<div class="cart--drawer-product" data-key="' + v.key + '" data-product-variant-id="' + v.variant_id + '" data-product-id="' + v.id + '">\
                <div class="cart--drawer-product-image">\
                  <a href="' + v.url + '">\
                    <img src="' + v.image + '" alt="' + v.title + '">\
                  </a>\
                </div>\
                <div class="cart--drawer-product-info">\
                  <a href="/cart/change?id=' + v.key + '&amp;quantity=0" class="cart--drawer-product-remove">\
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">\
                      <path d="M11.89 6.7L10 8.59L8.11 6.7C7.72 6.31 7.09 6.31 6.7 6.7C6.31 7.09 6.31 7.72 6.7 8.11L8.59 10L6.7 11.89C6.31 12.28 6.31 12.91 6.7 13.3C7.09 13.69 7.72 13.69 8.11 13.3L10 11.41L11.89 13.3C12.28 13.69 12.91 13.69 13.3 13.3C13.69 12.91 13.69 12.28 13.3 11.89L11.41 10L13.3 8.11C13.69 7.72 13.69 7.09 13.3 6.7C12.91 6.32 12.27 6.32 11.89 6.7ZM10 0C4.47 0 0 4.47 0 10C0 15.53 4.47 20 10 20C15.53 20 20 15.53 20 10C20 4.47 15.53 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18Z" fill="black"></path>\
                    </svg>\
                  </a>\
                  <div class="cart--drawer-product-name">\
                    <a href="' + v.url + '">' + v.product_title + '</a>\
                  </div>\
			  	  ' + ((variant_options != '' || properties != '') ? '<div class="cart--drawer-product-variant">' + (variant_options != '' ? variant_options : '') + (properties != '' ? properties : '') + '</div>' : '') + '\
                  <div class="cart--drawer-product-price">\
                  	' + (v.discounted_price != v.price ? '<span class="old"><span class="money">' + product_price + '</span></span> <span class="money">' + product_discounted_price + '</span>' : '<span class="money">' + product_price + '</span>') + '\
                  </div>\
                  <div class="cart--drawer-product-quantity">\
					<div>\
                      <button type="button" class="quantity-minus">\
                        <svg width="10" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">\
                          <path d="M8.99992 1.66683H0.999919C0.633252 1.66683 0.333252 1.36683 0.333252 1.00016C0.333252 0.633496 0.633252 0.333496 0.999919 0.333496H8.99992C9.36659 0.333496 9.66659 0.633496 9.66659 1.00016C9.66659 1.36683 9.36659 1.66683 8.99992 1.66683Z" fill="black"></path>\
                        </svg>\
                      </button>\
                      <input type="text" name="quantity" value="' + v.quantity + '" min="1" readonly="readonly">\
                      <button type="button" class="quantity-plus">\
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">\
                          <path d="M8.99992 5.66683H5.66659V9.00016C5.66659 9.36683 5.36659 9.66683 4.99992 9.66683C4.63325 9.66683 4.33325 9.36683 4.33325 9.00016V5.66683H0.999919C0.633252 5.66683 0.333252 5.36683 0.333252 5.00016C0.333252 4.6335 0.633252 4.3335 0.999919 4.3335H4.33325V1.00016C4.33325 0.633496 4.63325 0.333496 4.99992 0.333496C5.36659 0.333496 5.66659 0.633496 5.66659 1.00016V4.3335H8.99992C9.36659 4.3335 9.66659 4.6335 9.66659 5.00016C9.66659 5.36683 9.36659 5.66683 8.99992 5.66683Z" fill="black"></path>\
                        </svg>\
                      </button>\
					</div>\
                  </div>\
                </div>\
              </div>');
              
              if ($('.cart--drawer-announcement-bar').length > 0 && $('.cart--drawer-announcement-bar').data('zero-amount-items') == true && v.discounted_price == 0) {
                zeroAmountItems++;
              }
            });
            
            $('.header__icon--cart span, .cart--drawer-count').text(data.item_count);

            var total_price = data.total_price / 100;
            var total = Intl.NumberFormat(Shopify.locale, {
              style: 'currency',
              currency: Shopify.currency.active
            }).format(total_price);
            $('.cart--drawer-summary-subtotal').text(total);
            
            if ($('.cart--drawer-announcement-bar').length > 0 && $('.cart--drawer-announcement-bar').data('type') == 'dollar') {
              var amountLeft = (parseInt($('.cart--drawer-announcement-bar').data('threshold')) * 100) - data.total_price;
              if (amountLeft > 0) {
                var amountLeft = Intl.NumberFormat(Shopify.locale, {
                  style: 'currency',
                  currency: Shopify.currency.active
                }).format((amountLeft / 100));
                $('.cart--drawer-announcement-bar .cart-drawer-dollar').text(amountLeft);
              } else {
                $('.cart--drawer-announcement-bar').text('You got ' + $('.cart--drawer-announcement-bar').data('discount') + '!');
              }
            } else if ($('.cart--drawer-announcement-bar').length > 0 && $('.cart--drawer-announcement-bar').data('type') == 'items') {
              var itemsLeft = parseInt($('.cart--drawer-announcement-bar').data('threshold')) - (data.item_count - zeroAmountItems);
              if (itemsLeft > 0) {
                $('.cart--drawer-announcement-bar .cart-drawer-item').text(itemsLeft);
              } else {
                $('.cart--drawer-announcement-bar').text('You got ' + $('.cart--drawer-announcement-bar').data('discount') + '!');
              }
            }

            if ($('.cart--drawer-free-shipping').length > 0) {
              var shipping = 'Free';
              if (total_price < free_shipping) {
                shipping = 'Calculated at checkout';

                $('.cart--drawer-free-shipping-success').removeClass('show');
                $('.cart--drawer-free-shipping').removeClass('hide');
                if ($('.announcement-bar-line').length > 0) {
                  $('.announcement-bar-text-success').removeClass('show');
                  $('.announcement-bar-text').removeClass('hide');
                }

                $('.cart--drawer-process-bar div').animate({
                  'width': (100 - (((free_shipping - total_price) * 100) / free_shipping)) + '%'
                }, 500);
                if ($('.section-announcement-bar').length > 0) {
                  $('.announcement-bar-progress-bar div').animate({
                    'width': (100 - (((free_shipping - total_price) * 100) / free_shipping)) + '%'
                  }, 500);
                }
              } else {
                $('.cart--drawer-free-shipping').addClass('hide');
                $('.cart--drawer-free-shipping-success').addClass('show');
                if ($('.announcement-bar-line').length > 0) {
                  $('.announcement-bar-text').addClass('hide');
                  $('.announcement-bar-text-success').addClass('show');
                }

                $('.cart--drawer-process-bar div').animate({
                  'width': '100%'
                }, 500);
                if ($('.section-announcement-bar').length > 0) {
                  $('.announcement-bar-progress-bar div').animate({
                    'width': '100%'
                  }, 500);
                }
              }

              var freeShippingPriceLeft = Intl.NumberFormat(Shopify.locale, {
                style: 'currency',
                currency: Shopify.currency.active
              }).format((free_shipping - total_price));
              $('.cart--drawer-free-shipping .money').text(freeShippingPriceLeft);
              if ($('.section-announcement-bar').length > 0) {
                $('.announcement-bar-text .money').text(freeShippingPriceLeft);
              }
              $('.cart--drawer-summary-shipping').text(shipping);
            }
            
            $('.cart--drawer-summary-prices .discounts').remove();
            if (discountsName.length > 0) {
              $.each(discountsName, function(dk, dv) {
                var discount_price = Intl.NumberFormat(Shopify.locale, {
                  style: 'currency',
                  currency: Shopify.currency.active
                }).format((discountsPrice[dk] / 100));
                
                $('<ul class="discounts list-unstyled" role="list" aria-label="Discount">\
                  <li class="discounts__discount discounts__discount--end">\
                  <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-discount color-foreground-text" viewBox="0 0 12 12">\
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7 0h3a2 2 0 012 2v3a1 1 0 01-.3.7l-6 6a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4l6-6A1 1 0 017 0zm2 2a1 1 0 102 0 1 1 0 00-2 0z" fill="currentColor"></path>\
                  </svg>\
                  ' + dv + ' (-' + discount_price + ')\
                  </li>\
                </ul>').insertBefore('.cart--drawer-summary-prices p');
              });
            }

            if ($('.cart--drawer-you-may-also-like').length > 0) {
              if ($('.cart--drawer-you-may-also-like').hasClass('hidden')) {
                $('.cart--drawer-you-may-also-like, .cart--drawer-you-may-also-like-title').removeClass('hidden');
              }
              $('.cart--drawer-you-may-also-like-scroller .swiper-wrapper').text('');
              if ($('.cart--drawer-you-may-also-like').data('shopify-recommendations') == true) {
                $.get('/recommendations/products.json?product_id=' + pro_id, function(results) {
                  $.each(results.products, function(k, v) {
                    var exist = false;
                    var optionsVariants = '';
                    $.each(v.variants, function(k2, v2) {
                      if ($('.cart--drawer-product[data-product-variant-id="' + v2.id + '"]').length > 0 && exist == false) {
                        exist = true;
                      }
                      if (v2.available == true && v2.title != 'Default Title') {
                        optionsVariants += '<option value="' + v2.id + '">' + v2.title + '</option>';
                      }
                    });
                    if (exist == false) {
                      var productPrice = '';
                      if (v.compare_at_price_varies == true) {
                        var product_price_min = Intl.NumberFormat(Shopify.locale, {
                          style: 'currency',
                          currency: Shopify.currency.active
                        }).format((v.compare_at_price_min / 100));
                        var product_price_max = Intl.NumberFormat(Shopify.locale, {
                          style: 'currency',
                          currency: Shopify.currency.active
                        }).format((v.compare_at_price_max / 100));
                        productPrice = product_price_min + ' - ' + product_price_max;
                      } else if (v.price_varies == true) {
                        var product_price_min = Intl.NumberFormat(Shopify.locale, {
                          style: 'currency',
                          currency: Shopify.currency.active
                        }).format((v.price_min / 100));
                        var product_price_max = Intl.NumberFormat(Shopify.locale, {
                          style: 'currency',
                          currency: Shopify.currency.active
                        }).format((v.price_max / 100));
                        productPrice = product_price_min + ' - ' + product_price_max;
                      } else {
                        var product_price = Intl.NumberFormat(Shopify.locale, {
                          style: 'currency',
                          currency: Shopify.currency.active
                        }).format((v.price / 100));
                        var product_old_price = 0;
                        if (v.compare_at_price > 0) {
                          product_old_price = Intl.NumberFormat(Shopify.locale, {
                            style: 'currency',
                            currency: Shopify.currency.active
                          }).format((v.compare_at_price / 100));
                        }
                        productPrice = product_price + (product_old_price != 0 ? ' <span class="old"><span class="money">' + product_old_price + '</span></span>' : '');
                      }
                      $('.cart--drawer-you-may-also-like-scroller .swiper-wrapper').append('<div class="swiper-slide cart--drawer-product-big card-wrapper" data-product-id="' + v.variant_id + '">\
						<div class="card-wrapper-top">\
                          <a href="/products/' + v.handle + '">\
                            <img src="' + v.featured_image + '" alt="' + v.title + '">\
                            <div class="cart--drawer-product-big-name">' + v.title + '</div>\
                            <div class="cart--drawer-product-big-price">' + productPrice + '</div>\
                          </a>\
						</div>\
						<div class="card-wrapper-bottom">\
                          ' + (optionsVariants != '' ? '<div class="card-wrapper-option">\
                            <div class="product-form__input product-form__input--dropdown">\
                              <div class="select">\
                                <select class="select__select">' + optionsVariants + '</select>\
                                <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-caret" viewBox="0 0 10 6"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z" fill="currentColor"></svg>\
                              </div>\
                            </div>\
                          </div>\
                          <a href="#" class="cart--drawer-product-big-button text-center">Select an Option</a>' : '') + '\
                          <button type="button" data-add-id="' + v.variants[0].id + '" class="button"' + ((v.variants.length == 1 && v.variants[0].title == 'Default Title') ? '' : ' disabled="disabled"') + '>\
                            <span>Add to Cart</span>\
                            <div class="loading-overlay__spinner hidden">\
                              <svg aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">\
                                <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>\
                              </svg>\
                            </div>\
                          </button>\
						</div>\
                      </div>');
                    }
                  });
                  new Swiper('.cart--drawer-you-may-also-like-scroller', {
                    slidesPerView: 'auto',
                    spaceBetween: 12,
                    freeMode: true,
                    mousewheel: {
                      forceToAxis: true
                    }
                  });
                });
              } else {
                var i = 1;
                $.each(products, function(k, v) {
                  if (i < 5 && v.tags.indexOf('Upsell Eligible') != -1) {
                    var exist = false;
                    var optionsVariants = '';
                    $.each(v.variants, function(k2, v2) {
                      if ($('.cart--drawer-product[data-product-variant-id="' + v2.id + '"]').length > 0 && exist == false) {
                        exist = true;
                      }
                      if (v2.available == true && v2.title != 'Default Title') {
                        optionsVariants += '<option value="' + v2.id + '">' + v2.title + '</option>';
                      }
                    });
                    if (exist == false) {
                      var productPrice = '';
                      if (v.compare_at_price_varies == true) {
                        var product_price_min = Intl.NumberFormat(Shopify.locale, {
                          style: 'currency',
                          currency: Shopify.currency.active
                        }).format((v.compare_at_price_min / 100));
                        var product_price_max = Intl.NumberFormat(Shopify.locale, {
                          style: 'currency',
                          currency: Shopify.currency.active
                        }).format((v.compare_at_price_max / 100));
                        productPrice = product_price_min + ' - ' + product_price_max;
                      } else if (v.price_varies == true) {
                        var product_price_min = Intl.NumberFormat(Shopify.locale, {
                          style: 'currency',
                          currency: Shopify.currency.active
                        }).format((v.price_min / 100));
                        var product_price_max = Intl.NumberFormat(Shopify.locale, {
                          style: 'currency',
                          currency: Shopify.currency.active
                        }).format((v.price_max / 100));
                        productPrice = product_price_min + ' - ' + product_price_max;
                      } else {
                        var product_price = Intl.NumberFormat(Shopify.locale, {
                          style: 'currency',
                          currency: Shopify.currency.active
                        }).format((v.price / 100));
                        var product_old_price = 0;
                        if (v.compare_at_price > 0) {
                          product_old_price = Intl.NumberFormat(Shopify.locale, {
                            style: 'currency',
                            currency: Shopify.currency.active
                          }).format((v.compare_at_price / 100));
                        }
                        productPrice = product_price + (product_old_price != 0 ? ' <span class="old"><span class="money">' + product_old_price + '</span></span>' : '');
                      }
                      $('.cart--drawer-you-may-also-like-scroller .swiper-wrapper').append('<div class="swiper-slide cart--drawer-product-big card-wrapper" data-product-id="' + v.variant_id + '">\
						<div class="card-wrapper-top">\
                          <a href="/products/' + v.handle + '">\
                            <img src="' + v.featured_image + '" alt="' + v.title + '">\
                            <div class="cart--drawer-product-big-name">' + v.title + '</div>\
                            <div class="cart--drawer-product-big-price">' + productPrice + '</div>\
                          </a>\
						</div>\
						<div class="card-wrapper-bottom">\
                          ' + (optionsVariants != '' ? '<div class="card-wrapper-option">\
                            <div class="product-form__input product-form__input--dropdown">\
                              <div class="select">\
                                <select class="select__select">' + optionsVariants + '</select>\
                                <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-caret" viewBox="0 0 10 6"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z" fill="currentColor"></svg>\
                              </div>\
                            </div>\
                          </div>\
                          <a href="#" class="cart--drawer-product-big-button text-center">Select an Option</a>' : '') + '\
                          <button type="button" data-add-id="' + v.variants[0].id + '" class="button"' + ((v.variants.length == 1 && v.variants[0].title == 'Default Title') ? '' : ' disabled="disabled"') + '>\
                            <span>Add to Cart</span>\
                            <div class="loading-overlay__spinner hidden">\
                              <svg aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">\
                                <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>\
                              </svg>\
                            </div>\
                          </button>\
						</div>\
                      </div>');
                      i++;
                    }
                  }
                });
                new Swiper('.cart--drawer-you-may-also-like-scroller', {
                  slidesPerView: 'auto',
                  spaceBetween: 12,
                  freeMode: true,
                  mousewheel: {
                    forceToAxis: true
                  }
                });
              }
            }
            
            var cartDrawerContentMinusHeight = 0;
            if ($('.cart--drawer-announcement-bar').length > 0) {
              cartDrawerContentMinusHeight += $('.cart--drawer-announcement-bar').height();
            }
            if ($('.cart--drawer-header').length > 0) {
              cartDrawerContentMinusHeight += $('.cart--drawer-header').height();
            }
            $('.cart--drawer-content').css({
              'height': 'calc(100% - ' + cartDrawerContentMinusHeight + 'px)',
              'padding-bottom': ($('.cart--drawer-summary').height() + 26) + 'px'
            });

            setTimeout(function() {
              $('.loading-overlay__spinner', button).addClass('hidden');
              $('span:not(.old)', button).removeClass('hidden');
              $('body').addClass('cart--drawer-opened');
              $('.cart--drawer').animate({
                right: 0
              }, 500);
            }, 500);
          }
        });
      }
    });
    return false;
  });
  
  $('.mobile-nav-bar a[href="/search"]').on('click', function() {
    $('body').addClass('overflow-hidden');
    $('.header__search details').attr('open', 'true');
    return false
  });
  $('.mobile-nav-bar button').on('click', function() {
    var button = $(this);
    var variant_id = $('.product-form [name="id"]').val();
    var product_id = $('.product-form [name="product_id"]').val();
    var collection_id = $('.product-form [name="collection_id"]').val();
    var quantity = $('.quantity [name="quantity"]').val();
    if (quantity == undefined) {
      quantity = 1;
    }
    if (parseInt(variant_id) > 0) {
      $('span', button).addClass('hidden');
      $('.loading-overlay__spinner', button).removeClass('hidden');
      addProduct(variant_id, quantity, product_id, collection_id, '', '');
      setTimeout(function() {
        $('.loading-overlay__spinner', button).addClass('hidden');
        $('span:not(.old)', button).removeClass('hidden');
        $('body').addClass('cart--drawer-opened');
        $('.cart--drawer').animate({
          right: 0
        }, 500);
        $('.mobile-nav-bar.product-nav-bar').stop().animate({
          'bottom': '-64px'
        }, 250, function() {
          $('.mobile-nav-bar.product-nav-bar').addClass('fixed');
          $('.mobile-nav-bar.product-nav-bar button').addClass('hidden');
          $('.mobile-nav-bar.product-nav-bar div').show();
          $('.mobile-nav-bar.product-nav-bar').stop().animate({
            'bottom': '24px'
          }, 250)
        });
      }, 500);
    }
  });

  var scrollTop = $(window).scrollTop();
  if ($('.mobile-nav-bar.product-nav-bar').length > 0) {
    var productNavBarShow = false;
    var elementOffsetProductNavBar = $('.product-form').offset().top;
    var distanceProductNavbar = (elementOffsetProductNavBar - scrollTop);
    if (distanceProductNavbar <= 0 && productNavBarShow == false) {
      $('.mobile-nav-bar.product-nav-bar').stop().animate({
        'bottom': '24px'
      }, 250);
      productNavBarShow = true;
    }
  }
  $(window).on('resize', function() {
    scrollTop = $(window).scrollTop();

    if ($('.mobile-nav-bar.product-nav-bar').length > 0) {
      elementOffsetProductNavBar = $('.product-form').offset().top;
      distanceProductNavbar = (elementOffsetProductNavBar - scrollTop);
      if (distanceProductNavbar <= 0 && productNavBarShow == false) {
        $('.mobile-nav-bar.product-nav-bar').stop().animate({
          'bottom': '24px'
        }, 250);
        productNavBarShow = true;
      } else if (distanceProductNavbar > 0 && productNavBarShow == true) {
        $('.mobile-nav-bar.product-nav-bar').stop().animate({
          'bottom': '-64px'
        }, 250);
        productNavBarShow = false;
      }
    }
  });
  $(window).on('scroll', function() {
    scrollTop = $(window).scrollTop();

    if ($('.mobile-nav-bar.product-nav-bar').length > 0) {
      elementOffsetProductNavBar = $('.product-form').offset().top;
      distanceProductNavbar = (elementOffsetProductNavBar - scrollTop);
      if (distanceProductNavbar <= 0 && productNavBarShow == false) {
        $('.mobile-nav-bar.product-nav-bar').stop().animate({
          'bottom': '24px'
        }, 250);
        productNavBarShow = true;
      } else if (distanceProductNavbar > 0 && productNavBarShow == true) {
        $('.mobile-nav-bar.product-nav-bar').stop().animate({
          'bottom': '-64px'
        }, 250);
        productNavBarShow = false;
      }
    }
  });
  
  /* Sections */
  $('.section-reasons-to-love .image-texts .texts a[data-tab]').on('click', function() {
    var link = $(this);
    if (!link.hasClass('active')) {
      var tab = link.data('tab');
      $('.section-reasons-to-love .image-texts .texts a[data-tab].active, .section-reasons-to-love .dots a.active').removeClass('active');
      link.addClass('active');
      $('.section-reasons-to-love .image-texts .image img:not(.hidden)').addClass('hidden');
      $('.section-reasons-to-love .image-texts .image img[data-tab="' + tab + '"]').removeClass('hidden');
      $('.section-reasons-to-love .dots a[data-tab="' + tab + '"]').addClass('active');
    }
    return false;
  });
  $('.section-reasons-to-love .dots a').on('click', function() {
    var tab = $(this).data('tab');
    if (!$(this).hasClass('active')) {
      $('.section-reasons-to-love .image-texts .texts a[data-tab].active, .section-reasons-to-love .dots a.active').removeClass('active');
      $(this).addClass('active');
      $('.section-reasons-to-love .image-texts .image img:not(.hidden)').addClass('hidden');
      $('.section-reasons-to-love .image-texts .image img[data-tab="' + tab + '"]').removeClass('hidden');
      $('.section-reasons-to-love .image-texts .texts a[data-tab="' + tab + '"]').addClass('active');
    }
    return false;
  });

  $('.section-faq .faqs .faq .faq-question').on('click', function() {
    var faq = $(this).closest('.faq');
    if (faq.hasClass('active')) {
      faq.removeClass('active');
    } else {
      $('.section-faq .faqs .faq.active').removeClass('active');
      faq.addClass('active');
    }
  });
  
  colorSwatches();
  
  var cartDrawerContentMinusHeight = 0;
  if ($('.cart--drawer-announcement-bar').length > 0) {
    cartDrawerContentMinusHeight += $('.cart--drawer-announcement-bar').height();
  }
  if ($('.cart--drawer-header').length > 0) {
    cartDrawerContentMinusHeight += $('.cart--drawer-header').height();
  }
  $('.cart--drawer-content').css({
    'height': 'calc(100% - ' + cartDrawerContentMinusHeight + 'px)',
    'padding-bottom': ($('.cart--drawer-summary').height() + 26) + 'px'
  });
  
  if ($('.section-announcement-bar').length > 0) {
    var announcementBarPrice = Intl.NumberFormat(Shopify.locale, {
      style: 'currency',
      currency: Shopify.currency.active
    }).format((($('.section-announcement-bar .money').data('price') * Shopify.currency.rate) / 100));
    $('.section-announcement-bar .money').text(announcementBarPrice);
  }
  if ($('.cart--drawer-process').length > 0) {
    var freeShippingPrice = Intl.NumberFormat(Shopify.locale, {
      style: 'currency',
      currency: Shopify.currency.active
    }).format((($('.cart--drawer-free-shipping .money').data('price') * Shopify.currency.rate) / 100));
    $('.cart--drawer-free-shipping .money').text(freeShippingPrice);
  }
  
  if (free_shipping != '') {
	var shipping = 'Free';
	if (cart_total_price < free_shipping) {
	  shipping = 'Calculated at checkout';

	  $('.cart--drawer-free-shipping-success').removeClass('show');
	  $('.cart--drawer-free-shipping').removeClass('hide');
	  if ($('.announcement-bar-line').length > 0) {
		$('.announcement-bar-text-success').removeClass('show');
		$('.announcement-bar-text').removeClass('hide');
	  }

	  $('.cart--drawer-process-bar div').animate({
		'width': (100 - (((free_shipping - cart_total_price) * 100) / free_shipping)) + '%'
	  }, 500);
	  if ($('.section-announcement-bar').length > 0) {
		$('.announcement-bar-progress-bar div').animate({
		  'width': (100 - (((free_shipping - cart_total_price) * 100) / free_shipping)) + '%'
		}, 500);
	  }
	} else {
	  $('.cart--drawer-free-shipping').addClass('hide');
	  $('.cart--drawer-free-shipping-success').addClass('show');
	  if ($('.announcement-bar-line').length > 0) {
		$('.announcement-bar-text').addClass('hide');
		$('.announcement-bar-text-success').addClass('show');
	  }

	  $('.cart--drawer-process-bar div').animate({
		'width': '100%'
	  }, 500);
	  if ($('.section-announcement-bar').length > 0) {
		$('.announcement-bar-progress-bar div').animate({
		  'width': '100%'
		}, 500);
	  }
	}

	var freeShippingPriceLeft = Intl.NumberFormat(Shopify.locale, {
	  style: 'currency',
	  currency: Shopify.currency.active
	}).format((free_shipping - cart_total_price));
	$('.cart--drawer-free-shipping .money').text(freeShippingPriceLeft);
	if ($('.section-announcement-bar').length > 0) {
	  $('.announcement-bar-text .money').text(freeShippingPriceLeft);
	}
	$('.cart--drawer-summary-shipping').text(shipping);
  }
  
  if ($('.cart--drawer-you-may-also-like').data('shopify-recommendations') == true) {
    var pro_id = $('.cart--drawer-product:first-child').data('product-id');
    $.get('/recommendations/products.json?product_id=' + pro_id, function(results) {
	  $.each(results.products, function(k, v) {
		var exist = false;
		var optionsVariants = '';
		$.each(v.variants, function(k2, v2) {
		  if ($('.cart--drawer-product[data-product-variant-id="' + v2.id + '"]').length > 0 && exist == false) {
			exist = true;
		  }
		  if (v2.available == true && v2.title != 'Default Title') {
			optionsVariants += '<option value="' + v2.id + '">' + v2.title + '</option>';
		  }
		});
		if (exist == false) {
		  var productPrice = '';
		  if (v.compare_at_price_varies == true) {
			var product_price_min = Intl.NumberFormat(Shopify.locale, {
			  style: 'currency',
			  currency: Shopify.currency.active
			}).format((v.compare_at_price_min / 100));
			var product_price_max = Intl.NumberFormat(Shopify.locale, {
			  style: 'currency',
			  currency: Shopify.currency.active
			}).format((v.compare_at_price_max / 100));
			productPrice = product_price_min + ' - ' + product_price_max;
		  } else if (v.price_varies == true) {
			var product_price_min = Intl.NumberFormat(Shopify.locale, {
			  style: 'currency',
			  currency: Shopify.currency.active
			}).format((v.price_min / 100));
			var product_price_max = Intl.NumberFormat(Shopify.locale, {
			  style: 'currency',
			  currency: Shopify.currency.active
			}).format((v.price_max / 100));
			productPrice = product_price_min + ' - ' + product_price_max;
		  } else {
			var product_price = Intl.NumberFormat(Shopify.locale, {
			  style: 'currency',
			  currency: Shopify.currency.active
			}).format((v.price / 100));
			var product_old_price = 0;
			if (v.compare_at_price > 0) {
			  var product_old_price = Intl.NumberFormat(Shopify.locale, {
			  	style: 'currency',
				currency: Shopify.currency.active
			  }).format((v.compare_at_price / 100));
			}
			productPrice = product_price + (product_old_price > 0 ? '<span class="old"><span class="money">' + product_old_price + '</span></span>' : '');
		  }
		  $('.cart--drawer-you-may-also-like-scroller .swiper-wrapper').append('<div class="swiper-slide cart--drawer-product-big card-wrapper" data-product-id="' + v.variant_id + '">\
              <div class="card-wrapper-top">\
                <a href="/products/' + v.handle + '">\
                  <img src="' + v.featured_image + '" alt="' + v.title + '">\
                  <div class="cart--drawer-product-big-name">' + v.title + '</div>\
                  <div class="cart--drawer-product-big-price">' + productPrice + '</div>\
                </a>\
              </div>\
              <div class="card-wrapper-bottom">\
                ' + (optionsVariants != '' ? '<div class="card-wrapper-option">\
                <div class="product-form__input product-form__input--dropdown">\
                  <div class="select">\
                    <select class="select__select">' + optionsVariants + '</select>\
                    <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-caret" viewBox="0 0 10 6"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z" fill="currentColor"></svg>\
                  </div>\
                </div>\
              </div>\
              <a href="#" class="cart--drawer-product-big-button text-center">Select an Option</a>' : '') + '\
              <button type="button" data-add-id="' + v.variants[0].id + '" class="button"' + ((v.variants.length == 1 && v.variants[0].title == 'Default Title') ? '' : ' disabled="disabled"') + '>\
                <span>Add to Cart</span>\
                <div class="loading-overlay__spinner hidden">\
                  <svg aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">\
                    <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>\
                  </svg>\
                </div>\
              </button>\
            </div>\
          </div>');
        }
      });
      new Swiper('.cart--drawer-you-may-also-like-scroller', {
        slidesPerView: 'auto',
        spaceBetween: 12,
        freeMode: true,
        mousewheel: {
          forceToAxis: true
        }
      });
    });
  }
  /* End Sections */
  
});

function colorSwatches() {
  if ($('.color-picker').length > 0) {
    var assets_url = files_url.split('/?');
    $.getJSON(swatches, function(data) {
      $.each($('.color-picker'), function(k, v) {
        var colorPicker = $(v);
        var color = colorPicker.data('color');
        if (color != undefined) {
          color = color.toLowerCase();
          $.each(data.colors, function(k2, v2) {
            $.each(v2, function(colorName, colorCode) {
              colorName = colorName.toLowerCase();
              if (colorName == color) {
                var splitColorCode = colorCode.split('.');
                if (colorCode.indexOf('.') != -1 && splitColorCode.length == 2) {
                  $('span', colorPicker).css({
                    'background-color': '',
                    'background-image': 'url(' + assets_url[0] + '/' + colorCode + '?' + assets_url[1] + ')'
                  });
                } else {
                  $('span', colorPicker).css({
                    'background-image': '',
                    'background-color': colorCode
                  });
                }
              }
            });
          });
        }
      });
    });
  }
}

function addProduct(variant_id, quantity, product_id, collection_id, selling_plan, properties) {
  if (variant_id > 0 && quantity > 0) {
    var items = [
	  {
		quantity: quantity,
		id: variant_id,
		selling_plan: selling_plan,
        properties: (properties != '' ? p : {})
	  }
	];
    if (gift_product != null && $('.cart--drawer-product[data-product-variant-id="' + gift_product + '"]').length == 0) {
      if (gift_option == 'all_purchases') {
        items.push({
          quantity: 1,
          id: gift_product
        });
      } else if (gift_option == 'specific_parameters') {
        if (gift_triggers_product != null && gift_triggers_product == product_id) {
		  items.push({
            quantity: 1,
            id: gift_product
          });
        } else if (gift_triggers_collection != null && collection_id.indexOf(gift_triggers_collection + ',') != -1) {
          items.push({
            quantity: 1,
            id: gift_product
          });
        } else if (customer_tags.length > 0 && gift_customer_tags != '') {
          $.each(customer_tags, function(k, v) {
            if (gift_customer_tags.indexOf(v) != -1) {
              items.push({
                quantity: 1,
                id: gift_product
              });
              return false;
            }
          });
        }
      }
    }
    $.ajax({
      type: 'POST',
      url: '/cart/add.js',
      data: {
        items: items
      },
      dataType: 'json',
      success: function(pro) {
        $.ajax({
          type: 'GET',
          url: '/cart.js',
          dataType: 'json',
          success: function(data) {
            $('.cart--drawer-products .cart--drawer-product').remove();
            var zeroAmountItems = 0;
            var discountsName = [];
            var discountsPrice = [];
            $.each(data.items, function(k, v) {
              if (v.discounts.length > 0) {
                $.each(v.discounts, function(dk, dv) {
                  var inArray = $.inArray(dv.title, discountsName);
                  if(inArray !== -1) {
                    discountsPrice[inArray] += dv.amount;
                  } else {
                    discountsName.push(dv.title);
                    discountsPrice.push(dv.amount);
                  }
                });
              }
              var product_price = Intl.NumberFormat(Shopify.locale, {
                style: 'currency',
                currency: Shopify.currency.active
              }).format((v.price / 100));
              var product_discounted_price = Intl.NumberFormat(Shopify.locale, {
                style: 'currency',
                currency: Shopify.currency.active
              }).format((v.discounted_price / 100));
              var variant_options = v.title.replace(v.product_title, '').replace(' - ', '');
              var properties = '';
              if (v.properties != null) {
                $.each(v.properties, function(k, v) {
                  properties += '<p>' + k + ': ' + v + '</p>';
                });
              }
              $('.cart--drawer-products').prepend('<div class="cart--drawer-product" data-key="' + v.key + '" data-product-variant-id="' + v.variant_id + '" data-product-id="' + v.id + '">\
                <div class="cart--drawer-product-image">\
                  <a href="' + v.url + '">\
                    <img src="' + v.image + '" alt="' + v.title + '">\
                  </a>\
                </div>\
                <div class="cart--drawer-product-info">\
                  <a href="/cart/change?id=' + v.key + '&amp;quantity=0" class="cart--drawer-product-remove">\
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">\
                      <path d="M11.89 6.7L10 8.59L8.11 6.7C7.72 6.31 7.09 6.31 6.7 6.7C6.31 7.09 6.31 7.72 6.7 8.11L8.59 10L6.7 11.89C6.31 12.28 6.31 12.91 6.7 13.3C7.09 13.69 7.72 13.69 8.11 13.3L10 11.41L11.89 13.3C12.28 13.69 12.91 13.69 13.3 13.3C13.69 12.91 13.69 12.28 13.3 11.89L11.41 10L13.3 8.11C13.69 7.72 13.69 7.09 13.3 6.7C12.91 6.32 12.27 6.32 11.89 6.7ZM10 0C4.47 0 0 4.47 0 10C0 15.53 4.47 20 10 20C15.53 20 20 15.53 20 10C20 4.47 15.53 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18Z" fill="black"></path>\
                    </svg>\
                  </a>\
                  <div class="cart--drawer-product-name">\
                    <a href="' + v.url + '">' + v.product_title + '</a>\
                  </div>\
			  	  ' + ((variant_options != '' || properties != '') ? '<div class="cart--drawer-product-variant">' + (variant_options != '' ? variant_options : '') + (properties != '' ? properties : '') + '</div>' : '') + '\
                  <div class="cart--drawer-product-price">\
                  	' + (v.discounted_price != v.price ? '<span class="old"><span class="money">' + product_price + '</span></span> <span class="money">' + product_discounted_price + '</span>' : '<span class="money">' + product_price + '</span>') + '\
                  </div>\
                  <div class="cart--drawer-product-quantity">\
					<div>\
                      <button type="button" class="quantity-minus">\
                        <svg width="10" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">\
                          <path d="M8.99992 1.66683H0.999919C0.633252 1.66683 0.333252 1.36683 0.333252 1.00016C0.333252 0.633496 0.633252 0.333496 0.999919 0.333496H8.99992C9.36659 0.333496 9.66659 0.633496 9.66659 1.00016C9.66659 1.36683 9.36659 1.66683 8.99992 1.66683Z" fill="black"></path>\
                        </svg>\
                      </button>\
                      <input type="text" name="quantity" value="' + v.quantity + '" min="1" readonly="readonly">\
                      <button type="button" class="quantity-plus">\
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">\
                          <path d="M8.99992 5.66683H5.66659V9.00016C5.66659 9.36683 5.36659 9.66683 4.99992 9.66683C4.63325 9.66683 4.33325 9.36683 4.33325 9.00016V5.66683H0.999919C0.633252 5.66683 0.333252 5.36683 0.333252 5.00016C0.333252 4.6335 0.633252 4.3335 0.999919 4.3335H4.33325V1.00016C4.33325 0.633496 4.63325 0.333496 4.99992 0.333496C5.36659 0.333496 5.66659 0.633496 5.66659 1.00016V4.3335H8.99992C9.36659 4.3335 9.66659 4.6335 9.66659 5.00016C9.66659 5.36683 9.36659 5.66683 8.99992 5.66683Z" fill="black"></path>\
                        </svg>\
                      </button>\
					</div>\
                  </div>\
                </div>\
              </div>');
              
              if ($('.cart--drawer-announcement-bar').length > 0 && $('.cart--drawer-announcement-bar').data('zero-amount-items') == true && v.discounted_price == 0) {
                zeroAmountItems++;
              }
            });

            $('.header__icon--cart span, .cart--drawer-count').text(data.item_count);

            var total_price = data.total_price / 100;
            var total = Intl.NumberFormat(Shopify.locale, {
              style: 'currency',
              currency: Shopify.currency.active
            }).format(total_price);
            $('.cart--drawer-summary-subtotal').text(total);
            
            if ($('.cart--drawer-announcement-bar').length > 0 && $('.cart--drawer-announcement-bar').data('type') == 'dollar') {
              var amountLeft = (parseInt($('.cart--drawer-announcement-bar').data('threshold')) * 100) - data.total_price;
              if (amountLeft > 0) {
                var amountLeft = Intl.NumberFormat(Shopify.locale, {
                  style: 'currency',
                  currency: Shopify.currency.active
                }).format((amountLeft / 100));
                $('.cart--drawer-announcement-bar .cart-drawer-dollar').text(amountLeft);
              } else {
                $('.cart--drawer-announcement-bar').text('You got ' + $('.cart--drawer-announcement-bar').data('discount') + '!');
              }
            } else if ($('.cart--drawer-announcement-bar').length > 0 && $('.cart--drawer-announcement-bar').data('type') == 'items') {
              var itemsLeft = parseInt($('.cart--drawer-announcement-bar').data('threshold')) - (data.item_count - zeroAmountItems);
              if (itemsLeft > 0) {
                $('.cart--drawer-announcement-bar .cart-drawer-item').text(itemsLeft);
              } else {
                $('.cart--drawer-announcement-bar').text('You got ' + $('.cart--drawer-announcement-bar').data('discount') + '!');
              }
            }

            if ($('.cart--drawer-free-shipping').length > 0) {
              var shipping = 'Free';
              if (total_price < free_shipping) {
                shipping = 'Calculated at checkout';

                $('.cart--drawer-free-shipping-success').removeClass('show');
                $('.cart--drawer-free-shipping').removeClass('hide');
                if ($('.announcement-bar-line').length > 0) {
                  $('.announcement-bar-text-success').removeClass('show');
                  $('.announcement-bar-text').removeClass('hide');
                }

                $('.cart--drawer-process-bar div').animate({
                  'width': (100 - (((free_shipping - total_price) * 100) / free_shipping)) + '%'
                }, 500);
                if ($('.section-announcement-bar').length > 0) {
                  $('.announcement-bar-progress-bar div').animate({
                    'width': (100 - (((free_shipping - total_price) * 100) / free_shipping)) + '%'
                  }, 500);
                }
              } else {
                $('.cart--drawer-free-shipping').addClass('hide');
                $('.cart--drawer-free-shipping-success').addClass('show');
                if ($('.announcement-bar-line').length > 0) {
                  $('.announcement-bar-text').addClass('hide');
                  $('.announcement-bar-text-success').addClass('show');
                }

                $('.cart--drawer-process-bar div').animate({
                  'width': '100%'
                }, 500);
                if ($('.section-announcement-bar').length > 0) {
                  $('.announcement-bar-progress-bar div').animate({
                    'width': '100%'
                  }, 500);
                }
              }

              var freeShippingPriceLeft = Intl.NumberFormat(Shopify.locale, {
                style: 'currency',
                currency: Shopify.currency.active
              }).format((free_shipping - total_price));
              $('.cart--drawer-free-shipping .money').text(freeShippingPriceLeft);
              if ($('.section-announcement-bar').length > 0) {
                $('.announcement-bar-text .money').text(freeShippingPriceLeft);
              }
              $('.cart--drawer-summary-shipping').text(shipping);
            }
            
            $('.cart--drawer-summary-prices .discounts').remove();
            if (discountsName.length > 0) {
              $.each(discountsName, function(dk, dv) {
                var discount_price = Intl.NumberFormat(Shopify.locale, {
                  style: 'currency',
                  currency: Shopify.currency.active
                }).format((discountsPrice[dk] / 100));
                
                $('<ul class="discounts list-unstyled" role="list" aria-label="Discount">\
                  <li class="discounts__discount discounts__discount--end">\
                  <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-discount color-foreground-text" viewBox="0 0 12 12">\
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7 0h3a2 2 0 012 2v3a1 1 0 01-.3.7l-6 6a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4l6-6A1 1 0 017 0zm2 2a1 1 0 102 0 1 1 0 00-2 0z" fill="currentColor"></path>\
                  </svg>\
                  ' + dv + ' (-' + discount_price + ')\
                  </li>\
                </ul>').insertBefore('.cart--drawer-summary-prices p');
              });
            }

            if ($('.cart--drawer-you-may-also-like').length > 0) {
              if ($('.cart--drawer-you-may-also-like').hasClass('hidden')) {
                $('.cart--drawer-you-may-also-like, .cart--drawer-you-may-also-like-title').removeClass('hidden');
              }
              $('.cart--drawer-you-may-also-like-scroller .swiper-wrapper').text('');
              if ($('.cart--drawer-you-may-also-like').data('shopify-recommendations') == true) {
                $.get('/recommendations/products.json?product_id=' + pro.items[0].product_id, function(results) {
                  $.each(results.products, function(k, v) {
                    if (v.available == true) {
                      var exist = false;
                      var optionsVariants = '';
                      $.each(v.variants, function(k2, v2) {
                        if ($('.cart--drawer-product[data-product-variant-id="' + v2.id + '"]').length > 0 && exist == false) {
                          exist = true;
                        }
                        if (v2.available == true && v2.title != 'Default Title') {
                          optionsVariants += '<option value="' + v2.id + '">' + v2.title + '</option>';
                        }
                      });
                      if (exist == false) {
                        var productPrice = '';
                        if (v.compare_at_price_varies == true) {
                          var product_price_min = Intl.NumberFormat(Shopify.locale, {
                            style: 'currency',
                            currency: Shopify.currency.active
                          }).format((v.compare_at_price_min / 100));
                          var product_price_max = Intl.NumberFormat(Shopify.locale, {
                            style: 'currency',
                            currency: Shopify.currency.active
                          }).format((v.compare_at_price_max / 100));
                          productPrice = product_price_min + ' - ' + product_price_max;
                        } else if (v.price_varies == true) {
                          var product_price_min = Intl.NumberFormat(Shopify.locale, {
                            style: 'currency',
                            currency: Shopify.currency.active
                          }).format((v.price_min / 100));
                          var product_price_max = Intl.NumberFormat(Shopify.locale, {
                            style: 'currency',
                            currency: Shopify.currency.active
                          }).format((v.price_max / 100));
                          productPrice = product_price_min + ' - ' + product_price_max;
                        } else {
                          var product_price = Intl.NumberFormat(Shopify.locale, {
                            style: 'currency',
                            currency: Shopify.currency.active
                          }).format((v.price / 100));
                          var product_old_price = 0;
                          if (v.compare_at_price > 0) {
                            product_old_price = Intl.NumberFormat(Shopify.locale, {
                              style: 'currency',
                              currency: Shopify.currency.active
                            }).format((v.compare_at_price / 100));
                          }
                          productPrice = product_price + (product_old_price != 0 ? ' <span class="old"><span class="money">' + product_old_price + '</span></span>' : '');
                        }
                        $('.cart--drawer-you-may-also-like-scroller .swiper-wrapper').append('<div class="swiper-slide cart--drawer-product-big card-wrapper" data-product-id="' + v.variant_id + '">\
                          <div class="card-wrapper-top">\
                            <a href="/products/' + v.handle + '">\
                              <img src="' + v.featured_image + '" alt="' + v.title + '">\
                              <div class="cart--drawer-product-big-name">' + v.title + '</div>\
                              <div class="cart--drawer-product-big-price">' + productPrice + '</div>\
                            </a>\
                          </div>\
                          <div class="card-wrapper-bottom">\
                            ' + (optionsVariants != '' ? '<div class="card-wrapper-option">\
                              <div class="product-form__input product-form__input--dropdown">\
                                <div class="select">\
                                  <select class="select__select">' + optionsVariants + '</select>\
                                  <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-caret" viewBox="0 0 10 6"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z" fill="currentColor"></svg>\
                                </div>\
                              </div>\
                            </div>\
                            <a href="#" class="cart--drawer-product-big-button text-center">Select an Option</a>' : '') + '\
                            <button type="button" data-add-id="' + v.variants[0].id + '" class="button"' + ((v.variants.length == 1 && v.variants[0].title == 'Default Title') ? '' : ' disabled="disabled"') + '>\
                              <span>Add to Cart</span>\
                              <div class="loading-overlay__spinner hidden">\
                                <svg aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">\
                                  <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>\
                                </svg>\
                              </div>\
                            </button>\
                          </div>\
                        </div>');
                      }
                    }
                  });
                  new Swiper('.cart--drawer-you-may-also-like-scroller', {
                    slidesPerView: 'auto',
                    spaceBetween: 12,
                    freeMode: true,
                    mousewheel: {
                      forceToAxis: true
                    }
                  });
                });
              } else {
                var i = 1;
                $.each(products, function(k, v) {
                  if (i < 5 && v.available == true && v.tags.indexOf('Upsell Eligible') != -1) {
                    var exist = false;
                    var optionsVariants = '';
                    if (v.available == true) {
                      $.each(v.variants, function(k2, v2) {
                        if ($('.cart--drawer-product[data-product-variant-id="' + v2.id + '"]').length > 0 && exist == false) {
                          exist = true;
                        }
                        if (v2.available == true && v2.title != 'Default Title') {
                          optionsVariants += '<option value="' + v2.id + '">' + v2.title + '</option>';
                        }
                      });
                    }
                    if (exist == false) {
                      var productPrice = '';
                      if (v.compare_at_price_varies == true) {
                        var product_price_min = Intl.NumberFormat(Shopify.locale, {
                          style: 'currency',
                          currency: Shopify.currency.active
                        }).format((v.compare_at_price_min / 100));
                        var product_price_max = Intl.NumberFormat(Shopify.locale, {
                          style: 'currency',
                          currency: Shopify.currency.active
                        }).format((v.compare_at_price_max / 100));
                        productPrice = product_price_min + ' - ' + product_price_max;
                      } else if (v.price_varies == true) {
                        var product_price_min = Intl.NumberFormat(Shopify.locale, {
                          style: 'currency',
                          currency: Shopify.currency.active
                        }).format((v.price_min / 100));
                        var product_price_max = Intl.NumberFormat(Shopify.locale, {
                          style: 'currency',
                          currency: Shopify.currency.active
                        }).format((v.price_max / 100));
                        productPrice = product_price_min + ' - ' + product_price_max;
                      } else {
                        var product_price = Intl.NumberFormat(Shopify.locale, {
                          style: 'currency',
                          currency: Shopify.currency.active
                        }).format((v.price / 100));
                        var product_old_price = 0;
                        if (v.compare_at_price > 0) {
                          product_old_price = Intl.NumberFormat(Shopify.locale, {
                            style: 'currency',
                            currency: Shopify.currency.active
                          }).format((v.compare_at_price / 100));
                        }
                        productPrice = product_price + (product_old_price != 0 ? ' <span class="old"><span class="money">' + product_old_price + '</span></span>' : '');
                      }
                      $('.cart--drawer-you-may-also-like-scroller .swiper-wrapper').append('<div class="swiper-slide cart--drawer-product-big card-wrapper" data-product-id="' + v.variant_id + '">\
						<div class="card-wrapper-top">\
                          <a href="/products/' + v.handle + '">\
                            <img src="' + v.featured_image + '" alt="' + v.title + '">\
                            <div class="cart--drawer-product-big-name">' + v.title + '</div>\
                            <div class="cart--drawer-product-big-price">' + productPrice + '</div>\
                          </a>\
						</div>\
						<div class="card-wrapper-bottom">\
                          ' + (optionsVariants != '' ? '<div class="card-wrapper-option">\
                            <div class="product-form__input product-form__input--dropdown">\
                              <div class="select">\
                                <select class="select__select">' + optionsVariants + '</select>\
                                <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-caret" viewBox="0 0 10 6"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z" fill="currentColor"></svg>\
                              </div>\
                            </div>\
                          </div>\
                          <a href="#" class="cart--drawer-product-big-button text-center">Select an Option</a>' : '') + '\
                          <button type="button" data-add-id="' + v.variants[0].id + '" class="button"' + ((v.variants.length == 1 && v.variants[0].title == 'Default Title') ? '' : ' disabled="disabled"') + '>\
                            <span>Add to Cart</span>\
                            <div class="loading-overlay__spinner hidden">\
                              <svg aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">\
                                <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>\
                              </svg>\
                            </div>\
                          </button>\
						</div>\
                      </div>');
                      i++;
                    }
                  }
                });
                new Swiper('.cart--drawer-you-may-also-like-scroller', {
                  slidesPerView: 'auto',
                  spaceBetween: 12,
                  freeMode: true,
                  mousewheel: {
                    forceToAxis: true
                  }
                });
              }
            }
            
            var cartDrawerContentMinusHeight = 0;
            if ($('.cart--drawer-announcement-bar').length > 0) {
              cartDrawerContentMinusHeight += $('.cart--drawer-announcement-bar').height();
            }
            if ($('.cart--drawer-header').length > 0) {
              cartDrawerContentMinusHeight += $('.cart--drawer-header').height();
            }
            $('.cart--drawer-content').css({
              'height': 'calc(100% - ' + cartDrawerContentMinusHeight + 'px)',
              'padding-bottom': ($('.cart--drawer-summary').height() + 26) + 'px'
            });
          }
        });
      }
    });
  }
}
