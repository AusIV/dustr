/**!
 * Online DustJS compiler Angular controller script 
 * Written by Nicolas Laplante (nicolas.laplante@gmail.com)
 */ 
function DustrCtrl($scope, $window, $timeout, $history)
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
		history: $history
	};
	
	// Input & output fields
	angular.extend($scope, defaults);
	
	// Events
	$scope.compile = function () {
		$scope.output.raw = dust.compile($scope.source, $scope.name);
		
		// Record in history
		$scope.history.add({
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
		if (newValue !== null && newValue > 0) {
			$scope.history.flush();
		}
	});
}


(function () {
	
	"use strict";
	
	/**
	 * Template history kept in localStorage
	 */
	function History() {
		
		// Retrieve items
		if (typeof(localStorage) !== "undefined") {
			
			var storedItems = localStorage.getItem("dustr-history");
			
			if (storedItems) {
				this.items = JSON.parse(storedItems);
			}
			else {
				this.items = [];
			}
		}
		else {
			this.items = [];
		}
	}

	/**
	 * Add an item to the hsitory
	 * @param obj the history item definition
	 */
	History.prototype.add = function(obj) {
	    this.items.unshift(obj);
	};

	/**
	 * Clear the history
	 */
	History.prototype.clear = function() {
	    this.items = [];
	};

	/**
	 * Remove a specific entry from the history
	 * @param index the index of the item to remove
	 */
	History.prototype.remove = function(index) {
	    this.items.splice(index, 1);
	};

	/**
	 * Persist the history to the localStorage if available
	 */
	History.prototype.flush = function() {
	    if (typeof(localStorage) !== "undefined") {
	        localStorage.setItem("dustr-history", JSON.stringify(this.items));
	    }
	};
	
	// Keep a reference to our module
	var dustr = angular.module("dustr", []);
	
	// Define the $history service
	dustr.value("$history", new History());
	
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
	
	/**
	 * Activate a tab when $scope.output.raw changes
	 */
	dustr.directive("ngActivateOnOutput", function () {
		return function (scope, element, attrs) {
			scope.$watch("output.raw", function (newValue, oldValue) {
				if (newValue !== null) {
					angular.element(element).tab("show");
				}
			});
		};
	});
	
	/**
	 * Format sizes (bytes, kb, mb, etc...)
	 */
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
}());

