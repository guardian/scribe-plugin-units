define([
  'lodash-amd/modern/lang/toArray'
], function (
  toArray
) {

  'use strict';

  return function () {

    var openDoubleCurly = '“';
    var closeDoubleCurly = '”';

    var openSingleCurly = '‘';
    var closeSingleCurly = '’';

    var NON_BREAKING_SPACE = '\u00A0';

    return function (scribe) {
      /**
       * Run the formatter as you type on the current paragraph.
       *
       * FIXME: We wouldn't have to do this if the formatters were run on text
       * node mutations, but that's expensive unil we have a virtual DOM.
       */

      var keys = {
        34: '"',
        39: '\'',
        163: '£',
        48: '0',
        49: '1',
        50: '2',
        51: '3',
        52: '4',
        53: '5',
        54: '6',
        55: '7',
        56: '8',
        57: '9'
      };
      var currencyChar;

      var elementHelpers = scribe.element;

      // `input` doesn't tell us what key was pressed, so we grab it beforehand
      scribe.el.addEventListener('keypress', function (event) {
        currencyChar = keys[event.charCode];
      });

      // When the character is actually inserted, format it to transform.
      scribe.el.addEventListener('input', function () {
        if (currencyChar) {
          var selection = new scribe.api.Selection();
          var containingBlockElement = scribe.allowsBlockElements()
            ? selection.getContaining(elementHelpers.isBlockElement)
            : scribe.el;

          selection.placeMarkers();

          containingBlockElement.innerHTML = unitsNormalize(containingBlockElement.innerHTML);
          selection.selectMarkers();
          // Reset
          currencyChar = undefined;
        }
      });

      // Substitute quotes on setting content or paste
      scribe.registerHTMLFormatter('normalize', unitsNormalize);

      function currencyReplace(node) {
        var holder = document.createElement('div');
        holder.innerHTML = node.data.replace(/£([\d]+\.?[\d]*)/g, "<data currency=\"GBP\">£$1</data>");
        return holder.childNodes;
      }

      function replaceWithMultiple(node, child, extra) {
        if (extra.length == 0)
          return;
        while (extra.length > 1) {
          node.insertBefore(extra[0], child);
        }
        node.replaceChild(extra[0], child);
      }

      function unitsNormalize(html) {
        var holder = document.createElement('div');
        holder.innerHTML = html;
        console.log(html)
        var normed = parseNodes(holder).innerHTML
        console.log(normed)
        return normed
      }

      function parseNodes(node) {
        var child = node.firstChild;
        while (child) {
          if (child.nodeType == child.TEXT_NODE) {
            replaceWithMultiple(node, child, currencyReplace(child));
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
