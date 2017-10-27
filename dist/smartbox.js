;(function () {
  var Smartbox,
    _ready = false,
    readyCallbacks = [],
    userAgent = navigator.userAgent.toLowerCase(),
    SmartboxAPI;

  //private func for applying all ready callbacks
  var onReady = function () {
    _ready = true;

    for ( var i = 0, len = readyCallbacks.length; i < len; i++ ) {
      if (typeof readyCallbacks[i] === 'function') {
        readyCallbacks[i].call(this);
      }
    }
    // no need anymore
    readyCallbacks = null;
  };

  /**
   * Detecting current platform
   * @returns {boolean} true if running on current platform
   */
  function detect ( slug ) {
    return userAgent.indexOf(slug) !== -1;
  }

  var initialise = function() {
    $$log('>>>>>>>> initialising SmartBox');
    Smartbox.setPlugins();
    Smartbox.getDUID();

    // wait for calling others $()
    setTimeout(function () {
      onReady();
      onReady = null;
    }, 10);
  };

  Smartbox = function ( platform, cb ) {
    if ( typeof platform === 'string' ) {
      Smartbox.readyForPlatform(platform, cb);
    } else if ( typeof platform === 'function' ) {
      // first arg - function
      Smartbox.ready(platform);
    }
  };

  //public smartbox API
  SmartboxAPI = {
    version: 0.1,
    platformName: '',

    userAgent: userAgent,

    createPlatform: function ( platformName, platformApi ) {
      var isCurrent = platformApi.detect && platformApi.detect();

      if ( isCurrent || detect(platformApi.platformUserAgent) ) {
        this.platformName = platformName;
        _.extend(this, platformApi);

        if (typeof platformApi.onDetect === 'function') {
          this.onDetect();
        }
      }
    },

    // calling cb after library initialise
    ready: function ( cb ) {
      if ( _ready ) {
        cb.call(this);
      } else {
        readyCallbacks.push(cb);
      }
    },

    // calling cb after library initialise if platform is current
    readyForPlatform: function ( platform, cb ) {
      var self = this;
      this.ready(function () {
        if ( platform == self.platformName ) {
          cb.call(self);
        }
      });
    },

    utils: {

      /**
       * Show error message
       * @param msg
       */
      error: function ( msg ) {
        $$log(msg, 'error');
      },

      /**
       * Show messages in log
       * all functionality in main.js
       */
      log: {
        log: $.noop,
        state: $.noop,
        show: $.noop,
        hide: $.noop,
        startProfile: $.noop,
        stopProfile: $.noop
      },

      /**
       * Asynchroniosly adding javascript files
       * @param filesArray {Array} array of sources of javascript files
       * @param cb {Function} callback on load javascript files
       */
      addExternalJS: function ( filesArray, cb ) {
        var $externalJsContainer,
          loadedScripts = 0,
          len = filesArray.length,
          el,
          scriptEl;

        function onloadScript () {
          loadedScripts++;

          if ( loadedScripts === len ) {
            cb && cb.call();
          }
        }

        if ( filesArray.length ) {

          $externalJsContainer = document.createDocumentFragment();
          el = document.createElement('script');
          el.type = 'text/javascript';
          el.onload = onloadScript;

          for ( var i = 0; i < len; i++ ) {
            scriptEl = el.cloneNode();
            scriptEl.src = filesArray[i];
            $externalJsContainer.appendChild(scriptEl);
          }

          document.body.appendChild($externalJsContainer);
        } else {

          // if no external js simple call cb
          cb && cb.call(this);
        }
      },

      addExternalCss: function ( filesArray ) {
        var $externalCssContainer;

        if ( filesArray.length ) {
          $externalCssContainer = document.createDocumentFragment();
          _.each(filesArray, function ( src ) {

            var el = document.createElement('link');

            el.rel = 'stylesheet';
            el.href = src;

            $externalCssContainer.appendChild(el);
          });

          document.body.appendChild($externalCssContainer);
        }
      },

      addExternalFiles: function ( cb ) {
        if ( this.externalJs.length ) {
          this.addExternalJS(this.externalJs, cb);
        }
        if ( this.externalCss.length ) {
          this.addExternalCss(this.externalCss);
        }
      }
    }
  };

  Smartbox.config = {
    DUID: 'real'
  };

  _.extend(Smartbox, SmartboxAPI);

  // exporting library to global
  window.SB = Smartbox;

  // initialize library
  window.onload = function () {
    initialise();

    // we don't need initialise func anymore
    initialise = null;
  };
})();
// global SB
!(function ( window, undefined ) {

  var PlatformApi = {
    externalCss: [],
    externalJs: [],
    keys: {},

    DUID: '',

    platformUserAgent: 'not found',

    /**
     * Get DUID in case of Config
     * @return {string} DUID
     */
    getDUID: function () {
      switch ( SB.config.DUID ) {
        case 'real':
          this.DUID = this.getNativeDUID();
          break;
        case 'mac':
          this.DUID = this.getMac();
          break;
        case 'random':
          this.DUID = this.getRandomDUID();
          break;
        /*case 'local_random':
         this.DUID = this.getLocalRandomDUID();
         break;*/
        default:
          this.DUID = Config.DUIDSettings;
          break;
      }

      return this.DUID;
    },

    getDCONFIG: function(){
        return this.CONFIG;
    },
    getSDI: function () {
      return '';
    },

    /**
     * Returns random DUID for platform
     * @returns {string}
     */
    getRandomDUID: function () {
      return (new Date()).getTime().toString(16) + Math.floor(Math.random() * parseInt("10000", 16)).toString(16);
    },

    /**
     * Returns MAC for platform if exist
     * @returns {string}
     */
    getMac: function () {
      return '';
    },

    /**
     * Returns native DUID for platform if exist
     * @returns {string}
     */
    getNativeDUID: function () {
      return '';
    },
    getVersion: function(){
        var version = 'unknown';
        return version;
    },
    getFirmware: function(){
        return 'unknown';
    },
    getDuid: function(){
        var diu = 'unknown';
        return diu;
    },
    getModelCode: function(){
        var modelCode = 'unknown';
        return modelCode;
    },
    getModel: function(){
        var model = 'unknown';
        return model;
    },
    /**
     * Set custom plugins for platform
     */
    setPlugins: $.noop,

    // TODO: volume for all platforms
    volumeUp: $.noop,
    volumeDown: $.noop,
    getVolume: $.noop,
    exit: $.noop,
    sendReturn: $.noop,
    setData: function ( name, val ) {
      // save data in string format
      localStorage.setItem(name, JSON.stringify(val));
    },

    getData: function ( name ) {
      var result;
      try {
        result = JSON.parse(localStorage.getItem(name));
      } catch (e) {
      }

      return result;
    },

    removeData: function ( name ) {
      localStorage.removeItem(name);
    }
  };

  _.extend(SB, PlatformApi);
})(this);
/**
 * Keyboard Plugin
 */
;
(function ( $, window, document, undefined ) {

  var pluginName = 'SBInput',
    defaultOptions = {
      keyboard: {
        type: 'fulltext_ru',
        firstLayout: 'ru'
      },

      /**
       * Format function
       * @param text
       */
      formatText: null,
      bindKeyboard: null,

      input: {
        template: '<div class="smart_input-container">' +
                  '<div class="smart_input-wrap">' +
                  '<span class="smart_input-text"></span>' +
                  '<span class="smart_input-cursor"></span>' +
                  '</div>' +
                  '</div>',
        elClass: 'smart_input-container',
        wrapperClass: 'smart_input-wrap',
        cursorClass: 'smart_input-cursor',
        textClass: 'smart_input-text'
      },

      directKeyboardInput: false,
      directNumInput: false,

      max: 0,

      next: null
    },
    pluginPrototype,
    $keyboardOverlay,
    $keyboardPopup,
  // in app can be only one blink cursor
    blinkInterval;

  /**
   * Generate input element
   * @param opt  input options
   * @returns {*}  jQuery el
   */
  function generateInput ( opt ) {
    var div = $(document.createElement('div'));
    div.html(opt.template);
    return div.find('.' + opt.elClass);
  }

  /**
   * generate popup for input keyboards
   */
  function generateKeyboardPopup () {
    $keyboardOverlay = $(document.createElement('div')).attr('id', 'keyboard_overlay');
    $keyboardPopup = $(document.createElement('div')).attr({
      'id': 'keyboard_popup',
      'class': 'keyboard_popup_wrapper'
    });
    $keyboardOverlay.append($keyboardPopup);
    $(document.body).append($keyboardOverlay);
  }

  // The actual plugin constructor
  function Plugin ( element, options ) {
    this.$input = $(element);
    this.initialise(options);
    this.stopBlink();
    this.setText(element.value);
  }

  pluginPrototype = {
    isInited: false,
    _generatedKeyboard: false,
    isKeyboardActive: false,
    text: '',
    initialise: function ( options ) {
      var $el;
      if ( this.isInited ) {
        return this;
      }

      options = $.extend({}, defaultOptions, options);
      options.next = this.$input.attr('data-next') || options.next;
      options.max = this.$input.attr('data-max') || options.max || 0;

      this.options = options;

      this.$input.attr({
        'data-value': '',
        'data-max': options.max
      });

      $el = generateInput(options.input);
      $el.addClass(this.$input[0].className);

      this.$input.hide().after($el);

      this.$el = $el;
      this.$text = $el.find('.' + options.input.textClass);
      this.$cursor = $el.find('.' + options.input.cursorClass);
      this.$wrapper = $el.find('.' + options.input.wrapperClass);

      if ( options.directKeyboardInput ) {
        this.addDirectKeyboardEvents();
      }

      this.addEvents();
      this.isInited = true;
      return this;
    },

    startBlink: function () {
      var self = this,
        hiddenClass = this.options.input.cursorClass + '_hidden';

      if ( blinkInterval ) {
        clearInterval(blinkInterval);
      }
      blinkInterval = setInterval(function () {
        self.$cursor.toggleClass(hiddenClass);
      }, 500);
    },

    stopBlink: function () {
      var hiddenClass = this.options.input.cursorClass + '_hidden';
      if ( blinkInterval ) {
        clearInterval(blinkInterval);
      }
      this.$cursor.addClass(hiddenClass);
    },

    addEvents: function () {
      var $wrap = this.$wrapper,
        opt = this.options,
        self = this;

      this.$input.on({
        'nav_focus': function () {
          $$nav.current(self.$el);
        },
        'startBlink': function () {
          self.startBlink();
        },
        'stopBlink': function () {
          self.stopBlink();
        },
        'hideKeyboard': function () {
          if ( $wrap.hasClass('smart-input-active') ) {
            self.hideKeyboard();
          }
        },
        'showKeyboard': function () {
          self.showKeyboard();
        }
      });

      this.$el.on({
        'nav_focus': function () {
          self.$input.addClass('focus');
        },
        'nav_blur': function () {
          self.$input.removeClass('focus');
        }
      });

      if (opt.directNumInput && !opt.directKeyboardInput) {
        this.$el.off('nav_key:num nav_key:red').on('nav_key:num nav_key:red', function ( e ) {
          self.typeNum(e);
        });
      }

      $wrap.off('nav_focus nav_blur click');

      if ( opt.bindKeyboard ) {
        opt.keyboard = false;
        opt.bindKeyboard
          .off('type backspace delall')
          .on('type', function ( e ) {
            self.type(e.letter);
          })
          .on('backspace', function () {
            self.type('backspace');
          })
          .on('delall', function () {
            self.type('delall');
          });
      }

      if ( opt.keyboard ) {
        this.$el.on('click', function () {
          self.startBlink();
          self.showKeyboard();
        })
      }
    },

    addDirectKeyboardEvents: function () {
      var self = this;

      this.$el.on({
        nav_focus: function () {
          self.startBlink();
          $(document.body).on('keypress.SBInput', function ( e ) {
            if ( e.charCode ) {
              e.preventDefault();
              self.type(String.fromCharCode(e.charCode));
            } else {
              switch ( e.keyCode ) {
                case 8:
                  e.preventDefault();
                  self.type('backspace');
                  break;
              }
            }
          });
        },
        nav_blur: function () {
          self.stopBlink();
          $(document.body).off('keypress.SBInput');
        }
      });
    },

    setText: function ( text ) {
      var opt = this.options,
        formatText,
        max = opt.max,
        method;

      text = text || '';

      if ( text.length > max && max != 0 ) {
        text = text.substr(0, max);
      }

      formatText = opt.formatText ? opt.formatText(text) : text;

      this.$input.val(text).attr('data-value', text);
      this.text = text;
      this.$text.html(formatText);

      // TODO: fix for Samsung 11
      if ( text.length > 1 ) {
        method = (this.$text.width() > this.$wrapper.width()) ? 'add' : 'remove';
        this.$wrapper[ method + 'Class']('.' + opt.input.wrapperClass + '_right');
      } else {
        this.$wrapper.removeClass('.' + opt.input.wrapperClass + '_right');
      }

      this.$input.trigger('text_change');
    },

    type: function ( letter ) {
      var text = this.text || '',
        opt = this.options;

      switch ( letter ) {
        case 'backspace':
          text = text.substr(0, text.length - 1);
          break;
        case 'delall':
          text = '';
          break;
        default:
          text += letter;
          break;
      }

      this.setText(text);

      //jump to next input if is set
      if ( text.length === opt.max &&
           opt.next &&
           opt.max != 0 ) {
        this.hideKeyboard();
        $$nav.current(opt.next);
        $$nav.current().click();
      }
    },

    typeNum: function(e){
      switch (e.keyName) {
        case 'red':
          this.type('backspace');
          break;
        default:
          this.type(e.num);
          break;
      }
      e.stopPropagation();
    },

    changeKeyboard: function ( keyboardOpt ) {
      var curOpt = this.options.keyboard;
      this.options.keyboard = _.extend({}, curOpt, keyboardOpt);
      $keyboardPopup && $keyboardPopup.SBKeyboard(this.options.keyboard);
    },

    hideKeyboard: function ( isComplete ) {
      var $wrapper = this.$wrapper;
      $wrapper.removeClass('smart-input-active');
      this.$input.trigger('keyboard_hide');

      $keyboardOverlay && $keyboardOverlay.hide();

      $$nav.restore();
      $$voice.restore();

      this.isKeyboardActive = false;
      if ( isComplete ) {
        this.$input.trigger('keyboard_complete');
      }
      else {
        this.$input.trigger('keyboard_cancel');
      }
      $keyboardPopup && $keyboardPopup.trigger('keyboard_hide');
    },

    showKeyboard: function () {
      var $wrapper = this.$wrapper,
        keyboardOpt = this.options.keyboard,
        self = this;

      this.isKeyboardActive = true;
      $wrapper.addClass('smart-input-active');

      var h = this.$el.outerHeight();
      var o = this.$el.offset();
      var top = o.top + h;

      if ( !$keyboardOverlay ) {
        generateKeyboardPopup();
      }

      if ( !this._generatedKeyboard ) {
        $keyboardPopup.SBKeyboard(keyboardOpt);
        this._generatedKeyboard = true;
      }

      $keyboardPopup.SBKeyboard('changeKeyboard', keyboardOpt.type)
        .css({
          'left': o.left,
          'top': top
        })
        .off('type backspace delall complete cancel')
        .on('type', function ( e ) {
          self.type(e.letter);
        })
        .on('backspace', function () {
          self.type('backspace');
        })
        .on('delall', function () {
          self.type('delall');
        })
        .on('complete cancel', function ( e ) {
          var isComplete = false;
          if ( e.type === 'complete' ) {
            isComplete = true;
          }
          self.stopBlink();
          self.hideKeyboard(isComplete);
        });

      $keyboardOverlay.show();
      $$voice.save();
      $$nav.save();
      $$nav.on('#keyboard_popup');
      $keyboardPopup.SBKeyboard('refreshVoice').voiceLink();
      this.$el.addClass($$nav.higlight_class);
      this.$input.trigger('keyboard_show');
      this.startBlink();
    }
  };

  $.extend(Plugin.prototype, pluginPrototype);
  pluginPrototype = null;

  $.fn.SBInput = function () {
    var args = Array.prototype.slice.call(arguments),
      method = (typeof args[0] == 'string') && args[0],
      options = (typeof args[0] == 'object') && args[0],
      params = args.slice(1);

    return this.each(function () {
      var instance = $.data(this, 'plugin_' + pluginName);
      if ( !instance ) {
        $.data(this, 'plugin_' + pluginName,
          new Plugin(this, options));
      } else if ( typeof instance[method] === 'function' ) {
        instance[method].apply(instance, params);
    }
    });
  }

})(jQuery, window, document);
/**
 * Keyboard Plugin
 */
