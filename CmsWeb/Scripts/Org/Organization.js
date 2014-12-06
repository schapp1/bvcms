﻿onload = function () {
    var e = document.getElementById("refreshed");
    if (e.value == "no")
        e.value = "yes";
    else {
        e.value = "no";
        location.reload();
    }
};
$(function () {
    $('a[data-toggle="tab"]').on('shown', function (e) {
        e.preventDefault();
        var tab = $(e.target).attr('href').replace("#", "#tab-");
        window.location.hash = tab;
        $.cookie('lasttab', tab);
        return false;
    });
    var lastTab = $.cookie('lasttab');
    if (window.location.hash) {
        lastTab = window.location.hash;
    }
    if (lastTab) {
        var tlink = $("a[href='" + lastTab.replace("tab-", "") + "']");
        var tabparent = tlink.closest("ul").data("tabparent");
        if (tabparent) {
            $("a[href='#" + tabparent + "']").click().tab("show");
        }
        if (tlink.attr("href") !== '#') {
            $.cookie('lasttab', tlink.attr("href"));
            tlink.click().tab("show");
        }
    }
    $("a[href='#Settings-tab']").on('shown', function (e) {
        if ($("#SettingsOrg").length < 2) {
            $("a[href='#SettingsOrg']").click().tab("show");
        }
    });
    $("#tab-area > ul.nav-tabs > li > a").on('shown', function (e) {
        var qid = "";
        switch ($(this).text()) {
            case "Members":
                qid = $("#currentQid").val();
                $("#bluetoolbarstop li > a.qid").parent().removeClass("hidy");
                $("li.current-list").show();
                break;
            case "Previous":
                qid = $("#previousQid").val();
                $("#bluetoolbarstop li > a.qid").parent().removeClass("hidy");
                $("li.orgcontext").hide();
                break;
            case "Pending":
                qid = $("#pendingQid").val();
                $("#bluetoolbarstop li > a.qid").parent().removeClass("hidy");
                $("li.orgcontext").hide();;
                $("li.pending-list").show();
                break;
            case "Inactive":
            case "Senders":
                qid = $("#inactiveQid").val();
                $("#bluetoolbarstop li > a.qid").parent().removeClass("hidy");
                $("li.orgcontext").hide();
                break;
            case "Prospects":
                qid = $("#prospectsQid").val();
                $("#bluetoolbarstop li > a.qid").parent().removeClass("hidy");
                $("li.orgcontext").hide();
                break;
            case "Guests":
                qid = $("#visitedQid").val();
                $("#bluetoolbarstop li > a.qid").parent().removeClass("hidy");
                $("li.orgcontext").hide();
                break;
            case "Settings":
            case "Meetings":
                $("#bluetoolbarstop li > a.qid").parent().addClass("hidy");
                break;
        }
        if (qid) {
            $("#bluetoolbarstop a.qid").each(function () {
                $(this).attr("href", this.href.replace(/(.*\/)([^\/?]*)(\?[^?]*)?$/mg, "$1" + qid + "$3"));
            });
        }
    });

    $('#deleteorg').click(function (ev) {
        ev.preventDefault();
        var href = $(this).attr("href");
        if (confirm('Are you sure you want to delete?')) {
            $.block("deleting org");
            $.post(href, null, function (ret) {
                if (ret != "ok") {
                    window.location = ret;
                }
                else {
                    $.block("org deleted");
                    $('.blockOverlay').attr('title', 'Click to unblock').click(function () {
                        $.unblock();
                        window.location = "/";
                    });
                }
            });
        }
        return false;
    });
    $('#sendreminders').click(function (ev) {
        ev.preventDefault();
        var href = $(this).attr("href");
        if (confirm('Are you sure you want to send reminders?')) {
            $.block("sending reminders");
            $.post(href, null, function (ret) {
                if (ret != "ok") {
                    $.unblock();
                    $.growlUI("error", ret);
                }
                else {
                    $.unblock();
                    $.growlUI("Email", "Reminders Sent");
                }
            });
        }
    });
    $('#reminderemails').click(function (ev) {
        ev.preventDefault();
        var href = $(this).attr("href");
        if (confirm('Are you sure you want to send reminders?')) {
            $.block("sending reminders");
            $.post(href, null, function (ret) {
                if (ret != "ok") {
                    $.block(ret);
                    $('.blockOverlay').attr('title', 'Click to unblock').click($.unblock);
                }
                else {
                    $.block("org deleted");
                    $('.blockOverlay').attr('title', 'Click to unblock').click(function () {
                        $.unblock();
                        window.location = "/";
                    });
                }
            });
        }
        return false;
    });
    //$(".datepicker").jqdatepicker();

    $(".CreateAndGo").click(function (ev) {
        ev.preventDefault();
        if (confirm($(this).attr("confirm")))
            $.post($(this).attr("href"), null, function (ret) {
                window.location = ret;
            });
        return false;
    });
    /*
        $('#memberDialog').dialog({
            title: 'Add Members Dialog',
            bgiframe: true,
            autoOpen: false,
            zindex: 9999,
            width: 750,
            height: 700,
            modal: true,
            overlay: {
                opacity: 0.5,
                background: "black"
            }, close: function () {
                $('iframe', this).attr("src", "");
            }
        });
        $('#AddFromTag').dialog({
            title: 'Add From Tag',
            bgiframe: true,
            autoOpen: false,
            width: 750,
            height: 650,
            modal: true,
            overlay: {
                opacity: 0.5,
                background: "black"
            }, close: function () {
                $('iframe', this).attr("src", "");
                RebindMemberGrids();
            }
        });
    */
    $('a.addfromtag').live("click", function (e) {
        e.preventDefault();
        var d = $('#AddFromTag');
        $('iframe', d).attr("src", this.href);
        d.dialog("option", "title", "Add Members From Tag");
        d.dialog("open");
    });
    /*
        $('#LongRunOp').dialog({
            bgiframe: true,
            autoOpen: false,
            width: 600,
            height: 400,
            modal: true,
            overlay: {
                opacity: 0.5,
                background: "black"
            }, close: function () {
                $('iframe', this).attr("src", "");
                RebindMemberGrids();
                $.updateTable($('#Meetings-tab form'));
            }
        });
    */
    $('#RepairTransactions').live("click", function (e) {
        e.preventDefault();
        var d = $('#LongRunOp');
        $('iframe', d).attr("src", this.href);
        d.dialog("option", "title", "Repair Transactions");
        d.dialog("open");
    });
    $('a.delmeeting').live('click', function (ev) {
        ev.preventDefault();
        if (confirm("delete meeting for sure?")) {
            var d = $('#LongRunOp');
            $('iframe', d).attr("src", this.href);
            d.dialog("option", "title", "Delete Meeting");
            d.dialog("open");
        }
        return false;
    });


    $('a.addmembers').live("click", function (e) {
        e.preventDefault();
        var d = $('#memberDialog');
        $('iframe', d).attr("src", this.href);
        d.dialog("option", "title", "Add Members");
        d.dialog("open");
    });
    $('a.memberdialog').live("click", function (e) {
        e.preventDefault();
        var title;
        var d = $('#memberDialog');
        $('iframe', d).attr("src", this.href);
        d.dialog("option", "title", this.title || 'Edit Member Dialog');
        d.dialog("open");
    });

    $("a.membertype").live("click", function (ev) {
        ev.preventDefault();
        var href = this.href;
        $("#member-dialog").css({ 'margin-top': '', 'top': '' })
            .load(href, {}, function () {
                $(this).modal("show");
                $(this).on('hidden', function () {
                    $(this).empty();
                });
            });
    });

    $.maxZIndex = $.fn.maxZIndex = function (opt) {
        var def = { inc: 10, group: "*" };
        $.extend(def, opt);
        var zmax = 0;
        $(def.group).each(function () {
            var cur = parseInt($(this).css('z-index'));
            zmax = cur > zmax ? cur : zmax;
        });
        if (!this.jquery)
            return zmax;

        return this.each(function () {
            zmax += def.inc;
            $(this).css("z-index", zmax);
        });
    };

    /*
        $.initDatePicker = function (f) {
            $("ul.edit .datepicker", f).jqdatepicker({
                //beforeShow: function () { $('#ui-datepicker-div').maxZIndex(); }
            });
            $("ul.edit .timepicker", f).jqdatetimepicker({
                stepHour: 1,
                stepMinute: 5,
                timeOnly: true,
                timeFormat: "hh:mm tt",
                controlType: "slider"
            });
            $("ul.edit .datetimepicker", f).jqdatetimepicker({
                stepHour: 1,
                stepMinute: 15,
                timeOnly: false,
                timeFormat: "hh:mm tt",
                controlType: "slider"
            });
        };
        */
    $.InitFunctions.showHideRegTypes = function (f) {
        $("#Fees-tab").show();
        $("#Questions-tab").show();
        $("#Messages-tab").show();

        $("#QuestionList li").show();
        $(".yes6").hide();
        switch ($("#org_RegistrationTypeId").val()) {
            case "0":
                $("#Fees-tab").hide();
                $("#Questions-tab").hide();
                $("#Messages-tab").hide();
                break;
            case "6":
                $("#QuestionList > li").hide();
                $(".yes6").show();
                break;
        }
    };
    $("#org_RegistrationTypeId").live("change", $.InitFunctions.showHideRegTypes);

    $("a.displayedit,a.displayedit2").live('click', function (ev) {
        ev.preventDefault();
        var f = $(this).closest('form');
        $.post($(this).attr('href'), null, function (ret) {
            $(f).html(ret).ready(function () {
                //                $.initDatePicker(f);
                //                $(".submitbutton,.bt", f).button();
                $(".roundbox select", f).css("width", "100%");
                //                $("#schedules", f).sortable({ stop: $.renumberListItems });
                $("#editor", f);
                $.regsettingeditclick(f);
                //                $.showHideRegTypes();
                $.updateQuestionList();
                //                $("#selectquestions").dialog({
                //                    title: "Add Question",
                //                    autoOpen: false,
                //                    width: 550,
                //                    height: 250,
                //                    modal: true
                //                });
                //                $('a.AddQuestion').click(function (ev) {
                //                    var d = $('#selectquestions');
                //                    d.dialog("open");
                //                    ev.preventDefault();
                //                    return false;
                //                });
                $(".helptip").tooltip({ showBody: "|" });
            });
        });
        return false;
    });

    $('#selectquestions a').live("click", function (ev) {
        ev.preventDefault();
        $.post('/Organization/NewAsk/', { id: 'AskItems', type: $(this).attr("type") }, function (ret) {
            $('#selectquestions').dialog("close");
            $('html, body').animate({ scrollTop: $("body").height() }, 800);
            var newli = $("#QuestionList").append(ret);
            $("#QuestionList > li:last").effect("highlight", {}, 3000);
            $(".tip", newli).tooltip({ opacity: 0, showBody: "|" });
            $.updateQuestionList();
        });
        return false;
    });

    $("ul.enablesort a.del").live("click", function (ev) {
        ev.preventDefault();
        if (!$(this).attr("href"))
            return false;
        $(this).parent().parent().parent().remove();
        return false;
    });

    $("ul.enablesort a.delt").live("click", function (ev) {
        ev.preventDefault();
        if (!$(this).attr("href"))
            return false;
        if (confirm("are you sure?")) {
            $(this).parent().parent().remove();
            $.InitFunctions.updateQuestionList();
        }
        return false;
    });

    $.exceptions = [
        "AskDropdown",
        "AskCheckboxes",
        "AskExtraQuestions",
        "AskHeader",
        "AskInstruction",
        "AskMenu"
    ];
    $.InitFunctions.updateQuestionList = function () {
        $("#selectquestions li").each(function () {
            var type = this.className;
            var text = $(this).text();
            if (!text)
                text = type;
            if ($.inArray(type, $.exceptions) >= 0 || $("li.type-" + type).length == 0)
                $(this).html("<a href='#' type='" + type + "'>" + text + "</a>");
            else
                $(this).html("<span>" + text + "</span>");
        });
    };

    $(".helptip").tooltip({ showBody: "|", blocked: true });

    $("form.DisplayEdit a.submitbutton").live('click', function (ev) {
        ev.preventDefault();
        var f = $(this).closest('form');
        if (!$(f).valid())
            return false;
        var q = f.serialize();
        $.post($(this).attr('href'), q, function (ret) {
            if (ret.startsWith("error:")) {
                $("div.formerror", f).html(ret.substring(6));
            } else {
                $(f).html(ret).ready(function () {
                    $(".submitbutton,.bt").button();
                    $.regsettingeditclick(f);
                    $.showHideRegTypes();
                });
            }
        });
        return false;
    });

    $("#future").live('click', function () {
        var f = $(this).closest('form');
        var q = f.serialize();
        $.post($(f).attr("action"), q, function (ret) {
            $(f).html(ret);
            $(".bt", f).button();
        });
    });

    $("input[name='showHidden']").live('click', function () {
        $.formAjaxClick($(this));
    });
    $("#Future").live('click', function () {
        $.formAjaxClick($(this));
    });

    /*
    $("form.DisplayEdit").submit(function () {
        if (!$("#submitit").val())
            return false;
        return true;
    });
*/
    $('a.taguntag').live("click", function (ev) {
        ev.preventDefault();
        $.post('/Organization/ToggleTag/' + $(this).attr('pid'), null, function (ret) {
            $(ev.target).text(ret);
        });
        return false;
    });
    $.validator.addMethod("time", function (value, element) {
        return this.optional(element) || /^\d{1,2}:\d{2}\s(?:AM|am|PM|pm)/.test(value);
    }, "time format h:mm AM/PM");
    $.validator.setDefaults({
        highlight: function (input) {
            $(input).addClass("ui-state-highlight");
        },
        unhighlight: function (input) {
            $(input).removeClass("ui-state-highlight");
        }
    });
    $("#orginfoform").validate({
        rules: {
            "org.OrganizationName": { required: true, maxlength: 100 }
        }
    });
    // validate signup form on keyup and submit
    $("#settingsForm").validate({
        rules: {
            "org.SchedTime": { time: true },
            "org.OnLineCatalogSort": { digits: true },
            "org.Limit": { digits: true },
            "org.NumCheckInLabels": { digits: true },
            "org.NumWorkerCheckInLabels": { digits: true },
            "org.FirstMeetingDate": { date: true },
            "org.LastMeetingDate": { date: true },
            "org.RollSheetVisitorWks": { digits: true },
            "org.GradeAgeStart": { digits: true },
            "org.GradeAgeEnd": { digits: true },
            "org.Fee": { number: true },
            "org.Deposit": { number: true },
            "org.ExtraFee": { number: true },
            "org.ShirtFee": { number: true },
            "org.ExtraOptionsLabel": { maxlength: 50 },
            "org.OptionsLabel": { maxlength: 50 },
            "org.NumItemsLabel": { maxlength: 50 },
            "org.GroupToJoin": { digits: true },
            "org.RequestLabel": { maxlength: 50 },
            "org.DonationFundId": { number: true }
        }
    });

//    $.getTable = function (f) {
//        var q = f.serialize();
//        $.post(f.attr('action'), q, function (ret) {
//            $(f).html(ret).ready(function () {
//                $("select.tip,input.tip").tooltip({ opacity: 0, showBody: "|" });
//            });
//        });
//        return false;
//    };
    $("#namefilter").keypress(function (e) {
        if ((e.keyCode || e.which) == 13) {
            e.preventDefault();
            $.formAjaxClick($(this));
        }
        return true;
    });

    $("#addsch").live("click", function (ev) {
        ev.preventDefault();
        var href = $(this).attr("href");
        if (href) {
            var f = $(this).closest('form');
            $.post(href, null, function (ret) {
                $("#schedules", f).append(ret).ready(function () {
                    $.renumberListItems();
                    $.initDatePicker(f);
                });
            });
        }
        return false;
    });

    $("a.deleteschedule").live("click", function (ev) {
        ev.preventDefault();
        var href = $(this).attr("href");
        if (href) {
            $(this).parent().remove();
            $.renumberListItems();
        }
    });

    $.renumberListItems = function () {
        var i = 1;
        $(".renumberMe").each(function () {
            $(this).val(i);
            i++;
        });
    };
    /*
        $("#NewMeetingDialog").dialog({
            autoOpen: false,
            width: 560,
            height: 550,
            modal: true
        });
        $('#RollsheetLink').live("click", function (ev) {
            ev.preventDefault();
            $('#grouplabel').text("By Group");
            $("tr.forMeeting").hide();
            $("tr.forRollsheet").show();
            var d = $("#NewMeetingDialog");
            d.dialog("option", "buttons", {
                "Ok": function () {
                    var dt = $.GetNextMeetingDateTime();
                    if (!dt.valid)
                        return false;
                    var args = "?org=curr&dt=" + dt.date + " " + dt.time;
                    if ($('#altnames').is(":checked"))
                        args += "&altnames=true";
                    if ($('#group').is(":checked"))
                        args += "&bygroup=1";
                    if ($("#highlightsg").val())
                        args += "&highlight=" + $("#highlightsg").val();
                    if ($("#sgprefixrs").val())
                        args += "&sgprefix=" + $("#sgprefixrs").val();
                    window.open("/Reports/Rollsheet/" + args);
                    $(this).dialog("close");
                }
            });
            d.dialog('open');
        });
        $('#RallyRollsheetLink').live("click", function (ev) {
            ev.preventDefault();
            $('#grouplabel').text("By Group");
            $("tr.forMeeting").hide();
            $("tr.forRollsheet").show();
            var d = $("#NewMeetingDialog");
            d.dialog("option", "buttons", {
                "Ok": function () {
                    var dt = $.GetNextMeetingDateTime();
                    if (!dt.valid)
                        return false;
                    var args = "?org=curr&dt=" + dt.date + " " + dt.time;
                    if ($('#altnames').is(":checked"))
                        args += "&altnames=true";
                    if ($('#group').is(":checked"))
                        args += "&bygroup=1&sgprefix=";
                    if ($("#highlightsg").val())
                        args += "&highlight=" + $("#highlightsg").val();
                    if ($("#sgprefix").val())
                        args += "&sgprefix=" + $("#sgprefix").val();
                    window.open("/Reports/RallyRollsheet/" + args);
                    $(this).dialog("close");
                }
            });
            d.dialog('open');
        });
        $('#NewMeeting').live("click", function (ev) {
            ev.preventDefault();
            $('#grouplabel').text("Group Meeting");
            $("tr.forMeeting").show();
            $("tr.forRollsheet").hide();
            var d = $("#NewMeetingDialog");
    
            var sch = $("#ScheduleListPrev").val();
            if (sch) {
                var a = sch.split(',');
                $("#PrevMeetingDate").val(a[0]);
                $("#NewMeetingTime").val(a[1]);
                $("#AttendCreditList").val(a[2]);
            }
    
            d.dialog("option", "buttons", {
                "Ok": function () {
                    var dt = $.GetPrevMeetingDateTime();
                    if (!dt.valid)
                        return false;
                    var url = "?d=" + dt.date + "&t=" + dt.time +
                    "&group=" + ($('#group').is(":checked") ? "true" : "false");
                    $.post("/Organization/NewMeeting", { d: dt.date, t: dt.time, AttendCredit: $("#AttendCreditList").val(), group: $('#group').is(":checked") }, function (ret) {
                        if (!ret.startsWith("error"))
                            window.location = ret;
                    });
                    $(this).dialog("close");
                }
            });
            d.dialog('open');
            return false;
        });
    */
    $("#ScheduleListPrev").change(function () {
        var a = $(this).val().split(",");
        $("#PrevMeetingDate").val(a[0]);
        $("#NewMeetingTime").val(a[1]);
        $("#AttendCreditList").val(a[2]);
    });
    $("#ScheduleListNext").change(function () {
        var a = $(this).val().split(",");
        $("#NextMeetingDate").val(a[0]);
        $("#NewMeetingTime").val(a[1]);
        $("#AttendCreditList").val(a[2]);
    });
    $.GetPrevMeetingDateTime = function () {
        var d = $('#PrevMeetingDate').val();
        return $.GetMeetingDateTime(d);
    };
    $.GetNextMeetingDateTime = function () {
        var d = $('#NextMeetingDate').val();
        return $.GetMeetingDateTime(d);
    };
    $.GetMeetingDateTime = function (d) {
        var reTime = /^ *(\d{1,2}):[0-5][0-9] *((a|p|A|P)(m|M)){0,1} *$/;
        var t = $('#NewMeetingTime').val();
        var v = true;
        if (!reTime.test(t)) {
            $.growlUI("error", "enter valid time");
            v = false;
        }
        if (!$.DateValid(d)) {
            $.growlUI("error", "enter valid date");
            v = false;
        }
        return { date: d, time: t, valid: v };
    };

    $('a.joinlink').live('click', function (ev) {
        ev.preventDefault();
        var a = $(this);
        bootbox.confirm(a.attr("confirm"), function (result) {
            if (result) {
                $.post(a[0].href, function (ret) {
                    if (ret == "ok")
                        $.RebindMemberGrids();
                    else
                        alert(ret);
                });
            }
        });
        return false;
    });

    $("#divisionlist").live("click", function (ev) {
        ev.preventDefault();
        $("<div class='modal fade hide' />").load($(this).attr("href"), function() {
            var modal = $(this);
            modal.modal("show");
//            modal.on('shown', function () {
//                modal.find("textarea").focus();
//            });
            modal.on('hidden', function () {
                $(this).remove();
            });
        });
    });
    /*
        $('#divisionsDialog').dialog({
            title: 'Select Divisions Dialog',
            bgiframe: true,
            autoOpen: false,
            width: 690,
            height: 650,
            modal: true,
            overlay: {
                opacity: 0.5,
                background: "black"
            }, close: function () {
                $('iframe', this).remove();
                var f = $("#orginfoform");
                $.post("/Organization/OrgInfo/" + $("#OrganizationId").val(), null, function (ret) {
                    $(f).html(ret).ready(function () {
                        $(".submitbutton,.bt").button();
                    });
                });
            }
        });
        $("#divisionlist").live("" +
            "click", function (e) {
            e.preventDefault();
            $('#divisionsDialog').dialog("open");
            var iframe = $("<iframe style='width: 100%; height: 99%; border-width: 0;'></iframe>").appendTo("#divisionsDialog");
            iframe.attr("src", this.href);
        });
        $('#orgsDialog').dialog({
            title: 'Select Orgs Dialog',
            bgiframe: true,
            autoOpen: false,
            width: 690,
            height: 650,
            modal: true,
            overlay: {
                opacity: 0.5,
                background: "black"
            }, close: function () {
                $('iframe', this).attr("src", "");
            }
        });
        $('#orgpicklist').live("click", function (e) {
            e.preventDefault();
            var d = $('#orgsDialog');
            $('iframe', d).attr("src", this.href);
            d.dialog("open");
        });
    
    */
    $.extraEditable = function () {
        $('.editarea').editable('/Organization/EditExtra/', {
            type: 'textarea',
            submit: 'OK',
            rows: 5,
            width: 200,
            indicator: '<img src="/Content/images/loading.gif">',
            tooltip: 'Click to edit...'
        });
        $(".editline").editable("/Organization/EditExtra/", {
            indicator: "<img src='/images/loading.gif'>",
            tooltip: "Click to edit...",
            style: 'display: inline',
            width: 200,
            height: 25,
            submit: 'OK'
        });
    };
    $.extraEditable();
    /*
        $("#newvalueform").dialog({
            autoOpen: false,
            buttons: {
                "Ok": function () {
                    var ck = $("#multiline").is(':checked');
                    var fn = $("#fieldname").val();
                    var v = $("#fieldvalue").val();
                    if (fn)
                        $.post("/Organization/NewExtraValue/" + $("#OrganizationId").val(), { field: fn, value: v, multiline: ck }, function (ret) {
                            if (ret.startsWith("error"))
                                alert(ret);
                            else {
                                $("#extras > tbody").html(ret);
                                $.extraEditable();
                            }
                            $("#fieldname").val("");
                        });
                    $(this).dialog("close");
                }
            }
        });
        $("#newextravalue").live("click", function (ev) {
            ev.preventDefault();
            var d = $('#newvalueform');
            d.dialog("open");
        });
        $("#TryRegDialog").dialog({
            autoOpen: false,
            width: 500
        });
        $("#tryreg").live("click", function (ev) {
            ev.preventDefault();
            var d = $('#TryRegDialog');
            d.dialog("open");
        });
    */
    $("a.deleteextra").live("click", function (ev) {
        ev.preventDefault();
        if (confirm("are you sure?"))
            $.post("/Organization/DeleteExtra/" + $("#OrganizationId").val(), { field: $(this).attr("field") }, function (ret) {
                if (ret.startsWith("error"))
                    alert(ret);
                else {
                    $("#extras > tbody").html(ret);
                    $.extraEditable();
                }
            });
        return false;
    });

    // Add for ministrEspace
    /*
    var submitDialog = $("#dialogHolder").dialog({ modal: true, width: 'auto', title: 'Select ministrEspace Event', autoOpen: false });
    $("#addMESEvent").click(function (ev) {
        ev.preventDefault();
        var id = $(this).attr("orgid");
        submitDialog.html("<div style='text-align:center; margin-top:20px;'>Loading...</div>");
        submitDialog.dialog('open');
        $.post("/Organization/DialogAdd/" + id + "?type=MES", null, function (data) {
            submitDialog.html(data);
            submitDialog.dialog({ position: { my: "center", at: "center" } });
            $(".bt").button();
        });
    });
    $("#closeSubmitDialog").live("click", null, function (ev) {
        ev.preventDefault();
        $(submitDialog).dialog("close");
    });
    */
    $.updateTable = function (a) {
        if (!a)
            return false;
        var $form = a.closest("form.ajax");
        if ($form.length)
            $.formAjaxClick(a);
        return false;
    };
    $.RebindMemberGrids = function () {
        $.updateTable($("#Members-tab a.setfilter"));
        $.updateTable($('#Inactive-tab a.setfilter'));
        $.updateTable($('#Pending-tab a.setfilter'));
        $.updateTable($('#Priors-tab a.setfilter'));
        $.updateTable($('#Prospects-tab a.setfilter'));
        $.updateTable($('#Visitors-tab a.setfilter'));
    }
});
function AddSelected() {
    $.RebindMemberGrids();
}
function CloseAddDialog(from) {
    $("#memberDialog").dialog("close");
}
function UpdateSelectedUsers(topid) {
}
function UpdateSelectedOrgs(list) {
    $.post("/Organization/UpdateOrgIds", { id: $("#OrganizationId").val(), list: list }, function (ret) {
        $("#orgpickdiv").html(ret);
        $("#orgsDialog").dialog("close");
    });
}