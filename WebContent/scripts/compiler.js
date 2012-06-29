/*!
 * Online DustJS compiler Angular controller script
 * 
 * $Id: compiler.js 10 2012-03-20 22:06:41Z nlaplante $
 * 
 * Written by Nicolas Laplante (nicolas.laplante@gmail.com)
 */
 
function DustrCtrl($scope)
{
	// Input & output fields
	$.extend($scope, {
		source: null,
		name: null,
		output: null
	});
	
	// Events
	$scope.evtCompile = function () {
		
	};
	
	// Handler to clear the fields
	$scope.evtClear = function () {
		$scope.source = null;
		$scope.name = null;
		$scope.output = null;
	};
}