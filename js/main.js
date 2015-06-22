/* global jQuery */
(function($) {

// plugin definition
$.fn.giulia = function(options) {
  var defaults = {
  };
  // extend default options with those provided
  var opts = $.extend(defaults, options);

  // system variables
  var _playState = 'animation-play-state';
  var _animationCssProperties = ['name', 'duration', 'timing-function', 'delay', 'iteration-count', 'direction', 'fill-mode', 'play-state'];
  
  var $this = $(this).eq(0);
  if ($this.length === 0 || $this.css('animation-name') === '') {
    return this;
  }

  var animation = {
    properties: {},
    keyframes: [],
    affected: {}
  };
  var raf;
  var record = {};

  // panel
  var $body = $('body');
  var $panel = $('<div id="animation-analyzer"></div>"');
  var $table;
  var $current = $('<div id="current"></div>');

  // controls
  var $controls = $('<div id="controls"></div>');
  var $btnPlay = $('<input type="button" id="play" value="pause">');
  var $btnReset = $('<input type="button" id="reset" value="reset">');

  var toggleAnimation = function() {
    $this.css(_playState, function(i, v) {
      var btnPlay = 'play';
      var state = 'paused';
      if (v === 'paused') {
        btnPlay = 'pause';
        state = 'running';
      }
      $btnPlay.val(btnPlay);
      return state;        
    });
  };

  var resetAnimation = function() {
    setTimeout(function() {$this.css('animation-name', 'none'); }, 0);
    setTimeout(function() {$this.css('animation-name', ''); }, 1);
  };

  var getAnimationCssProperties = function() {
    animation.properties = {};
    $.each(_animationCssProperties, function(index, value) {
      animation.properties[value] = $this.css('animation-' + value);
    });
  };

  var findKeyframesRule = function() {
    var ss = document.styleSheets;
    for (var i = 0; i < ss.length; i++) {
      for (var j = 0; j < ss[i].cssRules.length; j++) {
        if (ss[i].cssRules[j].type === window.CSSRule.WEBKIT_KEYFRAMES_RULE && 
        ss[i].cssRules[j].name === animation.properties.name) { 
          return ss[i].cssRules[j]; }
      }
    }
    return null;
  };

  var sortKeyframes = function(a, b) {
    var timeA = a.time;
    var timeB = b.time;
    if (timeA < timeB) {
      return -1;
    }
    if (timeA > timeB) {
      return 1;
    }
    return 0;
  };

  var listKeyframes = function() {
    animation.keyframes = [];
    animation.affected = {};
    var keyframes = findKeyframesRule();
    if (!keyframes) {
      return false;
    }

    var temp;
    var s;
    for (var i = 0; i < keyframes.cssRules.length; i++) {
      temp = { style: {} };
      temp.time = keyframes[i].keyText.replace('%', '') * 1;
      s = keyframes[i].style;
      for (var j = 0; j < s.length; j++) {
        if ( s[ s[j] ] !== 'initial' ) {
          temp.style[ s[j] ] = s[ s[j] ];
          animation.affected[ s[j] ] = true;
        }
      }
      animation.keyframes.push(temp);
    }
    animation.keyframes.sort(sortKeyframes);
  };

  var getInfo = function() {
    getAnimationCssProperties();
    listKeyframes();
  };

  var drawListKeyframes = function() {
    var keyframes = animation.keyframes;
    var $table = $('<table border=1><thead><th>Time</th><th>Property</th><th>Value</th></thead></table>');
    var $tbody = $('<tbody></tbody>');
    var $tr;
    var c;
    for (var i = 0; i < keyframes.length; i++) {
      c = 0;
      $tr = $('<tr></tr>');
      $tbody.append($tr);
      $.each(keyframes[i].style, function(key, value) {
        if (c === 0) {
          $tr.append('<td>' + key + '</td>');
          $tr.append('<td>' + value + '</td>');
        }
        else {
          $tbody.append('<tr><td>' + key + '</td><td>' + value + '</td></tr>');
        }
        c++;
      });
      $tr.prepend('<td rowspan="' + c + '">' + keyframes[i].time + '</td>');
    }
    $table.append($tbody);
    return $table;
  };

  var anim = function(time) {
    var res = '<p><strong>time</strong>: ' + time;
    $.each(animation.affected, function(key) {
      res += '<p><strong>' + key + '</strong>: ' + $this.css(key);
    });
    $current.html(res);
    raf = window.requestAnimationFrame(anim);
  };
  // anim();

  var recordAnimation = function(time) {
    
  };

  var drawInterface = function() {
    $table = drawListKeyframes();
    $controls.append($btnPlay);
    $controls.append($btnReset);
    $panel.append($controls);
    $panel.append($current);
    $panel.append($table);
    $body.append($panel);

    $btnPlay.click(toggleAnimation);
    $btnReset.click(resetAnimation);
  };

  getInfo();
  console.log(animation);
  $this.one('animationstart', function() {
    console.log('start');
    anim();
  });
  $this.one('animationend', function() {
    console.log('end');
    window.cancelAnimationFrame(raf);
  });

  drawInterface();

  return this;
};

})(jQuery);