define([
], function (
) {

  var dictionary = {
    "aerial": "antenna",
    "angry": "mad",
    "anywhere": "anyplace",
    "autumn": "fall",
    "bank note": "bill",
    "barrister": "attorney",
    "biscuit": "cookie",
    "bonnet": "hood",
    "boot": "trunk",
    "braces": "suspenders",
    "caretaker": "janitor",
    "chemist's": "drug store",
    "chips": "french fries",
    "the cinema": "the movies",
    "condom": "rubber",
    "constable": "patrolman",
    "cooker": "stove",
    "wheat": "wheat",
    "cot": "crib",
    "cotton": "thread",
    "crash": "wreck",
    "crossroads": "intersection",
    "curtains": "drapes",
    "draughts": "checkers",
    "drawing-pin": "thumbtack",
    "dual carriageway": "divided highway",
    "dummy": "pacifier",
    "dust-bin": "trashcan",
    "dustman": "garbage collector",
    "dynamo": "generator",
    "engine": "motor",
    "engine driver": "engineer",
    "film": "movie",
    "flat": "apartment",
    "flyover": "overpass",
    "garden": "yard",
    "gear-lever": "gear-lshift",
    "graduate": "alumnus",
    "grill": "boiler",
    "ground floor": "first floor",
    "gumshoes": "rubbers",
    "gymshoes": "sneakers",
    "handbag": "purse",
    "hoarding": "billboard",
    "holiday": "vacation",
    "hoover": "vacuum cleaner",
    "ill": "sick",
    "interval": "intermission",
    "jumper": "sweater",
    "jug": "pitcher",
    "lift": "elevator",
    "lorry": "truck",
    "luggage": "baggage",
    "mackintosch": "raincoat",
    "mad": "crazy",
    "main road": "highway",
    "maize": "corn",
    "maths": "math",
    "mean": "stingy",
    "motorway": "freeway",
    "nappy": "diaper",
    "nasty": "vicious",
    "nowhere": "noplace",
    "nursing home": "private hospital",
    "oculltist": "optometrist",
    "off-license": "liquor store",
    "paraffin": "kerosene",
    "pavement": "sidewalk",
    "peep": "peek",
    "petrol": "gasoline",
    "post": "mail",
    "postbox": "mailbox",
    "postman": "mailman",
    "potato crisps": "potato chips",
    "pram": "baby carriage",
    "pub": "bar",
    "public toilet": "rest room",
    "puncture": "blow-out",
    "push-chair": "stroller",
    "queue": "line",
    "railway": "railroad",
    "railway carriage": "railway car",
    "reel of cotton": "spool of thread",
    "return": "round trip",
    "reverse charges": "call collect",
    "rise": "raise",
    "road surface": "pavement",
    "roudabout": "traffic circle",
    "rubber": "eraser",
    "rubbish": "garbage",
    "saloon": "sedan",
    "sellotape": "Scotch tape",
    "shop": "store",
    "silencer": "muffler",
    "single": "one-way",
    "somewhere": "someplace",
    "spanner": "wrench",
    "staff": "faculty",
    "sump": "oil-pan",
    "sweet": "dessert",
    "sweets": "candy",
    "tap": "faucet",
    "taxi": "cab",
    "tea-towel": "dish-towel",
    "term": "semester",
    "tights": "panti-hose",
    "timetable": "schedule",
    "tin": "can",
    "toll motorway": "turnpike",
    "torch": "flashlight",
    "tramp": "hobo",
    "trousers": "pants",
    "turn-ups": "cuffs",
    "underground railway": "subway",
    "underpants": "shorts",
    "waistcoat": "vest",
    "wardrobe": "closet",
    "wash your hands": "wash up",
    "windscreen": "windshield",
    "wing": "fender",
    "zip": "zipper"
  };

  function addCss() {
    var head = document.getElementsByTagName('head')[0];
    var s = document.createElement('link');
    s.setAttribute('rel', 'stylesheet');
    s.setAttribute('href', '../bower_components/scribe-plugin-units/src/unit.css');
    s.setAttribute('type', 'text/css');
    head.appendChild(s);
  }

  'use strict';

  return function () {

    return function (scribe) {

      addCss();


      var elementHelpers = scribe.element;

      scribe.el.addEventListener('click', function(e) {
        if (e.target.getAttribute('data-type') == 'currency') {
          e.target.setAttribute("data-user-disabled", "true");
        }
      });

      // When the character is actually inserted, format it to transform.
      scribe.el.addEventListener('input', function () {
        var selection = new scribe.api.Selection();
        var containingBlockElement = scribe.allowsBlockElements()
          ? selection.getContaining(elementHelpers.isBlockElement)
          : scribe.el;

        selection.placeMarkers();

        containingBlockElement.innerHTML = unitsNormalize(containingBlockElement.innerHTML);
        selection.selectMarkers();
      });

      // Substitute quotes on setting content or paste
      scribe.registerHTMLFormatter('normalize', unitsNormalize);

      function replaceCurrencies(s) {
        return s.replace(
          /£([\d]+\.?[\d]*)/g, "<data class=\"detected-unit\" data-currency=\"GBP\" data-value=\"$1\" data-user-disabled=\"false\" data-type=\"currency\">£$1</data>"
        ).replace(
          /\$([\d]+\.?[\d]*)/g, "<data class=\"detected-unit\" data-currency=\"USD\" data-value=\"$1\" data-user-disabled=\"false\" data-type=\"currency\">$$$1</data>"
        ).replace(
          /€([\d]+\.?[\d]*)/g, "<data class=\"detected-unit\" data-currency=\"EUR\" data-value=\"$1\" data-user-disabled=\"false\" data-type=\"currency\">€$1</data>"
        );
      }

      function currencyReplace(node) {
        var holder = document.createElement('div');
        holder.innerHTML = replaceCurrencies(node.data);
        return holder.childNodes;
      }

      function currencyTidy(node) {
        var holder = document.createElement('div');
        holder.innerHTML = replaceCurrencies(node.innerHTML);
        return holder.childNodes;
      }

      function replaceWithMultiple(node, child, extra) {
        if (extra.length == 0)
          return;
        while (extra.length > 1) {
          node.insertBefore(extra[0], child);
        }
        var lastChild = extra[0]
        node.replaceChild(extra[0], child);
        return lastChild
      }

      function unitsNormalize(html) {
        var holder = document.createElement('div');
        holder.innerHTML = html;
        var normed = parseNodes(holder).innerHTML
        return normed
      }

      function parseNodes(node) {
        var child = node.firstChild;
        while (child) {
          console.log(child.tagName)
          console.log(child)
          if (child.nodeType == child.TEXT_NODE) {
            child = replaceWithMultiple(node, child, currencyReplace(child));
          } else if(child.getAttribute("data-user-disabled") == "true") {
            // do nothing
          } else if(child.getAttribute("data-type") == "currency") {
            child = replaceWithMultiple(node, child, currencyTidy(child));
          } else if(child.childNodes.length > 0) {
            parseNodes(child);
          } else {
          }
          if (child != null)
            child = child.nextSibling;
        }
        return node;
      }

    };
  };

});
