var round = Math.round,
    floor = Math.floor;

// TODO: compare(rgb, hsv, hsl) + clone methods

/**
  * @desc convert hsv object to rgb
  * @param {Object} hsv - hsv object
  * @return {Object} rgb object
*/
function hsv2Rgb(hsv) {
  var r, g, b, i, f, p, q, t;
  var h = hsv.h/360, s = hsv.s/100, v = hsv.v/100;
  i = floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return {r: round(r * 255), g: round(g * 255), b: round(b * 255)};
};

/**
  * @desc convert rgb object to hsv
  * @param {Object} rgb - rgb object
  * @return {Object} hsv object
*/
function rgb2Hsv(rgb) {
  // Modified from https://github.com/bgrins/TinyColor/blob/master/tinycolor.js#L446
  var r = rgb.r / 255,
      g = rgb.g / 255,
      b = rgb.b / 255,
      max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      delta = max - min,
      hue;
  switch (max) {
    case min: hue = 0; break;
    case r: hue = (g - b) / delta + (g < b ? 6 : 0); break;
    case g: hue = (b - r) / delta + 2; break;
    case b: hue = (r - g) / delta + 4; break;
  }
  hue /= 6;
  return {
    h: round(hue * 360),
    s: round(max == 0 ? 0 : (delta / max) * 100),
    v: round(max * 100)
  };
};

/**
  * @desc convert hsv object to hsl
  * @param {Object} hsv - hsv object
  * @return {Object} hsl object
*/
function hsv2Hsl(hsv) {
  var s = hsv.s / 100,
      v = hsv.v / 100;
  var l = 0.5 * v * (2 - s);
  s = v * s / (1 - Math.abs(2 * l - 1));
  return {
    h: hsv.h,
    s: round(s * 100) || 0,
    l: round(l * 100)
  };
};

/**
  * @desc convert hsl object to hsv
  * @param {Object} hsl - hsl object
  * @return {Object} hsv object
*/
function hsl2Hsv(hsl) {
  var s = hsl.s / 100,
  l = hsl.l / 100;
  l *= 2;
  s *= (l <= 1) ? l : 2 - l;
  return {
    h: hsl.h,
    s: round(((2 * s) / (l + s)) * 100),
    v: round(((l + s) / 2) * 100)
  };
};

/**
  * @desc convert rgb object to string
  * @param {Object} rgb - rgb object
  * @return {Object} rgb string
*/
function rgb2Str(rgb) {
  return "rgb" + (rgb.a ? "a" : "") + "(" + rgb.r + ", " + rgb.g + ", " + rgb.b + (rgb.a ? ", " + rgb.a : "") + ")";
};

/**
  * @desc convert hsl object to string
  * @param {Object} hsl - hsl object
  * @return {Object} hsl string
*/
function hsl2Str(hsl) {
  return "hsl" + (hsl.a ? "a" : "") + "(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%" + (hsl.a ? ", " + hsl.a : "") + ")";
};

/**
  * @desc convert rgb object to hex string
  * @param {Object} rgb - rgb object
  * @return {Object} hex string
*/
function rgb2Hex(rgb) {
  var r = rgb.r,
      g = rgb.g,
      b = rgb.b;
  // If each RGB channel's value is a multiple of 17, we can use HEX shorthand notation
  var useShorthand = (r % 17 == 0) && (g % 17 == 0) && (b % 17 == 0),
      // If we're using shorthand notation, divide each channel by 17
      divider = useShorthand ? 17 : 1,
      // bitLength of each channel (for example, F is 4 bits long while FF is 8 bits long)
      bitLength = useShorthand ? 4 : 8,
      // Target length of the string (ie "#FFF" or "#FFFFFF")
      strLength = useShorthand ? 4 : 7,
      // Combine the channels together into a single integer
      int = (r / divider) << (bitLength * 2) | (g / divider) << bitLength | (b / divider),
      // Convert that integer to a hex string
      str = int.toString(16);
      // Add right amount of left-padding
      return "#" + (new Array(strLength - str.length).join("0")) + str;  
};

/**
  * @desc generic parser for hsl / rgb / etc string
  * @param {String} str - color string
  * @param {Array} maxValues - max values for each channel (used for calculating percent-based values)
  * @return {Array} type (rgb | rgba | hsl | hsla) values for each channel
*/
function parseColorStr(str, maxValues) {
  var parsed = str.match(/(\S+)\((\d+)(%?)(?:\D+?)(\d+)(%?)(?:\D+?)(\d+)(%?)(?:\D+?)?([0-9\.]+?)?\)/i),
      val1 = parseInt(parsed[2]),
      val2 = parseInt(parsed[4]),
      val3 = parseInt(parsed[6]);
  return [
    parsed[1],
    parsed[3] == "%" ? val1 / 100 * maxValues[0] : val1,
    parsed[5] == "%" ? val2 / 100 * maxValues[1] : val2,
    parsed[7] == "%" ? val3 / 100 * maxValues[2] : val3,
    parseFloat(parsed[8]) || undefined
  ];
};

