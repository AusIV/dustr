/**!
 * Online DustJS compiler Angular controller script 
 * Written by Nicolas Laplante (nicolas.laplante@gmail.com)
 */ 
function DustrCtrl($scope)
{
	"use strict";
	
	// Input & output fields
	angular.extend($scope, {
		source: null,
		name: null,
		output: null,
		outputVisible: false
	});
	
	// Events
	$scope.compile = function () {
		$scope.output = dust.compile($scope.source, $scope.name);
	};
	
	// Handler to clear the fields
	$scope.clear = function () {
		$scope.source = null;
		$scope.name = null;
		$scope.output = null;
	};
	
	// Handler to determine if compile and reset buttons should be enabled/disabled
	$scope.isUnchanged = function () {
		return $scope.source == null
			&& $scope.name == null;
	};
	
	// js_beautify() when setting the output
	$scope.$watch("output", function (newValue, oldValue) {
		if (newValue !== null) {
			$scope.output = js_beautify(newValue);
		}
		
		$scope.outputVisible = (newValue !== null);
	});
}


(function () {
	var dustr = angular.module("dustr", []);

	/**
	 * Select compiled template on output
	 */
	dustr.directive("ngWatchSelect", function ($timeout) {
		return function (scope, element, attrs) {
			scope.$watch("output", function (newValue, oldValue) {
				if (newValue !== null) {
					$timeout(function () {
						element[0].select();
					}, 10, true);
				}	
			});
		};
	});
	
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
}());

