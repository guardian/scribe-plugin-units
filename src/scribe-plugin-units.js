define([
  'lodash-amd/modern/lang/toArray',
   '../../scribe-plugin-units/src/units'
], function (
  toArray,
  units
) {

  function addCss() {
    var head = document.getElementsByTagName('head')[0];
    var s = document.createElement('link');
    s.setAttribute('rel', 'stylesheet');
    s.setAttribute('href', '../bower_components/scribe-plugin-units/src/unit.css');
    s.setAttribute('type', 'text/css');
    head.appendChild(s);
  }

  return function () {
    return function (scribe) {

      addCss();

      var elementHelpers = scribe.element;
      scribe.el.addEventListener('input', function () {
        var selection = new scribe.api.Selection();
        var containingBlockElement = scribe.allowsBlockElements()
          ? selection.getContaining(elementHelpers.isBlockElement)
          : scribe.el;

        selection.placeMarkers();
        containingBlockElement.innerHTML = substituteCurlyQuotes(containingBlockElement.innerHTML);
        selection.selectMarkers();
      });

      // Substitute quotes on setting content or paste
      scribe.registerHTMLFormatter('normalize', substituteCurlyQuotes);

      function isWordCharacter(character) {
          return /[^\s()]/.test(character);
      }

      function substituteCurlyQuotes(html) {
        // We don't want to replace quotes within the HTML markup
        // (e.g. attributes), only to text nodes
        var holder = document.createElement('div');
        holder.innerHTML = html;

        // Replace straight single and double quotes with curly
        // equivalent in the given string
        mapElements(holder, function(prev, str) {
          // Tokenise HTML elements vs text between them
          // Note: this is escaped HTML in the text node!
          // Split by elements
          // We tokenise with the previous text nodes for context, but
          // only extract the current text node.
          //var tokens = str.replace .split(/(<[^>]+?>(?:.*<\/[^>]+?>)?)/);

          //return str.replace(/£([\d]+)/, "<span data-currency=\"GBP\">£$1</span>");
          return str;
        });

        return holder.innerHTML;
      }

      // Recursively convert the quotes to curly quotes. We have to do this
      // recursively instead of with a global match because the latter would
      // not detect overlaps, e.g. "'1'" (text can only be matched once).
      function convert(str) {
        if (! /['"]/.test(str)) {
          return str;
        } else {
          var foo = str.
            // Use [\s\S] instead of . to match any characters _including newlines_
            replace(/([\s\S])?'/,
                    replaceQuotesFromContext(openSingleCurly, closeSingleCurly)).
            replace(/([\s\S])?"/,
                    replaceQuotesFromContext(openDoubleCurly, closeDoubleCurly));
          return convert(foo);
        }
      }

      function replaceQuotesFromContext(openCurly, closeCurly) {
        return function(m, prev) {
          prev = prev || '';
          var hasCharsBefore = isWordCharacter(prev);
          // Optimistic heuristic, would need to look at DOM structure
          // (esp block vs inline elements) for more robust inference
          if (hasCharsBefore) {
            return prev + closeCurly;
          } else {
            return prev + openCurly;
          }
        };
      }

      // Apply a function on all text nodes in a container, mutating in place
      function mapElements(containerElement, func) {
        // TODO: This heuristic breaks for elements that contain a mixture of
        // inline and block elements.
        var nestedBlockElements = toArray(containerElement.children).filter(elementHelpers.isBlockElement);
        if (nestedBlockElements.length) {
          nestedBlockElements.forEach(function (nestedBlockElement) {
            // Map the nested block elements
            mapElements(nestedBlockElement, func);
          });
        } else {
          mapTextNodes(containerElement, func);
        }
      }

      function mapTextNodes(containerElement, func) {
        // TODO: Only walk inside of text nodes within inline elements
        var walker = document.createTreeWalker(containerElement, NodeFilter.SHOW_TEXT);
        var node = walker.firstChild();
        var prevTextNodes = '';
        while (node) {
          // Split by BR
          if (node.previousSibling && node.previousSibling.nodeName === 'BR') {
            prevTextNodes = '';
          }
          node.data = func(prevTextNodes, node.data);
          prevTextNodes += node.data;
          node = walker.nextSibling();
        }
      }

    };
  };

});
