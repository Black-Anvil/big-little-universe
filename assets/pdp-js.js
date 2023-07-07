$(document).ready(function() {
  
  $('.product__description--collapse').on('click', function() {
    var desc = $('.product__description');
    if (desc.hasClass('product__description--close')) {
      desc.stop().slideDown(500);
      desc.removeClass('product__description--close');
    } else {
      desc.stop().slideUp(500);
      desc.addClass('product__description--close');
    }
    return false;
  });
  
  $('.upsell-product select').on('change', function() {
    var id = $(this).val();
    var upsellProduct = $(this).closest('.upsell-product');
    $('[name="upsell"]', upsellProduct).val(id);
  });

  $('.section-add-to-cart-bar .button').on('click', function() {
    var $this = $(this);
    $('.product-form__buttons .product-form__submit').trigger('click');
    setTimeout(function() {
      $('.loading-overlay__spinner', $this).addClass('hidden');
      $('span', $this).removeClass('hidden');
    }, 1000);
    return false;
  });
  
  $('.section-add-to-cart-bar').css('height', $('.section-add-to-cart-bar').height());
  if ($('.section-add-to-cart-bar').length > 0) {
    $('.section-add-to-cart-bar .add-to-cart-bar-line').sticky({
      topSpacing: 0
    });
  }
  $('.section-add-to-cart-bar .links a').on('click', function() {
    var href = $(this).attr('href');
    if (href == '#start') {
      $('html, body').animate({
        scrollTop: 0
      }, 1000);
      return false;
    } else if (href.indexOf('#') != -1 && $(href).length > 0) {
      $('html, body').animate({
        scrollTop: ($(href).offset().top - 72)
      }, 1000);
      return false;
    }
  });
  
  var swiperMedia;
  if ($('.product__images-thumbnails').length > 0) {
    swiperMedia = new Swiper('.swiper-media', {
      slidesPerView: 'auto',
      spaceBetween: 12,
      freeMode: true,
      autoHeight: true, 
      mousewheel: {
        forceToAxis: true
      },
      breakpoints: {
        990: {
          slidesPerView: 1,
          spaceBetween: 0,
          freeMode: false,
          mousewheel: false,
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }
        }
      }
    });
    swiperMedia.on('slideChange', function() {
      var index = swiperMedia.realIndex;
      $('.product__images-thumbnails a').removeClass('active');
      $('.product__images-thumbnails a[data-index="' + index + '"]').addClass('active');
    });

    $('.product__images-thumbnails a').on('click', function() {
      var thumb = $(this);
      if (!thumb.hasClass('active')) {
        $('.product__images-thumbnails a').removeClass('active');
        thumb.addClass('active');
        var index = parseInt(thumb.data('index'));
        swiperMedia.slideTo(index);
      }
      return false;
    });
    $('.color-picker').on('click', function() {
      var image = $(this).data('image');
      if ($('.product__images-slider .swiper').length > 0) {
        var thumb = $('.product__images-thumbnails a[data-image="' + image + '"]');
        if (thumb.length > 0 && !thumb.hasClass('active')) {
          var index = parseInt(thumb.data('index'));
          swiperMedia.slideTo(index);
        }
      }
    });
  }
  window.swiperMedia = swiperMedia;
  
  if ($('.swiper-media-variant').length > 0) {
    $.each($('.swiper-media-variant'), function(k, v) {
      var swiperMediaVariantId = $(v).data('id');
      window['swiperMedia_' + swiperMediaVariantId] = new Swiper('.swiper-media-variant--' + swiperMediaVariantId, {
        slidesPerView: 'auto',
        spaceBetween: 12,
        freeMode: true,
        autoHeight: true, 
        mousewheel: {
          forceToAxis: true
        },
        breakpoints: {
          990: {
            slidesPerView: 1,
            spaceBetween: 0,
            freeMode: false,
            mousewheel: false,
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }
          }
        }
      });
      window['swiperMedia_' + swiperMediaVariantId].on('slideChange', function() {
      	var index = window['swiperMedia_' + swiperMediaVariantId].realIndex;
        $('.product__images-thumbnails-variant--' + swiperMediaVariantId + ' a').removeClass('active');
        $('.product__images-thumbnails-variant--' + swiperMediaVariantId + ' a[data-index="' + index + '"]').addClass('active');
      });
    });
  }
  
  if ($('.cart--drawer-you-may-also-like-scroller').length > 0) {
    new Swiper('.cart--drawer-you-may-also-like-scroller', {
      slidesPerView: 'auto',
      spaceBetween: 12,
      freeMode: true,
      mousewheel: {
        forceToAxis: true
      }
    });
  }
  
});
