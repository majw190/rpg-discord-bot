var promises = [];



for (var i = 0; i <= 11; i++) {
	promises.push(new Promise(function(resolve, reject) {
		var test = i;
			console.log(test);
		setTimeout(function() {
			
			resolve(test);
		}, Math.random()*1000);
		
	}));
}

promises.reduce(function combine(chain, pr){
	return chain.then(function() {
		// console.log("Test");
		return pr.then(function(value){ 
			console.log(value)
		});
	});
}, Promise.resolve([]));

// console.log(promises)

// Promise.all(promises).then(function(values){

// });
