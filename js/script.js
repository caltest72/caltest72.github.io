/*
 * Slide Fade Toggle
 */

$.fn.slideFadeToggle  = function (speed, easing, callback) {
    return this.animate({opacity: 'toggle', height: 'toggle'}, speed, easing, callback);
};


/*
 * Debounce
 */

function debouncer(func, timeout) {
    'use strict';

    var timeoutID,
        timeout = timeout || 200;

    return function () {
        var scope = this,
            args = arguments;

        clearTimeout(timeoutID);

        timeoutID = setTimeout(function () {
            func.apply(scope, Array.prototype.slice.call(args));
        }, timeout);
    };
}

// returns whether a given media query is true
// takes either max, min, or both max and min
// 0 is an unset argument
function matchesMediaQuery(min_width, max_width) {

    'use strict';

    // check which arguments are set
    var max_is_set = true,
        min_is_set = true;

    if ((min_width === undefined || min_width === 0)) {
        min_is_set = false;
    }
    if ((max_width === undefined || max_width === 0)) {
        max_is_set = false;
    }

    // perform the relevant media query based on which arguments have been supplied
    if (max_is_set && !min_is_set) {
        return window.matchMedia('(max-width: '+max_width+'px)').matches;
    } else if (!max_is_set && min_is_set) {
        return window.matchMedia('(min-width: '+min_width+'px)').matches;
    } else if (max_is_set && min_is_set) {
        return window.matchMedia('(min-width: '+min_width+'px) and (max-width: '+max_width+'px)').matches;
    } else {
        return 0;
    }
}

function singleAccordionClick() {

    var header,
        content,
        animationSpeed,
        breakpoint,
        breakpointFromData,
        groupID;

    // on click for the header of the accordion
    $(".js_singleAccordionHeader").each(function () {

        $(this).on('click', function (e) {

            e.stopPropagation();
            e.preventDefault();


            header = $(this);
            animationSpeed = 400;
            groupID = header.data("singleAccordionGroup");
            content = $('.js_singleAccordionContent[data-single-accordion-group="'+groupID+'"]');
            breakpoint = 670;
            breakpointFromData = header.data("breakpoint");

            // get breakpoint from element if it is set
            if (breakpointFromData !== undefined) {
                breakpoint = breakpointFromData;
            }

            if (matchesMediaQuery(0,breakpoint)) {

                header.slideUp(animationSpeed, "swing");
                content.stop(true, true).slideFadeToggle(animationSpeed, "swing");
                header.toggleClass('active');
                content.toggleClass('active');
            }
        });
    });
}


function singleAccordionDisplay() {

    'use strict';

    var header,
        content,
        breakpoint,
        breakpointFromData,
        groupID;

    // For each accordion
    $(".js_singleAccordionHeader").each(function () {
        header = $(this);
        groupID = header.data("singleAccordionGroup");
        content = $('.js_singleAccordionContent[data-single-accordion-group="'+groupID+'"]');
        breakpoint = 670;
        breakpointFromData = header.data("breakpoint");

        // get breakpoint from element if it is set
        if (breakpointFromData !== undefined) {
            breakpoint = breakpointFromData;
        }

        // Remove any jquery applied styles when we go above breakpoint width, so the elements just shows normally
        if (matchesMediaQuery(Number(breakpoint) + 1)) {
            content.attr("style", "");
            content.removeClass("active");
            header.attr("style", "");
            header.removeClass("active");
        } else {
            // Hide content on mobile unless it has the class active
            if (!header.hasClass("active")) {
                content.hide();
                header.show();
            }

        }
    });
}

function responsiveMatchHeights() {

    var tabletCols = $('.videoWrap, .earlyAccessWrap');
    var desktopCols = $('.firstColWrap, .secondColWrap')

    if (matchesMediaQuery(981,1200)) {
        desktopCols.matchHeight({ remove: true });
        tabletCols.matchHeight();
    } else if (matchesMediaQuery(1201)) {
        tabletCols.matchHeight({ remove: true });
        desktopCols.matchHeight();
    }
}


$(document).ready(function () {

    $('.videoWrap a').mtcOverlay({
        contentClass: 'showOverflow',
        video: true,
        videoSettings: {
            autoplay: true,
            width: 800,
            height: 450
        },
        buttonHtml: '<div class="videoCloseButton overlayCloseButton"><a href="#"><i class="fa fa-remove"></i> Close</a></div>'
    });

    responsiveMatchHeights();

    singleAccordionClick();
    singleAccordionDisplay();

    $('.js_scrollTo').on('click', function (e) {
        e.preventDefault();
        href = $(this).attr('href');

        if ($(href).length) {
            offset = $(href).offset().top;

            $('html, body').stop().animate({
                scrollTop: offset
            }, 600);
        }
        return false;
    });

    if($('#js_formError').length) {
        offset = $('#js_formError').offset().top;

        $('html, body').stop().animate({
            scrollTop: offset
        }, 1200);
    } else if($('#js_formSuccess').length) {
        offset = $('#js_formSuccess').offset().top;

        $('html, body').stop().animate({
            scrollTop: offset
        }, 1200);
    }

}); // end document ready

$(window).on('resize', debouncer(function (e) {

    /*
     * Force strict mode
     */

    'use strict';

    /*
     * Set window width on resize
     */

    window.windowWidth = $(window).outerWidth();

    /*
     * Force footer to bottom of page
     */

    //stickyBottom();
    singleAccordionDisplay();
    responsiveMatchHeights();


})); // debounces