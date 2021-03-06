 //SHA1 加密
 function encodeUTF8(s) {
   var i, r = [],
     c, x;
   for (i = 0; i < s.length; i++)
     if ((c = s.charCodeAt(i)) < 0x80) r.push(c);
     else if (c < 0x800) r.push(0xC0 + (c >> 6 & 0x1F), 0x80 + (c & 0x3F));
   else {
     if ((x = c ^ 0xD800) >> 10 == 0) //对四字节UTF-16转换为Unicode
       c = (x << 10) + (s.charCodeAt(++i) ^ 0xDC00) + 0x10000,
       r.push(0xF0 + (c >> 18 & 0x7), 0x80 + (c >> 12 & 0x3F));
     else r.push(0xE0 + (c >> 12 & 0xF));
     r.push(0x80 + (c >> 6 & 0x3F), 0x80 + (c & 0x3F));
   };
   return r;
 };

 // 字符串加密成 hex 字符串
 function sha1(s) {
   var data = new Uint8Array(encodeUTF8(s))
   var i, j, t;
   var l = ((data.length + 8) >>> 6 << 4) + 16,
     s = new Uint8Array(l << 2);
   s.set(new Uint8Array(data.buffer)), s = new Uint32Array(s.buffer);
   for (t = new DataView(s.buffer), i = 0; i < l; i++) s[i] = t.getUint32(i << 2);
   s[data.length >> 2] |= 0x80 << (24 - (data.length & 3) * 8);
   s[l - 1] = data.length << 3;
   var w = [],
     f = [
       function () {
         return m[1] & m[2] | ~m[1] & m[3];
       },
       function () {
         return m[1] ^ m[2] ^ m[3];
       },
       function () {
         return m[1] & m[2] | m[1] & m[3] | m[2] & m[3];
       },
       function () {
         return m[1] ^ m[2] ^ m[3];
       }
     ],
     rol = function (n, c) {
       return n << c | n >>> (32 - c);
     },
     k = [1518500249, 1859775393, -1894007588, -899497514],
     m = [1732584193, -271733879, null, null, -1009589776];
   m[2] = ~m[0], m[3] = ~m[1];
   for (i = 0; i < s.length; i += 16) {
     var o = m.slice(0);
     for (j = 0; j < 80; j++)
       w[j] = j < 16 ? s[i + j] : rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1),
       t = rol(m[0], 5) + f[j / 20 | 0]() + m[4] + w[j] + k[j / 20 | 0] | 0,
       m[1] = rol(m[1], 30), m.pop(), m.unshift(t);
     for (j = 0; j < 5; j++) m[j] = m[j] + o[j] | 0;
   };
   t = new DataView(new Uint32Array(m).buffer);
   for (var i = 0; i < 5; i++) m[i] = t.getUint32(i << 2);

   var hex = Array.prototype.map.call(new Uint8Array(new Uint32Array(m).buffer), function (e) {
     return (e < 16 ? "0" : "") + e.toString(16);
   }).join("");

   return hex;
 };




 function MD5(sMessage) {
   function RotateLeft(lValue, iShiftBits) {
     return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
   }

   function AddUnsigned(lX, lY) {
     var lX4, lY4, lX8, lY8, lResult;
     lX8 = (lX & 0x80000000);
     lY8 = (lY & 0x80000000);
     lX4 = (lX & 0x40000000);
     lY4 = (lY & 0x40000000);
     lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
     if (lX4 & lY4) {
       return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
     }
     if (lX4 | lY4) {
       if (lResult & 0x40000000) {
         return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
       } else {
         return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
       }
     } else {
       return (lResult ^ lX8 ^ lY8);
     }
   }

   function F(x, y, z) {
     return (x & y) | ((~x) & z);
   }

   function G(x, y, z) {
     return (x & z) | (y & (~z));
   }

   function H(x, y, z) {
     return (x ^ y ^ z);
   }

   function I(x, y, z) {
     return (y ^ (x | (~z)));
   }

   function FF(a, b, c, d, x, s, ac) {
     a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
     return AddUnsigned(RotateLeft(a, s), b);
   }

   function GG(a, b, c, d, x, s, ac) {
     a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
     return AddUnsigned(RotateLeft(a, s), b);
   }

   function HH(a, b, c, d, x, s, ac) {
     a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
     return AddUnsigned(RotateLeft(a, s), b);
   }

   function II(a, b, c, d, x, s, ac) {
     a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
     return AddUnsigned(RotateLeft(a, s), b);
   }

   function ConvertToWordArray(sMessage) {
     var lWordCount;
     var lMessageLength = sMessage.length;
     var lNumberOfWords_temp1 = lMessageLength + 8;
     var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
     var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
     var lWordArray = Array(lNumberOfWords - 1);
     var lBytePosition = 0;
     var lByteCount = 0;
     while (lByteCount < lMessageLength) {
       lWordCount = (lByteCount - (lByteCount % 4)) / 4;
       lBytePosition = (lByteCount % 4) * 8;
       lWordArray[lWordCount] = (lWordArray[lWordCount] | (sMessage.charCodeAt(lByteCount) << lBytePosition));
       lByteCount++;
     }
     lWordCount = (lByteCount - (lByteCount % 4)) / 4;
     lBytePosition = (lByteCount % 4) * 8;
     lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
     lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
     lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
     return lWordArray;
   }

   function WordToHex(lValue) {
     var WordToHexValue = "",
       WordToHexValue_temp = "",
       lByte, lCount;
     for (lCount = 0; lCount <= 3; lCount++) {
       lByte = (lValue >>> (lCount * 8)) & 255;
       WordToHexValue_temp = "0" + lByte.toString(16);
       WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
     }
     return WordToHexValue;
   }
   var x = Array();
   var k, AA, BB, CC, DD, a, b, c, d
   var S11 = 7,
     S12 = 12,
     S13 = 17,
     S14 = 22;
   var S21 = 5,
     S22 = 9,
     S23 = 14,
     S24 = 20;
   var S31 = 4,
     S32 = 11,
     S33 = 16,
     S34 = 23;
   var S41 = 6,
     S42 = 10,
     S43 = 15,
     S44 = 21;
   // Steps 1 and 2. Append padding bits and length and convert to words
   x = ConvertToWordArray(sMessage);
   // Step 3. Initialise
   a = 0x67452301;
   b = 0xEFCDAB89;
   c = 0x98BADCFE;
   d = 0x10325476;
   // Step 4. Process the message in 16-word blocks
   for (k = 0; k < x.length; k += 16) {
     AA = a;
     BB = b;
     CC = c;
     DD = d;
     a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
     d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
     c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
     b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
     a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
     d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
     c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
     b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
     a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
     d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
     c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
     b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
     a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
     d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
     c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
     b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
     a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
     d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
     c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
     b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
     a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
     d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
     c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
     b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
     a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
     d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
     c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
     b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
     a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
     d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
     c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
     b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
     a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
     d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
     c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
     b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
     a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
     d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
     c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
     b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
     a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
     d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
     c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
     b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
     a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
     d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
     c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
     b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
     a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
     d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
     c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
     b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
     a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
     d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
     c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
     b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
     a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
     d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
     c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
     b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
     a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
     d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
     c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
     b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
     a = AddUnsigned(a, AA);
     b = AddUnsigned(b, BB);
     c = AddUnsigned(c, CC);
     d = AddUnsigned(d, DD);
   }
   // Step 5. Output the 128 bit digest
   var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
   return temp.toLowerCase();
 }


 // json key字典排序
 function jsonSort(jsonObj) {
   let arr = [];
   for (var key in jsonObj) {
     arr.push(key)
   }
   arr.sort();
   let str = '';
   for (var i in arr) {
     str += `"${arr[i]}" : "${jsonObj[arr[i]]}",`





     //  str += arr[i] + ":" +jsonObj[arr[i]] + ","
   }
   return `{${ str.substr(0, str.length - 1)}}`;
 }

 function updateChar() {
   // 数据已更新

 }