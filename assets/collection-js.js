$(document).ready(function() {
  
  $('.collection-filters a').on('click', function() {
    var link = $(this);
    var bar = $('.collection-filters-bar');
    if (bar.hasClass('active')) {
	  link.removeClass('active');
      bar.stop().animate({
        left: '-385px'
      }, 250, function() {
        $(this).removeClass('active');
      });
    } else {
      link.addClass('active');
      bar.stop().animate({
        left: 0
      }, 500, function() {
        $(this).addClass('active');
      });
    }
    return false;
  });
  $('.collection-sort a').on('click', function() {
    var link = $(this);
    var bar = $('.collection-sort-bar');
    if (bar.hasClass('active')) {
      link.removeClass('active');
      bar.stop().animate({
        right: '-285px'
      }, 500, function() {
        $(this).removeClass('active');
      });
    } else {
      link.addClass('active');
      bar.stop().animate({
        right: 0
      }, 500, function() {
        $(this).addClass('active');
      });
    }
    return false;
  });
  
  var scrollTop = $(window).scrollTop();
  var collectionFiltersBarOffset = $('.collection-line .collection-filters-bar').offset().top;
  if (scrollTop >= collectionFiltersBarOffset) {
    $('.collection-line .collection-filters-bar').addClass('sticky');
  }
  $(window).on('scroll', function() {
    scrollTop = $(window).scrollTop();
    if (scrollTop >= collectionFiltersBarOffset) {
      $('.collection-line .collection-filters-bar').addClass('sticky');
    } else {
      $('.collection-line .collection-filters-bar').removeClass('sticky');
    }
  });

  $('.collection-line .collection-filters-bar .collection-filters-tab .collection-filters-tab-heading').on('click', function() {
    var tab = $(this).closest('.collection-filters-tab');
    tab.toggleClass('open');
    $('.collection-filters-tab-content', tab).slideToggle('normal');
  });
  $('.collection-line .collection-filters-bar .collection-filters-tab .collection-filters-tab-content .collection-filters-tab-content-value').on('click', function() {
    var checkbox = $('.checkbox', $(this));
    checkbox.toggleClass('checked');
  });
  $('.collection-filters-bar .apply-filters').on('click', function() {
    var sort_by = '';
    if (window.location.href.indexOf('sort_by=') != -1) {
      var match = window.location.href.match(/sort_by=([^&]+)/);
      if (match != null) {
      	sort_by = match[1];
      }
    }
    var uri = collection_uri + '?sort_by=' + sort_by + '&filter.v.price.gte=' + $('.filter-min-price').val() + '&filter.v.price.lte=' + $('.filter-max-price').val();
    var checked = $('.collection-filters-bar .checkbox.checked');
    $.each(checked, function(k, v) {
      var filter = $(v).closest('.collection-filters-tab-content-value');
      uri += '&' + filter.data('param') + '=' + filter.data('value');
    });
    window.location.href = uri;
    return false;
  });

  if ($('#price-range').length > 0) {
    $('#price-range').slider({
      range: true,
      min: $('#price-range').data('min'),
      max: $('#price-range').data('max'),
      values: [$('#price-range').data('current-min'), $('#price-range').data('current-max')],
      slide: function(event, ui) {
        $('.collection-filters-prices .collection-filters-prices-input:first-child input').val(ui.values[0]);
        $('.collection-filters-prices .collection-filters-prices-input:last-child input').val(ui.values[1]);
      }
    });
    $('.collection-filters-prices .collection-filters-prices-input:first-child input').val($('#price-range').slider('values', 0));
    $('.collection-filters-prices .collection-filters-prices-input:last-child input').val($('#price-range').slider('values', 1));
  }
  
});