/**
  * @desc parse rgb string
  * @param {String} str - color string
  * @return {Object} rgb object
*/
function parseRgbStr(str) {
  var parsed = parseColorStr(str, [255, 255, 255]);
  return {
    r: parsed[1],
    g: parsed[2],
    b: parsed[3]
  };
};

/**
  * @desc parse hsl string
  * @param {String} str - color string
  * @return {Object} hsl object
*/
function parseHslStr(str) {
  var parsed = parseColorStr(str, [360, 100, 100]);
  return {
    h: parsed[2],
    s: parsed[3],
    l: parsed[4]
  };
};

/**
  * @desc parse hex string
  * @param {String} str - color string
  * @return {Object} rgb object
*/
function parseHexStr(hex) {
  // Strip any "#" characters
  hex = hex.replace("#", "");
  // Prefix the hex string with "0x" which indicates a number in hex notation, then convert to an integer
  var int = parseInt("0x" + hex),
      // If the length of the input is only 3, then it is a shorthand hex color
      isShorthand = hex.length == 3,
      // bitMask for isolating each channel
      bitMask = isShorthand ? 0xF : 0xFF,
      // bitLength of each channel (for example, F is 4 bits long while FF is 8 bits long)
      bitLength = isShorthand ? 4 : 8,
      // If we're using shorthand notation, multiply each channel by 17
      multiplier = isShorthand ? 17 : 1;
  return {
    r: ((int >> (bitLength * 2)) & bitMask) * multiplier,
    g: ((int >> bitLength) & bitMask) * multiplier,
    b: (int & bitMask) * multiplier,
  };
};

/**
  * @desc convert object / string input to color if necessary
  * @param {Object | String | color} value - color instance, object (hsv, hsl or rgb), string (hsl, rgb, hex)
  * @return {color} color instance
*/
function getColor(value) {
  return value instanceof color ? value : new color(value);
};

/**
  * @desc clamp value between min and max
  * @param {Number} value
  * @param {Number} min
  * @param {Number} max
  * @return {Number}
*/
function clamp(value, min, max) {
  return value <= min ? min : value >= max ? max : value;
};

/**
  * @desc compare values between two objects, returns a object representing changes with true/false values
  * @param {Object} a
  * @param {Object} b
  * @return {Object}
*/
function compareObjs(a, b) {
  var changes = {};
  for (var key in a) changes[key] = b[key] != a[key];
  return changes;
};

/**
  * @desc mix two colors
  * @param {Object | String | color} color1 - color instance, object (hsv, hsl or rgb), string (hsl, rgb, hex)
  * @param {Object | String | color} color2 - color instance, object (hsv, hsl or rgb), string (hsl, rgb, hex)
  * @param {Number} weight - closer to 0 = more color1, closer to 100 = more color2
  * @return {color} color instance
*/
function mix(color1, color2, weight) {
  var rgb1 = getColor(color1).rgb,
      rgb2 = getColor(color2).rgb;
  weight = clamp((weight / 100 || 0.5), 0, 1);
  return new color({
    r: floor(rgb1.r + (rgb2.r - rgb1.r) * weight),
    g: floor(rgb1.g + (rgb2.g - rgb1.g) * weight),
    b: floor(rgb1.b + (rgb2.b - rgb1.b) * weight),
  });
};

/**
  * @desc lighten color by amount
  * @param {Object | String | color} color - color instance, object (hsv, hsl or rgb), string (hsl, rgb, hex)
  * @param {Number} amount
  * @return {color} color instance
*/
function lighten(color, amount) {
  var col = getColor(color),
      hsv = col.hsv;
  hsv.v = clamp(hsv.v + amount, 0, 100);
  col.hsv = hsv;
  return col;
};

/**
  * @desc darken color by amount
  * @param {Object | String | color} color - color instance, object (hsv, hsl or rgb), string (hsl, rgb, hex)
  * @param {Number} amount
  * @return {color} color instance
*/
function darken(color, amount) {
  var col = getColor(color),
      hsv = col.hsv;
  hsv.v = clamp(hsv.v - amount, 0, 100);
  col.hsv = hsv;
  return col;
};

/**
  * @constructor color object
  * @param {Object | String | color} value - color instance, object (hsv, hsl or rgb), string (hsl, rgb, hex)
*/
const color = function(value) {
  // The watch callback function for this color will be stored here
  this._onChange = false;
  // The default color value
  this._value = {h: undefined, s: undefined, v: undefined};
  if (value) this.set(value);
};