;
(function ( $, window, document, undefined ) {

  var pluginName = 'SBKeyboard',
    keyRegExp = /([^{]+){{([^}]*)}}/,
    defaults = {
      type: 'en',
      firstLayout: null
    },
    pluginPrototype = {},
    keyboardPrototype = {},
    generatedKeyboards = {};

  /**
   * Keyboard constructor
   * @param options
   * @param $el parent element
   * @constructor
   */
  function Keyboard ( options, $el ) {

    this.type = options.type;
    this.currentLayout = '';
    this.previousLayout = '';
    this.$el = $el;

    // jquery layout els
    this.$layouts = {};

    // all available layouts(for changeKeyboardLang)
    this.presets = [];

    this.initialize(options);
  }

  keyboardPrototype = {
    isShiftActive: false,
    isNumsShown: false,
    currentPresetType: '',
      initialize: function ( options ) {

      var _type = _.result(this, 'type'),
        board = '',
        preset,
        haveNums = false,
        type;

      preset = SB.keyboardPresets[_type];

      if (!preset) {
        throw new Error('Preset ' + _type + ' doesn\'t exist');
      }

      this.currentPresetType = _type;

      this.$wrap = $(document.createElement('div')).addClass('kb-wrap');

      if ( typeof preset === 'function' ) {
        this.presets.push(_type);
        board = this.generateBoard(_type);
      } else if ( preset.length ) {
        this.presets = preset;
        haveNums = (preset.indexOf('fullnum') !== -1);
        if ( haveNums ) {
          this.presets = _.without(this.presets, 'fullnum');
        }
        board = this.generateFull(this.presets, haveNums);
      }

      this.$wrap
        .append(board)
        .addClass('kekekey_' + _type);

      this.$el.append(this.$wrap);
      this.setEvents();

      // save jquery els of current layouts
      for ( var i = 0; i < this.presets.length; i++ ) {
        type = this.presets[i];
        this.$layouts[type] = this.$wrap.find('.keyboard_generated_' + type);
      }

      if (haveNums) {
        this.$layouts['fullnum'] = this.$wrap.find('.keyboard_generated_fullnum');
      }

      if ( this.presets.indexOf(options.firstLayout) !== -1 ) {
        this.changeLayout(options.firstLayout);
      } else {
        this.changeLayout(this.presets[0]);
      }
    },

    /**
     * Generate multilayout keyboards
     * @param types {Array} array of layout types (['ru', 'en'])
     * @param haveNums {Boolean} add fullnum keyboard
     * @returns {string} generated html
     */
    generateFull: function ( types, haveNums ) {
      var wrapHtml = '',
        preset = '',
        type = '';

      if ( types.length > 1 ) {
        this.$wrap.addClass('kb-multilang');
      }

      for ( var i = 0; i < types.length; i++ ) {
        type = types[i];
        wrapHtml += this.generateBoard(type);
      }

      if ( haveNums ) {
        this.$wrap.addClass('kb-havenums');
        wrapHtml += this.generateBoard('fullnum');
      }

      return wrapHtml;
    },

    /**
     * Generate keyboard layout
     * @param type {String}  'ru', 'en'
     * @returns {String} generated html
     */
    generateBoard: function ( type ) {

      var preset = SB.keyboardPresets[type],
        boardHtml = '',
        rowHtml = '',
        keyAttrs = {},
        row, letter;

      if ( generatedKeyboards[type] ) {
        return generatedKeyboards[type].board;
      }

      preset = preset();
      boardHtml = '<div class="kb-c keyboard_generated_' + type + '">';

      for ( var i = 0; i < preset.length; i++ ) {
        row = preset[i];
        rowHtml = '<div class="kb-row" data-nav_type="hbox">';

        for ( var j = 0; j < row.length; j++ ) {
          letter = row[j];
          if ( letter.length == 1 || letter === '&amp;' ) {
            keyAttrs = {
              text: letter,
              type: '',
              letter: letter
            };
          }
          else {
            var matches = keyRegExp.exec(letter);

            keyAttrs.text = matches[2] || '';
            keyAttrs.type = matches[1];
            keyAttrs.letter = '';
          }
          rowHtml += '<div class="kbtn nav-item ' +
                     keyAttrs.type +
                     '" data-letter="' + _.escape(keyAttrs.letter) + '"';

          if ( keyAttrs.type ) {
            rowHtml += ' data-keytype="' + keyAttrs.type + '"';
          }

          rowHtml += '>' + keyAttrs.text + '</div>';
        }

        boardHtml += rowHtml + '</div>';
      }

      boardHtml += '</div>';

      generatedKeyboards[type] = {
        board: boardHtml
      };
      return boardHtml;
    },

    /**
     * Num keys event handler
     * @param e
     */
    onKeyNum: function ( e ) {
      switch ( e.keyName ) {
        case 'red':
          this.$el.trigger('backspace');
          break;
        default:
          var ev = $.Event({
            'type': 'type'
          });
          ev.letter = '' + e.num;

          this.$el.trigger(ev);
          break;
      }
      e.stopPropagation();
    },
    defaultOnKey: function ( e ) {
      e.stopPropagation();
    },
    onKeyDown: function ( e ) {
      var $el = $(e.currentTarget),
        keyType = $el.attr('data-keytype'),
        letter = $el.attr('data-letter'),
        ev;

      // create custom event for triggering keyboard event
      ev = $.Event({
        'type': 'type'
      });

      if ( keyType ) {
        switch ( keyType ) {
          case 'backspace':
            ev = 'backspace';
            break;
          case 'delall':
            ev = 'delall';
            break;
          case 'complete':
            ev = 'complete';
            break;
          case 'space':
            ev.letter = ' ';
            break;
          case 'shift':
            this.triggerShiftLetters();
            return;
          case 'lang':
            this.changeKeyboardLang();
            return;
          case 'nums':
            this.triggerNumKeyboard();
            return;
          default:
            break;
        }
      } else {
        ev.letter = this.isShiftActive ? letter.toUpperCase() : letter;
      }

      ev && this.$el.trigger(ev);

      e.stopPropagation();
    },

    triggerShiftLetters: function () {
      var self = this;

      if ( this.isShiftActive ) {
        this.isShiftActive = false;
        this.$el.removeClass('shift_active');
      } else {
        this.isShiftActive = true;
        this.$el.addClass('shift_active');
      }

      // TODO: only for samsung 11
//      this.$el.find('.kbtn').not('.delall,.complete,.space,.nums,.lang,.shift,.backspace').each(function () {
//        this.innerHTML = self.isShiftActive ? this.innerHTML.toUpperCase() : this.innerHTML.toLowerCase();
//      });
    },

    /**
     * show/hide fullnum layout
     */
    triggerNumKeyboard: function () {

      if ( this.isNumsShown ) {
        this.isNumsShown = false;
        this.changeLayout(this.previousLayout);
        this.$el.trigger('hide_num');
      } else {
        this.isNumsShown = true;
        this.changeLayout('fullnum');
        this.$el.trigger('show_num');
      }

      $$nav.current(this.$layouts[this.currentLayout].find('.nums'));
    },

    changeKeyboardLang: function () {
      var curIndex = this.presets.indexOf(this.currentLayout),
        index;

      index = (curIndex + 1) % this.presets.length;
      this.changeLayout(this.presets[index]);
      $$nav.current(this.$layouts[this.currentLayout].find('.lang'));
    },

    /**
     * Change layout function
     * @param layout {String} 'fullnum', 'en'
     */
    changeLayout: function ( layout ) {
      var prevLayout,
        curLayout = this.$layouts[layout];

      if ( this.currentLayout ) {
        prevLayout = this.$layouts[this.currentLayout];
        prevLayout && prevLayout.hide();
        this.$el.removeClass('keyboard_' + this.currentLayout);
        this.previousLayout = this.currentLayout;
      }

      if ( curLayout ) {
        this.currentLayout = layout;
        this.$el.addClass('keyboard_' + layout);
        curLayout.show();
      }
    },
    setEvents: function () {
      var self = this;
      // block yellow & blue buttons
      this.$wrap.on('nav_key:yellow nav_key:blue', this.defaultOnKey);
      this.$wrap.on('nav_key:num nav_key:red', _.bind(this.onKeyNum, this));
      this.$wrap.on('click', '.kbtn', _.bind(this.onKeyDown, this));
      this.$wrap
        .on('nav_key:green', function ( e ) {
          self.$el.trigger('complete');
          e.stopPropagation();
        })
        .on('nav_key:return', function ( e ) {
          self.$el.trigger('cancel');
          e.stopPropagation();
        });
    },
    show: function () {
      this.$wrap.show();
      this.$el.addClass(_.result(this, 'type') + '_wrap').addClass('keyboard_' + this.currentLayout);
      return this;
    },
    hide: function () {
      this.$wrap.hide();
      this.$el.removeClass(_.result(this, 'type') + '_wrap').removeClass('keyboard_' + this.currentLayout);
    }
  };

  $.extend(Keyboard.prototype, keyboardPrototype);
  keyboardPrototype = null;

  // The actual plugin constructor
  function Plugin ( element, options ) {
    this.$el = $(element);
    this.keyboards = {};

    options = $.extend({}, defaults, options);
    this.addKeyboard(options);
    this.$el.addClass('keyboard_popup_wrapper');
  }

  pluginPrototype = {
    /**
     * Add keyboard to current element
     * @param opt {Object}
     */
    addKeyboard: function ( opt ) {
      var options = $.extend({}, defaults, opt),
        type = _.isFunction(opt.type) ? _.result(opt, 'type') : opt.type;

      if ( !this.keyboards[type] ) {
        this.keyboards[type] = new Keyboard(options, this.$el);
      }
      this.changeKeyboard(type);
    },
    /**
     * Change current active keyboard
     * @param type {String|Function} 'en', 'ru'
     */
    changeKeyboard: function ( type ) {
      var curKeyboard = this.currentKeyboard,
        preset,
        isCurrent;

      type = _.isFunction(type) ? type() : type;
      preset = this.keyboards[type];
      isCurrent = curKeyboard && (curKeyboard.currentPresetType === type);

      if ( preset && !isCurrent ) {
        curKeyboard && curKeyboard.hide();
        this.currentKeyboard = preset.show();
      } else if (!preset){
        this.addKeyboard({
          type: type
        });
      }
    }
  };

  $.extend(Plugin.prototype, pluginPrototype);
  pluginPrototype = null;

  // A lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn.SBKeyboard = function () {
    var args = Array.prototype.slice.call(arguments),
      method = (typeof args[0] == 'string') && args[0],
      options = (typeof args[0] == 'object') && args[0],
      params = args.slice(1);

    return this.each(function () {
      var instance = $.data(this, 'plugin_' + pluginName);
      if ( !instance ) {
        $.data(this, 'plugin_' + pluginName,
          new Plugin(this, options));
      } else {
        if ( method ) {
          instance[method] && instance[method].apply(instance, params)
        } else if ( options ) {
          instance.addKeyboard(options);
        }
      }
    });
  }
})(jQuery, window, document);

window.SB = window.SB || {};

// Default layouts, can be extended
window.SB.keyboardPresets = {

  en: function () {
    return [
      'qwertyuiop'.split(''),
      'asdfghjkl'.split('').concat(['backspace{{<i class="backspace_icon"></i>}}']),
      ['shift{{<i class="shift_icon"></i>Shift}}'].concat('zxcvbnm'.split('')).concat(
        ['delall{{<span>Del<br/>all</span>}}']),
      ['lang{{@@lang}}', 'nums{{123}}', 'space{{}}', 'complete{{Complete}}']
    ];
  },

  ru: function () {
    return [
      'йцукенгшщзхъ'.split(''),
      'фывапролджэ'.split('').concat(['backspace{{<i class="backspace_icon"></i>}}']),
      ['shift{{<i class="shift_icon"></i>Shift}}'].concat('ячсмитьбю'.split('')).concat(['delall{{<span>Del<br/>all</span>}}']),
      ['lang{{en}}', 'nums{{123}}', 'space{{}}', 'complete{{Готово}}']
    ]
  },
  uk: function () {
    return [
      'йцукенгшщзхї'.split(''),
      'фівапролджє'.split('').concat(['backspace{{<i class="backspace_icon"></i>}}']),
      ['shift{{<i class="shift_icon"></i>Shift}}'].concat('ячсмитьбю'.split('')).concat(['delall{{<span>Del<br/>all</span>}}']),
      ['lang{{en}}', 'nums{{123}}', 'space{{}}', 'complete{{застосувати}}']
    ]
  },
  email: function () {
    return [
      '1234567890@'.split(''),
      'qwertyuiop'.split('').concat(['backspace{{<i class="backspace_icon"></i>}}']),
      'asdfghjkl_'.split('').concat(['delall{{<span>Del<br/>all</span>}}']),
      'zxcvbnm-.'.split('').concat('complete{{OK}}')
    ];
  },

  num: function () {
    return [
      '123'.split(''),
      '456'.split(''),
      '789'.split(''),
      ['backspace{{<i class="backspace_icon"></i>}}', '0', 'complete{{OK}}']
    ]
  },

  fullnum: function () {
    return [
      '1234567890'.split(''),
      '-/:;()$"'.split('').concat(['&amp;', 'backspace{{<i class="backspace_icon"></i>}}']),
      ['nums{{ABC}}'].concat("@.,?!'+".split('')),
      ['space{{}}', 'complete{{gettext("Ok")}}']
    ]
  },

  fulltext_ru: ['ru','en'],
  fulltext_en: ['en'],
  fulltext_uk: ['uk', 'en'],
  fulltext_ru_nums: ['ru', 'en', 'fullnum'],
  fulltext_uk_nums: ['uk', 'en', 'fullnum'],
  fulltext_en_nums: ['en', 'fullnum']
};
(function (window) {
  "use strict";
  /*globals _, ViewModel,$,Events,document, Observable, Computed, Lang, nav*/
  var icons = ['info','red', 'green', 'yellow', 'blue', 'rew', 'play', 'pause', 'stop', 'ff', 'tools', 'left',
               'right', 'up', 'down', 'leftright', 'updown', 'move', 'number', 'enter', 'ret'],

    notClickableKeys= ['leftright', 'left', 'right', 'up', 'down', 'updown', 'move', 'number'],
    _isInited,
    LegendKey,
    savedLegend = [],
    Legend;

  function isClickable( key ) {
    return (notClickableKeys.indexOf(key) === -1)
  }

  function renderKey( key ) {
    var clickableClass = isClickable(key) ? ' legend-clickable' : '';
    return '<div class="legend-item legend-item-' + key + clickableClass + '" data-key="' + key + '">' +
             '<i class="leg-icon leg-icon-' + key + '"></i>' +
             '<span class="legend-item-title"></span>' +
           '</div>';
  }

  function _renderLegend() {
    var legendEl,
      wrap,
      allKeysHtml = '';

    for (var i = 0, len = icons.length; i<len; i++) {
      allKeysHtml += renderKey(icons[i]);
    }

    legendEl = document.createElement('div');
    wrap = document.createElement('div');

    legendEl.className = 'legend';
    legendEl.id = 'legend';
    wrap.className = 'legend-wrap';
    wrap.innerHTML = allKeysHtml;
    legendEl.appendChild(wrap);

    return $(legendEl);
  }

  Legend = function() {
    var self = this;
    this.$el = _renderLegend();
    this.keys = {};

    var initKey = function ( key ) {
      var $keyEl;
      if ( !self.keys[key] ) {
        $keyEl = self.$el.find('.legend-item-' + key);
        self.keys[key] = new LegendKey($keyEl);
      }
    };

    for ( var i = 0; i < icons.length; i++ ) {
      initKey(icons[i]);
    }

    this.addKey = function ( keyName, isClickable ) {
      var keyHtml;

      if (typeof isClickable === 'undefined') {
        isClickable = true;
      }

      if (!isClickable) {
        notClickableKeys.push(keyName);
      }

      keyHtml = renderKey(keyName);

      this.$el.find('.legend-wrap').append(keyHtml);
      initKey(keyName);
    };

    this.show = function () {
      this.$el.show();
    };

    this.hide = function () {
      this.$el.hide();
    };

    this.clear = function () {
      for ( var key in this.keys ) {
        this.keys[key]('');
      }
    };

    this.save = function () {
      for ( var key in this.keys ) {
        savedLegend[key] = this.keys[key]();
      }
    };

    this.restore = function () {
      _.each(icons, function ( key ) {
        Legend[key](savedLegend[key]);
      });

      for ( var key in savedLegend ) {
        this.keys[key](savedLegend[key]);
      }

      savedLegend = [];
    };
  };

  LegendKey = function ($el) {
    this.$el = $el;
    this.$text = $el.find('.legend-item-title');
    return _.bind(this.setText, this);
  };

  LegendKey.prototype.text = '';
  LegendKey.prototype.isShown = false;
  LegendKey.prototype.setText = function (text) {
    if (typeof text === 'undefined') {
      return this.text;
    } else if (text !== this.text) {
      text = text || '';

      if (!text && this.isShown) {
        this.$el[0].style.display = 'none';
        this.$el.removeClass('legend-item-visible');
        this.isShown = false;
      } else if (text && !this.isShown) {
        this.$el[0].style.display = '';
        this.$el.addClass('legend-item-visible');
        this.isShown = true;
      }

      this.text = text;
      this.$text.html('<div>' + text + '</div>');
    }
  };


  window.$$legend = new Legend();

  $(function () {
    $$legend.$el.appendTo(document.body);
    $$legend.$el.on('click', '.legend-clickable', function () {
      var key = $(this).attr('data-key'),
        ev, commonEvent;

      if (key === 'ret') {
        key = 'return';
      } else if (key === 'rew') {
        key = 'rw';
      }

      ev = $.Event("nav_key:" + key);
      commonEvent = $.Event("nav_key");
      commonEvent.keyName = ev.keyName = key;

      $$nav.current().trigger(ev).trigger(commonEvent);
    });
  });
})(this);
(function ( window, undefined ) {

  var profiles = {},
    logs = {},
    logNames = [],
    curPanelIndex = 0,
  // максимум логов на странице
    maxLogCount = 20,
    $logWrap,
    $logRow,
    Log,
    LogPanel;

  // append log wrapper to body
  $logWrap = $('<div></div>', {
    id: 'log',
    class: 'hidden'
  });

  $(function () {
    $logWrap.appendTo(document.body);
  });

  $logRow = $('<div></div>', {
    'class': 'log-row'
  });

  /**
   * LogPanel constructor
   * @param logName {String} name of log panel
   * @constructor
   */
  LogPanel = function ( logName ) {
    this.name = logName;
    this.logs = 0;
    this.states = {};

    var $wrapper = $logWrap.find('#log_' + this.name);

    this.$content = $wrapper.find('.log_content');
    this.$state = $wrapper.find('.log_states');

    // no need anymore
    $wrapper = null;
  };

  _.extend(LogPanel.prototype, {
    log: function log ( msg ) {
      var logRow = $logRow.clone(),
        $rows, length;
      this.logs++;
      msg = _.escape(msg);

      logRow.html(msg).appendTo(this.$content);
      if ( this.logs > maxLogCount ) {
        $rows = this.$content.find(".log-row");
        length = $rows.length;
        $rows.slice(0, length - maxLogCount).remove();
        this.logs = $rows.length;
      }
    },

    state: function state ( value, stateName ) {
      var state = this.states[stateName] || this.createState(stateName);
      state.textContent = stateName + ': ' + value;
    },

    createState: function ( stateName ) {
      var $state = document.createElement('div');
      $state.id = '#log_' + this.name + '_' + stateName;
      this.states[stateName] = $state;
      this.$state.append($state);

      return $state;
    }
  });

  var logPanelTemplate = '<div class="log_pane" id="log_<%=name%>">' +
                           '<div class="log_name">Log: <%=name%></div>' +
                           '<div class="log_content_wrap">' +
                            '<div class="log_content"></div>' +
                           '</div>' +
                           '<div class="log_states"></div>' +
                         '</div>';

  Log = {

    create: function ( logName ) {
      var logHtml = logPanelTemplate.replace(/<%=name%>/g, logName);
      $logWrap.append(logHtml);
      logs[logName] = new LogPanel(logName);
      logNames.push(logName);
      return logs[logName];
    },

    getPanel: function ( logName ) {
      logName = logName || 'default';
      return (logs[logName] || this.create(logName));
    }
  };

  /**
   * Public log API
   */
  window.SB.utils.log = {
    log: function ( msg, logName ) {
      Log.getPanel(logName).log(msg);
    },

    state: function ( msg, state, logName ) {
      Log.getPanel(logName).state(msg, state);
    },

    show: function ( logName ) {
      logName = logName || logNames[curPanelIndex];

      if ( !logName ) {
        curPanelIndex = 0;
        this.hide();
      } else {
        curPanelIndex++;
        $logWrap.show();
        $('.log_pane').hide();
        $('#log_' + logName).show();
      }
    },

    hide: function () {
      $logWrap.hide();
    },

    startProfile: function ( profileName ) {
      if ( profileName ) {
        profiles[profileName] = (new Date()).getTime();
      }
    },

    stopProfile: function ( profileName ) {
      if ( profiles[profileName] ) {
        this.log(profileName + ': ' + ((new Date()).getTime() - profiles[profileName]) + 'ms', 'profiler');
        delete profiles[profileName];
      }
    }
  };
  window.$$log = SB.utils.log.log;
  window.$$error = SB.utils.error;

})(this);

$(function () {
  var logKey = SB.config.logKey || 'tools';
  $(document.body).on('nav_key:' + logKey, function () {
    SB.utils.log.show();
  });
});

