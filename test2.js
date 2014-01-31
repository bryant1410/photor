$(document).ready(function() {

    // Pointer enabled ie11
    // MSpointer ie10, windows phone
    // touch event (ios, android)
    // mouse events (desktop / fallback)



    /*
     * Returns array of events which device supports
     *
     * @return {Array} Array of supported events
     */
    function getSupportedEvents() {
        var isPointer = navigator.pointerEnabled,
            isTouch = !!('ontouchstart' in window),

            pointer   = ['pointerdown', 'pointermove', 'pointerup', 'pointerleave'],
            msPointer = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp', 'MSPointerOut'],
            touch     = ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
            mouse     = ['mousedown', 'mousemove', 'mouseup', 'mouseleave'];

        return isPointer ? pointer : isMsPointer ? msPointer : isTouch ? touch : mouse;
    }

    var isMsPointer = navigator.msPointerEnabled;

    var evt = getSupportedEvents(),
        el = {
            runner: $('.block__runner'),
            control: $('.block__control'),
            prev: $('.block__prev'),
            next: $('.block__next'),

            out: $('#out')
        },
        isScrolling,
        isMultitouch = false,
        dragging = false,
        start = {},
        delta = {};


    // Bind events

    // MS Pointer события через jQuery не содержат orginalEvent и данных о координатах
    // Touch события на Андроид, установленные нативно, не срабатывают до зума или скролла
    // iOS устройства просто работают

    if (isMsPointer) {

        el.control[0].addEventListener(evt[0], touchstart);
        el.control[0].addEventListener(evt[1], touchmove);
        el.control[0].addEventListener(evt[2], touchend);
        el.control[0].addEventListener(evt[3], touchend);

    } else {

        el.control
            .on(evt[0], touchstart)
            .on(evt[1], touchmove)
            .on(evt[2], touchend)
            .on(evt[3], touchend);

    }


    function touchstart(e) {
        // console.log(e.type);
        if (!dragging) {
            var x = e.pageX || e.originalEvent.touches[0].pageX,
                y = e.pageY || e.originalEvent.touches[0].pageY;

            start = {x: x, y: y};
            delta = {x: 0, y: 0};

            dragging = true;
        }
    }

    function touchmove(e) {
        var touches = e.originalEvent && e.originalEvent.touches,
            x = e.pageX || touches[0].pageX,
            y = e.pageY || touches[0].pageY;

        // Detect multitouch
        isMultitouch = isMultitouch || (touches && touches.length) > 1;

        // Detect scrolling (for windows and windows phone touch-action: pan-y)
        if (e.type != 'MSPointerMove' && e.type != 'pointermove' && typeof isScrolling == 'undefined') {
            isScrolling = !!(isScrolling || Math.abs(x - start.x) < Math.abs(y - start.y));
        }

        if (!dragging || isMultitouch || isScrolling) {
            return;
        } else {
            e.preventDefault();
        }

        if (!start.x && !start.y) {
            // Start drag
            start = {x: x, y: y};
            delta = {x: 0, y: 0};
            // console.log('start start(' + x + ', ' + y + ') ' + e.type);
        } else {
            // Continue drag
            delta = {x: x - start.x, y: y - start.y};
            // console.log('move  delta(' + delta.x + ', ' + delta.y + ') ' + e.type);
        }

        // Demo
        el.runner
            .css('transition-duration', '0s')
            .css('transform', 'translate3d(' + delta.x + 'px, 0, 0)');

    }

    function touchend(e) {
        // Force re-layout (android chrome needs)
        el.control[0].style.display = 'none';
        el.control[0].offsetWidth; // no need to store this anywhere, the reference is enough
        el.control[0].style.display = 'block';

        // Reset scrolling detection
        isScrolling = undefined;

        // Update multitouch info
        if (e.type != 'MSPointerUp' && e.type != 'MSPointerOut' && e.type != 'pointerup' && e.type != 'pointerleave') {
            isMultitouch = (e.originalEvent.touches && e.originalEvent.touches.length) == 1;
        }

        el.runner
            .css('transition-duration', '.3s')
            .css('transform', 'translate3d(0, 0, 0)');

        dragging = false;
        start = {};
    }

    console.log = function(str) {
        var old = el.out.html();

        el.out.html(old + '\n' + str);
    };

});