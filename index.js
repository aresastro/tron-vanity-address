///////////////////////////////////
// TRON Vanity Address Generator //
//         By Dean Little        //
///////////////////////////////////

/*
    Please take note that simply generating an address doesn't 
    automatically make it exist on the TRON network. You need
    to invoke it on the network through the account creation
    protocol, or send some TRX to it for it to exist on the
    network. As always, don't send TRX to testnet addresses
    or it wil lbe lost forever!
*/

//Includes
const rl = require('readline');
const CryptoJS = require("crypto-js");;
const base58 = require('base-58');
const elliptic = require('elliptic');
const keccak256 = require('js-sha3').keccak256;
const ec = new elliptic.ec('secp256k1');

//Variables
let testnet = false;
let string = '';

leadingZeroes = (a, b) => {
    return (a.length<b) ? new Array(b+1-a.length).join('0') + a : a.slice(0,b);
}

isHexChar = (c) => {
  if ((c >= 'A' && c <= 'F') ||
      (c >= 'a' && c <= 'f') ||
      (c >= '0' && c <= '9')) {
    return 1;
  }
  return 0;
}

hexChar2byte = (c) => {
  var d = 0;
  if (c >= 'A' && c <= 'F') {
    d = c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
  }
  else if (c >= 'a' && c <= 'f') {
    d = c.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
  }
  else if (c >= '0' && c <= '9') {
    d = c.charCodeAt(0) - '0'.charCodeAt(0);
  }
  return d;
}

hexStr2byteArray = (str) => {
  var byteArray = Array();
  var d = 0;
  var j = 0;
  var k = 0;

  for (let i = 0; i < str.length; i++) {
    var c = str.charAt(i);
    if (isHexChar(c)) {
      d <<= 4;
      d += hexChar2byte(c);
      j++;
      if (0 === (j % 2)) {
        byteArray[k++] = d;
        d = 0;
      }
    }
  }
  return byteArray;
}

byte2hexStr = (byte) => {
  var hexByteMap = "0123456789ABCDEF";
  var str = "";
  str += hexByteMap.charAt(byte >> 4);
  str += hexByteMap.charAt(byte & 0x0f);
  return str;
}

byteArray2hexStr = (byteArray) => {
  var str = "";
  for (var i = 0; i < (byteArray.length - 1); i++) {
    str += byte2hexStr(byteArray[i]);
  }
  str += byte2hexStr(byteArray[i]);
  return str;
}

genTronAddress = (testNet = false) =>{    
    let keyPair = ec.genKeyPair();
    // let testNet = testNet;
    let publicBytes = keyPair.getPublic('bytes');
    if (publicBytes.length === 65) {
        publicBytes = publicBytes.slice(1);
    }
    let publicKey = byteArray2hexStr(publicBytes);
    let sha3 = keccak256(publicBytes).toString();
    let addressHex = (testNet) ? 'a0' : 'b0';
    addressHex+=sha3.substring(24);
    let hash0 = CryptoJS.SHA256(hexStr2byteArray(addressHex)).toString();
    let hash1 = CryptoJS.SHA256(hexStr2byteArray(hash0)).toString();
    let checkSum = hash1.slice(0,8);
    let addressCheckSum = addressHex + checkSum;
    let addressBase58 = base58.encode(hexStr2byteArray(addressCheckSum));
    let addresses = [leadingZeroes(keyPair.getPrivate('hex'), 64), addressBase58];
    console.log(addresses[0] + " - " + addresses[1]);
    return addresses;
}

ask = (question, callback) => {
  var r = rl.createInterface({
    input: process.stdin,
    output: process.stdout});
  r.question(question + '\n', function(answer) {
    r.close();
    callback(null, answer);
  });
}

askTestNet = () => {
    ask('Is this a testnet account? y/n', testNetCB);
};

askString = () => {
    ask('What string do you want? (<5 chars recommended)', stringCB);
}

testNetCB = (a, b) => {
    if(b.toLowerCase() !== 'y' && b.toLowerCase() !== 'n'){
        console.log("Invalid answer. Please choose y or n.");
        askTestNet();
        return;
    } else {
        if(b.toLowerCase() === 'y'){
            testnet = true;
        }
        askString();
    }
}

stringCB = (a, b) => {
    if(b === ''){
        console.log("Please enter a valid string.");
        askString();
        return;
    } else {
        string = b;
        generateAddress();
    }
}


generateAddress = () => {
    var address = genTronAddress(testnet);
    var i=0;
    var start = new Date();
    while(!address[1].match(new RegExp(string,"gi"))) {
        i++;
        address = genTronAddress(testnet);
        setTimeout(function(){},0);    
    }
    let d = Math.floor((new Date().getTime() - start.getTime())/1000);
    console.log();
    console.log('---------------------------------------------');
    console.log();
    console.log('Generated in ' + i + ' iterations. Total time taken: ' + d + " second(s).");
    console.log('Private key: ' + address[0]);
    console.log('Address: ' + address[1]);
}

askTestNet();