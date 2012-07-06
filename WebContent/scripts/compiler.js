PR_SHOULD_USE_CONTINUATION = true;

/**!
 * Online DustJS compiler Angular controller script 
 * Written by Nicolas Laplante (nicolas.laplante@gmail.com)
 */ 
function DustrCtrl($scope, $window, $timeout, $log, $localStorage)
{
	"use strict";
	
	// Default scope variables
	var defaults = {
		source: null,
		name: null,
		output: {
			raw: null,
			beautiful: null
		},
		history: (function () {
			// Load history
			var module = angular.module("dustr");
			var dustrStorage = $localStorage ? $localStorage.getItem("dustr-history") : null;			
			
			return dustrStorage ? JSON.parse(dustrStorage) : {
				items: []
			};
		}())
	};
	
	// Input & output fields
	angular.extend($scope, defaults);
	
	// Events
	$scope.compile = function () {
		$scope.output.raw = dust.compile($scope.source, $scope.name);
		
		// Record in history (insert at beginning)
		$scope.history.items.unshift({
			name: $scope.name,
			source: $scope.source,
			output: $scope.output.raw,
			bytes: $scope.output.raw.length,
			date: new Date()
		});
	};
	
	// Load a template from the history
	$scope.loadFromHistory = function (index) {
		if (index >= 0 && index < $scope.history.items.length) {
			var item = $scope.history.items[index];
			
			$scope.source = item.source;
			$scope.name = item.name;
			$scope.output.raw = item.output;
		}
	};
	
	// Handler to clear the fields
	$scope.clear = function () {
		$scope.source = $scope.name = $scope.output.raw = $scope.output.beautiful = null;
	};
	
	// Handler to determine if compile and reset buttons should be enabled/disabled
	$scope.isUnchanged = function () {
		return $scope.source == null
			&& $scope.name == null;
	};
	
	// js_beautify() when raw output is set
	$scope.$watch("output.raw", function (newValue, oldValue) {
		$scope.output.beautiful = newValue !== null ? js_beautify(newValue) : null;
	});
	
	// prettyPrint() when beautiful output is set
	$scope.$watch("output.beautiful", function (newValue, oldValue) {
		if (newValue !== null) {
			$timeout(function () {
				prettyPrint();
			}, 1, false);
		}
	});
	
	// Persist the history in local storage
	$scope.$watch("history.items.length", function (newValue, oldValue) {
		if ($localStorage) {
			if (newValue !== null && newValue > 0) {
				localStorage.setItem("dustr-history", JSON.stringify($scope.history));
			}
		}
	});
}


(function () {
	var dustr = angular.module("dustr", []);
	
	dustr.value("$localStorage", angular.element("html").hasClass("localstorage") ? localStorage : false);
	
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
	
	/**
	 * Select element content on specified event name
	 * 
	 * Ex.: <pre ng-select-on="click">...</pre>
	 */
	dustr.directive("ngSelectOn", function () {
		return function (scope, element, attrs) {			
			angular.element(element).on(attrs.ngSelectOn, function (e) {
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
			});
		};
	});
	
	dustr.directive("ngActivateOnOutput", function () {
		return function (scope, element, attrs) {
			scope.$watch("output.raw", function (newValue, oldValue) {
				if (newValue !== null) {
					angular.element(element).tab("show");
				}
			});
		};
	});
	
	dustr.filter('size', function () {
		return function (input) {
			var number = parseInt(input),
				unit = "bytes";
			
			if (number < 1024) {
				unit = "bytes";				
			}
			else if (number < (1024 * 1024)) {
				unit = "kb";
				number = Math.round(number / 1024);
			}
			else if (number < (1024 * 1024 * 1024)) {
				unit = "mb";
				number = Math.round(number / 1024 / 1024);
			}
			
			return number + " " + unit;
		};
	});
	
	
	//DustrCtrl.$inject = ['$scope', "$localStorage"];
}());

