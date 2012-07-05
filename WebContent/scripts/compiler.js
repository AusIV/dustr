PR_SHOULD_USE_CONTINUATION = true;

/**!
 * Online DustJS compiler Angular controller script 
 * Written by Nicolas Laplante (nicolas.laplante@gmail.com)
 */ 
function DustrCtrl($scope, $window, $timeout)
{
	"use strict";
	
	// Input & output fields
	angular.extend($scope, {
		source: null,
		name: null,
		output: {
			raw: null,
			beautiful: null
		},
		outputVisible: false
	});
	
	// Events
	$scope.compile = function () {
		$scope.output.raw = dust.compile($scope.source, $scope.name);
	};
	
	$scope.init = function () {
		window['PR_SHOULD_USE_CONTINUATION'] = false;
	};
	
	// Handler to clear the fields
	$scope.clear = function () {
		$scope.source = null;
		$scope.name = null;
		$scope.output.raw = null;
		$scope.output.beautiful = null;
	};
	
	// Handler to determine if compile and reset buttons should be enabled/disabled
	$scope.isUnchanged = function () {
		return $scope.source == null
			&& $scope.name == null;
	};
	
	// js_beautify() when setting the output
	$scope.$watch("output.raw", function (newValue, oldValue) {
		if (newValue !== null) {
			$scope.output.beautiful = js_beautify(newValue);
			
		}
		else {
			$scope.output.beautiful = null;
		}
		
		$scope.outputVisible = (newValue !== null);
		
		$timeout(function () {
			prettyPrint();
		}, 1, false);
	});
}


(function () {
	var dustr = angular.module("dustr", []);
	
	/**
	 * Track Google Analytics events
	 */
	dustr.directive("ngTrackGa", function ($log) {
		return function (scope, element, attrs) {
			if (!attrs.hasOwnProperty("ngTrackGaCategory") ||
				!attrs.hasOwnProperty("ngTrackGaName")) {
				$log.error("ng-track-ga-category and/or ng-track-ga-name attributes not specified");
				return;
			}
			
			angular.element(element).bind(attrs.ngTrackGa, function (e) {
				if (typeof (_gaq) !== "undefined") {
					_gaq.push(['_trackEvent', attrs.ngTrackGaCategory, attrs.ngTrackGaName]);
				}
				else {
					$log.error("_gaq object is undefined. Did you load Google Analytics?");
				}
			});
		};
	});
	
	dustr.directive("ngSelectOnClick", function () {
		return function (scope, element, attrs) {			
			angular.element(element).on('click', function (e) {
				var obj = $(this)[0];
				
				if ($.browser.msie) {
			        var range = obj.offsetParent.createTextRange();
			        range.moveToElementText(obj);
			        range.select();
			    } else if ($.browser.mozilla || $.browser.opera) {
			        var selection = obj.ownerDocument.defaultView.getSelection();
			        var range = obj.ownerDocument.createRange();
			        range.selectNodeContents(obj);
			        selection.removeAllRanges();
			        selection.addRange(range);
			    } else if ($.browser.safari) {
			        var selection = obj.ownerDocument.defaultView.getSelection();
			        selection.setBaseAndExtent(obj, 0, obj, 1);
			    }

			})
		};
	});
}());

