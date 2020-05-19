// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/mithril/render/vnode.js":[function(require,module,exports) {
"use strict"

function Vnode(tag, key, attrs, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs, children: children, text: text, dom: dom, domSize: undefined, state: undefined, events: undefined, instance: undefined}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
	if (node == null || typeof node === "boolean") return null
	if (typeof node === "object") return node
	return Vnode("#", undefined, undefined, String(node), undefined, undefined)
}
Vnode.normalizeChildren = function(input) {
	var children = []
	if (input.length) {
		var isKeyed = input[0] != null && input[0].key != null
		// Note: this is a *very* perf-sensitive check.
		// Fun fact: merging the loop like this is somehow faster than splitting
		// it, noticeably so.
		for (var i = 1; i < input.length; i++) {
			if ((input[i] != null && input[i].key != null) !== isKeyed) {
				throw new TypeError("Vnodes must either always have keys or never have keys!")
			}
		}
		for (var i = 0; i < input.length; i++) {
			children[i] = Vnode.normalize(input[i])
		}
	}
	return children
}

module.exports = Vnode

},{}],"../node_modules/mithril/render/hyperscriptVnode.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

// Call via `hyperscriptVnode.apply(startOffset, arguments)`
//
// The reason I do it this way, forwarding the arguments and passing the start
// offset in `this`, is so I don't have to create a temporary array in a
// performance-critical path.
//
// In native ES6, I'd instead add a final `...args` parameter to the
// `hyperscript` and `fragment` factories and define this as
// `hyperscriptVnode(...args)`, since modern engines do optimize that away. But
// ES5 (what Mithril requires thanks to IE support) doesn't give me that luxury,
// and engines aren't nearly intelligent enough to do either of these:
//
// 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
//    another function only to be indexed.
// 2. Elide an `arguments` allocation when it's passed to any function other
//    than `Function.prototype.apply` or `Reflect.apply`.
//
// In ES6, it'd probably look closer to this (I'd need to profile it, though):
// module.exports = function(attrs, ...children) {
//     if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
//         if (children.length === 1 && Array.isArray(children[0])) children = children[0]
//     } else {
//         children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children]
//         attrs = undefined
//     }
//
//     if (attrs == null) attrs = {}
//     return Vnode("", attrs.key, attrs, children)
// }
module.exports = function() {
	var attrs = arguments[this], start = this + 1, children

	if (attrs == null) {
		attrs = {}
	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
		attrs = {}
		start = this
	}

	if (arguments.length === start + 1) {
		children = arguments[start]
		if (!Array.isArray(children)) children = [children]
	} else {
		children = []
		while (start < arguments.length) children.push(arguments[start++])
	}

	return Vnode("", attrs.key, attrs, children)
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js"}],"../node_modules/mithril/render/hyperscript.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")
var hyperscriptVnode = require("./hyperscriptVnode")

var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
var selectorCache = {}
var hasOwn = {}.hasOwnProperty

function isEmpty(object) {
	for (var key in object) if (hasOwn.call(object, key)) return false
	return true
}

function compileSelector(selector) {
	var match, tag = "div", classes = [], attrs = {}
	while (match = selectorParser.exec(selector)) {
		var type = match[1], value = match[2]
		if (type === "" && value !== "") tag = value
		else if (type === "#") attrs.id = value
		else if (type === ".") classes.push(value)
		else if (match[3][0] === "[") {
			var attrValue = match[6]
			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
			if (match[4] === "class") classes.push(attrValue)
			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
		}
	}
	if (classes.length > 0) attrs.className = classes.join(" ")
	return selectorCache[selector] = {tag: tag, attrs: attrs}
}

function execSelector(state, vnode) {
	var attrs = vnode.attrs
	var children = Vnode.normalizeChildren(vnode.children)
	var hasClass = hasOwn.call(attrs, "class")
	var className = hasClass ? attrs.class : attrs.className

	vnode.tag = state.tag
	vnode.attrs = null
	vnode.children = undefined

	if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
		var newAttrs = {}

		for (var key in attrs) {
			if (hasOwn.call(attrs, key)) newAttrs[key] = attrs[key]
		}

		attrs = newAttrs
	}

	for (var key in state.attrs) {
		if (hasOwn.call(state.attrs, key) && key !== "className" && !hasOwn.call(attrs, key)){
			attrs[key] = state.attrs[key]
		}
	}
	if (className != null || state.attrs.className != null) attrs.className =
		className != null
			? state.attrs.className != null
				? String(state.attrs.className) + " " + String(className)
				: className
			: state.attrs.className != null
				? state.attrs.className
				: null

	if (hasClass) attrs.class = null

	for (var key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			vnode.attrs = attrs
			break
		}
	}

	if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
		vnode.text = children[0].children
	} else {
		vnode.children = children
	}

	return vnode
}

function hyperscript(selector) {
	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}

	var vnode = hyperscriptVnode.apply(1, arguments)

	if (typeof selector === "string") {
		vnode.children = Vnode.normalizeChildren(vnode.children)
		if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode)
	}

	vnode.tag = selector
	return vnode
}

module.exports = hyperscript

},{"../render/vnode":"../node_modules/mithril/render/vnode.js","./hyperscriptVnode":"../node_modules/mithril/render/hyperscriptVnode.js"}],"../node_modules/mithril/render/trust.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

module.exports = function(html) {
	if (html == null) html = ""
	return Vnode("<", undefined, undefined, html, undefined, undefined)
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js"}],"../node_modules/mithril/render/fragment.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")
var hyperscriptVnode = require("./hyperscriptVnode")

module.exports = function() {
	var vnode = hyperscriptVnode.apply(0, arguments)

	vnode.tag = "["
	vnode.children = Vnode.normalizeChildren(vnode.children)
	return vnode
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js","./hyperscriptVnode":"../node_modules/mithril/render/hyperscriptVnode.js"}],"../node_modules/mithril/hyperscript.js":[function(require,module,exports) {
"use strict"

var hyperscript = require("./render/hyperscript")

hyperscript.trust = require("./render/trust")
hyperscript.fragment = require("./render/fragment")

module.exports = hyperscript

},{"./render/hyperscript":"../node_modules/mithril/render/hyperscript.js","./render/trust":"../node_modules/mithril/render/trust.js","./render/fragment":"../node_modules/mithril/render/fragment.js"}],"../node_modules/mithril/promise/polyfill.js":[function(require,module,exports) {
"use strict"
/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
	if (typeof executor !== "function") throw new TypeError("executor must be a function")

	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false)
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors}
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
					executeOnce(then.bind(value))
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value)
						for (var i = 0; i < list.length; i++) list[i](value)
						resolvers.length = 0, rejectors.length = 0
						instance.state = shouldAbsorb
						instance.retry = function() {execute(value)}
					})
				}
			}
			catch (e) {
				rejectCurrent(e)
			}
		}
	}
	function executeOnce(then) {
		var runs = 0
		function run(fn) {
			return function(value) {
				if (runs++ > 0) return
				fn(value)
			}
		}
		var onerror = run(rejectCurrent)
		try {then(run(resolveCurrent), onerror)} catch (e) {onerror(e)}
	}

	executeOnce(executor)
}
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") next(value)
			else try {resolveNext(callback(value))} catch (e) {if (rejectNext) rejectNext(e)}
		})
		if (typeof instance.retry === "function" && state === instance.state) instance.retry()
	}
	var resolveNext, rejectNext
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject})
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false)
	return promise
}
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
}
PromisePolyfill.prototype.finally = function(callback) {
	return this.then(
		function(value) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return value
			})
		},
		function(reason) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return PromisePolyfill.reject(reason);
			})
		}
	)
}
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) return value
	return new PromisePolyfill(function(resolve) {resolve(value)})
}
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value)})
}
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = []
		if (list.length === 0) resolve([])
		else for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++
					values[i] = value
					if (count === total) resolve(values)
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject)
				}
				else consume(list[i])
			})(i)
		}
	})
}
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject)
		}
	})
}

module.exports = PromisePolyfill

},{}],"../node_modules/mithril/promise/promise.js":[function(require,module,exports) {
var global = arguments[3];
"use strict"

var PromisePolyfill = require("./polyfill")

if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") {
		window.Promise = PromisePolyfill
	} else if (!window.Promise.prototype.finally) {
		window.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = window.Promise
} else if (typeof global !== "undefined") {
	if (typeof global.Promise === "undefined") {
		global.Promise = PromisePolyfill
	} else if (!global.Promise.prototype.finally) {
		global.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = global.Promise
} else {
	module.exports = PromisePolyfill
}

},{"./polyfill":"../node_modules/mithril/promise/polyfill.js"}],"../node_modules/mithril/render/render.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

module.exports = function($window) {
	var $doc = $window && $window.document
	var currentRedraw

	var nameSpace = {
		svg: "http://www.w3.org/2000/svg",
		math: "http://www.w3.org/1998/Math/MathML"
	}

	function getNameSpace(vnode) {
		return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
	}

	//sanity check to discourage people from doing `vnode.state = ...`
	function checkState(vnode, original) {
		if (vnode.state !== original) throw new Error("`vnode.state` must not be modified")
	}

	//Note: the hook is passed as the `this` argument to allow proxying the
	//arguments without requiring a full array allocation to do so. It also
	//takes advantage of the fact the current `vnode` is the first argument in
	//all lifecycle methods.
	function callHook(vnode) {
		var original = vnode.state
		try {
			return this.apply(original, arguments)
		} finally {
			checkState(vnode, original)
		}
	}

	// IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
	// inside an iframe. Catch and swallow this error, and heavy-handidly return null.
	function activeElement() {
		try {
			return $doc.activeElement
		} catch (e) {
			return null
		}
	}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				createNode(parent, vnode, hooks, ns, nextSibling)
			}
		}
	}
	function createNode(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		if (typeof tag === "string") {
			vnode.state = {}
			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
			switch (tag) {
				case "#": createText(parent, vnode, nextSibling); break
				case "<": createHTML(parent, vnode, ns, nextSibling); break
				case "[": createFragment(parent, vnode, hooks, ns, nextSibling); break
				default: createElement(parent, vnode, hooks, ns, nextSibling)
			}
		}
		else createComponent(parent, vnode, hooks, ns, nextSibling)
	}
	function createText(parent, vnode, nextSibling) {
		vnode.dom = $doc.createTextNode(vnode.children)
		insertNode(parent, vnode.dom, nextSibling)
	}
	var possibleParents = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}
	function createHTML(parent, vnode, ns, nextSibling) {
		var match = vnode.children.match(/^\s*?<(\w+)/im) || []
		// not using the proper parent makes the child element(s) vanish.
		//     var div = document.createElement("div")
		//     div.innerHTML = "<td>i</td><td>j</td>"
		//     console.log(div.innerHTML)
		// --> "ij", no <td> in sight.
		var temp = $doc.createElement(possibleParents[match[1]] || "div")
		if (ns === "http://www.w3.org/2000/svg") {
			temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode.children + "</svg>"
			temp = temp.firstChild
		} else {
			temp.innerHTML = vnode.children
		}
		vnode.dom = temp.firstChild
		vnode.domSize = temp.childNodes.length
		// Capture nodes to remove, so we don't confuse them.
		vnode.instance = []
		var fragment = $doc.createDocumentFragment()
		var child
		while (child = temp.firstChild) {
			vnode.instance.push(child)
			fragment.appendChild(child)
		}
		insertNode(parent, fragment, nextSibling)
	}
	function createFragment(parent, vnode, hooks, ns, nextSibling) {
		var fragment = $doc.createDocumentFragment()
		if (vnode.children != null) {
			var children = vnode.children
			createNodes(fragment, children, 0, children.length, hooks, null, ns)
		}
		vnode.dom = fragment.firstChild
		vnode.domSize = fragment.childNodes.length
		insertNode(parent, fragment, nextSibling)
	}
	function createElement(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		var attrs = vnode.attrs
		var is = attrs && attrs.is

		ns = getNameSpace(vnode) || ns

		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag)
		vnode.dom = element

		if (attrs != null) {
			setAttrs(vnode, attrs, ns)
		}

		insertNode(parent, element, nextSibling)

		if (!maybeSetContentEditable(vnode)) {
			if (vnode.text != null) {
				if (vnode.text !== "") element.textContent = vnode.text
				else vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
			}
			if (vnode.children != null) {
				var children = vnode.children
				createNodes(element, children, 0, children.length, hooks, null, ns)
				if (vnode.tag === "select" && attrs != null) setLateSelectAttrs(vnode, attrs)
			}
		}
	}
	function initComponent(vnode, hooks) {
		var sentinel
		if (typeof vnode.tag.view === "function") {
			vnode.state = Object.create(vnode.tag)
			sentinel = vnode.state.view
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
		} else {
			vnode.state = void 0
			sentinel = vnode.tag
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
			vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode)
		}
		initLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		sentinel.$$reentrantLock$$ = null
	}
	function createComponent(parent, vnode, hooks, ns, nextSibling) {
		initComponent(vnode, hooks)
		if (vnode.instance != null) {
			createNode(parent, vnode.instance, hooks, ns, nextSibling)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0
		}
		else {
			vnode.domSize = 0
		}
	}

	//update
	/**
	 * @param {Element|Fragment} parent - the parent element
	 * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
	 *                               this part of the tree
	 * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
	 * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
	 * @param {Element | null} nextSibling - the next DOM node if we're dealing with a
	 *                                       fragment that is not the last item in its
	 *                                       parent
	 * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
	 * @returns void
	 */
	// This function diffs and patches lists of vnodes, both keyed and unkeyed.
	//
	// We will:
	//
	// 1. describe its general structure
	// 2. focus on the diff algorithm optimizations
	// 3. discuss DOM node operations.

	// ## Overview:
	//
	// The updateNodes() function:
	// - deals with trivial cases
	// - determines whether the lists are keyed or unkeyed based on the first non-null node
	//   of each list.
	// - diffs them and patches the DOM if needed (that's the brunt of the code)
	// - manages the leftovers: after diffing, are there:
	//   - old nodes left to remove?
	// 	 - new nodes to insert?
	// 	 deal with them!
	//
	// The lists are only iterated over once, with an exception for the nodes in `old` that
	// are visited in the fourth part of the diff and in the `removeNodes` loop.

	// ## Diffing
	//
	// Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
	// may be good for context on longest increasing subsequence-based logic for moving nodes.
	//
	// In order to diff keyed lists, one has to
	//
	// 1) match nodes in both lists, per key, and update them accordingly
	// 2) create the nodes present in the new list, but absent in the old one
	// 3) remove the nodes present in the old list, but absent in the new one
	// 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
	//
	// To achieve 1) one can create a dictionary of keys => index (for the old list), then iterate
	// over the new list and for each new vnode, find the corresponding vnode in the old list using
	// the map.
	// 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
	// and must be created.
	// For the removals, we actually remove the nodes that have been updated from the old list.
	// The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
	// The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
	// algorithm.
	//
	// the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
	// from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
	// corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
	//  match the above lists, for example).
	//
	// In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
	// can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
	//
	// @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
	// the longest increasing subsequence *of old nodes still present in the new list*).
	//
	// It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
	// and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
	// the `LIS` and a temporary one to create the LIS).
	//
	// So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
	// the LIS and can be updated without moving them.
	//
	// If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
	// the exception of the last node if the list is fully reversed).
	//
	// ## Finding the next sibling.
	//
	// `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
	// When the list is being traversed top-down, at any index, the DOM nodes up to the previous
	// vnode reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
	// list. The next sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
	//
	// In the other scenarios (swaps, upwards traversal, map-based diff),
	// the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
	// bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
	// as the next sibling (cached in the `nextSibling` variable).


	// ## DOM node moves
	//
	// In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
	// this is not the case if the node moved (second and fourth part of the diff algo). We move
	// the old DOM nodes before updateNode runs because it enables us to use the cached `nextSibling`
	// variable rather than fetching it using `getNextSibling()`.
	//
	// The fourth part of the diff currently inserts nodes unconditionally, leading to issues
	// like #1791 and #1999. We need to be smarter about those situations where adjascent old
	// nodes remain together in the new list in a way that isn't covered by parts one and
	// three of the diff algo.

	function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) return
		else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
		else if (vnodes == null || vnodes.length === 0) removeNodes(parent, old, 0, old.length)
		else {
			var isOldKeyed = old[0] != null && old[0].key != null
			var isKeyed = vnodes[0] != null && vnodes[0].key != null
			var start = 0, oldStart = 0
			if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++
			if (!isKeyed) while (start < vnodes.length && vnodes[start] == null) start++
			if (isKeyed === null && isOldKeyed == null) return // both lists are full of nulls
			if (isOldKeyed !== isKeyed) {
				removeNodes(parent, old, oldStart, old.length)
				createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else if (!isKeyed) {
				// Don't index past the end of either list (causes deopts).
				var commonLength = old.length < vnodes.length ? old.length : vnodes.length
				// Rewind if necessary to the first non-null index on either side.
				// We could alternatively either explicitly create or remove nodes when `start !== oldStart`
				// but that would be optimizing for sparse lists which are more rare than dense ones.
				start = start < oldStart ? start : oldStart
				for (; start < commonLength; start++) {
					o = old[start]
					v = vnodes[start]
					if (o === v || o == null && v == null) continue
					else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling))
					else if (v == null) removeNode(parent, o)
					else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns)
				}
				if (old.length > commonLength) removeNodes(parent, old, start, old.length)
				if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else {
				// keyed diff
				var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling

				// bottom-up
				while (oldEnd >= oldStart && end >= start) {
					oe = old[oldEnd]
					ve = vnodes[end]
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
				}
				// top-down
				while (oldEnd >= oldStart && end >= start) {
					o = old[oldStart]
					v = vnodes[start]
					if (o.key !== v.key) break
					oldStart++, start++
					if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns)
				}
				// swaps and list reversals
				while (oldEnd >= oldStart && end >= start) {
					if (start === end) break
					if (o.key !== ve.key || oe.key !== v.key) break
					topSibling = getNextSibling(old, oldStart, nextSibling)
					moveNodes(parent, oe, topSibling)
					if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns)
					if (++start <= --end) moveNodes(parent, o, nextSibling)
					if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldStart++; oldEnd--
					oe = old[oldEnd]
					ve = vnodes[end]
					o = old[oldStart]
					v = vnodes[start]
				}
				// bottom up once again
				while (oldEnd >= oldStart && end >= start) {
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
					oe = old[oldEnd]
					ve = vnodes[end]
				}
				if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1)
				else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
				else {
					// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
					var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices
					for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1
					for (i = end; i >= start; i--) {
						if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1)
						ve = vnodes[i]
						var oldIndex = map[ve.key]
						if (oldIndex != null) {
							pos = (oldIndex < pos) ? oldIndex : -1 // becomes -1 if nodes were re-ordered
							oldIndices[i-start] = oldIndex
							oe = old[oldIndex]
							old[oldIndex] = null
							if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
							if (ve.dom != null) nextSibling = ve.dom
							matched++
						}
					}
					nextSibling = originalNextSibling
					if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1)
					if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
					else {
						if (pos === -1) {
							// the indices of the indices of the items that are part of the
							// longest increasing subsequence in the oldIndices list
							lisIndices = makeLisIndices(oldIndices)
							li = lisIndices.length - 1
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								else {
									if (lisIndices[li] === i - start) li--
									else moveNodes(parent, v, nextSibling)
								}
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						} else {
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						}
					}
				}
			}
		}
	}
	function updateNode(parent, old, vnode, hooks, nextSibling, ns) {
		var oldTag = old.tag, tag = vnode.tag
		if (oldTag === tag) {
			vnode.state = old.state
			vnode.events = old.events
			if (shouldNotUpdate(vnode, old)) return
			if (typeof oldTag === "string") {
				if (vnode.attrs != null) {
					updateLifecycle(vnode.attrs, vnode, hooks)
				}
				switch (oldTag) {
					case "#": updateText(old, vnode); break
					case "<": updateHTML(parent, old, vnode, ns, nextSibling); break
					case "[": updateFragment(parent, old, vnode, hooks, nextSibling, ns); break
					default: updateElement(old, vnode, hooks, ns)
				}
			}
			else updateComponent(parent, old, vnode, hooks, nextSibling, ns)
		}
		else {
			removeNode(parent, old)
			createNode(parent, vnode, hooks, ns, nextSibling)
		}
	}
	function updateText(old, vnode) {
		if (old.children.toString() !== vnode.children.toString()) {
			old.dom.nodeValue = vnode.children
		}
		vnode.dom = old.dom
	}
	function updateHTML(parent, old, vnode, ns, nextSibling) {
		if (old.children !== vnode.children) {
			removeHTML(parent, old)
			createHTML(parent, vnode, ns, nextSibling)
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
			vnode.instance = old.instance
		}
	}
	function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns)
		var domSize = 0, children = vnode.children
		vnode.dom = null
		if (children != null) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i]
				if (child != null && child.dom != null) {
					if (vnode.dom == null) vnode.dom = child.dom
					domSize += child.domSize || 1
				}
			}
			if (domSize !== 1) vnode.domSize = domSize
		}
	}
	function updateElement(old, vnode, hooks, ns) {
		var element = vnode.dom = old.dom
		ns = getNameSpace(vnode) || ns

		if (vnode.tag === "textarea") {
			if (vnode.attrs == null) vnode.attrs = {}
			if (vnode.text != null) {
				vnode.attrs.value = vnode.text //FIXME handle multiple children
				vnode.text = undefined
			}
		}
		updateAttrs(vnode, old.attrs, vnode.attrs, ns)
		if (!maybeSetContentEditable(vnode)) {
			if (old.text != null && vnode.text != null && vnode.text !== "") {
				if (old.text.toString() !== vnode.text.toString()) old.dom.firstChild.nodeValue = vnode.text
			}
			else {
				if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]
				if (vnode.text != null) vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
				updateNodes(element, old.children, vnode.children, hooks, null, ns)
			}
		}
	}
	function updateComponent(parent, old, vnode, hooks, nextSibling, ns) {
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		updateLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
		if (vnode.instance != null) {
			if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling)
			else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.instance.domSize
		}
		else if (old.instance != null) {
			removeNode(parent, old.instance)
			vnode.dom = undefined
			vnode.domSize = 0
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
		}
	}
	function getKeyMap(vnodes, start, end) {
		var map = Object.create(null)
		for (; start < end; start++) {
			var vnode = vnodes[start]
			if (vnode != null) {
				var key = vnode.key
				if (key != null) map[key] = start
			}
		}
		return map
	}
	// Lifted from ivi https://github.com/ivijs/ivi/
	// takes a list of unique numbers (-1 is special and can
	// occur multiple times) and returns an array with the indices
	// of the items that are part of the longest increasing
	// subsequece
	var lisTemp = []
	function makeLisIndices(a) {
		var result = [0]
		var u = 0, v = 0, i = 0
		var il = lisTemp.length = a.length
		for (var i = 0; i < il; i++) lisTemp[i] = a[i]
		for (var i = 0; i < il; ++i) {
			if (a[i] === -1) continue
			var j = result[result.length - 1]
			if (a[j] < a[i]) {
				lisTemp[i] = j
				result.push(i)
				continue
			}
			u = 0
			v = result.length - 1
			while (u < v) {
				// Fast integer average without overflow.
				// eslint-disable-next-line no-bitwise
				var c = (u >>> 1) + (v >>> 1) + (u & v & 1)
				if (a[result[c]] < a[i]) {
					u = c + 1
				}
				else {
					v = c
				}
			}
			if (a[i] < a[result[u]]) {
				if (u > 0) lisTemp[i] = result[u - 1]
				result[u] = i
			}
		}
		u = result.length
		v = result[u - 1]
		while (u-- > 0) {
			result[u] = v
			v = lisTemp[v]
		}
		lisTemp.length = 0
		return result
	}

	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
		}
		return nextSibling
	}

	// This covers a really specific edge case:
	// - Parent node is keyed and contains child
	// - Child is removed, returns unresolved promise in `onbeforeremove`
	// - Parent node is moved in keyed diff
	// - Remaining children still need moved appropriately
	//
	// Ideally, I'd track removed nodes as well, but that introduces a lot more
	// complexity and I'm not exactly interested in doing that.
	function moveNodes(parent, vnode, nextSibling) {
		var frag = $doc.createDocumentFragment()
		moveChildToFrag(parent, frag, vnode)
		insertNode(parent, frag, nextSibling)
	}
	function moveChildToFrag(parent, frag, vnode) {
		// Dodge the recursion overhead in a few of the most common cases.
		while (vnode.dom != null && vnode.dom.parentNode === parent) {
			if (typeof vnode.tag !== "string") {
				vnode = vnode.instance
				if (vnode != null) continue
			} else if (vnode.tag === "<") {
				for (var i = 0; i < vnode.instance.length; i++) {
					frag.appendChild(vnode.instance[i])
				}
			} else if (vnode.tag !== "[") {
				// Don't recurse for text nodes *or* elements, just fragments
				frag.appendChild(vnode.dom)
			} else if (vnode.children.length === 1) {
				vnode = vnode.children[0]
				if (vnode != null) continue
			} else {
				for (var i = 0; i < vnode.children.length; i++) {
					var child = vnode.children[i]
					if (child != null) moveChildToFrag(parent, frag, child)
				}
			}
			break
		}
	}

	function insertNode(parent, dom, nextSibling) {
		if (nextSibling != null) parent.insertBefore(dom, nextSibling)
		else parent.appendChild(dom)
	}

	function maybeSetContentEditable(vnode) {
		if (vnode.attrs == null || (
			vnode.attrs.contenteditable == null && // attribute
			vnode.attrs.contentEditable == null // property
		)) return false
		var children = vnode.children
		if (children != null && children.length === 1 && children[0].tag === "<") {
			var content = children[0].children
			if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
		}
		else if (vnode.text != null || children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
		return true
	}

	//remove
	function removeNodes(parent, vnodes, start, end) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) removeNode(parent, vnode)
		}
	}
	function removeNode(parent, vnode) {
		var mask = 0
		var original = vnode.state
		var stateResult, attrsResult
		if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function") {
			var result = callHook.call(vnode.state.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				mask = 1
				stateResult = result
			}
		}
		if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
			var result = callHook.call(vnode.attrs.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				// eslint-disable-next-line no-bitwise
				mask |= 2
				attrsResult = result
			}
		}
		checkState(vnode, original)

		// If we can, try to fast-path it and avoid all the overhead of awaiting
		if (!mask) {
			onremove(vnode)
			removeChild(parent, vnode)
		} else {
			if (stateResult != null) {
				var next = function () {
					// eslint-disable-next-line no-bitwise
					if (mask & 1) { mask &= 2; if (!mask) reallyRemove() }
				}
				stateResult.then(next, next)
			}
			if (attrsResult != null) {
				var next = function () {
					// eslint-disable-next-line no-bitwise
					if (mask & 2) { mask &= 1; if (!mask) reallyRemove() }
				}
				attrsResult.then(next, next)
			}
		}

		function reallyRemove() {
			checkState(vnode, original)
			onremove(vnode)
			removeChild(parent, vnode)
		}
	}
	function removeHTML(parent, vnode) {
		for (var i = 0; i < vnode.instance.length; i++) {
			parent.removeChild(vnode.instance[i])
		}
	}
	function removeChild(parent, vnode) {
		// Dodge the recursion overhead in a few of the most common cases.
		while (vnode.dom != null && vnode.dom.parentNode === parent) {
			if (typeof vnode.tag !== "string") {
				vnode = vnode.instance
				if (vnode != null) continue
			} else if (vnode.tag === "<") {
				removeHTML(parent, vnode)
			} else {
				if (vnode.tag !== "[") {
					parent.removeChild(vnode.dom)
					if (!Array.isArray(vnode.children)) break
				}
				if (vnode.children.length === 1) {
					vnode = vnode.children[0]
					if (vnode != null) continue
				} else {
					for (var i = 0; i < vnode.children.length; i++) {
						var child = vnode.children[i]
						if (child != null) removeChild(parent, child)
					}
				}
			}
			break
		}
	}
	function onremove(vnode) {
		if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function") callHook.call(vnode.state.onremove, vnode)
		if (vnode.attrs && typeof vnode.attrs.onremove === "function") callHook.call(vnode.attrs.onremove, vnode)
		if (typeof vnode.tag !== "string") {
			if (vnode.instance != null) onremove(vnode.instance)
		} else {
			var children = vnode.children
			if (Array.isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i]
					if (child != null) onremove(child)
				}
			}
		}
	}

	//attrs
	function setAttrs(vnode, attrs, ns) {
		for (var key in attrs) {
			setAttr(vnode, key, null, attrs[key], ns)
		}
	}
	function setAttr(vnode, key, old, value, ns) {
		if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode, key)) && typeof value !== "object") return
		if (key[0] === "o" && key[1] === "n") return updateEvent(vnode, key, value)
		if (key.slice(0, 6) === "xlink:") vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value)
		else if (key === "style") updateStyle(vnode.dom, old, value)
		else if (hasPropertyKey(vnode, key, ns)) {
			if (key === "value") {
				// Only do the coercion if we're actually going to check the value.
				/* eslint-disable no-implicit-coercion */
				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
				if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value && vnode.dom === activeElement()) return
				//setting select[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value) return
				//setting option[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value) return
				/* eslint-enable no-implicit-coercion */
			}
			// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
			if (vnode.tag === "input" && key === "type") vnode.dom.setAttribute(key, value)
			else vnode.dom[key] = value
		} else {
			if (typeof value === "boolean") {
				if (value) vnode.dom.setAttribute(key, "")
				else vnode.dom.removeAttribute(key)
			}
			else vnode.dom.setAttribute(key === "className" ? "class" : key, value)
		}
	}
	function removeAttr(vnode, key, old, ns) {
		if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
		if (key[0] === "o" && key[1] === "n" && !isLifecycleMethod(key)) updateEvent(vnode, key, undefined)
		else if (key === "style") updateStyle(vnode.dom, old, null)
		else if (
			hasPropertyKey(vnode, key, ns)
			&& key !== "className"
			&& !(key === "value" && (
				vnode.tag === "option"
				|| vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement()
			))
			&& !(vnode.tag === "input" && key === "type")
		) {
			vnode.dom[key] = null
		} else {
			var nsLastIndex = key.indexOf(":")
			if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1)
			if (old !== false) vnode.dom.removeAttribute(key === "className" ? "class" : key)
		}
	}
	function setLateSelectAttrs(vnode, attrs) {
		if ("value" in attrs) {
			if(attrs.value === null) {
				if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null
			} else {
				var normalized = "" + attrs.value // eslint-disable-line no-implicit-coercion
				if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
					vnode.dom.value = normalized
				}
			}
		}
		if ("selectedIndex" in attrs) setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined)
	}
	function updateAttrs(vnode, old, attrs, ns) {
		if (attrs != null) {
			for (var key in attrs) {
				setAttr(vnode, key, old && old[key], attrs[key], ns)
			}
		}
		var val
		if (old != null) {
			for (var key in old) {
				if (((val = old[key]) != null) && (attrs == null || attrs[key] == null)) {
					removeAttr(vnode, key, val, ns)
				}
			}
		}
	}
	function isFormAttribute(vnode, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === activeElement() || vnode.tag === "option" && vnode.dom.parentNode === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function hasPropertyKey(vnode, key, ns) {
		// Filter out namespaced keys
		return ns === undefined && (
			// If it's a custom element, just keep it.
			vnode.tag.indexOf("-") > -1 || vnode.attrs != null && vnode.attrs.is ||
			// If it's a normal element, let's try to avoid a few browser bugs.
			key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
			// Defer the property check until *after* we check everything.
		) && key in vnode.dom
	}

	//style
	var uppercaseRegex = /[A-Z]/g
	function toLowerCase(capital) { return "-" + capital.toLowerCase() }
	function normalizeKey(key) {
		return key[0] === "-" && key[1] === "-" ? key :
			key === "cssFloat" ? "float" :
				key.replace(uppercaseRegex, toLowerCase)
	}
	function updateStyle(element, old, style) {
		if (old === style) {
			// Styles are equivalent, do nothing.
		} else if (style == null) {
			// New style is missing, just clear it.
			element.style.cssText = ""
		} else if (typeof style !== "object") {
			// New style is a string, let engine deal with patching.
			element.style.cssText = style
		} else if (old == null || typeof old !== "object") {
			// `old` is missing or a string, `style` is an object.
			element.style.cssText = ""
			// Add new style properties
			for (var key in style) {
				var value = style[key]
				if (value != null) element.style.setProperty(normalizeKey(key), String(value))
			}
		} else {
			// Both old & new are (different) objects.
			// Update style properties that have changed
			for (var key in style) {
				var value = style[key]
				if (value != null && (value = String(value)) !== String(old[key])) {
					element.style.setProperty(normalizeKey(key), value)
				}
			}
			// Remove style properties that no longer exist
			for (var key in old) {
				if (old[key] != null && style[key] == null) {
					element.style.removeProperty(normalizeKey(key))
				}
			}
		}
	}

	// Here's an explanation of how this works:
	// 1. The event names are always (by design) prefixed by `on`.
	// 2. The EventListener interface accepts either a function or an object
	//    with a `handleEvent` method.
	// 3. The object does not inherit from `Object.prototype`, to avoid
	//    any potential interference with that (e.g. setters).
	// 4. The event name is remapped to the handler before calling it.
	// 5. In function-based event handlers, `ev.target === this`. We replicate
	//    that below.
	// 6. In function-based event handlers, `return false` prevents the default
	//    action and stops event propagation. We replicate that below.
	function EventDict() {
		// Save this, so the current redraw is correctly tracked.
		this._ = currentRedraw
	}
	EventDict.prototype = Object.create(null)
	EventDict.prototype.handleEvent = function (ev) {
		var handler = this["on" + ev.type]
		var result
		if (typeof handler === "function") result = handler.call(ev.currentTarget, ev)
		else if (typeof handler.handleEvent === "function") handler.handleEvent(ev)
		if (this._ && ev.redraw !== false) (0, this._)()
		if (result === false) {
			ev.preventDefault()
			ev.stopPropagation()
		}
	}

	//event
	function updateEvent(vnode, key, value) {
		if (vnode.events != null) {
			if (vnode.events[key] === value) return
			if (value != null && (typeof value === "function" || typeof value === "object")) {
				if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = value
			} else {
				if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = undefined
			}
		} else if (value != null && (typeof value === "function" || typeof value === "object")) {
			vnode.events = new EventDict()
			vnode.dom.addEventListener(key.slice(2), vnode.events, false)
			vnode.events[key] = value
		}
	}

	//lifecycle
	function initLifecycle(source, vnode, hooks) {
		if (typeof source.oninit === "function") callHook.call(source.oninit, vnode)
		if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode))
	}
	function updateLifecycle(source, vnode, hooks) {
		if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode))
	}
	function shouldNotUpdate(vnode, old) {
		do {
			if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
				var force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
				var force = callHook.call(vnode.state.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			return false
		} while (false); // eslint-disable-line no-constant-condition
		vnode.dom = old.dom
		vnode.domSize = old.domSize
		vnode.instance = old.instance
		// One would think having the actual latest attributes would be ideal,
		// but it doesn't let us properly diff based on our current internal
		// representation. We have to save not only the old DOM info, but also
		// the attributes used to create it, as we diff *that*, not against the
		// DOM directly (with a few exceptions in `setAttr`). And, of course, we
		// need to save the children and text as they are conceptually not
		// unlike special "attributes" internally.
		vnode.attrs = old.attrs
		vnode.children = old.children
		vnode.text = old.text
		return true
	}

	return function(dom, vnodes, redraw) {
		if (!dom) throw new TypeError("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
		var hooks = []
		var active = activeElement()
		var namespace = dom.namespaceURI

		// First time rendering into a node clears it out
		if (dom.vnodes == null) dom.textContent = ""

		vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes])
		var prevRedraw = currentRedraw
		try {
			currentRedraw = typeof redraw === "function" ? redraw : undefined
			updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace)
		} finally {
			currentRedraw = prevRedraw
		}
		dom.vnodes = vnodes
		// `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
		if (active != null && activeElement() !== active && typeof active.focus === "function") active.focus()
		for (var i = 0; i < hooks.length; i++) hooks[i]()
	}
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js"}],"../node_modules/mithril/render.js":[function(require,module,exports) {
"use strict"

module.exports = require("./render/render")(window)

},{"./render/render":"../node_modules/mithril/render/render.js"}],"../node_modules/mithril/api/mount-redraw.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

module.exports = function(render, schedule, console) {
	var subscriptions = []
	var rendering = false
	var pending = false

	function sync() {
		if (rendering) throw new Error("Nested m.redraw.sync() call")
		rendering = true
		for (var i = 0; i < subscriptions.length; i += 2) {
			try { render(subscriptions[i], Vnode(subscriptions[i + 1]), redraw) }
			catch (e) { console.error(e) }
		}
		rendering = false
	}

	function redraw() {
		if (!pending) {
			pending = true
			schedule(function() {
				pending = false
				sync()
			})
		}
	}

	redraw.sync = sync

	function mount(root, component) {
		if (component != null && component.view == null && typeof component !== "function") {
			throw new TypeError("m.mount(element, component) expects a component, not a vnode")
		}

		var index = subscriptions.indexOf(root)
		if (index >= 0) {
			subscriptions.splice(index, 2)
			render(root, [], redraw)
		}

		if (component != null) {
			subscriptions.push(root, component)
			render(root, Vnode(component), redraw)
		}
	}

	return {mount: mount, redraw: redraw}
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js"}],"../node_modules/mithril/mount-redraw.js":[function(require,module,exports) {
"use strict"

var render = require("./render")

module.exports = require("./api/mount-redraw")(render, requestAnimationFrame, console)

},{"./render":"../node_modules/mithril/render.js","./api/mount-redraw":"../node_modules/mithril/api/mount-redraw.js"}],"../node_modules/mithril/querystring/build.js":[function(require,module,exports) {
"use strict"

module.exports = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") return ""

	var args = []
	for (var key in object) {
		destructure(key, object[key])
	}

	return args.join("&")

	function destructure(key, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
	}
}

},{}],"../node_modules/mithril/pathname/assign.js":[function(require,module,exports) {
"use strict"

module.exports = Object.assign || function(target, source) {
	if(source) Object.keys(source).forEach(function(key) { target[key] = source[key] })
}

},{}],"../node_modules/mithril/pathname/build.js":[function(require,module,exports) {
"use strict"

var buildQueryString = require("../querystring/build")
var assign = require("./assign")

// Returns `path` from `template` + `params`
module.exports = function(template, params) {
	if ((/:([^\/\.-]+)(\.{3})?:/).test(template)) {
		throw new SyntaxError("Template parameter names *must* be separated")
	}
	if (params == null) return template
	var queryIndex = template.indexOf("?")
	var hashIndex = template.indexOf("#")
	var queryEnd = hashIndex < 0 ? template.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = template.slice(0, pathEnd)
	var query = {}

	assign(query, params)

	var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
		delete query[key]
		// If no such parameter exists, don't interpolate it.
		if (params[key] == null) return m
		// Escape normal parameters, but not variadic ones.
		return variadic ? params[key] : encodeURIComponent(String(params[key]))
	})

	// In case the template substitution adds new query/hash parameters.
	var newQueryIndex = resolved.indexOf("?")
	var newHashIndex = resolved.indexOf("#")
	var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex
	var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex
	var result = resolved.slice(0, newPathEnd)

	if (queryIndex >= 0) result += template.slice(queryIndex, queryEnd)
	if (newQueryIndex >= 0) result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd)
	var querystring = buildQueryString(query)
	if (querystring) result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring
	if (hashIndex >= 0) result += template.slice(hashIndex)
	if (newHashIndex >= 0) result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex)
	return result
}

},{"../querystring/build":"../node_modules/mithril/querystring/build.js","./assign":"../node_modules/mithril/pathname/assign.js"}],"../node_modules/mithril/request/request.js":[function(require,module,exports) {
"use strict"

var buildPathname = require("../pathname/build")

module.exports = function($window, Promise, oncompletion) {
	var callbackCount = 0

	function PromiseProxy(executor) {
		return new Promise(executor)
	}

	// In case the global Promise is some userland library's where they rely on
	// `foo instanceof this.constructor`, `this.constructor.resolve(value)`, or
	// similar. Let's *not* break them.
	PromiseProxy.prototype = Promise.prototype
	PromiseProxy.__proto__ = Promise // eslint-disable-line no-proto

	function makeRequest(factory) {
		return function(url, args) {
			if (typeof url !== "string") { args = url; url = url.url }
			else if (args == null) args = {}
			var promise = new Promise(function(resolve, reject) {
				factory(buildPathname(url, args.params), args, function (data) {
					if (typeof args.type === "function") {
						if (Array.isArray(data)) {
							for (var i = 0; i < data.length; i++) {
								data[i] = new args.type(data[i])
							}
						}
						else data = new args.type(data)
					}
					resolve(data)
				}, reject)
			})
			if (args.background === true) return promise
			var count = 0
			function complete() {
				if (--count === 0 && typeof oncompletion === "function") oncompletion()
			}

			return wrap(promise)

			function wrap(promise) {
				var then = promise.then
				// Set the constructor, so engines know to not await or resolve
				// this as a native promise. At the time of writing, this is
				// only necessary for V8, but their behavior is the correct
				// behavior per spec. See this spec issue for more details:
				// https://github.com/tc39/ecma262/issues/1577. Also, see the
				// corresponding comment in `request/tests/test-request.js` for
				// a bit more background on the issue at hand.
				promise.constructor = PromiseProxy
				promise.then = function() {
					count++
					var next = then.apply(promise, arguments)
					next.then(complete, function(e) {
						complete()
						if (count === 0) throw e
					})
					return wrap(next)
				}
				return promise
			}
		}
	}

	function hasHeader(args, name) {
		for (var key in args.headers) {
			if ({}.hasOwnProperty.call(args.headers, key) && name.test(key)) return true
		}
		return false
	}

	return {
		request: makeRequest(function(url, args, resolve, reject) {
			var method = args.method != null ? args.method.toUpperCase() : "GET"
			var body = args.body
			var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData)
			var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json")

			var xhr = new $window.XMLHttpRequest(), aborted = false
			var original = xhr, replacedAbort
			var abort = xhr.abort

			xhr.abort = function() {
				aborted = true
				abort.call(this)
			}

			xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)

			if (assumeJSON && body != null && !hasHeader(args, /^content-type$/i)) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (typeof args.deserialize !== "function" && !hasHeader(args, /^accept$/i)) {
				xhr.setRequestHeader("Accept", "application/json, text/*")
			}
			if (args.withCredentials) xhr.withCredentials = args.withCredentials
			if (args.timeout) xhr.timeout = args.timeout
			xhr.responseType = responseType

			for (var key in args.headers) {
				if ({}.hasOwnProperty.call(args.headers, key)) {
					xhr.setRequestHeader(key, args.headers[key])
				}
			}

			xhr.onreadystatechange = function(ev) {
				// Don't throw errors on xhr.abort().
				if (aborted) return

				if (ev.target.readyState === 4) {
					try {
						var success = (ev.target.status >= 200 && ev.target.status < 300) || ev.target.status === 304 || (/^file:\/\//i).test(url)
						// When the response type isn't "" or "text",
						// `xhr.responseText` is the wrong thing to use.
						// Browsers do the right thing and throw here, and we
						// should honor that and do the right thing by
						// preferring `xhr.response` where possible/practical.
						var response = ev.target.response, message

						if (responseType === "json") {
							// For IE and Edge, which don't implement
							// `responseType: "json"`.
							if (!ev.target.responseType && typeof args.extract !== "function") response = JSON.parse(ev.target.responseText)
						} else if (!responseType || responseType === "text") {
							// Only use this default if it's text. If a parsed
							// document is needed on old IE and friends (all
							// unsupported), the user should use a custom
							// `config` instead. They're already using this at
							// their own risk.
							if (response == null) response = ev.target.responseText
						}

						if (typeof args.extract === "function") {
							response = args.extract(ev.target, args)
							success = true
						} else if (typeof args.deserialize === "function") {
							response = args.deserialize(response)
						}
						if (success) resolve(response)
						else {
							try { message = ev.target.responseText }
							catch (e) { message = response }
							var error = new Error(message)
							error.code = ev.target.status
							error.response = response
							reject(error)
						}
					}
					catch (e) {
						reject(e)
					}
				}
			}

			if (typeof args.config === "function") {
				xhr = args.config(xhr, args, url) || xhr

				// Propagate the `abort` to any replacement XHR as well.
				if (xhr !== original) {
					replacedAbort = xhr.abort
					xhr.abort = function() {
						aborted = true
						replacedAbort.call(this)
					}
				}
			}

			if (body == null) xhr.send()
			else if (typeof args.serialize === "function") xhr.send(args.serialize(body))
			else if (body instanceof $window.FormData) xhr.send(body)
			else xhr.send(JSON.stringify(body))
		}),
		jsonp: makeRequest(function(url, args, resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
			var script = $window.document.createElement("script")
			$window[callbackName] = function(data) {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				resolve(data)
			}
			script.onerror = function() {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				reject(new Error("JSONP request failed"))
			}
			script.src = url + (url.indexOf("?") < 0 ? "?" : "&") +
				encodeURIComponent(args.callbackKey || "callback") + "=" +
				encodeURIComponent(callbackName)
			$window.document.documentElement.appendChild(script)
		}),
	}
}

},{"../pathname/build":"../node_modules/mithril/pathname/build.js"}],"../node_modules/mithril/request.js":[function(require,module,exports) {
"use strict"

var PromisePolyfill = require("./promise/promise")
var mountRedraw = require("./mount-redraw")

module.exports = require("./request/request")(window, PromisePolyfill, mountRedraw.redraw)

},{"./promise/promise":"../node_modules/mithril/promise/promise.js","./mount-redraw":"../node_modules/mithril/mount-redraw.js","./request/request":"../node_modules/mithril/request/request.js"}],"../node_modules/mithril/querystring/parse.js":[function(require,module,exports) {
"use strict"

module.exports = function(string) {
	if (string === "" || string == null) return {}
	if (string.charAt(0) === "?") string = string.slice(1)

	var entries = string.split("&"), counters = {}, data = {}
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=")
		var key = decodeURIComponent(entry[0])
		var value = entry.length === 2 ? decodeURIComponent(entry[1]) : ""

		if (value === "true") value = true
		else if (value === "false") value = false

		var levels = key.split(/\]\[?|\[/)
		var cursor = data
		if (key.indexOf("[") > -1) levels.pop()
		for (var j = 0; j < levels.length; j++) {
			var level = levels[j], nextLevel = levels[j + 1]
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
			if (level === "") {
				var key = levels.slice(0, j).join()
				if (counters[key] == null) {
					counters[key] = Array.isArray(cursor) ? cursor.length : 0
				}
				level = counters[key]++
			}
			// Disallow direct prototype pollution
			else if (level === "__proto__") break
			if (j === levels.length - 1) cursor[level] = value
			else {
				// Read own properties exclusively to disallow indirect
				// prototype pollution
				var desc = Object.getOwnPropertyDescriptor(cursor, level)
				if (desc != null) desc = desc.value
				if (desc == null) cursor[level] = desc = isNumber ? [] : {}
				cursor = desc
			}
		}
	}
	return data
}

},{}],"../node_modules/mithril/pathname/parse.js":[function(require,module,exports) {
"use strict"

var parseQueryString = require("../querystring/parse")

// Returns `{path, params}` from `url`
module.exports = function(url) {
	var queryIndex = url.indexOf("?")
	var hashIndex = url.indexOf("#")
	var queryEnd = hashIndex < 0 ? url.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/")

	if (!path) path = "/"
	else {
		if (path[0] !== "/") path = "/" + path
		if (path.length > 1 && path[path.length - 1] === "/") path = path.slice(0, -1)
	}
	return {
		path: path,
		params: queryIndex < 0
			? {}
			: parseQueryString(url.slice(queryIndex + 1, queryEnd)),
	}
}

},{"../querystring/parse":"../node_modules/mithril/querystring/parse.js"}],"../node_modules/mithril/pathname/compileTemplate.js":[function(require,module,exports) {
"use strict"

var parsePathname = require("./parse")

// Compiles a template into a function that takes a resolved path (without query
// strings) and returns an object containing the template parameters with their
// parsed values. This expects the input of the compiled template to be the
// output of `parsePathname`. Note that it does *not* remove query parameters
// specified in the template.
module.exports = function(template) {
	var templateData = parsePathname(template)
	var templateKeys = Object.keys(templateData.params)
	var keys = []
	var regexp = new RegExp("^" + templateData.path.replace(
		// I escape literal text so people can use things like `:file.:ext` or
		// `:lang-:locale` in routes. This is all merged into one pass so I
		// don't also accidentally escape `-` and make it harder to detect it to
		// ban it from template parameters.
		/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
		function(m, key, extra) {
			if (key == null) return "\\" + m
			keys.push({k: key, r: extra === "..."})
			if (extra === "...") return "(.*)"
			if (extra === ".") return "([^/]+)\\."
			return "([^/]+)" + (extra || "")
		}
	) + "$")
	return function(data) {
		// First, check the params. Usually, there isn't any, and it's just
		// checking a static set.
		for (var i = 0; i < templateKeys.length; i++) {
			if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]]) return false
		}
		// If no interpolations exist, let's skip all the ceremony
		if (!keys.length) return regexp.test(data.path)
		var values = regexp.exec(data.path)
		if (values == null) return false
		for (var i = 0; i < keys.length; i++) {
			data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1])
		}
		return true
	}
}

},{"./parse":"../node_modules/mithril/pathname/parse.js"}],"../node_modules/mithril/api/router.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")
var m = require("../render/hyperscript")
var Promise = require("../promise/promise")

var buildPathname = require("../pathname/build")
var parsePathname = require("../pathname/parse")
var compileTemplate = require("../pathname/compileTemplate")
var assign = require("../pathname/assign")

var sentinel = {}

module.exports = function($window, mountRedraw) {
	var fireAsync

	function setPath(path, data, options) {
		path = buildPathname(path, data)
		if (fireAsync != null) {
			fireAsync()
			var state = options ? options.state : null
			var title = options ? options.title : null
			if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path)
			else $window.history.pushState(state, title, route.prefix + path)
		}
		else {
			$window.location.href = route.prefix + path
		}
	}

	var currentResolver = sentinel, component, attrs, currentPath, lastUpdate

	var SKIP = route.SKIP = {}

	function route(root, defaultRoute, routes) {
		if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
		// 0 = start
		// 1 = init
		// 2 = ready
		var state = 0

		var compiled = Object.keys(routes).map(function(route) {
			if (route[0] !== "/") throw new SyntaxError("Routes must start with a `/`")
			if ((/:([^\/\.-]+)(\.{3})?:/).test(route)) {
				throw new SyntaxError("Route parameter names must be separated with either `/`, `.`, or `-`")
			}
			return {
				route: route,
				component: routes[route],
				check: compileTemplate(route),
			}
		})
		var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
		var p = Promise.resolve()
		var scheduled = false
		var onremove

		fireAsync = null

		if (defaultRoute != null) {
			var defaultData = parsePathname(defaultRoute)

			if (!compiled.some(function (i) { return i.check(defaultData) })) {
				throw new ReferenceError("Default route doesn't match any known routes")
			}
		}

		function resolveRoute() {
			scheduled = false
			// Consider the pathname holistically. The prefix might even be invalid,
			// but that's not our problem.
			var prefix = $window.location.hash
			if (route.prefix[0] !== "#") {
				prefix = $window.location.search + prefix
				if (route.prefix[0] !== "?") {
					prefix = $window.location.pathname + prefix
					if (prefix[0] !== "/") prefix = "/" + prefix
				}
			}
			// This seemingly useless `.concat()` speeds up the tests quite a bit,
			// since the representation is consistently a relatively poorly
			// optimized cons string.
			var path = prefix.concat()
				.replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
				.slice(route.prefix.length)
			var data = parsePathname(path)

			assign(data.params, $window.history.state)

			function fail() {
				if (path === defaultRoute) throw new Error("Could not resolve default route " + defaultRoute)
				setPath(defaultRoute, null, {replace: true})
			}

			loop(0)
			function loop(i) {
				// 0 = init
				// 1 = scheduled
				// 2 = done
				for (; i < compiled.length; i++) {
					if (compiled[i].check(data)) {
						var payload = compiled[i].component
						var matchedRoute = compiled[i].route
						var localComp = payload
						var update = lastUpdate = function(comp) {
							if (update !== lastUpdate) return
							if (comp === SKIP) return loop(i + 1)
							component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div"
							attrs = data.params, currentPath = path, lastUpdate = null
							currentResolver = payload.render ? payload : null
							if (state === 2) mountRedraw.redraw()
							else {
								state = 2
								mountRedraw.redraw.sync()
							}
						}
						// There's no understating how much I *wish* I could
						// use `async`/`await` here...
						if (payload.view || typeof payload === "function") {
							payload = {}
							update(localComp)
						}
						else if (payload.onmatch) {
							p.then(function () {
								return payload.onmatch(data.params, path, matchedRoute)
							}).then(update, fail)
						}
						else update("div")
						return
					}
				}
				fail()
			}
		}

		// Set it unconditionally so `m.route.set` and `m.route.Link` both work,
		// even if neither `pushState` nor `hashchange` are supported. It's
		// cleared if `hashchange` is used, since that makes it automatically
		// async.
		fireAsync = function() {
			if (!scheduled) {
				scheduled = true
				callAsync(resolveRoute)
			}
		}

		if (typeof $window.history.pushState === "function") {
			onremove = function() {
				$window.removeEventListener("popstate", fireAsync, false)
			}
			$window.addEventListener("popstate", fireAsync, false)
		} else if (route.prefix[0] === "#") {
			fireAsync = null
			onremove = function() {
				$window.removeEventListener("hashchange", resolveRoute, false)
			}
			$window.addEventListener("hashchange", resolveRoute, false)
		}

		return mountRedraw.mount(root, {
			onbeforeupdate: function() {
				state = state ? 2 : 1
				return !(!state || sentinel === currentResolver)
			},
			oncreate: resolveRoute,
			onremove: onremove,
			view: function() {
				if (!state || sentinel === currentResolver) return
				// Wrap in a fragment to preserve existing key semantics
				var vnode = [Vnode(component, attrs.key, attrs)]
				if (currentResolver) vnode = currentResolver.render(vnode[0])
				return vnode
			},
		})
	}
	route.set = function(path, data, options) {
		if (lastUpdate != null) {
			options = options || {}
			options.replace = true
		}
		lastUpdate = null
		setPath(path, data, options)
	}
	route.get = function() {return currentPath}
	route.prefix = "#!"
	route.Link = {
		view: function(vnode) {
			var options = vnode.attrs.options
			// Remove these so they don't get overwritten
			var attrs = {}, onclick, href
			assign(attrs, vnode.attrs)
			// The first two are internal, but the rest are magic attributes
			// that need censored to not screw up rendering.
			attrs.selector = attrs.options = attrs.key = attrs.oninit =
			attrs.oncreate = attrs.onbeforeupdate = attrs.onupdate =
			attrs.onbeforeremove = attrs.onremove = null

			// Do this now so we can get the most current `href` and `disabled`.
			// Those attributes may also be specified in the selector, and we
			// should honor that.
			var child = m(vnode.attrs.selector || "a", attrs, vnode.children)

			// Let's provide a *right* way to disable a route link, rather than
			// letting people screw up accessibility on accident.
			//
			// The attribute is coerced so users don't get surprised over
			// `disabled: 0` resulting in a button that's somehow routable
			// despite being visibly disabled.
			if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
				child.attrs.href = null
				child.attrs["aria-disabled"] = "true"
				// If you *really* do want to do this on a disabled link, use
				// an `oncreate` hook to add it.
				child.attrs.onclick = null
			} else {
				onclick = child.attrs.onclick
				href = child.attrs.href
				child.attrs.href = route.prefix + href
				child.attrs.onclick = function(e) {
					var result
					if (typeof onclick === "function") {
						result = onclick.call(e.currentTarget, e)
					} else if (onclick == null || typeof onclick !== "object") {
						// do nothing
					} else if (typeof onclick.handleEvent === "function") {
						onclick.handleEvent(e)
					}

					// Adapted from React Router's implementation:
					// https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
					//
					// Try to be flexible and intuitive in how we handle links.
					// Fun fact: links aren't as obvious to get right as you
					// would expect. There's a lot more valid ways to click a
					// link than this, and one might want to not simply click a
					// link, but right click or command-click it to copy the
					// link target, etc. Nope, this isn't just for blind people.
					if (
						// Skip if `onclick` prevented default
						result !== false && !e.defaultPrevented &&
						// Ignore everything but left clicks
						(e.button === 0 || e.which === 0 || e.which === 1) &&
						// Let the browser handle `target=_blank`, etc.
						(!e.currentTarget.target || e.currentTarget.target === "_self") &&
						// No modifier keys
						!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
					) {
						e.preventDefault()
						e.redraw = false
						route.set(href, null, options)
					}
				}
			}
			return child
		},
	}
	route.param = function(key) {
		return attrs && key != null ? attrs[key] : attrs
	}

	return route
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js","../render/hyperscript":"../node_modules/mithril/render/hyperscript.js","../promise/promise":"../node_modules/mithril/promise/promise.js","../pathname/build":"../node_modules/mithril/pathname/build.js","../pathname/parse":"../node_modules/mithril/pathname/parse.js","../pathname/compileTemplate":"../node_modules/mithril/pathname/compileTemplate.js","../pathname/assign":"../node_modules/mithril/pathname/assign.js"}],"../node_modules/mithril/route.js":[function(require,module,exports) {
"use strict"

var mountRedraw = require("./mount-redraw")

module.exports = require("./api/router")(window, mountRedraw)

},{"./mount-redraw":"../node_modules/mithril/mount-redraw.js","./api/router":"../node_modules/mithril/api/router.js"}],"../node_modules/mithril/index.js":[function(require,module,exports) {
"use strict"

var hyperscript = require("./hyperscript")
var request = require("./request")
var mountRedraw = require("./mount-redraw")

var m = function m() { return hyperscript.apply(this, arguments) }
m.m = hyperscript
m.trust = hyperscript.trust
m.fragment = hyperscript.fragment
m.mount = mountRedraw.mount
m.route = require("./route")
m.render = require("./render")
m.redraw = mountRedraw.redraw
m.request = request.request
m.jsonp = request.jsonp
m.parseQueryString = require("./querystring/parse")
m.buildQueryString = require("./querystring/build")
m.parsePathname = require("./pathname/parse")
m.buildPathname = require("./pathname/build")
m.vnode = require("./render/vnode")
m.PromisePolyfill = require("./promise/polyfill")

module.exports = m

},{"./hyperscript":"../node_modules/mithril/hyperscript.js","./request":"../node_modules/mithril/request.js","./mount-redraw":"../node_modules/mithril/mount-redraw.js","./route":"../node_modules/mithril/route.js","./render":"../node_modules/mithril/render.js","./querystring/parse":"../node_modules/mithril/querystring/parse.js","./querystring/build":"../node_modules/mithril/querystring/build.js","./pathname/parse":"../node_modules/mithril/pathname/parse.js","./pathname/build":"../node_modules/mithril/pathname/build.js","./render/vnode":"../node_modules/mithril/render/vnode.js","./promise/polyfill":"../node_modules/mithril/promise/polyfill.js"}],"../node_modules/polythene-core/dist/polythene-core.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unsubscribe = exports.unpackAttrs = exports.transitionStateReducer = exports.transitionComponent = exports.throttle = exports.subscribe = exports.stylePropCompare = exports.styleDurationToMs = exports.show = exports.pointerStartEvent = exports.pointerStartDownEvent = exports.pointerMoveEvent = exports.pointerEndEvent = exports.pointerEndDownEvent = exports.isTouch = exports.isServer = exports.isRTL = exports.isClient = exports.initialTransitionState = exports.iconDropdownUp = exports.iconDropdownDown = exports.hide = exports.getStyle = exports.getAnimationEndEvent = exports.filterSupportedAttributes = exports.emit = exports.deprecation = exports.classForSize = exports._Conditional = exports.Multi = void 0;

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
} // @ts-check


var modes = {
  hidden: "hidden",
  visible: "visible",
  exposing: "exposing",
  hiding: "hiding"
};

var _Conditional = function _Conditional(_ref) {
  var h = _ref.h,
      useState = _ref.useState,
      useEffect = _ref.useEffect,
      props = _objectWithoutProperties(_ref, ["h", "useState", "useEffect"]);

  var initialMode = props.permanent ? modes.visible : props.permanent || props.show ? modes.visible : modes.hidden;

  var _useState = useState(initialMode),
      _useState2 = _slicedToArray(_useState, 2),
      mode = _useState2[0],
      setMode = _useState2[1];

  useEffect(function () {
    var newMode = mode;

    if (props.permanent) {
      if (mode === modes.visible && props.show) {
        newMode = modes.exposing;
      } else if (mode === modes.exposing && !props.show) {
        newMode = modes.hiding;
      }
    } else {
      // "normal" type
      if (mode === modes.hidden && props.show) {
        newMode = modes.visible;
      } else if (mode === modes.visible && !props.show) {
        newMode = modes.hiding;
      }
    }

    if (newMode !== mode) {
      setMode(newMode);
    }
  }, [props]);
  var placeholder = h("span", {
    className: props.placeholderClassName
  }); // No didHide callback passed: use normal visibility evaluation

  if (!props.didHide) {
    return props.permanent || props.inactive || props.show ? h(props.instance, props) : placeholder;
  }

  var visible = mode !== modes.hidden;
  return visible ? h(props.instance, _objectSpread2({}, props, {
    didHide:
    /**
     * @param {any} args
     */
    function didHide(args) {
      return props.didHide(args), setMode(props.permanent ? modes.visible : modes.hidden);
    }
  }, mode === modes.hiding ? {
    show: true,
    hide: true
  } : undefined)) : placeholder;
}; // @ts-check

/**
 * 
 * @param {string} component 
 * @param {object} params
 * @param {string} [params.option]
 * @param {string} [params.newOption]
 * @param {string} [params.newOption]
 * @param {string} [params.newComponent]
 * @param {string} [params.since]
 */


exports._Conditional = _Conditional;

var deprecation = function deprecation(component, _ref) {
  var option = _ref.option,
      newOption = _ref.newOption,
      newComponent = _ref.newComponent,
      since = _ref.since;
  var version = since ? "Since version ".concat(since, ".") : "";
  return option && console.warn("".concat(component, ": option '").concat(option, "' is deprecated and will be removed in later versions. Use '").concat(newOption, "' instead. ").concat(version)), // eslint-disable-line no-console
  newComponent && !newOption && console.warn("".concat(component, ": this component is deprecated and will be removed in later versions. Use component '").concat(newComponent, "' instead. ").concat(version)), // eslint-disable-line no-console
  newComponent && newOption && console.warn("".concat(component, ": this component is deprecated and will be removed in later versions. Use component '").concat(newComponent, "' with option '").concat(newOption, "' instead. ").concat(version)) // eslint-disable-line no-console
  ;
}; // @ts-check

/**
 * Reducer helper function.
 * @param {object} acc 
 * @param {string} p 
 * @returns {object}
 */


exports.deprecation = deprecation;

var r = function r(acc, p) {
  return acc[p] = 1, acc;
};
/**
 * List of default attributes.
 * Separately handled:
 * - class
 * - element
 * @type Array<string> defaultAttrs
 */


var defaultAttrs = [// Universal
"key", "style", "href", "id", "data-index", // React
"tabIndex", // Mithril
"tabindex", "oninit", "oncreate", "onupdate", "onbeforeremove", "onremove", "onbeforeupdate"];
/**
 * 
 * @param {{[s: string]: string}} attrs 
 * @param {object} [modifications] 
 * @param {Array<string>} [modifications.add]
 * @param {Array<string>} [modifications.remove]
 * @returns {object}
 */

var filterSupportedAttributes = function filterSupportedAttributes(attrs) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      add = _ref.add,
      remove = _ref.remove;
  /**
   * @type {{[s: string]: string}} removeLookup 
   */


  var removeLookup = remove ? remove.reduce(r, {}) : {};
  /**
   * @type {Array<string>} attrsList 
   */

  var attrsList = add ? defaultAttrs.concat(add) : defaultAttrs;
  var supported = attrsList.filter(function (item) {
    return !removeLookup[item];
  }).reduce(r, {});
  return Object.keys(attrs).reduce(
  /**
   * @param {object} acc
   * @param {string} key
   */
  function (acc, key) {
    return supported[key] ? acc[key] = attrs[key] : null, acc;
  }, {});
};
/**
 * 
 * @param {object|function} attrs 
 * @returns {object}
 */


exports.filterSupportedAttributes = filterSupportedAttributes;

var unpackAttrs = function unpackAttrs(attrs) {
  return typeof attrs === "function" ? attrs() : attrs;
};
/**
 * 
 * @param {{[s: string]: string}} classes 
 * @returns {{[s: string]: string}}
 */


exports.unpackAttrs = unpackAttrs;

var sizeClasses = function sizeClasses(classes) {
  return {
    small: classes.small,
    regular: classes.regular,
    medium: classes.medium,
    large: classes.large,
    fab: classes.fab
  };
};
/**
 * 
 * @param {{[s: string]: string}} classes 
 * @param {string} [size] 
 * @returns {object}
 */


var classForSize = function classForSize(classes) {
  var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "regular";
  return sizeClasses(classes)[size];
};

exports.classForSize = classForSize;
var isClient = typeof document !== "undefined";
exports.isClient = isClient;
var isServer = !isClient; // @ts-check

/**
 * @type {{[s: string]: string}} evts
 */

exports.isServer = isServer;
var evts = {
  "animation": "animationend",
  "OAnimation": "oAnimationEnd",
  "MozAnimation": "animationend",
  "WebkitAnimation": "webkitAnimationEnd"
};

var getAnimationEndEvent = function getAnimationEndEvent() {
  if (isClient) {
    var el = document.createElement("fakeelement");
    /**
     * @type {string} a
     */

    for (var a in evts) {
      /**
       * @type {object} style
       */
      var style = el.style;

      if (style[a] !== undefined) {
        return evts[a];
      }
    }
  }
}; // @ts-check

/**
 * @param {object} params
 * @param {object} params.element
 * @param {string} [params.selector]
 * @param {string} [params.pseudoSelector]
 * @param {string} params.prop
 * @returns {object|undefined}
 */


exports.getAnimationEndEvent = getAnimationEndEvent;

var getStyle = function getStyle(_ref) {
  var element = _ref.element,
      selector = _ref.selector,
      pseudoSelector = _ref.pseudoSelector,
      prop = _ref.prop;
  var el = selector ? element.querySelector(selector) : element;

  if (!el) {
    return undefined;
  }

  if (el.currentStyle) {
    return el.currentStyle;
  }

  if (window.getComputedStyle) {
    var defaultView = document.defaultView;

    if (defaultView) {
      var style = defaultView.getComputedStyle(el, pseudoSelector);

      if (style) {
        return style.getPropertyValue(prop);
      }
    }
  }

  return undefined;
};
/**
 * 
 * @param {object} params
 * @param {object} params.element
 * @param {string} [params.selector]
 * @param {string} [params.pseudoSelector]
 * @param {string} params.prop
 * @param {string} [params.equals]
 * @param {string} [params.contains]
 * @returns {boolean}
 */


exports.getStyle = getStyle;

var stylePropCompare = function stylePropCompare(_ref2) {
  var element = _ref2.element,
      selector = _ref2.selector,
      pseudoSelector = _ref2.pseudoSelector,
      prop = _ref2.prop,
      equals = _ref2.equals,
      contains = _ref2.contains;
  var el = selector ? element.querySelector(selector) : element;

  if (!el) {
    return false;
  }

  var defaultView = document.defaultView;

  if (defaultView) {
    if (equals !== undefined) {
      return equals === defaultView.getComputedStyle(el, pseudoSelector).getPropertyValue(prop);
    }

    if (contains !== undefined) {
      return defaultView.getComputedStyle(el, pseudoSelector).getPropertyValue(prop).indexOf(contains) !== -1;
    }
  }

  return false;
};
/**
 * 
 * @param {object} params
 * @param {object} params.element
 * @param {string} params.selector
 * @returns {boolean}
 */


exports.stylePropCompare = stylePropCompare;

var isRTL = function isRTL(_ref3) {
  var _ref3$element = _ref3.element,
      element = _ref3$element === void 0 ? document : _ref3$element,
      selector = _ref3.selector;
  return stylePropCompare({
    element: element,
    selector: selector,
    prop: "direction",
    equals: "rtl"
  });
};
/**
 * 
 * @param {string} durationStr 
 * @returns {number}
 */


exports.isRTL = isRTL;

var styleDurationToMs = function styleDurationToMs(durationStr) {
  var parsed = parseFloat(durationStr) * (durationStr.indexOf("ms") === -1 ? 1000 : 1);
  return isNaN(parsed) ? 0 : parsed;
};

exports.styleDurationToMs = styleDurationToMs;
var iconDropdownUp = "<svg xmlns=\"http://www.w3.org/2000/svg\" id=\"dd-up-svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M7 14l5-5 5 5z\"/></svg>";
exports.iconDropdownUp = iconDropdownUp;
var iconDropdownDown = "<svg xmlns=\"http://www.w3.org/2000/svg\" id=\"dd-down-svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M7 10l5 5 5-5z\"/></svg>"; // @ts-check

exports.iconDropdownDown = iconDropdownDown;
var isTouch = isServer ? false : "ontouchstart" in document.documentElement;
exports.isTouch = isTouch;
var pointerStartEvent = isTouch ? ["touchstart", "click"] : ["click"];
exports.pointerStartEvent = pointerStartEvent;
var pointerEndEvent = isTouch ? ["click", "mouseup"] : ["mouseup"];
exports.pointerEndEvent = pointerEndEvent;
var pointerStartDownEvent = isTouch ? ["touchstart", "mousedown"] : ["mousedown"];
exports.pointerStartDownEvent = pointerStartDownEvent;
var pointerMoveEvent = isTouch ? ["touchmove", "mousemove"] : ["mousemove"];
exports.pointerMoveEvent = pointerMoveEvent;
var pointerEndDownEvent = isTouch ? ["touchend", "mouseup"] : ["mouseup"];
exports.pointerEndDownEvent = pointerEndDownEvent;

if (isClient) {
  var htmlElement = document.querySelector("html");

  if (htmlElement) {
    htmlElement.classList.add(isTouch ? "pe-touch" : "pe-no-touch");
  }
} // @ts-check

/**
 * @type {{[s: string]: Array<function>}} listeners
 */


var listeners = {};
/**
 * @param {function} func
 * @param {number} [s]
 * @param {object} [context]
 * @returns {function}
 * @see https://gist.github.com/Eartz/fe651f2fadcc11444549
 */

var throttle = function throttle(func) {
  var s = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.05;
  var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : isClient ? window : {};
  var wait = false;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var later = function later() {
      return func.apply(context, args);
    };

    if (!wait) {
      later();
      wait = true;
      setTimeout(function () {
        return wait = false;
      }, s);
    }
  };
};
/**
 * 
 * @param {string} eventName 
 * @param {object} listener 
 * @param {number} [delay] 
 */


exports.throttle = throttle;

var subscribe = function subscribe(eventName, listener, delay) {
  listeners[eventName] = listeners[eventName] || [];
  listeners[eventName].push(delay ? throttle(listener, delay) : listener);
};
/**
 * 
 * @param {string} eventName 
 * @param {object} listener 
 */


exports.subscribe = subscribe;

var unsubscribe = function unsubscribe(eventName, listener) {
  if (!listeners[eventName]) {
    return;
  }

  var index = listeners[eventName].indexOf(listener);

  if (index > -1) {
    listeners[eventName].splice(index, 1);
  }
};
/**
 * 
 * @param {string} eventName 
 * @param {object} event 
 */


exports.unsubscribe = unsubscribe;

var emit = function emit(eventName, event) {
  if (!listeners[eventName]) {
    return;
  }

  listeners[eventName].forEach(function (listener) {
    return listener(event);
  });
};

exports.emit = emit;

if (isClient) {
  window.addEventListener("resize", function (e) {
    return emit("resize", e);
  });
  window.addEventListener("scroll", function (e) {
    return emit("scroll", e);
  });
  window.addEventListener("keydown", function (e) {
    return emit("keydown", e);
  });
  pointerEndEvent.forEach(function (eventName) {
    return window.addEventListener(eventName, function (e) {
      return emit(eventName, e);
    });
  });
}
/**
 * @typedef {object} Item 
 */

/**
 * 
 * @param {object} params
 * @param {object} params.options
 */


var Multi = function Multi(_ref) {
  var mOptions = _ref.options;
  /**
   * @type {Array<Item>} items
   */

  var items = []; // This is shared between all instances of a type (Dialog, Notification, ...)

  /*
  @param e: { id, eventName }
  */

  var onChange = function onChange(e) {
    emit(mOptions.name, e);
  };

  var itemIndex = function itemIndex(id) {
    var item = findItem(id);
    return items.indexOf(item);
  };

  var removeItem = function removeItem(id) {
    var index = itemIndex(id);

    if (index !== -1) {
      items.splice(index, 1);
      onChange({
        id: id,
        name: "removeItem"
      });
    }
  };

  var replaceItem = function replaceItem(id, newItem) {
    var index = itemIndex(id);

    if (index !== -1) {
      items[index] = newItem;
    }
  };

  var findItem = function findItem(id) {
    // traditional for loop for IE10
    for (var i = 0; i < items.length; i++) {
      if (items[i].instanceId === id) {
        return items[i];
      }
    }
  };

  var next = function next() {
    if (items.length) {
      items[0].show = true;
    }

    onChange({
      id: items.length ? items[0].instanceId : null,
      name: "next"
    });
  };

  var remove = function remove() {
    var instanceId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : mOptions.defaultId;

    if (mOptions.queue) {
      items.shift();
      next();
    } else {
      removeItem(instanceId);
    }
  };

  var removeAll = function removeAll() {
    items.length = 0;
    onChange({
      id: null,
      name: "removeAll"
    });
  };

  var setPauseState = function setPauseState(pause, instanceId) {
    var item = findItem(instanceId);

    if (item) {
      item.pause = pause;
      item.unpause = !pause;
      onChange({
        id: instanceId,
        name: pause ? "pause" : "unpause"
      });
    }
  };

  var createItem = function createItem(itemAttrs, instanceId, spawn) {
    var resolveShow;
    var resolveHide;
    var props = unpackAttrs(itemAttrs);

    var didShow = function didShow() {
      if (props.didShow) {
        props.didShow(instanceId);
      }

      onChange({
        id: instanceId,
        name: "didShow"
      });
      return resolveShow(instanceId);
    };

    var showPromise = new Promise(function (resolve) {
      return resolveShow = resolve;
    });
    var hidePromise = new Promise(function (resolve) {
      return resolveHide = resolve;
    });

    var didHide = function didHide() {
      if (props.didHide) {
        props.didHide(instanceId);
      }

      onChange({
        id: instanceId,
        name: "didHide"
      });
      remove(instanceId);
      return resolveHide(instanceId);
    };

    return _objectSpread2({}, mOptions, {
      // keyId: mOptions.queue ? new Date().getTime() : undefined, // to force rendering a new component
      instanceId: instanceId,
      spawn: spawn,
      props: itemAttrs,
      show: mOptions.queue ? false : true,
      showPromise: showPromise,
      hidePromise: hidePromise,
      didShow: didShow,
      didHide: didHide
    });
  };

  var count = function count() {
    return items.length;
  };

  var pause = function pause() {
    var instanceId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : mOptions.defaultId;
    return setPauseState(true, instanceId);
  };

  var unpause = function unpause() {
    var instanceId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : mOptions.defaultId;
    return setPauseState(false, instanceId);
  };

  var show = function show() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var spawnOpts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var instanceId = spawnOpts.id || mOptions.defaultId;
    var spawn = spawnOpts.spawn || mOptions.defaultId;
    var item = createItem(props, instanceId, spawn);
    onChange({
      id: instanceId,
      name: "show"
    });

    if (mOptions.queue) {
      items.push(item);

      if (items.length === 1) {
        next();
      }
    } else {
      var storedItem = findItem(instanceId);

      if (!storedItem) {
        items.push(item);
      } else {
        replaceItem(instanceId, item);
      }
    }

    return item.showPromise;
  };

  var hide = function hide() {
    var spawnOpts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var instanceId = spawnOpts.id || mOptions.defaultId;
    var item = mOptions.queue && items.length ? items[0] : findItem(instanceId);

    if (item) {
      item.hide = true;
    }

    onChange({
      id: instanceId,
      name: "hide"
    });
    return item ? item.hidePromise : Promise.resolve(instanceId);
  };

  var clear = removeAll;

  var render = function render(_ref2) {
    var h = _ref2.h,
        useState = _ref2.useState,
        useEffect = _ref2.useEffect,
        props = _objectWithoutProperties(_ref2, ["h", "useState", "useEffect"]);

    var _useState = useState(),
        _useState2 = _slicedToArray(_useState, 2),
        setCurrent = _useState2[1];

    useEffect(function () {
      subscribe(mOptions.name, setCurrent);
      return function () {
        unsubscribe(mOptions.name, setCurrent);
      };
    }, []);
    var spawn = props.spawn || mOptions.defaultId;
    var candidates = items.filter(function (item) {
      return item.show && item.spawn === spawn;
    });

    if (mOptions.htmlShowClass && isClient && document.documentElement) {
      document.documentElement.classList[candidates.length ? "add" : "remove"](mOptions.htmlShowClass);
    }

    return !candidates.length ? h(mOptions.placeholder) // placeholder because we cannot return null
    : h(mOptions.holderSelector, {
      className: props.position === "container" ? "pe-multiple--container" : "pe-multiple--screen"
    }, candidates.map(function (itemData) {
      return h(mOptions.instance, _objectSpread2({}, unpackAttrs(props), {
        fromMultipleClear: clear,
        spawnId: spawn,
        // from mOptions:
        fromMultipleClassName: mOptions.className,
        holderSelector: mOptions.holderSelector,
        transitions: mOptions.transitions,
        // from itemData:
        fromMultipleDidHide: itemData.didHide,
        fromMultipleDidShow: itemData.didShow,
        hide: itemData.hide,
        instanceId: itemData.instanceId,
        key: itemData.key !== undefined ? itemData.key : itemData.keyId,
        pause: itemData.pause,
        show: itemData.show,
        unpause: itemData.unpause
      }, unpackAttrs(itemData.props)));
    }));
  };

  return {
    clear: clear,
    count: count,
    hide: hide,
    pause: pause,
    remove: remove,
    show: show,
    unpause: unpause,
    render: render
  };
};

exports.Multi = Multi;
Multi["displayName"] = "Multi";
var TRANSITION_TYPES = {
  SHOW: "show",
  HIDE: "hide",
  SHOW_DONE: "show-done",
  HIDE_DONE: "hide-done"
};
var initialTransitionState = {
  isVisible: false,
  isTransitioning: false
};
exports.initialTransitionState = initialTransitionState;

var transitionStateReducer = function transitionStateReducer(state, type) {
  switch (type) {
    case TRANSITION_TYPES.SHOW:
      return _objectSpread2({}, state, {
        isTransitioning: true,
        isVisible: true
      });

    case TRANSITION_TYPES.HIDE:
      return _objectSpread2({}, state, {
        isTransitioning: true
      });

    case TRANSITION_TYPES.SHOW_DONE:
      return _objectSpread2({}, state, {
        isTransitioning: false,
        isVisible: true
      });

    case TRANSITION_TYPES.HIDE_DONE:
      return _objectSpread2({}, state, {
        isTransitioning: false,
        isVisible: false
      });

    default:
      throw new Error("Unhandled action type: ".concat(type));
  }
};
/**
 * 
 * @typedef {{ el?: HTMLElement, duration?: number, hasDuration?: boolean, delay?: number, hasDelay?: boolean, timingFunction?: string, transitionClass?: string, before?: () => void, after?: () => void, transition?: () => void, showClass?: string, showClassElement?: HTMLElement  }} TransitionOpts
 */


exports.transitionStateReducer = transitionStateReducer;
var DEFAULT_DURATION = .240;
var DEFAULT_DELAY = 0;
/**
 * 
 * @param {TransitionOpts} opts 
 * @returns {Promise}
 */

var show = function show(opts) {
  return transition(opts, "show");
};
/**
 * 
 * @param {TransitionOpts} opts
 * @returns {Promise} 
 */


exports.show = show;

var hide = function hide(opts) {
  return transition(opts, "hide");
};
/**
 * 
 * @param {TransitionOpts} opts 
 * @param {"show"|"hide"} state 
 * @returns {Promise}
 */


exports.hide = hide;

var transition = function transition(opts, state) {
  var el = opts.el;

  if (!el) {
    return Promise.resolve();
  } else {
    return new Promise(function (resolve) {
      var style = el.style;
      /**
       * @type {object} computedStyle
       */

      var computedStyle = isClient ? window.getComputedStyle(el) : {};
      var duration = opts.hasDuration && opts.duration !== undefined ? opts.duration * 1000.0 : styleDurationToMs(computedStyle.transitionDuration);
      var delay = opts.hasDelay && opts.delay !== undefined ? opts.delay * 1000.0 : styleDurationToMs(computedStyle.transitionDelay);
      var timingFunction = opts.timingFunction || computedStyle.transitionTimingFunction;

      if (opts.transitionClass) {
        el.classList.add(opts.transitionClass);
      }

      var before = function before() {
        style.transitionDuration = "0ms";
        style.transitionDelay = "0ms";

        if (opts.before && typeof opts.before === "function") {
          opts.before();
        }
      };

      var maybeBefore = opts.before && state === "show" ? before : opts.before && state === "hide" ? before : null;

      var after = function after() {
        if (opts.after && typeof opts.after === "function") {
          opts.after();
        }
      };

      var applyTransition = function applyTransition() {
        style.transitionDuration = duration + "ms";
        style.transitionDelay = delay + "ms";

        if (timingFunction) {
          style.transitionTimingFunction = timingFunction;
        }

        if (opts.showClass) {
          var showClassElement = opts.showClassElement || el;
          showClassElement.classList[state === "show" ? "add" : "remove"](opts.showClass);
        }

        if (opts.transition) {
          opts.transition();
        }
      };

      var doTransition = function doTransition() {
        applyTransition();
        setTimeout(function () {
          if (after) {
            after();
          }

          if (opts.transitionClass) {
            el.classList.remove(opts.transitionClass);
            el.offsetHeight; // force reflow
          }

          resolve();
        }, duration + delay);
      };

      var maybeDelayTransition = function maybeDelayTransition() {
        if (duration === 0) {
          doTransition();
        } else {
          setTimeout(doTransition, 0);
        }
      };

      if (maybeBefore) {
        maybeBefore();
        el.offsetHeight; // force reflow

        setTimeout(function () {
          maybeDelayTransition();
        }, 0);
      } else {
        maybeDelayTransition();
      }
    });
  }
};
/**
 * 
 * @param {object} params
 * @param {(string) => void} [params.dispatchTransitionState]
 * @param {boolean} [params.isShow]
 * @param {boolean} [params.isTransitioning]
 * @param {string} [params.instanceId]
 * @param {(boolean) => void} [params.setIsTransitioning]
 * @param {(boolean) => void} [params.setIsVisible]
 * @param {object} [params.props]
 * @param {object} [params.domElements]
 * @param {() => void} [params.beforeTransition]
 * @param {() => void} [params.afterTransition]
 * @param {string} [params.showClass]
 * @param {string} [params.transitionClass]
 * @param {string} [params.referrer]
 * @returns {Promise}
 */


var transitionComponent = function transitionComponent(_ref) {
  var dispatchTransitionState = _ref.dispatchTransitionState,
      isTransitioning = _ref.isTransitioning,
      instanceId = _ref.instanceId,
      isShow = _ref.isShow,
      props = _ref.props,
      domElements = _ref.domElements,
      beforeTransition = _ref.beforeTransition,
      afterTransition = _ref.afterTransition,
      showClass = _ref.showClass,
      transitionClass = _ref.transitionClass,
      referrer = _ref.referrer;

  if (isTransitioning) {
    return Promise.resolve();
  }

  dispatchTransitionState(isShow ? TRANSITION_TYPES.SHOW : TRANSITION_TYPES.HIDE);

  if (beforeTransition) {
    beforeTransition();
  }

  var duration = isShow ? props.showDuration : props.hideDuration;
  var delay = isShow ? props.showDelay : props.hideDelay;
  var timingFunction = isShow ? props.showTimingFunction : props.hideTimingFunction;
  var transitions = props.transitions;
  var fn = isShow ? show : hide;

  var opts1 = _objectSpread2({}, props, {}, domElements, {
    showClass: showClass,
    transitionClass: transitionClass,
    duration: duration,
    delay: delay,
    timingFunction: timingFunction
  });

  var opts2 = _objectSpread2({}, opts1, {}, transitions ? (isShow ? transitions.show : transitions.hide)(opts1) : undefined);

  var opts3 = _objectSpread2({}, opts2, {}, {
    duration: opts2.duration !== undefined ? opts2.duration : DEFAULT_DURATION,
    hasDuration: opts2.duration !== undefined,
    delay: opts2.delay !== undefined ? opts2.delay : DEFAULT_DELAY,
    hasDelay: opts2.delay !== undefined
  });

  return fn(opts3).then(function () {
    var id = instanceId;

    if (afterTransition) {
      afterTransition();
    } // Component may unmount after this point


    if (isShow ? props.fromMultipleDidShow : props.fromMultipleDidHide) {
      (isShow ? props.fromMultipleDidShow : props.fromMultipleDidHide)(id); // when used with Multiple; this will call props.didShow / props.didHide
    } else if (isShow ? props.didShow : props.didHide) {
      (isShow ? props.didShow : props.didHide)(id); // when used directly
    }

    dispatchTransitionState(isShow ? TRANSITION_TYPES.SHOW_DONE : TRANSITION_TYPES.HIDE_DONE);
  });
};

exports.transitionComponent = transitionComponent;
},{}],"../node_modules/polythene-core-shadow/dist/polythene-core-shadow.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDepthClass = exports._Shadow = void 0;

var _polytheneCore = require("polythene-core");

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

var classes = {
  component: "pe-shadow",
  // elements      
  bottomShadow: "pe-shadow__bottom",
  topShadow: "pe-shadow__top",
  // states
  animated: "pe-shadow--animated",
  depth_n: "pe-shadow--depth-",
  with_active_shadow: "pe-with-active-shadow"
};
var DEFAULT_SHADOW_DEPTH = 1;

var getDepthClass = function getDepthClass(shadowDepth) {
  return shadowDepth !== undefined ? "".concat(classes.depth_n).concat(Math.min(5, shadowDepth)) : DEFAULT_SHADOW_DEPTH;
};

exports.getDepthClass = getDepthClass;

var _Shadow = function _Shadow(_ref) {
  var h = _ref.h,
      a = _ref.a,
      props = _objectWithoutProperties(_ref, ["h", "a"]);

  var depthClass = getDepthClass(props.shadowDepth);

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.component, depthClass, props.animated && classes.animated, props.className || props[a["class"]]].join(" ")
  });

  var content = [props.before, props.content ? props.content : props.children, props.after];
  return h(props.element || "div", componentProps, [content, h("div", {
    className: [classes.bottomShadow].join(" ")
  }), h("div", {
    className: [classes.topShadow].join(" ")
  })]);
};

exports._Shadow = _Shadow;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-core-button/dist/polythene-core-button.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._Button = void 0;

var _polytheneCore = require("polythene-core");

var _polytheneCoreShadow = require("polythene-core-shadow");

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var classes = {
  component: "pe-text-button",
  "super": "pe-button",
  row: "pe-button-row",
  // elements      
  content: "pe-button__content",
  label: "pe-button__label",
  textLabel: "pe-button__text-label",
  wash: "pe-button__wash",
  washColor: "pe-button__wash-color",
  dropdown: "pe-button__dropdown",
  // states      
  border: "pe-button--border",
  contained: "pe-button--contained",
  disabled: "pe-button--disabled",
  dropdownClosed: "pe-button--dropdown-closed",
  dropdownOpen: "pe-button--dropdown-open",
  extraWide: "pe-button--extra-wide",
  hasDropdown: "pe-button--dropdown",
  highLabel: "pe-button--high-label",
  inactive: "pe-button--inactive",
  raised: "pe-button--raised",
  selected: "pe-button--selected",
  separatorAtStart: "pe-button--separator-start",
  hasHover: "pe-button--has-hover"
};
var shadowClasses = {
  component: "pe-shadow",
  // elements      
  bottomShadow: "pe-shadow__bottom",
  topShadow: "pe-shadow__top",
  // states
  animated: "pe-shadow--animated",
  depth_n: "pe-shadow--depth-",
  with_active_shadow: "pe-with-active-shadow"
};
var DEFAULT_SHADOW_DEPTH = 1;

var _Button = function _Button(_ref) {
  var _objectSpread3;

  var h = _ref.h,
      a = _ref.a,
      getRef = _ref.getRef,
      useState = _ref.useState,
      useEffect = _ref.useEffect,
      useRef = _ref.useRef,
      Ripple = _ref.Ripple,
      Shadow = _ref.Shadow,
      Icon = _ref.Icon,
      props = _objectWithoutProperties(_ref, ["h", "a", "getRef", "useState", "useEffect", "useRef", "Ripple", "Shadow", "Icon"]);

  var events = props.events || {};

  var _useState = useState(),
      _useState2 = _slicedToArray(_useState, 2),
      domElement = _useState2[0],
      setDomElement = _useState2[1];

  var _useState3 = useState(props.inactive),
      _useState4 = _slicedToArray(_useState3, 2),
      isInactive = _useState4[0],
      setIsInactive = _useState4[1];

  var disabled = props.disabled;
  var inactive = props.inactive || isInactive;

  var onClickHandler = events[a.onclick] || function () {};

  var onKeyUpHandler = events[a.onkeyup] || onClickHandler;
  var shadowDepth = props.raised ? props.shadowDepth !== undefined ? props.shadowDepth : DEFAULT_SHADOW_DEPTH : 0;
  var animateOnTap = props.animateOnTap !== false ? true : false;

  var handleInactivate = function handleInactivate() {
    if (props.inactivate === undefined) {
      return;
    }

    setIsInactive(true);
    setTimeout(function () {
      return setIsInactive(false);
    }, props.inactivate * 1000);
  };

  var hasHover = !disabled && !props.selected && (props.raised ? props.wash : props.wash !== false);

  var handleMouseLeave = function handleMouseLeave(e) {
    domElement.blur();
    domElement.removeEventListener("mouseleave", handleMouseLeave);
  };

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props, {
    add: [a.formaction, "type"],
    remove: ["style"]
  }), // Set style on content, not on component
  getRef(function (dom) {
    if (!dom || domElement) {
      return;
    }

    setDomElement(dom);

    if (props.getRef) {
      props.getRef(dom);
    }
  }), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes["super"], props.parentClassName || classes.component, props.contained ? classes.contained : null, // Raised button classes
    props.raised ? classes.contained : null, props.raised ? classes.raised : null, props.raised && animateOnTap ? shadowClasses.with_active_shadow : null, props.raised && animateOnTap ? (0, _polytheneCoreShadow.getDepthClass)(shadowDepth + 1) : null, //
    hasHover ? classes.hasHover : null, props.selected ? classes.selected : null, props.highLabel ? classes.highLabel : null, props.extraWide ? classes.extraWide : null, disabled ? classes.disabled : null, inactive ? classes.inactive : null, props.separatorAtStart ? classes.separatorAtStart : null, props.border || props.borders ? classes.border : null, props.dropdown ? classes.hasDropdown : null, props.dropdown ? props.dropdown.open ? classes.dropdownOpen : classes.dropdownClosed : null, props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  }, inactive ? null : _objectSpread2(_defineProperty({}, a.tabindex, disabled || inactive ? -1 : props[a.tabindex] || 0), events, (_objectSpread3 = {}, _defineProperty(_objectSpread3, a.onmousedown, function (e) {
    return domElement && domElement.addEventListener && domElement.addEventListener("mouseleave", handleMouseLeave), props.events && props.events[a.onmousedown] && props.events[a.onmousedown](e);
  }), _defineProperty(_objectSpread3, a.onclick, function (e) {
    return document.activeElement === domElement && document.activeElement.blur(), handleInactivate(), onClickHandler(e);
  }), _defineProperty(_objectSpread3, a.onkeyup, function (e) {
    if (e.keyCode === 13 && document.activeElement === domElement) {
      document.activeElement.blur();

      if (onKeyUpHandler) {
        onKeyUpHandler(e);
      }
    }

    props.events && props.events[a.onkeyup] && props.events[a.onkeyup](e);
  }), _objectSpread3)), props.url, disabled ? {
    disabled: true
  } : null);

  var noink = props.ink !== undefined && props.ink === false;
  var buttonContent = props.content ? props.content : props.label !== undefined ? _typeof(props.label) === "object" ? props.label : h("div", {
    className: classes.label
  }, h("div", {
    className: classes.textLabel,
    style: props.textStyle
  }, props.label)) : props.children;
  var componentContent = h("div", {
    className: classes.content,
    style: props.style
  }, [h(Shadow, {
    shadowDepth: shadowDepth !== undefined ? shadowDepth : 0,
    animated: true
  }), disabled || noink ? null : h(Ripple, _extends({}, {
    target: domElement
  }, props.ripple)), h("div", {
    className: classes.wash
  }, h("div", {
    className: classes.washColor
  })), buttonContent, props.dropdown ? h(Icon, {
    className: classes.dropdown,
    svg: {
      content: h.trust(_polytheneCore.iconDropdownDown)
    }
  }) : null]);
  return h(props.element || "a", componentProps, [props.before, componentContent, props.after]);
};

exports._Button = _Button;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs","polythene-core-shadow":"../node_modules/polythene-core-shadow/dist/polythene-core-shadow.mjs"}],"../node_modules/polythene-style/dist/polythene-style.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = void 0;
// @ts-check
// Global style variables
var grid_unit = 4;
var grid_unit_component = 8;
var increment = 7 * grid_unit_component; // 7 * 8 = 56

var increment_large = 8 * grid_unit_component; // 8 * 8 = 64

var vars = {
  // grid
  grid_unit: grid_unit,
  grid_unit_component: grid_unit_component,
  increment: increment,
  increment_large: increment_large,
  grid_unit_menu: 56,
  grid_unit_icon_button: 6 * grid_unit_component,
  // 48
  // common sizes
  unit_block_border_radius: 4,
  unit_item_border_radius: 4,
  unit_indent: 72,
  unit_indent_large: 80,
  unit_side_padding: 16,
  // buttons
  unit_touch_height: 48,
  unit_icon_size_small: 2 * grid_unit_component,
  // 16
  unit_icon_size: 3 * grid_unit_component,
  // 24
  unit_icon_size_medium: 4 * grid_unit_component,
  // 32
  unit_icon_size_large: 5 * grid_unit_component,
  // 40
  // screen dimensions
  unit_screen_size_extra_large: 1280,
  unit_screen_size_large: 960,
  unit_screen_size_medium: 480,
  unit_screen_size_small: 320,
  // transitions
  animation_duration: ".18s",
  animation_curve_slow_in_fast_out: "cubic-bezier(.4, 0, .2, 1)",
  animation_curve_slow_in_linear_out: "cubic-bezier(0, 0, .2, 1)",
  animation_curve_linear_in_fast_out: "cubic-bezier(.4, 0, 1, 1)",
  animation_curve_default: "ease-out",
  // font
  font_weight_light: 300,
  font_weight_normal: 400,
  font_weight_medium: 500,
  font_weight_bold: 700,
  font_size_title: 20,
  line_height: 1.5,
  // base colors
  color_primary: "33, 150, 243",
  // blue 500
  color_primary_active: "30, 136, 229",
  // blue 600
  color_primary_dark: "25, 118, 210",
  // blue 700
  color_primary_faded: "100, 181, 249",
  // blue 300
  color_primary_foreground: "255, 255, 255",
  color_light_background: "255, 255, 255",
  color_light_foreground: "0, 0, 0",
  color_dark_background: "34, 34, 34",
  color_dark_foreground: "255, 255, 255",
  // blends
  blend_light_text_primary: .87,
  blend_light_text_regular: .73,
  blend_light_text_secondary: .54,
  blend_light_text_tertiary: .40,
  blend_light_text_disabled: .26,
  blend_light_border_medium: .24,
  blend_light_border_light: .11,
  blend_light_background_active: .14,
  blend_light_background_hover: .06,
  blend_light_background_hover_medium: .12,
  // for the lighter tinted icon buttons
  blend_light_background_disabled: .09,
  blend_light_overlay_background: .3,
  blend_dark_text_primary: 1,
  blend_dark_text_regular: .87,
  blend_dark_text_secondary: .70,
  blend_dark_text_tertiary: .40,
  blend_dark_text_disabled: .26,
  blend_dark_border_medium: .22,
  blend_dark_border_light: .10,
  blend_dark_background_active: .14,
  blend_dark_background_hover: .08,
  blend_dark_background_hoverMedium: .12,
  // for the lighter tinted icon buttons
  blend_dark_background_disabled: .12,
  blend_dark_overlay_background: .3,

  /*
  Breakpoints
  Specs: https://material.io/guidelines/layout/responsive-ui.html#responsive-ui-breakpoints
  Breakbpoint naming: inspiration from
  https://medium.freecodecamp.org/the-100-correct-way-to-do-css-breakpoints-88d6a5ba1862
  */
  breakpoint_for_phone_only: 599,
  // set max-width  cols: 4,  gutter: 16
  breakpoint_for_tablet_portrait_up: 600,
  // set min-width  cols: 8,  gutter: 24
  breakpoint_for_tablet_landscape_up: 840,
  // etc.           cols: 12, gutter: 24
  breakpoint_for_desktop_up: 1280,
  breakpoint_for_big_desktop_up: 1600,
  breakpoint_for_tv_up: 1920,
  // z-index
  z_toolbar: 100,
  z_menu: 1000,
  z_app_bar: 2000,
  z_drawer: 3000,
  z_notification: 5000,
  z_dialog: 7000
};
exports.vars = vars;
},{}],"../node_modules/polythene-theme/dist/polythene-theme.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "vars", {
  enumerable: true,
  get: function () {
    return _polytheneStyle.vars;
  }
});
exports.componentConfig = void 0;

var _polytheneStyle = require("polythene-style");

// @ts-check
// Placeholder for custom theme config file
// In your app paths setup, change the current path to your custom config file; see the theme README.
// Example:
// export const componentConfig = {
//     Button: vars => {
//         const mainColor = '#e4521b';
//         const textColor = '#fff';
//         const newVars = Object.assign(
//           {},
//           vars,
//           {
//             border_radius:                        0,
//             color_light_raised_normal_background: mainColor,
//             color_light_raised_normal_text:       textColor,
//             color_dark_raised_normal_background:  mainColor,
//             color_dark_raised_normal_text:        textColor
//           }
//         );
//         return [
//             { '': vars }, // default vars for all pages
//             { '.example-custom-theme ': newVars } // custom vars for this selector
//         ];
//     }
// };
var componentConfig = {};
exports.componentConfig = componentConfig;
},{"polythene-style":"../node_modules/polythene-style/dist/polythene-style.mjs"}],"../node_modules/polythene-core-ripple/dist/polythene-core-ripple.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rippleAnimation = exports._Ripple = void 0;

var _polytheneCore = require("polythene-core");

var _polytheneTheme = require("polythene-theme");

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var ANIMATION_END_EVENT = (0, _polytheneCore.getAnimationEndEvent)();
var DEFAULT_START_OPACITY = 0.2;
var DEFAULT_END_OPACITY = 0.0;
var DEFAULT_START_SCALE = 0.1;
var DEFAULT_END_SCALE = 2.0;
var OPACITY_DECAY_VELOCITY = 0.35;

var addStyleToHead = function addStyleToHead(id, stylesheet) {
  if (_polytheneCore.isServer) return;
  var documentRef = window.document;
  var styleEl = documentRef.createElement("style");
  styleEl.setAttribute("id", id);
  styleEl.appendChild(documentRef.createTextNode(stylesheet));
  documentRef.head.appendChild(styleEl);
};

var removeStyleFromHead = function removeStyleFromHead(id) {
  if (_polytheneCore.isServer) return;
  var el = document.getElementById(id);

  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
};

var rippleAnimation = function (_ref) {
  var e = _ref.e,
      id = _ref.id,
      el = _ref.el,
      props = _ref.props,
      classes = _ref.classes;
  return new Promise(function (resolve) {
    var container = document.createElement("div");
    container.setAttribute("class", classes.mask);
    el.appendChild(container);
    var waves = document.createElement("div");
    waves.setAttribute("class", classes.waves);
    container.appendChild(waves);
    var rect = el.getBoundingClientRect();
    var x = _polytheneCore.isTouch && e.touches ? e.touches[0].pageX : e.clientX;
    var y = _polytheneCore.isTouch && e.touches ? e.touches[0].pageY : e.clientY;
    var w = el.offsetWidth;
    var h = el.offsetHeight;
    var waveRadius = Math.sqrt(w * w + h * h);
    var mx = props.center ? rect.left + rect.width / 2 : x;
    var my = props.center ? rect.top + rect.height / 2 : y;
    var rx = mx - rect.left - waveRadius / 2;
    var ry = my - rect.top - waveRadius / 2;
    var startOpacity = props.startOpacity !== undefined ? props.startOpacity : DEFAULT_START_OPACITY;
    var opacityDecayVelocity = props.opacityDecayVelocity !== undefined ? props.opacityDecayVelocity : OPACITY_DECAY_VELOCITY;
    var endOpacity = props.endOpacity || DEFAULT_END_OPACITY;
    var startScale = props.startScale || DEFAULT_START_SCALE;
    var endScale = props.endScale || DEFAULT_END_SCALE;
    var duration = props.duration ? props.duration : 1 / opacityDecayVelocity * 0.2;
    var color = window.getComputedStyle(el).color;
    var style = waves.style;
    style.width = style.height = waveRadius + "px";
    style.top = ry + "px";
    style.left = rx + "px";
    style["animation-duration"] = style["-webkit-animation-duration"] = style["-moz-animation-duration"] = style["-o-animation-duration"] = duration + "s";
    style.backgroundColor = color;
    style.opacity = startOpacity;
    style.animationName = id;
    style.animationTimingFunction = props.animationTimingFunction || _polytheneTheme.vars.animation_curve_default;
    var rippleStyleSheet = "@keyframes ".concat(id, " {\n      0% {\n        transform:scale(").concat(startScale, ");\n        opacity: ").concat(startOpacity, "\n      }\n      100% {\n        transform:scale(").concat(endScale, ");\n        opacity: ").concat(endOpacity, ";\n      }\n    }");
    addStyleToHead(id, rippleStyleSheet);

    var animationDone = function animationDone(evt) {
      removeStyleFromHead(id);
      waves.removeEventListener(ANIMATION_END_EVENT, animationDone, false);

      if (props.persistent) {
        style.opacity = endOpacity;
        style.transform = "scale(" + endScale + ")";
      } else {
        waves.classList.remove(classes.wavesAnimating);
        container.removeChild(waves);
        el.removeChild(container);
      }

      resolve(evt);
    };

    waves.addEventListener(ANIMATION_END_EVENT, animationDone, false);
    waves.classList.add(classes.wavesAnimating);
  });
};

exports.rippleAnimation = rippleAnimation;
var classes = {
  component: "pe-ripple",
  // elements
  mask: "pe-ripple__mask",
  waves: "pe-ripple__waves",
  // states
  unconstrained: "pe-ripple--unconstrained",
  wavesAnimating: "pe-ripple__waves--animating"
};

var _Ripple = function _Ripple(_ref) {
  var h = _ref.h,
      a = _ref.a,
      getRef = _ref.getRef,
      useRef = _ref.useRef,
      useState = _ref.useState,
      useEffect = _ref.useEffect,
      props = _objectWithoutProperties(_ref, ["h", "a", "getRef", "useRef", "useState", "useEffect"]);

  var _useState = useState(),
      _useState2 = _slicedToArray(_useState, 2),
      domElement = _useState2[0],
      setDomElement = _useState2[1];

  var animationCountRef = useRef();
  var triggerEl = props.target || (domElement ? domElement.parentElement : undefined);

  var tap = function tap(e) {
    if (props.disabled || !domElement || !props.multi && animationCountRef.current > 0) {
      return;
    }

    if (props.start) {
      props.start(e);
    }

    var id = "ripple_animation_".concat(new Date().getTime());
    rippleAnimation({
      e: e,
      id: id,
      el: domElement,
      props: props,
      classes: classes
    }).then(function (evt) {
      if (props.end) {
        props.end(evt);
      }

      animationCountRef.current--;
    });
    animationCountRef.current++;
  }; // count


  useEffect(function () {
    animationCountRef.current = 0;
  }, []); // triggerEl

  useEffect(function () {
    if (triggerEl && triggerEl.addEventListener) {
      _polytheneCore.pointerEndEvent.forEach(function (evt) {
        return triggerEl.addEventListener(evt, tap, false);
      });

      return function () {
        _polytheneCore.pointerEndEvent.forEach(function (evt) {
          return triggerEl.removeEventListener(evt, tap, false);
        });
      };
    }
  }, [triggerEl]);

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), getRef(function (dom) {
    return dom && !domElement && setDomElement(dom);
  }), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.component, props.unconstrained ? classes.unconstrained : null, props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  });

  var content = [props.before, props.after];
  return h(props.element || "div", componentProps, content);
};

exports._Ripple = _Ripple;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/cyano-mithril/dist/cyano-mithril.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useState = exports.useRef = exports.useReducer = exports.useMemo = exports.useLayoutEffect = exports.useEffect = exports.useCallback = exports.jsx = exports.h = exports.getRef = exports.cast = exports.a = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var currentState;
var call = Function.prototype.call.bind(Function.prototype.call);

var scheduleRender = function scheduleRender() {
  return (// Call m within the function body so environments with a global instance of m (like flems.io) don't complain
    _mithril.default.redraw()
  );
};

var updateDeps = function updateDeps(deps) {
  var state = currentState;
  var depsIndex = state.depsIndex++;
  var prevDeps = state.depsStates[depsIndex] || [];
  var shouldRecompute = deps === undefined ? true // Always compute
  : Array.isArray(deps) ? deps.length > 0 ? !deps.every(function (x, i) {
    return x === prevDeps[i];
  }) // Only compute when one of the deps has changed
  : !state.setup // Empty array: only compute at mount
  : false; // Invalid value, do nothing

  state.depsStates[depsIndex] = deps;
  return shouldRecompute;
};

var effect = function effect() {
  var isAsync = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  return function (fn, deps) {
    var state = currentState;
    var shouldRecompute = updateDeps(deps);

    if (shouldRecompute) {
      var depsIndex = state.depsIndex;

      var runCallbackFn = function runCallbackFn() {
        var teardown = fn(); // A callback may return a function. If any, add it to the teardowns:

        if (typeof teardown === "function") {
          // Store this this function to be called at cleanup and unmount
          state.teardowns.set(depsIndex, teardown); // At unmount, call re-render at least once

          state.teardowns.set("_", scheduleRender);
        }
      }; // First clean up any previous cleanup function


      var teardown = state.teardowns.get(depsIndex);

      try {
        if (typeof teardown === "function") {
          teardown();
        }
      } finally {
        state.teardowns["delete"](depsIndex);
      }

      state.updates.push(isAsync ? function () {
        return new Promise(function (resolve) {
          return requestAnimationFrame(resolve);
        }).then(runCallbackFn);
      } : runCallbackFn);
    }
  };
};

var updateState = function updateState(initialValue) {
  var newValueFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (value) {
    return value;
  };
  var state = currentState;
  var index = state.statesIndex++;

  if (!state.setup) {
    state.states[index] = initialValue;
  }

  return [state.states[index], function (value) {
    var previousValue = state.states[index];
    var newValue = newValueFn(value, index);
    state.states[index] = newValue;

    if (JSON.stringify(newValue) !== JSON.stringify(previousValue)) {
      scheduleRender(); // Calling redraw multiple times: Mithril will drop extraneous redraw calls, so performance should not be an issue
    }
  }, index];
};

var useState = function useState(initialValue) {
  var state = currentState;

  var newValueFn = function newValueFn(value, index) {
    return typeof value === "function" ? value(state.states[index]) : value;
  };

  return updateState(initialValue, newValueFn);
};

exports.useState = useState;
var useEffect = effect(true);
exports.useEffect = useEffect;
var useLayoutEffect = effect();
exports.useLayoutEffect = useLayoutEffect;

var useReducer = function useReducer(reducer, initialArg, initFn) {
  var state = currentState; // From the React docs: You can also create the initial state lazily. To do this, you can pass an init function as the third argument. The initial state will be set to init(initialArg).

  var initialValue = !state.setup && initFn ? initFn(initialArg) : initialArg;

  var getValueDispatch = function getValueDispatch() {
    var _updateState = updateState(initialValue),
        _updateState2 = _slicedToArray(_updateState, 3),
        value = _updateState2[0],
        setValue = _updateState2[1],
        index = _updateState2[2];

    var dispatch = function dispatch(action) {
      var previousValue = state.states[index];
      return setValue( // Next state:
      reducer(previousValue, action));
    };

    return [value, dispatch];
  };

  return getValueDispatch();
};

exports.useReducer = useReducer;

var useRef = function useRef(initialValue) {
  // A ref is a persisted object that will not be updated, so it has no setter
  var _updateState3 = updateState({
    current: initialValue
  }),
      _updateState4 = _slicedToArray(_updateState3, 1),
      value = _updateState4[0];

  return value;
};

exports.useRef = useRef;

var useMemo = function useMemo(fn, deps) {
  var state = currentState;
  var shouldRecompute = updateDeps(deps);

  var _ref = !state.setup ? updateState(fn()) : updateState(),
      _ref2 = _slicedToArray(_ref, 2),
      memoized = _ref2[0],
      setMemoized = _ref2[1];

  if (state.setup && shouldRecompute) {
    setMemoized(fn());
  }

  return memoized;
};

exports.useMemo = useMemo;

var useCallback = function useCallback(fn, deps) {
  return useMemo(function () {
    return fn;
  }, deps);
};

exports.useCallback = useCallback;

var withHooks = function withHooks(component, initialProps) {
  var init = function init(vnode) {
    _extends(vnode.state, {
      setup: false,
      states: [],
      statesIndex: 0,
      depsStates: [],
      depsIndex: 0,
      updates: [],
      cleanups: new Map(),
      teardowns: new Map() // Keep track of teardowns even when the update was run only once

    });
  };

  var update = function update(vnode) {
    var prevState = currentState;
    currentState = vnode.state;

    try {
      vnode.state.updates.forEach(call);
    } finally {
      _extends(vnode.state, {
        setup: true,
        updates: [],
        depsIndex: 0,
        statesIndex: 0
      });

      currentState = prevState;
    }
  };

  var render = function render(vnode) {
    var prevState = currentState;
    currentState = vnode.state;

    try {
      return component(_objectSpread2({}, initialProps, {}, vnode.attrs, {
        vnode: vnode,
        children: vnode.children
      }));
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
    } finally {
      currentState = prevState;
    }
  };

  var teardown = function teardown(vnode) {
    var prevState = currentState;
    currentState = vnode.state;

    try {
      _toConsumableArray(vnode.state.teardowns.values()).forEach(call);
    } finally {
      currentState = prevState;
    }
  };

  return {
    oninit: init,
    oncreate: update,
    onupdate: update,
    view: render,
    onremove: teardown
  };
};

var htmlAttributes = {
  accept: "accept",
  acceptcharset: "acceptcharset",
  accesskey: "accesskey",
  action: "action",
  allowfullscreen: "allowfullscreen",
  allowtransparency: "allowtransparency",
  alt: "alt",
  async: "async",
  autocomplete: "autocomplete",
  autofocus: "autofocus",
  autoplay: "autoplay",
  capture: "capture",
  cellpadding: "cellpadding",
  cellspacing: "cellspacing",
  challenge: "challenge",
  charset: "charset",
  checked: "checked",
  "class": "className",
  classid: "classid",
  classname: "className",
  // Special case:
  className: "className",
  colspan: "colspan",
  cols: "cols",
  content: "content",
  contenteditable: "contenteditable",
  contextmenu: "contextmenu",
  controls: "controls",
  coords: "coords",
  crossorigin: "crossorigin",
  data: "data",
  datetime: "datetime",
  "default": "default",
  defer: "defer",
  dir: "dir",
  disabled: "disabled",
  download: "download",
  draggable: "draggable",
  enctype: "enctype",
  form: "form",
  formaction: "formaction",
  formenctype: "formenctype",
  formmethod: "formmethod",
  formnovalidate: "formnovalidate",
  formtarget: "formtarget",
  frameborder: "frameborder",
  headers: "headers",
  height: "height",
  hidden: "hidden",
  high: "high",
  href: "href",
  hreflang: "hreflang",
  htmlfor: "htmlfor",
  httpequiv: "httpequiv",
  icon: "icon",
  id: "id",
  inputmode: "inputmode",
  integrity: "integrity",
  is: "is",
  keyparams: "keyparams",
  keytype: "keytype",
  kind: "kind",
  label: "label",
  lang: "lang",
  list: "list",
  loop: "loop",
  low: "low",
  manifest: "manifest",
  marginheight: "marginheight",
  marginwidth: "marginwidth",
  max: "max",
  maxlength: "maxlength",
  media: "media",
  mediagroup: "mediagroup",
  method: "method",
  min: "min",
  minlength: "minlength",
  multiple: "multiple",
  muted: "muted",
  name: "name",
  novalidate: "novalidate",
  nonce: "nonce",
  onblur: "onblur",
  onchange: "onchange",
  onclick: "onclick",
  onfocus: "onfocus",
  oninput: "oninput",
  onkeydown: "onkeydown",
  onkeyup: "onkeyup",
  onmousedown: "onmousedown",
  onmouseout: "onmouseout",
  onmouseover: "onmouseover",
  onmouseup: "onmouseup",
  onscroll: "onscroll",
  onsubmit: "onsubmit",
  ontouchend: "ontouchend",
  ontouchmove: "ontouchmove",
  ontouchstart: "ontouchstart",
  open: "open",
  optimum: "optimum",
  pattern: "pattern",
  placeholder: "placeholder",
  poster: "poster",
  preload: "preload",
  radiogroup: "radiogroup",
  readonly: "readonly",
  rel: "rel",
  required: "required",
  reversed: "reversed",
  role: "role",
  rowspan: "rowspan",
  rows: "rows",
  sandbox: "sandbox",
  scope: "scope",
  scoped: "scoped",
  scrolling: "scrolling",
  seamless: "seamless",
  selected: "selected",
  shape: "shape",
  size: "size",
  sizes: "sizes",
  span: "span",
  spellcheck: "spellcheck",
  src: "src",
  srcdoc: "srcdoc",
  srclang: "srclang",
  srcset: "srcset",
  start: "start",
  step: "step",
  style: "style",
  summary: "summary",
  tabindex: "tabindex",
  target: "target",
  title: "title",
  type: "type",
  usemap: "usemap",
  value: "value",
  width: "width",
  wmode: "wmode",
  wrap: "wrap"
};
var a = htmlAttributes;
exports.a = a;
var h = _mithril.default || {};
exports.h = h;
var trust = h.trust;

h.trust = function (html, wrapper) {
  return wrapper ? (0, _mithril.default)(wrapper, trust(html)) : trust(html);
};

h.displayName = "mithril";
h.fragment = _mithril.default.fragment;
var jsx = _mithril.default;
exports.jsx = jsx;

var getRef = function getRef(fn) {
  return {
    oncreate: function oncreate(vnode) {
      return fn(vnode.dom);
    }
  };
};

exports.getRef = getRef;
var cast = withHooks;
exports.cast = cast;
},{"mithril":"../node_modules/mithril/index.js"}],"../node_modules/polythene-mithril-ripple/dist/polythene-mithril-ripple.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ripple = void 0;

var _polytheneCoreRipple = require("polythene-core-ripple");

var _cyanoMithril = require("cyano-mithril");

var Ripple = (0, _cyanoMithril.cast)(_polytheneCoreRipple._Ripple, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  getRef: _cyanoMithril.getRef,
  useRef: _cyanoMithril.useRef,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect
});
exports.Ripple = Ripple;
Ripple["displayName"] = "Ripple";
},{"polythene-core-ripple":"../node_modules/polythene-core-ripple/dist/polythene-core-ripple.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-core-icon/dist/polythene-core-icon.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._Icon = void 0;

var _polytheneCore = require("polythene-core");

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

var classes = {
  component: "pe-icon",
  // states
  avatar: "pe-icon--avatar",
  large: "pe-icon--large",
  medium: "pe-icon--medium",
  regular: "pe-icon--regular",
  small: "pe-icon--small"
};

var _Icon = function _Icon(_ref) {
  var h = _ref.h,
      a = _ref.a,
      SVG = _ref.SVG,
      props = _objectWithoutProperties(_ref, ["h", "a", "SVG"]);

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.component, (0, _polytheneCore.classForSize)(classes, props.size), props.avatar ? classes.avatar : null, props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  }, props.events);

  var content = [props.before, props.content ? props.content : props.svg ? h(SVG, props.svg) : props.src ? h("img", {
    src: props.src
  }) : props.children, props.after];
  return h(props.element || "div", componentProps, content);
};

exports._Icon = _Icon;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-core-svg/dist/polythene-core-svg.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._SVG = void 0;

var _polytheneCore = require("polythene-core");

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var classes = {
  component: "pe-svg"
};

var _SVG = function _SVG(_ref) {
  var h = _ref.h,
      a = _ref.a,
      useEffect = _ref.useEffect,
      useState = _ref.useState,
      getRef = _ref.getRef,
      props = _objectWithoutProperties(_ref, ["h", "a", "useEffect", "useState", "getRef"]);

  var _useState = useState(),
      _useState2 = _slicedToArray(_useState, 2),
      domElement = _useState2[0],
      setDomElement = _useState2[1];

  useEffect(function () {
    if (!domElement) {
      return;
    } // Prevent that SVG gets keyboard focus


    var svgElement = domElement.querySelector("svg");

    if (svgElement) {
      svgElement.setAttribute("focusable", "false");
    }
  }, [domElement]);

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), getRef(function (dom) {
    return dom && !domElement && (setDomElement(dom), props.getRef && props.getRef(dom));
  }), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.component, props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  });

  var content = [props.before, props.content ? props.content : props.children, props.after];
  return h(props.element || "div", componentProps, content);
};

exports._SVG = _SVG;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-mithril-svg/dist/polythene-mithril-svg.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SVG = void 0;

var _polytheneCoreSvg = require("polythene-core-svg");

var _cyanoMithril = require("cyano-mithril");

var SVG = (0, _cyanoMithril.cast)(_polytheneCoreSvg._SVG, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  useEffect: _cyanoMithril.useEffect,
  useState: _cyanoMithril.useState,
  getRef: _cyanoMithril.getRef
});
exports.SVG = SVG;
},{"polythene-core-svg":"../node_modules/polythene-core-svg/dist/polythene-core-svg.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-mithril-icon/dist/polythene-mithril-icon.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Icon = void 0;

var _polytheneCoreIcon = require("polythene-core-icon");

var _polytheneMithrilSvg = require("polythene-mithril-svg");

var _cyanoMithril = require("cyano-mithril");

var Icon = (0, _cyanoMithril.cast)(_polytheneCoreIcon._Icon, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  SVG: _polytheneMithrilSvg.SVG
});
exports.Icon = Icon;
Icon["displayName"] = "Icon";
},{"polythene-core-icon":"../node_modules/polythene-core-icon/dist/polythene-core-icon.mjs","polythene-mithril-svg":"../node_modules/polythene-mithril-svg/dist/polythene-mithril-svg.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-mithril-shadow/dist/polythene-mithril-shadow.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Shadow = void 0;

var _polytheneCoreShadow = require("polythene-core-shadow");

var _cyanoMithril = require("cyano-mithril");

var Shadow = (0, _cyanoMithril.cast)(_polytheneCoreShadow._Shadow, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a
});
exports.Shadow = Shadow;
Shadow["displayName"] = "Shadow";
},{"polythene-core-shadow":"../node_modules/polythene-core-shadow/dist/polythene-core-shadow.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-mithril-button/dist/polythene-mithril-button.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Button = void 0;

var _polytheneCoreButton = require("polythene-core-button");

var _polytheneMithrilRipple = require("polythene-mithril-ripple");

var _polytheneMithrilIcon = require("polythene-mithril-icon");

var _polytheneMithrilShadow = require("polythene-mithril-shadow");

var _cyanoMithril = require("cyano-mithril");

var Button = (0, _cyanoMithril.cast)(_polytheneCoreButton._Button, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  getRef: _cyanoMithril.getRef,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect,
  useRef: _cyanoMithril.useRef,
  Ripple: _polytheneMithrilRipple.Ripple,
  Shadow: _polytheneMithrilShadow.Shadow,
  Icon: _polytheneMithrilIcon.Icon
});
exports.Button = Button;
},{"polythene-core-button":"../node_modules/polythene-core-button/dist/polythene-core-button.mjs","polythene-mithril-ripple":"../node_modules/polythene-mithril-ripple/dist/polythene-mithril-ripple.mjs","polythene-mithril-icon":"../node_modules/polythene-mithril-icon/dist/polythene-mithril-icon.mjs","polythene-mithril-shadow":"../node_modules/polythene-mithril-shadow/dist/polythene-mithril-shadow.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-core-button-group/dist/polythene-core-button-group.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._ButtonGroup = void 0;

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

var classes = {
  component: "pe-button-group"
};

var _ButtonGroup = function _ButtonGroup(_ref) {
  var h = _ref.h,
      a = _ref.a,
      props = _objectWithoutProperties(_ref, ["h", "a"]);

  var componentProps = _extends({}, props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.component, props.className || props[a["class"]]].join(" ")
  });

  return h(props.element || "div", componentProps, props.children);
};

exports._ButtonGroup = _ButtonGroup;
},{}],"../node_modules/polythene-mithril-button-group/dist/polythene-mithril-button-group.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ButtonGroup = void 0;

var _cyanoMithril = require("cyano-mithril");

var _polytheneCoreButtonGroup = require("polythene-core-button-group");

var ButtonGroup = (0, _cyanoMithril.cast)(_polytheneCoreButtonGroup._ButtonGroup, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a
});
exports.ButtonGroup = ButtonGroup;
ButtonGroup["displayName"] = "ButtonGroup";
},{"cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs","polythene-core-button-group":"../node_modules/polythene-core-button-group/dist/polythene-core-button-group.mjs"}],"../node_modules/polythene-core-card/dist/polythene-core-card.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._CardPrimary = exports._CardMedia = exports._CardActions = exports._Card = void 0;

var _polytheneCore = require("polythene-core");

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var classes = {
  component: "pe-card",
  // elements
  actions: "pe-card__actions",
  any: "pe-card__any",
  content: "pe-card__content",
  header: "pe-card__header",
  headerTitle: "pe-card__header-title",
  media: "pe-card__media",
  mediaDimmer: "pe-card__media__dimmer",
  overlay: "pe-card__overlay",
  overlayContent: "pe-card__overlay__content",
  primary: "pe-card__primary",
  primaryMedia: "pe-card__primary-media",
  subtitle: "pe-card__subtitle",
  text: "pe-card__text",
  title: "pe-card__title",
  // states
  actionsBorder: "pe-card__actions--border",
  actionsHorizontal: "pe-card__actions--horizontal",
  actionsJustified: "pe-card__actions--justified",
  actionsTight: "pe-card__actions--tight",
  actionsVertical: "pe-card__actions--vertical",
  mediaCropX: "pe-card__media--crop-x",
  mediaCropY: "pe-card__media--crop-y",
  mediaOriginStart: "pe-card__media--origin-start",
  mediaOriginCenter: "pe-card__media--origin-center",
  mediaOriginEnd: "pe-card__media--origin-end",
  mediaLarge: "pe-card__media--large",
  mediaMedium: "pe-card__media--medium",
  mediaRatioLandscape: "pe-card__media--landscape",
  mediaRatioSquare: "pe-card__media--square",
  mediaRegular: "pe-card__media--regular",
  mediaSmall: "pe-card__media--small",
  overlaySheet: "pe-card__overlay--sheet",
  primaryHasMedia: "pe-card__primary--media",
  primaryTight: "pe-card__primary--tight",
  textTight: "pe-card__text--tight"
};

var createOverlay = function createOverlay(_ref) {
  var dispatcher = _ref.dispatcher,
      props = _ref.props,
      h = _ref.h,
      a = _ref.a;
  var element = props.element || "div";
  var content = props.content.map(dispatcher);
  return h("div", {
    style: props.style,
    className: [classes.overlay, props.sheet ? classes.overlaySheet : null, props.tone === "light" ? null : "pe-dark-tone", // default dark tone
    props.tone === "light" ? "pe-light-tone" : null].join(" ")
  }, [h(element, {
    className: [classes.overlayContent, props.className || props[a["class"]]].join(" ")
  }, content), h("div", {
    className: classes.mediaDimmer
  })]);
};

var createAny = function createAny(_ref2) {
  var props = _ref2.props,
      h = _ref2.h,
      a = _ref2.a;
  var element = props.element || "div";
  return h(element, _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), {
    className: [classes.any, props.tight ? classes.textTight : null, props.className || props[a["class"]]].join(" ")
  }), props.content);
};

var createText = function createText(_ref3) {
  var props = _ref3.props,
      h = _ref3.h,
      a = _ref3.a;
  var element = props.element || "div";
  return h(element, _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), {
    className: [classes.text, props.tight ? classes.textTight : null, props.className || props[a["class"]]].join(" ")
  }, props.events), props.content);
};

var createHeader = function createHeader(_ref4) {
  var props = _ref4.props,
      h = _ref4.h,
      a = _ref4.a,
      Icon = _ref4.Icon,
      ListTile = _ref4.ListTile;
  return h(ListTile, _extends({}, props, {
    className: [classes.header, props.className || props[a["class"]]].join(" ")
  }, props.icon ? {
    front: h(Icon, props.icon)
  } : null));
};

var _Card = function _Card(_ref5) {
  var h = _ref5.h,
      a = _ref5.a,
      CardActions = _ref5.CardActions,
      CardMedia = _ref5.CardMedia,
      CardPrimary = _ref5.CardPrimary,
      Icon = _ref5.Icon,
      ListTile = _ref5.ListTile,
      Shadow = _ref5.Shadow,
      props = _objectWithoutProperties(_ref5, ["h", "a", "CardActions", "CardMedia", "CardPrimary", "Icon", "ListTile", "Shadow"]);

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.component, props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  }, props.url, props.events);

  var dispatcher = function dispatcher(block) {
    var blockName = Object.keys(block)[0];

    var props = _extends({}, block[blockName], {
      dispatcher: dispatcher,
      key: undefined
    });

    switch (blockName) {
      case "actions":
        return h(CardActions, props);

      case "header":
        return createHeader({
          props: props,
          h: h,
          a: a,
          Icon: Icon,
          ListTile: ListTile
        });

      case "media":
        return h(CardMedia, props);

      case "overlay":
        return createOverlay({
          dispatcher: dispatcher,
          props: props,
          h: h,
          a: a
        });

      case "primary":
        return h(CardPrimary, props);

      case "text":
        return createText({
          props: props,
          h: h,
          a: a
        });

      case "any":
        return createAny({
          props: props,
          h: h,
          a: a
        });

      default:
        throw "Content type \"".concat(blockName, "\" does not exist");
    }
  };

  var blocks = Array.isArray(props.content) ? props.content.map(dispatcher) : [props.content]; // deprecated;

  var componentContent = [props.before].concat(_toConsumableArray(blocks), [props.after]);
  var shadowDepth = props.shadowDepth !== undefined ? props.shadowDepth : props.z; // deprecated

  var content = [h(Shadow, {
    shadowDepth: shadowDepth !== undefined ? shadowDepth : 1,
    animated: true
  }), h("div", {
    className: classes.content
  }, componentContent), props.children];
  var element = props.element || props.url ? "a" : "div";
  return h(element, componentProps, content);
};

exports._Card = _Card;
var imageRatios = {
  landscape: 16 / 9,
  square: 1
};
var mediaSizeClasses = {
  small: classes.mediaSmall,
  regular: classes.mediaRegular,
  medium: classes.mediaMedium,
  large: classes.mediaLarge
};

var mediaSizeClass = function mediaSizeClass() {
  var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "regular";
  return mediaSizeClasses[size];
};

var initImage = function initImage(_ref) {
  var dom = _ref.dom,
      src = _ref.src,
      ratio = _ref.ratio,
      origin = _ref.origin;
  var img = new Image();

  img.onload = function () {
    // use a background image on the image container
    if (img.tagName === "IMG") {
      dom.style.backgroundImage = "url(".concat(img.src, ")");
    }

    var naturalRatio = this.naturalWidth / this.naturalHeight; // crop-x: crop over x axis
    // crop-y: crop over y axis

    var cropClass = naturalRatio < imageRatios[ratio] ? classes.mediaCropX : classes.mediaCropY;
    dom.classList.add(cropClass);
    var originClass = origin === "start" ? classes.mediaOriginStart : origin === "end" ? classes.mediaOriginEnd : classes.mediaOriginCenter;
    dom.classList.add(originClass);
  };

  img.src = src;
};

var _CardMedia = function _CardMedia(_ref2) {
  var h = _ref2.h,
      a = _ref2.a,
      useEffect = _ref2.useEffect,
      useState = _ref2.useState,
      getRef = _ref2.getRef,
      props = _objectWithoutProperties(_ref2, ["h", "a", "useEffect", "useState", "getRef"]);

  var _useState = useState(),
      _useState2 = _slicedToArray(_useState, 2),
      domElement = _useState2[0],
      setDomElement = _useState2[1];

  var ratio = props.ratio || "landscape";
  useEffect(function () {
    if (!domElement) {
      return;
    }

    var ratio = props.ratio || "landscape";
    var origin = props.origin || "center";
    var img = domElement.querySelector("img") || domElement.querySelector("iframe");
    initImage({
      dom: domElement,
      src: img.src,
      ratio: ratio,
      origin: origin
    });
  }, [domElement]);

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), getRef(function (dom) {
    return dom && !domElement && setDomElement(dom);
  }), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.media, mediaSizeClass(props.size), ratio === "landscape" ? classes.mediaRatioLandscape : classes.mediaRatioSquare, props.className || props[a["class"]]].join(" ")
  }, props.events);

  var dispatcher = props.dispatcher;
  var content = [props.content, props.overlay ? dispatcher({
    overlay: props.overlay
  }) : props.showDimmer && h("div", {
    className: classes.mediaDimmer
  })];
  return h(props.element || "div", componentProps, content);
};

exports._CardMedia = _CardMedia;
var buttonClasses = {
  component: "pe-text-button",
  "super": "pe-button",
  row: "pe-button-row",
  // elements      
  content: "pe-button__content",
  label: "pe-button__label",
  textLabel: "pe-button__text-label",
  wash: "pe-button__wash",
  washColor: "pe-button__wash-color",
  dropdown: "pe-button__dropdown",
  // states      
  border: "pe-button--border",
  contained: "pe-button--contained",
  disabled: "pe-button--disabled",
  dropdownClosed: "pe-button--dropdown-closed",
  dropdownOpen: "pe-button--dropdown-open",
  extraWide: "pe-button--extra-wide",
  hasDropdown: "pe-button--dropdown",
  highLabel: "pe-button--high-label",
  inactive: "pe-button--inactive",
  raised: "pe-button--raised",
  selected: "pe-button--selected",
  separatorAtStart: "pe-button--separator-start",
  hasHover: "pe-button--has-hover"
};
var actionLayoutClasses = {
  horizontal: classes.actionsHorizontal,
  vertical: classes.actionsVertical,
  justified: classes.actionsJustified
};

var actionClassForLayout = function actionClassForLayout() {
  var layout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "horizontal";
  return actionLayoutClasses[layout];
};

var _CardActions = function _CardActions(_ref) {
  var h = _ref.h,
      a = _ref.a,
      props = _objectWithoutProperties(_ref, ["h", "a"]);

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.actions, props.layout !== "vertical" ? buttonClasses.row : null, actionClassForLayout(props.layout), props.border || props.bordered ? classes.actionsBorder : null, props.tight ? classes.actionsTight : null, props.className || props[a["class"]]].join(" ")
  }, props.events);

  var content = props.content || props.children;
  return h(props.element || "div", componentProps, content);
};

exports._CardActions = _CardActions;

var _CardPrimary = function _CardPrimary(_ref) {
  var h = _ref.h,
      a = _ref.a,
      props = _objectWithoutProperties(_ref, ["h", "a"]);

  var primaryHasMedia = Array.isArray(props.content) ? props.content.reduce(function (total, current) {
    return Object.keys(current)[0] === "media" ? true : total;
  }, false) : props.media || false;

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.primary, props.tight ? classes.primaryTight : null, primaryHasMedia ? classes.primaryHasMedia : null, props.className || props[a["class"]]].join(" ")
  }, props.events);

  var dispatcher = props.dispatcher;
  var primaryDispatch = {
    title: function title(pAttrs) {
      return pAttrs.attrs // Mithril
      || pAttrs.props // React
      ? pAttrs || pAttrs.props : h("div", {
        className: classes.title,
        style: pAttrs.style
      }, [pAttrs.title, pAttrs.subtitle ? h("div", {
        className: classes.subtitle
      }, pAttrs.subtitle) : null]);
    },
    media: function media(pAttrs) {
      return h("div", {
        className: classes.primaryMedia,
        style: pAttrs.style
      }, dispatcher({
        media: pAttrs
      }));
    },
    actions: function actions(pAttrs) {
      return dispatcher({
        actions: pAttrs
      });
    }
  };
  var content = Array.isArray(props.content) ? props.content.map(function (block) {
    var key = Object.keys(block)[0];
    var pAttrs = block[key];
    return primaryDispatch[key] ? primaryDispatch[key](pAttrs) : block;
  }) : [props.title ? primaryDispatch.title({
    title: props.title,
    subtitle: props.subtitle
  }) : null, props.media ? primaryDispatch.media(props.media) : null, props.actions ? primaryDispatch.actions(props.actions) : null, props.content];
  return h(props.element || "div", componentProps, content);
};

exports._CardPrimary = _CardPrimary;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-core-list-tile/dist/polythene-core-list-tile.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._ListTile = void 0;

var _polytheneCore = require("polythene-core");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

var classes = {
  component: "pe-list-tile",
  // elements
  content: "pe-list-tile__content",
  highSubtitle: "pe-list-tile__high-subtitle",
  primary: "pe-list-tile__primary",
  secondary: "pe-list-tile__secondary",
  subtitle: "pe-list-tile__subtitle",
  title: "pe-list-tile__title",
  contentFront: "pe-list-tile__content-front",
  // states  
  compact: "pe-list-tile--compact",
  compactFront: "pe-list-tile--compact-front",
  disabled: "pe-list-tile--disabled",
  hasFront: "pe-list-tile--front",
  hasHighSubtitle: "pe-list-tile--high-subtitle",
  hasSubtitle: "pe-list-tile--subtitle",
  header: "pe-list-tile--header",
  hoverable: "pe-list-tile--hoverable",
  insetH: "pe-list-tile--inset-h",
  insetV: "pe-list-tile--inset-v",
  selectable: "pe-list-tile--selectable",
  selected: "pe-list-tile--selected",
  rounded: "pe-list-tile--rounded",
  highlight: "pe-list-tile--highlight",
  sticky: "pe-list-tile--sticky",
  navigation: "pe-list-tile--navigation"
};

var _ListTile = function _ListTile(_ref) {
  var h = _ref.h,
      a = _ref.a,
      Ripple = _ref.Ripple,
      Icon = _ref.Icon,
      props = _objectWithoutProperties(_ref, ["h", "a", "Ripple", "Icon"]); // Remove unused props


  delete props.key;
  var hasTabIndex = !props.header && !props.url && !(props.secondary && props.secondary.url);
  var heightClass = props.subtitle ? classes.hasSubtitle : props.highSubtitle ? classes.hasHighSubtitle : props.front || props.indent ? classes.hasFront : null;

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props, {
    remove: ["tabindex", "tabIndex"]
  }), // tabindex is set elsewhere
  props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.component, props.selected ? classes.selected : null, props.disabled ? classes.disabled : null, props.sticky ? classes.sticky : null, props.compact ? classes.compact : null, props.hoverable ? classes.hoverable : null, props.selectable ? classes.selectable : null, props.highlight ? classes.highlight : null, props.rounded ? classes.rounded : null, props.header ? classes.header : null, props.inset || props.insetH ? classes.insetH : null, props.inset || props.insetV ? classes.insetV : null, props.navigation ? classes.navigation : null, props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, heightClass, props.className || props[a["class"]]].join(" ")
  }, hasTabIndex && _defineProperty({}, a.tabindex, props[a.tabindex] || 0) // events and url are attached to primary content to not interfere with controls
  );

  var primaryProps = props;
  delete primaryProps.id;
  delete primaryProps[a["class"]];
  var componentContent = [props.ink && !props.disabled ? h(Ripple, _extends({}, props.ripple)) : null, primaryContent({
    h: h,
    a: a,
    props: primaryProps
  }), props.secondary ? secondaryContent({
    h: h,
    a: a,
    Icon: Icon,
    props: props.secondary
  }) : null];
  var content = [props.before].concat(componentContent, [props.after]);
  return h("div", // because primary or secondary content can be an "a", the container is always defined as "div", and option `element` is passed to primary content
  componentProps, content);
};

exports._ListTile = _ListTile;

var primaryContent = function primaryContent(_ref3) {
  var h = _ref3.h,
      a = _ref3.a,
      props = _ref3.props;
  var url = props.keyboardControl ? null : props.url;
  var element = props.element ? props.element : url ? "a" : "div";
  var contentFrontClass = [classes.content, classes.contentFront, props.compactFront ? classes.compactFront : null].join(" ");
  var frontComp = props.front || props.indent ? h("div", _extends({}, {
    className: contentFrontClass
  }), props.front) : null;
  var hasTabIndex = !props.header && props.url;

  var elementProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), props.events, {
    className: classes.primary,
    style: null
  }, hasTabIndex && _defineProperty({}, a.tabindex, props[a.tabindex] || 0), url);

  var content = props.content ? props.content : [frontComp, h("div", {
    className: classes.content,
    style: props.style
  }, [props.title && !props.content ? h("div", _extends({}, {
    className: classes.title
  }), props.title) : null, props.subtitle ? h("div", _extends({}, {
    className: classes.subtitle
  }), props.subtitle) : null, props.highSubtitle ? h("div", _extends({}, {
    className: classes.subtitle + " " + classes.highSubtitle
  }), props.highSubtitle) : null, props.subContent ? h("div", _extends({}, {
    className: classes.subContent
  }), props.subContent) : null, props.children])];
  return h(element, elementProps, content);
};

var secondaryContent = function secondaryContent(_ref5) {
  var h = _ref5.h,
      a = _ref5.a,
      Icon = _ref5.Icon,
      _ref5$props = _ref5.props,
      props = _ref5$props === void 0 ? {} : _ref5$props;
  var url = props.keyboardControl ? null : props.url;
  var element = props.element ? props.element : url ? "a" : "div";
  var hasTabIndex = props.url;
  return h(element, _extends({}, url, {
    className: classes.secondary
  }, props.events, (0, _polytheneCore.filterSupportedAttributes)(props), hasTabIndex && _defineProperty({}, a.tabindex, props[a.tabindex] || 0)), h("div", {
    className: classes.content
  }, [props.icon ? h(Icon, props.icon) : null, props.content ? props.content : null]));
};
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-mithril-list-tile/dist/polythene-mithril-list-tile.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListTile = void 0;

var _polytheneCoreListTile = require("polythene-core-list-tile");

var _polytheneMithrilIcon = require("polythene-mithril-icon");

var _polytheneMithrilRipple = require("polythene-mithril-ripple");

var _cyanoMithril = require("cyano-mithril");

var ListTile = (0, _cyanoMithril.cast)(_polytheneCoreListTile._ListTile, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  Icon: _polytheneMithrilIcon.Icon,
  Ripple: _polytheneMithrilRipple.Ripple
});
exports.ListTile = ListTile;
ListTile["displayName"] = "ListTile";
},{"polythene-core-list-tile":"../node_modules/polythene-core-list-tile/dist/polythene-core-list-tile.mjs","polythene-mithril-icon":"../node_modules/polythene-mithril-icon/dist/polythene-mithril-icon.mjs","polythene-mithril-ripple":"../node_modules/polythene-mithril-ripple/dist/polythene-mithril-ripple.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-mithril-card/dist/polythene-mithril-card.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Card = void 0;

var _polytheneCoreCard = require("polythene-core-card");

var _cyanoMithril = require("cyano-mithril");

var _polytheneMithrilIcon = require("polythene-mithril-icon");

var _polytheneMithrilListTile = require("polythene-mithril-list-tile");

var _polytheneMithrilShadow = require("polythene-mithril-shadow");

var CardActions = (0, _cyanoMithril.cast)(_polytheneCoreCard._CardActions, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a
});
CardActions["displayName"] = "CardActions";
var CardMedia = (0, _cyanoMithril.cast)(_polytheneCoreCard._CardMedia, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect,
  getRef: _cyanoMithril.getRef
});
CardMedia["displayName"] = "CardMedia";
var CardPrimary = (0, _cyanoMithril.cast)(_polytheneCoreCard._CardPrimary, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a
});
CardPrimary["displayName"] = "CardPrimary";
var Card = (0, _cyanoMithril.cast)(_polytheneCoreCard._Card, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  CardActions: CardActions,
  CardMedia: CardMedia,
  CardPrimary: CardPrimary,
  Icon: _polytheneMithrilIcon.Icon,
  ListTile: _polytheneMithrilListTile.ListTile,
  Shadow: _polytheneMithrilShadow.Shadow
});
exports.Card = Card;
Card["displayName"] = "Card";
},{"polythene-core-card":"../node_modules/polythene-core-card/dist/polythene-core-card.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs","polythene-mithril-icon":"../node_modules/polythene-mithril-icon/dist/polythene-mithril-icon.mjs","polythene-mithril-list-tile":"../node_modules/polythene-mithril-list-tile/dist/polythene-mithril-list-tile.mjs","polythene-mithril-shadow":"../node_modules/polythene-mithril-shadow/dist/polythene-mithril-shadow.mjs"}],"../node_modules/polythene-core-checkbox/dist/polythene-core-checkbox.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._Checkbox = void 0;

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

var classes = {
  component: "pe-checkbox-control"
};
var iconOn = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z\"/></svg>";
var iconOff = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z\"/></svg>";
var icons = {
  iconOff: iconOff,
  iconOn: iconOn
};

var _Checkbox = function _Checkbox(_ref) {
  var h = _ref.h,
      SelectionControl = _ref.SelectionControl,
      props = _objectWithoutProperties(_ref, ["h", "SelectionControl"]);

  var componentProps = _extends({}, props, {
    icons: icons,
    selectable: props.selectable || function () {
      return true;
    },
    // default: always selectable, regardless the checked state
    instanceClass: classes.component,
    type: "checkbox"
  });

  return h(SelectionControl, componentProps);
};

exports._Checkbox = _Checkbox;
},{}],"../node_modules/polythene-core-selection-control/dist/polythene-core-selection-control.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._ViewControl = exports._SelectionControl = void 0;

var _polytheneCore = require("polythene-core");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var classes = {
  component: "pe-control",
  // elements
  formLabel: "pe-control__form-label",
  input: "pe-control__input",
  label: "pe-control__label",
  // states
  disabled: "pe-control--disabled",
  inactive: "pe-control--inactive",
  large: "pe-control--large",
  medium: "pe-control--medium",
  off: "pe-control--off",
  on: "pe-control--on",
  regular: "pe-control--regular",
  small: "pe-control--small",
  // control view elements
  box: "pe-control__box",
  button: "pe-control__button",
  // control view states
  buttonOff: "pe-control__button--off",
  buttonOn: "pe-control__button--on"
};

var _SelectionControl = function _SelectionControl(_ref) {
  var h = _ref.h,
      a = _ref.a,
      useState = _ref.useState,
      useEffect = _ref.useEffect,
      ViewControl = _ref.ViewControl,
      props = _objectWithoutProperties(_ref, ["h", "a", "useState", "useEffect", "ViewControl"]); // remove unused props


  delete props.key;
  var defaultChecked = props.defaultChecked !== undefined ? props.defaultChecked : props.checked || false;

  var _useState = useState(defaultChecked),
      _useState2 = _slicedToArray(_useState, 2),
      previousIsChecked = _useState2[0],
      setIsChecked = _useState2[1];

  var _useState3 = useState(props.selectable),
      _useState4 = _slicedToArray(_useState3, 2),
      isSelectable = _useState4[0],
      setIsSelectable = _useState4[1];

  var isChecked = props.checked !== undefined ? props.checked : previousIsChecked;
  var inactive = props.disabled || !isSelectable; // define isSelectable
  // This variable is set in the next tick to allow button interaction (e.g. ripples) to show
  // before the button is set to inactive state

  useEffect(function () {
    var selectable = props.selectable !== undefined ? props.selectable(isChecked) : false;

    if (selectable !== isSelectable) {
      setIsSelectable(selectable);
    }
  }, [props.selectable, isChecked]);

  var notifyChange = function notifyChange(e, isChecked) {
    if (props.onChange) {
      props.onChange({
        event: e,
        checked: isChecked,
        value: props.value
      });
    }
  };

  var onChange = function onChange(e) {
    var isChecked = e.currentTarget.checked;
    if (props.type === "radio") ;else {
      setIsChecked(isChecked);
    }
    notifyChange(e, isChecked);
  };

  var toggle = function toggle(e) {
    var newChecked = !isChecked;
    setIsChecked(newChecked);
    notifyChange(e, newChecked);
  };

  var viewControlClickHandler = props.events && props.events[a.onclick];
  var viewControlKeyDownHandler = props.events && props.events[a.onkeydown] ? props.events[a.onkeydown] : function (e) {
    if (e.key === "Enter" || e.keyCode === 32) {
      e.preventDefault();

      if (viewControlClickHandler) {
        viewControlClickHandler(e);
      } else {
        toggle(e);
      }
    }
  };

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props, {
    remove: ["style"]
  }), // Set style on view control
  props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.component, props.instanceClass, // for instance pe-checkbox-control
    isChecked ? classes.on : classes.off, props.disabled ? classes.disabled : null, inactive ? classes.inactive : null, (0, _polytheneCore.classForSize)(classes, props.size), props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  });

  var content = h("label", _extends({}, {
    className: classes.formLabel
  }, viewControlClickHandler && _defineProperty({}, a.onclick, function (e) {
    return e.preventDefault(), viewControlClickHandler(e);
  })), [props.before, h(ViewControl, _extends({}, props, {
    inactive: inactive,
    checked: isChecked,
    events: _defineProperty({}, a.onkeydown, viewControlKeyDownHandler)
  })), props.label ? h(".".concat(classes.label), props.label) : null, h("input", _extends({}, props.events, {
    name: props.name,
    type: props.type,
    value: props.value,
    checked: isChecked
  }, props.disabled || inactive ? _defineProperty({}, a.readonly, "readonly") : _defineProperty({}, a.onchange, onChange))), props.after]);
  return h(props.element || "div", componentProps, content);
};

exports._SelectionControl = _SelectionControl;
var CONTENT = [{
  iconType: "iconOn",
  className: classes.buttonOn
}, {
  iconType: "iconOff",
  className: classes.buttonOff
}];

var createIcon = function createIcon(h, iconType, props, className) {
  return (// if props.iconOn/props.iconOff is passed, use that icon options object and ignore size
    // otherwise create a new object
    _extends({}, {
      className: className
    }, props[iconType] ? props[iconType] : {
      svg: {
        content: h.trust(props.icons[iconType])
      }
    }, props.icon, props.size ? {
      size: props.size
    } : null)
  );
};

var _ViewControl = function _ViewControl(_ref) {
  var h = _ref.h,
      Icon = _ref.Icon,
      IconButton = _ref.IconButton,
      props = _objectWithoutProperties(_ref, ["h", "Icon", "IconButton"]);

  var element = props.element || ".".concat(classes.box);
  var content = h(IconButton, _extends({}, {
    element: "div",
    className: classes.button,
    style: props.style,
    content: CONTENT.map(function (o) {
      return h(Icon, createIcon(h, o.iconType, props, o.className));
    }),
    ripple: {
      center: true
    },
    disabled: props.disabled,
    events: props.events,
    inactive: props.inactive
  }, props.iconButton // for example for hover behaviour
  ));
  return h(element, null, content);
};

exports._ViewControl = _ViewControl;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-core-icon-button/dist/polythene-core-icon-button.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._IconButton = void 0;

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

var classes = {
  component: "pe-button pe-icon-button",
  // elements
  content: "pe-icon-button__content",
  label: "pe-icon-button__label",
  // states
  compact: "pe-icon-button--compact"
};

var _IconButton = function _IconButton(_ref) {
  var h = _ref.h,
      Icon = _ref.Icon,
      Button = _ref.Button,
      props = _objectWithoutProperties(_ref, ["h", "Icon", "Button"]);

  var content = props.content ? props.content : props.icon ? h(Icon, props.icon) : props.children;

  var buttonProps = _extends({}, {
    content: h("div", {
      className: classes.content
    }, content),
    after: props.label && h("div", {
      className: classes.label
    }, props.label),
    parentClassName: [props.parentClassName || classes.component, props.compact ? classes.compact : null].join(" "),
    // defaults
    wash: false,
    animateOnTap: false
  }, props);

  return h(Button, buttonProps);
};

exports._IconButton = _IconButton;
},{}],"../node_modules/polythene-mithril-icon-button/dist/polythene-mithril-icon-button.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IconButton = void 0;

var _polytheneCoreIconButton = require("polythene-core-icon-button");

var _polytheneMithrilIcon = require("polythene-mithril-icon");

var _polytheneMithrilButton = require("polythene-mithril-button");

var _cyanoMithril = require("cyano-mithril");

var IconButton = (0, _cyanoMithril.cast)(_polytheneCoreIconButton._IconButton, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  Icon: _polytheneMithrilIcon.Icon,
  Button: _polytheneMithrilButton.Button
});
exports.IconButton = IconButton;
},{"polythene-core-icon-button":"../node_modules/polythene-core-icon-button/dist/polythene-core-icon-button.mjs","polythene-mithril-icon":"../node_modules/polythene-mithril-icon/dist/polythene-mithril-icon.mjs","polythene-mithril-button":"../node_modules/polythene-mithril-button/dist/polythene-mithril-button.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-mithril-checkbox/dist/polythene-mithril-checkbox.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Checkbox = void 0;

var _polytheneCoreCheckbox = require("polythene-core-checkbox");

var _polytheneCoreSelectionControl = require("polythene-core-selection-control");

var _cyanoMithril = require("cyano-mithril");

var _polytheneMithrilIcon = require("polythene-mithril-icon");

var _polytheneMithrilIconButton = require("polythene-mithril-icon-button");

var ViewControl = (0, _cyanoMithril.cast)(_polytheneCoreSelectionControl._ViewControl, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  Icon: _polytheneMithrilIcon.Icon,
  IconButton: _polytheneMithrilIconButton.IconButton
});
ViewControl["displayName"] = "ViewControl";
var SelectionControl = (0, _cyanoMithril.cast)(_polytheneCoreSelectionControl._SelectionControl, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect,
  ViewControl: ViewControl
});
SelectionControl["displayName"] = "SelectionControl";
var Checkbox = (0, _cyanoMithril.cast)(_polytheneCoreCheckbox._Checkbox, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  SelectionControl: SelectionControl
});
exports.Checkbox = Checkbox;
Checkbox["displayName"] = "Checkbox";
},{"polythene-core-checkbox":"../node_modules/polythene-core-checkbox/dist/polythene-core-checkbox.mjs","polythene-core-selection-control":"../node_modules/polythene-core-selection-control/dist/polythene-core-selection-control.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs","polythene-mithril-icon":"../node_modules/polythene-mithril-icon/dist/polythene-mithril-icon.mjs","polythene-mithril-icon-button":"../node_modules/polythene-mithril-icon-button/dist/polythene-mithril-icon-button.mjs"}],"../node_modules/polythene-core-dialog/dist/polythene-core-dialog.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openDialogsSelector = exports._Dialog = void 0;

var _polytheneCore = require("polythene-core");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var listTileClasses = {
  component: "pe-list-tile",
  // elements
  content: "pe-list-tile__content",
  highSubtitle: "pe-list-tile__high-subtitle",
  primary: "pe-list-tile__primary",
  secondary: "pe-list-tile__secondary",
  subtitle: "pe-list-tile__subtitle",
  title: "pe-list-tile__title",
  contentFront: "pe-list-tile__content-front",
  // states  
  compact: "pe-list-tile--compact",
  compactFront: "pe-list-tile--compact-front",
  disabled: "pe-list-tile--disabled",
  hasFront: "pe-list-tile--front",
  hasHighSubtitle: "pe-list-tile--high-subtitle",
  hasSubtitle: "pe-list-tile--subtitle",
  header: "pe-list-tile--header",
  hoverable: "pe-list-tile--hoverable",
  insetH: "pe-list-tile--inset-h",
  insetV: "pe-list-tile--inset-v",
  selectable: "pe-list-tile--selectable",
  selected: "pe-list-tile--selected",
  rounded: "pe-list-tile--rounded",
  highlight: "pe-list-tile--highlight",
  sticky: "pe-list-tile--sticky",
  navigation: "pe-list-tile--navigation"
};
var menuClasses = {
  component: "pe-menu",
  // elements
  panel: "pe-menu__panel",
  content: "pe-menu__content",
  placeholder: "pe-menu__placeholder",
  backdrop: "pe-menu__backdrop",
  // states
  floating: "pe-menu--floating",
  origin: "pe-menu--origin",
  permanent: "pe-menu--permanent",
  showBackdrop: "pe-menu--backdrop",
  visible: "pe-menu--visible",
  width_auto: "pe-menu--width-auto",
  width_n: "pe-menu--width-",
  isTopMenu: "pe-menu--top-menu",
  // lookup
  listTile: listTileClasses.component,
  selectedListTile: listTileClasses.selected
};
var classes = {
  component: "pe-dialog",
  // elements
  placeholder: "pe-dialog__placeholder",
  holder: "pe-dialog__holder",
  content: "pe-dialog__content",
  backdrop: "pe-dialog__backdrop",
  touch: "pe-dialog__touch",
  // states
  fullScreen: "pe-dialog--full-screen",
  modal: "pe-dialog--modal",
  open: "pe-dialog--open",
  // class set to html element
  visible: "pe-dialog--visible",
  // class set to dialog element
  showBackdrop: "pe-dialog--backdrop",
  transition: "pe-dialog--transition",
  // lookup
  menuContent: menuClasses.content
};
var DEFAULT_SHADOW_DEPTH = 3;
var openDialogsSelector = ".".concat(classes.component);
exports.openDialogsSelector = openDialogsSelector;

var createPane = function createPane(_ref) {
  var h = _ref.h,
      Pane = _ref.Pane,
      props = _ref.props;
  return h(Pane, {
    body: props.content || props.body || props.menu || props.children,
    element: props.element,
    borders: props.borders,
    className: props.className,
    footer: props.footer,
    footerButtons: props.footerButtons,
    formOptions: props.formOptions,
    fullBleed: props.fullBleed,
    header: props.header,
    style: props.style,
    title: props.title
  });
};

var _Dialog = function _Dialog(_ref2) {
  var h = _ref2.h,
      a = _ref2.a,
      useState = _ref2.useState,
      useEffect = _ref2.useEffect,
      useRef = _ref2.useRef,
      getRef = _ref2.getRef,
      useReducer = _ref2.useReducer,
      Pane = _ref2.Pane,
      Shadow = _ref2.Shadow,
      openDialogsSelector = _ref2.openDialogsSelector,
      props = _objectWithoutProperties(_ref2, ["h", "a", "useState", "useEffect", "useRef", "getRef", "useReducer", "Pane", "Shadow", "openDialogsSelector"]);

  var _useReducer = useReducer(_polytheneCore.transitionStateReducer, _polytheneCore.initialTransitionState),
      _useReducer2 = _slicedToArray(_useReducer, 2),
      transitionState = _useReducer2[0],
      dispatchTransitionState = _useReducer2[1];

  var _useState = useState(),
      _useState2 = _slicedToArray(_useState, 2),
      domElement = _useState2[0],
      setDomElement = _useState2[1];

  var backdropElRef = useRef();
  var touchElRef = useRef();
  var contentElRef = useRef();
  var isVisible = (transitionState || _polytheneCore.initialTransitionState).isVisible;
  var isTransitioning = (transitionState || _polytheneCore.initialTransitionState).isTransitioning;

  var transitionOptions = function transitionOptions(_ref3) {
    var isShow = _ref3.isShow,
        _ref3$hideDelay = _ref3.hideDelay,
        hideDelay = _ref3$hideDelay === void 0 ? props.hideDelay : _ref3$hideDelay,
        referrer = _ref3.referrer;
    return {
      transitionState: transitionState,
      dispatchTransitionState: dispatchTransitionState,
      instanceId: props.instanceId,
      props: _extends({}, props, {
        hideDelay: hideDelay
      }),
      isShow: isShow,
      domElements: {
        el: domElement,
        contentEl: contentElRef.current,
        backdropEl: backdropElRef.current
      },
      showClass: classes.visible,
      transitionClass: classes.transition,
      referrer: referrer
    };
  };

  var showDialog = function showDialog() {
    return (0, _polytheneCore.transitionComponent)(transitionOptions({
      isShow: true
    }));
  };

  var hideDialog = function hideDialog() {
    var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        hideDelay = _ref4.hideDelay,
        referrer = _ref4.referrer;

    return (0, _polytheneCore.transitionComponent)(transitionOptions({
      isShow: false,
      hideDelay: hideDelay,
      referrer: referrer
    }));
  };

  var isModal = function isModal() {
    return props.modal || domElement && domElement.classList.contains(classes.modal) || (0, _polytheneCore.stylePropCompare)({
      element: domElement,
      pseudoSelector: ":before",
      prop: "content",
      contains: "\"".concat("modal", "\"")
    });
  };

  var isFullScreen = function isFullScreen() {
    return props.fullScreen || domElement && domElement.classList.contains(classes.fullScreen) || (0, _polytheneCore.stylePropCompare)({
      element: domElement,
      pseudoSelector: ":before",
      prop: "content",
      contains: "\"".concat("full_screen", "\"")
    });
  }; // DOM elements


  useEffect(function () {
    if (!domElement) {
      return;
    }

    backdropElRef.current = domElement.querySelector(".".concat(classes.backdrop));
    touchElRef.current = domElement.querySelector(".".concat(classes.touch));
    contentElRef.current = domElement.querySelector(".".concat(classes.content));
  }, [domElement]); // Handle Escape key

  useEffect(function () {
    if (!domElement || props.inactive) {
      return;
    }

    var handleEscape = function handleEscape(e) {
      if (props.disableEscape && (isFullScreen() || isModal())) return;

      if (e.key === "Escape" || e.key === "Esc") {
        // "Esc" for IE11
        var openDialogs = document.querySelectorAll(openDialogsSelector);

        if (openDialogs[openDialogs.length - 1] === domElement) {
          hideDialog();
          (0, _polytheneCore.unsubscribe)("keydown", handleEscape);
        }
      }
    };

    (0, _polytheneCore.subscribe)("keydown", handleEscape);
    return function () {
      (0, _polytheneCore.unsubscribe)("keydown", handleEscape);
    };
  }, [domElement, props.inactive]); // Show / hide logic

  useEffect(function () {
    if (!domElement || isTransitioning) {
      return;
    }

    if (props.hide) {
      if (isVisible) {
        hideDialog();
      }
    } else if (props.show) {
      if (!isVisible) {
        showDialog();
      }
    }
  }, [domElement, isTransitioning, isVisible, props.hide, props.show]);

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props, {
    remove: ["style"]
  }), // style set in content, and set by show/hide transition
  getRef(function (dom) {
    return dom && !domElement && (setDomElement(dom), props.ref && props.ref(dom));
  }), _defineProperty({
    className: [props.parentClassName || classes.component, props.fromMultipleClassName, props.fullScreen ? classes.fullScreen : null, props.modal ? classes.modal : null, props.backdrop ? classes.showBackdrop : null, // classes.visible is set in showDialog though transition
    props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" "),
    "data-spawn-id": props.spawnId,
    // received from Multi
    "data-instance-id": props.instanceId
  }, a.onclick, function (e) {
    if (e.target !== domElement && e.target !== backdropElRef.current && e.target !== touchElRef.current) {
      return;
    }

    if (isModal()) {
      // not allowed
      return;
    }

    hideDialog();
  }));

  var pane = props.panesOptions && props.panesOptions.length ? h(Pane, props.panesOptions[0]) : props.panes && props.panes.length ? props.panes[0] : createPane({
    h: h,
    Pane: Pane,
    props: props
  });
  var shadowDepth = props.shadowDepth;
  var content = [h("div", {
    className: classes.backdrop
  }), h("div", {
    className: classes.touch
  }), h("div", {
    className: [classes.content, props.menu ? classes.menuContent : null].join(" ")
  }, [props.fullScreen ? null : h(Shadow, {
    shadowDepth: shadowDepth !== undefined ? shadowDepth : DEFAULT_SHADOW_DEPTH,
    animated: true
  }), props.before, pane, props.after])];
  return h("div", componentProps, content);
};

exports._Dialog = _Dialog;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-core-dialog-pane/dist/polythene-core-dialog-pane.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._DialogPane = void 0;

var _polytheneCore = require("polythene-core");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var classes = {
  component: "pe-dialog-pane",
  // elements
  actions: "pe-dialog-pane__actions",
  body: "pe-dialog-pane__body",
  content: "pe-dialog-pane__content",
  footer: "pe-dialog-pane__footer",
  header: "pe-dialog-pane__header",
  title: "pe-dialog-pane__title",
  // states
  withHeader: "pe-dialog-pane--header",
  withFooter: "pe-dialog-pane--footer",
  headerWithTitle: "pe-dialog-pane__header--title",
  footerWithButtons: "pe-dialog-pane__footer--buttons",
  footerHigh: "pe-dialog-pane__footer--high",
  borderBottom: "pe-dialog-pane--border-bottom",
  borderTop: "pe-dialog-pane--border-top",
  fullBleed: "pe-dialog-pane--body-full-bleed"
};
var buttonClasses = {
  component: "pe-text-button",
  "super": "pe-button",
  row: "pe-button-row",
  // elements      
  content: "pe-button__content",
  label: "pe-button__label",
  textLabel: "pe-button__text-label",
  wash: "pe-button__wash",
  washColor: "pe-button__wash-color",
  dropdown: "pe-button__dropdown",
  // states      
  border: "pe-button--border",
  contained: "pe-button--contained",
  disabled: "pe-button--disabled",
  dropdownClosed: "pe-button--dropdown-closed",
  dropdownOpen: "pe-button--dropdown-open",
  extraWide: "pe-button--extra-wide",
  hasDropdown: "pe-button--dropdown",
  highLabel: "pe-button--high-label",
  inactive: "pe-button--inactive",
  raised: "pe-button--raised",
  selected: "pe-button--selected",
  separatorAtStart: "pe-button--separator-start",
  hasHover: "pe-button--has-hover"
};
var SCROLL_WATCH_END_TIMER = 50;

var _DialogPane = function _DialogPane(_ref) {
  var h = _ref.h,
      a = _ref.a,
      useState = _ref.useState,
      useEffect = _ref.useEffect,
      useRef = _ref.useRef,
      getRef = _ref.getRef,
      unpackedProps = _objectWithoutProperties(_ref, ["h", "a", "useState", "useEffect", "useRef", "getRef"]);

  var props = (0, _polytheneCore.unpackAttrs)(unpackedProps);

  var _useState = useState(),
      _useState2 = _slicedToArray(_useState, 2),
      domElement = _useState2[0],
      setDomElement = _useState2[1];

  var _useState3 = useState(false),
      _useState4 = _slicedToArray(_useState3, 2),
      isScrolling = _useState4[0],
      setIsScrolling = _useState4[1];

  var _useState5 = useState(false),
      _useState6 = _slicedToArray(_useState5, 2),
      hasTopOverflow = _useState6[0],
      setHasTopOverflow = _useState6[1];

  var _useState7 = useState(false),
      _useState8 = _slicedToArray(_useState7, 2),
      hasBottomOverflow = _useState8[0],
      setHasBottomOverflow = _useState8[1];

  var headerElRef = useRef();
  var footerElRef = useRef();
  var scrollElRef = useRef();
  var scrollWatchIdRef = useRef();

  var updateScrollOverflowState = function updateScrollOverflowState() {
    var scroller = scrollElRef.current;

    if (!scroller) {
      return;
    }

    setHasTopOverflow(scroller.scrollTop > 0);
    setHasBottomOverflow(scroller.scrollHeight - (scroller.scrollTop + scroller.getBoundingClientRect().height) > 0);
  };

  useEffect(function () {
    if (!domElement) {
      return;
    }

    headerElRef.current = domElement.querySelector(".".concat(classes.header));
    footerElRef.current = domElement.querySelector(".".concat(classes.footer));
    scrollElRef.current = domElement.querySelector(".".concat(classes.body));
  }, [domElement]);
  useEffect(function () {
    if (!scrollElRef.current) {
      return;
    }

    var update = function update() {
      updateScrollOverflowState();
    };

    (0, _polytheneCore.subscribe)("resize", update);
    return function () {
      (0, _polytheneCore.unsubscribe)("resize", update);
    };
  }, [scrollElRef.current]);
  useEffect(function () {
    updateScrollOverflowState();
  }, [scrollElRef.current, isScrolling]);
  var withHeader = props.header !== undefined || props.title !== undefined;
  var withFooter = props.footer !== undefined || props.footerButtons !== undefined;
  var borders = props.borders || "overflow";
  var showTopBorder = borders === "always" || withHeader && borders === "overflow" && hasTopOverflow;
  var showBottomBorder = borders === "always" || withFooter && borders === "overflow" && hasBottomOverflow;

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props, {
    remove: ["style"]
  }), // style set in content, and set by show/hide transition
  props.testId && {
    "data-test-id": props.testId
  }, getRef(function (dom) {
    return dom && !domElement && (setDomElement(dom), props.ref && props.ref(dom));
  }), {
    className: [classes.component, props.fullBleed ? classes.fullBleed : null, showTopBorder ? classes.borderTop : null, showBottomBorder ? classes.borderBottom : null, withHeader ? classes.withHeader : null, withFooter ? classes.withFooter : null, props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  }, props.formOptions);

  var componentContent = h("div", {
    className: [classes.content, props.menu ? classes.menuContent : null].join(" "),
    style: props.style
  }, [props.header ? props.header : props.title ? h("div", {
    className: [classes.header, classes.headerWithTitle].join(" ")
  }, h("div", {
    className: classes.title
  }, props.title)) : null, h("div", _defineProperty({
    className: classes.body
  }, a.onscroll, function () {
    setIsScrolling(true);
    clearTimeout(scrollWatchIdRef.current);
    scrollWatchIdRef.current = setTimeout(function () {
      setIsScrolling(false);
    }, SCROLL_WATCH_END_TIMER);
  }), props.content || props.body || props.menu), props.footer ? h("div", {
    className: classes.footer
  }, props.footer) : props.footerButtons ? h("div", {
    className: [classes.footer, classes.footerWithButtons, buttonClasses.row].join(" ")
  }, h("div", {
    className: classes.actions
  }, props.footerButtons)) : null]);
  var content = [props.before, componentContent, props.after];
  return h(props.element || "form", componentProps, content);
};

exports._DialogPane = _DialogPane;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-mithril-dialog-pane/dist/polythene-mithril-dialog-pane.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DialogPane = void 0;

var _polytheneCoreDialogPane = require("polythene-core-dialog-pane");

var _cyanoMithril = require("cyano-mithril");

var DialogPane = (0, _cyanoMithril.cast)(_polytheneCoreDialogPane._DialogPane, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect,
  useRef: _cyanoMithril.useRef,
  getRef: _cyanoMithril.getRef
});
exports.DialogPane = DialogPane;
DialogPane["displayName"] = "DialogPane";
},{"polythene-core-dialog-pane":"../node_modules/polythene-core-dialog-pane/dist/polythene-core-dialog-pane.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-mithril-dialog/dist/polythene-mithril-dialog.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DialogInstance = exports.Dialog = void 0;

var _cyanoMithril = require("cyano-mithril");

var _polytheneCore = require("polythene-core");

var _polytheneCoreDialog = require("polythene-core-dialog");

var _polytheneMithrilDialogPane = require("polythene-mithril-dialog-pane");

var _polytheneMithrilShadow = require("polythene-mithril-shadow");

var listTileClasses = {
  component: "pe-list-tile",
  // elements
  content: "pe-list-tile__content",
  highSubtitle: "pe-list-tile__high-subtitle",
  primary: "pe-list-tile__primary",
  secondary: "pe-list-tile__secondary",
  subtitle: "pe-list-tile__subtitle",
  title: "pe-list-tile__title",
  contentFront: "pe-list-tile__content-front",
  // states  
  compact: "pe-list-tile--compact",
  compactFront: "pe-list-tile--compact-front",
  disabled: "pe-list-tile--disabled",
  hasFront: "pe-list-tile--front",
  hasHighSubtitle: "pe-list-tile--high-subtitle",
  hasSubtitle: "pe-list-tile--subtitle",
  header: "pe-list-tile--header",
  hoverable: "pe-list-tile--hoverable",
  insetH: "pe-list-tile--inset-h",
  insetV: "pe-list-tile--inset-v",
  selectable: "pe-list-tile--selectable",
  selected: "pe-list-tile--selected",
  rounded: "pe-list-tile--rounded",
  highlight: "pe-list-tile--highlight",
  sticky: "pe-list-tile--sticky",
  navigation: "pe-list-tile--navigation"
};
var menuClasses = {
  component: "pe-menu",
  // elements
  panel: "pe-menu__panel",
  content: "pe-menu__content",
  placeholder: "pe-menu__placeholder",
  backdrop: "pe-menu__backdrop",
  // states
  floating: "pe-menu--floating",
  origin: "pe-menu--origin",
  permanent: "pe-menu--permanent",
  showBackdrop: "pe-menu--backdrop",
  visible: "pe-menu--visible",
  width_auto: "pe-menu--width-auto",
  width_n: "pe-menu--width-",
  isTopMenu: "pe-menu--top-menu",
  // lookup
  listTile: listTileClasses.component,
  selectedListTile: listTileClasses.selected
};
var classes = {
  component: "pe-dialog",
  // elements
  placeholder: "pe-dialog__placeholder",
  holder: "pe-dialog__holder",
  content: "pe-dialog__content",
  backdrop: "pe-dialog__backdrop",
  touch: "pe-dialog__touch",
  // states
  fullScreen: "pe-dialog--full-screen",
  modal: "pe-dialog--modal",
  open: "pe-dialog--open",
  // class set to html element
  visible: "pe-dialog--visible",
  // class set to dialog element
  showBackdrop: "pe-dialog--backdrop",
  transition: "pe-dialog--transition",
  // lookup
  menuContent: menuClasses.content
};
var DialogInstance = (0, _cyanoMithril.cast)(_polytheneCoreDialog._Dialog, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect,
  useRef: _cyanoMithril.useRef,
  getRef: _cyanoMithril.getRef,
  useReducer: _cyanoMithril.useReducer,
  Shadow: _polytheneMithrilShadow.Shadow,
  Pane: _polytheneMithrilDialogPane.DialogPane,
  openDialogsSelector: _polytheneCoreDialog.openDialogsSelector
});
exports.DialogInstance = DialogInstance;
DialogInstance["displayName"] = "DialogInstance";
var options = {
  name: "dialog",
  htmlShowClass: classes.open,
  defaultId: "default_dialog",
  holderSelector: "div.".concat(classes.holder),
  instance: DialogInstance,
  placeholder: "span.".concat(classes.placeholder)
};
var MultipleInstance = (0, _polytheneCore.Multi)({
  options: options
});
var Dialog = (0, _cyanoMithril.cast)(MultipleInstance.render, {
  h: _cyanoMithril.h,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect
});
exports.Dialog = Dialog;
Object.getOwnPropertyNames(MultipleInstance).filter(function (p) {
  return p !== "render";
}).forEach(function (p) {
  return Dialog[p] = MultipleInstance[p];
});
Dialog["displayName"] = "Dialog";
},{"cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs","polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs","polythene-core-dialog":"../node_modules/polythene-core-dialog/dist/polythene-core-dialog.mjs","polythene-mithril-dialog-pane":"../node_modules/polythene-mithril-dialog-pane/dist/polythene-mithril-dialog-pane.mjs","polythene-mithril-shadow":"../node_modules/polythene-mithril-shadow/dist/polythene-mithril-shadow.mjs"}],"../node_modules/polythene-core-drawer/dist/polythene-core-drawer.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openDialogsSelector = exports._Drawer = void 0;

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

var listTileClasses = {
  component: "pe-list-tile",
  // elements
  content: "pe-list-tile__content",
  highSubtitle: "pe-list-tile__high-subtitle",
  primary: "pe-list-tile__primary",
  secondary: "pe-list-tile__secondary",
  subtitle: "pe-list-tile__subtitle",
  title: "pe-list-tile__title",
  contentFront: "pe-list-tile__content-front",
  // states  
  compact: "pe-list-tile--compact",
  compactFront: "pe-list-tile--compact-front",
  disabled: "pe-list-tile--disabled",
  hasFront: "pe-list-tile--front",
  hasHighSubtitle: "pe-list-tile--high-subtitle",
  hasSubtitle: "pe-list-tile--subtitle",
  header: "pe-list-tile--header",
  hoverable: "pe-list-tile--hoverable",
  insetH: "pe-list-tile--inset-h",
  insetV: "pe-list-tile--inset-v",
  selectable: "pe-list-tile--selectable",
  selected: "pe-list-tile--selected",
  rounded: "pe-list-tile--rounded",
  highlight: "pe-list-tile--highlight",
  sticky: "pe-list-tile--sticky",
  navigation: "pe-list-tile--navigation"
};
var menuClasses = {
  component: "pe-menu",
  // elements
  panel: "pe-menu__panel",
  content: "pe-menu__content",
  placeholder: "pe-menu__placeholder",
  backdrop: "pe-menu__backdrop",
  // states
  floating: "pe-menu--floating",
  origin: "pe-menu--origin",
  permanent: "pe-menu--permanent",
  showBackdrop: "pe-menu--backdrop",
  visible: "pe-menu--visible",
  width_auto: "pe-menu--width-auto",
  width_n: "pe-menu--width-",
  isTopMenu: "pe-menu--top-menu",
  // lookup
  listTile: listTileClasses.component,
  selectedListTile: listTileClasses.selected
};
var dialogClasses = {
  component: "pe-dialog",
  // elements
  placeholder: "pe-dialog__placeholder",
  holder: "pe-dialog__holder",
  content: "pe-dialog__content",
  backdrop: "pe-dialog__backdrop",
  touch: "pe-dialog__touch",
  // states
  fullScreen: "pe-dialog--full-screen",
  modal: "pe-dialog--modal",
  open: "pe-dialog--open",
  // class set to html element
  visible: "pe-dialog--visible",
  // class set to dialog element
  showBackdrop: "pe-dialog--backdrop",
  transition: "pe-dialog--transition",
  // lookup
  menuContent: menuClasses.content
};
var classes = {
  component: "pe-dialog pe-drawer",
  // states
  cover: "pe-drawer--cover",
  push: "pe-drawer--push",
  mini: "pe-drawer--mini",
  permanent: "pe-drawer--permanent",
  border: "pe-drawer--border",
  floating: "pe-drawer--floating",
  fixed: "pe-drawer--fixed",
  anchorEnd: "pe-drawer--anchor-end",
  visible: dialogClasses.visible
};
var openDialogsSelector = ".".concat(classes.component, ".").concat(classes.visible, ":not(.").concat(classes.permanent, "),.").concat(classes.component, ".").concat(classes.visible, ".").concat(classes.mini, ",.").concat(classes.component, ".").concat(classes.cover, ",.").concat(classes.component, ".").concat(classes.permanent, ".").concat(classes.visible).replace(/ /g, ".");
exports.openDialogsSelector = openDialogsSelector;

var _Drawer = function _Drawer(_ref) {
  var h = _ref.h,
      Dialog = _ref.Dialog,
      props = _objectWithoutProperties(_ref, ["h", "Dialog"]);

  var isCover = !(props.push || props.permanent || props.mini);

  var componentProps = _extends({}, props, {
    fullBleed: true,
    className: null,
    parentClassName: [props.className, classes.component, isCover ? classes.cover : null, props.push ? classes.push : null, props.permanent ? classes.permanent : null, props.border ? classes.border : null, props.mini ? classes.mini : null, props.floating ? classes.floating : null, props.fixed ? classes.fixed : null, props.anchor === "end" ? classes.anchorEnd : null].join(" "),
    inactive: props.permanent && !props.mini,
    shadowDepth: props.shadowDepth !== undefined ? props.shadowDepth : 0
  });

  return h(Dialog, componentProps, props.children);
};

exports._Drawer = _Drawer;
},{}],"../node_modules/polythene-mithril-drawer/dist/polythene-mithril-drawer.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Drawer = void 0;

var _polytheneCore = require("polythene-core");

var _cyanoMithril = require("cyano-mithril");

var _polytheneCoreDrawer = require("polythene-core-drawer");

var _polytheneMithrilDialog = require("polythene-mithril-dialog");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var listTileClasses = {
  component: "pe-list-tile",
  // elements
  content: "pe-list-tile__content",
  highSubtitle: "pe-list-tile__high-subtitle",
  primary: "pe-list-tile__primary",
  secondary: "pe-list-tile__secondary",
  subtitle: "pe-list-tile__subtitle",
  title: "pe-list-tile__title",
  contentFront: "pe-list-tile__content-front",
  // states  
  compact: "pe-list-tile--compact",
  compactFront: "pe-list-tile--compact-front",
  disabled: "pe-list-tile--disabled",
  hasFront: "pe-list-tile--front",
  hasHighSubtitle: "pe-list-tile--high-subtitle",
  hasSubtitle: "pe-list-tile--subtitle",
  header: "pe-list-tile--header",
  hoverable: "pe-list-tile--hoverable",
  insetH: "pe-list-tile--inset-h",
  insetV: "pe-list-tile--inset-v",
  selectable: "pe-list-tile--selectable",
  selected: "pe-list-tile--selected",
  rounded: "pe-list-tile--rounded",
  highlight: "pe-list-tile--highlight",
  sticky: "pe-list-tile--sticky",
  navigation: "pe-list-tile--navigation"
};
var menuClasses = {
  component: "pe-menu",
  // elements
  panel: "pe-menu__panel",
  content: "pe-menu__content",
  placeholder: "pe-menu__placeholder",
  backdrop: "pe-menu__backdrop",
  // states
  floating: "pe-menu--floating",
  origin: "pe-menu--origin",
  permanent: "pe-menu--permanent",
  showBackdrop: "pe-menu--backdrop",
  visible: "pe-menu--visible",
  width_auto: "pe-menu--width-auto",
  width_n: "pe-menu--width-",
  isTopMenu: "pe-menu--top-menu",
  // lookup
  listTile: listTileClasses.component,
  selectedListTile: listTileClasses.selected
};
var dialogClasses = {
  component: "pe-dialog",
  // elements
  placeholder: "pe-dialog__placeholder",
  holder: "pe-dialog__holder",
  content: "pe-dialog__content",
  backdrop: "pe-dialog__backdrop",
  touch: "pe-dialog__touch",
  // states
  fullScreen: "pe-dialog--full-screen",
  modal: "pe-dialog--modal",
  open: "pe-dialog--open",
  // class set to html element
  visible: "pe-dialog--visible",
  // class set to dialog element
  showBackdrop: "pe-dialog--backdrop",
  transition: "pe-dialog--transition",
  // lookup
  menuContent: menuClasses.content
};
var classes = {
  component: "pe-dialog pe-drawer",
  // states
  cover: "pe-drawer--cover",
  push: "pe-drawer--push",
  mini: "pe-drawer--mini",
  permanent: "pe-drawer--permanent",
  border: "pe-drawer--border",
  floating: "pe-drawer--floating",
  fixed: "pe-drawer--fixed",
  anchorEnd: "pe-drawer--anchor-end",
  visible: dialogClasses.visible
};
var DrawerInstance = (0, _cyanoMithril.cast)(_polytheneCoreDrawer._Drawer, {
  h: _cyanoMithril.h,
  Dialog: _polytheneMithrilDialog.DialogInstance,
  openDialogsSelector: _polytheneCoreDrawer.openDialogsSelector
});
DrawerInstance["displayName"] = "DrawerInstance";
var DrawerToggle = (0, _cyanoMithril.cast)(_polytheneCore._Conditional, {
  h: _cyanoMithril.h,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect
});
DrawerToggle["displayName"] = "DrawerToggle";
var Drawer = {
  view: function view(vnode) {
    return (0, _cyanoMithril.h)(DrawerToggle, _objectSpread2({}, vnode.attrs, {
      placeholderClassName: classes.placeholder,
      instance: DrawerInstance,
      permanent: vnode.attrs.permanent || vnode.attrs.mini // passed to Conditional

    }));
  }
};
exports.Drawer = Drawer;
Drawer["displayName"] = "Drawer";
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs","polythene-core-drawer":"../node_modules/polythene-core-drawer/dist/polythene-core-drawer.mjs","polythene-mithril-dialog":"../node_modules/polythene-mithril-dialog/dist/polythene-mithril-dialog.mjs"}],"../node_modules/polythene-core-fab/dist/polythene-core-fab.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._FAB = void 0;

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

var classes = {
  component: "pe-fab",
  // elements
  content: "pe-fab__content",
  // states
  mini: "pe-fab--mini"
};

var _FAB = function _FAB(_ref) {
  var h = _ref.h,
      a = _ref.a,
      Button = _ref.Button,
      Icon = _ref.Icon,
      props = _objectWithoutProperties(_ref, ["h", "a", "Button", "Icon"]);

  var content = props.content ? props.content : props.icon ? h(Icon, props.icon) : props.children;

  var componentProps = _extends({}, props, {
    content: h("div", {
      className: classes.content
    }, content),
    parentClassName: [classes.component, props.mini ? classes.mini : null, props.className || props[a["class"]]].join(" "),
    className: null,
    // defaults
    ripple: {
      center: true,
      opacityDecayVelocity: 0.24
    },
    shadow: {
      increase: 5
    },
    ink: true,
    wash: true,
    raised: true,
    animateOnTap: props.animateOnTap !== undefined ? props.animateOnTap : true
  });

  return h(Button, componentProps, content);
};

exports._FAB = _FAB;
},{}],"../node_modules/polythene-mithril-fab/dist/polythene-mithril-fab.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FAB = void 0;

var _polytheneCoreFab = require("polythene-core-fab");

var _polytheneMithrilIcon = require("polythene-mithril-icon");

var _polytheneMithrilButton = require("polythene-mithril-button");

var _cyanoMithril = require("cyano-mithril");

var FAB = (0, _cyanoMithril.cast)(_polytheneCoreFab._FAB, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  Button: _polytheneMithrilButton.Button,
  Icon: _polytheneMithrilIcon.Icon
});
exports.FAB = FAB;
FAB["displayName"] = "FAB";
},{"polythene-core-fab":"../node_modules/polythene-core-fab/dist/polythene-core-fab.mjs","polythene-mithril-icon":"../node_modules/polythene-mithril-icon/dist/polythene-mithril-icon.mjs","polythene-mithril-button":"../node_modules/polythene-mithril-button/dist/polythene-mithril-button.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-core-base-spinner/dist/polythene-core-base-spinner.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._BaseSpinner = void 0;

var _polytheneCore = require("polythene-core");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var classes = {
  component: "pe-spinner",
  // elements
  animation: "pe-spinner__animation",
  placeholder: "pe-spinner__placeholder",
  // states
  animated: "pe-spinner--animated",
  fab: "pe-spinner--fab",
  large: "pe-spinner--large",
  medium: "pe-spinner--medium",
  permanent: "pe-spinner--permanent",
  raised: "pe-spinner--raised",
  regular: "pe-spinner--regular",
  singleColor: "pe-spinner--single-color",
  small: "pe-spinner--small",
  visible: "pe-spinner--visible"
};

var showSpinner = function showSpinner(opts) {
  return (0, _polytheneCore.transitionComponent)(_objectSpread2({}, opts, {
    isShow: true
  }));
}; // const hideSpinner = opts =>
//   transitionComponent({
//     ...opts,
//     isShow: false
//   });


var initialTransitionState = {
  isVisible: false,
  isTransitioning: false,
  isHiding: false
};

var _BaseSpinner = function _BaseSpinner(_ref) {
  var h = _ref.h,
      a = _ref.a,
      useReducer = _ref.useReducer,
      useState = _ref.useState,
      useEffect = _ref.useEffect,
      getRef = _ref.getRef,
      Shadow = _ref.Shadow,
      props = _objectWithoutProperties(_ref, ["h", "a", "useReducer", "useState", "useEffect", "getRef", "Shadow"]);

  var _useReducer = useReducer(_polytheneCore.transitionStateReducer, initialTransitionState),
      _useReducer2 = _slicedToArray(_useReducer, 2),
      transitionState = _useReducer2[0],
      dispatchTransitionState = _useReducer2[1];

  var _useState = useState(),
      _useState2 = _slicedToArray(_useState, 2),
      domElement = _useState2[0],
      setDomElement = _useState2[1];

  var isVisible = (transitionState || initialTransitionState).isVisible;
  var transitionOptions = {
    dispatchTransitionState: dispatchTransitionState,
    props: props,
    domElements: {
      el: domElement
    },
    showClass: classes.visible
  };
  useEffect(function () {
    if (!domElement) {
      return;
    }

    if (!props.permanent) {
      showSpinner(transitionOptions);
    }
  }, [domElement]);

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), getRef(function (dom) {
    return dom && !domElement && (setDomElement(dom), props.ref && props.ref(dom));
  }), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.component, props.instanceClass, (0, _polytheneCore.classForSize)(classes, props.size), props.singleColor ? classes.singleColor : null, props.raised ? classes.raised : null, props.animated ? classes.animated : null, props.permanent ? classes.permanent : null, isVisible ? classes.visible : null, props.className || props[a["class"]]].join(" ")
  }, props.events);

  var content = [props.before, props.content, props.after];

  if (props.raised && content.length > 0) {
    content.push(h(Shadow, {
      shadowDepth: props.shadowDepth
    }));
  }

  return h("div", componentProps, content);
};

exports._BaseSpinner = _BaseSpinner;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-mithril-base-spinner/dist/polythene-mithril-base-spinner.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseSpinner = void 0;

var _polytheneCoreBaseSpinner = require("polythene-core-base-spinner");

var _polytheneMithrilShadow = require("polythene-mithril-shadow");

var _cyanoMithril = require("cyano-mithril");

var classes = {
  component: "pe-spinner",
  // elements
  animation: "pe-spinner__animation",
  placeholder: "pe-spinner__placeholder",
  // states
  animated: "pe-spinner--animated",
  fab: "pe-spinner--fab",
  large: "pe-spinner--large",
  medium: "pe-spinner--medium",
  permanent: "pe-spinner--permanent",
  raised: "pe-spinner--raised",
  regular: "pe-spinner--regular",
  singleColor: "pe-spinner--single-color",
  small: "pe-spinner--small",
  visible: "pe-spinner--visible"
};
var BaseSpinner = (0, _cyanoMithril.cast)(_polytheneCoreBaseSpinner._BaseSpinner, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  useReducer: _cyanoMithril.useReducer,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect,
  getRef: _cyanoMithril.getRef,
  Shadow: _polytheneMithrilShadow.Shadow
});
exports.BaseSpinner = BaseSpinner;
BaseSpinner["displayName"] = "BaseSpinner";
BaseSpinner["classes"] = classes;
},{"polythene-core-base-spinner":"../node_modules/polythene-core-base-spinner/dist/polythene-core-base-spinner.mjs","polythene-mithril-shadow":"../node_modules/polythene-mithril-shadow/dist/polythene-mithril-shadow.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-core-ios-spinner/dist/polythene-core-ios-spinner.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._Spinner = void 0;

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

var classes = {
  component: "pe-ios-spinner",
  // elements
  blades: "pe-ios-spinner__blades",
  blade: "pe-ios-spinner__blade"
};

var blade = function blade(num, h) {
  return h("div", {
    // key: `blade-${num}`,
    className: classes.blade
  });
};

var _Spinner = function _Spinner(_ref) {
  var h = _ref.h,
      BaseSpinner = _ref.BaseSpinner,
      props = _objectWithoutProperties(_ref, ["h", "BaseSpinner"]);

  var content = props.content || h("div", {
    // key: "content",
    className: classes.blades
  }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (num) {
    return blade(num, h);
  }));

  var componentProps = _extends({}, props, {
    className: [classes.component, props.className].join(" "),
    content: content
  });

  return h(BaseSpinner, componentProps);
};

exports._Spinner = _Spinner;
},{}],"../node_modules/polythene-mithril-ios-spinner/dist/polythene-mithril-ios-spinner.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IOSSpinner = void 0;

var _polytheneMithrilBaseSpinner = require("polythene-mithril-base-spinner");

var _polytheneCoreIosSpinner = require("polythene-core-ios-spinner");

var _cyanoMithril = require("cyano-mithril");

var _polytheneCore = require("polythene-core");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var classes = {
  component: "pe-ios-spinner",
  // elements
  blades: "pe-ios-spinner__blades",
  blade: "pe-ios-spinner__blade"
};
var baseSpinnerClasses = {
  component: "pe-spinner",
  // elements
  animation: "pe-spinner__animation",
  placeholder: "pe-spinner__placeholder",
  // states
  animated: "pe-spinner--animated",
  fab: "pe-spinner--fab",
  large: "pe-spinner--large",
  medium: "pe-spinner--medium",
  permanent: "pe-spinner--permanent",
  raised: "pe-spinner--raised",
  regular: "pe-spinner--regular",
  singleColor: "pe-spinner--single-color",
  small: "pe-spinner--small",
  visible: "pe-spinner--visible"
};
var Spinner = (0, _cyanoMithril.cast)(_polytheneCoreIosSpinner._Spinner, {
  h: _cyanoMithril.h,
  BaseSpinner: _polytheneMithrilBaseSpinner.BaseSpinner
});
var SpinnerToggle = (0, _cyanoMithril.cast)(_polytheneCore._Conditional, {
  h: _cyanoMithril.h,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect
});
SpinnerToggle["displayName"] = "IOSSpinnerToggle";
var IOSSpinner = {
  view: function view(vnode) {
    return (0, _cyanoMithril.h)(SpinnerToggle, _objectSpread2({}, vnode.attrs, {
      placeholderClassName: baseSpinnerClasses.placeholder,
      instance: Spinner
    }));
  }
};
exports.IOSSpinner = IOSSpinner;
IOSSpinner["classes"] = classes;
IOSSpinner["displayName"] = "IOSSpinner";
},{"polythene-mithril-base-spinner":"../node_modules/polythene-mithril-base-spinner/dist/polythene-mithril-base-spinner.mjs","polythene-core-ios-spinner":"../node_modules/polythene-core-ios-spinner/dist/polythene-core-ios-spinner.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs","polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-core-list/dist/polythene-core-list.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._List = void 0;

var _polytheneCore = require("polythene-core");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

var listTileClasses = {
  component: "pe-list-tile",
  // elements
  content: "pe-list-tile__content",
  highSubtitle: "pe-list-tile__high-subtitle",
  primary: "pe-list-tile__primary",
  secondary: "pe-list-tile__secondary",
  subtitle: "pe-list-tile__subtitle",
  title: "pe-list-tile__title",
  contentFront: "pe-list-tile__content-front",
  // states  
  compact: "pe-list-tile--compact",
  compactFront: "pe-list-tile--compact-front",
  disabled: "pe-list-tile--disabled",
  hasFront: "pe-list-tile--front",
  hasHighSubtitle: "pe-list-tile--high-subtitle",
  hasSubtitle: "pe-list-tile--subtitle",
  header: "pe-list-tile--header",
  hoverable: "pe-list-tile--hoverable",
  insetH: "pe-list-tile--inset-h",
  insetV: "pe-list-tile--inset-v",
  selectable: "pe-list-tile--selectable",
  selected: "pe-list-tile--selected",
  rounded: "pe-list-tile--rounded",
  highlight: "pe-list-tile--highlight",
  sticky: "pe-list-tile--sticky",
  navigation: "pe-list-tile--navigation"
};
var classes = {
  component: "pe-list",
  // states
  border: "pe-list--border",
  compact: "pe-list--compact",
  hasHeader: "pe-list--header",
  indentedBorder: "pe-list--indented-border",
  padding: "pe-list--padding",
  paddingTop: "pe-list--padding-top",
  paddingBottom: "pe-list--padding-bottom",
  // lookup
  header: listTileClasses.header
};
var paddingClasses = {
  both: classes.padding,
  bottom: classes.paddingBottom,
  top: classes.paddingTop,
  none: null
};

var paddingClass = function paddingClass() {
  var attr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "both";
  return paddingClasses[attr];
};

var _List = function _List(_ref) {
  var h = _ref.h,
      a = _ref.a,
      ListTile = _ref.ListTile,
      props = _objectWithoutProperties(_ref, ["h", "a", "ListTile"]); // Remove unused props


  delete props.key;

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.component, props.border || props.borders ? classes.border : null, props.indentedBorder || props.indentedBorders ? classes.indentedBorder : null, props.header ? classes.hasHeader : null, props.compact ? classes.compact : null, paddingClass(props.padding), props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  });

  var headerOpts;

  if (props.header) {
    headerOpts = _extends({}, props.header);
    headerOpts[a["class"]] = [classes.header, headerOpts[a["class"]] || null].join(" ");
  }

  var tiles = props.tiles ? props.tiles : props.content ? props.content : props.children;
  var componentContent = [headerOpts ? h(ListTile, _objectSpread2({}, props.all, {}, headerOpts, {
    header: true
  })) : undefined].concat(_toConsumableArray(props.all ? tiles.map(function (tileOpts) {
    return h(ListTile, _objectSpread2({}, props.all, {}, tileOpts));
  }) : tiles));
  var content = [props.before].concat(_toConsumableArray(componentContent), [props.after]);
  return h(props.element || "div", componentProps, content);
};

exports._List = _List;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-mithril-list/dist/polythene-mithril-list.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.List = void 0;

var _polytheneCoreList = require("polythene-core-list");

var _polytheneMithrilListTile = require("polythene-mithril-list-tile");

var _cyanoMithril = require("cyano-mithril");

var List = (0, _cyanoMithril.cast)(_polytheneCoreList._List, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  ListTile: _polytheneMithrilListTile.ListTile
});
exports.List = List;
List["displayName"] = "List";
},{"polythene-core-list":"../node_modules/polythene-core-list/dist/polythene-core-list.mjs","polythene-mithril-list-tile":"../node_modules/polythene-mithril-list-tile/dist/polythene-mithril-list-tile.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-utilities/dist/polythene-utilities.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scrollTo = exports.easing = exports.addWebFont = exports.Timer = void 0;

var _polytheneCore = require("polythene-core");

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var addWebFont = function addWebFont(vendor, config) {
  if (_polytheneCore.isServer) return;

  if (!window["WebFontConfig"]) {
    /**
     * @param {object} params
     * @param {string} [params.name]
     * @param {string} [params.familyName]
     * @param {any} [params.fvd]
     */
    var emitEvent = function emitEvent(_ref) {
      var name = _ref.name,
          familyName = _ref.familyName,
          fvd = _ref.fvd;
      return (0, _polytheneCore.emit)("webfontloader", {
        name: name,
        familyName: familyName,
        fvd: fvd,
        vendor: vendor,
        config: config
      });
    };

    window["WebFontConfig"] = {
      loading: function loading() {
        return emitEvent({
          name: "loading"
        });
      },
      active: function active() {
        return emitEvent({
          name: "active"
        });
      },
      inactive: function inactive() {
        return emitEvent({
          name: "inactive"
        });
      },
      fontloading: function fontloading(familyName, fvd) {
        return emitEvent({
          name: "fontloading",
          familyName: familyName,
          fvd: fvd
        });
      },
      fontactive: function fontactive(familyName, fvd) {
        return emitEvent({
          name: "fontactive",
          familyName: familyName,
          fvd: fvd
        });
      },
      fontinactive: function fontinactive(familyName, fvd) {
        return emitEvent({
          name: "fontinactive",
          familyName: familyName,
          fvd: fvd
        });
      }
    };

    (function () {
      var wf = document.createElement("script");
      wf.src = (document.location.protocol === "https:" ? "https" : "http") + "://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js";
      wf.type = "text/javascript";
      wf.async = true;
      var s = document.getElementsByTagName("script")[0];

      if (s && s.parentNode) {
        s.parentNode.insertBefore(wf, s);
      }
    })();
  }

  var vendorCfg = window["WebFontConfig"][vendor] || {};

  if (config) {
    _extends(vendorCfg, config);
  }

  window["WebFontConfig"][vendor] = vendorCfg;
};
/*
https://gist.github.com/gre/1650294
Easing Functions - inspired from http://gizma.com/easing/
Only considering the t value for the range [0, 1] => [0, 1]
*/


exports.addWebFont = addWebFont;
var easing = {
  // no easing, no acceleration
  linear: function linear(t) {
    return t;
  },
  // accelerating from zero velocity
  easeInQuad: function easeInQuad(t) {
    return t * t;
  },
  // decelerating to zero velocity
  easeOutQuad: function easeOutQuad(t) {
    return t * (2 - t);
  },
  // acceleration until halfway, then deceleration
  easeInOutQuad: function easeInOutQuad(t) {
    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  // accelerating from zero velocity
  easeInCubic: function easeInCubic(t) {
    return t * t * t;
  },
  // decelerating to zero velocity
  easeOutCubic: function easeOutCubic(t) {
    return --t * t * t + 1;
  },
  // acceleration until halfway, then deceleration
  easeInOutCubic: function easeInOutCubic(t) {
    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
  // accelerating from zero velocity
  easeInQuart: function easeInQuart(t) {
    return t * t * t * t;
  },
  // decelerating to zero velocity
  easeOutQuart: function easeOutQuart(t) {
    return 1 - --t * t * t * t;
  },
  // acceleration until halfway, then deceleration
  easeInOutQuart: function easeInOutQuart(t) {
    return t < .5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
  },
  // accelerating from zero velocity
  easeInQuint: function easeInQuint(t) {
    return t * t * t * t * t;
  },
  // decelerating to zero velocity
  easeOutQuint: function easeOutQuint(t) {
    return 1 + --t * t * t * t * t;
  },
  // acceleration until halfway, then deceleration
  easeInOutQuint: function easeInOutQuint(t) {
    return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
  }
};
/*
 Animated scroll to a position.
 Derived from https://github.com/madebysource/animated-scrollto
 Adapted to Mithril and rewritten to es6.
*/

exports.easing = easing;

var scrollTo = function scrollTo(opts) {
  if (_polytheneCore.isServer) {
    return;
  }

  var element = opts.element;
  var which = opts.direction === "horizontal" ? "scrollLeft" : "scrollTop";
  var to = opts.to;
  var duration = opts.duration * 1000;
  var easingFn = opts.easing || easing.easeInOutCubic;
  var start = element[which];
  var change = to - start;
  var animationStart = new Date().getTime();
  var animating = true;
  return new Promise(function (resolve) {
    var animateScroll = function animateScroll() {
      if (!animating) {
        return;
      }

      requestAnimFrame(animateScroll);
      var now = new Date().getTime();
      var percentage = (now - animationStart) / duration;
      var val = start + change * easingFn(percentage);
      element[which] = val;

      if (percentage >= 1) {
        element[which] = to;
        animating = false;
        resolve();
      }
    };

    requestAnimFrame(animateScroll);
  });
};

exports.scrollTo = scrollTo;
var requestAnimFrame = _polytheneCore.isServer ? function () {} : function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window["mozRequestAnimationFrame"] || function (callback) {
    return window.setTimeout(callback, 1000 / 60);
  };
}(); // @ts-check

var Timer = function Timer() {
  /** @type {number} */
  var timerId;
  /** @type {number} */

  var startTime;
  /** @type {number} */

  var remaining;
  /** @type {() => any} */

  var cb;

  var stop = function stop() {
    if (_polytheneCore.isClient) {
      window.clearTimeout(timerId);
    }
  };

  var pause = function pause() {
    return stop(), remaining -= new Date().getTime() - startTime;
  };

  var startTimer = function startTimer() {
    if (_polytheneCore.isClient) {
      stop();
      startTime = new Date().getTime();
      timerId = window.setTimeout(cb, remaining);
    }
  };

  var start = function start(callback, duration) {
    return cb = callback, remaining = duration * 1000, startTimer();
  };

  var resume = function resume() {
    return startTimer();
  };

  return {
    start: start,
    pause: pause,
    resume: resume,
    stop: stop
  };
};

exports.Timer = Timer;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-core-material-design-progress-spinner/dist/polythene-core-material-design-progress-spinner.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._Spinner = void 0;

var _polytheneCore = require("polythene-core");

var _polytheneUtilities = require("polythene-utilities");

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var classes = {
  component: "pe-md-progress-spinner",
  // elements
  animation: "pe-md-progress-spinner__animation",
  circle: "pe-md-progress-spinner__circle",
  circleRight: "pe-md-progress-spinner__circle-right",
  circleLeft: "pe-md-progress-spinner__circle-left"
};

var percentageValue = function percentageValue(min, max) {
  var percentage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  return min + (max - min) * percentage;
};

var rotateCircle = function rotateCircle(domElement, min, max, percentage) {
  var style = domElement.style;
  style["transform"] = style["-webkit-transform"] = style["-moz-transform"] = style["-ms-transform"] = style["-o-transform"] = "rotate(" + percentageValue(min, max, percentage) + "deg)";
};

var animate = function animate(stateEl, size, percentage) {
  var animationEl = stateEl.querySelector("." + classes.animation);
  var animationElStyle = animationEl.style;

  if (percentage < 0.5) {
    animationElStyle.clip = "rect(0px, " + size + "px, " + size + "px, " + size / 2 + "px)";
  } else {
    animationElStyle.clip = "rect(auto, auto, auto, auto)";
  }

  var leftCircle = stateEl.querySelector("." + classes.circleLeft);
  var rightCircle = stateEl.querySelector("." + classes.circleRight);
  leftCircle.style.clip = rightCircle.style.clip = "rect(0px, " + size / 2 + "px, " + size + "px, " + "0px)";
  rotateCircle(rightCircle, 0, 180, Math.min(1, percentage * 2));
  rotateCircle(leftCircle, 0, 360, percentage);
};

var updateWithPercentage = function updateWithPercentage(_ref) {
  var domElement = _ref.domElement,
      isAnimating = _ref.isAnimating,
      setIsAnimating = _ref.setIsAnimating,
      percentage = _ref.percentage,
      setPercentage = _ref.setPercentage,
      size = _ref.size,
      props = _ref.props;

  if (!domElement || isAnimating || size === undefined || props.percentage === undefined) {
    return;
  }

  var currentPercentage = (0, _polytheneCore.unpackAttrs)(props.percentage);
  var previousPercentage = percentage;

  if (previousPercentage !== currentPercentage) {
    var easingFn = props.animated ? _polytheneUtilities.easing.easeInOutQuad : function (v) {
      return v;
    };

    if (props.animated) {
      var animationDuration = props.updateDuration !== undefined ? props.updateDuration * 1000 : (0, _polytheneCore.styleDurationToMs)((0, _polytheneCore.getStyle)({
        element: domElement.querySelector(".".concat(classes.animation)),
        prop: "animation-duration"
      }));
      var start = null;

      var step = function step(timestamp) {
        if (!start) start = timestamp;
        var progress = timestamp - start;
        var stepPercentage = 1.0 / animationDuration * progress;
        var newPercentage = previousPercentage + stepPercentage * (currentPercentage - previousPercentage);
        animate(domElement, size, easingFn(newPercentage));

        if (start && progress < animationDuration) {
          window.requestAnimationFrame(step);
        } else {
          start = null;
          setPercentage(currentPercentage);
          setIsAnimating(false);
        }
      };

      setIsAnimating(true);
      window.requestAnimationFrame(step);
    } else {
      animate(domElement, size, easingFn(currentPercentage));
      setPercentage(currentPercentage);
    }
  }
};

var getSize = function getSize(element) {
  return Math.round(element ? parseFloat((0, _polytheneCore.getStyle)({
    element: element,
    prop: "height"
  })) - 2 * parseFloat((0, _polytheneCore.getStyle)({
    element: element,
    prop: "padding"
  })) : 0);
};

var _Spinner = function _Spinner(_ref2) {
  var h = _ref2.h,
      useState = _ref2.useState,
      useEffect = _ref2.useEffect,
      BaseSpinner = _ref2.BaseSpinner,
      props = _objectWithoutProperties(_ref2, ["h", "useState", "useEffect", "BaseSpinner"]);

  var _useState = useState(0),
      _useState2 = _slicedToArray(_useState, 2),
      percentage = _useState2[0],
      setPercentage = _useState2[1];

  var _useState3 = useState(false),
      _useState4 = _slicedToArray(_useState3, 2),
      isAnimating = _useState4[0],
      setIsAnimating = _useState4[1];

  var _useState5 = useState(),
      _useState6 = _slicedToArray(_useState5, 2),
      domElement = _useState6[0],
      setDomElement = _useState6[1];

  var _useState7 = useState(),
      _useState8 = _slicedToArray(_useState7, 2),
      size = _useState8[0],
      setSize = _useState8[1];

  useEffect(function () {
    if (!domElement) {
      return;
    }

    setSize(getSize(domElement));
  }, [domElement]);
  updateWithPercentage({
    domElement: domElement,
    isAnimating: isAnimating,
    percentage: percentage,
    setPercentage: setPercentage,
    setIsAnimating: setIsAnimating,
    size: size,
    props: props
  });
  var content = props.content || h("div", {
    className: classes.animation,
    style: {
      width: size + "px",
      height: size + "px"
    }
  }, [h("div", {
    className: [classes.circle, classes.circleLeft].join(" ")
  }), h("div", {
    className: [classes.circle, classes.circleRight].join(" ")
  })]);

  var componentProps = _extends({}, props, {
    ref: function ref(dom) {
      return dom && !domElement && setDomElement(dom);
    },
    className: [classes.component, props.className].join(" "),
    content: content
  });

  return h(BaseSpinner, componentProps);
};

exports._Spinner = _Spinner;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs","polythene-utilities":"../node_modules/polythene-utilities/dist/polythene-utilities.mjs"}],"../node_modules/polythene-mithril-material-design-progress-spinner/dist/polythene-mithril-material-design-progress-spinner.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MaterialDesignProgressSpinner = void 0;

var _polytheneMithrilBaseSpinner = require("polythene-mithril-base-spinner");

var _polytheneCoreMaterialDesignProgressSpinner = require("polythene-core-material-design-progress-spinner");

var _cyanoMithril = require("cyano-mithril");

var _polytheneCore = require("polythene-core");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var classes = {
  component: "pe-md-progress-spinner",
  // elements
  animation: "pe-md-progress-spinner__animation",
  circle: "pe-md-progress-spinner__circle",
  circleRight: "pe-md-progress-spinner__circle-right",
  circleLeft: "pe-md-progress-spinner__circle-left"
};
var baseSpinnerClasses = {
  component: "pe-spinner",
  // elements
  animation: "pe-spinner__animation",
  placeholder: "pe-spinner__placeholder",
  // states
  animated: "pe-spinner--animated",
  fab: "pe-spinner--fab",
  large: "pe-spinner--large",
  medium: "pe-spinner--medium",
  permanent: "pe-spinner--permanent",
  raised: "pe-spinner--raised",
  regular: "pe-spinner--regular",
  singleColor: "pe-spinner--single-color",
  small: "pe-spinner--small",
  visible: "pe-spinner--visible"
};
var Spinner = (0, _cyanoMithril.cast)(_polytheneCoreMaterialDesignProgressSpinner._Spinner, {
  h: _cyanoMithril.h,
  useState: _cyanoMithril.useState,
  useRef: _cyanoMithril.useRef,
  useEffect: _cyanoMithril.useEffect,
  BaseSpinner: _polytheneMithrilBaseSpinner.BaseSpinner
});
var SpinnerToggle = (0, _cyanoMithril.cast)(_polytheneCore._Conditional, {
  h: _cyanoMithril.h,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect
});
SpinnerToggle["displayName"] = "MaterialDesignProgressSpinnerToggle";
var MaterialDesignProgressSpinner = {
  view: function view(vnode) {
    return (0, _cyanoMithril.h)(SpinnerToggle, _objectSpread2({}, vnode.attrs, {
      placeholderClassName: baseSpinnerClasses.placeholder,
      instance: Spinner
    }));
  }
};
exports.MaterialDesignProgressSpinner = MaterialDesignProgressSpinner;
MaterialDesignProgressSpinner["classes"] = classes;
MaterialDesignProgressSpinner["displayName"] = "MaterialDesignProgressSpinner";
},{"polythene-mithril-base-spinner":"../node_modules/polythene-mithril-base-spinner/dist/polythene-mithril-base-spinner.mjs","polythene-core-material-design-progress-spinner":"../node_modules/polythene-core-material-design-progress-spinner/dist/polythene-core-material-design-progress-spinner.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs","polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-core-material-design-spinner/dist/polythene-core-material-design-spinner.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._Spinner = void 0;

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

var classes = {
  component: "pe-md-spinner",
  // elements
  animation: "pe-md-spinner__animation",
  circle: "pe-md-spinner__circle",
  circleClipper: "pe-md-spinner__circle-clipper",
  circleClipperLeft: "pe-md-spinner__circle-clipper-left",
  circleClipperRight: "pe-md-spinner__circle-clipper-right",
  gapPatch: "pe-md-spinner__gap-patch",
  layer: "pe-md-spinner__layer",
  layerN: "pe-md-spinner__layer-"
};

var layer = function layer(num, h) {
  return h("div", {
    key: num,
    className: [classes.layer, classes.layerN + num].join(" ")
  }, [h("div", {
    // key: "clipper-left",
    className: [classes.circleClipper, classes.circleClipperLeft].join(" ")
  }, h("div", {
    // key: "circle",
    className: classes.circle
  })), h("div", {
    // key: "gap-patch",
    className: classes.gapPatch
  }, h("div", {
    className: classes.circle
  })), h("div", {
    // key: "clipper-right",
    className: [classes.circleClipper, classes.circleClipperRight].join(" ")
  }, h("div", {
    className: classes.circle
  }))]);
};

var _Spinner = function _Spinner(_ref) {
  var h = _ref.h,
      BaseSpinner = _ref.BaseSpinner,
      props = _objectWithoutProperties(_ref, ["h", "BaseSpinner"]);

  var content = props.content || h("div", {
    // key: "content",
    className: classes.animation
  }, [1, 2, 3, 4].map(function (num) {
    return layer(num, h);
  }));

  var componentProps = _extends({}, props, {
    className: [classes.component, props.className].join(" "),
    content: content
  });

  return h(BaseSpinner, componentProps);
};

exports._Spinner = _Spinner;
},{}],"../node_modules/polythene-mithril-material-design-spinner/dist/polythene-mithril-material-design-spinner.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MaterialDesignSpinner = void 0;

var _polytheneMithrilBaseSpinner = require("polythene-mithril-base-spinner");

var _polytheneCoreMaterialDesignSpinner = require("polythene-core-material-design-spinner");

var _cyanoMithril = require("cyano-mithril");

var _polytheneCore = require("polythene-core");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var classes = {
  component: "pe-md-spinner",
  // elements
  animation: "pe-md-spinner__animation",
  circle: "pe-md-spinner__circle",
  circleClipper: "pe-md-spinner__circle-clipper",
  circleClipperLeft: "pe-md-spinner__circle-clipper-left",
  circleClipperRight: "pe-md-spinner__circle-clipper-right",
  gapPatch: "pe-md-spinner__gap-patch",
  layer: "pe-md-spinner__layer",
  layerN: "pe-md-spinner__layer-"
};
var baseSpinnerClasses = {
  component: "pe-spinner",
  // elements
  animation: "pe-spinner__animation",
  placeholder: "pe-spinner__placeholder",
  // states
  animated: "pe-spinner--animated",
  fab: "pe-spinner--fab",
  large: "pe-spinner--large",
  medium: "pe-spinner--medium",
  permanent: "pe-spinner--permanent",
  raised: "pe-spinner--raised",
  regular: "pe-spinner--regular",
  singleColor: "pe-spinner--single-color",
  small: "pe-spinner--small",
  visible: "pe-spinner--visible"
};
var Spinner = (0, _cyanoMithril.cast)(_polytheneCoreMaterialDesignSpinner._Spinner, {
  h: _cyanoMithril.h,
  BaseSpinner: _polytheneMithrilBaseSpinner.BaseSpinner
});
var SpinnerToggle = (0, _cyanoMithril.cast)(_polytheneCore._Conditional, {
  h: _cyanoMithril.h,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect
});
SpinnerToggle["displayName"] = "MaterialDesignSpinnerToggle";
var MaterialDesignSpinner = {
  view: function view(vnode) {
    return (0, _cyanoMithril.h)(SpinnerToggle, _objectSpread2({}, vnode.attrs, {
      placeholderClassName: baseSpinnerClasses.placeholder,
      instance: Spinner
    }));
  }
};
exports.MaterialDesignSpinner = MaterialDesignSpinner;
MaterialDesignSpinner["classes"] = classes;
MaterialDesignSpinner["displayName"] = "MaterialDesignSpinner";
},{"polythene-mithril-base-spinner":"../node_modules/polythene-mithril-base-spinner/dist/polythene-mithril-base-spinner.mjs","polythene-core-material-design-spinner":"../node_modules/polythene-core-material-design-spinner/dist/polythene-core-material-design-spinner.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs","polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-core-menu/dist/polythene-core-menu.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._Menu = void 0;

var _polytheneCore = require("polythene-core");

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var listTileClasses = {
  component: "pe-list-tile",
  // elements
  content: "pe-list-tile__content",
  highSubtitle: "pe-list-tile__high-subtitle",
  primary: "pe-list-tile__primary",
  secondary: "pe-list-tile__secondary",
  subtitle: "pe-list-tile__subtitle",
  title: "pe-list-tile__title",
  contentFront: "pe-list-tile__content-front",
  // states  
  compact: "pe-list-tile--compact",
  compactFront: "pe-list-tile--compact-front",
  disabled: "pe-list-tile--disabled",
  hasFront: "pe-list-tile--front",
  hasHighSubtitle: "pe-list-tile--high-subtitle",
  hasSubtitle: "pe-list-tile--subtitle",
  header: "pe-list-tile--header",
  hoverable: "pe-list-tile--hoverable",
  insetH: "pe-list-tile--inset-h",
  insetV: "pe-list-tile--inset-v",
  selectable: "pe-list-tile--selectable",
  selected: "pe-list-tile--selected",
  rounded: "pe-list-tile--rounded",
  highlight: "pe-list-tile--highlight",
  sticky: "pe-list-tile--sticky",
  navigation: "pe-list-tile--navigation"
};
var classes = {
  component: "pe-menu",
  // elements
  panel: "pe-menu__panel",
  content: "pe-menu__content",
  placeholder: "pe-menu__placeholder",
  backdrop: "pe-menu__backdrop",
  // states
  floating: "pe-menu--floating",
  origin: "pe-menu--origin",
  permanent: "pe-menu--permanent",
  showBackdrop: "pe-menu--backdrop",
  visible: "pe-menu--visible",
  width_auto: "pe-menu--width-auto",
  width_n: "pe-menu--width-",
  isTopMenu: "pe-menu--top-menu",
  // lookup
  listTile: listTileClasses.component,
  selectedListTile: listTileClasses.selected
};
var DEFAULT_OFFSET_H = 0;
var DEFAULT_OFFSET_V = "79%";
var DEFAULT_TYPE = "floating";
var MIN_WIDTH = 1.5;
var DEFAULT_SHADOW_DEPTH = 1;

var unifyWidth = function unifyWidth(width) {
  return width < MIN_WIDTH ? MIN_WIDTH : width;
};

var widthClass = function widthClass(size) {
  return classes.width_n + size.toString().replace(".", "-");
};

var _Menu = function _Menu(_ref) {
  var h = _ref.h,
      a = _ref.a,
      useReducer = _ref.useReducer,
      useState = _ref.useState,
      useEffect = _ref.useEffect,
      useRef = _ref.useRef,
      getRef = _ref.getRef,
      Shadow = _ref.Shadow,
      props = _objectWithoutProperties(_ref, ["h", "a", "useReducer", "useState", "useEffect", "useRef", "getRef", "Shadow"]);

  var _useReducer = useReducer(_polytheneCore.transitionStateReducer, _polytheneCore.initialTransitionState),
      _useReducer2 = _slicedToArray(_useReducer, 2),
      dispatchTransitionState = _useReducer2[1];

  var _useState = useState(),
      _useState2 = _slicedToArray(_useState, 2),
      domElement = _useState2[0],
      setDomElement = _useState2[1];

  var _useState3 = useState(!!props.permanent),
      _useState4 = _slicedToArray(_useState3, 2),
      setIsVisible = _useState4[1];

  var panelElRef = useRef();
  var contentElRef = useRef();

  var update = function update() {
    positionMenu();
    scrollContent();
  };

  var transitionOptions = function transitionOptions(_ref2) {
    var isShow = _ref2.isShow,
        _ref2$hideDelay = _ref2.hideDelay,
        hideDelay = _ref2$hideDelay === void 0 ? props.hideDelay : _ref2$hideDelay;
    return {
      dispatchTransitionState: dispatchTransitionState,
      setIsVisible: setIsVisible,
      props: _extends({}, props, {
        hideDelay: hideDelay
      }),
      isShow: isShow,
      beforeTransition: isShow ? function () {
        return update();
      } : null,
      domElements: {
        el: panelElRef.current,
        showClassElement: domElement
      },
      showClass: classes.visible
    };
  };

  var isTopMenu = function isTopMenu() {
    return props.topMenu || (0, _polytheneCore.stylePropCompare)({
      element: domElement,
      pseudoSelector: ":before",
      prop: "content",
      contains: "\"".concat("top_menu", "\"")
    });
  };

  var positionMenu = function positionMenu() {
    if (_polytheneCore.isServer) {
      return;
    }

    if (!props.target) {
      return;
    }

    var panelEl = panelElRef.current;
    var contentEl = contentElRef.current;
    var targetEl = document.querySelector(props.target);

    if (!targetEl) {
      return;
    }

    if (!panelEl) {
      return;
    } // Don't set the position or top offset if the menu position is fixed


    var hasStylePositionFixed = (0, _polytheneCore.stylePropCompare)({
      element: panelEl,
      prop: "position",
      equals: "fixed"
    });

    if (hasStylePositionFixed && !isTopMenu()) {
      _extends(panelEl.style, {});

      panelEl.offsetHeight; // force reflow

      return;
    }

    var parentRect = panelEl.parentNode.getBoundingClientRect();
    var targetRect = targetEl.getBoundingClientRect();
    var attrsOffsetH = props.offsetH !== undefined ? props.offsetH : props.offset !== undefined ? props.offset // deprecated
    : DEFAULT_OFFSET_H;
    var attrsOffsetV = props.offsetV !== undefined ? props.offsetV : DEFAULT_OFFSET_V;
    var offsetH = attrsOffsetH.toString().indexOf("%") !== -1 ? Math.round(parseFloat(attrsOffsetH) * 0.01 * targetRect.width) : Math.round(parseFloat(attrsOffsetH));
    var offsetV = attrsOffsetV.toString().indexOf("%") !== -1 ? Math.round(parseFloat(attrsOffsetV) * 0.01 * targetRect.height) : Math.round(parseFloat(attrsOffsetV));
    var positionOffsetV = offsetV;
    var attrsOrigin = props.origin || "top";
    var origin = attrsOrigin.split(/\W+/).reduce(function (acc, curr) {
      return acc[curr] = true, acc;
    }, {});
    var firstItem = contentEl.querySelectorAll("." + classes.listTile)[0];

    if (props.reposition) {
      // get the first List Tile to calculate the top position  
      var selectedItem = contentEl.querySelector("." + classes.selectedListTile);

      if (firstItem && selectedItem) {
        // calculate v position: menu should shift upward relative to the first item
        var firstItemRect = firstItem.getBoundingClientRect();
        var selectedItemRect = selectedItem.getBoundingClientRect();
        positionOffsetV = firstItemRect.top - selectedItemRect.top;
      } // align to middle of target


      var alignEl = selectedItem || firstItem;
      var alignRect = alignEl.getBoundingClientRect();

      var _targetRect = targetEl.getBoundingClientRect();

      var heightDiff = _targetRect.height - alignRect.height;
      positionOffsetV += Math.abs(heightDiff) / 2;
    } else if (props.origin && !hasStylePositionFixed) {
      if (origin.top) {
        positionOffsetV += targetRect.top - parentRect.top;
      } else if (origin.bottom) {
        positionOffsetV += targetRect.top - parentRect.bottom;
      }
    }

    if (props.height) {
      var firstItemHeight = firstItem ? firstItem.clientHeight : 48; // default List Tile height

      if (props.height === "max") {
        var topMargin = positionOffsetV;
        var bottomMargin = firstItemHeight;
        panelEl.style.height = "calc(100% - ".concat(topMargin + bottomMargin, "px)");
      } else {
        var height = /^\d+$/.test(props.height.toString()) ? "".concat(props.height, "px") : props.height;
        panelEl.style.height = height;
      }
    } // prevent animated changes


    var transitionDuration = panelEl.style.transitionDuration;
    panelEl.style.transitionDuration = "0ms";

    if (panelEl.parentNode && !hasStylePositionFixed) {
      if (origin.right) {
        panelEl.style.right = targetRect.right - parentRect.right + offsetH + "px";
      } else {
        panelEl.style.left = targetRect.left - parentRect.left + offsetH + "px";
      }

      if (origin.bottom) {
        panelEl.style.bottom = positionOffsetV + "px";
      } else {
        panelEl.style.top = positionOffsetV + "px";
      }

      panelEl.style.transformOrigin = attrsOrigin.split(/\W+/).join(" ");
    }

    panelEl.offsetHeight; // force reflow

    panelEl.style.transitionDuration = transitionDuration;
  };

  var scrollContent = function scrollContent() {
    if (_polytheneCore.isServer) {
      return;
    }

    if (!props.scrollTarget) {
      return;
    }

    var scrollTargetEl = document.querySelector(props.scrollTarget);

    if (!scrollTargetEl) {
      return;
    }

    contentElRef.current.scrollTop = scrollTargetEl.offsetTop;
  };

  var showMenu = function showMenu() {
    return (0, _polytheneCore.transitionComponent)(transitionOptions({
      isShow: true
    }));
  };

  var hideMenu = function hideMenu() {
    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        hideDelay = _ref3.hideDelay;

    return (0, _polytheneCore.transitionComponent)(transitionOptions({
      isShow: false,
      hideDelay: hideDelay
    }));
  };

  useEffect(function () {
    if (!domElement) {
      return;
    }

    panelElRef.current = domElement.querySelector(".".concat(classes.panel));

    _extends(panelElRef.current.style, props.style);

    contentElRef.current = domElement.querySelector(".".concat(classes.content));

    var handleEscape = function handleEscape(e) {
      if (e.key === "Escape" || e.key === "Esc") {
        hideMenu({
          hideDelay: 0
        });
      }
    };

    var handleDismissTap = function handleDismissTap(e) {
      if (e.target === panelElRef.current) {
        return;
      }

      hideMenu();
    };

    var activateDismissTap = function activateDismissTap() {
      _polytheneCore.pointerEndDownEvent.forEach(function (evt) {
        return document.addEventListener(evt, handleDismissTap);
      });
    };

    var deActivateDismissTap = function deActivateDismissTap() {
      _polytheneCore.pointerEndDownEvent.forEach(function (evt) {
        return document.removeEventListener(evt, handleDismissTap);
      });
    };

    if (!props.permanent) {
      (0, _polytheneCore.subscribe)("resize", update);
      (0, _polytheneCore.subscribe)("keydown", handleEscape);
      setTimeout(function () {
        activateDismissTap();
        showMenu();
      }, 0);
    }

    return function () {
      if (!props.permanent) {
        (0, _polytheneCore.unsubscribe)("resize", update);
        (0, _polytheneCore.unsubscribe)("keydown", handleEscape);
        deActivateDismissTap();
      }
    };
  }, [domElement]);
  var type = props.type || DEFAULT_TYPE;

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props, {
    remove: ["style"]
  }), props.testId && {
    "data-test-id": props.testId
  }, getRef(function (dom) {
    return dom && !domElement && (setDomElement(dom), props.getRef && props.getRef(dom));
  }), {
    className: [classes.component, props.permanent ? classes.permanent : null, props.origin ? classes.origin : null, props.backdrop ? classes.showBackdrop : null, props.topMenu ? classes.isTopMenu : null, type === "floating" && !props.permanent ? classes.floating : null, props.width || props.size ? widthClass(unifyWidth(props.width || props.size)) : null, props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  });

  var shadowDepth = props.shadowDepth !== undefined ? props.shadowDepth : DEFAULT_SHADOW_DEPTH;
  var componentContent = [h("div", {
    className: classes.backdrop
  }), h("div", {
    className: classes.panel
  }, [h(Shadow, {
    shadowDepth: shadowDepth,
    animated: true
  }), h("div", {
    className: classes.content
  }, props.content || props.children)])];
  var content = [props.before].concat(componentContent, [props.after]);
  return h(props.element || "div", componentProps, content);
};

exports._Menu = _Menu;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-mithril-menu/dist/polythene-mithril-menu.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Menu = void 0;

var _polytheneCore = require("polythene-core");

var _cyanoMithril = require("cyano-mithril");

var _polytheneCoreMenu = require("polythene-core-menu");

var _polytheneMithrilShadow = require("polythene-mithril-shadow");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var listTileClasses = {
  component: "pe-list-tile",
  // elements
  content: "pe-list-tile__content",
  highSubtitle: "pe-list-tile__high-subtitle",
  primary: "pe-list-tile__primary",
  secondary: "pe-list-tile__secondary",
  subtitle: "pe-list-tile__subtitle",
  title: "pe-list-tile__title",
  contentFront: "pe-list-tile__content-front",
  // states  
  compact: "pe-list-tile--compact",
  compactFront: "pe-list-tile--compact-front",
  disabled: "pe-list-tile--disabled",
  hasFront: "pe-list-tile--front",
  hasHighSubtitle: "pe-list-tile--high-subtitle",
  hasSubtitle: "pe-list-tile--subtitle",
  header: "pe-list-tile--header",
  hoverable: "pe-list-tile--hoverable",
  insetH: "pe-list-tile--inset-h",
  insetV: "pe-list-tile--inset-v",
  selectable: "pe-list-tile--selectable",
  selected: "pe-list-tile--selected",
  rounded: "pe-list-tile--rounded",
  highlight: "pe-list-tile--highlight",
  sticky: "pe-list-tile--sticky",
  navigation: "pe-list-tile--navigation"
};
var classes = {
  component: "pe-menu",
  // elements
  panel: "pe-menu__panel",
  content: "pe-menu__content",
  placeholder: "pe-menu__placeholder",
  backdrop: "pe-menu__backdrop",
  // states
  floating: "pe-menu--floating",
  origin: "pe-menu--origin",
  permanent: "pe-menu--permanent",
  showBackdrop: "pe-menu--backdrop",
  visible: "pe-menu--visible",
  width_auto: "pe-menu--width-auto",
  width_n: "pe-menu--width-",
  isTopMenu: "pe-menu--top-menu",
  // lookup
  listTile: listTileClasses.component,
  selectedListTile: listTileClasses.selected
};
var MenuInstance = (0, _cyanoMithril.cast)(_polytheneCoreMenu._Menu, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  useReducer: _cyanoMithril.useReducer,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect,
  useRef: _cyanoMithril.useRef,
  getRef: _cyanoMithril.getRef,
  Shadow: _polytheneMithrilShadow.Shadow
});
var MenuToggle = (0, _cyanoMithril.cast)(_polytheneCore._Conditional, {
  h: _cyanoMithril.h,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect
});
MenuToggle["displayName"] = "MenuToggle";
var Menu = {
  view: function view(vnode) {
    return (0, _cyanoMithril.h)(MenuToggle, _objectSpread2({}, vnode.attrs, {
      placeholderClassName: classes.placeholder,
      instance: MenuInstance
    }));
  }
};
exports.Menu = Menu;
Menu["displayName"] = "Menu";
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs","polythene-core-menu":"../node_modules/polythene-core-menu/dist/polythene-core-menu.mjs","polythene-mithril-shadow":"../node_modules/polythene-mithril-shadow/dist/polythene-mithril-shadow.mjs"}],"../node_modules/polythene-core-notification/dist/polythene-core-notification.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._Notification = void 0;

var _polytheneCore = require("polythene-core");

var _polytheneUtilities = require("polythene-utilities");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var classes = {
  component: "pe-notification",
  // elements
  action: "pe-notification__action",
  content: "pe-notification__content",
  holder: "pe-notification__holder",
  placeholder: "pe-notification__placeholder",
  title: "pe-notification__title",
  // states
  hasContainer: "pe-notification--container",
  horizontal: "pe-notification--horizontal",
  multilineTitle: "pe-notification__title--multi-line",
  vertical: "pe-notification--vertical",
  visible: "pe-notification--visible"
};
var DEFAULT_TIME_OUT = 3;

var setTitleStyles = function setTitleStyles(titleEl) {
  if (_polytheneCore.isServer) return;
  var height = titleEl.getBoundingClientRect().height;
  var lineHeight = parseInt(window.getComputedStyle(titleEl).lineHeight, 10);
  var paddingTop = parseInt(window.getComputedStyle(titleEl).paddingTop, 10);
  var paddingBottom = parseInt(window.getComputedStyle(titleEl).paddingBottom, 10);

  if (height > lineHeight + paddingTop + paddingBottom) {
    titleEl.classList.add(classes.multilineTitle);
  }
};

var _Notification = function _Notification(_ref) {
  var h = _ref.h,
      a = _ref.a,
      useState = _ref.useState,
      useEffect = _ref.useEffect,
      useRef = _ref.useRef,
      getRef = _ref.getRef,
      useReducer = _ref.useReducer,
      props = _objectWithoutProperties(_ref, ["h", "a", "useState", "useEffect", "useRef", "getRef", "useReducer"]);

  var _useReducer = useReducer(_polytheneCore.transitionStateReducer, _polytheneCore.initialTransitionState),
      _useReducer2 = _slicedToArray(_useReducer, 2),
      transitionState = _useReducer2[0],
      dispatchTransitionState = _useReducer2[1];

  var _useState = useState(),
      _useState2 = _slicedToArray(_useState, 2),
      domElement = _useState2[0],
      setDomElement = _useState2[1];

  var _useState3 = useState(false),
      _useState4 = _slicedToArray(_useState3, 2),
      isPaused = _useState4[0],
      setIsPaused = _useState4[1];

  var containerElRef = useRef();
  var titleElRef = useRef();
  var timerRef = useRef();
  var isVisible = (transitionState || _polytheneCore.initialTransitionState).isVisible;
  var isTransitioning = (transitionState || _polytheneCore.initialTransitionState).isTransitioning;
  var isHiding = (transitionState || _polytheneCore.initialTransitionState).isHiding;

  var transitionOptions = function transitionOptions(_ref2) {
    var isShow = _ref2.isShow,
        referrer = _ref2.referrer;
    return {
      dispatchTransitionState: dispatchTransitionState,
      instanceId: props.instanceId,
      props: props,
      isShow: isShow,
      beforeTransition: stopTimer,
      afterTransition: isShow ? function () {
        // set timer to hide in a few seconds
        var timeout = props.timeout;
        if (timeout === 0) ;else {
          var timeoutSeconds = timeout !== undefined ? timeout : DEFAULT_TIME_OUT;
          timerRef.current.start(function () {
            return hideNotification();
          }, timeoutSeconds);
        }
      } : null,
      domElements: {
        el: domElement,
        containerEl: containerElRef.current
      },
      showClass: classes.visible,
      referrer: referrer
    };
  };

  var showNotification = function showNotification() {
    return (0, _polytheneCore.transitionComponent)(transitionOptions({
      isShow: true
    }));
  };

  var hideNotification = function hideNotification() {
    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        referrer = _ref3.referrer;

    return (0, _polytheneCore.transitionComponent)(transitionOptions({
      isShow: false,
      referrer: referrer
    }));
  };

  var pause = function pause() {
    setIsPaused(true);

    if (timerRef.current) {
      timerRef.current.pause();
    }
  };

  var unpause = function unpause() {
    setIsPaused(false);

    if (timerRef.current) {
      timerRef.current.resume();
    }
  };

  var stopTimer = function stopTimer() {
    if (timerRef.current) {
      timerRef.current.stop();
    }
  };

  useEffect(function () {
    return function () {
      stopTimer();
    };
  }, []); // Timer

  useEffect(function () {
    timerRef.current = new _polytheneUtilities.Timer();
  }, []); // DOM elements

  useEffect(function () {
    if (!domElement) {
      return;
    }

    if (_polytheneCore.isClient) {
      // props.holderSelector is passed as option to Multiple
      containerElRef.current = document.querySelector(props.containerSelector || props.holderSelector);

      if (!containerElRef.current) {
        console.error("No container element found"); // eslint-disable-line no-console
      }

      if (props.containerSelector && containerElRef.current) {
        containerElRef.current.classList.add(classes.hasContainer);
      }
    }

    titleElRef.current = domElement.querySelector(".".concat(classes.title));

    if (titleElRef.current) {
      setTitleStyles(titleElRef.current);
    }
  }, [domElement]); // Show / hide logic

  useEffect(function () {
    if (!domElement || isTransitioning || isHiding) {
      return;
    }

    if (props.hide) {
      if (isVisible) {
        hideNotification();
      }
    } else if (props.show) {
      if (!isVisible) {
        showNotification();
      }
    }
  }, [domElement, isTransitioning, isVisible, isHiding, props.hide, props.show]); // Pause logic

  useEffect(function () {
    if (!domElement || isTransitioning || isHiding) {
      return;
    }

    if (props.unpause) {
      if (isPaused) {
        unpause();
      }
    } else if (props.pause) {
      if (!isPaused) {
        pause();
      }
    }
  }, [domElement, isTransitioning, isHiding, props.pause, props.unpause]);

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props, {
    remove: ["style"]
  }), // style set in content, and set by show/hide transition
  getRef(function (dom) {
    return dom && !domElement && (setDomElement(dom), props.ref && props.ref(dom));
  }), props.testId && {
    "data-test-id": props.testId
  }, _defineProperty({
    className: [classes.component, props.fromMultipleClassName, // classes.visible is set in showNotification though transition
    props.tone === "light" ? null : "pe-dark-tone", // default dark tone
    props.containerSelector ? classes.hasContainer : null, props.layout === "vertical" ? classes.vertical : classes.horizontal, props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  }, a.onclick, function (e) {
    return e.preventDefault();
  }));

  var contents = h("div", {
    className: classes.content,
    style: props.style
  }, props.content || [props.title ? h("div", {
    className: classes.title
  }, props.title) : null, props.action ? h("div", {
    className: classes.action
  }, props.action) : null]);
  var content = [props.before, contents, props.after];
  return h(props.element || "div", componentProps, content);
};

exports._Notification = _Notification;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs","polythene-utilities":"../node_modules/polythene-utilities/dist/polythene-utilities.mjs"}],"../node_modules/polythene-mithril-notification/dist/polythene-mithril-notification.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotificationInstance = exports.Notification = void 0;

var _cyanoMithril = require("cyano-mithril");

var _polytheneCore = require("polythene-core");

var _polytheneCoreNotification = require("polythene-core-notification");

var classes = {
  component: "pe-notification",
  // elements
  action: "pe-notification__action",
  content: "pe-notification__content",
  holder: "pe-notification__holder",
  placeholder: "pe-notification__placeholder",
  title: "pe-notification__title",
  // states
  hasContainer: "pe-notification--container",
  horizontal: "pe-notification--horizontal",
  multilineTitle: "pe-notification__title--multi-line",
  vertical: "pe-notification--vertical",
  visible: "pe-notification--visible"
};
var NotificationInstance = (0, _cyanoMithril.cast)(_polytheneCoreNotification._Notification, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect,
  useRef: _cyanoMithril.useRef,
  getRef: _cyanoMithril.getRef,
  useReducer: _cyanoMithril.useReducer
});
exports.NotificationInstance = NotificationInstance;
NotificationInstance["displayName"] = "NotificationInstance";
var options = {
  name: "notification",
  className: classes.component,
  htmlShowClass: classes.open,
  defaultId: "default_notification",
  holderSelector: ".".concat(classes.holder),
  instance: NotificationInstance,
  placeholder: "span.".concat(classes.placeholder),
  queue: true
};
var MultipleInstance = (0, _polytheneCore.Multi)({
  options: options
});
var Notification = (0, _cyanoMithril.cast)(MultipleInstance.render, {
  h: _cyanoMithril.h,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect
});
exports.Notification = Notification;
Object.getOwnPropertyNames(MultipleInstance).filter(function (p) {
  return p !== "render";
}).forEach(function (p) {
  return Notification[p] = MultipleInstance[p];
});
Notification["displayName"] = "Notification";
},{"cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs","polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs","polythene-core-notification":"../node_modules/polythene-core-notification/dist/polythene-core-notification.mjs"}],"../node_modules/polythene-core-radio-button/dist/polythene-core-radio-button.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._RadioButton = void 0;

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

var classes = {
  component: "pe-radio-control"
};
var iconOn = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z\"/></svg>";
var iconOff = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z\"/></svg>";
var icons = {
  iconOff: iconOff,
  iconOn: iconOn
};

var _RadioButton = function _RadioButton(_ref) {
  var h = _ref.h,
      SelectionControl = _ref.SelectionControl,
      props = _objectWithoutProperties(_ref, ["h", "SelectionControl"]);

  var componentProps = _extends({}, props, {
    icons: icons,
    selectable: props.selectable || function (selected) {
      return !selected;
    },
    // default: only selectable when not checked
    instanceClass: classes.component,
    type: "radio"
  });

  return h(SelectionControl, componentProps);
};

exports._RadioButton = _RadioButton;
},{}],"../node_modules/polythene-mithril-radio-button/dist/polythene-mithril-radio-button.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RadioButton = void 0;

var _polytheneCoreRadioButton = require("polythene-core-radio-button");

var _polytheneCoreSelectionControl = require("polythene-core-selection-control");

var _cyanoMithril = require("cyano-mithril");

var _polytheneMithrilIcon = require("polythene-mithril-icon");

var _polytheneMithrilIconButton = require("polythene-mithril-icon-button");

var ViewControl = (0, _cyanoMithril.cast)(_polytheneCoreSelectionControl._ViewControl, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  Icon: _polytheneMithrilIcon.Icon,
  IconButton: _polytheneMithrilIconButton.IconButton
});
ViewControl["displayName"] = "ViewControl";
var SelectionControl = (0, _cyanoMithril.cast)(_polytheneCoreSelectionControl._SelectionControl, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect,
  ViewControl: ViewControl
});
SelectionControl["displayName"] = "SelectionControl";
var RadioButton = (0, _cyanoMithril.cast)(_polytheneCoreRadioButton._RadioButton, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  SelectionControl: SelectionControl
});
exports.RadioButton = RadioButton;
RadioButton["displayName"] = "RadioButton";
},{"polythene-core-radio-button":"../node_modules/polythene-core-radio-button/dist/polythene-core-radio-button.mjs","polythene-core-selection-control":"../node_modules/polythene-core-selection-control/dist/polythene-core-selection-control.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs","polythene-mithril-icon":"../node_modules/polythene-mithril-icon/dist/polythene-mithril-icon.mjs","polythene-mithril-icon-button":"../node_modules/polythene-mithril-icon-button/dist/polythene-mithril-icon-button.mjs"}],"../node_modules/polythene-core-radio-group/dist/polythene-core-radio-group.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._RadioGroup = void 0;

var _polytheneCore = require("polythene-core");

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var classes = {
  component: "pe-radio-group"
};

var _RadioGroup = function _RadioGroup(_ref) {
  var h = _ref.h,
      a = _ref.a,
      useState = _ref.useState,
      useEffect = _ref.useEffect,
      RadioButton = _ref.RadioButton,
      props = _objectWithoutProperties(_ref, ["h", "a", "useState", "useEffect", "RadioButton"]);

  var _useState = useState(),
      _useState2 = _slicedToArray(_useState, 2),
      checkedIndex = _useState2[0],
      setCheckedIndex = _useState2[1];

  var buttons = props.content || props.buttons || props.children;
  useEffect(function () {
    var index = buttons.reduce(function (acc, buttonOpts, index) {
      if (buttonOpts.value === undefined) {
        console.error("Option 'value' not set for radio button"); // eslint-disable-line no-console
      }

      return acc !== null ? acc : buttonOpts.defaultChecked !== undefined || props.defaultCheckedValue !== undefined && buttonOpts.value === props.defaultCheckedValue || props.defaultSelectedValue !== undefined && buttonOpts.value === props.defaultSelectedValue // deprecated
      ? index : acc;
    }, null);
    setCheckedIndex(index);
  }, []);

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.component, props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  });

  var groupCheckedValue = props.checkedValue;
  var contents = buttons.length ? buttons.map(function (buttonOpts, index) {
    if (!buttonOpts) {
      return null;
    }

    var isChecked = buttonOpts.checked !== undefined ? buttonOpts.checked : groupCheckedValue !== undefined ? buttonOpts.value === groupCheckedValue : checkedIndex === index;
    return h(RadioButton, _extends({}, {
      /* group attributes that may be overwritten by individual buttons */
      name: props.name
    }, props.all,
    /* individual button options */
    buttonOpts, {
      /* this component's options */
      onChange: function onChange(_ref2) {
        var value = _ref2.value;
        return setCheckedIndex(index), props.onChange && props.onChange({
          value: value
        });
      },
      checked: isChecked,
      key: buttonOpts.value // required for proper selection

    }));
  }) : null;
  var content = [props.before, contents, props.after];
  return h(props.element || "div", componentProps, content);
};

exports._RadioGroup = _RadioGroup;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-mithril-radio-group/dist/polythene-mithril-radio-group.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RadioGroup = void 0;

var _polytheneCoreRadioGroup = require("polythene-core-radio-group");

var _polytheneMithrilRadioButton = require("polythene-mithril-radio-button");

var _cyanoMithril = require("cyano-mithril");

var RadioGroup = (0, _cyanoMithril.cast)(_polytheneCoreRadioGroup._RadioGroup, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect,
  RadioButton: _polytheneMithrilRadioButton.RadioButton
});
exports.RadioGroup = RadioGroup;
RadioGroup["displayName"] = "RadioGroup";
},{"polythene-core-radio-group":"../node_modules/polythene-core-radio-group/dist/polythene-core-radio-group.mjs","polythene-mithril-radio-button":"../node_modules/polythene-mithril-radio-button/dist/polythene-mithril-radio-button.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-mithril-raised-button/dist/polythene-mithril-raised-button.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RaisedButton = void 0;

var _polytheneMithrilButton = require("polythene-mithril-button");

var _cyanoMithril = require("cyano-mithril");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var RaisedButton = {
  view: function view(vnode) {
    return (0, _cyanoMithril.h)(_polytheneMithrilButton.Button, _objectSpread2({
      raised: true
    }, vnode.attrs), vnode.children);
  }
};
exports.RaisedButton = RaisedButton;
RaisedButton["displayName"] = "RaisedButton";
},{"polythene-mithril-button":"../node_modules/polythene-mithril-button/dist/polythene-mithril-button.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-core-search/dist/polythene-core-search.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._Search = void 0;

var _polytheneCore = require("polythene-core");

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var classes = {
  component: "pe-search",
  // elements
  content: "pe-search__content",
  // states
  searchFullWidth: "pe-search--full-width",
  searchInset: "pe-search--inset"
};

var getNameOfState = function getNameOfState(searchState) {
  return searchState.focus && searchState.dirty ? "focus_dirty" : searchState.focus ? "focus" : searchState.dirty ? "dirty" : "none";
};

var _Search = function _Search(_ref) {
  var h = _ref.h,
      a = _ref.a,
      useState = _ref.useState,
      TextField = _ref.TextField,
      props = _objectWithoutProperties(_ref, ["h", "a", "useState", "TextField"]);

  delete props.key;

  var _useState = useState({}),
      _useState2 = _slicedToArray(_useState, 2),
      searchState = _useState2[0],
      setSearchState = _useState2[1];

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.component, props.fullWidth ? classes.searchFullWidth : classes.searchInset, props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  }, props.events);

  var searchStateName = getNameOfState(searchState);
  var buttons = (props.buttons || {})[searchStateName] || {};
  var textfieldAttrs = props.textfield || {};
  var componentContent = h("div", {
    className: classes.content
  }, [buttons.before, h(TextField, _extends({}, textfieldAttrs, {
    onChange: function onChange(newState) {
      setSearchState(newState);

      if (textfieldAttrs.onChange) {
        textfieldAttrs.onChange(newState);
      }
    }
  })), buttons.after]);
  var content = [props.before, componentContent, props.after];
  return h(props.element || "div", componentProps, content);
};

exports._Search = _Search;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-core-textfield/dist/polythene-core-textfield.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._TextField = void 0;

var _polytheneCore = require("polythene-core");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var classes = {
  component: "pe-textfield",
  // elements
  counter: "pe-textfield__counter",
  error: "pe-textfield__error",
  errorPlaceholder: "pe-textfield__error-placeholder",
  focusHelp: "pe-textfield__help-focus",
  help: "pe-textfield__help",
  input: "pe-textfield__input",
  inputArea: "pe-textfield__input-area",
  label: "pe-textfield__label",
  optionalIndicator: "pe-textfield__optional-indicator",
  requiredIndicator: "pe-textfield__required-indicator",
  // states
  hasCounter: "pe-textfield--counter",
  hasFloatingLabel: "pe-textfield--floating-label",
  hasFullWidth: "pe-textfield--full-width",
  hideClear: "pe-textfield--hide-clear",
  hideSpinner: "pe-textfield--hide-spinner",
  hideValidation: "pe-textfield--hide-validation",
  isDense: "pe-textfield--dense",
  isRequired: "pe-textfield--required",
  stateDirty: "pe-textfield--dirty",
  stateDisabled: "pe-textfield--disabled",
  stateFocused: "pe-textfield--focused",
  stateInvalid: "pe-textfield--invalid",
  stateReadonly: "pe-textfield--readonly"
};
var DEFAULT_VALID_STATE = {
  invalid: false,
  message: undefined
};

var ignoreEvent = function ignoreEvent(props, name) {
  return props.ignoreEvents && props.ignoreEvents.indexOf(name) !== -1;
};

var _TextField = function _TextField(_ref) {
  var h = _ref.h,
      a = _ref.a,
      useState = _ref.useState,
      useEffect = _ref.useEffect,
      useRef = _ref.useRef,
      getRef = _ref.getRef,
      props = _objectWithoutProperties(_ref, ["h", "a", "useState", "useEffect", "useRef", "getRef"]);

  var defaultValue = props.defaultValue !== undefined && props.defaultValue !== null ? props.defaultValue.toString() : props.value !== undefined && props.value !== null ? props.value.toString() : "";

  var _useState = useState(),
      _useState2 = _slicedToArray(_useState, 2),
      domElement = _useState2[0],
      setDomElement = _useState2[1];

  var _useState3 = useState(false),
      _useState4 = _slicedToArray(_useState3, 2),
      isInvalid = _useState4[0],
      setIsInvalid = _useState4[1];

  var _useState5 = useState(defaultValue),
      _useState6 = _slicedToArray(_useState5, 2),
      value = _useState6[0],
      setValue = _useState6[1];

  var inputElRef = useRef();
  var previousValueRef = useRef();
  var previousStatusRef = useRef();
  var isDirtyRef = useRef();
  var hasFocusRef = useRef();
  var isTouchedRef = useRef();
  var errorRef = useRef();
  var inputType = props.multiLine ? "textarea" : "input";
  var showErrorPlaceholder = !!(props.valid !== undefined || props.validate || props.min || props.max || props[a.minlength] || props[a.maxlength] || props.required || props.pattern);

  var handleStateUpdate = function handleStateUpdate() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        type = _ref2.type,
        focus = _ref2.focus,
        value = _ref2.value;

    if (!inputElRef.current) {
      return;
    }

    if (value !== undefined) {
      inputElRef.current.value = value;
    }

    if (focus !== undefined) {
      hasFocusRef.current = focus;

      if (focus) {
        inputElRef.current.focus();
      } else {
        inputElRef.current.blur();
      }
    }

    if (type === "input" && (props.validateOnInput || props.counter)) {
      isTouchedRef.current = inputElRef.current.value !== defaultValue;
    }

    if (type !== "input") {
      isTouchedRef.current = inputElRef.current.value !== defaultValue;
    }

    if (type === "onblur") {
      isTouchedRef.current = true;
    }

    isDirtyRef.current = inputElRef.current.value !== "";
    checkValidity();
    notifyState();

    if (previousValueRef.current !== inputElRef.current.value) {
      setValue(inputElRef.current.value); // force update
    }
  };

  var validateCustom = function validateCustom() {
    if (!inputElRef.current) {
      return DEFAULT_VALID_STATE;
    }

    var validState = props.validate(inputElRef.current.value);
    return {
      invalid: validState && !validState.valid,
      message: validState && validState.error
    };
  };

  var validateCounter = function validateCounter() {
    return {
      invalid: inputElRef.current.value.length > props.counter,
      message: props.error
    };
  };

  var validateHTML = function validateHTML() {
    return {
      invalid: !inputElRef.current.checkValidity(),
      message: props.error
    };
  };

  var getValidStatus = function getValidStatus() {
    var status = DEFAULT_VALID_STATE; // props.validateResetOnClear: reset validation when field is cleared

    if (isTouchedRef.current && isInvalid && inputElRef.current.value.length === 0 && props.validateResetOnClear) {
      isTouchedRef.current = false;
      setIsInvalid(false);
      errorRef.current = undefined;
    }

    if (props.counter) {
      status = validateCounter();
    }

    if (!status.invalid && inputElRef.current.checkValidity) {
      status = validateHTML();
    }

    if (!status.invalid && props.validate) {
      status = validateCustom();
    }

    return status;
  };

  var checkValidity = function checkValidity() {
    // default
    var status = props.valid !== undefined ? {
      invalid: !props.valid,
      message: props.error
    } : !isTouchedRef.current && !props.validateAtStart ? DEFAULT_VALID_STATE : getValidStatus();
    var previousInvalid = isInvalid;
    errorRef.current = status.message;

    if (status.invalid !== previousInvalid) {
      setIsInvalid(status.invalid);
    }

    if (!status.invalid) {
      errorRef.current = undefined;
    }
  };

  var notifyState = function notifyState() {
    if (props.onChange) {
      var validStatus = getValidStatus();
      var status = {
        focus: hasFocusRef.current,
        dirty: isDirtyRef.current,
        invalid: validStatus.invalid,
        error: validStatus.error,
        value: inputElRef.current.value
      };

      if (JSON.stringify(status) !== JSON.stringify(previousStatusRef.current)) {
        props.onChange(_objectSpread2({}, status, {
          el: inputElRef.current,
          setInputState: function setInputState(newState) {
            var hasNewValue = newState.value !== undefined && newState.value !== inputElRef.current.value;
            var hasNewFocus = newState.focus !== undefined && newState.focus !== hasFocusRef.current;

            if (hasNewValue || hasNewFocus) {
              handleStateUpdate(newState);
            }
          }
        }));
        previousStatusRef.current = status;
      }
    }
  }; // State refs


  useEffect(function () {
    isDirtyRef.current = defaultValue !== "";
    hasFocusRef.current = false;
    isTouchedRef.current = false;
    errorRef.current = props.error;
  }, []); // Input DOM element

  useEffect(function () {
    if (!domElement) {
      return;
    }

    inputElRef.current = domElement.querySelector(inputType);
    inputElRef.current.value = defaultValue;
    handleStateUpdate();
    checkValidity(); // handle `validateAtStart`

    notifyState();
  }, [domElement]); // Handle value updates

  useEffect(function () {
    if (!inputElRef.current) {
      return;
    }

    var value = props.value !== undefined && props.value !== null ? props.value : inputElRef.current ? inputElRef.current.value : previousValueRef.current;
    var valueStr = value === undefined || value === null ? "" : value.toString();

    if (inputElRef.current && previousValueRef.current !== valueStr) {
      inputElRef.current.value = valueStr;
      previousValueRef.current = valueStr;
      handleStateUpdate({
        type: "input"
      });
    }
  }, [inputElRef.current, props.value]); // Handle error state updates

  useEffect(function () {
    if (!inputElRef.current) {
      return;
    }

    checkValidity();
    notifyState();
  }, [props, inputElRef.current && inputElRef.current.value]);

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), props.testId && {
    "data-test-id": props.testId
  }, getRef(function (dom) {
    return dom && !domElement && (setDomElement(dom), props.ref && props.ref(dom));
  }), {
    className: [classes.component, isInvalid ? classes.stateInvalid : "", hasFocusRef.current ? classes.stateFocused : "", isDirtyRef.current ? classes.stateDirty : "", props.floatingLabel ? classes.hasFloatingLabel : "", props.disabled ? classes.stateDisabled : "", props.readonly ? classes.stateReadonly : "", props.dense ? classes.isDense : "", props.required ? classes.isRequired : "", props.fullWidth ? classes.hasFullWidth : "", props.counter ? classes.hasCounter : "", props.hideSpinner !== false && props.hideSpinner !== undefined ? classes.hideSpinner : "", props.hideClear !== false && props.hideClear !== undefined ? classes.hideClear : "", props.hideValidation ? classes.hideValidation : "", props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  });

  var allProps = _objectSpread2({}, props, {}, props.domAttributes);

  var errorMessage = props.error || errorRef.current;
  var type = allProps.multiLine ? null : !allProps.type || allProps.type === "submit" || allProps.type === "search" ? "text" : allProps.type;
  var showError = isInvalid && errorMessage !== undefined;
  var inactive = allProps.disabled || allProps[a.readonly];
  var requiredIndicator = allProps.required && allProps.requiredIndicator !== "" ? h("span", {
    className: classes.requiredIndicator
  }, allProps.requiredIndicator || "*") : null;
  var optionalIndicator = !allProps.required && allProps.optionalIndicator ? h("span", {
    className: classes.optionalIndicator
  }, allProps.optionalIndicator) : null;
  var label = allProps.label ? [allProps.label, requiredIndicator, optionalIndicator] : null;
  var events = allProps.events || {};
  var componentContent = [h("div", {
    className: classes.inputArea
  }, [label ? h("label", {
    className: classes.label
  }, label) : null, h(inputType, _extends({}, {
    className: classes.input,
    disabled: allProps.disabled
  }, type ? {
    type: type
  } : null, allProps.name ? {
    name: allProps.name
  } : null, events, !ignoreEvent(allProps, a.onclick) ? _defineProperty({}, a.onclick, function (e) {
    if (inactive) {
      return;
    } // in case the browser does not give the field focus,
    // for instance when the user tapped to the current field off screen


    handleStateUpdate({
      focus: true
    });
    events[a.onclick] && events[a.onclick](e);
  }) : null, !ignoreEvent(allProps, a.onfocus) ? _defineProperty({}, a.onfocus, function (e) {
    if (inactive) {
      return;
    }

    handleStateUpdate({
      focus: true
    }); // set CSS class manually in case field gets focus but is off screen
    // and no redraw is triggered
    // at the next redraw `hasFocusRef.current` will be read and the focus class be set
    // in the props.class statement

    if (domElement) {
      domElement.classList.add(classes.stateFocused);
    }

    events[a.onfocus] && events[a.onfocus](e);
  }) : null, !ignoreEvent(allProps, a.onblur) ? _defineProperty({}, a.onblur, function (e) {
    handleStateUpdate({
      type: "onblur",
      focus: false
    }); // same principle as onfocus

    domElement.classList.remove(classes.stateFocused);
    events[a.onblur] && events[a.onblur](e);
  }) : null, !ignoreEvent(allProps, a.oninput) ? _defineProperty({}, a.oninput, function (e) {
    // default input event
    // may be overwritten by props.events
    handleStateUpdate({
      type: "input"
    });
    events[a.oninput] && events[a.oninput](e);
  }) : null, !ignoreEvent(allProps, a.onkeydown) ? _defineProperty({}, a.onkeydown, function (e) {
    if (e.key === "Enter") {
      isTouchedRef.current = true;
    } else if (e.key === "Escape" || e.key === "Esc") {
      handleStateUpdate({
        focus: false
      });
    }

    events[a.onkeydown] && events[a.onkeydown](e);
  }) : null, allProps.required !== undefined && !!allProps.required ? {
    required: true
  } : null, allProps[a.readonly] !== undefined && !!allProps[a.readonly] ? _defineProperty({}, a.readonly, true) : null, allProps.pattern !== undefined ? {
    pattern: allProps.pattern
  } : null, allProps[a.maxlength] !== undefined ? _defineProperty({}, a.maxlength, allProps[a.maxlength]) : null, allProps[a.minlength] !== undefined ? _defineProperty({}, a.minlength, allProps[a.minlength]) : null, allProps.max !== undefined ? {
    max: allProps.max
  } : null, allProps.min !== undefined ? {
    min: allProps.min
  } : null, allProps[a.autofocus] !== undefined ? _defineProperty({}, a.autofocus, allProps[a.autofocus]) : null, allProps[a.tabindex] !== undefined ? _defineProperty({}, a.tabindex, allProps[a.tabindex]) : null, allProps.rows !== undefined ? {
    rows: allProps.rows
  } : null, allProps.placeholder !== undefined ? {
    placeholder: allProps.placeholder
  } : null, allProps.domAttributes !== undefined ? _objectSpread2({}, allProps.domAttributes) : null))]), allProps.counter ? h("div", {
    className: classes.counter
  }, (value.length || 0) + " / " + allProps.counter) : null, allProps.help && !showError ? h("div", {
    className: [classes.help, allProps.focusHelp ? classes.focusHelp : null].join(" ")
  }, allProps.help) : null, showError ? h("div", {
    className: classes.error
  }, errorMessage) : showErrorPlaceholder && !allProps.help ? h("div", {
    className: classes.errorPlaceholder
  }) : null];
  var content = [props.before].concat(componentContent, [props.after]);
  return h(props.element || "div", componentProps, content);
};

exports._TextField = _TextField;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-mithril-textfield/dist/polythene-mithril-textfield.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextField = void 0;

var _polytheneCoreTextfield = require("polythene-core-textfield");

var _cyanoMithril = require("cyano-mithril");

var TextField = (0, _cyanoMithril.cast)(_polytheneCoreTextfield._TextField, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  useEffect: _cyanoMithril.useEffect,
  useState: _cyanoMithril.useState,
  useRef: _cyanoMithril.useRef,
  getRef: _cyanoMithril.getRef
});
exports.TextField = TextField;
TextField["displayName"] = "TextField";
},{"polythene-core-textfield":"../node_modules/polythene-core-textfield/dist/polythene-core-textfield.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-mithril-search/dist/polythene-mithril-search.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Search = void 0;

var _polytheneCoreSearch = require("polythene-core-search");

var _polytheneMithrilTextfield = require("polythene-mithril-textfield");

var _cyanoMithril = require("cyano-mithril");

var Search = (0, _cyanoMithril.cast)(_polytheneCoreSearch._Search, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  useState: _cyanoMithril.useState,
  TextField: _polytheneMithrilTextfield.TextField
});
exports.Search = Search;
Search["displayName"] = "Search";
},{"polythene-core-search":"../node_modules/polythene-core-search/dist/polythene-core-search.mjs","polythene-mithril-textfield":"../node_modules/polythene-mithril-textfield/dist/polythene-mithril-textfield.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-core-slider/dist/polythene-core-slider.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._Slider = void 0;

var _polytheneCore = require("polythene-core");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var classes = {
  component: "pe-slider",
  // elements
  control: "pe-slider__control",
  label: "pe-slider__label",
  pin: "pe-slider__pin",
  thumb: "pe-slider__thumb",
  tick: "pe-slider__tick",
  ticks: "pe-slider__ticks",
  track: "pe-slider__track",
  trackBar: "pe-slider__track-bar",
  trackBarValue: "pe-slider__track-bar-value",
  trackPart: "pe-slider__track-part",
  trackPartRest: "pe-slider__track-rest",
  trackPartValue: "pe-slider__track-value",
  // states
  hasFocus: "pe-slider--focus",
  hasPin: "pe-slider--pin",
  hasTicks: "pe-slider--ticks",
  hasTrack: "pe-slider--track",
  isActive: "pe-slider--active",
  isAtMin: "pe-slider--min",
  isDisabled: "pe-slider--disabled",
  tickValue: "pe-slider__tick--value"
};
var MAX_TICKS = 100;

var positionFromEvent = function positionFromEvent(e, isVertical) {
  return (// isVertical not yet implemented
    _polytheneCore.isTouch && e.touches ? isVertical ? e.touches[0].pageY : e.touches[0].pageX : isVertical ? e.pageY : e.pageX
  );
};

var _Slider = function _Slider(_ref) {
  var _ref3;

  var h = _ref.h,
      a = _ref.a,
      useState = _ref.useState,
      useEffect = _ref.useEffect,
      useRef = _ref.useRef,
      getRef = _ref.getRef,
      props = _objectWithoutProperties(_ref, ["h", "a", "useState", "useEffect", "useRef", "getRef"]);

  var min = props.min !== undefined ? props.min : 0;
  var max = props.max !== undefined ? props.max : 100;
  var range = max - min;
  var stepSize = props.stepSize !== undefined ? props.stepSize : 1;
  var normalizeFactor = 1 / stepSize;
  var hasTicks = props.ticks !== undefined && props.ticks !== false;
  var interactiveTrack = props.interactiveTrack !== undefined ? props.interactiveTrack : true;
  var stepCount = Math.min(MAX_TICKS, parseInt(range / stepSize, 10));
  var defaultValue = props.defaultValue !== undefined ? props.defaultValue : props.value !== undefined ? props.value : 0;
  var focusElementRef = useRef();
  var trackElRef = useRef();
  var controlElRef = useRef();
  var pinElRef = useRef();

  var _useState = useState(),
      _useState2 = _slicedToArray(_useState, 2),
      domElement = _useState2[0],
      setDomElement = _useState2[1];

  var _useState3 = useState(min),
      _useState4 = _slicedToArray(_useState3, 2),
      fraction = _useState4[0],
      setFraction = _useState4[1];

  var _useState5 = useState(false),
      _useState6 = _slicedToArray(_useState5, 2),
      hasFocus = _useState6[0],
      setHasFocus = _useState6[1];

  var _useState7 = useState(),
      _useState8 = _slicedToArray(_useState7, 2),
      value = _useState8[0],
      setValue = _useState8[1];

  var _useState9 = useState(),
      _useState10 = _slicedToArray(_useState9, 2),
      previousValue = _useState10[0],
      setPreviousValue = _useState10[1];

  var _useState11 = useState(false),
      _useState12 = _slicedToArray(_useState11, 2),
      isActive = _useState12[0],
      setIsActive = _useState12[1];

  var isDraggingRef = useRef();
  var clickOffsetRef = useRef();
  var rangeWidthRef = useRef();
  var rangeOffsetRef = useRef();
  var controlWidthRef = useRef();

  var updatePinPosition = function updatePinPosition() {
    if (controlElRef.current && pinElRef.current) {
      var left = fraction * rangeWidthRef.current;
      pinElRef.current.style.left = left + "px";
    }
  };

  var generateTickMarks = function generateTickMarks(h, stepCount, stepSize, value) {
    var items = [];
    var stepWithValue = value / stepSize;
    var s = 0;

    while (s < stepCount + 1) {
      items.push(h("div", {
        className: s <= stepWithValue ? [classes.tick, classes.tickValue].join(" ") : classes.tick,
        key: "tick-".concat(s)
      }));
      s++;
    }

    return items;
  };

  var readRangeData = function readRangeData() {
    if (controlElRef.current && _polytheneCore.isClient) {
      // range is from the far left to the far right minus the thumb width (max x is at the left side of the thumb)
      controlWidthRef.current = parseFloat((0, _polytheneCore.getStyle)({
        element: controlElRef.current,
        prop: "width"
      }));
      rangeWidthRef.current = trackElRef.current.getBoundingClientRect().width - controlWidthRef.current;
      var styles = window.getComputedStyle(trackElRef.current);
      rangeOffsetRef.current = parseFloat(styles.marginLeft);
    }
  };

  var updateClickOffset = function updateClickOffset() {
    var controlOffset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    clickOffsetRef.current = trackElRef.current.getBoundingClientRect().left - (rangeOffsetRef.current - controlWidthRef.current / 2) + controlOffset;
  };

  var initControlEvent = function initControlEvent(e) {
    var controlPos = controlElRef.current.getBoundingClientRect().left;
    var eventPos = positionFromEvent(e);
    var controlOffset = eventPos - controlPos - controlWidthRef.current / 2;
    updateClickOffset(controlOffset);
  };

  var initTrackEvent = function initTrackEvent() {
    return updateClickOffset(0);
  };

  var handlePosEvent = function handlePosEvent(e) {
    var pos = positionFromEvent(e) - clickOffsetRef.current;
    var newValue = min + (pos - rangeOffsetRef.current) / rangeWidthRef.current * range;
    updateValue(newValue);
  };

  var startDrag = function startDrag(e) {
    if (isDraggingRef.current) return;
    e.preventDefault();
    isDraggingRef.current = true;
    setIsActive(true);
    deFocus();

    var drag = function drag(e) {
      if (!isDraggingRef.current) return;
      handlePosEvent(e);
    };

    var endDrag = function endDrag() {
      if (!isDraggingRef.current) return;
      deFocus();

      if (_polytheneCore.isClient) {
        _polytheneCore.pointerMoveEvent.forEach(function (evt) {
          return window.removeEventListener(evt, drag);
        });

        _polytheneCore.pointerEndDownEvent.forEach(function (evt) {
          return window.removeEventListener(evt, endDrag);
        });
      }

      isDraggingRef.current = false;
      setIsActive(false);
    };

    if (_polytheneCore.isClient) {
      _polytheneCore.pointerMoveEvent.forEach(function (evt) {
        return window.addEventListener(evt, drag);
      });

      _polytheneCore.pointerEndDownEvent.forEach(function (evt) {
        return window.addEventListener(evt, endDrag);
      });
    }

    readRangeData();
  };

  var handleNewValue = function handleNewValue(_ref2) {
    var value = _ref2.value,
        _ref2$shouldNotify = _ref2.shouldNotify,
        shouldNotify = _ref2$shouldNotify === void 0 ? false : _ref2$shouldNotify;
    if (value < min) value = min;
    if (value > max) value = max;
    var newValue = stepSize ? Math.round(value * normalizeFactor) / normalizeFactor : value;
    setFraction((newValue - min) / range);
    setPreviousValue(newValue);
    setValue(newValue);

    if (shouldNotify && props.onChange) {
      props.onChange({
        value: newValue
      });
    }
  };

  var updateValue = function updateValue(value) {
    handleNewValue({
      value: value,
      shouldNotify: true
    });
  };

  var increment = function increment(useLargeStep) {
    return updateValue(value + (useLargeStep ? 10 : 1) * (stepSize || 1));
  };

  var decrement = function decrement(useLargeStep) {
    return updateValue(value - (useLargeStep ? 10 : 1) * (stepSize || 1));
  };

  var deFocus = function deFocus() {
    if (focusElementRef.current) {
      focusElementRef.current.blur();
    }

    focusElementRef.current = undefined;
    setHasFocus(false);
  };

  var focus = function focus(element) {
    deFocus();
    focusElementRef.current = element;
    setHasFocus(true);
  }; // State refs


  useEffect(function () {
    isDraggingRef.current = false;
    clickOffsetRef.current = 0;
    rangeWidthRef.current = 0;
    rangeOffsetRef.current = 0;
    controlWidthRef.current = 0;
  }, []); // DOM children

  useEffect(function () {
    if (!domElement) {
      return;
    }

    trackElRef.current = domElement.querySelector(".".concat(classes.track));
    controlElRef.current = domElement.querySelector(".".concat(classes.control));
    pinElRef.current = domElement.querySelector(".".concat(classes.pin));
    readRangeData();
    handleNewValue({
      value: defaultValue
    });
  }, [domElement]); // Pin position

  useEffect(function () {
    if (!props.pin) {
      return;
    }

    updatePinPosition();
  }, [value]); // Handle external changes of `value`

  useEffect(function () {
    if (previousValue !== props.value) {
      handleNewValue({
        value: props.value
      });
    }
  }, [props.value]);

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), getRef(function (dom) {
    return dom && !domElement && setDomElement(dom);
  }), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.component, props.disabled ? classes.isDisabled : null, props.pin ? classes.hasPin : null, interactiveTrack ? classes.hasTrack : null, isActive ? classes.isActive : null, hasFocus ? classes.hasFocus : null, fraction === 0 ? classes.isAtMin : null, hasTicks ? classes.hasTicks : null, props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  });

  var onStartTrack = function onStartTrack(e) {
    e.preventDefault();

    if (isDraggingRef.current) {
      return;
    }

    readRangeData();
    initTrackEvent();
    handlePosEvent(e);
    startDrag(e);
  };

  var onInitDrag = function onInitDrag(e) {
    e.preventDefault();
    readRangeData();
    initControlEvent(e);
    startDrag(e);
  };

  var flexValueCss = fraction + " 1 0%";
  var flexRestValue = 1 - fraction;
  var flexRestCss = flexRestValue + " 1 0%";
  var content = [props.before, h("div", _extends({}, {
    className: classes.track
  }, interactiveTrack && !props.disabled && _polytheneCore.pointerStartDownEvent.reduce(function (acc, evt) {
    return acc[a["on".concat(evt)]] = onStartTrack, acc;
  }, {})), [h("div", {
    className: classes.trackPart + " " + classes.trackPartValue,
    style: {
      flex: flexValueCss,
      msFlex: flexValueCss,
      WebkitFlex: flexValueCss
    }
  }, h("div", {
    className: classes.trackBar
  }, h("div", {
    className: classes.trackBarValue
  }))), h("div", _extends({}, {
    className: classes.control
  }, props.disabled ? {
    disabled: true
  } : (_ref3 = {}, _defineProperty(_ref3, a.tabindex, props[a.tabindex] || 0), _defineProperty(_ref3, a.onfocus, function () {
    return focus(controlElRef.current);
  }), _defineProperty(_ref3, a.onblur, function () {
    return deFocus();
  }), _defineProperty(_ref3, a.onkeydown, function (e) {
    if (e.key !== "Tab") {
      e.preventDefault();
    }

    if (e.key === "Escape" || e.key === "Esc") {
      controlElRef.current.blur(e);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "Left" || e.key === "Down") {
      decrement(!!e.shiftKey);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "Right" || e.key === "Up") {
      increment(!!e.shiftKey);
    } else if (e.key === "Home") {
      updateValue(min);
    } else if (e.key === "End") {
      updateValue(max);
    } else if (e.key === "PageDown") {
      decrement(true);
    } else if (e.key === "PageUp") {
      increment(true);
    }

    readRangeData();
  }), _ref3), !props.disabled && _polytheneCore.pointerStartDownEvent.reduce(function (acc, evt) {
    return acc[a["on".concat(evt)]] = onInitDrag, acc;
  }, {}), props.events ? props.events : null, hasTicks ? {
    step: stepCount
  } : null), props.icon ? h("div", {
    className: classes.thumb
  }, props.icon) : null), h("div", {
    className: classes.trackPart + " " + classes.trackPartRest,
    style: {
      flex: flexRestCss,
      msFlex: flexRestCss,
      WebkitFlex: flexRestCss,
      maxWidth: flexRestValue * 100 + "%" // for IE Edge

    }
  }, h("div", {
    className: classes.trackBar
  }, h("div", {
    className: classes.trackBarValue
  }))), hasTicks && !props.disabled ? h("div", {
    className: classes.ticks
  }, generateTickMarks(h, stepCount, stepSize, value)) : null, hasTicks && props.pin && !props.disabled ? h("div", {
    className: classes.pin,
    value: value
  }) : null]), props.after];
  return h(props.element || "div", componentProps, content);
};

exports._Slider = _Slider;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-mithril-slider/dist/polythene-mithril-slider.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Slider = void 0;

var _polytheneCoreSlider = require("polythene-core-slider");

var _cyanoMithril = require("cyano-mithril");

var Slider = (0, _cyanoMithril.cast)(_polytheneCoreSlider._Slider, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect,
  useRef: _cyanoMithril.useRef,
  getRef: _cyanoMithril.getRef
});
exports.Slider = Slider;
Slider["displayName"] = "Slider";
},{"polythene-core-slider":"../node_modules/polythene-core-slider/dist/polythene-core-slider.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-core-snackbar/dist/polythene-core-snackbar.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "_Snackbar", {
  enumerable: true,
  get: function () {
    return _polytheneCoreNotification._Notification;
  }
});
exports.transitions = void 0;

var _polytheneCoreNotification = require("polythene-core-notification");

var DEFAULT_DURATION = 0.4;

var show = function show(_ref) {
  var containerEl = _ref.containerEl,
      el = _ref.el,
      duration = _ref.duration,
      delay = _ref.delay;
  return {
    el: containerEl,
    duration: duration || DEFAULT_DURATION,
    delay: delay || 0,
    before: function before() {
      el.style.display = "block";
      var height = el.getBoundingClientRect().height;
      containerEl.style.transform = "translate3d(0, ".concat(height, "px, 0)");
    },
    transition: function transition() {
      return containerEl.style.transform = "translate3d(0, 0px, 0)";
    }
  };
};

var hide = function hide(_ref2) {
  var containerEl = _ref2.containerEl,
      el = _ref2.el,
      duration = _ref2.duration,
      delay = _ref2.delay;
  return {
    el: containerEl,
    duration: duration || DEFAULT_DURATION,
    delay: delay || 0,
    transition: function transition() {
      var height = el.getBoundingClientRect().height;
      containerEl.style.transform = "translate3d(0, ".concat(height, "px, 0)");
    },
    // reset to original position to counter the removal of the snackbar instance
    after: function after() {
      // prevent a "bounce back"
      el.style.display = "none";
      containerEl.style.transitionDuration = "0ms";
      containerEl.style.transform = "translate3d(0, 0px, 0)";
    }
  };
};

var transitions = {
  show: show,
  hide: hide
};
exports.transitions = transitions;
},{"polythene-core-notification":"../node_modules/polythene-core-notification/dist/polythene-core-notification.mjs"}],"../node_modules/polythene-mithril-snackbar/dist/polythene-mithril-snackbar.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SnackbarInstance = exports.Snackbar = void 0;

var _cyanoMithril = require("cyano-mithril");

var _polytheneCore = require("polythene-core");

var _polytheneCoreSnackbar = require("polythene-core-snackbar");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var notificationClasses = {
  component: "pe-notification",
  // elements
  action: "pe-notification__action",
  content: "pe-notification__content",
  holder: "pe-notification__holder",
  placeholder: "pe-notification__placeholder",
  title: "pe-notification__title",
  // states
  hasContainer: "pe-notification--container",
  horizontal: "pe-notification--horizontal",
  multilineTitle: "pe-notification__title--multi-line",
  vertical: "pe-notification--vertical",
  visible: "pe-notification--visible"
};

var classes = _objectSpread2({}, notificationClasses, {
  component: "pe-notification pe-snackbar",
  // elements
  holder: "pe-snackbar__holder",
  placeholder: "pe-snackbar__placeholder",
  // states
  open: "pe-snackbar--open"
});

var SnackbarInstance = (0, _cyanoMithril.cast)(_polytheneCoreSnackbar._Snackbar, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect,
  useRef: _cyanoMithril.useRef,
  getRef: _cyanoMithril.getRef,
  useReducer: _cyanoMithril.useReducer
});
exports.SnackbarInstance = SnackbarInstance;
SnackbarInstance["displayName"] = "SnackbarInstance";
var options = {
  name: "snackbar",
  className: classes.component,
  htmlShowClass: classes.open,
  defaultId: "default_snackbar",
  holderSelector: ".".concat(classes.holder),
  instance: SnackbarInstance,
  placeholder: "span.".concat(classes.placeholder),
  queue: true,
  transitions: _polytheneCoreSnackbar.transitions
};
var MultipleInstance = (0, _polytheneCore.Multi)({
  options: options
});
var Snackbar = (0, _cyanoMithril.cast)(MultipleInstance.render, {
  h: _cyanoMithril.h,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect
});
exports.Snackbar = Snackbar;
Object.getOwnPropertyNames(MultipleInstance).filter(function (p) {
  return p !== "render";
}).forEach(function (p) {
  return Snackbar[p] = MultipleInstance[p];
});
Snackbar["displayName"] = "Snackbar";
},{"cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs","polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs","polythene-core-snackbar":"../node_modules/polythene-core-snackbar/dist/polythene-core-snackbar.mjs"}],"../node_modules/polythene-core-switch/dist/polythene-core-switch.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._ViewControl = exports._Switch = void 0;

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

var classes = {
  component: "pe-switch-control",
  // elements
  knob: "pe-switch-control__knob",
  thumb: "pe-switch-control__thumb",
  track: "pe-switch-control__track"
};

var _Switch = function _Switch(_ref) {
  var h = _ref.h,
      SelectionControl = _ref.SelectionControl,
      props = _objectWithoutProperties(_ref, ["h", "SelectionControl"]);

  var componentProps = _extends({}, props, {
    selectable: props.selectable || function () {
      return true;
    },
    // default: always selectable, regardless of the checked state
    instanceClass: classes.component,
    type: "checkbox"
  });

  return h(SelectionControl, componentProps);
};

exports._Switch = _Switch;

var _ViewControl = function _ViewControl(_ref) {
  var h = _ref.h,
      a = _ref.a,
      IconButton = _ref.IconButton,
      Shadow = _ref.Shadow,
      props = _objectWithoutProperties(_ref, ["h", "a", "IconButton", "Shadow"]);

  var element = props.element || "div";
  var shadowDepthOff = props.shadowDepthOff !== undefined ? props.shadowDepthOff : props.zOff !== undefined ? props.zOff // deprecated
  : 1;
  var shadowDepthOn = props.shadowDepthOn !== undefined ? props.shadowDepthOn : props.zOn !== undefined ? props.zOn // deprecated
  : 2;
  var shadowDepth = props.checked ? shadowDepthOn : shadowDepthOff;
  var raised = props.raised !== undefined ? props.raised : true;
  return h(element, null, [h("div", {
    className: classes.track,
    key: "track"
  }), h(IconButton, _extends({}, {
    className: classes.thumb,
    key: "button",
    content: h("div", {
      className: classes.knob,
      style: props.style
    }, [props.icon ? props.icon : null, raised ? h(Shadow, {
      shadowDepth: shadowDepth,
      animated: true
    }) : null]),
    disabled: props.disabled,
    events: props.events,
    ink: props.ink || false,
    inactive: props.inactive
  }, props.iconButton))]);
};

exports._ViewControl = _ViewControl;
},{}],"../node_modules/polythene-mithril-switch/dist/polythene-mithril-switch.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Switch = void 0;

var _polytheneCoreSwitch = require("polythene-core-switch");

var _cyanoMithril = require("cyano-mithril");

var _polytheneMithrilShadow = require("polythene-mithril-shadow");

var _polytheneMithrilIconButton = require("polythene-mithril-icon-button");

var _polytheneCoreSelectionControl = require("polythene-core-selection-control");

var ViewControl = (0, _cyanoMithril.cast)(_polytheneCoreSwitch._ViewControl, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  Shadow: _polytheneMithrilShadow.Shadow,
  IconButton: _polytheneMithrilIconButton.IconButton
});
ViewControl["displayName"] = "ViewControl";
var SelectionControl = (0, _cyanoMithril.cast)(_polytheneCoreSelectionControl._SelectionControl, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect,
  ViewControl: ViewControl
});
SelectionControl["displayName"] = "SelectionControl";
var Switch = (0, _cyanoMithril.cast)(_polytheneCoreSwitch._Switch, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  SelectionControl: SelectionControl
});
exports.Switch = Switch;
Switch["displayName"] = "Switch";
},{"polythene-core-switch":"../node_modules/polythene-core-switch/dist/polythene-core-switch.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs","polythene-mithril-shadow":"../node_modules/polythene-mithril-shadow/dist/polythene-mithril-shadow.mjs","polythene-mithril-icon-button":"../node_modules/polythene-mithril-icon-button/dist/polythene-mithril-icon-button.mjs","polythene-core-selection-control":"../node_modules/polythene-core-selection-control/dist/polythene-core-selection-control.mjs"}],"../node_modules/polythene-core-tabs/dist/polythene-core-tabs.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._Tabs = exports._Tab = exports._ScrollButton = void 0;

var _polytheneCore = require("polythene-core");

var _polytheneUtilities = require("polythene-utilities");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var buttonClasses = {
  component: "pe-text-button",
  "super": "pe-button",
  row: "pe-button-row",
  // elements      
  content: "pe-button__content",
  label: "pe-button__label",
  textLabel: "pe-button__text-label",
  wash: "pe-button__wash",
  washColor: "pe-button__wash-color",
  dropdown: "pe-button__dropdown",
  // states      
  border: "pe-button--border",
  contained: "pe-button--contained",
  disabled: "pe-button--disabled",
  dropdownClosed: "pe-button--dropdown-closed",
  dropdownOpen: "pe-button--dropdown-open",
  extraWide: "pe-button--extra-wide",
  hasDropdown: "pe-button--dropdown",
  highLabel: "pe-button--high-label",
  inactive: "pe-button--inactive",
  raised: "pe-button--raised",
  selected: "pe-button--selected",
  separatorAtStart: "pe-button--separator-start",
  hasHover: "pe-button--has-hover"
};
var classes = {
  component: "pe-tabs",
  // elements
  indicator: "pe-tabs__indicator",
  scrollButton: "pe-tabs__scroll-button",
  scrollButtonAtEnd: "pe-tabs__scroll-button-end",
  scrollButtonAtStart: "pe-tabs__scroll-button-start",
  tab: "pe-tab",
  tabContent: "pe-tabs__tab-content",
  tabRow: "pe-tabs__row",
  // states
  activeSelectable: "pe-tabs__active--selectable",
  isAtEnd: "pe-tabs--end",
  isAtStart: "pe-tabs--start",
  isAutofit: "pe-tabs--autofit",
  isMenu: "pe-tabs--menu",
  scrollable: "pe-tabs--scrollable",
  compactTabs: "pe-tabs--compact",
  tabHasIcon: "pe-tabs__tab--icon",
  tabRowCentered: "pe-tabs__row--centered",
  tabRowIndent: "pe-tabs__row--indent",
  // lookup
  label: buttonClasses.label
};
var SCROLL_SPEED = 600; // px per second

var SCROLL_DELAY = .15; // seconds

var SCROLL_MIN_DURATION = .5; // seconds

var INDICATOR_SLIDE_MIN_DURATION = .25; // seconds

var getButtons = function getButtons(props) {
  return props.content ? props.content : props.tabs ? props.tabs : props.children || [];
};

var getIndex = function getIndex(props) {
  var buttons = getButtons(props);
  var selectedIndex = Array.isArray(buttons) ? buttons.reduce(function (acc, tab, index) {
    return acc === undefined && !tab.disabled && tab.selected ? index : acc;
  }, undefined) : undefined;

  if (selectedIndex !== undefined) {
    return selectedIndex;
  }

  var attrsSelectedTabIndex = props.selectedTabIndex !== undefined ? props.selectedTabIndex : props.selectedTab !== undefined // deprecated
  ? props.selectedTab : undefined;
  return attrsSelectedTabIndex !== undefined ? attrsSelectedTabIndex : 0;
};

var scrollButtonGetNewIndex = function scrollButtonGetNewIndex(index, tabs) {
  var minTabIndex = 0;
  var maxTabIndex = tabs.length - 1;
  return {
    backward: Math.max(index - 1, minTabIndex),
    forward: Math.min(index + 1, maxTabIndex)
  };
};

var sortByLargestWidth = function sortByLargestWidth(a, b) {
  return a < b ? 1 : a > b ? -1 : 0;
};

var _Tabs = function _Tabs(_ref) {
  var h = _ref.h,
      a = _ref.a,
      getRef = _ref.getRef,
      useState = _ref.useState,
      useEffect = _ref.useEffect,
      ScrollButton = _ref.ScrollButton,
      Tab = _ref.Tab,
      props = _objectWithoutProperties(_ref, ["h", "a", "getRef", "useState", "useEffect", "ScrollButton", "Tab"]);

  var buttons = getButtons(props);

  if (buttons.length === 0) {
    throw new Error("No tabs specified");
  }

  var _useState = useState(),
      _useState2 = _slicedToArray(_useState, 2),
      domElement = _useState2[0],
      setDomElement = _useState2[1];

  var _useState3 = useState(false),
      _useState4 = _slicedToArray(_useState3, 2),
      RTL = _useState4[0],
      setRTL = _useState4[1];

  var tabIndex = getIndex(props) || 0;

  var _useState5 = useState(tabIndex),
      _useState6 = _slicedToArray(_useState5, 2),
      selectedTabIndex = _useState6[0],
      setSelectedTabIndex = _useState6[1];

  var _useState7 = useState(false),
      _useState8 = _slicedToArray(_useState7, 2),
      isScrollButtonAtStart = _useState8[0],
      setIsScrollButtonAtStart = _useState8[1];

  var _useState9 = useState(false),
      _useState10 = _slicedToArray(_useState9, 2),
      isScrollButtonAtEnd = _useState10[0],
      setIsScrollButtonAtEnd = _useState10[1];

  var _useState11 = useState([]),
      _useState12 = _slicedToArray(_useState11, 2),
      tabs = _useState12[0],
      setTabs = _useState12[1];

  var _useState13 = useState(),
      _useState14 = _slicedToArray(_useState13, 2),
      previousSelectedTabIndex = _useState14[0],
      setPreviousSelectedTabIndex = _useState14[1];

  var managesScroll = props.scrollable && !_polytheneCore.isTouch;
  var tabRowElement = domElement && domElement.querySelector(".".concat(classes.tabRow));
  var tabIndicatorElement = domElement && domElement.querySelector(".".concat(classes.indicator));
  var isTabsInited = !!domElement && tabs.length === buttons.length;
  useEffect(function () {
    if (!tabRowElement) return;

    var tabRowTabs = _toConsumableArray(tabRowElement.querySelectorAll("[data-index]")).map(function (dom) {
      var index = parseInt(dom.getAttribute("data-index"), 10);
      return {
        dom: dom,
        options: buttons[index]
      };
    });

    if (tabRowTabs) {
      setTabs(tabRowTabs);
    }
  }, [tabRowElement]);

  var handleScrollButtonClick = function handleScrollButtonClick(e, direction) {
    e.stopPropagation();
    e.preventDefault();
    var newIndex = scrollButtonGetNewIndex(selectedTabIndex, tabs)[direction];

    if (newIndex !== selectedTabIndex) {
      updateWithTabIndex({
        index: newIndex,
        animate: true
      });
    } else {
      scrollToTab(newIndex);
    }
  };

  var updateScrollButtons = function updateScrollButtons() {
    var scrollLeft = tabRowElement.scrollLeft;
    var minTabIndex = 0;
    var maxTabIndex = tabs.length - 1;
    var isAtStart = tabRowElement.scrollLeft === 0 && selectedTabIndex === minTabIndex;
    var isAtEnd = scrollLeft >= tabRowElement.scrollWidth - domElement.getBoundingClientRect().width - 1 && selectedTabIndex === maxTabIndex;
    setIsScrollButtonAtStart(isAtStart);
    setIsScrollButtonAtEnd(isAtEnd);
  };

  var updateIndicator = function updateIndicator(_ref2) {
    var selectedTabElement = _ref2.selectedTabElement,
        animate = _ref2.animate;

    if (!tabIndicatorElement) {
      return;
    }

    var parentRect = domElement.getBoundingClientRect();
    var rect = selectedTabElement.getBoundingClientRect();
    var buttonSize = managesScroll ? rect.height : 0;
    var translateX = RTL ? rect.right - parentRect.right + tabRowElement.scrollLeft + buttonSize : rect.left - parentRect.left + tabRowElement.scrollLeft - buttonSize;
    var scaleX = 1 / (parentRect.width - 2 * buttonSize) * rect.width;
    var transformCmd = "translate(".concat(translateX, "px, 0) scaleX(").concat(scaleX, ")");
    var duration = animate ? INDICATOR_SLIDE_MIN_DURATION : 0;
    var style = tabIndicatorElement.style;
    style["transition-duration"] = duration + "s";
    style.opacity = 1;
    style.transform = transformCmd;
  };

  var scrollToTab = function scrollToTab(tabIndex) {
    var scroller = tabRowElement; // Scroll to position of selected tab

    var tabLeft = tabs.slice(0, tabIndex).reduce(function (totalWidth, tabData) {
      return totalWidth + tabData.dom.getBoundingClientRect().width;
    }, 0); // Tabs at the far right will not fully move to the left
    // because the scrollable row will stick to the right 
    // to get the max scroll left, we subtract the visible viewport from the scroll width

    var scrollerWidth = scroller.getBoundingClientRect().width; // frame width

    var scrollingWidth = scroller.scrollWidth;
    var maxScroll = scrollingWidth - scrollerWidth;
    var left = RTL ? -1 * Math.min(tabLeft, maxScroll) : Math.min(tabLeft, maxScroll);
    var currentLeft = scroller.scrollLeft;

    if (currentLeft !== left) {
      var duration = Math.abs(currentLeft - left) / SCROLL_SPEED;
      var delaySeconds = SCROLL_DELAY;
      setTimeout(function () {
        (0, _polytheneUtilities.scrollTo)({
          element: scroller,
          to: left,
          duration: Math.max(SCROLL_MIN_DURATION, duration),
          direction: "horizontal"
        }).then(updateScrollButtons);
      }, delaySeconds * 1000);
    }
  };

  var updateWithTabIndex = function updateWithTabIndex(_ref3) {
    var index = _ref3.index,
        animate = _ref3.animate;

    if (!tabs || !tabs.length) {
      return;
    }

    setSelectedTabIndex(index);
    var selectedTabElement = tabs[index].dom;

    if (selectedTabElement) {
      updateIndicator({
        selectedTabElement: selectedTabElement,
        animate: animate
      });
    }

    if (managesScroll) {
      updateScrollButtons();
    }

    scrollToTab(index);

    if (props.onChange) {
      props.onChange({
        index: index,
        options: tabs[index].options,
        el: selectedTabElement
      });
    }
  };

  useEffect(function () {
    if (!isTabsInited) {
      return;
    }

    setRTL((0, _polytheneCore.isRTL)({
      element: domElement
    }));

    var redrawLargestWidth = function redrawLargestWidth() {
      if (props.largestWidth) {
        var widths = tabs.map(function (_ref4) {
          var dom = _ref4.dom;
          return dom.getBoundingClientRect().width;
        });
        var largest = widths.sort(sortByLargestWidth)[0];
        tabs.forEach(function (_ref5) {
          var dom = _ref5.dom;
          return dom.style.width = largest + "px";
        });
      }
    };

    var redraw = function redraw() {
      return redrawLargestWidth(), updateWithTabIndex({
        index: selectedTabIndex,
        animate: false
      });
    };

    var handleFontEvent = function handleFontEvent(_ref6) {
      var name = _ref6.name;
      return name === "active" || name === "inactive" ? redraw() : null;
    };

    (0, _polytheneCore.subscribe)("resize", redraw);
    (0, _polytheneCore.subscribe)("webfontloader", handleFontEvent);
    redraw();
    return function () {
      (0, _polytheneCore.unsubscribe)("resize", redraw);
      (0, _polytheneCore.unsubscribe)("webfontloader", handleFontEvent);
    };
  }, [isTabsInited]);
  var autofit = props.scrollable || props.centered ? false : props.autofit ? true : false; // Keep selected tab up to date

  if (tabIndex !== undefined && previousSelectedTabIndex !== tabIndex) {
    updateWithTabIndex({
      index: tabIndex,
      animate: true
    });
  }

  if (previousSelectedTabIndex !== tabIndex) {
    setPreviousSelectedTabIndex(tabIndex);
  }

  var componentProps = _extends({}, getRef(function (dom) {
    return dom && !domElement && setTimeout(function () {
      return setDomElement(dom);
    }, 0) // delay for Mithril 1.x
    ;
  }), (0, _polytheneCore.filterSupportedAttributes)(props), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.component, props.scrollable ? classes.scrollable : null, isScrollButtonAtStart ? classes.isAtStart : null, isScrollButtonAtEnd ? classes.isAtEnd : null, props.activeSelected ? classes.activeSelectable : null, autofit ? classes.isAutofit : null, props.compact ? classes.compactTabs : null, props.menu ? classes.isMenu : null, props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  });

  var tabRow = buttons.map(function () {
    var buttonOpts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var index = arguments.length > 1 ? arguments[1] : undefined;

    var buttonOptsCombined = _extends({}, buttonOpts, {
      // These options can be overridden by `all`
      selected: index === selectedTabIndex,
      animateOnTap: props.animateOnTap !== false ? true : false
    }, props.all, {
      // Internal options, should not get overridden
      index: index,
      onSelect: function onSelect() {
        return updateWithTabIndex({
          index: index,
          animate: props.noIndicatorSlide ? false : true
        });
      }
    });

    return h(Tab, buttonOptsCombined);
  });
  var scrollButtonAtStart = null,
      scrollButtonAtEnd = null;

  if (props.scrollable) {
    scrollButtonAtStart = h(ScrollButton, _extends({}, {
      icon: props.scrollIconBackward,
      className: classes.scrollButtonAtStart,
      position: "start",
      events: _defineProperty({}, a.onclick, function (e) {
        return handleScrollButtonClick(e, "backward");
      }),
      isRTL: RTL
    }));
    scrollButtonAtEnd = h(ScrollButton, _extends({}, {
      icon: props.scrollIconForward,
      className: classes.scrollButtonAtEnd,
      position: "end",
      events: _defineProperty({}, a.onclick, function (e) {
        return handleScrollButtonClick(e, "forward");
      }),
      isRTL: RTL
    }));
  }

  var tabIndicator = props.hideIndicator ? null : h("div", {
    className: classes.indicator
  });
  var componentContent = [scrollButtonAtStart, h("div", {
    className: [classes.tabRow, props.centered ? classes.tabRowCentered : null, props.scrollable ? classes.tabRowIndent : null].join(" ")
  }, [].concat(_toConsumableArray(tabRow), [tabIndicator])), scrollButtonAtEnd];
  return h("div", componentProps, [props.before].concat(componentContent, [props.after]));
};

exports._Tabs = _Tabs;

var _Tab = function _Tab(_ref) {
  var h = _ref.h,
      a = _ref.a,
      Button = _ref.Button,
      Icon = _ref.Icon,
      props = _objectWithoutProperties(_ref, ["h", "a", "Button", "Icon"]); // Let internal onclick function co-exist with passed button option


  var events = props.events || {};

  events[a.onclick] = events[a.onclick] || function () {};

  var componentProps = _extends({}, props, props.testId && {
    "data-test-id": props.testId
  }, {
    "data-index": props.index,
    content: h("div", {
      className: classes.tabContent
    }, [props.icon ? h(Icon, props.icon) : null, props.label ? h("div", {
      className: classes.label
    }, h("span", props.label)) : null]),
    className: [classes.tab, props.icon && props.label ? classes.tabHasIcon : null, props.className || props[a["class"]]].join(" "),
    selected: props.selected,
    wash: false,
    ripple: true,
    events: _extends({}, events, _defineProperty({}, a.onclick, function (e) {
      props.onSelect();
      events[a.onclick](e);
    }))
  });

  var content = props.children;
  return h(Button, componentProps, content);
};

exports._Tab = _Tab;
var arrowBackward = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z\"/></svg>";
var arrowForward = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path d=\"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z\"/></svg>";

var _ScrollButton = function _ScrollButton(_ref) {
  var h = _ref.h,
      a = _ref.a,
      IconButton = _ref.IconButton,
      props = _objectWithoutProperties(_ref, ["h", "a", "IconButton"]);

  var icon = props.position === "start" ? props.icon || {
    svg: {
      content: h.trust(props.isRTL ? arrowForward : arrowBackward)
    }
  } : props.icon || {
    svg: {
      content: h.trust(props.isRTL ? arrowBackward : arrowForward)
    }
  };

  var componentProps = _extends({}, {
    className: [classes.scrollButton, props.className || props[a["class"]]].join(" "),
    icon: icon,
    ripple: {
      center: true
    },
    events: props.events
  });

  return h(IconButton, componentProps);
};

exports._ScrollButton = _ScrollButton;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs","polythene-utilities":"../node_modules/polythene-utilities/dist/polythene-utilities.mjs"}],"../node_modules/polythene-mithril-tabs/dist/polythene-mithril-tabs.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tabs = void 0;

var _polytheneCoreTabs = require("polythene-core-tabs");

var _polytheneMithrilButton = require("polythene-mithril-button");

var _polytheneMithrilIcon = require("polythene-mithril-icon");

var _polytheneMithrilIconButton = require("polythene-mithril-icon-button");

var _cyanoMithril = require("cyano-mithril");

var ScrollButton = (0, _cyanoMithril.cast)(_polytheneCoreTabs._ScrollButton, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  IconButton: _polytheneMithrilIconButton.IconButton
});
var Tab = (0, _cyanoMithril.cast)(_polytheneCoreTabs._Tab, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  Button: _polytheneMithrilButton.Button,
  Icon: _polytheneMithrilIcon.Icon
});
var Tabs = (0, _cyanoMithril.cast)(_polytheneCoreTabs._Tabs, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  getRef: _cyanoMithril.getRef,
  useState: _cyanoMithril.useState,
  useEffect: _cyanoMithril.useEffect,
  ScrollButton: ScrollButton,
  Tab: Tab
});
exports.Tabs = Tabs;
Tabs["displayName"] = "Tabs";
},{"polythene-core-tabs":"../node_modules/polythene-core-tabs/dist/polythene-core-tabs.mjs","polythene-mithril-button":"../node_modules/polythene-mithril-button/dist/polythene-mithril-button.mjs","polythene-mithril-icon":"../node_modules/polythene-mithril-icon/dist/polythene-mithril-icon.mjs","polythene-mithril-icon-button":"../node_modules/polythene-mithril-icon-button/dist/polythene-mithril-icon-button.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-core-toolbar/dist/polythene-core-toolbar.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._ToolbarTitle = exports._Toolbar = void 0;

var _polytheneCore = require("polythene-core");

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

var classes = {
  // Toolbar
  component: "pe-toolbar",
  // states
  compact: "pe-toolbar--compact",
  appBar: "pe-toolbar--app-bar",
  // Toolbar title
  // elements
  title: "pe-toolbar__title",
  // states
  centeredTitle: "pe-toolbar__title--center",
  indentedTitle: "pe-toolbar__title--indent",
  fullbleed: "pe-toolbar--fullbleed",
  border: "pe-toolbar--border"
};

var _Toolbar = function _Toolbar(_ref) {
  var h = _ref.h,
      a = _ref.a,
      Shadow = _ref.Shadow,
      props = _objectWithoutProperties(_ref, ["h", "a", "Shadow"]);

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.component, props.compact ? classes.compact : null, props.fullbleed ? classes.fullbleed : null, props.border ? classes.border : null, props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  }, props.events);

  var componentContent = props.content || props.children;
  var shadow = props.shadowDepth !== undefined ? h(Shadow, {
    shadowDepth: props.shadowDepth,
    animated: true
  }) : null;
  var content = [props.before, componentContent, props.after, shadow];
  return h(props.element || "div", componentProps, content);
};

exports._Toolbar = _Toolbar;

var _ToolbarTitle = function _ToolbarTitle(_ref) {
  var h = _ref.h,
      a = _ref.a,
      props = _objectWithoutProperties(_ref, ["h", "a"]);

  var element = props.element ? props.element : props.url ? "a" : "div";

  var componentProps = _extends({}, (0, _polytheneCore.filterSupportedAttributes)(props), props.testId && {
    "data-test-id": props.testId
  }, {
    className: [classes.title, props.indent ? classes.indentedTitle : null, props.center ? classes.centeredTitle : null, props.tone === "dark" ? "pe-dark-tone" : null, props.tone === "light" ? "pe-light-tone" : null, props.className || props[a["class"]]].join(" ")
  }, props.events, props.url);

  var content = props.text ? props.text : props.content ? props.content : props.children;
  return h(element, componentProps, content);
};

exports._ToolbarTitle = _ToolbarTitle;
},{"polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-mithril-toolbar/dist/polythene-mithril-toolbar.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToolbarTitle = exports.Toolbar = void 0;

var _polytheneCoreToolbar = require("polythene-core-toolbar");

var _polytheneMithrilShadow = require("polythene-mithril-shadow");

var _cyanoMithril = require("cyano-mithril");

var Toolbar = (0, _cyanoMithril.cast)(_polytheneCoreToolbar._Toolbar, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a,
  Shadow: _polytheneMithrilShadow.Shadow
});
exports.Toolbar = Toolbar;
var ToolbarTitle = (0, _cyanoMithril.cast)(_polytheneCoreToolbar._ToolbarTitle, {
  h: _cyanoMithril.h,
  a: _cyanoMithril.a
});
exports.ToolbarTitle = ToolbarTitle;
},{"polythene-core-toolbar":"../node_modules/polythene-core-toolbar/dist/polythene-core-toolbar.mjs","polythene-mithril-shadow":"../node_modules/polythene-mithril-shadow/dist/polythene-mithril-shadow.mjs","cyano-mithril":"../node_modules/cyano-mithril/dist/cyano-mithril.mjs"}],"../node_modules/polythene-mithril/dist/polythene-mithril.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _polytheneMithrilButton = require("polythene-mithril-button");

Object.keys(_polytheneMithrilButton).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilButton[key];
    }
  });
});

var _polytheneMithrilButtonGroup = require("polythene-mithril-button-group");

Object.keys(_polytheneMithrilButtonGroup).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilButtonGroup[key];
    }
  });
});

var _polytheneMithrilCard = require("polythene-mithril-card");

Object.keys(_polytheneMithrilCard).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilCard[key];
    }
  });
});

var _polytheneMithrilCheckbox = require("polythene-mithril-checkbox");

Object.keys(_polytheneMithrilCheckbox).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilCheckbox[key];
    }
  });
});

var _polytheneMithrilDialog = require("polythene-mithril-dialog");

Object.keys(_polytheneMithrilDialog).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilDialog[key];
    }
  });
});

var _polytheneMithrilDialogPane = require("polythene-mithril-dialog-pane");

Object.keys(_polytheneMithrilDialogPane).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilDialogPane[key];
    }
  });
});

var _polytheneMithrilDrawer = require("polythene-mithril-drawer");

Object.keys(_polytheneMithrilDrawer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilDrawer[key];
    }
  });
});

var _polytheneMithrilFab = require("polythene-mithril-fab");

Object.keys(_polytheneMithrilFab).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilFab[key];
    }
  });
});

var _polytheneMithrilIcon = require("polythene-mithril-icon");

Object.keys(_polytheneMithrilIcon).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilIcon[key];
    }
  });
});

var _polytheneMithrilIconButton = require("polythene-mithril-icon-button");

Object.keys(_polytheneMithrilIconButton).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilIconButton[key];
    }
  });
});

var _polytheneMithrilIosSpinner = require("polythene-mithril-ios-spinner");

Object.keys(_polytheneMithrilIosSpinner).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilIosSpinner[key];
    }
  });
});

var _polytheneMithrilList = require("polythene-mithril-list");

Object.keys(_polytheneMithrilList).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilList[key];
    }
  });
});

var _polytheneMithrilListTile = require("polythene-mithril-list-tile");

Object.keys(_polytheneMithrilListTile).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilListTile[key];
    }
  });
});

var _polytheneMithrilMaterialDesignProgressSpinner = require("polythene-mithril-material-design-progress-spinner");

Object.keys(_polytheneMithrilMaterialDesignProgressSpinner).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilMaterialDesignProgressSpinner[key];
    }
  });
});

var _polytheneMithrilMaterialDesignSpinner = require("polythene-mithril-material-design-spinner");

Object.keys(_polytheneMithrilMaterialDesignSpinner).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilMaterialDesignSpinner[key];
    }
  });
});

var _polytheneMithrilMenu = require("polythene-mithril-menu");

Object.keys(_polytheneMithrilMenu).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilMenu[key];
    }
  });
});

var _polytheneMithrilNotification = require("polythene-mithril-notification");

Object.keys(_polytheneMithrilNotification).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilNotification[key];
    }
  });
});

var _polytheneMithrilRadioButton = require("polythene-mithril-radio-button");

Object.keys(_polytheneMithrilRadioButton).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilRadioButton[key];
    }
  });
});

var _polytheneMithrilRadioGroup = require("polythene-mithril-radio-group");

Object.keys(_polytheneMithrilRadioGroup).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilRadioGroup[key];
    }
  });
});

var _polytheneMithrilRaisedButton = require("polythene-mithril-raised-button");

Object.keys(_polytheneMithrilRaisedButton).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilRaisedButton[key];
    }
  });
});

var _polytheneMithrilRipple = require("polythene-mithril-ripple");

Object.keys(_polytheneMithrilRipple).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilRipple[key];
    }
  });
});

var _polytheneMithrilSearch = require("polythene-mithril-search");

Object.keys(_polytheneMithrilSearch).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilSearch[key];
    }
  });
});

var _polytheneMithrilShadow = require("polythene-mithril-shadow");

Object.keys(_polytheneMithrilShadow).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilShadow[key];
    }
  });
});

var _polytheneMithrilSlider = require("polythene-mithril-slider");

Object.keys(_polytheneMithrilSlider).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilSlider[key];
    }
  });
});

var _polytheneMithrilSnackbar = require("polythene-mithril-snackbar");

Object.keys(_polytheneMithrilSnackbar).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilSnackbar[key];
    }
  });
});

var _polytheneMithrilSvg = require("polythene-mithril-svg");

Object.keys(_polytheneMithrilSvg).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilSvg[key];
    }
  });
});

var _polytheneMithrilSwitch = require("polythene-mithril-switch");

Object.keys(_polytheneMithrilSwitch).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilSwitch[key];
    }
  });
});

var _polytheneMithrilTabs = require("polythene-mithril-tabs");

Object.keys(_polytheneMithrilTabs).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilTabs[key];
    }
  });
});

var _polytheneMithrilTextfield = require("polythene-mithril-textfield");

Object.keys(_polytheneMithrilTextfield).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilTextfield[key];
    }
  });
});

var _polytheneMithrilToolbar = require("polythene-mithril-toolbar");

Object.keys(_polytheneMithrilToolbar).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _polytheneMithrilToolbar[key];
    }
  });
});
},{"polythene-mithril-button":"../node_modules/polythene-mithril-button/dist/polythene-mithril-button.mjs","polythene-mithril-button-group":"../node_modules/polythene-mithril-button-group/dist/polythene-mithril-button-group.mjs","polythene-mithril-card":"../node_modules/polythene-mithril-card/dist/polythene-mithril-card.mjs","polythene-mithril-checkbox":"../node_modules/polythene-mithril-checkbox/dist/polythene-mithril-checkbox.mjs","polythene-mithril-dialog":"../node_modules/polythene-mithril-dialog/dist/polythene-mithril-dialog.mjs","polythene-mithril-dialog-pane":"../node_modules/polythene-mithril-dialog-pane/dist/polythene-mithril-dialog-pane.mjs","polythene-mithril-drawer":"../node_modules/polythene-mithril-drawer/dist/polythene-mithril-drawer.mjs","polythene-mithril-fab":"../node_modules/polythene-mithril-fab/dist/polythene-mithril-fab.mjs","polythene-mithril-icon":"../node_modules/polythene-mithril-icon/dist/polythene-mithril-icon.mjs","polythene-mithril-icon-button":"../node_modules/polythene-mithril-icon-button/dist/polythene-mithril-icon-button.mjs","polythene-mithril-ios-spinner":"../node_modules/polythene-mithril-ios-spinner/dist/polythene-mithril-ios-spinner.mjs","polythene-mithril-list":"../node_modules/polythene-mithril-list/dist/polythene-mithril-list.mjs","polythene-mithril-list-tile":"../node_modules/polythene-mithril-list-tile/dist/polythene-mithril-list-tile.mjs","polythene-mithril-material-design-progress-spinner":"../node_modules/polythene-mithril-material-design-progress-spinner/dist/polythene-mithril-material-design-progress-spinner.mjs","polythene-mithril-material-design-spinner":"../node_modules/polythene-mithril-material-design-spinner/dist/polythene-mithril-material-design-spinner.mjs","polythene-mithril-menu":"../node_modules/polythene-mithril-menu/dist/polythene-mithril-menu.mjs","polythene-mithril-notification":"../node_modules/polythene-mithril-notification/dist/polythene-mithril-notification.mjs","polythene-mithril-radio-button":"../node_modules/polythene-mithril-radio-button/dist/polythene-mithril-radio-button.mjs","polythene-mithril-radio-group":"../node_modules/polythene-mithril-radio-group/dist/polythene-mithril-radio-group.mjs","polythene-mithril-raised-button":"../node_modules/polythene-mithril-raised-button/dist/polythene-mithril-raised-button.mjs","polythene-mithril-ripple":"../node_modules/polythene-mithril-ripple/dist/polythene-mithril-ripple.mjs","polythene-mithril-search":"../node_modules/polythene-mithril-search/dist/polythene-mithril-search.mjs","polythene-mithril-shadow":"../node_modules/polythene-mithril-shadow/dist/polythene-mithril-shadow.mjs","polythene-mithril-slider":"../node_modules/polythene-mithril-slider/dist/polythene-mithril-slider.mjs","polythene-mithril-snackbar":"../node_modules/polythene-mithril-snackbar/dist/polythene-mithril-snackbar.mjs","polythene-mithril-svg":"../node_modules/polythene-mithril-svg/dist/polythene-mithril-svg.mjs","polythene-mithril-switch":"../node_modules/polythene-mithril-switch/dist/polythene-mithril-switch.mjs","polythene-mithril-tabs":"../node_modules/polythene-mithril-tabs/dist/polythene-mithril-tabs.mjs","polythene-mithril-textfield":"../node_modules/polythene-mithril-textfield/dist/polythene-mithril-textfield.mjs","polythene-mithril-toolbar":"../node_modules/polythene-mithril-toolbar/dist/polythene-mithril-toolbar.mjs"}],"../node_modules/j2c/dist/j2c.commonjs.js":[function(require,module,exports) {

'use strict';

var emptyArray = [];
var emptyObject = {};
var type = emptyObject.toString;
var ARRAY =  type.call(emptyArray);
var OBJECT = type.call(emptyObject);
var STRING = type.call('');
var FUNCTION = type.call(type);
var own =  emptyObject.hasOwnProperty;
var freeze = Object.freeze || function(o) {return o};


function defaults(target, source) {
  for (var k in source) if (own.call(source, k)) {
    if (k.indexOf('$') && !(k in target)) target[k] = source[k];
  }
  return target
}

function cartesian(a,b) {
  var res = [], i, j;
  for (j in b) if(own.call(b, j))
    for (i in a) if(own.call(a, i))
      res.push(a[i] + b[j]);
  return res
}

// "Tokenizes" the selectors into parts relevant for the next function.
// Strings and comments are matched, but ignored afterwards.
// This is not a full tokenizers. It only recognizes comas, parentheses,
// strings and comments.
// regexp generated by scripts/regexps.js then trimmed by hand
var selectorTokenizer = /[(),]|"(?:\\.|[^"\n])*"|'(?:\\.|[^'\n])*'|\/\*[\s\S]*?\*\//g;


/**
 * This will split a coma-separated selector list into individual selectors,
 * ignoring comas in strings, comments and in :pseudo-selectors(parameter, lists).
 *
 * @param {string} selector
 * @return {string[]}
 */

function splitSelector(selector) {
  var indices = [], res = [], inParen = 0, o;
  /*eslint-disable no-cond-assign*/
  while (o = selectorTokenizer.exec(selector)) {
  /*eslint-enable no-cond-assign*/
    switch (o[0]) {
    case '(': inParen++; break
    case ')': inParen--; break
    case ',': if (inParen) break; indices.push(o.index);
    }
  }
  for (o = indices.length; o--;){
    res.unshift(selector.slice(indices[o] + 1));
    selector = selector.slice(0, indices[o]);
  }
  res.unshift(selector);
  return res
}

// Like the `selectorTokenizer`, but for the `&` operator
var ampersandTokenizer = /&|"(?:\\.|[^"\n])*"|'(?:\\.|[^'\n])*'|\/\*[\s\S]*?\*\//g;

function ampersand (selector, parents) {
  var indices = [], split = [], res, o;
  /*eslint-disable no-cond-assign*/
  while (o = ampersandTokenizer.exec(selector)) {
  /*eslint-enable no-cond-assign*/
    if (o[0] == '&') indices.push(o.index);
  }
  for (o = indices.length; o--;){
    split.unshift(selector.slice(indices[o] + 1));
    selector = selector.slice(0, indices[o]);
  }
  split.unshift(selector);
  if (split.length === 1) split.unshift('');
  res = [split[0]];
  for (o = 1; o < split.length; o++) {
    res = cartesian(res, cartesian(parents, [split[o]]));
  }
  return res.join(',')
}

function flatIter (f) {
  return function iter(arg) {
    if (type.call(arg) === ARRAY) for (var i= 0 ; i < arg.length; i ++) iter(arg[i]);
    else f(arg);
  }
}

function decamelize(match) {
  return '-' + match.toLowerCase()
}

/**
 * Handles the property:value; pairs.
 *
 * @param {object} state - holds the localizer- and walker-related methods
 *                         and state
 * @param {object} emit - the contextual emitters to the final buffer
 * @param {string} prefix - the current property or a prefix in case of nested
 *                          sub-properties.
 * @param {array|object|string} o - the declarations.
 * @param {boolean} local - are we in @local or in @global scope.
 */

function declarations(state, emit, prefix, o, local) {
  var k, v, kk;
  if (o==null) return

  switch ( type.call(o = o.valueOf()) ) {
  case ARRAY:
    for (k = 0; k < o.length; k++)

      declarations(state, emit, prefix, o[k], local);

    break
  case OBJECT:
    // prefix is falsy iif it is the empty string, which means we're at the root
    // of the declarations list.
    prefix = (prefix && prefix + '-');
    for (k in o) if (own.call(o, k)){
      v = o[k];
      if (/\$/.test(k)) {
        for (kk in (k = k.split('$'))) if (own.call(k, kk)) {

          declarations(state, emit, prefix + k[kk], v, local);

        }
      } else {

        declarations(state, emit, prefix + k, v, local);

      }
    }
    break
  default:
    // prefix is falsy when it is "", which means that we're
    // at the top level.
    // `o` is then treated as a `property:value` pair, or a
    // semi-colon-separated list thereof.
    // Otherwise, `prefix` is the property name, and
    // `o` is the value.

    // restore the dashes
    k = prefix.replace(/_/g, '-').replace(/[A-Z]/g, decamelize);

    if (local && (k == 'animation-name' || k == 'animation' || k == 'list-style')) {
      // no need to tokenize here a plain `.split(',')` has all bases covered.
      // We may 'localize' a comment, but it's not a big deal.
      o = o.split(',').map(function (o) {

        return o.replace(/^\s*(?:(var\([^)]+\))|:?global\(\s*([_A-Za-z][-\w]*)\s*\)|()(-?[_A-Za-z][-\w]*))/, state.localizeReplacer)

      }).join(',');
    }

    emit.decl(k, o);

  }
}

/**
 * Handles a single at-rules
 *
 * @param {object} state - holds the localizer- and walker-related methods
 *                         and state
 * @param {object} emit - the contextual emitters to the final buffer
 * @param {array} k - The parsed at-rule, including the parameters,
 *                    if takes both parameters and a block.
 *                    k == [match, fullAtRule, atRuleType, params?]
 *                    So in `@-webkit-keyframes foo`, we have
 *                     - match = "@-webkit-keyframes foo"
 *                     - fullAtRule = "@-webkit-keyframes"
 *                     - atRuleType = "keyframes"
 *                     - params = "foo"
 * @param {string|string[]|object|object[]} v - Either parameters for
 *                                              block-less rules or
 *                                              their block
 *                                              for the others.
 * @param {string} prefix - the current selector or the selector prefix
 *                          in case of nested rules
 * @param {boolean} local - are we in @local or in @global scope?
 * @param {string} nestingDepth - are we nested in an at-rule or a selector?
 */

function atRules(state, emit, k, v, prefix, local, nestingDepth) {

  // First iterate over user-provided at-rules and return if one of them corresponds to the current one
  for (var i = 0; i < state.$atHandlers.length; i++) {

    if (state.$atHandlers[i](state, emit, k, v, prefix, local, nestingDepth)) return

  }

  // using `/^global$/.test(k[2])` rather that 'global' == k[2] gzips
  // slightly better thanks to the regexps tests further down.
  // It is slightly less efficient but this isn't a critical path.

  if (!k[3] && /^global$/.test(k[2])) {

    rules(state, emit, prefix, v, 0, nestingDepth);


  } else if (!k[3] && /^local$/.test(k[2])) {

    rules(state, emit, prefix, v, 1, nestingDepth);


  } else if (k[3] && /^adopt$/.test(k[2])) {

    if (!local || nestingDepth) return emit.err('@adopt global or nested: ' + k[0])

    if (!/^\.?[_A-Za-z][-\w]*$/.test(k[3])) return emit.err('bad adopter ' + JSON.stringify(k[3]) + ' in ' + k[0])

    i = [];
    flatIter(function(adoptee, asString) {

      if(adoptee == null || !/^\.?[_A-Za-z][-\w]*(?:\s+\.?[_A-Za-z][-\w]*)*$/.test(asString = adoptee + '')) emit.err('bad adoptee '+ JSON.stringify(adoptee) + ' in ' + k[0]);

      else i.push(asString.replace(/\./g, ''));

    })(v);

    // we may end up with duplicate classes but AFAIK it has no consequences on specificity.
    if (i.length) {
      state.localize(k[3] = k[3].replace(/\./g, ''));
      state.names[k[3]] += (' ' + i.join(' '));
    }


  } else if (!k[3] && /^(?:namespace|import|charset)$/.test(k[2])) {
    flatIter(function(v) {

      emit.atrule(k[1], k[2], v);

    })(v);


  } else if (!k[3] && /^(?:font-face|viewport)$/.test(k[2])) {
    flatIter(function(v) {

      emit.atrule(k[1], k[2], k[3], 1);

      declarations(state, emit, '', v, local);

      emit._atrule();

    })(v);

  } else if (k[3] && /^(?:media|supports|page|keyframes)$/.test(k[2])) {

    if (local && 'keyframes' == k[2]) {
      k[3] = k[3].replace(
        // generated by script/regexps.js
        /(var\([^)]+\))|:?global\(\s*([_A-Za-z][-\w]*)\s*\)|()(-?[_A-Za-z][-\w]*)/,
        state.localizeReplacer
      );
    }


    emit.atrule(k[1], k[2], k[3], 1);

    if ('page' == k[2]) {

      declarations(state, emit, '', v, local);

    } else {

      rules(
        state, emit,
        'keyframes' == k[2] ? '' : prefix,
        v, local, nestingDepth + 1
      );

    }

    emit._atrule();

  } else {

    emit.err('Unsupported at-rule: ' + k[0]);

  }
}

/**
 * Add rulesets and other CSS tree to the sheet.
 *
 * @param {object} state - holds the localizer- and walker-related methods
 *                         and state
 * @param {object} emit - the contextual emitters to the final buffer
 * @param {string} prefix - the current selector or a prefix in case of nested rules
 * @param {array|string|object} tree - a source object or sub-object.
 * @param {string} nestingDepth - are we nested in an at-rule?
 * @param {boolean} local - are we in @local or in @global scope?
 */
function rules(state, emit, prefix, tree, local, nestingDepth) {
  var k, v, inDeclaration, kk;

  switch (type.call(tree)) {

  case OBJECT:
    for (k in tree) if (own.call(tree, k)) {
      v = tree[k];

      if (prefix.length > 0 && /^[-\w$]+$/.test(k)) {
        if (!inDeclaration) {
          inDeclaration = 1;

          emit.rule(prefix);

        }
        if (/\$/.test(k)) {
          for (kk in (k = k.split('$'))) if (own.call(k, kk)) {

            declarations(state, emit, k[kk], v, local);

          }
        } else {

          declarations(state, emit, k, v, local);

        }

      } else if (/^@/.test(k)) {
        // Handle At-rules
        inDeclaration = 0;

        atRules(state, emit,
          /^(.(?:-[\w]+-)?([_A-Za-z][-\w]*))\b\s*(.*?)\s*$/.exec(k) || [k,'@','',''],
          v, prefix, local, nestingDepth
        );

      } else {
        // selector or nested sub-selectors
        inDeclaration = 0;

        rules(
          state, emit,
          // build the selector `prefix` for the next iteration.
          // ugly and full of redundant bits but so far the fastest/shortest.gz
          /*0 if*/(prefix.length > 0 && (/,/.test(prefix) || /,/.test(k))) ?

            /*0 then*/ (kk = splitSelector(prefix), splitSelector(
              local ?

                k.replace(
                  /("(?:\\.|[^"\n])*"|'(?:\\.|[^'\n])*'|\/\*[\s\S]*?\*\/)|:global\(\s*(\.-?[_A-Za-z][-\w]*)\s*\)|(\.)(-?[_A-Za-z][-\w]*)/g,
                  state.localizeReplacer
                ) :

                k
            ).map(function (k) {
              return /&/.test(k) ? ampersand(k, kk) : kk.map(function(kk) {
                return kk + k
              }).join(',')
            }).join(',')) :

            /*0 else*/ /*1 if*/ /&/.test(k) ?

              /*1 then*/ ampersand(
                local ?

                  k.replace(
                    /("(?:\\.|[^"\n])*"|'(?:\\.|[^'\n])*'|\/\*[\s\S]*?\*\/)|:global\(\s*(\.-?[_A-Za-z][-\w]*)\s*\)|(\.)(-?[_A-Za-z][-\w]*)/g,
                    state.localizeReplacer
                  ) :

                  k,
                [prefix]
              ) :

              /*1 else*/ prefix + (
                local ?

                  k.replace(
                    /("(?:\\.|[^"\n])*"|'(?:\\.|[^'\n])*'|\/\*[\s\S]*?\*\/)|:global\(\s*(\.-?[_A-Za-z][-\w]*)\s*\)|(\.)(-?[_A-Za-z][-\w]*)/g,
                    state.localizeReplacer
                  ) :

                  k
                ),
           v, local, nestingDepth + 1
        );

      }
    }

    break

  case ARRAY:
    for (k = 0; k < tree.length; k++){

      rules(state, emit, prefix, tree[k], local, nestingDepth);

    }
    break

  case STRING:
    // CSS hacks or ouptut of `j2c.inline`.
    if (!prefix.length) emit.err('No selector');
    emit.rule(prefix || ' ');

    declarations(state, emit, '', tree, local);

  }
}

// This is the first entry in the filters array, which is
// actually the last step of the compiler. It inserts
// closing braces to close normal (non at-) rules (those
// that start with a selector). Doing it earlier is
// impossible without passing state around in unrelated code
// or ending up with duplicated selectors when the source tree
// contains arrays.
// There's no `_rule` handler, because the core compiler never
// calls it.
function closeSelectors(next, inline) {
  var lastSelector;
  return inline ? next : {
    init: function(){lastSelector = 0; next.init();},
    done: function (raw) {
      if (lastSelector) {next._rule(); lastSelector = 0;}
      return next.done(raw)
    },
    atrule: function (rule, kind, param, takesBlock) {
      if (lastSelector) {next._rule(); lastSelector = 0;}
      next.atrule(rule, kind, param, takesBlock);
    },
    _atrule: function (rule) {
      if (lastSelector) {next._rule(); lastSelector = 0;}
      next._atrule(rule);
    },
    rule: function (selector) {
      if (selector !== lastSelector){
        if (lastSelector) next._rule();
        next.rule(selector);
        lastSelector = selector;
      }
    }
  }
}

function global(x) {
  return ':global(' + x + ')'
}

function kv (k, v, o) {
  o = {};
  o[k] = v;
  return o
}

function at (rule, params, block) {
  if (
    arguments.length < 3
  ) {
    // inner curry!
    var _at = at.bind.apply(at, [null].concat([].slice.call(arguments,0)));
    // So that it can be used as a key in an ES6 object literal.
    _at.toString = function(){return '@' + rule + ' ' + params};
    return _at
  }
  else return kv('@' + rule +' ' + params, block)
}

function j2c() {

  // the buffer that accumulates the output. Initialized in `$sink.i()`
  var buf, err;

  // the bottom of the 'codegen' stream. Mirrors the `$filter` plugin API.
  var $sink = {
    init: function(){buf=[], err=[];},
    done: function (raw) {
      if (err.length != 0) throw new Error('j2c error(s): ' + JSON.stringify(err,null,2) + 'in context:\n' + buf.join(''))
      return raw ? buf : buf.join('')
    },
    err: function(msg) {
      err.push(msg);
      buf.push('/* +++ ERROR +++ ' + msg + ' */\n');
    },
    atrule: function (rule, kind, param, takesBlock) {
      buf.push(rule, param && ' ', param, takesBlock ? ' {' : ';', _instance.endline);
    },
    // close atrule
    _atrule: function () {buf.push('}', _instance.endline);},
    rule: function (selector) {buf.push(selector, ' {', _instance.endline);},
    // close rule
    _rule: function () {buf.push('}', _instance.endline);},
    decl: function (prop, value) {buf.push(prop, prop && ':', value, ';', _instance.endline);}
  };

  // holds the `$filter` and `$at` handlers
  var $filters = [closeSelectors];
  var $atHandlers = [];

  // the public API (see the main docs)
  var _instance = {
    at: at,
    global: global,
    kv: kv,
    names: {},
    endline: '\n',
    suffix: '__j2c-' +
      // 128 bits of randomness
      Math.floor(Math.random() * 0x100000000).toString(36) + '-' +
      Math.floor(Math.random() * 0x100000000).toString(36) + '-' +
      Math.floor(Math.random() * 0x100000000).toString(36) + '-' +
      Math.floor(Math.random() * 0x100000000).toString(36),
    $plugins: [],
    sheet: function(tree) {
      var emit = _createOrRetrieveStream(0);
      emit.init();
      rules(
        _walkers[0],
        emit,
        '', // prefix
        tree,
        1,  // local, by default
        0   // nesting depth
      );

      return emit.done()
    },
    inline: function (tree, options) {
      var emit = _createOrRetrieveStream(1);
      emit.init();
      declarations(
        _walkers[1],
        emit,
        '', // prefix
        tree,
        !(options && options.global)   // local, by default
      );
      return emit.done()
    }
  };

  // The `state` (for the core functions) / `walker` (for the plugins) tables.
  var _walkers = [
    // for j2c.sheet
    {
      // helpers for locaizing class and animation names
      localizeReplacer: _localizeReplacer, // second argument to String.prototype.replace
      localize: _localize,                 // mangles local names
      names: _instance.names,              // local => mangled mapping
      $atHandlers: $atHandlers,            // extra at-rules
      // The core walker methods, to be provided to plugins
      atrule: atRules,
      decl: declarations,
      rule: rules
    },
    // likewise, for j2c.inline (idem with `$a`, `a` and `s` removed)
    {
      localizeReplacer: _localizeReplacer,
      localize: _localize,
      names: _instance.names,
      decl: declarations
    }
  ];


  // inner helpers

  var _use = flatIter(function(plugin) {
    // `~n` is falsy for `n === -1` and truthy otherwise.
    // Works well to turn the  result of `a.indexOf(x)`
    // into a value that reflects the presence of `x` in
    // `a`.
    if (~_instance.$plugins.indexOf(plugin)) return

    _instance.$plugins.push(plugin);

    if (type.call(plugin) === FUNCTION) plugin = plugin(_instance);

    if (!plugin) return

    flatIter(function(filter) {
      $filters.push(filter);
    })(plugin.$filter || emptyArray);

    flatIter(function(handler) {
      $atHandlers.push(handler);
    })(plugin.$at || emptyArray);

    defaults(_instance.names, plugin.$names || emptyObject);

    _use(plugin.$plugins || emptyArray);

    $sink = plugin.$sink || $sink;

    defaults(_instance, plugin);
  });


  var _streams = [];
  /**
   * returns the codegen streams, creating them if necessary
   * @param
   */
  function _createOrRetrieveStream(inline) {
    // build the stream processors if needed
    if (!_streams.length) {
      // append the $sink as the ultimate filter
      $filters.push(function(_, inline) {return inline ? {init:$sink.init, decl:$sink.decl, done:$sink.done, err: $sink.err} : $sink});
      for(var i = 0; i < 2; i++){ // 0 for j2c.sheet, 1 for j2c.inline
        for (var j = $filters.length; j--;) {
          _streams[i] = freeze(
            defaults(
              $filters[j](_streams[i], !!i),
              _streams[i]
            )
          );
        }
      }
    }
    return _streams[inline]
  }

  /**
   * Returns a localized version of a given name.
   * Registers the pair in `instnace.name` if needed.
   *
   * @param {string} name - the name to localize
   * @return {string} - the localized version
   */
  function _localize(name) {
    if (!_instance.names[name]) _instance.names[name] = name + _instance.suffix;
    return _instance.names[name].match(/^\S+/)
  }

  /**
   * Used as second argument for str.replace(localizeRegex, replacer)
   * `ignore`, `global` and `(dot, name)` are mutually exclusive
   *
   * @param {string} match - the whole match (ignored)
   * @param {string|null} ignore - a comment or a string literal
   * @param {string|null} global - a global name
   * @param {string|null} dot - either '.' for a local class name or the empty string otherwise
   * @param {string|null} name - the name to localize
   * @return {string}
   */
  function _localizeReplacer(match, ignore, global$$1, dot, name) {
    return ignore || global$$1 || dot + _localize(name)
  }

  _use(emptyArray.slice.call(arguments));
  return _instance
}

module.exports = j2c;

},{}],"../node_modules/polythene-core-css/dist/polythene-core-css.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.styler = exports.selectorRTL = exports.sel = exports.rgba = exports.mixin = exports.layoutStyles = exports.flex = exports.createMarker = exports.createLayout = exports.createColor = exports.addLayoutStyles = void 0;

var _j2c = _interopRequireDefault(require("j2c"));

var _polytheneCore = require("polythene-core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @ts-check

/**
 * @typedef {{[selector:string] : object}} Style
 * @typedef {Array<Style> | Style} Styles
 */

/**
 * @type {Styles} layout
 */
var layout = [{
  "display": "-webkit-box"
}, {
  "display": "-moz-box"
}, {
  "display": "-ms-flexbox"
}, {
  "display": "-webkit-flex"
}, {
  "display": "flex"
}];
/**
 * @type {Styles} layoutInline
 */

var layoutInline = [layout, {
  "display": "-ms-inline-flexbox"
}, {
  "display": "-webkit-inline-flex"
}, {
  "display": "inline-flex"
}];
/**
 * @type {Styles} layoutHorizontal
 */

var layoutHorizontal = [layout, {
  "-ms-flex-direction": "row",
  "-webkit-flex-direction": "row",
  "flex-direction": "row"
}];
/**
 * @type {Styles} layoutHorizontalReverse
 */

var layoutHorizontalReverse = [layout, {
  "-ms-flex-direction": "row-reverse",
  "-webkit-flex-direction": "row-reverse",
  "flex-direction": "row-reverse"
}];
/**
 * @type {Styles} layoutVertical
 */

var layoutVertical = [layout, {
  "-ms-flex-direction": "column",
  "-webkit-flex-direction": "column",
  "flex-direction": "column"
}];
/**
 * @type {Styles} layoutVerticalReverse
 */

var layoutVerticalReverse = [layout, {
  "-ms-flex-direction": "column-reverse",
  "-webkit-flex-direction": "column-reverse",
  "flex-direction": "column-reverse"
}];
/**
 * @type {Styles} layoutWrap
 */

var layoutWrap = [layout, {
  "-ms-flex-wrap": "wrap",
  "-webkit-flex-wrap": "wrap",
  "flex-wrap": "wrap"
}];
/**
 * @type {Styles} layoutWrapReverse
 */

var layoutWrapReverse = [layout, {
  "-ms-flex-wrap": "wrap-reverse",
  "-webkit-flex-wrap": "wrap-reverse",
  "flex-wrap": "wrap-reverse"
}];
/**
 * @type {Styles} layoutStart
 */

var layoutStart = [layout, {
  "-ms-flex-align": "start",
  "-webkit-align-items": "flex-start",
  "align-items": "flex-start"
}];
/**
 * @type {Styles} layoutCenter
 */

var layoutCenter = [layout, {
  "-ms-flex-align": "center",
  "-webkit-align-items": "center",
  "align-items": "center"
}];
/**
 * @type {Styles} layoutEnd
 */

var layoutEnd = [layout, {
  "-ms-flex-align": "end",
  "-webkit-align-items": "flex-end",
  "align-items": "flex-end"
}];
/**
 * @type {Styles} layoutJustified
 */

var layoutJustified = [layout, {
  "-ms-flex-pack": "justify",
  "-webkit-justify-content": "space-between",
  "justify-content": "space-between"
}];
/**
 * @type {Styles} layoutStartJustified
 */

var layoutStartJustified = [layout, {
  "-ms-flex-pack": "start",
  "-webkit-justify-content": "flex-start",
  "justify-content": "flex-start"
}];
/**
 * @type {Styles} layoutCenterJustified
 */

var layoutCenterJustified = [layout, {
  "-ms-flex-pack": "center",
  "-webkit-justify-content": "center",
  "justify-content": "center"
}];
/**
 * @type {Styles} layoutEndJustified
 */

var layoutEndJustified = [layout, {
  "-ms-flex-pack": "end",
  "-webkit-justify-content": "flex-end",
  "justify-content": "flex-end"
}];
/**
 * @type {Styles} layoutCenterCenter
 */

var layoutCenterCenter = [layoutCenterJustified, layoutCenter];
/**
 * @type {Styles} layoutAroundJustified
 */

var layoutAroundJustified = [layout, {
  "-ms-flex-pack": "distribute",
  "-webkit-justify-content": "space-around",
  "justify-content": "space-around"
}];
/**
 * @param {number} [num=1] 
 * @returns {Styles}
 */

var flex = function flex() {
  var num = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  return [{
    "-webkit-box-flex": num
  }, {
    "-moz-box-flex": num
  }, {
    "-webkit-flex": num
  }, {
    "-ms-flex": num
  }, {
    "flex": num
  }, num === 1 ? {
    "-webkit-flex-basis": "0.000000001px"
  } : {}, num === 1 ? {
    "flex-basis": "0.000000001px"
  } : {}];
};
/**
 * @type {Styles} flexAuto
 */


var flexAuto = {
  "-ms-flex": "1 1 auto",
  "-webkit-flex-basis": "auto",
  "flex-basis": "auto"
};
/**
 * @type {Styles} flexAutoVertical
 */

var flexAutoVertical = {
  "-ms-flex": "1 1 auto",
  "-webkit-flex-basis": "auto",
  "flex-basis": "auto"
};
/**
 * 
 * @param {number|"none"} index 
 * @returns {Styles}
 */

var flexIndex = function flexIndex(index) {
  return {
    "-ms-flex": index,
    "-webkit-flex": index,
    "flex": index
  };
};
/**
 * 
 * @param {number} value 
 * @returns {Styles}
 */


var flexGrow = function flexGrow(value) {
  return {
    "-webkit-flex-grow": value,
    "flex-grow": value
  };
};
/**
 * 
 * @param {number} value 
 * @returns {Styles}
 */


var flexShrink = function flexShrink(value) {
  return {
    "-webkit-flex-shrink": value,
    "flex-shrink": value
  };
};
/**
 * @type {Styles} selfStart
 */


var selfStart = {
  "-ms-align-self": "flex-start",
  "-webkit-align-self": "flex-start",
  "align-self": "flex-start"
};
/**
 * @type {Styles} selfCenter
 */

var selfCenter = {
  "-ms-align-self": "center",
  "-webkit-align-self": "center",
  "align-self": "center"
};
/**
 * @type {Styles} selfEnd
 */

var selfEnd = {
  "-ms-align-self": "flex-end",
  "-webkit-align-self": "flex-end",
  "align-self": "flex-end"
};
/**
 * @type {Styles} selfStretch
 */

var selfStretch = {
  "-ms-align-self": "stretch",
  "-webkit-align-self": "stretch",
  "align-self": "stretch"
};
var flex$1 = {
  flex: flex,
  flexAuto: flexAuto,
  flexAutoVertical: flexAutoVertical,
  flexIndex: flexIndex,
  flexGrow: flexGrow,
  flexShrink: flexShrink,
  layout: layout,
  layoutAroundJustified: layoutAroundJustified,
  layoutCenter: layoutCenter,
  layoutCenterCenter: layoutCenterCenter,
  layoutCenterJustified: layoutCenterJustified,
  layoutEnd: layoutEnd,
  layoutEndJustified: layoutEndJustified,
  layoutHorizontal: layoutHorizontal,
  layoutHorizontalReverse: layoutHorizontalReverse,
  layoutInline: layoutInline,
  layoutJustified: layoutJustified,
  layoutStart: layoutStart,
  layoutStartJustified: layoutStartJustified,
  layoutVertical: layoutVertical,
  layoutVerticalReverse: layoutVerticalReverse,
  layoutWrap: layoutWrap,
  layoutWrapReverse: layoutWrapReverse,
  selfCenter: selfCenter,
  selfEnd: selfEnd,
  selfStart: selfStart,
  selfStretch: selfStretch
};
exports.flex = flex$1;

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
} // @ts-check

/**
 * @typedef {object} StyleObject 
 */

/**
 * Centers an item absolutely within relative parent.
 * @param {number} [offset=0] 
 * @returns {StyleObject}
 */


var fit = function fit() {
  var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var offsetPx = offset + "px";
  return {
    position: "absolute",
    top: offsetPx,
    right: offsetPx,
    bottom: offsetPx,
    left: offsetPx
  };
};
/**
 * Breaks off a line with ... unless lines is "none"
 * @param {number|"none"} lines 
 * @param {number} lineHeight 
 * @param {string} [unit=px]
 * @example
 * // max 1 line, 16px high
 * mixin.ellipsis(1, 16)
 * @example 
 * // max 2 lines, 2.6em high
 * mixin.ellipsis(2, 1.3, "em")
 * @returns {StyleObject} 
 */


var ellipsis = function ellipsis(lines, lineHeight) {
  var unit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "px";

  if (lines === "none") {
    return {
      textOverflow: "initial",
      overflow: "initial",
      display: "block",
      height: "auto",
      maxHeight: "none",
      whiteSpace: "normal"
    };
  }

  return [{
    "@supports (-webkit-line-clamp: 2)": lines !== undefined ? {
      "-webkit-line-clamp": lines,
      "-webkit-box-orient": "vertical",
      display: "-webkit-box",
      wordBreak: "break-word"
    } : undefined
  }, _objectSpread2({
    overflow: "hidden",
    textOverflow: "ellipsis",
    textRendering: "auto"
  }, lineHeight !== undefined ? {
    maxHeight: lines * lineHeight + unit
  } : undefined, {}, lineHeight === 1 ? {
    wordWrap: "nowrap"
  } : undefined)];
};
/**
 * Clears float.
 * @returns {StyleObject} 
 */


var clearfix = function clearfix() {
  return {
    "&:after": {
      content: "\"\"",
      display: "table",
      clear: "both"
    }
  };
};
/**
 * Creates sticky headers in a scrollable list.
 * Does not work in IE 11, Edge < 16.
 * @param {number} [zIndex=1] 
 * @returns {StyleObject} 
 */


var sticky = function sticky() {
  var zIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  return {
    position: "sticky",
    top: 0,
    zIndex: zIndex
  };
};
/**
 * Creates a transition with presets
 * @param {string} [properties=all]
 * @param {string} [duration=".18s"] 
 * @param {string} [curve=ease-out] 
 * @example
 * mixin.defaultTransition("opacity", vars.animation_duration)
 * @returns {StyleObject} 
 */


var defaultTransition = function defaultTransition() {
  var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "all";
  var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ".18s";
  var curve = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "ease-out";
  return {
    transitionDelay: "0ms",
    transitionDuration: duration,
    transitionTimingFunction: curve,
    transitionProperty: properties
  };
};

var mixin = {
  clearfix: clearfix,
  defaultTransition: defaultTransition,
  ellipsis: ellipsis,
  fit: fit,
  sticky: sticky
};
exports.mixin = mixin;

function unwrapExports(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
  return module = {
    exports: {}
  }, fn(module, module.exports), module.exports;
}

var j2cPluginPrefixBrowser_commonjs = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, '__esModule', {
    value: true
  }); // Derived from Lea Verou's PrefixFree

  var allStyles;
  var styleAttr;
  var styleElement;
  var supportedProperty;
  var supportedDecl;

  function init() {
    allStyles = getComputedStyle(document.documentElement, null);
    styleAttr = document.createElement('div').style;
    styleElement = document.documentElement.appendChild(document.createElement('style'));
    supportedDecl = _supportedDecl;
    supportedProperty = _supportedProperty;

    if ('zIndex' in styleAttr && !('z-index' in styleAttr)) {
      // Some browsers like it dash-cased, some camelCased, most like both.
      supportedDecl = function (property, value) {
        return _supportedDecl(camelCase(property), value);
      };

      supportedProperty = function (property) {
        return _supportedProperty(camelCase(property));
      };
    }
  }

  function finalize() {
    if (typeof document !== 'undefined') document.documentElement.removeChild(styleElement); // `styleAttr` is used at run time via `supportedProperty()`
    // `allStyles` and `styleElement` can be displosed of after initialization.

    allStyles = styleElement = null;
  } // Helpers, in alphabetic order


  function camelCase(str) {
    return str.replace(/-([a-z])/g, function ($0, $1) {
      return $1.toUpperCase();
    }).replace('-', '');
  }

  function deCamelCase(str) {
    return str.replace(/[A-Z]/g, function ($0) {
      return '-' + $0.toLowerCase();
    });
  }

  function _supportedDecl(property, value) {
    styleAttr[property] = '';
    styleAttr[property] = value;
    return !!styleAttr[property];
  }

  function supportedMedia(property, value) {
    styleElement.textContent = '@media (' + property + ':' + value + '){}'; // The !!~indexOf trick. False for -1, true otherwise.

    return !!~styleElement.sheet.cssRules[0].cssText.indexOf(value);
  }

  function _supportedProperty(property) {
    return property in styleAttr;
  }

  function supportedRule(selector) {
    styleElement.textContent = selector + '{}';
    return !!styleElement.sheet.cssRules.length;
  } // Derived from Lea Verou's PrefixFree
  // TODO: http://caniuse.com/#feat=css-media-resolution


  function detectAtrules(fixers) {
    if (fixers.prefix === '') return;
    var atrules = {
      'keyframes': 'name',
      'viewport': null,
      'document': 'regexp(".")'
    }; // build a map of {'@ruleX': '@-prefix-ruleX'}

    for (var atrule in atrules) {
      var test = atrule + ' ' + (atrules[atrule] || '');

      for (var i = fixers.prefixes.length; i--;) {
        if (!supportedRule('@' + test) && supportedRule('@' + fixers.prefixes[i] + test)) {
          fixers.hasAtrules = true;
          fixers.atrules['@' + atrule] = '@' + fixers.prefixes[i] + atrule;
        }
      }
    } // Standard


    fixers.hasDppx = supportedMedia('resolution', '1dppx'); // Webkit

    fixers.hasPixelRatio = supportedMedia(fixers.prefix + 'device-pixel-ratio', '1'); // Opera

    fixers.hasPixelRatioFraction = supportedMedia(fixers.prefix + 'device-pixel-ratio', '1/1');

    if (fixers.hasPixelRatio || fixers.hasPixelRatioFraction) {
      fixers.properties['resolution'] = fixers.prefix + 'device-pixel-ratio';
      fixers.properties['min-resolution'] = fixers.prefix + 'min-device-pixel-ratio';
      fixers.properties['max-resolution'] = fixers.prefix + 'max-device-pixel-ratio';

      if (supportedMedia('min-' + fixers.prefix + 'device-pixel-ratio', '1')) {
        // Mozilla/Firefox tunred a vendor prefix into a vendor infix
        fixers.properties['min-resolution'] = 'min-' + fixers.prefix + 'device-pixel-ratio';
        fixers.properties['max-resolution'] = 'max-' + fixers.prefix + 'device-pixel-ratio';
      }
    }
  } // Derived from Lea Verou's PrefixFree


  function detectFunctions(fixers) {
    // Values that might need prefixing
    if (fixers.prefix === '') return;
    var functions = {
      'linear-gradient': {
        property: 'background-image',
        params: 'red, teal'
      },
      'calc': {
        property: 'width',
        params: '1px + 5%'
      },
      'element': {
        property: 'background-image',
        params: '#foo'
      },
      'cross-fade': {
        property: 'backgroundImage',
        params: 'url(a.png), url(b.png), 50%'
      }
    };
    functions['repeating-linear-gradient'] = functions['repeating-radial-gradient'] = functions['radial-gradient'] = functions['linear-gradient']; // build an array of prefixable functions

    for (var func in functions) {
      var test = functions[func],
          property = test.property,
          value = func + '(' + test.params + ')';

      if (!supportedDecl(property, value) && supportedDecl(property, fixers.prefix + value)) {
        // It's only supported with a prefix
        fixers.functions.push(func);
      }
    }
  } // Derived from Lea Verou's PrefixFree and Robin Frischmann's Inline Style Prefixer
  // TODO: http://caniuse.com/#feat=css-writing-mode
  // db of prop/value pairs whose values may need treatment.


  var keywords = [// `initial` applies to all properties and is thus handled separately.
  {
    props: ['cursor'],
    values: ['grab', 'grabbing', 'zoom-in', 'zoom-out']
  }, {
    props: ['display'],
    values: ['box', 'inline-box', 'flexbox', 'inline-flexbox', 'flex', 'inline-flex', 'grid', 'inline-grid']
  }, {
    props: ['position'],
    values: ['sticky']
  }, {
    props: ['width', 'column-width', 'height', 'max-height', 'max-width', 'min-height', 'min-width'],
    values: ['contain-floats', 'fill-available', 'fit-content', 'max-content', 'min-content']
  }]; // The flexbox zoo
  //
  // ## Specs:
  // - box     (2009/old):  https://www.w3.org/TR/2009/WD-css3-flexbox-20090723/
  // - flexbox (2012/ie10): https://www.w3.org/TR/2012/WD-css3-flexbox-20120322/
  // - flex    (final):     https://www.w3.org/TR/css-flexbox-1/

  var flex2009Props = {
    // ?align-content =>
    // ?align-self =>
    'align-items': 'box-align',
    'flex': 'box-flex',
    // https://css-tricks.com/snippets/css/a-guide-to-flexbox/#comment-371025,
    // ?flex-basis =>
    // !!flex-direction => box-direction + box-orient, covered in `plugin.js`
    'box-direction': 'box-direction',
    // we prepopulate the cache for the above case.
    'box-orient': 'box-orient',
    // !!flex-flow => flex-direction and/or flex-wrap, covered in `plugin.js`
    'flex-grow': 'box-flex',
    // https://compat.spec.whatwg.org/#propdef--webkit-box-flex
    // ?flex-shrink =>
    'flex-wrap': 'box-lines',
    'justify-content': 'box-pack',
    'order': 'box-ordinal-group' // https://css-tricks.com/snippets/css/a-guide-to-flexbox/#comment-371025

  };
  var flex2009Values = {
    // flex => box || only for display? handled in the code
    'flex-end': 'end',
    'flex-start': 'start',
    // inline-flex => inline-box || see flex
    'nowrap': 'single',
    'space-around': 'justify',
    'space-between': 'justify',
    'wrap': 'multiple',
    'wrap-reverse': 'multiple'
  };
  var flex2012Props = {
    'align-content': '-ms-flex-line-pack',
    'align-items': '-ms-flex-align',
    'align-self': '-ms-flex-item-align',
    // flex => -ms-flex
    'flex-basis': '-ms-preferred-size',
    // flex-direction => -ms-flex-direction
    // flex-flow => -ms-flex-flow
    'flex-grow': '-ms-flex-positive',
    'flex-shrink': '-ms-flex-negative',
    // flex-wrap => -ms-flex-wrap
    'justify-content': '-ms-flex-pack',
    'order': '-ms-flex-order'
  };
  var flex2012Values = {
    // flex => flexbox || only for display? handled in the code
    'flex-end': 'end',
    'flex-start': 'start',
    // inline-flex => inline-flexbox || see 'flex'
    // nowrap => nowrap
    'space-around': 'distribute',
    'space-between': 'justify' // wrap => wrap
    // wrap-reverse => wrap-reverse

  };

  function detectKeywords(fixers) {
    if (fixers.prefixes.length === 0) return; // build a map of {propertyI: {keywordJ: previxedKeywordJ, ...}, ...}

    for (var i = 0; i < keywords.length; i++) {
      var map = {},
          property = keywords[i].props[0]; // eslint-disable-next-line

      for (var j = 0, keyword; keyword = keywords[i].values[j]; j++) {
        for (var k = fixers.prefixes.length; k--;) {
          if (!supportedDecl(property, keyword) && supportedDecl(property, fixers.prefixes[k] + keyword)) {
            fixers.hasKeywords = true;
            map[keyword] = fixers.prefixes[k] + keyword;
          }
        }
      } // eslint-disable-next-line


      for (j = 0; property = keywords[i].props[j]; j++) {
        fixers.keywords[property] = map;
      }
    }

    if (fixers.keywords.display && fixers.keywords.display.flexbox && !supportedDecl('display', 'flex')) {
      // IE 10, Flexbox 2012
      fixers.keywords.display.flex = fixers.keywords.display.flexbox;
      fixers.keywords.display['inline-flex'] = fixers.keywords.display['inline-flexbox'];
      fixers.flexbox2012 = true;

      for (k in flex2012Props) {
        fixers.properties[k] = flex2012Props[k];
        fixers.keywords[k] = flex2012Values;
      }
    } else if (fixers.keywords.display && fixers.keywords.display.box && !supportedDecl('display', 'flex') && !supportedDecl('display', fixers.prefix + 'flex')) {
      // old flexbox spec
      fixers.keywords.display.flex = fixers.keywords.display.box;
      fixers.keywords.display['inline-flex'] = fixers.keywords.display['inline-box'];
      fixers.flexbox2009 = true;

      for (k in flex2009Props) {
        fixers.properties[k] = fixers.prefix + flex2009Props[k];
        fixers.keywords[k] = flex2009Values;
      }
    } else if (fixers.keywords.display && !fixers.keywords.display.box && !fixers.keywords.display.flex && !fixers.keywords.display.flexbox && !supportedDecl('display', 'flex')) {
      fixers.jsFlex = true;
    }

    if (!supportedDecl('color', 'initial') && supportedDecl('color', fixers.prefix + 'initial')) {
      // `initial` does not use the `hasKeywords` branch, no need to set it to true.
      fixers.initial = fixers.prefix + 'initial';
    }
  } // Derived from Lea Verou's PrefixFree


  function detectPrefix(fixers) {
    var prefixCounters = {}; // Why are we doing this instead of iterating over properties in a .style object? Because Webkit.
    // 1. Older Webkit won't iterate over those.
    // 2. Recent Webkit will, but the 'Webkit'-prefixed properties are not enumerable. The 'webkit'
    //    (lower case 'w') ones are, but they don't `deCamelCase()` into a prefix that we can detect.

    function iteration(property) {
      if (property.charAt(0) === '-') {
        var prefix = property.split('-')[1]; // Count prefix uses

        prefixCounters[prefix] = ++prefixCounters[prefix] || 1;
      }
    } // Some browsers have numerical indices for the properties, some don't


    if (allStyles && allStyles.length > 0) {
      for (var i = 0; i < allStyles.length; i++) {
        iteration(allStyles[i]);
      }
    } else {
      for (var property in allStyles) {
        iteration(deCamelCase(property));
      }
    }

    var prefixes = [];

    for (var p in prefixCounters) prefixes.push(p);

    prefixes.sort(function (a, b) {
      return prefixCounters[b] - prefixCounters[a];
    });
    fixers.prefixes = prefixes.map(function (p) {
      return '-' + p + '-';
    });
    fixers.prefix = fixers.prefixes[0] || ''; // Edge supports both `webkit` and `ms` prefixes, but `ms` isn't detected with the method above.
    // the selector comes from http://browserstrangeness.com/css_hacks.html

    if (supportedRule('_:-ms-lang(x), _:-webkit-full-screen')) fixers.prefixes.push('-ms-');
    fixers.Prefix = camelCase(fixers.prefix);
  } // Derived from Lea Verou's PrefixFree


  function detectSelectors(fixers) {
    var selector, prefixed;

    function prefixSelector(selector) {
      return selector.replace(/^::?/, function ($0) {
        return $0 + fixers.prefix;
      });
    }

    if (fixers.prefix === '') return;
    var selectors = {
      ':any-link': null,
      '::backdrop': null,
      ':fullscreen': null,
      //TODO sort out what changed between specs
      ':full-screen': ':fullscreen',
      //sigh
      '::placeholder': null,
      ':placeholder': '::placeholder',
      '::input-placeholder': '::placeholder',
      ':input-placeholder': '::placeholder',
      ':read-only': null,
      ':read-write': null,
      '::selection': null
    }; // builds an array of selectors that need a prefix.

    for (selector in selectors) {
      prefixed = prefixSelector(selector);

      if (!supportedRule(selectors[selector] || selector) && supportedRule(prefixed)) {
        fixers.hasSelectors = true;
        fixers.selectorList.push(selectors[selector] || selector);
        fixers.selectorMap[selectors[selector] || selector] = prefixed;
      }
    }
  }

  function detectWebkitCompat(fixers) {
    if (!supportedDecl('background-clip', 'text') && supportedDecl('-webkit-background-clip', 'text')) fixers.WkBCTxt = true;
    ['background-clip', 'text-fill-color', 'text-stroke-color', 'text-stroke-width', 'text-stroke'].forEach(function (prop) {
      if (!supportedProperty(prop) && supportedProperty('-webkit-' + prop)) fixers.properties[prop] = '-webkit-' + prop;
    });
  }

  function blankFixers() {
    return {
      atrules: {},
      hasAtrules: false,
      hasDppx: null,
      hasKeywords: false,
      hasPixelRatio: false,
      hasPixelRatioFraction: false,
      hasSelectors: false,
      hasValues: false,
      fixAtMediaParams: null,
      fixAtSupportsParams: null,
      fixProperty: null,
      fixSelector: null,
      fixValue: null,
      flexbox2009: false,
      flexbox2012: false,
      functions: [],
      initial: null,
      jsFlex: false,
      keywords: {},
      placeholder: null,
      prefix: '',
      prefixes: [],
      Prefix: '',
      properties: {},
      selectorList: [],
      selectorMap: {},
      valueProperties: {
        'transition': 1,
        'transition-property': 1,
        'will-change': 1
      },
      WkBCTxt: false // -webkit-background-clip: text

    };
  }

  function browserDetector(fixers) {
    // add the required data to the fixers object.
    init();
    detectPrefix(fixers);
    detectSelectors(fixers);
    detectAtrules(fixers);
    detectKeywords(fixers);
    detectFunctions(fixers);
    detectWebkitCompat(fixers);
    finalize();
  }

  var emptySet = {};
  var valueTokenizer = /[(),]|\/\*[\s\S]*?\*\//g;
  /**
   * For properties whose values are also properties, this will split a coma-separated
   * value list into individual values, ignoring comas in comments and in
   * functions(parameter, lists).
   *
   * @param {string} selector
   * @return {string[]}
   */

  function splitValue(value) {
    var indices = [],
        res = [],
        inParen = 0,
        o;
    /*eslint-disable no-cond-assign*/

    while (o = valueTokenizer.exec(value)) {
      /*eslint-enable no-cond-assign*/
      switch (o[0]) {
        case '(':
          inParen++;
          break;

        case ')':
          inParen--;
          break;

        case ',':
          if (inParen) break;
          indices.push(o.index);
      }
    }

    for (o = indices.length; o--;) {
      res.unshift(value.slice(indices[o] + 1));
      value = value.slice(0, indices[o]);
    }

    res.unshift(value);
    return res;
  }

  function makeDetector(before, targets, after) {
    return new RegExp(before + '(?:' + targets.join('|') + ')' + after);
  }

  function makeLexer(before, targets, after) {
    return new RegExp("\"(?:\\\\[\\S\\s]|[^\"])*\"|'(?:\\\\[\\S\\s]|[^'])*'|\\/\\*[\\S\\s]*?\\*\\/|" + before + '((?:' + targets.join('|') + '))' + after, 'gi');
  } // declarations
  // ------------
  // function trim(s) {
  //   return s.replace(/^\s*(.*?)\s*$/, '$1')
  // }


  function fixDecl(fixers, emit, property, value) {
    if (typeof property !== 'string' || property.charAt(0) === '-') return emit(property, value);

    if (!(typeof value === 'string' || typeof value === 'number')) {
      return emit(fixers.properties[property] || fixers.fixProperty(property), value);
    }

    value = value + '';

    if (fixers.jsFlex) {
      if (property === 'display' && (value === 'flex' || value === 'inline-flex')) {
        emit('-js-display', value);
        return;
      }
    } else if (fixers.flexbox2009) {
      // TODO: flex only takes one value in the 2009 spec
      // if (property === 'flex') {
      //   value = trim(value)
      //   if (value === 'none' || value === 'initial') emit(property, '0')
      //   else if (value === 'auto') emit(property, '1')
      //   else emit(property, value.replace(/^(\d+)(?=\W|$).*/, '$1'))
      //   return
      // } else
      if (property === 'flex-flow') {
        value.split(/\s+/).forEach(function (v) {
          // recurse! The lack of `next.` is intentional.
          if (v.indexOf('wrap') > -1) fixDecl(fixers, emit, 'flex-wrap', v);else if (v !== '') fixDecl(fixers, emit, 'flex-direction', v);
        });
        return;
      } else if (property === 'flex-direction') {
        emit(fixers.properties['box-orient'], value.indexOf('column') > -1 ? 'block-axis' : 'inline-axis');
        emit(fixers.properties['box-direction'], value.indexOf('-reverse') > -1 ? 'reverse' : 'normal');
        return;
      }
    } // else if (fixers.flexbox2012) {
    //   // if (property === 'flex' && value.indexOf('calc(') !== -1) {
    //   //   var parsed =
    //   // }
    // }


    if (fixers.WkBCTxt && property === 'background-clip' && value === 'text') {
      emit('-webkit-background-clip', value);
    } else {
      emit(fixers.properties[property] || fixers.fixProperty(property), fixers.fixValue(value, property));
    }
  }

  function finalizeFixers(fixers) {
    var prefix = fixers.prefix; // properties
    // ----------

    fixers.fixProperty = fixers.fixProperty || function (prop) {
      var prefixed;
      return fixers.properties[prop] = supportedProperty(prop) || !supportedProperty(prefixed = prefix + prop) ? prop : prefixed;
    }; // selectors
    // ----------


    var selectorDetector = makeDetector('', fixers.selectorList, '(?:\\b|$|[^-])');
    var selectorMatcher = makeLexer('', fixers.selectorList, '(?:\\b|$|[^-])');

    var selectorReplacer = function (match, selector) {
      return selector != null ? fixers.selectorMap[selector] : match;
    };

    fixers.fixSelector = function (selector) {
      return selectorDetector.test(selector) ? selector.replace(selectorMatcher, selectorReplacer) : selector;
    }; // values
    // ------
    // When gradients are supported with a prefix, convert angles to legacy
    // (from clockwise to trigonometric)


    var hasGradients = fixers.functions.indexOf('linear-gradient') > -1;
    var gradientDetector = /\blinear-gradient\(/;
    var gradientMatcher = /(^|\s|,|\()((?:repeating-)?linear-gradient\()\s*(-?\d*\.?\d*)deg/ig;

    var gradientReplacer = function (match, delim, gradient, deg) {
      return delim + gradient + (90 - deg) + 'deg';
    }; // functions


    var hasFunctions = !!fixers.functions.length;
    var functionsDetector = makeDetector('(?:^|\\s|,|\\()', fixers.functions, '\\s*\\(');
    var functionsMatcher = makeLexer('(^|\\s|,|\\()', fixers.functions, '(?=\\s*\\()');

    function functionReplacer(match, $1, $2) {
      return $1 + prefix + $2;
    } // properties as values (for transition, ...)
    // No need to look for strings in these properties. We may insert prefixes in comments. Oh the humanity.


    var valuePropertiesMatcher = /^\s*([-\w]+)/gi;

    var valuePropertiesReplacer = function (match, prop) {
      return fixers.properties[prop] || fixers.fixProperty(prop);
    };

    fixers.fixValue = function (value, property) {
      var res;
      if (fixers.initial != null && value === 'initial') return fixers.initial;
      if (fixers.hasKeywords && (res = (fixers.keywords[property] || emptySet)[value])) return res;
      res = value;

      if (fixers.valueProperties.hasOwnProperty(property)) {
        res = value.indexOf(',') === -1 ? value.replace(valuePropertiesMatcher, valuePropertiesReplacer) : splitValue(value).map(function (v) {
          return v.replace(valuePropertiesMatcher, valuePropertiesReplacer);
        }).join(',');
      }

      if (hasFunctions && functionsDetector.test(value)) {
        if (hasGradients && gradientDetector.test(value)) {
          res = res.replace(gradientMatcher, gradientReplacer);
        }

        res = res.replace(functionsMatcher, functionReplacer);
      }

      return res;
    }; // @media (resolution:...) {
    // -------------------------


    var resolutionMatcher = /((?:min-|max-)?resolution)\s*:\s*((?:\d*\.)?\d+)dppx/g;
    var resolutionReplacer = fixers.hasPixelRatio ? function (_, prop, param) {
      return fixers.properties[prop] + ':' + param;
    } : fixers.hasPixelRatioFraction ? function (_, prop, param) {
      return fixers.properties[prop] + ':' + Math.round(param * 10) + '/10';
    } : function (_, prop, param) {
      return prop + ':' + Math.round(param * 96) + 'dpi';
    };
    fixers.fixAtMediaParams = fixers.hasDppx !== false
    /*it may be null*/
    ? function (p) {
      return p;
    } : function (params) {
      return params.indexOf('reso') !== -1 ? params.replace(resolutionMatcher, resolutionReplacer) : params;
    }; // @supports ... {
    // ---------------

    var supportsProp, supportsValue;

    var atSupportsParamsFixer = function (property, value) {
      supportsProp = property;
      supportsValue = value;
    }; // regexp built by scripts/regexps.js


    var atSupportsParamsMatcher = /\(\s*([-\w]+)\s*:\s*((?:'(?:\\[\S\s]|[^'])*'|"(?:\\[\S\s]|[^"])*"|\/\*[\S\s]*?\*\/|\((?:'(?:\\[\S\s]|[^'])*'|"(?:\\[\S\s]|[^"])*"|\/\*[\S\s]*?\*\/|\((?:'(?:\\[\S\s]|[^'])*'|"(?:\\[\S\s]|[^"])*"|\/\*[\S\s]*?\*\/|\((?:'(?:\\[\S\s]|[^'])*'|"(?:\\[\S\s]|[^"])*"|\/\*[\S\s]*?\*\/|\((?:'(?:\\[\S\s]|[^'])*'|"(?:\\[\S\s]|[^"])*"|\/\*[\S\s]*?\*\/|\((?:'(?:\\[\S\s]|[^'])*'|"(?:\\[\S\s]|[^"])*"|\/\*[\S\s]*?\*\/|\((?:'(?:\\[\S\s]|[^'])*'|"(?:\\[\S\s]|[^"])*"|\/\*[\S\s]*?\*\/|[^\)])*\)|[^\)])*\)|[^\)])*\)|[^\)])*\)|[^\)])*\)|[^\)])*\)|[^\)])*)/g;

    function atSupportsParamsReplacer(match, prop, value) {
      fixDecl(fixers, atSupportsParamsFixer, prop, value);
      return '(' + supportsProp + ':' + supportsValue;
    }

    fixers.fixAtSupportsParams = function (params) {
      return params.replace(atSupportsParamsMatcher, atSupportsParamsReplacer);
    };
  }

  var commonFixers;

  function initBrowser() {
    // exported for the test suite
    commonFixers = blankFixers();
    if (typeof getComputedStyle === 'function') browserDetector(commonFixers);
    finalizeFixers(commonFixers);
  }

  initBrowser();

  function prefixPlugin() {
    var fixers = commonFixers;
    var cache = [];
    return {
      set: {
        setPrefixDb: function (f) {
          if (cache.indexOf(f) === -1) {
            finalizeFixers(f);
            cache.push(f);
          }

          fixers = f;
          return prefixPlugin;
        }
      },
      filter: function (next) {
        return {
          atrule: function (rule, kind, params, hasBlock) {
            next.atrule(fixers.hasAtrules && fixers.atrules[rule] || rule, kind, rule === '@media' ? fixers.fixAtMediaParams(params) : rule === '@supports' ? fixers.fixAtSupportsParams(params) : params, hasBlock);
          },
          decl: function (property, value) {
            fixDecl(fixers, next.decl, property, value);
          },
          rule: function (selector) {
            next.rule(fixers.hasSelectors ? fixers.fixSelector(selector) : selector);
          }
        };
      }
    };
  }

  exports.prefixPlugin = prefixPlugin;
});
unwrapExports(j2cPluginPrefixBrowser_commonjs);
var j2cPluginPrefixBrowser_commonjs_1 = j2cPluginPrefixBrowser_commonjs.prefixPlugin; // @ts-ignore

var j2c = new _j2c.default(j2cPluginPrefixBrowser_commonjs_1);
var ID_REGEX = /[^a-z0-9\\-]/g;
/**
 * @typedef {object} StyleObject 
 * @typedef {(selector: string|Array<string>, vars: object, customVars?: object) => Array<object>} StyleFn
 */

/**
 * Adds styles to head.
 * @param {string} id - Identifier, used as HTMLElement id for the attached <style></style> element.
 * @param {...Array<StyleObject>} styles - List of style Objects
 * @returns {void}
 */

var add = function add(id) {
  for (var _len = arguments.length, styles = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    styles[_key - 1] = arguments[_key];
  }

  return addToDocument.apply(void 0, [{
    id: id
  }].concat(styles));
};
/**
 * Removes a style from head.
 * @param {string} id - Identifier, used as HTMLElement id for the attached <style></style> element.
 * @returns {void}
 */


var remove = function remove(id) {
  if (_polytheneCore.isServer) return;

  if (id) {
    var old = document.getElementById(id);

    if (old && old.parentNode) {
      old.parentNode.removeChild(old);
    }
  }
};
/**
 * Adds styles to the head.
 * @param {object} params
 * @param {string} params.id - Identifier, used as HTMLElement id for the attached <style></style> element.
 * @param {object} [params.document] - Document reference.
 * @param {...Array<StyleObject>} styles - List of style Objects.
 * @returns {void}
 */


var addToDocument = function addToDocument(_ref) {
  var id = _ref.id,
      document = _ref.document;
  if (_polytheneCore.isServer) return;
  var safeId = id.replace(ID_REGEX, "_");
  remove(safeId);
  var documentRef = document || window.document;
  var styleEl = documentRef.createElement("style");

  if (safeId) {
    styleEl.setAttribute("id", safeId);
  }

  for (var _len2 = arguments.length, styles = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    styles[_key2 - 1] = arguments[_key2];
  }

  styles.forEach(function (styles) {
    // each style returns a list
    if (Object.keys(styles).length) {
      styles.forEach(function (style) {
        var scoped = {
          "@global": style
        };
        var sheet = j2c.sheet(scoped);
        styleEl.appendChild(documentRef.createTextNode(sheet));
      });
    }
  });
  documentRef.head.appendChild(styleEl);
};
/**
 * 
 * @param {object} params
 * @param {StyleObject|Array<StyleObject>} params.styles
 * @param {string} [params.scope]
 * @returns {Array<StyleObject>}
 */


var wrapInScope = function wrapInScope(_ref2) {
  var styles = _ref2.styles,
      scope = _ref2.scope;
  return scope ? [_defineProperty({}, scope, styles)] : styles;
};
/**
 * Adds component styles to head.
 * @param {object} params
 * @param {Array<string>} params.selectors
 * @param {Array<StyleFn>} params.fns
 * @param {object} params.vars
 * @param {object} [params.customVars]
 * @param {string} [params.mediaQuery]
 * @param {string} [params.scope]
 * @param {string} [params.identifier]
 * @returns {void}
 */


var addStyle = function addStyle(_ref4) {
  var selectors = _ref4.selectors,
      styleFns = _ref4.fns,
      vars = _ref4.vars,
      customVars = _ref4.customVars,
      mediaQuery = _ref4.mediaQuery,
      scope = _ref4.scope,
      identifier = _ref4.identifier;
  var prefix = scope ? " " : "";
  var selector = prefix + selectors.join("");
  var styles = styleFns.map(function (fn) {
    return fn(selector, vars, customVars);
  }).filter(function (list) {
    return list.length > 0;
  });

  if (styles.length === 0) {
    return;
  }

  var id = identifier || selector.trim().replace(/^[^a-z]?(.*)/, "$1");
  add(id, wrapInScope({
    styles: wrapInScope({
      styles: styles,
      scope: scope
    }),
    scope: mediaQuery
  }));
};
/**
 * Returns a list of style objects for a component.
 * @param {object} params
 * @param {Array<string>} params.selectors
 * @param {Array<StyleFn>} params.fns
 * @param {object} params.vars - Style configuration variables
 * @param {object} [params.customVars] - Style configuration variables
 * @param {string} [params.mediaQuery] - Mediaquery string
 * @param {string} [params.scope] - Scope selector
 * @returns {Array<StyleObject>}
 */


var getStyle = function getStyle(_ref5) {
  var selectors = _ref5.selectors,
      styleFns = _ref5.fns,
      vars = _ref5.vars,
      customVars = _ref5.customVars,
      mediaQuery = _ref5.mediaQuery,
      scope = _ref5.scope;
  var prefix = scope ? " " : "";
  var selector = prefix + selectors.join("");
  var styles = styleFns.map(function (fn) {
    return fn(selector, vars, customVars);
  });
  return wrapInScope({
    styles: wrapInScope({
      styles: styles,
      scope: scope
    }),
    scope: mediaQuery
  });
};
/**
 * Adds component styles to head.
 * @param {string} selector 
 * @param {Array<StyleFn>} fns 
 * @param {object} vars - Style configuration variables
 */


var createAddStyle = function createAddStyle(selector, fns, vars) {
  return (
    /**
     * @param {string} [customSelector=""]
     * @param {object} customVars
     * @param {object} [scoping={}]
     * @param {string} [scoping.mediaQuery]
     * @param {string} [scoping.scope]
     * @returns {void}
     */
    function () {
      var customSelector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var customVars = arguments.length > 1 ? arguments[1] : undefined;

      var _ref6 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          mediaQuery = _ref6.mediaQuery,
          scope = _ref6.scope;

      return addStyle({
        selectors: [selector, customSelector],
        fns: fns,
        vars: vars,
        customVars: customVars,
        mediaQuery: mediaQuery,
        scope: scope
      });
    }
  );
};
/**
 * Returns styles for a component.
 * @param {string} selector 
 * @param {Array<StyleFn>} fns 
 * @param {object} vars - Style configuration variables
 */


var createGetStyle = function createGetStyle(selector, fns, vars) {
  return (
    /**
     * @param {string} [customSelector=""]
     * @param {object} customVars
     * @param {object} [scoping={}]
     * @param {string} [scoping.mediaQuery]
     * @param {string} [scoping.scope]
     * @returns {Array<StyleObject>}
     */
    function () {
      var customSelector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var customVars = arguments.length > 1 ? arguments[1] : undefined;

      var _ref7 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          mediaQuery = _ref7.mediaQuery,
          scope = _ref7.scope;

      return [getStyle({
        selectors: [selector, customSelector],
        fns: fns,
        vars: vars,
        customVars: customVars,
        mediaQuery: mediaQuery,
        scope: scope
      })];
    }
  );
};

var styler = {
  add: add,
  addStyle: addStyle,
  addToDocument: addToDocument,
  createAddStyle: createAddStyle,
  createGetStyle: createGetStyle,
  getStyle: getStyle,
  remove: remove
}; // @ts-check

/**
 * @typedef {(selector: string, vars: object, customVars?: object) => Array<object>} StyleFn
 * @typedef {{[s: string]: StyleFn}} StyleCollection
 */

/**
 * Wraps an object with a selector.
 * @param {string} selector 
 * @param {object} o 
 * @returns {object}
 */

exports.styler = styler;

var sel = function sel(selector, o) {
  return _defineProperty({}, selector, o);
};
/**
 * Creates a right-to-left selector.
 * @param {string} selector
 * @returns {string}
 */


exports.sel = sel;

var selectorRTL = function selectorRTL(selector) {
  return "*[dir=rtl] ".concat(selector, ", .pe-rtl ").concat(selector);
};
/**
 * Creates a rgba CSS color string.
 * @param {string} colorStr 
 * @param {number} opacity 
 * @returns {string}
 */


exports.selectorRTL = selectorRTL;

var rgba = function rgba(colorStr) {
  var opacity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  return "rgba(".concat(colorStr, ", ").concat(opacity, ")");
};
/**
 * @param {object} params
 * @param {string} [params.selector]
 * @param {string} [params.scopedSelector]
 * @param {StyleCollection} [params.varFns]
 * @param {StyleCollection} [params.customVarFns]
 * @param {StyleFn} [params.superStyle]
 * @param {(_:any) => StyleCollection} [params.varMixin]
 * @param {StyleCollection} [params.componentVars]
 * @param {StyleCollection} [params.customVars]
 * @returns {Array<object>}
 */


exports.rgba = rgba;

var createStyle = function createStyle(_ref2) {
  var varFns = _ref2.varFns,
      customVarFns = _ref2.customVarFns,
      superStyle = _ref2.superStyle,
      varMixin = _ref2.varMixin,
      selector = _ref2.selector,
      scopedSelector = _ref2.scopedSelector,
      _ref2$componentVars = _ref2.componentVars,
      componentVars = _ref2$componentVars === void 0 ? {} : _ref2$componentVars,
      customVars = _ref2.customVars;

  var allVars = _objectSpread2({}, componentVars, {}, customVars);

  var currentVars = customVars ? customVars : allVars;

  var general_styles = componentVars.general_styles,
      otherVars = _objectWithoutProperties(componentVars, ["general_styles"]);

  var baseLayout = superStyle !== undefined ? customVars !== undefined ? superStyle(selector, componentVars, customVars) : superStyle(selector, otherVars) : [];

  var fns = _objectSpread2({}, customVars ? customVarFns : {}, {}, varFns);

  return baseLayout.concat(Object.keys(varMixin(currentVars)).map(function (v) {
    return fns && fns[v] !== undefined ? fns[v](scopedSelector, allVars) : null;
  }).filter(function (s) {
    return s;
  }));
};
/**
 * 
 * @param {object} params
 * @param {StyleCollection} [params.varFns]
 * @param {StyleCollection} [params.customVarFns]
 * @param {StyleFn} [params.superLayout]
 * @param {(_:any) => StyleCollection} [params.varMixin]
 * @returns {StyleFn}
 */


var createLayout = function createLayout(_ref3) {
  var varFns = _ref3.varFns,
      customVarFns = _ref3.customVarFns,
      superLayout = _ref3.superLayout,
      _ref3$varMixin = _ref3.varMixin,
      varMixin = _ref3$varMixin === void 0 ? function (o) {
    return o;
  } : _ref3$varMixin;
  return (
    /**
     * @param {string} selector
     * @param {object} componentVars
     * @param {object} [customVars]
     * @returns {Array<object>}
     */
    function (selector, componentVars, customVars) {
      return createStyle({
        varFns: varFns,
        customVarFns: customVarFns,
        superStyle: superLayout,
        varMixin: varMixin,
        selector: selector,
        scopedSelector: selector,
        componentVars: componentVars,
        customVars: customVars
      });
    }
  );
};
/**
 * 
 * @param {object} params
 * @param {string} [params.selector]
 * @param {string} [params.scopedSelector]
 * @param {object} [params.componentVars]
 * @param {object} [params.customVars]  
 * @param {StyleFn} [params.superColor]
 * @param {StyleCollection} [params.varFns]
 * @param {(_:any) => StyleCollection} [params.varMixin]
 * @returns {Array<object>}
 */


exports.createLayout = createLayout;

var createColorStyle = function createColorStyle(_ref4) {
  var selector = _ref4.selector,
      scopedSelector = _ref4.scopedSelector,
      componentVars = _ref4.componentVars,
      customVars = _ref4.customVars,
      varFns = _ref4.varFns,
      superColor = _ref4.superColor,
      varMixin = _ref4.varMixin;
  return createStyle({
    varFns: varFns,
    superStyle: superColor,
    varMixin: varMixin,
    selector: selector,
    scopedSelector: scopedSelector,
    componentVars: componentVars,
    customVars: customVars
  });
};
/**
 * 
 * @param {object} params 
 * @param {Array<string>} params.scopes
 * @param {string} params.selector
 * @param {boolean} params.isNoTouch
* @returns {string}
 */


var appendPseudoClass = function appendPseudoClass(_ref5) {
  var scopes = _ref5.scopes,
      selector = _ref5.selector,
      isNoTouch = _ref5.isNoTouch;
  return isNoTouch ? scopes.map(function (s) {
    return s + selector + ":hover";
  }).join(",") : scopes.map(function (s) {
    return s + selector;
  }).join(",");
};
/**
 * 
 * @param {object} params 
 * @param {Array<string>} params.scopes
 * @param {string} params.selector
 * @param {boolean} [params.isNoTouch]
 * @returns {string}
 */


var createScopedSelector = function createScopedSelector(_ref6) {
  var scopes = _ref6.scopes,
      selector = _ref6.selector,
      _ref6$isNoTouch = _ref6.isNoTouch,
      isNoTouch = _ref6$isNoTouch === void 0 ? false : _ref6$isNoTouch;
  return selector.split(/\s*,\s*/).map(function (s) {
    return appendPseudoClass({
      scopes: scopes,
      selector: s,
      isNoTouch: isNoTouch
    });
  }).join("");
};
/**
 * @typedef {object} ColorScopeObject
 * @property {Array<string>} scopes
 * @property {string} varFnName
 * @property {boolean} isNoTouch
 */

/**
 * @type {Array<ColorScopeObject>} colorScopes
 */


var colorScopes = [{
  // has/inside dark tone
  scopes: [".pe-dark-tone", ".pe-dark-tone "],
  varFnName: "darkTintFns",
  isNoTouch: false
}, {
  // normal, has/inside light tone
  scopes: ["", ".pe-light-tone", ".pe-light-tone "],
  varFnName: "lightTintFns",
  isNoTouch: false
}, {
  // has/inside dark tone
  scopes: [".pe-no-touch .pe-dark-tone "],
  varFnName: "darkTintHoverFns",
  isNoTouch: true
}, {
  // normal, has/inside light tone
  scopes: [".pe-no-touch ", ".pe-no-touch .pe-light-tone "],
  varFnName: "lightTintHoverFns",
  isNoTouch: true
}];
/**
 * 
 * @param {object} params
 * @param {object} [params.varFns]
 * @param {StyleFn} [params.superColor]
 * @param {(_:any) => StyleCollection} [params.varMixin]
 * @returns {StyleFn}
 */

var createColor = function createColor(_ref7) {
  var _ref7$varFns = _ref7.varFns,
      varFns = _ref7$varFns === void 0 ? {} : _ref7$varFns,
      superColor = _ref7.superColor,
      _ref7$varMixin = _ref7.varMixin,
      varMixin = _ref7$varMixin === void 0 ? function (o) {
    return o;
  } : _ref7$varMixin;
  return (
    /**
     * @param {string} selector
     * @param {object} componentVars
     * @param {object} [customVars]
     * @returns {Array<object>}
     */
    function (selector, componentVars, customVars) {
      return colorScopes.map(function (_ref8) {
        var scopes = _ref8.scopes,
            varFnName = _ref8.varFnName,
            isNoTouch = _ref8.isNoTouch;
        return createColorStyle({
          selector: selector,
          scopedSelector: createScopedSelector({
            scopes: scopes,
            selector: selector,
            isNoTouch: isNoTouch
          }),
          componentVars: componentVars,
          customVars: customVars,
          varFns: varFns[varFnName],
          superColor: superColor,
          varMixin: varMixin
        });
      });
    }
  );
};
/**
 * @param {object} vars 
 * @param {object} behaviorVars
 * @returns {string|undefined} 
 */


exports.createColor = createColor;

var createMarkerValue = function createMarkerValue(vars, behaviorVars) {
  var marker = Object.keys(behaviorVars).filter(function (bvar) {
    return vars[bvar] === true;
  }).join(".");
  return marker ? "\"".concat(marker, "\"") : undefined;
};
/**
 * Creates a CSS style from which the key can be read from the `content` property.
 * @param {object} vars 
 * @param {object} behaviorVars 
 * @returns {object}
 */


var createMarker = function createMarker(vars, behaviorVars) {
  if (!vars) {
    console.error("createMarker requires param `vars`"); // eslint-disable-line no-console
  }

  var value = createMarkerValue(vars, behaviorVars);
  return value ? {
    ":before": {
      content: value,
      display: "none"
    }
  } : undefined;
}; // @ts-check

/**
 * @typedef {{[selector:string] : Style | any}} Style
 */

/**
 * @type {Array<Style>} classes
 */


exports.createMarker = createMarker;
var classes = [{
  ".layout, .layout.horizontal": flex$1.layout,
  ".layout.horizontal.inline, .layout.vertical.inline": flex$1.layoutInline,
  ".layout.horizontal": flex$1.layoutHorizontal,
  ".layout.horizontal.reverse": flex$1.layoutHorizontalReverse,
  ".layout.vertical": flex$1.layoutVertical,
  ".layout.vertical.reverse": flex$1.layoutVerticalReverse,
  ".layout.wrap": flex$1.layoutWrap,
  ".layout.wrap.reverse": flex$1.layoutWrapReverse,
  ".flex": flex$1.flex(1),
  ".span.flex": {
    "display": "block"
  },
  // for IE 10
  ".flex.auto-vertical": flex$1.flexAutoVertical,
  ".flex.auto": flex$1.flexAuto,
  ".flex.none": flex$1.flexIndex("none"),
  ".flex.one": flex$1.flexIndex(1),
  ".flex.two": flex$1.flexIndex(2),
  ".flex.three": flex$1.flexIndex(3),
  ".flex.four": flex$1.flexIndex(4),
  ".flex.five": flex$1.flexIndex(5),
  ".flex.six": flex$1.flexIndex(6),
  ".flex.seven": flex$1.flexIndex(7),
  ".flex.eight": flex$1.flexIndex(8),
  ".flex.nine": flex$1.flexIndex(9),
  ".flex.ten": flex$1.flexIndex(10),
  ".flex.eleven": flex$1.flexIndex(11),
  ".flex.twelve": flex$1.flexIndex(12),
  // alignment in cross axis
  ".layout.start": flex$1.layoutStart,
  ".layout.center, .layout.center-center": flex$1.layoutCenter,
  ".layout.end": flex$1.layoutEnd,
  // alignment in main axis
  ".layout.start-justified": flex$1.layoutStartJustified,
  ".layout.center-justified, .layout.center-center": flex$1.layoutCenterJustified,
  ".layout.end-justified": flex$1.layoutEndJustified,
  ".layout.around-justified": flex$1.layoutAroundJustified,
  ".layout.justified": flex$1.layoutJustified,
  // self alignment
  ".self-start": flex$1.selfStart,
  ".self-center": flex$1.selfCenter,
  ".self-end": flex$1.selfEnd,
  ".self-stretch": flex$1.selfStretch
}]; // @ts-check

/**
 * @typedef {{[selector:string] : object}} Style
 * @type {Array<Style>} classes
 */

var classes$1 = [{
  ".pe-block": {
    display: "block"
  },
  ".pe-inline-block": {
    display: "inline-block"
  },
  // ie support for hidden
  ".pe-hidden": {
    display: "none !important"
  },
  ".pe-relative": {
    position: "relative"
  },
  ".pe-absolute": {
    position: "absolute"
  },
  ".pe-fit": {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  ".pe-fullbleed": {
    margin: 0,
    height: "100vh"
  },
  ".pe-rtl": {
    direction: "rtl"
  },
  // flip directional icon if needed
  "*[dir=rtl], .pe-rtl ": {
    " .pe-rtl--flip": {
      transform: "scaleX(-1)"
    }
  }
}]; // @ts-check

/**
 * @typedef {{[selector:string] : object}} Style
 * 

/**
 * @type {Array<Style>} layoutStyles
 */

var layoutStyles = [classes, classes$1];
/**
 * @returns {void}
 */

exports.layoutStyles = layoutStyles;

var addLayoutStyles = function addLayoutStyles() {
  return styler.add("pe-layout", classes, classes$1);
};

exports.addLayoutStyles = addLayoutStyles;
},{"j2c":"../node_modules/j2c/dist/j2c.commonjs.js","polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs"}],"../node_modules/polythene-css-base-spinner/dist/polythene-css-base-spinner.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-spinner",
  // elements
  animation: "pe-spinner__animation",
  placeholder: "pe-spinner__placeholder",
  // states
  animated: "pe-spinner--animated",
  fab: "pe-spinner--fab",
  large: "pe-spinner--large",
  medium: "pe-spinner--medium",
  permanent: "pe-spinner--permanent",
  raised: "pe-spinner--raised",
  regular: "pe-spinner--regular",
  singleColor: "pe-spinner--single-color",
  small: "pe-spinner--small",
  visible: "pe-spinner--visible"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [];
  } // eslint-disable-line no-unused-vars

};

var tintFns = function tintFns(tint) {
  return _defineProperty({}, "color_" + tint + "_raised_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-spinner--raised": {
        backgroundColor: vars["color_" + tint + "_raised_background"]
      }
    })];
  });
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
});
exports.color = color;

var sizes = function sizes(size) {
  return {
    width: size + "px",
    height: size + "px"
  };
};

var raisedSize = function raisedSize(size) {
  var padding = Math.round(size * 0.25); // only use rounded number to prevent sub-pixel alignment issues

  var paddedSize = size + padding * 2;
  return {
    width: paddedSize + "px",
    height: paddedSize + "px",
    padding: padding + "px"
  };
};

var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      transitionProperty: "all",
      ".pe-spinner--raised": {
        position: "relative",
        borderRadius: "50%"
      }
    })];
  },
  animation_show_css: function animation_show_css(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-spinner--visible, &.pe-spinner--permanent": [vars.animation_show_css]
    })];
  },
  animation_hide_css: function animation_hide_css(selector, vars) {
    return _defineProperty({}, selector, vars.animation_hide_css);
  },
  animation_delay: function animation_delay(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      transitionDelay: vars.animation_delay
    })];
  },
  animation_duration: function animation_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      transitionDuration: vars.animation_duration
    })];
  },
  animation_timing_function: function animation_timing_function(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      transitionTimingFunction: vars.animation_timing_function
    })];
  },
  size_small: function size_small(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-spinner--small": sizes(vars.size_small),
      ".pe-spinner--raised": {
        ".pe-spinner--small": raisedSize(vars.size_small)
      }
    })];
  },
  size_regular: function size_regular(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-spinner--regular": sizes(vars.size_regular),
      ".pe-spinner--raised": {
        ".pe-spinner--regular": raisedSize(vars.size_regular)
      }
    })];
  },
  size_medium: function size_medium(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-spinner--medium": sizes(vars.size_medium),
      ".pe-spinner--raised": {
        ".pe-spinner--medium": raisedSize(vars.size_medium)
      }
    })];
  },
  size_large: function size_large(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-spinner--large": sizes(vars.size_large),
      ".pe-spinner--raised": {
        ".pe-spinner--large": raisedSize(vars.size_large)
      }
    })];
  },
  size_fab: function size_fab(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-spinner--fab": sizes(vars.size_fab),
      ".pe-spinner--raised": {
        ".pe-spinner--fab": raisedSize(vars.size_fab)
      }
    })];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

/**
 * @type {BaseSpinnerVars} baseSpinnerVars
 */

exports.layout = layout;
var baseSpinnerVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  animation_delay: "0s",
  animation_duration: ".220s",
  animation_hide_css: "opacity: 0;",
  animation_show_css: "opacity: 1;",
  animation_timing_function: "ease-in-out",
  size_fab: 7 * _polytheneTheme.vars.grid_unit_component,
  size_large: 6 * _polytheneTheme.vars.grid_unit_component,
  size_medium: 5 * _polytheneTheme.vars.grid_unit_component,
  size_regular: 4 * _polytheneTheme.vars.grid_unit_component,
  size_small: 3 * _polytheneTheme.vars.grid_unit_component,
  color_light_raised_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_background),
  color_dark_raised_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_background) // also use light background with dark tone

}; // @ts-check

exports.vars = baseSpinnerVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, baseSpinnerVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, baseSpinnerVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: baseSpinnerVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-shadow/dist/polythene-css-shadow.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.sharedVars = exports.sharedVarFns = exports.layout = exports.getStyle = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-shadow",
  // elements      
  bottomShadow: "pe-shadow__bottom",
  topShadow: "pe-shadow__top",
  // states
  animated: "pe-shadow--animated",
  depth_n: "pe-shadow--depth-",
  with_active_shadow: "pe-with-active-shadow"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var _createShadowForSelector = function _createShadowForSelector(which, depth) {
  return function (selector, vars) {
    return [_createRegularShadowForSelector(which, depth, selector, vars), _createActiveShadowForSelector(which, depth, selector, vars)];
  };
};

var _createRegularShadowForSelector = function _createRegularShadowForSelector(which, depth, selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, _defineProperty({}, ".pe-shadow--depth-".concat(depth, " .pe-shadow__").concat(which), {
    boxShadow: vars["shadow_".concat(which, "_depth_").concat(depth)]
  }));
};

var _createActiveShadowForSelector = function _createActiveShadowForSelector(which, depth, selector, vars) {
  if (depth === 5) {
    return [];
  }

  var hoverDepth = depth + 1;
  var hoverSelector = ".pe-with-active-shadow.pe-shadow--depth-".concat(hoverDepth);
  return [(0, _polytheneCoreCss.sel)("".concat(hoverSelector, ":focus ").concat(selector, ", ").concat(hoverSelector, ":active ").concat(selector), _defineProperty({}, " .pe-shadow__".concat(which), {
    boxShadow: vars["shadow_".concat(which, "_depth_").concat(hoverDepth)]
  }))];
};

var _createActiveShadowTransition = function _createActiveShadowTransition(selector, vars) {
  return (0, _polytheneCoreCss.sel)(".pe-with-active-shadow ".concat(selector), {
    " .pe-shadow__bottom, .pe-shadow__top": {
      transition: vars.transition
    }
  });
};
/**
 * @param {string} selector 
 * @param {object} vars 
 * @param {number} depth 
 * @param {"top"|"bottom"} which 
 */


var _createShadow = function _createShadow(selector, vars, depth, which) {
  return (0, _polytheneCoreCss.sel)(selector, _defineProperty({}, " .pe-shadow__".concat(which), {
    boxShadow: vars["shadow_".concat(which, "_depth_").concat(depth)]
  }));
};
/**
 * @param {string} selector 
 * @param {object} vars 
 * @param {number} depth
 * @returns {object}
 */


var shadow = function shadow(selector, vars, depth) {
  return [_createShadow(selector, vars, depth, "top"), _createShadow(selector, vars, depth, "bottom")];
};
/**
 * @param {string} selector 
 * @param {object} vars 
 * @returns {object}
 */


var shadow_depth = function shadow_depth(selector, vars) {
  return vars.shadow_depth !== undefined ? shadow(selector, vars, vars.shadow_depth) : null;
};

var transition = function transition(selector, vars) {
  return [(0, _polytheneCoreCss.sel)(selector, {
    ".pe-shadow--animated": {
      " .pe-shadow__bottom, .pe-shadow__top": {
        transition: vars.transition
      }
    }
  }), _createActiveShadowTransition(selector, vars)];
};

var sharedVarFns = {
  shadow_depth: shadow_depth
};
exports.sharedVarFns = sharedVarFns;

var varFns = _extends({}, {
  general_styles: function general_styles(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, [_polytheneCoreCss.mixin.fit(), shadow(selector, vars, 1), {
      borderRadius: "inherit",
      pointerEvents: "none",
      " .pe-shadow__bottom, .pe-shadow__top": [_polytheneCoreCss.mixin.fit(), {
        borderRadius: "inherit"
      }]
    }])];
  },
  transition: transition,
  shadow_depth: shadow_depth
}, [0, 1, 2, 3, 4, 5].reduce(function (acc, depth) {
  return acc["shadow_top_depth_".concat(depth)] = _createShadowForSelector("top", depth), acc["shadow_bottom_depth_".concat(depth)] = _createShadowForSelector("bottom", depth), acc;
}, {}));

var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
});
exports.layout = layout;
var sharedVars = {
  shadow_top_depth_0: "none",
  shadow_bottom_depth_0: "none",
  shadow_top_depth_1: "none",
  shadow_bottom_depth_1: "0 1px 4px 0 rgba(0, 0, 0, 0.37)",
  shadow_top_depth_2: "0 2px 2px 0 rgba(0, 0, 0, 0.2)",
  shadow_bottom_depth_2: "0 6px 10px 0 rgba(0, 0, 0, 0.3)",
  shadow_top_depth_3: "0 11px 7px 0 rgba(0, 0, 0, 0.19)",
  shadow_bottom_depth_3: "0 13px 25px 0 rgba(0, 0, 0, 0.3)",
  shadow_top_depth_4: "0 14px 12px 0 rgba(0, 0, 0, 0.17)",
  shadow_bottom_depth_4: "0 20px 40px 0 rgba(0, 0, 0, 0.3)",
  shadow_top_depth_5: "0 17px 17px 0 rgba(0, 0, 0, 0.15)",
  shadow_bottom_depth_5: "0 27px 55px 0 rgba(0, 0, 0, 0.3)",
  // theme vars
  shadow_depth: undefined
};
exports.sharedVars = sharedVars;

var vars = _objectSpread2({
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  transition: "box-shadow ".concat(_polytheneTheme.vars.animation_duration, " ease-out")
}, sharedVars); // @ts-check


exports.vars = vars;
var fns = [layout];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, vars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, vars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: vars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-button/dist/polythene-css-button.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.textButtonVars = exports.textButtonLayout = exports.textButtonColor = exports.getStyle = exports.containedButtonVars = exports.containedButtonLayout = exports.containedButtonColor = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneCssShadow = require("polythene-css-shadow");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-text-button",
  "super": "pe-button",
  row: "pe-button-row",
  // elements      
  content: "pe-button__content",
  label: "pe-button__label",
  textLabel: "pe-button__text-label",
  wash: "pe-button__wash",
  washColor: "pe-button__wash-color",
  dropdown: "pe-button__dropdown",
  // states      
  border: "pe-button--border",
  contained: "pe-button--contained",
  disabled: "pe-button--disabled",
  dropdownClosed: "pe-button--dropdown-closed",
  dropdownOpen: "pe-button--dropdown-open",
  extraWide: "pe-button--extra-wide",
  hasDropdown: "pe-button--dropdown",
  highLabel: "pe-button--high-label",
  inactive: "pe-button--inactive",
  raised: "pe-button--raised",
  selected: "pe-button--selected",
  separatorAtStart: "pe-button--separator-start",
  hasHover: "pe-button--has-hover"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      userSelect: "none",
      "-moz-user-select": "none",
      outline: "none",
      padding: 0,
      textDecoration: "none",
      textAlign: "center",
      cursor: "pointer",
      ".pe-button--selected, &.pe-button--disabled, &.pe-button--inactive": {
        cursor: "default",
        pointerEvents: "none"
      },
      " .pe-button__content": {
        position: "relative",
        borderRadius: "inherit"
      },
      " .pe-button__label": {
        position: "relative",
        display: "block",
        borderRadius: "inherit",
        pointerEvents: "none"
      },
      " .pe-button__wash, .pe-button__wash-color": [_polytheneCoreCss.mixin.fit(), {
        zIndex: 0,
        borderRadius: "inherit",
        pointerEvents: "none"
      }]
    }), {
      ".pe-button-row": {
        // prevent inline block style to add extra space:
        fontSize: 0,
        lineHeight: 0
      }
    }];
  },
  row_margin_h: function row_margin_h(selector, vars) {
    return [{
      ".pe-button-row": _defineProperty({
        margin: "0 -".concat(vars.row_margin_h, "px")
      }, " ".concat(selector), {
        margin: "0 ".concat(vars.row_margin_h, "px")
      })
    }];
  }
};
var superLayout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
});

var _border = function border(selector, vars, tint) {
  return (0, _polytheneCoreCss.sel)(selector, {
    ":not(.pe-button--disabled)": {
      " .pe-button__content": {
        borderColor: vars["color_" + tint + "_border"]
      }
    }
  });
};

var generalFns = {
  general_styles: function general_styles() {
    return [];
  }
};
/**
 * @param {tint} tint 
 */

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-button--disabled)": {
        "&, &:link, &:visited": {
          color: vars["color_" + tint + "_text"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_disabled_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-button--disabled": {
        color: vars["color_" + tint + "_disabled_text"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-button--disabled):not(.pe-button--selected)": {
        " .pe-button__content": {
          backgroundColor: vars["color_" + tint + "_background"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_active_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-button--disabled)": {
        ".pe-button--selected": {
          " .pe-button__content": {
            backgroundColor: vars["color_" + tint + "_active_background"]
          }
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_disabled_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-button--disabled": {
        " .pe-button__content": {
          backgroundColor: vars["color_" + tint + "_disabled_background"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_wash_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__wash-color": {
        backgroundColor: vars["color_" + tint + "_wash_background"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_wash_opacity", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__wash-color": {
        opacity: vars["color_" + tint + "_wash_opacity"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_border", function (selector, vars) {
    return [_border("".concat(selector, ".pe-button--border"), vars, tint)];
  }), _defineProperty(_ref, "border", function border(selector, vars) {
    return [_border(selector, vars, tint)];
  }), _defineProperty(_ref, "color_" + tint + "_active_border", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-button--border.pe-button--selected": {
        " .pe-button__content": {
          borderColor: vars["color_" + tint + "_active_border"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_disabled_border", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-button--border.pe-button--disabled": {
        " .pe-button__content": {
          borderColor: vars["color_" + tint + "_disabled_border"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_icon", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__dropdown": {
        color: vars["color_" + tint + "_icon"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_separator", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-button--separator-start": {
        " .pe-button__content": {
          borderColor: vars["color_" + tint + "_separator"]
        }
      }
    })];
  }), _ref;
};
/**
 * @param {tint} tint 
 */


var hoverTintFns = function hoverTintFns(tint) {
  var _ref2;

  return _ref2 = {}, _defineProperty(_ref2, "color_" + tint + "_hover", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-button--disabled):not(.pe-button--selected)": {
        color: vars["color_" + tint + "_hover"]
      }
    })];
  }), _defineProperty(_ref2, "color_" + tint + "_hover_border", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-button--disabled):not(.pe-button--selected)": {
        " .pe-button__content": {
          borderColor: vars["color_" + tint + "_hover_border"]
        }
      }
    })];
  }), _defineProperty(_ref2, "color_" + tint + "_hover_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-button--disabled):not(.pe-button--selected)": {
        " .pe-button__content": {
          backgroundColor: vars["color_" + tint + "_hover_background"]
        }
      }
    })];
  }), _defineProperty(_ref2, "color_" + tint + "_hover_icon", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__dropdown": {
        color: vars["color_" + tint + "_hover_icon"]
      }
    })];
  }), _ref2;
};

var lightTintFns = _objectSpread2({}, generalFns, {}, tintFns("light"));

var darkTintFns = _objectSpread2({}, generalFns, {}, tintFns("dark"));

var lightTintHoverFns = hoverTintFns("light");
var darkTintHoverFns = hoverTintFns("dark");
var superColor = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns,
    lightTintHoverFns: lightTintHoverFns,
    darkTintHoverFns: darkTintHoverFns
  }
});
/** 
 * @param {boolean} isRTL 
 */

var alignSide = function alignSide(isRTL) {
  return function () {
    return {
      ".pe-button--separator-start .pe-button__content": {
        borderStyle: isRTL ? "none solid none none" : "none none none solid"
      }
    };
  };
};

var alignLeft = alignSide(false);
var alignRight = alignSide(true);

var line_height_label_padding_v = function line_height_label_padding_v(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-button__dropdown": {
      minHeight: "calc((1em * ".concat(vars.line_height, ") + 2 * ").concat(vars.label_padding_v, "px)")
    }
  });
};

var outer_padding_v_label_padding_v = function outer_padding_v_label_padding_v(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    ".pe-button--high-label": {
      padding: 0,
      " .pe-button__label": {
        padding: vars.outer_padding_v + vars.label_padding_v + "px 0"
      }
    }
  });
};

var line_height_outer_padding_v_label_padding_v = function line_height_outer_padding_v_label_padding_v(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    ".pe-button--high-label": {
      " .pe-button__label, .pe-button__dropdown": {
        minHeight: "calc((1em * ".concat(vars.line_height, ") + 2 * ").concat(vars.outer_padding_v + vars.label_padding_v, "px)")
      }
    }
  });
};

var border_radius_button_group = function border_radius_button_group(selector, vars, isRTL) {
  var _peButton__content, _peButton__content2;

  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-button__content": {
      borderRadius: vars.border_radius + "px"
    },
    ":not(:first-child)": {
      " .pe-button__content": (_peButton__content = {}, _defineProperty(_peButton__content, isRTL ? "borderTopRightRadius" : "borderTopLeftRadius", 0), _defineProperty(_peButton__content, isRTL ? "borderBottomRightRadius" : "borderBottomLeftRadius", 0), _peButton__content)
    },
    ":not(:last-child)": {
      " .pe-button__content": (_peButton__content2 = {}, _defineProperty(_peButton__content2, isRTL ? "borderTopLeftRadius" : "borderTopRightRadius", 0), _defineProperty(_peButton__content2, isRTL ? "borderBottomLeftRadius" : "borderBottomRightRadius", 0), _peButton__content2)
    }
  });
};

var _border$1 = function border(selector) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-button__wash, .pe-ripple": _polytheneCoreCss.mixin.fit(-1),
    " .pe-button__content": {
      borderStyle: "solid"
    }
  });
};

var _border_width = function border_width(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-button__content": {
      borderWidth: vars.border_width + "px"
    },
    " .pe-button-group & + &": {
      marginLeft: -vars.border_width + "px"
    }
  });
};

var _contained = function contained(selector) {
  return (0, _polytheneCoreCss.sel)(selector, {//
  });
};

var varFns$1 = _objectSpread2({
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, [alignLeft(), {
      display: "inline-block",
      background: "transparent",
      border: "none",
      " .pe-button__content": {
        position: "relative",
        borderWidth: "1px",
        // default
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 0,
        paddingBottom: 0
      },
      ".pe-button--border": _border$1(selector),
      // TODO: move wash styles to base button
      " .pe-button__wash": {
        opacity: 0
      },
      // Always show wash on focus but not on click
      "&:focus:not(:active) .pe-button__wash": {
        opacity: 1
      },
      // Only show wash on hover when "has hover" class set
      ".pe-button--has-hover:hover": {
        " .pe-button__wash": {
          opacity: 1
        }
      },
      " .pe-button__label, .pe-button__dropdown": {
        whiteSpace: "pre",
        userSelect: "none",
        "-moz-user-select": "none"
      },
      " .pe-button__text-label": {
        display: "inline-block",
        lineHeight: 1
      },
      ".pe-button--dropdown": {
        minWidth: "0",
        // IE 11 does not recognize "initial" here
        " .pe-button__dropdown": {
          position: "relative"
        },
        " .pe-svg": {
          position: "absolute",
          left: 0,
          top: "50%"
        },
        " .pe-button__label + .pe-button__dropdown": {
          marginLeft: "6px",
          minWidth: 0
        }
      },
      " .pe-button-group &": {
        minWidth: 0
      },
      " .pe-button__dropdown .pe-svg": _polytheneCoreCss.mixin.defaultTransition("transform"),
      ".pe-button--dropdown-open": {
        " .pe-button__dropdown .pe-svg": {
          transform: "rotate(-180deg)"
        }
      }
    }]), [(0, _polytheneCoreCss.sel)((0, _polytheneCoreCss.selectorRTL)(selector), alignRight())]];
  },
  border_radius: function border_radius(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__content": {
        borderRadius: vars.border_radius + "px"
      }
    }), border_radius_button_group(".pe-button-group ".concat(selector), vars, false), border_radius_button_group((0, _polytheneCoreCss.selectorRTL)(".pe-button-group ".concat(selector)), vars, true)];
  },
  border_width: function border_width(selector, vars) {
    return [_border_width(selector, vars)];
  },
  min_width: function min_width(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      minWidth: vars.min_width + "px"
    })];
  },
  animation_duration: function animation_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__content, .pe-button__wash": [_polytheneCoreCss.mixin.defaultTransition("all", vars.animation_duration)]
    })];
  },
  padding_h: function padding_h(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__content": {
        paddingLeft: vars.padding_h + "px",
        paddingRight: vars.padding_h + "px",
        " .pe-button__dropdown": {
          minWidth: "calc(36px - 2 * ".concat(vars.padding_h, "px)")
        },
        ".pe-button--dropdown": {
          " .pe-button__label + .pe-button__dropdown": {
            marginRight: "calc(7px - ".concat(vars.padding_h, "px)")
          }
        }
      }
    })];
  },
  padding_h_extra_wide: function padding_h_extra_wide(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-button--extra-wide .pe-button__content": {
        padding: "0 " + vars.padding_h_extra_wide + "px"
      }
    })];
  },
  label_padding_v: function label_padding_v(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__label": {
        padding: vars.label_padding_v + "px 0"
      },
      ".pe-button--border": {
        " .pe-button__label": {
          padding: vars.label_padding_v - 1 + "px 0"
        }
      }
    }), vars.line_height !== undefined && line_height_label_padding_v(selector, vars), vars.outer_padding_v !== undefined && outer_padding_v_label_padding_v(selector, vars), vars.line_height !== undefined && vars.outer_padding_v !== undefined && vars.label_padding_v !== undefined && line_height_outer_padding_v_label_padding_v(selector, vars)];
  },
  font_weight: function font_weight(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__label": {
        fontWeight: vars.font_weight
      }
    })];
  },
  text_transform: function text_transform(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__label": {
        textTransform: vars.text_transform
      }
    })];
  },
  font_size: function font_size(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__label, .pe-button__dropdown": {
        fontSize: vars.font_size + "px"
      }
    })];
  },
  line_height: function line_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__label, .pe-button__dropdown": {
        lineHeight: vars.line_height
      }
    }), vars.label_padding_v !== undefined && line_height_label_padding_v(selector, vars), vars.outer_padding_v !== undefined && vars.label_padding_v !== undefined && line_height_outer_padding_v_label_padding_v(selector, vars)];
  },
  dropdown_icon_size: function dropdown_icon_size(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-button--dropdown": {
        " .pe-button__dropdown": {
          width: vars.dropdown_icon_size + "px"
        },
        " .pe-svg": {
          width: vars.dropdown_icon_size + "px",
          height: vars.dropdown_icon_size + "px",
          marginTop: -vars.dropdown_icon_size / 2 + "px"
        }
      }
    })];
  },
  outer_padding_v: function outer_padding_v(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      padding: vars.outer_padding_v + "px 0",
      ".pe-button--high-label": {
        padding: 0
      }
    }), vars.label_padding_v !== undefined && outer_padding_v_label_padding_v(selector, vars), vars.line_height !== undefined && vars.outer_padding_v !== undefined && vars.label_padding_v !== undefined && line_height_outer_padding_v_label_padding_v(selector, vars)];
  },
  separator_width: function separator_width(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-button--separator-start": {
        " .pe-button__content": {
          borderWidth: vars.separator_width + "px"
        }
      }
    })];
  },
  letter_spacing: function letter_spacing(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      letterSpacing: vars.letter_spacing + "px"
    })];
  },
  // Theme vars
  border: function border(selector, vars) {
    return vars.border && _border$1(selector);
  },
  contained: function contained(selector, vars) {
    return vars.contained && _contained(selector);
  }
}, _polytheneCssShadow.sharedVarFns);

var superLayout$1 = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns$1
});
var touch_height = _polytheneTheme.vars.unit_touch_height; // 48

var height = 36;
var border_width = 1;

var themeVars = _extends({}, {
  border: false,
  contained: false
}, _polytheneCssShadow.sharedVars);

var borderVars = {
  border_width: border_width,
  color_light_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_border_medium),
  // only specify this variable to get all 4 states
  // color_light_hover_border:             "transparent",
  // color_light_active_border:            "transparent",
  color_light_disabled_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_disabled),
  //
  color_dark_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_border_medium),
  // only specify this variable to get all 4 states
  // color_dark_hover_border:              "transparent",
  // color_dark_active_border:             "transparent",
  color_dark_disabled_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_disabled)
};
/**
 * @type {TextButtonVars} textButtonVars
 */

var textButtonVars = _objectSpread2({
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  animation_duration: _polytheneTheme.vars.animation_duration,
  border_radius: _polytheneTheme.vars.unit_item_border_radius,
  dropdown_icon_size: 24,
  font_size: 14,
  font_weight: 500,
  label_padding_v: 11,
  letter_spacing: 0.75,
  line_height: 1,
  min_width: 8 * _polytheneTheme.vars.grid_unit_component,
  outer_padding_v: (touch_height - height) / 2,
  // (48 - 36) / 2 = 6
  padding_h: 2 * _polytheneTheme.vars.grid_unit,
  // 8
  padding_h_extra_wide: 6 * _polytheneTheme.vars.grid_unit,
  // 24
  row_margin_h: _polytheneTheme.vars.grid_unit,
  separator_width: border_width,
  text_transform: "uppercase",
  color_light_background: "transparent",
  color_light_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_primary),
  color_light_wash_background: "currentColor",
  color_light_wash_opacity: 0.1,
  color_light_active_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_background_active),
  color_light_disabled_background: "transparent",
  color_light_disabled_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_disabled),
  color_light_icon: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_secondary),
  color_light_separator: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_border_light),
  color_dark_background: "transparent",
  color_dark_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_primary),
  color_dark_wash_background: "currentColor",
  color_dark_wash_opacity: 0.1,
  color_dark_active_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_background_active),
  color_dark_disabled_background: "transparent",
  color_dark_disabled_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_disabled),
  color_dark_icon: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_secondary),
  color_dark_separator: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_border_light)
}, borderVars, {}, themeVars);

var themeVars$1 = _objectSpread2({
  border: false,
  contained: true
}, _polytheneCssShadow.sharedVars);
/**
 * @type {ContainedButtonVars} containedButtonVars
 */


var containedButtonVars = _objectSpread2({
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  padding_h: 4 * _polytheneTheme.vars.grid_unit,
  // 16
  color_light_background: "#fff",
  color_light_disabled_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_background_disabled),
  color_dark_active_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary_dark),
  color_dark_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_dark_disabled_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_background_disabled)
}, themeVars$1); // @ts-check


var fns = [superLayout$1, superColor];
var superFns = [superLayout];
var superSelector = ".".concat(classes["super"]);
var selector = ".".concat(classes.component);
/**
 * @param {string} customSelector 
 * @param {object} [customVars]
 * @param {object} [scoping]
 * @param {string} [scoping.mediaQuery]
 * @param {string} [scoping.scope]
 */

var addStyle = function addStyle(customSelector, customVars) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$mediaQuery = _ref.mediaQuery,
      mediaQuery = _ref$mediaQuery === void 0 ? "" : _ref$mediaQuery,
      _ref$scope = _ref.scope,
      scope = _ref$scope === void 0 ? "" : _ref$scope;

  var finalVars = customVars && customVars.contained ? containedButtonVars : textButtonVars;
  customSelector && _polytheneCoreCss.styler.addStyle({
    selectors: [superSelector, customSelector],
    fns: superFns,
    vars: finalVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  });
  customSelector && _polytheneCoreCss.styler.addStyle({
    selectors: [selector, customSelector],
    fns: fns,
    vars: finalVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  });
};
/**
 * @param {string} [customSelector]
 * @param {object} [customVars]
 * @param {object} [scoping]
 * @param {string} [scoping.mediaQuery]
 * @param {string} [scoping.scope]
 */


var getStyle = function getStyle() {
  var customSelector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var customVars = arguments.length > 1 ? arguments[1] : undefined;

  var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref2$mediaQuery = _ref2.mediaQuery,
      mediaQuery = _ref2$mediaQuery === void 0 ? "" : _ref2$mediaQuery,
      _ref2$scope = _ref2.scope,
      scope = _ref2$scope === void 0 ? "" : _ref2$scope;

  var finalVars = customVars && customVars.contained ? containedButtonVars : textButtonVars;
  return _polytheneCoreCss.styler.getStyle({
    selectors: [superSelector, customSelector],
    fns: superFns,
    vars: finalVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  }).concat(_polytheneCoreCss.styler.getStyle({
    selectors: [selector, customSelector],
    fns: fns,
    vars: finalVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  }));
};

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  _polytheneCoreCss.styler.addStyle({
    selectors: [superSelector],
    fns: superFns,
    vars: textButtonVars
  });

  _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: textButtonVars
  });
}; // @ts-check


var color = (0, _polytheneCoreCss.createColor)({
  superColor: superColor
}); // @ts-check

var layout = (0, _polytheneCoreCss.createLayout)({
  superLayout: superLayout$1
}); // @ts-check

var fns$1 = [layout, color];
var selectors = [classes.component, classes.contained].join(" ");
var selector$1 = ".".concat(selectors.split(/\s/).join("."));

var addStyle$1 = _polytheneCoreCss.styler.createAddStyle(selector$1, fns$1, containedButtonVars);

var getStyle$1 = _polytheneCoreCss.styler.createGetStyle(selector$1, fns$1, containedButtonVars);

var addGeneralStyleToHead$1 = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector$1],
    fns: fns$1,
    vars: containedButtonVars
  });
}; // @ts-check

/**
 * @param {string} customSelector 
 * @param {object} [customVars]
 * @param {object} [scoping]
 * @param {string} [scoping.mediaQuery]
 * @param {string} [scoping.scope]
 */


var addStyle$2 = function addStyle$1(customSelector, customVars) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$mediaQuery = _ref.mediaQuery,
      mediaQuery = _ref$mediaQuery === void 0 ? "" : _ref$mediaQuery,
      _ref$scope = _ref.scope,
      scope = _ref$scope === void 0 ? "" : _ref$scope;

  addStyle(customSelector, customVars, {
    mediaQuery: mediaQuery,
    scope: scope
  });
};
/**
 * @param {string} [customSelector]
 * @param {object} [customVars]
 * @param {object} [scoping]
 * @param {string} [scoping.mediaQuery]
 * @param {string} [scoping.scope]
 */


exports.addStyle = addStyle$2;

var getStyle$2 = function getStyle$2() {
  var customSelector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var customVars = arguments.length > 1 ? arguments[1] : undefined;

  var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref2$mediaQuery = _ref2.mediaQuery,
      mediaQuery = _ref2$mediaQuery === void 0 ? "" : _ref2$mediaQuery,
      _ref2$scope = _ref2.scope,
      scope = _ref2$scope === void 0 ? "" : _ref2$scope;

  return getStyle(customSelector, customVars, {
    mediaQuery: mediaQuery,
    scope: scope
  }).concat(getStyle$1(customSelector, customVars, {
    mediaQuery: mediaQuery,
    scope: scope
  }));
};

exports.getStyle = getStyle$2;
var textButtonVars$1 = textButtonVars;
exports.textButtonVars = textButtonVars$1;
var textButtonColor = superColor;
exports.textButtonColor = textButtonColor;
var textButtonLayout = superLayout$1;
exports.textButtonLayout = textButtonLayout;
var containedButtonVars$1 = containedButtonVars;
exports.containedButtonVars = containedButtonVars$1;
var containedButtonColor = color;
exports.containedButtonColor = containedButtonColor;
var containedButtonLayout = layout;
exports.containedButtonLayout = containedButtonLayout;

var addGeneralStyleToHead$2 = function addGeneralStyleToHead$2() {
  addGeneralStyleToHead$1();
  addGeneralStyleToHead();
};

exports.addGeneralStyleToHead = addGeneralStyleToHead$2;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-css-shadow":"../node_modules/polythene-css-shadow/dist/polythene-css-shadow.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-button-group/dist/polythene-css-button-group.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var classes = {
  component: "pe-button-group"
}; // @ts-check

var varFns = {
  /**
   * @param {string} selector
   */
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      display: "flex"
    })];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

/**
 * @typedef {import("../index").ButtonGroupVars} ButtonGroupVars
 */

/**
 * @type {ButtonGroupVars} buttonGroupVars
 */

exports.layout = layout;
var buttonGroupVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true
}; // @ts-check

exports.vars = buttonGroupVars;
var fns = [layout];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, buttonGroupVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, buttonGroupVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: buttonGroupVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs"}],"../node_modules/polythene-css-card/dist/polythene-css-card.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-card",
  // elements
  actions: "pe-card__actions",
  any: "pe-card__any",
  content: "pe-card__content",
  header: "pe-card__header",
  headerTitle: "pe-card__header-title",
  media: "pe-card__media",
  mediaDimmer: "pe-card__media__dimmer",
  overlay: "pe-card__overlay",
  overlayContent: "pe-card__overlay__content",
  primary: "pe-card__primary",
  primaryMedia: "pe-card__primary-media",
  subtitle: "pe-card__subtitle",
  text: "pe-card__text",
  title: "pe-card__title",
  // states
  actionsBorder: "pe-card__actions--border",
  actionsHorizontal: "pe-card__actions--horizontal",
  actionsJustified: "pe-card__actions--justified",
  actionsTight: "pe-card__actions--tight",
  actionsVertical: "pe-card__actions--vertical",
  mediaCropX: "pe-card__media--crop-x",
  mediaCropY: "pe-card__media--crop-y",
  mediaOriginStart: "pe-card__media--origin-start",
  mediaOriginCenter: "pe-card__media--origin-center",
  mediaOriginEnd: "pe-card__media--origin-end",
  mediaLarge: "pe-card__media--large",
  mediaMedium: "pe-card__media--medium",
  mediaRatioLandscape: "pe-card__media--landscape",
  mediaRatioSquare: "pe-card__media--square",
  mediaRegular: "pe-card__media--regular",
  mediaSmall: "pe-card__media--small",
  overlaySheet: "pe-card__overlay--sheet",
  primaryHasMedia: "pe-card__primary--media",
  primaryTight: "pe-card__primary--tight",
  textTight: "pe-card__text--tight"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [];
  } // eslint-disable-line no-unused-vars

};

var tintFns = function tintFns(tint) {
  return _defineProperty({}, "color_" + tint + "_main_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      backgroundColor: vars["color_" + tint + "_main_background"]
    })];
  });
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
});
exports.color = color;
var generalFns$1 = {
  general_styles: function general_styles(selector) {
    return [];
  } // eslint-disable-line no-unused-vars

};

var tintFns$1 = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_title_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__title": {
        color: vars["color_" + tint + "_title_text"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_subtitle_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__subtitle": {
        color: vars["color_" + tint + "_subtitle_text"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__text": {
        color: vars["color_" + tint + "_text"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_actions_border", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__actions--border": {
        borderTop: "1px solid " + vars["color_" + tint + "_actions_border"]
      }
    })];
  }), _ref;
};

var lightTintFns$1 = _extends({}, generalFns$1, tintFns$1("light"));

var darkTintFns$1 = _extends({}, generalFns$1, tintFns$1("dark"));

var contentColor = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns$1,
    darkTintFns: darkTintFns$1
  }
});
/** 
 * @param {boolean} isRTL 
 */

var alignSide = function alignSide(isRTL) {
  return (// eslint-disable-line no-unused-vars

    /**
     * @param {string} [selector]
     * @param {object} [vars]
     */
    function (selector, vars) {
      return {};
    }
  );
}; // eslint-disable-line no-unused-vars


var alignLeft = alignSide();
var alignRight = alignSide();

var tight_title_padding_bottom_subtitle_line_height_padding_bottom = function tight_title_padding_bottom_subtitle_line_height_padding_bottom(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-card__primary": {
      ".pe-card__primary--tight": {
        " .pe-card__title": {
          paddingBottom: vars.tight_title_padding_bottom - vars.subtitle_line_height_padding_bottom + "px"
        }
      }
    }
  });
};

var title_padding_v_title_padding_h_subtitle_line_height_padding_bottom = function title_padding_v_title_padding_h_subtitle_line_height_padding_bottom(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-card__title": {
      padding: [vars.title_padding_v, vars.title_padding_h, vars.title_padding_v - vars.subtitle_line_height_padding_bottom, vars.title_padding_h].map(function (v) {
        return v + "px";
      }).join(" ")
    }
  });
};

var text_padding_v_text_line_height_padding_top = function text_padding_v_text_line_height_padding_top(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-card__text": {
      paddingTop: vars.text_padding_v - vars.text_line_height_padding_top + "px"
    }
  });
};

var text_padding_bottom_text_line_height_padding_bottom = function text_padding_bottom_text_line_height_padding_bottom(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-card__text": {
      "&:last-child": {
        paddingBottom: vars.text_padding_bottom - vars.text_line_height_padding_bottom + "px"
      }
    }
  });
};

var tight_text_padding_bottom_text_line_height_padding_bottom = function tight_text_padding_bottom_text_line_height_padding_bottom(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-card__text": {
      paddingBottom: vars.tight_text_padding_bottom - vars.text_line_height_padding_bottom + "px",
      ".pe-card__text--tight, &.pe-card__text--tight:last-child": {
        paddingBottom: vars.tight_text_padding_bottom - vars.text_line_height_padding_bottom + "px"
      }
    }
  });
};

var varFns = {
  general_styles: function general_styles(selector, vars$1) {
    return [(0, _polytheneCoreCss.sel)(selector, [alignLeft(vars$1), {
      display: "block",
      position: "relative",
      "&, a:link, a:visited": {
        textDecoration: "none"
      },
      // Content
      " .pe-card__content": {
        position: "relative",
        borderRadius: "inherit",
        overflow: "hidden",
        width: "inherit",
        height: "inherit"
      },
      // Media
      " .pe-card__media": {
        position: "relative",
        overflow: "hidden",
        borderTopLeftRadius: "inherit",
        borderTopRightRadius: "inherit",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        ".pe-card__media--landscape": {
          paddingBottom: 100 / 16 * 9 + "%"
        },
        ".pe-card__media--square": {
          paddingBottom: "100%"
        },
        ".pe-card__media--crop-x": {
          width: "100%",
          height: "auto",
          display: "block",
          ".pe-card__media--origin-start": {
            backgroundPositionY: "top"
          },
          ".pe-card__media--origin-end": {
            backgroundPositionY: "bottom"
          }
        },
        ".pe-card__media--crop-y": {
          height: "100%",
          width: "auto",
          display: "block",
          ".pe-card__media--origin-start": {
            backgroundPositionX: "left"
          },
          ".pe-card__media--origin-end": {
            backgroundPositionX: "right"
          }
        },
        " img, iframe": [_polytheneCoreCss.mixin.fit(), {
          width: "100%",
          height: "100%",
          maxWidth: "none"
        }],
        " img": {
          opacity: 0
          /* allows right-click on image */

        },
        " .pe-card__header + .pe-card__media": {
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0
        }
      },
      " .pe-card__primary-media": {
        margin: "16px"
      },
      // Overlay
      " .pe-card__overlay": _polytheneCoreCss.mixin.fit(),
      // Dimmer
      " .pe-card__media__dimmer": [_polytheneCoreCss.mixin.fit(), {
        zIndex: 1,
        pointerEvents: "all"
      }],
      " .pe-card__overlay__content": {
        position: "absolute",
        bottom: 0,
        top: "auto",
        right: 0,
        left: 0,
        zIndex: 2
      },
      // Header
      " .pe-card__header": {
        " .pe-list-tile__title": {
          fontSize: "14px",
          fontWeight: _polytheneTheme.vars.font_weight_normal,
          lineHeight: "20px",
          marginTop: "2px"
        },
        " .pe-list-tile__subtitle": {
          marginTop: "-1px"
        }
      },
      // Primary 
      " .pe-card__primary": [_polytheneCoreCss.flex.layoutHorizontal, {
        position: "relative",
        "& + .pe-card__text": {
          marginTop: "-16px"
        }
      }],
      // Title
      " .pe-card__title": [_polytheneCoreCss.flex.flex(), {
        fontSize: "24px",
        lineHeight: "29px"
      }],
      // Subtitle
      " .pe-card__subtitle": {
        fontSize: "14px",
        lineHeight: "24px"
      },
      // Actions
      " .pe-card__actions": {
        ".pe-card__actions--tight": {
          minHeight: 0,
          paddingTop: 0,
          paddingBottom: 0,
          ".pe-card__actions--vertical": {
            paddingLeft: 0,
            paddingRight: 0
          }
        },
        ".pe-card__actions--horizontal": {
          minHeight: 36 + 2 * 8 + "px",
          height: 36 + 2 * 8 + "px" // make align-items work on IE 11: https://github.com/philipwalton/flexbugs/issues/231

        },
        ".pe-card__actions--horizontal:not(.pe-card__actions--justified)": [_polytheneCoreCss.flex.layoutHorizontal, _polytheneCoreCss.flex.layoutCenter, {
          " .pe-button": {
            minWidth: 0
          }
        }],
        ".pe-card__actions--justified": [_polytheneCoreCss.flex.layoutJustified],
        ".pe-card__actions--vertical": [_polytheneCoreCss.flex.layoutVertical, {
          // nested
          " .pe-card__actions": [{
            minHeight: 0
          }],
          " .pe-button": {
            height: "36px",
            padding: 0
          },
          " .pe-list": {
            padding: 0
          }
        }]
      },
      " .pe-card__primary.pe-card__primary--media + .pe-card__actions": {
        marginTop: "-16px"
      },
      // Text
      " .pe-card__text": {
        fontSize: "14px",
        lineHeight: "24px",
        " .pe-card__actions + &": {
          marginTop: "8px"
        }
      },
      " .pe-card__text, .pe-card__primary": {
        "& + .pe-card__actions:not(:last-child)": {
          // Lift up so that full button area is usable
          position: "relative",
          zIndex: 1
        }
      }
    }, {
      // RTL
      "*[dir=rtl], .pe-rtl ": _defineProperty({}, selector, alignRight(vars$1))
    }])];
  },
  border_radius: function border_radius(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      borderRadius: vars.border_radius + "px",
      " .pe-card__content .pe-card__media": {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
      },
      " .pe-card__content .pe-card__media:not(.pe-card__media--square):not(.pe-card__media--landscape)": {
        ":first-child": {
          borderTopLeftRadius: vars.border_radius + "px",
          borderTopRightRadius: vars.border_radius + "px"
        },
        ":last-child": {
          borderBottomLeftRadius: vars.border_radius + "px",
          borderBottomRightRadius: vars.border_radius + "px"
        }
      }
    })];
  },
  image_size_small: function image_size_small(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__primary-media": {
        " .pe-card__media--small": {
          width: vars.image_size_small + "px",
          height: vars.image_size_small + "px"
        }
      }
    })];
  },
  image_size_regular: function image_size_regular(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__primary-media": {
        " .pe-card__media--regular": {
          width: vars.image_size_regular + "px"
        }
      }
    })];
  },
  image_size_medium: function image_size_medium(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__primary-media": {
        " .pe-card__media--medium": {
          width: vars.image_size_medium + "px"
        }
      }
    })];
  },
  image_size_large: function image_size_large(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__primary-media": {
        " .pe-card__media--large": {
          width: vars.image_size_large + "px"
        }
      }
    })];
  },
  one_line_height_with_icon: function one_line_height_with_icon(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__header": {
        height: vars.one_line_height_with_icon + "px"
      }
    })];
  },
  tight_title_padding_bottom: function tight_title_padding_bottom(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), tight_title_padding_bottom_subtitle_line_height_padding_bottom(selector, vars)];
  },
  subtitle_line_height_padding_bottom: function subtitle_line_height_padding_bottom(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), tight_title_padding_bottom_subtitle_line_height_padding_bottom(selector, vars), title_padding_v_title_padding_h_subtitle_line_height_padding_bottom(selector, vars)];
  },
  title_padding_v: function title_padding_v(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), title_padding_v_title_padding_h_subtitle_line_height_padding_bottom(selector, vars)];
  },
  title_padding_h: function title_padding_h(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), title_padding_v_title_padding_h_subtitle_line_height_padding_bottom(selector, vars)];
  },
  actions_button_margin_h: function actions_button_margin_h(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__actions.pe-card__actions--horizontal": {
        margin: "0 -".concat(vars.actions_button_margin_h, "px"),
        " .pe-button": {
          margin: "0 ".concat(vars.actions_button_margin_h, "px")
        }
      }
    })];
  },
  actions_padding_v: function actions_padding_v(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__actions": {
        paddingTop: vars.actions_padding_v + "px",
        paddingBottom: vars.actions_padding_v + "px"
      }
    })];
  },
  actions_padding_h: function actions_padding_h(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__actions": {
        paddingRight: vars.actions_padding_h + "px",
        paddingLeft: vars.actions_padding_h + "px"
      }
    })];
  },
  actions_button_margin_v: function actions_button_margin_v(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__actions": {
        ".pe-card__actions--vertical": {
          " .pe-button": {
            marginTop: vars.actions_button_margin_v + "px",
            marginBottom: vars.actions_button_margin_v + "px"
          }
        }
      }
    })];
  },
  actions_vertical_padding_v: function actions_vertical_padding_v(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__actions": {
        ".pe-card__actions--vertical": {
          ":not(.pe-card__actions--tight)": {
            paddingTop: vars.actions_vertical_padding_v + "px",
            paddingBottom: vars.actions_vertical_padding_v + "px"
          },
          // nested
          " .pe-card__actions": [{
            "&:first-child": {
              marginTop: -vars.actions_vertical_padding_v + "px"
            },
            "&:last-child": {
              marginBottom: -vars.actions_vertical_padding_v + "px"
            }
          }]
        }
      }
    })];
  },
  offset_small_padding_v: function offset_small_padding_v(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__text, .pe-card__primary": {
        "& + .pe-card__actions:not(:last-child)": {
          marginTop: -(vars.offset_small_padding_v + 3) + "px"
        }
      }
    })];
  },
  text_padding_h: function text_padding_h(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__text": {
        paddingRight: vars.text_padding_h + "px",
        paddingLeft: vars.text_padding_h + "px"
      }
    })];
  },
  text_padding_v: function text_padding_v(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), text_padding_v_text_line_height_padding_top(selector, vars)];
  },
  text_line_height_padding_top: function text_line_height_padding_top(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), text_padding_v_text_line_height_padding_top(selector, vars)];
  },
  text_padding_bottom: function text_padding_bottom(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), text_padding_bottom_text_line_height_padding_bottom(selector, vars)];
  },
  tight_text_padding_bottom: function tight_text_padding_bottom(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), tight_text_padding_bottom_text_line_height_padding_bottom(selector, vars)];
  },
  text_line_height_padding_bottom: function text_line_height_padding_bottom(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), text_padding_bottom_text_line_height_padding_bottom(selector, vars), tight_text_padding_bottom_text_line_height_padding_bottom(selector, vars)];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
});
exports.layout = layout;
var generalFns$2 = {
  general_styles: function general_styles(selector) {
    return [];
  } // eslint-disable-line no-unused-vars

};

var tintFns$2 = function tintFns(tint) {
  return _defineProperty({}, "color_" + tint + "_overlay_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-card__overlay__content": {
        backgroundColor: vars["color_" + tint + "_overlay_background"]
      }
    })];
  });
};

var lightTintFns$2 = _extends({}, generalFns$2, tintFns$2("light"));

var darkTintFns$2 = _extends({}, generalFns$2, tintFns$2("dark"));

var overlayColor = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns$2,
    darkTintFns: darkTintFns$2
  }
}); // @ts-check

var padding_v = 24;
var padding_actions_v = 8;
var actions_button_margin_v = 2;
/**
 * @type {CardVars} cardVars
 */

var cardVars = {
  general_styles: true,
  actions_button_margin_h: _polytheneTheme.vars.grid_unit,
  actions_button_margin_v: actions_button_margin_v,
  actions_padding_h: 8,
  actions_padding_v: 0,
  actions_vertical_padding_v: padding_actions_v - actions_button_margin_v,
  border_radius: _polytheneTheme.vars.unit_block_border_radius,
  icon_element_width: 72 - 4,
  image_size_large: 3 * 80,
  image_size_medium: 2 * 80,
  image_size_regular: 1.4 * 80,
  image_size_small: 1 * 80,
  offset_small_padding_v: padding_v - 16,
  one_line_height_with_icon: 72,
  one_line_padding_v: 8,
  padding_h: 16,
  subtitle_line_height_padding_bottom: 7,
  text_line_height_padding_bottom: 7,
  text_line_height_padding_top: 6,
  text_padding_bottom: 24,
  text_padding_h: 16,
  text_padding_v: 16,
  tight_text_padding_bottom: 16,
  tight_title_padding_bottom: 16,
  title_padding_h: 16,
  title_padding_v: 24,
  color_light_main_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_background),
  color_light_title_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_primary),
  color_light_subtitle_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_secondary),
  color_light_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_regular),
  color_light_actions_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_border_light),
  color_light_overlay_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_background, _polytheneTheme.vars.blend_light_overlay_background),
  color_dark_main_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_background),
  color_dark_title_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_primary),
  color_dark_subtitle_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_secondary),
  color_dark_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_regular),
  color_dark_actions_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_border_light),
  color_dark_overlay_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_background, _polytheneTheme.vars.blend_dark_overlay_background)
}; // @ts-check

exports.vars = cardVars;
var selector = ".".concat(classes.component);
var contentSelector = ".".concat(classes.content);
var overlaySheetSelector = ".".concat(classes.overlaySheet);
var overlayContentSelector = ".".concat(classes.overlayContent);
var baseFns = [layout, color];
var overlayColorFns = [overlayColor];
var contentColorFns = [contentColor];

var addStyle = function addStyle(customSelector, customVars) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$mediaQuery = _ref.mediaQuery,
      mediaQuery = _ref$mediaQuery === void 0 ? "" : _ref$mediaQuery,
      _ref$scope = _ref.scope,
      scope = _ref$scope === void 0 ? "" : _ref$scope;

  customSelector && _polytheneCoreCss.styler.addStyle({
    selectors: [customSelector, selector],
    fns: baseFns,
    vars: cardVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  });
  customSelector && _polytheneCoreCss.styler.addStyle({
    selectors: [customSelector, " " + overlaySheetSelector],
    fns: overlayColorFns,
    vars: cardVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  });
  customSelector && _polytheneCoreCss.styler.addStyle({
    selectors: [customSelector, " " + contentSelector],
    fns: contentColorFns,
    vars: cardVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  });
  customSelector && _polytheneCoreCss.styler.addStyle({
    selectors: [customSelector, " " + overlayContentSelector],
    fns: contentColorFns,
    vars: cardVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  });
};

exports.addStyle = addStyle;

var getStyle = function getStyle() {
  var customSelector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var customVars = arguments.length > 1 ? arguments[1] : undefined;

  var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref2$mediaQuery = _ref2.mediaQuery,
      mediaQuery = _ref2$mediaQuery === void 0 ? "" : _ref2$mediaQuery,
      _ref2$scope = _ref2.scope,
      scope = _ref2$scope === void 0 ? "" : _ref2$scope;

  return _polytheneCoreCss.styler.getStyle({
    selectors: [customSelector, selector],
    fns: baseFns,
    vars: cardVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  }).concat(_polytheneCoreCss.styler.getStyle({
    selectors: [customSelector, customSelector ? " " : "", overlaySheetSelector],
    fns: overlayColorFns,
    vars: cardVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  })).concat(_polytheneCoreCss.styler.getStyle({
    selectors: [customSelector, customSelector ? " " : "", contentSelector],
    fns: contentColorFns,
    vars: cardVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  })).concat(_polytheneCoreCss.styler.getStyle({
    selectors: [customSelector, customSelector ? " " : "", overlayContentSelector],
    fns: contentColorFns,
    vars: cardVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  }));
};

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: baseFns,
    vars: cardVars
  });

  _polytheneCoreCss.styler.addStyle({
    selectors: [overlaySheetSelector],
    fns: overlayColorFns,
    vars: cardVars
  });

  _polytheneCoreCss.styler.addStyle({
    selectors: [contentSelector],
    fns: contentColorFns,
    vars: cardVars
  });

  _polytheneCoreCss.styler.addStyle({
    selectors: [overlayContentSelector],
    fns: contentColorFns,
    vars: cardVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-selection-control/dist/polythene-css-selection-control.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-control",
  // elements
  formLabel: "pe-control__form-label",
  input: "pe-control__input",
  label: "pe-control__label",
  // states
  disabled: "pe-control--disabled",
  inactive: "pe-control--inactive",
  large: "pe-control--large",
  medium: "pe-control--medium",
  off: "pe-control--off",
  on: "pe-control--on",
  regular: "pe-control--regular",
  small: "pe-control--small",
  // control view elements
  box: "pe-control__box",
  button: "pe-control__button",
  // control view states
  buttonOff: "pe-control__button--off",
  buttonOn: "pe-control__button--on"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-control__box": {
        " .pe-control__button": {
          color: "inherit"
        },
        " .pe-control__button--on": {
          color: "inherit"
        }
      }
    })];
  }
};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_on", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      color: vars["color_" + tint + "_on"] // override by specifying "color"

    })];
  }), _defineProperty(_ref, "color_" + tint + "_off", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-control__button--off": {
        color: vars["color_" + tint + "_off"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_disabled", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--disabled": {
        " .pe-control__label": {
          color: vars["color_" + tint + "_disabled"]
        },
        " .pe-control__box": {
          " .pe-control__button--on, .pe-control__button--off": {
            color: vars["color_" + tint + "_disabled"]
          }
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_label", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-control__label": {
        color: vars["color_" + tint + "_label"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_on_icon", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-control__box": {
        " .pe-control__button--on": {
          color: vars["color_" + tint + "_on_icon"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_off_icon", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-control__box": {
        " .pe-control__button--off": {
          color: vars["color_" + tint + "_off_icon"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_on_label", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--on": {
        " .pe-control__label": {
          color: vars["color_" + tint + "_on_label"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_off_label", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--off": {
        " .pe-control__label": {
          color: vars["color_" + tint + "_off_label"]
        }
      }
    })];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
});
exports.color = color;

var alignSide = function alignSide(isRTL) {
  return function (vars) {
    return {};
  };
}; // eslint-disable-line no-unused-vars


var alignLeft = alignSide();
var alignRight = alignSide();

var makeSize = function makeSize(vars$1, height) {
  var iconSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _polytheneTheme.vars.unit_icon_size;
  var labelSize = iconSize + vars$1.label_height;
  var iconOffset = (labelSize - iconSize) / 2;
  return {
    " .pe-control__form-label": {
      height: height + "px"
    },
    " .pe-control__box": {
      width: iconSize + "px",
      height: iconSize + "px"
    },
    " .pe-button__content": {
      width: labelSize + "px",
      height: labelSize + "px",
      flexShrink: 0,
      " .pe-icon": [_polytheneCoreCss.mixin.fit(iconOffset)]
    }
  };
};

var activeButton = function activeButton() {
  return {
    opacity: 1,
    zIndex: 0
  };
};

var inactiveButton = function inactiveButton() {
  return {
    opacity: 0,
    zIndex: -1
  };
};

var button_size_icon_size = function button_size_icon_size(selector, vars, isRTL) {
  var _peButtonPeContr;

  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-button.pe-control__button": (_peButtonPeContr = {
      top: -((vars.button_size - vars.icon_size) / 2) + "px"
    }, _defineProperty(_peButtonPeContr, isRTL ? "right" : "left", -((vars.button_size - vars.icon_size) / 2) + "px"), _defineProperty(_peButtonPeContr, isRTL ? "left" : "right", "auto"), _peButtonPeContr)
  });
};

var _label_padding_before = function label_padding_before(selector, vars, isRTL) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-control__label": _defineProperty({}, isRTL ? "paddingRight" : "paddingLeft", vars.label_padding_before + "px")
  });
};

var _label_padding_after = function label_padding_after(selector, vars, isRTL) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-control__label": _defineProperty({}, isRTL ? "paddingLeft" : "paddingRight", vars.label_padding_after + "px")
  });
};

var varFns = {
  general_styles: function general_styles(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, [alignLeft(vars), {
      display: "inline-block",
      boxSizing: "border-box",
      margin: 0,
      padding: 0,
      " input[type=checkbox], input[type=radio]": {
        display: "none"
      },
      " .pe-control__form-label": [_polytheneCoreCss.flex.layoutHorizontal, _polytheneCoreCss.flex.layoutCenter, {
        position: "relative",
        cursor: "pointer",
        margin: 0,
        color: "inherit",
        ":focus": {
          outline: 0
        }
      }],
      ".pe-control--inactive": {
        " .pe-control__form-label": {
          cursor: "default"
        }
      },
      " .pe-control__box": {
        position: "relative",
        display: "inline-block",
        boxSizing: "border-box",
        color: "inherit",
        flexShrink: 0,
        ":focus": {
          outline: 0
        }
      },
      " .pe-button.pe-control__button": {
        position: "absolute"
      },
      ".pe-control--off": {
        " .pe-control__button--on": inactiveButton(),
        " .pe-control__button--off": activeButton()
      },
      ".pe-control--on": {
        " .pe-control__button--on": activeButton(),
        " .pe-control__button--off": inactiveButton()
      },
      " .pe-control__label": {
        // padding: RTL
        alignSelf: "center"
      },
      ".pe-control--disabled": {
        " .pe-control__form-label": {
          cursor: "auto"
        },
        " .pe-control__button": {
          pointerEvents: "none"
        }
      },
      " .pe-button__content": {
        " .pe-icon": {
          position: "absolute"
        }
      }
    }, _defineProperty({}, "*[dir=rtl] ".concat(selector, ", .pe-rtl ").concat(selector), [alignRight(vars)])])];
  },
  label_font_size: function label_font_size(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-control__form-label": {
        fontSize: vars.label_font_size + "px"
      }
    })];
  },
  label_height: function label_height(selector, vars$1) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-control__box": {
        width: vars$1.label_height + "px",
        height: vars$1.label_height + "px"
      },
      ".pe-control--small": makeSize(vars$1, _polytheneTheme.vars.unit_icon_size_small, _polytheneTheme.vars.unit_icon_size_small),
      ".pe-control--regular": makeSize(vars$1, vars$1.label_height, _polytheneTheme.vars.unit_icon_size),
      ".pe-control--medium": makeSize(vars$1, _polytheneTheme.vars.unit_icon_size_medium, _polytheneTheme.vars.unit_icon_size_medium),
      ".pe-control--large": makeSize(vars$1, _polytheneTheme.vars.unit_icon_size_large, _polytheneTheme.vars.unit_icon_size_large)
    })];
  },
  animation_duration: function animation_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button.pe-control__button": [_polytheneCoreCss.mixin.defaultTransition("opacity", vars.animation_duration)],
      " .pe-control__label": [_polytheneCoreCss.mixin.defaultTransition("all", vars.animation_duration)]
    })];
  },
  button_size: function button_size(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), button_size_icon_size(selector, vars, false), button_size_icon_size((0, _polytheneCoreCss.selectorRTL)(selector), vars, true)];
  },
  icon_size: function icon_size(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), button_size_icon_size(selector, vars, false), button_size_icon_size((0, _polytheneCoreCss.selectorRTL)(selector), vars, true)];
  },
  label_padding_after: function label_padding_after(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), _label_padding_after(selector, vars, false), _label_padding_after((0, _polytheneCoreCss.selectorRTL)(selector), vars, true)];
  },
  label_padding_before: function label_padding_before(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), _label_padding_before(selector, vars, false), _label_padding_before((0, _polytheneCoreCss.selectorRTL)(selector), vars, true)];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

/**
 * @typedef {import("../index").SelectionControlVars} SelectionControlVars
 */

/**
* @type {SelectionControlVars} selectionControlVars
*/

exports.layout = layout;
var selectionControlVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  animation_duration: _polytheneTheme.vars.animation_duration,
  button_size: 6 * _polytheneTheme.vars.grid_unit_component,
  icon_size: 3 * _polytheneTheme.vars.grid_unit_component,
  label_font_size: 2 * _polytheneTheme.vars.grid_unit_component,
  // 16
  label_height: 3 * _polytheneTheme.vars.grid_unit_component,
  // 24
  label_padding_after: 0,
  label_padding_before: _polytheneTheme.vars.grid_unit * 4,
  // 16
  color_light_on: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_light_off: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_secondary),
  color_light_label: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_secondary),
  color_light_disabled: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_disabled),
  // color_light_thumb_off_focus_opacity: .08,
  // color_light_thumb_on_focus_opacity:  .11,
  // icon colors may be set in theme; set to "inherit" by default
  color_light_on_icon: "inherit",
  color_light_off_icon: "inherit",
  // label on/off colors may be set in theme; set to color_light_label by default
  color_light_on_label: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_secondary),
  color_light_off_label: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_secondary),
  // color_light_focus_on:                rgba(vars.color_primary),
  // color_light_focus_on_opacity:        .11,
  // color_light_focus_off:               rgba(vars.color_light_foreground),
  // color_light_focus_off_opacity:       .07,
  color_dark_on: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_dark_off: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_secondary),
  color_dark_label: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_secondary),
  color_dark_disabled: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_disabled),
  // color_dark_thumb_off_focus_opacity:  .08,
  // color_dark_thumb_on_focus_opacity:   .11,
  // icon color may be set in theme; set to "inherit" by default
  color_dark_on_icon: "inherit",
  color_dark_off_icon: "inherit",
  // label on/off colors may be set in theme; set to color_dark_label by default
  color_dark_on_label: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_secondary),
  color_dark_off_label: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_secondary) // color_dark_focus_on:                 rgba(vars.color_primary), // or '#80cbc4'
  // color_dark_focus_on_opacity:         .14,
  // color_dark_focus_off:                rgba(vars.color_dark_foreground),
  // color_dark_focus_off_opacity:        .09

}; // @ts-check

exports.vars = selectionControlVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, selectionControlVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, selectionControlVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: selectionControlVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-checkbox/dist/polythene-css-checkbox.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneCssSelectionControl = require("polythene-css-selection-control");

var classes = {
  component: "pe-checkbox-control"
}; // @ts-check

var color = (0, _polytheneCoreCss.createColor)({
  superColor: _polytheneCssSelectionControl.color
}); // @ts-check

exports.color = color;
var layout = (0, _polytheneCoreCss.createLayout)({
  superLayout: _polytheneCssSelectionControl.layout
}); // @ts-check

/**
 * @typedef {import("../index").CheckboxVars} CheckboxVars
 */

/**
 * @type {CheckboxVars} checkboxVars
 */

exports.layout = layout;
var checkboxVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true
}; // @ts-check

exports.vars = checkboxVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, checkboxVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, checkboxVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: checkboxVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-css-selection-control":"../node_modules/polythene-css-selection-control/dist/polythene-css-selection-control.mjs"}],"../node_modules/polythene-css-dialog-pane/dist/polythene-css-dialog-pane.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.fullScreen = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-dialog-pane",
  // elements
  actions: "pe-dialog-pane__actions",
  body: "pe-dialog-pane__body",
  content: "pe-dialog-pane__content",
  footer: "pe-dialog-pane__footer",
  header: "pe-dialog-pane__header",
  title: "pe-dialog-pane__title",
  // states
  withHeader: "pe-dialog-pane--header",
  withFooter: "pe-dialog-pane--footer",
  headerWithTitle: "pe-dialog-pane__header--title",
  footerWithButtons: "pe-dialog-pane__footer--buttons",
  footerHigh: "pe-dialog-pane__footer--high",
  borderBottom: "pe-dialog-pane--border-bottom",
  borderTop: "pe-dialog-pane--border-top",
  fullBleed: "pe-dialog-pane--body-full-bleed"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles() {
    return [{
      " .pe-dialog-pane__body": {
        borderColor: "transparent"
      }
    }];
  }
};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      backgroundColor: vars["color_" + tint + "_background"]
    })];
  }), _defineProperty(_ref, "color_" + tint + "_title_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-dialog-pane__header .pe-dialog-pane__title": {
        color: vars["color_" + tint + "_title_text"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_body_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-dialog-pane__body": {
        color: vars["color_" + tint + "_body_text"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_body_border", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-dialog-pane--border-top .pe-dialog-pane__body": {
        borderTopColor: vars["color_" + tint + "_body_border"]
      },
      ".pe-dialog-pane--border-bottom .pe-dialog-pane__body": {
        borderBottomStyle: "solid",
        borderBottomColor: vars["color_" + tint + "_body_border"]
      }
    })];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
});
exports.color = color;

var max_width_side_padding_mobile = function max_width_side_padding_mobile(selector, vars) {
  var _ref3;

  var maxWidthBreakpointMobile = vars.max_width + 2 * vars.side_padding_mobile;
  return _ref3 = {}, _defineProperty(_ref3, "@media (max-width: " + maxWidthBreakpointMobile + "px)", _defineProperty({}, selector, {
    maxWidth: "calc(100vw - ".concat(2 * vars.side_padding_mobile, "px)")
  })), _defineProperty(_ref3, "@media (min-width: " + (maxWidthBreakpointMobile + 1) + "px)", _defineProperty({}, selector, {
    maxWidth: vars.max_width + "px"
  })), _ref3;
};

var padding_header_bottom = function padding_header_bottom(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-dialog-pane__header--title": {
      paddingTop: vars.padding - 4 + "px",
      paddingRight: vars.padding + "px",
      paddingBottom: vars.header_bottom - 4 + "px",
      paddingLeft: vars.padding + "px"
    }
  });
};
/*
Setting an explicit max-height is needed for IE 11
*/


var header_height_footer_height_margin_vertical = function header_height_footer_height_margin_vertical(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-dialog-pane__body": {
      maxHeight: "calc(100vh - (".concat(vars.header_height, "px + ").concat(vars.footer_height, "px + 2 * ").concat(vars.margin_vertical, "px))")
    }
  });
};
/**
 * @param {string} selector 
 */


var fullScreen = function fullScreen(selector) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-dialog-pane": {
      borderRadius: 0
    },
    " .pe-dialog-pane__content": {
      borderRadius: 0,
      maxWidth: "none",
      height: "100vh",
      width: "100vw",
      " > *": {
        flexShrink: 0
      },
      " > .pe-dialog-pane__body": {
        flexShrink: 1,
        maxHeight: "none" // IE 11 doesn't know "initial"

      }
    },
    " .pe-dialog-pane, .pe-dialog-pane__body": {
      height: "100vh",
      maxHeight: "100vh",
      borderTopStyle: "none",
      maxWidth: "none" // IE 11 doesn't know "initial"

    }
  });
};

exports.fullScreen = fullScreen;
var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, [_polytheneCoreCss.flex.layoutVertical, {
      position: "relative",
      borderTopLeftRadius: "inherit",
      borderTopRightRadius: "inherit",
      borderBottomLeftRadius: "inherit",
      borderBottomRightRadius: "inherit",
      margin: 0,
      " .pe-dialog-pane__content": {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderTopLeftRadius: "inherit",
        borderTopRightRadius: "inherit",
        borderBottomLeftRadius: "inherit",
        borderBottomRightRadius: "inherit"
      },
      " .pe-dialog-pane__title": {
        fontSize: _polytheneTheme.vars.font_size_title + "px",
        fontWeight: _polytheneTheme.vars.font_weight_medium,
        "& + div": {
          marginTop: "16px"
        }
      },
      " .pe-dialog-pane__header, .pe-dialog-pane__content > .pe-toolbar": {
        borderTopLeftRadius: "inherit",
        borderTopRightRadius: "inherit",
        " .pe-dialog-pane__title": {
          width: "100%",
          wordBreak: "break-all",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }
      },
      " .pe-dialog-pane__body": [{
        overflowY: "auto",
        "-webkit-overflow-scrolling": "touch",
        borderTopStyle: "solid",
        borderBottomStyle: "solid",
        " p": {
          margin: 0
        },
        " p + p": {
          marginTop: "16px"
        }
      }],
      ".pe-dialog-pane--body-full-bleed .pe-dialog-pane__body": {
        padding: 0,
        borderStyle: "none"
      },
      " .pe-dialog-pane__header--title + .pe-dialog-pane__body": {
        paddingTop: 0
      },
      " .pe-dialog-pane__footer": {
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        justifyContent: "center",
        "&, > .pe-toolbar": {
          borderBottomLeftRadius: "inherit",
          borderBottomRightRadius: "inherit"
        },
        ".pe-dialog-pane__footer--high": {
          // when buttons are stacked vertically
          paddingBottom: "8px"
        },
        ".pe-dialog-pane__footer--buttons": {
          padding: "0 8px",
          fontSize: 0 // remove inline block spacing

        }
      },
      " .pe-dialog-pane__actions": [_polytheneCoreCss.flex.layoutHorizontal, _polytheneCoreCss.flex.layoutEndJustified, _polytheneCoreCss.flex.layoutWrap, {
        alignItems: "center"
      }]
    }]), {
      " .pe-dialog__content.pe-menu__content": _defineProperty({}, " ".concat(selector), {
        " .pe-dialog-pane__body": {
          padding: 0,
          border: "none"
        }
      })
    }];
  },
  max_width: function max_width(selector, vars) {
    return [vars.side_padding_mobile !== undefined && max_width_side_padding_mobile(selector, vars)];
  },
  side_padding_mobile: function side_padding_mobile(selector, vars) {
    return [vars.side_padding_mobile !== undefined && max_width_side_padding_mobile(selector, vars)];
  },
  min_width: function min_width(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      minWidth: vars.min_width + "px"
    })];
  },
  margin_vertical: function margin_vertical(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      maxHeight: "calc(100vh - 2 * ".concat(vars.margin_vertical, "px)")
    }), vars.header_height !== undefined && vars.footer_height !== undefined && header_height_footer_height_margin_vertical(selector, vars)];
  },
  line_height_title: function line_height_title(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-dialog-pane__title": {
        lineHeight: vars.line_height_title + "px"
      }
    })];
  },
  header_height: function header_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-dialog-pane__header": {
        height: vars.header_height + "px"
      }
    }), vars.footer_height !== undefined && vars.margin_vertical !== undefined && header_height_footer_height_margin_vertical(selector, vars)];
  },
  footer_height: function footer_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-dialog-pane__footer--buttons .pe-dialog-pane__actions": {
        minHeight: vars.footer_height + "px"
      }
    }), vars.header_height !== undefined && vars.footer_height !== undefined && vars.margin_vertical !== undefined && header_height_footer_height_margin_vertical(selector, vars)];
  },
  padding: function padding(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-dialog-pane__body": {
        padding: vars.padding + "px"
      },
      ".pe-dialog-pane--footer": {
        " .pe-dialog-pane__body": {
          paddingBottom: vars.padding - 10 + "px"
        }
      }
    }), vars.header_bottom !== undefined && padding_header_bottom(selector, vars)];
  },
  header_bottom: function header_bottom(selector, vars) {
    return [padding_header_bottom(selector, vars)];
  },
  border_width: function border_width(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-dialog-pane__body": {
        borderWidth: vars.border_width + "px"
      }
    })];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

/**
 * @type {DialogPaneVars} dialogPaneVars
 */

exports.layout = layout;
var dialogPaneVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  border_width: 1,
  footer_height: 52,
  header_bottom: 20,
  header_height: 64,
  line_height_title: 24,
  max_width: 7 * _polytheneTheme.vars.grid_unit_menu,
  // 7 * 56 = 392 
  min_width: 5 * _polytheneTheme.vars.grid_unit_menu,
  // 5 * 56 = 280
  padding: 3 * _polytheneTheme.vars.grid_unit_component,
  // 3 * 8 = 24
  side_padding_mobile: 6 * _polytheneTheme.vars.grid_unit,
  // 6 * 4 = 48
  max_height: 8 * _polytheneTheme.vars.grid_unit_component,
  margin_vertical: 8 * _polytheneTheme.vars.grid_unit_component,
  color_light_title_text: "inherit",
  color_light_body_text: "inherit",
  color_light_body_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_border_light),
  color_light_background: "inherit",
  color_dark_title_text: "inherit",
  color_dark_body_text: "inherit",
  color_dark_body_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_border_light),
  color_dark_background: "inherit"
}; // @ts-check

exports.vars = dialogPaneVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, dialogPaneVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, dialogPaneVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: dialogPaneVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-dialog/dist/polythene-css-dialog.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneCssDialogPane = require("polythene-css-dialog-pane");

var _polytheneCssShadow = require("polythene-css-shadow");

var _polytheneTheme = require("polythene-theme");

var listTileClasses = {
  component: "pe-list-tile",
  // elements
  content: "pe-list-tile__content",
  highSubtitle: "pe-list-tile__high-subtitle",
  primary: "pe-list-tile__primary",
  secondary: "pe-list-tile__secondary",
  subtitle: "pe-list-tile__subtitle",
  title: "pe-list-tile__title",
  contentFront: "pe-list-tile__content-front",
  // states  
  compact: "pe-list-tile--compact",
  compactFront: "pe-list-tile--compact-front",
  disabled: "pe-list-tile--disabled",
  hasFront: "pe-list-tile--front",
  hasHighSubtitle: "pe-list-tile--high-subtitle",
  hasSubtitle: "pe-list-tile--subtitle",
  header: "pe-list-tile--header",
  hoverable: "pe-list-tile--hoverable",
  insetH: "pe-list-tile--inset-h",
  insetV: "pe-list-tile--inset-v",
  selectable: "pe-list-tile--selectable",
  selected: "pe-list-tile--selected",
  rounded: "pe-list-tile--rounded",
  highlight: "pe-list-tile--highlight",
  sticky: "pe-list-tile--sticky",
  navigation: "pe-list-tile--navigation"
};
var menuClasses = {
  component: "pe-menu",
  // elements
  panel: "pe-menu__panel",
  content: "pe-menu__content",
  placeholder: "pe-menu__placeholder",
  backdrop: "pe-menu__backdrop",
  // states
  floating: "pe-menu--floating",
  origin: "pe-menu--origin",
  permanent: "pe-menu--permanent",
  showBackdrop: "pe-menu--backdrop",
  visible: "pe-menu--visible",
  width_auto: "pe-menu--width-auto",
  width_n: "pe-menu--width-",
  isTopMenu: "pe-menu--top-menu",
  // lookup
  listTile: listTileClasses.component,
  selectedListTile: listTileClasses.selected
};
var classes = {
  component: "pe-dialog",
  // elements
  placeholder: "pe-dialog__placeholder",
  holder: "pe-dialog__holder",
  content: "pe-dialog__content",
  backdrop: "pe-dialog__backdrop",
  touch: "pe-dialog__touch",
  // states
  fullScreen: "pe-dialog--full-screen",
  modal: "pe-dialog--modal",
  open: "pe-dialog--open",
  // class set to html element
  visible: "pe-dialog--visible",
  // class set to dialog element
  showBackdrop: "pe-dialog--backdrop",
  transition: "pe-dialog--transition",
  // lookup
  menuContent: menuClasses.content
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [];
  } // eslint-disable-line no-unused-vars

};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-dialog__content": {
        backgroundColor: vars["color_" + tint + "_background"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-dialog__content": {
        color: vars["color_" + tint + "_text"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_backdrop_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-dialog__backdrop": {
        backgroundColor: vars["color_" + tint + "_backdrop_background"]
      }
    })];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
});
exports.color = color;
var behaviorVars = {
  full_screen: false,
  modal: false
};

var themeVars = _extends({}, {
  backdrop: false,
  z_index: _polytheneTheme.vars.z_dialog
}, behaviorVars, _polytheneCssShadow.sharedVars);
/**
 * @type {DialogVars} dialogVars
 */


var dialogVars = _objectSpread2({
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  animation_delay: "0s",
  animation_duration: ".220s",
  animation_hide_css: "opacity: 0;",
  animation_show_css: "opacity: 1;",
  animation_timing_function: "ease-in-out",
  border_radius: _polytheneTheme.vars.unit_block_border_radius,
  position: "fixed",
  // color vars
  color_light_backdrop_background: "rgba(0, 0, 0, .4)",
  color_dark_backdrop_background: "rgba(0, 0, 0, .5)",
  color_light_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_background),
  color_dark_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_background),
  color_light_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_regular),
  color_dark_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_regular)
}, themeVars);

exports.vars = dialogVars;
var minWidth = "320px";
/**
 * @param {string} selector 
 * @param {object} vars 
 */

var _backdrop = function backdrop(selector, vars) {
  return (// eslint-disable-line no-unused-vars
    (0, _polytheneCoreCss.sel)(selector, {
      ".pe-dialog--visible .pe-dialog__backdrop": {
        display: "block",
        opacity: 1
      }
    })
  );
};

var fullScreen = function fullScreen(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, [(0, _polytheneCoreCss.createMarker)(vars, behaviorVars), {
    padding: 0,
    " .pe-dialog__content": {
      width: "100%" // for IE 11

    }
  }, (0, _polytheneCssDialogPane.fullScreen)(selector, vars)]);
};

var _modal = function modal(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, [(0, _polytheneCoreCss.createMarker)(vars, behaviorVars)]);
};

var varFns = _objectSpread2({
  /**
   * @param {string} selector
   * @param {object} vars 
   */
  general_styles: function general_styles(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, [_polytheneCoreCss.flex.layoutCenterCenter, {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: vars.z_index,
      height: "100%",
      // 100vh would make the dialog go beneath Mobile Safari toolbar        
      transitionProperty: "opacity,background-color,transform",
      ".pe-dialog--full-screen": fullScreen(selector, vars),
      ".pe-dialog--modal": _modal(selector, vars),
      " .pe-dialog__content": {
        position: "relative",
        transitionProperty: "all"
      },
      " .pe-dialog__backdrop": [_polytheneCoreCss.mixin.defaultTransition("all"), // animation duration is set in component options
      {
        position: "absolute",
        opacity: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none"
      }],
      ".pe-dialog--backdrop": _backdrop(selector)
    }]), {
      ".pe-dialog__holder": {
        height: "100%",
        minWidth: minWidth
      }
    }];
  },
  animation_hide_css: function animation_hide_css(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, [vars.animation_hide_css])];
  },
  position: function position(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      position: vars.position
    })];
  },
  animation_delay: function animation_delay(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      "&, .pe-dialog__content": {
        transitionDelay: vars.animation_delay
      }
    })];
  },
  animation_duration: function animation_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      "&, .pe-dialog__content": {
        transitionDuration: vars.animation_duration
      }
    })];
  },
  animation_timing_function: function animation_timing_function(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      "&, .pe-dialog__content": {
        transitionTimingFunction: vars.animation_timing_function
      }
    })];
  },
  animation_show_css: function animation_show_css(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-dialog--visible": vars.animation_show_css
    })];
  },
  border_radius: function border_radius(selector, vars) {
    return [!vars.full_screen && (0, _polytheneCoreCss.sel)(selector, {
      " .pe-dialog__content": {
        borderTopLeftRadius: vars.border_radius + "px",
        borderTopRightRadius: vars.border_radius + "px",
        borderBottomLeftRadius: vars.border_radius + "px",
        borderBottomRightRadius: vars.border_radius + "px"
      }
    })];
  },
  // Theme vars
  backdrop: function backdrop(selector, vars) {
    return vars.backdrop && _backdrop(selector);
  },
  full_screen: function full_screen(selector, vars) {
    return vars.full_screen && fullScreen(selector, vars);
  },
  modal: function modal(selector, vars) {
    return vars.modal && _modal(selector, vars);
  }
}, _polytheneCssShadow.sharedVarFns);

var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

exports.layout = layout;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, dialogVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, dialogVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: dialogVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-css-dialog-pane":"../node_modules/polythene-css-dialog-pane/dist/polythene-css-dialog-pane.mjs","polythene-css-shadow":"../node_modules/polythene-css-shadow/dist/polythene-css-shadow.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-drawer/dist/polythene-css-drawer.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var _polytheneCssShadow = require("polythene-css-shadow");

var listTileClasses = {
  component: "pe-list-tile",
  // elements
  content: "pe-list-tile__content",
  highSubtitle: "pe-list-tile__high-subtitle",
  primary: "pe-list-tile__primary",
  secondary: "pe-list-tile__secondary",
  subtitle: "pe-list-tile__subtitle",
  title: "pe-list-tile__title",
  contentFront: "pe-list-tile__content-front",
  // states  
  compact: "pe-list-tile--compact",
  compactFront: "pe-list-tile--compact-front",
  disabled: "pe-list-tile--disabled",
  hasFront: "pe-list-tile--front",
  hasHighSubtitle: "pe-list-tile--high-subtitle",
  hasSubtitle: "pe-list-tile--subtitle",
  header: "pe-list-tile--header",
  hoverable: "pe-list-tile--hoverable",
  insetH: "pe-list-tile--inset-h",
  insetV: "pe-list-tile--inset-v",
  selectable: "pe-list-tile--selectable",
  selected: "pe-list-tile--selected",
  rounded: "pe-list-tile--rounded",
  highlight: "pe-list-tile--highlight",
  sticky: "pe-list-tile--sticky",
  navigation: "pe-list-tile--navigation"
};
var menuClasses = {
  component: "pe-menu",
  // elements
  panel: "pe-menu__panel",
  content: "pe-menu__content",
  placeholder: "pe-menu__placeholder",
  backdrop: "pe-menu__backdrop",
  // states
  floating: "pe-menu--floating",
  origin: "pe-menu--origin",
  permanent: "pe-menu--permanent",
  showBackdrop: "pe-menu--backdrop",
  visible: "pe-menu--visible",
  width_auto: "pe-menu--width-auto",
  width_n: "pe-menu--width-",
  isTopMenu: "pe-menu--top-menu",
  // lookup
  listTile: listTileClasses.component,
  selectedListTile: listTileClasses.selected
};
var dialogClasses = {
  component: "pe-dialog",
  // elements
  placeholder: "pe-dialog__placeholder",
  holder: "pe-dialog__holder",
  content: "pe-dialog__content",
  backdrop: "pe-dialog__backdrop",
  touch: "pe-dialog__touch",
  // states
  fullScreen: "pe-dialog--full-screen",
  modal: "pe-dialog--modal",
  open: "pe-dialog--open",
  // class set to html element
  visible: "pe-dialog--visible",
  // class set to dialog element
  showBackdrop: "pe-dialog--backdrop",
  transition: "pe-dialog--transition",
  // lookup
  menuContent: menuClasses.content
};
var classes = {
  component: "pe-dialog pe-drawer",
  // states
  cover: "pe-drawer--cover",
  push: "pe-drawer--push",
  mini: "pe-drawer--mini",
  permanent: "pe-drawer--permanent",
  border: "pe-drawer--border",
  floating: "pe-drawer--floating",
  fixed: "pe-drawer--fixed",
  anchorEnd: "pe-drawer--anchor-end",
  visible: dialogClasses.visible
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var generalFns = {
  general_styles: function general_styles() {
    return [{
      " .pe-dialog__content": {
        background: "none"
      }
    }];
  }
};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_border", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-dialog__content": {
        borderColor: vars["color_" + tint + "_border"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-dialog-pane": {
        backgroundColor: vars["color_" + tint + "_background"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_backdrop_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-dialog__backdrop": {
        backgroundColor: vars["color_" + tint + "_backdrop_background"]
      }
    })];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
});
exports.color = color;
var SHADOW_WIDTH = 15;

var _border = function _border(selector, vars, isRTL) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-dialog__content": {
      borderWidth: "".concat(vars.border ? 1 : 0, "px"),
      borderStyle: isRTL ? "none none none solid" : "none solid none none"
    }
  });
};

var _border2 = function border(selector, vars) {
  return [_border(selector, vars, false), _border((0, _polytheneCoreCss.selectorRTL)(selector), vars, true)];
};

var alignSide = function alignSide(isRTL) {
  return function (selector, vars) {
    var _peDrawerFixed;

    return [{
      // Fixed
      ".pe-drawer--fixed": (_peDrawerFixed = {}, _defineProperty(_peDrawerFixed, isRTL ? "right" : "left", 0), _defineProperty(_peDrawerFixed, isRTL ? "left" : "right", "auto"), _peDrawerFixed)
    }, _border("".concat(selector, ".pe-drawer--border"), _extends({}, vars, {
      border: true
    }), isRTL)];
  };
};

var alignLeft = alignSide(false);
var alignRight = alignSide(true);

var _backdrop = function backdrop(selector) {
  return (0, _polytheneCoreCss.sel)(selector, {
    ".pe-dialog--visible .pe-dialog__backdrop": {
      opacity: 1
    }
  });
};

var selectorAnchorEnd = function selectorAnchorEnd(selector) {
  return "".concat(selector, ".pe-drawer--anchor-end");
}; // fn: miniSelector contains .pe-drawer--mini


var _content_width_mini_collapsed = function content_width_mini_collapsed(miniSelector, vars) {
  return (0, _polytheneCoreCss.sel)(miniSelector, {
    ":not(.pe-dialog--visible) .pe-dialog__content": {
      width: "".concat(vars.content_width_mini_collapsed, "px")
    }
  });
}; // fn: coverSelector contains .pe-drawer--cover


var _cover_content_max_width = function _cover_content_max_width(coverSelector, vars, isRTL) {
  var _peDialog__content, _peDialogVisible;

  return (0, _polytheneCoreCss.sel)(coverSelector, {
    " .pe-dialog__content": (_peDialog__content = {
      maxWidth: "".concat(vars.content_max_width, "px")
    }, _defineProperty(_peDialog__content, isRTL ? "right" : "left", "".concat(-vars.content_max_width - SHADOW_WIDTH, "px")), _defineProperty(_peDialog__content, isRTL ? "left" : "right", "auto"), _peDialog__content),
    ".pe-dialog--visible .pe-dialog__content": (_peDialogVisible = {}, _defineProperty(_peDialogVisible, isRTL ? "right" : "left", 0), _defineProperty(_peDialogVisible, isRTL ? "left" : "right", "auto"), _peDialogVisible)
  });
};

var cover_content_max_width = function cover_content_max_width(coverSelector, vars) {
  return [_cover_content_max_width(coverSelector, vars, false), _cover_content_max_width((0, _polytheneCoreCss.selectorRTL)(coverSelector), vars, true), _cover_content_max_width(selectorAnchorEnd(coverSelector), vars, true), _cover_content_max_width(selectorAnchorEnd((0, _polytheneCoreCss.selectorRTL)(coverSelector)), vars, false)];
}; // fn: selector contains .pe-drawer--permanent


var _content_width = function content_width(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-dialog__content": {
      width: "".concat(vars.content_width, "px")
    }
  });
}; // fn: pushSelector contains .pe-drawer--push


var _push_content_width = function _push_content_width(pushSelector, vars, isRTL) {
  var _peDialog__content2, _peDialogVisible2;

  return (0, _polytheneCoreCss.sel)(pushSelector, {
    " .pe-dialog__content": (_peDialog__content2 = {}, _defineProperty(_peDialog__content2, isRTL ? "marginRight" : "marginLeft", "".concat(-vars.content_width - SHADOW_WIDTH, "px")), _defineProperty(_peDialog__content2, isRTL ? "marginLeft" : "marginRight", "auto"), _peDialog__content2),
    ".pe-dialog--visible .pe-dialog__content": (_peDialogVisible2 = {
      width: "".concat(vars.content_width, "px")
    }, _defineProperty(_peDialogVisible2, isRTL ? "marginRight" : "marginLeft", 0), _defineProperty(_peDialogVisible2, isRTL ? "marginLeft" : "marginRight", "auto"), _peDialogVisible2)
  });
};

var push_content_width = function push_content_width(pushSelector, vars) {
  return [_push_content_width(pushSelector, vars, false), _push_content_width((0, _polytheneCoreCss.selectorRTL)(pushSelector), vars, true), _push_content_width(selectorAnchorEnd(pushSelector), vars, true), _push_content_width(selectorAnchorEnd((0, _polytheneCoreCss.selectorRTL)(pushSelector)), vars, false)];
};

var _cover = function cover(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-dialog__content": {
      position: "absolute",
      top: 0,
      zIndex: vars.z_index
    },
    ".pe-dialog--visible": {
      " .pe-dialog__touch": {
        display: "block"
      }
    }
  });
};
/**
 * @param {string} miniSelector 
 * @param {object} [vars] 
 */


var _mini = function mini(miniSelector, vars) {
  return (// eslint-disable-line no-unused-vars
    (0, _polytheneCoreCss.sel)(miniSelector, {
      " .pe-dialog__content": {
        marginLeft: 0,
        marginRight: 0
      }
    })
  );
};
/**
 * @param {string} permanentSelector 
 * @param {object} [vars] 
 */


var _permanent = function permanent(permanentSelector, vars) {
  return (// eslint-disable-line no-unused-vars
    (0, _polytheneCoreCss.sel)(permanentSelector, {
      position: "static",
      display: "block",
      padding: 0,
      overflow: "initial",
      " .pe-dialog__content": {
        overflow: "visible",
        maxHeight: "initial",
        marginLeft: 0,
        marginRight: 0
      }
    })
  );
};
/**
 * @param {string} pushSelector 
 * @param {object} [vars] 
 */
// fn: pushSelector contains .pe-drawer--push


var _push = function push(pushSelector, vars) {
  return (// eslint-disable-line no-unused-vars
    (0, _polytheneCoreCss.sel)(pushSelector, {
      position: "static"
    })
  );
};
/**
 * @param {string} selector 
 * @param {object} [vars] 
 */


var borderRadius = function borderRadius(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-dialog__content": {
      borderRadius: vars.border_radius + "px"
    }
  });
};
/**
 * @param {string} selector 
 * @param {object} [vars] 
 */


var _floating = function floating(selector, vars) {
  return (// eslint-disable-line no-unused-vars
    (0, _polytheneCoreCss.sel)(selector, {
      height: "auto",
      " .pe-dialog__content": {
        height: "auto"
      }
    })
  );
};

var varFns = _objectSpread2({
  /**
   * @param {string} selector 
   * @param {object} [vars] 
   */
  general_styles: function general_styles(selector, vars$1) {
    return [(0, _polytheneCoreCss.sel)(selector, [alignLeft(selector, vars$1), {
      justifyContent: "flex-start",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      height: "100%",
      minWidth: 0,
      // IE 11 does not accept "none" or "inital" here
      padding: 0,
      opacity: 1,
      flexShrink: 0,
      transitionProperty: "all",
      ":not(.pe-dialog--transition)": {
        " .pe-dialog__content": {
          transitionDuration: "0s"
        }
      },
      " .pe-dialog__content": {
        position: "relative",
        // transitionProperty: "all",
        height: "100%",
        overflow: "visible",
        minWidth: 0,
        // IE 11 does not accept "none" or "inital" here
        flexShrink: 0
      },
      " .pe-dialog-pane__content": {
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden"
      },
      " .pe-dialog-pane": {
        height: "100%",
        maxHeight: "none",
        minWidth: 0 // IE 11 does not accept "none" or "inital" here

      },
      " .pe-dialog-pane__body": {
        overflow: "visible",
        maxHeight: "none",
        border: "none"
      },
      // Fixed
      ".pe-drawer--fixed": {
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: _polytheneTheme.vars.z_drawer
      },
      // Mini
      ".pe-drawer--mini": _mini(selector),
      // Permanent
      ".pe-drawer--permanent": _permanent(selector),
      // Floating
      ".pe-drawer--floating": _floating(selector),
      // Cover (default)
      ".pe-drawer--cover": _cover(selector, vars$1),
      // Push
      ".pe-drawer--push": _push(selector),
      // Backdrop
      " .pe-dialog__backdrop": {
        pointerEvents: "none",
        opacity: 0,
        display: "block"
      },
      " .pe-dialog__touch": {
        display: "none",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      },
      ".pe-dialog--backdrop": _backdrop(selector)
    }]), [(0, _polytheneCoreCss.sel)((0, _polytheneCoreCss.selectorRTL)(selector), alignRight(selector, vars$1))]];
  },
  animation_delay: function animation_delay(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      "&, .pe-dialog__content, .pe-dialog__backdrop": {
        transitionDelay: vars.animation_delay
      }
    })];
  },
  animation_duration: function animation_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      "&, .pe-dialog__content, .pe-dialog__backdrop": {
        transitionDuration: vars.animation_duration
      }
    })];
  },
  animation_timing_function: function animation_timing_function(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      "&, .pe-dialog__content, .pe-dialog__backdrop": {
        transitionTimingFunction: vars.animation_timing_function
      }
    })];
  },
  border_radius: function border_radius(selector, vars) {
    return [borderRadius(selector, vars)];
  },
  content_max_width: function content_max_width(selector, vars) {
    return [cover_content_max_width("".concat(selector, ".pe-drawer--cover"), vars)];
  },
  content_width: function content_width(selector, vars) {
    return [_content_width(selector, vars), _content_width("".concat(selector, ".pe-dialog--visible"), vars), _content_width("".concat(selector, ".pe-drawer--permanent"), vars), push_content_width("".concat(selector, ".pe-drawer--push"), vars)];
  },
  content_width_mini_collapsed: function content_width_mini_collapsed(selector, vars) {
    return [_content_width_mini_collapsed("".concat(selector, ".pe-drawer--mini"), vars)];
  },
  // Theme vars
  cover: function cover(selector, vars) {
    return vars.cover && [_cover(selector, vars), cover_content_max_width(selector, vars)];
  },
  backdrop: function backdrop(selector, vars) {
    return [vars.backdrop && _backdrop(selector)];
  },
  border: function border(selector, vars) {
    return [_border2(selector, vars)];
  },
  mini: function mini(selector, vars) {
    return vars.mini && [_mini(selector), _content_width_mini_collapsed(selector, vars)];
  },
  permanent: function permanent(selector, vars) {
    return [vars.permanent && _permanent(selector)];
  },
  floating: function floating(selector, vars) {
    return [vars.floating && _floating(selector)];
  },
  push: function push(selector, vars) {
    return vars.push && [_push(selector), push_content_width(selector, vars)];
  }
}, _polytheneCssShadow.sharedVarFns);

var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
});
exports.layout = layout;

var themeVars = _objectSpread2({
  backdrop: false,
  border: undefined,
  // set to `true` or `false`
  cover: false,
  floating: false,
  mini: false,
  permanent: false,
  push: false,
  z_index: _polytheneTheme.vars.z_drawer
}, _polytheneCssShadow.sharedVars);
/**
 * @type {DrawerVars} drawerVars
 */


var drawerVars = _objectSpread2({
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  animation_delay: "0s",
  animation_duration: ".260s",
  animation_timing_function: "ease-in-out",
  border_radius: 0,
  content_max_width: 5 * _polytheneTheme.vars.increment,
  // 5 * 56
  content_width: 240,
  content_width_mini_collapsed: _polytheneTheme.vars.increment,
  // 1 * 56
  // color vars
  color_light_backdrop_background: "rgba(0, 0, 0, .4)",
  color_dark_backdrop_background: "rgba(0, 0, 0, .5)",
  color_light_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_background),
  color_dark_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_background),
  color_light_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_border_light),
  color_dark_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_border_light)
}, themeVars); // @ts-check


exports.vars = drawerVars;
var fns = [layout, color];
var selector = ".".concat(classes.component.replace(/ /g, "."));

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, drawerVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, drawerVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: drawerVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs","polythene-css-shadow":"../node_modules/polythene-css-shadow/dist/polythene-css-shadow.mjs"}],"../node_modules/polythene-css-fab/dist/polythene-css-fab.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-fab",
  // elements
  content: "pe-fab__content",
  // states
  mini: "pe-fab--mini"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [];
  }
};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint, function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__content": {
        color: vars["color_" + tint]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__content": {
        backgroundColor: vars["color_" + tint + "_background"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_wash_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__wash-color": {
        backgroundColor: vars["color_" + tint + "_wash_background"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_wash_opacity", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__wash-color": {
        opacity: vars["color_" + tint + "_wash_opacity"]
      }
    })];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
}); // @ts-check

exports.color = color;
var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      userSelect: "none",
      "-moz-user-select": "none",
      display: "inline-block",
      position: "relative",
      outline: "none",
      cursor: "pointer",
      padding: 0,
      border: "none",
      " .pe-button__content": {
        position: "relative",
        borderRadius: "50%"
      },
      " .pe-fab__content": {
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center"
      },
      " .pe-ripple": {
        borderRadius: "inherit"
      },
      " .pe-button__wash": [_polytheneCoreCss.mixin.fit(), {
        borderRadius: "inherit",
        transition: "background-color " + _polytheneTheme.vars.animation_duration + " ease-in-out",
        pointerEvents: "none",
        backgroundColor: "transparent"
      }]
    })];
  },
  size_regular: function size_regular(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__content": {
        width: vars.size_regular + "px",
        height: vars.size_regular + "px"
      }
    })];
  },
  size_mini: function size_mini(selector, vars$1) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-fab--mini": {
        " .pe-button__content": {
          width: vars$1.size_mini + "px",
          height: vars$1.size_mini + "px",
          padding: (vars$1.size_mini - _polytheneTheme.vars.unit_icon_size) / 2 + "px"
        }
      }
    })];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

/**
 * @type {DrawerVars} drawerVars
 */

exports.layout = layout;
var drawerVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  size_mini: 5 * _polytheneTheme.vars.grid_unit_component,
  // 5 * 8 = 40
  size_regular: 7 * _polytheneTheme.vars.grid_unit_component,
  // 7 * 8 = 56
  color_light: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary_foreground),
  color_light_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_light_wash_background: "currentColor",
  color_light_wash_opacity: 0.1,
  color_dark: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary_foreground),
  color_dark_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_dark_wash_background: "currentColor",
  color_dark_wash_opacity: 0.1
}; // @ts-check

exports.vars = drawerVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, drawerVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, drawerVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: drawerVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-icon/dist/polythene-css-icon.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-icon",
  // states
  avatar: "pe-icon--avatar",
  large: "pe-icon--large",
  medium: "pe-icon--medium",
  regular: "pe-icon--regular",
  small: "pe-icon--small"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      color: "currentColor"
    })];
  }
};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint, function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      color: vars["color_" + tint]
    })];
  }), _defineProperty(_ref, "color_" + tint + "_avatar_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-icon--avatar": {
        backgroundColor: vars["color_" + tint + "_avatar_background"]
      }
    })];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
});
exports.color = color;

var sizeDirective = function sizeDirective(size) {
  return function (selector, vars) {
    return (0, _polytheneCoreCss.sel)(selector, _defineProperty({}, ".pe-icon--".concat(size), {
      width: vars["size_".concat(size)] + "px",
      height: vars["size_".concat(size)] + "px"
    }));
  };
};

var varFns = _extends({}, {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      display: "inline-block",
      verticalAlign: "middle",
      backgroundRepeat: "no-repeat",
      position: "relative",
      fontSize: 0,
      lineHeight: 0,
      ".pe-icon--avatar": {
        borderRadius: "50%"
      },
      ".pe-icon--avatar img": {
        border: "none",
        borderRadius: "50%",
        width: "inherit",
        height: "inherit"
      },
      " img": {
        height: "inherit"
      },
      " .pe-svg, .pe-svg > div": {
        /* React creates an additional div when wrapping an SVG */
        width: "inherit",
        height: "inherit"
      }
    })];
  }
}, ["small", "regular", "medium", "large"].reduce(function (acc, size) {
  return acc["size_".concat(size)] = sizeDirective(size), acc;
}, {}));

var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

/**
 * @type {IconVars} iconVars
 */

exports.layout = layout;
var iconVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  size_small: _polytheneTheme.vars.unit_icon_size_small,
  // 16 
  size_regular: _polytheneTheme.vars.unit_icon_size,
  // 24
  size_medium: _polytheneTheme.vars.unit_icon_size_medium,
  // 32
  size_large: _polytheneTheme.vars.unit_icon_size_large,
  // 40
  // avatar background is visible when image is not yet loaded
  color_light_avatar_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_background_disabled),
  color_dark_avatar_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_background_disabled),
  color_light: "currentcolor",
  color_dark: "currentcolor"
}; // @ts-check

exports.vars = iconVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, iconVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, iconVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: iconVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-icon-button/dist/polythene-css-icon-button.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-button pe-icon-button",
  // elements
  content: "pe-icon-button__content",
  label: "pe-icon-button__label",
  // states
  compact: "pe-icon-button--compact"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [];
  }
};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint, function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      "&, .pe-icon-button__label": {
        color: vars["color_" + tint]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-icon-button__content": {
        backgroundColor: vars["color_" + tint + "_background"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_disabled", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-button--disabled": {
        " .pe-button__content, .pe-icon-button__label": {
          color: vars["color_" + tint + "_disabled"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_wash_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__wash-color": {
        backgroundColor: vars["color_" + tint + "_wash_background"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_wash_opacity", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__wash-color": {
        opacity: vars["color_" + tint + "_wash_opacity"]
      }
    })];
  }), _ref;
};

var hoverTintFns = function hoverTintFns(tint) {
  var _ref2;

  return _ref2 = {}, _defineProperty(_ref2, "color_" + tint + "_hover", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-icon-button__content": {
        color: vars["color_" + tint + "_hover"]
      }
    })];
  }), _defineProperty(_ref2, "color_" + tint + "_label_hover", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-icon-button__label": {
        color: vars["color_" + tint + "_label_hover"]
      }
    })];
  }), _defineProperty(_ref2, "color_" + tint + "_background_hover", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-icon-button__content": {
        backgroundColor: vars["color_" + tint + "_background_hover"]
      }
    })];
  }), _ref2;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var lightTintHoverFns = hoverTintFns("light");
var darkTintHoverFns = hoverTintFns("dark");
var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns,
    lightTintHoverFns: lightTintHoverFns,
    darkTintHoverFns: darkTintHoverFns
  }
});
exports.color = color;

var alignSide = function alignSide(isRTL) {
  return function (vars) {
    return {};
  };
}; // eslint-disable-line no-unused-vars


var alignLeft = alignSide();
var alignRight = alignSide();

var _label_padding_before = function label_padding_before(selector, vars, isRTL) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-icon-button__label": _defineProperty({}, isRTL ? "paddingRight" : "paddingLeft", vars.label_padding_before + "px")
  });
};

var _label_padding_after = function label_padding_after(selector, vars, isRTL) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-icon-button__label": _defineProperty({}, isRTL ? "paddingLeft" : "paddingRight", vars.label_padding_after + "px")
  });
};

var varFns = {
  general_styles: function general_styles(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, [alignLeft(vars), {
      // don't set button size to facilitate different icon sizes
      display: "inline-flex",
      alignItems: "center",
      cursor: "pointer",
      border: "none",
      " .pe-button__content": {
        display: "flex",
        alignItems: "center",
        fontSize: "1rem",
        borderRadius: "50%",
        position: "relative"
      },
      " .pe-icon-button__content": {
        lineHeight: 1,
        borderRadius: "50%",
        pointerEvents: "none"
      },
      // TODO: move wash styles to base button
      " .pe-button__wash": [_polytheneCoreCss.mixin.fit(), {
        zIndex: 0,
        borderRadius: "inherit",
        pointerEvents: "none",
        opacity: 0
      }],
      // Always show wash on focus but not on click
      "&:focus:not(:active)": {
        " .pe-button__wash": {
          opacity: 1
        }
      },
      // Only show wash on hover when "has hover" class set
      ".pe-button--has-hover:hover": {
        " .pe-button__wash": {
          opacity: 1
        }
      }
    }, _defineProperty({}, "*[dir=rtl] ".concat(selector, ", .pe-rtl ").concat(selector), [alignRight(vars)])])];
  },
  padding: function padding(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-icon-button__content": {
        padding: vars.padding + "px"
      }
    })];
  },
  padding_compact: function padding_compact(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-icon-button--compact": {
        " .pe-icon-button__content": {
          padding: vars.padding_compact + "px"
        }
      }
    })];
  },
  animation_duration: function animation_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__content, .pe-button__wash": [_polytheneCoreCss.mixin.defaultTransition("all", vars.animation_duration)]
    })];
  },
  label_font_size: function label_font_size(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-icon-button__label": {
        fontSize: vars.label_font_size + "px"
      }
    })];
  },
  label_line_height: function label_line_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-icon-button__label": {
        lineHeight: vars.label_line_height + "px"
      }
    })];
  },
  label_font_weight: function label_font_weight(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-icon-button__label": {
        fontWeight: vars.label_font_weight
      }
    })];
  },
  label_text_transform: function label_text_transform(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-icon-button__label": {
        textTransform: vars.label_text_transform
      }
    })];
  },
  label_padding_after: function label_padding_after(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), _label_padding_after(selector, vars, false), _label_padding_after((0, _polytheneCoreCss.selectorRTL)(selector), vars, true)];
  },
  label_padding_before: function label_padding_before(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), _label_padding_before(selector, vars, false), _label_padding_before((0, _polytheneCoreCss.selectorRTL)(selector), vars, true)];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

/**
 * @type {IconButtonVars} iconButtonVars
 */

exports.layout = layout;
var iconButtonVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  animation_duration: _polytheneTheme.vars.animation_duration,
  label_font_size: 16,
  label_font_weight: 400,
  label_line_height: 20,
  label_padding_after: 0,
  label_padding_before: _polytheneTheme.vars.grid_unit * 1,
  // 4
  label_text_transform: "initial",
  label_top_margin_factor: 1 / 12,
  // align with icon
  padding: (_polytheneTheme.vars.grid_unit_icon_button - _polytheneTheme.vars.unit_icon_size) / 2,
  // 12
  padding_compact: (_polytheneTheme.vars.grid_unit_icon_button - _polytheneTheme.vars.unit_icon_size) / 3,
  // 8
  color_background: "transparent",
  // only specify this variable to get all 2 states
  // theme specific background colors may be set in theme; disabled by default
  // color_light_background:    "none",
  // color_dark_background:     "none",
  // color_light_hover:         "inherit",
  // color_dark_hover:          "inherit",
  // color_light_label_hover:   "inherit",
  // color_dark_label_hover:    "inherit",
  color_light: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_secondary),
  color_light_label: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_secondary),
  color_light_disabled: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_disabled),
  color_light_wash_background: "currentColor",
  color_light_wash_opacity: 0.1,
  color_dark: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_secondary),
  color_dark_label: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_secondary),
  color_dark_disabled: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_disabled),
  color_dark_wash_background: "currentColor",
  color_dark_wash_opacity: 0.1 // hover colors may be set in theme; disabled by default
  // color_light_background_hover:         "currentColor",
  // color_dark_background_hover:          "currentColor",

}; // @ts-check

exports.vars = iconButtonVars;
var fns = [layout, color];
var selector = ".".concat(classes.component.replace(/ /g, "."));

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, iconButtonVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, iconButtonVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: iconButtonVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-ios-spinner/dist/polythene-css-ios-spinner.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCssBaseSpinner = require("polythene-css-base-spinner");

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneCore = require("polythene-core");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-ios-spinner",
  // elements
  blades: "pe-ios-spinner__blades",
  blade: "pe-ios-spinner__blade"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-ios-spinner__blade": {
        background: "currentcolor"
      }
    })];
  }
};

var tintFns = function tintFns(tint) {
  return _defineProperty({}, "color_" + tint, function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      color: vars["color_" + tint]
    })];
  });
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  },
  superColor: _polytheneCssBaseSpinner.color
});
exports.color = color;
var bladeWidth = 9; // percent

var bladeHeight = 28; // percent

var kfFade = function kfFade() {
  return {
    " 0%": {
      opacity: .640
    },
    " 100%": {
      opacity: .035
    }
  };
};

var positionBlades = function positionBlades(vars) {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (i) {
    // reverse to improve performance on iOS
    var delay = -1 / 12 * i * (0, _polytheneCore.styleDurationToMs)(vars.rotation_animation_duration);
    var rotation = 360 - 360 / 12 * i;
    return _defineProperty({}, " .pe-ios-spinner__blade:nth-of-type(" + (i + 1) + ")", {
      transform: "rotate(" + rotation + "deg) translate3d(0,-140%,0)",
      animation: "iosSpinnerFade " + vars.rotation_animation_duration + " " + delay + "ms linear infinite"
    });
  });
};

var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-ios-spinner__blades": {
        transform: "translate3d(0,0,0)",
        position: "relative",
        width: "100%",
        height: "100%"
      },
      " .pe-ios-spinner__blade": {
        position: "absolute",
        width: bladeWidth + "%",
        height: bladeHeight + "%",
        left: (100 - bladeWidth) / 2 + "%",
        top: (100 - bladeHeight) / 2 + "%",
        opacity: 0,
        borderRadius: "50px"
      },
      "@keyframes iosSpinnerFade": kfFade()
    })];
  },
  rotation_animation_duration: function rotation_animation_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-ios-spinner__blades": [positionBlades(vars)]
    })];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns,
  superLayout: _polytheneCssBaseSpinner.layout
}); // @ts-check

/**
 * @type {IOSSpinnerVars} iOSSpinnerVars
 */

exports.layout = layout;
var iOSSpinnerVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  rotation_animation_duration: "1s",
  color_light: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground),
  color_dark: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground)
}; // @ts-check

exports.vars = iOSSpinnerVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, iOSSpinnerVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, iOSSpinnerVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: iOSSpinnerVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-css-base-spinner":"../node_modules/polythene-css-base-spinner/dist/polythene-css-base-spinner.mjs","polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-core":"../node_modules/polythene-core/dist/polythene-core.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-list/dist/polythene-css-list.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var listTileClasses = {
  component: "pe-list-tile",
  // elements
  content: "pe-list-tile__content",
  highSubtitle: "pe-list-tile__high-subtitle",
  primary: "pe-list-tile__primary",
  secondary: "pe-list-tile__secondary",
  subtitle: "pe-list-tile__subtitle",
  title: "pe-list-tile__title",
  contentFront: "pe-list-tile__content-front",
  // states  
  compact: "pe-list-tile--compact",
  compactFront: "pe-list-tile--compact-front",
  disabled: "pe-list-tile--disabled",
  hasFront: "pe-list-tile--front",
  hasHighSubtitle: "pe-list-tile--high-subtitle",
  hasSubtitle: "pe-list-tile--subtitle",
  header: "pe-list-tile--header",
  hoverable: "pe-list-tile--hoverable",
  insetH: "pe-list-tile--inset-h",
  insetV: "pe-list-tile--inset-v",
  selectable: "pe-list-tile--selectable",
  selected: "pe-list-tile--selected",
  rounded: "pe-list-tile--rounded",
  highlight: "pe-list-tile--highlight",
  sticky: "pe-list-tile--sticky",
  navigation: "pe-list-tile--navigation"
};
var classes = {
  component: "pe-list",
  // states
  border: "pe-list--border",
  compact: "pe-list--compact",
  hasHeader: "pe-list--header",
  indentedBorder: "pe-list--indented-border",
  padding: "pe-list--padding",
  paddingTop: "pe-list--padding-top",
  paddingBottom: "pe-list--padding-bottom",
  // lookup
  header: listTileClasses.header
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles() {
    return [];
  }
};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      backgroundColor: vars["color_" + tint + "_background"]
    })];
  }), _defineProperty(_ref, "color_" + tint + "_border", function (selector, vars) {
    var _sel;

    return [(0, _polytheneCoreCss.sel)(selector, (_sel = {}, _defineProperty(_sel, "& + .pe-list", {
      borderTopColor: vars["color_" + tint + "_border"]
    }), _defineProperty(_sel, ".pe-list--border", {
      " .pe-list-tile": {
        ":not(:last-child)": {
          borderColor: vars["color_" + tint + "_border"]
        }
      }
    }), _defineProperty(_sel, ".pe-list--indented-border", {
      " .pe-list-tile": {
        " .pe-list-tile__content:not(.pe-list-tile__content-front)": {
          borderColor: vars["color_" + tint + "_border"]
        }
      }
    }), _sel))];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
}); // @ts-check

exports.color = color;

var borderStyle = function borderStyle(vars) {
  return {
    borderStyle: "none none solid none",
    borderWidth: vars.border_width_bordered + "px"
  };
};

var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      flexGrow: 1,
      ".pe-list--header": {
        paddingTop: 0
      },
      ".pe-list--indented-border": {
        borderTop: "none"
      }
    })];
  },
  padding: function padding(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list--padding": {
        padding: vars.padding + "px 0"
      },
      ".pe-list--padding-top": {
        paddingTop: vars.padding + "px"
      },
      ".pe-list--padding-bottom": {
        paddingBottom: vars.padding + "px"
      }
    })];
  },
  padding_compact: function padding_compact(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list--compact": {
        padding: vars.padding_compact + "px 0"
      }
    })];
  },
  border_width_stacked: function border_width_stacked(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      "& + &": {
        borderStyle: "solid none none none",
        borderWidth: vars.border_width_stacked + "px"
      }
    })];
  },
  border_width_bordered: function border_width_bordered(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list--border": {
        " .pe-list-tile": {
          ":not(.pe-list-tile--header):not(:last-child)": {
            "&": borderStyle(vars)
          }
        }
      },
      ".pe-list--indented-border": {
        " .pe-list-tile": {
          ":not(.pe-list-tile--header):not(:last-child)": {
            " .pe-list-tile__content:not(.pe-list-tile__content-front)": borderStyle(vars)
          }
        }
      }
    })];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

/**
 * @type {ListVars} listVars
 */

exports.layout = layout;
var listVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  border_width_bordered: 1,
  border_width_stacked: 1,
  padding: _polytheneTheme.vars.grid_unit_component,
  // vertical padding
  padding_compact: _polytheneTheme.vars.grid_unit_component * 3 / 4,
  color_light_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_border_light),
  color_dark_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_border_light) // background color may be set in theme; disabled by default
  // color_light_background: "inherit",
  // color_dark_background:  "inherit"

}; // @ts-check

exports.vars = listVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, listVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, listVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: listVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-list-tile/dist/polythene-css-list-tile.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-list-tile",
  // elements
  content: "pe-list-tile__content",
  highSubtitle: "pe-list-tile__high-subtitle",
  primary: "pe-list-tile__primary",
  secondary: "pe-list-tile__secondary",
  subtitle: "pe-list-tile__subtitle",
  title: "pe-list-tile__title",
  contentFront: "pe-list-tile__content-front",
  // states  
  compact: "pe-list-tile--compact",
  compactFront: "pe-list-tile--compact-front",
  disabled: "pe-list-tile--disabled",
  hasFront: "pe-list-tile--front",
  hasHighSubtitle: "pe-list-tile--high-subtitle",
  hasSubtitle: "pe-list-tile--subtitle",
  header: "pe-list-tile--header",
  hoverable: "pe-list-tile--hoverable",
  insetH: "pe-list-tile--inset-h",
  insetV: "pe-list-tile--inset-v",
  selectable: "pe-list-tile--selectable",
  selected: "pe-list-tile--selected",
  rounded: "pe-list-tile--rounded",
  highlight: "pe-list-tile--highlight",
  sticky: "pe-list-tile--sticky",
  navigation: "pe-list-tile--navigation"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var _selected = function selected(selector, vars, tint) {
  var selectedTextColor = vars["color_" + tint + "_selected_text"];
  return (0, _polytheneCoreCss.sel)(selector, _objectSpread2({}, selectedTextColor !== "inherit" ? {
    "&, .pe-list-tile__title, .pe-list-tile__content, .pe-list-tile__subtitle": {
      color: selectedTextColor
    }
  } : undefined, {
    " .pe-list-tile__primary, pe-list-tile__secondary": {
      backgroundColor: vars["color_" + tint + "_selected_background"]
    }
  }));
};

var generalFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--header": {
        " .pe-list-tile__primary, pe-list-tile__secondary": {
          backgroundColor: "inherit"
        }
      },
      ":not(.pe-list-tile--disabled):not(.pe-list-tile--selected)": {
        " a.pe-list-tile__primary:focus, a.pe-list-tile__secondary:focus": {
          outline: "none",
          backgroundColor: "inherit"
        }
      },
      "&.pe-list-tile--sticky": {
        backgroundColor: "inherit"
      }
    })];
  }
};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_title", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      color: vars["color_" + tint + "_title"]
    })];
  }), _defineProperty(_ref, "color_" + tint + "_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      backgroundColor: vars["color_" + tint + "_background"],
      "&.pe-list-tile--sticky": {
        backgroundColor: vars["color_" + tint + "_background"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_list_header", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--header": {
        color: vars["color_" + tint + "_list_header"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_subtitle", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-list-tile__subtitle": {
        color: vars["color_" + tint + "_subtitle"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_secondary", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-list-tile__secondary": {
        color: vars["color_" + tint + "_secondary"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_front", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-list-tile__content-front": {
        color: vars["color_" + tint + "_front"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_text_disabled", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--disabled": {
        "&, .pe-list-tile__title, .pe-list-tile__content, .pe-list-tile__subtitle": {
          color: vars["color_" + tint + "_text_disabled"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_highlight_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--highlight:not(.pe-list-tile--selected)": {
        " .pe-list-tile__primary, pe-list-tile__secondary": {
          backgroundColor: vars["color_" + tint + "_highlight_background"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_focus_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-list-tile--disabled):not(.pe-list-tile--selected)": {
        " a.pe-list-tile__primary:focus, a.pe-list-tile__secondary:focus": {
          backgroundColor: vars["color_" + tint + "_focus_background"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_selected_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--selected": _selected(selector, vars, tint)
    })];
  }), _defineProperty(_ref, "color_" + tint + "_selected_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--selected": _selected(selector, vars, tint)
    })];
  }), _ref;
};

var hoverTintFns = function hoverTintFns(tint) {
  var _ref2;

  return _ref2 = {}, _defineProperty(_ref2, "color_" + tint + "_hover", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--hoverable:not(.pe-list-tile--selected)": {
        color: vars["color_" + tint + "_hover"]
      }
    })];
  }), _defineProperty(_ref2, "color_" + tint + "_hover_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--hoverable:not(.pe-list-tile--selected)": {
        " .pe-list-tile__primary, .pe-list-tile__secondary": {
          backgroundColor: vars["color_" + tint + "_hover_background"]
        }
      }
    })];
  }), _defineProperty(_ref2, "color_" + tint + "_hover_front", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--hoverable:not(.pe-list-tile--selected)": {
        " .pe-list-tile__primary .pe-list-tile__content-front": {
          color: vars["color_" + tint + "_hover_front"]
        }
      }
    })];
  }), _ref2;
};

var themeFns = function themeFns(tint) {
  return {
    selected: function selected(selector, vars) {
      return vars.selected && _selected(selector, vars, tint);
    }
  };
};

var lightTintFns = _extends({}, generalFns, tintFns("light"), themeFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"), themeFns("dark"));

var lightTintHoverFns = hoverTintFns("light");
var darkTintHoverFns = hoverTintFns("dark");
var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns,
    lightTintHoverFns: lightTintHoverFns,
    darkTintHoverFns: darkTintHoverFns
  }
});
exports.color = color;

var alignSide = function alignSide(isRTL) {
  return function (vars) {
    return {
      // eslint-disable-line no-unused-vars
      " .pe-list-tile__content-front + .pe-list-tile__content": _defineProperty({}, isRTL ? "paddingRight" : "paddingLeft", 0)
    };
  };
}; // eslint-disable-line no-unused-vars


var alignLeft = alignSide(false);
var alignRight = alignSide(true);
/**
 * @param {number} left
 * @param {number} [right]
 */

var paddingH = function paddingH(left) {
  var right = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : left;
  return {
    "padding-left": left + "px",
    "padding-right": right + "px"
  };
};
/**
 * @param {number} top 
 * @param {number} [bottom] 
 */


var paddingV = function paddingV(top) {
  var bottom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : top;
  return {
    "padding-top": top + "px",
    "padding-bottom": bottom + "px"
  };
};
/**
 * @param {string} selector 
 * @param {ListTileVars} vars 
 */


var title_line_count_single_line_height = function title_line_count_single_line_height(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    lineHeight: vars.single_line_height + "px",
    ".pe-list-tile--navigation": {
      " .pe-list-tile__title": {
        minHeight: vars.single_line_height + "px"
      }
    },
    " .pe-list-tile__title": [_polytheneCoreCss.mixin.ellipsis(vars.title_line_count, vars.single_line_height, "px")]
  });
};
/**
 * @param {string} selector 
 * @param {ListTileVars} vars 
 */


var unSelectable = function unSelectable(selector, vars) {
  return (// eslint-disable-line no-unused-vars 
    (0, _polytheneCoreCss.sel)(selector, {
      "&, a": {
        pointerEvents: "none"
      }
    })
  );
};
/**
 * @param {string} selector 
 * @param {ListTileVars} vars 
 */


var _inset = function inset(selector, vars) {
  return insetH(selector, vars), insetV(selector, vars);
};
/**
 * @param {string} selector 
 * @param {ListTileVars} vars 
 */


var insetH = function insetH(selector, vars) {
  var margin = vars.inset_h_size;
  return (0, _polytheneCoreCss.sel)(selector, {
    marginLeft: margin + "px",
    marginRight: margin + "px",
    " .pe-list-tile__content": {
      marginLeft: -margin + "px",
      marginRight: -margin + "px"
    }
  });
};
/**
 * @param {string} selector 
 * @param {ListTileVars} vars 
 */


var insetV = function insetV(selector, vars) {
  var margin = vars.inset_v_size;
  return (0, _polytheneCoreCss.sel)(selector, {
    marginTop: margin + "px",
    marginBottom: margin + "px"
  });
};
/**
 * @param {string} selector 
 * @param {ListTileVars} vars 
 */


var _rounded = function rounded(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    "&, .pe-list-tile__primary": {
      borderRadius: vars.rounded_border_radius + "px"
    }
  });
};

var varFns = {
  /**
   * @param {string} selector 
   * @param {ListTileVars} vars 
   */
  general_styles: function general_styles(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, [alignLeft(vars), _polytheneCoreCss.flex.layout, {
      position: "relative",
      ".pe-list-tile--navigation": {
        " .pe-list-tile__title": {
          whiteSpace: "pre-wrap"
        }
      },
      ".pe-list-tile--sticky": _polytheneCoreCss.mixin.sticky(2),
      ".pe-list-tile--inset-h": insetH(selector, vars),
      ".pe-list-tile--inset-v": insetV(selector, vars),
      " .pe-list-tile__primary": {
        width: "100%"
      },
      " .pe-list-tile__primary, .pe-list-tile__secondary": [_polytheneCoreCss.flex.layoutHorizontal, _polytheneCoreCss.mixin.defaultTransition("background", ".200s"), {
        textDecoration: "none",
        color: "inherit",
        border: "none"
      }],
      ":not(.pe-list-tile--header) .pe-list-tile__primary": [_polytheneCoreCss.flex.flex(), {
        position: "relative",
        " .pe-list-tile__content:not(.pe-list-tile__content-front)": [_polytheneCoreCss.flex.flex()]
      }],
      ":not(.pe-list-tile--disabled)": {
        outline: "none"
      },
      " .pe-list-tile__secondary": {
        textAlign: "right",
        position: "relative"
      },
      " .pe-list-tile__content": [_polytheneCoreCss.flex.layoutVertical, _polytheneCoreCss.flex.selfCenter, {
        width: "100%",
        ".pe-list-tile__content-front": {
          flexShrink: 0
        }
      }],
      " .pe-list-tile__title": {
        whiteSpace: "normal"
      },
      " .pe-list-tile__subtitle": [_polytheneCoreCss.mixin.ellipsis(vars.subtitle_line_count, vars.line_height_subtitle, "px"), {
        fontSize: vars.font_size_subtitle + "px",
        fontWeight: vars.font_weight_subtitle,
        lineHeight: vars.line_height_subtitle + "px",
        ".pe-list-tile__high-subtitle": [_polytheneCoreCss.mixin.ellipsis(vars.high_subtitle_line_count, vars.line_height_subtitle, "px"), {
          whiteSpace: "normal"
        }]
      }],
      ".pe-list-tile--selected, &.pe-list-tile--disabled": unSelectable(selector),
      ".pe-list-tile--subtitle": {
        " .pe-list-tile__content": {
          " .pe-list-tile__title": {
            padding: 0
          }
        }
      },
      ".pe-list-tile--high-subtitle": {
        " .pe-list-tile--high-subtitle .pe-list-tile__secondary": [_polytheneCoreCss.flex.layoutHorizontal, _polytheneCoreCss.flex.layoutStart],
        " .pe-list-tile__content": [_polytheneCoreCss.flex.selfStart, {
          " .pe-list-tile__title": {
            padding: 0
          }
        }]
      },
      // List header
      ".pe-list-tile--header": {
        pointerEvents: "none",
        " .pe-list-tile__content": {
          paddingTop: 0,
          paddingBottom: 0
        },
        " .pe-list-tile__title": {
          padding: 0
        }
      },
      // Firefox only
      "@supports (-moz-appearance:none) and (display:contents)": {
        " .pe-list-tile__primary, .pe-list-tile__content": {
          overflow: "hidden"
        }
      },
      // Menu
      ".pe-dialog .pe-menu__content &": {
        " .pe-list-tile__content": {
          paddingLeft: "24px",
          paddingRight: "24px"
        },
        " .pe-list-tile__content-front": {
          paddingRight: 0,
          width: "64px",
          marginRight: "-7px"
        },
        " .pe-list-tile__title": _polytheneCoreCss.mixin.ellipsis("none")
      },
      ".pe-menu__content &": {
        ":not(.pe-list-tile--disabled)": {
          cursor: "default",
          "&, .pe-list-tile__primary, .pe-list-tile__secondary": {
            " .pe-list-tile__title, .pe-list-tile__subtitle": {
              userSelect: "none",
              "-moz-user-select": "none"
            }
          }
        }
      },
      // Non-touch
      "html.pe-no-touch &.pe-list-tile--hoverable, \
        html.pe-no-touch &.pe-list-tile--selectable": {
        ":not(.pe-list-tile--header):not(.pe-list-tile--disabled):not(.pe-list-tile--selected):hover": {
          cursor: "pointer"
        }
      }
    }]), _defineProperty({}, (0, _polytheneCoreCss.selectorRTL)(selector), alignRight(vars))];
  },
  title_line_count: function title_line_count(selector, vars) {
    return [title_line_count_single_line_height(selector, vars)];
  },
  single_line_height: function single_line_height(selector, vars) {
    return [title_line_count_single_line_height(selector, vars)];
  },
  font_size_title: function font_size_title(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      fontSize: vars.font_size_title + "px",
      " .pe-list-tile__secondary": {
        fontSize: vars.font_size_title + "px"
      }
    })];
  },
  font_weight_title: function font_weight_title(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      fontWeight: vars.font_weight_title
    })];
  },
  font_size_navigation_title: function font_size_navigation_title(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--navigation": {
        fontSize: vars.font_size_navigation_title + "px"
      }
    })];
  },
  font_weight_navigation_title: function font_weight_navigation_title(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--navigation": {
        fontWeight: vars.font_weight_navigation_title
      }
    })];
  },
  padding: function padding(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-list-tile--header)": {
        " .pe-list-tile__content:not(.pe-list-tile__content-front)": [paddingV(vars.padding, vars.padding + 1)]
      },
      " .pe-list-tile__content": {
        ".pe-list-tile__content-front": [paddingV(vars.padding - 5)]
      }
    })];
  },
  side_padding: function side_padding(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-list-tile__content": [paddingH(vars.side_padding)]
    })];
  },
  inset_size: function inset_size(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--inset": _inset(selector, vars)
    })];
  },
  rounded_border_radius: function rounded_border_radius(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--rounded": _rounded(selector, vars)
    })];
  },
  compact_front_item_width: function compact_front_item_width(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-list-tile__content-front": {
        ".pe-list-tile--compact-front": {
          width: vars.compact_front_item_width + "px"
        }
      }
    })];
  },
  front_item_width: function front_item_width(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-list-tile__content-front": {
        ":not(.pe-list-tile--compact-front)": {
          width: vars.front_item_width + "px"
        }
      }
    })];
  },
  font_size_small: function font_size_small(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-list-tile__content": {
        " small": {
          fontSize: vars.font_size_small + "px"
        }
      }
    })];
  },
  has_high_subtitle_padding: function has_high_subtitle_padding(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--high-subtitle": {
        " .pe-list-tile__content": [paddingV(vars.has_high_subtitle_padding, vars.has_high_subtitle_padding + 1)]
      }
    })];
  },
  has_subtitle_padding: function has_subtitle_padding(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--subtitle": {
        " .pe-list-tile__content": [paddingV(vars.has_subtitle_padding, vars.has_subtitle_padding + 1)]
      }
    })];
  },
  single_height: function single_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--header": {
        height: vars.single_height + "px",
        " .pe-list-tile__title": [_polytheneCoreCss.mixin.ellipsis(1, vars.single_height, "px"), {
          lineHeight: vars.single_height + "px",
          padding: 0
        }]
      }
    })];
  },
  font_size_list_header: function font_size_list_header(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--header": {
        " .pe-list-tile__title": {
          fontSize: vars.font_size_list_header + "px"
        }
      }
    })];
  },
  font_weight_list_header: function font_weight_list_header(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-list-tile--header": {
        " .pe-list-tile__title": {
          fontWeight: vars.font_weight_list_header
        }
      }
    })];
  },
  compact_padding: function compact_padding(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-list--compact &, &.pe-list-tile--compact": {
        ":not(.pe-list-tile--header)": {
          " .pe-list-tile__content:not(.pe-list-tile__content-front)": paddingV(vars.compact_padding, vars.compact_padding + 1)
        }
      }
    })];
  },
  // Theme vars
  inset: function inset(selector, vars) {
    return vars.inset && _inset(selector, vars);
  },
  inset_h: function inset_h(selector, vars) {
    return vars.inset_h && insetH(selector, vars);
  },
  inset_v: function inset_v(selector, vars) {
    return vars.inset_h && insetV(selector, vars);
  },
  rounded: function rounded(selector, vars) {
    return vars.rounded && _rounded(selector, vars);
  },
  selected: function selected(selector, vars) {
    return vars.selected && unSelectable(selector);
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); //
// heights:
// single line: 48
// single line, dense: 40
// single line, with icon: 48
// single line, with icon, dense: 40
// single line, with avatar: 56
// single line, with avatar, dense: 48
// two-line: 72
// two-line, dense: 60
// three-line: 88
// three-line, dense: 76

exports.layout = layout;
var single_height = 48;
var padding = 8;
var single_with_icon_height = 56;
var themeVars = {
  inset: false,
  inset_h: false,
  inset_v: false,
  selected: false,
  rounded: false
};
/**
 * @type {ListTileVars} listTileVars
 */

var listTileVars = _objectSpread2({
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  compact_front_item_width: 64,
  compact_padding: 9,
  compact_side_padding: 1 * _polytheneTheme.vars.grid_unit_component,
  font_size_list_header: 14,
  font_size_navigation_title: 14,
  font_size_small: 12,
  font_size_subtitle: 14,
  font_size_title: 16,
  font_weight_list_header: _polytheneTheme.vars.font_weight_medium,
  font_weight_navigation_title: _polytheneTheme.vars.font_weight_medium,
  font_weight_subtitle: _polytheneTheme.vars.font_weight_normal,
  font_weight_title: _polytheneTheme.vars.font_weight_normal,
  front_item_width: 72,
  has_high_subtitle_padding: 13,
  has_subtitle_padding: 15,
  high_subtitle_line_count: 2,
  inset_h_size: 1 * _polytheneTheme.vars.grid_unit_component,
  // 8
  inset_v_size: 1 * _polytheneTheme.vars.grid_unit_component,
  // 8
  line_height_subtitle: 20,
  padding: 13,
  rounded_border_radius: _polytheneTheme.vars.unit_item_border_radius,
  side_padding: 2 * _polytheneTheme.vars.grid_unit_component,
  // 16
  single_height: single_height,
  single_line_height: single_height - 2 * padding - (2 * 5 + 1),
  single_with_icon_height: single_with_icon_height,
  single_with_icon_line_height: single_with_icon_height - 2 * padding - (2 * 5 + 1),
  subtitle_line_count: 1,
  title_line_count: 1,
  color_light_title: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_primary),
  color_light_subtitle: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_secondary),
  color_light_info: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_tertiary),
  color_light_front: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_secondary),
  color_light_text_disabled: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_disabled),
  color_light_list_header: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_tertiary),
  color_light_secondary: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_secondary),
  color_light_hover: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_primary),
  color_light_hover_front: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_primary),
  color_light_hover_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_background_hover),
  color_light_focus_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_background_hover),
  color_light_selected_text: "inherit",
  color_light_selected_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_background_hover),
  color_light_highlight_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_background_hover),
  // background color may be set in theme; disabled by default
  // color_light_background:          "inherit",
  color_dark_title: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_primary),
  color_dark_subtitle: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_secondary),
  color_dark_info: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_tertiary),
  color_dark_front: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_secondary),
  color_dark_text_disabled: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_disabled),
  color_dark_list_header: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_tertiary),
  color_dark_secondary: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_secondary),
  color_dark_hover: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_primary),
  color_dark_hover_front: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_primary),
  color_dark_hover_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_background_hover),
  color_dark_selected_text: "inherit",
  color_dark_selected_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_background_hover),
  color_dark_highlight_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_background_hover)
}, themeVars); // @ts-check


exports.vars = listTileVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, listTileVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, listTileVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: listTileVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-material-design-spinner/dist/polythene-css-material-design-spinner.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCssBaseSpinner = require("polythene-css-base-spinner");

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-md-spinner",
  // elements
  animation: "pe-md-spinner__animation",
  circle: "pe-md-spinner__circle",
  circleClipper: "pe-md-spinner__circle-clipper",
  circleClipperLeft: "pe-md-spinner__circle-clipper-left",
  circleClipperRight: "pe-md-spinner__circle-clipper-right",
  gapPatch: "pe-md-spinner__gap-patch",
  layer: "pe-md-spinner__layer",
  layerN: "pe-md-spinner__layer-"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}
/*
Styling derived from https://github.com/PolymerElements/paper-spinner

@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/


var generalFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-md-spinner__layer": {
        borderColor: "currentcolor"
      }
    })];
  }
};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_single", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      color: vars["color_" + tint + "_single"]
    })];
  }), _defineProperty(_ref, "color_" + tint + "_1", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-spinner--single-color)": {
        " .pe-md-spinner__layer-1": {
          borderColor: vars["color_" + tint + "_1"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_2", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-spinner--single-color)": {
        " .pe-md-spinner__layer-2": {
          borderColor: vars["color_" + tint + "_2"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_3", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-spinner--single-color)": {
        " .pe-md-spinner__layer-3": {
          borderColor: vars["color_" + tint + "_3"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_4", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-spinner--single-color)": {
        " .pe-md-spinner__layer-4": {
          borderColor: vars["color_" + tint + "_4"]
        }
      }
    })];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  },
  superColor: _polytheneCssBaseSpinner.color
});
exports.color = color;
var OPACITY_MIN = 0;
var OPACITY_MAX = .99;
var CURVE_INFINITE = "cubic-bezier(0.4, 0.0, 0.2, 1) infinite both";

var kfRotate = function kfRotate() {
  return {
    " to": {
      transform: "rotate(360deg)"
    }
  };
};

var kfLeftSpin = function kfLeftSpin() {
  return kfSpin(1);
};

var kfRightSpin = function kfRightSpin() {
  return kfSpin(-1);
};

var kfSpin = function kfSpin(direction) {
  return {
    " from": {
      "transform": "rotate(" + direction * 130 + "deg)"
    },
    " 50%": {
      "transform": "rotate(" + direction * -5 + "deg)"
    },
    " to": {
      "transform": "rotate(" + direction * 130 + "deg)"
    }
  };
};

var kfFadeOut = function kfFadeOut() {
  return {
    " from": {
      opacity: OPACITY_MAX
    },
    " to": {
      opacity: OPACITY_MIN
    }
  };
};

var kfFillUnfillRotate = function kfFillUnfillRotate(arcSize) {
  return {
    " 12.5%": {
      transform: "rotate(" + 0.5 * arcSize + "deg)"
    },
    " 25%": {
      transform: "rotate(" + 1.0 * arcSize + "deg)"
    },
    " 37.5%": {
      transform: "rotate(" + 1.5 * arcSize + "deg)"
    },
    " 50%": {
      transform: "rotate(" + 2.0 * arcSize + "deg)"
    },
    " 62.5%": {
      transform: "rotate(" + 2.5 * arcSize + "deg)"
    },
    " 75%": {
      transform: "rotate(" + 3.0 * arcSize + "deg)"
    },
    " 87.5%": {
      transform: "rotate(" + 3.5 * arcSize + "deg)"
    },
    " to": {
      transform: "rotate(" + 4.0 * arcSize + "deg)"
    }
  };
};
/**
 * HACK: Even though the intention is to have the current .pe-md-spinner__layer at
 * `opacity: 1`, we set it to `opacity: 0.99` instead since this forces Chrome
 * to do proper subpixel rendering for the elements being animated. This is
 * especially visible in Chrome 39 on Ubuntu 14.04. See:
 *
 * - https://github.com/Polymer/paper-spinner/issues/9
 * - https://code.google.com/p/chromium/issues/detail?id=436255
 */


var kfLayer1FadeInOut = function kfLayer1FadeInOut() {
  return {
    " from": {
      opacity: OPACITY_MAX
    },
    " 25%": {
      opacity: OPACITY_MAX
    },
    " 26%": {
      opacity: OPACITY_MIN
    },
    " 89%": {
      opacity: OPACITY_MIN
    },
    " 90%": {
      opacity: OPACITY_MAX
    },
    " 100%": {
      opacity: OPACITY_MAX
    }
  };
};

var kfLayer2FadeInOut = function kfLayer2FadeInOut() {
  return {
    " from": {
      opacity: OPACITY_MIN
    },
    " 15%": {
      opacity: OPACITY_MIN
    },
    " 25%": {
      opacity: OPACITY_MAX
    },
    " 50%": {
      opacity: OPACITY_MAX
    },
    " 51%": {
      opacity: OPACITY_MIN
    }
  };
};

var kfLayer3FadeInOut = function kfLayer3FadeInOut() {
  return {
    " from": {
      opacity: OPACITY_MIN
    },
    " 40%": {
      opacity: OPACITY_MIN
    },
    " 50%": {
      opacity: OPACITY_MAX
    },
    " 75%": {
      opacity: OPACITY_MAX
    },
    " 76%": {
      opacity: OPACITY_MIN
    }
  };
};

var kfLayer4FadeInOut = function kfLayer4FadeInOut() {
  return {
    " from": {
      opacity: OPACITY_MIN
    },
    " 65%": {
      opacity: OPACITY_MIN
    },
    " 75%": {
      opacity: OPACITY_MAX
    },
    " 90%": {
      opacity: OPACITY_MAX
    },
    " 100%": {
      opacity: OPACITY_MIN
    }
  };
};

var layerAnimation = function layerAnimation(vars, num) {
  return _defineProperty({}, ".pe-md-spinner__layer-" + num, {
    animation: "mdSpinnerFillUnfillRotate " + 4 * vars.arc_time + "s " + CURVE_INFINITE + ",  mdSpinnerLayer" + num + "FadeInOut " + 4 * vars.arc_time + "s " + CURVE_INFINITE
  });
};

var varFns = {
  general_styles: function general_styles(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      "@keyframes mdSpinnerRotate": kfRotate(),
      "@keyframes mdSpinnerRightSpin": kfRightSpin(),
      "@keyframes mdSpinnerLeftSpin": kfLeftSpin(),
      "@keyframes mdSpinnerFadeOut": kfFadeOut(),
      "@keyframes mdSpinnerLayer1FadeInOut": kfLayer1FadeInOut(),
      "@keyframes mdSpinnerLayer2FadeInOut": kfLayer2FadeInOut(),
      "@keyframes mdSpinnerLayer3FadeInOut": kfLayer3FadeInOut(),
      "@keyframes mdSpinnerLayer4FadeInOut": kfLayer4FadeInOut(),
      " .pe-md-spinner__animation": {
        position: "relative",
        width: "100%",
        height: "100%",

        /* The spinner does not have any contents that would have to be
        * flipped if the direction changes. Always use ltr so that the
        * style works out correctly in both cases. */
        direction: "ltr"
      },

      /**
      * Patch the gap that appear between the two adjacent div.pe-md-spinner__circle-clipper while the
      * spinner is rotating (appears on Chrome 38, Safari 7.1, and IE 11).
      *
      * Update: the gap no longer appears on Chrome when .pe-md-spinner__layer"s opacity is 0.99,
      * but still does on Safari and IE.
      */
      " .pe-md-spinner__gap-patch": {
        position: "absolute",
        boxSizing: "border-box",
        top: 0,
        left: "45%",
        width: "10%",
        height: "100%",
        overflow: "hidden",
        borderColor: "inherit"
      },
      " .pe-md-spinner__gap-patch .pe-md-spinner__circle": {
        width: "1000%",
        left: "-450%"
      },
      " .pe-md-spinner__circle-clipper": {
        display: "inline-block",
        fontSize: 0,
        lineHeight: 0,
        position: "relative",
        width: "50%",
        height: "100%",
        overflow: "hidden",
        borderColor: "inherit"
      },
      " .pe-md-spinner__circle-clipper .pe-md-spinner__circle": {
        width: "200%"
      },
      " .pe-md-spinner__circle": [_polytheneCoreCss.mixin.fit(), {
        animation: "none",
        boxSizing: "border-box",
        height: "100%",
        borderStyle: "solid",
        borderColor: "inherit",
        borderRadius: "50%",
        borderBottomColor: "transparent !important"
      }],
      " .pe-md-spinner__circle-clipper-left .pe-md-spinner__circle": {
        transform: "rotate(129deg)",
        borderRightColor: "transparent !important"
      },
      " .pe-md-spinner__circle-clipper-right .pe-md-spinner__circle": {
        transform: "rotate(-129deg)",
        left: "-100%",
        borderLeftColor: "transparent !important"
      },

      /**
      * IMPORTANT NOTE ABOUT CSS ANIMATION PROPERTIES (keanulee):
      *
      * iOS Safari (tested on iOS 8.1) does not handle animation-delay very well - it doesn"t
      * guarantee that the animation will start _exactly_ after that value. So we avoid using
      * animation-delay and instead set custom keyframes for each color (as redundant as it
      * seems).
      *
      * We write out each animation in full (instead of separating animation-name,
      * animation-duration, etc.) because under the polyfill, Safari does not recognize those
      * specific properties properly, treats them as -webkit-animation, and overrides the
      * other animation rules. See https://github.com/Polymer/platform/issues/53.
      */
      " .pe-md-spinner__layer": [[1, 2, 3, 4].map(function (num) {
        return layerAnimation(vars, num);
      }), {
        position: "absolute",
        width: "100%",
        height: "100%",
        whiteSpace: "nowrap"
      }]
    })];
  },
  rotation_duration: function rotation_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-md-spinner__animation": {
        animation: "mdSpinnerRotate " + vars.rotation_duration + "s linear infinite"
      }
    })];
  },
  border_width_small: function border_width_small(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-spinner--small": {
        " .pe-md-spinner__circle": {
          borderWidth: vars.border_width_small + "px"
        }
      }
    })];
  },
  border_width_regular: function border_width_regular(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-spinner--regular": {
        " .pe-md-spinner__circle": {
          borderWidth: vars.border_width_regular + "px"
        }
      }
    })];
  },
  border_width_medium: function border_width_medium(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-spinner--medium": {
        " .pe-md-spinner__circle": {
          borderWidth: vars.border_width_medium + "px"
        }
      }
    })];
  },
  border_width_large: function border_width_large(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-spinner--large": {
        " .pe-md-spinner__circle": {
          borderWidth: vars.border_width_large + "px"
        }
      }
    })];
  },
  border_width_fab: function border_width_fab(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-spinner--fab": {
        " .pe-md-spinner__circle": {
          borderWidth: vars.border_width_fab + "px"
        }
      }
    })];
  },
  arc_size: function arc_size(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      "@keyframes mdSpinnerFillUnfillRotate": kfFillUnfillRotate(vars.arc_size)
    })];
  },
  arc_time: function arc_time(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-md-spinner__circle-clipper-left .pe-md-spinner__circle": {
        animation: "mdSpinnerLeftSpin " + vars.arc_time + "s " + CURVE_INFINITE
      },
      " .pe-md-spinner__circle-clipper-right .pe-md-spinner__circle": {
        animation: "mdSpinnerRightSpin " + vars.arc_time + "s " + CURVE_INFINITE
      },
      " .pe-md-spinner__layer": {
        animation: "mdSpinnerFillUnfillRotate " + 4 * vars.arc_time + "s " + CURVE_INFINITE
      }
    })];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns,
  superLayout: _polytheneCssBaseSpinner.layout
}); // @ts-check

exports.layout = layout;
var arc_size = 270; // degrees - amount of circle the arc takes up

var arc_time = 1.333; // s - time it takes to expand and contract arc

var arc_start_degrees = 360 / 5 * 3; // degrees - how much the start location of the arc should rotate each time, 216 gives us a 5 pointed star shape (it"s 360/5 * 3). For a 7 pointed star, we might do 360/7 * 3 = 154.286.

var rotation_duration = 360 * arc_time / (arc_start_degrees + (360 - arc_size)); // 1.568s

var blue400 = "#42a5f5";
var red500 = "#f44336";
var yellow600 = "#fdd835";
var green500 = "#4caf50";
/**
 * @type {MaterialDesignSpinnerVars} materialDesignSpinnerVars
 */

var materialDesignSpinnerVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  arc_size: arc_size,
  arc_start_degrees: arc_start_degrees,
  arc_time: arc_time,
  border_width_fab: _polytheneCssBaseSpinner.vars.size_fab / _polytheneCssBaseSpinner.vars.size_regular * 3,
  border_width_large: _polytheneCssBaseSpinner.vars.size_large / _polytheneCssBaseSpinner.vars.size_regular * 3,
  border_width_medium: _polytheneCssBaseSpinner.vars.size_medium / _polytheneCssBaseSpinner.vars.size_regular * 3,
  border_width_regular: 3,
  border_width_small: _polytheneCssBaseSpinner.vars.size_small / _polytheneCssBaseSpinner.vars.size_regular * 3,
  rotation_duration: rotation_duration,
  color_light_single: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_light_1: blue400,
  color_light_2: red500,
  color_light_3: yellow600,
  color_light_4: green500,
  color_dark_single: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_dark_1: blue400,
  color_dark_2: red500,
  color_dark_3: yellow600,
  color_dark_4: green500
}; // @ts-check

exports.vars = materialDesignSpinnerVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, materialDesignSpinnerVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, materialDesignSpinnerVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: materialDesignSpinnerVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-css-base-spinner":"../node_modules/polythene-css-base-spinner/dist/polythene-css-base-spinner.mjs","polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-material-design-progress-spinner/dist/polythene-css-material-design-progress-spinner.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCssMaterialDesignSpinner = require("polythene-css-material-design-spinner");

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-md-progress-spinner",
  // elements
  animation: "pe-md-progress-spinner__animation",
  circle: "pe-md-progress-spinner__circle",
  circleRight: "pe-md-progress-spinner__circle-right",
  circleLeft: "pe-md-progress-spinner__circle-left"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-md-progress-spinner__circle": {
        borderColor: "currentcolor"
      }
    })];
  }
};

var tintFns = function tintFns(tint) {
  return _defineProperty({}, "color_" + tint, function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      color: vars["color_" + tint]
    })];
  });
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  },
  superColor: _polytheneCssMaterialDesignSpinner.color
}); // @ts-check

exports.color = color;
var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      position: "relative",
      " .pe-md-progress-spinner__animation": {
        position: "absolute",
        width: "100%",
        height: "100%"
      },
      " .pe-md-progress-spinner__circle": {
        position: "absolute",
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
        borderStyle: "solid",
        borderRadius: "50%"
      },
      " .pe-md-progress-spinner__circle-left, .pe-md-progress-spinner__circle-right": {
        transform: "rotate(0)",
        clip: "rect(0, 0, 0, 0)"
      }
    })];
  },
  progress_animation_duration: function progress_animation_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-md-progress-spinner__animation": {
        animationDuration: vars.progress_animation_duration
      }
    })];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns,
  superLayout: _polytheneCssMaterialDesignSpinner.layout
}); // @ts-check

/**
 * @type {MaterialDesignProgressSpinnerVars} materialDesignProgressSpinnerVars
 */

exports.layout = layout;
var materialDesignProgressSpinnerVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  progress_animation_duration: ".8s",
  color_light: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_dark: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary)
}; // @ts-check

exports.vars = materialDesignProgressSpinnerVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, materialDesignProgressSpinnerVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, materialDesignProgressSpinnerVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: materialDesignProgressSpinnerVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-css-material-design-spinner":"../node_modules/polythene-css-material-design-spinner/dist/polythene-css-material-design-spinner.mjs","polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-menu/dist/polythene-css-menu.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var _polytheneCssShadow = require("polythene-css-shadow");

var listTileClasses = {
  component: "pe-list-tile",
  // elements
  content: "pe-list-tile__content",
  highSubtitle: "pe-list-tile__high-subtitle",
  primary: "pe-list-tile__primary",
  secondary: "pe-list-tile__secondary",
  subtitle: "pe-list-tile__subtitle",
  title: "pe-list-tile__title",
  contentFront: "pe-list-tile__content-front",
  // states  
  compact: "pe-list-tile--compact",
  compactFront: "pe-list-tile--compact-front",
  disabled: "pe-list-tile--disabled",
  hasFront: "pe-list-tile--front",
  hasHighSubtitle: "pe-list-tile--high-subtitle",
  hasSubtitle: "pe-list-tile--subtitle",
  header: "pe-list-tile--header",
  hoverable: "pe-list-tile--hoverable",
  insetH: "pe-list-tile--inset-h",
  insetV: "pe-list-tile--inset-v",
  selectable: "pe-list-tile--selectable",
  selected: "pe-list-tile--selected",
  rounded: "pe-list-tile--rounded",
  highlight: "pe-list-tile--highlight",
  sticky: "pe-list-tile--sticky",
  navigation: "pe-list-tile--navigation"
};
var classes = {
  component: "pe-menu",
  // elements
  panel: "pe-menu__panel",
  content: "pe-menu__content",
  placeholder: "pe-menu__placeholder",
  backdrop: "pe-menu__backdrop",
  // states
  floating: "pe-menu--floating",
  origin: "pe-menu--origin",
  permanent: "pe-menu--permanent",
  showBackdrop: "pe-menu--backdrop",
  visible: "pe-menu--visible",
  width_auto: "pe-menu--width-auto",
  width_n: "pe-menu--width-",
  isTopMenu: "pe-menu--top-menu",
  // lookup
  listTile: listTileClasses.component,
  selectedListTile: listTileClasses.selected
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [];
  } // eslint-disable-line no-unused-vars

};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-menu__panel": {
        "background-color": vars["color_" + tint + "_background"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_backdrop_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-menu__backdrop": {
        "background-color": vars["color_" + tint + "_backdrop_background"]
      }
    })];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
});
exports.color = color;
var behaviorVars = {
  top_menu: false // set to true to position the menu at the top of the screen, full width

};

var themeVars = _objectSpread2({
  backdrop: undefined,
  // (Boolean) - if not set, backdrop existence is set by component option
  z: _polytheneTheme.vars.z_menu
}, behaviorVars, {}, _polytheneCssShadow.sharedVars);
/**
 * @type {MenuVars} menuVars
 */


var menuVars = _objectSpread2({
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  animation_delay: "0s",
  animation_duration: ".180s",
  animation_hide_css: "opacity: 0;",
  animation_hide_origin_effect_css: "transform: scale(0.75);",
  // set to "transform: scale(1)" to reset scaling
  animation_show_css: "opacity: 1;",
  animation_show_origin_effect_css: "transform: scale(1);",
  animation_timing_function: "ease-in-out",
  border_radius: _polytheneTheme.vars.unit_block_border_radius,
  height: undefined,
  // (height value with unit) - if not set, height is set by component option
  min_width: 1.5,
  width_factor: _polytheneTheme.vars.grid_unit_menu,
  widths: [1, 1.5, 2, 3, 4, 5, 6, 7],
  // color vars
  color_light_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_background),
  color_dark_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_background),
  color_light_backdrop_background: "rgba(0, 0, 0, .1)",
  color_dark_backdrop_background: "rgba(0, 0, 0, .5)"
}, themeVars);
/**
 * 
 * @param {boolean} isRTL 
 */


exports.vars = menuVars;

var alignSide = function alignSide(isRTL) {
  return function () {
    return {
      textAlign: isRTL ? "right" : "left"
    };
  };
};

var alignLeft = alignSide(false);
var alignRight = alignSide(true);

var unifyWidth = function unifyWidth(vars, width) {
  return width < vars.min_width ? vars.min_width : width;
};

var widthClass = function widthClass(width) {
  var widthStr = width.toString().replace(".", "-");
  return "pe-menu--width-" + widthStr;
};
/**
 * 
 * @param {object} params
 * @param {object} params.vars
 * @param {number} params.width
 * @param {string} [params.value]
 */


var widthStyle = function widthStyle(_ref) {
  var vars = _ref.vars,
      width = _ref.width,
      value = _ref.value;
  var s = unifyWidth(vars, width);
  return _defineProperty({}, "." + widthClass(s), {
    " .pe-menu__panel": {
      width: value || vars.width_factor * s + "px" // We can't set maxWidth because we don't know the width of the container

    }
  });
};

var widths_min_width_width_factor = function widths_min_width_width_factor(selector, vars$1) {
  return (0, _polytheneCoreCss.sel)(selector, [vars$1.widths.map(function (width) {
    return widthStyle({
      vars: vars$1,
      width: width
    });
  }), {
    " .pe-menu__panel": {
      minWidth: _polytheneTheme.vars.grid_unit_menu * vars$1.min_width + "px"
    }
  }]);
};

var _backdrop = function backdrop(selector, vars) {
  return (// eslint-disable-line no-unused-vars
    (0, _polytheneCoreCss.sel)(selector, {
      " .pe-menu__backdrop": {
        display: "block"
      }
    })
  );
};

var _top_menu = function top_menu(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, [vars.widths.map(function (width) {
    return widthStyle({
      vars: vars,
      width: width,
      value: "100vw"
    });
  }), (0, _polytheneCoreCss.createMarker)(vars, behaviorVars), {
    " .pe-menu__panel": {
      position: "fixed",
      width: "100vw",
      top: 0,
      left: 0,
      right: 0,
      bottom: "auto",
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0
    }
  }]);
};

var _z = function z(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    ".pe-menu--floating": {
      " .pe-menu__panel, .pe-menu__backdrop": {
        zIndex: vars.z
      }
    }
  });
};

var varFns = _objectSpread2({
  general_styles: function general_styles(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, [alignLeft(), {
      position: "static",
      ".pe-menu--width-auto": {
        width: "auto"
      },
      ".pe-menu--permanent": {
        " .pe-menu__panel": {
          opacity: 1,
          position: "relative"
        }
      },
      ".pe-menu--floating": {
        " .pe-menu__panel": {
          transitionProperty: "opacity, transform"
        }
      },
      " .pe-menu__panel": {
        transitionProperty: "all",
        opacity: 0,
        position: "absolute"
      },
      " .pe-menu__backdrop": {
        display: "none",
        transitionProperty: "all",
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        opacity: 0
      },
      ".pe-menu--backdrop": _backdrop(selector),
      ".pe-menu--visible .pe-menu__backdrop": {
        opacity: 1
      },
      ".pe-menu--top-menu": _top_menu(selector, vars),
      " .pe-menu__content": {
        overflowX: "auto",
        overflowY: "auto",
        width: "100%",
        height: "100%"
      },
      ".pe-menu--full-height": {
        height: "100%",
        " .pe-menu__panel": {
          height: "100%"
        }
      }
    }]), _defineProperty({}, (0, _polytheneCoreCss.selectorRTL)(selector), alignRight())];
  },
  animation_delay: function animation_delay(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-menu__panel, .pe-menu__backdrop": {
        transitionDelay: vars.animation_delay
      }
    })];
  },
  animation_duration: function animation_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-menu__panel, .pe-menu__backdrop": {
        transitionDuration: vars.animation_duration
      }
    })];
  },
  animation_timing_function: function animation_timing_function(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-menu__panel, .pe-menu__backdrop": {
        transitionTimingFunction: vars.animation_timing_function
      }
    })];
  },
  animation_show_css: function animation_show_css(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-menu--visible": {
        " .pe-menu__panel": vars.animation_show_css
      }
    })];
  },
  animation_hide_css: function animation_hide_css(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-menu__panel": vars.animation_hide_css
    })];
  },
  animation_show_origin_effect_css: function animation_show_origin_effect_css(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-menu--origin.pe-menu--visible": {
        " .pe-menu__panel": vars.animation_show_origin_effect_css
      }
    })];
  },
  animation_hide_origin_effect_css: function animation_hide_origin_effect_css(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-menu--origin:not(.pe-menu--visible)": {
        " .pe-menu__panel": vars.animation_hide_origin_effect_css
      }
    })];
  },
  height: function height(selector, vars) {
    return [vars.height !== undefined && (0, _polytheneCoreCss.sel)(selector, {
      " .pe-menu__panel": {
        height: vars.height
      }
    })];
  },
  widths: function widths(selector, vars) {
    return [widths_min_width_width_factor(selector, vars)];
  },
  min_width: function min_width(selector, vars) {
    return [widths_min_width_width_factor(selector, vars)];
  },
  width_factor: function width_factor(selector, vars) {
    return [widths_min_width_width_factor(selector, vars)];
  },
  border_radius: function border_radius(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-menu__panel": {
        borderRadius: vars.border_radius + "px"
      }
    })];
  },
  // Theme vars
  backdrop: function backdrop(selector, vars) {
    return [vars.backdrop && _backdrop(selector)];
  },
  top_menu: function top_menu(selector, vars) {
    return [vars.top_menu && _top_menu(selector, vars)];
  },
  z: function z(selector, vars) {
    return [vars.z && _z(selector, vars)];
  }
}, _polytheneCssShadow.sharedVarFns);

var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

exports.layout = layout;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, menuVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, menuVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: menuVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs","polythene-css-shadow":"../node_modules/polythene-css-shadow/dist/polythene-css-shadow.mjs"}],"../node_modules/polythene-css-notification/dist/polythene-css-notification.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.holderLayout = exports.getStyle = exports.customLayoutFns = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-notification",
  // elements
  action: "pe-notification__action",
  content: "pe-notification__content",
  holder: "pe-notification__holder",
  placeholder: "pe-notification__placeholder",
  title: "pe-notification__title",
  // states
  hasContainer: "pe-notification--container",
  horizontal: "pe-notification--horizontal",
  multilineTitle: "pe-notification__title--multi-line",
  vertical: "pe-notification--vertical",
  visible: "pe-notification--visible"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [];
  } // eslint-disable-line no-unused-vars

};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-notification__content": {
        color: vars["color_" + tint + "_text"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-notification__content": {
        background: vars["color_" + tint + "_background"]
      }
    })];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
}); // @ts-check

exports.color = color;
var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, [_polytheneCoreCss.flex.layoutCenterCenter, {
      // assumes position relative
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      pointerEvents: "none",
      justifyContent: "flex-start",
      // For IE 11
      ".pe-multiple--screen": {
        position: "fixed",
        zIndex: _polytheneTheme.vars.z_notification
      }
    }]), {
      ":not(.pe-notification--container) .pe-multiple--container": {
        position: "absolute"
      }
    }];
  }
};
var holderLayout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
});
exports.holderLayout = holderLayout;

var title_single_padding_v_title_padding_h = function title_single_padding_v_title_padding_h(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-notification__title": {
      padding: vars.title_single_padding_v + "px " + vars.title_padding_h + "px"
    }
  });
};

var customLayoutFns = {
  animation_hide_css: function animation_hide_css(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, vars.animation_hide_css)];
  },
  animation_show_css: function animation_show_css(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-notification--visible": [vars.animation_show_css]
    })];
  },
  width: function width(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-notification__content": {
        width: vars.width + "px"
      }
    })];
  },
  animation_delay: function animation_delay(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      transitionDelay: vars.animation_delay
    })];
  },
  animation_duration: function animation_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      transitionDuration: vars.animation_duration
    })];
  },
  animation_timing_function: function animation_timing_function(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      transitionTimingFunction: vars.animation_timing_function
    })];
  },
  side_padding: function side_padding(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-notification__content": {
        padding: "0 " + vars.side_padding + "px"
      }
    })];
  },
  border_radius: function border_radius(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-notification__content": {
        borderRadius: vars.border_radius + "px"
      }
    })];
  },
  title_single_padding_v: function title_single_padding_v(selector, vars) {
    return [title_single_padding_v_title_padding_h(selector, vars)];
  },
  title_padding_h: function title_padding_h(selector, vars) {
    return [title_single_padding_v_title_padding_h(selector, vars)];
  },
  font_size: function font_size(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-notification__title": {
        fontSize: vars.font_size + "px"
      }
    })];
  },
  line_height: function line_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-notification__title": {
        lineHeight: vars.line_height + "px"
      }
    })];
  },
  title_multi_padding_v: function title_multi_padding_v(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-notification--horizontal": {
        " .pe-notification__title--multi-line": {
          paddingTop: vars.title_multi_padding_v + "px",
          paddingBottom: vars.title_multi_padding_v + "px"
        }
      },
      ".pe-notification--vertical": {
        " .pe-notification__title--multi-line": {
          paddingTop: vars.title_multi_padding_v + "px"
        }
      }
    })];
  }
};
exports.customLayoutFns = customLayoutFns;

var varFns$1 = _extends({}, {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, [_polytheneCoreCss.flex.layoutCenter, {
      pointerEvents: "all",
      justifyContent: "center",
      margin: "0 auto",
      transitionProperty: "all",
      opacity: 0,
      " .pe-notification__title": {
        flex: "1 0 auto"
      },
      " .pe-notification__action": {
        " .pe-button": {
          margin: 0
        }
      },
      " .pe-notification__content": {
        maxWidth: "100%"
      },
      ".pe-notification--horizontal": {
        " .pe-notification__content": _polytheneCoreCss.flex.layoutHorizontal,
        " .pe-notification__title": [_polytheneCoreCss.flex.flex(), {
          alignSelf: "center"
        }],
        " .pe-notification__action": _polytheneCoreCss.flex.layoutCenter
      },
      ".pe-notification--vertical": {
        " .pe-notification__content": [_polytheneCoreCss.flex.layoutVertical],
        " .pe-notification__title": {
          paddingBottom: "6px"
        },
        " .pe-notification__action": [_polytheneCoreCss.flex.layoutEndJustified, {
          width: "100%"
        }]
      }
    }])];
  }
}, customLayoutFns);

var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns$1
}); // @ts-check

exports.layout = layout;
var buttonPaddingH = 8; // padding, inner text space

/**
 * @type {NotificationVars} notificationVars
 */

var notificationVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  animation_delay: "0s",
  animation_duration: ".3s",
  animation_hide_css: "opacity: 0;",
  animation_show_css: "opacity: 1;",
  animation_timing_function: "ease-in-out",
  border_radius: _polytheneTheme.vars.unit_block_border_radius,
  font_size: 14,
  line_height: 20,
  min_height: 80,
  side_padding: 24 - buttonPaddingH,
  title_multi_padding_v: 20,
  // 24 - natural line height
  title_padding_h: buttonPaddingH,
  title_single_padding_v: 14,
  width: 288,
  color_light_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_background),
  color_light_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_dark_primary),
  color_dark_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_background),
  color_dark_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_light_text_primary)
}; // @ts-check

exports.vars = notificationVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);
var holderFns = [holderLayout];
var holderSelector = ".".concat(classes.holder);

var addStyle = function addStyle(customSelector, customVars) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$mediaQuery = _ref.mediaQuery,
      mediaQuery = _ref$mediaQuery === void 0 ? "" : _ref$mediaQuery,
      _ref$scope = _ref.scope,
      scope = _ref$scope === void 0 ? "" : _ref$scope;

  customSelector && _polytheneCoreCss.styler.addStyle({
    selectors: [customSelector, selector],
    fns: fns,
    vars: notificationVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  });
  customSelector && _polytheneCoreCss.styler.addStyle({
    selectors: [customSelector, holderSelector],
    fns: holderFns,
    vars: notificationVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  });
};

exports.addStyle = addStyle;

var getStyle = function getStyle() {
  var customSelector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var customVars = arguments.length > 1 ? arguments[1] : undefined;

  var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref2$mediaQuery = _ref2.mediaQuery,
      mediaQuery = _ref2$mediaQuery === void 0 ? "" : _ref2$mediaQuery,
      _ref2$scope = _ref2.scope,
      scope = _ref2$scope === void 0 ? "" : _ref2$scope;

  return _polytheneCoreCss.styler.getStyle({
    selectors: [customSelector, selector],
    fns: fns,
    vars: notificationVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  }).concat(_polytheneCoreCss.styler.getStyle({
    selectors: [holderSelector],
    fns: holderFns,
    vars: notificationVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  }));
};

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  _polytheneCoreCss.styler.addStyle({
    selectors: [holderSelector],
    fns: holderFns,
    vars: notificationVars
  });

  _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: notificationVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-radio-button/dist/polythene-css-radio-button.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneCssSelectionControl = require("polythene-css-selection-control");

var classes = {
  component: "pe-radio-control"
}; // @ts-check

var color = (0, _polytheneCoreCss.createColor)({
  superColor: _polytheneCssSelectionControl.color
}); // @ts-check

exports.color = color;
var varFns = {
  general_styles: function general_styles() {
    return {
      " .pe-radio-group": {
        display: "flex"
      }
    };
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns,
  superLayout: _polytheneCssSelectionControl.layout
}); // @ts-check

/**
 * @typedef {import("../index").RadioButtonVars} RadioButtonVars
 */

/**
 * @type {RadioButtonVars} radioButtonVars
 */

exports.layout = layout;
var radioButtonVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true
}; // @ts-check

exports.vars = radioButtonVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, radioButtonVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, radioButtonVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: radioButtonVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-css-selection-control":"../node_modules/polythene-css-selection-control/dist/polythene-css-selection-control.mjs"}],"../node_modules/polythene-css-ripple/dist/polythene-css-ripple.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var classes = {
  component: "pe-ripple",
  // elements
  mask: "pe-ripple__mask",
  waves: "pe-ripple__waves",
  // states
  unconstrained: "pe-ripple--unconstrained",
  wavesAnimating: "pe-ripple__waves--animating"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      color: "inherit"
    })];
  }
};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color", function color(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      color: vars["color"]
    })];
  }), _defineProperty(_ref, "color_" + tint, function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      color: vars["color_" + tint]
    })];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
}); // @ts-check

exports.color = color;
var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, [_polytheneCoreCss.mixin.fit(), {
      color: "inherit",
      borderRadius: "inherit",
      pointerEvents: "none",
      ":not(.pe-ripple--unconstrained)": {
        borderRadius: "inherit",
        " .pe-ripple__mask": {
          overflow: "hidden",
          borderRadius: "inherit"
        }
      },
      " .pe-ripple__mask": [_polytheneCoreCss.mixin.fit(), {
        transform: "translate3d(0,0,0)"
      }],
      " .pe-ripple__waves": {
        outline: "1px solid transparent",
        // for IE10
        position: "absolute",
        borderRadius: "50%",
        pointerEvents: "none",
        display: "none"
      },
      " .pe-ripple__waves--animating": {
        display: "block"
      }
    }])];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

/**
 * @typedef {import("../index").RippleVars} RippleVars
 */

/**
 * @type {RippleVars} rippleVars
 */

exports.layout = layout;
var rippleVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  color: "inherit" // only specify this variable to get both states
  // color_light:   "inherit",
  // color_dark:    "inherit"

}; // @ts-check

exports.vars = rippleVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, rippleVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, rippleVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: rippleVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs"}],"../node_modules/polythene-css-search/dist/polythene-css-search.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-search",
  // elements
  content: "pe-search__content",
  // states
  searchFullWidth: "pe-search--full-width",
  searchInset: "pe-search--inset"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__input-area": {
        backgroundColor: "transparent"
      }
    })];
  }
};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      backgroundColor: vars["color_" + tint + "_background"]
    })];
  }), _defineProperty(_ref, "color_" + tint + "_label_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield": {
        " .pe-textfield__label": {
          color: vars["color_" + tint + "_label_text"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_input_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield": {
        " .pe-textfield__input": {
          color: vars["color_" + tint + "_input_text"]
        }
      }
    })];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
}); // @ts-check

exports.color = color;

var inset_height_line_height_input = function inset_height_line_height_input(selector, vars) {
  var inset_input_padding_v = (vars.inset_height - vars.line_height_input) / 2;
  return (0, _polytheneCoreCss.sel)(selector, {
    ".pe-search--inset": {
      " .pe-textfield__input, .pe-textfield__label": {
        paddingTop: inset_input_padding_v + "px",
        paddingBottom: inset_input_padding_v + "px"
      }
    }
  });
};

var full_width_height_line_height_input = function full_width_height_line_height_input(selector, vars) {
  var full_width_input_padding_v = (vars.full_width_height - vars.line_height_input) / 2;
  return (0, _polytheneCoreCss.sel)(selector, {
    ".pe-search--full-width": {
      " .pe-textfield__input, .pe-textfield__label": {
        paddingTop: full_width_input_padding_v + "px",
        paddingBottom: full_width_input_padding_v + "px"
      }
    }
  });
};

var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, [_polytheneCoreCss.flex.flex(), {
      position: "relative",
      // necessary when a shadow is added
      " .pe-textfield": [_polytheneCoreCss.flex.flex(), {
        alignItems: "center",
        padding: 0,
        // prevent that neighboring icon button with ripple hides the cursor
        position: "relative",
        zIndex: 1,
        " .pe-textfield__input-area": {
          padding: 0,
          ":after": {
            display: "none"
          }
        },
        " .pe-textfield__input": {
          // reset
          border: "none"
        },
        " .pe-textfield__label": {
          // reset
          top: 0,
          bottom: 0
        }
      }],
      " .pe-search__content": {
        "&, .pe-textfield": _polytheneCoreCss.flex.layoutHorizontal,
        "&, .pe-textfield__input-area": {
          flexGrow: 1
        }
      },
      " .pe-search__content > *": [_polytheneCoreCss.flex.layoutVertical, _polytheneCoreCss.flex.selfCenter],
      ".pe-search--inset": {
        "&, .pe-textfield__input-area, .pe-textfield__input, .pe-textfield__label": {
          padding: 0
        }
      }
    }])];
  },
  font_size_input: function font_size_input(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield": {
        " .pe-textfield__input, .pe-textfield__label": {
          fontSize: vars.font_size_input + "px"
        }
      }
    })];
  },
  line_height_input: function line_height_input(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__input, .pe-textfield__label": {
        lineHeight: vars.line_height_input + "px"
      }
    }), inset_height_line_height_input(selector, vars)];
  },
  inset_border_radius: function inset_border_radius(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-search--inset": {
        "border-radius": vars.inset_border_radius + "px"
      }
    })];
  },
  inset_side_padding: function inset_side_padding(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-search--inset": {
        padding: "0 " + vars.inset_side_padding + "px"
      }
    })];
  },
  inset_height: function inset_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-search--inset": {
        "&, .pe-textfield__input-area, .pe-textfield__input, .pe-textfield__label": {
          padding: 0,
          height: vars.inset_height + "px"
        }
      }
    }), inset_height_line_height_input(selector, vars)];
  },
  full_width_height: function full_width_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-search--full-width": {
        "&, .pe-textfield__input-area, .pe-textfield__input, .pe-textfield__label": {
          height: vars.full_width_height + "px"
        }
      }
    }), full_width_height_line_height_input(selector, vars)];
  },
  inset_input_indent: function inset_input_indent(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-search--inset": {
        " .pe-textfield__input, .pe-textfield__label": {
          paddingLeft: vars.inset_input_indent + "px"
        }
      }
    })];
  },
  inset_input_right_padding: function inset_input_right_padding(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-search--inset": {
        " .pe-textfield__input, .pe-textfield__label": {
          paddingRight: vars.inset_input_right_padding + "px"
        }
      }
    })];
  },
  full_width_side_padding: function full_width_side_padding(selector, vars$1) {
    var full_width_input_indent = _polytheneTheme.vars.unit_indent - vars$1.full_width_side_padding - _polytheneTheme.vars.grid_unit_icon_button;
    return (0, _polytheneCoreCss.sel)(selector, {
      ".pe-search--full-width": {
        padding: "0 " + vars$1.full_width_side_padding + "px",
        " .pe-textfield__input, .pe-textfield__label": {
          paddingLeft: full_width_input_indent + "px"
        }
      },
      ".pe-search--full-width + .pe-list .pe-list-tile": {
        "> :first-child": {
          paddingLeft: vars$1.full_width_side_padding + "px"
        },
        "> :last-child": {
          paddingRight: vars$1.full_width_side_padding + "px"
        }
      }
    });
  },
  full_width_border_radius: function full_width_border_radius(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-search--full-width": {
        borderRadius: vars.full_width_border_radius + "px"
      }
    })];
  },
  full_width_input_right_padding: function full_width_input_right_padding(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-search--full-width": {
        " .pe-textfield__input, .pe-textfield__label": {
          paddingRight: vars.full_width_input_right_padding + "px"
        }
      }
    })];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

/**
 * @type {SearchVars} searchVars
 */

exports.layout = layout;
var searchVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  font_size_input: 20,
  full_width_border_radius: 0,
  full_width_height: 56,
  full_width_input_right_padding: 0,
  full_width_side_margin: 0,
  full_width_side_padding: 8,
  inset_border_radius: _polytheneTheme.vars.unit_block_border_radius,
  inset_height: 48,
  inset_input_indent: 16,
  inset_input_right_padding: 0,
  inset_side_padding: 0,
  line_height_input: 20,
  color_light_label_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_disabled),
  color_light_input_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_primary),
  color_light_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_background),
  color_dark_label_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_disabled),
  color_dark_input_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_primary),
  color_dark_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_background)
}; // @ts-check

exports.vars = searchVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, searchVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, searchVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: searchVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-slider/dist/polythene-css-slider.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-slider",
  // elements
  control: "pe-slider__control",
  label: "pe-slider__label",
  pin: "pe-slider__pin",
  thumb: "pe-slider__thumb",
  tick: "pe-slider__tick",
  ticks: "pe-slider__ticks",
  track: "pe-slider__track",
  trackBar: "pe-slider__track-bar",
  trackBarValue: "pe-slider__track-bar-value",
  trackPart: "pe-slider__track-part",
  trackPartRest: "pe-slider__track-rest",
  trackPartValue: "pe-slider__track-value",
  // states
  hasFocus: "pe-slider--focus",
  hasPin: "pe-slider--pin",
  hasTicks: "pe-slider--ticks",
  hasTrack: "pe-slider--track",
  isActive: "pe-slider--active",
  isAtMin: "pe-slider--min",
  isDisabled: "pe-slider--disabled",
  tickValue: "pe-slider__tick--value"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__control": {
        ":after": {
          borderColor: "transparent"
        }
      },
      " .pe-slider__pin": {
        backgroundColor: "currentcolor",
        ":before": {
          backgroundColor: "inherit"
        }
      },
      ":not(.pe-slider--disabled)": {
        " .pe-slider__control": {
          backgroundColor: "currentcolor"
        },
        " .pe-slider__track-value .pe-slider__track-bar-value": {
          background: "currentcolor"
        },
        ".pe-slider--focus:not(.pe-slider--min):not(.pe-slider--pin) .pe-slider__control:before,\
        &:not(.pe-slider--min):not(.pe-slider--pin) .pe-slider__control:focus:before": {
          backgroundColor: "currentcolor"
        }
      },
      ".pe-slider--min:not(.pe-slider--disabled):not(.pe-slider--ticks)": {
        " .pe-slider__control": {
          backgroundColor: "transparent"
        },
        " .pe-slider__thumb": {
          opacity: 0
        },
        ".pe-slider--ticks": {
          " .pe-slider__control:after": {
            borderColor: "transparent"
          }
        }
      }
    })];
  }
};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_icon", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-slider--disabled)": {
        " .pe-icon": {
          color: vars["color_" + tint + "_icon"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_label", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-slider--disabled)": {
        " .pe-slider__label": {
          color: vars["color_" + tint + "_label"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_thumb_on", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      color: vars["color_" + tint + "_thumb_on"] // override by specifying "color"

    })];
  }), _defineProperty(_ref, "color_" + tint + "_track_inactive", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__track-bar-value": {
        background: vars["color_" + tint + "_track_inactive"]
      },
      ".pe-slider--min:not(.pe-slider--disabled):not(.pe-slider--ticks)": {
        " .pe-slider__control:after": {
          borderColor: vars["color_" + tint + "_track_inactive"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_tick", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__tick": {
        background: vars["color_" + tint + "_tick"]
      },
      ".pe-slider--min:not(.pe-slider--disabled)": {
        ".pe-slider--tick": {
          backgroundColor: vars["color_" + tint + "_tick"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_tick_value", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__tick--value": {
        background: vars["color_" + tint + "_tick_value"]
      },
      ".pe-slider--min:not(.pe-slider--disabled)": {
        ".pe-slider--tick--value": {
          backgroundColor: vars["color_" + tint + "_tick_value"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_disabled_icon", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-icon": {
        color: vars["color_" + tint + "_disabled_icon"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_disabled_label", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__label": {
        color: vars["color_" + tint + "_disabled_label"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_track_active", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-slider--active": {
        " .pe-slider__track-bar-value": {
          background: vars["color_" + tint + "_track_active"]
        }
      },
      ".pe-slider--min:not(.pe-slider--disabled)": {
        ".pe-slider--active .pe-slider__control:after": {
          borderColor: vars["color_" + tint + "_track_active"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_thumb_inactive", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-slider--disabled": {
        " .pe-slider__control": {
          background: vars["color_" + tint + "_thumb_inactive"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_thumb_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-slider--disabled)": {
        " .pe-slider__control": {
          backgroundColor: vars["color_" + tint + "_thumb_background"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_thumb_off_focus_opacity", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-slider--disabled)": {
        " .pe-slider__control": {
          ":before": {
            opacity: vars["color_" + tint + "_thumb_off_focus_opacity"]
          }
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_thumb_off_focus", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-slider--disabled)": {
        ".pe-slider--focus.pe-slider--min:not(.pe-slider--pin) .pe-slider__control:before,\
        .pe-slider--min:not(.pe-slider--pin) .pe-slider__control:focus:before": {
          backgroundColor: vars["color_" + tint + "_thumb_off_focus"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_thumb_on_focus_opacity", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-slider--disabled)": {
        ".pe-slider--focus:not(.pe-slider--min):not(.pe-slider--pin) .pe-slider__control:before,\
        &:not(.pe-slider--min):not(.pe-slider--pin) .pe-slider__control:focus:before": {
          opacity: vars["color_" + tint + "_thumb_on_focus_opacity"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_pin_label", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__pin:after": {
        color: vars["color_" + tint + "_pin_label"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_pin_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__pin": {
        backgroundColor: vars["color_" + tint + "_pin_background"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_track_value", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-slider--disabled)": {
        " .pe-slider__track-value .pe-slider__track-bar-value": {
          backgroundColor: vars["color_" + tint + "_track_value"]
        }
      }
    })];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
}); // @ts-check

exports.color = color;

var getThumbSize = function getThumbSize(vars) {
  var thumbSize = Math.max(vars.thumb_size, 2 * vars.thumb_border_width);
  var barOffset = thumbSize / 2;
  var stepsOffset = barOffset - 1;
  return {
    normalThumbSize: thumbSize,
    disabledThumbSize: thumbSize - 2 * vars.thumb_border_width,
    barOffset: barOffset,
    stepsOffset: stepsOffset
  };
};

var getBorderWidth = function getBorderWidth(vars) {
  var borderWidth = vars.thumb_border_width;
  var scaledBorderWidth = Math.max(1, vars.thumb_border_width / vars.active_thumb_scale);
  return {
    normalBorderWidth: borderWidth,
    disabledBorderWidth: 1 / vars.disabled_thumb_scale * vars.thumb_border_width,
    scaledBorderWidth: scaledBorderWidth
  };
};

var thumb_size_thumb_border_width_disabled_thumb_scale = function thumb_size_thumb_border_width_disabled_thumb_scale(selector, vars) {
  var _getThumbSize = getThumbSize(vars),
      normalThumbSize = _getThumbSize.normalThumbSize,
      disabledThumbSize = _getThumbSize.disabledThumbSize;

  var _getBorderWidth = getBorderWidth(vars),
      normalBorderWidth = _getBorderWidth.normalBorderWidth,
      disabledBorderWidth = _getBorderWidth.disabledBorderWidth;

  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-slider__control:after": {
      borderWidth: normalBorderWidth + "px",
      width: normalThumbSize + "px",
      height: normalThumbSize + "px",
      left: 0,
      top: 0
    },
    ".pe-slider--disabled .pe-slider__control:after": {
      borderWidth: disabledBorderWidth + "px",
      width: disabledThumbSize + "px",
      height: disabledThumbSize + "px",
      left: normalThumbSize - disabledThumbSize + "px",
      top: normalThumbSize - disabledThumbSize + "px"
    },
    ".pe-slider--ticks .pe-slider__control:after": {
      borderWidth: 0
    }
  });
};

var height_track_height = function height_track_height(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    marginTop: (vars.height - vars.track_height) / 2 + "px "
  });
};

var track_height_bar_height = function track_height_bar_height(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-slider__track-part": {
      margin: (vars.track_height - vars.bar_height) / 2 + "px 0"
    }
  });
};

var thumb_size_thumb_touch_size = function thumb_size_thumb_touch_size(selector, vars) {
  var _getThumbSize2 = getThumbSize(vars),
      normalThumbSize = _getThumbSize2.normalThumbSize;

  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-slider__control:before": {
      left: -vars.thumb_touch_size / 2 + normalThumbSize / 2 + "px",
      top: -vars.thumb_touch_size / 2 + normalThumbSize / 2 + "px"
    }
  });
};

var thumb_size_active_thumb_scale = function thumb_size_active_thumb_scale(selector, vars) {
  var _getThumbSize3 = getThumbSize(vars),
      normalThumbSize = _getThumbSize3.normalThumbSize;

  var _getBorderWidth2 = getBorderWidth(vars),
      scaledBorderWidth = _getBorderWidth2.scaledBorderWidth;

  var scaledThumbDiff = (vars.active_thumb_scale - 1) * normalThumbSize / 2;
  return (0, _polytheneCoreCss.sel)(selector, {
    ".pe-slider--active:not(.pe-slider--ticks)": {
      " .pe-slider__control": {
        borderWidth: scaledBorderWidth + "px"
      },
      // left side
      " .pe-slider__track-value .pe-slider__track-bar-value": {
        transform: "translateX(" + -scaledThumbDiff + "px)"
      },
      // right side
      " .pe-slider__track-rest .pe-slider__track-bar-value": {
        transform: "translateX(" + scaledThumbDiff + "px)"
      }
    },
    ".pe-slider--active.pe-slider--ticks": {
      " .pe-slider__control:after": {
        borderWidth: 0
      }
    }
  });
};

var thumb_size_pin_width = function thumb_size_pin_width(selector, vars) {
  var _getThumbSize4 = getThumbSize(vars),
      stepsOffset = _getThumbSize4.stepsOffset;

  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-slider__pin": {
      margin: "0 " + stepsOffset + "px 0 " + (stepsOffset - vars.pin_width / 2 + 1) + "px"
    }
  });
};

var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, [_polytheneCoreCss.flex.layoutHorizontal, _polytheneCoreCss.flex.flexGrow(1), {
      userSelect: "none",
      "-moz-user-select": "none",
      alignItems: "center",
      " > .pe-icon": _polytheneCoreCss.flex.layoutCenter,
      " .pe-slider__track": [_polytheneCoreCss.flex.layoutHorizontal, _polytheneCoreCss.flex.flexGrow(1), {
        userSelect: "none",
        "-moz-user-select": "none",
        position: "relative",
        outline: 0
      }],
      " .pe-slider__control": [_polytheneCoreCss.flex.selfCenter, _polytheneCoreCss.mixin.defaultTransition("transform, background", ".200s"), {
        transform: "scale(1)",
        userSelect: "none",
        "-moz-user-select": "none",
        lineHeight: 0,
        borderRadius: "50%",
        outline: 0,
        zIndex: 1,
        position: "relative",
        // touch area
        ":before": {
          content: "\"\"",
          position: "absolute",
          borderRadius: "50%"
        },
        // border
        ":after": {
          content: "\"\"",
          position: "absolute",
          borderRadius: "50%",
          borderStyle: "solid"
        }
      }],
      " .pe-slider__thumb": [_polytheneCoreCss.mixin.fit(), {
        "&, .pe-icon": {
          width: "inherit",
          height: "inherit"
        }
      }],
      " .pe-slider__label": {
        minWidth: _polytheneTheme.vars.unit_icon_size + "px",
        textAlign: "center",
        fontSize: "16px",
        fontWeight: _polytheneTheme.vars.font_weight_medium
      },
      " .pe-slider__track-part": [_polytheneCoreCss.flex.flex(), {
        userSelect: "none",
        "-moz-user-select": "none",
        overflow: "hidden" // Firefox otherwise uses 6x at 0%

      }],
      " .pe-slider__track-value, .pe-slider__track-rest": _polytheneCoreCss.flex.layoutHorizontal,
      " .pe-slider__track-bar": [_polytheneCoreCss.flex.flex(), {
        position: "relative",
        overflow: "hidden"
      }],
      " .pe-slider__track-bar-value": _polytheneCoreCss.flex.flex(),
      " .pe-slider__ticks": [_polytheneCoreCss.flex.layoutJustified, {
        userSelect: "none",
        "-moz-user-select": "none",
        position: "absolute",
        left: 0,
        pointerEvents: "none"
      }],
      " .pe-slider__pin": [_polytheneCoreCss.mixin.defaultTransition("transform", ".11s"), {
        transform: "translateZ(0) scale(0) translate(0, 0)",
        transformOrigin: "bottom",
        position: "absolute",
        zIndex: 1,
        height: 0,
        left: 0,
        // set in js
        top: 0,
        pointerEvents: "none",
        "&::before, &::after": {
          position: "absolute",
          top: 0,
          left: 0
        },
        "::before": {
          transform: "rotate(-45deg)",
          content: "\"\"",
          borderRadius: "50% 50% 50% 0"
        },
        "::after": {
          content: "attr(value)",
          textAlign: "center"
        }
      }],
      ".pe-slider--pin.pe-slider--active, &.pe-slider--pin.pe-slider--focus": {
        " .pe-slider__pin": {
          transform: "translateZ(0) scale(1) translate(0, -24px)"
        }
      },
      ":not(.pe-slider--disabled)": {
        " .pe-slider__control": {
          cursor: "pointer"
        },
        ".pe-slider--track": {
          " .pe-slider__track": {
            cursor: "pointer"
          }
        }
      },
      ".pe-slider--disabled": {
        " .pe-slider__control": {
          borderWidth: 0
        }
      }
    }])];
  },
  thumb_size: function thumb_size(selector, vars) {
    var _getThumbSize5 = getThumbSize(vars),
        normalThumbSize = _getThumbSize5.normalThumbSize,
        barOffset = _getThumbSize5.barOffset,
        stepsOffset = _getThumbSize5.stepsOffset;

    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__control": {
        width: normalThumbSize + "px",
        height: normalThumbSize + "px"
      },
      " .pe-slider__track-value .pe-slider__track-bar": {
        marginLeft: barOffset + "px"
      },
      " .pe-slider__track-rest .pe-slider__track-bar": {
        marginRight: barOffset + "px"
      },
      " .pe-slider__ticks": {
        width: "calc(100% - " + 2 * stepsOffset + "px)",
        margin: "0 " + stepsOffset + "px"
      }
    }), thumb_size_thumb_border_width_disabled_thumb_scale(selector, vars), thumb_size_thumb_touch_size(selector, vars), thumb_size_active_thumb_scale(selector, vars), thumb_size_pin_width(selector, vars)];
  },
  active_thumb_scale: function active_thumb_scale(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-slider--active:not(.pe-slider--ticks)": {
        " .pe-slider__control": {
          transform: "scale(" + vars.active_thumb_scale + ")"
        }
      }
    }), thumb_size_active_thumb_scale(selector, vars)];
  },
  thumb_touch_size: function thumb_touch_size(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__control": {
        ":before": {
          width: vars.thumb_touch_size + "px",
          height: vars.thumb_touch_size + "px"
        }
      }
    }), thumb_size_thumb_touch_size(selector, vars)];
  },
  thumb_border_width: function thumb_border_width(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {}), thumb_size_thumb_border_width_disabled_thumb_scale(selector, vars)];
  },
  disabled_thumb_scale: function disabled_thumb_scale(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-slider--disabled": {
        " .pe-slider__control": {
          transform: "scale(" + vars.disabled_thumb_scale + ")"
        }
      }
    }), thumb_size_thumb_border_width_disabled_thumb_scale(selector, vars)];
  },
  active_pin_thumb_scale: function active_pin_thumb_scale(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-slider--pin.pe-slider--active, &.pe-slider--pin.pe-slider--focus": {
        " .pe-slider__control": {
          transform: "scale(" + vars.active_pin_thumb_scale + ")"
        }
      }
    })];
  },
  height: function height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      height: vars.height + "px",
      " > .pe-icon": {
        height: vars.height + "px"
      },
      " .pe-slider__label": {
        height: vars.height + "px",
        lineHeight: vars.height + "px"
      },
      " .pe-slider__ticks": {
        top: vars.height / 2 - 1 + "px"
      }
    }), height_track_height(selector, vars)];
  },
  track_height: function track_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__track": {
        height: vars.track_height + "px"
      }
    }), height_track_height(selector, vars), track_height_bar_height(selector, vars)];
  },
  animation_duration: function animation_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__track": _polytheneCoreCss.mixin.defaultTransition("transform", vars.animation_duration),
      " .pe-slider__control:before": _polytheneCoreCss.mixin.defaultTransition("background-color", vars.animation_duration),
      " .pe-slider__control:after": _polytheneCoreCss.mixin.defaultTransition("border", vars.animation_duration),
      " .pe-slider__thumb": _polytheneCoreCss.mixin.defaultTransition("opacity", vars.animation_duration),
      " .pe-slider__track-bar-value": _polytheneCoreCss.mixin.defaultTransition("transform, background-color", vars.animation_duration)
    })];
  },
  side_spacing: function side_spacing(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__track": {
        margin: "0 " + vars.side_spacing + "px"
      }
    })];
  },
  horizontal_layout_side_spacing: function horizontal_layout_side_spacing(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " div + .pe-slider__track": {
        margin: "0 " + vars.horizontal_layout_side_spacing + "px"
      }
    })];
  },
  bar_height: function bar_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__track-part,\
        .pe-slider__track-bar-value,\
        .pe-slider__ticks,\
        .pe-slider__tick": {
        height: vars.bar_height + "px"
      }
    }), track_height_bar_height(selector, vars)];
  },
  step_width: function step_width(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__tick": {
        width: vars.step_width + "px"
      }
    })];
  },
  pin_width: function pin_width(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__pin": {
        width: vars.pin_width + "px",
        "::before": {
          width: vars.pin_width + "px",
          height: vars.pin_width + "px"
        },
        "::after": {
          width: vars.pin_width + "px",
          height: vars.pin_height + "px",
          lineHeight: vars.pin_width + "px"
        }
      }
    }), thumb_size_pin_width(selector, vars)];
  },
  pin_font_size: function pin_font_size(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-slider__pin::after": {
        fontSize: vars.pin_font_size + "px"
      }
    })];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

exports.layout = layout;
var lightForeground = _polytheneTheme.vars.color_light_foreground;
var darkForeground = _polytheneTheme.vars.color_dark_foreground;
var activeColor = _polytheneTheme.vars.color_primary; // or override in CSS by setting 'color' property on '.pe-slider'

var thumb_size = 12;
var thumb_touch_size = Math.max(40, thumb_size);
var thumb_border_width = 2;
var active_thumb_scale = 3 / 2;
var disabled_thumb_scale = 1 / 2;
var active_pin_thumb_scale = 2 / 6;
var largestThumbSize = active_thumb_scale * thumb_size;
var largestElement = Math.max(thumb_touch_size, largestThumbSize);
var height = Math.max(52, largestThumbSize);
var side_spacing = Math.max(10, largestElement / 2 - thumb_size / 2);
var horizontal_layout_side_spacing = side_spacing + 4; // optimization for horizontal layout

var vars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  active_pin_thumb_scale: active_pin_thumb_scale,
  active_thumb_scale: active_thumb_scale,
  animation_duration: _polytheneTheme.vars.animation_duration,
  bar_height: 2,
  disabled_thumb_scale: disabled_thumb_scale,
  height: height,
  horizontal_layout_side_spacing: horizontal_layout_side_spacing,
  pin_font_size: 10,
  pin_height: 32,
  pin_width: 26,
  side_spacing: side_spacing,
  step_width: 2,
  thumb_border_width: thumb_border_width,
  thumb_size: thumb_size,
  thumb_touch_size: thumb_touch_size,
  track_height: height,
  color_light_track_active: (0, _polytheneCoreCss.rgba)(lightForeground, .38),
  color_light_track_inactive: (0, _polytheneCoreCss.rgba)(lightForeground, .26),
  color_light_track_value: "currentColor",
  // background color may be set in theme; disabled by default
  // color_light_thumb_background:        undefined,
  color_light_thumb_off: (0, _polytheneCoreCss.rgba)(lightForeground, .26),
  color_light_thumb_off_focus: (0, _polytheneCoreCss.rgba)(lightForeground),
  color_light_thumb_off_focus_opacity: .08,
  color_light_thumb_on: (0, _polytheneCoreCss.rgba)(activeColor),
  color_light_thumb_on_focus_opacity: .11,
  color_light_thumb_inactive: (0, _polytheneCoreCss.rgba)(lightForeground, .26),
  color_light_tick: (0, _polytheneCoreCss.rgba)(lightForeground, 1),
  color_light_tick_value: (0, _polytheneCoreCss.rgba)(lightForeground, 1),
  color_light_icon: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_secondary),
  color_light_disabled_icon: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_disabled),
  color_light_label: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_secondary),
  color_light_disabled_label: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_disabled),
  color_light_pin_label: "#fff",
  color_light_pin_background: "currentColor",
  color_dark_track_active: (0, _polytheneCoreCss.rgba)(darkForeground, .3),
  color_dark_track_inactive: (0, _polytheneCoreCss.rgba)(darkForeground, .2),
  color_dark_track_value: "currentColor",
  // background color may be set in theme; disabled by default
  // color_dark_thumb_background:         undefined,
  color_dark_thumb_off: (0, _polytheneCoreCss.rgba)(darkForeground, .2),
  color_dark_thumb_off_focus: (0, _polytheneCoreCss.rgba)(darkForeground),
  color_dark_thumb_off_focus_opacity: .08,
  color_dark_thumb_on: (0, _polytheneCoreCss.rgba)(activeColor),
  color_dark_thumb_on_focus_opacity: .11,
  color_dark_thumb_inactive: (0, _polytheneCoreCss.rgba)(darkForeground, .2),
  color_dark_tick: (0, _polytheneCoreCss.rgba)(darkForeground, 1),
  color_dark_tick_value: (0, _polytheneCoreCss.rgba)(darkForeground, 1),
  color_dark_icon: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_secondary),
  color_dark_disabled_icon: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_disabled),
  color_dark_label: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_secondary),
  color_dark_disabled_label: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_disabled),
  color_dark_pin_label: "#fff",
  color_dark_pin_background: "currentColor"
}; // @ts-check

exports.vars = vars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, vars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, vars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: vars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-snackbar/dist/polythene-css-snackbar.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.holderLayout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneCssNotification = require("polythene-css-notification");

var _polytheneTheme = require("polythene-theme");

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var notificationClasses = {
  component: "pe-notification",
  // elements
  action: "pe-notification__action",
  content: "pe-notification__content",
  holder: "pe-notification__holder",
  placeholder: "pe-notification__placeholder",
  title: "pe-notification__title",
  // states
  hasContainer: "pe-notification--container",
  horizontal: "pe-notification--horizontal",
  multilineTitle: "pe-notification__title--multi-line",
  vertical: "pe-notification--vertical",
  visible: "pe-notification--visible"
};

var classes = _objectSpread2({}, notificationClasses, {
  component: "pe-notification pe-snackbar",
  // elements
  holder: "pe-snackbar__holder",
  placeholder: "pe-snackbar__placeholder",
  // states
  open: "pe-snackbar--open"
}); // @ts-check


var color = (0, _polytheneCoreCss.createColor)({
  superColor: _polytheneCssNotification.color
});
exports.color = color;
var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, [_polytheneCoreCss.flex.layoutCenterCenter, {
      position: "fixed",
      top: "auto",
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: _polytheneTheme.vars.z_notification,
      pointerEvents: "none",
      justifyContent: "flex-start",
      // For IE11
      width: "100%"
    }]), _defineProperty({}, ".pe-notification--container ".concat(selector), {
      position: "relative"
    })];
  }
};
var holderLayout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
});
exports.holderLayout = holderLayout;

var breakpoint = function breakpoint(breakpointSel) {
  return function (selector, o) {
    return _defineProperty({}, breakpointSel, _defineProperty({}, selector, o));
  };
};

var breakpointTabletPortraitUp = breakpoint("@media (min-width: ".concat(_polytheneTheme.vars.breakpoint_for_tablet_portrait_up, "px)"));
var varFns$1 = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      width: "100%",
      opacity: 1,
      display: "none",
      " .pe-notification__content": {
        width: "100%",
        margin: "0 auto",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
      }
    }), breakpointTabletPortraitUp(selector, {
      ".pe-notification--horizontal": {
        " .pe-notification__title": {
          paddingRight: "30px"
        }
      }
    })];
  },
  min_width: function min_width(selector, vars) {
    return [breakpointTabletPortraitUp(selector, {
      minWidth: vars.min_width + "px"
    })];
  },
  max_width: function max_width(selector, vars) {
    return [breakpointTabletPortraitUp(selector, {
      maxWidth: vars.max_width + "px"
    })];
  },
  border_radius: function border_radius(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-notification__content": {
        borderTopLeftRadius: vars.border_radius + "px",
        borderTopRightRadius: vars.border_radius + "px",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
      }
    })];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns$1,
  customVarFns: _polytheneCssNotification.customLayoutFns
}); // @ts-check

/**
 * @type {SnackbarVars} snackbarVars
 */

exports.layout = layout;
var snackbarVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  animation_hide_css: "",
  animation_show_css: "",
  border_radius: 0,
  max_width: 568,
  min_height: 0,
  min_width: 288,
  color_light_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_background),
  color_dark_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_background)
}; // @ts-check

exports.vars = snackbarVars;
var fns = [layout, color];
var selector = ".".concat(classes.component.replace(/ /g, "."));
var holderFns = [holderLayout];
var holderSelector = ".".concat(classes.holder.replace(/ /g, "."));

var addStyle = function addStyle(customSelector, customVars) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$mediaQuery = _ref.mediaQuery,
      mediaQuery = _ref$mediaQuery === void 0 ? "" : _ref$mediaQuery,
      _ref$scope = _ref.scope,
      scope = _ref$scope === void 0 ? "" : _ref$scope;

  customSelector && _polytheneCoreCss.styler.addStyle({
    selectors: [customSelector, selector],
    fns: fns,
    vars: snackbarVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  });
  customSelector && _polytheneCoreCss.styler.addStyle({
    selectors: [customSelector, holderSelector],
    fns: holderFns,
    vars: snackbarVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  });
};

exports.addStyle = addStyle;

var getStyle = function getStyle() {
  var customSelector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var customVars = arguments.length > 1 ? arguments[1] : undefined;

  var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref2$mediaQuery = _ref2.mediaQuery,
      mediaQuery = _ref2$mediaQuery === void 0 ? "" : _ref2$mediaQuery,
      _ref2$scope = _ref2.scope,
      scope = _ref2$scope === void 0 ? "" : _ref2$scope;

  return _polytheneCoreCss.styler.getStyle({
    selectors: [customSelector, selector],
    fns: fns,
    vars: snackbarVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  }).concat(_polytheneCoreCss.styler.getStyle({
    selectors: [holderSelector],
    fns: holderFns,
    vars: snackbarVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  }));
};

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  _polytheneCoreCss.styler.addStyle({
    selectors: [holderSelector],
    fns: holderFns,
    vars: snackbarVars
  });

  _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: snackbarVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-css-notification":"../node_modules/polythene-css-notification/dist/polythene-css-notification.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-svg/dist/polythene-css-svg.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var classes = {
  component: "pe-svg"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      color: "inherit",
      " svg": {
        color: "inherit",
        " path, rect, circle, polygon": {
          "&:not([fill=none])": {
            fill: "currentcolor"
          }
        }
      }
    })];
  }
};

var tintFns = function tintFns(tint) {
  return _defineProperty({}, "color_" + tint, function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " svg": {
        " path, rect, circle, polygon": {
          "&:not([fill=none])": {
            fill: vars["color_" + tint]
          }
        }
      }
    })];
  });
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
}); // @ts-check

exports.color = color;
var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      lineHeight: 1,
      " > div, svg": {
        width: "inherit",
        height: "inherit"
      }
    })];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

/**
 * @typedef {import("../index").SVGVars} SVGVars
 */

/**
 * @type {SVGVars} svgVars
 */

exports.layout = layout;
var svgVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  color_light: "currentcolor",
  color_dark: "currentcolor"
}; // @ts-check

exports.vars = svgVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, svgVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, svgVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: svgVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs"}],"../node_modules/polythene-css-switch/dist/polythene-css-switch.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneCssSelectionControl = require("polythene-css-selection-control");

var _polytheneTheme = require("polythene-theme");

var _polytheneCssIconButton = require("polythene-css-icon-button");

var classes = {
  component: "pe-switch-control",
  // elements
  knob: "pe-switch-control__knob",
  thumb: "pe-switch-control__thumb",
  track: "pe-switch-control__track"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {})];
  }
};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_label", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-control__label": {
        color: vars["color_" + tint + "_label"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_track_off", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--off": {
        " .pe-switch-control__track": {
          backgroundColor: vars["color_" + tint + "_track_off"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_track_off_opacity", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--off": {
        " .pe-switch-control__track": {
          opacity: vars["color_" + tint + "_track_off_opacity"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_thumb_off", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--off": {
        " .pe-switch-control__knob": {
          backgroundColor: vars["color_" + tint + "_thumb_off"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_icon_off", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--off": {
        " .pe-icon": {
          color: vars["color_" + tint + "_icon_off"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_off_label", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--off": {
        " .pe-control__label": {
          color: vars["color_" + tint + "_off_label"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_track_on", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--on": {
        " .pe-switch-control__track": {
          backgroundColor: vars["color_" + tint + "_track_on"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_track_on_opacity", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--on": {
        " .pe-switch-control__track": {
          opacity: vars["color_" + tint + "_track_on_opacity"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_thumb_on", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--on": {
        " .pe-switch-control__knob": {
          backgroundColor: vars["color_" + tint + "_thumb_on"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_icon_on", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--on": {
        " .pe-icon": {
          color: vars["color_" + tint + "_icon_on"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_on_label", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--on": {
        " .pe-control__label": {
          color: vars["color_" + tint + "_on_label"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_disabled", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--on.pe-control--disabled, &.pe-control--off.pe-control--disabled": {
        " .pe-control__label": {
          color: vars["color_" + tint + "_disabled"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_track_disabled", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--on.pe-control--disabled, &.pe-control--off.pe-control--disabled": {
        " .pe-switch-control__track": {
          backgroundColor: vars["color_" + tint + "_track_disabled"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_track_disabled_opacity", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--on.pe-control--disabled, &.pe-control--off.pe-control--disabled": {
        " .pe-switch-control__track": {
          opacity: vars["color_" + tint + "_track_disabled_opacity"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_thumb_disabled", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-control--on.pe-control--disabled, &.pe-control--off.pe-control--disabled": {
        " .pe-switch-control__thumb, .pe-button__content": {
          color: vars["color_" + tint + "_thumb_disabled"]
        }
      }
    })];
  }), _ref;
};

var hoverTintFns = function hoverTintFns(tint) {
  return {// ["color_" + tint + "_wash_on"]: (selector, vars) => [
    //   sel(selector, {
    //     ".pe-control--on": {
    //       " .pe-button__wash": {
    //         backgroundColor: vars["color_" + tint + "_wash_on"]
    //       }
    //     },
    //   })
    // ],
    // ["color_" + tint + "_wash_off"]: (selector, vars) => [
    //   sel(selector, {
    //     ".pe-control--off": {
    //       " .pe-button__wash": {
    //         backgroundColor: vars["color_" + tint + "_wash_off"]
    //       }
    //     }
    //   })
    // ],
  };
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var lightTintHoverFns = hoverTintFns();
var darkTintHoverFns = hoverTintFns();
var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns,
    lightTintHoverFns: lightTintHoverFns,
    darkTintHoverFns: darkTintHoverFns
  }
});
exports.color = color;

var transition = function transition(vars, properties) {
  var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : vars.animation_duration;
  return _polytheneCoreCss.mixin.defaultTransition(properties, duration, "ease-out");
};

var getSizeData = function getSizeData(vars$1, size) {
  var factor = size / _polytheneTheme.vars.unit_icon_size;
  var thumbSize = Math.floor(0.5 * vars$1.thumb_size * factor) * 2; // round to even

  var scaledTrackHeight = Math.floor(0.5 * vars$1.track_height * factor) * 2; // round to even

  var scaledTrackWidth = Math.floor(0.5 * vars$1.track_length * factor) * 2;
  var scaledThumbSize = Math.floor(0.5 * vars$1.thumb_size * factor) * 2;
  var trackTop = (vars$1.label_height * factor - scaledTrackHeight) / 2;
  var thumbPadding = vars$1.icon_button_padding;
  var thumbMargin = (size - scaledThumbSize) / 2;
  var thumbOuterSize = size + 2 * thumbPadding;
  var thumbOffsetMin = -(thumbOuterSize / 2) + thumbSize / 2;
  var thumbOffsetMax = thumbOffsetMin + scaledTrackWidth - thumbSize;
  var thumbOffsetY = thumbOffsetMin + thumbMargin;
  var trackVisualOffset = 0.3; // prevent sub pixel of track to shine through knob border

  return {
    factor: factor,
    scaledThumbSize: scaledThumbSize,
    scaledTrackHeight: scaledTrackHeight,
    scaledTrackWidth: scaledTrackWidth,
    size: size,
    thumbMargin: thumbMargin,
    thumbOffsetMax: thumbOffsetMax,
    thumbOffsetMin: thumbOffsetMin,
    thumbOffsetY: thumbOffsetY,
    thumbPadding: thumbPadding,
    trackTop: trackTop,
    trackVisualOffset: trackVisualOffset
  };
};

var customSize = function customSize(vars, _ref) {
  var scaledThumbSize = _ref.scaledThumbSize,
      scaledTrackHeight = _ref.scaledTrackHeight,
      scaledTrackWidth = _ref.scaledTrackWidth,
      size = _ref.size,
      thumbMargin = _ref.thumbMargin,
      thumbOffsetY = _ref.thumbOffsetY,
      thumbPadding = _ref.thumbPadding,
      trackTop = _ref.trackTop,
      trackVisualOffset = _ref.trackVisualOffset;
  return {
    " .pe-control__form-label": {
      height: size + "px",
      minWidth: scaledTrackWidth + "px"
    },
    " .pe-switch-control__track": {
      height: scaledTrackHeight + "px",
      width: scaledTrackWidth - 2 * trackVisualOffset + "px",
      top: trackTop + "px",
      borderRadius: scaledTrackHeight + "px"
    },
    " .pe-switch-control__thumb": {
      top: thumbOffsetY + "px"
    },
    " .pe-switch-control__knob": {
      width: scaledThumbSize + "px",
      height: scaledThumbSize + "px",
      margin: thumbMargin + "px"
    },
    " .pe-button__content": {
      padding: thumbPadding + "px"
    }
  };
};

var customSpacing = function customSpacing(vars, _ref2, isRTL) {
  var _peControl__label, _peSwitchControl_, _peSwitchControl_2, _peSwitchControl_3;

  var factor = _ref2.factor,
      scaledTrackWidth = _ref2.scaledTrackWidth,
      thumbOffsetMax = _ref2.thumbOffsetMax,
      thumbOffsetMin = _ref2.thumbOffsetMin,
      trackVisualOffset = _ref2.trackVisualOffset;
  return {
    " .pe-control__label": (_peControl__label = {}, _defineProperty(_peControl__label, isRTL ? "paddingRight" : "paddingLeft", vars.padding * factor + 8 + scaledTrackWidth + "px"), _defineProperty(_peControl__label, isRTL ? "paddingLeft" : "paddingRight", 0), _peControl__label),
    " .pe-switch-control__track": (_peSwitchControl_ = {}, _defineProperty(_peSwitchControl_, isRTL ? "right" : "left", trackVisualOffset + "px"), _defineProperty(_peSwitchControl_, isRTL ? "left" : "right", "auto"), _peSwitchControl_),
    " .pe-switch-control__thumb": (_peSwitchControl_2 = {}, _defineProperty(_peSwitchControl_2, isRTL ? "right" : "left", thumbOffsetMin + "px"), _defineProperty(_peSwitchControl_2, isRTL ? "left" : "right", "auto"), _peSwitchControl_2),
    ".pe-control--on": {
      " .pe-switch-control__thumb": (_peSwitchControl_3 = {}, _defineProperty(_peSwitchControl_3, isRTL ? "right" : "left", thumbOffsetMax + "px"), _defineProperty(_peSwitchControl_3, isRTL ? "left" : "right", "auto"), _peSwitchControl_3)
    }
  };
};

var alignSide = function alignSide(isRTL) {
  return function () {
    var _peSwitchControl_4;

    return {
      " .pe-switch-control__track": (_peSwitchControl_4 = {}, _defineProperty(_peSwitchControl_4, isRTL ? "right" : "left", 0), _defineProperty(_peSwitchControl_4, isRTL ? "left" : "right", "auto"), _peSwitchControl_4)
    };
  };
};

var alignLeft = alignSide(false);
var alignRight = alignSide(true);

var createSize = function createSize(selector, vars$1) {
  var sizeData = {
    small: getSizeData(vars$1, _polytheneTheme.vars.unit_icon_size_small),
    regular: getSizeData(vars$1, _polytheneTheme.vars.unit_icon_size),
    medium: getSizeData(vars$1, _polytheneTheme.vars.unit_icon_size_medium),
    large: getSizeData(vars$1, _polytheneTheme.vars.unit_icon_size_large)
  };
  return [(0, _polytheneCoreCss.sel)(selector, {
    ".pe-control--small": [customSize(vars$1, sizeData.small), customSpacing(vars$1, sizeData.small, false)],
    ".pe-control--regular": [customSize(vars$1, sizeData.regular), customSpacing(vars$1, sizeData.regular, false)],
    ".pe-control--medium": [customSize(vars$1, sizeData.medium), customSpacing(vars$1, sizeData.medium, false)],
    ".pe-control--large": [customSize(vars$1, sizeData.large), customSpacing(vars$1, sizeData.large, false)]
  }), _defineProperty({}, "*[dir=rtl] ".concat(selector, ", .pe-rtl ").concat(selector), [alignRight(), {
    ".pe-control--small": [customSpacing(vars$1, sizeData.small, true)],
    ".pe-control--regular": [customSpacing(vars$1, sizeData.regular, true)],
    ".pe-control--medium": [customSpacing(vars$1, sizeData.medium, true)],
    ".pe-control--large": [customSpacing(vars$1, sizeData.large, true)]
  }])];
};

var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, [alignLeft(), {
      " .pe-switch-control__track": [{
        position: "absolute"
      }],
      " .pe-switch-control__thumb": {
        position: "absolute",
        zIndex: 1,
        // Prevents flickering of text label when toggling
        color: "inherit",
        ":focus": {
          outline: 0
        }
      },
      " .pe-switch-control__knob": {
        position: "relative",
        borderRadius: "50%"
      },
      " .pe-icon-button .pe-button__content": {
        transition: "none",
        " .pe-switch-control__knob .pe-icon": [_polytheneCoreCss.mixin.fit(), {
          width: "100%",
          height: "100%"
        }]
      }
    }]), _defineProperty({}, "_:-ms-fullscreen, :root ".concat(selector), {
      " input": {
        position: "absolute",
        zIndex: 1,
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        display: "block",
        opacity: 0,
        cursor: "pointer"
      },
      " label": {
        cursor: "auto"
      }
    })];
  },
  animation_duration: function animation_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-switch-control__track, .pe-switch-control__thumb, .pe-control__label": transition(vars, "all")
    })];
  },
  createSize: createSize
};

var withCreateSizeVar = function withCreateSizeVar(vars) {
  return vars.thumb_size || vars.track_height || vars.track_length || vars.label_height || vars.icon_button_padding ? _extends({}, vars, {
    createSize: true
  }) : vars;
};

var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns,
  superLayout: _polytheneCssSelectionControl.layout,
  varMixin: withCreateSizeVar
}); // @ts-check

/**
 * @type {SwitchVars} switchVars
 */

exports.layout = layout;
var switchVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  animation_duration: _polytheneTheme.vars.animation_duration,
  hit_area_padding: (_polytheneTheme.vars.grid_unit_icon_button - _polytheneTheme.vars.unit_icon_size) / 2,
  // 12
  icon_button_padding: _polytheneCssIconButton.vars.padding,
  padding: _polytheneTheme.vars.grid_unit_component,
  thumb_size: 20,
  track_height: 14,
  track_length: 36,
  label_height: _polytheneCssSelectionControl.vars.label_height,
  color_light_thumb_on: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_light_thumb_off: "#f1f1f1",
  color_light_thumb_disabled: "#eee",
  color_light_wash_on: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary, _polytheneTheme.vars.blend_light_background_active),
  color_light_wash_off: _polytheneCssIconButton.vars.color_light_wash_background,
  color_light_track_on: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary_faded),
  color_light_track_on_opacity: .55,
  color_light_track_off: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_regular),
  color_light_track_off_opacity: .55,
  color_light_track_disabled: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_background_disabled),
  color_light_track_disabled_opacity: 1,
  // icon color may be set in theme; default "currentcolor"
  // color_light_icon_on:                   "currentcolor",
  // color_light_icon_off:                  "currentcolor",
  // color_light_focus_on and so on taken from selectionControlVars
  color_dark_thumb_on: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_dark_thumb_off: "#bdbdbd",
  color_dark_thumb_disabled: "#555",
  color_dark_wash_on: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary, _polytheneTheme.vars.blend_dark_background_active),
  color_dark_wash_off: _polytheneCssIconButton.vars.color_dark_wash_background,
  color_dark_track_on: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary_faded, _polytheneTheme.vars.blend_dark_text_tertiary),
  // or "#5a7f7c"
  color_dark_track_on_opacity: 9,
  color_dark_track_off: "#717171",
  color_dark_track_off_opacity: .55,
  color_dark_track_disabled: "#717171",
  color_dark_track_disabled_opacity: .3 // icon color may be set in theme; default "currentcolor"
  // color_dark_icon_on:                    "currentcolor"
  // color_dark_icon_off:                   "currentcolor"
  // color_dark_focus_on and so on taken from selectionControlVars

}; // @ts-check

exports.vars = switchVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, switchVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, switchVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: switchVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-css-selection-control":"../node_modules/polythene-css-selection-control/dist/polythene-css-selection-control.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs","polythene-css-icon-button":"../node_modules/polythene-css-icon-button/dist/polythene-css-icon-button.mjs"}],"../node_modules/polythene-css-tabs/dist/polythene-css-tabs.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.tabsLayout = exports.tabsColor = exports.tabLayout = exports.tabColor = exports.getStyle = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var _polytheneCssButton = require("polythene-css-button");

var _polytheneCssIconButton = require("polythene-css-icon-button");

var buttonClasses = {
  component: "pe-text-button",
  "super": "pe-button",
  row: "pe-button-row",
  // elements      
  content: "pe-button__content",
  label: "pe-button__label",
  textLabel: "pe-button__text-label",
  wash: "pe-button__wash",
  washColor: "pe-button__wash-color",
  dropdown: "pe-button__dropdown",
  // states      
  border: "pe-button--border",
  contained: "pe-button--contained",
  disabled: "pe-button--disabled",
  dropdownClosed: "pe-button--dropdown-closed",
  dropdownOpen: "pe-button--dropdown-open",
  extraWide: "pe-button--extra-wide",
  hasDropdown: "pe-button--dropdown",
  highLabel: "pe-button--high-label",
  inactive: "pe-button--inactive",
  raised: "pe-button--raised",
  selected: "pe-button--selected",
  separatorAtStart: "pe-button--separator-start",
  hasHover: "pe-button--has-hover"
};
var classes = {
  component: "pe-tabs",
  // elements
  indicator: "pe-tabs__indicator",
  scrollButton: "pe-tabs__scroll-button",
  scrollButtonAtEnd: "pe-tabs__scroll-button-end",
  scrollButtonAtStart: "pe-tabs__scroll-button-start",
  tab: "pe-tab",
  tabContent: "pe-tabs__tab-content",
  tabRow: "pe-tabs__row",
  // states
  activeSelectable: "pe-tabs__active--selectable",
  isAtEnd: "pe-tabs--end",
  isAtStart: "pe-tabs--start",
  isAutofit: "pe-tabs--autofit",
  isMenu: "pe-tabs--menu",
  scrollable: "pe-tabs--scrollable",
  compactTabs: "pe-tabs--compact",
  tabHasIcon: "pe-tabs__tab--icon",
  tabRowCentered: "pe-tabs__row--centered",
  tabRowIndent: "pe-tabs__row--indent",
  // lookup
  label: buttonClasses.label
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-button--selected": {
        " .pe-button__content": {
          background: "transparent"
        }
      }
    })];
  }
};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_selected", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-button--selected": {
        " .pe-button__content": {
          color: vars["color_" + tint + "_selected"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_selected_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-button--selected": {
        " .pe-button__content": {
          background: vars["color_" + tint + "_selected_background"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_icon", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ":not(.pe-button--selected) .pe-icon": {
        color: vars["color_" + tint + "_icon"]
      }
    })];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var tabColor = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
});
exports.tabColor = tabColor;

var tab_label_transition_property_animation_duration = function tab_label_transition_property_animation_duration(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-button__content": _polytheneCoreCss.mixin.defaultTransition(vars.tab_label_transition_property, vars.animation_duration)
  });
};

var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, [_polytheneCoreCss.flex.flex(), _polytheneCoreCss.flex.flexIndex("none"), {
      userSelect: "none",
      "-moz-user-select": "none",
      margin: 0,
      borderRadius: 0,
      padding: 0,
      " .pe-button__content": {
        lineHeight: _polytheneTheme.vars.line_height + "em",
        borderRadius: 0,
        position: "relative",
        " .pe-button__label, .pe-icon": {
          overflow: "hidden",
          whiteSpace: "normal"
        },
        " .pe-button__label": {
          padding: 0,
          width: "100%" // for IE 11

        },
        " .pe-icon": {
          marginLeft: "auto",
          marginRight: "auto"
        }
      },
      ".pe-tabs__tab--icon": {
        "&, .pe-button__content": {
          " .pe-button__content, .pe-icon": {
            margin: "0 auto"
          }
        }
      },
      ".pe-tabs--menu &": {
        "&, &.pe-tabs__tab--icon, &.pe-text-button": {
          minWidth: 0,
          " .pe-button__content": {
            " .pe-icon": {
              marginBottom: 0
            },
            " .pe-button__content": {
              fontSize: "10px",
              lineHeight: "12px",
              textTransform: "none"
            }
          }
        }
      },
      ".pe-tabs--compact &": {
        minWidth: "initial"
      },
      " .pe-tabs__tab-content": [_polytheneCoreCss.flex.layoutCenterCenter, _polytheneCoreCss.flex.layoutVertical, {
        height: "inherit"
      }],
      ".pe-tabs--autofit &": [_polytheneCoreCss.flex.flex(), {
        minWidth: "initial",
        maxWidth: "none"
      }],
      ".pe-tabs__active--selectable &": {
        ".pe-button--selected": {
          cursor: "pointer",
          pointerEvents: "initial"
        }
      }
    }])];
  },
  tab_height: function tab_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      height: vars.tab_height + "px",
      " .pe-button__content": {
        height: vars.tab_height + "px"
      }
    })];
  },
  tab_min_width: function tab_min_width(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      minWidth: vars.tab_min_width + "px" // for smaller screens, see also media query

    })];
  },
  tab_max_width: function tab_max_width(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      maxWidth: isNaN(vars.tab_max_width) ? vars.tab_max_width : vars.tab_max_width + "px"
    })];
  },
  tab_min_width_tablet: function tab_min_width_tablet(selector, vars$1) {
    return _defineProperty({}, "@media (min-width: " + _polytheneTheme.vars.breakpoint_for_tablet_landscape_up + "px)", _defineProperty({}, ".pe-tabs:not(.pe-tabs--small):not(.pe-tabs--menu):not(.pe-tabs--autofit):not(.pe-tabs--scrollable):not(.pe-tabs--compact) ".concat(selector), {
      minWidth: vars$1.tab_min_width_tablet + "px"
    }));
  },
  tab_icon_label_height: function tab_icon_label_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-tabs__tab--icon": {
        "&, .pe-button__content": {
          height: vars.tab_icon_label_height + "px"
        }
      }
    })];
  },
  tab_label_transition_property: function tab_label_transition_property(selector, vars) {
    return [tab_label_transition_property_animation_duration(selector, vars)];
  },
  animation_duration: function animation_duration(selector, vars) {
    return [tab_label_transition_property_animation_duration(selector, vars)];
  },
  tab_content_padding_v: function tab_content_padding_v(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__content": {
        padding: "0 " + vars.tab_content_padding_v + "px"
      }
    })];
  },
  label_max_width: function label_max_width(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__content": {
        " .pe-button__label, .pe-icon": {
          maxWidth: vars.label_max_width + "px" // or .pe-tabs width minus 56dp

        }
      }
    })];
  },
  tab_label_line_height: function tab_label_line_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__content": {
        " .pe-button__label, .pe-icon": {
          lineHeight: vars.tab_label_line_height + "px",
          maxHeight: 2 * vars.tab_label_line_height + "px"
        }
      }
    })];
  },
  tab_label_vertical_offset: function tab_label_vertical_offset(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-button__content": {
        " .pe-button__label": {
          margin: vars.tab_label_vertical_offset + "px 0 0 0"
        }
      }
    })];
  },
  tab_icon_label_icon_spacing: function tab_icon_label_icon_spacing(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-tabs__tab--icon": {
        "&, .pe-button__content": {
          " .pe-icon": {
            marginBottom: vars.tab_icon_label_icon_spacing + "px"
          }
        }
      }
    })];
  },
  menu_tab_height: function menu_tab_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-tabs--menu &": {
        // reset sizes to fit within a small space
        height: vars.menu_tab_height + "px",
        "&, &.pe-tabs__tab--icon, &.pe-text-button": {
          " .pe-button__content": {
            height: vars.menu_tab_height + "px"
          }
        }
      }
    })];
  },
  menu_tab_icon_label_height: function menu_tab_icon_label_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-tabs--menu &": {
        "&.pe-tabs__tab--icon": {
          height: vars.menu_tab_icon_label_height + "px"
        }
      }
    })];
  },
  tab_menu_content_padding_v: function tab_menu_content_padding_v(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-tabs--menu &": {
        "&, &.pe-tabs__tab--icon, &.pe-text-button": {
          " .pe-button__content": {
            padding: "0 " + vars.tab_menu_content_padding_v + "px"
          }
        }
      }
    })];
  }
};
var tabLayout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
});
exports.tabLayout = tabLayout;
var generalFns$1 = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-tabs__scroll-button": {
        color: "inherit"
      },
      " .pe-no-touch &": {
        ".pe-tabs--scrollable": {
          backgroundColor: "inherit"
        },
        " .pe-tabs__scroll-button": {
          backgroundColor: "inherit",
          " .pe-button__content": {
            backgroundColor: "inherit"
          }
        }
      }
    })];
  }
};

var tintFns$1 = function tintFns(tint) {
  return _defineProperty({}, "color_" + tint + "_tab_indicator", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-tabs__indicator": {
        backgroundColor: vars["color_" + tint + "_tab_indicator"]
      }
    })];
  });
};

var lightTintFns$1 = _extends({}, generalFns$1, tintFns$1("light"));

var darkTintFns$1 = _extends({}, generalFns$1, tintFns$1("dark"));

var tabsColor = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns$1,
    darkTintFns: darkTintFns$1
  }
});
exports.tabsColor = tabsColor;

var alignSide = function alignSide(isRTL) {
  return function () {
    return {
      " .pe-tabs__indicator": _defineProperty({
        transformOrigin: isRTL ? "right 50%" : "left 50%"
      }, isRTL ? "right" : "left", 0)
    };
  };
};

var alignLeft = alignSide(false);
var alignRight = alignSide(true);

var _tabs_indent = function tabs_indent(selector, vars, isRTL) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-tabs__row": {
      ".pe-tabs__row--indent": _defineProperty({}, isRTL ? "paddingRight" : "paddingLeft", vars.tabs_indent + "px")
    }
  });
};

var varFns$1 = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, [alignLeft(), {
      userSelect: "none",
      "-moz-user-select": "none",
      transform: "translate3d(0,0,0)",
      "-webkit-overflow-scrolling": "touch",
      "& ::-webkit-scrollbar": {
        "display": "none"
      },
      ".pe-tabs--scrollable": {
        display: "flex",
        "-ms-overflow-style": "none",
        " .pe-tabs__scroll-button": {
          // default hide, show with html.pe-no-touch
          display: "none"
        },
        " .pe-tabs__tab": {
          minWidth: 0
        }
      },
      " .pe-no-touch &": {
        " .pe-tabs__scroll-button": {
          position: "relative",
          display: "block",
          zIndex: 1,
          borderRadius: 0,
          " .pe-button__content": {
            borderRadius: 0,
            transitionProperty: "all",
            transitionTimingFunction: "ease-in-out"
          }
        },
        ".pe-tabs--start .pe-tabs__scroll-button-start": {
          pointerEvents: "none",
          cursor: "default",
          opacity: 0
        },
        ".pe-tabs--end .pe-tabs__scroll-button-end": {
          pointerEvents: "none",
          cursor: "default",
          opacity: 0
        }
      },
      " .pe-tabs__row": [_polytheneCoreCss.flex.layoutHorizontal, {
        userSelect: "none",
        "-moz-user-select": "none",
        position: "relative",
        whiteSpace: "nowrap",
        ".pe-tabs__row--indent": {
          margin: 0,
          overflow: "auto"
        },
        ".pe-tabs__row--centered": _polytheneCoreCss.flex.layoutCenterJustified
      }],
      " .pe-tabs__scroll-button-offset": [_polytheneCoreCss.flex.flex(), _polytheneCoreCss.flex.flexIndex("none")],
      " .pe-tabs__indicator": {
        transform: "translate3d(0,0,0)",
        // transformOrigin set in alignSide
        transitionProperty: "all",
        transitionTimingFunction: "ease-in-out",
        position: "absolute",
        zIndex: 1,
        bottom: 0,
        // left/right set in alignSide
        width: "100%",
        // and transformed with js
        // background-color defined in implementation/theme css
        opacity: 0 // set to 1 in js

      },
      " .pe-toolbar--tabs .pe-toolbar__bar &": [_polytheneCoreCss.mixin.fit(), {
        width: "auto",
        margin: 0,
        top: "auto"
      }]
    }]), _defineProperty({}, "*[dir=rtl] ".concat(selector, ", .pe-rtl ").concat(selector), [alignRight()])];
  },
  tabs_indent: function tabs_indent(selector, vars) {
    return [_tabs_indent(selector, vars, false), _tabs_indent((0, _polytheneCoreCss.selectorRTL)(selector), vars, true)];
  },
  tab_height: function tab_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-tabs--scrollable": {
        display: "flex",
        // hide scrollbar (this approach is required for Firefox)
        "max-height": vars.tab_height + "px"
      }
    })];
  },
  scrollbar_offset: function scrollbar_offset(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-tabs--scrollable": {
        " .pe-tabs__row": {
          marginBottom: -vars.scrollbar_offset + "px"
        }
      }
    })];
  },
  scroll_button_size: function scroll_button_size(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-no-touch &": {
        " .pe-tabs__scroll-button": {
          width: vars.scroll_button_size + "px",
          height: vars.scroll_button_size + "px"
        }
      }
    })];
  },
  scroll_button_fade_duration: function scroll_button_fade_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-no-touch &": {
        " .pe-tabs__scroll-button": {
          " .pe-button__content": {
            transitionDuration: vars.scroll_button_fade_duration
          }
        }
      }
    })];
  },
  scroll_button_fade_delay: function scroll_button_fade_delay(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-no-touch &": {
        " .pe-tabs__scroll-button": {
          " .pe-button__content": {
            transitionDelay: vars.scroll_button_fade_delay
          }
        }
      }
    })];
  },
  scroll_button_opacity: function scroll_button_opacity(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-no-touch &": {
        " .pe-tabs__scroll-button": {
          " .pe-button__content": {
            opacity: vars.scroll_button_opacity
          }
        }
      }
    })];
  },
  tab_indicator_height: function tab_indicator_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-tabs__indicator": {
        height: vars.tab_indicator_height + "px"
      }
    })];
  }
};
var tabsLayout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns$1
}); // @ts-check

exports.tabsLayout = tabsLayout;
var fontSize = _polytheneCssButton.textButtonVars.font_size;
var tab_label_line_height = 1.1 * fontSize;
var tab_height = 48;
var scroll_button_size = tab_height;
/**
 * @type {TabsVars} tabsVars
 */

var tabsVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  animation_duration: _polytheneCssButton.textButtonVars.animation_duration,
  indicator_slide_speed: 600,
  // px per second
  label_max_width: 264,
  menu_tab_height: 44,
  menu_tab_icon_label_height: 44,
  scroll_button_fade_delay: ".25s",
  scroll_button_fade_duration: ".2s",
  scroll_button_opacity: .7,
  scroll_button_size: scroll_button_size,
  scrollbar_offset: 0,
  tab_content_padding_v: 12,
  tab_height: tab_height,
  tab_icon_label_height: 72,
  tab_icon_label_icon_spacing: 7,
  tab_indicator_height: 2,
  tab_label_line_height: tab_label_line_height,
  tab_label_transition_property: "opacity, color, backgroundColor",
  tab_label_vertical_offset: tab_label_line_height - fontSize,
  tab_max_width: "initial",
  tab_menu_content_padding_v: 6,
  tab_min_width: 72,
  tab_min_width_tablet: 160,
  tabs_indent: 0,
  color_light_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_regular),
  color_light_selected: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_light_selected_background: "transparent",
  color_light_tab_indicator: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_light_icon: _polytheneCssIconButton.vars.color_light,
  color_dark_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_regular),
  color_dark_selected: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_dark_selected_background: "transparent",
  color_dark_tab_indicator: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_dark_icon: _polytheneCssIconButton.vars.color_dark // hover colors may be set in theme; disabled by default
  // color_light_hover:                    rgba(vars.color_light_foreground, vars.blend_light_text_primary),
  // color_light_hover_background:         "transparent",
  //
  // color_dark_hover:                     rgba(vars.color_dark_foreground, vars.blend_dark_text_primary),
  // color_dark_hover_background:          "transparent",

}; // @ts-check

exports.vars = tabsVars;
var tabsFns = [tabsLayout, tabsColor];
var tabFns = [tabLayout, tabColor];
var tabsSelector = ".".concat(classes.component);
var tabClass = "".concat(classes.tab, " pe-text-button pe-button");
var tabSelector = " .".concat(tabClass.replace(/ /g, "."));

var addStyle = function addStyle(customSelector, customVars) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$mediaQuery = _ref.mediaQuery,
      mediaQuery = _ref$mediaQuery === void 0 ? "" : _ref$mediaQuery,
      _ref$scope = _ref.scope,
      scope = _ref$scope === void 0 ? "" : _ref$scope;

  customSelector && _polytheneCoreCss.styler.addStyle({
    selectors: [customSelector, tabsSelector],
    fns: tabsFns,
    vars: tabsVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  });
  customSelector && _polytheneCoreCss.styler.addStyle({
    selectors: [customSelector, tabSelector],
    fns: tabFns,
    vars: tabsVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  });
};

exports.addStyle = addStyle;

var getStyle = function getStyle() {
  var customSelector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var customVars = arguments.length > 1 ? arguments[1] : undefined;

  var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref2$mediaQuery = _ref2.mediaQuery,
      mediaQuery = _ref2$mediaQuery === void 0 ? "" : _ref2$mediaQuery,
      _ref2$scope = _ref2.scope,
      scope = _ref2$scope === void 0 ? "" : _ref2$scope;

  return _polytheneCoreCss.styler.getStyle({
    selectors: [customSelector, tabsSelector],
    fns: tabsFns,
    vars: tabsVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  }).concat(_polytheneCoreCss.styler.getStyle({
    selectors: [customSelector, tabSelector],
    fns: tabFns,
    vars: tabsVars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  }));
};

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  _polytheneCoreCss.styler.addStyle({
    selectors: [tabsSelector],
    fns: tabsFns,
    vars: tabsVars
  });

  _polytheneCoreCss.styler.addStyle({
    selectors: [tabSelector],
    fns: tabFns,
    vars: tabsVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs","polythene-css-button":"../node_modules/polythene-css-button/dist/polythene-css-button.mjs","polythene-css-icon-button":"../node_modules/polythene-css-icon-button/dist/polythene-css-icon-button.mjs"}],"../node_modules/polythene-css-textfield/dist/polythene-css-textfield.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  component: "pe-textfield",
  // elements
  counter: "pe-textfield__counter",
  error: "pe-textfield__error",
  errorPlaceholder: "pe-textfield__error-placeholder",
  focusHelp: "pe-textfield__help-focus",
  help: "pe-textfield__help",
  input: "pe-textfield__input",
  inputArea: "pe-textfield__input-area",
  label: "pe-textfield__label",
  optionalIndicator: "pe-textfield__optional-indicator",
  requiredIndicator: "pe-textfield__required-indicator",
  // states
  hasCounter: "pe-textfield--counter",
  hasFloatingLabel: "pe-textfield--floating-label",
  hasFullWidth: "pe-textfield--full-width",
  hideClear: "pe-textfield--hide-clear",
  hideSpinner: "pe-textfield--hide-spinner",
  hideValidation: "pe-textfield--hide-validation",
  isDense: "pe-textfield--dense",
  isRequired: "pe-textfield--required",
  stateDirty: "pe-textfield--dirty",
  stateDisabled: "pe-textfield--disabled",
  stateFocused: "pe-textfield--focused",
  stateInvalid: "pe-textfield--invalid",
  stateReadonly: "pe-textfield--readonly"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__input-area": {
        color: "inherit",
        "&:after": {
          backgroundColor: "currentcolor"
        }
      },
      ".pe-textfield--disabled, &.pe-textfield--readonly": {
        " .pe-textfield__input-area:after": {
          backgroundColor: "transparent"
        }
      },
      ".pe-textfield--invalid:not(.pe-textfield--hide-validation)": {
        " .pe-textfield__input": {
          boxShadow: "none"
        }
      }
    })];
  }
};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_focus_border", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      color: vars["color_" + tint + "_focus_border"] // override by specifying "color"

    })];
  }), _defineProperty(_ref, "color_" + tint + "_input_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__input-area": {
        backgroundColor: vars["color_" + tint + "_input_background"]
      },
      " .pe-textfield__input:-webkit-autofill": {
        "-webkit-box-shadow": "0 0 0px 1000px " + vars["color_" + tint + "_input_background"] + " inset"
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_input_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__input": {
        color: vars["color_" + tint + "_input_text"]
      },
      " .pe-textfield__input:-webkit-autofill": {
        color: vars["color_" + tint + "_input_text"] + " !important"
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_counter_ok_border", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--counter ": {
        " .pe-textfield__input-area:after": {
          backgroundColor: vars["color_" + tint + "_counter_ok_border"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_input_bottom_border", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__input": {
        borderColor: vars["color_" + tint + "_input_bottom_border"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_label_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__label": {
        color: vars["color_" + tint + "_label_text"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_disabled_label_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--disabled, &.pe-textfield--readonly": {
        " .pe-textfield__input-area:after": {
          backgroundImage: "linear-gradient(to right, " + vars["color_" + tint + "_disabled_label_text"] + " 20%, rgba(255, 255, 255, 0) 0%)"
        }
      },
      ".pe-textfield--disabled": {
        " .pe-textfield__input, .pe-textfield__label": {
          color: vars["color_" + tint + "_disabled_label_text"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_readonly_label_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--readonly": {
        " .pe-textfield__input, .pe-textfield__label": {
          color: vars["color_" + tint + "_readonly_label_text"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_highlight_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--focused": {
        // note: not when textfield--dirty and not textfield--focused
        ".pe-textfield--floating-label .pe-textfield__label": {
          color: vars["color_" + tint + "_highlight_text"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_required_symbol", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--focused": {
        ".pe-textfield--required.pe-textfield--floating-label": {
          " .pe-textfield__required-indicator": {
            color: vars["color_" + tint + "_required_symbol"]
          }
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_help_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__help, .pe-textfield__counter": {
        color: vars["color_" + tint + "_help_text"]
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_input_error_border", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--invalid:not(.pe-textfield--hide-validation)": {
        " .pe-textfield__input": {
          borderColor: vars["color_" + tint + "_input_error_border"]
        },
        "&, &.pe-textfield--counter": {
          " .pe-textfield__input-area:after": {
            backgroundColor: vars["color_" + tint + "_input_error_border"]
          }
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_input_error_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--invalid:not(.pe-textfield--hide-validation)": {
        " .pe-textfield__label": {
          color: vars["color_" + tint + "_input_error_text"]
        },
        " .pe-textfield__error, .pe-textfield__counter, .pe-textfield__help": {
          color: vars["color_" + tint + "_input_error_text"]
        },
        ".pe-textfield--required .pe-textfield__label": {
          color: vars["color_" + tint + "_input_error_text"]
        }
      }
    })];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
});
exports.color = color;

var alignSide = function alignSide(isRTL) {
  return function () {
    return {
      " .pe-textfield__counter": {
        textAlign: isRTL ? "left" : "right",
        "float": isRTL ? "left" : "right",
        padding: isRTL ? "0 16px 0 0" : "0 0 0 16px"
      }
    };
  };
};

var alignLeft = alignSide(false);
var alignRight = alignSide(true);

var vertical_spacing_top_input_padding_v = function vertical_spacing_top_input_padding_v(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-textfield__label": {
      top: vars.vertical_spacing_top + vars.input_padding_v + "px"
    }
  });
};

var floating_label_vertical_spacing_top_input_padding_v = function floating_label_vertical_spacing_top_input_padding_v(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    ".pe-textfield--floating-label .pe-textfield__label": {
      top: vars.floating_label_vertical_spacing_top + vars.input_padding_v + "px"
    }
  });
};

var dense_floating_label_vertical_spacing_top_input_padding_v = function dense_floating_label_vertical_spacing_top_input_padding_v(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    ".pe-textfield--floating-label.pe-textfield--dense .pe-textfield__label": {
      top: vars.dense_floating_label_vertical_spacing_top + vars.input_padding_v + "px"
    }
  });
};

var input_padding_v_input_padding_h = function input_padding_v_input_padding_h(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    " .pe-textfield__input": {
      padding: vars.input_padding_v + "px " + vars.input_padding_h + "px"
    },
    " textarea.pe-textfield__input": {
      margin: vars.input_padding_v + "px " + vars.input_padding_h + "px"
    }
  });
};

var full_width_input_padding_v_full_width_input_padding_h = function full_width_input_padding_v_full_width_input_padding_h(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    ".pe-textfield--full-width": {
      " .pe-textfield__input": {
        padding: vars.full_width_input_padding_v + "px " + vars.full_width_input_padding_h + "px"
      }
    }
  });
};

var dense_full_width_input_padding_v_dense_full_width_input_padding_h = function dense_full_width_input_padding_v_dense_full_width_input_padding_h(selector, vars) {
  return (0, _polytheneCoreCss.sel)(selector, {
    ".pe-textfield--full-width.pe-textfield--dense": {
      " .pe-textfield__input": {
        padding: vars.dense_full_width_input_padding_v + "px " + vars.dense_full_width_input_padding_h + "px"
      }
    }
  });
};

var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, [alignLeft(), _polytheneCoreCss.mixin.clearfix(), {
      position: "relative",
      lineHeight: _polytheneTheme.vars.line_height,
      display: "inline-block",
      boxSizing: "border-box",
      margin: 0,
      overflow: "visible",
      // Firefox needs this
      width: "100%",
      maxWidth: "100%",
      " .pe-textfield__input-area": {
        position: "relative",
        "&:after": {
          position: "absolute",
          content: "\"\"",
          bottom: 0,
          left: 0,
          width: "100%",
          opacity: 0
        }
      },
      ".pe-textfield--focused .pe-textfield__input-area:after": {
        opacity: 1
      },
      " .pe-textfield__input": {
        display: "block",
        width: "100%",
        background: "none",
        color: "inherit",
        borderStyle: "none none solid none",
        borderRadius: 0,
        margin: 0,
        // disable glow on textfield--invalid fields
        "&:textfield--invalid": {
          boxShadow: "none"
        },
        ":invalid": {
          boxShadow: "none"
        },
        // Remove clear cross icon from IE
        "::-ms-clear": {
          width: 0,
          height: 0
        }
      },
      " textarea.pe-textfield__input": {
        padding: 0,
        display: "block"
      },
      // focus border
      ".pe-textfield--focused .pe-textfield__input": {
        outline: "none"
      },
      " .pe-textfield__label": {
        position: "absolute",
        display: "block",
        bottom: 0,
        pointerEvents: "none",
        whiteSpace: "nowrap",
        cursor: "text"
      },
      ".pe-textfield--dirty .pe-textfield__label": {
        visibility: "hidden"
      },
      "&:not(.pe-textfield--no-char)": {
        " .pe-textfield__required-indicator, .pe-textfield__optional-indicator": {
          padding: "0 0 0 .25em"
        }
      },
      ".pe-textfield--floating-label": {
        ".pe-textfield--focused, &.pe-textfield--dirty": {
          " .pe-textfield__label": {
            visibility: "visible"
          }
        }
      },
      ".pe-textfield--disabled, &.pe-textfield--readonly": {
        " .pe-textfield__label": {
          cursor: "auto"
        },
        " .pe-textfield__input": {
          "border-bottom": "none"
        },
        " .pe-textfield__input-area:after": {
          opacity: 1,
          height: "1px",
          bottom: "-1px",
          backgroundPosition: "top",
          backgroundSize: "4px 1px",
          backgroundRepeat: "repeat-x"
        }
      },
      " .pe-textfield__error, .pe-textfield__error-placeholder, .pe-textfield__help, .pe-textfield__counter": {
        lineHeight: _polytheneTheme.vars.line_height
      },
      " .pe-textfield__help-focus": [_polytheneCoreCss.mixin.defaultTransition("opacity"), {
        opacity: 0
      }],
      ".pe-textfield--focused .pe-textfield__help-focus, &.pe-textfield--dirty .pe-textfield__help-focus": {
        opacity: 1
      },
      ".pe-textfield--hide-clear": {
        " .pe-textfield__input::-ms-clear": {
          display: "none"
        }
      },
      ".pe-textfield--hide-spinner": {
        " input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button": {
          "-webkit-appearance": "none",
          margin: 0
        },
        " input[type=number]": {
          "-moz-appearance": "textfield"
        }
      },
      ".pe-textfield--full-width": {
        width: "100%",
        padding: 0,
        " .pe-textfield__input-area": {
          padding: 0
        }
      }
    }]), _defineProperty({}, "*[dir=rtl] ".concat(selector, ", .pe-rtl ").concat(selector), [alignRight()])];
  },
  vertical_spacing_bottom: function vertical_spacing_bottom(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      paddingBottom: vars.vertical_spacing_bottom + "px"
    })];
  },
  floating_label_vertical_spacing_bottom: function floating_label_vertical_spacing_bottom(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--floating-label": {
        paddingBottom: vars.floating_label_vertical_spacing_bottom + "px"
      },
      ".pe-textfield--dense": {
        paddingBottom: vars.dense_floating_label_vertical_spacing_bottom + "px"
      }
    })];
  },
  vertical_spacing_top: function vertical_spacing_top(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__input-area": {
        paddingTop: vars.vertical_spacing_top + "px"
      }
    }), vertical_spacing_top_input_padding_v(selector, vars)];
  },
  input_padding_v: function input_padding_v(selector, vars) {
    return [vertical_spacing_top_input_padding_v(selector, vars), floating_label_vertical_spacing_top_input_padding_v(selector, vars), dense_floating_label_vertical_spacing_top_input_padding_v(selector, vars), input_padding_v_input_padding_h(selector, vars)];
  },
  input_padding_h: function input_padding_h(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__label": {
        left: vars.input_padding_h + "px",
        right: vars.input_padding_h + "px"
      }
    }), input_padding_v_input_padding_h(selector, vars)];
  },
  floating_label_vertical_spacing_top: function floating_label_vertical_spacing_top(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--floating-label": {
        " .pe-textfield__input-area": {
          paddingTop: vars.floating_label_vertical_spacing_top + "px"
        }
      }
    }), floating_label_vertical_spacing_top_input_padding_v(selector, vars)];
  },
  dense_floating_label_vertical_spacing_top: function dense_floating_label_vertical_spacing_top(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--floating-label.pe-textfield--dense": {
        " .pe-textfield__input-area": {
          paddingTop: vars.dense_floating_label_vertical_spacing_top + "px"
        }
      }
    }), dense_floating_label_vertical_spacing_top_input_padding_v(selector, vars)];
  },
  input_focus_border_animation_duration: function input_focus_border_animation_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__input-area:after": _polytheneCoreCss.mixin.defaultTransition("opacity", vars.input_focus_border_animation_duration)
    })];
  },
  input_focus_border_width: function input_focus_border_width(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__input-area:after": {
        height: vars.input_focus_border_width + "px"
      }
    })];
  },
  font_size_error: function font_size_error(selector, vars$1) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__error, .pe-textfield__error-placeholder, .pe-textfield__help, .pe-textfield__counter": {
        fontSize: vars$1.font_size_error + "px",
        minHeight: vars$1.font_size_error * _polytheneTheme.vars.line_height + "px"
      }
    })];
  },
  font_size_input: function font_size_input(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__input, .pe-textfield__label": {
        fontSize: vars.font_size_input + "px"
      }
    })];
  },
  line_height_input: function line_height_input(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__input, .pe-textfield__label": {
        lineHeight: vars.line_height_input + "px"
      }
    })];
  },
  input_border_width: function input_border_width(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__input": {
        borderWidth: vars.input_border_width + "px"
      },
      // focus border
      ".pe-textfield--focused .pe-textfield__input": {
        borderWidth: vars.input_border_width + "px",
        outline: "none"
      }
    })];
  },
  full_width_input_padding_v: function full_width_input_padding_v(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--full-width": {
        " .pe-textfield__label": {
          top: vars.full_width_input_padding_v + "px"
        }
      }
    }), full_width_input_padding_v_full_width_input_padding_h(selector, vars)];
  },
  full_width_input_padding_h: function full_width_input_padding_h(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--full-width": {
        " .pe-textfield__error, .pe-textfield__help, .pe-textfield__counter": {
          paddingLeft: vars.full_width_input_padding_h + "px",
          paddingRight: vars.full_width_input_padding_h + "px"
        },
        " .pe-textfield__label": {
          left: vars.full_width_input_padding_h + "px",
          right: vars.full_width_input_padding_h + "px"
        }
      }
    }), full_width_input_padding_v_full_width_input_padding_h(selector, vars)];
  },
  dense_font_size_input: function dense_font_size_input(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--dense": {
        "&, .pe-textfield__input, .pe-textfield__label": {
          fontSize: vars.dense_font_size_input + "px"
        }
      }
    })];
  },
  dense_full_width_font_size_input: function dense_full_width_font_size_input(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--dense": {
        " .pe-textfield__input": {
          fontSize: vars.dense_full_width_font_size_input + "px"
        },
        " .pe-textfield__label": {
          fontSize: vars.dense_full_width_font_size_input + "px"
        }
      }
    })];
  },
  dense_full_width_input_padding_v: function dense_full_width_input_padding_v(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--full-width": {
        ".pe-textfield--dense": {
          " .pe-textfield__label": {
            top: vars.dense_full_width_input_padding_v + "px"
          }
        }
      }
    }), dense_full_width_input_padding_v_dense_full_width_input_padding_h(selector, vars)];
  },
  dense_full_width_input_padding_h: function dense_full_width_input_padding_h(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--full-width": {
        ".pe-textfield--dense": {
          " .pe-textfield__label": {
            left: vars.dense_full_width_input_padding_h + "px",
            right: vars.dense_full_width_input_padding_h + "px"
          }
        }
      }
    }), dense_full_width_input_padding_v_dense_full_width_input_padding_h(selector, vars)];
  },
  margin_top_error_message: function margin_top_error_message(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-textfield__error, .pe-textfield__error-placeholder, .pe-textfield__help, .pe-textfield__counter": {
        marginTop: vars.margin_top_error_message + "px"
      }
    })];
  },
  floating_label_animation_duration: function floating_label_animation_duration(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--floating-label": {
        " .pe-textfield__label": _polytheneCoreCss.mixin.defaultTransition("all", vars.floating_label_animation_duration)
      }
    })];
  },
  dense_font_size_floating_label: function dense_font_size_floating_label(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--floating-label": {
        ".pe-textfield--dense": {
          ".pe-textfield--focused, &.pe-textfield--dirty": {
            fontSize: vars.dense_font_size_floating_label + "px"
          }
        }
      }
    })];
  },
  dense_floating_label_top: function dense_floating_label_top(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--floating-label": {
        ".pe-textfield--dense": {
          ".pe-textfield--focused, &.pe-textfield--dirty": {
            " .pe-textfield__label": {
              top: vars.dense_floating_label_top + "px"
            }
          }
        }
      }
    })];
  },
  floating_label_top: function floating_label_top(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--floating-label": {
        ".pe-textfield--focused, &.pe-textfield--dirty": {
          " .pe-textfield__label": {
            top: vars.floating_label_top + "px"
          }
        }
      }
    })];
  },
  font_size_floating_label: function font_size_floating_label(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-textfield--floating-label": {
        ".pe-textfield--focused, &.pe-textfield--dirty": {
          " .pe-textfield__label": {
            fontSize: vars.font_size_floating_label + "px"
          }
        }
      }
    })];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

/**
 * @type {TextfieldVars} textfieldVars
 */

exports.layout = layout;
var textfieldVars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  dense_floating_label_top: 10,
  dense_floating_label_vertical_spacing_bottom: 4,
  // 8 minus natural label height padding (1)
  dense_floating_label_vertical_spacing_top: 23,
  // 12 + 8 + 4 minus natural label height padding (1)
  dense_font_size_floating_label: 13,
  dense_font_size_input: 13,
  dense_full_width_font_size_input: 13,
  dense_full_width_input_padding_h: 16,
  dense_full_width_input_padding_v: 15,
  // 16 minus natural label height padding (1)
  floating_label_animation_duration: ".12s",

  /**
   * Top position in pixels
   */
  floating_label_top: 14,
  floating_label_vertical_spacing_bottom: 7,
  // 8 minus natural label height padding (1)
  floating_label_vertical_spacing_top: 30,
  // 16 + 8 + 8 minus natural label height padding (2)
  font_size_error: 12,
  font_size_floating_label: 12,
  font_size_input: 16,
  full_width_input_padding_h: 20,
  full_width_input_padding_v: 18,
  // 20 minus natural label height padding (2)
  input_border_width: 1,
  input_focus_border_animation_duration: _polytheneTheme.vars.animation_duration,
  input_focus_border_width: 2,
  input_padding_h: 0,
  input_padding_v: 7,
  line_height_input: 20,
  margin_top_error_message: 6,
  vertical_spacing_bottom: 7,
  // 8 minus natural label height padding (1)
  vertical_spacing_top: 6,
  // 8 minus natural label height padding (1)
  color_light_input_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_primary),
  color_light_input_background: "transparent",
  // only used to "remove" autofill color
  color_light_highlight_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary, _polytheneTheme.vars.blend_light_text_primary),
  color_light_input_bottom_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_border_light),
  color_light_input_error_text: (0, _polytheneCoreCss.rgba)("221, 44, 0"),
  color_light_input_error_border: (0, _polytheneCoreCss.rgba)("221, 44, 0"),
  color_light_input_placeholder: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_tertiary),
  color_light_label_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_tertiary),
  color_light_disabled_label_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_disabled),
  color_light_readonly_label_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_tertiary),
  color_light_help_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_tertiary),
  color_light_required_symbol: (0, _polytheneCoreCss.rgba)("221, 44, 0"),
  color_light_focus_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_light_counter_ok_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_dark_input_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_primary),
  color_dark_input_background: "transparent",
  // only used to "remove" autofill color
  color_dark_highlight_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary, _polytheneTheme.vars.blend_dark_text_primary),
  color_dark_input_bottom_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_border_light),
  color_dark_input_error_text: (0, _polytheneCoreCss.rgba)("222, 50, 38"),
  color_dark_input_error_border: (0, _polytheneCoreCss.rgba)("222, 50, 38"),
  color_dark_input_placeholder: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_tertiary),
  color_dark_label_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_tertiary),
  color_dark_disabled_label_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_disabled),
  color_dark_readonly_label_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_tertiary),
  color_dark_help_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_tertiary),
  color_dark_required_symbol: (0, _polytheneCoreCss.rgba)("221, 44, 0"),
  color_dark_focus_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary),
  color_dark_counter_ok_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_primary)
}; // @ts-check

exports.vars = textfieldVars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, textfieldVars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, textfieldVars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: textfieldVars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-toolbar/dist/polythene-css-toolbar.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.layout = exports.getStyle = exports.color = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

var _polytheneTheme = require("polythene-theme");

var classes = {
  // Toolbar
  component: "pe-toolbar",
  // states
  compact: "pe-toolbar--compact",
  appBar: "pe-toolbar--app-bar",
  // Toolbar title
  // elements
  title: "pe-toolbar__title",
  // states
  centeredTitle: "pe-toolbar__title--center",
  indentedTitle: "pe-toolbar__title--indent",
  fullbleed: "pe-toolbar--fullbleed",
  border: "pe-toolbar--border"
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var generalFns = {
  general_styles: function general_styles(selector) {
    return [];
  } // eslint-disable-line no-unused-vars

};

var tintFns = function tintFns(tint) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "color_" + tint + "_text", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " .pe-toolbar__title": {
        "&, a:link, a:visited": {
          color: vars["color_" + tint + "_text"]
        }
      }
    })];
  }), _defineProperty(_ref, "color_" + tint + "_background", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      backgroundColor: vars["color_" + tint + "_background"]
    })];
  }), _defineProperty(_ref, "color_" + tint + "_border", function (selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-toolbar--border": {
        borderColor: vars["color_" + tint + "_border"]
      }
    })];
  }), _ref;
};

var lightTintFns = _extends({}, generalFns, tintFns("light"));

var darkTintFns = _extends({}, generalFns, tintFns("dark"));

var color = (0, _polytheneCoreCss.createColor)({
  varFns: {
    lightTintFns: lightTintFns,
    darkTintFns: darkTintFns
  }
});
/**
 * 
 * @param {string} breakpointSel 
 */

exports.color = color;

var breakpoint = function breakpoint(breakpointSel) {
  return (
    /**
     * @param {string} selector
     * @param {object} o
     */
    function (selector, o) {
      return _defineProperty({}, breakpointSel, _defineProperty({}, selector, o));
    }
  );
};
/**
 * @param {object} params
 * @param {string} params.selector
 * @param {object} params.vars
 * @param {boolean} [params.isRTL]
 * @param {boolean} [params.isLarge]
 */


var indent_padding_side = function indent_padding_side(_ref2) {
  var _peToolbar__title;

  var selector = _ref2.selector,
      vars = _ref2.vars,
      isRTL = _ref2.isRTL,
      isLarge = _ref2.isLarge;
  var indent = isLarge ? vars.indent_large : vars.indent;
  var fn = isLarge ? breakpointTabletPortraitUp : _polytheneCoreCss.sel;
  return fn(selector, {
    " .pe-toolbar__title--indent, .pe-toolbar__title.pe-toolbar__title--indent": (_peToolbar__title = {}, _defineProperty(_peToolbar__title, isRTL ? "marginLeft" : "marginRight", 0), _defineProperty(_peToolbar__title, isRTL ? "marginRight" : "marginLeft", indent + "px"), _peToolbar__title)
  });
};
/**
 * @param {object} params
 * @param {string} params.selector
 * @param {object} params.vars
 * @param {boolean} [params.isRTL]
 * @param {boolean} [params.isLarge]
 */


var _title_padding = function title_padding(_ref3) {
  var _spanPeToolbar;

  var selector = _ref3.selector,
      vars = _ref3.vars,
      isRTL = _ref3.isRTL,
      isLarge = _ref3.isLarge;
  var title_padding = isLarge ? vars.title_padding_large : vars.title_padding;
  var fn = isLarge ? breakpointTabletPortraitUp : _polytheneCoreCss.sel;
  return fn(selector, {
    " > span, .pe-toolbar__title": (_spanPeToolbar = {}, _defineProperty(_spanPeToolbar, isRTL ? "marginLeft" : "marginRight", 0), _defineProperty(_spanPeToolbar, isRTL ? "marginRight" : "marginLeft", title_padding + "px"), _spanPeToolbar),
    " .pe-toolbar__title--center": {
      marginLeft: title_padding + "px",
      marginRight: title_padding + "px"
    }
  });
};
/**
 * @param {object} params
 * @param {string} params.selector
 * @param {object} params.vars
 * @param {boolean} [params.isRTL]
 * @param {boolean} [params.isLarge]
 */


var title_padding_title_after_icon_padding = function title_padding_title_after_icon_padding(_ref4) {
  var _notPeToolbar_;

  var selector = _ref4.selector,
      vars = _ref4.vars,
      isRTL = _ref4.isRTL,
      isLarge = _ref4.isLarge;
  var padding = isLarge ? vars.title_after_icon_padding_large : vars.title_after_icon_padding;
  var fn = isLarge ? breakpointTabletPortraitUp : _polytheneCoreCss.sel;
  return fn(selector, {
    " > :not(.pe-toolbar__title):first-child:not(.pe-toolbar__title--indent):first-child": (_notPeToolbar_ = {}, _defineProperty(_notPeToolbar_, isRTL ? "marginRight" : "marginLeft", 0), _defineProperty(_notPeToolbar_, isRTL ? "marginLeft" : "marginRight", padding + "px"), _notPeToolbar_)
  });
};

var breakpointPhoneOnly = breakpoint("@media (min-width: ".concat(_polytheneTheme.vars.breakpoint_for_phone_only, "px) and (orientation: landscape)"));
var breakpointTabletPortraitUp = breakpoint("@media (min-width: ".concat(_polytheneTheme.vars.breakpoint_for_tablet_portrait_up, "px)"));
var varFns = {
  general_styles: function general_styles(selector) {
    return [(0, _polytheneCoreCss.sel)(selector, [_polytheneCoreCss.flex.layout, _polytheneCoreCss.flex.layoutHorizontal, _polytheneCoreCss.flex.layoutCenter, {
      position: "relative",
      zIndex: _polytheneTheme.vars.z_toolbar,
      " > a": {
        textDecoration: "none"
      },
      ".pe-toolbar--fullbleed": {
        padding: 0
      },
      ".pe-toolbar--border": {
        borderWidth: "1px",
        borderStyle: "none none solid none"
      },
      " > *": {
        flexShrink: 0
      },
      " > span, .pe-toolbar__title, .pe-toolbar__title--indent": {
        width: "100%",
        display: "block",
        wordBreak: "break-all",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        flexShrink: 1
      },
      " .pe-toolbar__title--center": {
        textAlign: "center",
        justifyContent: "center"
      },
      " > .pe-action": {
        paddingLeft: "12px",
        paddingRight: "12px"
      },
      " .pe-fit": [_polytheneCoreCss.mixin.fit(), {
        margin: 0
      }]
    }])];
  },
  height: function height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      height: vars.height + "px"
    })];
  },
  height_compact: function height_compact(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      ".pe-toolbar--compact": {
        height: vars.height_compact + "px"
      }
    }), breakpointPhoneOnly(selector, {
      height: vars.height + "px"
    })];
  },
  line_height: function line_height(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      lineHeight: vars.line_height + "em",
      " > span, .pe-toolbar__title, .pe-toolbar__title--indent": {
        lineHeight: vars.line_height
      }
    })];
  },
  font_size: function font_size(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " > span, .pe-toolbar__title, .pe-toolbar__title--indent, .pe-action": {
        fontSize: vars.font_size + "px"
      }
    })];
  },
  font_weight: function font_weight(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      " > span, .pe-toolbar__title, .pe-toolbar__title--indent": {
        fontWeight: vars.font_weight
      }
    })];
  },
  padding_side: function padding_side(selector, vars) {
    return [(0, _polytheneCoreCss.sel)(selector, {
      padding: "0 " + vars.padding_side + "px"
    }), indent_padding_side({
      selector: selector,
      vars: vars
    }), indent_padding_side({
      selector: (0, _polytheneCoreCss.selectorRTL)(selector),
      vars: vars,
      isRTL: true
    })];
  },
  indent: function indent(selector, vars) {
    return [indent_padding_side({
      selector: selector,
      vars: vars
    }), indent_padding_side({
      selector: (0, _polytheneCoreCss.selectorRTL)(selector),
      vars: vars,
      isRTL: true
    })];
  },
  indent_large: function indent_large(selector, vars) {
    return [indent_padding_side({
      selector: selector,
      vars: vars,
      isLarge: true
    }), indent_padding_side({
      selector: (0, _polytheneCoreCss.selectorRTL)(selector),
      vars: vars,
      isRTL: true,
      isLarge: true
    })];
  },
  title_padding: function title_padding(selector, vars) {
    return [_title_padding({
      selector: selector,
      vars: vars
    }), _title_padding({
      selector: (0, _polytheneCoreCss.selectorRTL)(selector),
      vars: vars,
      isRTL: true
    })];
  },
  title_padding_large: function title_padding_large(selector, vars) {
    return [_title_padding({
      selector: selector,
      vars: vars,
      isLarge: true
    }), _title_padding({
      selector: (0, _polytheneCoreCss.selectorRTL)(selector),
      vars: vars,
      isRTL: true,
      isLarge: true
    })];
  },
  title_after_icon_padding: function title_after_icon_padding(selector, vars) {
    return [title_padding_title_after_icon_padding({
      selector: selector,
      vars: vars
    }), title_padding_title_after_icon_padding({
      selector: (0, _polytheneCoreCss.selectorRTL)(selector),
      vars: vars,
      isRTL: true
    })];
  },
  title_after_icon_padding_large: function title_after_icon_padding_large(selector, vars) {
    return [title_padding_title_after_icon_padding({
      selector: selector,
      vars: vars,
      isLarge: true
    }), title_padding_title_after_icon_padding({
      selector: (0, _polytheneCoreCss.selectorRTL)(selector),
      vars: vars,
      isRTL: true,
      isLarge: true
    })];
  },
  height_large: function height_large(selector, vars) {
    return [breakpointTabletPortraitUp(selector, {
      height: vars.height_large + "px"
    })];
  },
  padding_side_large: function padding_side_large(selector, vars) {
    return [breakpointTabletPortraitUp(selector, {
      padding: "0 " + vars.padding_side_large + "px"
    })];
  }
};
var layout = (0, _polytheneCoreCss.createLayout)({
  varFns: varFns
}); // @ts-check

exports.layout = layout;
var padding_side = _polytheneTheme.vars.grid_unit_component * 2 - 12; // 16 - 12 = 4

var padding_side_large = _polytheneTheme.vars.grid_unit_component * 3 - 12; // 24 - 12 = 12

var vars = {
  /**
   * Generate general styles, not defined by variables
   */
  general_styles: true,
  font_size: 20,
  font_weight: 400,
  height: _polytheneTheme.vars.grid_unit_component * 7,
  // 56
  height_compact: _polytheneTheme.vars.grid_unit_component * 6,
  // 48
  height_large: _polytheneTheme.vars.grid_unit_component * 8,
  // 64
  line_height: _polytheneTheme.vars.line_height,
  padding_side: padding_side,
  padding_side_large: padding_side_large,
  indent: _polytheneTheme.vars.unit_indent - padding_side,
  indent_large: _polytheneTheme.vars.unit_indent_large - padding_side_large,
  title_after_icon_padding: 4,
  title_after_icon_padding_large: 12,
  title_padding: 16,
  title_padding_large: 8,
  color_light_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_text_primary),
  color_light_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_foreground, _polytheneTheme.vars.blend_light_border_light),
  color_light_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_light_background),
  color_dark_text: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_text_primary),
  color_dark_border: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_foreground, _polytheneTheme.vars.blend_dark_border_light),
  color_dark_background: (0, _polytheneCoreCss.rgba)(_polytheneTheme.vars.color_dark_background)
}; // @ts-check

exports.vars = vars;
var fns = [layout, color];
var selector = ".".concat(classes.component);

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, vars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, vars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    selectors: [selector],
    fns: fns,
    vars: vars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs","polythene-theme":"../node_modules/polythene-theme/dist/polythene-theme.mjs"}],"../node_modules/polythene-css-core/dist/polythene-css-core.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vars = exports.reset = exports.getStyle = exports.addStyle = exports.addGeneralStyleToHead = void 0;

var _polytheneCoreCss = require("polythene-core-css");

// @ts-check
var reset = function () {
  return [{
    // apply a natural box layout model to all elements, but allow elements to change
    " html": {
      "box-sizing": "border-box"
    },
    " *, *:before, *:after": {
      "box-sizing": "inherit"
    },
    " *": [// remove tap highlight in mobile Safari
    {
      "-webkit-tap-highlight-color": "rgba(0,0,0,0)"
    }, {
      "-webkit-tap-highlight-color": "transparent" // For some Androids

    }],
    // Remove dotted link borders in Firefox
    " a, a:active, a:focus, input:active, *:focus": {
      outline: 0
    },
    // Mobile Safari: override default fading of disabled elements
    " input:disabled": {
      opacity: 1
    }
  }];
}; // @ts-check


exports.reset = reset;
var fns = [reset];
var selector = "";
var vars = {};
exports.vars = vars;

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, vars);

exports.addStyle = addStyle;

var getStyle = _polytheneCoreCss.styler.createGetStyle(selector, fns, vars);

exports.getStyle = getStyle;

var addGeneralStyleToHead = function addGeneralStyleToHead() {
  return _polytheneCoreCss.styler.addStyle({
    identifier: "pe-core",
    selectors: [selector],
    fns: fns,
    vars: vars
  });
};

exports.addGeneralStyleToHead = addGeneralStyleToHead;
},{"polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs"}],"../node_modules/polythene-css-typography/dist/polythene-css-typography.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStyle = exports.addTypography = exports.addStyle = exports.addRoboto = void 0;

var _polytheneStyle = require("polythene-style");

var _polytheneUtilities = require("polythene-utilities");

var _polytheneCoreCss = require("polythene-core-css");

// @ts-check
var robotoStyle = function robotoStyle() {
  return [{
    "html, body, button, input, select, textarea": {
      fontFamily: "Roboto, Helvetica, Arial, sans-serif"
    }
  }];
};

var loadRoboto = function loadRoboto() {
  return [{
    "@import": "url('https://fonts.googleapis.com/css?family=Roboto:400,400i,500,700')"
  }];
}; // @ts-check


var fontSize = 14;

var typography = function () {
  return [{
    " h1, h2, h3, h4, h5, h6, p": {
      margin: 0,
      padding: 0
    }
  }, {
    " h1, h2, h3, h4, h5, h6": {
      " small": {
        "font-weight": _polytheneStyle.vars.font_weight_normal,
        "line-height": _polytheneStyle.vars.line_height,
        "letter-spacing": "-0.02em",
        "font-size": "0.6em"
      }
    }
  }, {
    " h1": {
      "font-size": "56px",
      "font-weight": _polytheneStyle.vars.font_weight_normal,
      "line-height": _polytheneStyle.vars.line_height,
      "margin-top": "24px",
      "margin-bottom": "24px"
    }
  }, {
    " h2": {
      "font-size": "45px",
      "font-weight": _polytheneStyle.vars.font_weight_normal,
      "line-height": _polytheneStyle.vars.line_height,
      "margin-top": "24px",
      "margin-bottom": "24px"
    }
  }, {
    " h3": {
      "font-size": "34px",
      "font-weight": _polytheneStyle.vars.font_weight_normal,
      "line-height": _polytheneStyle.vars.line_height,
      "margin-top": "24px",
      "margin-bottom": "24px"
    }
  }, {
    " h4": {
      "font-size": "24px",
      "font-weight": _polytheneStyle.vars.font_weight_normal,
      "line-height": _polytheneStyle.vars.line_height,
      "-moz-osx-font-smoothing": "grayscale",
      "margin-top": "24px",
      "margin-bottom": "16px"
    }
  }, {
    " h5": {
      "font-size": "20px",
      "font-weight": _polytheneStyle.vars.font_weight_medium,
      "line-height": _polytheneStyle.vars.line_height,
      "letter-spacing": "-0.02em",
      "margin-top": "24px",
      "margin-bottom": "16px"
    }
  }, {
    " h6": {
      "font-size": "16px",
      "font-weight": _polytheneStyle.vars.font_weight_normal,
      "line-height": _polytheneStyle.vars.line_height,
      "letter-spacing": "0.04em",
      "margin-top": "24px",
      "margin-bottom": "16px"
    }
  }, {
    " html, body": {
      "font-size": fontSize + "px",
      "line-height": _polytheneStyle.vars.line_height,
      "font-weight": _polytheneStyle.vars.font_weight_normal
    },
    " p": {
      "font-size": fontSize + "px",
      "font-weight": _polytheneStyle.vars.font_weight_normal,
      "line-height": _polytheneStyle.vars.line_height,
      "letter-spacing": "0",
      "margin-bottom": "16px"
    },
    " blockquote": {
      "position": "relative",
      "font-size": "24px",
      "font-weight": _polytheneStyle.vars.font_weight_normal,
      "font-style": "italic",
      "line-height": _polytheneStyle.vars.line_height,
      "letter-spacing": "0.08em",
      "margin-top": "24px",
      "margin-bottom": "16px"
    },
    " ul, ol": {
      "font-size": fontSize + "px",
      "font-weight": _polytheneStyle.vars.font_weight_normal,
      "line-height": _polytheneStyle.vars.line_height,
      "letter-spacing": 0
    },
    " b, strong": {
      "font-weight": _polytheneStyle.vars.font_weight_medium
    }
  }];
}; // @ts-check


var fns = [robotoStyle, typography];
var fnsWithLoadRoboto = [loadRoboto, robotoStyle, typography]; // adds font import for written CSS

var selector = "";

var addStyle = _polytheneCoreCss.styler.createAddStyle(selector, fns, _polytheneStyle.vars);

exports.addStyle = addStyle;

var getStyle = function getStyle(customSelector, customVars) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$mediaQuery = _ref.mediaQuery,
      mediaQuery = _ref$mediaQuery === void 0 ? "" : _ref$mediaQuery,
      _ref$scope = _ref.scope,
      scope = _ref$scope === void 0 ? "" : _ref$scope;

  return _polytheneCoreCss.styler.getStyle({
    selectors: [customSelector, selector],
    fns: fnsWithLoadRoboto,
    vars: _polytheneStyle.vars,
    customVars: customVars,
    mediaQuery: mediaQuery,
    scope: scope
  });
};

exports.getStyle = getStyle;

var addRoboto = function addRoboto() {
  (0, _polytheneUtilities.addWebFont)("google", {
    families: ["Roboto:400,500,700,400italic:latin"]
  });
};

exports.addRoboto = addRoboto;

var addTypography = function addTypography() {
  addRoboto();

  _polytheneCoreCss.styler.add("pe-material-design-typography", fns.map(function (s) {
    return s();
  }));
};

exports.addTypography = addTypography;
},{"polythene-style":"../node_modules/polythene-style/dist/polythene-style.mjs","polythene-utilities":"../node_modules/polythene-utilities/dist/polythene-utilities.mjs","polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs"}],"../node_modules/polythene-css/dist/polythene-css.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "addRoboto", {
  enumerable: true,
  get: function () {
    return polytheneCssTypography.addRoboto;
  }
});
Object.defineProperty(exports, "addTypography", {
  enumerable: true,
  get: function () {
    return polytheneCssTypography.addTypography;
  }
});
Object.defineProperty(exports, "addLayoutStyles", {
  enumerable: true,
  get: function () {
    return _polytheneCoreCss.addLayoutStyles;
  }
});
exports.TypographyCSS = exports.CoreCSS = exports.ToolbarCSS = exports.TextFieldCSS = exports.TabsCSS = exports.SwitchCSS = exports.SVGCSS = exports.SnackbarCSS = exports.SliderCSS = exports.ShadowCSS = exports.SelectionControlCSS = exports.SearchCSS = exports.RippleCSS = exports.RadioButtonCSS = exports.NotificationCSS = exports.MenuCSS = exports.MaterialDesignSpinnerCSS = exports.MaterialDesignProgressSpinnerCSS = exports.ListTileCSS = exports.ListCSS = exports.IOSSpinnerCSS = exports.IconButtonCSS = exports.IconCSS = exports.FABCSS = exports.DrawerCSS = exports.DialogPaneCSS = exports.DialogCSS = exports.CheckboxCSS = exports.CardCSS = exports.ButtonGroupCSS = exports.ButtonCSS = exports.BaseSpinnerCSS = void 0;

var BaseSpinnerCSS = _interopRequireDefault(require("polythene-css-base-spinner"));

exports.BaseSpinnerCSS = BaseSpinnerCSS;

var ButtonCSS = _interopRequireDefault(require("polythene-css-button"));

exports.ButtonCSS = ButtonCSS;

var ButtonGroupCSS = _interopRequireDefault(require("polythene-css-button-group"));

exports.ButtonGroupCSS = ButtonGroupCSS;

var CardCSS = _interopRequireDefault(require("polythene-css-card"));

exports.CardCSS = CardCSS;

var CheckboxCSS = _interopRequireDefault(require("polythene-css-checkbox"));

exports.CheckboxCSS = CheckboxCSS;

var DialogCSS = _interopRequireDefault(require("polythene-css-dialog"));

exports.DialogCSS = DialogCSS;

var DialogPaneCSS = _interopRequireDefault(require("polythene-css-dialog-pane"));

exports.DialogPaneCSS = DialogPaneCSS;

var DrawerCSS = _interopRequireDefault(require("polythene-css-drawer"));

exports.DrawerCSS = DrawerCSS;

var FABCSS = _interopRequireDefault(require("polythene-css-fab"));

exports.FABCSS = FABCSS;

var IconCSS = _interopRequireDefault(require("polythene-css-icon"));

exports.IconCSS = IconCSS;

var IconButtonCSS = _interopRequireDefault(require("polythene-css-icon-button"));

exports.IconButtonCSS = IconButtonCSS;

var IOSSpinnerCSS = _interopRequireDefault(require("polythene-css-ios-spinner"));

exports.IOSSpinnerCSS = IOSSpinnerCSS;

var ListCSS = _interopRequireDefault(require("polythene-css-list"));

exports.ListCSS = ListCSS;

var ListTileCSS = _interopRequireDefault(require("polythene-css-list-tile"));

exports.ListTileCSS = ListTileCSS;

var MaterialDesignProgressSpinnerCSS = _interopRequireDefault(require("polythene-css-material-design-progress-spinner"));

exports.MaterialDesignProgressSpinnerCSS = MaterialDesignProgressSpinnerCSS;

var MaterialDesignSpinnerCSS = _interopRequireDefault(require("polythene-css-material-design-spinner"));

exports.MaterialDesignSpinnerCSS = MaterialDesignSpinnerCSS;

var MenuCSS = _interopRequireDefault(require("polythene-css-menu"));

exports.MenuCSS = MenuCSS;

var NotificationCSS = _interopRequireDefault(require("polythene-css-notification"));

exports.NotificationCSS = NotificationCSS;

var RadioButtonCSS = _interopRequireDefault(require("polythene-css-radio-button"));

exports.RadioButtonCSS = RadioButtonCSS;

var RippleCSS = _interopRequireDefault(require("polythene-css-ripple"));

exports.RippleCSS = RippleCSS;

var SearchCSS = _interopRequireDefault(require("polythene-css-search"));

exports.SearchCSS = SearchCSS;

var SelectionControlCSS = _interopRequireDefault(require("polythene-css-selection-control"));

exports.SelectionControlCSS = SelectionControlCSS;

var ShadowCSS = _interopRequireDefault(require("polythene-css-shadow"));

exports.ShadowCSS = ShadowCSS;

var SliderCSS = _interopRequireDefault(require("polythene-css-slider"));

exports.SliderCSS = SliderCSS;

var SnackbarCSS = _interopRequireDefault(require("polythene-css-snackbar"));

exports.SnackbarCSS = SnackbarCSS;

var SVGCSS = _interopRequireDefault(require("polythene-css-svg"));

exports.SVGCSS = SVGCSS;

var SwitchCSS = _interopRequireDefault(require("polythene-css-switch"));

exports.SwitchCSS = SwitchCSS;

var TabsCSS = _interopRequireDefault(require("polythene-css-tabs"));

exports.TabsCSS = TabsCSS;

var TextFieldCSS = _interopRequireDefault(require("polythene-css-textfield"));

exports.TextFieldCSS = TextFieldCSS;

var ToolbarCSS = _interopRequireDefault(require("polythene-css-toolbar"));

exports.ToolbarCSS = ToolbarCSS;

var CoreCSS = _interopRequireDefault(require("polythene-css-core"));

exports.CoreCSS = CoreCSS;

var polytheneCssTypography = _interopRequireDefault(require("polythene-css-typography"));

exports.TypographyCSS = polytheneCssTypography;

var _polytheneCoreCss = require("polythene-core-css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, BaseSpinnerCSS.addGeneralStyleToHead)();
(0, ButtonCSS.addGeneralStyleToHead)();
(0, ButtonGroupCSS.addGeneralStyleToHead)();
(0, CardCSS.addGeneralStyleToHead)();
(0, CheckboxCSS.addGeneralStyleToHead)();
(0, DialogCSS.addGeneralStyleToHead)();
(0, DialogPaneCSS.addGeneralStyleToHead)();
(0, DrawerCSS.addGeneralStyleToHead)();
(0, FABCSS.addGeneralStyleToHead)();
(0, IconCSS.addGeneralStyleToHead)();
(0, IconButtonCSS.addGeneralStyleToHead)();
(0, IOSSpinnerCSS.addGeneralStyleToHead)();
(0, ListCSS.addGeneralStyleToHead)();
(0, ListTileCSS.addGeneralStyleToHead)();
(0, MaterialDesignProgressSpinnerCSS.addGeneralStyleToHead)();
(0, MaterialDesignSpinnerCSS.addGeneralStyleToHead)();
(0, MenuCSS.addGeneralStyleToHead)();
(0, NotificationCSS.addGeneralStyleToHead)();
(0, RadioButtonCSS.addGeneralStyleToHead)();
(0, RippleCSS.addGeneralStyleToHead)();
(0, SearchCSS.addGeneralStyleToHead)();
(0, SelectionControlCSS.addGeneralStyleToHead)();
(0, ShadowCSS.addGeneralStyleToHead)();
(0, SliderCSS.addGeneralStyleToHead)();
(0, SnackbarCSS.addGeneralStyleToHead)();
(0, SVGCSS.addGeneralStyleToHead)();
(0, SwitchCSS.addGeneralStyleToHead)();
(0, TabsCSS.addGeneralStyleToHead)();
(0, TextFieldCSS.addGeneralStyleToHead)();
(0, ToolbarCSS.addGeneralStyleToHead)();
(0, CoreCSS.addGeneralStyleToHead)(); // Styles to optionally add to head
},{"polythene-css-base-spinner":"../node_modules/polythene-css-base-spinner/dist/polythene-css-base-spinner.mjs","polythene-css-button":"../node_modules/polythene-css-button/dist/polythene-css-button.mjs","polythene-css-button-group":"../node_modules/polythene-css-button-group/dist/polythene-css-button-group.mjs","polythene-css-card":"../node_modules/polythene-css-card/dist/polythene-css-card.mjs","polythene-css-checkbox":"../node_modules/polythene-css-checkbox/dist/polythene-css-checkbox.mjs","polythene-css-dialog":"../node_modules/polythene-css-dialog/dist/polythene-css-dialog.mjs","polythene-css-dialog-pane":"../node_modules/polythene-css-dialog-pane/dist/polythene-css-dialog-pane.mjs","polythene-css-drawer":"../node_modules/polythene-css-drawer/dist/polythene-css-drawer.mjs","polythene-css-fab":"../node_modules/polythene-css-fab/dist/polythene-css-fab.mjs","polythene-css-icon":"../node_modules/polythene-css-icon/dist/polythene-css-icon.mjs","polythene-css-icon-button":"../node_modules/polythene-css-icon-button/dist/polythene-css-icon-button.mjs","polythene-css-ios-spinner":"../node_modules/polythene-css-ios-spinner/dist/polythene-css-ios-spinner.mjs","polythene-css-list":"../node_modules/polythene-css-list/dist/polythene-css-list.mjs","polythene-css-list-tile":"../node_modules/polythene-css-list-tile/dist/polythene-css-list-tile.mjs","polythene-css-material-design-progress-spinner":"../node_modules/polythene-css-material-design-progress-spinner/dist/polythene-css-material-design-progress-spinner.mjs","polythene-css-material-design-spinner":"../node_modules/polythene-css-material-design-spinner/dist/polythene-css-material-design-spinner.mjs","polythene-css-menu":"../node_modules/polythene-css-menu/dist/polythene-css-menu.mjs","polythene-css-notification":"../node_modules/polythene-css-notification/dist/polythene-css-notification.mjs","polythene-css-radio-button":"../node_modules/polythene-css-radio-button/dist/polythene-css-radio-button.mjs","polythene-css-ripple":"../node_modules/polythene-css-ripple/dist/polythene-css-ripple.mjs","polythene-css-search":"../node_modules/polythene-css-search/dist/polythene-css-search.mjs","polythene-css-selection-control":"../node_modules/polythene-css-selection-control/dist/polythene-css-selection-control.mjs","polythene-css-shadow":"../node_modules/polythene-css-shadow/dist/polythene-css-shadow.mjs","polythene-css-slider":"../node_modules/polythene-css-slider/dist/polythene-css-slider.mjs","polythene-css-snackbar":"../node_modules/polythene-css-snackbar/dist/polythene-css-snackbar.mjs","polythene-css-svg":"../node_modules/polythene-css-svg/dist/polythene-css-svg.mjs","polythene-css-switch":"../node_modules/polythene-css-switch/dist/polythene-css-switch.mjs","polythene-css-tabs":"../node_modules/polythene-css-tabs/dist/polythene-css-tabs.mjs","polythene-css-textfield":"../node_modules/polythene-css-textfield/dist/polythene-css-textfield.mjs","polythene-css-toolbar":"../node_modules/polythene-css-toolbar/dist/polythene-css-toolbar.mjs","polythene-css-core":"../node_modules/polythene-css-core/dist/polythene-css-core.mjs","polythene-css-typography":"../node_modules/polythene-css-typography/dist/polythene-css-typography.mjs","polythene-core-css":"../node_modules/polythene-core-css/dist/polythene-core-css.mjs"}],"../form/LoginSimple.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoginSimple = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _polytheneMithril = require("polythene-mithril");

require("polythene-css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LoginSimple = {
  view: function view() {
    return (0, _mithril.default)(_polytheneMithril.DialogPane, {
      body: [(0, _mithril.default)(_polytheneMithril.TextField, {
        label: '账号',
        name: 'account',
        floatingLabel: true,
        required: true,
        maxlength: 11,
        minlength: 11
      }), // pattern:/^1[0-9](10)$/
      (0, _mithril.default)(_polytheneMithril.TextField, {
        label: '密码',
        type: 'password',
        floatingLabel: true,
        required: true,
        minlength: 4
      })],
      footerButtons: [(0, _mithril.default)(_polytheneMithril.IconButton, {
        label: '登录'
      })]
    });
  }
};
exports.LoginSimple = LoginSimple;
},{"mithril":"../node_modules/mithril/index.js","polythene-mithril":"../node_modules/polythene-mithril/dist/polythene-mithril.mjs","polythene-css":"../node_modules/polythene-css/dist/polythene-css.mjs"}],"form/loginSimple.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loginSimple = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _LoginSimple = require("../../form/LoginSimple");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loginSimple = {
  view: function view() {
    return (0, _mithril.default)(_LoginSimple.LoginSimple, {});
  }
};
exports.loginSimple = loginSimple;
},{"mithril":"../node_modules/mithril/index.js","../../form/LoginSimple":"../form/LoginSimple.coffee"}],"form/resetPassword.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetPassword = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _ResetPassword = require("../../form/ResetPassword");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var resetPassword = {
  view: function view() {
    return (0, _mithril.default)(_ResetPassword.ResetPassword, {});
  }
};
exports.resetPassword = resetPassword;
},{}],"../layout/drawer.coffee":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _polytheneMithril = require("polythene-mithril");

require("polythene-css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var iconMenuSVG;
iconMenuSVG = '<svg width="24" height="24" viewBox="0 0 24 24"> <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/> </svg>';
var _default = {
  oninit: function oninit(_ref) {
    var state = _ref.state,
        attrs = _ref.attrs;
    state.showDrawer = false;
    return state.navList = attrs.navList || [];
  },
  view: function view(_ref2) {
    var state = _ref2.state,
        attrs = _ref2.attrs,
        children = _ref2.children;
    return (0, _mithril.default)('.warp', {}, [(0, _mithril.default)(_polytheneMithril.Toolbar, {
      border: true
    }, [(0, _mithril.default)(_polytheneMithril.IconButton, {
      icon: {
        svg: {
          content: _mithril.default.trust(iconMenuSVG)
        }
      },
      events: {
        onclick: function onclick() {
          return state.showDrawer = !state.showDrawer;
        }
      }
    }), (0, _mithril.default)("div", {
      className: "pe-toolbar__title"
    }, attrs.title), attrs.right ? (0, _mithril.default)('.right', 'uc') : void 0]), (0, _mithril.default)('', {
      style: {
        position: "relative"
      }
    }, [// overflow: "hidden"
    (0, _mithril.default)('.drawer-warp', {
      style: {
        display: "flex",
        height: "100%",
        background: "#fff"
      }
    }, [// color: "#333"
    (0, _mithril.default)(_polytheneMithril.Drawer, {
      push: true,
      border: true,
      mini: true,
      className: "small-screen-cover-drawer medium-screen-mini-drawer large-screen-floating-drawer",
      show: state.showDrawer,
      content: (0, _mithril.default)(_polytheneMithril.List, {
        tiles: state.navList.map(function (_ref3) {
          var title = _ref3.title,
              icon = _ref3.icon;
          return (0, _mithril.default)(_polytheneMithril.ListTile, {
            title: title,
            front: (0, _mithril.default)(_polytheneMithril.Icon, {
              svg: {
                content: _mithril.default.trust(icon)
              }
            }),
            hoverable: true,
            navigation: true
          });
        })
      }),
      // events: {
      //   onclick: navItemClick
      // }
      //   navigationList({
      //   handleClick: () -> state.showDrawer = false
      // }),
      didHide: function didHide() {
        return state.showDrawer = false;
      }
    }), (0, _mithril.default)(".content", {
      style: {
        overflow: "hidden",
        flexShrink: 0,
        flexGrow: 0,
        width: "100%"
      }
    }, children)])])]);
  }
};
exports.default = _default;
},{"mithril":"../node_modules/mithril/index.js","polythene-mithril":"../node_modules/polythene-mithril/dist/polythene-mithril.mjs","polythene-css":"../node_modules/polythene-css/dist/polythene-css.mjs"}],"layout/drawer.coffee":[function(require,module,exports) {
"use strict";

var _mithril = _interopRequireDefault(require("mithril"));

var _drawer = _interopRequireDefault(require("../../layout/drawer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  view: function view() {
    return (0, _mithril.default)(_drawer.default, {
      title: '标题',
      navList: [{
        title: 'a',
        icon: 'b'
      }, {
        title: 'b',
        icon: 'b'
      }, {
        title: 'c',
        icon: 'b'
      }]
    }, 11111111111111);
  }
};
},{"mithril":"../node_modules/mithril/index.js","../../layout/drawer":"../layout/drawer.coffee"}],"app.coffee":[function(require,module,exports) {
"use strict";

var _mithril = _interopRequireDefault(require("mithril"));

var _loginSimple = require("./form/loginSimple");

var _resetPassword = require("./form/resetPassword");

var _drawer = _interopRequireDefault(require("./layout/drawer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mithril.default.route(document.body, '/form/loginSimple', {
  // "/",
  "/layout/drawer": _drawer.default,
  "/form/loginSimple": _loginSimple.loginSimple,
  "/form/resetPassword": _resetPassword.resetPassword
});
},{"mithril":"../node_modules/mithril/index.js","./form/loginSimple":"form/loginSimple.coffee","./form/resetPassword":"form/resetPassword.coffee","./layout/drawer":"layout/drawer.coffee"}],"../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "63135" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","app.coffee"], null)
//# sourceMappingURL=/app.8d9ade91.js.map