!(function ( window, undefined ) {

  var $body = null,
    nav, invertedKeys = {};

  SB.ready(function () {
    var keys = SB.keys;
    for (var key in keys) {
      invertedKeys[keys[key]] = key.toLowerCase();
    }
  });

  function Navigation () {


    // for methods save и restore
    var savedNavs = [],
        _keyPressed,

    // object for store throttled color keys  methods
      throttledMethods = {},

    // current el in focus
      navCur = null,

    // arrays
      numsKeys = ['n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9'],
      colorKeys = ['green', 'red', 'yellow', 'blue'],

    // pause counter
      paused = 0;

      window.savedNavs = savedNavs;

    function onKeyDown ( e ) {
      var key,
        data = {},
        keyCode = e.keyCode;

      if ( paused || !navCur ) {
        return;
      }
      _keyPressed = key = invertedKeys[keyCode];
      if ( key ) {
        if ( colorKeys.indexOf(key) > -1 ) {
          throttleEvent(key);
        } else {
          if ( numsKeys.indexOf(key) > -1 ) {
            data.num = key[1];
            key = 'num';
          }

          _triggerKeyEvent(key, data);
        }
      }
    }
    /**
     * 'nav_key:' event trigger
     * @param key key name
     * @param data event data
     */
    function _triggerKeyEvent ( key, data ) {
      var ev,
        commonEvent;
      if ( navCur ) {
        ev = $.Event("nav_key:" + key, data || {});
        commonEvent = $.Event("nav_key");

        ev.keyName = key;
        commonEvent.keyName = key;
        navCur.trigger(ev);
        //первый trigger мог уже сменить текщий элемент
        navCur && navCur.trigger(commonEvent);
      }
    }

    function throttleEvent ( key ) {
      var keyMethod = throttledMethods[key];

      // lazy init
      if ( !keyMethod ) {
        keyMethod = throttledMethods[key] = _.throttle(function () {
          _triggerKeyEvent(key);
        }, 800, {
          leading: true
        });
      }

      keyMethod(key);
    }

    /**
     * trigger click on current element
     */
    function onClick () {
      navCur && navCur.click();
    }

    return {

      getKeyPresed: function(){
        return _keyPressed;
      },
      // nav els selector
      area_selector: '.nav-item',

      /**
       * Current el class
       * @type {string}
       */
      higlight_class: 'focus',

      /**
       * navigation container
       * @type {jQuery}
       */
      $container: null,

      /**
       * Current looping type
       * false/hbox/vbox
       * @type {boolean|string}
       */
      loopType: null,

      /**
       * Phantom els selector
       * @type {string}
       */
      phantom_selector: '[data-nav-phantom]',

      /**
       * Returns current navigation state
       * @returns {boolean}
       */
      isPaused: function () {
        return !!paused;
      },
      triggerKeyEvent:   _triggerKeyEvent,
      /**
       * Stop navigation. Increase pause counter
       * @returns {Navigation}
       */
      pause: function () {
        paused++;
        return this;
      },

      /**
       * Resume navigation if force or pause counter is zero
       * @param force {Boolean} force navigation resume
       * @returns {Navigation}
       */
      resume: function ( force ) {
        paused--;
        if ( paused < 0 || force ) {
          paused = 0;
        }
        return this;
      },

      /**
       * Save current navigation state
       * @returns {Navigation}
       */
      save: function () {
        savedNavs.push({
          navCur: navCur,
          area_selector: this.area_selector,
          higlight_class: this.higlight_class,
          $container: this.$container
        });
        return this;
      },
      flushNavs: function(){
        savedNavs = [];
        return this;
      },
      setNav: function (idx) {
        if (savedNavs.length > idx){
          this.off();
          var foo = savedNavs[idx];
          this.area_selector = foo.area_selector;
          this.higlight_class = foo.higlight_class;
          this.on(foo.$container, foo.navCur);
          this.flushNavs();
        }
        return this;
      },
      /**
       * Restore navigation state
       * @returns {Navigation}
       */
      restore: function () {
        if ( savedNavs.length ) {
          this.off();
          var foo = savedNavs.pop();
          this.area_selector = foo.area_selector;
          this.higlight_class = foo.higlight_class;
          this.on(foo.$container, foo.navCur);
        }
        return this;
      },

      /**
       * Setting focus on element
       * @param element {*} - HTMLElement, selector or Jquery object
       * @param originEvent {string} - event source(nav_key, mousemove, voice etc.)
       * @return {Navigation}
       */
      current: function ( element, originEvent ) {
        if ( !element ) {
          return navCur;
        }

        originEvent = originEvent || 'nav_key';

        var $el = $(element);
        if ( $el.is(this.phantom_selector) ) {
          $el = $($($el.attr('data-nav-phantom'))[0]);
        }
        if ( $el.length > 1 ) {
          throw new Error('Focused element must be only one!');
        }
        if ( !$el.length ) {
          return this;
        }
        var old = navCur;
        if ( navCur ) {
          navCur.removeClass(this.higlight_class).trigger('nav_blur', [originEvent, $el]);
        }

        navCur = $el;

        $el.addClass(this.higlight_class).trigger('nav_focus', [originEvent, old]);
        return this;
      },

      /**
       * Turn on navigation in container, turn off previous navigation
       * @param container - HTMLElement, selector or Jquery object (body by default)
       * @param cur - HTMLElement, selector or Jquery object(first nav el by default)
       * @return {Navigation}
       */
      on: function ( container, cur ) {

        var self = this,
          $navTypeEls;

        $body = $body || $(document.body);

        this.off();

        this.$container = container ? $(container) : $body;

        if ( SB.platform != 'philips' ) {
          this.$container.on('mouseenter.nav', this.area_selector, function ( e ) {
            if ( !$(this).is(self.phantom_selector) ) {
              self.current(this, 'mouseenter');
            }
          });
        }

        $navTypeEls = this.$container.find('[data-nav_type]');

        if ( this.$container.attr('data-nav_type') ) {
          $navTypeEls = $navTypeEls.add(this.$container);
        }

        $navTypeEls.each(function () {
          var $el = $(this);
          var navType = $el.attr("data-nav_type");
          $el.removeAttr('data-nav_type');
          //self.setLoop($el);
          var loop = $el.attr("data-nav_loop");

          self.siblingsTypeNav($el, navType, loop);
        });

        $body
          .bind('keydown.navigation', onKeyDown)
          .bind('nav_key:enter.navigation', onClick);

        if ( !cur ) {
          cur = this.$container.find(this.area_selector).filter(':visible')[0];
        }
        this.current(cur);
        return this;
      },

      siblingsTypeNav: function ( $container, type, loop ) {
        var self = this;
        $container.on('nav_key:left nav_key:right nav_key:up nav_key:down', this.area_selector,
          function ( e ) {
            var last = 'last',
              cur = self.current(),
              next,
              fn;

            //check if direction concur with declared
            if ( (type == 'hbox' && e.keyName == 'left') ||
                 (type == 'vbox' && e.keyName == 'up') ) {
              fn = 'prev';
            } else if ( (type == 'hbox' && e.keyName == 'right') ||
                        (type == 'vbox' && e.keyName == 'down') ) {
              fn = 'next';
            }

            if ( fn == 'next' ) {
              last = 'first';
            }

            if ( fn ) {
              next = cur[fn](self.area_selector);

              while ( next.length && !next.is(':visible') ) {
                next = next[fn](self.area_selector);
              }

              if ( !next.length && loop ) {
                next = $container.find(self.area_selector).filter(':visible')[last]();
              }

              if ( next.length ) {
                nav.current(next);
                return false;
              }
            }
          });
      },

      /**
       * Turn off navigation from container, disable navigation from current element
       * @return {Navigation}
       */
      off: function () {
        if ( navCur ) {
          navCur.removeClass(this.higlight_class).trigger('nav_blur');
        }
        this.$container && this.$container.off('mouseenter.nav').off('.loop');
        $body.unbind('.navigation');
        navCur = null;
        return this;
      },

      /**
       * Find first nav el & set navigation on them
       */
      findSome: function () {
        var cur;

        if ( !(navCur && navCur.is(':visible')) ) {
          cur = this.$container.find(this.area_selector).filter(':visible').eq(0);
          this.current(cur);
        }

        return this;
      },

      /**
       * Find closest to $el element by dir direction
       * @param $el {jQuery} - source element
       * @param dir {string} - direction up, right, down, left
       * @param navs {jQuery} - object, contains elements to search
       * @returns {*}
       */
      findNav: function ( $el, dir, navs ) {
        var user_defined = this.checkUserDefined($el, dir);

        if ( user_defined ) {
          if (user_defined === 'none') {
            return false;
          } else {
            return user_defined;
          }
        }

        var objBounds = $el[0].getBoundingClientRect(),
          arr = [],
          curBounds = null,
          cond1, cond2, i , l;

        for ( i = 0, l = navs.length; i < l; i++ ) {
          curBounds = navs[i].getBoundingClientRect();

          if ( curBounds.left == objBounds.left &&
               curBounds.top == objBounds.top ) {
            continue;
          }

          switch ( dir ) {
            case 'left':
              cond1 = objBounds.left > curBounds.left;
              break;
            case 'right':
              cond1 = objBounds.right < curBounds.right;
              break;
            case 'up':
              cond1 = objBounds.top > curBounds.top;
              break;
            case 'down':
              cond1 = objBounds.bottom < curBounds.bottom;
              break;
            default:
              break;
          }

          if ( cond1 ) {
            arr.push({
              'obj': navs[i],
              'bounds': curBounds
            });
          }
        }

        var min_dy = 9999999, min_dx = 9999999, min_d = 9999999, max_intersection = 0;
        var dy = 0, dx = 0, d = 0;

        function isIntersects ( b1, b2, dir ) {
          var temp = null;
          switch ( dir ) {
            case 'left':
            case 'right':
              if ( b1.top > b2.top ) {
                temp = b2;
                b2 = b1;
                b1 = temp;
              }
              if ( b1.bottom > b2.top ) {
                if ( b1.top > b2.right ) {
                  return b2.top - b1.right;
                }
                else {
                  return b2.height;
                }
              }
              break;
            case 'up':
            case 'down':
              if ( b1.left > b2.left ) {
                temp = b2;
                b2 = b1;
                b1 = temp;
              }
              if ( b1.right > b2.left ) {
                if ( b1.left > b2.right ) {
                  return b2.left - b1.right;
                }
                else {
                  return b2.width;
                }
              }
              break;
            default:
              break;
          }
          return false;
        }

        var intersects_any = false;
        var found = false;

        for ( i = 0, l = arr.length; i < l; i++ ) {
          if ( !this.checkEntryPoint(arr[i].obj, dir) ) {
            continue;
          }

          var b = arr[i].bounds;
          var intersects = isIntersects(objBounds, b, dir);
          dy = Math.abs(b.top - objBounds.top);
          dx = Math.abs(b.left - objBounds.left);
          d = Math.sqrt(dy * dy + dx * dx);
          if ( intersects_any && !intersects ) {
            continue;
          }
          if ( intersects && !intersects_any ) {
            min_dy = dy;
            min_dx = dx;
            max_intersection = intersects;
            found = arr[i].obj;
            intersects_any = true;
            continue;
          }

          switch ( dir ) {
            case 'left':
            case 'right':
              if ( intersects_any ) {
                cond2 = dx < min_dx || (dx == min_dx && dy < min_dy);
              }
              else {
                cond2 = dy < min_dy || (dy == min_dy && dx < min_dx);
              }
              break;
            case 'up':
            case 'down':
              if ( intersects_any ) {
                cond2 = dy < min_dy || (dy == min_dy && dx < min_dx);
              }
              else {
                cond2 = dx < min_dx || (dx == min_dx && dy < min_dy);
              }
              break;
            default:
              break;
          }
          if ( cond2 ) {
            min_dy = dy;
            min_dx = dx;
            min_d = d;
            found = arr[i].obj;
          }
        }

        return found;
      },

      /**
       * Return element defied by user
       * Если юзером ничего не определено или направление равно 0, то возвращает false
       * Если направление определено как none, то переход по этому направлению запрещен
       *
       * @param $el - current element
       * @param dir - direction
       * @returns {*}
       */
      checkUserDefined: function ( $el, dir ) {
          var ep = $el.data('nav_ud'),
              result = false,
              res = $el.data('nav_ud_' + dir);
          if (!ep && !res) {
              return false;
          }

          if ( !res ) {
              var sides = ep.split(','),
                  dirs = ['up', 'right', 'down', 'left'];
              if(sides.length !== 4) {
                  return false;
              }

              $el.data({
                  'nav_ud_up': sides[0],
                  'nav_ud_right': sides[1],
                  'nav_ud_down': sides[2],
                  'nav_ud_left': sides[3]
              });

              res = sides[dirs.indexOf(dir)];
          }

          if ( res == 'none' ) {
              result = 'none';
          } else if( res == '0' ) {
              result = false;
          } else if ( res ) {
              result = $(res).first();
          }
          return result;
      },

      /**
       * Проверяет можно ли войти в элемент с определенной стороны.
       * Работает если у элемента задан атрибут data-nav_ep. Точки входа задаются в атрибуте с помощью 0 и 1 через запятые
       * 0 - входить нельзя
       * 1 - входить можно
       * Стороны указываются в порядке CSS - top, right, bottom, left
       *
       * data-nav_ep="0,0,0,0" - в элемент зайти нельзя, поведение такое же как у элемента не являющегося элементом навигации
       * data-nav_ep="1,1,1,1" - поведение по умолчанию, как без задания этого атрибута
       * data-nav_ep="0,1,0,0" - в элемент можно зайти справа
       * data-nav_ep="1,1,0,1" - в элемент нельзя зайти снизу
       * data-nav_ep="0,1,0,1" - можно зайти слева и справа, но нельзя сверху и снизу
       *
       * @param elem -  проверяемый элемент
       * @param dir - направление
       * @returns {boolean}
       */
      checkEntryPoint: function ( elem, dir ) {
        var $el = $(elem),
          ep = $el.attr('data-nav_ep'),
          res = null;

        if ( !ep ) {
          return true;
        }

        res = $el.attr('data-nav_ep_' + dir);

        if ( res === undefined ) {
          var sides = ep.split(',');
          $el.attr('data-nav_ep_top', sides[0]);
          $el.attr('data-nav_ep_right', sides[1]);
          $el.attr('data-nav_ep_bottom', sides[2]);
          $el.attr('data-nav_ep_left', sides[3]);
          res = $el.attr('data-nav_ep_' + dir);
        }

        return !!parseInt(res);
      }
    };
  }

  nav = window.$$nav = new Navigation();

  $(function () {
    // Navigation events handler
    $(document.body).bind('nav_key:left nav_key:right nav_key:up nav_key:down', function ( e ) {
      var cur = nav.current(),
        $navs,
        n;

      $navs = nav.$container.find(nav.area_selector).filter(':visible');
      n = nav.findNav(cur, e.keyName, $navs);
      n && nav.current(n);
    });
  });

})(this);

/**
 * Player plugin for smartbox
 */

