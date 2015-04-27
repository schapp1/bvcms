﻿$(function () {
    $('#supportsearch').typeahead({
        name: 'supsearch',
        valueKey: "line1",
        limit: 25,
        beforeSend: function (jqXhr, settings) {
            $.SetLoadingIndicator();
        },
        remote: '/MissionTripEmail2/Search/{0}?q=%QUERY'.format($("#PeopleId").val()),
        minLength: 3,
        template: 'dummy string',
        engine: {
            compile: function (t) {
                return {
                    render: function (context) {
                        var r = "<div{2}>{0}{1}</div>".format(
                            context.line1,
                            context.line2
                            ? "<br>" + context.line2
                            : "",
                            context.addmargin
                            ? ""
                            : "");
                        return r;
                    }
                };
            }
        }
    });

    $('#supportsearch').bind('typeahead:selected', function (obj, datum, name) {
        $.post(datum.url, {}, function(ret) {
            $("#recipients").html(ret).ready(function() {
                $("#supportsearch").val("");
                $("#recipients .newsupporter").effect("highlight", { color: '#fcf8e3' }, 2000);
            });
        });
    });

    $('body').on('click', '#recipients a.remove', function (ev) {
        ev.preventDefault();
        var href = this.href;
        $.post(href, {}, function (ret) {
            $("#recipients").html(ret);
        });
        return false;
    });

    $("#edit-supporters").click(function (ev) {
        ev.preventDefault();
        var href = this.href;
        $("#edit-supporters").hide();
        $("#editing").show();
        $("#edit-help").hide();
        $("#done-help").show();
        $.post(href, {}, function (ret) {
            $("#recipients").html(ret);
        });
        return false;
    });

    $("#cancel-editing").click(function (ev) {
        ev.preventDefault();
        var href = this.href;
        $("#editing").hide();
        $("#edit-supporters").show();
        $("#edit-help").show();
        $("#done-help").hide();
        $.post(href, {}, function (ret) {
            $("#recipients").html(ret);
        });
        return false;
    });

    $("#done-editing").click(function (ev) {
        ev.preventDefault();
        var href = this.href;
        $("#editing").hide();
        $("#edit-supporters").show();
        $("#edit-help").show();
        $("#done-help").hide();

        var q = $("#SendEmail,#recipients").serialize();

        $.post(href, q, function (ret) {
            $("#recipients").html(ret);
        });
        return false;
    });

    var currentDiv = null;

    CKEDITOR.replace('htmleditor', {
        height: 400,
        autoParagraph: false,
        fullPage: false,
        allowedContent: true,
        customConfig: '/Content/touchpoint/lib/ckeditor/js/ckeditorconfig.js'
    });

    CKEDITOR.env.isCompatible = true;

    $.clearFunction = undefined;
    $.addFunction = undefined;

    $.clearTemplateClass = function () {
        if (typeof $.clearFunction != 'undefined') {
            $.clearFunction();
        }
    };

    $.addTemplateClass = function () {
        if (typeof $.addFunction != 'undefined') {
            $.addFunction();
        }
    };

    window.displayEditor = function (div) {
        currentDiv = div;
        $('#editor-modal').modal('show');
    };

    $('#editor-modal').on('shown.bs.modal', function () {
        var html = $(currentDiv).html();
        if (html !== "Click here to edit content") {
            CKEDITOR.instances['htmleditor'].setData(html);
        }
    });

    $('#editor-modal').on('click', '#save-edit', function () {
        var h = CKEDITOR.instances['htmleditor'].getData();
        $(currentDiv).html(h);
        $('#editor-modal').modal('hide');
    });

    $(".send").click(function () {
        $('#Body').val($('#email-body').contents().find('#tempateBody').html());
        var q = $("#SendEmail").serialize();

        $.post('/MissionTripEmail2/Send', q, function (ret) {
            if (ret.startsWith("/MissionTripEmail"))
                window.location = ret;
            else
                swal("Error!", ret, "error");
        });
    });

    $(".testsend").click(function () {
        $.clearTemplateClass();
        $("#Body").val($('#email-body').contents().find('#tempateBody').html());
        $.addTemplateClass();
        var q = $("#SendEmail").serialize();
        $.post('/MissionTripEmail2/TestSend', q, function (ret) {
            if (ret.error) {
                swal("Error!", ret.message, "error");
            }
            else {
                swal({
                    title: "Test email sent!",
                    type: "success"
                });
            }
        }, 'json');
    });
});
