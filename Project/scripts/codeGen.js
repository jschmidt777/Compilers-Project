//codeGen.js
//4/25/16

//Output the 256 bytes, per program
	var codeArr = []; //holds all of the hexArr, which we create for each program

	function hexDecArr(){  //num = i + 1 for the for loop
		this.num = 0;
		this.hexCode = new Array(256);
		this.hexCode.fill("00", 0, 256);

		this.toString = function(){
			var outputHex = this.hexCode.join(" ");
			return outputHex;
		}
	}

	function createHexArr(num){
		var hexArr = new hexDecArr();
			hexArr.num = num;
			codeArr.push(hexArr);
	}

 	function createCodeBlocks(){
 		for(i = 0; i < astArr.length; i++){
			createHexArr(i+1);
		}
 	}
		

	var curCodeBlock = codeArr[0]; //after we create the 256 byte blocks for each program, point to the first one (or the only one if that's the case... there's no way we get this far with at least one valid program).
	

//Point to the byte we are looking at; initialize it at the first index.
//var curByte = codeArr[0].hexCode[0];


//Jump table

//Temp var table