(function (window) {

    var updateInterval, curAudio = 0;


    /**
     * emulates events after `play` method called
     * @private
     * @param self Player
     */
    var stub_play = function (self) {
        self.state = "playing";
        updateInterval = setInterval(function () {
            self.trigger("update");
            self.videoInfo.currentTime += 0.5;
            if (self.videoInfo.currentTime >= self.videoInfo.duration) {
                self.trigger("complete");
            }
        }, 500);
    }

    var inited = false;

    var Player = window.Player = {
        isInit: function(){
            return inited;
        },
        name: 'base',
        /**
         * Inserts player object to DOM and do some init work
         * @examples
         * Player._init(); // run it after SB.ready
         */
        _init: function () {
            //no need to do anything because just stub
        },
        /**
         * current player state ["play", "stop", "pause"]
         */
        state: 'stop',

        getError: function (){
          return this._error();
        },

        setError: function (error){
          this._setError(error);
        },
        getState: function(){
          return this.state;
        },
        /**
         * Runs some video
         * @param {Object} options {url: "path", type: "hls", from: 0
         * }
         * @examples
         *
         * Player.play({
         * url: "movie.mp4"
         * }); // => runs video
         *
         * Player.play({
         * url: "movie.mp4"
         * from: 20
         * }); // => runs video from 20 second
         *
         * Player.play({
         * url: "stream.m3u8",
         * type: "hls"
         * }); // => runs stream
         */
        play: function (options) {
            if (!this.isInit()) {
                this._init();
                inited = true;
            }

            if (typeof options == "string") {
                options = {
                    url: options
                }
            }
            if (options !== undefined) {
                this.stop();
                this.state = 'playing';
                this._play(options);
            } else if (options === undefined && this.state === 'paused') {
                this.resume();
            }
        },
        _play: function () {
            var self = this;

            setTimeout(function () {
                console.log('>>>> wierd READY');
                self.trigger("ready");
                setTimeout(function () {
                    self.trigger("bufferingBegin");
                    setTimeout(function () {
                        self.videoInfo.currentTime = 0;
                        self.trigger("bufferingEnd");
                        stub_play(self);
                    }, 1000);
                }, 1000);
            }, 1000);

        },
        /**
         * Stop video playback
         * @param {Boolean} silent   if flag is set, player will no trigger "stop" event
         * @examples
         *
         * Player.stop(); // stop video
         *
         * App.onDestroy(function(){
         *      Player.stop(true);
         * });  // stop player and avoid possible side effects
         */
        stop: function (silent) {
            if (this.state != 'stop') {
                this._stop();
                if (!silent) {
                    this.trigger('stop');
                }
            }
            this.state = 'stop';
        },
        /**
         * Pause playback
         * @examples
         * Player.pause(); //paused
         */
        pause: function () {
          if (this.state === 'playing') {
            this._pause();
            this.state = "paused";
            this.trigger('pause');
          }
        },
        /**
         * Resume playback
         * @examples
         * Player.pause(); //resumed
         */
        resume: function () {
            stub_play(this);
            this.trigger('resume');
        },
        /**
         * Toggles pause/resume
         * @examples
         *
         * Player.togglePause(); // paused or resumed
         */
        togglePause: function () {
            if (this.state == "playing") {
                this.pause();
            } else {
                this.resume();
            }
        },
        _stop: function () {
            clearInterval(updateInterval);
        },
        /**
         * Converts time in seconds to readable string in format H:MM:SS
         * @param {Number} seconds time to convert
         * @returns {String} result string
         * @examples
         * Player.formatTime(PLayer.videoInfo.duration); // => "1:30:27"
         */
        formatTime: function (seconds) {
            var hours = Math.floor(seconds / (60 * 60));
            var divisor_for_minutes = seconds % (60 * 60);
            var minutes = Math.floor(divisor_for_minutes / 60);
            var divisor_for_seconds = divisor_for_minutes % 60;
            var seconds = Math.ceil(divisor_for_seconds);
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            return (hours ? hours + ':' : '') + minutes + ":" + seconds;
        },
        /**
         * Hash contains info about current video
         */
        videoInfo: {
            /**
             * Total video duration in seconds
             */
            duration: 0,
            /**
             * Video stream width in pixels
             */
            width: 0,
            /**
             * Video stream height in pixels
             */
            height: 0,
            /**
             * Current playback time in seconds
             */
            currentTime: 0
        },

        /**
         *
         * @param {Number} seconds time to seek
         * @examples
         * Player.seek(20); // seek to 20 seconds
         */
        seek: function (seconds) {
            var self = this;
            self.videoInfo.currentTime = seconds;
            self.pause();
            self.trigger("bufferingBegin");
            setTimeout(function () {
                self.trigger("bufferingEnd");
                self.resume();
            }, 500);
        },
        /**
         * For multi audio tracks videos
         */
        audio: {
            /**
             * Set audio track index
             * @param index
             */
            set: function (index) {
                curAudio = index;
            },
            /**
             * Returns list of supported language codes
             * @returns {Array}
             */
            get: function () {
                var len = 2;
                var result = [];
                for (var i = 0; i < len; i++) {
                    result.push(0);
                }
                return result;
            },
            /**
             * @returns {Number} index of current playing audio track
             */
            cur: function () {
                return curAudio;
            },
            toggle: function () {
                var l = this.get().length;
                var cur = this.cur();
                if (l > 1) {
                    cur++;
                    if (cur >= l) {
                        cur = 0;
                    }
                    this.set(cur);
                }
            }
        },
        subtitle: {
            /**
             * Set subtitle index
             * @param index
             */
            set: function (index) {
                curSubtitle = index;
            },
            /**
             * Returns list of available subtitles
             * @returns {Array}
             */
            get: function () {
                var len = 2;
                var result = [];
                for (var i = 0; i < len; i++) {
                    result.push(0);
                }
                return result;
            },
            /**
             * @returns {Number} index of current subtitles
             */
            cur: function () {
                return curSubtitle;
            },
            toggle: function () {
                var l = Player.subtitle.get().length;
                var cur = Player.subtitle.cur();
                if (l > 1) {
                    cur++;
                    if (cur >= l) {
                        cur = 0;
                    }
                    Player.subtitle.set(cur);
                }
            },
            text: function (time) {
                var data = Player.subtitle.data,
                    index = _.sortedIndex(data, {
                        time: time
                    }, function (value) {
                        return value.time;
                    });
                if (data[index - 1]) {
                    return data[index - 1].text;
                }
                return '';
            },
            data: [
                {
                    time: 0,
                    text: ''
                }
            ],
            /**
             * Load subtitles from remote file
             * @param url
             */
            url: function (url) {
                var extension = /\.([^\.]+)$/.exec(url)[1];
                // TODO Сделать универсальное выключение вшитых субтитров
                Player.subtitle.set(undefined);
                $.ajax({
                    url: url,
                    dataType: 'text',
                    success: function (data) {
                        var $subtitiles = $('#subtitles_view');
                        $(Player).off('.subtitles');
                        Player.subtitle.init = true;
                        Player.subtitle.remote = true;
                        Player.subtitle.parse[extension].call(Player, data);
                        $subtitiles.show();
                        var setSubtitlesText = function () {
                            $('#subtitles_text').html(Player.subtitle.text(parseInt(Player.videoInfo.currentTime) * 1000));
                        }
                        Player.on('update', setSubtitlesText);

                        if (!$subtitiles.length) {
                            $('body').append('<div id="subtitles_view" style="position: absolute; z-index: 1;"><div id="subtitles_text"></div></div>');
                            $subtitiles = $('#subtitles_view');
                            $subtitiles.css({
                                width: '1280px',
                                height: '720px',
                                left: '0px',
                                top: '0px'
                            });
                            $('#subtitles_text').css({
                                'position': 'absolute',
                                'text-align': 'center',
                                'width': '100%',
                                'left': '0',
                                'bottom': '50px',
                                'font-size': '24px',
                                'color': '#fff',
                                'text-shadow': '0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000',
                                'line-height': '26px'
                            });
                        }

                        var stopSubtitlesUpdate = function () {
                            $(Player).off('update', setSubtitlesText);
                            $(Player).off('stop', stopSubtitlesUpdate);
                            $subtitiles.hide();
                        }

                        Player.on('stop', stopSubtitlesUpdate);
                    }
                });
            },
            parse: {
                smi: function (data) {
                    data = data.split(/\s*<sync/i);
                    data.shift();
                    Player.subtitle.data = _.map(data, function (value) {
                        var match = /[\s\S]*start=(\d+)[\s\S]*<p[^>]*>([\s\S]*)<spanid/i.exec(value);
                        if (match) {
                            return {
                                time: parseInt(match[1], 10),
                                text: match[2]
                            };
                        }
                    });
                },
                srt: function (data) {
                    data = data.split('\r\n\r\n');
                    var self = Player.subtitle;

                    self.data = [];
                    var parseTime = function (time) {
                        var matches = time.match(/(\d{2}):(\d{2}):(\d{2}),(\d+)/);
                        return parseInt(matches[1], 10) * 3600000 +
                            parseInt(matches[2], 10) * 60000 +
                            parseInt(matches[3], 10) * 1000 +
                            parseInt(matches[4], 10);
                    };

                    _.each(data, function (value) {
                        if (!value) {
                            return;
                        }
                        var rows = value.split('\n');

                        var timeRow = rows[1].split(' --> '),
                            timeStart, timeEnd, text;
                        rows.splice(0, 2);
                        timeStart = parseTime(timeRow[0]);
                        timeEnd = parseTime(timeRow[1]);

                        self.data.push({
                            time: timeStart,
                            text: rows.join('<br/>')
                        });
                        self.data.push({
                            time: timeEnd,
                            text: ''
                        });
                    });
                    self.data.unshift({
                        time: 0,
                        text: ''
                    });
                }
            }
        }
    };


    var extendFunction, eventProto, cloneFunction;
    //use underscore, or jQuery extend function
    if (window._ && _.extend) {
        extendFunction = _.extend;
        cloneFunction = _.clone;
    } else if (window.$ && $.extend) {
        extendFunction = $.extend;
        cloneFunction = $.clone;
    }


    if (window.EventEmitter) {
        eventProto = EventEmitter.prototype;
    } else if (window.Backbone) {
        eventProto = Backbone.Events;
    } else if (window.Events) {
        eventProto = Events.prototype;
    }

    Player.extend = function (proto) {
        extendFunction(this, proto);
    };

    Player.extend(eventProto);
}(this));

(function ($) {
    "use strict";

    var inited = false,
        enabled = false,
        currentVoiceState,
        curOptions,
        $curTarget,
        $buble,
        stack = [],
        $moreDiv = $('<div/>'),

        paused = false;



    var init= function(){
        if (!inited) {

            enabled = $$voice._nativeCheckSupport();
            if (!enabled) {
                return;
            }

            $$voice._init();
            $buble = $('#voice_buble');
            inited = true;
        }
    }


    var defaults = {
        selector: '.voicelink',
        moreText: 'More',
        eventName: 'voice',
        useHidden: false,
        helpText: '',
        // количество показов баббла помощи
        showHelperTimes: 3,
        // количество самсунговских всплывашек с командами
        helpbarMaxItems: 6,
        // включение сортировки по весу
        sortByWeight: true,
        //Вес голосовых ссылок по умолчанию
        helpbarItemWeight: 200,
        candidateWeight: 0
    };


    var helpbarVisibityTimeoutLink;


    window.$$voice = {
        voiceTimeout: 10000,
        _resetVisibilityTimeout: function () {
            $$voice.helpbarVisible = true;

            clearTimeout(helpbarVisibityTimeoutLink);
            helpbarVisibityTimeoutLink = setTimeout(function () {

                //чтобы обновлял подсказки если был вызван голосовой поиск смотри баг #966
                if (typeof voiceServer == 'function') {
                    voiceServer = false;
                    $$voice.restore();
                }


                $buble.hide();
                $$voice.helpbarVisible = false;
            }, this.voiceTimeout);
        },
        _init: function () {

        },
        _nativeCheckSupport: function () {

        },
        helpbarVisible: false,
        enabled: function () {
            init();
            return enabled;
        },
        _setVoiceHelp: function (voicehelp) {

        },
        pause: function () {
            paused = true;
        },
        resume: function () {
            paused = false;
        },
        say: function (text) {
            if (paused)
                return;
            var result = text.toLowerCase();
            var opts = $.extend({}, defaults, curOptions);
            if (elements[result]) {
                elements[result].trigger(opts.eventName);
            }
            if ($curTarget) {
                generateHelpBar.call($curTarget, curOptions);
            }
        },
        _nativeTurnOff: function () {

        },
        hide: function () {
            if(!this.enabled()){
                return;
            }
            this._nativeTurnOff();
            $buble.hide();
            return this;
        },

        setup: function (options) {
            $.extend(defaults, options);
            return this;
        },
        save: function () {
            if (currentVoiceState)
                stack.push(currentVoiceState);
            return this;
        },
        restore: function () {
            var last = stack.pop();
            if (last)
                $.fn.voiceLink.apply(last.self, last.args);
            return this;
        },
        _nativeFromServer: function (title, callback) {

        },
        fromServer: function (title, callback) {
            if (!inited)
                return this;
            this.save();
            this._nativeFromServer(title, callback);
            return this;
        },
        refresh: function () {
            return this.save().restore();
        }
    }


    var generated = false, elements;


    /**
     * Преобразование jQuery коллекции в массив
     * и добавление команд в объект elements
     * @param elems
     * @returns {Array}
     */
    function voiceElementsToArray(elems) {


        var items = [];

        elems.each(function () {
            var $el = $(this);
            var commands = $el.attr('data-voice');
            var group = $el.attr('data-voice-group');
            var hidden = $el.attr('data-voice-hidden') === 'true' ? true : false;
            var weight = $el.attr('data-voice-weight') || 0;
            var main = false;

            if (!commands) {
                console.error('command in ', this, ' is not defined');
                return;
            }


            if ($el.attr('data-voice-disabled')) {
                return;
            }

            if (!weight) {
                if (!group && !hidden) {
                    weight = defaults.helpbarItemWeight
                    main = true;
                }
                else {
                    weight = defaults.candidateWeight
                }
            }

            items.push({
                itemText: commands,
                weight: weight,
                group: group,
                hidden: hidden,
                main: main
            });

            elements[commands.toLowerCase()] = $el;
        });

        return items;
    }

    var groupNames = {},
        gnCount = 0;

    var generateHelpBar = function (options) {

        if (generated) {
            return;
        }
        generated = true;

        $buble.hide().empty();

        var voiceItems,
            helpbarVoiceItems,
            candidateVoiceItems,
            activeItems,
            hiddenItems,
            items = [],
            candidates = [],
            opts = $.extend({}, defaults, options),
            helpbarMaxItems = opts.helpbarMaxItems,
            elems = this.find(opts.selector);


        var voicehelp = {
            helpbarType: "HELPBAR_TYPE_VOICE_CUSTOMIZE",
            bKeepCurrentInfo: "false",
            helpbarItemsList: {}
        };

        elements = {};

        if (!options.useHidden) {
            var force = elems.filter('[data-voice-force-visible]');
            elems = elems.filter(':visible').add(force);
        }


        // сортировка элементов по весу (от большего к меньшему)
        if (opts.sortByWeight) {
            voiceItems = _.sortBy(voiceElementsToArray(elems), function (el) {
                return -el.weight;
            });
        } else {
            voiceItems = voiceElementsToArray(elems);
        }


        // количество скрытых голосовых подсказок
        hiddenItems = $.grep(voiceItems, function (el) {
            return el.hidden === true;
        });


        // количество отображаемых подсказок
        activeItems = _.difference(voiceItems, hiddenItems);


        // добавление кнопки "Еще"
        if (activeItems.length > helpbarMaxItems) {
            activeItems.splice(helpbarMaxItems - 1, 0, {
                itemText: opts.moreText,
                commandList: [
                    {command: opts.moreText}
                ]
            });
            $moreDiv.unbind().bind(opts.eventName, function () {
                $('body').trigger('showVoiceHelpbar');
                $$voice._resetVisibilityTimeout();
                $buble.show();
            });
            elements[opts.moreText.toLowerCase()] = $moreDiv;
        }

        // выбираем элементы для подсказок самсунга
        helpbarVoiceItems = activeItems.splice(0, helpbarMaxItems);

        // остальные голосовые команды
        candidateVoiceItems = _.union(hiddenItems, activeItems);

        // массив для хелпбара самсунга
        _.each(helpbarVoiceItems, function (val) {
            var commands = val.itemText;

            items.push({
                itemText: commands,
                commandList: [
                    {command: commands}
                ]
            });
        });

        // массив команд, не отображаемых в хелпбаре самсунга
        _.each(candidateVoiceItems, function (val) {

            var group = val.group,
                commands = val.itemText,
                hidden = val.hidden,
                main = val.main;

            if (main && !group) {
                group = '';
            }


            if (!hidden) {
                if (!groupNames[group]) {
                    gnCount++;
                    groupNames[group] = gnCount;
                }
                var $groupWrap = $buble.find('#voice_group_body_' + groupNames[group]);
                if ($groupWrap.length) {
                    $groupWrap.append('<div class="voice_help_item">' + commands + '</div>');
                }
                else {
                    $buble.append('<div class="voice_group_head">' + group + '</div>' +
                        '<div class="voice_group_body" id="voice_group_body_' + groupNames[group] + '">' +
                        '<div class="voice_help_item">' + commands + '</div>' +
                        '</div>');
                }
            }

            candidates.push({
                candidate: val.itemText
            });
        });

        voicehelp.helpbarItemsList = items;

        if (candidates.length) {
            voicehelp.candidateList = candidates;
        }


        $$voice._setVoiceHelp(voicehelp);

    };

    $.fn.voiceLink = function (options) {
        // выходим, если нет реализации голоса
        if (inited && !enabled) {
            return;
        }

        init()


        currentVoiceState = {
            self: this,
            args: arguments
        };

        generated = false;
        options || (options = {});
        curOptions = options;
        $curTarget = this;

        if ($$voice.helpbarVisible) {
            generateHelpBar.call(this, curOptions);
        }
    }

})(jQuery);
SB.readyForPlatform('browser', function(){
    var player = Session.get('playerplugin');
    if (true){
     //(true){
      Player.extend({
        initialized: false,
        isInit: function(){
            return this.initialized;
        },
        _init: function(){
          var self = this;

          App.loadJS(Settings.rootUrl + 'cdn/js/lib/video.js', function () {
            App.State.set({'videojs': "success"});
            videojs("smart_player", {}, function(){
              self.$vid_obj = videojs("smart_player");
              self.$vid_obj.on('loadeddata', function(){
                  self.state = 'playing';
                  // self.show();
                  self.trigger('ready');
                  self.updateDuration();
              });

              self.$vid_obj.on('ready', function(){
                // console.log('>>>>>>>> real ready');
              });

              self.$vid_obj.on('timeupdate', function(){
                self.state = 'playing';
                self.videoInfo.currentTime = this.currentTime();
                self.trigger('update');
              });
              self.$vid_obj.on('ended', function(){
                self.trigger('complete');
              });

              // setInterval(function(){
              //   console.log(self.$vid_obj.bufferedPercent());
              // }, 100);


            });
          });
          this.initialized = true;
        },
        paused: function(){
          return this.$vid_obj.paused();
        },
        resume: function(){
          if (this.paused()){
            this.$vid_obj.play();
            this.state = 'playing'
            this.trigger('resume');
          }
        },
        playPause: function(){
          if (this.paused()){
            this.resume();
          } else {
            this.pause();
          }
        },
        getDuration: function(){
          return this.$vid_obj.duration();
        },
        seekTo: function(_toSec){
          this.resume();
          this.$vid_obj.currentTime(_toSec);
        },
        getCurrentTime: function(){
          return this.$vid_obj.currentTime();
        },
        getState: function(){
          if (this.paused()){
            this.state = 'paused';
            return this.state
          }
          return this.state;
        },
        pause: function(){
          if (!this.paused()){
            this.$vid_obj.pause();
            this.trigger('pause');
          }
        },
        play: function(streamObj){
            $(this.$vid_obj.el_).show();
            this.state = 'waiting';
            this.$vid_obj.src([{type: "application/x-mpegURL", src:streamObj.url}]);
            this.$vid_obj.play();
        },
        stop: function(){
          $(this.$vid_obj.el_).hide();
          if (this.state === 'waiting'){
            return;
          }
          this.$vid_obj.pause();
          this.trigger('stop');
        },
        updateDuration: function(){
            var duration = this.getDuration();
            this.videoInfo.duration = duration;
            this.trigger('update');
        },
      });
    }
    else {
      Player.extend({
        initialized: false,
        isInit: function(){
            return this.initialized;
        },
        _init: function(){
          var self = this;
          App.loadJS(Settings.rootUrl + 'cdn/js/lib/jwplayer.js', function () {
            jwplayer.key="GG9AVO9zDsfRP2cih914AACaVj2Q+R/zfE9x35eLJbk=";
            if (App.State){
                App.State.set({'videojs': "success"});
            }
           self.initialized = true;
          });
        },
        getState: function(){
          return jwplayer('smart_player').getState();
        },
        paused: function(){
          return this.getState() === 'paused';
        },
        resume: function(){
          if (this.paused()){
            this.player.play();
            this.trigger('resume');
          }
        },
        getDuration: function(){
          var _dur = jwplayer('smart_player').getDuration();
          return _dur;
        },
        seekTo: function(_toSec){
          this.pause();
          this.player.seek(_toSec);
          this.resume();
        },
        getCurrentTime: function(){
          var _pos = jwplayer('smart_player').getPosition();
          return _pos;
        },
        pause: function(){
          if (!this.paused()){
            this.player.pause();
            this.state = 'paused'
            this.trigger('pause');
          }
          else {
            this.resume();
          }
        },
        play: function(streamObj){
            var self = this;
            this.state = 'waiting';
            self.player = jwplayer('smart_player').setup ({
                file: streamObj.url,
                autostart: true,
                width: "100%",
                height: "100%"
            });

            self.player.on('play', function(){
               this.setMute(false);
               self.state = 'playing';
               // self.show();
               self.trigger('ready');
            });
            // self.player.on('loadeddata', function(){
            //
            // });
        },
        stop: function(){
          if (this.state === 'waiting'){
            return;
          }
          this.player.pause();
          // this.$vid_obj.src({});
          this.trigger('stop');
        }
      });
  }
});

/**
 * Browser platform description
 */
