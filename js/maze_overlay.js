/*!
* Adapted from: mtcOverlay - A jQuery plugin for responsive overlay windows
* Version: 0.6
* Author: Andrew Morgan, Paul McAvoy, Aaron Spence, Valdis Ceirans
*/

;(function ($, window, document) {

    'use strict';

    // Create the defaults once
    var pluginName = 'mtcOverlay',
        plugin;

    function getDesiredWidth(contentWidth, contentHeight) {
        var windowHeight = $(window).height(),
            outerWidth = $('.overlayBox').outerHeight();

        if (contentHeight > 0) {
            return Math.floor(contentWidth / contentHeight * (windowHeight - outerWidth + contentHeight));
        }

        return 0;
    }

    // The actual plugin constructor
    function Plugin(element, options) {
        plugin = this;
        plugin.element = element;
        plugin.$this = $(plugin.element);
        plugin.defaults = {
            buttonHtml: '<div class="overlayCloseButton"><a href="#"><i class="fa fa-remove"></i></a></div>',
            contentClass: '',
            gallery: false,
            galleryPrevHtml: '<button class="js_galleryPrev galleryPrev"><i class="fa fa-angle-left"></i></button>',
            galleryNextHtml: '<button class="js_galleryNext galleryNext"><i class="fa fa-angle-right"></i></button>',
            video: false,
            videoSettings: {
                autoplay: false,
                width: 500,
                height: 284
            },
            imageTitle: false,
            fadeTime: 300,
            placeholderWidth: 800,
            placeholderHeight: 600,
            beforeOpen: function () {},
            onOpen: function () {},
            onClose: function () {}
        };
        plugin.settings = $.extend(true, {}, plugin.defaults, options);
        plugin._defaults = plugin.defaults;
        plugin._name = pluginName;
        plugin.imageLoaded = false;
        plugin.imageFaded = false;
        plugin.imageLoading = false;
        plugin.galleryElement = null;

        plugin.init();

    }

    Plugin.prototype = {

        resize: function () {

            // if window is resized then reposition the overlay box
            var overlayBoxTop = '0px',
                overlayBoxLeft = '0px',
                windowHeight = $(window).height();

            // reset all
            $('.overlayBox').css('width', 'auto');
            $('.overlayBox .overlayContent').css('width', 'auto');
            $('.overlayBox .overlayContent').css('height', 'auto');
            $('.overlayBox').css({
                top: overlayBoxTop,
                left: overlayBoxLeft
            });

            // prevent scrollbars from messing with the dimenstions
            $('.overlayBoxOuter').css({
                'overflow': 'hidden'
            });

            if (plugin.settings.video === true) {
                plugin.resizeVideo();
            }

            // scale and reposition the content if needed
            if (windowHeight > $('.overlayBox').outerHeight()) {
                overlayBoxTop = (windowHeight - $('.overlayBox').outerHeight()) / 2;
            } else {
                $('.overlayBox .overlayImage').width(getDesiredWidth($('.overlayBox .overlayImage').width(), $('.overlayBox .overlayImage').outerHeight()));
            }

            if ($('.overlayBoxOuter').width() > $('.overlayBox').outerWidth()) {
                overlayBoxLeft = Math.floor(($('.overlayBoxOuter').width() - $('.overlayBox').outerWidth()) / 2);
            }

            $('.overlayBoxOuter').css({
                'overflow-y': 'auto'
            });

            $('.overlayBox').css({
                left: overlayBoxLeft,
                top: overlayBoxTop
            });

        },

        loadImage: function (image) {

            if (plugin.imageLoaded && plugin.imageFaded) {

                // add the new image
                $('.overlayBox .overlayImage img').remove();
                $('.overlayBox .overlayImage').append(image);

                // make visible and reset width
                $('.overlayBox .overlayImage img').show();
                $('.overlayBox .overlayImage').width('auto');
                $('.overlayBox .overlayImage').height('auto');

                // call the resize
                plugin.resize();

                // hide the image
                $('.overlayBox .overlayImage img').hide();

                // fade in the image
                $('.overlayBox .overlayImage img').stop().fadeIn(plugin.settings.fadeTime, function () {
                    plugin.imageLoaded = false;
                    plugin.imageFaded = false;
                    plugin.imageLoading = false;
                });

            }

        },

        displayOverlay: function () {

            // add close button to overlay
            $('.overlayBox').append($(plugin.settings.buttonHtml));

            // add any custom classes
            if (plugin.settings.contentClass !== '') {
                $('.overlayBox').addClass(plugin.settings.contentClass);
            }

            // add padding
            $('.overlayBox').css({'padding':plugin.settings.padding});

            // provide callback functionality before open of overlay and resize
            plugin.settings.beforeOpen();

            // reposition overlay
            plugin.resize();

            // Close overlay when background is clicked
            $('.overlayBoxOuter').on('click', function (e) {
                if (e.target === this) {
                    plugin.overlayClose();
                }
            });

            // fade in overlay
            $('.overlayBox').animate({
                opacity: 1
            }, function () {

                // provide callback functionality on open of overlay
                plugin.settings.onOpen();
            });

            // Close overlay on click of close button
            $('.overlayCloseButton').on('click', function (e) {
                e.preventDefault();
                plugin.overlayClose();
            });

            $(window).on('resize.overlay', function () {
                plugin.resize();
            });

            $(window).on('orientationchange.overlay', function () {
                plugin.resize();
            });

        },

        ajaxImagesLoaded: function (callback) {
            var images = $('.overlayAjax img'),
                promises = [];

            $.each(images, function(i, el) {
                var img = new Image();

                promises[i] = $.Deferred();
                img.onload = function() {
                    promises[i].resolve();
                };

                img.src = $(el).prop('src');
            });

            $.when.apply($, promises).done(function () {
                callback();
            });

        },

        // function to display the box
        ajaxResponse: function (url)  {

            // set some vars
            var html = '',
                dataFilter = plugin.$this.attr('data-filter');

            // do ajax
            $.ajax({
                type: 'get',
                url: url,
                success: function (response) {

                    // check if ajaxing whole page or section of page
                    if (dataFilter === undefined) {
                        html = response;
                    } else {
                        html = $(dataFilter, response).wrap('<div class="overlayContainer"></div>').html();
                    }

                    // add html to page
                    $('.overlayBox').html('<div class="overlayAjax">' + html + '</div>');

                    plugin.ajaxImagesLoaded(plugin.displayOverlay);

                }
            });
        },

        imageTitle: function (imageTitle) {

            $('.overlayBox').addClass('hasTitle');

            //clear the last title
            $('.overlayBox .overlayBoxTitle').html('');

            // if image title is on
            if (plugin.settings.imageTitle === true) {
                // add title/alt if it exists
                if (imageTitle !== '' && imageTitle !== undefined) {
                    if ($('.overlayBox .overlayBoxTitle').length > 0) {
                        $('.overlayBox .overlayBoxTitle').html(imageTitle);
                    } else {
                        $('.overlayBox').append('<span class="overlayBoxTitle">' + imageTitle + '</span>');
                    }
                }
            }

        },

        gallery: function (rel) {

            // set some vars
            var galleryName = rel,
                galleryImages = $('[rel="' + galleryName + '"]'),
                overlayImageActive = galleryImages.index(plugin.$this),
                initialWidth = 0,
                src = plugin.$this.prop('href'),
                img,
                galleryNext,
                galleryPrev,
                isVideo = plugin.$this.data('video');

            // build gallery
            $('.overlayBox').addClass('hasGallery');
            $('.overlayBox').append(plugin.settings.galleryPrevHtml);
            $('.overlayBox').append(plugin.settings.galleryNextHtml);

            plugin.galleryButtons(overlayImageActive, galleryImages.length - 1);

            if (plugin.settings.imageTitle === true) {
                plugin.imageTitle();
            }

            plugin.galleryElement = plugin.$this;

            //next and previous clicks
            $('body').on('click.gallery', '.overlayBox .js_galleryPrev, .overlayBox .js_galleryNext', function () {
                var overlayImageActive = $(this).data('index'),
                    activeGalleryElement  = galleryImages.eq(overlayImageActive),
                    imageTitle  = activeGalleryElement.find('img').attr('alt');

                plugin.galleryElement = galleryImages.eq(overlayImageActive);

                if (plugin.imageLoading) {
                    return;
                } else {
                    plugin.imageLoading = true;
                }

                plugin.galleryElement = galleryImages.eq(overlayImageActive);

                $('.overlayBox .overlayContent').width($('.overlayBox .overlayContent').width());
                $('.overlayBox .overlayContent').height($('.overlayBox .overlayContent').height());
                // if next element is video
                if (plugin.galleryElement.data('video')) {
                    $('.overlayContent').removeClass('overlayImage');
                    $('.overlayContent').addClass('overlayVideo');
                    $('.overlayBox .overlayContent img, .overlayBox .overlayContent iframe').fadeOut(plugin.settings.fadeTime, function () {
                        plugin.imageFaded = false;
                        plugin.videoMode(activeGalleryElement.prop('href'));
                        plugin.imageLoading = false;
                        plugin.imageLoaded = false;
                    });
                //if next element is not video
                } else {
                    $('.overlayContent').addClass('overlayImage');
                    $('.overlayContent').removeClass('overlayVideo');
                    plugin.galleryImage(activeGalleryElement.prop('href'));
                }

                plugin.galleryButtons(overlayImageActive, galleryImages.length - 1)

                plugin.imageTitle(imageTitle);

            });

            // add active to gallery
            if (isVideo) {
                $('.overlayContent').addClass('overlayVideo');
                plugin.videoMode(plugin.$this.attr('href'));
                plugin.displayOverlay();
            } else {
                $('.overlayContent').addClass('overlayImage');
                img = $('<img/>');

                img.on('load', function () {
                    $('.overlayBox .overlayImage').append(img);
                    plugin.displayOverlay();

                });

                img.attr({
                    'src' : src
                });
            }

        },

        singleImage: function () {

            var url = plugin.$this.attr('href'),
                imageHeight = 0;

            // add image to page
            $('.overlayContent').addClass('overlayImage');
            $('.overlayContent').append('<img src="' + url + '">');

            // if imageTitle is true add title to page
            if (plugin.settings.imageTitle === true) {
                plugin.imageTitle(plugin.$this.find('img').attr('alt'));
            }

            // resize after image has loaded
            $('.overlayBox img').on('load', function () {
                plugin.displayOverlay();
            });

        },

        galleryButtons: function (activeIndex, max) {
            var galleryPrev, galleryNext;

            if (activeIndex > 0) {
                galleryPrev = activeIndex - 1;
                $('.overlayBox .js_galleryPrev').data('index', galleryPrev).show();
            } else {
                $('.overlayBox .js_galleryPrev').hide();
            }

            if (activeIndex < max) {
                galleryNext = activeIndex + 1;
                $('.overlayBox .js_galleryNext').data('index', galleryNext).show();
            } else {
                $('.overlayBox .js_galleryNext').hide();
            }

        },

        galleryImage: function(imgSrc){
            var image = $('<img/>');

            $('.overlayBox .overlayImage img, .overlayBox .overlayImage iframe').fadeOut(plugin.settings.fadeTime, function () {
                $(this).remove();
                plugin.imageFaded = true;
                plugin.loadImage(image);

            });

            image.on('load', function () {
                plugin.imageLoaded = true;
                plugin.loadImage(image);
                // if imageTitle is true add title to page
                if (plugin.settings.imageTitle === true) {
                    plugin.imageTitle();
                }
            });

            image.attr({
                'src' : imgSrc
            });
        },

        initVideo: function () {

            var iframe = $(".overlayVideo iframe"),
                ogWidth = iframe.width(),
                ogHeight = iframe.height(),
                ogRatio = ogHeight / ogWidth;

            iframe.data('origWidth', ogWidth);
            iframe.data('origHeight', ogHeight);
            iframe.data('origAspect', ogRatio);

        },

        resizeVideo: function () {
            var targetWidth,
                targetHeight,
                iframe = $('.overlayVideo iframe'),
                origWidth = iframe.data('origWidth'),
                origHeight = iframe.data('origHeight'),
                aspect = iframe.data('origAspect'),
                desiredWidth,
                desiredHeight,
                fitHorizontally = true;

            if ($('.overlayVideo').length > 0) {
                $('.overlayBox').show();
                // hide iframe so we could tell the wrapper size
                iframe.hide();

                $('.overlayBox').css({
                    width: '100%'
                });

                $('.overlayVideo').css({
                    width: 'auto',
                    height: 'auto'
                });

                targetWidth = $('.overlayVideo').width();

                // show iframe and reset it's dimensions
                iframe.show();
                iframe.height(origHeight);
                iframe.width(origWidth);
                targetHeight = $('.overlayVideo').height();

                // try to fit in vertically
                if ($('.overlayBox').outerHeight() > $(window).height()) {
                    desiredWidth = getDesiredWidth(origWidth, origHeight);
                    desiredHeight = desiredWidth * aspect;

                    // if fits horizontally
                    if (desiredWidth < $('.overlayBoxOuter').width()) {
                        iframe.width(desiredWidth);
                        iframe.height(iframe.width() * aspect);
                        $('.overlayBox').css({
                            width: 'auto'
                        });
                        fitHorizontally = false;
                    }
                }

                // if horizontal resize is needed
                if (fitHorizontally) {
                    // if video is bigger than window and horizontal resize is needed
                    if (targetWidth < origWidth) {
                        $('.overlayBox').css({
                            width: '100%'
                        });
                        iframe.width(targetWidth);
                        iframe.height(targetWidth * aspect);

                        // if video is smaller than window reset iframe width
                    } else {
                        iframe.width(origWidth);
                        iframe.height(origHeight);
                        $('.overlayBox').css({
                            width: 'auto'
                        });
                    }
                }
            }
        },

        videoMode: function (url) {

            var autoplay = '',
                videoid = '',
                iframeSrc = '';

            // autoplay
            if (plugin.settings.videoSettings.autoplay === true) {
                autoplay = '?autoplay=1';
            }

            // lets iframe in the video
            if (url.toLowerCase().indexOf("youtu") >= 0) {
                videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
                iframeSrc = '<iframe src="https://www.youtube.com/embed/' + videoid[1] + autoplay + '" width="' + plugin.settings.videoSettings.width +'" height="' + plugin.settings.videoSettings.height +'" frameborder="0" allowfullscreen></iframe>';
                $('.overlayContent').addClass('overlayVideo');
                $('.overlayVideo').html(iframeSrc);
            } else if (url.toLowerCase().indexOf("vimeo") >= 0) {
                videoid = url.match(/https?:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/);
                iframeSrc = '<iframe src="https://player.vimeo.com/video/' + videoid[2] + autoplay + '" width="' + plugin.settings.videoSettings.width +'" height="' + plugin.settings.videoSettings.height +'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
                $('.overlayContent').addClass('overlayVideo');
                $('.overlayVideo').html(iframeSrc);
            }

            plugin.initVideo();
            plugin.resize();

        },

        overlayOpen: function () {

            var url = plugin.$this.attr('href'),
                rel = plugin.$this.attr('rel'),
                extension,
                extensions = [
                    'jpg',
                    'jpeg',
                    'png',
                    'gif'
                ],
                scrollOnOpen;

            extension = url.split('.').pop().toLowerCase();

            // store scroll postion
            scrollOnOpen = $('body').scrollTop() || $('html').scrollTop();

            $('body').data('stored-scroll', scrollOnOpen);

            $('.siteOuterWrapper').css({
                position: 'relative',
                top: -scrollOnOpen
            });

            // append overlay background and container to body
            $('body').addClass('noScroll');

            $('body').append('<div class="overlayBoxOuter"><div class="overlayBox"><div class="overlayContent"></div></div></div>');

            // if gallery load gallery
            if (rel && $('[rel="' + rel + '"]').length > 1 && plugin.settings.gallery === true) {
                plugin.gallery(rel);
            } else {
                // if extention is in array then we have to grab an image and not ajax
                if ($.inArray(extension, extensions) > -1) {
                    plugin.singleImage();
                    // video? lets insert it
                } else if (plugin.settings.video === true) {
                    plugin.videoMode(plugin.$this.attr('href'));
                    plugin.displayOverlay();
                    // do ajax
                } else {
                    plugin.ajaxResponse(url);
                }
            }

            $('.bgCover').css({
                opacity: 0
            }).animate({
                opacity: 1
            });

        },

        overlayClose: function () {

            plugin.settings.onClose();

            $('body').off('click.gallery');

            $('body').removeClass('noScroll');

            $('.overlayBoxOuter').animate({
                opacity: 0
            }, 300, function () {
                plugin.destroy();
            });

        },

        destroy: function () {

            // remove some elements from the DOM
            $('.overlayCloseButton').remove();
            $('.overlayBoxOuter').remove();

            $('.siteOuterWrapper').css({
                'top': 0
            });

            $('body, html').scrollTop($('body').data('stored-scroll'));

            // remove plugin data from trigger
            plugin.$this.removeData('plugin_' + pluginName);

            $(window).off('resize.overlay');
            $(window).off('orientationchange.overlay');

        },

        init: function () {

            plugin.overlayOpen();

        }

    };

    $.fn[pluginName] = function (options) {
        return this.on('click', function (e) {
            e.preventDefault();
            var plugin, _name;
            plugin = $.data(this, 'plugin_' + pluginName);
            if (typeof options === 'string') {
                if (plugin != null) {
                    if (typeof plugin[_name = options] === 'function') {
                        return plugin[_name]();
                    } else {
                        return void 0;
                    }
                } else {
                    return void 0;
                }
            } else if (!plugin) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });

        return this;
    };

})(jQuery, window, document);