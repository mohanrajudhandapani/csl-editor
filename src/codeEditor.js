"use strict";

var CSLEDIT = CSLEDIT || {};

CSLEDIT.CodeEditor = function (containerElement, userOptions) {
	var codeTimeout,
		editor,
		diffTimeout,
		diffMatchPatch = new diff_match_patch(),
		oldFormattedCitation = "",
		newFormattedCitation = "",
		oldFormattedBibliography = "",
		newFormattedBibliography = "",
		styleURL;

	containerElement = $(containerElement);

	CSLEDIT.options.setUserOptions(userOptions);

	$.ajax({
		url: CSLEDIT.options.get("rootURL") + "/html/codeEditor.html",
		success : function (data) {
			containerElement.html(data);
			init();
		},
		error : function (jaXHR, textStatus, errorThrown) {
			alert("Couldn't fetch page: " + textStatus);
		},
		cache : false
	});

	var init = function () {
		var codeMirrorScroll,
			codeMirrorContainer;

		CodeMirror.defaults.onChange = function()
		{
			clearTimeout(codeTimeout);
			codeTimeout = setTimeout( function () {
				var result = CSLEDIT.data.setCslCode(editor.getValue());

				if ("error" in result) {
					$("#statusMessage").html(result.error);
					$("#formattedCitations").html("");
					$("#formattedBibliography").html("");
				} else {
					CSLEDIT.citationEngine.runCiteprocAndDisplayOutput(
						$("#statusMessage"), $("#exampleOutput"),
						$("#formattedCitations"), $("#formattedBibliography"));
				}
			}, 500);
		};

		editor = CodeMirror.fromTextArea($("#code")[0], {
				mode: { name: "xml" },
				lineNumbers: true
		});

		CSLEDIT.data.initPageStyle( function () {
			editor.setValue(CSLEDIT.data.getCslCode());
		});

		codeMirrorScroll = $('.CodeMirror-scroll');
		codeMirrorContainer = $('#codeMirrorContainer');
		
		var resizeCodeEditor = function () {
			codeMirrorScroll.css({height: codeMirrorContainer.height() + "px"});
		};

		containerElement.layout({
			north__size : 300,
			livePaneResizing : true,
			onresize : resizeCodeEditor
		});

		resizeCodeEditor();
	}
};
