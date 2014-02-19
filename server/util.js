module.exports = {
	
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	},

	removeByValue: function(array, value) {
		for (var i = array.length - 1; i >= 0; i--) {
			if (array[i] === value) array.splice(i, 1);
		}
	}
};