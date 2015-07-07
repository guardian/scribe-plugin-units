define([
  'lodash-amd/modern/lang/toArray'
], function (
  toArray
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

      function currencyReplace(node) {
        var holder = document.createElement('div');
        holder.innerHTML = node.data.replace(/£([\d]+\.?[\d]*)/g, "<data class=\"detected-unit\" data-user-disabled=\"false\" data-type=\"currency\">£$1</data>");
        var units = holder.querySelector("data.detected-unit");
        if (units) {
          for (var i = 0; i < units.length; i++) {
            units[i].onclick = function () {
              this.setAttribute("data-user-disabled", "true");
            }
          }
        }
        return holder.childNodes;
      }

      function currencyTidy(node) {
        var holder = document.createElement('div');
        holder.innerHTML = node.innerHTML.replace(/£([\d]+\.?[\d]*)/g, "<data class=\"detected-unit\" data-user-disabled=\"false\" data-type=\"currency\">£$1</data>");
        var units = holder.querySelector("data.detected-unit");
        if (units) {
          for (var i = 0; i < units.length; i++) {
            units[i].onclick = function () {
              this.setAttribute("data-user-disabled", "true");
            }
          }
        }
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
