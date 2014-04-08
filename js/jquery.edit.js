(function($){
    "use strict";
    $(function(){
        var app = function(){
            // Сообщения
            var _app = this,
                _messages = typeof messages != 'undefined' ? messages : {};

            _app.url = "request/save.json";
            _app.roxyFileman = "libs/fileman/index.html";

            _app.messages = $.extend({
                iFrameLoading : "Загрузка проекта",
                saving : "Сохраненние...",
                saved : "Сохранено",
                edit : "Редактировать"
            },_messages);

            _app.iframeEl = $('#editIFrame');
            _app.saveBtn = $('#save');
            _app.overlay = $('#overlay');

             _app.sendNoty = function(text, style, opt) {
                style = typeof style != "undefined" ? style : 'information';
                opt = typeof opt != "undefined" ? opt : {};

                return noty($.extend({
                    layout: 'topCenter',
                    theme: 'defaultTheme',
                    type: style,
                    text: text,
                    dismissQueue: true, // If you want to use queue feature set this true
                    animation: {
                        open: {height: 'toggle'},
                        close: {height: 'toggle'},
                        easing: 'swing',
                        speed: 200 // opening & closing animation speed
                    },
                    timeout: 2000, // delay for closing event. Set false for sticky notifications
                    force: true, // adds notification to the beginning of queue when set to true
                    modal: false,
                    maxVisible: 5, // you can set max visible notification for dismissQueue true option,
                    killer: false, // for close all notifications before show
                    //closeWith: ['click'], // ['click', 'button', 'hover']
                    callback: {
                        onShow: function() {},
                        afterShow: function() {},
                        onClose: function() {},
                        afterClose: function() {}
                    },
                    buttons: false // an array of buttons
                }, opt));
            };

            _app.init = function(){
                _app.sendNoty(_app.messages.iFrameLoading);

                // Загрузка iFrame
                _app.iframeEl.load(function(){
                    _app.iFrameContent = $(this).contents();

                    // добавление редакторов
                    _app.editableEls =  _app.iFrameContent.find('.editable');
                    _app.editableEls.not('button, :text, [type="email"], [type="tell"]').attr('contenteditable', true).each(function(i, content){
                        CKEDITOR.disableAutoInline = true;
                        CKEDITOR.filebrowserBrowseUrl=_app.roxyFileman;
                        CKEDITOR.filebrowserUploadUrl=_app.roxyFileman;
                        $(this).data('editor', CKEDITOR.inline(content, {
                            filebrowserBrowseUrl:_app.roxyFileman,
                            filebrowserUploadUrl:_app.roxyFileman,
                            filebrowserImageBrowseUrl:_app.roxyFileman+'?type=image',
                            filebrowserImageUploadUrl:_app.roxyFileman+'?type=image'
                        }));
                        _app.overlay.fadeOut();
                    });
                    // добавление попапов для елементов формы
                    _app.editableEls.filter('button, :text, [type="email"], [type="tell"]').each(function(i, content){
                        $(content).data('editor', false);
                        $(content).attr('id','content-popup'+i).qtip({
                            style: {
                                classes: 'qtip-dark qtip-shadow'
                            },
                            content: {
                                text: '<a href="#content-popup'+i+'" class="tooltip-edit"><i class="fa fa-pencil-square-o"></i>'+_app.messages.edit+'</a>'
                            },
                            hide: {
                                fixed: true,
                                delay: 300
                            },
                            position: {
                                my: 'center left',
                                target: 'event',
                                container: $('body, html', _app.iFrameContent),
                                adjust: {
                                    x: -10,
                                    y: -10
                                }
                            }
                        })
                    });

                    // Сохранение данных
                    _app.saveBtn.on('click', function(e){
                        e.preventDefault();
                        var _data = {};
                        // собираем коллекцию данных
                        _app.editableEls.each(function(i){
                            var _key = $(this).attr('id') ? $(this).attr('id') : 'content'+i;
                            _data[_key] = $(this).data('editor') ? $(this).data('editor').getData() : $(this).html();
                        });
                        var _note,
                            _sendTimer = setTimeout(function(){
                                _note = _app.sendNoty(_app.messages.saving, 'alert', {timeout: false});
                            }, 200);
                        // отправляем данные
                        $.ajax({
                            url:_app.url,
                            data: _data,
                            type: 'POST',
                            success:function(json){
                                if(json.success) {
                                    if (_sendTimer) clearTimeout(_sendTimer);
                                    else _note.close();
                                    _app.sendNoty(_app.messages.saved, 'success');
                                } else {

                                }
                            }
                        });
                    });
                });
            }
        };

        var application = new app();
        application.init();
    });
})(jQuery);