// Expose functions as static helpers
color.mix = mix;
color.lighten = lighten;
color.darken = darken;
color.hsv2Rgb = hsv2Rgb;
color.rgb2Hsv = rgb2Hsv;
color.hsv2Hsl = hsv2Hsl;
color.hsl2Hsv = hsl2Hsv;
color.hsl2Str = hsl2Str;
color.rgb2Str = rgb2Str;
color.rgb2Hex = rgb2Hex;
color.parseHexStr = parseHexStr;
color.parseHslStr = parseHslStr;
color.parseRgbStr = parseRgbStr;

color.prototype = {
  constructor: color,

  /**
    * @desc set the color from any valid value
    * @param {Object | String | color} value - color instance, object (hsv, hsl or rgb), string (hsl, rgb, hex)
  */
  set: function(value) {
    if (typeof value == "object") {
      if (value instanceof color) {
        this.hsv = color.hsv;
      } else if ("r" in value) {
        this.rgb = value;
      } else if ("v" in value) {
        this.hsv = value;
      } else if ("l" in value) {
        this.hsl = value;
      }
    } else if (typeof value == "string") {
      if (/^rgb/.test(value)) {
        this.rgbString = value;
      } else if (/^hsl/.test(value)) {
        this.hslString = value;
      } else if (/^#[0-9A-Fa-f]/.test(value)) {
        this.hexString = value;
      }
    }
  },

  /**
    * @desc shortcut to set a specific channel value
    * @param {String} model - hsv | hsl | rgb
    * @param {String} channel - individual channel to set, for example if model = hsl, chanel = h | s | l
    * @param {Number} value - new value for the channel
  */
  setChannel: function (model, channel, value) {
    var v = this[model];
    v[channel] = value;
    this[model] = v;
  },

  /**
    * @desc make new color instance with the same value as this one
    * @return {color}
  */
  clone: function () {
    return new color(this);
  },

  /**
    * @desc compare this color against another, returns a object representing changes with true/false values
    * @param {Object | String | color} color - color to compare against
    * @param {String} model - hsv | hsl | rgb
    * @return {Object}
  */
  compare: function (color, model) {
    model = model || "hsv";
    return compareObjs(this[model], getColor(color)[model]);
  },
  
  /**
    * @desc mix a color into this one
    * @param {Object | String | color} color - color instance, object (hsv, hsl or rgb), string (hsl, rgb, hex)
    * @param {Number} weight - closer to 0 = more current color, closer to 100 = more new color
  */
  mix: function(color, weight) {
    this.hsv = mix(this, color, weight).hsv;
  },

  /**
    * @desc lighten color by amount
    * @param {Number} amount
  */
  lighten: function(amount) {
    lighten(this, amount);
  },

  /**
    * @desc darken color by amount
    * @param {Number} amount
  */
  darken: function(amount) {
    darken(this, amount);
  },
};

Object.defineProperties(color.prototype, {
  hsv: {
    get: function () {
      // _value is cloned to allow changes to be made to the values before passing them back
      var v = this._value;
      return {h: v.h, s: v.s, v: v.v};
    },
    set: function (newValue) {
      // If this color is being watched for changes we need to compare the new and old values to check the difference
      // Otherwise we can just be lazy
      if (this._onChange) {
        var oldValue = this._value;
        for (var channel in oldValue) {
          if (!newValue.hasOwnProperty(channel)) newValue[channel] = oldValue[channel];
        }
        var changes = compareObjs(oldValue, newValue);
        // Update the old value
        this._value = newValue;
        // If the value has changed, call hook callback
        if (changes.h || changes.s || changes.v) this._onChange(this, changes);
      } else {
        this._value = newValue;
      }
    },
  },
  rgb: {
    get: function() {
      return hsv2Rgb(this._value);
    },
    set: function(value) {
      this.hsv = rgb2Hsv(value);
    }
  },
  hsl: {
    get: function() {
      return hsv2Hsl(this._value);
    },
    set: function(value) {
      this.hsv = hsl2Hsv(value);
    }
  },
  rgbString: {
    get: function() {
      return rgb2Str(this.rgb);
    },
    set: function(value) {
      this.rgb = parseRgbStr(value);
    }
  },
  hexString: {
    get: function() {
      return rgb2Hex(this.rgb);
    },
    set: function(value) {
      this.rgb = parseHexStr(value);
    }
  },
  hslString: {
    get: function() {
      return hsl2Str(this.hsl);
    },
    set: function(value) {
      this.hsl = color.parseHslStr(value);
    }
  }
});

module.exports = color;