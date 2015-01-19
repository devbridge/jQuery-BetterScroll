$(document).ready(function () {

	// GLOBAL FUNCTIONS

    function viewport() {
        var e = window, a = 'inner';
        if (!('innerWidth' in window)) {
            a = 'client';
            e = document.documentElement || document.body;
        }
        return { width: e[a + 'Width'], height: e[a + 'Height'] };
    }

    (function ($, sr) {

        var debounce = function (func, threshold, execAsap) {
            var timeout;

            return function debounced() {
                var obj = this,
                    args = arguments;

                function delayed() {
                    if (!execAsap)
                        func.apply(obj, args);
                    timeout = null;
                }

                if (timeout)
                    clearTimeout(timeout);
                else if (execAsap)
                    func.apply(obj, args);

                timeout = setTimeout(delayed, threshold || 100);
            };
        };

        jQuery.fn[sr] = function (fn) {
            return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
        };

    })(jQuery, 'smartresize');
	
	// SWIPE EVENTS

    $.fn.swipeEvents = function () {
        return this.each(function () {

            var startX,
                startY,
                $this = $(this);

            $this.bind('touchstart', touchstart);

            function touchstart(event) {
                var touches = event.originalEvent.touches;
                if (touches && touches.length) {
                    startX = touches[0].pageX;
                    startY = touches[0].pageY;
                    $this.bind('touchmove', touchmove);
                    $this.bind('touchend', touchend);
                }
            }

            function touchmove(event) {
                var touches = event.originalEvent.touches;
                if (touches && touches.length) {
                    var deltaX = startX - touches[0].pageX;
                    var deltaY = startY - touches[0].pageY;

                    if (deltaX >= 50) {
                        $this.trigger("swipeLeft");
                    }
                    if (deltaX <= -50) {
                        $this.trigger("swipeRight");
                    }
                    if (deltaY >= 50) {
                        $this.trigger("swipeUp");
                    }
                    if (deltaY <= -50) {
                        $this.trigger("swipeDown");
                    }
                    if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
                        $this.unbind('touchmove', touchmove);
                        $this.unbind('touchend', touchend);
                    }
                }
            }

            function touchend(event) {
                $this.unbind('touchmove', touchmove);
            }

        });
    };

    // PAGE SCROLL

    var mouseBinded = false,
        keyboardBinded = false,
        swipeEventLoaded = false,
        swipeBinded = false;

    $.fn.betterScroll = function () {

        var self = $(this),
            timeAnimationLast = 0,
            responsiveResize = false,
            pageScrollParams = {
                sectionSelector: '.page-section',
                sectionChildSelector: '.page-frame',
                sectionWrapper: '.page',
                scrollDownSelector: '.js-slide-down',
                scrollUpSelector: '.js-slide-up',
                scrollToFirst: '.js-slide-first',
                responsivePoint: 768,
                animationDuration: 1000
            };
        

        function setSections() {
            var section = $(pageScrollParams.sectionSelector),
                sectionHeight,
                childBlockHeight,
                i = 0;

            $('html').addClass('campaign-scroll');

            section.eq(0).addClass('active');

            section.each(function () {
                var self = $(this);

                sectionHeight = viewport().height;

                self.attr('style', 'height: auto !important');

                if(self.find(pageScrollParams.sectionChildSelector)) {
                    childBlockHeight = self.find(pageScrollParams.sectionChildSelector).innerHeight();

                    if (childBlockHeight > sectionHeight) {
                        sectionHeight = childBlockHeight;
                    }
                    
                }

                self.attr('style', 'height: ' + sectionHeight + 'px !important');
                self.attr('data-section-index', i);

                i++;
            });
        };

        setSections();

        function resizeSections() {
            var section = $(pageScrollParams.sectionSelector),
                currentSection = $(pageScrollParams.sectionSelector + '.active'),
                sectionIndex = currentSection.data('section-index'),
                sectionHeight,
                childBlockHeight;

            section.each(function () {
                var self = $(this);

                sectionHeight = viewport().height;

                self.attr('style', 'height: auto !important');

                if (self.find(pageScrollParams.sectionChildSelector)) {
                    childBlockHeight = self.find(pageScrollParams.sectionChildSelector).innerHeight();

                    if (childBlockHeight > sectionHeight) {
                        sectionHeight = childBlockHeight;
                    }

                }

                self.attr('style', 'height: ' + sectionHeight + 'px !important');
            });

            if (viewport().width > pageScrollParams.responsivePoint) {
                self.bindMouseWheel();
                self.bindSwipe();
                self.betterScrollTransform(sectionIndex);
                $('html').removeClass('scroll-on').addClass('scroll-off');
            } else {
                self.unbindMouseWheel();
                self.unbindSwipe();
                self.betterScrollTransform(0, true);
                currentSection.removeClass('active');
                section.eq(0).addClass('active');
                $('html').removeClass('scroll-off').addClass('scroll-on');
            }
        };

        $(window).smartresize(function () {
            resizeSections();
        });

        function supportTransition() {
            var _body = document.body || document.documentElement,
                _style = _body.style,
                support = _style.transition !== undefined || _style.WebkitTransition !== undefined || _style.MozTransition !== undefined || _style.MsTransition !== undefined || _style.OTransition !== undefined;
            return support;
        }

        function isiPad () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        }

        $.fn.betterScrollTransform = function (index, responsiveResize) {
            var sectionPosition = $(pageScrollParams.sectionSelector + '[data-section-index="' + index + '"]').offset().top,
                position = -(viewport().height * index);

            if (isiPad()) {
                position = -(Math.abs(sectionPosition) * index);
            }

            if (viewport().width > pageScrollParams.responsivePoint || responsiveResize) {
                if (supportTransition()) {
                    $(pageScrollParams.sectionWrapper).css({
                        "-webkit-transform": "translate3d(0, " + position + "px, 0)",
                        "-webkit-transition": "all " + pageScrollParams.animationDuration + "ms ease",
                        "-moz-transform": "translate3d(0, " + position + "px, 0)",
                        "-moz-transition": "all " + pageScrollParams.animationDuration + "ms ease",
                        "-ms-transform": "translate3d(0, " + position + "px, 0)",
                        "-ms-transition": "all " + pageScrollParams.animationDuration + "ms ease",
                        "transform": "translate3d(0, " + position + "px, 0)",
                        "transition": "all " + pageScrollParams.animationDuration + "ms ease"
                    });
                } else {
                    $(pageScrollParams.sectionWrapper).animate({ 'top': position }, pageScrollParams.animationDuration);
                }
            } else {
                $('html,body').animate({ scrollTop: $(pageScrollParams.sectionSelector + '[data-section-index="' + index + '"]').offset().top }, pageScrollParams.animationDuration);
            }

        };

        $.fn.betterScrollDown = function () {
            var self = $(this),
                currentSection = $(pageScrollParams.sectionSelector + '.active'),
                sectionIndex = currentSection.data('section-index'),
                nextSection = $(pageScrollParams.sectionSelector + '[data-section-index="' + (sectionIndex + 1) + '"]');

            if (nextSection.length > 0) {
                currentSection.removeClass('active');
                nextSection.addClass('active');

                self.betterScrollTransform(sectionIndex + 1);
            } else {
                return;
            }
            
        };

        $.fn.betterScrollUp = function () {
            var self = $(this),
                currentSection = $(pageScrollParams.sectionSelector + '.active'),
                sectionIndex = currentSection.data('section-index'),
                nextSection = $(pageScrollParams.sectionSelector + '[data-section-index="' + (sectionIndex - 1) + '"]');

            if (nextSection.length > 0) {
                currentSection.removeClass('active');
                nextSection.addClass('active');

                self.betterScrollTransform(sectionIndex - 1);
            } else {
                return;
            }

        };

        $(pageScrollParams.scrollDownSelector).on('click', function (e) {
            e.preventDefault();
            self.betterScrollDown();
        });

        $(pageScrollParams.scrollUpSelector).on('click', function (e) {
            e.preventDefault();
            self.betterScrollUp();
        });


        $(pageScrollParams.scrollToFirst).on('click', function (e) {
            var currentSection = $(pageScrollParams.sectionSelector + '.active'),
                nextSection = $(pageScrollParams.sectionSelector + '[data-section-index="0"]');
            e.preventDefault();
            currentSection.removeClass('active');
            nextSection.addClass('active');
            self.betterScrollTransform(0);
        });

        function initbetterScroll(event, delta) {
            var deltaDif = delta,
                timeCurrent = new Date().getTime();

            if (timeCurrent - timeAnimationLast < 1000) {
                event.preventDefault();
                return;
            }

            if (deltaDif > 0) {
                self.betterScrollUp();
            } else {
                self.betterScrollDown();
            }

            timeAnimationLast = timeCurrent;
        };

        function extractDelta(e) {
            if (e.wheelDelta) {
                return e.wheelDelta;
            }

            if (e.originalEvent.detail) {
                return e.originalEvent.detail * -40;
            }

            if (e.originalEvent && e.originalEvent.wheelDelta) {
                return e.originalEvent.wheelDelta;
            }
        }

        $.fn.bindMouseWheel = function () {
            if (mouseBinded == false) {
                $(document).bind('mousewheel DOMMouseScroll', function (e) {
                    var delta = extractDelta(e);
                    initbetterScroll(e, delta);
                    e.preventDefault();
                });
                mouseBinded = true;
            }
        }

        $.fn.unbindMouseWheel = function () {
            if (mouseBinded == true) {
                $(document).unbind('mousewheel DOMMouseScroll');
                mouseBinded = false;
            }
        }

        if (swipeEventLoaded == false) {
            self.swipeEvents();

            swipeEventLoaded = true;
        }

        $.fn.bindSwipe = function () {
            if (swipeBinded == false) {
                $(document).bind('swipeDown', function () {
                    var timeCurrent = new Date().getTime();

                    if (timeCurrent - timeAnimationLast < 1000) {
                        event.preventDefault();
                        return;
                    }
                    self.betterScrollUp();
                    timeAnimationLast = timeCurrent;
                }).bind('swipeUp', function () {
                    var timeCurrent = new Date().getTime();

                    if (timeCurrent - timeAnimationLast < 1000) {
                        event.preventDefault();
                        return;
                    }
                    self.betterScrollDown();
                    timeAnimationLast = timeCurrent;
                });
                swipeBinded = true;
            }
        }

        $.fn.unbindSwipe = function () {
            if (swipeBinded == true) {
                $(document).unbind('swipeDown swipeUp');
                swipeBinded = false;
            }
        }

        if (viewport().width > pageScrollParams.responsivePoint) {
            self.bindMouseWheel();
            self.bindSwipe();
            $('html').addClass('scroll-off');
        } else {
            $('html').addClass('scroll-on');
        }

        if (keyboardBinded == false) {
            $(document).keydown(function (e) {
                var tag = e.target.tagName.toLowerCase();
                switch (e.which) {
                    case 9:
                        e.preventDefault();
                        break;
                    case 38:
                        if (tag != 'input' && tag != 'textarea') self.betterScrollUp();
                        break;
                    case 40:
                        if (tag != 'input' && tag != 'textarea') self.betterScrollDown();
                        break;
                    default: return;
                }
                e.preventDefault();
            });
            keyboardBinded = true;
        }

        return false;
    };
	
});