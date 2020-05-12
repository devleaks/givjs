/*
 * jQuery Oscars GIP Map Widget Helper
 * 2017 Pierre M
 * License: MIT

 *  Helper functions.
 */
const VERSION = "1.0.0"
const MODULE_NAME = "Utilities"

/*
 * deepExtend({}, objA, objB)
 */
function deepExtend(out) {
  out = out || {};

  for (let i = 1; i < arguments.length; i++) {
    let obj = arguments[i];

    if (!obj)
      continue;

    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === "object"){
          if(obj[key] instanceof Array == true)
            out[key] = obj[key].slice(0);
          else
            out[key] = deepExtend(out[key], obj[key]);
        }
        else
          out[key] = obj[key];
      }
    }
  }

  return out;
}

// Check property existance
function isSet(property) {
    return typeof property != "undefined" && (property || property === false);
}

function nvl(val, dft) {
    return isSet(val) ? val : dft
}

//

/**
 *  MODULE EXPORTS
 */
function version() {
    console.log(MODULE_NAME, VERSION);
}

export {
    version,
    deepExtend,
    nvl
}

