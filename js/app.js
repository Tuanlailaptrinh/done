// Helpers
Number.prototype.toMoney = function () {
    return this.toLocaleString().replace(/,/g, '.') + ' đ';
};

function debounce(func, wait) {
    var timeout;

    return function () {
        var context = this,
            args = arguments;

        var executeFunction = function () {
            func.apply(context, args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(executeFunction, wait);
    };
}

function getLocaleText(text, locale) {
    var regex = new RegExp('\\[:' + locale + '\\]([^\\[]+)?\\[:', 'i'),
        result = text;
    text.replace(regex, function (match, $1) {
        result = (typeof $1 !== 'undefined') ? $1 : '';
    });
    return result;
}

function flyToCart($flyer, $target) {
    $flyerClone = $flyer.clone().addClass('dish-fly');

    $flyerClone
        .offset({
            top: $flyer.offset().top + 75,
            left: $flyer.offset().left + 100
        })
        .appendTo($('body'))
        .animate({
            top: $target.offset().top + 15,
            left: $target.offset().left + 120,
            width: 75,
            height: 75
        }, 250)
        .animate({
            width: 0,
            height: 0
        }, 200, function () {
            $(this).detach();
        });
}

function copyToClipboard(text) {
    var $temp = $('<input>').val(text);
    $('body').append($temp);
    $temp.select();
    document.execCommand('copy');
    $temp.remove();
}

function removeLastDirectoryPartOf(the_url) {
    var the_arr = the_url.split('/');
    the_arr.pop();
    return ( the_arr.join('/') );
}

function MenuOpenCloseTimer(dDelay, fActionFunction, node) {
    if (typeof this.delayTimer == "number") {
        clearTimeout(this.delayTimer);
        this.delayTimer = '';
    }
    if (node)
        this.delayTimer = setTimeout(function () {
            fActionFunction(node);
        }, dDelay);
    else
        this.delayTimer = setTimeout(function () {
            fActionFunction();
        }, dDelay);
}

function recruitShow(elem, duration) {
    var $icon = elem.children('.icon').children('.fa');
    $icon.removeClass('fa-angle-double-down').addClass('fa-times');
    elem.next('.content').show(duration);
    elem.addClass('active');
}

function recruitHide(elem, duration) {
    var $icon = elem.children('.icon').children('.fa');
    $icon.removeClass('fa-times').addClass('fa-angle-double-down');
    elem.next('.content').hide(duration);
}

// Global variables
primaryColor = '#CE181F';
currentLocale = $('html').attr('lang');
messageAlert = null;
app = angular.module('jollibee', ['ksSwiper', 'ng-sweet-alert'],function($locationProvider) {
      $locationProvider.html5Mode(true);
    });
app.run(['$rootScope', function ($rootScope) {
    $rootScope.getTranslate = function (text) {
        return getLocaleText(text, currentLocale);
    };
}]);
$customerLogin = $('#modal-login');
$customerProfile = $('#modal-profile');
$newsBlock = $('.news > .board > .block');

// Main
(function () {


    if (window.location.hash && window.location.hash === '#_=_') {
        if (window.history && history.pushState) {
            window.history.pushState('', document.title, window.location.pathname);
        } else {
            // Prevent scrolling by storing the page's current scroll offset
            var scroll = {
                top: document.body.scrollTop,
                left: document.body.scrollLeft
            };
            window.location.hash = '';
            // Restore the scroll offset, should be flicker free
            document.body.scrollTop = scroll.top;
            document.body.scrollLeft = scroll.left;
        }
    }

    if (currentLocale === 'vi') {
        $.extend($.validator.messages, {
            required: "Không được để trống",
            email: "Email không hợp lệ",
            digits: "Hãy nhập chữ số",
            maxlength: $.validator.format("Tối đa {0} kí tự"),
            minlength: $.validator.format("Tối thiểu {0} kí tự"),
            rangelength: $.validator.format("Hãy nhập từ {0} đến {1} kí tự"),
            equalTo: "2 giá trị không khớp nhau",
        });
    }

    app.controller('CustomerLoginController', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
        $scope.tab = 1;
        $scope.cities = [];
        $scope.districts = [];
        $scope.city = 1;
        $scope.district = null;

        $scope.isTab = function (value) {
            return $scope.tab === value;
        };

        $scope.setTab = function (value) {
            $scope.tab = value;
            if (value === 4) {
                $http.get('/api/area').success(function (response) {
                    $scope.cities = response.cities;
                    $scope.districts = response.districts;
                });
            }
        };

        $scope.openTab = function (value, isClose) {
            /*isClose = (typeof isClose !== 'undefined') ? isClose : true;
             if (isClose) $customerLogin.modal('show');
             else $customerLogin.modal({ backdrop: 'static', keyboard: false }).modal('show');*/
            $customerLogin.modal('show');
            $scope.$apply(function () {
                $scope.setTab(value);
            });
        };

        $scope.getMinPrice = function () {
            if ($scope.district === null) return '';
            var found = $filter('filter')($scope.districts, {id: $scope.district}, true);
            if (found.length) return parseInt(found[0].min_price).toMoney();
            else return '';
        };
    }]);


    app.controller('CustomerCheckoutController', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
        $scope.tab = 1;
        $scope.cities = [];
        $scope.districts = [];
        $scope.city = 1;
        $scope.district = null;
        $scope.previous = 0;

        $scope.edditing = 0;

        
        

        $scope.isTab = function (value) {
            return $scope.tab === value;
        };

        $scope.setTab = function (value) {
            if( (value > $scope.previous) || 
                    (value == 1 && $scope.previous == 2)
                ){
                $scope.tab = value;
                $scope.previous = value;
            }
           
            if (value === 4) {
                $http.get('/api/area').success(function (response) {
                    $scope.cities = response.cities;
                    $scope.districts = response.districts;
                });
            }

            $(".progress-bar").removeClass (function (index, className) {
                return (className.match (/(^|\s)step\S+/g) || []).join(' ');
            }).addClass('step'+value);
            
            var $currentNav = $('.wizard .nav-tabs-1 li[data-tab="'+ value +'"]');
            $currentNav.addClass('active');
            $currentNav.removeClass('selected');
            $currentNav.prev().addClass('selected');
            $currentNav.next().removeClass('selected');

            // if ($(window).width() > 1024) {
                var y = $('.wizard').offset().top ;
                $('html,body').animate({
                   scrollTop: y
                });
            // }

            console.log('setTab', value);

            if(stickySidebar && $(window).width() > 1024){
                stickySidebar.updateSticky();
            }

        };

        $scope.updateAddress = function(value){
            $scope.edditing = value;
            // $scope.$apply();
            if(value == 1){
                if ($(window).width() > 1024) {
                    $('html,body').animate({
                    //    scrollTop: $('#tab-address-editing').offset().top + 200
                       scrollTop: $('.address-list').offset().top + $('.address-list').height()

                    });
                }
               
            }
            if(stickySidebar && $(window).width() > 1024){
                stickySidebar.updateSticky();
            }
            //==TODO: update address
            
        }

        $scope.init = function(value) {
            $scope.tab = value;
        };
     
        $scope.setTab($scope.tab);

   
    }]);

    swal.setDefaults({
        confirmButtonColor: primaryColor,
        html: true
    });

    $('img.lazy').lazyload({
        effect: 'fadeIn',
        placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    });

    $('.lazy-bg').lazyload();

    $(document).ready(function () {

        if ($(window).width() <= 640) {
            $('.bg-xs').css('background-image', 'url("' + $('.bg-xs').children('img').prop('currentSrc') + '")');
        }

        $('.scrollbar-macosx, .scrollbar-inner').scrollbar();

        if($('#post-relative .swiper-slide').length > 3){
              new Swiper('#post-relative', {
            speed: 1000,
            paginationHide: true,
            slidesPerView: 3,
            slidesPerColumn: 2,
            slidesPerGroup:3,
            //loop: true,
            spaceBetween: 30,
            autoplay: 5000,
            nextButton: '.swiper-btn-next',
            prevButton: '.swiper-btn-prev',
            breakpoints: {
                1024: {
                    slidesPerView: 2
                },
                543: {
                    slidesPerView: 1
                }
            }
            });
        }
        else{
             new Swiper('#post-relative', {
            speed: 1000,
            paginationHide: true,
            slidesPerView: 3,
            //loop: true,
            spaceBetween: 30,
            autoplay: 5000,
            nextButton: '.swiper-btn-next',
            prevButton: '.swiper-btn-prev',
            breakpoints: {
                1024: {
                    slidesPerView: 2
                },
                543: {
                    slidesPerView: 1
                }
            }
        });
        }

       
        if ($('body').hasClass('home')) {
            if ($('#slider').length > 0) {
            //     window.f = new flux.slider('#slider', {
            //         autoplay: false,
            //         pagination: true,
            //         width: $(window).width(),
            //         // height: $(window).width() / 2 - 100,
            //         height: 500,
            //         transitions: ['tiles3d', 'blocks', 'bars3d']
            //     });

                $('#slider').owlCarousel({
                    nav:true,
                    // navText: ["<li class='dot'></li>"],
                    autoplayTimeout: 3000,
                    loop:true,
                    margin:10,
                    // responsiveClass:true,
                    navText: ["<i class='icon-arrow-2 ix'></i>", "<i class='icon-arrow-2'></i>"],
                    autoplay: true,
                    items:1,
                    // responsive:{
                    //     0:{
                    //         items:1,
                    //         nav:true
                    //     },
                    //     600:{
                    //         items:1,
                    //         nav:false
                    //     },
                    //     1000:{
                    //         items:1,
                    //         nav:true,
                    //         loop:true
                    //     }
                    // }
                })
            }
            // new Swiper('#menu-slide', {
            //     speed: 1000,
            //     // draggable: true,
            //     // simulateTouch:false,
            //     pagination: '#menu-today .swiper-pagination',
            //     slidesPerView: 4,
            //     paginationClickable: true,
            //     loop: true,
            //     spaceBetween: 10,
            //     autoplay: false,
            //     preloadImages: false,
            //     lazyLoading: true,
            //     breakpoints: {
            //         1024: {
            //             slidesPerView: 2
            //         }
            //     }
            // });
            new Swiper('#service-slide', {
                speed: 1000,
                pagination: '.swiper-pagination',
                paginationClickable: true,
                loop: true,
                spaceBetween: 30,
                autoplay: 5000,
            });
            new Swiper('#mobile-slider', {
                speed: 1500,
                loop: true,
                autoplay: 2000,
                effect: 'fade',
                nextButton: '.swiper-button-next',
                prevButton: '.swiper-button-prev',
            });
        } else if ($('body').hasClass('page')) {
            new Swiper('#kid-gallery', {
                speed: 1000,
                paginationHide: true,
                slidesPerView: 3,
                loop: true,
                spaceBetween: 30,
                autoplay: 5000,
                preloadImages: false,
                lazyLoading: true,
                nextButton: '.swiper-btn-next',
                prevButton: '.swiper-btn-prev',
                breakpoints: {
                    768: {
                        slidesPerView: 2
                    },
                    543: {
                        slidesPerView: 1
                    }
                }
            });
            new Swiper('#kid-others', {
                speed: 1000,
                paginationHide: true,
                slidesPerView: 3,
                //loop: true,
                spaceBetween: 30,
                autoplay: 5000,
                preloadImages: false,
                lazyLoading: true,
                nextButton: '.swiper-button-next',
                prevButton: '.swiper-button-prev',
                breakpoints: {
                    768: {
                        slidesPerView: 2
                    },
                    543: {
                        slidesPerView: 1
                    }
                }
            });
            new Swiper('#kid-leaflets', {
                speed: 1500,
                nextButton: '.swiper-button-next',
                prevButton: '.swiper-button-prev',
                paginationClickable: true,
                spaceBetween: 0,
                loop: true,
                centeredSlides: true,
                effect: 'flip',
                autoplayDisableOnInteraction: false
            });
        }

        // Menu
        $('.submenu_toggle').on('click', function () {
            $(this).next('.sub-menu').toggle('slow', 'swing');
        });

        $('.menu-backdrop').click(function (event) {
            $('#btn-toggle').prop('checked', false);
        });

        $('.btn-icon.login,.btn-icon+.text-login , .change-pass').click(function (event) {
            event.preventDefault();
            angular.element($customerLogin[0]).scope().openTab(1);
        });

        $('.scroll-down').on('click', function () {
            $('html, body').animate({
                scrollTop: $('#scroll-down').offset().top
            }, 500);
        });

        // Order
        $('.dish-item > .item-wrapper > img').hover(function () {
            $(this).siblings('.add-to-cart').addClass('hover');
        }, function () {
            $(this).siblings('.add-to-cart').removeClass('hover');
        });

        $('.side-group-overlay').click(function (event) {
            $(this).parent('.side-group').toggleClass('enable');
        });

        // Contact
        $('#map-overlay').click(function (event) {
            $(this).detach();
        });

        // News
        $('.btn-news-more').click(function (event) {
            event.preventDefault();
            var self = $(this);
            self.addClass('loading');
            $.get(self.attr('href'), function (data) {
                $newsBlock.append(data.posts);
                self.removeClass('loading');

                if (data.nextUrl === null) $newsBlock.siblings().addClass('hidden');
                else self.attr('href', data.nextUrl);
            });
        });

        // Recruit
        $('.recruit-dropdown').on('click', '.item', function (event) {
            var $icon = $(this).children('.icon').children('.fa');
            if ($icon.hasClass('fa-angle-double-down')) {
                $('.recruit-dropdown').each(function () {
                    recruitHide($(this).children('.item'), 500);
                    $(this).children('.item').removeClass('active');
                });
                recruitShow($(this), 500);
            } else {
                recruitHide($(this), 500);
                $(this).delay(duration - 100).queue(function () {
                    $(this).removeClass('active');
                    $(this).dequeue();
                });
            }
        });

        $('.filter-city').change(function (event) {
            var value = $(this).val();
            var $rows = $(this).parent('.location').next('.job-list').find('.recruit-dropdown');
            if (value === '') {
                $rows.removeClass('hidden');
                return;
            }
            $rows.each(function (index, el) {
                if ($(el).data('city') != value) $(el).addClass('hidden');
                else $(el).removeClass('hidden');
            });
        });

        // Forms
        $('#modal-login form').each(function (index, val) {
            var type = $(val).data('type');
            $(val).validate({
                rules: {
                    name: {
                        required: true,
                        minlength: 3
                    },
                    old_password: {
                        required: true,
                        minlength: 6
                    },
                    password: {
                        required: true,
                        minlength: 6
                    },
                    password_confirmation: {
                        required: true,
                        minlength: 6,
                        equalTo: "#input-password"
                    },
                    city: 'required',
                    district: 'required'
                },
                submitHandler: function (form) {
                    var self = $(form),
                        btnSubmit = self.find('.btn-color');
                    $.ajax({
                        url: self.attr('action'),
                        type: 'POST',
                        beforeSend: function () {
                            btnSubmit.addClass('m-progress');
                        },
                        data: self.serialize(),
                    })
                        .done(function (data) {
                            if (data.status === 'error') swal("Oops...", data.message, "error");
                            else if (data.status === 'success') {
                                if (type === 'register') window.location.reload();
                                else if (type === 'login') {
                                    if (self.children('input[name="getShareLink"]').length === 0) window.location.reload();
                                    else $('#form-share-link').unbind('submit').submit();
                                }
                                else if (type === 'forgot' || type === 'change-pass') {
                                    swal('', data.message, 'success');
                                    self[0].reset();
                                } else if (type === 'area') {
                                    $customerLogin.modal('hide');
                                    $.cookie('customerFirstCart', 'false');
                                }
                            }
                        })
                        .fail(function (data) {
                            $.each(data.responseJSON, function (index, val) {
                                swal("Oops...", val, "error");
                            });
                        })
                        .always(function () {
                            btnSubmit.removeClass('m-progress').blur();
                        });
                }
            });
        });

        $('#form-checkout').validate({
            rules: {
                name: {
                    required: true,
                    minlength: 3
                },
                address: {
                    required: true,
                    minlength: 6
                },
                phone: {
                    required: true,
                    digits: true,
                    minlength: 10
                },
                city: {
                    required: true
                },
                district: {
                    required: true
                },
                ward: {
                    required: true
                }
            },
            errorElement: 'div',
            errorPlacement: function (error, element) {
                var placement = $(element).data('error');
                if (placement) $(placement).append(error);
                else error.insertAfter(element);
            },
            submitHandler: function (form) {
                var self = $(form),
                    btnSubmit = self.find('.btn-submit');
                $.ajax({
                    url: self.attr('action'),
                    type: 'POST',
                    beforeSend: function () {
                        btnSubmit.addClass('m-progress');
                    },
                    data: self.serialize(),
                })
                    .done(function (data) {
                        if (data.status === 'success') {
                            $.removeCookie('customerFirstCart');
                            if (data.order_id != ''){
                                if (typeof dataLayer !== "undefined") {
                                    dataLayer.push({ ecommerce: null });
                                    dataLayer.push({
                                        'event': 'purchase',
                                        'ecommerce': {
                                            'purchase': {
                                                'actionField': {
                                                    'id': data.order_id,
                                                    'affiliation': 'Jollibee',
                                                    'revenue': data.total,
                                                    'tax':'0',
                                                    'shipping': '0',
                                                    'coupon': ''
                                                },
                                                'products': jQuery.parseJSON(data.products),
                                            }
                                        }
                                    });
                                }
                            }
                            window.location = data.message;
                        } else swal("Oops...", data.message, "error");
                    })
                    .fail(function (data) {
                        $.each(data.responseJSON, function (index, val) {
                            swal("Oops...", val, "error");
                        });
                    })
                    .always(function () {
                        btnSubmit.removeClass('m-progress').blur();
                    });
            }
        });

        $('#form-contact').validate({
            rules: {
                name: {
                    required: true,
                    minlength: 3
                },
                phone: {
                    required: true,
                    digits: true,
                    minlength: 10
                },
                email: {
                    required: true,
                    email: true
                },
                message: {
                    required: true,
                    minlength: 3
                }
            },
            onfocusout: function (element) {
                $(element).valid();
            },
            submitHandler: function (form) {
                var self = $(form),
                    $btnSubmit = self.find('.btn-submit');
                $.ajax({
                    url: self.attr('action'),
                    type: 'POST',
                    beforeSend: function () {
                        $btnSubmit.addClass('m-progress');
                    },
                    data: self.serialize(),
                })
                    .done(function (data) {
                        if (data.status === 'success') {
                            swal('', data.message, 'success');
                            self[0].reset();
                        } else swal('Oops...', data.message, 'error');
                    })
                    .fail(function (data) {
                        $.each(data.responseJSON, function (index, val) {
                            swal("Oops...", val, "error");
                        });
                    })
                    .always(function () {
                        $btnSubmit.removeClass('m-progress').blur();
                    });
            }
        });
    });

    /*$(window).resize(function(event) {
     });*/

    $(window).on('load', function (event) {
        event.preventDefault();

        if (messageAlert !== null) swal('', messageAlert);
    });
})();
