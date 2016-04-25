//codeGen.js
//4/25/16

//Output the 256 bytes
var hexArr = new Array(256);
hexArr.fill("00", 0, 256);
var outputHex = hexArr.join(" ");
document.getElementById("taCodeGen").value = outputHex.toString();

//Point to the byte we are looking at; initialize it at the first index.
var curByte = hexArr[0];


//Jump table

//Temp var table

