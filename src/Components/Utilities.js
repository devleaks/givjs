/*
 *  Helper functions.
 */

/**
 * Add a lsit of object's properties to the first one, recursively.
 *
 * @param      {list of Objects}  out     List of objects
 * @return     {Object}  The first object of the list, augmented with the properties of the following object(s).
 */
export function deepExtend(out) {
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
