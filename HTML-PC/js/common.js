(function($) {
    "use strict";
    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    }

    //backToTop
    function backToTop() {
        $(window).scroll(function() {
            if ($(window).scrollTop() >= 200) {
                $('#to_top').fadeIn();
            } else {
                $('#to_top').fadeOut();
            }
        });


        $("#to_top").click(function() {
            $("html, body").animate({
                scrollTop: 0
            });
            return false;
        });
        $(window).scroll(function() {
            if ($(window).scrollTop() >= 60) {
                $('.topnav ').addClass('sticky');
            } else {
                $('.topnav ').removeClass('sticky');
            }
        });
    }

    //onCLick
    function onCLick() {
        $('#vibeji-ham').off('click').on('click', function() {
            $(this).toggleClass('open');
            $('.main-menu').toggleClass('open');
            $('body').css('overflow', $(this).hasClass('open') ? 'hidden' : '')
        });

        $('.sub_menu').click(function() {
            if ($(this).next('.level2').css('display') == 'none') {
                $(this).html('-');
            } else {
                $(this).html('+');
            };
            $(this).next('.level2').slideToggle("slow", function() {});
        });

        $(".tab-default >a").click(function(event) {
            $(".tab-default >a").removeClass("active");
            if (!$(this).hasClass("active")) {
                $(this).addClass("active");
            } else {
                $(this).removeClass("active");
            }
            event.preventDefault();
            var tab = $(this).attr("href");
            $(".tab-content >div").not(tab).css("display", "none");
            $(tab).fadeIn();
        });
    }
    //slide Gallery
    function swiper() {
        var swiperFasca = new Swiper(".slide-fastca .swiper-container", {
            spaceBetween: 0,
            loop: false,
            navigation: {
                nextEl: ".slide-fastca .swiper-button-next",
                prevEl: ".slide-fastca .swiper-button-prev",
            },
            speed: 1000,
        });
        var swiperArticle = new Swiper(".slide-article .swiper-container", {
            spaceBetween: 0,
            loop: false,
            speed: 1000,
            effect: 'fade',
            navigation: {
                nextEl: ".slide-article .swiper-button-next",
                prevEl: ".slide-article .swiper-button-prev",
            },
            autoplay: {
                delay: 6000,
                disableOnInteraction: false,
            },
        });

        var swiperGiaitri = new Swiper(".slide-giatri .swiper-container", {
            slidesPerView: 3,
            spaceBetween: 20,
            loop: true,
            navigation: {
                nextEl: ".slide-giatri .swiper-button-next",
                prevEl: ".slide-giatri .swiper-button-prev",
            },
            breakpoints: {
                991: {
                    loop: false,
                    slidesPerView: 2,
                },
                576: {
                    loop: false,
                    slidesPerView: 1,
                }
            }
        });

        var swiperGiaitri = new Swiper(".box-doitac .swiper-container", {
            slidesPerView: 6,
            spaceBetween: 24,
            loop: true,
            navigation: {
                nextEl: ".box-doitac .swiper-button-next",
                prevEl: ".box-doitac .swiper-button-prev",
            },
            breakpoints: {
                767: {
                    loop: false,
                    slidesPerView: 2,
                }
            }
        });

    }


    $(function() {
        backToTop();
        onCLick();
        swiper();
    });
})(jQuery);