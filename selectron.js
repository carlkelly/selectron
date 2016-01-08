// --------------------------------------------------------------------------
//            _           _                   
//   ___  ___| | ___  ___| |_ _ __ ___  _ __  
//  / __|/ _ \ |/ _ \/ __| __| '__/ _ \| '_ \ 
//  \__ \  __/ |  __/ (__| |_| | | (_) | | | |
//  |___/\___|_|\___|\___|\__|_|  \___/|_| |_|
//
// --------------------------------------------------------------------------
//  Version: 1.0
//   Author: Simon Sturgess
//  Website: dahliacreative.github.io/selectron
//     Docs: dahliacreative.github.io/selectron/docs
//     Repo: github.com/dahliacreative/selectron
//   Issues: github.com/dahliacreative/selectron/issues
// --------------------------------------------------------------------------

(function($) {

  $.fn.selectron = function() {
    
    // ----------------------------------------------------------------------
    // Check for touch events
    // ----------------------------------------------------------------------
    if (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0)) {
      var isTouch = true;
    }

    return this.each(function() {

      // --------------------------------------------------------------------
      // Build Options
      // --------------------------------------------------------------------
      populateOptions = function() {

        // If touch events
        if(isTouch) {
          return;
        }

        // Build Options
        select.find('option').each(function() {
          var selectOption = $(this),
              value = selectOption.val(),
              content = selectOption.text(),
              isDisabled = selectOption.prop('disabled'),
              isSelected = selectOption.prop('selected'),
              option = $('<li class="selectron__option" data-value="' + value + '">' + content + '</li>');

          // Disabled or selected
          option.toggleClass('selectron__option--is-disabled', isDisabled);
          option.toggleClass('selectron__option--is-selected', isSelected);

          // Event Listener
          option.on('click', function() {
            updateSelection($(this));
          });
          option.on('mouseenter', function() {
            updateHover($(this));
          });

          // Append to DOM
          options.append(option);
        });

        options.find('.selectron__option:first').addClass('selectron__option--is-hovered');

        updateTrigger();

      }

      // --------------------------------------------------------------------
      // Update Hover
      // --------------------------------------------------------------------
      updateHover = function(hovered) {
        hovered.addClass('selectron__option--is-hovered').siblings().removeClass('selectron__option--is-hovered');
      }

      // --------------------------------------------------------------------
      // Toggle Options
      // --------------------------------------------------------------------
      toggleOptions = function(e) {
        e.stopPropagation();
        if(!isTouch) {
          options.toggleClass('selectron__options--is-open');
        }  
        isOpen = trigger.toggleClass('selectron__trigger--is-open').hasClass('selectron__trigger--is-open');
      }

      // --------------------------------------------------------------------
      // Open Options
      // --------------------------------------------------------------------
      openOptions = function() {
        options.addClass('selectron__options--is-open');
        trigger.addClass('selectron__trigger--is-open');
        isOpen = true;
      }

      // --------------------------------------------------------------------
      // Close Options
      // --------------------------------------------------------------------
      closeOptions = function() {
        options.removeClass('selectron__options--is-open');
        trigger.removeClass('selectron__trigger--is-open');
        isOpen = false;
      }

      // --------------------------------------------------------------------
      // Update Selection
      // --------------------------------------------------------------------
      updateSelection = function(selected) {
        console.log(selected);
        var value = selected.data('value');
        selected.addClass('selectron__option--is-selected').siblings().removeClass('selectron__option--is-selected');
        updateTrigger();
        select.val(value).trigger('selectron.change');
      }

      // --------------------------------------------------------------------
      // Update Value
      // --------------------------------------------------------------------
      updateValue = function(value) {
        options.find('[data-value="' + value + '"]').addClass('selectron__option--is-selected').siblings().removeClass('selectron__option--is-selected');
        updateTrigger();
      }

      // --------------------------------------------------------------------
      // Update Trigger & Select
      // --------------------------------------------------------------------
      updateTrigger = function() {
        var selected = options.find('.selectron__option--is-selected'),
            content = selected.text(),
            value = selected.data('value'),
            isPlaceholder = value === "" ? true : false;

        trigger.html(content);
        trigger.toggleClass('selectron__trigger--is-filled', !isPlaceholder);
      }

      // --------------------------------------------------------------------
      // Handle Key Strokes
      // --------------------------------------------------------------------
      handleKeyStrokes = function(e) {
        var hovered = options.find('.selectron__option--is-hovered');

        if(!isOpen && e.which != 32) {
          return false;
        }

        if(e.which === 32) {
          if(!isOpen) {
            openOptions();
          } else {
            closeOptions();
          }
        }

        if(e.which === 13) {
          closeOptions();
          updateSelection(hovered);
        }

        if(e.which === 38 || e.which === 40) {
          var nextElement;

          if(e.which === 40) {
              nextElement = hovered.is(':last-child') ? options.find('.selectron__option:first-child') : hovered.next();
          } else if(e.which === 38) {
              nextElement = hovered.is(':first-child') ? options.find('.selectron__option:last-child') : hovered.prev();
          }

          updateHover(nextElement);
        }

        if((e.which >= 48 && e.which <= 57) || (e.which >= 65 && e.which <= 90) || e.which === 8) {
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(clearSearchTerm, 500);
          searchTerm += String.fromCharCode(e.which).toLowerCase();
          optCount = options.find('li').length + 1;
          console.log(searchTerm)
          for(var i = 1; i < optCount; i ++) {
            var current = options.find('li:nth-child(' + i + ')'),
                text = current.text().toLowerCase();
            if(text.indexOf(searchTerm) >= 0) {
              current.addClass('selectron__option--is-hovered').siblings().removeClass('selectron__option--is-hovered');
              return;
            }
          }
        }

      }

      // --------------------------------------------------------------------
      // Clear Search Term
      // --------------------------------------------------------------------
      clearSearchTerm = function() {
        searchTerm = '';
      }

      // --------------------------------------------------------------------
      // Initialization
      // --------------------------------------------------------------------
      var select = $(this), wrapper, trigger, options, isDisabled, searchTerm = '', searchTimeout, isOpen = false;
    
      // If already initialized
      if(select.hasClass('selectron__select') || select[0].tagName !== 'SELECT') {
        return;
      }

      // If disabled
      isDisabled = select.prop('disabled');

      // Build DOM
      wrapper = $('<div class="selectron"/>');
      trigger = $('<button class="selectron__trigger">');
      options = $('<ul class="selectron__options"/>');
      select.removeClass('selectron').addClass('selectron__select');
      if(select.hasClass('selectron--dark')) {
        select.removeClass('selectron--dark');
        wrapper.addClass('selectron--dark');
      }
      select.replaceWith(wrapper);
      wrapper.append(select, trigger, options);
      wrapper.toggleClass('selectron__disabled', isDisabled);

      // Event Listeners
      trigger.on('click', toggleOptions);
      $(document).on('click', closeOptions);
      trigger.on('keyup', handleKeyStrokes);
      trigger.on('keydown', function(e) {
        e.preventDefault();
      });

      select.on('selectron.update', function() {
        options.empty();
        return populateOptions();
      });

      select.on('change', function() {
        var value = $(this).val();
        updateValue(value);
      });

      // Build options
      return populateOptions();

    });

  }

})(jQuery);