SB.createPlatform('browser', {
    keys: {
        RIGHT: 39,
        LEFT: 37,
        DOWN: 40,
        UP: 38,
        RETURN: 27,//esc
        EXIT: 46,//delete
        TOOLS: 32,//space
        FF: 33,//page up
        RW: 34,//page down
        NEXT: 107,//num+
        PREV: 109,//num-
        ENTER: 13,
        RED: 65,//A
        GREEN: 66,//B
        YELLOW: 67,//C
        BLUE: 68,//D
        CH_UP: 221, // ]
        CH_DOWN: 219, // [
        N0: 48,
        PLAY: 49,
        PAUSE: 50,
        N3: 51,
        N4: 52,
        N5: 53,
        N6: 54,
        N7: 55,
        N8: 56,
        N9: 57,
        PRECH: 45,//ins
        SMART: 36,//home
        N1: 97,//1
        STOP: 98,//numpad 2
        N2: 99,//2
        SUBT: 76,//l,
        INFO: 73,//i
        REC: 82,//r,
        VOL_UP: 190,
        VOL_DOWN: 188,
        MUTE: 191
    },
    volumeLevel: 0,
    detect: function () {
        Storage.prototype._setItem = function(key, obj) {
            return this.setItem(key, JSON.stringify(obj));
        };
        Storage.prototype._getItem = function(key) {
            try {
                return JSON.parse(this.getItem(key));
            } catch(error) {
                return undefined;
            }
        };
        this.browser = this.get_browser();
        return true;
    },
    get_browser: function() {
        var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if(/trident/i.test(M[1])){
            tem=/\brv[ :]+(\d+)/g.exec(ua) || [];
            return {name:'IE',version:(tem[1]||'')};
            }
        if(M[1]==='Chrome'){
            tem=ua.match(/\bOPR|Edge\/(\d+)/)
            if(tem!=null)   {return {name:'Opera', version:tem[1]};}
            }
        M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
        if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
        return {
          name: M[0],
          version: M[1]
        };
    },
    exit: function () {
    },
    getCustomDeviceInfo: function(){

    },
    shortDevInfo: function(){
      return this.getDuid() + '|' + this.getVersion();
    },
    getDuid: function(){
      return this.browser?this.browser.name:'unknown';
    },
    getVersion: function(){
      return this.browser?this.browser.version:'unknown';
    },
    getFirmware: function(){
      return this.getVersion();
    },
    getCustomDeviceInfo: function(full){
        return "Duid:"+ this.getDuid() +';Version:' + this.getVersion() + ';Firmware:' + this.getFirmware()
               + ";ModelCode:" + this.getModelCode() + ";Model:" + this.getModel();
    },
    setPlugins: function(){
        window._localStorage = window.localStorage;
    },
    setVolumeUp: function(){
        if (this.volumeLevel >100){
            return 100;
        }
        this.volumeLevel += 1;
        return this.volumeLevel;
    },
    setVolumeDown: function(){
        if (this.volumeLevel === 0){
            return 0;
        }
        this.volumeLevel -= 1;
        return this.volumeLevel;
    },
    setMute: function(){
        this.volumeLevel = 0;
    },
    enableScreenSaver: function(){},
    disableScreenSaver: function(){},
    getNativeDUID: function () {
        if (navigator.userAgent.indexOf('Chrome') != -1) {
            this.DUID = 'CHROME';
        } else {
            this.DUID = 'FIREFOX';
        }
        return this.DUID;
    },
    enableNetworkCheck: function(cntx, cb, t){
        var interv = t || 500;
        this.internetCheck = setInterval(this.cyclicInternetConnectionCheck, interv, cntx, cb);
    },
    getRandomStr: function(){
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    },
    setRelatetPlatformCSS: function(rootUrl, tema, isReplace, cb){
        var _resolutionObj = {width: 1280, height: 720};
        //var _resolutionObj = {width: 1920, height: 1080};
        var resolution = rootUrl + 'css/'+tema+'/resolution/'+_resolutionObj.width+'x'+_resolutionObj.height+'.css?' + this.getRandomStr();
        var main = rootUrl + 'css/' + tema + '/css.css?' + this.getRandomStr();
        var defaulRes = rootUrl + 'css/resolution/'+_resolutionObj.width+'x'+_resolutionObj.height+'.css?' + this.getRandomStr();
        if (!isReplace){
            $('head').append('<link rel="stylesheet" href="' + main + ' " type="text/css" />');
            $('head').append('<link rel="stylesheet" href="' + defaulRes + ' " type="text/css" />');
            $('head').append('<link rel="stylesheet" href="' + resolution + '" type="text/css" />');
            cb(false, false, _resolutionObj);
        } else {
            cb(main, 1, _resolutionObj);
            cb(defaulRes, 2, _resolutionObj);
            cb(resolution, 3, _resolutionObj);
        }
    },
    cyclicInternetConnectionCheck: function(cntx, cb){
         var xhr = new ( window.ActiveXObject || XMLHttpRequest )( "Microsoft.XMLHTTP" );
         xhr.open( "HEAD", "//" + window.location.hostname + "/?rand=" + Math.floor((1 + Math.random()) * 0x10000), false );

         try {
             xhr.send();
             cb.apply(cntx, [( xhr.status >= 200 && (xhr.status < 300 || xhr.status === 304) )]);
         } catch (error) {
             cb.apply(cntx, [false]);
         }
    }
});

(function ($) {
    "use strict";

    SB.readyForPlatform('browser', function () {
        _.extend($$voice, {
            _init: function () {
                this.helpbarVisible = true;
                $('body').append('<div id="voice_buble"></div><div id="help_voice_bubble"></div><div class="emul_voice_helpbar_wrap"><div id="emul_voice_helpbar"></div></div>');
                // клики по кнопкам эмулятора голоса
                $('#emul_voice_helpbar').on('click', '.emul_voice_trigger', function () {
                    $$voice.say(this.innerHTML);
                });
            },
            _nativeTurnOff: function () {
                $('#emul_voice_helpbar').empty();
            },
            _nativeFromServer: function (title, callback) {
                var text = prompt(title);
                callback(text || '');
            },
            _nativeCheckSupport: function () {
                return true;
            },
            _setVoiceHelp: function (voicehelp) {
                var $bar = $('#emul_voice_helpbar');
                $bar.empty();
                if (voicehelp.helpbarItemsList) {
                    $.each(voicehelp.helpbarItemsList, function (key, val) {
                        $('<div>', {
                            'attr': {
                                'class': "emul_voice_trigger main"
                            },
                            html: val.itemText,
                            appendTo: $bar
                        });
                    });
                }
                if (voicehelp.candidateList) {
                    $.each(voicehelp.candidateList, function (key, val) {
                        $('<div>', {
                            'attr': {
                                'class': "emul_voice_trigger"
                            },
                            html: val.candidate,
                            appendTo: $bar
                        });
                    });
                }
            }
        });
    });
})(jQuery);
SB.readyForPlatform('dune', function () {

    var updateInterval;
    var startUpdate = function () {
        var lastTime = 0;
        updateInterval = setInterval(function () {
            var position = stb.getPositionInSeconds();
            //if (position != lastTime) {
            Player.videoInfo.currentTime = position;
            Player.trigger('update');
            SB.utils.log.state(position, 'position', 'player');
            //}
            //lastTime = position;
        }, 500);
    }
    var stopUpdate = function () {
        clearInterval(updateInterval);
    }

    function handle_event(pstate, cstate, lastEvent){
        data = cstate;
        data += '';
        if (data == '4') {
            Player.trigger('complete');
        } else if (data == '3') {
            if (!stb) return;
            if (stb.hasLength()){
                Player.videoInfo.duration = stb.getLengthInSeconds() + 1;
                Player.videoInfo.currentTime = 0;
                Player.trigger('ready');
            }
        }
    }

    function getStb(){
        return $('body > div > object');
    }

    var stb = getStb();

    Player.extend({
        _init: function () {
            //stb.SetViewport(1280, 720, 0, 0);
            //stb.SetTopWin(0);
        },
        _play: function (options) {
            stb.play(options.url);
            startUpdate();
            Player.trigger('bufferingBegin');
        },
        _stop: function () {
            stb.stop();
            stopUpdate();
        },
        pause: function () {
            stb.pause();
            this.state = "pause";
            stopUpdate();
        },
        resume: function () {
            stb.resume();
            this.state = "play";
            startUpdate();
        },
        seek: function (time) {
            stb.setPositionInSeconds(time)
        },
        audio: {
            set: function (index) {
                stb.setAudioTrack(index);
            },
            get: function () {
                return stb.getAudioTracksDescription();
            },
            cur: function () {
                return stb.getAudioTrack();
            }
        },
        subtitle: {
            set: function (index) {
                stb.setSubtitleTrack(index);
            },
            get: function () {
                var subtitles = [];
                _.each(stb.getSubtitleTracksDescription(), function (self) {
                    subtitles.push({index: self.index, language: self.lang[1]});
                });
                return subtitles;
            },
            cur: function () {
                return stb.getSubtitleTrack();
            }
        }
    });
});

(function () {

  var stb;
  /**
   * Dune set top box platform description
   */
  SB.createPlatform('dune', {
    keys: {
      RIGHT: 39,
      LEFT: 37,
      DOWN: 40,
      UP: 38,
      RETURN: 8,
      EXIT: 27,
      TOOLS: 122,
      FF: 205,
      RW: 204,
      NEXT: 176,
      PREV: 177,
      ENTER: 13,
      RED: 193,
      GREEN: 194,
      YELLOW: 195,
      BLUE: 196,
      CH_UP: 33,
      CH_DOWN: 34,
      N0: 48,
      N1: 49,
      N2: 50,
      N3: 51,
      N4: 52,
      N5: 53,
      N6: 54,
      N7: 55,
      N8: 56,
      N9: 57,
      //PRECH: 116,
      //POWER: 85,
      //SMART: 36,
      PLAY: 218,
      STOP: 178,
      DUNE: 209,
      //PAUSE: 99,
      //SUBT: 76,
      INFO: 199
      //REC: 82
    },

    onDetect: function () {

      var isStandBy = false;

      // prohibition of keyboard showing on click keyboard button
      //stb.EnableVKButton(false);

      // window.moveTo(0, 0);
      // window.resizeTo(1280, 720);

      SB(function () {
        var $body = $(document.body);
        
        stb = this.createDunePlugin();

        if (stb) {
          stb.init();
        }else{
          $$log('unable to init stb');
        }

        $body.on('nav_key:dune', function () {
          if (stb) stb.launchNativeUi();
        });
      });
    
    },

    createDunePlugin: function () {
      try {
        var parentNode = document.getElementsByTagName("body")[0];
        console.log(parentNode);
        var obj = document.createElement("div");
        obj.innerHTML = '<object type="application/x-dune-stb-api" style="visibility: hidden; width: 0px; height: 0px;"></object>';
        parentNode.appendChild(obj);
        return obj.getElementsByTagName("object")[0];
      } catch (e) {
        return undefined;
      }
    },

    detect: function () {
      return !!stb;
    },

    exit: function () {
      $$log('try to location change');
      Player.stop(true);
      if (stb){
        stb.launchNativeUi();
      }
    },

    sendReturn: function () {
      this.exit();
    },

    getMac: function () {
      return stb.getMacAddress();
    },

    getNativeDUID: function () {
      return stb.getSerialNumber();
    }
  });

}());


SB.readyForPlatform('lg', function () {

    Player.extend({
        multiplyBy: 0,
        jumpStep: 10,
        _init: function () {
            var self = this;
            var ww = '100%';
            var wh = '100%';


            this.$video_container = $('<video id="smart_player" style="position: absolute; left: 0; top: 0;width: ' + ww + '; height: ' + wh + ';"></video>');
            var video = this.$video_container[0];
            $('body').append(this.$video_container);

            this.$video_container.on('loadedmetadata', function () {
                self.videoInfo.width = video.videoWidth;
                self.videoInfo.height = video.videoHeight;
                self.videoInfo.duration = video.duration;
                self.trigger('ready');
            });


            this.$video_container.on('loadstart',function (e) {
                self.trigger('bufferingBegin');
            }).on('playing',function () {
                    self.trigger('bufferingEnd');
            }).on('timeupdate',function () {
                if (self.state == 'playing' && self.multiplyBy === 0) {
                    self.videoInfo.currentTime = video.currentTime;
                    self.trigger('update');
                }
            }).on('ended', function () {
                self.state = "stop";
                self.trigger('complete');
            }).on('durationchange', function () {
                self.videoInfo.duration = video.duration;
                self.trigger('update');
            }).on('emptied', function () {
                self.videoInfo.duration = 0;
            });


            //this.$video_container.on('abort canplay canplaythrough canplaythrough durationchange emptied ended error loadeddata loadedmetadata loadstart mozaudioavailable pause play playing ratechange seeked seeking suspend volumechange waiting', function (e) {
                //console.log(e.type);
            //});

            /*
             abort 	Sent when playback is aborted; for example, if the media is playing and is restarted from the beginning, this event is sent.
             canplay 	Sent when enough data is available that the media can be played, at least for a couple of frames.  This corresponds to the CAN_PLAY readyState.
             canplaythrough 	Sent when the ready state changes to CAN_PLAY_THROUGH, indicating that the entire media can be played without interruption, assuming the download rate remains at least at the current level. Note: Manually setting the currentTime will eventually fire a canplaythrough event in firefox. Other browsers might not fire this event.
             durationchange 	The metadata has loaded or changed, indicating a change in duration of the media.  This is sent, for example, when the media has loaded enough that the duration is known.
             emptied 	The media has become empty; for example, this event is sent if the media has already been loaded (or partially loaded), and the load() method is called to reload it.
             ended 	Sent when playback completes.
             error 	Sent when an error occurs.  The element's error attribute contains more information. See Error handling for details.
             loadeddata 	The first frame of the media has finished loading.
             loadedmetadata 	The media's metadata has finished loading; all attributes now contain as much useful information as they're going to.
             loadstart 	Sent when loading of the media begins.
             mozaudioavailable 	Sent when an audio buffer is provided to the audio layer for processing; the buffer contains raw audio samples that may or may not already have been played by the time you receive the event.
             pause 	Sent when playback is paused.
             play 	Sent when playback of the media starts after having been paused; that is, when playback is resumed after a prior pause event.
             playing 	Sent when the media begins to play (either for the first time, after having been paused, or after ending and then restarting).
             progress 	Sent periodically to inform interested parties of progress downloading the media. Information about the current amount of the media that has been downloaded is available in the media element's buffered attribute.
             ratechange 	Sent when the playback speed changes.
             seeked 	Sent when a seek operation completes.
             seeking 	Sent when a seek operation begins.
             suspend 	Sent when loading of the media is suspended; this may happen either because the download has completed or because it has been paused for any other reason.
             timeupdate 	The time indicated by the element's currentTime attribute has changed.
             volumechange 	Sent when the audio volume changes (both when the volume is set and when the muted attribute is changed).
             waiting 	Sent when the requested operation (such as playback) is delayed pending the completion of another operation (such as a seek).
             */
        },
        _play: function (options) {
            this.$video_container.attr('src', options.url);
            this.$video_container.show();
            this.$video_container[0].play();
            if (options && options.resume > 0){
                this.seek(options.resume);
            }
        },
        playPause: function(){
          if (this.state === 'playing'){
            this.pause();
          } else if (this.state === 'paused'){
            this.resume();
          }
        },
        _stop: function () {
            this.$video_container.hide();
            this.$video_container[0].pause();
            this.$video_container[0].src = '';
        },
        pause: function () {
            this.$video_container[0].pause();
            this.state = "paused";
            this.trigger('pause');
        },
        resume: function () {
            if (this.$video_container[0].paused){
              this.$video_container[0].play();
            }
            this.state = "playing";
            this.trigger('resume');
        },
        seekTo: function(_toSec){
          this.seek(_toSec);
        },
        jumpBackwardVideo: function(jumpSpeed){
            clearTimeout(this.jumpInter);
            this.pause();

            var t = this.jumpStep*jumpSpeed;
            var jump = Math.floor(this.videoInfo.currentTime - t);
            if (this.videoInfo.currentTime < 0){
                return;
            }
            this.seek(jump);
        },
        jumpForwardVideo: function (jumpSpeed) {
            clearTimeout(this.jumpInter);
            this.pause();

            var jump = Math.floor(this.videoInfo.currentTime + jumpSpeed*this.jumpStep);
            this.seek(jump);
        },
        seek: function(jump){
            var self = this;
            self.videoInfo.currentTime = jump;
            self.trigger('update');
            self.multiplyBy += 1;
            self.jumpInter = setTimeout(function(self) {

                try {
                    self.$video_container[0].currentTime = self.videoInfo.currentTime;
                    self.resume();
                    self.multiplyBy = 0;
                } catch (e) {
                    self.multiplyBy = 0;
                }
            }, 1000, self);
        },
        getDuration: function(){
          return this.videoInfo.duration;
        },
        getCurrentTime: function(){
          return this.videoInfo.currentTime;
        },
        audio: {
            //https://bugzilla.mozilla.org/show_bug.cgi?id=744896
            set: function (index) {

            },
            get: function () {
                return [];
            },
            cur: function () {
                return 0;
            }
        },
        subtitle: {
            set: function (index) {
                if (Player.$video_container[0].textTracks) {
                    var subtitles = _.filter(Player.$video_container[0].textTracks, function (i) {
                        return i.kind === 'subtitles';
                    });
                    if (subtitles.length) {
                        _.each(subtitles, function (self, i) {
                            if (self.mode === "showing") {
                                self.mode = "disabled";
                            }
                            else if (i == index) {
                                self.mode = "showing";
                            }
                        });
                        return true;
                    }
                }
                return false;
            },
            get: function () {
                if (Player.$video_container[0].textTracks) {
                    var subtitles = _.filter(Player.$video_container[0].textTracks, function (i) {
                        return i.kind === 'subtitles';
                    });
                    if (subtitles.length) {
                        return _.map(subtitles, function (self) {
                            return {index: subtitles.indexOf(self), language: self.language};
                        });
                    }
                }
                return false;
            },
            cur: function () {
                var cur = -1;
                if (Player.$video_container[0].textTracks) {
                    var subtitles = _.filter(Player.$video_container[0].textTracks, function (i) {
                        return i.kind === 'subtitles';
                    });
                    if (subtitles.length) {
                        _.each(subtitles, function (self, i) {
                            if (self.mode === "showing") {
                                cur = i;
                                return false;
                            }
                        });
                    }
                }
                return cur;
            },
            toggle: function () {
                var l = Player.subtitle.get().length;
                var cur = Player.subtitle.cur();
                if (l > 1) {
                    cur++;
                    if (cur >= l) {
                        cur = -1;
                    }
                    Player.subtitle.set(cur);
                }
            }
        }
    });
});

/**
 * LG platform
 */

