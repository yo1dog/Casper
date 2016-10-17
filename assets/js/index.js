/**
 * Main JS file for Casper behaviours
 */

/* globals jQuery, document */
(function ($, undefined) {
    "use strict";

    var $document = $(document);

    $document.ready(function () {

        var $postContent = $(".post-content");
        $postContent.fitVids();

        $(".scroll-down").arctic_scroll();

        $(".menu-button, .nav-cover, .nav-close").on("click", function(e){
            e.preventDefault();
            $("body").toggleClass("nav-opened nav-closed");
        });
        
        setupDescAnimation();
    });

    // Arctic Scroll by Paul Adam Davis
    // https://github.com/PaulAdamDavis/Arctic-Scroll
    $.fn.arctic_scroll = function (options) {

        var defaults = {
            elem: $(this),
            speed: 500
        },

        allOptions = $.extend(defaults, options);

        allOptions.elem.click(function (event) {
            event.preventDefault();
            var $this = $(this),
                $htmlBody = $('html, body'),
                offset = ($this.attr('data-offset')) ? $this.attr('data-offset') : false,
                position = ($this.attr('data-position')) ? $this.attr('data-position') : false,
                toMove;

            if (offset) {
                toMove = parseInt(offset);
                $htmlBody.stop(true, false).animate({scrollTop: ($(this.hash).offset().top + toMove) }, allOptions.speed);
            } else if (position) {
                toMove = parseInt(position);
                $htmlBody.stop(true, false).animate({scrollTop: toMove }, allOptions.speed);
            } else {
                $htmlBody.stop(true, false).animate({scrollTop: ($(this.hash).offset().top) }, allOptions.speed);
            }
        });
    };
    
    
    var DESC_COOKIE_NAME = "animated-desc-time";
    var DESC_ANIMATE_WAIT_TIME_MS = 1*60*60*1000;
    
    function setupDescAnimation() {
      if (!getShouldAnimateDesc()) {
        return;
      }
      
      animateDesc();
      setDescLastAnimatedTime();
    }
    
    function getShouldAnimateDesc() {
      var descLastAnimatedTimeMS = getDescLastAnimatedTime();
      
      if (descLastAnimatedTimeMS === null) {
        return true;
      }
      
      // check if the animated time was less than our wait time
      return Date.now() - descLastAnimatedTimeMS > DESC_ANIMATE_WAIT_TIME_MS;
    }

    function getDescLastAnimatedTime() {
      // get the cookie value for the last time we animated the description
      var cookieValue = getCookieValue(DESC_COOKIE_NAME);
      
      if (!cookieValue) {
        return null;
      }
      
      var descLastAnimatedTimeMS = parseInt(cookieValue);
      return descLastAnimatedTimeMS;
    }
    
    function getCookieValue(cookieName) {
      if (!document.cookie) {
        return null;
      }
      
      var token = cookieName + "=";
      var index1 = document.cookie.indexOf(token);
      
      if (index1 === -1) {
        return null;
      }
      
      index1 += token.length;
      var index2 = document.cookie.indexOf(";", index1);
      if (index2 === -1) {
        index2 = document.cookie.length;
      }
        
      var cookieValue = document.cookie.substring(index1, index2);
      return cookieValue;
    }
    
    function setDescLastAnimatedTime() {
      // set the cookie
      setCookie(
        DESC_COOKIE_NAME,
        Date.now().toString(),
        new Date(Date.now() + DESC_ANIMATE_WAIT_TIME_MS),
        "/"
      );
    }
    
    function setCookie(name, value, expirationDate, path) {
      document.cookie = name + "=" + value + "; expires=" + expirationDate.toGMTString() + "; path=" + path + ";";
    }
    
    
    function animateDesc() {	
      // split the text into spans so we can animate each character individually
      var spans1 = spanSplitElementText(document.getElementById('desc1'));
      var spans2 = spanSplitElementText(document.getElementById('desc2'));
      
      // create the animation
      var fadeInAnimation = new SeqAnimation(function(elem, delayMS) {
        elem.style.opacity = "1";
        elem.style.transition = "all 250ms ease-in-out " + delayMS + "ms";
      });
      
      // use a timeout so the elements have a chance to have their inital style applied
      // otherwise, the browser wont apply the CSS translation animation
      setTimeout(function() {
        // animate our description
        fadeInAnimation.animate(
          [
            new SeqAnimationGroup(spans1, 0, 15),
            new SeqAnimationGroup(spans2, 750, 10)
          ]
        );
      }, 500);
    }

    // represents a group of elements to animate in sequence
    function SeqAnimationGroup(elems, startDelayMS, minElemDelayMS, maxElemDelayMS) {
      var DEFAULT_START_DELAY = 0;
      var DEFAULT_ELEM_DELAY  = 25;
      
      this.elems          = elems;
      this.startDelayMS   = startDelayMS   || DEFAULT_START_DELAY;
      this.minElemDelayMS = minElemDelayMS || DEFAULT_ELEM_DELAY;
      this.maxElemDelayMS = maxElemDelayMS || minElemDelayMS;
    }


    // sequence animation
    // animateFN(elem, delayMS)
    //   elem    - Element to animate
    //   delayMS - delay in milliseconds before this element should start animating
    function SeqAnimation(animateFn) {
      this.animate = function(groups) {
        var delayMS = 0;
        
        for (var i = 0; i < groups.length; ++i) {
          delayMS += groups[i].startDelayMS;
          
          for (var j = 0; j < groups[i].elems.length; ++j) {
            delayMS += groups[i].minElemDelayMS + Math.floor((groups[i].maxElemDelayMS - groups[i].minElemDelayMS) * Math.random());
            
            animateFn(groups[i].elems[j], delayMS);
          }
        }
      };
    }


    // splits each character of an element's text into a span element 
    function spanSplitElementText(elem) {
      var text = elem.innerText || elem.textContent;
      text = text.trim().replace(/ /g, "\u00a0"); // &nbsp;
      
      // remove children
      while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
      }
      
      var spans = [];
      
      // create children
      for (var i = 0; i < text.length; ++i) {
        var span = document.createElement("span");
        span.appendChild(document.createTextNode(text[i]));
        
        spans.push(span);
        elem.appendChild(span);
      }
      
      return spans;
    }
})(jQuery);
