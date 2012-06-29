/*!
 * Online DustJS compiler helper script
 * 
 * $Id: compiler.js 10 2012-03-20 22:06:41Z nlaplante $
 * 
 * Written by Nicolas Laplante (nicolas.laplante@gmail.com)
 */

"use strict";

(function ($) {	
	var	inputElement = $("#input"),
		outputElement = $("#output"),
		nameElement = $("#name"),
		btnCompile = $("#btnCompile"),
		btnClear = $("#btnClear"),
		fnTrackUserAction = function (action) {
			if (typeof (_gaq) !== "undefined") {
				_gaq.push(['_trackEvent', 'User actions', action]);
			}
		};	
	
	$(function() {
		inputElement.add(nameElement).on('paste keyup', function (e) {
			outputElement.html(null);
			btnCompile.add(btnClear).trigger("compiler:input:changed");
		});
		
		// Output area events
		outputElement.on('focus', function (e) {
			outputElement.select();
		}).on('copy cut', function (e) {
			fnTrackUserAction('Copy output to clipboard');
		}).on('mouseup', function (e) {
			e.preventDefault();
		});
		
		// Compile button events
		btnCompile.on('click', function (e) {
			if (!btnCompile.hasClass("disabled")) {
				outputElement.val(js_beautify(dust.compile(inputElement.val(), nameElement.val()))).focus();
				fnTrackUserAction('Compile template');
			}
			
			btnCompile.trigger("compiler:input:changed");
		}).on('compiler:input:changed', function (e) {			
			if (inputElement.val() === "" || nameElement.val() === "") {
				btnCompile.addClass("disabled");
			}
			else if (inputElement.val() !== "" && nameElement.val() !== "") {
				btnCompile.removeClass("disabled");
			}
		}).trigger("compiler:input:changed");
		
		// Clear button events
		btnClear.on('click', function (e) {
			if (!btnClear.hasClass("disabled")) {
				outputElement.add(inputElement).add(nameElement).val(null);
				fnTrackUserAction('Clear fields');
			}
			
			btnClear.add(btnCompile).trigger("compiler:input:changed");
		}).on('compiler:input:changed', function (e) {
			if (inputElement.val() === "" && nameElement.val() === "") {
				btnClear.addClass("disabled");
			}
			else if (inputElement.val() !== "" || nameElement.val() !== "") {
				btnClear.removeClass("disabled");
			}
		}).trigger("compiler:input:changed");
		
		// Make external links open in new window
		$("a[rel~=external]").attr("target", "_blank");
	});
	
}(jQuery));