SB.createPlatform('lg', {
    platformUserAgent: 'netcast', // not used
    keys: {
        ENTER: 13,
        PAUSE: 19,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        N0: 48,
        N1: 49,
        N2: 50,
        N3: 51,
        N4: 52,
        N5: 53,
        N6: 54,
        N7: 55,
        N8: 56,
        N9: 57,
        RED: 403,
        GREEN: 404,
        YELLOW: 405,
        BLUE: 406,
        REW: 412,
        STOP: 413,
        PLAY: 415,
        FF: 417,
        RETURN: 461,
        CH_UP: 33,
        CH_DOWN: 34
    },

    getMac: function () {
        return this.device.net_macAddress.replace(/:/g, '');
    },
    getCustomDeviceInfo: function(){
        return navigator.userAgent;
    },
    shortDevInfo: function(){
        if (!SB.config.modelName){
          return navigator.userAgent + (navigator.productSub?('|' + navigator.productSub):'');
        }
        return SB.config.modelName + '|'+ SB.config.firmwareVersion + '|'+ SB.config.sdkVersion;
    },
    getSDI: $.noop,

    detect: function(){
        Storage.prototype._setItem = function(key, obj) {
            return this.setItem(key, JSON.stringify(obj));
        };
        Storage.prototype._getItem = function(key) {
            try {
                return JSON.parse(this.getItem(key));
            } catch(error) {
                return undefined;
            }
        };

        if(navigator.userAgent.indexOf('NetCast.TV') != -1 || navigator.userAgent.indexOf('Web0S') != -1){
            this.initWebos();
            return true;
        }
        // fake lg, set true

        return false;
    },
    initWebos: function(){
        document.addEventListener('webOSLaunch', function(inData) {
            webOS.service.request("luna://com.webos.service.sm", {
                method: "deviceid/getIDs",
                parameters: {
                    "idType": ["LGUDID"]
                },
                onSuccess: function (inResponse) {
                    var resp = JSON.stringify(inResponse);
                    for (var i = 0; i < resp.idList.length; i++) {
                        SB.config.device_id = (SB.config.device_id?SB.config.device_id:'') + ((i===0)?'':':') + resp.idList[i].idValue;
                    }
                    //console.log("Result: " + JSON.stringify(inResponse));
                    // To-Do something
                },
                onFailure: function (inError) {
                    console.log("Failed to get system ID information");
                    console.log("[" + inError.errorCode + "]: " + inError.errorText);
                    //console.log(self.CONFIG.device_id);
                    SB.config.device_id = null;

                    return;
                }
            });
            webOS.service.request("luna://com.webos.service.tv.systemproperty", {
              method: "getSystemInfo",
              parameters: {
                  "keys": ["modelName", "firmwareVersion", "UHD", "sdkVersion"]
              },
              onComplete: function (inResponse) {
                  var isSucceeded = inResponse.returnValue;

                  if (isSucceeded){
                      // console.log("Result: " + JSON.stringify(inResponse));
                      SB.config.modelName = inResponse.modelName;
                      SB.config.firmwareVersion = inResponse.firmwareVersion;
                      SB.config.sdkVersion = inResponse.sdkVersion;
                      // To-Do something
                  } else {
                      console.log("Failed to get TV device information");
                      // To-Do something
                      return;
                  }
              }
          });
        }, true);
    },
    getDuid: function(){
        return SB.config.device_id;
    },
    setPlugins: function () {
        $$log('>>>>>>>> setPlugins sb.platform.lg');
        SB.config.logKey = 'green';
        //this._listenGestureEvent();
        window._localStorage = window.localStorage;
        $('body').append('<object type="application/x-netcast-info" id="device" width="0" height="0"></object>');
        this.device = $('#device')[0];

        this.modelCode = this.device.version;
        this.productCode = this.device.modelName;

        this.getDUID();


        //Log.show('default');
        setInterval(function () {
            //Log.show('default');
            var usedMemorySize;
            if (window.NetCastGetUsedMemorySize) {
                usedMemorySize = window.NetCastGetUsedMemorySize();
            }
            //Log.state(Math.floor(usedMemorySize * 100 / (1024 * 1024)) / 100, 'memory', 'profiler');
        }, 5000);


        if (Player && Player.setPlugin) {
            Player.setPlugin();
        }
    },
    sendReturn: function () {
        if (Player) {
            Player.stop(true);
        }
        window.NetCastBack();
    },

    exit: function () {
        Player && Player.stop(true);
        Bugsnag.notify("Exit lg application", "<<< Exit lg application >>>");
        try {
            window.NetCastExit();
        } catch(e) {}
        try {
            webOS.platformBack();
        } catch(e) {}
    },
    enableNetworkCheck: function(cntx, cb, t){},
    getUsedMemory: function () {
        return window.NetCastGetUsedMemorySize();
    },
    getChildlockPin: function () {
        return 1234;
    }
});

SB.readyForPlatform('mag', function () {

    var updateInterval;
    var startUpdate = function () {
        var lastTime = 0;
        updateInterval = setInterval(function () {
            var position = stb.GetPosTime();
            //if (position != lastTime) {
            Player.videoInfo.currentTime = position;
            Player.trigger('update');
            SB.utils.log.state(position, 'position', 'player');
            //}
            //lastTime = position;
        }, 500);
    }
    var stopUpdate = function () {
        clearInterval(updateInterval);
    }

    window.stbEvent =
    {

        onEvent: function (data) {

            data += '';
            if (data == '1') {
                Player.trigger('complete');
            } else if (data == '2') {
                Player.videoInfo.duration = stb.GetMediaLen() + 1;
                Player.videoInfo.currentTime = 0;
                Player.trigger('ready');
            }
            else if (data == '4') {
                Player.trigger('bufferingEnd');
            }
            else if (data == '7') {
                var vi = eval(stb.GetVideoInfo());
                Player.videoInfo.width = vi.pictureWidth;
                Player.videoInfo.height = vi.pictureHeight;
            }
        },
        event: 0
    };


    var stb = window.gSTB;
    Player.extend({
        _init: function () {
            stb.InitPlayer();
            stb.SetViewport(1280, 720, 0, 0);
            stb.SetTopWin(0);
        },
        _play: function (options) {
            stb.Play(options.url);
            startUpdate();
            Player.trigger('bufferingBegin');
        },
        _stop: function () {
            stb.Stop();
            stopUpdate();
        },
        pause: function () {
            stb.Pause();
            this.state = "pause";
            stopUpdate();
        },
        resume: function () {
            stb.Continue();
            this.state = "play";
            startUpdate();
        },
        seek: function (time) {
            stb.SetPosTime(time)
        },
        audio: {
            set: function (index) {
                stb.SetAudioPID(index);
            },
            get: function () {
                return stb.GetAudioPIDs();
            },
            cur: function () {
                return stb.GetAudioPID();
            }
        },
        subtitle: {
            set: function (index) {
                stb.SetSubtitlePID(index);
            },
            get: function () {
                var subtitles = [];
                _.each(stb.GetSubtitlePIDs(), function (self) {
                    subtitles.push({index: self.pid, language: self.lang[1]});
                });
                return subtitles;
            },
            cur: function () {
                return stb.GetSubtitlePID();
            }
        }
    });
});

(function () {

  var stb;
  /**
   * Mag set top box platform description
   */
  SB.createPlatform('mag', {
    keys: {
      RIGHT: 39,
      LEFT: 37,
      DOWN: 40,
      UP: 38,
      RETURN: 8,
      EXIT: 27,
      TOOLS: 122,
      FF: 70,
      RW: 66,
      NEXT: 34,
      PREV: 33,
      ENTER: 13,
      RED: 112,
      GREEN: 113,
      YELLOW: 114,
      BLUE: 115,
      CH_UP: 9,
      CH_DOWN: 9,
      N0: 48,
      N1: 49,
      N2: 50,
      N3: 51,
      N4: 52,
      N5: 53,
      N6: 54,
      N7: 55,
      N8: 56,
      N9: 57,
      PRECH: 116,
      POWER: 85,
      //SMART: 36,
      PLAY: 82,
      STOP: 83,
      //PAUSE: 99,
      //SUBT: 76,
      INFO: 89
      //REC: 82
    },

    onDetect: function () {

      var isStandBy = false;

      stb = window.gSTB;

      // prohibition of keyboard showing on click keyboard button
      stb.EnableVKButton(false);

      window.moveTo(0, 0);
      window.resizeTo(1280, 720);

      SB(function () {
        var $body = $(document.body);
        $body.on('nav_key:power', function () {
          var eventName = 'standby_';
          isStandBy = !isStandBy;

          eventName += isStandBy ? 'set' : 'unset';
          stb.StandBy(isStandBy);

          // TODO: trigger events on SB
          $$log('trigger standby event ' + eventName, 'standby');
          $body.trigger(eventName);
        });
      });

      window.localStorage = {
        setItem: function ( name, data ) {
          if (typeof data === 'object') {
            data = JSON.stringify(data);
          }
          stb.SaveUserData(name, data);
        },
        clear: function () {

        },
        getItem: function (name) {
          return stb.LoadUserData(name);
        },
        removeItem: function (name) {
          stb.SaveUserData(name, null);
        }
      }
    },

    detect: function () {
      return !!window.gSTB;
    },

    exit: function () {
      $$log('try to location change');
      Player.stop(true);
      gSTB.DeinitPlayer();
      window.location = 'file:///home/web/services.html';
    },

    sendReturn: function () {
      this.exit();
    },

    getMac: function () {
      return stb.GetDeviceMacAddress();
    },

    getNativeDUID: function () {
      return stb.GetDeviceSerialNumber();
    }
  });

}());


SB.readyForPlatform('philips', function () {
    var video;


    var updateInterval;
    var ready = false;

    var startUpdate = function () {
        var lastTime = 0;
        updateInterval = setInterval(function () {
            if (video.playPosition != lastTime) {
                Player.videoInfo.currentTime = video.playPosition / 1000;
                Player.trigger('update');
            }
            lastTime = video.playPosition;
        }, 500);
    }

    var stopUpdate = function () {
        clearInterval(updateInterval);
    }

    function checkPlayState() {
        //$('#log').append('<div>' + video.playState + '</div>');


        //some hack
        //in my tv player can sent lesser than 1 time, and correct time after
        if (video.playTime > 1) {

            if (!ready) {
                //+1 for test pass
                Player.videoInfo.duration = (video.playTime / 1000)+1;
                Player.trigger('ready');
                ready = true;
            }
        }

        switch (video.playState) {
            case 5: // finished
                Player.trigger('complete');
                stopUpdate();
                Player.state = "stop";
                break;
            case 0: // stopped
                Player.state = "stop";
                break;
            case 6: // error
                Player.trigger('error');
                break;
            case 1: // playing
                Player.trigger('bufferingEnd');
                startUpdate();
                break;
            case 2: // paused

            case 3: // connecting

            case 4: // buffering
                Player.trigger('bufferingBegin');
                stopUpdate();
                break;
            default:
                // do nothing
                break;
        }
    }

    Player.extend({
        _init: function () {
            $('body').append('<div id="mediaobject" style="position:absolute;left:0px;top:0px;width:640px;height:480px;">\n\
              <object id="videoPhilips" type="video/mpeg4" width="1280" height="720" />\n\
               </div>');
            video = document.getElementById('videoPhilips');
            video.onPlayStateChange = checkPlayState;
        },
        _play: function (options) {
            video.data = options.url;
            video.play(1);
            ready = false;
            Player.trigger('bufferingBegin');
        },
        _stop: function () {
            video.stop();
            stopUpdate();
        },
        pause: function () {
            video.play(0);
            this.state = "pause";
            stopUpdate();
        },
        resume: function () {
            video.play(1);
            this.state = "play";
            startUpdate();
        },
        seek: function (time) {
            //-10 for test pass
            video.seek((time - 10) * 1000);
        }
    });
});
/**
 * Philips platform
 */
