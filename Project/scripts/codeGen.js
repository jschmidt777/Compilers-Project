//codeGen.js
//4/25/16

//Output the 256 bytes, per program
	var codeArr = []; //holds all of the hexArr, which we create for each program
	var byteIndex = 0;
	var isCodeGenError = false;

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
		

	var taCodeBlock = null; //after we create the 256 byte blocks for each program, point to the first one 
	//(or the only one if that's the case... there's no way we get this far without at least one valid program).

	var curByte = null;  //FF: the end of out 256 byte block

		function codeGen(){  //modify scypeCheck; recursively decend to traverse the AST one last time to see what code needs to be generated
			//curAST resets after we make the symbol table(s)
					var curBlock = null;
					var curBlockChildren = null;
					var foundRoot = false;
					var alpha = /(a-z)/;
					var string = /([a-z]| )/g;
					var integer = /(\d)/;
					var boolval = /(false|true)/;
					var count = 0;
					var heapPtr = 255; //initialize to the end of the memory. FF.
					//curByte = goToNextByte();
					checkBlock();
					

					function checkBlock(){
						//debugger;
						if(!foundRoot){
							curBlock = curAST.root;
							foundRoot = true;
							curBlockChildren = curBlock.children;
							checkBlockChildren();
						}else{
							checkBlockChildren();
						}
						
					}

					
					function checkBlockChildren(){
						//debugger;
						if(!isCodeGenError){
							if(count < curBlockChildren.length){
								if(curBlockChildren[count].name == "VarDecl"){
									var tempPtr = curBlockChildren;
									curBlockChildren = curBlockChildren[count];
									//debugger;
									//checkVarDecl();
									curBlockChildren = tempPtr;
									count++;
									checkBlockChildren();
								}else if(curBlockChildren[count].name == "Assignment"){
									var tempPtr = curBlockChildren;
									curBlockChildren = curBlockChildren[count];
									//debugger;
									//checkAssignment();
									curBlockChildren = tempPtr;
									count++;
									checkBlockChildren();
								}else if(curBlockChildren[count].name == "Print"){
									var tempPtr = curBlockChildren;
									curBlockChildren = curBlockChildren[count];
									generatePrint();
									curBlockChildren = tempPtr;
									count++;
									checkBlockChildren();
								}else if(curBlockChildren[count].name == "If" || curBlockChildren[count].name == "While"){
									//debugger;
									var tempPtr = curBlockChildren;
									curBlockChildren = curBlockChildren[count];
									//checkIfOrWhile();
									var temp = count;
									count = 1;
									curBlockChildren = curBlockChildren.children;
									checkBlockChildren();
									curBlockChildren = tempPtr;
									count = temp;
									count++;
									checkBlockChildren();
								}else if(curBlockChildren[count].name == "BLOCK"){
									var tempPtr = curBlockChildren;
									var temp = count;
									curBlockChildren = curBlockChildren[count].children;
									count = 0;
									checkBlock();
									curBlockChildren = tempPtr;
									count = temp;
									count++;
									checkBlockChildren();
								}else{ 

								}
							}
						}
							
					}

					function generatePrint(){
						//Notes: can print anything, so have to account for strings, ints, bools, and variables
						if(curBlockChildren.children[0].name.match(integer)){
							taCodeBlock.hexCode[byteIndex] = "A0"; //load memory with a constant
							byteIndex++;
							var taInt = curBlockChildren.children[0].name;
							taInt = "0" + taInt;
							taCodeBlock.hexCode[byteIndex] = taInt;
							byteIndex++;
							taCodeBlock.hexCode[byteIndex] = "A2";
							byteIndex++;
							taCodeBlock.hexCode[byteIndex] = "01";
							byteIndex++;
							taCodeBlock.hexCode[byteIndex] = "FF";
							byteIndex++;
						}else if(curBlockChildren.children[0].name.match(string) && curBlockChildren.children[0].isString == true){
							//A0 (hex mem location) A2 02 FF
							taCodeBlock.hexCode[byteIndex] = "A0";
							byteIndex++;
							//mem location of the beginning of the string
							taCodeBlock.hexCode[byteIndex] = generateString(curBlockChildren.children[0].name);
							byteIndex++;
							taCodeBlock.hexCode[byteIndex] = "A2";
							byteIndex++;
							taCodeBlock.hexCode[byteIndex] = "02";
							byteIndex++;
							taCodeBlock.hexCode[byteIndex] = "FF";
							byteIndex++;
							
						}
					}
 
					function generateString(str){ //O(n). n based on the length of our string.
						var hexLocale = 255; //the beginning of the string in the heap
						var hex = "";
						var stringPtr = heapPtr - str.length;
						hexLocale = stringPtr.toString(16);
						hexLocale = hexLocale.toUpperCase();
							for(i = 0; i < str.length; i++) {
								hex += str.charCodeAt(i).toString(16);
							}
						hex = hex.toUpperCase();
						var hexString = hex.split(/(.{2})/); //split up the string after we convert it to hex, and put it in the heap.
						hexString = hexString.filter(function(n){ return n != "" });
							for(i = 0; i < hexString.length; i++) {
								taCodeBlock.hexCode[stringPtr] = hexString[i];
								stringPtr++;
							}
						//if we don't get a string with any length, we'll still move the pointer, just for consistency...
						heapPtr = heapPtr - str.length - 1;
						return hexLocale;
					}
		}










	
	function goToNextByte() {  //how we'll go from byte to byte
        var thisByte = null;   
        if (byteIndex < taCodeBlock.hexCode.length){
            thisByte = taCodeBlock.hexCode[byteIndex];
            byteIndex++;
        } //else: stack overflow? //else if(we are at the end, wrap back around to some valid location)
        return thisByte;
    }

//Point to the byte we are looking at; initialize it at the first index.
//var curByte = codeArr[0].hexCode[0];


//Jump table

//Temp var table

//Convert ACII to hex

// Hex values for 6502 commands and what they mean?

//Heap