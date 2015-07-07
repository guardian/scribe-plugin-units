define([
], function (
) {

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
          /£([\d]+\.?[\d]*[bmk]?)/g, "<data class=\"detected-unit\" data-currency=\"GBP\" data-value=\"$1\" data-user-disabled=\"false\" data-type=\"currency\">£$1</data>"
        ).replace(
          /\$([\d]+\.?[\d]*[bmk]?)/g, "<data class=\"detected-unit\" data-currency=\"USD\" data-value=\"$1\" data-user-disabled=\"false\" data-type=\"currency\">$$$1</data>"
        ).replace(
          /€([\d]+\.?[\d]*[bmk]?)/g, "<data class=\"detected-unit\" data-currency=\"EUR\" data-value=\"$1\" data-user-disabled=\"false\" data-type=\"currency\">€$1</data>"
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