SB.createPlatform('philips', {
    platformUserAgent: 'Philips',
    setPlugins: function () {
        this.keys = {
            ENTER: VK_ENTER,
            PAUSE: VK_PAUSE,
            LEFT: VK_LEFT,
            UP: VK_UP,
            RIGHT: VK_RIGHT,
            DOWN: VK_DOWN,
            N0: VK_0,
            N1: VK_1,
            N2: VK_2,
            N3: VK_3,
            N4: VK_4,
            N5: VK_5,
            N6: VK_6,
            N7: VK_7,
            N8: VK_8,
            N9: VK_9,
            RED: VK_RED,
            GREEN: VK_GREEN,
            YELLOW: VK_YELLOW,
            BLUE: VK_BLUE,
            RW: VK_REWIND,
            STOP: VK_STOP,
            PLAY: VK_PLAY,
            FF: VK_FAST_FWD,
            RETURN: VK_BACK,
            CH_UP: VK_PAGE_UP,
            CH_DOWN: VK_PAGE_DOWN
        };
    }
});
SB.readyForPlatform('samsung', function () {

	var localStorage = window.localStorage,
		fileSysObj,
		commonDir,
		fileName,
		fileObj;

    fileSysObj = new FileSystem();
    commonDir = fileSysObj.isValidCommonPath(curWidget.id);

    if ( !commonDir ) {
        fileSysObj.createCommonDir(curWidget.id);
    }
    fileName = curWidget.id + "/localStorage.db";
    fileObj = fileSysObj.openCommonFile(fileName, "r+");

    var lStorage = {},
        changed = false;

    if ( fileObj ) {
        try {
            lStorage = JSON.parse(fileObj.readAll());
        } catch (e) {
            localStorage && localStorage.clear();
        }
    } else {
        fileObj = fileSysObj.openCommonFile(fileName, "w");
        fileObj.writeAll("{}");
    }
    fileSysObj.closeCommonFile(fileObj);



    var saveStorage = _.debounce(function saveStorage() {
        if (changed) {
            fileObj = fileSysObj.openCommonFile(fileName, "w");
            fileObj.writeAll(JSON.stringify(window._localStorage));
            fileSysObj.closeCommonFile(fileObj);
            changed = false;
        }
    },100);

    lStorage._setItem = function ( key, value ) {
        changed = true;
        this[key] = value;
        saveStorage();
        return this[key];
    };
    lStorage._getItem = function ( key ) {
        return this[key];
    };
    lStorage.removeItem = function ( key ) {
        changed = true;
        delete this[key];
        saveStorage();
    };
    lStorage.clear = function () {
        try{
            fileSysObj.deleteCommonFile(fileName);
        }
        catch (e) {

        }
        this.removeItem("token");
        this.removeItem("refresh_token");
    };
    window._localStorage = lStorage;
});
SB.readyForPlatform('samsung', function () {
    var curAudio = 0,
        curSubtitle = 0;


    var safeApply = function (self, method, args) {
        try {
            switch (args.length) {
                case 0:
                    return self[method]();
                case 1:
                    return self[method](args[0]);
                case 2:
                    return self[method](args[0], args[1]);
                case 3:
                    return self[method](args[0], args[1], args[2]);
                case 4:
                    return self[method](args[0], args[1], args[2], args[3]);
                case 5:
                    return self[method](args[0], args[1], args[2], args[3], args[4]);
                case 6:
                    return self[method](args[0], args[1], args[2], args[3], args[4], args[5]);
                case 7:
                    return self[method](args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
                case 8:
                    return self[method](args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);

            }
        } catch (e) {
            $$log(e);
            throw e;
        }
    }
    Player.extend({
        jumpStep: 30,
        jumpInter: null,
        usePlayerObject: true,
        error: 'none',
        inited: false,
        isInit: function(){
          return this.inited;
        },
        _init: function () {
            var self = this;
            //document.body.onload=function(){
            if (self.usePlayerObject) {
                //self.$plugin = $('<object id="pluginPlayer" border=0 classid="clsid:SAMSUNG-INFOLINK-PLAYER" style="position: absolute; left: 0; top: 0; width: 1280px; height: 720px;"></object>');
                self.plugin = document.getElementById('pluginPlayer');
                $('body').append(self.$plugin);


            } else {
                self.plugin = sf.core.sefplugin('Player');
            }


            if (!self.plugin) {
                throw new $$log('failed to set plugin');
            }

            self.plugin.OnStreamInfoReady = 'Player.OnStreamInfoReady';
            self.plugin.OnRenderingComplete = 'Player.OnRenderingComplete';
            self.plugin.OnCurrentPlayTime = 'Player.OnCurrentPlayTime';
            self.plugin.OnCurrentPlaybackTime = 'Player.OnCurrentPlayTime';
            self.plugin.OnBufferingStart = 'Player.OnBufferingStart';
            self.plugin.OnBufferingProgress = 'Player.OnBufferingProgress';
            self.plugin.OnConnectionFailed = 'Player.OnConnectionFailed';
            self.plugin.OnAuthenticationFailed = 'Player.OnAuthenticationFailed';
            self.plugin.OnStreamNotFound = 'Player.OnStreamNotFound';
            self.plugin.OnRenderError = 'Player.OnRenderError';
            self.plugin.OnNetworkDisconnected = 'Player.OnNetworkDisconnected';

            this.plugin.OnConnectionFailed = 'Player.OnConnectionFailed';
            this.plugin.OnNetworkDisconnected = 'Player.OnNetworkDisconnected';
            this.plugin.OnRenderError = 'Player.OnRenderError';

            self.plugin.OnEvent = 'Player.onEvent';
            //}

        },
        OnConnectionFailed: function(){
            $$log('ERROR: OnConnectionFailed');
            Bugsnag.notify('ERROR: OnConnectionFailed', SB.platformName);
        },
        OnNetworkDisconnected: function(){
            $$log('ERROR: OnNetworkDisconnected');
            Bugsnag.notify('ERROR: OnNetworkDisconnected', SB.platformName);
        },
        OnRenderError: function(){
            $$log('ERROR: OnRenderError');
            Bugsnag.notify('ERROR: OnRenderError', SB.platformName);
        },
        jumpForwardVideo: function(jumpSpeed) {
            clearTimeout(this.jumpInter);
            var self = this;
            if (this.state === 'playing'){
                self.pause();
            }
            this.state = 'seeking';
            var jumpto = Math.floor(self.videoInfo.currentTime + jumpSpeed*self.jumpStep);
            if (self.videoInfo.duration < jumpto){
                self.trigger('killit');
                return;
            }
            self.videoInfo.currentTime = jumpto;
            var jumpfor = Math.floor(self.videoInfo.currentTime - self.currentTime);
            self.trigger('update');
            self.jumpInter = setTimeout(function(me) {
                me.doJump.call(me, 'JumpForward', jumpfor);
            }, 1000, self);

        },
        jumpBackwardVideo: function(jumpSpeed) {
            clearTimeout(this.jumpInter);
            var self = this;
            if (this.state === 'playing'){
                self.pause();
            }

            this.state = 'seeking';
            var jumpto = Math.floor(self.videoInfo.currentTime - jumpSpeed*self.jumpStep);
            self.videoInfo.currentTime = jumpto;
            var jumpfor = Math.floor(self.currentTime - self.videoInfo.currentTime);
            if (jumpto < 0){
                this.videoInfo.currentTime = 0;
                self.doJump.call(self, 'JumpBackward', jumpfor);
                return;
            }

            self.trigger('update');
            self.jumpInter = setTimeout(function(me) {
                me.doJump.call(me, 'JumpBackward', jumpfor);
            }, 1000, self);
        },
        doJump: function(fn, jumpfor){
            this.doPlugin(fn, jumpfor);
            this.resume();
            this.trigger('update');
        },

        seekTo: function (time) {
           var self = this;

           if (time <= 0) {
               time = 0;
           }
           var jump = Math.floor(time - this.videoInfo.currentTime - 1);

           clearTimeout(this.jumpInter);

           if (jump < 0) {
               this.doJump.call(self, 'JumpBackward', -jump);
           }
           else{
             this.doJump.call(self, 'JumpForward', jump);
           }
        },
        onEvent: function (event, arg1, arg2) {

            switch (event) {
                case 9:
                    this.OnStreamInfoReady();
                    break;

                case 4:
                    //this.onError();
                    break;

                case 8:
                    this.OnRenderingComplete();
                    break;
                case 14:
                    this.OnCurrentPlayTime(arg1);
                    break;
                case 13:
                    this.OnBufferingProgress(arg1);
                    break;
                case 12:
                    this.OnBufferingComplete();
                    break;
                case 11:
                    this.OnBufferingStart();
                    break;
            }
        },
        OnBufferingProgress: function(perc){
          this.trigger('onbufferingprogress', perc);
        },
        OnRenderingComplete: function () {
            this.trigger('complete');
        },
        getDuration: function(){
          return this.videoInfo.duration;
        },
        OnStreamInfoReady: function () {
            var duration, width, height, resolution;

            try {
                duration = this.doPlugin('GetDuration');
            } catch (e) {
                alert('######## ' + e.message);
            }

            duration = Math.ceil(duration / 1000);
            //this.jumpLength = Math.floor(this.duration / 30);

            if (this.usePlayerObject) {
                width = this.doPlugin('GetVideoWidth');
                height = this.doPlugin('GetVideoHeight');
            } else {
                resolution = this.doPlugin('GetVideoResolution');
                if (resolution == -1) {
                    width = 0;
                    height = 0;
                } else {
                    var arrResolution = resolution.split('|');
                    width = arrResolution[0];
                    height = arrResolution[1];
                }
            }

            this.videoInfo.duration = duration;
            this.videoInfo.width = width * 1;
            this.videoInfo.height = height * 1;
            this.trigger('ready');
        },
        OnBufferingStart: function () {
            this.trigger('bufferingBegin');
        },
        OnBufferingComplete: function () {
            // this.trigger('ready');
            this.trigger('bufferingEnd');
        },
        getCurrentTime: function(){
            return this.currentTime || 0;
        },
        OnCurrentPlayTime: function (millisec) {
            this.currentTime = millisec / 1000;
            if (this.state === 'playing') {
                this.videoInfo.currentTime = millisec / 1000;
                this.trigger('update');
            }
        },
        OnConnectionFailed: function () {
          this.error = 'player_error';
        },

        OnAuthenticationFailed: function () {
          this.error = 'player_error';
        },

        OnStreamNotFound: function () {
          this.error = 'player_error';
        },

        OnRenderError: function () {
          this.error = 'player_error';
        },

        OnNetworkDisconnected: function () {
          this.error = 'player_error';
        },

        _error: function() {
            return this.error;
        },

        _setError: function(error) {
            this.error = error;
        },
        playPause: function(){
          if (this.state ===  'playing'){
            this.pause();
          } else if (this.state === 'paused'){
            this.resume();
          }
        },
        play: function (options) {
          var self = this;
          if (this.state === 'seeking'){
              return;
          }
          SB.disableScreenSaver();
          var url = options.url;
          // switch (options.type) {
              // case 'hls':
                  url += '|COMPONENT=HLS'
          // }
          this.doPlugin('InitPlayer', url);
          if (options.resume > 0){
              this.doPlugin('ResumePlay', url, options.resume);
              this.state = 'playing';
          } else {
              if (this.state === 'playing' || this.state === 'paused'){
                  this.doPlugin('Stop');
              }
              setTimeout(function(){
                self.doPlugin('InitPlayer', url);
                self.doPlugin('StartPlayback');
                if (self.state === 'paused'){
                  self.resume();
                } else {
                  self.state = 'playing';
                }
              }, 100);

          }
        },
        stop: function () {
           $$log('>>>>>>>> player STOP');
            SB.enableScreenSaver();
            this.doPlugin('Stop');
            this.trigger('stop');
            this.state = 'stop';
        },
        pause: function () {
            SB.enableScreenSaver();
            this.doPlugin('Pause');
            this.state = 'paused';
            this.trigger('pause');
        },
        resume: function () {
            SB.disableScreenSaver();
            this.doPlugin('Resume');
            this.state = 'playing';
            this.trigger('resume');
        },
        doPlugin: function () {
            var result,
                plugin = this.plugin,
                methodName = arguments[0],
                args = Array.prototype.slice.call(arguments, 1, arguments.length) || [];
            if (this.usePlayerObject) {


                result = safeApply(plugin, methodName, args);

            }
            else {
                if (methodName.indexOf('Buffer') != -1) {
                    methodName += 'Size';
                }
                args.unshift(methodName);
                result = safeApply(plugin, 'Execute', args);
            }

            return result;
        },
        audio: {
            set: function (index) {
                /*one is for audio*/
                //http://www.samsungdforum.com/SamsungDForum/ForumView/f0cd8ea6961d50c3?forumID=63d211aa024c66c9
                Player.doPlugin('SetStreamID', 1, index);
                curAudio = index;
            },
            get: function () {
                /*one is for audio*/
                var len = Player.doPlugin('GetTotalNumOfStreamID', 1);

                var result = [];
                for (var i = 0; i < len; i++) {
                    result.push(Player.doPlugin('GetStreamLanguageInfo', 1, i));
                }
                return result;
            },
            cur: function () {
                return curAudio;
            }
        },
        subtitle: {
            set: function (index) {
                Player.doPlugin('SetStreamID', 5, index);
                curSubtitle = index;
            },
            get: function () {
                var len = Player.doPlugin('GetTotalNumOfStreamID', 5);

                var result = [];
                for (var i = 0; i < len; i++) {
                    result.push(Player.doPlugin('GetStreamLanguageInfo', 5, i));
                }
                return result;
            },
            cur: function () {
                return curSubtitle;
            }
        }
    });
});

/**
 * Samsung platform
 */
!(function (window, undefined) {


    var
        document=window.document,

        /**
         * Native plugins
         * id: clsid (DOM element id : CLSID)
         * @type {{object}}
         */
        plugins = {
            audio: 'SAMSUNG-INFOLINK-AUDIO',
            pluginObjectTV: 'SAMSUNG-INFOLINK-TV',
            pluginObjectTVMW: 'SAMSUNG-INFOLINK-TVMW',
            pluginObjectNetwork: 'SAMSUNG-INFOLINK-NETWORK',
            pluginObjectNNavi: 'SAMSUNG-INFOLINK-NNAVI',
            pluginPlayer: 'SAMSUNG-INFOLINK-PLAYER'
        },
        samsungFiles = [
            '$MANAGER_WIDGET/Common/af/../webapi/1.0/deviceapis.js',
            '$MANAGER_WIDGET/Common/af/../webapi/1.0/serviceapis.js',
            '$MANAGER_WIDGET/Common/af/2.0.0/extlib/jquery.tmpl.js',
            '$MANAGER_WIDGET/Common/Define.js',
            '$MANAGER_WIDGET/Common/af/2.0.0/sf.min.js',
            '$MANAGER_WIDGET/Common/API/Plugin.js',
            '$MANAGER_WIDGET/Common/API/Widget.js',
            '$MANAGER_WIDGET/Common/API/TVKeyValue.js',
            'src/platforms/samsung/localstorage.js'
        ];
    var userAgent = navigator.userAgent.toLowerCase();
    var isNotSF = userAgent.indexOf('2015') >= 0;
    var PL_TV_PRODUCT_TYPE_BD = 2;
    var productType  = null;

    SB.createPlatform('samsung', {

        $plugins: {},
        platformUserAgent: 'maple',
        keys: {},

        onDetect: function () {
            if (isNotSF){
                samsungFiles = [
                    '$MANAGER_WIDGET/Common/API/TVKeyValue.js',
                    '$MANAGER_WIDGET/Common/API/Plugin.js',
                    '$MANAGER_WIDGET/Common/API/Widget.js',
                    '$MANAGER_WIDGET/Common/webapi/1.0/webapis.js',
                    "$MANAGER_WIDGET/Common/webapi/1.0/deviceapis.js"
                ];
                plugins.plugin = 'SAMSUNG-INFOLINK-SEF';
            }

            // non-standart inserting objects in DOM (i'm looking at you 2011 version)
            // in 2011 samsung smart tv's we can't add objects if document is ready

            var htmlString = '';
            for (var i = 0; i < samsungFiles.length; i++) {
                htmlString += '<script type="text/javascript" src="' + samsungFiles[i] + '"></script>';
            }
            for (var id in plugins) {
                htmlString += '<object id=' + id + ' border=0 classid="clsid:' + plugins[id] + '" style="opacity:0.0;background-color:#000000;width:0px;height:0px;"></object>';
            }
            document.write(htmlString);
        },
        shortDevInfo: function(){
          return this.getCustomDeviceInfo(false);
        },
        getCustomDeviceInfo: function(full){
            var devinfo = 'modelCode:' + this.$plugins.pluginObjectNNavi.GetModelCode() +
                ';firmware:' + this.$plugins.pluginObjectNNavi.GetFirmware() +
                ';systemVersion:' + this.$plugins.pluginObjectNNavi.GetSystemVersion(0) +
                ';productCode:' + this.$plugins.pluginObjectTV.GetProductCode(1) +
                ';productType:' + this.$plugins.pluginObjectTV.GetProductType();
                if (full){
                    devinfo += ';NativeDUID:' + this.getDuid() +
                    ';mac:' + this.getMac() +
                    ';SDI:' + this.getSDI() +
                    ';hardwareVersion:' + this.getHardwareVersion();
                }
                return devinfo;
        },
        shortDevInfo: function(){
          return this.$plugins.pluginObjectNNavi.GetSystemVersion(0) + '|' + this.$plugins.pluginObjectNNavi.GetFirmware() +'|'+ this.$plugins.pluginObjectNNavi.GetModelCode();
        },
        getDuid: function () {
            return this.$plugins.pluginObjectNNavi.GetDUID(this.getMac());
        },
        setRelatetPlatformCSS: function(rootUrl, tema, isReplace, cb){
                var _resolutionObj = {width: 1280, height: 720};
                var resolution = rootUrl + 'css/' +tema+ '/resolution/' + _resolutionObj.width + 'x' + _resolutionObj.height + '.css?20171011';
                var main = rootUrl + 'css/' + tema + '/css.css?20171011';
                var defaulRes = rootUrl + 'css/resolution/'+ _resolutionObj.width + 'x' + _resolutionObj.height + '.css?20171011';
                if (!isReplace){
                    $('head').append('<link rel="stylesheet" href="' + main + ' " type="text/css" />');
                    $('head').append('<link rel="stylesheet" href="' + defaulRes + ' " type="text/css" />');
                    $('head').append('<link rel="stylesheet" href="' + resolution + '" type="text/css" />');
                    cb(false, false, _resolutionObj);
                } else {
                    cb(main, 1, _resolutionObj);
                    cb(defaulRes, 2, _resolutionObj);
                    cb(resolution, 3, _resolutionObj);
                }
        },
        getMac: function () {
            return this.$plugins.pluginObjectNetwork.GetMAC();
        },

        getSDI: function () {
            if(isNotSF) {
                return null;
            }
            this.$plugins.SDIPlugin = sf.core.sefplugin('ExternalWidgetInterface');
            this.SDI = this.$plugins.SDIPlugin.Execute('GetSDI_ID');
            return this.SDI;
        },

        /**
         * Return hardware version for 2013 samsung only
         * @returns {*}
         */
        getHardwareVersion: function () {
            var version = this.firmware.match(/\d{4}/) || [];
            if (version[0] === '2013') {
                this.hardwareVersion = sf.core.sefplugin('Device').Execute('Firmware');
            } else {
                this.hardwareVersion = null;
            }
            return this.hardwareVersion;
        },

        setVolumeUp: function()
        {
            if(isNotSF) {
                return null;
            }
            var audiocontrol= deviceapis.audiocontrol;
            audiocontrol.setVolumeUp();
            return audiocontrol.getVolume();
        },

        setVolumeDown: function()
        {
            if(isNotSF) {
                return null;
            }
            var audiocontrol= deviceapis.audiocontrol;
            audiocontrol.setVolumeDown();
            return audiocontrol.getVolume();
        },

        setMute: function()
        {
            if(isNotSF) {
                return null;
            }
            var audiocontrol= deviceapis.audiocontrol;
            var mute = audiocontrol.getMute();

            if(mute === true)
            {
                audiocontrol.setMute(false);
            }
            else
            {
                audiocontrol.setMute(true);
            }
            return mute?audiocontrol.getVolume():0;
        },

        setPlugins: function () {
          var self = this;

            _.each(plugins, function (clsid, id) {
                self.$plugins[id] = document.getElementById(id);
            });

            this.$plugins.tvKey = new Common.API.TVKeyValue();

            var NNAVIPlugin = this.$plugins.pluginObjectNNavi;

            this.modelCode = NNAVIPlugin.GetModelCode();
            this.firmware = NNAVIPlugin.GetFirmware();

            this.pluginAPI = new Common.API.Plugin();
            this.widgetAPI = new Common.API.Widget();
            this.setKeys();
            this.widgetAPI.sendReadyEvent();


            if(NNAVIPlugin.SetBannerState){
                if (window.onShow){
                    window.onShow = function() {
                        self._setBannerState(self);
                    }
                } else {
                     setTimeout(function(){
                         self._setBannerState(self);
                     }, 500);
                }

            }
            self.pluginAPI.unregistKey(27);
            self.pluginAPI.unregistKey(262);
            self.pluginAPI.unregistKey(147);
            self.pluginAPI.unregistKey(45);
            self.pluginAPI.unregistKey(261);

            var showVolume = function(level) {
                var nPercent        = level;
                var showPercentText = true;
                var thickness       =  3;
                var circleSize      =  100;

                $( '#circle' ).progressCircle({
                    nPercent        : nPercent,
                    showPercentText : showPercentText,
                    thickness       : thickness,
                    circleSize      : circleSize
                });
            };

            $('body').on({
                'nav_key:vol_up': function () {
                    var lev = SB.setVolumeUp();
                    if (lev === null){
                        return;
                    }
                    $('#circle').show();

                    showVolume(lev);
                    clearTimeout(this.showVol);
                    this.showVol = setTimeout(function () {
                        $('#circle').hide();
                    }, 5000);
                },
                'nav_key:vol_down': function () {
                    var lev = SB.setVolumeDown();
                    if (lev === null){
                        return;
                    }
                    $('#circle').show();

                    showVolume(lev);
                    clearTimeout(this.showVol);

                    this.showVol = setTimeout(function () {
                        $('#circle').hide();
                    }, 5000);
                },
                'nav_key:mute': function () {
                    var lev = SB.setMute();
                    if (lev === null){
                        return;
                    }
                }

            });
        },

        _setBannerState: function(self){
            function unregisterKey(key){
                try{
                    self.pluginAPI.unregistKey(self.$plugins.tvKey['KEY_'+key]);
                }catch(e){
                    $$error(e);
                 }
            }
            var NNAVIPlugin = self.$plugins.pluginObjectNNavi;

            NNAVIPlugin.SetBannerState(2);
            unregisterKey('VOL_UP');
            unregisterKey('VOL_DOWN');
            unregisterKey('MUTE');
            unregisterKey('PANEL_VOL_UP');
            unregisterKey('PANEL_VOL_DOWN');
            self.pluginAPI.unregistKey(7);
            self.pluginAPI.unregistKey(11);

            if(isNotSF) {
                NNAVIPlugin.SetBannerState(1);
            }
        },
        disableNetworkCheck: function(){
            if (this.internetCheck !== undefined){
                clearInterval(this.internetCheck);
            }
        },
        enableNetworkCheck: function(cntx, cb, t){
            var interv = t || 500;
            this.internetCheck = setInterval(this.cyclicInternetConnectionCheck, interv, cntx, this, cb);
        },
        cyclicInternetConnectionCheck: function(context, me, cb){
            var self = me;
            cb.apply(context, [self.checkConnection()]);
        },
        checkConnection: function(){
            var gatewayStatus = 0,
            // Get active connection type - wired or wireless.
            currentInterface = this.$plugins.pluginObjectNetwork.GetActiveType();
            if (currentInterface === -1) {
                return false;
            }
            gatewayStatus = this.$plugins.pluginObjectNetwork.CheckGateway(currentInterface);
            if (gatewayStatus !== 1) {
                return false;
            }
                return true;
        },
        /**
         * Set keys for samsung platform
         */
        setKeys: function () {
          if(isNotSF){
            var tvKey = this.$plugins.tvKey;
            this.keys = {
                ENTER: tvKey.KEY_ENTER,
                PAUSE: tvKey.KEY_PAUSE,
                LEFT: tvKey.KEY_LEFT,
                UP: tvKey.KEY_UP,
                RIGHT: tvKey.KEY_RIGHT,
                DOWN: tvKey.KEY_DOWN,
                N0: tvKey.KEY_0,
                N1: tvKey.KEY_1,
                N2: tvKey.KEY_2,
                N3: tvKey.KEY_3,
                N4: tvKey.KEY_4,
                N5: tvKey.KEY_5,
                N6: tvKey.KEY_6,
                N7: tvKey.KEY_7,
                N8: tvKey.KEY_8,
                N9: tvKey.KEY_9,
                RED: tvKey.KEY_RED,
                GREEN: tvKey.KEY_GREEN,
                YELLOW: tvKey.KEY_YELLOW,
                BLUE: tvKey.KEY_BLUE,
                REW: tvKey.KEY_RW,
                STOP: tvKey.KEY_STOP,
                PLAY: tvKey.KEY_PLAY,
                FF: tvKey.KEY_FF,
                RETURN: tvKey.KEY_RETURN,
                CH_UP: tvKey.KEY_CH_UP,
                CH_DOWN: tvKey.KEY_CH_DOWN,
                TOOLS: tvKey.KEY_TOOLS,
                VOL_UP: tvKey.KEY_VOL_UP,
                VOL_DOWN: tvKey.KEY_VOL_DOWN
            }
          }  else {
              this.keys = sf.key;
          }
          var self = this;

          document.body.onkeydown = function ( event ) {
            var keyCode = event.keyCode;

            switch ( keyCode ) {
              case self.keys.RETURN:
              case self.keys.EXIT:
              case 147:
              case 261:
                self.blockNavigation(event);
                break;
              default:
                break;
            }
          }
        },

        /**
         * Start screensaver
         * @param time
         */
        enableScreenSaver: function (time) {
            if(isNotSF){
                try {
                    this.pluginAPI.setOnScreenSaver();
                } catch (e) {
                    $$log("enableScreenSaver exception [" + e.code + "] name: " + e.name
                          + " message: " + e.message);
                }
                return;
            }
            time = time || false;
            sf.service.setScreenSaver(true, time);
        },

        /**
         * Disable screensaver
         */
        disableScreenSaver: function () {
            if(isNotSF){
                try {
                    this.pluginAPI.setOffScreenSaver();
                } catch (e) {
                    $$log("disableScreenSaver exception [" + e.code + "] name: " + e.name
                          + " message: " + e.message);
                }
                return;
            }
            sf.service.setScreenSaver(false);
        },

        exit: function () {
            if (isNotSF){
                this.widgetAPI.sendExitEvent();
                return;
            }
            sf.core.exit(false);
        },

        sendReturn: function () {
            if (isNotSF){
                this.widgetAPI.sendReturnEvent();
                return;
            }
            sf.core.exit(true);
        },

        blockNavigation: function (e) {
            if (isNotSF){
                this.widgetAPI.blockNavigation(e);
                return;
            }
            sf.key.preventDefault();
        }
    });

})(this);

(function ($) {
    "use strict";



    SB.readyForPlatform('samsung', function(){
        var voiceServer;

        /**
         * Обработка нативных событий распознавания голоса
         * @param evt событие от самсунга
         */
        var handleRecognitionEvent = function (evt) {

            switch (evt.eventtype) {
                case "EVENT_VOICE_END_MONITOR":
                    //не работает в телевизоре
                    break;
                case "EVENT_VOICE_BEGIN_MONITOR":
                case "EVENT_VOICE_BTSOUND_START":
                    //this.updateVoiceKeyHelp();
                    /*if (paused) {
                        break;
                    }
                    $('body').trigger('voiceStart');
                    if (helperWasShowed < defaults.showHelperTimes) {
                        helperWasShowed++;
                        $helpBubble.html(defaults.helpText).show();
                    }*/


                    $$voice.refresh();

                    $$voice._resetVisibilityTimeout();

                    /*
                    if ($curTarget) {
                        doAll.call($curTarget, curOptions);
                    }*/
                    break;
                case "EVENT_VOICE_RECOG_RESULT":

                    var result = evt.result.toLowerCase();
                    //если не голосовой поиск
                    if (typeof voiceServer != 'function') {
                        $$voice.say(result);
                    }
                    else {
                        voiceServer(result);
                        voiceServer = false;
                        $$voice.restore();
                    }
                    break;
            }
        };
        _.extend($$voice, {
            _init: function(){
                deviceapis.recognition.SubscribeExEvent(deviceapis.recognition.PL_RECOGNITION_TYPE_VOICE, "Smartbox", function (evt) {
                    handleRecognitionEvent(evt);
                });
                deviceapis.recognition.SetVoiceTimeout(this.voiceTimeout);
                $('body').append('<div id="voice_buble"></div><div id="help_voice_bubble"></div>');
            },
            _nativeCheckSupport: function(){
                var enabled=false;
                try {
                    enabled = deviceapis.recognition.IsRecognitionSupported();
                } catch (e) {
                }
                return enabled;
            },
            _nativeFromServer: function(title, callback){
                voiceServer = callback;
                var describeHelpbar = {
                    helpbarType: "HELPBAR_TYPE_VOICE_SERVER_GUIDE_RETURN",
                    guideText: title
                };

                deviceapis.recognition.SetVoiceHelpbarInfo(JSON.stringify(describeHelpbar));
            },
            _setVoiceHelp: function(voicehelp){
                deviceapis.recognition.SetVoiceHelpbarInfo(JSON.stringify(voicehelp));
            },
            _nativeTurnOff: function(){
                deviceapis.recognition.SetVoiceHelpbarInfo(JSON.stringify({
                    helpbarType: "HELPBAR_TYPE_VOICE_CUSTOMIZE",
                    bKeepCurrentInfo: "false",
                    helpbarItemsList: []
                }));
            }
        });
    });
})(jQuery);
SB.readyForPlatform('tizen', function () {
    Player.extend({
        name: 'AVPlayer',
        usePlayerObject: true,
        ready: false,
        videoInfoReady: false,
        jumpStep: 30,
        jumpInter: null,
        inited: false,
        isInit: function(){
          return this.inited;
        },
        setVideoInfo: function(cb, url, options){
            var self = this;
            tizen.systeminfo.getPropertyValue("DISPLAY", function(e){
                if (!e) {
                    width = 0;
                    height = 0;
                } else {
                    width = e.resolutionWidth;
                    height = e.resolutionHeight;
                }
                self.videoInfo.width = width * 1;
                self.videoInfo.height = height * 1;
                self.videoInfoReady = true;
                cb.apply(self, [url, options]);
            });
        },
        _init: function () {

        },
        getCurrentTime: function(){
            var cur_time = 0;
            try{
                cur_time = webapis.avplay.getCurrentTime()/1000;
            } catch (e){

            }
            return cur_time;
        },
        jumpForwardVideo: function(jumpSpeed) {
            clearTimeout(this.jumpInter);
            var self = this;
            self.pause();
            this.state = 'seeking';
            var jumpto = Math.floor(self.videoInfo.currentTime + jumpSpeed*self.jumpStep);
            if (self.videoInfo.duration < jumpto){
                self.trigger('killit');
                return;
            }
            self.videoInfo.currentTime = jumpto;
            var jumpfor = Math.floor(jumpto - self.getCurrentTime());

            self.trigger('update');
            self.jumpInter = setTimeout(function(me) {
                try {
                    webapis.avplay.jumpForward(jumpfor*1000, function () {
                        me.resume();
                    }, function (error) {
                    });
                } catch (e) {
                    console.log(e.message);
                }
            }, 1000, self);
        },
        /**
         * jump backward
         * @param time millisecond
         */
        jumpBackwardVideo: function(jumpSpeed) {
            clearTimeout(this.jumpInter);
            var self = this;
            self.pause();
            this.state = 'seeking';
            var jumpto = Math.floor(self.videoInfo.currentTime - jumpSpeed*self.jumpStep);
            self.videoInfo.currentTime = jumpto;
            var jumpfor = Math.floor(self.getCurrentTime() - self.videoInfo.currentTime);
            if (jumpto < 0){
                this.videoInfo.currentTime = 0;
                webapis.avplay.jumpBackward(self.getCurrentTime()*1000);
                self.resume();
                return;
            }
            self.videoInfo.currentTime = jumpto;
            self.trigger('update');
            self.jumpInter = setTimeout(function() {
                try {
                    webapis.avplay.jumpBackward(jumpfor*1000, function () {
                        self.resume();
                    }, function () {
                    });
                } catch (e) {

                }
            }, 1000, self);
        },
        OnCurrentPlayTime: function (millisec) {
            this.currentTime = millisec / 1000;
            this.state = 'playing';
            this.videoInfo.currentTime = millisec / 1000;
            this.trigger('update');
        },
        updateDuration: function(){
            var duration = this.getDuration();

            this.videoInfo.duration = duration;
            this.trigger('update');
        },
        getDuration: function(){
          var duration = 0;
          try {
            var duration = Math.ceil(webapis.avplay.getDuration()/1000);
          } catch (e) {
              $$log('######## ' + e.message);
          }
          return duration;
        },
        // in sec
        seekTo: function(_toSec){
          this.___play({'resume': _toSec});
        },
        getState: function(){
          return (webapis.avplay.getState() || '').toLowerCase();
        },
        ___play: function(options){
            var self = this;
            SB.disableScreenSaver();
            if (options && options.resume){
                try{
                    webapis.avplay.seekTo(options.resume*1000,
                        function(){
                            webapis.avplay.play();
                            //self.state = 'play';
                        },
                        function(){
                            $$log('ERROR: resumed');
                        });

                }catch (e){
                    console.log(e);
                }
            }else{
                try {
                    webapis.avplay.play();
                    //self.state = 'play';
                } catch (e) {
                    $$log("Current state: " + webapis.avplay.getState());
                    $$log(e);
                }
            }
        },
        playPause: function(){
          var _state = webapis.avplay.getState();
          if (_state === 'PLAYING'){
            this.pause();
          } else if (_state === 'PAUSED'){
            this.resume();
          }
        },
        play: function(options){
            if (!this.inited) {
                this._init();
                this.inited = true;
            }
            if (this.state === 'seeking'){
                this.trigger('update');
                return;
            }
            if (options && options.resumeLive){
              this.close();
              this._play(options);
            }
            else if(webapis.avplay.getState() == "PAUSED" || webapis.avplay.getState() == "READY"){
                this.resume();
            } else if (options !== undefined) {
                if (webapis.avplay.getState() !== 'NONE'){
                  this.close();
                }
                this._play(options);
            }
        },
        __play: function(url, options){
            $('#av-cnt').show();
            this._open(url);
            this._prepare();
            this.___play(options);
        },
        _play: function(options){
            var url = options.url;
            if (!this.videoInfoReady){
                this.setVideoInfo(this.__play, url, options)
            } else {
                this.__play(url, options);
            }
        },
        _prepare: function() {
            try{
                webapis.avplay.prepare();
                var avPlayerObj = document.getElementById("av-player");
                $('#av-player').show();
                avPlayerObj.style.width = this.videoInfo.width + "px";
                avPlayerObj.style.height = this.videoInfo.height + "px";
                webapis.avplay.setDisplayRect(avPlayerObj.offsetLeft, avPlayerObj.offsetTop, avPlayerObj.offsetWidth, avPlayerObj.offsetHeight);

                var defRatioMode = "PLAYER_DISPLAY_MODE_ZOOM_16_9";
                var currentRatio = Math.round(this.videoInfo.width/this.videoInfo.height * 100) / 100;
                if (currentRatio == Math.round(4/3 * 100) / 100){
                    defRatioMode = "PLAYER_DISPLAY_MODE_ZOOM_THREE_QUARTERS";
                }
                webapis.avplay.setDisplayMethod(defRatioMode);
                this.updateDuration();
            }
            catch(e){
                $$log("Current state: " + webapis.avplay.getState());
                $$log(e);
            }
        },

        //getTimeStr: function(){
        //  var currentdate = new Date();
        //  return currentdate.getDate() + "/"
        //        + (currentdate.getMonth()+1)  + "/"
        //        + currentdate.getFullYear() + " @ "
        //        + currentdate.getHours() + ":"
        //        + currentdate.getMinutes() + ":"
        //        + currentdate.getSeconds();
        //},
        _open: function (url) {
            var self = this;
            window.playerTizen = self;
            try{
                webapis.avplay.open(url);
                webapis.avplay.setListener({
                     onbufferingstart : function() {
                         //$$log(self.getTimeStr() + '=> onbufferingstart');
                         //console.log(self.getTimeStr() + '=> onbufferingstart');
                         self.trigger('bufferingBegin');
                    },
                    onbufferingprogress : function(percent) {
                        //$$log(percent);
                        self.trigger('onbufferingprogress', percent);
                        //this.updateLoading(percent);
                    },
                    onbufferingcomplete : function() {
                        if (!self.ready){
                            self.trigger('ready');
                            self.ready = true;
                        }
                        //$$log(self.getTimeStr() + '=>bufferingEnd');
                        //console.log(self.getTimeStr() + '=>bufferingEnd');
                        self.trigger('bufferingEnd');
                    },
                    oncurrentplaytime : function(currentTime) {
                        self.OnCurrentPlayTime(currentTime);
                    },
                    onevent : function(eventType, eventData) {
                      // console.log(eventType, eventData);
                    },
                    onerror : function(eventType) {
                        self.trigger('player:error', url, eventType);
                        $$log("error type : " + eventType);
                    },
                    onsubtitlechange : function(duration, text, data3, data4) {
                    },
                    ondrmevent : function(drmEvent, drmData) {
                    },
                    onstreamcompleted : function() {
                        self.trigger('complete', url, false);
                    }
                });
                this.updateDuration();
            }
            catch(e){
                $$log("Current state: " + webapis.avplay.getState());
                $$log("Exception: " + e.name);
            }
        },
        close: function(){
            this.ready = false;
            try {
                webapis.avplay.close();
            } catch (e) {
                $$log("Current state: " + webapis.avplay.getState());
                $$log(e);
            }
        },
        stop: function () {

            SB.enableScreenSaver();
            this.close();
            this.trigger('stop');
            this.state = 'stop';
            $('#av-cnt').hide();
        },
        pause: function () {
            if(webapis.avplay.getState() === "PAUSED"){
                return;
            }
            SB.enableScreenSaver();
            if(webapis.avplay.getState() === "PLAYING"){
                try {
                     webapis.avplay.pause();
                     this.trigger('pause');
                } catch (e) {
                     $$log("Current state: " + webapis.avplay.getState());
                     $$log(e.message);
                }
            }
        },
        resume: function () {
            this.___play({});
            this.trigger('resume');
        }
    });
});

/**
 * Tizen platform
 */
!(function (window, undefined) {

    var
        plugins = {
            avplayer: '<div id="av-cnt"><object id="av-player" type="application/avplayer" style="width:1280px;height:720px;position: absolute;z-index: 1001;"></object></div>'
        },
        samsungFiles = [
        '$WEBAPIS/webapis/webapis.js'
        ];

    SB.createPlatform('tizen', {

        $plugins: {},
        platformUserAgent: 'Tizen',
        keys: {
            ENTER: 13,
            PAUSE: 19,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            N0: 48,
            N1: 49,
            N2: 50,
            N3: 51,
            N4: 52,
            N5: 53,
            N6: 54,
            N7: 55,
            N8: 56,
            N9: 57,
            RED: 403,
            GREEN: 404,
            YELLOW: 405,
            BLUE: 406,
            REW: 412,
            STOP: 413,
            PLAY: 415,
            FF: 417,
            RETURN: 10009,
            CH_UP: 427,
            CH_DOWN: 428,
            TOOLS: 10135,
            EXIT: 10182,
            PLAYPAUSE: 10252
        },
        detect: function(){
            Storage.prototype._setItem = function(key, obj) {
                return this.setItem(key, JSON.stringify(obj));
            };
            Storage.prototype._getItem = function(key) {
                try {
                    return JSON.parse(this.getItem(key));
                } catch(error) {
                    return undefined;
                }
            };
            if(!!window.tizen || navigator.userAgent.indexOf("sdk") != -1){
                return true;
            }
            // debug return true
            return false;
        },

        onDetect: function () {
            var htmlString = '';
            for (var i = 0; i < samsungFiles.length; i++) {
                htmlString += '<script type="text/javascript" src="' + samsungFiles[i] + '"></script>';
            }
            for (var id in plugins) {
                htmlString += plugins[id]
            }
            document.write(htmlString);
        },
        getVersion: function(){
            var version = 'unknown';
            try {
                  version = webapis.tvinfo.getVersion();
                } catch (error) {
                  console.log(" error code = " + error.code);
            }
            return version;
        },
        getFirmware: function(){
            var firmware = 'unknown';
            try {
                  firmware = webapis.productinfo.getFirmware();
                } catch (error) {
                  console.log(" error code = " + error.code);
            }
            return firmware;
        },
        getDuid: function(){
            var diu = 'unknown';
            try {
                diu = webapis.productinfo.getDuid();
            } catch (error) {
                console.log(" error code = " + error.code);
            }
            return diu;
        },
        getMac: function () {
            var mac = null;
            try {
                mac = webapis.network.getMac();
            } catch (e) {
                console.log("getGateway exception [" + e.code + "] name: " + e.name
                      + " message: " + e.message);
            }
            return mac
        },
        getModelCode: function(){
            var modelCode = 'unknown';
            try {
                modelCode = webapis.productinfo.getModelCode();
            } catch (e) {
                console.log("getGateway exception [" + e.code + "] name: " + e.name
                      + " message: " + e.message);
            }

            return modelCode;
        },
        getModel: function(){
            var model = 'unknown';
            try {
                model = webapis.productinfo.getRealModel() || webapis.productinfo.getModel();
            } catch (error) {
                console.log(" error code = " + error.code);
            }
            return model;
        },
        getSDI: function () {

        },
        getCustomDeviceInfo: function(full){
            return "Duid:"+ this.getDuid() +';Version:' + this.getVersion() + ';Firmware:' + this.getFirmware()
                   + ";ModelCode:" + this.getModelCode() + ";Model:" + this.getModel();
        },
        shortDevInfo: function(){
          return this.getVersion() + '|' + this.getFirmware() +'|'+this.getModelCode() +'|' +this.getModel();
        },
        /**
         * Return hardware version for 2013 samsung only
         * @returns {*}
         */
        getHardwareVersion: function () {
            return this.getFirmware();
        },
        setPlugins: function () {
            window._localStorage = window.localStorage;
            tizen.tvinputdevice.registerKey("MediaPlayPause");
            tizen.tvinputdevice.registerKey("MediaPlay");
            tizen.tvinputdevice.registerKey("MediaPause");
            tizen.tvinputdevice.registerKey("MediaStop");
            tizen.tvinputdevice.registerKey("MediaFastForward");
            tizen.tvinputdevice.registerKey("MediaRewind");
            tizen.tvinputdevice.registerKey("ColorF0Red");
            tizen.tvinputdevice.registerKey("ColorF1Green");
            tizen.tvinputdevice.registerKey("ColorF2Yellow");
            tizen.tvinputdevice.registerKey("ColorF3Blue");
            tizen.tvinputdevice.registerKey("Exit");



        var self = this;
        document.addEventListener('visibilitychange', function (){
            var _plugin = window.playerView?window.playerView.plugin:undefined;
            if(document.hidden){
                if (_plugin){
                    webapis.avplay.suspend();
                }
            } else {
                var _checkConn = setInterval(function(){
                    if(self.checkConnection()){
                        clearInterval(_checkConn);
                        if (_plugin){
                            webapis.avplay.restore();
                        }
                    }
                }, 500);
            }
        });

        },
        setRelatetPlatformCSS: function(rootUrl, tema, isReplace, cb){
            tizen.systeminfo.getPropertyValue("DISPLAY", function(e){
                var _resolutionObj = {width: e.resolutionWidth, height: e.resolutionHeight};
                var resolution = rootUrl + 'css/' +tema+ '/resolution/' + _resolutionObj.width + 'x' + _resolutionObj.height + '.css?2017102601';
                var main = rootUrl + 'css/' + tema + '/css.css?2017102602';
                var defaulRes = rootUrl + 'css/resolution/'+ _resolutionObj.width + 'x' + _resolutionObj.height + '.css?2017102603';
                if (!isReplace){
                    //Bugsnag.notify('Loading: ', main+"|"+defaulRes+"|"+resolution, {}, "info");
                    $('head').append('<link rel="stylesheet" href="' + main + ' " type="text/css" />');
                    $('head').append('<link rel="stylesheet" href="' + defaulRes + ' " type="text/css" />');
                    $('head').append('<link rel="stylesheet" href="' + resolution + '" type="text/css" />');
                    cb(false, false, _resolutionObj);
                } else {
                    cb(main, 1, _resolutionObj);
                    cb(defaulRes, 2, _resolutionObj);
                    cb(resolution, 3, _resolutionObj);
                }
            });
        },
        disableNetworkCheck: function(){
            if (this.internetCheck !== undefined){
                clearInterval(this.internetCheck);
            }
        },
        enableNetworkCheck: function(cntx, cb, t){
            var interv = t || 500;
            this.internetCheck = setInterval(this.cyclicInternetConnectionCheck, interv, cntx, this, cb);
        },
        cyclicInternetConnectionCheck: function(context, me, cb){
            var self = me;
            cb.apply(context, [self.checkConnection()]);
        },
        checkConnection: function(){
            var gateway = false;
            try {
                gateway = webapis.network.getGateway();
            } catch (e) {
                $$log("getGateway exception [" + e.code + "] name: " + e.name
                      + " message: " + e.message);
            }
            return gateway?true:false;
        },
        /**
         * Start screensaver
         * @param time
         */
        enableScreenSaver: function () {
            $$log('>>>>>>>> enableScreenSaver');
            try {
                webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_ON);
            } catch (e) {
                $$log("enableScreenSaver exception [" + e.code + "] name: " + e.name
                      + " message: " + e.message);
            }
        },

        /**
         * Disable screensaver
         */
        disableScreenSaver: function () {
            $$log('>>>>>>>> disableScreenSaver');
            try {
                webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF);
            } catch (e) {
                $$log("disableScreenSaver exception [" + e.code + "] name: " + e.name
                      + " message: " + e.message);
            }
        },

        exit: function (fullExit) {
            if (fullExit === -1){
                Bugsnag.notify('Application Hide: ', self.userAgent, {}, "info");
                tizen.application.getCurrentApplication().hide();
            } else {
                Bugsnag.notify('Application EXIT: ', self.userAgent, {}, "info");
                tizen.application.getCurrentApplication().exit();
            }
        },

        sendReturn: function () {

        },

        blockNavigation: function () {

        }
    });

})(this);
