(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.EBANX = {}));
}(this, (function (exports) { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getAugmentedNamespace(n) {
		if (n.__esModule) return n;
		var a = Object.defineProperty({}, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	function createCommonjsModule(fn) {
	  var module = { exports: {} };
		return fn(module, module.exports), module.exports;
	}

	/*! *****************************************************************************
	Copyright (C) Microsoft. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */

	var Reflect$1;
	(function (Reflect) {
	    // Metadata Proposal
	    // https://rbuckton.github.io/reflect-metadata/
	    (function (factory) {
	        var root = typeof commonjsGlobal === "object" ? commonjsGlobal :
	            typeof self === "object" ? self :
	                typeof this === "object" ? this :
	                    Function("return this;")();
	        var exporter = makeExporter(Reflect);
	        if (typeof root.Reflect === "undefined") {
	            root.Reflect = Reflect;
	        }
	        else {
	            exporter = makeExporter(root.Reflect, exporter);
	        }
	        factory(exporter);
	        function makeExporter(target, previous) {
	            return function (key, value) {
	                if (typeof target[key] !== "function") {
	                    Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
	                }
	                if (previous)
	                    previous(key, value);
	            };
	        }
	    })(function (exporter) {
	        var hasOwn = Object.prototype.hasOwnProperty;
	        // feature test for Symbol support
	        var supportsSymbol = typeof Symbol === "function";
	        var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
	        var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
	        var supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
	        var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
	        var downLevel = !supportsCreate && !supportsProto;
	        var HashMap = {
	            // create an object in dictionary mode (a.k.a. "slow" mode in v8)
	            create: supportsCreate
	                ? function () { return MakeDictionary(Object.create(null)); }
	                : supportsProto
	                    ? function () { return MakeDictionary({ __proto__: null }); }
	                    : function () { return MakeDictionary({}); },
	            has: downLevel
	                ? function (map, key) { return hasOwn.call(map, key); }
	                : function (map, key) { return key in map; },
	            get: downLevel
	                ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
	                : function (map, key) { return map[key]; },
	        };
	        // Load global or shim versions of Map, Set, and WeakMap
	        var functionPrototype = Object.getPrototypeOf(Function);
	        var usePolyfill = typeof process === "object" && process.env && process.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
	        var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
	        var _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
	        var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
	        // [[Metadata]] internal slot
	        // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
	        var Metadata = new _WeakMap();
	        /**
	         * Applies a set of decorators to a property of a target object.
	         * @param decorators An array of decorators.
	         * @param target The target object.
	         * @param propertyKey (Optional) The property key to decorate.
	         * @param attributes (Optional) The property descriptor for the target key.
	         * @remarks Decorators are applied in reverse order.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     Example = Reflect.decorate(decoratorsArray, Example);
	         *
	         *     // property (on constructor)
	         *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     Object.defineProperty(Example, "staticMethod",
	         *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
	         *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
	         *
	         *     // method (on prototype)
	         *     Object.defineProperty(Example.prototype, "method",
	         *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
	         *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
	         *
	         */
	        function decorate(decorators, target, propertyKey, attributes) {
	            if (!IsUndefined(propertyKey)) {
	                if (!IsArray(decorators))
	                    throw new TypeError();
	                if (!IsObject(target))
	                    throw new TypeError();
	                if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
	                    throw new TypeError();
	                if (IsNull(attributes))
	                    attributes = undefined;
	                propertyKey = ToPropertyKey(propertyKey);
	                return DecorateProperty(decorators, target, propertyKey, attributes);
	            }
	            else {
	                if (!IsArray(decorators))
	                    throw new TypeError();
	                if (!IsConstructor(target))
	                    throw new TypeError();
	                return DecorateConstructor(decorators, target);
	            }
	        }
	        exporter("decorate", decorate);
	        // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
	        // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
	        /**
	         * A default metadata decorator factory that can be used on a class, class member, or parameter.
	         * @param metadataKey The key for the metadata entry.
	         * @param metadataValue The value for the metadata entry.
	         * @returns A decorator function.
	         * @remarks
	         * If `metadataKey` is already defined for the target and target key, the
	         * metadataValue for that key will be overwritten.
	         * @example
	         *
	         *     // constructor
	         *     @Reflect.metadata(key, value)
	         *     class Example {
	         *     }
	         *
	         *     // property (on constructor, TypeScript only)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         static staticProperty;
	         *     }
	         *
	         *     // property (on prototype, TypeScript only)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         property;
	         *     }
	         *
	         *     // method (on constructor)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         static staticMethod() { }
	         *     }
	         *
	         *     // method (on prototype)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         method() { }
	         *     }
	         *
	         */
	        function metadata(metadataKey, metadataValue) {
	            function decorator(target, propertyKey) {
	                if (!IsObject(target))
	                    throw new TypeError();
	                if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
	                    throw new TypeError();
	                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
	            }
	            return decorator;
	        }
	        exporter("metadata", metadata);
	        /**
	         * Define a unique metadata entry on the target.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param metadataValue A value that contains attached metadata.
	         * @param target The target object on which to define metadata.
	         * @param propertyKey (Optional) The property key for the target.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     Reflect.defineMetadata("custom:annotation", options, Example);
	         *
	         *     // property (on constructor)
	         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
	         *
	         *     // decorator factory as metadata-producing annotation.
	         *     function MyAnnotation(options): Decorator {
	         *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
	         *     }
	         *
	         */
	        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
	        }
	        exporter("defineMetadata", defineMetadata);
	        /**
	         * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.hasMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function hasMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryHasMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("hasMetadata", hasMetadata);
	        /**
	         * Gets a value indicating whether the target object has the provided metadata key defined.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function hasOwnMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("hasOwnMetadata", hasOwnMetadata);
	        /**
	         * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function getMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryGetMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("getMetadata", getMetadata);
	        /**
	         * Gets the metadata value for the provided metadata key on the target object.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function getOwnMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("getOwnMetadata", getOwnMetadata);
	        /**
	         * Gets the metadata keys defined on the target object or its prototype chain.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns An array of unique metadata keys.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getMetadataKeys(Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getMetadataKeys(Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getMetadataKeys(Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getMetadataKeys(Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getMetadataKeys(Example.prototype, "method");
	         *
	         */
	        function getMetadataKeys(target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryMetadataKeys(target, propertyKey);
	        }
	        exporter("getMetadataKeys", getMetadataKeys);
	        /**
	         * Gets the unique metadata keys defined on the target object.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns An array of unique metadata keys.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getOwnMetadataKeys(Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
	         *
	         */
	        function getOwnMetadataKeys(target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryOwnMetadataKeys(target, propertyKey);
	        }
	        exporter("getOwnMetadataKeys", getOwnMetadataKeys);
	        /**
	         * Deletes the metadata entry from the target object with the provided key.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns `true` if the metadata entry was found and deleted; otherwise, false.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.deleteMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function deleteMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            var metadataMap = GetOrCreateMetadataMap(target, propertyKey, /*Create*/ false);
	            if (IsUndefined(metadataMap))
	                return false;
	            if (!metadataMap.delete(metadataKey))
	                return false;
	            if (metadataMap.size > 0)
	                return true;
	            var targetMetadata = Metadata.get(target);
	            targetMetadata.delete(propertyKey);
	            if (targetMetadata.size > 0)
	                return true;
	            Metadata.delete(target);
	            return true;
	        }
	        exporter("deleteMetadata", deleteMetadata);
	        function DecorateConstructor(decorators, target) {
	            for (var i = decorators.length - 1; i >= 0; --i) {
	                var decorator = decorators[i];
	                var decorated = decorator(target);
	                if (!IsUndefined(decorated) && !IsNull(decorated)) {
	                    if (!IsConstructor(decorated))
	                        throw new TypeError();
	                    target = decorated;
	                }
	            }
	            return target;
	        }
	        function DecorateProperty(decorators, target, propertyKey, descriptor) {
	            for (var i = decorators.length - 1; i >= 0; --i) {
	                var decorator = decorators[i];
	                var decorated = decorator(target, propertyKey, descriptor);
	                if (!IsUndefined(decorated) && !IsNull(decorated)) {
	                    if (!IsObject(decorated))
	                        throw new TypeError();
	                    descriptor = decorated;
	                }
	            }
	            return descriptor;
	        }
	        function GetOrCreateMetadataMap(O, P, Create) {
	            var targetMetadata = Metadata.get(O);
	            if (IsUndefined(targetMetadata)) {
	                if (!Create)
	                    return undefined;
	                targetMetadata = new _Map();
	                Metadata.set(O, targetMetadata);
	            }
	            var metadataMap = targetMetadata.get(P);
	            if (IsUndefined(metadataMap)) {
	                if (!Create)
	                    return undefined;
	                metadataMap = new _Map();
	                targetMetadata.set(P, metadataMap);
	            }
	            return metadataMap;
	        }
	        // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
	        function OrdinaryHasMetadata(MetadataKey, O, P) {
	            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
	            if (hasOwn)
	                return true;
	            var parent = OrdinaryGetPrototypeOf(O);
	            if (!IsNull(parent))
	                return OrdinaryHasMetadata(MetadataKey, parent, P);
	            return false;
	        }
	        // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
	        function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
	            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
	            if (IsUndefined(metadataMap))
	                return false;
	            return ToBoolean(metadataMap.has(MetadataKey));
	        }
	        // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
	        function OrdinaryGetMetadata(MetadataKey, O, P) {
	            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
	            if (hasOwn)
	                return OrdinaryGetOwnMetadata(MetadataKey, O, P);
	            var parent = OrdinaryGetPrototypeOf(O);
	            if (!IsNull(parent))
	                return OrdinaryGetMetadata(MetadataKey, parent, P);
	            return undefined;
	        }
	        // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
	        function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
	            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
	            if (IsUndefined(metadataMap))
	                return undefined;
	            return metadataMap.get(MetadataKey);
	        }
	        // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
	        function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
	            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
	            metadataMap.set(MetadataKey, MetadataValue);
	        }
	        // 3.1.6.1 OrdinaryMetadataKeys(O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
	        function OrdinaryMetadataKeys(O, P) {
	            var ownKeys = OrdinaryOwnMetadataKeys(O, P);
	            var parent = OrdinaryGetPrototypeOf(O);
	            if (parent === null)
	                return ownKeys;
	            var parentKeys = OrdinaryMetadataKeys(parent, P);
	            if (parentKeys.length <= 0)
	                return ownKeys;
	            if (ownKeys.length <= 0)
	                return parentKeys;
	            var set = new _Set();
	            var keys = [];
	            for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
	                var key = ownKeys_1[_i];
	                var hasKey = set.has(key);
	                if (!hasKey) {
	                    set.add(key);
	                    keys.push(key);
	                }
	            }
	            for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
	                var key = parentKeys_1[_a];
	                var hasKey = set.has(key);
	                if (!hasKey) {
	                    set.add(key);
	                    keys.push(key);
	                }
	            }
	            return keys;
	        }
	        // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
	        function OrdinaryOwnMetadataKeys(O, P) {
	            var keys = [];
	            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
	            if (IsUndefined(metadataMap))
	                return keys;
	            var keysObj = metadataMap.keys();
	            var iterator = GetIterator(keysObj);
	            var k = 0;
	            while (true) {
	                var next = IteratorStep(iterator);
	                if (!next) {
	                    keys.length = k;
	                    return keys;
	                }
	                var nextValue = IteratorValue(next);
	                try {
	                    keys[k] = nextValue;
	                }
	                catch (e) {
	                    try {
	                        IteratorClose(iterator);
	                    }
	                    finally {
	                        throw e;
	                    }
	                }
	                k++;
	            }
	        }
	        // 6 ECMAScript Data Typ0es and Values
	        // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
	        function Type(x) {
	            if (x === null)
	                return 1 /* Null */;
	            switch (typeof x) {
	                case "undefined": return 0 /* Undefined */;
	                case "boolean": return 2 /* Boolean */;
	                case "string": return 3 /* String */;
	                case "symbol": return 4 /* Symbol */;
	                case "number": return 5 /* Number */;
	                case "object": return x === null ? 1 /* Null */ : 6 /* Object */;
	                default: return 6 /* Object */;
	            }
	        }
	        // 6.1.1 The Undefined Type
	        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
	        function IsUndefined(x) {
	            return x === undefined;
	        }
	        // 6.1.2 The Null Type
	        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
	        function IsNull(x) {
	            return x === null;
	        }
	        // 6.1.5 The Symbol Type
	        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
	        function IsSymbol(x) {
	            return typeof x === "symbol";
	        }
	        // 6.1.7 The Object Type
	        // https://tc39.github.io/ecma262/#sec-object-type
	        function IsObject(x) {
	            return typeof x === "object" ? x !== null : typeof x === "function";
	        }
	        // 7.1 Type Conversion
	        // https://tc39.github.io/ecma262/#sec-type-conversion
	        // 7.1.1 ToPrimitive(input [, PreferredType])
	        // https://tc39.github.io/ecma262/#sec-toprimitive
	        function ToPrimitive(input, PreferredType) {
	            switch (Type(input)) {
	                case 0 /* Undefined */: return input;
	                case 1 /* Null */: return input;
	                case 2 /* Boolean */: return input;
	                case 3 /* String */: return input;
	                case 4 /* Symbol */: return input;
	                case 5 /* Number */: return input;
	            }
	            var hint = PreferredType === 3 /* String */ ? "string" : PreferredType === 5 /* Number */ ? "number" : "default";
	            var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
	            if (exoticToPrim !== undefined) {
	                var result = exoticToPrim.call(input, hint);
	                if (IsObject(result))
	                    throw new TypeError();
	                return result;
	            }
	            return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
	        }
	        // 7.1.1.1 OrdinaryToPrimitive(O, hint)
	        // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
	        function OrdinaryToPrimitive(O, hint) {
	            if (hint === "string") {
	                var toString_1 = O.toString;
	                if (IsCallable(toString_1)) {
	                    var result = toString_1.call(O);
	                    if (!IsObject(result))
	                        return result;
	                }
	                var valueOf = O.valueOf;
	                if (IsCallable(valueOf)) {
	                    var result = valueOf.call(O);
	                    if (!IsObject(result))
	                        return result;
	                }
	            }
	            else {
	                var valueOf = O.valueOf;
	                if (IsCallable(valueOf)) {
	                    var result = valueOf.call(O);
	                    if (!IsObject(result))
	                        return result;
	                }
	                var toString_2 = O.toString;
	                if (IsCallable(toString_2)) {
	                    var result = toString_2.call(O);
	                    if (!IsObject(result))
	                        return result;
	                }
	            }
	            throw new TypeError();
	        }
	        // 7.1.2 ToBoolean(argument)
	        // https://tc39.github.io/ecma262/2016/#sec-toboolean
	        function ToBoolean(argument) {
	            return !!argument;
	        }
	        // 7.1.12 ToString(argument)
	        // https://tc39.github.io/ecma262/#sec-tostring
	        function ToString(argument) {
	            return "" + argument;
	        }
	        // 7.1.14 ToPropertyKey(argument)
	        // https://tc39.github.io/ecma262/#sec-topropertykey
	        function ToPropertyKey(argument) {
	            var key = ToPrimitive(argument, 3 /* String */);
	            if (IsSymbol(key))
	                return key;
	            return ToString(key);
	        }
	        // 7.2 Testing and Comparison Operations
	        // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
	        // 7.2.2 IsArray(argument)
	        // https://tc39.github.io/ecma262/#sec-isarray
	        function IsArray(argument) {
	            return Array.isArray
	                ? Array.isArray(argument)
	                : argument instanceof Object
	                    ? argument instanceof Array
	                    : Object.prototype.toString.call(argument) === "[object Array]";
	        }
	        // 7.2.3 IsCallable(argument)
	        // https://tc39.github.io/ecma262/#sec-iscallable
	        function IsCallable(argument) {
	            // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
	            return typeof argument === "function";
	        }
	        // 7.2.4 IsConstructor(argument)
	        // https://tc39.github.io/ecma262/#sec-isconstructor
	        function IsConstructor(argument) {
	            // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
	            return typeof argument === "function";
	        }
	        // 7.2.7 IsPropertyKey(argument)
	        // https://tc39.github.io/ecma262/#sec-ispropertykey
	        function IsPropertyKey(argument) {
	            switch (Type(argument)) {
	                case 3 /* String */: return true;
	                case 4 /* Symbol */: return true;
	                default: return false;
	            }
	        }
	        // 7.3 Operations on Objects
	        // https://tc39.github.io/ecma262/#sec-operations-on-objects
	        // 7.3.9 GetMethod(V, P)
	        // https://tc39.github.io/ecma262/#sec-getmethod
	        function GetMethod(V, P) {
	            var func = V[P];
	            if (func === undefined || func === null)
	                return undefined;
	            if (!IsCallable(func))
	                throw new TypeError();
	            return func;
	        }
	        // 7.4 Operations on Iterator Objects
	        // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
	        function GetIterator(obj) {
	            var method = GetMethod(obj, iteratorSymbol);
	            if (!IsCallable(method))
	                throw new TypeError(); // from Call
	            var iterator = method.call(obj);
	            if (!IsObject(iterator))
	                throw new TypeError();
	            return iterator;
	        }
	        // 7.4.4 IteratorValue(iterResult)
	        // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
	        function IteratorValue(iterResult) {
	            return iterResult.value;
	        }
	        // 7.4.5 IteratorStep(iterator)
	        // https://tc39.github.io/ecma262/#sec-iteratorstep
	        function IteratorStep(iterator) {
	            var result = iterator.next();
	            return result.done ? false : result;
	        }
	        // 7.4.6 IteratorClose(iterator, completion)
	        // https://tc39.github.io/ecma262/#sec-iteratorclose
	        function IteratorClose(iterator) {
	            var f = iterator["return"];
	            if (f)
	                f.call(iterator);
	        }
	        // 9.1 Ordinary Object Internal Methods and Internal Slots
	        // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
	        // 9.1.1.1 OrdinaryGetPrototypeOf(O)
	        // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
	        function OrdinaryGetPrototypeOf(O) {
	            var proto = Object.getPrototypeOf(O);
	            if (typeof O !== "function" || O === functionPrototype)
	                return proto;
	            // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
	            // Try to determine the superclass constructor. Compatible implementations
	            // must either set __proto__ on a subclass constructor to the superclass constructor,
	            // or ensure each class has a valid `constructor` property on its prototype that
	            // points back to the constructor.
	            // If this is not the same as Function.[[Prototype]], then this is definately inherited.
	            // This is the case when in ES6 or when using __proto__ in a compatible browser.
	            if (proto !== functionPrototype)
	                return proto;
	            // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
	            var prototype = O.prototype;
	            var prototypeProto = prototype && Object.getPrototypeOf(prototype);
	            if (prototypeProto == null || prototypeProto === Object.prototype)
	                return proto;
	            // If the constructor was not a function, then we cannot determine the heritage.
	            var constructor = prototypeProto.constructor;
	            if (typeof constructor !== "function")
	                return proto;
	            // If we have some kind of self-reference, then we cannot determine the heritage.
	            if (constructor === O)
	                return proto;
	            // we have a pretty good guess at the heritage.
	            return constructor;
	        }
	        // naive Map shim
	        function CreateMapPolyfill() {
	            var cacheSentinel = {};
	            var arraySentinel = [];
	            var MapIterator = /** @class */ (function () {
	                function MapIterator(keys, values, selector) {
	                    this._index = 0;
	                    this._keys = keys;
	                    this._values = values;
	                    this._selector = selector;
	                }
	                MapIterator.prototype["@@iterator"] = function () { return this; };
	                MapIterator.prototype[iteratorSymbol] = function () { return this; };
	                MapIterator.prototype.next = function () {
	                    var index = this._index;
	                    if (index >= 0 && index < this._keys.length) {
	                        var result = this._selector(this._keys[index], this._values[index]);
	                        if (index + 1 >= this._keys.length) {
	                            this._index = -1;
	                            this._keys = arraySentinel;
	                            this._values = arraySentinel;
	                        }
	                        else {
	                            this._index++;
	                        }
	                        return { value: result, done: false };
	                    }
	                    return { value: undefined, done: true };
	                };
	                MapIterator.prototype.throw = function (error) {
	                    if (this._index >= 0) {
	                        this._index = -1;
	                        this._keys = arraySentinel;
	                        this._values = arraySentinel;
	                    }
	                    throw error;
	                };
	                MapIterator.prototype.return = function (value) {
	                    if (this._index >= 0) {
	                        this._index = -1;
	                        this._keys = arraySentinel;
	                        this._values = arraySentinel;
	                    }
	                    return { value: value, done: true };
	                };
	                return MapIterator;
	            }());
	            return /** @class */ (function () {
	                function Map() {
	                    this._keys = [];
	                    this._values = [];
	                    this._cacheKey = cacheSentinel;
	                    this._cacheIndex = -2;
	                }
	                Object.defineProperty(Map.prototype, "size", {
	                    get: function () { return this._keys.length; },
	                    enumerable: true,
	                    configurable: true
	                });
	                Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
	                Map.prototype.get = function (key) {
	                    var index = this._find(key, /*insert*/ false);
	                    return index >= 0 ? this._values[index] : undefined;
	                };
	                Map.prototype.set = function (key, value) {
	                    var index = this._find(key, /*insert*/ true);
	                    this._values[index] = value;
	                    return this;
	                };
	                Map.prototype.delete = function (key) {
	                    var index = this._find(key, /*insert*/ false);
	                    if (index >= 0) {
	                        var size = this._keys.length;
	                        for (var i = index + 1; i < size; i++) {
	                            this._keys[i - 1] = this._keys[i];
	                            this._values[i - 1] = this._values[i];
	                        }
	                        this._keys.length--;
	                        this._values.length--;
	                        if (key === this._cacheKey) {
	                            this._cacheKey = cacheSentinel;
	                            this._cacheIndex = -2;
	                        }
	                        return true;
	                    }
	                    return false;
	                };
	                Map.prototype.clear = function () {
	                    this._keys.length = 0;
	                    this._values.length = 0;
	                    this._cacheKey = cacheSentinel;
	                    this._cacheIndex = -2;
	                };
	                Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
	                Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
	                Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
	                Map.prototype["@@iterator"] = function () { return this.entries(); };
	                Map.prototype[iteratorSymbol] = function () { return this.entries(); };
	                Map.prototype._find = function (key, insert) {
	                    if (this._cacheKey !== key) {
	                        this._cacheIndex = this._keys.indexOf(this._cacheKey = key);
	                    }
	                    if (this._cacheIndex < 0 && insert) {
	                        this._cacheIndex = this._keys.length;
	                        this._keys.push(key);
	                        this._values.push(undefined);
	                    }
	                    return this._cacheIndex;
	                };
	                return Map;
	            }());
	            function getKey(key, _) {
	                return key;
	            }
	            function getValue(_, value) {
	                return value;
	            }
	            function getEntry(key, value) {
	                return [key, value];
	            }
	        }
	        // naive Set shim
	        function CreateSetPolyfill() {
	            return /** @class */ (function () {
	                function Set() {
	                    this._map = new _Map();
	                }
	                Object.defineProperty(Set.prototype, "size", {
	                    get: function () { return this._map.size; },
	                    enumerable: true,
	                    configurable: true
	                });
	                Set.prototype.has = function (value) { return this._map.has(value); };
	                Set.prototype.add = function (value) { return this._map.set(value, value), this; };
	                Set.prototype.delete = function (value) { return this._map.delete(value); };
	                Set.prototype.clear = function () { this._map.clear(); };
	                Set.prototype.keys = function () { return this._map.keys(); };
	                Set.prototype.values = function () { return this._map.values(); };
	                Set.prototype.entries = function () { return this._map.entries(); };
	                Set.prototype["@@iterator"] = function () { return this.keys(); };
	                Set.prototype[iteratorSymbol] = function () { return this.keys(); };
	                return Set;
	            }());
	        }
	        // naive WeakMap shim
	        function CreateWeakMapPolyfill() {
	            var UUID_SIZE = 16;
	            var keys = HashMap.create();
	            var rootKey = CreateUniqueKey();
	            return /** @class */ (function () {
	                function WeakMap() {
	                    this._key = CreateUniqueKey();
	                }
	                WeakMap.prototype.has = function (target) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
	                    return table !== undefined ? HashMap.has(table, this._key) : false;
	                };
	                WeakMap.prototype.get = function (target) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
	                    return table !== undefined ? HashMap.get(table, this._key) : undefined;
	                };
	                WeakMap.prototype.set = function (target, value) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ true);
	                    table[this._key] = value;
	                    return this;
	                };
	                WeakMap.prototype.delete = function (target) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
	                    return table !== undefined ? delete table[this._key] : false;
	                };
	                WeakMap.prototype.clear = function () {
	                    // NOTE: not a real clear, just makes the previous data unreachable
	                    this._key = CreateUniqueKey();
	                };
	                return WeakMap;
	            }());
	            function CreateUniqueKey() {
	                var key;
	                do
	                    key = "@@WeakMap@@" + CreateUUID();
	                while (HashMap.has(keys, key));
	                keys[key] = true;
	                return key;
	            }
	            function GetOrCreateWeakMapTable(target, create) {
	                if (!hasOwn.call(target, rootKey)) {
	                    if (!create)
	                        return undefined;
	                    Object.defineProperty(target, rootKey, { value: HashMap.create() });
	                }
	                return target[rootKey];
	            }
	            function FillRandomBytes(buffer, size) {
	                for (var i = 0; i < size; ++i)
	                    buffer[i] = Math.random() * 0xff | 0;
	                return buffer;
	            }
	            function GenRandomBytes(size) {
	                if (typeof Uint8Array === "function") {
	                    if (typeof crypto !== "undefined")
	                        return crypto.getRandomValues(new Uint8Array(size));
	                    if (typeof msCrypto !== "undefined")
	                        return msCrypto.getRandomValues(new Uint8Array(size));
	                    return FillRandomBytes(new Uint8Array(size), size);
	                }
	                return FillRandomBytes(new Array(size), size);
	            }
	            function CreateUUID() {
	                var data = GenRandomBytes(UUID_SIZE);
	                // mark as random - RFC 4122 § 4.4
	                data[6] = data[6] & 0x4f | 0x40;
	                data[8] = data[8] & 0xbf | 0x80;
	                var result = "";
	                for (var offset = 0; offset < UUID_SIZE; ++offset) {
	                    var byte = data[offset];
	                    if (offset === 4 || offset === 6 || offset === 8)
	                        result += "-";
	                    if (byte < 16)
	                        result += "0";
	                    result += byte.toString(16).toLowerCase();
	                }
	                return result;
	            }
	        }
	        // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
	        function MakeDictionary(obj) {
	            obj.__ = undefined;
	            delete obj.__;
	            return obj;
	        }
	    });
	})(Reflect$1 || (Reflect$1 = {}));

	(function (Country) {
	    Country["ARGENTINA"] = "ARGENTINA";
	    Country["BOLIVIA"] = "BOLIVIA";
	    Country["BRAZIL"] = "BRAZIL";
	    Country["CHILE"] = "CHILE";
	    Country["COLOMBIA"] = "COLOMBIA";
	    Country["ECUADOR"] = "ECUADOR";
	    Country["MEXICO"] = "MEXICO";
	    Country["PERU"] = "PERU";
	    Country["URUGUAY"] = "URUGUAY";
	    Country["COSTA_RICA"] = "COSTA_RICA";
	    Country["PARAGUAY"] = "PARAGUAY";
	    Country["PANAMA"] = "PANAMA";
	    Country["EL_SALVADOR"] = "EL_SALVADOR";
	    Country["GUATEMALA"] = "GUATEMALA";
	    Country["DOMINICAN_REPUBLIC"] = "DOMINICAN_REPUBLIC";
	})(exports.Country || (exports.Country = {}));
	function getCountryCode(country) {
	    switch (country) {
	        case exports.Country.ARGENTINA: return "ar";
	        case exports.Country.BOLIVIA: return "bo";
	        case exports.Country.BRAZIL: return "br";
	        case exports.Country.CHILE: return "cl";
	        case exports.Country.COLOMBIA: return "co";
	        case exports.Country.ECUADOR: return "ec";
	        case exports.Country.MEXICO: return "mx";
	        case exports.Country.PERU: return "pe";
	        case exports.Country.URUGUAY: return "uy";
	        case exports.Country.COSTA_RICA: return "cr";
	        case exports.Country.PARAGUAY: return "py";
	        case exports.Country.PANAMA: return "pa";
	        case exports.Country.EL_SALVADOR: return "sv";
	        case exports.Country.GUATEMALA: return "gt";
	        case exports.Country.DOMINICAN_REPUBLIC: return "do";
	    }
	}
	function getCountryByCode(code) {
	    switch (code) {
	        case "ar": return exports.Country.ARGENTINA;
	        case "bo": return exports.Country.BOLIVIA;
	        case "br": return exports.Country.BRAZIL;
	        case "cl": return exports.Country.CHILE;
	        case "co": return exports.Country.COLOMBIA;
	        case "ec": return exports.Country.ECUADOR;
	        case "mx": return exports.Country.MEXICO;
	        case "pe": return exports.Country.PERU;
	        case "uy": return exports.Country.URUGUAY;
	        case "cr": return exports.Country.COSTA_RICA;
	        case "py": return exports.Country.PARAGUAY;
	        case "pa": return exports.Country.PANAMA;
	        case "sv": return exports.Country.EL_SALVADOR;
	        case "gt": return exports.Country.GUATEMALA;
	        case "do": return exports.Country.DOMINICAN_REPUBLIC;
	    }
	}

	var CurrencyCode;
	(function (CurrencyCode) {
	    CurrencyCode["ARS"] = "ARS";
	    CurrencyCode["BOB"] = "BOB";
	    CurrencyCode["BRL"] = "BRL";
	    CurrencyCode["CLP"] = "CLP";
	    CurrencyCode["COP"] = "COP";
	    CurrencyCode["EUR"] = "EUR";
	    CurrencyCode["GBP"] = "GBP";
	    CurrencyCode["MXN"] = "MXN";
	    CurrencyCode["PEN"] = "PEN";
	    CurrencyCode["USD"] = "USD";
	    CurrencyCode["UYU"] = "UYU";
	    CurrencyCode["CRC"] = "CRC";
	    CurrencyCode["PYG"] = "PYG";
	    CurrencyCode["PAB"] = "PAB";
	    CurrencyCode["GTQ"] = "GTQ";
	    CurrencyCode["DOP"] = "DOP";
	})(CurrencyCode || (CurrencyCode = {}));
	function getCurrencySymbol(currencyCode) {
	    switch (currencyCode) {
	        case CurrencyCode.ARS:
	            return "$";
	        case CurrencyCode.BOB:
	            return "Bs";
	        case CurrencyCode.BRL:
	            return "R$";
	        case CurrencyCode.CLP:
	            return "$";
	        case CurrencyCode.COP:
	            return "$";
	        case CurrencyCode.EUR:
	            return "€";
	        case CurrencyCode.GBP:
	            return "£";
	        case CurrencyCode.MXN:
	            return "MX$";
	        case CurrencyCode.PEN:
	            return "S/.";
	        case CurrencyCode.USD:
	            return "US$";
	        case CurrencyCode.UYU:
	            return "$U";
	        case CurrencyCode.CRC:
	            return "₡";
	        case CurrencyCode.PYG:
	            return "₲";
	        case CurrencyCode.PAB:
	            return "B/.";
	        case CurrencyCode.GTQ:
	            return "Q";
	        case CurrencyCode.DOP:
	            return "RD$";
	    }
	}
	function getLocalCurrencySymbolForCountry(country) {
	    var currencyCode = getLocalCurrencyCodeForCountry(country);
	    return getCurrencySymbol(currencyCode);
	}
	function getLocalCurrencyCodeForCountry(country) {
	    switch (country) {
	        case exports.Country.ARGENTINA:
	            return CurrencyCode.ARS;
	        case exports.Country.BOLIVIA:
	            return CurrencyCode.BOB;
	        case exports.Country.BRAZIL:
	            return CurrencyCode.BRL;
	        case exports.Country.CHILE:
	            return CurrencyCode.CLP;
	        case exports.Country.COLOMBIA:
	            return CurrencyCode.COP;
	        case exports.Country.ECUADOR:
	            return CurrencyCode.USD;
	        case exports.Country.MEXICO:
	            return CurrencyCode.MXN;
	        case exports.Country.PERU:
	            return CurrencyCode.PEN;
	        case exports.Country.URUGUAY:
	            return CurrencyCode.UYU;
	        case exports.Country.COSTA_RICA:
	            return CurrencyCode.CRC;
	        case exports.Country.PARAGUAY:
	            return CurrencyCode.PYG;
	        case exports.Country.PANAMA:
	            return CurrencyCode.PAB;
	        case exports.Country.EL_SALVADOR:
	            return CurrencyCode.USD;
	        case exports.Country.GUATEMALA:
	            return CurrencyCode.GTQ;
	        case exports.Country.DOMINICAN_REPUBLIC:
	            return CurrencyCode.DOP;
	    }
	}

	(function (PaymentType) {
	    PaymentType["CREDITCARD"] = "creditcard";
	    PaymentType["DEBITCARD"] = "debitcard";
	})(exports.PaymentType || (exports.PaymentType = {}));
	function getAllPaymentTypes() {
	    return [
	        exports.PaymentType.CREDITCARD,
	        exports.PaymentType.DEBITCARD,
	    ];
	}

	var Mode;
	(function (Mode) {
	    Mode["LOCAL"] = "LOCAL";
	    Mode["PRODUCTION"] = "PRODUCTION";
	    Mode["TEST"] = "TEST";
	})(Mode || (Mode = {}));
	function getModeByCode(code) {
	    switch (code) {
	        case "local": return Mode.LOCAL;
	        case "production": return Mode.PRODUCTION;
	        case "test": return Mode.TEST;
	    }
	}
	function getModeCode(mode) {
	    switch (mode) {
	        case Mode.LOCAL: return "local";
	        case Mode.PRODUCTION: return "production";
	        case Mode.TEST: return "test";
	    }
	}

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */

	var __assign = function() {
	    __assign = Object.assign || function __assign(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign.apply(this, arguments);
	};

	function __rest(s, e) {
	    var t = {};
	    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
	        t[p] = s[p];
	    if (s != null && typeof Object.getOwnPropertySymbols === "function")
	        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
	            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
	                t[p[i]] = s[p[i]];
	        }
	    return t;
	}

	function __decorate(decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	}

	function __awaiter(thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	}

	function __generator(thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while (_) try {
	            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	            if (y = 0, t) op = [op[0] & 2, t.value];
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) _.ops.pop();
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	    }
	}

	function __spreadArrays() {
	    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
	    for (var r = Array(s), k = 0, i = 0; i < il; i++)
	        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
	            r[k] = a[j];
	    return r;
	}
	function __makeTemplateObject(cooked, raw) {
	    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
	    return cooked;
	}

	var state;
	function setState(data) {
	    state = __assign({}, data);
	}
	var ConfigProxy = /** @class */ (function () {
	    function ConfigProxy() {
	    }
	    Object.defineProperty(ConfigProxy.prototype, "publicIntegrationKey", {
	        get: function () {
	            return state.publicIntegrationKey;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ConfigProxy.prototype, "country", {
	        get: function () {
	            return state.country;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ConfigProxy.prototype, "tenant", {
	        get: function () {
	            return state.tenant;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(ConfigProxy.prototype, "mode", {
	        get: function () {
	            return state.mode;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    return ConfigProxy;
	}());
	var config = new ConfigProxy();

	var Tenant;
	(function (Tenant) {
	    Tenant["CROSS_BORDER"] = "CROSS_BORDER";
	    Tenant["LOCAL_LATAM"] = "LOCAL_LATAM";
	})(Tenant || (Tenant = {}));
	function getTenantByCode(code) {
	    switch (code) {
	        case "CROSS_BORDER": return Tenant.CROSS_BORDER;
	        case "LOCAL_LATAM": return Tenant.LOCAL_LATAM;
	        default: throw new Error("Unknown tenant code \"" + code + "\"");
	    }
	}
	function getTenantCode(tenant) {
	    switch (tenant) {
	        case Tenant.CROSS_BORDER: return "CROSS_BORDER";
	        case Tenant.LOCAL_LATAM: return "LOCAL_LATAM";
	        default: throw new Error("Unknown tenant \"" + tenant + "\"");
	    }
	}
	function getTenantByCodeOrDefault(defaultTenant, code) {
	    try {
	        return getTenantByCode(code);
	    }
	    catch (_a) {
	        return defaultTenant;
	    }
	}

	function init(options) {
	    var config = parseOptions(options);
	    setState(config);
	}
	function parseOptions(options) {
	    var publicIntegrationKey = options.publicIntegrationKey;
	    if (!publicIntegrationKey) {
	        throw new Error("invalid publicIntegrationKey");
	    }
	    var tenant = getTenantByCodeOrDefault(Tenant.CROSS_BORDER, options.tenant);
	    if (!tenant) {
	        throw new Error("invalid tenant");
	    }
	    var mode = getModeByCode(options.mode);
	    if (!mode) {
	        throw new Error("invalid mode");
	    }
	    var country = getCountryByCode(options.country);
	    if (!country) {
	        throw new Error("invalid country");
	    }
	    return {
	        country: country,
	        tenant: tenant,
	        mode: mode,
	        publicIntegrationKey: publicIntegrationKey,
	    };
	}

	function serializeToUrlSearch(searchParams) {
	    var search = searchParamsToSearchArray(searchParams);
	    return search.join("&");
	}
	function searchParamsToSearchArray(searchParams, parent) {
	    if (parent === void 0) { parent = ""; }
	    var search = [];
	    for (var _i = 0, _a = Object.entries(searchParams); _i < _a.length; _i++) {
	        var _b = _a[_i], key = _b[0], value = _b[1];
	        var urlKey = parent ? parent + "[" + encodeURIComponent(key) + "]" : encodeURIComponent(key);
	        var valueIsNotPrimitive = Object(value) === value;
	        if (valueIsNotPrimitive) {
	            search.push.apply(search, searchParamsToSearchArray(Object(value), urlKey));
	            continue;
	        }
	        var urlValue = value === undefined ? "undefined" : encodeURIComponent(Object(value));
	        search.push(urlKey + "=" + urlValue);
	    }
	    return search;
	}

	function getBaseUrl(tenant, mode) {
	    switch (tenant) {
	        case Tenant.LOCAL_LATAM:
	            return getLocalLatamBaseUrl(mode);
	        default:
	            return getCrossBorderBaseUrl(mode);
	    }
	}
	function getCrossBorderBaseUrl(mode) {
	    switch (mode) {
	        case Mode.LOCAL:
	            return "http://pay.ebanx.local";
	        case Mode.PRODUCTION:
	            return "https://customer.ebanx.com";
	        case Mode.TEST:
	            return "https://sandbox.ebanx.com";
	    }
	}
	function getLocalLatamBaseUrl(mode) {
	    switch (mode) {
	        case Mode.LOCAL:
	            return "http://pay.ebanx.local";
	        case Mode.PRODUCTION:
	            return "https://api-local-latam.ebanx.com";
	        case Mode.TEST:
	            return "https://sandbox-local-latam.ebanx.com";
	    }
	}

	function getUrl(tenant, mode, pathname, search) {
	    var url = new URL(pathname, getBaseUrl(tenant, mode));
	    var queryParams = search ? "?" + serializeToUrlSearch(search) : "";
	    return "" + url.toString() + queryParams;
	}

	var RequestMethod;
	(function (RequestMethod) {
	    RequestMethod["POST"] = "POST";
	})(RequestMethod || (RequestMethod = {}));
	function buildRequestInit(_a) {
	    var data = _a.data, _b = _a.method, method = _b === void 0 ? RequestMethod.POST : _b;
	    return {
	        method: method,
	        headers: {
	            "Content-Type": "text/plain",
	        },
	        body: JSON.stringify(data),
	    };
	}

	var EbanxPayHttpClient = /** @class */ (function () {
	    function EbanxPayHttpClient(config) {
	        this.config = config;
	    }
	    EbanxPayHttpClient.prototype.get = function (options) {
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                return [2 /*return*/, fetch(this.getUrl(options))];
	            });
	        });
	    };
	    EbanxPayHttpClient.prototype.getUrl = function (options) {
	        return getUrl(this.config.tenant, this.config.mode, options.path, options.search);
	    };
	    EbanxPayHttpClient.prototype.post = function (_a) {
	        var path = _a.path, data = _a.data;
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_b) {
	                return [2 /*return*/, fetch(this.getUrl({ path: path }), buildRequestInit({ data: data }))];
	            });
	        });
	    };
	    return EbanxPayHttpClient;
	}());

	var providerMetadataKey = Symbol("ProviderMetadata");
	function Provider(metadata) {
	    return function (target) { return Reflect.defineMetadata(providerMetadataKey, metadata, target.prototype); };
	}
	var ProviderResolver = /** @class */ (function () {
	    function ProviderResolver() {
	    }
	    ProviderResolver.register = function () {
	        var providers = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            providers[_i] = arguments[_i];
	        }
	        for (var _a = 0, providers_1 = providers; _a < providers_1.length; _a++) {
	            var provider = providers_1[_a];
	            var name_1 = Reflect.getMetadata(providerMetadataKey, provider).name;
	            if (ProviderResolver.providers.has(name_1)) {
	                throw new Error("provider name must be unique. provider with name '" + name_1 + "' already registered");
	            }
	            ProviderResolver.providers.set(name_1, provider);
	        }
	    };
	    ProviderResolver.resolve = function (name) {
	        var provider = ProviderResolver.providers.get(name);
	        if (!provider) {
	            throw new Error("provider with name '" + name + "' not found");
	        }
	        return provider;
	    };
	    ProviderResolver.unregister = function (provider) {
	        var name = Reflect.getMetadata(providerMetadataKey, provider).name;
	        ProviderResolver.providers.delete(name);
	    };
	    ProviderResolver.providers = new Map();
	    return ProviderResolver;
	}());

	function injectScript(src) {
	    return __awaiter(this, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, new Promise(function (onload, onerror) {
	                    var script = document.createElement("script");
	                    document.body.appendChild(script);
	                    Object.assign(script, { onload: onload, onerror: onerror, src: src });
	                })];
	        });
	    });
	}

	var ClearsaleProvider = /** @class */ (function () {
	    function ClearsaleProvider() {
	    }
	    ClearsaleProvider.prototype.getSession = function (config, httpClient, sessionId, settings) {
	        return __awaiter(this, void 0, void 0, function () {
	            var scriptSrc;
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0:
	                        scriptSrc = ensureClearsaleGlobals();
	                        this.setUp(settings, sessionId);
	                        return [4 /*yield*/, injectScript(scriptSrc)];
	                    case 1:
	                        _a.sent();
	                        return [2 /*return*/, { session_id: sessionId }];
	                }
	            });
	        });
	    };
	    ClearsaleProvider.prototype.setUp = function (settings, sessionId) {
	        var csdp = this.getCsdp();
	        csdp("app", settings.app);
	        csdp("sessionid", sessionId);
	    };
	    ClearsaleProvider.prototype.getCsdp = function () {
	        var CsdpObject = window.CsdpObject;
	        if (!CsdpObject) {
	            throw new Error("CsdpObject not defined");
	        }
	        var csdp = window[CsdpObject];
	        if (!csdp) {
	            throw new Error("csdp not defined");
	        }
	        return csdp;
	    };
	    ClearsaleProvider = __decorate([
	        Provider({
	            name: "clearsale",
	        })
	    ], ClearsaleProvider);
	    return ClearsaleProvider;
	}());
	function ensureClearsaleGlobals() {
	    var _a, _b;
	    var scriptSrc = "//device.clearsale.com.br/p/fp.js";
	    var CsdpObject = window["CsdpObject"] = (_a = window["CsdpObject"]) !== null && _a !== void 0 ? _a : "csdp";
	    window[CsdpObject] = (_b = window[CsdpObject]) !== null && _b !== void 0 ? _b : Object.assign(function () {
	        (window[CsdpObject].q = window[CsdpObject].q || []).push(arguments);
	    }, { q: [], l: Date.now() });
	    window[CsdpObject].l = Date.now();
	    window["_csdp"] = window[CsdpObject];
	    return scriptSrc;
	}

	var CybersourceProvider = /** @class */ (function () {
	    function CybersourceProvider() {
	    }
	    CybersourceProvider.prototype.getSession = function (config, httpClient, sessionId, settings) {
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0: return [4 /*yield*/, this.injectScript(settings, sessionId)];
	                    case 1:
	                        _a.sent();
	                        return [2 /*return*/, { session_id: sessionId }];
	                }
	            });
	        });
	    };
	    CybersourceProvider.prototype.injectScript = function (settings, sessionId) {
	        return __awaiter(this, void 0, void 0, function () {
	            var baseUrl, search;
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0:
	                        baseUrl = new URL("https://h.online-metrix.net/fp/tags.js");
	                        search = new URLSearchParams({
	                            org_id: settings.org_id,
	                            session_id: "" + settings.merchant_id + sessionId,
	                        });
	                        return [4 /*yield*/, injectScript(baseUrl.toString() + "?" + search.toString())];
	                    case 1:
	                        _a.sent();
	                        return [2 /*return*/];
	                }
	            });
	        });
	    };
	    CybersourceProvider = __decorate([
	        Provider({
	            name: "cybersource",
	        })
	    ], CybersourceProvider);
	    return CybersourceProvider;
	}());

	var KondutoProvider = /** @class */ (function () {
	    function KondutoProvider() {
	    }
	    KondutoProvider.prototype.getSession = function (config, httpClient, sessionId, settings) {
	        var _a;
	        return __awaiter(this, void 0, void 0, function () {
	            var kondutoArguments, visitorID;
	            return __generator(this, function (_b) {
	                switch (_b.label) {
	                    case 0:
	                        kondutoArguments = window.__kdt = (_a = window.__kdt) !== null && _a !== void 0 ? _a : [];
	                        kondutoArguments.push({ public_key: settings.token });
	                        return [4 /*yield*/, injectScript("https://i.k-analytix.com/k.js")];
	                    case 1:
	                        _b.sent();
	                        return [4 /*yield*/, new Promise(function (resolve) { return window.Konduto.getVisitorIDAsync(resolve); })];
	                    case 2:
	                        visitorID = _b.sent();
	                        return [2 /*return*/, { session_id: visitorID }];
	                }
	            });
	        });
	    };
	    KondutoProvider = __decorate([
	        Provider({
	            name: "konduto",
	        })
	    ], KondutoProvider);
	    return KondutoProvider;
	}());

	var KountProvider = /** @class */ (function () {
	    function KountProvider() {
	    }
	    KountProvider.prototype.getSession = function (config, httpClient, sessionId, settings) {
	        var src = httpClient.getUrl({
	            path: "fingerprint/kount",
	            search: {
	                m: settings.merchant_id,
	                s: sessionId,
	            },
	        });
	        var iframe = Object.assign(document.createElement("iframe"), buildIframeProperties(src));
	        Object.assign(iframe.style, buildIframeStyle());
	        document.body.appendChild(iframe);
	        return {
	            session_id: sessionId,
	        };
	    };
	    KountProvider = __decorate([
	        Provider({
	            name: "kount",
	        })
	    ], KountProvider);
	    return KountProvider;
	}());
	function buildIframeProperties(src) {
	    return {
	        width: "1",
	        height: "1",
	        frameBorder: "0",
	        scrolling: "no",
	        src: src,
	    };
	}
	function buildIframeStyle() {
	    return {
	        border: "0",
	        left: "-200px",
	        position: "absolute",
	        top: "-200px",
	    };
	}

	var ORG_ID = "jk96mpy";
	var MercadopagoProvider = /** @class */ (function () {
	    function MercadopagoProvider() {
	    }
	    MercadopagoProvider.prototype.getSession = function (config, httpClient, sessionId, settings) {
	        return __awaiter(this, void 0, void 0, function () {
	            var mercadopagoSessionId;
	            return __generator(this, function (_a) {
	                mercadopagoSessionId = this.generateRandomUid();
	                this.injectObject(mercadopagoSessionId);
	                this.injectImages(mercadopagoSessionId);
	                this.injectScript(mercadopagoSessionId);
	                return [2 /*return*/, { session_id: mercadopagoSessionId }];
	            });
	        });
	    };
	    MercadopagoProvider.prototype.generateRandomUid = function () {
	        var random = function () { return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1); };
	        return "xx-x-x-x-xxx".replace(/x/g, random);
	    };
	    MercadopagoProvider.prototype.injectScript = function (mercadopagoSessionId) {
	        var baseUrl = new URL("https://content.mercadopago.com/fp/check.js");
	        var search = new URLSearchParams({
	            org_id: ORG_ID,
	            session_id: mercadopagoSessionId,
	        });
	        var url = new URL(baseUrl + "?" + search);
	        injectScript(url.toString());
	    };
	    MercadopagoProvider.prototype.injectImages = function (mercadopagoSessionId) {
	        var baseUrl = new URL("https://content.mercadopago.com/fp/clear.png");
	        var search = new URLSearchParams({
	            org_id: ORG_ID,
	            session_id: mercadopagoSessionId,
	        });
	        search.set("m", "1");
	        Object.assign(new Image(), {
	            src: new URL(baseUrl + "?" + search).toString(),
	        });
	        search.set("m", "2");
	        Object.assign(new Image(), {
	            src: new URL(baseUrl + "?" + search).toString(),
	        });
	    };
	    MercadopagoProvider.prototype.injectObject = function (mercadopagoSessionId) {
	        var baseUrl = new URL("https://content.mercadopago.com/fp/fp.swf");
	        var search = new URLSearchParams({
	            org_id: ORG_ID,
	            session_id: mercadopagoSessionId,
	        });
	        var url = new URL(baseUrl + "?" + search);
	        var object = document.createElement("object");
	        Object.assign(object, {
	            id: "obj_id",
	            width: "1",
	            height: "1",
	            type: "application/x-shockwave-flash",
	            data: url.toString(),
	        });
	        var param = document.createElement("param");
	        Object.assign(param, {
	            name: "movie",
	            value: url.toString(),
	        });
	        object.appendChild(param);
	        document.body.appendChild(object);
	    };
	    MercadopagoProvider = __decorate([
	        Provider({
	            name: "mercadopago",
	        })
	    ], MercadopagoProvider);
	    return MercadopagoProvider;
	}());

	var OpenpayProvider = /** @class */ (function () {
	    function OpenpayProvider() {
	    }
	    OpenpayProvider.prototype.getSession = function (config, httpClient, sessionId, settings) {
	        return __awaiter(this, void 0, void 0, function () {
	            var openPaysessionId;
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0: return [4 /*yield*/, this.injectScript()];
	                    case 1:
	                        _a.sent();
	                        this.setUpOpenpay(settings);
	                        openPaysessionId = this.getOpenpaySessionId();
	                        return [2 /*return*/, { session_id: openPaysessionId }];
	                }
	            });
	        });
	    };
	    OpenpayProvider.prototype.injectScript = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0: return [4 /*yield*/, injectScript("https://openpay.s3.amazonaws.com/openpay.v1.min.js")];
	                    case 1:
	                        _a.sent();
	                        return [4 /*yield*/, injectScript("https://openpay.s3.amazonaws.com/openpay-data.v1.min.js")];
	                    case 2:
	                        _a.sent();
	                        return [2 /*return*/];
	                }
	            });
	        });
	    };
	    OpenpayProvider.prototype.setUpOpenpay = function (settings) {
	        window.OpenPay.setId(settings.id);
	        window.OpenPay.setApiKey(settings.apiKey);
	        window.OpenPay.setSandboxMode(settings.sandboxMode);
	    };
	    OpenpayProvider.prototype.getOpenpaySessionId = function () {
	        return window.OpenPay.deviceData.setup();
	    };
	    OpenpayProvider = __decorate([
	        Provider({
	            name: "openpay",
	        })
	    ], OpenpayProvider);
	    return OpenpayProvider;
	}());

	ProviderResolver.register(new ClearsaleProvider(), new CybersourceProvider(), new KondutoProvider(), new KountProvider(), new MercadopagoProvider(), new OpenpayProvider());
	var DeviceFingerprintModule = /** @class */ (function () {
	    function DeviceFingerprintModule(config) {
	        this.config = config;
	        this.ebanxSessionId = "";
	        this.httpClient = new EbanxPayHttpClient(config);
	    }
	    DeviceFingerprintModule.prototype.getSession = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            var _a;
	            return __generator(this, function (_b) {
	                switch (_b.label) {
	                    case 0:
	                        if (!!this.ebanxSessionId) return [3 /*break*/, 2];
	                        _a = this;
	                        return [4 /*yield*/, this.performDeviceFingerprint()];
	                    case 1:
	                        _a.ebanxSessionId = _b.sent();
	                        _b.label = 2;
	                    case 2: return [2 /*return*/, {
	                            device_id: this.ebanxSessionId,
	                        }];
	                }
	            });
	        });
	    };
	    DeviceFingerprintModule.prototype.performDeviceFingerprint = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            var _a, ebanxSessionId, providers, providersSessionsPromises, providersSessions;
	            var _this = this;
	            return __generator(this, function (_b) {
	                switch (_b.label) {
	                    case 0: return [4 /*yield*/, this.fetchProvidersAndSessionId()];
	                    case 1:
	                        _a = _b.sent(), ebanxSessionId = _a.ebanx_session_id, providers = _a.providers;
	                        if (!ebanxSessionId) {
	                            throw new Error("missing ebanx_session_id in response");
	                        }
	                        if (!(providers === null || providers === void 0 ? void 0 : providers.length)) return [3 /*break*/, 4];
	                        providersSessionsPromises = providers.map(function (_a) {
	                            var name = _a.provider, settings = _a.settings;
	                            return __awaiter(_this, void 0, void 0, function () {
	                                var provider, session;
	                                return __generator(this, function (_b) {
	                                    switch (_b.label) {
	                                        case 0:
	                                            provider = ProviderResolver.resolve(name);
	                                            return [4 /*yield*/, provider.getSession(this.config, this.httpClient, ebanxSessionId, settings)];
	                                        case 1:
	                                            session = _b.sent();
	                                            return [2 /*return*/, __assign({ provider: name }, session)];
	                                    }
	                                });
	                            });
	                        });
	                        return [4 /*yield*/, Promise.all(providersSessionsPromises)];
	                    case 2:
	                        providersSessions = _b.sent();
	                        return [4 /*yield*/, this.registerProvidersSessions(ebanxSessionId, providersSessions)];
	                    case 3:
	                        _b.sent();
	                        _b.label = 4;
	                    case 4: return [2 /*return*/, ebanxSessionId];
	                }
	            });
	        });
	    };
	    DeviceFingerprintModule.prototype.fetchProvidersAndSessionId = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            var response;
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0: return [4 /*yield*/, this.httpClient.get({
	                            path: "/fingerprint/main",
	                            search: {
	                                publicIntegrationKey: this.config.publicIntegrationKey,
	                                country: getCountryCode(this.config.country),
	                            },
	                        })];
	                    case 1:
	                        response = _a.sent();
	                        return [2 /*return*/, response.json()];
	                }
	            });
	        });
	    };
	    DeviceFingerprintModule.prototype.registerProvidersSessions = function (ebanxSessionId, sessions) {
	        return __awaiter(this, void 0, void 0, function () {
	            var response;
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0: return [4 /*yield*/, this.httpClient.get({
	                            path: "/fingerprint/provider",
	                            search: {
	                                ebanx_session_id: ebanxSessionId,
	                                providers: sessions,
	                                publicIntegrationKey: this.config.publicIntegrationKey,
	                            },
	                        })];
	                    case 1:
	                        response = _a.sent();
	                        if (!response.ok) {
	                            throw new Error("error during registration");
	                        }
	                        return [2 /*return*/];
	                }
	            });
	        });
	    };
	    return DeviceFingerprintModule;
	}());

	var AuthenticationStatus;
	(function (AuthenticationStatus) {
	    AuthenticationStatus["PENDING_AUTHENTICATION"] = "PENDING_AUTHENTICATION";
	    AuthenticationStatus["VALIDATION_NEEDED"] = "VALIDATION_NEEDED";
	    AuthenticationStatus["AUTHENTICATION_SUCCESSFUL"] = "AUTHENTICATION_SUCCESSFUL";
	    AuthenticationStatus["AUTHENTICATION_FAILED"] = "AUTHENTICATION_FAILED";
	})(AuthenticationStatus || (AuthenticationStatus = {}));
	var Authentication = /** @class */ (function () {
	    function Authentication(status, data) {
	        this.status = status;
	        this.data = data;
	    }
	    Object.defineProperty(Authentication.prototype, "eci", {
	        get: function () {
	            var _a = this.data, eci = _a.eci, eciRaw = _a.eciRaw;
	            if (eci) {
	                return eci;
	            }
	            if (eciRaw) {
	                return eciRaw;
	            }
	            throw new Error();
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Authentication.prototype, "cryptogram", {
	        get: function () {
	            var _a = this.data, ucaf = _a.ucaf, ucafAuthenticationData = _a.ucafAuthenticationData;
	            if (ucaf) {
	                return ucaf;
	            }
	            if (ucafAuthenticationData) {
	                return ucafAuthenticationData;
	            }
	            throw new Error();
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Authentication.prototype, "xid", {
	        get: function () {
	            return this.data.xid;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Authentication.prototype, "acsUrl", {
	        get: function () {
	            return this.data.acsUrl;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Authentication.prototype, "pareq", {
	        get: function () {
	            return this.data.pareq;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Authentication.prototype, "authenticationTransactionId", {
	        get: function () {
	            return this.data.authenticationTransactionId;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Authentication.prototype, "version", {
	        get: function () {
	            return this.data.version;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Authentication.prototype, "trxId", {
	        get: function () {
	            return this.data.directoryServerTransactionId;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    return Authentication;
	}());

	var PersonalIdentificationType;
	(function (PersonalIdentificationType) {
	    PersonalIdentificationType["CPF"] = "CPF";
	    PersonalIdentificationType["CNPJ"] = "CNPJ";
	})(PersonalIdentificationType || (PersonalIdentificationType = {}));

	var ThreeDSecureClient = /** @class */ (function () {
	    function ThreeDSecureClient(config) {
	        this.config = config;
	        this.httpClient = new EbanxPayHttpClient(config);
	    }
	    ThreeDSecureClient.prototype.generateToken = function (amountDetails) {
	        var path = "/ws/threedsecureserver-generateToken";
	        var data = {
	            totalAmount: amountDetails.totalAmount,
	            currency: amountDetails.currency,
	            orderNumber: null,
	            consumerAuthenticationInformation: {
	                overridePaymentMethod: "DEBIT",
	            },
	            publicIntegrationKey: this.config.publicIntegrationKey,
	        };
	        return this.request(path, data);
	    };
	    ThreeDSecureClient.prototype.authentications = function (threeDSecureToken, orderInformation, paymentInformation, personalIdentification, installmentTotalCount, deviceInformation) {
	        return __awaiter(this, void 0, void 0, function () {
	            var path, data, _a, status, consumerAuthenticationInformation;
	            return __generator(this, function (_b) {
	                switch (_b.label) {
	                    case 0:
	                        path = "/ws/threedsecureserver-authentications";
	                        data = {
	                            token: threeDSecureToken.accessToken,
	                            merchantTrackId: threeDSecureToken.paymentId,
	                            additionalData: JSON.stringify({
	                                publicIntegrationKey: this.config.publicIntegrationKey,
	                            }),
	                            orderInformation: orderInformation,
	                            consumerAuthenticationInformation: {
	                                installmentTotalCount: installmentTotalCount,
	                                overridePaymentMethod: "DEBIT",
	                            },
	                            personalIdentification: personalIdentification,
	                            paymentInformation: paymentInformation,
	                            deviceInformation: deviceInformation,
	                        };
	                        return [4 /*yield*/, this.request(path, data)];
	                    case 1:
	                        _a = _b.sent(), status = _a.status, consumerAuthenticationInformation = _a.consumerAuthenticationInformation;
	                        return [2 /*return*/, new Authentication(status, consumerAuthenticationInformation)];
	                }
	            });
	        });
	    };
	    ThreeDSecureClient.prototype.authenticationResults = function (threeDSecureToken, orderInformation, paymentInformation, tokenChallenge) {
	        return __awaiter(this, void 0, void 0, function () {
	            var path, data, _a, status, consumerAuthenticationInformation;
	            return __generator(this, function (_b) {
	                switch (_b.label) {
	                    case 0:
	                        path = "/ws/threedsecureserver-authentication-results";
	                        data = {
	                            token: threeDSecureToken.accessToken,
	                            tokenChallenge: tokenChallenge,
	                            merchantTrackId: threeDSecureToken.paymentId,
	                            paymentInformation: paymentInformation,
	                            consumerAuthenticationInformation: {
	                                overridePaymentMethod: "DEBIT",
	                            },
	                            orderInformation: orderInformation,
	                            publicIntegrationKey: this.config.publicIntegrationKey,
	                        };
	                        return [4 /*yield*/, this.request(path, data)];
	                    case 1:
	                        _a = _b.sent(), status = _a.status, consumerAuthenticationInformation = _a.consumerAuthenticationInformation;
	                        return [2 /*return*/, new Authentication(status, consumerAuthenticationInformation)];
	                }
	            });
	        });
	    };
	    ThreeDSecureClient.prototype.request = function (path, data) {
	        return __awaiter(this, void 0, void 0, function () {
	            var response, json;
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0: return [4 /*yield*/, this.httpClient.post({ path: path, data: data })];
	                    case 1:
	                        response = _a.sent();
	                        return [4 /*yield*/, response.json()];
	                    case 2:
	                        json = (_a.sent()).data[0];
	                        return [2 /*return*/, json];
	                }
	            });
	        });
	    };
	    return ThreeDSecureClient;
	}());

	var name = "@ebanx/ebanx-js";
	var version = "1.35.0";
	var description = "EBANX JS";
	var main = "./dist/ebanx.js";
	var types = "./dist/types/src/index.d.ts";
	var module = "./dist/ebanx.esm.js";
	var jsdelivr = "./dist/ebanx.iife.js";
	var unpkg = "./dist/ebanx.iife.js";
	var files = [
		"dist/**/*.js",
		"dist/assets/**",
		"dist/**/*.ts",
		"src/**/*.ts"
	];
	var scripts = {
		prebuild: "shx rm -rf dist",
		build: "npm run build:types && rollup --config ./rollup.config.js",
		"build:types": "tsc --project tsconfig-types.json",
		"build:serve": "serve dist",
		"build:samples": "rollup --config ./rollup.config.samples.js",
		lint: "npm run lint:commit && npm run lint:eslint && npm run lint:markdown",
		"lint:commit": "commitlint --from master",
		"lint:eslint:fix": "npm run lint:eslint -- --fix",
		"lint:eslint": "eslint --ext ts --ext tsx --ext js .",
		"lint:markdown:fix": "npm run lint:markdown -- --fix",
		"lint:markdown": "markdownlint '**/*.md' --ignore node_modules --ignore CHANGELOG.md",
		release: "npx semantic-release",
		publish: "scripts/publish",
		"test:cypress:modules": "cypress run --spec=\"cypress/integration/!(dropin)/**/*.spec.ts\"",
		"test:cypress:dropin": "cypress run --spec=\"cypress/integration/dropin/*.spec.ts\"",
		"test:cypress:dropin:raw": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/raw/*.spec.ts\"",
		"test:cypress:dropin:raw:brazil": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/raw/brazil/**/*.spec.ts\"",
		"test:cypress:dropin:raw:argentina": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/raw/argentina/**/*.spec.ts\"",
		"test:cypress:dropin:raw:chile": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/raw/chile/**/*.spec.ts\"",
		"test:cypress:dropin:raw:colombia": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/raw/colombia/**/*.spec.ts\"",
		"test:cypress:dropin:raw:mexico": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/raw/mexico/**/*.spec.ts\"",
		"test:cypress:dropin:raw:peru": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/raw/peru/**/*.spec.ts\"",
		"test:cypress:dropin:raw:uruguay": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/raw/uruguay/**/*.spec.ts\"",
		"test:cypress:dropin:vanilla": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/vanilla/*.spec.ts\"",
		"test:cypress:dropin:vanilla:brazil": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/vanilla/brazil/**/*.spec.ts\"",
		"test:cypress:dropin:vanilla:argentina": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/vanilla/argentina/**/*.spec.ts\"",
		"test:cypress:dropin:vanilla:chile": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/vanilla/chile/**/*.spec.ts\"",
		"test:cypress:dropin:vanilla:colombia": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/vanilla/colombia/**/*.spec.ts\"",
		"test:cypress:dropin:vanilla:mexico": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/vanilla/mexico/**/*.spec.ts\"",
		"test:cypress:dropin:vanilla:peru": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/vanilla/peru/**/*.spec.ts\"",
		"test:cypress:dropin:vanilla:uruguay": "cypress run --spec=\"cypress/integration/dropin/look-and-feel/vanilla/uruguay/**/*.spec.ts\"",
		"test:jest": "jest",
		samples: "NODE_ENV=development npm-run-all -p samples:*",
		"samples:js": "rollup --watch --config ./rollup.config.samples.js",
		"samples:serve": "live-server --port=3000 --no-browser samples/",
		"cypress:open": "cypress open",
		storybook: "start-storybook -p 6006"
	};
	var husky = {
		hooks: {
			"commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
		}
	};
	var repository = {
		type: "git",
		url: "git@github.com:ebanx/ebanx-js.git"
	};
	var author = "EBANX";
	var license = "MIT";
	var bugs = {
		url: "https://github.com/ebanx/ebanx-js/issues"
	};
	var homepage = "https://github.com/ebanx/ebanx-js#readme";
	var devDependencies = {
		"@babel/core": "^7.12.9",
		"@commitlint/cli": "^8.3.5",
		"@commitlint/config-conventional": "^8.3.4",
		"@rollup/plugin-alias": "^3.1.1",
		"@rollup/plugin-commonjs": "^17.0.0",
		"@rollup/plugin-html": "^0.1.1",
		"@rollup/plugin-json": "^4.1.0",
		"@rollup/plugin-node-resolve": "^7.1.3",
		"@rollup/plugin-replace": "^2.3.4",
		"@semantic-release/changelog": "^5.0.1",
		"@semantic-release/commit-analyzer": "^8.0.1",
		"@semantic-release/git": "^9.0.0",
		"@semantic-release/github": "^7.0.7",
		"@semantic-release/npm": "^7.0.5",
		"@semantic-release/release-notes-generator": "^9.0.1",
		"@storybook/addon-actions": "^6.1.10",
		"@storybook/addon-essentials": "^6.1.10",
		"@storybook/addon-links": "^6.1.10",
		"@storybook/preact": "^6.1.10",
		"@testing-library/cypress": "^7.0.3",
		"@types/faker": "^4.1.11",
		"@types/jest": "^25.1.4",
		"@types/node": "^14.14.13",
		"@types/react-helmet": "^6.1.0",
		"@types/styled-components": "^5.1.4",
		"@typescript-eslint/eslint-plugin": "^2.24.0",
		"@typescript-eslint/parser": "^4.7.0",
		"babel-loader": "^8.2.2",
		"core-js": "^3.8.1",
		cypress: "^7.1.0",
		eslint: "^6.8.0",
		"eslint-plugin-cypress": "^2.11.2",
		"eslint-plugin-jest": "^23.8.2",
		"eslint-plugin-react": "^7.21.5",
		"eslint-plugin-react-hooks": "^4.2.0",
		faker: "^4.1.0",
		husky: "^4.2.3",
		jest: "^26.6.3",
		"jest-fetch-mock": "^3.0.3",
		"jest-styled-components": "^7.0.3",
		"live-server": "^1.2.1",
		"markdownlint-cli": "^0.22.0",
		"npm-run-all": "^4.1.5",
		"preact-render-to-string": "^5.1.12",
		rollup: "^2.34.2",
		"rollup-plugin-copy": "^3.3.0",
		"rollup-plugin-terser": "^5.3.0",
		"rollup-plugin-typescript2": "^0.26.0",
		"semantic-release": "^17.0.8",
		serve: "^11.3.0",
		shx: "0.3.2",
		"ts-jest": "^26.4.4",
		typescript: "^4.0.5"
	};
	var bundledDependencies = [
		"@juggle/resize-observer",
		"@ungap/url-search-params",
		"preact",
		"react-helmet",
		"react-use",
		"react-use-measure",
		"reflect-metadata",
		"styled-components",
		"text-mask-core"
	];
	var dependencies = {
		"@juggle/resize-observer": "^3.2.0",
		"@ungap/url-search-params": "^0.2.2",
		preact: "^10.5.5",
		"react-helmet": "^6.1.0",
		"react-use": "^15.3.4",
		"react-use-measure": "^2.0.4",
		"reflect-metadata": "^0.1.13",
		"styled-components": "^5.2.1",
		"text-mask-core": "^5.1.2"
	};
	var pkg = {
		name: name,
		version: version,
		description: description,
		main: main,
		types: types,
		module: module,
		jsdelivr: jsdelivr,
		unpkg: unpkg,
		files: files,
		scripts: scripts,
		husky: husky,
		repository: repository,
		author: author,
		license: license,
		bugs: bugs,
		homepage: homepage,
		devDependencies: devDependencies,
		bundledDependencies: bundledDependencies,
		dependencies: dependencies
	};

	var Songbird = /** @class */ (function () {
	    function Songbird() {
	    }
	    Songbird.inject = function (mode) {
	        return __awaiter(this, void 0, void 0, function () {
	            var asset, _a;
	            return __generator(this, function (_b) {
	                switch (_b.label) {
	                    case 0:
	                        asset = "songbird-" + (mode === Mode.PRODUCTION ? "prod" : "dev") + ".js";
	                        _b.label = 1;
	                    case 1:
	                        _b.trys.push([1, 3, , 5]);
	                        return [4 /*yield*/, injectScript("https://ebanx-js.ebanx.com/v" + pkg.version + "/dist/assets/songbird/" + asset)];
	                    case 2:
	                        _b.sent();
	                        return [3 /*break*/, 5];
	                    case 3:
	                        _a = _b.sent();
	                        return [4 /*yield*/, injectScript("https://js.ebanx.com/assets/songbird/" + asset)];
	                    case 4:
	                        _b.sent();
	                        return [3 /*break*/, 5];
	                    case 5: return [2 /*return*/];
	                }
	            });
	        });
	    };
	    return Songbird;
	}());

	var Cardinal = /** @class */ (function () {
	    function Cardinal() {
	    }
	    Cardinal.init = function (mode, threeDSecureToken, card) {
	        var _a;
	        return __awaiter(this, void 0, void 0, function () {
	            var Cardinal;
	            return __generator(this, function (_b) {
	                switch (_b.label) {
	                    case 0:
	                        if (!!window.Cardinal) return [3 /*break*/, 2];
	                        return [4 /*yield*/, Songbird.inject(mode)];
	                    case 1:
	                        _b.sent();
	                        _b.label = 2;
	                    case 2:
	                        (_a = document.getElementById("Cardinal-ElementContainer")) === null || _a === void 0 ? void 0 : _a.remove();
	                        Cardinal = window.Cardinal;
	                        Cardinal.configure({
	                            timeout: "8000",
	                            maxRequestRetries: "10",
	                            logging: {
	                                level: "off",
	                            },
	                            payment: {
	                                view: "modal",
	                                framework: "boostrap3",
	                                displayLoading: true,
	                                displayExitButton: true,
	                            },
	                        });
	                        Cardinal.setup("init", {
	                            jwt: threeDSecureToken.accessToken,
	                        });
	                        Cardinal.on("payments.setupComplete", function () {
	                            Cardinal.trigger("bin.process", card);
	                        });
	                        return [2 /*return*/];
	                }
	            });
	        });
	    };
	    Cardinal.validatePayment = function (auth) {
	        return __awaiter(this, void 0, void 0, function () {
	            var Cardinal;
	            return __generator(this, function (_a) {
	                Cardinal = window.Cardinal;
	                Cardinal.continue("cca", {
	                    AcsUrl: auth.acsUrl,
	                    Payload: auth.pareq,
	                }, {
	                    OrderDetails: {
	                        TransactionId: auth.authenticationTransactionId,
	                    },
	                });
	                return [2 /*return*/, new Promise(function (resolve, reject) {
	                        Cardinal.on("payments.validated", function (decodedResponseData, jwt) {
	                            if (jwt) {
	                                resolve(jwt);
	                            }
	                            else {
	                                reject(new Error("Error to validate payment"));
	                            }
	                        });
	                    })];
	            });
	        });
	    };
	    return Cardinal;
	}());

	var ThreeDSecureFulfilledSession = /** @class */ (function () {
	    function ThreeDSecureFulfilledSession(threeds_eci, threeds_cryptogram, threeds_xid, threeds_version, threeds_trxid) {
	        this.threeds_eci = threeds_eci;
	        this.threeds_cryptogram = threeds_cryptogram;
	        this.threeds_xid = threeds_xid;
	        this.threeds_version = threeds_version;
	        this.threeds_trxid = threeds_trxid;
	    }
	    return ThreeDSecureFulfilledSession;
	}());
	var ThreeDSecureEmptySession = /** @class */ (function () {
	    function ThreeDSecureEmptySession() {
	    }
	    return ThreeDSecureEmptySession;
	}());
	var ThreeDSecureModule = /** @class */ (function () {
	    function ThreeDSecureModule(config) {
	        this.config = config;
	        this.threeDSecureClient = new ThreeDSecureClient(config);
	    }
	    ThreeDSecureModule.prototype.authenticate = function (options) {
	        return __awaiter(this, void 0, void 0, function () {
	            function perform2FAChallenge(threeDSecureToken, threeDSecureInformation) {
	                return __awaiter(this, void 0, void 0, function () {
	                    var jwt, _a;
	                    return __generator(this, function (_b) {
	                        switch (_b.label) {
	                            case 0: return [4 /*yield*/, Promise.race([
	                                    new Promise(function (resolve, reject) {
	                                        setTimeout(function () { return reject(new Error("Waited too much for 2FA challenge resolution")); }, 60000);
	                                    }),
	                                    Cardinal.validatePayment(threeDSecureInformation),
	                                ])];
	                            case 1:
	                                jwt = _b.sent();
	                                _a = buildAuthenticateResult;
	                                return [4 /*yield*/, threeDSecureClient.authenticationResults(threeDSecureToken, orderInformation, paymentInformation, jwt)];
	                            case 2: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
	                        }
	                    });
	                });
	            }
	            function performTransparentValidation(threeDSecureToken) {
	                return __awaiter(this, void 0, void 0, function () {
	                    var _a;
	                    return __generator(this, function (_b) {
	                        switch (_b.label) {
	                            case 0:
	                                _a = buildAuthenticateResult;
	                                return [4 /*yield*/, threeDSecureClient.authenticationResults(threeDSecureToken, orderInformation, paymentInformation)];
	                            case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
	                        }
	                    });
	                });
	            }
	            var shouldAuthenticate, orderInformation, paymentInformation, personalIdentification, _a, installmentTotalCount, beforeChallenge, threeDSecureClient, threeDSecureToken, deviceInformation, threeDSecureInformation;
	            return __generator(this, function (_b) {
	                switch (_b.label) {
	                    case 0:
	                        shouldAuthenticate = checkIfShouldAuthenticate(options);
	                        if (!shouldAuthenticate) {
	                            return [2 /*return*/, new ThreeDSecureEmptySession()];
	                        }
	                        orderInformation = options.orderInformation, paymentInformation = options.paymentInformation, personalIdentification = options.personalIdentification, _a = options.installmentTotalCount, installmentTotalCount = _a === void 0 ? "1" : _a, beforeChallenge = options.beforeChallenge;
	                        threeDSecureClient = this.threeDSecureClient;
	                        return [4 /*yield*/, threeDSecureClient.generateToken(orderInformation.amountDetails)];
	                    case 1:
	                        threeDSecureToken = _b.sent();
	                        return [4 /*yield*/, Cardinal.init(this.config.mode, threeDSecureToken, paymentInformation.card)];
	                    case 2:
	                        _b.sent();
	                        deviceInformation = getDeviceInformation();
	                        return [4 /*yield*/, threeDSecureClient.authentications(threeDSecureToken, orderInformation, paymentInformation, personalIdentification, installmentTotalCount, deviceInformation)];
	                    case 3:
	                        threeDSecureInformation = _b.sent();
	                        switch (threeDSecureInformation.status) {
	                            case AuthenticationStatus.PENDING_AUTHENTICATION:
	                                if (typeof (beforeChallenge) === "function") {
	                                    beforeChallenge();
	                                }
	                                return [2 /*return*/, perform2FAChallenge(threeDSecureToken, threeDSecureInformation)];
	                            case AuthenticationStatus.VALIDATION_NEEDED:
	                                return [2 /*return*/, performTransparentValidation(threeDSecureToken)];
	                            case AuthenticationStatus.AUTHENTICATION_FAILED:
	                            case AuthenticationStatus.AUTHENTICATION_SUCCESSFUL:
	                            default:
	                                return [2 /*return*/, buildAuthenticateResult(threeDSecureInformation)];
	                        }
	                        return [2 /*return*/];
	                }
	            });
	        });
	    };
	    return ThreeDSecureModule;
	}());
	function buildAuthenticateResult(auth) {
	    if (auth.status !== AuthenticationStatus.AUTHENTICATION_SUCCESSFUL) {
	        throw new Error(AuthenticationStatus.AUTHENTICATION_FAILED);
	    }
	    return new ThreeDSecureFulfilledSession(auth.eci, auth.cryptogram, auth.xid, auth.version, auth.trxId);
	}
	function checkIfShouldAuthenticate(options) {
	    var CAIXA_CARD_BIN_WHITELIST = [
	        "506722",
	        "509023",
	        "509030",
	        "509105",
	        "439267",
	    ];
	    var cardBin = options.paymentInformation.card.number.substr(0, 6);
	    return !CAIXA_CARD_BIN_WHITELIST.includes(cardBin);
	}
	function getDeviceInformation() {
	    return {
	        httpBrowserColorDepth: window.screen["colorDepth"].toString(),
	        httpBrowserJavaEnabled: window.navigator["javaEnabled"]() ? "Y" : "N",
	        httpBrowserJavaScriptEnabled: "Y",
	        httpBrowserLanguage: window.navigator["language"],
	        httpBrowserScreenHeight: window["innerHeight"].toString(),
	        httpBrowserScreenWidth: window["innerWidth"].toString(),
	        httpBrowserTimeDifference: new Date().getTimezoneOffset().toString(),
	        userAgentBrowserValue: window.navigator["userAgent"],
	    };
	}

	var CardTokenizerModule = /** @class */ (function () {
	    function CardTokenizerModule(config) {
	        this.config = config;
	        this.httpClient = new EbanxPayHttpClient(config);
	    }
	    CardTokenizerModule.prototype.tokenize = function (options) {
	        return __awaiter(this, void 0, void 0, function () {
	            var path, data, response, responseJson;
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0:
	                        path = "/ws/token";
	                        data = this.buildRequestData(options);
	                        return [4 /*yield*/, this.httpClient.post({ path: path, data: data })];
	                    case 1:
	                        response = _a.sent();
	                        return [4 /*yield*/, response.json()];
	                    case 2:
	                        responseJson = _a.sent();
	                        if (responseJson.status !== "SUCCESS")
	                            throw new Error(CardTokenizerModule.buildErrorMessage(responseJson));
	                        return [2 /*return*/, CardTokenizerModule.normalizeResponseJson(responseJson)];
	                }
	            });
	        });
	    };
	    CardTokenizerModule.normalizeResponseJson = function (responseJson) {
	        var _a;
	        var token = (_a = responseJson.token.token) !== null && _a !== void 0 ? _a : responseJson.token;
	        return {
	            token: token,
	            payment_type_code: responseJson.payment_type_code,
	        };
	    };
	    CardTokenizerModule.prototype.buildRequestData = function (_a) {
	        var card = _a.card, countryCode = _a.countryCode, paymentTypeCode = _a.paymentTypeCode;
	        return {
	            card: {
	                card_cvv: card.cvv,
	                card_name: card.holderName,
	                card_number: card.number,
	                card_due_date: card.dueDate,
	            },
	            country: countryCode,
	            payment_type_code: paymentTypeCode,
	            public_integration_key: this.config.publicIntegrationKey,
	        };
	    };
	    CardTokenizerModule.buildErrorMessage = function (_a) {
	        var status = _a.status, status_code = _a.status_code, status_message = _a.status_message;
	        if (status === "ERROR")
	            return "CardTokenizerModule - response error with status code \"" + status_code + "\": " + status_message;
	        else
	            return "CardTokenizerModule - unknown response status \"" + status + "\"";
	    };
	    return CardTokenizerModule;
	}());

	var n,u,i,t,o,r,f={},e=[],c=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function s(n,l){for(var u in l)n[u]=l[u];return n}function a(n){var l=n.parentNode;l&&l.removeChild(n);}function h(n,l,u){var i,t,o,r=arguments,f={};for(o in l)"key"==o?i=l[o]:"ref"==o?t=l[o]:f[o]=l[o];if(arguments.length>3)for(u=[u],o=3;o<arguments.length;o++)u.push(r[o]);if(null!=u&&(f.children=u),"function"==typeof n&&null!=n.defaultProps)for(o in n.defaultProps)void 0===f[o]&&(f[o]=n.defaultProps[o]);return v(n,f,i,t,null)}function v(l,u,i,t,o){var r={type:l,props:u,key:i,ref:t,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:o};return null==o&&(r.__v=r),null!=n.vnode&&n.vnode(r),r}function y(){return {current:null}}function p(n){return n.children}function d(n,l){this.props=n,this.context=l;}function _(n,l){if(null==l)return n.__?_(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return "function"==typeof n.type?_(n):null}function w(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return w(n)}}function k(l){(!l.__d&&(l.__d=!0)&&u.push(l)&&!g.__r++||t!==n.debounceRendering)&&((t=n.debounceRendering)||i)(g);}function g(){for(var n;g.__r=u.length;)n=u.sort(function(n,l){return n.__v.__b-l.__v.__b}),u=[],n.some(function(n){var l,u,i,t,o,r,f;n.__d&&(r=(o=(l=n).__v).__e,(f=l.__P)&&(u=[],(i=s({},o)).__v=i,t=$(f,o,i,l.__n,void 0!==f.ownerSVGElement,null!=o.__h?[r]:null,u,null==r?_(o):r,o.__h),j(u,o),t!=r&&w(o)));});}function m(n,l,u,i,t,o,r,c,s,h){var y,d,w,k,g,m,b,A=i&&i.__k||e,P=A.length;for(s==f&&(s=null!=r?r[0]:P?_(i,0):null),u.__k=[],y=0;y<l.length;y++)if(null!=(k=u.__k[y]=null==(k=l[y])||"boolean"==typeof k?null:"string"==typeof k||"number"==typeof k?v(null,k,null,null,k):Array.isArray(k)?v(p,{children:k},null,null,null):null!=k.__e||null!=k.__c?v(k.type,k.props,k.key,null,k.__v):k)){if(k.__=u,k.__b=u.__b+1,null===(w=A[y])||w&&k.key==w.key&&k.type===w.type)A[y]=void 0;else for(d=0;d<P;d++){if((w=A[d])&&k.key==w.key&&k.type===w.type){A[d]=void 0;break}w=null;}g=$(n,k,w=w||f,t,o,r,c,s,h),(d=k.ref)&&w.ref!=d&&(b||(b=[]),w.ref&&b.push(w.ref,null,k),b.push(d,k.__c||g,k)),null!=g?(null==m&&(m=g),s=x(n,k,w,A,r,g,s),h||"option"!=u.type?"function"==typeof u.type&&(u.__d=s):n.value=""):s&&w.__e==s&&s.parentNode!=n&&(s=_(w));}if(u.__e=m,null!=r&&"function"!=typeof u.type)for(y=r.length;y--;)null!=r[y]&&a(r[y]);for(y=P;y--;)null!=A[y]&&L(A[y],A[y]);if(b)for(y=0;y<b.length;y++)I(b[y],b[++y],b[++y]);}function b(n,l){return l=l||[],null==n||"boolean"==typeof n||(Array.isArray(n)?n.some(function(n){b(n,l);}):l.push(n)),l}function x(n,l,u,i,t,o,r){var f,e,c;if(void 0!==l.__d)f=l.__d,l.__d=void 0;else if(t==u||o!=r||null==o.parentNode)n:if(null==r||r.parentNode!==n)n.appendChild(o),f=null;else {for(e=r,c=0;(e=e.nextSibling)&&c<i.length;c+=2)if(e==o)break n;n.insertBefore(o,r),f=r;}return void 0!==f?f:o.nextSibling}function A(n,l,u,i,t){var o;for(o in u)"children"===o||"key"===o||o in l||C(n,o,null,u[o],i);for(o in l)t&&"function"!=typeof l[o]||"children"===o||"key"===o||"value"===o||"checked"===o||u[o]===l[o]||C(n,o,l[o],u[o],i);}function P(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]=null==u?"":"number"!=typeof u||c.test(l)?u:u+"px";}function C(n,l,u,i,t){var o,r,f;if(t&&"className"==l&&(l="class"),"style"===l)if("string"==typeof u)n.style.cssText=u;else {if("string"==typeof i&&(n.style.cssText=i=""),i)for(l in i)u&&l in u||P(n.style,l,"");if(u)for(l in u)i&&u[l]===i[l]||P(n.style,l,u[l]);}else "o"===l[0]&&"n"===l[1]?(o=l!==(l=l.replace(/Capture$/,"")),(r=l.toLowerCase())in n&&(l=r),l=l.slice(2),n.l||(n.l={}),n.l[l+o]=u,f=o?N:z,u?i||n.addEventListener(l,f,o):n.removeEventListener(l,f,o)):"list"!==l&&"tagName"!==l&&"form"!==l&&"type"!==l&&"size"!==l&&"download"!==l&&"href"!==l&&!t&&l in n?n[l]=null==u?"":u:"function"!=typeof u&&"dangerouslySetInnerHTML"!==l&&(l!==(l=l.replace(/xlink:?/,""))?null==u||!1===u?n.removeAttributeNS("http://www.w3.org/1999/xlink",l.toLowerCase()):n.setAttributeNS("http://www.w3.org/1999/xlink",l.toLowerCase(),u):null==u||!1===u&&!/^ar/.test(l)?n.removeAttribute(l):n.setAttribute(l,u));}function z(l){this.l[l.type+!1](n.event?n.event(l):l);}function N(l){this.l[l.type+!0](n.event?n.event(l):l);}function T(n,l,u){var i,t;for(i=0;i<n.__k.length;i++)(t=n.__k[i])&&(t.__=n,t.__e&&("function"==typeof t.type&&t.__k.length>1&&T(t,l,u),l=x(u,t,t,n.__k,null,t.__e,l),"function"==typeof n.type&&(n.__d=l)));}function $(l,u,i,t,o,r,f,e,c){var a,h,v,y,_,w,k,g,b,x,A,P=u.type;if(void 0!==u.constructor)return null;null!=i.__h&&(c=i.__h,e=u.__e=i.__e,u.__h=null,r=[e]),(a=n.__b)&&a(u);try{n:if("function"==typeof P){if(g=u.props,b=(a=P.contextType)&&t[a.__c],x=a?b?b.props.value:a.__:t,i.__c?k=(h=u.__c=i.__c).__=h.__E:("prototype"in P&&P.prototype.render?u.__c=h=new P(g,x):(u.__c=h=new d(g,x),h.constructor=P,h.render=M),b&&b.sub(h),h.props=g,h.state||(h.state={}),h.context=x,h.__n=t,v=h.__d=!0,h.__h=[]),null==h.__s&&(h.__s=h.state),null!=P.getDerivedStateFromProps&&(h.__s==h.state&&(h.__s=s({},h.__s)),s(h.__s,P.getDerivedStateFromProps(g,h.__s))),y=h.props,_=h.state,v)null==P.getDerivedStateFromProps&&null!=h.componentWillMount&&h.componentWillMount(),null!=h.componentDidMount&&h.__h.push(h.componentDidMount);else {if(null==P.getDerivedStateFromProps&&g!==y&&null!=h.componentWillReceiveProps&&h.componentWillReceiveProps(g,x),!h.__e&&null!=h.shouldComponentUpdate&&!1===h.shouldComponentUpdate(g,h.__s,x)||u.__v===i.__v){h.props=g,h.state=h.__s,u.__v!==i.__v&&(h.__d=!1),h.__v=u,u.__e=i.__e,u.__k=i.__k,h.__h.length&&f.push(h),T(u,e,l);break n}null!=h.componentWillUpdate&&h.componentWillUpdate(g,h.__s,x),null!=h.componentDidUpdate&&h.__h.push(function(){h.componentDidUpdate(y,_,w);});}h.context=x,h.props=g,h.state=h.__s,(a=n.__r)&&a(u),h.__d=!1,h.__v=u,h.__P=l,a=h.render(h.props,h.state,h.context),h.state=h.__s,null!=h.getChildContext&&(t=s(s({},t),h.getChildContext())),v||null==h.getSnapshotBeforeUpdate||(w=h.getSnapshotBeforeUpdate(y,_)),A=null!=a&&a.type==p&&null==a.key?a.props.children:a,m(l,Array.isArray(A)?A:[A],u,i,t,o,r,f,e,c),h.base=u.__e,u.__h=null,h.__h.length&&f.push(h),k&&(h.__E=h.__=null),h.__e=!1;}else null==r&&u.__v===i.__v?(u.__k=i.__k,u.__e=i.__e):u.__e=H(i.__e,u,i,t,o,r,f,c);(a=n.diffed)&&a(u);}catch(l){u.__v=null,(c||null!=r)&&(u.__e=e,u.__h=!!c,r[r.indexOf(e)]=null),n.__e(l,u,i);}return u.__e}function j(l,u){n.__c&&n.__c(u,l),l.some(function(u){try{l=u.__h,u.__h=[],l.some(function(n){n.call(u);});}catch(l){n.__e(l,u.__v);}});}function H(n,l,u,i,t,o,r,c){var s,a,h,v,y,p=u.props,d=l.props;if(t="svg"===l.type||t,null!=o)for(s=0;s<o.length;s++)if(null!=(a=o[s])&&((null===l.type?3===a.nodeType:a.localName===l.type)||n==a)){n=a,o[s]=null;break}if(null==n){if(null===l.type)return document.createTextNode(d);n=t?document.createElementNS("http://www.w3.org/2000/svg",l.type):document.createElement(l.type,d.is&&{is:d.is}),o=null,c=!1;}if(null===l.type)p===d||c&&n.data===d||(n.data=d);else {if(null!=o&&(o=e.slice.call(n.childNodes)),h=(p=u.props||f).dangerouslySetInnerHTML,v=d.dangerouslySetInnerHTML,!c){if(null!=o)for(p={},y=0;y<n.attributes.length;y++)p[n.attributes[y].name]=n.attributes[y].value;(v||h)&&(v&&(h&&v.__html==h.__html||v.__html===n.innerHTML)||(n.innerHTML=v&&v.__html||""));}A(n,d,p,t,c),v?l.__k=[]:(s=l.props.children,m(n,Array.isArray(s)?s:[s],l,u,i,"foreignObject"!==l.type&&t,o,r,f,c)),c||("value"in d&&void 0!==(s=d.value)&&(s!==n.value||"progress"===l.type&&!s)&&C(n,"value",s,p.value,!1),"checked"in d&&void 0!==(s=d.checked)&&s!==n.checked&&C(n,"checked",s,p.checked,!1));}return n}function I(l,u,i){try{"function"==typeof l?l(u):l.current=u;}catch(l){n.__e(l,i);}}function L(l,u,i){var t,o,r;if(n.unmount&&n.unmount(l),(t=l.ref)&&(t.current&&t.current!==l.__e||I(t,null,u)),i||"function"==typeof l.type||(i=null!=(o=l.__e)),l.__e=l.__d=void 0,null!=(t=l.__c)){if(t.componentWillUnmount)try{t.componentWillUnmount();}catch(l){n.__e(l,u);}t.base=t.__P=null;}if(t=l.__k)for(r=0;r<t.length;r++)t[r]&&L(t[r],u,i);null!=o&&a(o);}function M(n,l,u){return this.constructor(n,u)}function O(l,u,i){var t,r,c;n.__&&n.__(l,u),r=(t=i===o)?null:i&&i.__k||u.__k,l=h(p,null,[l]),c=[],$(u,(t?u:i||u).__k=l,r||f,f,void 0!==u.ownerSVGElement,i&&!t?[i]:r?null:u.childNodes.length?e.slice.call(u.childNodes):null,c,i||f,t),j(c,l);}function S(n,l){O(n,l,o);}function q(n,l,u){var i,t,o,r=arguments,f=s({},n.props);for(o in l)"key"==o?i=l[o]:"ref"==o?t=l[o]:f[o]=l[o];if(arguments.length>3)for(u=[u],o=3;o<arguments.length;o++)u.push(r[o]);return null!=u&&(f.children=u),v(n.type,f,i||n.key,t||n.ref,null)}function B(n,l){var u={__c:l="__cC"+r++,__:n,Consumer:function(n,l){return n.children(l)},Provider:function(n,u,i){return this.getChildContext||(u=[],(i={})[l]=this,this.getChildContext=function(){return i},this.shouldComponentUpdate=function(n){this.props.value!==n.value&&u.some(k);},this.sub=function(n){u.push(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){u.splice(u.indexOf(n),1),l&&l.call(n);};}),n.children}};return u.Provider.__=u.Consumer.contextType=u}n={__e:function(n,l){for(var u,i,t,o=l.__h;l=l.__;)if((u=l.__c)&&!u.__)try{if((i=u.constructor)&&null!=i.getDerivedStateFromError&&(u.setState(i.getDerivedStateFromError(n)),t=u.__d),null!=u.componentDidCatch&&(u.componentDidCatch(n),t=u.__d),t)return l.__h=o,u.__E=u}catch(l){n=l;}throw n}},d.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=s({},this.state),"function"==typeof n&&(n=n(s({},u),this.props)),n&&s(u,n),null!=n&&this.__v&&(l&&this.__h.push(l),k(this));},d.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),k(this));},d.prototype.render=p,u=[],i="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,g.__r=0,o=f,r=0;

	var t$1,u$1,r$1,o$1=0,i$1=[],c$1=n.__r,f$1=n.diffed,e$1=n.__c,a$1=n.unmount;function v$1(t,r){n.__h&&n.__h(u$1,t,o$1||r),o$1=0;var i=u$1.__H||(u$1.__H={__:[],__h:[]});return t>=i.__.length&&i.__.push({}),i.__[t]}function m$1(n){return o$1=1,p$1(k$1,n)}function p$1(n,r,o){var i=v$1(t$1++,2);return i.t=n,i.__c||(i.__=[o?o(r):k$1(void 0,r),function(n){var t=i.t(i.__[0],n);i.__[0]!==t&&(i.__=[t,i.__[1]],i.__c.setState({}));}],i.__c=u$1),i.__}function y$1(r,o){var i=v$1(t$1++,3);!n.__s&&j$1(i.__H,o)&&(i.__=r,i.__H=o,u$1.__H.__h.push(i));}function l(r,o){var i=v$1(t$1++,4);!n.__s&&j$1(i.__H,o)&&(i.__=r,i.__H=o,u$1.__h.push(i));}function h$1(n){return o$1=5,_$1(function(){return {current:n}},[])}function s$1(n,t,u){o$1=6,l(function(){"function"==typeof n?n(t()):n&&(n.current=t());},null==u?u:u.concat(n));}function _$1(n,u){var r=v$1(t$1++,7);return j$1(r.__H,u)&&(r.__=n(),r.__H=u,r.__h=n),r.__}function A$1(n,t){return o$1=8,_$1(function(){return n},t)}function F(n){var r=u$1.context[n.__c],o=v$1(t$1++,9);return o.__c=n,r?(null==o.__&&(o.__=!0,r.sub(u$1)),r.props.value):n.__}function T$1(t,u){n.useDebugValue&&n.useDebugValue(u?u(t):t);}function d$1(n){var r=v$1(t$1++,10),o=m$1();return r.__=n,u$1.componentDidCatch||(u$1.componentDidCatch=function(n){r.__&&r.__(n),o[1](n);}),[o[0],function(){o[1](void 0);}]}function q$1(){i$1.forEach(function(t){if(t.__P)try{t.__H.__h.forEach(b$1),t.__H.__h.forEach(g$1),t.__H.__h=[];}catch(u){t.__H.__h=[],n.__e(u,t.__v);}}),i$1=[];}n.__r=function(n){c$1&&c$1(n),t$1=0;var r=(u$1=n.__c).__H;r&&(r.__h.forEach(b$1),r.__h.forEach(g$1),r.__h=[]);},n.diffed=function(t){f$1&&f$1(t);var u=t.__c;u&&u.__H&&u.__H.__h.length&&(1!==i$1.push(u)&&r$1===n.requestAnimationFrame||((r$1=n.requestAnimationFrame)||function(n){var t,u=function(){clearTimeout(r),x$1&&cancelAnimationFrame(t),setTimeout(n);},r=setTimeout(u,100);x$1&&(t=requestAnimationFrame(u));})(q$1));},n.__c=function(t,u){u.some(function(t){try{t.__h.forEach(b$1),t.__h=t.__h.filter(function(n){return !n.__||g$1(n)});}catch(r){u.some(function(n){n.__h&&(n.__h=[]);}),u=[],n.__e(r,t.__v);}}),e$1&&e$1(t,u);},n.unmount=function(t){a$1&&a$1(t);var u=t.__c;if(u&&u.__H)try{u.__H.__.forEach(b$1);}catch(t){n.__e(t,u.__v);}};var x$1="function"==typeof requestAnimationFrame;function b$1(n){"function"==typeof n.__c&&n.__c();}function g$1(n){n.__c=n.__();}function j$1(n,t){return !n||n.length!==t.length||t.some(function(t,u){return t!==n[u]})}function k$1(n,t){return "function"==typeof t?t(n):t}

	var ConfigContext = B(null);
	var ConfigContextProvider = ConfigContext.Provider;
	function useConfigContext() {
	    return F(ConfigContext);
	}
	function useConfigCountry() {
	    return useConfigContext().country;
	}

	var ExternalEvents = /** @class */ (function () {
	    function ExternalEvents() {
	        this.listeners = {};
	        this.listenersOnce = {};
	        this.unconsumedEvents = [];
	    }
	    ExternalEvents.prototype.dispatch = function (eventName, eventData) {
	        var listenersOnce = this.listenersOnce[eventName];
	        var dispatched = false;
	        while (listenersOnce && listenersOnce.length > 0) {
	            var next = listenersOnce.shift();
	            next(eventData);
	            dispatched = true;
	        }
	        var listeners = this.listeners[eventName];
	        if (listeners && listeners.length > 0) {
	            listeners.forEach(function (listener) {
	                listener(eventData);
	                dispatched = true;
	            });
	        }
	        if (!dispatched) {
	            this.unconsumedEvents.push([eventName, eventData]);
	        }
	    };
	    ExternalEvents.prototype.unlistenAll = function (eventName) {
	        if (eventName in this.listeners) {
	            this.listeners[eventName] = [];
	        }
	        if (eventName in this.listenersOnce) {
	            this.listenersOnce[eventName] = [];
	        }
	    };
	    ExternalEvents.prototype.listen = function (eventName, listener) {
	        if (!(eventName in this.listeners)) {
	            this.listeners[eventName] = [];
	        }
	        this.listeners[eventName].push(listener);
	        this.checkLazyDispatch(eventName);
	    };
	    ExternalEvents.prototype.listenUnique = function (eventName, listener) {
	        this.unlistenAll(eventName);
	        this.listen(eventName, listener);
	    };
	    ExternalEvents.prototype.listenOnce = function (eventName, listener) {
	        if (!(eventName in this.listenersOnce)) {
	            this.listenersOnce[eventName] = [];
	        }
	        this.listenersOnce[eventName].push(listener);
	        this.checkLazyDispatch(eventName);
	    };
	    ExternalEvents.prototype.checkLazyDispatch = function (eventName) {
	        for (var i = 0; i < this.unconsumedEvents.length;) {
	            if (this.unconsumedEvents[i][0] === eventName) {
	                this.dispatch.apply(this, this.unconsumedEvents[i]);
	                this.unconsumedEvents.splice(i, 1);
	            }
	            else {
	                i++;
	            }
	        }
	    };
	    return ExternalEvents;
	}());
	var externalEvents = new ExternalEvents();

	function normalizeLookAndFeelOptions(mountOptions) {
	    if (typeof mountOptions === "string")
	        return {
	            name: mountOptions,
	        };
	    return mountOptions;
	}
	function getAllLookAndFeels() {
	    return [
	        "raw",
	        "vanilla",
	    ];
	}

	var DataState = /** @class */ (function () {
	    function DataState(_stage) {
	        this._stage = _stage;
	    }
	    Object.defineProperty(DataState.prototype, "stage", {
	        get: function () {
	            return this._stage;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    DataState.prototype.isSent = function () {
	        return this === DataState.SENT;
	    };
	    DataState.prototype.isSending = function () {
	        return this === DataState.SENDING;
	    };
	    DataState.NULL = new DataState(null);
	    DataState.SENT = new DataState("sent");
	    DataState.SENDING = new DataState("sending");
	    return DataState;
	}());
	var DataStateContext = B(DataState.NULL);
	var DataStateProvider = DataStateContext.Provider;
	function useDataState() {
	    return F(DataStateContext);
	}

	var EXTERNALLY_MANAGED_USER_INPUT_VALUE = Object.freeze({ external: true });
	function isExternallyManagedUserInputValue(value) {
	    return typeof value === "object" && value !== null && "external" in value && value.external;
	}
	function narrowToLocallyManagedUserInputValue(value) {
	    if (isExternallyManagedUserInputValue(value)) {
	        throw new Error("Could not narrow user input value to locally managed value because it is being managed externally");
	    }
	    return value;
	}
	var UserInputValuesContext = B(null);
	var UserInputValuesProvider = UserInputValuesContext.Provider;
	function useUserInputValuesState(config, initialUserInputValues) {
	    return m$1(__assign(__assign(__assign({}, defaultUserInputValues), initialUserInputValues), { billingAddressCountry: config.country }));
	}
	function useUserInputValues() {
	    return F(UserInputValuesContext);
	}
	function useUserInputValue(key) {
	    var _a = useUserInputValues(), userInputValues = _a.userInputValues, setUserInputValues = _a.setUserInputValues;
	    var setUserInputValue = A$1(function (newValue) {
	        setUserInputValues(function (userInputValues) {
	            var _a;
	            return (__assign(__assign({}, userInputValues), (_a = {}, _a[key] = newValue, _a)));
	        });
	    }, [setUserInputValues, key]);
	    return [userInputValues[key], setUserInputValue];
	}
	function useUserInputValueForSelectTag(key) {
	    var _a = useUserInputValue(key), value = _a[0], setValue = _a[1];
	    var handleChange = A$1(function (evt) {
	        setValue(evt.currentTarget.value);
	    }, [setValue]);
	    return [value, handleChange];
	}
	function useUserInputValueForInputTag(key) {
	    var _a = useUserInputValue(key), value = _a[0], setValue = _a[1];
	    var handleChange = A$1(function (evt) {
	        setValue(evt.currentTarget.value);
	    }, [setValue]);
	    return [value, handleChange];
	}
	var defaultUserInputValues = {
	    billingAddressCountry: exports.Country.BRAZIL,
	    billingAddressCity: "",
	    billingAddressStreet: "",
	    billingAddressStreetNumber: "",
	    billingAddressState: "",
	    billingAddressZipcode: "",
	    billingAddressComplement: "",
	    customerName: "",
	    customerDocumentType: "",
	    customerDocument: "",
	    customerEmail: "",
	    customerPhoneNumber: "",
	    creditCardCvv: "",
	    creditCardDueDate: "",
	    creditCardHolderName: "",
	    creditCardNumber: "",
	    creditCardDetails: null,
	    tokenizedCreditCard: null,
	    debitCardCvv: "",
	    debitCardDueDate: "",
	    debitCardHolderName: "",
	    debitCardNumber: "",
	    selectedInstalmentsNumber: "1",
	};

	var VALID_USER_INPUT_VALUE_VALIDATION = Object.freeze({ valid: true });

	var NoValidator = /** @class */ (function () {
	    function NoValidator() {
	    }
	    NoValidator.prototype.validate = function (value) {
	        return VALID_USER_INPUT_VALUE_VALIDATION;
	    };
	    return NoValidator;
	}());

	var NotEmptyValidator = /** @class */ (function () {
	    function NotEmptyValidator() {
	    }
	    NotEmptyValidator.prototype.validate = function (value) {
	        if (!value || !value.trim())
	            return { valid: false, errorCode: "empty" };
	        return VALID_USER_INPUT_VALUE_VALIDATION;
	    };
	    return NotEmptyValidator;
	}());

	function extractCardBin(cardNumber) {
	    var cardBinRegex = /^(\d{6})/;
	    var results = cardBinRegex.exec(sanitizeCardNumber(cardNumber));
	    if (!results || results.length < 2)
	        throw new Error("Card number is not valid");
	    return results[1];
	}
	function extractCardLastFour(cardNumber) {
	    var lastFourRegex = /(\d{4})$/;
	    var results = lastFourRegex.exec(sanitizeCardNumber(cardNumber));
	    if (!results || results.length < 2)
	        throw new Error("Card number is not valid");
	    return results[1];
	}
	function sanitizeCardNumber(cardNumber) {
	    return cardNumber.replace(/\D/g, "");
	}
	function formatCardExpDateWithFullYear(cardDueDate, yearPrefix) {
	    if (yearPrefix === void 0) { yearPrefix = "20"; }
	    var cardDueDateRegex = /^(\d{2})\/(\d{2}|\d{4})$/;
	    var results = cardDueDateRegex.exec(cardDueDate);
	    if (!results || results.length < 3)
	        throw new Error("Card due date is not valid");
	    var dueMonth = results[1];
	    var dueYear = results[2];
	    if (dueYear.length === 4)
	        return dueMonth + "/" + dueYear;
	    return dueMonth + "/" + yearPrefix + dueYear;
	}

	function formatAmountWithCurrency(amount, currencySymbol) {
	    var amountWithDecimals = parseFloat(amount).toFixed(2);
	    var formattedAmount = amountWithDecimals.replace(".", ",");
	    return currencySymbol + " " + formattedAmount;
	}

	function getAvailableCountries() {
	    return [
	        exports.Country.ARGENTINA,
	        exports.Country.BRAZIL,
	        exports.Country.CHILE,
	        exports.Country.COLOMBIA,
	        exports.Country.MEXICO,
	        exports.Country.PERU,
	        exports.Country.URUGUAY,
	    ];
	}

	function getAvailableInstalmentNumbersForCountry(country) {
	    switch (country) {
	        case exports.Country.ARGENTINA:
	            return [1, 2, 3, 6, 9, 12];
	        case exports.Country.BRAZIL:
	            return getSequentialInstalmentNumbersArray(12);
	        case exports.Country.COLOMBIA:
	            return getSequentialInstalmentNumbersArray(36);
	        case exports.Country.MEXICO:
	            return [1, 3, 6, 9, 12];
	        case exports.Country.CHILE:
	        case exports.Country.PERU:
	            return getSequentialInstalmentNumbersArray(48);
	        case exports.Country.URUGUAY:
	            return getSequentialInstalmentNumbersArray(6);
	        default:
	            throw new Error("Instalments are not supported for country " + country);
	    }
	}
	function getSequentialInstalmentNumbersArray(instalmentsNumber) {
	    return Array(instalmentsNumber).fill(1).map(function (one, index) { return index + one; });
	}

	var DocumentType;
	(function (DocumentType) {
	    DocumentType["BR_CPF"] = "br_cpf";
	    DocumentType["BR_CNPJ"] = "br_cnpj";
	    DocumentType["UY_CI"] = "uy_ci";
	    DocumentType["CL_RUT"] = "cl_rut";
	    DocumentType["AR_DNI"] = "ar_dni";
	    DocumentType["AR_CUIL"] = "ar_cuil";
	    DocumentType["AR_CUIT"] = "ar_cuit";
	    DocumentType["AR_CDI"] = "ar_cdi";
	    DocumentType["CO_NIT"] = "co_nit";
	    DocumentType["CO_CC"] = "co_cc";
	    DocumentType["CO_CE"] = "co_ce";
	    DocumentType["EC_DOC"] = "ec_doc";
	    DocumentType["PE_DOC"] = "pe_doc";
	})(DocumentType || (DocumentType = {}));

	function getDocumentTypesForCountry(country) {
	    switch (country) {
	        case exports.Country.ARGENTINA:
	            return [
	                { documentType: DocumentType.AR_CUIT, name: "CUIT" },
	                { documentType: DocumentType.AR_CUIL, name: "CUIL" },
	                { documentType: DocumentType.AR_CDI, name: "CDI" },
	                { documentType: DocumentType.AR_DNI, name: "DNI" },
	            ];
	        case exports.Country.COLOMBIA:
	            return [
	                { documentType: DocumentType.CO_CC, name: "Cédula de Ciudadanía" },
	                { documentType: DocumentType.CO_NIT, name: "NIT" },
	                { documentType: DocumentType.CO_CE, name: "Cédula de Extranjería" },
	            ];
	        default:
	            return [];
	    }
	}

	function getMinInstalmentAmountValueForCountry(country) {
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return 5;
	        case exports.Country.MEXICO:
	            return 100;
	        case exports.Country.ARGENTINA:
	        case exports.Country.CHILE:
	        case exports.Country.COLOMBIA:
	        case exports.Country.PERU:
	        case exports.Country.URUGUAY:
	            return 1;
	        default:
	            return 0;
	    }
	}

	var CountryValidator = /** @class */ (function () {
	    function CountryValidator() {
	    }
	    CountryValidator.prototype.validate = function (value) {
	        if (!value || !value.trim())
	            return { valid: false, errorCode: "empty" };
	        if (!getAvailableCountries().includes(value))
	            return { valid: false, errorCode: "invalid-option" };
	        return VALID_USER_INPUT_VALUE_VALIDATION;
	    };
	    return CountryValidator;
	}());

	var ZipcodeProcessor = /** @class */ (function () {
	    function ZipcodeProcessor(options) {
	        this.options = options;
	    }
	    ZipcodeProcessor.prototype.validate = function (zipcode) {
	        var validationRegex = this.options.validationRegex;
	        var sanitizedZipcode = removeSymbols(zipcode);
	        return validationRegex.test(sanitizedZipcode);
	    };
	    ZipcodeProcessor.prototype.applyMask = function (zipcode) {
	        var _a = this.options, maskRegex = _a.maskRegex, maskPattern = _a.maskPattern;
	        var sanitizedZipcode = removeSymbols(zipcode);
	        if (maskRegex && maskPattern)
	            return sanitizedZipcode.replace(maskRegex, maskPattern);
	        else
	            return sanitizedZipcode;
	    };
	    return ZipcodeProcessor;
	}());
	function removeSymbols(zipcode) {
	    return zipcode.replace(/[^a-zA-Z0-9]/g, "");
	}

	var ZipcodeProcessorResolver = /** @class */ (function () {
	    function ZipcodeProcessorResolver() {
	    }
	    ZipcodeProcessorResolver.resolve = function (country) {
	        switch (country) {
	            // Argentina
	            case "ar":
	                return new ZipcodeProcessor({ validationRegex: /^[a-zA-Z]{1}[0-9]{4}[a-zA-Z]{3}$/ });
	            // Brazil
	            case "br":
	                return new ZipcodeProcessor({
	                    validationRegex: /^[0-9]{8}$/,
	                    maskRegex: /([0-9]{5})([0-9]{3})/,
	                    maskPattern: "$1-$2",
	                });
	            // Chile
	            case "cl":
	                return new ZipcodeProcessor({ validationRegex: /^[0-9]{7}$/ });
	            // Colombia
	            case "co":
	                return new ZipcodeProcessor({ validationRegex: /^[0-9]{6}$/ });
	            // Ecuador
	            case "ec":
	                return new ZipcodeProcessor({ validationRegex: /^[0-9]{6}$/ });
	            // Mexico
	            case "mx":
	                return new ZipcodeProcessor({ validationRegex: /^[0-9]{5}$/ });
	            // Peru
	            case "pe":
	                return new ZipcodeProcessor({ validationRegex: /^[0-9]{5}$/ });
	            // Uruguay
	            case "uy":
	                return new ZipcodeProcessor({ validationRegex: /^[0-9]{5}$/ });
	            // Bolivia (does not have zipcode)
	            case "bo":
	            default:
	                throw new Error("ZipcodeProcessorResolver - Invalid country " + country);
	        }
	    };
	    return ZipcodeProcessorResolver;
	}());

	var UtilsZipcode = /** @class */ (function () {
	    function UtilsZipcode() {
	    }
	    UtilsZipcode.prototype.check = function (options) {
	        UtilsZipcode.validateOptions(options);
	        var country = options.country, zipcode = options.zipcode;
	        var zipcodeProcessor = ZipcodeProcessorResolver.resolve(country);
	        var isValid = zipcodeProcessor.validate(zipcode);
	        var maskedField = isValid ? zipcodeProcessor.applyMask(zipcode) : "";
	        return Promise.resolve({
	            status: "success",
	            data: {
	                zipcode: {
	                    isValid: isValid,
	                    maskedField: maskedField,
	                },
	            },
	        });
	    };
	    UtilsZipcode.validateOptions = function (_a) {
	        var country = _a.country, zipcode = _a.zipcode;
	        if (!country)
	            throw new Error("Missing country");
	        if (typeof zipcode === "undefined")
	            throw new Error("Missing zipcode value");
	        if (typeof zipcode !== "string")
	            throw new Error("Zipcode must be a string");
	    };
	    return UtilsZipcode;
	}());

	var ZipcodeValidator = /** @class */ (function () {
	    function ZipcodeValidator() {
	    }
	    ZipcodeValidator.prototype.validate = function (value, userInputValues) {
	        if (!value || !value.trim())
	            return { valid: false, errorCode: "empty" };
	        var billingAddressCountry = userInputValues.billingAddressCountry;
	        if (!ZipcodeValidator.validateZipcodeByCountry(value, billingAddressCountry))
	            return { valid: false, errorCode: "invalid-pattern" };
	        return VALID_USER_INPUT_VALUE_VALIDATION;
	    };
	    ZipcodeValidator.validateZipcodeByCountry = function (zipcode, country) {
	        try {
	            var countryCode = getCountryCode(country);
	            var zipcodeProcessor = ZipcodeProcessorResolver.resolve(countryCode);
	            return zipcodeProcessor.validate(zipcode);
	        }
	        catch (err) {
	            return false;
	        }
	    };
	    return ZipcodeValidator;
	}());

	var Argentina = /** @class */ (function () {
	    function Argentina() {
	    }
	    Argentina.prototype.getStateList = function () {
	        return [
	            { name: "Buenos Aires", code: "BA" },
	            { name: "Catamarca", code: "CT" },
	            { name: "Chaco", code: "CC" },
	            { name: "Chubut", code: "CH" },
	            { name: "Ciudad de Buenos Aires", code: "DF" },
	            { name: "Córdoba", code: "CB" },
	            { name: "Corrientes", code: "CN" },
	            { name: "Entre Ríos", code: "ER" },
	            { name: "Formosa", code: "FM" },
	            { name: "Jujuy", code: "JY" },
	            { name: "La Pampa", code: "LP" },
	            { name: "La Rioja", code: "LR" },
	            { name: "Mendoza", code: "MZ" },
	            { name: "Misiones", code: "MN" },
	            { name: "Neuquén", code: "NQ" },
	            { name: "Río Negro", code: "RN" },
	            { name: "Salta", code: "SA" },
	            { name: "San Juan", code: "SJ" },
	            { name: "San Luis", code: "SL" },
	            { name: "Santa Cruz", code: "SC" },
	            { name: "Santa Fe", code: "SF" },
	            { name: "Santiago del Estero", code: "SE" },
	            { name: "Tierra del Fuego", code: "TF" },
	            { name: "Tucumán", code: "TM" },
	        ];
	    };
	    return Argentina;
	}());

	var Brazil = /** @class */ (function () {
	    function Brazil() {
	    }
	    Brazil.prototype.getStateList = function () {
	        return [
	            { code: "AC", name: "Acre" },
	            { code: "AL", name: "Alagoas" },
	            { code: "AP", name: "Amapá" },
	            { code: "AM", name: "Amazonas" },
	            { code: "BA", name: "Bahia" },
	            { code: "CE", name: "Ceará" },
	            { code: "DF", name: "Distrito Federal" },
	            { code: "ES", name: "Espírito Santo" },
	            { code: "GO", name: "Goiás" },
	            { code: "MA", name: "Maranhão" },
	            { code: "MT", name: "Mato Grosso" },
	            { code: "MS", name: "Mato Grosso do Sul" },
	            { code: "MG", name: "Minas Gerais" },
	            { code: "PA", name: "Pará" },
	            { code: "PB", name: "Paraíba" },
	            { code: "PR", name: "Paraná" },
	            { code: "PE", name: "Pernambuco" },
	            { code: "PI", name: "Piauí" },
	            { code: "RJ", name: "Rio de Janeiro" },
	            { code: "RN", name: "Rio Grande do Norte" },
	            { code: "RS", name: "Rio Grande do Sul" },
	            { code: "RO", name: "Rondônia" },
	            { code: "RR", name: "Roraima" },
	            { code: "SC", name: "Santa Catarina" },
	            { code: "SP", name: "São Paulo" },
	            { code: "SE", name: "Sergipe" },
	            { code: "TO", name: "Tocantins" },
	        ];
	    };
	    return Brazil;
	}());

	var Chile = /** @class */ (function () {
	    function Chile() {
	    }
	    Chile.prototype.getStateList = function () {
	        return [
	            { name: "Aisén del General Carlos Ibáñez del Campo", code: "AI" },
	            { name: "Antofagasta", code: "AN" },
	            { name: "Araucanía", code: "AR" },
	            { name: "Arica and Parinacota", code: "AP" },
	            { name: "Atacama", code: "AT" },
	            { name: "Bío-Bío", code: "BI" },
	            { name: "Coquimbo", code: "CO" },
	            { name: "Libertador General Bernardo O'Higgins", code: "LI" },
	            { name: "Los Lagos", code: "LG" },
	            { name: "Los Ríos", code: "LR" },
	            { name: "Magallanes y Antártica Chilena", code: "MA" },
	            { name: "Maule", code: "ML" },
	            { name: "Ñuble", code: "NB" },
	            { name: "Región Metropolitana de Santiago", code: "RM" },
	            { name: "Tarapacá", code: "TP" },
	            { name: "Valparaíso", code: "VS" },
	        ];
	    };
	    return Chile;
	}());

	var Mexico = /** @class */ (function () {
	    function Mexico() {
	    }
	    Mexico.prototype.getStateList = function () {
	        return [
	            { name: "Aguascalientes", code: "AG" },
	            { name: "Baja California", code: "BN" },
	            { name: "Baja California Sur", code: "BS" },
	            { name: "Campeche", code: "CM" },
	            { name: "Chiapas", code: "CP" },
	            { name: "Chihuahua", code: "CH" },
	            { name: "Ciudad de México", code: "DF" },
	            { name: "Coahuila", code: "CA" },
	            { name: "Colima", code: "CL" },
	            { name: "Durango", code: "DU" },
	            { name: "Guanajuato", code: "GJ" },
	            { name: "Guerrero", code: "GR" },
	            { name: "Hidalgo", code: "HI" },
	            { name: "Jalisco", code: "JA" },
	            { name: "México", code: "MX" },
	            { name: "Michoacán", code: "MC" },
	            { name: "Morelos", code: "MR" },
	            { name: "Nayarit", code: "NA" },
	            { name: "Nuevo León", code: "NL" },
	            { name: "Oaxaca", code: "OA" },
	            { name: "Puebla", code: "PU" },
	            { name: "Querétaro", code: "QE" },
	            { name: "Quintana Roo", code: "QR" },
	            { name: "San Luis Potosí", code: "SL" },
	            { name: "Sinaloa", code: "SI" },
	            { name: "Sonora", code: "SO" },
	            { name: "Tabasco", code: "TB" },
	            { name: "Tamaulipas", code: "TM" },
	            { name: "Tlaxcala", code: "TL" },
	            { name: "Veracruz", code: "VE" },
	            { name: "Yucatán", code: "YU" },
	            { name: "Zacatecas", code: "ZA" },
	        ];
	    };
	    return Mexico;
	}());

	var Peru = /** @class */ (function () {
	    function Peru() {
	    }
	    Peru.prototype.getStateList = function () {
	        return [
	            { name: "Amazonas", code: "AM" },
	            { name: "Ancash", code: "AN" },
	            { name: "Apurímac", code: "AP" },
	            { name: "Arequipa", code: "AR" },
	            { name: "Ayacucho", code: "AY" },
	            { name: "Cajamarca", code: "CJ" },
	            { name: "Callao", code: "CL" },
	            { name: "Cusco", code: "CS" },
	            { name: "Huancavelica", code: "HV" },
	            { name: "Huánuco", code: "HC" },
	            { name: "Ica", code: "IC" },
	            { name: "Junín", code: "JU" },
	            { name: "La Libertad", code: "LL" },
	            { name: "Lambayeque", code: "LB" },
	            { name: "Lima [Province]", code: "LP" },
	            { name: "Lima", code: "LR" },
	            { name: "Loreto", code: "LO" },
	            { name: "Madre de Dios", code: "MD" },
	            { name: "Moquegua", code: "MQ" },
	            { name: "Pasco", code: "PA" },
	            { name: "Piura", code: "PI" },
	            { name: "Puno", code: "PU" },
	            { name: "San Martín", code: "SM" },
	            { name: "Tacna", code: "TA" },
	            { name: "Tumbes", code: "TU" },
	            { name: "Ucayali", code: "UC" },
	        ];
	    };
	    return Peru;
	}());

	var Uruguay = /** @class */ (function () {
	    function Uruguay() {
	    }
	    Uruguay.prototype.getStateList = function () {
	        return [
	            { name: "Artigas", code: "AR" },
	            { name: "Canelones", code: "CA" },
	            { name: "Cerro Largo", code: "CL" },
	            { name: "Colonia", code: "CO" },
	            { name: "Durazno", code: "DU" },
	            { name: "Flores", code: "FS" },
	            { name: "Florida", code: "FD" },
	            { name: "Lavalleja", code: "LA" },
	            { name: "Maldonado", code: "MA" },
	            { name: "Montevideo", code: "MO" },
	            { name: "Paysandú", code: "PA" },
	            { name: "Río Negro", code: "RN" },
	            { name: "Rivera", code: "RV" },
	            { name: "Rocha", code: "RO" },
	            { name: "Salto", code: "SA" },
	            { name: "San José", code: "SJ" },
	            { name: "Soriano", code: "SO" },
	            { name: "Tacuarembó", code: "TA" },
	            { name: "Treinta y Tres", code: "TT" },
	        ];
	    };
	    return Uruguay;
	}());

	var CostaRica = /** @class */ (function () {
	    function CostaRica() {
	    }
	    CostaRica.prototype.getStateList = function () {
	        return [
	            { name: "Alajuela", code: "AL" },
	            { name: "Cartago", code: "CA" },
	            { name: "Guanacaste", code: "GU" },
	            { name: "Heredia", code: "HE" },
	            { name: "Limon", code: "LI" },
	            { name: "Puntarenas", code: "PU" },
	            { name: "San Jose", code: "SJ" },
	        ];
	    };
	    return CostaRica;
	}());

	var Paraguay = /** @class */ (function () {
	    function Paraguay() {
	    }
	    Paraguay.prototype.getStateList = function () {
	        return [
	            { name: "Alto Paraguay", code: "AG" },
	            { name: "Alto Parana", code: "AA" },
	            { name: "Amambay", code: "AM" },
	            { name: "Asuncion", code: "AS" },
	            { name: "Boqueron", code: "BQ" },
	            { name: "Caaguazu", code: "CG" },
	            { name: "Caazapa", code: "CZ" },
	            { name: "Canendiyu", code: "CY" },
	            { name: "Central", code: "CE" },
	            { name: "Concepcion", code: "CN" },
	            { name: "Cordillera", code: "CR" },
	            { name: "Guaira", code: "GU" },
	            { name: "Itapua", code: "IT" },
	            { name: "Misiones", code: "MI" },
	            { name: "Neembucu", code: "NE" },
	            { name: "Paraguari", code: "PG" },
	            { name: "Presidente Hayes", code: "PH" },
	            { name: "San Pedro", code: "SP" },
	        ];
	    };
	    return Paraguay;
	}());

	var Panama = /** @class */ (function () {
	    function Panama() {
	    }
	    Panama.prototype.getStateList = function () {
	        return [
	            { name: "Bocas del Toro", code: "BC" },
	            { name: "Chiriquí", code: "CH" },
	            { name: "Coclé", code: "CC" },
	            { name: "Colón", code: "CL" },
	            { name: "Darién", code: "DA" },
	            { name: "Herrera", code: "HE" },
	            { name: "Los Santos", code: "LS" },
	            { name: "Panamá", code: "PM" },
	            { name: "Panamá Oeste", code: "PO" },
	            { name: "Veraguas", code: "VR" },
	        ];
	    };
	    return Panama;
	}());

	var ElSalvador = /** @class */ (function () {
	    function ElSalvador() {
	    }
	    ElSalvador.prototype.getStateList = function () {
	        return [
	            { name: "Ahuachapán", code: "AH" },
	            { name: "Cabañas", code: "CA" },
	            { name: "Chalatenango", code: "CH" },
	            { name: "Cuscatlán", code: "CU" },
	            { name: "La Libertad", code: "LI" },
	            { name: "La Paz", code: "PA" },
	            { name: "La Unión", code: "UN" },
	            { name: "Morazán", code: "MO" },
	            { name: "San Miguel", code: "SM" },
	            { name: "San Salvador", code: "SS" },
	            { name: "Santa Ana", code: "SA" },
	            { name: "San Vicente", code: "SV" },
	            { name: "Sonsonate", code: "SO" },
	            { name: "Usulután", code: "US" },
	        ];
	    };
	    return ElSalvador;
	}());

	var Guatemala = /** @class */ (function () {
	    function Guatemala() {
	    }
	    Guatemala.prototype.getStateList = function () {
	        return [
	            { name: "Alta Verapaz", code: "AV" },
	            { name: "Baja Verapaz", code: "BV" },
	            { name: "Chimaltenango", code: "CM" },
	            { name: "Chiquimula", code: "CQ" },
	            { name: "El Progreso", code: "PR" },
	            { name: "Escuintla", code: "ES" },
	            { name: "Guatemala", code: "GU" },
	            { name: "Huehuetenango", code: "HU" },
	            { name: "Izabal", code: "IZ" },
	            { name: "Jalapa", code: "JA" },
	            { name: "Jutiapa", code: "JU" },
	            { name: "Petén", code: "PE" },
	            { name: "Quetzaltenango", code: "QZ" },
	            { name: "Quiché", code: "QC" },
	            { name: "Retalhuleu", code: "RE" },
	            { name: "Sacatepéquez", code: "SA" },
	            { name: "San Marcos", code: "SM" },
	            { name: "Santa Rosa", code: "SR" },
	            { name: "Sololá", code: "SO" },
	            { name: "Suchitepéquez", code: "GU" },
	            { name: "Totonicapán", code: "TO" },
	            { name: "Zacapa", code: "ZA" },
	        ];
	    };
	    return Guatemala;
	}());

	var DominicanRepublic = /** @class */ (function () {
	    function DominicanRepublic() {
	    }
	    DominicanRepublic.prototype.getStateList = function () {
	        return [
	            { name: "Azua", code: "AZ" },
	            { name: "Bahoruco", code: "BR" },
	            { name: "Barahona", code: "BH" },
	            { name: "Dajabón", code: "DA" },
	            { name: "Distrito Nacional", code: "NC" },
	            { name: "Duarte", code: "DU" },
	            { name: "Elías Piña", code: "EP" },
	            { name: "El Seibo", code: "SE" },
	            { name: "Espaillat", code: "ES" },
	            { name: "Hato Mayor", code: "HM" },
	            { name: "Hermanas Mirabal", code: "SC" },
	            { name: "Independencia", code: "IN" },
	            { name: "La Altagracia", code: "AL" },
	            { name: "La Romana", code: "RO" },
	            { name: "La Vega", code: "VE" },
	            { name: "María Trinidad Sánchez", code: "MT" },
	            { name: "Monseñor Nouel", code: "MN" },
	            { name: "Monte Cristi", code: "MC" },
	            { name: "Monte Plata", code: "IN" },
	            { name: "Pedernales", code: "PN" },
	            { name: "Peravia", code: "PV" },
	            { name: "Puerto Plata", code: "PP" },
	            { name: "Samaná", code: "SM" },
	            { name: "Sánchez Ramírez", code: "SZ" },
	            { name: "San Cristóbal", code: "CR" },
	            { name: "San José de Ocoa", code: "JO" },
	            { name: "San Juan", code: "JU" },
	            { name: "San Pedro de Macorís", code: "PM" },
	            { name: "Santiago", code: "ST" },
	            { name: "Santiago Rodríguez", code: "SR" },
	            { name: "Santo Domingo", code: "SD" },
	            { name: "Valverde", code: "VA" },
	        ];
	    };
	    return DominicanRepublic;
	}());

	var CountryResolver = /** @class */ (function () {
	    function CountryResolver() {
	    }
	    CountryResolver.prototype.resolve = function (countryType) {
	        switch (countryType) {
	            case exports.Country.ARGENTINA:
	                return new Argentina();
	            case exports.Country.BRAZIL:
	                return new Brazil();
	            case exports.Country.CHILE:
	                return new Chile();
	            case exports.Country.MEXICO:
	                return new Mexico();
	            case exports.Country.PERU:
	                return new Peru();
	            case exports.Country.URUGUAY:
	                return new Uruguay();
	            case exports.Country.COSTA_RICA:
	                return new CostaRica();
	            case exports.Country.PARAGUAY:
	                return new Paraguay();
	            case exports.Country.PANAMA:
	                return new Panama();
	            case exports.Country.EL_SALVADOR:
	                return new ElSalvador();
	            case exports.Country.GUATEMALA:
	                return new Guatemala();
	            case exports.Country.DOMINICAN_REPUBLIC:
	                return new DominicanRepublic();
	            default:
	                throw new Error("Unsupported country: \"" + countryType + "\"");
	        }
	    };
	    return CountryResolver;
	}());

	var StateValidator = /** @class */ (function () {
	    function StateValidator() {
	    }
	    StateValidator.prototype.validate = function (value, userInputValues) {
	        if (!value || !value.trim())
	            return { valid: false, errorCode: "empty" };
	        var billingAddressCountry = userInputValues.billingAddressCountry;
	        var isColombianState = billingAddressCountry === exports.Country.COLOMBIA;
	        if (!isColombianState && !StateValidator.validateStateByCountry(value, billingAddressCountry))
	            return { valid: false, errorCode: "invalid-option" };
	        return VALID_USER_INPUT_VALUE_VALIDATION;
	    };
	    StateValidator.validateStateByCountry = function (state, country) {
	        try {
	            var countryResolver = new CountryResolver();
	            var stateList = countryResolver.resolve(country).getStateList();
	            return Boolean(stateList.find(function (countryState) { return countryState.code === state; }));
	        }
	        catch (err) {
	            return false;
	        }
	    };
	    return StateValidator;
	}());

	var NumberFieldValidator = /** @class */ (function () {
	    function NumberFieldValidator() {
	    }
	    NumberFieldValidator.prototype.validate = function (value) {
	        if (!value || !value.trim())
	            return { valid: false, errorCode: "empty" };
	        var numberFieldRegex = /^\d+$/;
	        if (!numberFieldRegex.test(value))
	            return { valid: false, errorCode: "invalid-pattern" };
	        return VALID_USER_INPUT_VALUE_VALIDATION;
	    };
	    return NumberFieldValidator;
	}());

	var NameValidator = /** @class */ (function () {
	    function NameValidator() {
	    }
	    NameValidator.prototype.validate = function (value) {
	        if (!value || !value.trim())
	            return { valid: false, errorCode: "empty" };
	        if (/[0-9]/.test(value))
	            return { valid: false, errorCode: "contains-number" };
	        return VALID_USER_INPUT_VALUE_VALIDATION;
	    };
	    return NameValidator;
	}());

	function removeSymbols$1(documentNumber) {
	    return documentNumber.replace(/[^a-zA-Z0-9]/g, "");
	}

	var CpfProcessor = /** @class */ (function () {
	    function CpfProcessor() {
	    }
	    CpfProcessor.prototype.validate = function (document) {
	        var cpfNumber = removeSymbols$1(document);
	        if (!/^\d{11}$/.test(cpfNumber))
	            return false;
	        else if (!CpfProcessor.validateCpfNumber(cpfNumber))
	            return false;
	        return true;
	    };
	    CpfProcessor.prototype.applyMask = function (document) {
	        var cpfNumber = removeSymbols$1(document);
	        return cpfNumber.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	    };
	    CpfProcessor.validateCpfNumber = function (cpfNumber) {
	        var sum = 0;
	        var remainder;
	        var repeatedNumbers = /^(0{11}|1{11}|2{11}|3{11}|4{11}|5{11}|6{11}|7{11}|8{11}|9{11})$/;
	        if (repeatedNumbers.test(cpfNumber))
	            return false;
	        for (var i = 1; i <= 9; i++)
	            sum += parseInt(cpfNumber.charAt(i - 1)) * (11 - i);
	        remainder = (sum * 10) % 11;
	        if (remainder === 10)
	            remainder = 0;
	        if (remainder.toString() !== cpfNumber.charAt(9))
	            return false;
	        sum = 0;
	        for (var i = 1; i <= 10; i++)
	            sum += parseInt(cpfNumber.charAt(i - 1)) * (12 - i);
	        remainder = (sum * 10) % 11;
	        if (remainder === 10)
	            remainder = 0;
	        return remainder.toString() === cpfNumber.charAt(10);
	    };
	    return CpfProcessor;
	}());

	var CnpjProcessor = /** @class */ (function () {
	    function CnpjProcessor() {
	    }
	    CnpjProcessor.prototype.validate = function (document) {
	        var cnpjNumber = removeSymbols$1(document);
	        if (!/^\d{14}$/.test(cnpjNumber))
	            return false;
	        else if (!CnpjProcessor.validateCnpjNumber(cnpjNumber))
	            return false;
	        return true;
	    };
	    CnpjProcessor.prototype.applyMask = function (document) {
	        var cnpjNumber = removeSymbols$1(document);
	        return cnpjNumber.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
	    };
	    CnpjProcessor.validateCnpjNumber = function (cnpjNumber) {
	        var size = cnpjNumber.length - 2;
	        var numbers = cnpjNumber.substring(0, size);
	        var digits = cnpjNumber.substring(size);
	        var repeatedNumbers = /^(0{14}|1{14}|2{14}|3{14}|4{14}|5{14}|6{14}|7{14}|8{14}|9{14})$/;
	        if (repeatedNumbers.test(cnpjNumber))
	            return false;
	        var firstDigit = CnpjProcessor.calculateDigit(size, numbers);
	        if (firstDigit !== digits.charAt(0))
	            return false;
	        size += 1;
	        numbers = cnpjNumber.substring(0, size);
	        var secondDigit = CnpjProcessor.calculateDigit(size, numbers);
	        return secondDigit === digits.charAt(1);
	    };
	    CnpjProcessor.calculateDigit = function (size, numbers) {
	        var sum = 0;
	        var multiplier = size - 7;
	        for (var i = 0; i < size; ++i) {
	            sum += parseInt(numbers.charAt(i)) * multiplier;
	            multiplier--;
	            if (multiplier < 2)
	                multiplier = 9;
	        }
	        var remainder = sum % 11;
	        if (remainder < 2)
	            return "0";
	        return (11 - remainder).toString();
	    };
	    return CnpjProcessor;
	}());

	var GenericDocumentTypeProcessor = /** @class */ (function () {
	    function GenericDocumentTypeProcessor(props) {
	        this.props = props;
	    }
	    GenericDocumentTypeProcessor.prototype.validate = function (document) {
	        var documentNumber = removeSymbols$1(document);
	        return this.props.validationRegex.test(documentNumber);
	    };
	    GenericDocumentTypeProcessor.prototype.applyMask = function (document) {
	        var documentNumber = removeSymbols$1(document);
	        return documentNumber.replace(this.props.maskRegex, this.props.maskPattern);
	    };
	    return GenericDocumentTypeProcessor;
	}());

	var DocumentTypeProcessorResolver = /** @class */ (function () {
	    function DocumentTypeProcessorResolver() {
	    }
	    DocumentTypeProcessorResolver.resolve = function (documentType) {
	        switch (documentType) {
	            case DocumentType.BR_CPF:
	                return new CpfProcessor();
	            case DocumentType.BR_CNPJ:
	                return new CnpjProcessor();
	            case DocumentType.UY_CI:
	                return new GenericDocumentTypeProcessor({ validationRegex: /^\d{8}$/, maskRegex: /(\d{8})/, maskPattern: "$1" });
	            case DocumentType.CL_RUT:
	                return new GenericDocumentTypeProcessor({ validationRegex: /^[0-9]{7,8}[Kk0-9]$/, maskRegex: /([0-9]{7,8}[Kk0-9])/, maskPattern: "$1" });
	            case DocumentType.AR_DNI:
	                return new GenericDocumentTypeProcessor({ validationRegex: /^\d{7,8}$/, maskRegex: /(\d{8})/, maskPattern: "$1" });
	            case DocumentType.AR_CDI:
	            case DocumentType.AR_CUIL:
	            case DocumentType.AR_CUIT:
	                return new GenericDocumentTypeProcessor({ validationRegex: /^\d{11}$/, maskRegex: /(\d{2})(\d{8})(\d{1})/, maskPattern: "$1-$2-$3" });
	            case DocumentType.CO_NIT:
	                return new GenericDocumentTypeProcessor({ validationRegex: /^\d{9,15}$/, maskRegex: /(\d{15})/, maskPattern: "$1" });
	            case DocumentType.CO_CC:
	                return new GenericDocumentTypeProcessor({ validationRegex: /^[1-9]\d{1,9}$/, maskRegex: /(\d{10})/, maskPattern: "$1" });
	            case DocumentType.CO_CE:
	                return new GenericDocumentTypeProcessor({ validationRegex: /^\d{1,6}$/, maskRegex: /(\d{6})/, maskPattern: "$1" });
	            case DocumentType.EC_DOC:
	                return new GenericDocumentTypeProcessor({ validationRegex: /^\d{10}$/, maskRegex: /(\d{10})/, maskPattern: "$1" });
	            case DocumentType.PE_DOC:
	                return new GenericDocumentTypeProcessor({ validationRegex: /^\d{8,9}$/, maskRegex: /(\d{9})/, maskPattern: "$1" });
	            default:
	                throw new Error("Invalid document type " + documentType);
	        }
	    };
	    return DocumentTypeProcessorResolver;
	}());

	var DocumentValidator = /** @class */ (function () {
	    function DocumentValidator() {
	    }
	    DocumentValidator.prototype.validate = function (value, userInputValues) {
	        if (!value || !value.trim())
	            return { valid: false, errorCode: "empty" };
	        var customerDocumentType = userInputValues.customerDocumentType;
	        if (!DocumentValidator.validateDocument(value, customerDocumentType))
	            return { valid: false, errorCode: "invalid-pattern" };
	        return VALID_USER_INPUT_VALUE_VALIDATION;
	    };
	    DocumentValidator.validateDocument = function (documentValue, documentType) {
	        try {
	            var documentProcessor = DocumentTypeProcessorResolver.resolve(documentType);
	            return documentProcessor.validate(documentValue);
	        }
	        catch (err) {
	            return false;
	        }
	    };
	    return DocumentValidator;
	}());

	var EmailValidator = /** @class */ (function () {
	    function EmailValidator() {
	        // eslint-disable-next-line no-control-regex, no-useless-escape
	        this.EMAIL_PATTERN = /^(?:[a-z0-9!#$%&'*+\/=?^_{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
	    }
	    EmailValidator.prototype.validate = function (value) {
	        if (!value || !value.trim())
	            return { valid: false, errorCode: "empty" };
	        if (!this.EMAIL_PATTERN.test(value.toLowerCase()))
	            return { valid: false, errorCode: "invalid-pattern" };
	        return VALID_USER_INPUT_VALUE_VALIDATION;
	    };
	    return EmailValidator;
	}());

	var PhoneNumberValidator = /** @class */ (function () {
	    function PhoneNumberValidator() {
	    }
	    PhoneNumberValidator.prototype.validate = function (value) {
	        if (!value || !value.trim())
	            return { valid: false, errorCode: "empty" };
	        var phoneNumberLength = /^\d{8,15}$/;
	        if (!phoneNumberLength.test(value))
	            return { valid: false, errorCode: "invalid-pattern" };
	        return VALID_USER_INPUT_VALUE_VALIDATION;
	    };
	    return PhoneNumberValidator;
	}());

	var CardCvvValidator = /** @class */ (function () {
	    function CardCvvValidator() {
	    }
	    CardCvvValidator.prototype.validate = function (value) {
	        if (!value || !value.trim())
	            return { valid: false, errorCode: "empty" };
	        var cvvLength = /^\d{3,4}$/;
	        if (!cvvLength.test(value))
	            return { valid: false, errorCode: "invalid-pattern" };
	        return VALID_USER_INPUT_VALUE_VALIDATION;
	    };
	    return CardCvvValidator;
	}());

	var CardDueDateValidator = /** @class */ (function () {
	    function CardDueDateValidator() {
	    }
	    CardDueDateValidator.prototype.validate = function (value) {
	        if (!value || !value.trim())
	            return { valid: false, errorCode: "empty" };
	        var dueDateFormat = /^\d{2}\/\d{2}(\d{2})?$/;
	        if (!dueDateFormat.test(value))
	            return { valid: false, errorCode: "invalid-pattern" };
	        var _a = CardDueDateValidator.splitDueDate(value), dueMonth = _a[0], dueYear = _a[1];
	        if (dueMonth < 1 || dueMonth > 12)
	            return { valid: false, errorCode: "invalid-pattern" };
	        var _b = CardDueDateValidator.getCurrentMonthYear(), currentMonth = _b[0], currentYear = _b[1];
	        if (dueYear * 100 + dueMonth < currentYear * 100 + currentMonth)
	            return { valid: false, errorCode: "expired-due-date" };
	        return VALID_USER_INPUT_VALUE_VALIDATION;
	    };
	    CardDueDateValidator.splitDueDate = function (dueDateString) {
	        var _a = dueDateString.split("/"), monthString = _a[0], yearString = _a[1];
	        var month = parseInt(monthString, 10);
	        var year = (yearString.length === 2)
	            ? parseInt("20" + yearString, 10)
	            : parseInt(yearString, 10);
	        return [month, year];
	    };
	    CardDueDateValidator.getCurrentMonthYear = function () {
	        var today = new Date();
	        var month = today.getMonth() + 1;
	        var year = today.getFullYear();
	        return [month, year];
	    };
	    return CardDueDateValidator;
	}());

	var CardHolderNameValidator = /** @class */ (function () {
	    function CardHolderNameValidator() {
	        this.CARD_HOLDER_MAX_LENGTH = 50;
	    }
	    CardHolderNameValidator.prototype.validate = function (value) {
	        if (!value || !value.trim())
	            return { valid: false, errorCode: "empty" };
	        if (/[0-9]/.test(value))
	            return { valid: false, errorCode: "contains-number" };
	        if (value.length > this.CARD_HOLDER_MAX_LENGTH)
	            return { valid: false, errorCode: "max-length" };
	        return VALID_USER_INPUT_VALUE_VALIDATION;
	    };
	    return CardHolderNameValidator;
	}());

	var CardNumberValidator = /** @class */ (function () {
	    function CardNumberValidator() {
	    }
	    CardNumberValidator.prototype.validate = function (value) {
	        if (!value || !value.trim())
	            return { valid: false, errorCode: "empty" };
	        var cardLength = /^\d{12,19}$/;
	        if (!cardLength.test(value))
	            return { valid: false, errorCode: "invalid-pattern" };
	        return VALID_USER_INPUT_VALUE_VALIDATION;
	    };
	    return CardNumberValidator;
	}());

	var validators = {
	    billingAddressCountry: new CountryValidator(),
	    billingAddressCity: new NotEmptyValidator(),
	    billingAddressStreet: new NotEmptyValidator(),
	    billingAddressStreetNumber: new NumberFieldValidator(),
	    billingAddressState: new StateValidator(),
	    billingAddressZipcode: new ZipcodeValidator(),
	    billingAddressComplement: new NoValidator(),
	    customerName: new NameValidator(),
	    customerDocumentType: new NotEmptyValidator(),
	    customerDocument: new DocumentValidator(),
	    customerEmail: new EmailValidator(),
	    customerPhoneNumber: new PhoneNumberValidator(),
	    creditCardCvv: new CardCvvValidator(),
	    creditCardDueDate: new CardDueDateValidator(),
	    creditCardHolderName: new CardHolderNameValidator(),
	    creditCardNumber: new CardNumberValidator(),
	    creditCardDetails: new NoValidator(),
	    tokenizedCreditCard: new NoValidator(),
	    debitCardCvv: new CardCvvValidator(),
	    debitCardDueDate: new CardDueDateValidator(),
	    debitCardHolderName: new CardHolderNameValidator(),
	    debitCardNumber: new CardNumberValidator(),
	    selectedInstalmentsNumber: new NumberFieldValidator(),
	    selectedPaymentType: new NotEmptyValidator(),
	};
	function isEqualUserInputValueValidation(a, b) {
	    if (a.valid) {
	        return a.valid === b.valid;
	    }
	    return !b.valid && (a.errorCode === b.errorCode) && (a.cause === b.cause);
	}
	function validateUserInputValues(userInputValues, baseValidations) {
	    if (baseValidations === void 0) { baseValidations = initialUserInputValuesValidation; }
	    var userInputValuesKeys = Object.keys(userInputValues);
	    return userInputValuesKeys.reduce(function (result, key) {
	        var _a;
	        var userInputValue = userInputValues[key];
	        if (isExternallyManagedUserInputValue(userInputValue)) {
	            return result;
	        }
	        var validation = validators[key].validate(userInputValue, userInputValues);
	        return isEqualUserInputValueValidation(validation, baseValidations[key])
	            ? result
	            : __assign(__assign({}, result), (_a = {}, _a[key] = validation, _a));
	    }, baseValidations);
	}
	var initialUserInputValuesValidation = {
	    billingAddressCountry: VALID_USER_INPUT_VALUE_VALIDATION,
	    billingAddressCity: VALID_USER_INPUT_VALUE_VALIDATION,
	    billingAddressStreet: VALID_USER_INPUT_VALUE_VALIDATION,
	    billingAddressStreetNumber: VALID_USER_INPUT_VALUE_VALIDATION,
	    billingAddressState: VALID_USER_INPUT_VALUE_VALIDATION,
	    billingAddressZipcode: VALID_USER_INPUT_VALUE_VALIDATION,
	    billingAddressComplement: VALID_USER_INPUT_VALUE_VALIDATION,
	    customerName: VALID_USER_INPUT_VALUE_VALIDATION,
	    customerDocumentType: VALID_USER_INPUT_VALUE_VALIDATION,
	    customerDocument: VALID_USER_INPUT_VALUE_VALIDATION,
	    customerEmail: VALID_USER_INPUT_VALUE_VALIDATION,
	    customerPhoneNumber: VALID_USER_INPUT_VALUE_VALIDATION,
	    creditCardCvv: VALID_USER_INPUT_VALUE_VALIDATION,
	    creditCardDueDate: VALID_USER_INPUT_VALUE_VALIDATION,
	    creditCardHolderName: VALID_USER_INPUT_VALUE_VALIDATION,
	    creditCardNumber: VALID_USER_INPUT_VALUE_VALIDATION,
	    creditCardDetails: VALID_USER_INPUT_VALUE_VALIDATION,
	    tokenizedCreditCard: VALID_USER_INPUT_VALUE_VALIDATION,
	    debitCardCvv: VALID_USER_INPUT_VALUE_VALIDATION,
	    debitCardDueDate: VALID_USER_INPUT_VALUE_VALIDATION,
	    debitCardHolderName: VALID_USER_INPUT_VALUE_VALIDATION,
	    debitCardNumber: VALID_USER_INPUT_VALUE_VALIDATION,
	    selectedInstalmentsNumber: VALID_USER_INPUT_VALUE_VALIDATION,
	    selectedPaymentType: VALID_USER_INPUT_VALUE_VALIDATION,
	};

	var UserInputValuesValidationContext = B(null);
	var UserInputValuesValidationProvider = UserInputValuesValidationContext.Provider;
	function useUserInputValuesValidationState(userInputValues) {
	    return m$1(validateUserInputValues(userInputValues));
	}
	function useUserInputValuesValidation() {
	    return F(UserInputValuesValidationContext);
	}
	function useUserInputValueValidation(key) {
	    var userInputValuesValidation = useUserInputValuesValidation().userInputValuesValidation;
	    return userInputValuesValidation[key];
	}
	function useSetUserInputValueValidation(key) {
	    var setUserInputValuesValidation = useUserInputValuesValidation().setUserInputValuesValidation;
	    return A$1(function (validation) {
	        setUserInputValuesValidation(function (userInputValuesValidation) {
	            var _a;
	            return (__assign(__assign({}, userInputValuesValidation), (_a = {}, _a[key] = validation, _a)));
	        });
	    }, [key, setUserInputValuesValidation]);
	}
	function useUserInputValuesValidationFirstError(keys) {
	    var userInputValuesValidation = useUserInputValuesValidation().userInputValuesValidation;
	    return getUserInputValuesValidationFirstError(userInputValuesValidation, keys);
	}
	function getUserInputValuesValidationFirstError(validation, keys) {
	    var finalKeys = keys || Object.keys(validation);
	    for (var _i = 0, finalKeys_1 = finalKeys; _i < finalKeys_1.length; _i++) {
	        var key = finalKeys_1[_i];
	        if (!validation[key].valid) {
	            return validation[key];
	        }
	    }
	    return null;
	}

	function getPersonalInfoValidationFirstError(validation, country) {
	    var keys = getPersonalInfoValidationKeys(country);
	    return getUserInputValuesValidationFirstError(validation, keys);
	}
	function getPersonalInfoValidationKeys(country) {
	    return __spreadArrays([
	        "customerName",
	        "customerEmail"
	    ], getSpecificValidationsByCountry(country));
	}
	function getSpecificValidationsByCountry(country) {
	    switch (country) {
	        case exports.Country.ARGENTINA:
	        case exports.Country.URUGUAY:
	            return ["customerDocumentType", "customerDocument"];
	        case exports.Country.BRAZIL:
	            return ["customerDocumentType", "customerDocument", "customerPhoneNumber"];
	        default:
	            return [];
	    }
	}

	function getBillingAddressValidationFirstError(validation, country) {
	    var keys = getBillingAddressValidationKeys(country);
	    return getUserInputValuesValidationFirstError(validation, keys);
	}
	function getBillingAddressValidationKeys(country) {
	    return __spreadArrays([
	        "billingAddressCountry"
	    ], getSpecificValidationsByCountry$1(country));
	}
	function getSpecificValidationsByCountry$1(country) {
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return [
	                "billingAddressZipcode",
	                "billingAddressState",
	                "billingAddressCity",
	                "billingAddressStreet",
	                "billingAddressStreetNumber",
	                "billingAddressComplement",
	            ];
	        default:
	            return [];
	    }
	}

	function getCreditCardValidationFirstError(validation) {
	    var keys = getCreditCardValidationKeys();
	    return getUserInputValuesValidationFirstError(validation, keys);
	}
	function getCreditCardValidationKeys() {
	    return [
	        "creditCardCvv",
	        "creditCardDueDate",
	        "customerName",
	        "creditCardNumber",
	        "selectedInstalmentsNumber",
	    ];
	}

	function getDebitCardValidationFirstError(validation, country) {
	    var keys = getDebitCardValidationKeys(country);
	    return getUserInputValuesValidationFirstError(validation, keys);
	}
	function getDebitCardValidationKeys(country) {
	    var isBrazil = country === exports.Country.BRAZIL;
	    return [
	        "debitCardCvv",
	        "debitCardDueDate",
	        "debitCardNumber",
	        (isBrazil ? "debitCardHolderName" : "customerName"),
	    ];
	}

	function getSelectedPaymentTypeValidationFirstError(validation, country, selectedPaymentType) {
	    var selectedPaymentTypeValidation = validation.selectedPaymentType;
	    if (selectedPaymentTypeValidation && !selectedPaymentTypeValidation.valid) {
	        return selectedPaymentTypeValidation;
	    }
	    return getPaymentTypeValidationFirstError(validation, country, selectedPaymentType);
	}
	function getPaymentTypeValidationFirstError(validation, country, paymentType) {
	    switch (paymentType) {
	        case exports.PaymentType.CREDITCARD:
	            return getCreditCardValidationFirstError(validation);
	        case exports.PaymentType.DEBITCARD:
	            return getDebitCardValidationFirstError(validation, country);
	        default:
	            return { valid: false, errorCode: "empty" };
	    }
	}

	function getFormValidationFirstError(userInputValuesValidation, billingAddressCountry, selectedPaymentType) {
	    return getPersonalInfoValidationFirstError(userInputValuesValidation, billingAddressCountry)
	        || getBillingAddressValidationFirstError(userInputValuesValidation, billingAddressCountry)
	        || getSelectedPaymentTypeValidationFirstError(userInputValuesValidation, billingAddressCountry, selectedPaymentType);
	}

	function buildApplicationPublicContext(userInputValues, userInputValuesValidation) {
	    return {
	        inputsValues: buildInputsValues(userInputValues),
	        inputsValidations: buildInputsValidations(userInputValuesValidation),
	    };
	}
	function buildInputsValues(userInputValues) {
	    return {
	        billingAddressCountry: userInputValues.billingAddressCountry,
	        billingAddressCity: userInputValues.billingAddressCity,
	        billingAddressStreet: userInputValues.billingAddressStreet,
	        billingAddressStreetNumber: userInputValues.billingAddressStreetNumber,
	        billingAddressState: userInputValues.billingAddressState,
	        billingAddressZipcode: userInputValues.billingAddressZipcode,
	        billingAddressComplement: userInputValues.billingAddressComplement,
	        customerName: userInputValues.customerName,
	        customerDocument: userInputValues.customerDocument,
	        customerEmail: userInputValues.customerEmail,
	        customerPhoneNumber: userInputValues.customerPhoneNumber,
	        creditCardCvv: "****",
	        creditCardDueDate: "****",
	        creditCardHolderName: "****",
	        creditCardNumber: "****",
	        debitCardCvv: "****",
	        debitCardDueDate: "****",
	        debitCardHolderName: "****",
	        debitCardNumber: "****",
	        selectedInstalmentsNumber: "****",
	        selectedPaymentType: userInputValues.selectedPaymentType,
	    };
	}
	function buildInputsValidations(userInputValuesValidation) {
	    return {
	        billingAddressCountry: userInputValuesValidation.billingAddressCountry,
	        billingAddressCity: userInputValuesValidation.billingAddressCity,
	        billingAddressStreet: userInputValuesValidation.billingAddressStreet,
	        billingAddressStreetNumber: userInputValuesValidation.billingAddressStreetNumber,
	        billingAddressState: userInputValuesValidation.billingAddressState,
	        billingAddressZipcode: userInputValuesValidation.billingAddressZipcode,
	        billingAddressComplement: userInputValuesValidation.billingAddressZipcode,
	        customerName: userInputValuesValidation.customerName,
	        customerDocument: userInputValuesValidation.customerDocument,
	        customerEmail: userInputValuesValidation.customerEmail,
	        customerPhoneNumber: userInputValuesValidation.customerPhoneNumber,
	        creditCardCvv: userInputValuesValidation.creditCardCvv,
	        creditCardDueDate: userInputValuesValidation.creditCardDueDate,
	        creditCardHolderName: userInputValuesValidation.creditCardHolderName,
	        creditCardNumber: userInputValuesValidation.creditCardNumber,
	        debitCardCvv: userInputValuesValidation.debitCardCvv,
	        debitCardDueDate: userInputValuesValidation.debitCardDueDate,
	        debitCardHolderName: userInputValuesValidation.debitCardHolderName,
	        debitCardNumber: userInputValuesValidation.debitCardNumber,
	        selectedInstalmentsNumber: userInputValuesValidation.selectedInstalmentsNumber,
	        selectedPaymentType: userInputValuesValidation.selectedPaymentType,
	    };
	}

	function dispatchInputChangeEvent(options) {
	    var inputKey = options.inputKey, userInputValues = options.userInputValues, value = options.value, baseUserInputValuesValidation = options.baseUserInputValuesValidation;
	    var contextUserInputValuesValidation = validateUserInputValues(userInputValues, baseUserInputValuesValidation);
	    var eventData = {
	        reference: inputKey,
	        value: value,
	        validation: contextUserInputValuesValidation[inputKey],
	        context: buildApplicationPublicContext(userInputValues, contextUserInputValuesValidation),
	    };
	    externalEvents.dispatch("inputChange", eventData);
	}

	function capitalize(str) {
	    return "" + str[0].toUpperCase() + str.substr(1);
	}
	function generateUid(uidPattern) {
	    var time = new Date().getTime();
	    var limitFrom8To11 = function (N) { return N & 0x3 | 0x8; };
	    return uidPattern.replace(/[xy]/g, function (currentCharacter) {
	        var random = (time + Math.random() * 16) % 16 | 0;
	        time = Math.floor(time / 16);
	        return (currentCharacter === "x" ? random : limitFrom8To11(random)).toString(16);
	    });
	}

	var uiElementsPreactContext = B(null);
	var UiElementsContextProvider = uiElementsPreactContext.Provider;
	function useUiElementsContext() {
	    return F(uiElementsPreactContext);
	}
	function useUiElementsContextState(lookAndFeelOptions) {
	    var _a = m$1(buildUiElementsContext(lookAndFeelOptions)), uiElementsContext = _a[0], setUiElementsContext = _a[1];
	    var setUiElementsStyle = A$1(function (elementsStyle) {
	        setUiElementsContext(function (uiElementsContext) {
	            return __assign(__assign({}, uiElementsContext), { elementsStyle: elementsStyle });
	        });
	    }, [setUiElementsContext]);
	    return [uiElementsContext, setUiElementsStyle];
	}
	function buildUiElementsContext(lookAndFeelOptions) {
	    var elementsStyle = buildUiElementsStyleFromLookAndFeelOptions(lookAndFeelOptions);
	    return {
	        elementsStyle: elementsStyle,
	        creditCardReferenceId: "Cc" + generateUid("yxxxxxxxxx"),
	        debitCardReferenceId: "Dc" + generateUid("yxxxxxxxxx"),
	    };
	}
	function buildUiElementsStyleFromLookAndFeelOptions(lookAndFeelOptions) {
	    if (lookAndFeelOptions.name !== "raw") {
	        return {};
	    }
	    return resolveUiElementsStyleFromLookAndFeelTheme(lookAndFeelOptions.theme || {});
	}
	function resolveUiElementsStyleFromLookAndFeelTheme(theme) {
	    return {
	        inputText: theme.secureField || {},
	    };
	}

	/*! (c) Andrea Giammarchi - ISC */
	var self$1 = {};
	try {
	  (function (URLSearchParams, plus) {
	    if (
	      new URLSearchParams('q=%2B').get('q') !== plus ||
	      new URLSearchParams({q: plus}).get('q') !== plus ||
	      new URLSearchParams([['q', plus]]).get('q') !== plus ||
	      new URLSearchParams('q=\n').toString() !== 'q=%0A' ||
	      new URLSearchParams({q: ' &'}).toString() !== 'q=+%26' ||
	      new URLSearchParams({q: '%zx'}).toString() !== 'q=%25zx'
	    )
	      throw URLSearchParams;
	    self$1.URLSearchParams = URLSearchParams;
	  }(URLSearchParams, '+'));
	} catch(URLSearchParams) {
	  (function (Object, String, isArray) {    var create = Object.create;
	    var defineProperty = Object.defineProperty;
	    var find = /[!'\(\)~]|%20|%00/g;
	    var findPercentSign = /%(?![0-9a-fA-F]{2})/g;
	    var plus = /\+/g;
	    var replace = {
	      '!': '%21',
	      "'": '%27',
	      '(': '%28',
	      ')': '%29',
	      '~': '%7E',
	      '%20': '+',
	      '%00': '\x00'
	    };
	    var proto = {
	      append: function (key, value) {
	        appendTo(this._ungap, key, value);
	      },
	      delete: function (key) {
	        delete this._ungap[key];
	      },
	      get: function (key) {
	        return this.has(key) ? this._ungap[key][0] : null;
	      },
	      getAll: function (key) {
	        return this.has(key) ? this._ungap[key].slice(0) : [];
	      },
	      has: function (key) {
	        return key in this._ungap;
	      },
	      set: function (key, value) {
	        this._ungap[key] = [String(value)];
	      },
	      forEach: function (callback, thisArg) {
	        var self = this;
	        for (var key in self._ungap)
	          self._ungap[key].forEach(invoke, key);
	        function invoke(value) {
	          callback.call(thisArg, value, String(key), self);
	        }
	      },
	      toJSON: function () {
	        return {};
	      },
	      toString: function () {
	        var query = [];
	        for (var key in this._ungap) {
	          var encoded = encode(key);
	          for (var
	            i = 0,
	            value = this._ungap[key];
	            i < value.length; i++
	          ) {
	            query.push(encoded + '=' + encode(value[i]));
	          }
	        }
	        return query.join('&');
	      }
	    };
	    for (var key in proto)
	      defineProperty(URLSearchParams.prototype, key, {
	        configurable: true,
	        writable: true,
	        value: proto[key]
	      });
	    self$1.URLSearchParams = URLSearchParams;
	    function URLSearchParams(query) {
	      var dict = create(null);
	      defineProperty(this, '_ungap', {value: dict});
	      switch (true) {
	        case !query:
	          break;
	        case typeof query === 'string':
	          if (query.charAt(0) === '?') {
	            query = query.slice(1);
	          }
	          for (var
	            pairs = query.split('&'),
	            i = 0,
	            length = pairs.length; i < length; i++
	          ) {
	            var value = pairs[i];
	            var index = value.indexOf('=');
	            if (-1 < index) {
	              appendTo(
	                dict,
	                decode(value.slice(0, index)),
	                decode(value.slice(index + 1))
	              );
	            } else if (value.length){
	              appendTo(
	                dict,
	                decode(value),
	                ''
	              );
	            }
	          }
	          break;
	        case isArray(query):
	          for (var
	            i = 0,
	            length = query.length; i < length; i++
	          ) {
	            var value = query[i];
	            appendTo(dict, value[0], value[1]);
	          }
	          break;
	        case 'forEach' in query:
	          query.forEach(addEach, dict);
	          break;
	        default:
	          for (var key in query)
	            appendTo(dict, key, query[key]);
	      }
	    }

	    function addEach(value, key) {
	      appendTo(this, key, value);
	    }

	    function appendTo(dict, key, value) {
	      var res = isArray(value) ? value.join(',') : value;
	      if (key in dict)
	        dict[key].push(res);
	      else
	        dict[key] = [res];
	    }

	    function decode(str) {
	      return decodeURIComponent(str.replace(findPercentSign, '%25').replace(plus, ' '));
	    }

	    function encode(str) {
	      return encodeURIComponent(str).replace(find, replacer);
	    }

	    function replacer(match) {
	      return replace[match];
	    }

	  }(Object, String, Array.isArray));
	}

	(function (URLSearchParamsProto) {

	  var iterable = false;
	  try { iterable = !!Symbol.iterator; } catch (o_O) {}

	  /* istanbul ignore else */
	  if (!('forEach' in URLSearchParamsProto)) {
	    URLSearchParamsProto.forEach = function forEach(callback, thisArg) {
	      var self = this;
	      var names = Object.create(null);
	      this.toString()
	          .replace(/=[\s\S]*?(?:&|$)/g, '=')
	          .split('=')
	          .forEach(function (name) {
	            if (!name.length || name in names)
	              return;
	            (names[name] = self.getAll(name)).forEach(function(value) {
	              callback.call(thisArg, value, name, self);
	            });
	          });
	    };
	  }

	  /* istanbul ignore else */
	  if (!('keys' in URLSearchParamsProto)) {
	    URLSearchParamsProto.keys = function keys() {
	      return iterator(this, function(value, key) { this.push(key); });
	    };
	  }

	   /* istanbul ignore else */
	  if (!('values' in URLSearchParamsProto)) {
	    URLSearchParamsProto.values = function values() {
	      return iterator(this, function(value, key) { this.push(value); });
	    };
	  }

	  /* istanbul ignore else */
	  if (!('entries' in URLSearchParamsProto)) {
	    URLSearchParamsProto.entries = function entries() {
	      return iterator(this, function(value, key) { this.push([key, value]); });
	    };
	  }

	  /* istanbul ignore else */
	  if (iterable && !(Symbol.iterator in URLSearchParamsProto)) {
	    URLSearchParamsProto[Symbol.iterator] = URLSearchParamsProto.entries;
	  }

	  /* istanbul ignore else */
	  if (!('sort' in URLSearchParamsProto)) {
	    URLSearchParamsProto.sort = function sort() {
	      var
	        entries = this.entries(),
	        entry = entries.next(),
	        done = entry.done,
	        keys = [],
	        values = Object.create(null),
	        i, key, value
	      ;
	      while (!done) {
	        value = entry.value;
	        key = value[0];
	        keys.push(key);
	        if (!(key in values)) {
	          values[key] = [];
	        }
	        values[key].push(value[1]);
	        entry = entries.next();
	        done = entry.done;
	      }
	      // not the champion in efficiency
	      // but these two bits just do the job
	      keys.sort();
	      for (i = 0; i < keys.length; i++) {
	        this.delete(keys[i]);
	      }
	      for (i = 0; i < keys.length; i++) {
	        key = keys[i];
	        this.append(key, values[key].shift());
	      }
	    };
	  }

	  function iterator(self, callback) {
	    var items = [];
	    self.forEach(callback, items);
	    /* istanbul ignore next */
	    return iterable ?
	      items[Symbol.iterator]() :
	      {
	        next: function() {
	          var value = items.shift();
	          return {done: value === void 0, value: value};
	        }
	      };
	  }

	  /* istanbul ignore next */
	  (function (Object) {
	    var
	      dP = Object.defineProperty,
	      gOPD = Object.getOwnPropertyDescriptor,
	      createSearchParamsPollute = function (search) {
	        function append(name, value) {
	          URLSearchParamsProto.append.call(this, name, value);
	          name = this.toString();
	          search.set.call(this._usp, name ? ('?' + name) : '');
	        }
	        function del(name) {
	          URLSearchParamsProto.delete.call(this, name);
	          name = this.toString();
	          search.set.call(this._usp, name ? ('?' + name) : '');
	        }
	        function set(name, value) {
	          URLSearchParamsProto.set.call(this, name, value);
	          name = this.toString();
	          search.set.call(this._usp, name ? ('?' + name) : '');
	        }
	        return function (sp, value) {
	          sp.append = append;
	          sp.delete = del;
	          sp.set = set;
	          return dP(sp, '_usp', {
	            configurable: true,
	            writable: true,
	            value: value
	          });
	        };
	      },
	      createSearchParamsCreate = function (polluteSearchParams) {
	        return function (obj, sp) {
	          dP(
	            obj, '_searchParams', {
	              configurable: true,
	              writable: true,
	              value: polluteSearchParams(sp, obj)
	            }
	          );
	          return sp;
	        };
	      },
	      updateSearchParams = function (sp) {
	        var append = sp.append;
	        sp.append = URLSearchParamsProto.append;
	        URLSearchParams.call(sp, sp._usp.search.slice(1));
	        sp.append = append;
	      },
	      verifySearchParams = function (obj, Class) {
	        if (!(obj instanceof Class)) throw new TypeError(
	          "'searchParams' accessed on an object that " +
	          "does not implement interface " + Class.name
	        );
	      },
	      upgradeClass = function (Class) {
	        var
	          ClassProto = Class.prototype,
	          searchParams = gOPD(ClassProto, 'searchParams'),
	          href = gOPD(ClassProto, 'href'),
	          search = gOPD(ClassProto, 'search'),
	          createSearchParams
	        ;
	        if (!searchParams && search && search.set) {
	          createSearchParams = createSearchParamsCreate(
	            createSearchParamsPollute(search)
	          );
	          Object.defineProperties(
	            ClassProto,
	            {
	              href: {
	                get: function () {
	                  return href.get.call(this);
	                },
	                set: function (value) {
	                  var sp = this._searchParams;
	                  href.set.call(this, value);
	                  if (sp) updateSearchParams(sp);
	                }
	              },
	              search: {
	                get: function () {
	                  return search.get.call(this);
	                },
	                set: function (value) {
	                  var sp = this._searchParams;
	                  search.set.call(this, value);
	                  if (sp) updateSearchParams(sp);
	                }
	              },
	              searchParams: {
	                get: function () {
	                  verifySearchParams(this, Class);
	                  return this._searchParams || createSearchParams(
	                    this,
	                    new URLSearchParams(this.search.slice(1))
	                  );
	                },
	                set: function (sp) {
	                  verifySearchParams(this, Class);
	                  createSearchParams(this, sp);
	                }
	              }
	            }
	          );
	        }
	      }
	    ;
	    try {
	      upgradeClass(HTMLAnchorElement);
	      if (/^function|object$/.test(typeof URL) && URL.prototype)
	        upgradeClass(URL);
	    } catch (meh) {}
	  }(Object));

	}(self$1.URLSearchParams.prototype));
	var URLSearchParams$1 = self$1.URLSearchParams;

	function getIFrameWindowByName(iFrameName) {
	    var iFrame = document.querySelector("iframe[name=\"" + iFrameName + "\"]");
	    return iFrame && iFrame.contentWindow;
	}
	function getIFrameWindowByNameOrCry(iFrameName) {
	    var window = getIFrameWindowByName(iFrameName);
	    if (!window) {
	        throw new Error("Could not find " + iFrameName + " iframe window");
	    }
	    return window;
	}

	function resolveUiElementsIFrameName(elementName, referenceId) {
	    return "__ebanx" + capitalize(elementName) + referenceId;
	}
	function getUiElementsIFrameWindowOrCry(elementName, referenceId) {
	    var iFrameName = resolveUiElementsIFrameName(elementName, referenceId);
	    return getIFrameWindowByNameOrCry(iFrameName);
	}
	function resolveUiElementsIFrameSrc(options) {
	    var country = options.country, elementName = options.elementName, elementsStyle = options.elementsStyle, mode = options.mode, publicIntegrationKey = options.publicIntegrationKey, referenceId = options.referenceId, tenant = options.tenant;
	    var url = getUiElementsUrl();
	    var queryParams = new URLSearchParams$1({
	        countryCode: getCountryCode(country),
	        element: elementName,
	        mode: getModeCode(mode),
	        publicIntegrationKey: publicIntegrationKey,
	        referenceId: referenceId,
	        tenant: getTenantCode(tenant),
	        style: JSON.stringify(elementsStyle),
	    });
	    return url + "?" + queryParams.toString();
	}
	function getUiElementsUrl() {
	    return "https://ui-elements.ebanx.com";
	}
	function getUserInputValuesKeyFromUiElementName(elementName, paymentType) {
	    switch (paymentType) {
	        case exports.PaymentType.CREDITCARD:
	            return getCreditCardUserInputValuesKeyFromUiElementName(elementName);
	        case exports.PaymentType.DEBITCARD:
	            return getDebitCardUserInputValuesKeyFromUiElementName(elementName);
	    }
	}
	function getCreditCardUserInputValuesKeyFromUiElementName(elementName) {
	    switch (elementName) {
	        case "cardCvv":
	            return "creditCardCvv";
	        case "cardExpiry":
	            return "creditCardDueDate";
	        case "cardHolder":
	            return "creditCardHolderName";
	        case "cardNumber":
	            return "creditCardNumber";
	    }
	}
	function getDebitCardUserInputValuesKeyFromUiElementName(elementName) {
	    switch (elementName) {
	        case "cardCvv":
	            return "debitCardCvv";
	        case "cardExpiry":
	            return "debitCardDueDate";
	        case "cardHolder":
	            return "debitCardHolderName";
	        case "cardNumber":
	            return "debitCardNumber";
	    }
	}

	function isValidUiElementsMessage(message, referenceId) {
	    return (message.elementReferenceId === referenceId) && Boolean(message.content);
	}
	function isUiElementsDataMessage(message, referenceId) {
	    return isValidUiElementsMessage(message, referenceId)
	        && message.content.contentType === "data";
	}
	function isUiElementsErrorMessage(message, referenceId) {
	    return isValidUiElementsMessage(message, referenceId)
	        && message.content.contentType === "error";
	}
	function buildUiElementsMessage(content, referenceId) {
	    return {
	        content: content,
	        elementReferenceId: referenceId,
	    };
	}
	function buildUiElementsRequestMessage(request, referenceId) {
	    return buildUiElementsMessage({ contentType: "request", request: request }, referenceId);
	}
	function buildUiElementsDataMessage(name, value, referenceId) {
	    return buildUiElementsMessage({ contentType: "data", name: name, value: value }, referenceId);
	}
	function sendMessageToWindow(message, targetWindow, targetOrigin) {
	    targetWindow.postMessage(message, targetOrigin);
	}
	function sendMessageToUiElementsWindow(message, elementName, referenceId) {
	    var targetOrigin = getUiElementsUrl();
	    var window = getUiElementsIFrameWindowOrCry(elementName, referenceId);
	    sendMessageToWindow(message, window, targetOrigin);
	}

	var UiElementsDataFetch = /** @class */ (function () {
	    function UiElementsDataFetch(builder) {
	        this.buildFetchMessage = builder.buildFetchMessage;
	        this.elementName = builder.elementName;
	        this.handleMessages = builder.handleMessages;
	        this.referenceId = builder.referenceId;
	    }
	    UiElementsDataFetch.builder = function () {
	        return new UiElementsDataFetchBuilder();
	    };
	    UiElementsDataFetch.prototype.execute = function () {
	        var _this = this;
	        return new Promise(function (resolve, reject) {
	            var messageListener = function (event) {
	                var shouldRemoveListener = false;
	                try {
	                    var result = _this.handleMessages(event.data, _this.referenceId);
	                    if (result !== undefined) {
	                        shouldRemoveListener = true;
	                        resolve(result);
	                    }
	                }
	                catch (error) {
	                    shouldRemoveListener = true;
	                    reject(error);
	                }
	                if (shouldRemoveListener) {
	                    window.removeEventListener("message", messageListener);
	                }
	            };
	            window.addEventListener("message", messageListener);
	            var message = _this.buildFetchMessage(_this.referenceId);
	            sendMessageToUiElementsWindow(message, _this.elementName, _this.referenceId);
	        });
	    };
	    return UiElementsDataFetch;
	}());
	var UiElementsDataFetchBuilder = /** @class */ (function () {
	    function UiElementsDataFetchBuilder() {
	    }
	    UiElementsDataFetchBuilder.prototype.build = function () {
	        return new UiElementsDataFetch(this);
	    };
	    UiElementsDataFetchBuilder.prototype.setBuildFetchMessage = function (buildFetchMessage) {
	        this.buildFetchMessage = buildFetchMessage;
	        return this;
	    };
	    UiElementsDataFetchBuilder.prototype.setElementName = function (elementName) {
	        this.elementName = elementName;
	        return this;
	    };
	    UiElementsDataFetchBuilder.prototype.setHandleMessages = function (handleMessages) {
	        this.handleMessages = handleMessages;
	        return this;
	    };
	    UiElementsDataFetchBuilder.prototype.setReferenceId = function (referenceId) {
	        this.referenceId = referenceId;
	        return this;
	    };
	    return UiElementsDataFetchBuilder;
	}());

	function requestUiElementsCardToken(referenceId) {
	    return UiElementsDataFetch.builder()
	        .setElementName("cardNumber")
	        .setReferenceId(referenceId)
	        .setHandleMessages(handleUiElementsCardTokenMessages)
	        .setBuildFetchMessage(buildUiElementsCardTokenRequestMessage)
	        .build()
	        .execute();
	}
	function buildUiElementsCardTokenRequestMessage(referenceId) {
	    return buildUiElementsRequestMessage("card-token", referenceId);
	}
	function handleUiElementsCardTokenMessages(message, referenceId) {
	    if (isUiElementsCardTokenDataMessage(message, referenceId)) {
	        var uiElementsCardToken = message.content.value;
	        return {
	            token: uiElementsCardToken.token,
	            payment_type_code: uiElementsCardToken.cardBrand,
	        };
	    }
	    else if (isUiElementsCardTokenizationErrorMessage(message, referenceId)) {
	        throw message.content.errorMessage;
	    }
	}
	function isUiElementsCardTokenDataMessage(message, referenceId) {
	    return isUiElementsDataMessage(message, referenceId) && message.content.name === "card-token";
	}
	function isUiElementsCardTokenizationErrorMessage(message, referenceId) {
	    return isUiElementsErrorMessage(message, referenceId) && message.content.errorCode === "card-tokenization-error";
	}
	function requestUiElementsCardDetails(referenceId) {
	    return UiElementsDataFetch.builder()
	        .setElementName("cardNumber")
	        .setReferenceId(referenceId)
	        .setHandleMessages(handleUiElementsCardDetailsMessages)
	        .setBuildFetchMessage(buildUiElementsCardDetailsRequestMessage)
	        .build()
	        .execute();
	}
	function buildUiElementsCardDetailsRequestMessage(referenceId) {
	    return buildUiElementsRequestMessage("card-details", referenceId);
	}
	function handleUiElementsCardDetailsMessages(message, referenceId) {
	    if (isUiElementsCardDetailsDataMessage(message, referenceId)) {
	        var uiElementsCardDetails = message.content.value;
	        return {
	            bin: uiElementsCardDetails.bin,
	            exp_date: uiElementsCardDetails.expiry,
	            last_four: uiElementsCardDetails.lastFour,
	        };
	    }
	    else if (isUiElementsGettingCardDetailsErrorMessage(message, referenceId)) {
	        throw message.content.errorMessage;
	    }
	}
	function isUiElementsCardDetailsDataMessage(message, referenceId) {
	    return isUiElementsDataMessage(message, referenceId) && message.content.name === "card-details";
	}
	function isUiElementsGettingCardDetailsErrorMessage(message, referenceId) {
	    return isUiElementsErrorMessage(message, referenceId) && message.content.errorCode === "getting-card-details-error";
	}

	function isUiElementsEventMessage(message, referenceId) {
	    return isValidUiElementsMessage(message, referenceId)
	        && message.content.contentType === "event";
	}
	function isUiElementsChangeEventMessage(message, referenceId) {
	    return isUiElementsEventMessage(message, referenceId) && message.content.event === "change";
	}

	function isUiElementsValidationResultChangeMessage(message, referenceId) {
	    return isValidUiElementsMessage(message, referenceId)
	        && message.content.contentType === "validation-result-change";
	}
	function isUiElementsValidationResultChangeMessageWithSubject(message, subject, referenceId) {
	    return isUiElementsValidationResultChangeMessage(message, referenceId)
	        && message.content.validationSubject === subject;
	}
	function getUserInputValueValidationFromUiElementsValidationResult(validation) {
	    return validation.valid
	        ? VALID_USER_INPUT_VALUE_VALIDATION
	        : { valid: false, errorCode: validation.cause };
	}

	function buildClassName() {
	    var elements = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        elements[_i] = arguments[_i];
	    }
	    return elements.reduce(function (result, el) { return result + "__" + el; }, "ebanx-dropin");
	}
	function buildClassNameFromBase(baseClassName) {
	    var elements = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        elements[_i - 1] = arguments[_i];
	    }
	    return elements.reduce(function (result, el) { return result + "__" + el; }, baseClassName);
	}

	function useBaseClassName(elements) {
	    var baseClassName = h$1(buildClassName.apply(void 0, elements));
	    return baseClassName.current;
	}
	function useAppendBaseClassName(baseClassName, elements) {
	    var appendedBaseClassName = h$1(buildClassNameFromBase.apply(void 0, __spreadArrays([baseClassName], elements)));
	    return appendedBaseClassName.current;
	}
	function useClassName() {
	    var elements = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        elements[_i] = arguments[_i];
	    }
	    var baseClassName = useBaseClassName(elements);
	    return useClassNameState(baseClassName);
	}
	function useClassNameFromBase(baseClassName) {
	    var elements = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        elements[_i - 1] = arguments[_i];
	    }
	    var appendedBaseClassName = useAppendBaseClassName(baseClassName, elements);
	    return useClassNameState(appendedBaseClassName);
	}
	function useClassNameState(baseClassName) {
	    var _a = m$1(baseClassName), className = _a[0], setClassName = _a[1];
	    var _b = m$1([]), classNameStates = _b[0], setClassNameStates = _b[1];
	    y$1(function () {
	        var classNames = classNameStates.reduce(function (result, state) {
	            return __spreadArrays(result, [baseClassName + "--" + state]);
	        }, [baseClassName]);
	        setClassName(classNames.join(" "));
	    }, [baseClassName, JSON.stringify(classNameStates), setClassName]);
	    return [
	        className,
	        setClassNameStates,
	    ];
	}
	function useClassNameWithStates(elements, toggleableStates) {
	    var elementsArray = typeof elements === "string" ? [elements] : elements;
	    var _a = useClassName.apply(void 0, elementsArray), className = _a[0], setClassStates = _a[1];
	    return useClassNameStatesEffect(className, setClassStates, toggleableStates);
	}
	function useClassNameWithStatesFromBase(baseClassName, elements, toggleableStates) {
	    var _a = useClassNameFromBase.apply(void 0, __spreadArrays([baseClassName], elements)), className = _a[0], setClassStates = _a[1];
	    return useClassNameStatesEffect(className, setClassStates, toggleableStates);
	}
	function useClassNameStatesEffect(className, setClassStates, toggleableStates) {
	    y$1(function () {
	        var classStates = Object.entries(toggleableStates)
	            .reduce(function (result, _a) {
	            var state = _a[0], condition = _a[1];
	            return __spreadArrays(result, (condition ? [state] : []));
	        }, []);
	        setClassStates(classStates);
	    }, [JSON.stringify(toggleableStates), setClassStates]);
	    return className;
	}

	var currentId = 0;
	function useUniqueId(prefix) {
	    if (prefix === void 0) { prefix = "ebanx-js-id-"; }
	    var uniqueIdRef = h$1(null);
	    if (uniqueIdRef.current === null) {
	        uniqueIdRef.current = ++currentId;
	    }
	    return "" + prefix + uniqueIdRef.current;
	}

	function useCountryStates(country) {
	    var countryResolver = _$1(function () { return new CountryResolver(); }, []);
	    return _$1(function () {
	        return countryResolver.resolve(country).getStateList();
	    }, [country, countryResolver]);
	}

	var OrderDetailsContext = B(null);
	var OrderDetailsProvider = OrderDetailsContext.Provider;
	function useOrderDetails() {
	    return F(OrderDetailsContext);
	}
	function useAllowedPaymentTypes() {
	    var allowedPaymentTypes = useOrderDetails().allowedPaymentTypes;
	    return allowedPaymentTypes;
	}
	function useIsSinglePaymentType() {
	    var allowedPaymentTypes = useAllowedPaymentTypes();
	    return allowedPaymentTypes.length === 1;
	}

	function useInstalments() {
	    var amount = useOrderDetails().amount;
	    var country = useConfigContext().country;
	    var availableInstalmentsNumbers = useAvailableInstalmentsNumbers();
	    return _$1(function () {
	        return availableInstalmentsNumbers
	            .map(function (instalmentNumber) { return buildInstalment(instalmentNumber, amount); })
	            .filter(function (instalment) { return instalment.instalmentAmount > getMinInstalmentAmountValueForCountry(country); });
	    }, [amount, availableInstalmentsNumbers, country]);
	}
	function useAvailableInstalmentsNumbers() {
	    var country = useConfigContext().country;
	    var instalmentsNumber = useOrderDetails().instalmentsNumber;
	    return _$1(function () {
	        return getAvailableInstalmentNumbersForCountry(country)
	            .filter(function (instalmentNumber) { return instalmentNumber <= instalmentsNumber; });
	    }, [country, instalmentsNumber]);
	}
	function buildInstalment(instalmentNumber, amount) {
	    return {
	        appliedFee: 0,
	        instalmentAmount: calculateInstalmentAmount(instalmentNumber, amount),
	        quantity: instalmentNumber,
	        totalAmount: amount,
	    };
	}
	function calculateInstalmentAmount(instalmentNumber, amount) {
	    var instalmentAmount = parseFloat(amount) / instalmentNumber;
	    var roundedInstalmentAmount = 1e-2 * Math.ceil(instalmentAmount * 1e+2);
	    return parseFloat(roundedInstalmentAmount.toFixed(2));
	}

	var textMaskCore = createCommonjsModule(function (module, exports) {
	!function(e,r){module.exports=r();}(commonjsGlobal,function(){return function(e){function r(n){if(t[n])return t[n].exports;var o=t[n]={exports:{},id:n,loaded:!1};return e[n].call(o.exports,o,o.exports,r),o.loaded=!0,o.exports}var t={};return r.m=e,r.c=t,r.p="",r(0)}([function(e,r,t){function n(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(r,"__esModule",{value:!0});var o=t(3);Object.defineProperty(r,"conformToMask",{enumerable:!0,get:function(){return n(o).default}});var i=t(2);Object.defineProperty(r,"adjustCaretPosition",{enumerable:!0,get:function(){return n(i).default}});var a=t(5);Object.defineProperty(r,"createTextMaskInputElement",{enumerable:!0,get:function(){return n(a).default}});},function(e,r){Object.defineProperty(r,"__esModule",{value:!0}),r.placeholderChar="_",r.strFunction="function";},function(e,r){function t(e){var r=e.previousConformedValue,t=void 0===r?o:r,i=e.previousPlaceholder,a=void 0===i?o:i,u=e.currentCaretPosition,l=void 0===u?0:u,s=e.conformedValue,f=e.rawValue,d=e.placeholderChar,c=e.placeholder,p=e.indexesOfPipedChars,v=void 0===p?n:p,h=e.caretTrapIndexes,m=void 0===h?n:h;if(0===l||!f.length)return 0;var y=f.length,g=t.length,b=c.length,C=s.length,P=y-g,k=P>0,x=0===g,O=P>1&&!k&&!x;if(O)return l;var T=k&&(t===s||s===c),w=0,M=void 0,S=void 0;if(T)w=l-P;else {var j=s.toLowerCase(),_=f.toLowerCase(),V=_.substr(0,l).split(o),A=V.filter(function(e){return j.indexOf(e)!==-1});S=A[A.length-1];var N=a.substr(0,A.length).split(o).filter(function(e){return e!==d}).length,E=c.substr(0,A.length).split(o).filter(function(e){return e!==d}).length,F=E!==N,R=void 0!==a[A.length-1]&&void 0!==c[A.length-2]&&a[A.length-1]!==d&&a[A.length-1]!==c[A.length-1]&&a[A.length-1]===c[A.length-2];!k&&(F||R)&&N>0&&c.indexOf(S)>-1&&void 0!==f[l]&&(M=!0,S=f[l]);for(var I=v.map(function(e){return j[e]}),J=I.filter(function(e){return e===S}).length,W=A.filter(function(e){return e===S}).length,q=c.substr(0,c.indexOf(d)).split(o).filter(function(e,r){return e===S&&f[r]!==e}).length,L=q+W+J+(M?1:0),z=0,B=0;B<C;B++){var D=j[B];if(w=B+1,D===S&&z++,z>=L)break}}if(k){for(var G=w,H=w;H<=b;H++)if(c[H]===d&&(G=H),c[H]===d||m.indexOf(H)!==-1||H===b)return G}else if(M){for(var K=w-1;K>=0;K--)if(s[K]===S||m.indexOf(K)!==-1||0===K)return K}else for(var Q=w;Q>=0;Q--)if(c[Q-1]===d||m.indexOf(Q)!==-1||0===Q)return Q}Object.defineProperty(r,"__esModule",{value:!0}),r.default=t;var n=[],o="";},function(e,r,t){function n(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:l,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:u,t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if(!(0, i.isArray)(r)){if(("undefined"==typeof r?"undefined":o(r))!==a.strFunction)throw new Error("Text-mask:conformToMask; The mask property must be an array.");r=r(e,t),r=(0, i.processCaretTraps)(r).maskWithoutCaretTraps;}var n=t.guide,s=void 0===n||n,f=t.previousConformedValue,d=void 0===f?l:f,c=t.placeholderChar,p=void 0===c?a.placeholderChar:c,v=t.placeholder,h=void 0===v?(0, i.convertMaskToPlaceholder)(r,p):v,m=t.currentCaretPosition,y=t.keepCharPositions,g=s===!1&&void 0!==d,b=e.length,C=d.length,P=h.length,k=r.length,x=b-C,O=x>0,T=m+(O?-x:0),w=T+Math.abs(x);if(y===!0&&!O){for(var M=l,S=T;S<w;S++)h[S]===p&&(M+=p);e=e.slice(0,T)+M+e.slice(T,b);}for(var j=e.split(l).map(function(e,r){return {char:e,isNew:r>=T&&r<w}}),_=b-1;_>=0;_--){var V=j[_].char;if(V!==p){var A=_>=T&&C===k;V===h[A?_-x:_]&&j.splice(_,1);}}var N=l,E=!1;e:for(var F=0;F<P;F++){var R=h[F];if(R===p){if(j.length>0)for(;j.length>0;){var I=j.shift(),J=I.char,W=I.isNew;if(J===p&&g!==!0){N+=p;continue e}if(r[F].test(J)){if(y===!0&&W!==!1&&d!==l&&s!==!1&&O){for(var q=j.length,L=null,z=0;z<q;z++){var B=j[z];if(B.char!==p&&B.isNew===!1)break;if(B.char===p){L=z;break}}null!==L?(N+=J,j.splice(L,1)):F--;}else N+=J;continue e}E=!0;}g===!1&&(N+=h.substr(F,P));break}N+=R;}if(g&&O===!1){for(var D=null,G=0;G<N.length;G++)h[G]===p&&(D=G);N=null!==D?N.substr(0,D+1):l;}return {conformedValue:N,meta:{someCharsRejected:E}}}Object.defineProperty(r,"__esModule",{value:!0});var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};r.default=n;var i=t(4),a=t(1),u=[],l="";},function(e,r,t){function n(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:f,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:s.placeholderChar;if(!o(e))throw new Error("Text-mask:convertMaskToPlaceholder; The mask property must be an array.");if(e.indexOf(r)!==-1)throw new Error("Placeholder character must not be used as part of the mask. Please specify a character that is not present in your mask as your placeholder character.\n\n"+("The placeholder character that was received is: "+JSON.stringify(r)+"\n\n")+("The mask that was received is: "+JSON.stringify(e)));return e.map(function(e){return e instanceof RegExp?r:e}).join("")}function o(e){return Array.isArray&&Array.isArray(e)||e instanceof Array}function i(e){return "string"==typeof e||e instanceof String}function a(e){return "number"==typeof e&&void 0===e.length&&!isNaN(e)}function u(e){return "undefined"==typeof e||null===e}function l(e){for(var r=[],t=void 0;t=e.indexOf(d),t!==-1;)r.push(t),e.splice(t,1);return {maskWithoutCaretTraps:e,indexes:r}}Object.defineProperty(r,"__esModule",{value:!0}),r.convertMaskToPlaceholder=n,r.isArray=o,r.isString=i,r.isNumber=a,r.isNil=u,r.processCaretTraps=l;var s=t(1),f=[],d="[]";},function(e,r,t){function n(e){return e&&e.__esModule?e:{default:e}}function o(e){var r={previousConformedValue:void 0,previousPlaceholder:void 0};return {state:r,update:function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:e,o=n.inputElement,s=n.mask,d=n.guide,m=n.pipe,g=n.placeholderChar,b=void 0===g?v.placeholderChar:g,C=n.keepCharPositions,P=void 0!==C&&C,k=n.showMask,x=void 0!==k&&k;if("undefined"==typeof t&&(t=o.value),t!==r.previousConformedValue){("undefined"==typeof s?"undefined":l(s))===y&&void 0!==s.pipe&&void 0!==s.mask&&(m=s.pipe,s=s.mask);var O=void 0,T=void 0;if(s instanceof Array&&(O=(0, p.convertMaskToPlaceholder)(s,b)),s!==!1){var w=a(t),M=o.selectionEnd,S=r.previousConformedValue,j=r.previousPlaceholder,_=void 0;if(("undefined"==typeof s?"undefined":l(s))===v.strFunction){if(T=s(w,{currentCaretPosition:M,previousConformedValue:S,placeholderChar:b}),T===!1)return;var V=(0, p.processCaretTraps)(T),A=V.maskWithoutCaretTraps,N=V.indexes;T=A,_=N,O=(0, p.convertMaskToPlaceholder)(T,b);}else T=s;var E={previousConformedValue:S,guide:d,placeholderChar:b,pipe:m,placeholder:O,currentCaretPosition:M,keepCharPositions:P},F=(0, c.default)(w,T,E),R=F.conformedValue,I=("undefined"==typeof m?"undefined":l(m))===v.strFunction,J={};I&&(J=m(R,u({rawValue:w},E)),J===!1?J={value:S,rejected:!0}:(0, p.isString)(J)&&(J={value:J}));var W=I?J.value:R,q=(0, f.default)({previousConformedValue:S,previousPlaceholder:j,conformedValue:W,placeholder:O,rawValue:w,currentCaretPosition:M,placeholderChar:b,indexesOfPipedChars:J.indexesOfPipedChars,caretTrapIndexes:_}),L=W===O&&0===q,z=x?O:h,B=L?z:W;r.previousConformedValue=B,r.previousPlaceholder=O,o.value!==B&&(o.value=B,i(o,q));}}}}}function i(e,r){document.activeElement===e&&(g?b(function(){return e.setSelectionRange(r,r,m)},0):e.setSelectionRange(r,r,m));}function a(e){if((0, p.isString)(e))return e;if((0, p.isNumber)(e))return String(e);if(void 0===e||null===e)return h;throw new Error("The 'value' provided to Text Mask needs to be a string or a number. The value received was:\n\n "+JSON.stringify(e))}Object.defineProperty(r,"__esModule",{value:!0});var u=Object.assign||function(e){for(var r=1;r<arguments.length;r++){var t=arguments[r];for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);}return e},l="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};r.default=o;var s=t(2),f=n(s),d=t(3),c=n(d),p=t(4),v=t(1),h="",m="none",y="object",g="undefined"!=typeof navigator&&/Android/i.test(navigator.userAgent),b="undefined"!=typeof requestAnimationFrame?requestAnimationFrame:setTimeout;}])});
	});

	function useInputMask(inputRef, value, mask) {
	    var textMaskHandleRef = h$1(null);
	    l(function () {
	        if (!mask || !inputRef.current) {
	            return;
	        }
	        textMaskHandleRef.current = textMaskCore.createTextMaskInputElement({
	            inputElement: inputRef.current,
	            mask: mask,
	            guide: false,
	        });
	    }, [inputRef, mask, textMaskHandleRef]);
	    l(function () {
	        if (textMaskHandleRef.current) {
	            textMaskHandleRef.current.update(value);
	        }
	    }, [mask, textMaskHandleRef, value]);
	    var updateValueForMask = A$1(function () {
	        if (textMaskHandleRef.current) {
	            textMaskHandleRef.current.update();
	        }
	    }, [textMaskHandleRef]);
	    return updateValueForMask;
	}

	function BaseTextField(props) {
	    var fieldClassName = props.fieldClassName, fieldProps = props.fieldProps, id = props.id, inputClassName = props.inputClassName, inputProps = props.inputProps, labelClassName = props.labelClassName, labelContent = props.labelContent, labelProps = props.labelProps, name = props.name, secret = props.secret, validation = props.validation, validationMessageClassName = props.validationMessageClassName, validationMessageContent = props.validationMessageContent, validationMessageProps = props.validationMessageProps, value = props.value, onInput = props.onInput, mask = props.mask;
	    var inputRef = h$1();
	    var updateValueForMask = useInputMask(inputRef, value, mask);
	    var handleInput = A$1(function (event) {
	        updateValueForMask();
	        if (onInput) {
	            onInput(event);
	        }
	    }, [onInput, updateValueForMask]);
	    return (h("div", __assign({}, fieldProps, { className: fieldClassName }),
	        labelContent && (h("label", __assign({ className: labelClassName }, labelProps, { htmlFor: id }), labelContent)),
	        h("input", __assign({ ref: inputRef, type: "text", className: inputClassName }, inputProps, { id: id, name: !secret && name || "", value: value, onInput: handleInput })),
	        validation && !validation.valid && validationMessageContent && (h("span", __assign({ className: validationMessageClassName }, validationMessageProps), validationMessageContent))));
	}

	function getErrorMessage(_a) {
	    var errorCode = _a.errorCode, country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return getErrorMessageForBrazil(errorCode);
	        case exports.Country.PERU:
	        case exports.Country.CHILE:
	        case exports.Country.MEXICO:
	        case exports.Country.URUGUAY:
	        case exports.Country.ARGENTINA:
	        case exports.Country.COLOMBIA:
	            return getErrorMessageForLatam(errorCode);
	        default:
	            throw new Error("Invalid country " + country);
	    }
	}
	function getErrorMessageForBrazil(errorCode) {
	    switch (errorCode) {
	        case "empty":
	            return "Este campo deve ser preenchido";
	        case "invalid-pattern":
	            return "Formato inválido para este campo";
	        case "invalid-option":
	            return "Opção inválida para este campo";
	        case "contains-number":
	            return "Este campo não deve conter números";
	        case "max-length":
	            return "Número máximo de caracteres excedido";
	        case "expired-due-date":
	            return "O cartão informado está vencido";
	        default:
	            return "Este campo está inválido";
	    }
	}
	function getErrorMessageForLatam(errorCode) {
	    switch (errorCode) {
	        case "empty":
	            return "Este campo debe ser llenado";
	        case "invalid-pattern":
	            return "Formato no válido para este campo";
	        case "invalid-option":
	            return "Opción no válida para este campo";
	        case "contains-number":
	            return "Este campo no debe contener números";
	        case "max-length":
	            return "Se superó el número máximo de caracteres";
	        case "expired-due-date":
	            return "La tarjeta que informaste ha expirado";
	        default:
	            return "Campo inválido";
	    }
	}

	function TextField(props) {
	    var label = props.label, name = props.name, secret = props.secret, validation = props.validation, value = props.value, onInput = props.onInput, mask = props.mask, rest = __rest(props, ["label", "name", "secret", "validation", "value", "onInput", "mask"]);
	    var country = useConfigContext().country;
	    var id = useUniqueId("ebanx-dropin-field-input-");
	    var fieldClassName = useClassNameWithStates("field", { error: Boolean(validation && !validation.valid) });
	    var labelClassName = useClassName("field", "label")[0];
	    var inputClassName = useClassName("field", "input")[0];
	    var errorMessageClassName = useClassName("field", "error-message")[0];
	    return (h(BaseTextField, { fieldClassName: fieldClassName, fieldProps: { "data-test-name": name }, id: id, inputProps: rest, inputClassName: inputClassName, labelClassName: labelClassName, labelContent: label, name: name, value: value, secret: secret, validation: validation, validationMessageContent: resolveErrorMessage(country, validation), validationMessageClassName: errorMessageClassName, onInput: onInput, mask: mask }));
	}
	function resolveErrorMessage(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	var RawLookAndFeelCustomConfigContext = B(null);
	var RawLookAndFeelCustomConfigProvider = RawLookAndFeelCustomConfigContext.Provider;
	function useRawLookAndFeelCustomConfig() {
	    return F(RawLookAndFeelCustomConfigContext);
	}
	function useSelectStyle() {
	    var context = useRawLookAndFeelCustomConfig();
	    return context.selectStyle;
	}

	function Listbox(props) {
	    var id = props.id, labelId = props.labelId, value = props.value, onChange = props.onChange, options = props.options, placeholder = props.placeholder, baseClassName = props.baseClassName;
	    var listboxButtonRef = h$1(null);
	    var _a = m$1(false), shouldDisplayOptions = _a[0], setShouldDisplayOptions = _a[1];
	    var selectedOption = _$1(function () { return options.find(function (option) { return option.value === value; }); }, [options, value]);
	    var toggleShouldDisplayOptions = A$1(function () {
	        setShouldDisplayOptions(function (displayOptions) { return !displayOptions; });
	    }, [setShouldDisplayOptions]);
	    var changeValueAndHideOptions = A$1(function (option) {
	        onChange(option.value);
	        setShouldDisplayOptions(false);
	    }, [onChange, setShouldDisplayOptions]);
	    var hideOptions = A$1(function () {
	        setShouldDisplayOptions(false);
	    }, [setShouldDisplayOptions]);
	    y$1(function () {
	        document.body.addEventListener("click", hideOptions, false);
	        return function () { return document.body.removeEventListener("click", hideOptions, false); };
	    }, [hideOptions]);
	    y$1(function () {
	        if (shouldDisplayOptions) {
	            listboxButtonRef.current.focus();
	        }
	        else {
	            listboxButtonRef.current.blur();
	        }
	    }, [shouldDisplayOptions, listboxButtonRef]);
	    var getOptionId = A$1(function (optionValue) {
	        return id + "-option-" + optionValue;
	    }, [id]);
	    var listboxClassName = useClassNameFromBase(baseClassName, "listbox")[0];
	    var listboxButtonClassName = useClassNameWithStatesFromBase(listboxClassName, ["button"], { active: shouldDisplayOptions });
	    var listboxOptionsListClassName = useClassNameWithStatesFromBase(listboxClassName, ["options"], { expanded: shouldDisplayOptions });
	    return (h("div", { className: listboxClassName, onClick: function (evt) { return evt.stopPropagation(); } },
	        h("div", { id: id, ref: listboxButtonRef, role: "button", tabIndex: 0, "aria-labelledby": labelId, "aria-haspopup": "listbox", className: listboxButtonClassName, onMouseDown: function (evt) { return evt.preventDefault(); }, onClickCapture: toggleShouldDisplayOptions }, (selectedOption === null || selectedOption === void 0 ? void 0 : selectedOption.label) || placeholder),
	        h("ul", { role: "listbox", "aria-labelledby": labelId, "aria-hidden": !shouldDisplayOptions, "aria-expanded": shouldDisplayOptions, "aria-activedescendant": value && getOptionId(value), className: listboxOptionsListClassName, onBlur: function () { return setShouldDisplayOptions(false); } }, options.map(function (option) { return (h(ListboxOption, { key: option.value, id: getOptionId(option.value), option: option, isSelected: value === option.value, onSelect: changeValueAndHideOptions, baseClassName: listboxClassName })); }))));
	}
	function ListboxOption(props) {
	    var id = props.id, option = props.option, isSelected = props.isSelected, onSelect = props.onSelect, baseClassName = props.baseClassName;
	    var listboxOptionClassName = useClassNameWithStatesFromBase(baseClassName, ["option"], { selected: isSelected });
	    var listboxOptionContentClassName = useClassNameFromBase(baseClassName, "option", "content")[0];
	    return (h("li", { key: option.value, role: "option", id: id, "aria-selected": isSelected, className: listboxOptionClassName, onClickCapture: function () { return onSelect(option); } },
	        h("div", { role: "button", className: listboxOptionContentClassName }, option.label)));
	}

	function ListboxField(props) {
	    var country = useConfigContext().country;
	    var id = useUniqueId("ebanx-dropin-field-input-");
	    var label = props.label, name = props.name, value = props.value, validation = props.validation, options = props.options, placeholder = props.placeholder, onChange = props.onChange;
	    var labelId = _$1(function () { return id + "-label"; }, [id]);
	    var fieldClassStates = {
	        selector: true,
	        error: Boolean(validation && !validation.valid),
	    };
	    var fieldBaseClassName = useClassName("field")[0];
	    var fieldClassName = useClassNameWithStatesFromBase(fieldBaseClassName, [], fieldClassStates);
	    var labelClassName = useClassNameFromBase(fieldBaseClassName, "label")[0];
	    var errorMessageClassName = useClassNameFromBase(fieldBaseClassName, "error-message")[0];
	    return (h("div", { "data-test-name": name, className: fieldClassName },
	        label && (h("label", { className: labelClassName, htmlFor: id, id: labelId }, label)),
	        h(Listbox, { id: id, labelId: labelId, value: value, options: options, placeholder: placeholder, onChange: onChange, baseClassName: fieldBaseClassName }),
	        validation && !validation.valid && resolveErrorMessage$1(country, validation) && (h("span", { className: errorMessageClassName }, resolveErrorMessage$1(country, validation)))));
	}
	function resolveErrorMessage$1(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function BaseSelectField(props) {
	    var fieldClassName = props.fieldClassName, fieldProps = props.fieldProps, id = props.id, labelClassName = props.labelClassName, labelContent = props.labelContent, labelProps = props.labelProps, name = props.name, value = props.value, options = props.options, placeholder = props.placeholder, selectClassName = props.selectClassName, selectProps = props.selectProps, secret = props.secret, validation = props.validation, validationMessageClassName = props.validationMessageClassName, validationMessageContent = props.validationMessageContent, validationMessageProps = props.validationMessageProps;
	    return (h("div", __assign({}, fieldProps, { className: fieldClassName }),
	        labelContent && (h("label", __assign({ className: labelClassName }, labelProps, { htmlFor: id }), labelContent)),
	        h("select", __assign({ className: selectClassName, value: value }, selectProps, { id: id, name: !secret && name || "" }),
	            placeholder && (h("option", { value: "", selected: value === "" }, placeholder)),
	            options.map(function (_a) {
	                var value = _a.value, label = _a.label;
	                return (h("option", { key: value, value: value }, label));
	            })),
	        validation && !validation.valid && validationMessageContent && (h("span", __assign({ className: validationMessageClassName }, validationMessageProps), validationMessageContent))));
	}

	function SelectField(props) {
	    var country = useConfigContext().country;
	    var id = useUniqueId("ebanx-dropin-field-input-");
	    var label = props.label, name = props.name, value = props.value, secret = props.secret, validation = props.validation, options = props.options, placeholder = props.placeholder, onChange = props.onChange, rest = __rest(props, ["label", "name", "value", "secret", "validation", "options", "placeholder", "onChange"]);
	    var onSelectChange = A$1(function (evt) {
	        onChange(evt.currentTarget.value);
	    }, [onChange]);
	    var fieldClassStates = {
	        selector: true,
	        error: Boolean(validation && !validation.valid),
	    };
	    var fieldClassName = useClassNameWithStates("field", fieldClassStates);
	    var labelClassName = useClassName("field", "label")[0];
	    var selectClassName = useClassName("field", "select")[0];
	    var errorMessageClassName = useClassName("field", "error-message")[0];
	    return (h(BaseSelectField, { fieldClassName: fieldClassName, fieldProps: { "data-test-name": name }, id: id, labelClassName: labelClassName, labelContent: label, name: name, value: value, options: options, placeholder: placeholder, secret: secret, selectClassName: selectClassName, selectProps: __assign({ onChange: onSelectChange }, rest), validation: validation, validationMessageClassName: errorMessageClassName, validationMessageContent: resolveErrorMessage$2(country, validation) }));
	}
	function resolveErrorMessage$2(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function SelectorField(props) {
	    var selectStyle = useSelectStyle();
	    if (selectStyle === "listbox")
	        return h(ListboxField, __assign({}, props));
	    return h(SelectField, __assign({}, props));
	}

	function BillingAddressFormTitle(props) {
	    switch (props.country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "Endere\u00E7o");
	        default:
	            return h(p, null);
	    }
	}
	function BillingAddressCountryLabelText(_a) {
	    var country = _a.country;
	    switch (country) {
	        default:
	            return h(p, null, "Pa\u00EDs");
	    }
	}
	function getBillingAddressCountryOptionTitle(country) {
	    switch (country) {
	        case exports.Country.ARGENTINA:
	            return "Argentina";
	        case exports.Country.BRAZIL:
	            return "Brasil";
	        case exports.Country.CHILE:
	            return "Chile";
	        case exports.Country.COLOMBIA:
	            return "Colombia";
	        case exports.Country.MEXICO:
	            return "México";
	        case exports.Country.PERU:
	            return "Peru";
	        case exports.Country.URUGUAY:
	            return "Uruguay";
	        default:
	            return "";
	    }
	}
	function BillingAddressZipcodeLabelText(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "CEP");
	        default:
	            return h(p, null, "C\u00F3digo postal");
	    }
	}
	function BillingAddressStateLabelText(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "Estado");
	        case exports.Country.ARGENTINA:
	            return h(p, null, "Provincia");
	        case exports.Country.CHILE:
	        case exports.Country.MEXICO:
	            return h(p, null, "Prov\u00EDncia");
	        case exports.Country.COLOMBIA:
	        case exports.Country.PERU:
	        case exports.Country.URUGUAY:
	        default:
	            return h(p, null, "Departamento");
	    }
	}
	function getBillingAddressStatePlaceholderText(country) {
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return "Selecione seu estado";
	        case exports.Country.ARGENTINA:
	            return "Selecciona tu Provincia";
	        case exports.Country.CHILE:
	        case exports.Country.MEXICO:
	            return "Selecciona tu província";
	        case exports.Country.PERU:
	            return "Seleccione tu departamento";
	        case exports.Country.URUGUAY:
	            return "Selecciona tu Departamento";
	        default:
	            return "";
	    }
	}
	function BillingAddressCityLabelText(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "Cidade");
	        case exports.Country.MEXICO:
	            return h(p, null, "Ciudad (Escribe tu ciudad)");
	        case exports.Country.URUGUAY:
	            return h(p, null, "Ciudad/Barrio");
	        default:
	            return h(p, null, "Ciudad");
	    }
	}
	function BillingAddressStreetLabelText(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "Endere\u00E7o");
	        case exports.Country.MEXICO:
	            return h(p, null, "Direcci\u00F3n (Escribe tu direcci\u00F3n)");
	        default:
	            return h(p, null, "Direcci\u00F3n");
	    }
	}
	function getBillingAddressStreetPlaceholderText(country) {
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return "Rua, avenida, etc";
	        case exports.Country.ARGENTINA:
	        case exports.Country.CHILE:
	            return "Calle, Avenida o Otro";
	        default:
	            return "";
	    }
	}
	function BillingAddressStreetNumberLabelText(_a) {
	    var country = _a.country;
	    switch (country) {
	        default:
	            return h(p, null, "N\u00FAmero");
	    }
	}
	function BillingAddressStreetComplementLabelText(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.COLOMBIA:
	        case exports.Country.MEXICO:
	            return h(p, null, "Informaciones Adicionales");
	        default:
	            return h(p, null, "Complemento");
	    }
	}
	function getBillingAddressStreetComplementPlaceholderText(country) {
	    switch (country) {
	        default:
	            return "Opcional";
	    }
	}

	function CountryField() {
	    var country = useConfigContext().country;
	    var _a = useUserInputValue("billingAddressCountry"), billingAddressCountry = _a[0], handleChangeBillingAddressCountry = _a[1];
	    var billingAddressCountryValidation = useUserInputValueValidation("billingAddressCountry");
	    var countriesOptions = useCountryOptions();
	    return h(SelectorField, { name: "address-country", options: countriesOptions, autocomplete: "country-name", label: h(BillingAddressCountryLabelText, { country: country }), value: billingAddressCountry, validation: billingAddressCountryValidation, onChange: handleChangeBillingAddressCountry });
	}
	function useCountryOptions() {
	    return _$1(function () {
	        return getAvailableCountries().map(function (country) { return ({ label: getBillingAddressCountryOptionTitle(country), value: country }); });
	    }, []);
	}

	function ZipcodeField() {
	    var billingAddressCountry = useUserInputValue("billingAddressCountry")[0];
	    var _a = useUserInputValueForInputTag("billingAddressZipcode"), billingAddressZipcodeValue = _a[0], handleChangeBillingAddressZipcodeValue = _a[1];
	    var billingAddressZipcodeValidation = useUserInputValueValidation("billingAddressZipcode");
	    return h(TextField, { type: "tel", name: "address-zipcode", autocomplete: "postal-code", label: h(BillingAddressZipcodeLabelText, { country: billingAddressCountry }), value: billingAddressZipcodeValue, validation: billingAddressZipcodeValidation, onInput: handleChangeBillingAddressZipcodeValue });
	}

	function StateSelectField(props) {
	    var billingAddressCountry = useUserInputValue("billingAddressCountry")[0];
	    var _a = useUserInputValue("billingAddressState"), billingAddressStateValue = _a[0], handleChangeBillingAddressStateValue = _a[1];
	    var billingAddressStateValidation = useUserInputValueValidation("billingAddressState");
	    var stateOptions = useStateOptions(billingAddressCountry);
	    return h(SelectorField, __assign({}, props, { options: stateOptions, value: billingAddressStateValue, validation: billingAddressStateValidation, onChange: handleChangeBillingAddressStateValue }));
	}
	function useStateOptions(country) {
	    var countryStates = useCountryStates(country);
	    return _$1(function () {
	        return countryStates.map(function (state) { return ({ label: state.name, value: state.code }); });
	    }, [countryStates]);
	}

	function StateTextField(props) {
	    var _a = useUserInputValueForInputTag("billingAddressState"), billingAddressStateValue = _a[0], handleChangeBillingAddressStateValue = _a[1];
	    var billingAddressStateValidation = useUserInputValueValidation("billingAddressState");
	    return h(TextField, __assign({}, props, { value: billingAddressStateValue, validation: billingAddressStateValidation, onInput: handleChangeBillingAddressStateValue }));
	}

	function StateField() {
	    var country = useConfigContext().country;
	    var billingAddressCountry = useUserInputValue("billingAddressCountry")[0];
	    var _a = useUserInputValue("billingAddressState"), setBillingAddressState = _a[1];
	    y$1(function () {
	        setBillingAddressState("");
	    }, [setBillingAddressState, billingAddressCountry]);
	    var props = _$1(function () {
	        return {
	            name: "address-state",
	            label: h(BillingAddressStateLabelText, { country: country }),
	            placeholder: getBillingAddressStatePlaceholderText(country),
	            autocomplete: "address-level1",
	        };
	    }, [country]);
	    switch (billingAddressCountry) {
	        case exports.Country.ARGENTINA:
	        case exports.Country.BRAZIL:
	        case exports.Country.CHILE:
	        case exports.Country.MEXICO:
	        case exports.Country.PERU:
	        case exports.Country.URUGUAY:
	            return h(StateSelectField, __assign({}, props));
	        case exports.Country.COLOMBIA:
	            return h(StateTextField, __assign({}, props));
	        default:
	            throw new Error("Invalid country " + country + " for StateField");
	    }
	}

	function CityField() {
	    var country = useConfigContext().country;
	    var _a = useUserInputValueForInputTag("billingAddressCity"), billingAddressCityValue = _a[0], handleChangeBillingAddressCityValue = _a[1];
	    var billingAddressValidation = useUserInputValueValidation("billingAddressCity");
	    return h(TextField, { name: "address-city", autocomplete: "address-level2", label: h(BillingAddressCityLabelText, { country: country }), value: billingAddressCityValue, validation: billingAddressValidation, onInput: handleChangeBillingAddressCityValue });
	}

	function StreetNameField() {
	    var country = useConfigContext().country;
	    var _a = useUserInputValueForInputTag("billingAddressStreet"), billingAddressStreetValue = _a[0], handleChangeBillingAddressStreetValue = _a[1];
	    var billingAddressStreetValidation = useUserInputValueValidation("billingAddressStreet");
	    return h(TextField, { name: "address-street-name", autocomplete: "address-line1", label: h(BillingAddressStreetLabelText, { country: country }), placeholder: getBillingAddressStreetPlaceholderText(country), value: billingAddressStreetValue, validation: billingAddressStreetValidation, onInput: handleChangeBillingAddressStreetValue });
	}

	function StreetNumberField() {
	    var country = useConfigContext().country;
	    var _a = useUserInputValueForInputTag("billingAddressStreetNumber"), billingAddressStreetNumberValue = _a[0], handleChangeBillingAddressStreetNumberValue = _a[1];
	    var billingAddressStreetNumberValidation = useUserInputValueValidation("billingAddressStreetNumber");
	    return h(TextField, { type: "tel", name: "address-street-number", autocomplete: "address-line2", label: h(BillingAddressStreetNumberLabelText, { country: country }), value: billingAddressStreetNumberValue, validation: billingAddressStreetNumberValidation, onInput: handleChangeBillingAddressStreetNumberValue });
	}

	function StreetComplementField() {
	    var country = useConfigContext().country;
	    var _a = useUserInputValueForInputTag("billingAddressComplement"), billingAddressComplementValue = _a[0], handleChangeBillingAddressComplementValue = _a[1];
	    var billingAddressComplementValidation = useUserInputValueValidation("billingAddressComplement");
	    return h(TextField, { name: "address-street-complement", autocomplete: "address-line3", label: h(BillingAddressStreetComplementLabelText, { country: country }), placeholder: getBillingAddressStreetComplementPlaceholderText(country), value: billingAddressComplementValue, validation: billingAddressComplementValidation, onInput: handleChangeBillingAddressComplementValue });
	}

	function BillingAddress() {
	    var billingAddressClassName = useClassName("billing-address")[0];
	    return (h("div", { className: billingAddressClassName },
	        h(CountryField, null),
	        h(ZipcodeField, null),
	        h(StateField, null),
	        h(CityField, null),
	        h(StreetNameField, null),
	        h(StreetNumberField, null),
	        h(StreetComplementField, null)));
	}

	function CardHolderNameLabelText(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "Nome (como escrito no cart\u00E3o)");
	        default:
	            return h(p, null, "Nombre del titular de la tarjeta");
	    }
	}
	function CardNumberLabelText(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "N\u00FAmero do cart\u00E3o");
	        default:
	            return h(p, null, "N\u00FAmero de la tarjeta");
	    }
	}
	function CardDueDateLabelText(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "Validade");
	        default:
	            return h(p, null, "Fecha de Vencimiento");
	    }
	}
	function CardCvvLabelText(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "C\u00F3digo de Seguran\u00E7a");
	        default:
	            return h(p, null, "C\u00F3digo de Seguridad");
	    }
	}
	function CardCvvTip(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return (h(p, null, "C\u00F3digo de 3 n\u00FAmeros encontrado na parte de tr\u00E1s do cart\u00E3o. Em cart\u00F5es AMEX, o c\u00F3digo \u00E9 de 4 n\u00FAmeros e est\u00E1 na frente do cart\u00E3o."));
	        default:
	            return (h(p, null, "C\u00F3digo de 3 d\u00EDgitos que se encuentra en la parte de atr\u00E1s de su tarjeta. En tarjetas de American Express, el CVV es de 4 d\u00EDgitos y se encuentra al frente de la tarjeta."));
	    }
	}
	function SelectedInstalmentsLabelText(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "Parcelamento");
	        default:
	            return h(p, null, "Cuotas");
	    }
	}
	function InstalmentsAssistiveText(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "Valores aproximados. Taxas subsequentes podem ser cobradas.");
	        default:
	            return h(p, null, "Valores aproximados. Es posible que se cobren tarifas posteriores.");
	    }
	}
	function getNoInterestInstalmentText(country) {
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return "sem juros";
	        default:
	            return "sin interés";
	    }
	}

	function UiElementsIFrame(props) {
	    var elementName = props.elementName, iFrameClassName = props.iFrameClassName, onValidationChange = props.onValidationChange, referenceId = props.referenceId;
	    var iFrameSrc = useUiElementsIFrameSrc(props);
	    var iFrameName = _$1(function () {
	        return resolveUiElementsIFrameName(elementName, referenceId);
	    }, [elementName, referenceId]);
	    useOnUiElementsValidationResultChangeMessageEffect(elementName, onValidationChange, referenceId);
	    return (h("iframe", { name: iFrameName, frameBorder: "0", scrolling: "no", className: iFrameClassName, src: iFrameSrc }));
	}
	function useUiElementsIFrameSrc(_a) {
	    var elementName = _a.elementName, referenceId = _a.referenceId;
	    var _b = useConfigContext(), country = _b.country, tenant = _b.tenant, publicIntegrationKey = _b.publicIntegrationKey, mode = _b.mode;
	    var elementsStyle = useUiElementsContext().elementsStyle;
	    var iFrameSrc = h$1();
	    y$1(function () {
	        if (!iFrameSrc.current) {
	            iFrameSrc.current = resolveUiElementsIFrameSrc({
	                country: country,
	                elementName: elementName,
	                elementsStyle: elementsStyle,
	                mode: mode,
	                publicIntegrationKey: publicIntegrationKey,
	                tenant: tenant,
	                referenceId: referenceId,
	            });
	        }
	    }, [country, elementName, elementsStyle, mode, publicIntegrationKey, referenceId, tenant]);
	    return iFrameSrc.current;
	}
	function useOnUiElementsValidationResultChangeMessageEffect(elementName, onValidationChange, referenceId) {
	    y$1(function () {
	        if (!onValidationChange) {
	            return;
	        }
	        var onMessageListener = buildOnMessageListener(elementName, onValidationChange, referenceId);
	        window.addEventListener("message", onMessageListener);
	        return function () { return window.removeEventListener("message", onMessageListener); };
	    }, [elementName, onValidationChange, referenceId]);
	}
	function buildOnMessageListener(elementName, onValidationChange, referenceId) {
	    return function (event) {
	        if (isUiElementsValidationResultChangeMessageWithSubject(event.data, elementName, referenceId)) {
	            var messageContent = event.data.content;
	            var validation = getUserInputValueValidationFromUiElementsValidationResult(messageContent.validationResult);
	            onValidationChange(validation);
	        }
	    };
	}

	function UiElementsField(props) {
	    var country = useConfigContext().country;
	    var label = props.label, name = props.name, validation = props.validation, iFrameProps = __rest(props, ["label", "name", "validation"]);
	    var fieldClassStates = {
	        error: Boolean(validation && !validation.valid),
	    };
	    var fieldBaseClassName = useClassName("field")[0];
	    var fieldClassName = useClassNameWithStatesFromBase(fieldBaseClassName, [], fieldClassStates);
	    var labelClassName = useClassNameFromBase(fieldBaseClassName, "label")[0];
	    var iFrameClassName = useClassNameWithStatesFromBase(fieldBaseClassName, ["input"], { secure: true });
	    var errorMessageClassName = useClassNameFromBase(fieldBaseClassName, "error-message")[0];
	    return (h("div", { "data-test-name": name, className: fieldClassName },
	        label && (h("label", { className: labelClassName }, label)),
	        h(UiElementsIFrame, __assign({ iFrameClassName: iFrameClassName }, iFrameProps)),
	        validation && !validation.valid && resolveErrorMessage$3(country, validation) && (h("span", { className: errorMessageClassName }, resolveErrorMessage$3(country, validation)))));
	}
	function resolveErrorMessage$3(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function CardCvvField(props) {
	    var country = useConfigContext().country;
	    var referenceId = props.referenceId, userInputValueKey = props.userInputValueKey;
	    var validation = useUserInputValueValidation(userInputValueKey);
	    var setValidation = useSetUserInputValueValidation(userInputValueKey);
	    return h(UiElementsField, { elementName: "cardCvv", referenceId: referenceId, name: "creditcard[card_cvv]", label: h(CardCvvLabelText, { country: country }), validation: validation, onValidationChange: setValidation });
	}

	function CardDueDateField(props) {
	    var country = useConfigContext().country;
	    var referenceId = props.referenceId, userInputValueKey = props.userInputValueKey;
	    var validation = useUserInputValueValidation(userInputValueKey);
	    var setValidation = useSetUserInputValueValidation(userInputValueKey);
	    return h(UiElementsField, { elementName: "cardExpiry", referenceId: referenceId, name: "creditcard[card_due_date]", label: h(CardDueDateLabelText, { country: country }), validation: validation, onValidationChange: setValidation });
	}

	function CardHolderNameField(props) {
	    var country = useConfigContext().country;
	    var referenceId = props.referenceId, userInputValueKey = props.userInputValueKey;
	    var validation = useUserInputValueValidation(userInputValueKey);
	    var setValidation = useSetUserInputValueValidation(userInputValueKey);
	    return h(UiElementsField, { elementName: "cardHolder", referenceId: referenceId, name: "creditcard[card_name]", label: h(CardHolderNameLabelText, { country: country }), validation: validation, onValidationChange: setValidation });
	}

	function useInstalmentsOptions(country) {
	    var instalments = useInstalments();
	    var instalmentsOptions = _$1(function () {
	        return instalments.map(function (instalment) { return ({
	            label: getInstalmentOptionTitle(country, instalment),
	            value: instalment.quantity.toString(),
	        }); });
	    }, [country, instalments]);
	    var shouldDisplayInstalmentsOptions = _$1(function () {
	        return instalmentsOptions.length > 1;
	    }, [instalmentsOptions]);
	    return [instalmentsOptions, shouldDisplayInstalmentsOptions];
	}
	function getInstalmentOptionTitle(country, instalment) {
	    var appliedFee = instalment.appliedFee, instalmentAmount = instalment.instalmentAmount, quantity = instalment.quantity, totalAmount = instalment.totalAmount;
	    var currencySymbol = getLocalCurrencySymbolForCountry(country);
	    var noInterest = appliedFee === 0;
	    var interestText = noInterest
	        ? getNoInterestInstalmentText(country)
	        : "(Total: " + formatAmountWithCurrency(totalAmount, currencySymbol) + ")";
	    return quantity + "x " + formatAmountWithCurrency(instalmentAmount.toString(), currencySymbol) + " " + interestText;
	}

	function CardInstalmentsField() {
	    var country = useConfigContext().country;
	    var _a = useUserInputValue("selectedInstalmentsNumber"), selectedInstalmentsNumber = _a[0], handleChangeSelectedInstalmentsNumber = _a[1];
	    var selectedInstalmentsNumberValidation = useUserInputValueValidation("selectedInstalmentsNumber");
	    var instalmentsAssistiveTextClassName = useClassName("field-assistive-text")[0];
	    var _b = useInstalmentsOptions(country), instalmentsOptions = _b[0], shouldDisplayInstalmentsOptions = _b[1];
	    if (!shouldDisplayInstalmentsOptions)
	        return h(p, null);
	    return (h(p, null,
	        h(SelectorField, { name: "creditcard[card_instalments]", options: instalmentsOptions, label: h(SelectedInstalmentsLabelText, { country: country }), value: selectedInstalmentsNumber, onChange: handleChangeSelectedInstalmentsNumber, validation: selectedInstalmentsNumberValidation, secret: true }),
	        h("div", { className: instalmentsAssistiveTextClassName },
	            h("span", null,
	                "*",
	                h(InstalmentsAssistiveText, { country: country })))));
	}

	function CardNumberField(props) {
	    var country = useConfigContext().country;
	    var referenceId = props.referenceId, userInputValueKey = props.userInputValueKey;
	    var validation = useUserInputValueValidation(userInputValueKey);
	    var setValidation = useSetUserInputValueValidation(userInputValueKey);
	    return h(UiElementsField, { elementName: "cardNumber", referenceId: referenceId, name: "creditcard[card_number]", label: h(CardNumberLabelText, { country: country }), validation: validation, onValidationChange: setValidation });
	}

	function CreditCardForm() {
	    var creditCardFormClassName = useClassName("creditcard-form")[0];
	    var creditCardReferenceId = useUiElementsContext().creditCardReferenceId;
	    return (h("div", { className: creditCardFormClassName },
	        h(CardHolderNameField, { userInputValueKey: "creditCardHolderName", referenceId: creditCardReferenceId }),
	        h(CardNumberField, { userInputValueKey: "creditCardNumber", referenceId: creditCardReferenceId }),
	        h(CardDueDateField, { userInputValueKey: "creditCardDueDate", referenceId: creditCardReferenceId }),
	        h(CardCvvField, { userInputValueKey: "creditCardCvv", referenceId: creditCardReferenceId }),
	        h(CardInstalmentsField, null)));
	}

	var DUE_DATE_MASK = [
	    /\d/, /\d/,
	    "/",
	    /\d/, /\d/, /\d/, /\d/,
	];

	function DebitCardForm() {
	    var country = useConfigContext().country;
	    var _a = useUserInputValueForInputTag("debitCardHolderName"), debitCardHolderName = _a[0], handleChangeDebitCardHolderName = _a[1];
	    var debitCardHolderNameValidation = useUserInputValueValidation("debitCardHolderName");
	    var _b = useUserInputValueForInputTag("debitCardNumber"), debitCardNumber = _b[0], handleChangeDebitCardNumber = _b[1];
	    var debitCardNumberValidation = useUserInputValueValidation("debitCardNumber");
	    var _c = useUserInputValueForInputTag("debitCardDueDate"), debitCardDueDate = _c[0], handleChangeDebitCardDueDate = _c[1];
	    var debitCardDueDateValidation = useUserInputValueValidation("debitCardDueDate");
	    var _d = useUserInputValueForInputTag("debitCardCvv"), debitCardCvv = _d[0], handleChangeDebitCardCvv = _d[1];
	    var debitCardCvvValidation = useUserInputValueValidation("debitCardCvv");
	    var debitCardFormClassName = useClassName("debitcard-form")[0];
	    return (h("div", { className: debitCardFormClassName },
	        h(TextField, { name: "debitcard[card_name]", value: debitCardHolderName, validation: debitCardHolderNameValidation, onInput: handleChangeDebitCardHolderName, label: h(CardHolderNameLabelText, { country: country }), autocomplete: "cc-name", secret: true }),
	        h(TextField, { type: "tel", name: "debitcard[card_number]", value: debitCardNumber, validation: debitCardNumberValidation, onInput: handleChangeDebitCardNumber, label: h(CardNumberLabelText, { country: country }), autocomplete: "cc-number", secret: true }),
	        h(TextField, { type: "tel", name: "debitcard[card_due_date]", value: debitCardDueDate, validation: debitCardDueDateValidation, onInput: handleChangeDebitCardDueDate, label: h(CardDueDateLabelText, { country: country }), autocomplete: "cc-exp", placeholder: "MM/YYYY", mask: DUE_DATE_MASK, secret: true }),
	        h(TextField, { type: "tel", name: "debitcard[card_cvv]", value: debitCardCvv, validation: debitCardCvvValidation, onInput: handleChangeDebitCardCvv, label: h(CardCvvLabelText, { country: country }), autocomplete: "cc-csc", secret: true })));
	}

	function PaymentTypeContent(props) {
	    var paymentTypeClassName = useClassName("payment-type")[0];
	    return (h("div", { className: paymentTypeClassName },
	        h(PaymentTypeContentImpl, __assign({}, props))));
	}
	function PaymentTypeContentImpl(props) {
	    var paymentType = props.paymentType;
	    switch (paymentType) {
	        case "creditcard":
	            return h(CreditCardForm, null);
	        case "debitcard":
	            return h(DebitCardForm, null);
	        default:
	            throw new Error("Unknown payment type \"" + paymentType + "\"");
	    }
	}

	function PaymentTypeTitle(props) {
	    switch (props.paymentType) {
	        case "creditcard":
	            return h(CreditCardTitle, __assign({}, props));
	        case "debitcard":
	            return h(DebitCardTitle, __assign({}, props));
	        default:
	            throw new Error("Unknown payment type \"" + props.paymentType + "\"");
	    }
	}
	function CreditCardTitle(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "Cart\u00E3o de cr\u00E9dito");
	        case exports.Country.ARGENTINA:
	        case exports.Country.BOLIVIA:
	        case exports.Country.CHILE:
	        case exports.Country.COLOMBIA:
	        case exports.Country.ECUADOR:
	        case exports.Country.MEXICO:
	        case exports.Country.PERU:
	        case exports.Country.URUGUAY:
	        case exports.Country.COSTA_RICA:
	        case exports.Country.PARAGUAY:
	        case exports.Country.PANAMA:
	        case exports.Country.EL_SALVADOR:
	        case exports.Country.GUATEMALA:
	        case exports.Country.DOMINICAN_REPUBLIC:
	            return h(p, null, "Tarjeta de cr\u00E9dito");
	    }
	}
	function DebitCardTitle(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "Cart\u00E3o de d\u00E9bito");
	        case exports.Country.ARGENTINA:
	        case exports.Country.BOLIVIA:
	        case exports.Country.CHILE:
	        case exports.Country.COLOMBIA:
	        case exports.Country.ECUADOR:
	        case exports.Country.MEXICO:
	        case exports.Country.PERU:
	        case exports.Country.URUGUAY:
	        case exports.Country.COSTA_RICA:
	        case exports.Country.PARAGUAY:
	        case exports.Country.PANAMA:
	        case exports.Country.EL_SALVADOR:
	        case exports.Country.GUATEMALA:
	        case exports.Country.DOMINICAN_REPUBLIC:
	            return h(p, null, "Tarjeta de d\u00E9bito");
	    }
	}

	function PaymentTypeSelector(props) {
	    var paymentType = props.paymentType;
	    var country = useConfigContext().country;
	    var id = useUniqueId();
	    var allowedPaymentTypes = useAllowedPaymentTypes();
	    var isSinglePaymentType = useIsSinglePaymentType();
	    var _a = useUserInputValue("selectedPaymentType"), setSelectedPaymentType = _a[1];
	    var _b = useUserInputValueForInputTag("selectedPaymentType"), selectedPaymentType = _b[0], handleChange = _b[1];
	    var selectorClassName = useClassName("payment-type-selector")[0];
	    var labelClassName = useClassName("payment-type-selector", "label")[0];
	    var inputClassName = useClassName("payment-type-selector", "input")[0];
	    y$1(function () {
	        if (!selectedPaymentType && allowedPaymentTypes && allowedPaymentTypes.length > 0) {
	            setSelectedPaymentType(allowedPaymentTypes[0]);
	        }
	    }, [allowedPaymentTypes, setSelectedPaymentType, selectedPaymentType]);
	    return (h("div", { "data-test-name": "payment_type[" + paymentType + "]", className: selectorClassName },
	        !isSinglePaymentType &&
	            h("input", { id: id, type: "radio", name: "payment_type", value: paymentType, className: inputClassName, checked: selectedPaymentType === paymentType, onChange: handleChange }),
	        h("label", { htmlFor: id, className: labelClassName },
	            h(PaymentTypeTitle, { paymentType: paymentType, country: country }))));
	}

	function PaymentTypes() {
	    var allowedPaymentTypes = useAllowedPaymentTypes();
	    var paymentTypesClassName = useClassName("payment-types")[0];
	    return (h("div", { className: paymentTypesClassName }, allowedPaymentTypes.map(function (paymentType) { return (h(p, { key: paymentType },
	        h(PaymentTypeSelector, { paymentType: paymentType }),
	        h(PaymentTypeContent, { paymentType: paymentType }))); })));
	}

	function CustomerEmailField() {
	    var country = useConfigContext().country;
	    var _a = useUserInputValueForInputTag("customerEmail"), customerEmailValue = _a[0], handleChangeCustomerEmailValue = _a[1];
	    var customerEmailValidation = useUserInputValueValidation("customerEmail");
	    return h(TextField, { name: "customer-email", label: getLabelByCountry(country), value: customerEmailValue, validation: customerEmailValidation, onInput: handleChangeCustomerEmailValue, autocomplete: "email" });
	}
	function getLabelByCountry(country) {
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return "Email";
	        default:
	            return "Correo Electrónico";
	    }
	}

	function ArgentinianCustomerDocumentField() {
	    var _a = useUserInputValueForInputTag("customerDocument"), customerDocumentValue = _a[0], handleChangeCustomerDocumentValue = _a[1];
	    var customerDocumentValidation = useUserInputValueValidation("customerDocument");
	    var _b = useUserInputValue("customerDocumentType"), customerDocumentType = _b[0], handleChangeCustomerDocumentType = _b[1];
	    var customerDocumentTypeValidation = useUserInputValueValidation("customerDocumentType");
	    var documentTypes = [
	        { label: "CUIT", value: DocumentType.AR_CUIT },
	        { label: "CUIL", value: DocumentType.AR_CUIL },
	        { label: "CDI", value: DocumentType.AR_CDI },
	        { label: "DNI", value: DocumentType.AR_DNI },
	    ];
	    return (h(p, null,
	        h(SelectorField, { name: "customer-document-type", label: "Tipo de identificaci\u00F3n", options: documentTypes, value: customerDocumentType, validation: customerDocumentTypeValidation, onChange: handleChangeCustomerDocumentType, placeholder: "Elije un documento" }),
	        h(TextField, { type: "tel", name: "customer-document", label: "N\u00FAmero del Documento", value: customerDocumentValue, validation: customerDocumentValidation, onInput: handleChangeCustomerDocumentValue })));
	}

	function BrazilianCustomerDocumentField() {
	    var _a = useUserInputValueForInputTag("customerDocument"), customerDocumentValue = _a[0], handleChangeCustomerDocumentValue = _a[1];
	    var customerDocumentValidation = useUserInputValueValidation("customerDocument");
	    var _b = useUserInputValue("customerDocumentType"), setDocumentType = _b[1];
	    y$1(function () {
	        if (customerDocumentValue.replace(/[^0-9]/g, "").length <= 11) {
	            setDocumentType(DocumentType.BR_CPF);
	        }
	        else {
	            setDocumentType(DocumentType.BR_CNPJ);
	        }
	    }, [customerDocumentValue, setDocumentType]);
	    return h(TextField, { type: "tel", name: "customer-document", label: "CPF ou CNPJ", value: customerDocumentValue, validation: customerDocumentValidation, onInput: handleChangeCustomerDocumentValue });
	}

	function ChileanCustomerDocumentField() {
	    var _a = useUserInputValueForInputTag("customerDocument"), customerDocumentValue = _a[0], handleChangeCustomerDocumentValue = _a[1];
	    var customerDocumentValidation = useUserInputValueValidation("customerDocument");
	    var _b = useUserInputValue("customerDocumentType"), setDocumentType = _b[1];
	    y$1(function () {
	        setDocumentType(DocumentType.CL_RUT);
	    }, [setDocumentType]);
	    return h(TextField, { type: "tel", name: "customer-document", label: "RUT", value: customerDocumentValue, validation: customerDocumentValidation, onInput: handleChangeCustomerDocumentValue });
	}

	function ColombianCustomerDocumentField() {
	    var _a = useUserInputValueForInputTag("customerDocument"), customerDocumentValue = _a[0], handleChangeCustomerDocumentValue = _a[1];
	    var customerDocumentValidation = useUserInputValueValidation("customerDocument");
	    var _b = useUserInputValue("customerDocumentType"), customerDocumentType = _b[0], handleChangeCustomerDocumentType = _b[1];
	    var customerDocumentTypeValidation = useUserInputValueValidation("customerDocumentType");
	    var documentTypes = [
	        { label: "Cédula de Ciudadanía", value: DocumentType.CO_CC },
	        { label: "NIT", value: DocumentType.CO_NIT },
	        { label: "Cédula de Extranjería", value: DocumentType.CO_CE },
	    ];
	    return (h(p, null,
	        h(SelectorField, { name: "customer-document-type", label: "Tipo de identificaci\u00F3n", options: documentTypes, value: customerDocumentType, validation: customerDocumentTypeValidation, onChange: handleChangeCustomerDocumentType, placeholder: "Elije un documento" }),
	        h(TextField, { type: "tel", name: "customer-document", label: "N\u00FAmero del Documento", value: customerDocumentValue, validation: customerDocumentValidation, onInput: handleChangeCustomerDocumentValue })));
	}

	function UruguayanCustomerDocumentField() {
	    var _a = useUserInputValueForInputTag("customerDocument"), customerDocumentValue = _a[0], handleChangeCustomerDocumentValue = _a[1];
	    var customerDocumentValidation = useUserInputValueValidation("customerDocument");
	    var _b = useUserInputValue("customerDocumentType"), setDocumentType = _b[1];
	    y$1(function () {
	        setDocumentType(DocumentType.UY_CI);
	    }, [setDocumentType]);
	    return h(TextField, { type: "tel", name: "customer-document", label: "C\u00E9dula de Identidad", value: customerDocumentValue, validation: customerDocumentValidation, onInput: handleChangeCustomerDocumentValue });
	}

	function CustomerDocumentField() {
	    var billingAddressCountry = useUserInputValue("billingAddressCountry")[0];
	    switch (billingAddressCountry) {
	        case exports.Country.ARGENTINA:
	            return h(ArgentinianCustomerDocumentField, null);
	        case exports.Country.BRAZIL:
	            return h(BrazilianCustomerDocumentField, null);
	        case exports.Country.CHILE:
	            return h(ChileanCustomerDocumentField, null);
	        case exports.Country.COLOMBIA:
	            return h(ColombianCustomerDocumentField, null);
	        case exports.Country.URUGUAY:
	            return h(UruguayanCustomerDocumentField, null);
	        case exports.Country.PERU:
	        case exports.Country.MEXICO:
	            return h(p, null);
	        default:
	            throw new Error("Invalid country " + billingAddressCountry + " for CustomerDocument field");
	    }
	}

	function CustomerNameField() {
	    var country = useConfigContext().country;
	    var _a = useUserInputValueForInputTag("customerName"), customerNameValue = _a[0], handleChangeCustomerNameValue = _a[1];
	    var customerNameValidation = useUserInputValueValidation("customerName");
	    return h(TextField, { name: "customer-name", label: getLabelByCountry$1(country), value: customerNameValue, validation: customerNameValidation, onInput: handleChangeCustomerNameValue, autocomplete: "name" });
	}
	function getLabelByCountry$1(country) {
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return "Nome completo";
	        default:
	            return "Nombre y Apellido";
	    }
	}

	function CustomerPhoneField() {
	    var country = useConfigContext().country;
	    var _a = useUserInputValueForInputTag("customerPhoneNumber"), customerPhoneValue = _a[0], handleChangeCustomerPhoneValue = _a[1];
	    var customerPhoneValidation = useUserInputValueValidation("customerPhoneNumber");
	    return h(TextField, { type: "tel", name: "customer-phone", label: getLabelByCountry$2(country), placeholder: getPlaceholderByCountry(country), value: customerPhoneValue, validation: customerPhoneValidation, onInput: handleChangeCustomerPhoneValue, autocomplete: "tel-national" });
	}
	function getLabelByCountry$2(country) {
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return "Telefone";
	        default:
	            return "Teléfono";
	    }
	}
	function getPlaceholderByCountry(country) {
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return "Fixo ou Celular";
	        default:
	            return "Fijo o Celular";
	    }
	}

	function PersonalInfo() {
	    var personalInfoClassName = useClassName("personal-info")[0];
	    return (h("div", { className: personalInfoClassName },
	        h(CustomerNameField, null),
	        h(CustomerDocumentField, null),
	        h(CustomerEmailField, null),
	        h(CustomerPhoneField, null)));
	}

	function RawLookAndFeel(_a) {
	    var options = _a.options;
	    var dataState = useDataState();
	    var firstError = useUserInputValuesValidationFirstError();
	    var classStates = _$1(function () { return ({
	        sent: dataState.isSent(),
	        error: Boolean(firstError),
	    }); }, [dataState, firstError]);
	    var customConfig = useCustomConfig(options);
	    var lookAndFeelClassName = useClassNameWithStates(["raw-laf"], classStates);
	    useSetCreditCardDetails();
	    useSetTokenizedCreditCard();
	    useSendUiElementsThemeDataMessageOnThemeUpdate();
	    useSetCreditCardFieldsAsExternallyManagedUserInputValues();
	    useDispatchCreditCardInputChangeEventFromUiElementsChangeMessage();
	    return (h(RawLookAndFeelCustomConfigProvider, { value: customConfig },
	        h("div", { className: lookAndFeelClassName },
	            h(PersonalInfo, null),
	            h(BillingAddress, null),
	            h(PaymentTypes, null))));
	}
	function useCustomConfig(options) {
	    return _$1(function () {
	        return {
	            selectStyle: options.selectStyle || "default",
	        };
	    }, [options.selectStyle]);
	}
	function useSetCreditCardDetails() {
	    var creditCardReferenceId = useUiElementsContext().creditCardReferenceId;
	    var _a = useUserInputValue("creditCardDetails"), setCreditCardDetails = _a[1];
	    var requestCardDetails = A$1(function () {
	        return requestUiElementsCardDetails(creditCardReferenceId);
	    }, [creditCardReferenceId]);
	    y$1(function () {
	        setCreditCardDetails(requestCardDetails);
	    }, [requestCardDetails, setCreditCardDetails]);
	}
	function useSetTokenizedCreditCard() {
	    var creditCardReferenceId = useUiElementsContext().creditCardReferenceId;
	    var _a = useUserInputValue("tokenizedCreditCard"), setTokenizedCreditCard = _a[1];
	    var requestToken = A$1(function () {
	        return requestUiElementsCardToken(creditCardReferenceId);
	    }, [creditCardReferenceId]);
	    y$1(function () {
	        setTokenizedCreditCard(requestToken);
	    }, [requestToken, setTokenizedCreditCard]);
	}
	function useSendUiElementsThemeDataMessageOnThemeUpdate() {
	    var _a = useUiElementsContext(), elementsStyle = _a.elementsStyle, creditCardReferenceId = _a.creditCardReferenceId;
	    var elementsNames = _$1(function () { return ["cardHolder", "cardNumber", "cardCvv", "cardExpiry"]; }, []);
	    var skipFirst = h$1(true);
	    y$1(function () {
	        if (skipFirst.current) {
	            skipFirst.current = false;
	            return;
	        }
	        var message = buildUiElementsDataMessage("element-theme", elementsStyle, creditCardReferenceId);
	        elementsNames.forEach(function (elementName) { return sendMessageToUiElementsWindow(message, elementName, creditCardReferenceId); });
	    }, [elementsStyle, elementsNames, creditCardReferenceId]);
	}
	function useSetCreditCardFieldsAsExternallyManagedUserInputValues() {
	    var setUserInputValues = useUserInputValues().setUserInputValues;
	    y$1(function () {
	        setUserInputValues(function (userInputValues) {
	            return __assign(__assign({}, userInputValues), { creditCardCvv: EXTERNALLY_MANAGED_USER_INPUT_VALUE, creditCardDueDate: EXTERNALLY_MANAGED_USER_INPUT_VALUE, creditCardHolderName: EXTERNALLY_MANAGED_USER_INPUT_VALUE, creditCardNumber: EXTERNALLY_MANAGED_USER_INPUT_VALUE });
	        });
	    }, [setUserInputValues]);
	}
	function useDispatchCreditCardInputChangeEventFromUiElementsChangeMessage() {
	    var creditCardReferenceId = useUiElementsContext().creditCardReferenceId;
	    var userInputValues = useUserInputValues().userInputValues;
	    var userInputValuesValidation = useUserInputValuesValidation().userInputValuesValidation;
	    y$1(function () {
	        var uiElementsChangeEventListener = function (event) {
	            var _a;
	            if (!isUiElementsChangeEventMessage(event.data, creditCardReferenceId)) {
	                return;
	            }
	            var _b = event.data.content, uiElementName = _b.element, validationResult = _b.data.validationResult;
	            var inputKey = getUserInputValuesKeyFromUiElementName(uiElementName, exports.PaymentType.CREDITCARD);
	            dispatchInputChangeEvent({
	                inputKey: inputKey,
	                value: "****",
	                userInputValues: userInputValues,
	                baseUserInputValuesValidation: __assign(__assign({}, userInputValuesValidation), (_a = {}, _a[inputKey] = getUserInputValueValidationFromUiElementsValidationResult(validationResult), _a)),
	            });
	        };
	        window.addEventListener("message", uiElementsChangeEventListener);
	        return function () { return window.removeEventListener("message", uiElementsChangeEventListener); };
	    }, [creditCardReferenceId, userInputValues, userInputValuesValidation]);
	}

	/** @license React v16.13.1
	 * react-is.development.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	var reactIs_development = createCommonjsModule(function (module, exports) {



	{
	  (function() {

	// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
	// nor polyfill, then a plain number is used for performance.
	var hasSymbol = typeof Symbol === 'function' && Symbol.for;
	var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
	var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
	var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
	var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
	var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
	var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
	var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
	// (unstable) APIs that have been removed. Can we remove the symbols?

	var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
	var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
	var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
	var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
	var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
	var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
	var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
	var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
	var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
	var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
	var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;

	function isValidElementType(type) {
	  return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
	  type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
	}

	function typeOf(object) {
	  if (typeof object === 'object' && object !== null) {
	    var $$typeof = object.$$typeof;

	    switch ($$typeof) {
	      case REACT_ELEMENT_TYPE:
	        var type = object.type;

	        switch (type) {
	          case REACT_ASYNC_MODE_TYPE:
	          case REACT_CONCURRENT_MODE_TYPE:
	          case REACT_FRAGMENT_TYPE:
	          case REACT_PROFILER_TYPE:
	          case REACT_STRICT_MODE_TYPE:
	          case REACT_SUSPENSE_TYPE:
	            return type;

	          default:
	            var $$typeofType = type && type.$$typeof;

	            switch ($$typeofType) {
	              case REACT_CONTEXT_TYPE:
	              case REACT_FORWARD_REF_TYPE:
	              case REACT_LAZY_TYPE:
	              case REACT_MEMO_TYPE:
	              case REACT_PROVIDER_TYPE:
	                return $$typeofType;

	              default:
	                return $$typeof;
	            }

	        }

	      case REACT_PORTAL_TYPE:
	        return $$typeof;
	    }
	  }

	  return undefined;
	} // AsyncMode is deprecated along with isAsyncMode

	var AsyncMode = REACT_ASYNC_MODE_TYPE;
	var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
	var ContextConsumer = REACT_CONTEXT_TYPE;
	var ContextProvider = REACT_PROVIDER_TYPE;
	var Element = REACT_ELEMENT_TYPE;
	var ForwardRef = REACT_FORWARD_REF_TYPE;
	var Fragment = REACT_FRAGMENT_TYPE;
	var Lazy = REACT_LAZY_TYPE;
	var Memo = REACT_MEMO_TYPE;
	var Portal = REACT_PORTAL_TYPE;
	var Profiler = REACT_PROFILER_TYPE;
	var StrictMode = REACT_STRICT_MODE_TYPE;
	var Suspense = REACT_SUSPENSE_TYPE;
	var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

	function isAsyncMode(object) {
	  {
	    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
	      hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

	      console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
	    }
	  }

	  return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
	}
	function isConcurrentMode(object) {
	  return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
	}
	function isContextConsumer(object) {
	  return typeOf(object) === REACT_CONTEXT_TYPE;
	}
	function isContextProvider(object) {
	  return typeOf(object) === REACT_PROVIDER_TYPE;
	}
	function isElement(object) {
	  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function isForwardRef(object) {
	  return typeOf(object) === REACT_FORWARD_REF_TYPE;
	}
	function isFragment(object) {
	  return typeOf(object) === REACT_FRAGMENT_TYPE;
	}
	function isLazy(object) {
	  return typeOf(object) === REACT_LAZY_TYPE;
	}
	function isMemo(object) {
	  return typeOf(object) === REACT_MEMO_TYPE;
	}
	function isPortal(object) {
	  return typeOf(object) === REACT_PORTAL_TYPE;
	}
	function isProfiler(object) {
	  return typeOf(object) === REACT_PROFILER_TYPE;
	}
	function isStrictMode(object) {
	  return typeOf(object) === REACT_STRICT_MODE_TYPE;
	}
	function isSuspense(object) {
	  return typeOf(object) === REACT_SUSPENSE_TYPE;
	}

	exports.AsyncMode = AsyncMode;
	exports.ConcurrentMode = ConcurrentMode;
	exports.ContextConsumer = ContextConsumer;
	exports.ContextProvider = ContextProvider;
	exports.Element = Element;
	exports.ForwardRef = ForwardRef;
	exports.Fragment = Fragment;
	exports.Lazy = Lazy;
	exports.Memo = Memo;
	exports.Portal = Portal;
	exports.Profiler = Profiler;
	exports.StrictMode = StrictMode;
	exports.Suspense = Suspense;
	exports.isAsyncMode = isAsyncMode;
	exports.isConcurrentMode = isConcurrentMode;
	exports.isContextConsumer = isContextConsumer;
	exports.isContextProvider = isContextProvider;
	exports.isElement = isElement;
	exports.isForwardRef = isForwardRef;
	exports.isFragment = isFragment;
	exports.isLazy = isLazy;
	exports.isMemo = isMemo;
	exports.isPortal = isPortal;
	exports.isProfiler = isProfiler;
	exports.isStrictMode = isStrictMode;
	exports.isSuspense = isSuspense;
	exports.isValidElementType = isValidElementType;
	exports.typeOf = typeOf;
	  })();
	}
	});

	var reactIs = createCommonjsModule(function (module) {

	{
	  module.exports = reactIs_development;
	}
	});

	function S$1(n,t){for(var e in t)n[e]=t[e];return n}function g$2(n,t){for(var e in n)if("__source"!==e&&!(e in t))return !0;for(var r in t)if("__source"!==r&&n[r]!==t[r])return !0;return !1}function w$1(n){this.props=n;}function C$1(n,t){function e(n){var e=this.props.ref,r=e==n.ref;return !r&&e&&(e.call?e(null):e.current=null),t?!t(this.props,n)||!r:g$2(this.props,n)}function r(t){return this.shouldComponentUpdate=e,h(n,t)}return r.displayName="Memo("+(n.displayName||n.name)+")",r.prototype.isReactComponent=!0,r.__f=!0,r}(w$1.prototype=new d).isPureReactComponent=!0,w$1.prototype.shouldComponentUpdate=function(n,t){return g$2(this.props,n)||g$2(this.state,t)};var R=n.__b;n.__b=function(n){n.type&&n.type.__f&&n.ref&&(n.props.ref=n.ref,n.ref=null),R&&R(n);};var x$2="undefined"!=typeof Symbol&&Symbol.for&&Symbol.for("react.forward_ref")||3911;function k$2(n){function t(t,e){var r=S$1({},t);return delete r.ref,n(r,(e=t.ref||e)&&("object"!=typeof e||"current"in e)?e:null)}return t.$$typeof=x$2,t.render=t,t.prototype.isReactComponent=t.__f=!0,t.displayName="ForwardRef("+(n.displayName||n.name)+")",t}var A$2=function(n,t){return null==n?null:b(b(n).map(t))},N$1={map:A$2,forEach:A$2,count:function(n){return n?b(n).length:0},only:function(n){var t=b(n);if(1!==t.length)throw "Children.only";return t[0]},toArray:b},O$1=n.__e;function L$1(n){return n&&(n.__c&&n.__c.__H&&(n.__c.__H.__.forEach(function(n){"function"==typeof n.__c&&n.__c();}),n.__c.__H=null),(n=S$1({},n)).__c=null,n.__k=n.__k&&n.__k.map(L$1)),n}function U(n){return n&&(n.__v=null,n.__k=n.__k&&n.__k.map(U)),n}function F$1(){this.__u=0,this.t=null,this.__b=null;}function M$1(n){var t=n.__.__c;return t&&t.__e&&t.__e(n)}function D(n){var t,e,r;function u(u){if(t||(t=n()).then(function(n){e=n.default||n;},function(n){r=n;}),r)throw r;if(!e)throw t;return h(e,u)}return u.displayName="Lazy",u.__f=!0,u}function I$1(){this.u=null,this.o=null;}n.__e=function(n,t,e){if(n.then)for(var r,u=t;u=u.__;)if((r=u.__c)&&r.__c)return null==t.__e&&(t.__e=e.__e,t.__k=e.__k),r.__c(n,t.__c);O$1(n,t,e);},(F$1.prototype=new d).__c=function(n,t){var e=this;null==e.t&&(e.t=[]),e.t.push(t);var r=M$1(e.__v),u=!1,o=function(){u||(u=!0,t.componentWillUnmount=t.__c,r?r(i):i());};t.__c=t.componentWillUnmount,t.componentWillUnmount=function(){o(),t.__c&&t.__c();};var i=function(){var n;if(!--e.__u)for(e.__v.__k[0]=U(e.state.__e),e.setState({__e:e.__b=null});n=e.t.pop();)n.forceUpdate();},c=e.__v;c&&!0===c.__h||e.__u++||e.setState({__e:e.__b=e.__v.__k[0]}),n.then(o,o);},F$1.prototype.componentWillUnmount=function(){this.t=[];},F$1.prototype.render=function(n,t){this.__b&&(this.__v.__k&&(this.__v.__k[0]=L$1(this.__b)),this.__b=null);var e=t.__e&&h(p,null,n.fallback);return e&&(e.__h=null),[h(p,null,t.__e?null:n.children),e]};var T$2=function(n,t,e){if(++e[1]===e[0]&&n.o.delete(t),n.props.revealOrder&&("t"!==n.props.revealOrder[0]||!n.o.size))for(e=n.u;e;){for(;e.length>3;)e.pop()();if(e[1]<e[0])break;n.u=e=e[2];}};function W(n){return this.getChildContext=function(){return n.context},n.children}function j$2(n){var t=this,e=n.i,r=h(W,{context:t.context},n.__v);t.componentWillUnmount=function(){var n=t.l.parentNode;n&&n.removeChild(t.l),L(t.s);},t.i&&t.i!==e&&(t.componentWillUnmount(),t.h=!1),n.__v?t.h?(e.__k=t.__k,O(r,e),t.__k=e.__k):(t.l=document.createTextNode(""),t.__k=e.__k,S("",e),e.appendChild(t.l),t.h=!0,t.i=e,O(r,e,t.l),e.__k=t.__k,t.__k=t.l.__k):t.h&&t.componentWillUnmount(),t.s=r;}function P$1(n,t){return h(j$2,{__v:n,i:t})}(I$1.prototype=new d).__e=function(n){var t=this,e=M$1(t.__v),r=t.o.get(n);return r[0]++,function(u){var o=function(){t.props.revealOrder?(r.push(u),T$2(t,n,r)):u();};e?e(o):o();}},I$1.prototype.render=function(n){this.u=null,this.o=new Map;var t=b(n.children);n.revealOrder&&"b"===n.revealOrder[0]&&t.reverse();for(var e=t.length;e--;)this.o.set(t[e],this.u=[1,0,this.u]);return n.children},I$1.prototype.componentDidUpdate=I$1.prototype.componentDidMount=function(){var n=this;this.o.forEach(function(t,e){T$2(n,e,t);});};var z$1="undefined"!=typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103,V=/^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|fill|flood|font|glyph(?!R)|horiz|marker(?!H|W|U)|overline|paint|stop|strikethrough|stroke|text(?!L)|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,B$1="undefined"!=typeof Symbol?/fil|che|rad/i:/fil|che|ra/i;function H$1(n,t,e){return null==t.__k&&(t.textContent=""),O(n,t),"function"==typeof e&&e(),n?n.__c:null}function Z(n,t,e){return S(n,t),"function"==typeof e&&e(),n?n.__c:null}d.prototype.isReactComponent={},["componentWillMount","componentWillReceiveProps","componentWillUpdate"].forEach(function(n){Object.defineProperty(d.prototype,n,{configurable:!0,get:function(){return this["UNSAFE_"+n]},set:function(t){Object.defineProperty(this,n,{configurable:!0,writable:!0,value:t});}});});var Y=n.event;function $$1(){}function q$2(){return this.cancelBubble}function G(){return this.defaultPrevented}n.event=function(n){return Y&&(n=Y(n)),n.persist=$$1,n.isPropagationStopped=q$2,n.isDefaultPrevented=G,n.nativeEvent=n};var J,K={configurable:!0,get:function(){return this.class}},Q=n.vnode;n.vnode=function(n){var t=n.type,e=n.props,r=e;if("string"==typeof t){for(var u in r={},e){var o=e[u];"defaultValue"===u&&"value"in e&&null==e.value?u="value":"download"===u&&!0===o?o="":/ondoubleclick/i.test(u)?u="ondblclick":/^onchange(textarea|input)/i.test(u+t)&&!B$1.test(e.type)?u="oninput":/^on(Ani|Tra|Tou|BeforeInp)/.test(u)?u=u.toLowerCase():V.test(u)?u=u.replace(/[A-Z0-9]/,"-$&").toLowerCase():null===o&&(o=void 0),r[u]=o;}"select"==t&&r.multiple&&Array.isArray(r.value)&&(r.value=b(e.children).forEach(function(n){n.props.selected=-1!=r.value.indexOf(n.props.value);})),n.props=r;}t&&e.class!=e.className&&(K.enumerable="className"in e,null!=e.className&&(r.class=e.className),Object.defineProperty(r,"className",K)),n.$$typeof=z$1,Q&&Q(n);};var X=n.__r;n.__r=function(n){X&&X(n),J=n.__c;};var nn={ReactCurrentDispatcher:{current:{readContext:function(n){return J.__n[n.__c].props.value}}}},tn="16.8.0";function en(n){return h.bind(null,n)}function rn(n){return !!n&&n.$$typeof===z$1}function un(n){return rn(n)?q.apply(null,arguments):n}function on(n){return !!n.__k&&(O(null,n),!0)}function cn(n){return n&&(n.base||1===n.nodeType&&n)||null}var ln=function(n,t){return n(t)},fn=p;var React = {useState:m$1,useReducer:p$1,useEffect:y$1,useLayoutEffect:l,useRef:h$1,useImperativeHandle:s$1,useMemo:_$1,useCallback:A$1,useContext:F,useDebugValue:T$1,version:"16.8.0",Children:N$1,render:H$1,hydrate:Z,unmountComponentAtNode:on,createPortal:P$1,createElement:h,createContext:B,createFactory:en,cloneElement:un,createRef:y,Fragment:p,isValidElement:rn,findDOMNode:cn,Component:d,PureComponent:w$1,memo:C$1,forwardRef:k$2,unstable_batchedUpdates:ln,StrictMode:p,Suspense:F$1,SuspenseList:I$1,lazy:D,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:nn};

	var compat_module = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': React,
		version: tn,
		Children: N$1,
		render: H$1,
		hydrate: Z,
		unmountComponentAtNode: on,
		createPortal: P$1,
		createFactory: en,
		cloneElement: un,
		isValidElement: rn,
		findDOMNode: cn,
		PureComponent: w$1,
		memo: C$1,
		forwardRef: k$2,
		unstable_batchedUpdates: ln,
		StrictMode: fn,
		Suspense: F$1,
		SuspenseList: I$1,
		lazy: D,
		__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: nn,
		createElement: h,
		createContext: B,
		createRef: y,
		Fragment: p,
		Component: d,
		useState: m$1,
		useReducer: p$1,
		useEffect: y$1,
		useLayoutEffect: l,
		useRef: h$1,
		useImperativeHandle: s$1,
		useMemo: _$1,
		useCallback: A$1,
		useContext: F,
		useDebugValue: T$1,
		useErrorBoundary: d$1
	});

	function stylis_min (W) {
	  function M(d, c, e, h, a) {
	    for (var m = 0, b = 0, v = 0, n = 0, q, g, x = 0, K = 0, k, u = k = q = 0, l = 0, r = 0, I = 0, t = 0, B = e.length, J = B - 1, y, f = '', p = '', F = '', G = '', C; l < B;) {
	      g = e.charCodeAt(l);
	      l === J && 0 !== b + n + v + m && (0 !== b && (g = 47 === b ? 10 : 47), n = v = m = 0, B++, J++);

	      if (0 === b + n + v + m) {
	        if (l === J && (0 < r && (f = f.replace(N, '')), 0 < f.trim().length)) {
	          switch (g) {
	            case 32:
	            case 9:
	            case 59:
	            case 13:
	            case 10:
	              break;

	            default:
	              f += e.charAt(l);
	          }

	          g = 59;
	        }

	        switch (g) {
	          case 123:
	            f = f.trim();
	            q = f.charCodeAt(0);
	            k = 1;

	            for (t = ++l; l < B;) {
	              switch (g = e.charCodeAt(l)) {
	                case 123:
	                  k++;
	                  break;

	                case 125:
	                  k--;
	                  break;

	                case 47:
	                  switch (g = e.charCodeAt(l + 1)) {
	                    case 42:
	                    case 47:
	                      a: {
	                        for (u = l + 1; u < J; ++u) {
	                          switch (e.charCodeAt(u)) {
	                            case 47:
	                              if (42 === g && 42 === e.charCodeAt(u - 1) && l + 2 !== u) {
	                                l = u + 1;
	                                break a;
	                              }

	                              break;

	                            case 10:
	                              if (47 === g) {
	                                l = u + 1;
	                                break a;
	                              }

	                          }
	                        }

	                        l = u;
	                      }

	                  }

	                  break;

	                case 91:
	                  g++;

	                case 40:
	                  g++;

	                case 34:
	                case 39:
	                  for (; l++ < J && e.charCodeAt(l) !== g;) {
	                  }

	              }

	              if (0 === k) break;
	              l++;
	            }

	            k = e.substring(t, l);
	            0 === q && (q = (f = f.replace(ca, '').trim()).charCodeAt(0));

	            switch (q) {
	              case 64:
	                0 < r && (f = f.replace(N, ''));
	                g = f.charCodeAt(1);

	                switch (g) {
	                  case 100:
	                  case 109:
	                  case 115:
	                  case 45:
	                    r = c;
	                    break;

	                  default:
	                    r = O;
	                }

	                k = M(c, r, k, g, a + 1);
	                t = k.length;
	                0 < A && (r = X(O, f, I), C = H(3, k, r, c, D, z, t, g, a, h), f = r.join(''), void 0 !== C && 0 === (t = (k = C.trim()).length) && (g = 0, k = ''));
	                if (0 < t) switch (g) {
	                  case 115:
	                    f = f.replace(da, ea);

	                  case 100:
	                  case 109:
	                  case 45:
	                    k = f + '{' + k + '}';
	                    break;

	                  case 107:
	                    f = f.replace(fa, '$1 $2');
	                    k = f + '{' + k + '}';
	                    k = 1 === w || 2 === w && L('@' + k, 3) ? '@-webkit-' + k + '@' + k : '@' + k;
	                    break;

	                  default:
	                    k = f + k, 112 === h && (k = (p += k, ''));
	                } else k = '';
	                break;

	              default:
	                k = M(c, X(c, f, I), k, h, a + 1);
	            }

	            F += k;
	            k = I = r = u = q = 0;
	            f = '';
	            g = e.charCodeAt(++l);
	            break;

	          case 125:
	          case 59:
	            f = (0 < r ? f.replace(N, '') : f).trim();
	            if (1 < (t = f.length)) switch (0 === u && (q = f.charCodeAt(0), 45 === q || 96 < q && 123 > q) && (t = (f = f.replace(' ', ':')).length), 0 < A && void 0 !== (C = H(1, f, c, d, D, z, p.length, h, a, h)) && 0 === (t = (f = C.trim()).length) && (f = '\x00\x00'), q = f.charCodeAt(0), g = f.charCodeAt(1), q) {
	              case 0:
	                break;

	              case 64:
	                if (105 === g || 99 === g) {
	                  G += f + e.charAt(l);
	                  break;
	                }

	              default:
	                58 !== f.charCodeAt(t - 1) && (p += P(f, q, g, f.charCodeAt(2)));
	            }
	            I = r = u = q = 0;
	            f = '';
	            g = e.charCodeAt(++l);
	        }
	      }

	      switch (g) {
	        case 13:
	        case 10:
	          47 === b ? b = 0 : 0 === 1 + q && 107 !== h && 0 < f.length && (r = 1, f += '\x00');
	          0 < A * Y && H(0, f, c, d, D, z, p.length, h, a, h);
	          z = 1;
	          D++;
	          break;

	        case 59:
	        case 125:
	          if (0 === b + n + v + m) {
	            z++;
	            break;
	          }

	        default:
	          z++;
	          y = e.charAt(l);

	          switch (g) {
	            case 9:
	            case 32:
	              if (0 === n + m + b) switch (x) {
	                case 44:
	                case 58:
	                case 9:
	                case 32:
	                  y = '';
	                  break;

	                default:
	                  32 !== g && (y = ' ');
	              }
	              break;

	            case 0:
	              y = '\\0';
	              break;

	            case 12:
	              y = '\\f';
	              break;

	            case 11:
	              y = '\\v';
	              break;

	            case 38:
	              0 === n + b + m && (r = I = 1, y = '\f' + y);
	              break;

	            case 108:
	              if (0 === n + b + m + E && 0 < u) switch (l - u) {
	                case 2:
	                  112 === x && 58 === e.charCodeAt(l - 3) && (E = x);

	                case 8:
	                  111 === K && (E = K);
	              }
	              break;

	            case 58:
	              0 === n + b + m && (u = l);
	              break;

	            case 44:
	              0 === b + v + n + m && (r = 1, y += '\r');
	              break;

	            case 34:
	            case 39:
	              0 === b && (n = n === g ? 0 : 0 === n ? g : n);
	              break;

	            case 91:
	              0 === n + b + v && m++;
	              break;

	            case 93:
	              0 === n + b + v && m--;
	              break;

	            case 41:
	              0 === n + b + m && v--;
	              break;

	            case 40:
	              if (0 === n + b + m) {
	                if (0 === q) switch (2 * x + 3 * K) {
	                  case 533:
	                    break;

	                  default:
	                    q = 1;
	                }
	                v++;
	              }

	              break;

	            case 64:
	              0 === b + v + n + m + u + k && (k = 1);
	              break;

	            case 42:
	            case 47:
	              if (!(0 < n + m + v)) switch (b) {
	                case 0:
	                  switch (2 * g + 3 * e.charCodeAt(l + 1)) {
	                    case 235:
	                      b = 47;
	                      break;

	                    case 220:
	                      t = l, b = 42;
	                  }

	                  break;

	                case 42:
	                  47 === g && 42 === x && t + 2 !== l && (33 === e.charCodeAt(t + 2) && (p += e.substring(t, l + 1)), y = '', b = 0);
	              }
	          }

	          0 === b && (f += y);
	      }

	      K = x;
	      x = g;
	      l++;
	    }

	    t = p.length;

	    if (0 < t) {
	      r = c;
	      if (0 < A && (C = H(2, p, r, d, D, z, t, h, a, h), void 0 !== C && 0 === (p = C).length)) return G + p + F;
	      p = r.join(',') + '{' + p + '}';

	      if (0 !== w * E) {
	        2 !== w || L(p, 2) || (E = 0);

	        switch (E) {
	          case 111:
	            p = p.replace(ha, ':-moz-$1') + p;
	            break;

	          case 112:
	            p = p.replace(Q, '::-webkit-input-$1') + p.replace(Q, '::-moz-$1') + p.replace(Q, ':-ms-input-$1') + p;
	        }

	        E = 0;
	      }
	    }

	    return G + p + F;
	  }

	  function X(d, c, e) {
	    var h = c.trim().split(ia);
	    c = h;
	    var a = h.length,
	        m = d.length;

	    switch (m) {
	      case 0:
	      case 1:
	        var b = 0;

	        for (d = 0 === m ? '' : d[0] + ' '; b < a; ++b) {
	          c[b] = Z(d, c[b], e).trim();
	        }

	        break;

	      default:
	        var v = b = 0;

	        for (c = []; b < a; ++b) {
	          for (var n = 0; n < m; ++n) {
	            c[v++] = Z(d[n] + ' ', h[b], e).trim();
	          }
	        }

	    }

	    return c;
	  }

	  function Z(d, c, e) {
	    var h = c.charCodeAt(0);
	    33 > h && (h = (c = c.trim()).charCodeAt(0));

	    switch (h) {
	      case 38:
	        return c.replace(F, '$1' + d.trim());

	      case 58:
	        return d.trim() + c.replace(F, '$1' + d.trim());

	      default:
	        if (0 < 1 * e && 0 < c.indexOf('\f')) return c.replace(F, (58 === d.charCodeAt(0) ? '' : '$1') + d.trim());
	    }

	    return d + c;
	  }

	  function P(d, c, e, h) {
	    var a = d + ';',
	        m = 2 * c + 3 * e + 4 * h;

	    if (944 === m) {
	      d = a.indexOf(':', 9) + 1;
	      var b = a.substring(d, a.length - 1).trim();
	      b = a.substring(0, d).trim() + b + ';';
	      return 1 === w || 2 === w && L(b, 1) ? '-webkit-' + b + b : b;
	    }

	    if (0 === w || 2 === w && !L(a, 1)) return a;

	    switch (m) {
	      case 1015:
	        return 97 === a.charCodeAt(10) ? '-webkit-' + a + a : a;

	      case 951:
	        return 116 === a.charCodeAt(3) ? '-webkit-' + a + a : a;

	      case 963:
	        return 110 === a.charCodeAt(5) ? '-webkit-' + a + a : a;

	      case 1009:
	        if (100 !== a.charCodeAt(4)) break;

	      case 969:
	      case 942:
	        return '-webkit-' + a + a;

	      case 978:
	        return '-webkit-' + a + '-moz-' + a + a;

	      case 1019:
	      case 983:
	        return '-webkit-' + a + '-moz-' + a + '-ms-' + a + a;

	      case 883:
	        if (45 === a.charCodeAt(8)) return '-webkit-' + a + a;
	        if (0 < a.indexOf('image-set(', 11)) return a.replace(ja, '$1-webkit-$2') + a;
	        break;

	      case 932:
	        if (45 === a.charCodeAt(4)) switch (a.charCodeAt(5)) {
	          case 103:
	            return '-webkit-box-' + a.replace('-grow', '') + '-webkit-' + a + '-ms-' + a.replace('grow', 'positive') + a;

	          case 115:
	            return '-webkit-' + a + '-ms-' + a.replace('shrink', 'negative') + a;

	          case 98:
	            return '-webkit-' + a + '-ms-' + a.replace('basis', 'preferred-size') + a;
	        }
	        return '-webkit-' + a + '-ms-' + a + a;

	      case 964:
	        return '-webkit-' + a + '-ms-flex-' + a + a;

	      case 1023:
	        if (99 !== a.charCodeAt(8)) break;
	        b = a.substring(a.indexOf(':', 15)).replace('flex-', '').replace('space-between', 'justify');
	        return '-webkit-box-pack' + b + '-webkit-' + a + '-ms-flex-pack' + b + a;

	      case 1005:
	        return ka.test(a) ? a.replace(aa, ':-webkit-') + a.replace(aa, ':-moz-') + a : a;

	      case 1e3:
	        b = a.substring(13).trim();
	        c = b.indexOf('-') + 1;

	        switch (b.charCodeAt(0) + b.charCodeAt(c)) {
	          case 226:
	            b = a.replace(G, 'tb');
	            break;

	          case 232:
	            b = a.replace(G, 'tb-rl');
	            break;

	          case 220:
	            b = a.replace(G, 'lr');
	            break;

	          default:
	            return a;
	        }

	        return '-webkit-' + a + '-ms-' + b + a;

	      case 1017:
	        if (-1 === a.indexOf('sticky', 9)) break;

	      case 975:
	        c = (a = d).length - 10;
	        b = (33 === a.charCodeAt(c) ? a.substring(0, c) : a).substring(d.indexOf(':', 7) + 1).trim();

	        switch (m = b.charCodeAt(0) + (b.charCodeAt(7) | 0)) {
	          case 203:
	            if (111 > b.charCodeAt(8)) break;

	          case 115:
	            a = a.replace(b, '-webkit-' + b) + ';' + a;
	            break;

	          case 207:
	          case 102:
	            a = a.replace(b, '-webkit-' + (102 < m ? 'inline-' : '') + 'box') + ';' + a.replace(b, '-webkit-' + b) + ';' + a.replace(b, '-ms-' + b + 'box') + ';' + a;
	        }

	        return a + ';';

	      case 938:
	        if (45 === a.charCodeAt(5)) switch (a.charCodeAt(6)) {
	          case 105:
	            return b = a.replace('-items', ''), '-webkit-' + a + '-webkit-box-' + b + '-ms-flex-' + b + a;

	          case 115:
	            return '-webkit-' + a + '-ms-flex-item-' + a.replace(ba, '') + a;

	          default:
	            return '-webkit-' + a + '-ms-flex-line-pack' + a.replace('align-content', '').replace(ba, '') + a;
	        }
	        break;

	      case 973:
	      case 989:
	        if (45 !== a.charCodeAt(3) || 122 === a.charCodeAt(4)) break;

	      case 931:
	      case 953:
	        if (!0 === la.test(d)) return 115 === (b = d.substring(d.indexOf(':') + 1)).charCodeAt(0) ? P(d.replace('stretch', 'fill-available'), c, e, h).replace(':fill-available', ':stretch') : a.replace(b, '-webkit-' + b) + a.replace(b, '-moz-' + b.replace('fill-', '')) + a;
	        break;

	      case 962:
	        if (a = '-webkit-' + a + (102 === a.charCodeAt(5) ? '-ms-' + a : '') + a, 211 === e + h && 105 === a.charCodeAt(13) && 0 < a.indexOf('transform', 10)) return a.substring(0, a.indexOf(';', 27) + 1).replace(ma, '$1-webkit-$2') + a;
	    }

	    return a;
	  }

	  function L(d, c) {
	    var e = d.indexOf(1 === c ? ':' : '{'),
	        h = d.substring(0, 3 !== c ? e : 10);
	    e = d.substring(e + 1, d.length - 1);
	    return R(2 !== c ? h : h.replace(na, '$1'), e, c);
	  }

	  function ea(d, c) {
	    var e = P(c, c.charCodeAt(0), c.charCodeAt(1), c.charCodeAt(2));
	    return e !== c + ';' ? e.replace(oa, ' or ($1)').substring(4) : '(' + c + ')';
	  }

	  function H(d, c, e, h, a, m, b, v, n, q) {
	    for (var g = 0, x = c, w; g < A; ++g) {
	      switch (w = S[g].call(B, d, x, e, h, a, m, b, v, n, q)) {
	        case void 0:
	        case !1:
	        case !0:
	        case null:
	          break;

	        default:
	          x = w;
	      }
	    }

	    if (x !== c) return x;
	  }

	  function T(d) {
	    switch (d) {
	      case void 0:
	      case null:
	        A = S.length = 0;
	        break;

	      default:
	        if ('function' === typeof d) S[A++] = d;else if ('object' === typeof d) for (var c = 0, e = d.length; c < e; ++c) {
	          T(d[c]);
	        } else Y = !!d | 0;
	    }

	    return T;
	  }

	  function U(d) {
	    d = d.prefix;
	    void 0 !== d && (R = null, d ? 'function' !== typeof d ? w = 1 : (w = 2, R = d) : w = 0);
	    return U;
	  }

	  function B(d, c) {
	    var e = d;
	    33 > e.charCodeAt(0) && (e = e.trim());
	    V = e;
	    e = [V];

	    if (0 < A) {
	      var h = H(-1, c, e, e, D, z, 0, 0, 0, 0);
	      void 0 !== h && 'string' === typeof h && (c = h);
	    }

	    var a = M(O, e, c, 0, 0);
	    0 < A && (h = H(-2, a, e, e, D, z, a.length, 0, 0, 0), void 0 !== h && (a = h));
	    V = '';
	    E = 0;
	    z = D = 1;
	    return a;
	  }

	  var ca = /^\0+/g,
	      N = /[\0\r\f]/g,
	      aa = /: */g,
	      ka = /zoo|gra/,
	      ma = /([,: ])(transform)/g,
	      ia = /,\r+?/g,
	      F = /([\t\r\n ])*\f?&/g,
	      fa = /@(k\w+)\s*(\S*)\s*/,
	      Q = /::(place)/g,
	      ha = /:(read-only)/g,
	      G = /[svh]\w+-[tblr]{2}/,
	      da = /\(\s*(.*)\s*\)/g,
	      oa = /([\s\S]*?);/g,
	      ba = /-self|flex-/g,
	      na = /[^]*?(:[rp][el]a[\w-]+)[^]*/,
	      la = /stretch|:\s*\w+\-(?:conte|avail)/,
	      ja = /([^-])(image-set\()/,
	      z = 1,
	      D = 1,
	      E = 0,
	      w = 1,
	      O = [],
	      S = [],
	      A = 0,
	      R = null,
	      Y = 0,
	      V = '';
	  B.use = T;
	  B.set = U;
	  void 0 !== W && U(W);
	  return B;
	}

	var unitlessKeys = {
	  animationIterationCount: 1,
	  borderImageOutset: 1,
	  borderImageSlice: 1,
	  borderImageWidth: 1,
	  boxFlex: 1,
	  boxFlexGroup: 1,
	  boxOrdinalGroup: 1,
	  columnCount: 1,
	  columns: 1,
	  flex: 1,
	  flexGrow: 1,
	  flexPositive: 1,
	  flexShrink: 1,
	  flexNegative: 1,
	  flexOrder: 1,
	  gridRow: 1,
	  gridRowEnd: 1,
	  gridRowSpan: 1,
	  gridRowStart: 1,
	  gridColumn: 1,
	  gridColumnEnd: 1,
	  gridColumnSpan: 1,
	  gridColumnStart: 1,
	  msGridRow: 1,
	  msGridRowSpan: 1,
	  msGridColumn: 1,
	  msGridColumnSpan: 1,
	  fontWeight: 1,
	  lineHeight: 1,
	  opacity: 1,
	  order: 1,
	  orphans: 1,
	  tabSize: 1,
	  widows: 1,
	  zIndex: 1,
	  zoom: 1,
	  WebkitLineClamp: 1,
	  // SVG-related properties
	  fillOpacity: 1,
	  floodOpacity: 1,
	  stopOpacity: 1,
	  strokeDasharray: 1,
	  strokeDashoffset: 1,
	  strokeMiterlimit: 1,
	  strokeOpacity: 1,
	  strokeWidth: 1
	};

	function memoize(fn) {
	  var cache = {};
	  return function (arg) {
	    if (cache[arg] === undefined) cache[arg] = fn(arg);
	    return cache[arg];
	  };
	}

	var reactPropsRegex = /^((children|dangerouslySetInnerHTML|key|ref|autoFocus|defaultValue|defaultChecked|innerHTML|suppressContentEditableWarning|suppressHydrationWarning|valueLink|accept|acceptCharset|accessKey|action|allow|allowUserMedia|allowPaymentRequest|allowFullScreen|allowTransparency|alt|async|autoComplete|autoPlay|capture|cellPadding|cellSpacing|challenge|charSet|checked|cite|classID|className|cols|colSpan|content|contentEditable|contextMenu|controls|controlsList|coords|crossOrigin|data|dateTime|decoding|default|defer|dir|disabled|disablePictureInPicture|download|draggable|encType|form|formAction|formEncType|formMethod|formNoValidate|formTarget|frameBorder|headers|height|hidden|high|href|hrefLang|htmlFor|httpEquiv|id|inputMode|integrity|is|keyParams|keyType|kind|label|lang|list|loading|loop|low|marginHeight|marginWidth|max|maxLength|media|mediaGroup|method|min|minLength|multiple|muted|name|nonce|noValidate|open|optimum|pattern|placeholder|playsInline|poster|preload|profile|radioGroup|readOnly|referrerPolicy|rel|required|reversed|role|rows|rowSpan|sandbox|scope|scoped|scrolling|seamless|selected|shape|size|sizes|slot|span|spellCheck|src|srcDoc|srcLang|srcSet|start|step|style|summary|tabIndex|target|title|type|useMap|value|width|wmode|wrap|about|datatype|inlist|prefix|property|resource|typeof|vocab|autoCapitalize|autoCorrect|autoSave|color|inert|itemProp|itemScope|itemType|itemID|itemRef|on|results|security|unselectable|accentHeight|accumulate|additive|alignmentBaseline|allowReorder|alphabetic|amplitude|arabicForm|ascent|attributeName|attributeType|autoReverse|azimuth|baseFrequency|baselineShift|baseProfile|bbox|begin|bias|by|calcMode|capHeight|clip|clipPathUnits|clipPath|clipRule|colorInterpolation|colorInterpolationFilters|colorProfile|colorRendering|contentScriptType|contentStyleType|cursor|cx|cy|d|decelerate|descent|diffuseConstant|direction|display|divisor|dominantBaseline|dur|dx|dy|edgeMode|elevation|enableBackground|end|exponent|externalResourcesRequired|fill|fillOpacity|fillRule|filter|filterRes|filterUnits|floodColor|floodOpacity|focusable|fontFamily|fontSize|fontSizeAdjust|fontStretch|fontStyle|fontVariant|fontWeight|format|from|fr|fx|fy|g1|g2|glyphName|glyphOrientationHorizontal|glyphOrientationVertical|glyphRef|gradientTransform|gradientUnits|hanging|horizAdvX|horizOriginX|ideographic|imageRendering|in|in2|intercept|k|k1|k2|k3|k4|kernelMatrix|kernelUnitLength|kerning|keyPoints|keySplines|keyTimes|lengthAdjust|letterSpacing|lightingColor|limitingConeAngle|local|markerEnd|markerMid|markerStart|markerHeight|markerUnits|markerWidth|mask|maskContentUnits|maskUnits|mathematical|mode|numOctaves|offset|opacity|operator|order|orient|orientation|origin|overflow|overlinePosition|overlineThickness|panose1|paintOrder|pathLength|patternContentUnits|patternTransform|patternUnits|pointerEvents|points|pointsAtX|pointsAtY|pointsAtZ|preserveAlpha|preserveAspectRatio|primitiveUnits|r|radius|refX|refY|renderingIntent|repeatCount|repeatDur|requiredExtensions|requiredFeatures|restart|result|rotate|rx|ry|scale|seed|shapeRendering|slope|spacing|specularConstant|specularExponent|speed|spreadMethod|startOffset|stdDeviation|stemh|stemv|stitchTiles|stopColor|stopOpacity|strikethroughPosition|strikethroughThickness|string|stroke|strokeDasharray|strokeDashoffset|strokeLinecap|strokeLinejoin|strokeMiterlimit|strokeOpacity|strokeWidth|surfaceScale|systemLanguage|tableValues|targetX|targetY|textAnchor|textDecoration|textRendering|textLength|to|transform|u1|u2|underlinePosition|underlineThickness|unicode|unicodeBidi|unicodeRange|unitsPerEm|vAlphabetic|vHanging|vIdeographic|vMathematical|values|vectorEffect|version|vertAdvY|vertOriginX|vertOriginY|viewBox|viewTarget|visibility|widths|wordSpacing|writingMode|x|xHeight|x1|x2|xChannelSelector|xlinkActuate|xlinkArcrole|xlinkHref|xlinkRole|xlinkShow|xlinkTitle|xlinkType|xmlBase|xmlns|xmlnsXlink|xmlLang|xmlSpace|y|y1|y2|yChannelSelector|z|zoomAndPan|for|class|autofocus)|(([Dd][Aa][Tt][Aa]|[Aa][Rr][Ii][Aa]|x)-.*))$/; // https://esbench.com/bench/5bfee68a4cd7e6009ef61d23

	var index = memoize(function (prop) {
	  return reactPropsRegex.test(prop) || prop.charCodeAt(0) === 111
	  /* o */
	  && prop.charCodeAt(1) === 110
	  /* n */
	  && prop.charCodeAt(2) < 91;
	}
	/* Z+1 */
	);

	/**
	 * Copyright 2015, Yahoo! Inc.
	 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
	 */
	var REACT_STATICS = {
	  childContextTypes: true,
	  contextType: true,
	  contextTypes: true,
	  defaultProps: true,
	  displayName: true,
	  getDefaultProps: true,
	  getDerivedStateFromError: true,
	  getDerivedStateFromProps: true,
	  mixins: true,
	  propTypes: true,
	  type: true
	};
	var KNOWN_STATICS = {
	  name: true,
	  length: true,
	  prototype: true,
	  caller: true,
	  callee: true,
	  arguments: true,
	  arity: true
	};
	var FORWARD_REF_STATICS = {
	  '$$typeof': true,
	  render: true,
	  defaultProps: true,
	  displayName: true,
	  propTypes: true
	};
	var MEMO_STATICS = {
	  '$$typeof': true,
	  compare: true,
	  defaultProps: true,
	  displayName: true,
	  propTypes: true,
	  type: true
	};
	var TYPE_STATICS = {};
	TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
	TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;

	function getStatics(component) {
	  // React v16.11 and below
	  if (reactIs.isMemo(component)) {
	    return MEMO_STATICS;
	  } // React v16.12 and above


	  return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
	}

	var defineProperty = Object.defineProperty;
	var getOwnPropertyNames = Object.getOwnPropertyNames;
	var getOwnPropertySymbols = Object.getOwnPropertySymbols;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	var getPrototypeOf = Object.getPrototypeOf;
	var objectPrototype = Object.prototype;
	function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
	  if (typeof sourceComponent !== 'string') {
	    // don't hoist over string (html) components
	    if (objectPrototype) {
	      var inheritedComponent = getPrototypeOf(sourceComponent);

	      if (inheritedComponent && inheritedComponent !== objectPrototype) {
	        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
	      }
	    }

	    var keys = getOwnPropertyNames(sourceComponent);

	    if (getOwnPropertySymbols) {
	      keys = keys.concat(getOwnPropertySymbols(sourceComponent));
	    }

	    var targetStatics = getStatics(targetComponent);
	    var sourceStatics = getStatics(sourceComponent);

	    for (var i = 0; i < keys.length; ++i) {
	      var key = keys[i];

	      if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
	        var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

	        try {
	          // Avoid failures from read-only properties
	          defineProperty(targetComponent, key, descriptor);
	        } catch (e) {}
	      }
	    }
	  }

	  return targetComponent;
	}

	var hoistNonReactStatics_cjs = hoistNonReactStatics;

	function v$2(){return (v$2=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r]);}return e}).apply(this,arguments)}var y$2=function(e,t){for(var n=[e[0]],r=0,o=t.length;r<o;r+=1)n.push(t[r],e[r+1]);return n},g$3=function(t){return null!==t&&"object"==typeof t&&"[object Object]"===(t.toString?t.toString():Object.prototype.toString.call(t))&&!reactIs.typeOf(t)},S$2=Object.freeze([]),w$2=Object.freeze({});function E(e){return "function"==typeof e}function b$2(e){return "string"==typeof e&&e||e.displayName||e.name||"Component"}function N$2(e){return e&&"string"==typeof e.styledComponentId}var _$2="undefined"!=typeof process&&(process.env.REACT_APP_SC_ATTR||process.env.SC_ATTR)||"data-styled",A$3="undefined"!=typeof window&&"HTMLElement"in window,I$2=Boolean("boolean"==typeof SC_DISABLE_SPEEDY?SC_DISABLE_SPEEDY:"undefined"!=typeof process&&void 0!==process.env.REACT_APP_SC_DISABLE_SPEEDY&&""!==process.env.REACT_APP_SC_DISABLE_SPEEDY?"false"!==process.env.REACT_APP_SC_DISABLE_SPEEDY&&process.env.REACT_APP_SC_DISABLE_SPEEDY:"undefined"!=typeof process&&void 0!==process.env.SC_DISABLE_SPEEDY&&""!==process.env.SC_DISABLE_SPEEDY?"false"!==process.env.SC_DISABLE_SPEEDY&&process.env.SC_DISABLE_SPEEDY:"production"!==undefined),O$2={1:"Cannot create styled-component for component: %s.\n\n",2:"Can't collect styles once you've consumed a `ServerStyleSheet`'s styles! `ServerStyleSheet` is a one off instance for each server-side render cycle.\n\n- Are you trying to reuse it across renders?\n- Are you accidentally calling collectStyles twice?\n\n",3:"Streaming SSR is only supported in a Node.js environment; Please do not try to call this method in the browser.\n\n",4:"The `StyleSheetManager` expects a valid target or sheet prop!\n\n- Does this error occur on the client and is your target falsy?\n- Does this error occur on the server and is the sheet falsy?\n\n",5:"The clone method cannot be used on the client!\n\n- Are you running in a client-like environment on the server?\n- Are you trying to run SSR on the client?\n\n",6:"Trying to insert a new style tag, but the given Node is unmounted!\n\n- Are you using a custom target that isn't mounted?\n- Does your document not have a valid head element?\n- Have you accidentally removed a style tag manually?\n\n",7:'ThemeProvider: Please return an object from your "theme" prop function, e.g.\n\n```js\ntheme={() => ({})}\n```\n\n',8:'ThemeProvider: Please make your "theme" prop an object.\n\n',9:"Missing document `<head>`\n\n",10:"Cannot find a StyleSheet instance. Usually this happens if there are multiple copies of styled-components loaded at once. Check out this issue for how to troubleshoot and fix the common cases where this situation can happen: https://github.com/styled-components/styled-components/issues/1941#issuecomment-417862021\n\n",11:"_This error was replaced with a dev-time warning, it will be deleted for v4 final._ [createGlobalStyle] received children which will not be rendered. Please use the component without passing children elements.\n\n",12:"It seems you are interpolating a keyframe declaration (%s) into an untagged string. This was supported in styled-components v3, but is not longer supported in v4 as keyframes are now injected on-demand. Please wrap your string in the css\\`\\` helper which ensures the styles are injected correctly. See https://www.styled-components.com/docs/api#css\n\n",13:"%s is not a styled component and cannot be referred to via component selector. See https://www.styled-components.com/docs/advanced#referring-to-other-components for more details.\n\n",14:'ThemeProvider: "theme" prop is required.\n\n',15:"A stylis plugin has been supplied that is not named. We need a name for each plugin to be able to prevent styling collisions between different stylis configurations within the same app. Before you pass your plugin to `<StyleSheetManager stylisPlugins={[]}>`, please make sure each plugin is uniquely-named, e.g.\n\n```js\nObject.defineProperty(importedPlugin, 'name', { value: 'some-unique-name' });\n```\n\n",16:"Reached the limit of how many styled components may be created at group %s.\nYou may only create up to 1,073,741,824 components. If you're creating components dynamically,\nas for instance in your render method then you may be running into this limitation.\n\n",17:"CSSStyleSheet could not be found on HTMLStyleElement.\nHas styled-components' style tag been unmounted or altered by another script?\n"};function R$1(){for(var e=arguments.length<=0?void 0:arguments[0],t=[],n=1,r=arguments.length;n<r;n+=1)t.push(n<0||arguments.length<=n?void 0:arguments[n]);return t.forEach((function(t){e=e.replace(/%[a-z]/,t);})),e}function D$1(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];throw new Error(R$1.apply(void 0,[O$2[e]].concat(n)).trim())}var j$3=function(){function e(e){this.groupSizes=new Uint32Array(512),this.length=512,this.tag=e;}var t=e.prototype;return t.indexOfGroup=function(e){for(var t=0,n=0;n<e;n++)t+=this.groupSizes[n];return t},t.insertRules=function(e,t){if(e>=this.groupSizes.length){for(var n=this.groupSizes,r=n.length,o=r;e>=o;)(o<<=1)<0&&D$1(16,""+e);this.groupSizes=new Uint32Array(o),this.groupSizes.set(n),this.length=o;for(var s=r;s<o;s++)this.groupSizes[s]=0;}for(var i=this.indexOfGroup(e+1),a=0,c=t.length;a<c;a++)this.tag.insertRule(i,t[a])&&(this.groupSizes[e]++,i++);},t.clearGroup=function(e){if(e<this.length){var t=this.groupSizes[e],n=this.indexOfGroup(e),r=n+t;this.groupSizes[e]=0;for(var o=n;o<r;o++)this.tag.deleteRule(n);}},t.getGroup=function(e){var t="";if(e>=this.length||0===this.groupSizes[e])return t;for(var n=this.groupSizes[e],r=this.indexOfGroup(e),o=r+n,s=r;s<o;s++)t+=this.tag.getRule(s)+"/*!sc*/\n";return t},e}(),T$3=new Map,x$3=new Map,k$3=1,V$1=function(e){if(T$3.has(e))return T$3.get(e);for(;x$3.has(k$3);)k$3++;var t=k$3++;return ((0|t)<0||t>1<<30)&&D$1(16,""+t),T$3.set(e,t),x$3.set(t,e),t},M$2=function(e){return x$3.get(e)},B$2=function(e,t){T$3.set(e,t),x$3.set(t,e);},z$2="style["+_$2+'][data-styled-version="5.2.1"]',L$2=new RegExp("^"+_$2+'\\.g(\\d+)\\[id="([\\w\\d-]+)"\\].*?"([^"]*)'),G$1=function(e,t,n){for(var r,o=n.split(","),s=0,i=o.length;s<i;s++)(r=o[s])&&e.registerName(t,r);},F$2=function(e,t){for(var n=t.innerHTML.split("/*!sc*/\n"),r=[],o=0,s=n.length;o<s;o++){var i=n[o].trim();if(i){var a=i.match(L$2);if(a){var c=0|parseInt(a[1],10),u=a[2];0!==c&&(B$2(u,c),G$1(e,u,a[3]),e.getTag().insertRules(c,r)),r.length=0;}else r.push(i);}}},Y$1=function(){return "undefined"!=typeof __webpack_nonce__?__webpack_nonce__:null},q$3=function(e){var t=document.head,n=e||t,r=document.createElement("style"),o=function(e){for(var t=e.childNodes,n=t.length;n>=0;n--){var r=t[n];if(r&&1===r.nodeType&&r.hasAttribute(_$2))return r}}(n),s=void 0!==o?o.nextSibling:null;r.setAttribute(_$2,"active"),r.setAttribute("data-styled-version","5.2.1");var i=Y$1();return i&&r.setAttribute("nonce",i),n.insertBefore(r,s),r},H$2=function(){function e(e){var t=this.element=q$3(e);t.appendChild(document.createTextNode("")),this.sheet=function(e){if(e.sheet)return e.sheet;for(var t=document.styleSheets,n=0,r=t.length;n<r;n++){var o=t[n];if(o.ownerNode===e)return o}D$1(17);}(t),this.length=0;}var t=e.prototype;return t.insertRule=function(e,t){try{return this.sheet.insertRule(t,e),this.length++,!0}catch(e){return !1}},t.deleteRule=function(e){this.sheet.deleteRule(e),this.length--;},t.getRule=function(e){var t=this.sheet.cssRules[e];return void 0!==t&&"string"==typeof t.cssText?t.cssText:""},e}(),$$2=function(){function e(e){var t=this.element=q$3(e);this.nodes=t.childNodes,this.length=0;}var t=e.prototype;return t.insertRule=function(e,t){if(e<=this.length&&e>=0){var n=document.createTextNode(t),r=this.nodes[e];return this.element.insertBefore(n,r||null),this.length++,!0}return !1},t.deleteRule=function(e){this.element.removeChild(this.nodes[e]),this.length--;},t.getRule=function(e){return e<this.length?this.nodes[e].textContent:""},e}(),W$1=function(){function e(e){this.rules=[],this.length=0;}var t=e.prototype;return t.insertRule=function(e,t){return e<=this.length&&(this.rules.splice(e,0,t),this.length++,!0)},t.deleteRule=function(e){this.rules.splice(e,1),this.length--;},t.getRule=function(e){return e<this.length?this.rules[e]:""},e}(),U$1=A$3,J$1={isServer:!A$3,useCSSOMInjection:!I$2},Z$1=function(){function e(e,t,n){void 0===e&&(e=w$2),void 0===t&&(t={}),this.options=v$2({},J$1,{},e),this.gs=t,this.names=new Map(n),!this.options.isServer&&A$3&&U$1&&(U$1=!1,function(e){for(var t=document.querySelectorAll(z$2),n=0,r=t.length;n<r;n++){var o=t[n];o&&"active"!==o.getAttribute(_$2)&&(F$2(e,o),o.parentNode&&o.parentNode.removeChild(o));}}(this));}e.registerId=function(e){return V$1(e)};var t=e.prototype;return t.reconstructWithOptions=function(t,n){return void 0===n&&(n=!0),new e(v$2({},this.options,{},t),this.gs,n&&this.names||void 0)},t.allocateGSInstance=function(e){return this.gs[e]=(this.gs[e]||0)+1},t.getTag=function(){return this.tag||(this.tag=(n=(t=this.options).isServer,r=t.useCSSOMInjection,o=t.target,e=n?new W$1(o):r?new H$2(o):new $$2(o),new j$3(e)));var e,t,n,r,o;},t.hasNameForId=function(e,t){return this.names.has(e)&&this.names.get(e).has(t)},t.registerName=function(e,t){if(V$1(e),this.names.has(e))this.names.get(e).add(t);else {var n=new Set;n.add(t),this.names.set(e,n);}},t.insertRules=function(e,t,n){this.registerName(e,t),this.getTag().insertRules(V$1(e),n);},t.clearNames=function(e){this.names.has(e)&&this.names.get(e).clear();},t.clearRules=function(e){this.getTag().clearGroup(V$1(e)),this.clearNames(e);},t.clearTag=function(){this.tag=void 0;},t.toString=function(){return function(e){for(var t=e.getTag(),n=t.length,r="",o=0;o<n;o++){var s=M$2(o);if(void 0!==s){var i=e.names.get(s),a=t.getGroup(o);if(void 0!==i&&0!==a.length){var c=_$2+".g"+o+'[id="'+s+'"]',u="";void 0!==i&&i.forEach((function(e){e.length>0&&(u+=e+",");})),r+=""+a+c+'{content:"'+u+'"}/*!sc*/\n';}}}return r}(this)},e}(),X$1=/(a)(d)/gi,K$1=function(e){return String.fromCharCode(e+(e>25?39:97))};function Q$1(e){var t,n="";for(t=Math.abs(e);t>52;t=t/52|0)n=K$1(t%52)+n;return (K$1(t%52)+n).replace(X$1,"$1-$2")}var ee=function(e,t){for(var n=t.length;n;)e=33*e^t.charCodeAt(--n);return e},te=function(e){return ee(5381,e)};var re=te("5.2.1"),oe=function(){function e(e,t,n){this.rules=e,this.staticRulesId="",this.isStatic="production"===undefined,this.componentId=t,this.baseHash=ee(re,t),this.baseStyle=n,Z$1.registerId(t);}return e.prototype.generateAndInjectStyles=function(e,t,n){var r=this.componentId,o=[];if(this.baseStyle&&o.push(this.baseStyle.generateAndInjectStyles(e,t,n)),this.isStatic&&!n.hash)if(this.staticRulesId&&t.hasNameForId(r,this.staticRulesId))o.push(this.staticRulesId);else {var s=Ne(this.rules,e,t,n).join(""),i=Q$1(ee(this.baseHash,s.length)>>>0);if(!t.hasNameForId(r,i)){var a=n(s,"."+i,void 0,r);t.insertRules(r,i,a);}o.push(i),this.staticRulesId=i;}else {for(var c=this.rules.length,u=ee(this.baseHash,n.hash),l="",d=0;d<c;d++){var h=this.rules[d];if("string"==typeof h)l+=h,(u=ee(u,h+d));else if(h){var p=Ne(h,e,t,n),f=Array.isArray(p)?p.join(""):p;u=ee(u,f+d),l+=f;}}if(l){var m=Q$1(u>>>0);if(!t.hasNameForId(r,m)){var v=n(l,"."+m,void 0,r);t.insertRules(r,m,v);}o.push(m);}}return o.join(" ")},e}(),se=/^\s*\/\/.*$/gm,ie=[":","[",".","#"];function ae(e){var t,n,r,o,s=void 0===e?w$2:e,i=s.options,a=void 0===i?w$2:i,c=s.plugins,u=void 0===c?S$2:c,l=new stylis_min(a),d=[],p=function(e){function t(t){if(t)try{e(t+"}");}catch(e){}}return function(n,r,o,s,i,a,c,u,l,d){switch(n){case 1:if(0===l&&64===r.charCodeAt(0))return e(r+";"),"";break;case 2:if(0===u)return r+"/*|*/";break;case 3:switch(u){case 102:case 112:return e(o[0]+r),"";default:return r+(0===d?"/*|*/":"")}case-2:r.split("/*|*/}").forEach(t);}}}((function(e){d.push(e);})),f=function(e,r,s){return 0===r&&ie.includes(s[n.length])||s.match(o)?e:"."+t};function m(e,s,i,a){void 0===a&&(a="&");var c=e.replace(se,""),u=s&&i?i+" "+s+" { "+c+" }":c;return t=a,n=s,r=new RegExp("\\"+n+"\\b","g"),o=new RegExp("(\\"+n+"\\b){2,}"),l(i||!s?"":s,u)}return l.use([].concat(u,[function(e,t,o){2===e&&o.length&&o[0].lastIndexOf(n)>0&&(o[0]=o[0].replace(r,f));},p,function(e){if(-2===e){var t=d;return d=[],t}}])),m.hash=u.length?u.reduce((function(e,t){return t.name||D$1(15),ee(e,t.name)}),5381).toString():"",m}var ce=React.createContext(),ue=ce.Consumer,le=React.createContext(),de=(le.Consumer,new Z$1),he=ae();function pe(){return F(ce)||de}function fe(){return F(le)||he}var ve=function(){function e(e,t){var n=this;this.inject=function(e,t){void 0===t&&(t=he);var r=n.name+t.hash;e.hasNameForId(n.id,r)||e.insertRules(n.id,r,t(n.rules,r,"@keyframes"));},this.toString=function(){return D$1(12,String(n.name))},this.name=e,this.id="sc-keyframes-"+e,this.rules=t;}return e.prototype.getName=function(e){return void 0===e&&(e=he),this.name+e.hash},e}(),ye=/([A-Z])/,ge=/([A-Z])/g,Se=/^ms-/,we=function(e){return "-"+e.toLowerCase()};function Ee(e){return ye.test(e)?e.replace(ge,we).replace(Se,"-ms-"):e}var be=function(e){return null==e||!1===e||""===e};function Ne(e,n,r,o){if(Array.isArray(e)){for(var s,i=[],a=0,c=e.length;a<c;a+=1)""!==(s=Ne(e[a],n,r,o))&&(Array.isArray(s)?i.push.apply(i,s):i.push(s));return i}if(be(e))return "";if(N$2(e))return "."+e.styledComponentId;if(E(e)){if("function"!=typeof(l=e)||l.prototype&&l.prototype.isReactComponent||!n)return e;var u=e(n);return reactIs.isElement(u)&&console.warn(b$2(e)+" is not a styled component and cannot be referred to via component selector. See https://www.styled-components.com/docs/advanced#referring-to-other-components for more details."),Ne(u,n,r,o)}var l;return e instanceof ve?r?(e.inject(r,o),e.getName(o)):e:g$3(e)?function e(t,n){var r,o,s=[];for(var i in t)t.hasOwnProperty(i)&&!be(t[i])&&(g$3(t[i])?s.push.apply(s,e(t[i],i)):E(t[i])?s.push(Ee(i)+":",t[i],";"):s.push(Ee(i)+": "+(r=i,null==(o=t[i])||"boolean"==typeof o||""===o?"":"number"!=typeof o||0===o||r in unitlessKeys?String(o).trim():o+"px")+";"));return n?[n+" {"].concat(s,["}"]):s}(e):e.toString()}function _e(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];return E(e)||g$3(e)?Ne(y$2(S$2,[e].concat(n))):0===n.length&&1===e.length&&"string"==typeof e[0]?e:Ne(y$2(e,n))}var Ce=/invalid hook call/i,Ae=new Set,Ie=function(e,t){{var n="The component "+e+(t?' with the id of "'+t+'"':"")+" has been created dynamically.\nYou may see this warning because you've called styled inside another component.\nTo resolve this only create new StyledComponents outside of any render method and function component.";try{h$1(),Ae.has(n)||(console.warn(n),Ae.add(n));}catch(e){Ce.test(e.message)&&Ae.delete(n);}}},Pe=function(e,t,n){return void 0===n&&(n=w$2),e.theme!==n.theme&&e.theme||t||n.theme},Oe=/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-]+/g,Re=/(^-|-$)/g;function De(e){return e.replace(Oe,"-").replace(Re,"")}var je=function(e){return Q$1(te(e)>>>0)};function Te(e){return "string"==typeof e&&(e.charAt(0)===e.charAt(0).toLowerCase())}var xe=function(e){return "function"==typeof e||"object"==typeof e&&null!==e&&!Array.isArray(e)},ke=function(e){return "__proto__"!==e&&"constructor"!==e&&"prototype"!==e};function Ve(e,t,n){var r=e[n];xe(t)&&xe(r)?Me(r,t):e[n]=t;}function Me(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];for(var o=0,s=n;o<s.length;o++){var i=s[o];if(xe(i))for(var a in i)ke(a)&&Ve(e,i[a],a);}return e}var Be=React.createContext(),ze=Be.Consumer;function Le(e){var t=F(Be),n=_$1((function(){return function(e,t){if(!e)return D$1(14);if(E(e)){var n=e(t);return null!==n&&!Array.isArray(n)&&"object"==typeof n?n:D$1(7)}return Array.isArray(e)||"object"!=typeof e?D$1(8):t?v$2({},t,{},e):e}(e.theme,t)}),[e.theme,t]);return e.children?React.createElement(Be.Provider,{value:n},e.children):null}var Ge={};function Fe(e,t,n){var o=N$2(e),i=!Te(e),a=t.attrs,c=void 0===a?S$2:a,d=t.componentId,h$1=void 0===d?function(e,t){var n="string"!=typeof e?"sc":De(e);Ge[n]=(Ge[n]||0)+1;var r=n+"-"+je("5.2.1"+n+Ge[n]);return t?t+"-"+r:r}(t.displayName,t.parentComponentId):d,p=t.displayName,y=void 0===p?function(e){return Te(e)?"styled."+e:"Styled("+b$2(e)+")"}(e):p,g=t.displayName&&t.componentId?De(t.displayName)+"-"+t.componentId:t.componentId||h$1,_=o&&e.attrs?Array.prototype.concat(e.attrs,c).filter(Boolean):c,C=t.shouldForwardProp;o&&e.shouldForwardProp&&(C=t.shouldForwardProp?function(n,r){return e.shouldForwardProp(n,r)&&t.shouldForwardProp(n,r)}:e.shouldForwardProp);var A,I=new oe(n,g,o?e.componentStyle:void 0),P=I.isStatic&&0===c.length,O=function(e,t){return function(e,t,n,r){var o=e.attrs,i=e.componentStyle,a=e.defaultProps,c=e.foldedComponentIds,d=e.shouldForwardProp,h$1=e.styledComponentId,p=e.target;T$1(h$1);var m=function(e,t,n){void 0===e&&(e=w$2);var r=v$2({},t,{theme:e}),o={};return n.forEach((function(e){var t,n,s,i=e;for(t in E(i)&&(i=i(r)),i)r[t]=o[t]="className"===t?(n=o[t],s=i[t],n&&s?n+" "+s:n||s):i[t];})),[r,o]}(Pe(t,F(Be),a)||w$2,t,o),y=m[0],g=m[1],S=function(e,t,n,r){var o=pe(),s=fe(),i=t?e.generateAndInjectStyles(w$2,o,s):e.generateAndInjectStyles(n,o,s);return T$1(i),!t&&r&&r(i),i}(i,r,y,e.warnTooManyClasses),b=n,N=g.$as||t.$as||g.as||t.as||p,_=Te(N),C=g!==t?v$2({},t,{},g):t,A={};for(var I in C)"$"!==I[0]&&"as"!==I&&("forwardedAs"===I?A.as=C[I]:(d?d(I,index):!_||index(I))&&(A[I]=C[I]));return t.style&&g.style!==t.style&&(A.style=v$2({},t.style,{},g.style)),A.className=Array.prototype.concat(c,h$1,S!==h$1?S:null,t.className,g.className).filter(Boolean).join(" "),A.ref=b,h(N,A)}(A,e,t,P)};return O.displayName=y,(A=React.forwardRef(O)).attrs=_,A.componentStyle=I,A.displayName=y,A.shouldForwardProp=C,A.foldedComponentIds=o?Array.prototype.concat(e.foldedComponentIds,e.styledComponentId):S$2,A.styledComponentId=g,A.target=o?e.target:e,A.withComponent=function(e){var r=t.componentId,o=function(e,t){if(null==e)return {};var n,r,o={},s=Object.keys(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(t,["componentId"]),s=r&&r+"-"+(Te(e)?e:De(b$2(e)));return Fe(e,v$2({},o,{attrs:_,componentId:s}),n)},Object.defineProperty(A,"defaultProps",{get:function(){return this._foldedDefaultProps},set:function(t){this._foldedDefaultProps=o?Me({},e.defaultProps,t):t;}}),(Ie(y,g),A.warnTooManyClasses=function(e,t){var n={},r=!1;return function(o){if(!r&&(n[o]=!0,Object.keys(n).length>=200)){var s=t?' with the id of "'+t+'"':"";console.warn("Over 200 classes were generated for component "+e+s+".\nConsider using the attrs method, together with a style object for frequently changed styles.\nExample:\n  const Component = styled.div.attrs(props => ({\n    style: {\n      background: props.background,\n    },\n  }))`width: 100%;`\n\n  <Component />"),r=!0,n={};}}}(y,g)),A.toString=function(){return "."+A.styledComponentId},i&&hoistNonReactStatics_cjs(A,e,{attrs:!0,componentStyle:!0,displayName:!0,foldedComponentIds:!0,shouldForwardProp:!0,styledComponentId:!0,target:!0,withComponent:!0}),A}var Ye=function(e){return function e(t,r,o){if(void 0===o&&(o=w$2),!reactIs.isValidElementType(r))return D$1(1,String(r));var s=function(){return t(r,o,_e.apply(void 0,arguments))};return s.withConfig=function(n){return e(t,r,v$2({},o,{},n))},s.attrs=function(n){return e(t,r,v$2({},o,{attrs:Array.prototype.concat(o.attrs,n).filter(Boolean)}))},s}(Fe,e)};["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","big","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","keygen","label","legend","li","link","main","map","mark","marquee","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","small","source","span","strong","style","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr","circle","clipPath","defs","ellipse","foreignObject","g","image","line","linearGradient","marker","mask","path","pattern","polygon","polyline","radialGradient","rect","stop","svg","text","tspan"].forEach((function(e){Ye[e]=Ye(e);}));"undefined"!=typeof navigator&&"ReactNative"===navigator.product&&console.warn("It looks like you've imported 'styled-components' on React Native.\nPerhaps you're looking to import 'styled-components/native'?\nRead more about this at https://www.styled-components.com/docs/basics#react-native"),undefined;

	/*
	object-assign
	(c) Sindre Sorhus
	@license MIT
	*/
	/* eslint-disable no-unused-vars */
	var getOwnPropertySymbols$1 = Object.getOwnPropertySymbols;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			// Detect buggy property enumeration order in older V8 versions.

			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (err) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}

	var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (getOwnPropertySymbols$1) {
				symbols = getOwnPropertySymbols$1(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

	var ReactPropTypesSecret_1 = ReactPropTypesSecret;

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	var printWarning = function() {};

	{
	  var ReactPropTypesSecret$1 = ReactPropTypesSecret_1;
	  var loggedTypeFailures = {};
	  var has = Function.call.bind(Object.prototype.hasOwnProperty);

	  printWarning = function(text) {
	    var message = 'Warning: ' + text;
	    if (typeof console !== 'undefined') {
	      console.error(message);
	    }
	    try {
	      // --- Welcome to debugging React ---
	      // This error was thrown as a convenience so that you can use this stack
	      // to find the callsite that caused this warning to fire.
	      throw new Error(message);
	    } catch (x) {}
	  };
	}

	/**
	 * Assert that the values match with the type specs.
	 * Error messages are memorized and will only be shown once.
	 *
	 * @param {object} typeSpecs Map of name to a ReactPropType
	 * @param {object} values Runtime values that need to be type-checked
	 * @param {string} location e.g. "prop", "context", "child context"
	 * @param {string} componentName Name of the component for error messages.
	 * @param {?Function} getStack Returns the component stack.
	 * @private
	 */
	function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
	  {
	    for (var typeSpecName in typeSpecs) {
	      if (has(typeSpecs, typeSpecName)) {
	        var error;
	        // Prop type validation may throw. In case they do, we don't want to
	        // fail the render phase where it didn't fail before. So we log it.
	        // After these have been cleaned up, we'll let them throw.
	        try {
	          // This is intentionally an invariant that gets caught. It's the same
	          // behavior as without this statement except with a better message.
	          if (typeof typeSpecs[typeSpecName] !== 'function') {
	            var err = Error(
	              (componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' +
	              'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.'
	            );
	            err.name = 'Invariant Violation';
	            throw err;
	          }
	          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret$1);
	        } catch (ex) {
	          error = ex;
	        }
	        if (error && !(error instanceof Error)) {
	          printWarning(
	            (componentName || 'React class') + ': type specification of ' +
	            location + ' `' + typeSpecName + '` is invalid; the type checker ' +
	            'function must return `null` or an `Error` but returned a ' + typeof error + '. ' +
	            'You may have forgotten to pass an argument to the type checker ' +
	            'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +
	            'shape all require an argument).'
	          );
	        }
	        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
	          // Only monitor this failure once because there tends to be a lot of the
	          // same error.
	          loggedTypeFailures[error.message] = true;

	          var stack = getStack ? getStack() : '';

	          printWarning(
	            'Failed ' + location + ' type: ' + error.message + (stack != null ? stack : '')
	          );
	        }
	      }
	    }
	  }
	}

	/**
	 * Resets warning cache when testing.
	 *
	 * @private
	 */
	checkPropTypes.resetWarningCache = function() {
	  {
	    loggedTypeFailures = {};
	  }
	};

	var checkPropTypes_1 = checkPropTypes;

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */







	var has$1 = Function.call.bind(Object.prototype.hasOwnProperty);
	var printWarning$1 = function() {};

	{
	  printWarning$1 = function(text) {
	    var message = 'Warning: ' + text;
	    if (typeof console !== 'undefined') {
	      console.error(message);
	    }
	    try {
	      // --- Welcome to debugging React ---
	      // This error was thrown as a convenience so that you can use this stack
	      // to find the callsite that caused this warning to fire.
	      throw new Error(message);
	    } catch (x) {}
	  };
	}

	function emptyFunctionThatReturnsNull() {
	  return null;
	}

	var factoryWithTypeCheckers = function(isValidElement, throwOnDirectAccess) {
	  /* global Symbol */
	  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
	  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

	  /**
	   * Returns the iterator method function contained on the iterable object.
	   *
	   * Be sure to invoke the function with the iterable as context:
	   *
	   *     var iteratorFn = getIteratorFn(myIterable);
	   *     if (iteratorFn) {
	   *       var iterator = iteratorFn.call(myIterable);
	   *       ...
	   *     }
	   *
	   * @param {?object} maybeIterable
	   * @return {?function}
	   */
	  function getIteratorFn(maybeIterable) {
	    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
	    if (typeof iteratorFn === 'function') {
	      return iteratorFn;
	    }
	  }

	  /**
	   * Collection of methods that allow declaration and validation of props that are
	   * supplied to React components. Example usage:
	   *
	   *   var Props = require('ReactPropTypes');
	   *   var MyArticle = React.createClass({
	   *     propTypes: {
	   *       // An optional string prop named "description".
	   *       description: Props.string,
	   *
	   *       // A required enum prop named "category".
	   *       category: Props.oneOf(['News','Photos']).isRequired,
	   *
	   *       // A prop named "dialog" that requires an instance of Dialog.
	   *       dialog: Props.instanceOf(Dialog).isRequired
	   *     },
	   *     render: function() { ... }
	   *   });
	   *
	   * A more formal specification of how these methods are used:
	   *
	   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
	   *   decl := ReactPropTypes.{type}(.isRequired)?
	   *
	   * Each and every declaration produces a function with the same signature. This
	   * allows the creation of custom validation functions. For example:
	   *
	   *  var MyLink = React.createClass({
	   *    propTypes: {
	   *      // An optional string or URI prop named "href".
	   *      href: function(props, propName, componentName) {
	   *        var propValue = props[propName];
	   *        if (propValue != null && typeof propValue !== 'string' &&
	   *            !(propValue instanceof URI)) {
	   *          return new Error(
	   *            'Expected a string or an URI for ' + propName + ' in ' +
	   *            componentName
	   *          );
	   *        }
	   *      }
	   *    },
	   *    render: function() {...}
	   *  });
	   *
	   * @internal
	   */

	  var ANONYMOUS = '<<anonymous>>';

	  // Important!
	  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
	  var ReactPropTypes = {
	    array: createPrimitiveTypeChecker('array'),
	    bool: createPrimitiveTypeChecker('boolean'),
	    func: createPrimitiveTypeChecker('function'),
	    number: createPrimitiveTypeChecker('number'),
	    object: createPrimitiveTypeChecker('object'),
	    string: createPrimitiveTypeChecker('string'),
	    symbol: createPrimitiveTypeChecker('symbol'),

	    any: createAnyTypeChecker(),
	    arrayOf: createArrayOfTypeChecker,
	    element: createElementTypeChecker(),
	    elementType: createElementTypeTypeChecker(),
	    instanceOf: createInstanceTypeChecker,
	    node: createNodeChecker(),
	    objectOf: createObjectOfTypeChecker,
	    oneOf: createEnumTypeChecker,
	    oneOfType: createUnionTypeChecker,
	    shape: createShapeTypeChecker,
	    exact: createStrictShapeTypeChecker,
	  };

	  /**
	   * inlined Object.is polyfill to avoid requiring consumers ship their own
	   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
	   */
	  /*eslint-disable no-self-compare*/
	  function is(x, y) {
	    // SameValue algorithm
	    if (x === y) {
	      // Steps 1-5, 7-10
	      // Steps 6.b-6.e: +0 != -0
	      return x !== 0 || 1 / x === 1 / y;
	    } else {
	      // Step 6.a: NaN == NaN
	      return x !== x && y !== y;
	    }
	  }
	  /*eslint-enable no-self-compare*/

	  /**
	   * We use an Error-like object for backward compatibility as people may call
	   * PropTypes directly and inspect their output. However, we don't use real
	   * Errors anymore. We don't inspect their stack anyway, and creating them
	   * is prohibitively expensive if they are created too often, such as what
	   * happens in oneOfType() for any type before the one that matched.
	   */
	  function PropTypeError(message) {
	    this.message = message;
	    this.stack = '';
	  }
	  // Make `instanceof Error` still work for returned errors.
	  PropTypeError.prototype = Error.prototype;

	  function createChainableTypeChecker(validate) {
	    {
	      var manualPropTypeCallCache = {};
	      var manualPropTypeWarningCount = 0;
	    }
	    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
	      componentName = componentName || ANONYMOUS;
	      propFullName = propFullName || propName;

	      if (secret !== ReactPropTypesSecret_1) {
	        if (throwOnDirectAccess) {
	          // New behavior only for users of `prop-types` package
	          var err = new Error(
	            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
	            'Use `PropTypes.checkPropTypes()` to call them. ' +
	            'Read more at http://fb.me/use-check-prop-types'
	          );
	          err.name = 'Invariant Violation';
	          throw err;
	        } else if ( typeof console !== 'undefined') {
	          // Old behavior for people using React.PropTypes
	          var cacheKey = componentName + ':' + propName;
	          if (
	            !manualPropTypeCallCache[cacheKey] &&
	            // Avoid spamming the console because they are often not actionable except for lib authors
	            manualPropTypeWarningCount < 3
	          ) {
	            printWarning$1(
	              'You are manually calling a React.PropTypes validation ' +
	              'function for the `' + propFullName + '` prop on `' + componentName  + '`. This is deprecated ' +
	              'and will throw in the standalone `prop-types` package. ' +
	              'You may be seeing this warning due to a third-party PropTypes ' +
	              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.'
	            );
	            manualPropTypeCallCache[cacheKey] = true;
	            manualPropTypeWarningCount++;
	          }
	        }
	      }
	      if (props[propName] == null) {
	        if (isRequired) {
	          if (props[propName] === null) {
	            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
	          }
	          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
	        }
	        return null;
	      } else {
	        return validate(props, propName, componentName, location, propFullName);
	      }
	    }

	    var chainedCheckType = checkType.bind(null, false);
	    chainedCheckType.isRequired = checkType.bind(null, true);

	    return chainedCheckType;
	  }

	  function createPrimitiveTypeChecker(expectedType) {
	    function validate(props, propName, componentName, location, propFullName, secret) {
	      var propValue = props[propName];
	      var propType = getPropType(propValue);
	      if (propType !== expectedType) {
	        // `propValue` being instance of, say, date/regexp, pass the 'object'
	        // check, but we can offer a more precise error message here rather than
	        // 'of type `object`'.
	        var preciseType = getPreciseType(propValue);

	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createAnyTypeChecker() {
	    return createChainableTypeChecker(emptyFunctionThatReturnsNull);
	  }

	  function createArrayOfTypeChecker(typeChecker) {
	    function validate(props, propName, componentName, location, propFullName) {
	      if (typeof typeChecker !== 'function') {
	        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
	      }
	      var propValue = props[propName];
	      if (!Array.isArray(propValue)) {
	        var propType = getPropType(propValue);
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
	      }
	      for (var i = 0; i < propValue.length; i++) {
	        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret_1);
	        if (error instanceof Error) {
	          return error;
	        }
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createElementTypeChecker() {
	    function validate(props, propName, componentName, location, propFullName) {
	      var propValue = props[propName];
	      if (!isValidElement(propValue)) {
	        var propType = getPropType(propValue);
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createElementTypeTypeChecker() {
	    function validate(props, propName, componentName, location, propFullName) {
	      var propValue = props[propName];
	      if (!reactIs.isValidElementType(propValue)) {
	        var propType = getPropType(propValue);
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement type.'));
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createInstanceTypeChecker(expectedClass) {
	    function validate(props, propName, componentName, location, propFullName) {
	      if (!(props[propName] instanceof expectedClass)) {
	        var expectedClassName = expectedClass.name || ANONYMOUS;
	        var actualClassName = getClassName(props[propName]);
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createEnumTypeChecker(expectedValues) {
	    if (!Array.isArray(expectedValues)) {
	      {
	        if (arguments.length > 1) {
	          printWarning$1(
	            'Invalid arguments supplied to oneOf, expected an array, got ' + arguments.length + ' arguments. ' +
	            'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).'
	          );
	        } else {
	          printWarning$1('Invalid argument supplied to oneOf, expected an array.');
	        }
	      }
	      return emptyFunctionThatReturnsNull;
	    }

	    function validate(props, propName, componentName, location, propFullName) {
	      var propValue = props[propName];
	      for (var i = 0; i < expectedValues.length; i++) {
	        if (is(propValue, expectedValues[i])) {
	          return null;
	        }
	      }

	      var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
	        var type = getPreciseType(value);
	        if (type === 'symbol') {
	          return String(value);
	        }
	        return value;
	      });
	      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + String(propValue) + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createObjectOfTypeChecker(typeChecker) {
	    function validate(props, propName, componentName, location, propFullName) {
	      if (typeof typeChecker !== 'function') {
	        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
	      }
	      var propValue = props[propName];
	      var propType = getPropType(propValue);
	      if (propType !== 'object') {
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
	      }
	      for (var key in propValue) {
	        if (has$1(propValue, key)) {
	          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);
	          if (error instanceof Error) {
	            return error;
	          }
	        }
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createUnionTypeChecker(arrayOfTypeCheckers) {
	    if (!Array.isArray(arrayOfTypeCheckers)) {
	       printWarning$1('Invalid argument supplied to oneOfType, expected an instance of array.') ;
	      return emptyFunctionThatReturnsNull;
	    }

	    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
	      var checker = arrayOfTypeCheckers[i];
	      if (typeof checker !== 'function') {
	        printWarning$1(
	          'Invalid argument supplied to oneOfType. Expected an array of check functions, but ' +
	          'received ' + getPostfixForTypeWarning(checker) + ' at index ' + i + '.'
	        );
	        return emptyFunctionThatReturnsNull;
	      }
	    }

	    function validate(props, propName, componentName, location, propFullName) {
	      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
	        var checker = arrayOfTypeCheckers[i];
	        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret_1) == null) {
	          return null;
	        }
	      }

	      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createNodeChecker() {
	    function validate(props, propName, componentName, location, propFullName) {
	      if (!isNode(props[propName])) {
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createShapeTypeChecker(shapeTypes) {
	    function validate(props, propName, componentName, location, propFullName) {
	      var propValue = props[propName];
	      var propType = getPropType(propValue);
	      if (propType !== 'object') {
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
	      }
	      for (var key in shapeTypes) {
	        var checker = shapeTypes[key];
	        if (!checker) {
	          continue;
	        }
	        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);
	        if (error) {
	          return error;
	        }
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }

	  function createStrictShapeTypeChecker(shapeTypes) {
	    function validate(props, propName, componentName, location, propFullName) {
	      var propValue = props[propName];
	      var propType = getPropType(propValue);
	      if (propType !== 'object') {
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
	      }
	      // We need to check all keys in case some are required but missing from
	      // props.
	      var allKeys = objectAssign({}, props[propName], shapeTypes);
	      for (var key in allKeys) {
	        var checker = shapeTypes[key];
	        if (!checker) {
	          return new PropTypeError(
	            'Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' +
	            '\nBad object: ' + JSON.stringify(props[propName], null, '  ') +
	            '\nValid keys: ' +  JSON.stringify(Object.keys(shapeTypes), null, '  ')
	          );
	        }
	        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);
	        if (error) {
	          return error;
	        }
	      }
	      return null;
	    }

	    return createChainableTypeChecker(validate);
	  }

	  function isNode(propValue) {
	    switch (typeof propValue) {
	      case 'number':
	      case 'string':
	      case 'undefined':
	        return true;
	      case 'boolean':
	        return !propValue;
	      case 'object':
	        if (Array.isArray(propValue)) {
	          return propValue.every(isNode);
	        }
	        if (propValue === null || isValidElement(propValue)) {
	          return true;
	        }

	        var iteratorFn = getIteratorFn(propValue);
	        if (iteratorFn) {
	          var iterator = iteratorFn.call(propValue);
	          var step;
	          if (iteratorFn !== propValue.entries) {
	            while (!(step = iterator.next()).done) {
	              if (!isNode(step.value)) {
	                return false;
	              }
	            }
	          } else {
	            // Iterator will provide entry [k,v] tuples rather than values.
	            while (!(step = iterator.next()).done) {
	              var entry = step.value;
	              if (entry) {
	                if (!isNode(entry[1])) {
	                  return false;
	                }
	              }
	            }
	          }
	        } else {
	          return false;
	        }

	        return true;
	      default:
	        return false;
	    }
	  }

	  function isSymbol(propType, propValue) {
	    // Native Symbol.
	    if (propType === 'symbol') {
	      return true;
	    }

	    // falsy value can't be a Symbol
	    if (!propValue) {
	      return false;
	    }

	    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
	    if (propValue['@@toStringTag'] === 'Symbol') {
	      return true;
	    }

	    // Fallback for non-spec compliant Symbols which are polyfilled.
	    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
	      return true;
	    }

	    return false;
	  }

	  // Equivalent of `typeof` but with special handling for array and regexp.
	  function getPropType(propValue) {
	    var propType = typeof propValue;
	    if (Array.isArray(propValue)) {
	      return 'array';
	    }
	    if (propValue instanceof RegExp) {
	      // Old webkits (at least until Android 4.0) return 'function' rather than
	      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
	      // passes PropTypes.object.
	      return 'object';
	    }
	    if (isSymbol(propType, propValue)) {
	      return 'symbol';
	    }
	    return propType;
	  }

	  // This handles more types than `getPropType`. Only used for error messages.
	  // See `createPrimitiveTypeChecker`.
	  function getPreciseType(propValue) {
	    if (typeof propValue === 'undefined' || propValue === null) {
	      return '' + propValue;
	    }
	    var propType = getPropType(propValue);
	    if (propType === 'object') {
	      if (propValue instanceof Date) {
	        return 'date';
	      } else if (propValue instanceof RegExp) {
	        return 'regexp';
	      }
	    }
	    return propType;
	  }

	  // Returns a string that is postfixed to a warning about an invalid type.
	  // For example, "undefined" or "of type array"
	  function getPostfixForTypeWarning(value) {
	    var type = getPreciseType(value);
	    switch (type) {
	      case 'array':
	      case 'object':
	        return 'an ' + type;
	      case 'boolean':
	      case 'date':
	      case 'regexp':
	        return 'a ' + type;
	      default:
	        return type;
	    }
	  }

	  // Returns class name of the object, if any.
	  function getClassName(propValue) {
	    if (!propValue.constructor || !propValue.constructor.name) {
	      return ANONYMOUS;
	    }
	    return propValue.constructor.name;
	  }

	  ReactPropTypes.checkPropTypes = checkPropTypes_1;
	  ReactPropTypes.resetWarningCache = checkPropTypes_1.resetWarningCache;
	  ReactPropTypes.PropTypes = ReactPropTypes;

	  return ReactPropTypes;
	};

	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	var propTypes = createCommonjsModule(function (module) {
	{
	  var ReactIs = reactIs;

	  // By explicitly using `prop-types` you are opting into new development behavior.
	  // http://fb.me/prop-types-in-prod
	  var throwOnDirectAccess = true;
	  module.exports = factoryWithTypeCheckers(ReactIs.isElement, throwOnDirectAccess);
	}
	});

	var React$1 = /*@__PURE__*/getAugmentedNamespace(compat_module);

	function _interopDefault$1 (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }


	var React__default = _interopDefault$1(React$1);

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

	function _inheritsLoose(subClass, superClass) {
	  subClass.prototype = Object.create(superClass.prototype);
	  subClass.prototype.constructor = subClass;
	  subClass.__proto__ = superClass;
	}

	var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
	function withSideEffect(reducePropsToState, handleStateChangeOnClient, mapStateOnServer) {
	  if (typeof reducePropsToState !== 'function') {
	    throw new Error('Expected reducePropsToState to be a function.');
	  }

	  if (typeof handleStateChangeOnClient !== 'function') {
	    throw new Error('Expected handleStateChangeOnClient to be a function.');
	  }

	  if (typeof mapStateOnServer !== 'undefined' && typeof mapStateOnServer !== 'function') {
	    throw new Error('Expected mapStateOnServer to either be undefined or a function.');
	  }

	  function getDisplayName(WrappedComponent) {
	    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
	  }

	  return function wrap(WrappedComponent) {
	    if (typeof WrappedComponent !== 'function') {
	      throw new Error('Expected WrappedComponent to be a React component.');
	    }

	    var mountedInstances = [];
	    var state;

	    function emitChange() {
	      state = reducePropsToState(mountedInstances.map(function (instance) {
	        return instance.props;
	      }));

	      if (SideEffect.canUseDOM) {
	        handleStateChangeOnClient(state);
	      } else if (mapStateOnServer) {
	        state = mapStateOnServer(state);
	      }
	    }

	    var SideEffect = /*#__PURE__*/function (_PureComponent) {
	      _inheritsLoose(SideEffect, _PureComponent);

	      function SideEffect() {
	        return _PureComponent.apply(this, arguments) || this;
	      }

	      // Try to use displayName of wrapped component
	      // Expose canUseDOM so tests can monkeypatch it
	      SideEffect.peek = function peek() {
	        return state;
	      };

	      SideEffect.rewind = function rewind() {
	        if (SideEffect.canUseDOM) {
	          throw new Error('You may only call rewind() on the server. Call peek() to read the current state.');
	        }

	        var recordedState = state;
	        state = undefined;
	        mountedInstances = [];
	        return recordedState;
	      };

	      var _proto = SideEffect.prototype;

	      _proto.UNSAFE_componentWillMount = function UNSAFE_componentWillMount() {
	        mountedInstances.push(this);
	        emitChange();
	      };

	      _proto.componentDidUpdate = function componentDidUpdate() {
	        emitChange();
	      };

	      _proto.componentWillUnmount = function componentWillUnmount() {
	        var index = mountedInstances.indexOf(this);
	        mountedInstances.splice(index, 1);
	        emitChange();
	      };

	      _proto.render = function render() {
	        return /*#__PURE__*/React__default.createElement(WrappedComponent, this.props);
	      };

	      return SideEffect;
	    }(React$1.PureComponent);

	    _defineProperty(SideEffect, "displayName", "SideEffect(" + getDisplayName(WrappedComponent) + ")");

	    _defineProperty(SideEffect, "canUseDOM", canUseDOM);

	    return SideEffect;
	  };
	}

	var lib = withSideEffect;

	/* global Map:readonly, Set:readonly, ArrayBuffer:readonly */
	var hasElementType = typeof Element !== 'undefined';
	var hasMap = typeof Map === 'function';
	var hasSet = typeof Set === 'function';
	var hasArrayBuffer = typeof ArrayBuffer === 'function' && !!ArrayBuffer.isView;

	// Note: We **don't** need `envHasBigInt64Array` in fde es6/index.js

	function equal(a, b) {
	  // START: fast-deep-equal es6/index.js 3.1.1
	  if (a === b) return true;

	  if (a && b && typeof a == 'object' && typeof b == 'object') {
	    if (a.constructor !== b.constructor) return false;

	    var length, i, keys;
	    if (Array.isArray(a)) {
	      length = a.length;
	      if (length != b.length) return false;
	      for (i = length; i-- !== 0;)
	        if (!equal(a[i], b[i])) return false;
	      return true;
	    }

	    // START: Modifications:
	    // 1. Extra `has<Type> &&` helpers in initial condition allow es6 code
	    //    to co-exist with es5.
	    // 2. Replace `for of` with es5 compliant iteration using `for`.
	    //    Basically, take:
	    //
	    //    ```js
	    //    for (i of a.entries())
	    //      if (!b.has(i[0])) return false;
	    //    ```
	    //
	    //    ... and convert to:
	    //
	    //    ```js
	    //    it = a.entries();
	    //    while (!(i = it.next()).done)
	    //      if (!b.has(i.value[0])) return false;
	    //    ```
	    //
	    //    **Note**: `i` access switches to `i.value`.
	    var it;
	    if (hasMap && (a instanceof Map) && (b instanceof Map)) {
	      if (a.size !== b.size) return false;
	      it = a.entries();
	      while (!(i = it.next()).done)
	        if (!b.has(i.value[0])) return false;
	      it = a.entries();
	      while (!(i = it.next()).done)
	        if (!equal(i.value[1], b.get(i.value[0]))) return false;
	      return true;
	    }

	    if (hasSet && (a instanceof Set) && (b instanceof Set)) {
	      if (a.size !== b.size) return false;
	      it = a.entries();
	      while (!(i = it.next()).done)
	        if (!b.has(i.value[0])) return false;
	      return true;
	    }
	    // END: Modifications

	    if (hasArrayBuffer && ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
	      length = a.length;
	      if (length != b.length) return false;
	      for (i = length; i-- !== 0;)
	        if (a[i] !== b[i]) return false;
	      return true;
	    }

	    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
	    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
	    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

	    keys = Object.keys(a);
	    length = keys.length;
	    if (length !== Object.keys(b).length) return false;

	    for (i = length; i-- !== 0;)
	      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
	    // END: fast-deep-equal

	    // START: react-fast-compare
	    // custom handling for DOM elements
	    if (hasElementType && a instanceof Element) return false;

	    // custom handling for React/Preact
	    for (i = length; i-- !== 0;) {
	      if ((keys[i] === '_owner' || keys[i] === '__v' || keys[i] === '__o') && a.$$typeof) {
	        // React-specific: avoid traversing React elements' _owner
	        // Preact-specific: avoid traversing Preact elements' __v and __o
	        //    __v = $_original / $_vnode
	        //    __o = $_owner
	        // These properties contain circular references and are not needed when
	        // comparing the actual elements (and not their owners)
	        // .$$typeof and ._store on just reasonable markers of elements

	        continue;
	      }

	      // all other properties should be traversed as usual
	      if (!equal(a[keys[i]], b[keys[i]])) return false;
	    }
	    // END: react-fast-compare

	    // START: fast-deep-equal
	    return true;
	  }

	  return a !== a && b !== b;
	}
	// end fast-deep-equal

	var reactFastCompare = function isEqual(a, b) {
	  try {
	    return equal(a, b);
	  } catch (error) {
	    if (((error.message || '').match(/stack|recursion/i))) {
	      // warn on circular references, don't crash
	      // browsers give this different errors name and messages:
	      // chrome/safari: "RangeError", "Maximum call stack size exceeded"
	      // firefox: "InternalError", too much recursion"
	      // edge: "Error", "Out of stack space"
	      console.warn('react-fast-compare cannot handle circular refs');
	      return false;
	    }
	    // some other error. we should definitely know about these
	    throw error;
	  }
	};

	var ATTRIBUTE_NAMES = {
	    BODY: "bodyAttributes",
	    HTML: "htmlAttributes",
	    TITLE: "titleAttributes"
	};

	var TAG_NAMES = {
	    BASE: "base",
	    BODY: "body",
	    HEAD: "head",
	    HTML: "html",
	    LINK: "link",
	    META: "meta",
	    NOSCRIPT: "noscript",
	    SCRIPT: "script",
	    STYLE: "style",
	    TITLE: "title"
	};

	var VALID_TAG_NAMES = Object.keys(TAG_NAMES).map(function (name) {
	    return TAG_NAMES[name];
	});

	var TAG_PROPERTIES = {
	    CHARSET: "charset",
	    CSS_TEXT: "cssText",
	    HREF: "href",
	    HTTPEQUIV: "http-equiv",
	    INNER_HTML: "innerHTML",
	    ITEM_PROP: "itemprop",
	    NAME: "name",
	    PROPERTY: "property",
	    REL: "rel",
	    SRC: "src",
	    TARGET: "target"
	};

	var REACT_TAG_MAP = {
	    accesskey: "accessKey",
	    charset: "charSet",
	    class: "className",
	    contenteditable: "contentEditable",
	    contextmenu: "contextMenu",
	    "http-equiv": "httpEquiv",
	    itemprop: "itemProp",
	    tabindex: "tabIndex"
	};

	var HELMET_PROPS = {
	    DEFAULT_TITLE: "defaultTitle",
	    DEFER: "defer",
	    ENCODE_SPECIAL_CHARACTERS: "encodeSpecialCharacters",
	    ON_CHANGE_CLIENT_STATE: "onChangeClientState",
	    TITLE_TEMPLATE: "titleTemplate"
	};

	var HTML_TAG_MAP = Object.keys(REACT_TAG_MAP).reduce(function (obj, key) {
	    obj[REACT_TAG_MAP[key]] = key;
	    return obj;
	}, {});

	var SELF_CLOSING_TAGS = [TAG_NAMES.NOSCRIPT, TAG_NAMES.SCRIPT, TAG_NAMES.STYLE];

	var HELMET_ATTRIBUTE = "data-react-helmet";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	  return typeof obj;
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};

	var classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	var createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

	var _extends = Object.assign || function (target) {
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

	var inherits = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};

	var objectWithoutProperties = function (obj, keys) {
	  var target = {};

	  for (var i in obj) {
	    if (keys.indexOf(i) >= 0) continue;
	    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
	    target[i] = obj[i];
	  }

	  return target;
	};

	var possibleConstructorReturn = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && (typeof call === "object" || typeof call === "function") ? call : self;
	};

	var encodeSpecialCharacters = function encodeSpecialCharacters(str) {
	    var encode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

	    if (encode === false) {
	        return String(str);
	    }

	    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
	};

	var getTitleFromPropsList = function getTitleFromPropsList(propsList) {
	    var innermostTitle = getInnermostProperty(propsList, TAG_NAMES.TITLE);
	    var innermostTemplate = getInnermostProperty(propsList, HELMET_PROPS.TITLE_TEMPLATE);

	    if (innermostTemplate && innermostTitle) {
	        // use function arg to avoid need to escape $ characters
	        return innermostTemplate.replace(/%s/g, function () {
	            return Array.isArray(innermostTitle) ? innermostTitle.join("") : innermostTitle;
	        });
	    }

	    var innermostDefaultTitle = getInnermostProperty(propsList, HELMET_PROPS.DEFAULT_TITLE);

	    return innermostTitle || innermostDefaultTitle || undefined;
	};

	var getOnChangeClientState = function getOnChangeClientState(propsList) {
	    return getInnermostProperty(propsList, HELMET_PROPS.ON_CHANGE_CLIENT_STATE) || function () {};
	};

	var getAttributesFromPropsList = function getAttributesFromPropsList(tagType, propsList) {
	    return propsList.filter(function (props) {
	        return typeof props[tagType] !== "undefined";
	    }).map(function (props) {
	        return props[tagType];
	    }).reduce(function (tagAttrs, current) {
	        return _extends({}, tagAttrs, current);
	    }, {});
	};

	var getBaseTagFromPropsList = function getBaseTagFromPropsList(primaryAttributes, propsList) {
	    return propsList.filter(function (props) {
	        return typeof props[TAG_NAMES.BASE] !== "undefined";
	    }).map(function (props) {
	        return props[TAG_NAMES.BASE];
	    }).reverse().reduce(function (innermostBaseTag, tag) {
	        if (!innermostBaseTag.length) {
	            var keys = Object.keys(tag);

	            for (var i = 0; i < keys.length; i++) {
	                var attributeKey = keys[i];
	                var lowerCaseAttributeKey = attributeKey.toLowerCase();

	                if (primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 && tag[lowerCaseAttributeKey]) {
	                    return innermostBaseTag.concat(tag);
	                }
	            }
	        }

	        return innermostBaseTag;
	    }, []);
	};

	var getTagsFromPropsList = function getTagsFromPropsList(tagName, primaryAttributes, propsList) {
	    // Calculate list of tags, giving priority innermost component (end of the propslist)
	    var approvedSeenTags = {};

	    return propsList.filter(function (props) {
	        if (Array.isArray(props[tagName])) {
	            return true;
	        }
	        if (typeof props[tagName] !== "undefined") {
	            warn("Helmet: " + tagName + " should be of type \"Array\". Instead found type \"" + _typeof(props[tagName]) + "\"");
	        }
	        return false;
	    }).map(function (props) {
	        return props[tagName];
	    }).reverse().reduce(function (approvedTags, instanceTags) {
	        var instanceSeenTags = {};

	        instanceTags.filter(function (tag) {
	            var primaryAttributeKey = void 0;
	            var keys = Object.keys(tag);
	            for (var i = 0; i < keys.length; i++) {
	                var attributeKey = keys[i];
	                var lowerCaseAttributeKey = attributeKey.toLowerCase();

	                // Special rule with link tags, since rel and href are both primary tags, rel takes priority
	                if (primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 && !(primaryAttributeKey === TAG_PROPERTIES.REL && tag[primaryAttributeKey].toLowerCase() === "canonical") && !(lowerCaseAttributeKey === TAG_PROPERTIES.REL && tag[lowerCaseAttributeKey].toLowerCase() === "stylesheet")) {
	                    primaryAttributeKey = lowerCaseAttributeKey;
	                }
	                // Special case for innerHTML which doesn't work lowercased
	                if (primaryAttributes.indexOf(attributeKey) !== -1 && (attributeKey === TAG_PROPERTIES.INNER_HTML || attributeKey === TAG_PROPERTIES.CSS_TEXT || attributeKey === TAG_PROPERTIES.ITEM_PROP)) {
	                    primaryAttributeKey = attributeKey;
	                }
	            }

	            if (!primaryAttributeKey || !tag[primaryAttributeKey]) {
	                return false;
	            }

	            var value = tag[primaryAttributeKey].toLowerCase();

	            if (!approvedSeenTags[primaryAttributeKey]) {
	                approvedSeenTags[primaryAttributeKey] = {};
	            }

	            if (!instanceSeenTags[primaryAttributeKey]) {
	                instanceSeenTags[primaryAttributeKey] = {};
	            }

	            if (!approvedSeenTags[primaryAttributeKey][value]) {
	                instanceSeenTags[primaryAttributeKey][value] = true;
	                return true;
	            }

	            return false;
	        }).reverse().forEach(function (tag) {
	            return approvedTags.push(tag);
	        });

	        // Update seen tags with tags from this instance
	        var keys = Object.keys(instanceSeenTags);
	        for (var i = 0; i < keys.length; i++) {
	            var attributeKey = keys[i];
	            var tagUnion = objectAssign({}, approvedSeenTags[attributeKey], instanceSeenTags[attributeKey]);

	            approvedSeenTags[attributeKey] = tagUnion;
	        }

	        return approvedTags;
	    }, []).reverse();
	};

	var getInnermostProperty = function getInnermostProperty(propsList, property) {
	    for (var i = propsList.length - 1; i >= 0; i--) {
	        var props = propsList[i];

	        if (props.hasOwnProperty(property)) {
	            return props[property];
	        }
	    }

	    return null;
	};

	var reducePropsToState = function reducePropsToState(propsList) {
	    return {
	        baseTag: getBaseTagFromPropsList([TAG_PROPERTIES.HREF, TAG_PROPERTIES.TARGET], propsList),
	        bodyAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.BODY, propsList),
	        defer: getInnermostProperty(propsList, HELMET_PROPS.DEFER),
	        encode: getInnermostProperty(propsList, HELMET_PROPS.ENCODE_SPECIAL_CHARACTERS),
	        htmlAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.HTML, propsList),
	        linkTags: getTagsFromPropsList(TAG_NAMES.LINK, [TAG_PROPERTIES.REL, TAG_PROPERTIES.HREF], propsList),
	        metaTags: getTagsFromPropsList(TAG_NAMES.META, [TAG_PROPERTIES.NAME, TAG_PROPERTIES.CHARSET, TAG_PROPERTIES.HTTPEQUIV, TAG_PROPERTIES.PROPERTY, TAG_PROPERTIES.ITEM_PROP], propsList),
	        noscriptTags: getTagsFromPropsList(TAG_NAMES.NOSCRIPT, [TAG_PROPERTIES.INNER_HTML], propsList),
	        onChangeClientState: getOnChangeClientState(propsList),
	        scriptTags: getTagsFromPropsList(TAG_NAMES.SCRIPT, [TAG_PROPERTIES.SRC, TAG_PROPERTIES.INNER_HTML], propsList),
	        styleTags: getTagsFromPropsList(TAG_NAMES.STYLE, [TAG_PROPERTIES.CSS_TEXT], propsList),
	        title: getTitleFromPropsList(propsList),
	        titleAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.TITLE, propsList)
	    };
	};

	var rafPolyfill = function () {
	    var clock = Date.now();

	    return function (callback) {
	        var currentTime = Date.now();

	        if (currentTime - clock > 16) {
	            clock = currentTime;
	            callback(currentTime);
	        } else {
	            setTimeout(function () {
	                rafPolyfill(callback);
	            }, 0);
	        }
	    };
	}();

	var cafPolyfill = function cafPolyfill(id) {
	    return clearTimeout(id);
	};

	var requestAnimationFrame$1 = typeof window !== "undefined" ? window.requestAnimationFrame && window.requestAnimationFrame.bind(window) || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || rafPolyfill : global.requestAnimationFrame || rafPolyfill;

	var cancelAnimationFrame$1 = typeof window !== "undefined" ? window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || cafPolyfill : global.cancelAnimationFrame || cafPolyfill;

	var warn = function warn(msg) {
	    return console && typeof console.warn === "function" && console.warn(msg);
	};

	var _helmetCallback = null;

	var handleClientStateChange = function handleClientStateChange(newState) {
	    if (_helmetCallback) {
	        cancelAnimationFrame$1(_helmetCallback);
	    }

	    if (newState.defer) {
	        _helmetCallback = requestAnimationFrame$1(function () {
	            commitTagChanges(newState, function () {
	                _helmetCallback = null;
	            });
	        });
	    } else {
	        commitTagChanges(newState);
	        _helmetCallback = null;
	    }
	};

	var commitTagChanges = function commitTagChanges(newState, cb) {
	    var baseTag = newState.baseTag,
	        bodyAttributes = newState.bodyAttributes,
	        htmlAttributes = newState.htmlAttributes,
	        linkTags = newState.linkTags,
	        metaTags = newState.metaTags,
	        noscriptTags = newState.noscriptTags,
	        onChangeClientState = newState.onChangeClientState,
	        scriptTags = newState.scriptTags,
	        styleTags = newState.styleTags,
	        title = newState.title,
	        titleAttributes = newState.titleAttributes;

	    updateAttributes(TAG_NAMES.BODY, bodyAttributes);
	    updateAttributes(TAG_NAMES.HTML, htmlAttributes);

	    updateTitle(title, titleAttributes);

	    var tagUpdates = {
	        baseTag: updateTags(TAG_NAMES.BASE, baseTag),
	        linkTags: updateTags(TAG_NAMES.LINK, linkTags),
	        metaTags: updateTags(TAG_NAMES.META, metaTags),
	        noscriptTags: updateTags(TAG_NAMES.NOSCRIPT, noscriptTags),
	        scriptTags: updateTags(TAG_NAMES.SCRIPT, scriptTags),
	        styleTags: updateTags(TAG_NAMES.STYLE, styleTags)
	    };

	    var addedTags = {};
	    var removedTags = {};

	    Object.keys(tagUpdates).forEach(function (tagType) {
	        var _tagUpdates$tagType = tagUpdates[tagType],
	            newTags = _tagUpdates$tagType.newTags,
	            oldTags = _tagUpdates$tagType.oldTags;


	        if (newTags.length) {
	            addedTags[tagType] = newTags;
	        }
	        if (oldTags.length) {
	            removedTags[tagType] = tagUpdates[tagType].oldTags;
	        }
	    });

	    cb && cb();

	    onChangeClientState(newState, addedTags, removedTags);
	};

	var flattenArray = function flattenArray(possibleArray) {
	    return Array.isArray(possibleArray) ? possibleArray.join("") : possibleArray;
	};

	var updateTitle = function updateTitle(title, attributes) {
	    if (typeof title !== "undefined" && document.title !== title) {
	        document.title = flattenArray(title);
	    }

	    updateAttributes(TAG_NAMES.TITLE, attributes);
	};

	var updateAttributes = function updateAttributes(tagName, attributes) {
	    var elementTag = document.getElementsByTagName(tagName)[0];

	    if (!elementTag) {
	        return;
	    }

	    var helmetAttributeString = elementTag.getAttribute(HELMET_ATTRIBUTE);
	    var helmetAttributes = helmetAttributeString ? helmetAttributeString.split(",") : [];
	    var attributesToRemove = [].concat(helmetAttributes);
	    var attributeKeys = Object.keys(attributes);

	    for (var i = 0; i < attributeKeys.length; i++) {
	        var attribute = attributeKeys[i];
	        var value = attributes[attribute] || "";

	        if (elementTag.getAttribute(attribute) !== value) {
	            elementTag.setAttribute(attribute, value);
	        }

	        if (helmetAttributes.indexOf(attribute) === -1) {
	            helmetAttributes.push(attribute);
	        }

	        var indexToSave = attributesToRemove.indexOf(attribute);
	        if (indexToSave !== -1) {
	            attributesToRemove.splice(indexToSave, 1);
	        }
	    }

	    for (var _i = attributesToRemove.length - 1; _i >= 0; _i--) {
	        elementTag.removeAttribute(attributesToRemove[_i]);
	    }

	    if (helmetAttributes.length === attributesToRemove.length) {
	        elementTag.removeAttribute(HELMET_ATTRIBUTE);
	    } else if (elementTag.getAttribute(HELMET_ATTRIBUTE) !== attributeKeys.join(",")) {
	        elementTag.setAttribute(HELMET_ATTRIBUTE, attributeKeys.join(","));
	    }
	};

	var updateTags = function updateTags(type, tags) {
	    var headElement = document.head || document.querySelector(TAG_NAMES.HEAD);
	    var tagNodes = headElement.querySelectorAll(type + "[" + HELMET_ATTRIBUTE + "]");
	    var oldTags = Array.prototype.slice.call(tagNodes);
	    var newTags = [];
	    var indexToDelete = void 0;

	    if (tags && tags.length) {
	        tags.forEach(function (tag) {
	            var newElement = document.createElement(type);

	            for (var attribute in tag) {
	                if (tag.hasOwnProperty(attribute)) {
	                    if (attribute === TAG_PROPERTIES.INNER_HTML) {
	                        newElement.innerHTML = tag.innerHTML;
	                    } else if (attribute === TAG_PROPERTIES.CSS_TEXT) {
	                        if (newElement.styleSheet) {
	                            newElement.styleSheet.cssText = tag.cssText;
	                        } else {
	                            newElement.appendChild(document.createTextNode(tag.cssText));
	                        }
	                    } else {
	                        var value = typeof tag[attribute] === "undefined" ? "" : tag[attribute];
	                        newElement.setAttribute(attribute, value);
	                    }
	                }
	            }

	            newElement.setAttribute(HELMET_ATTRIBUTE, "true");

	            // Remove a duplicate tag from domTagstoRemove, so it isn't cleared.
	            if (oldTags.some(function (existingTag, index) {
	                indexToDelete = index;
	                return newElement.isEqualNode(existingTag);
	            })) {
	                oldTags.splice(indexToDelete, 1);
	            } else {
	                newTags.push(newElement);
	            }
	        });
	    }

	    oldTags.forEach(function (tag) {
	        return tag.parentNode.removeChild(tag);
	    });
	    newTags.forEach(function (tag) {
	        return headElement.appendChild(tag);
	    });

	    return {
	        oldTags: oldTags,
	        newTags: newTags
	    };
	};

	var generateElementAttributesAsString = function generateElementAttributesAsString(attributes) {
	    return Object.keys(attributes).reduce(function (str, key) {
	        var attr = typeof attributes[key] !== "undefined" ? key + "=\"" + attributes[key] + "\"" : "" + key;
	        return str ? str + " " + attr : attr;
	    }, "");
	};

	var generateTitleAsString = function generateTitleAsString(type, title, attributes, encode) {
	    var attributeString = generateElementAttributesAsString(attributes);
	    var flattenedTitle = flattenArray(title);
	    return attributeString ? "<" + type + " " + HELMET_ATTRIBUTE + "=\"true\" " + attributeString + ">" + encodeSpecialCharacters(flattenedTitle, encode) + "</" + type + ">" : "<" + type + " " + HELMET_ATTRIBUTE + "=\"true\">" + encodeSpecialCharacters(flattenedTitle, encode) + "</" + type + ">";
	};

	var generateTagsAsString = function generateTagsAsString(type, tags, encode) {
	    return tags.reduce(function (str, tag) {
	        var attributeHtml = Object.keys(tag).filter(function (attribute) {
	            return !(attribute === TAG_PROPERTIES.INNER_HTML || attribute === TAG_PROPERTIES.CSS_TEXT);
	        }).reduce(function (string, attribute) {
	            var attr = typeof tag[attribute] === "undefined" ? attribute : attribute + "=\"" + encodeSpecialCharacters(tag[attribute], encode) + "\"";
	            return string ? string + " " + attr : attr;
	        }, "");

	        var tagContent = tag.innerHTML || tag.cssText || "";

	        var isSelfClosing = SELF_CLOSING_TAGS.indexOf(type) === -1;

	        return str + "<" + type + " " + HELMET_ATTRIBUTE + "=\"true\" " + attributeHtml + (isSelfClosing ? "/>" : ">" + tagContent + "</" + type + ">");
	    }, "");
	};

	var convertElementAttributestoReactProps = function convertElementAttributestoReactProps(attributes) {
	    var initProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    return Object.keys(attributes).reduce(function (obj, key) {
	        obj[REACT_TAG_MAP[key] || key] = attributes[key];
	        return obj;
	    }, initProps);
	};

	var convertReactPropstoHtmlAttributes = function convertReactPropstoHtmlAttributes(props) {
	    var initAttributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    return Object.keys(props).reduce(function (obj, key) {
	        obj[HTML_TAG_MAP[key] || key] = props[key];
	        return obj;
	    }, initAttributes);
	};

	var generateTitleAsReactComponent = function generateTitleAsReactComponent(type, title, attributes) {
	    var _initProps;

	    // assigning into an array to define toString function on it
	    var initProps = (_initProps = {
	        key: title
	    }, _initProps[HELMET_ATTRIBUTE] = true, _initProps);
	    var props = convertElementAttributestoReactProps(attributes, initProps);

	    return [React.createElement(TAG_NAMES.TITLE, props, title)];
	};

	var generateTagsAsReactComponent = function generateTagsAsReactComponent(type, tags) {
	    return tags.map(function (tag, i) {
	        var _mappedTag;

	        var mappedTag = (_mappedTag = {
	            key: i
	        }, _mappedTag[HELMET_ATTRIBUTE] = true, _mappedTag);

	        Object.keys(tag).forEach(function (attribute) {
	            var mappedAttribute = REACT_TAG_MAP[attribute] || attribute;

	            if (mappedAttribute === TAG_PROPERTIES.INNER_HTML || mappedAttribute === TAG_PROPERTIES.CSS_TEXT) {
	                var content = tag.innerHTML || tag.cssText;
	                mappedTag.dangerouslySetInnerHTML = { __html: content };
	            } else {
	                mappedTag[mappedAttribute] = tag[attribute];
	            }
	        });

	        return React.createElement(type, mappedTag);
	    });
	};

	var getMethodsForTag = function getMethodsForTag(type, tags, encode) {
	    switch (type) {
	        case TAG_NAMES.TITLE:
	            return {
	                toComponent: function toComponent() {
	                    return generateTitleAsReactComponent(type, tags.title, tags.titleAttributes);
	                },
	                toString: function toString() {
	                    return generateTitleAsString(type, tags.title, tags.titleAttributes, encode);
	                }
	            };
	        case ATTRIBUTE_NAMES.BODY:
	        case ATTRIBUTE_NAMES.HTML:
	            return {
	                toComponent: function toComponent() {
	                    return convertElementAttributestoReactProps(tags);
	                },
	                toString: function toString() {
	                    return generateElementAttributesAsString(tags);
	                }
	            };
	        default:
	            return {
	                toComponent: function toComponent() {
	                    return generateTagsAsReactComponent(type, tags);
	                },
	                toString: function toString() {
	                    return generateTagsAsString(type, tags, encode);
	                }
	            };
	    }
	};

	var mapStateOnServer = function mapStateOnServer(_ref) {
	    var baseTag = _ref.baseTag,
	        bodyAttributes = _ref.bodyAttributes,
	        encode = _ref.encode,
	        htmlAttributes = _ref.htmlAttributes,
	        linkTags = _ref.linkTags,
	        metaTags = _ref.metaTags,
	        noscriptTags = _ref.noscriptTags,
	        scriptTags = _ref.scriptTags,
	        styleTags = _ref.styleTags,
	        _ref$title = _ref.title,
	        title = _ref$title === undefined ? "" : _ref$title,
	        titleAttributes = _ref.titleAttributes;
	    return {
	        base: getMethodsForTag(TAG_NAMES.BASE, baseTag, encode),
	        bodyAttributes: getMethodsForTag(ATTRIBUTE_NAMES.BODY, bodyAttributes, encode),
	        htmlAttributes: getMethodsForTag(ATTRIBUTE_NAMES.HTML, htmlAttributes, encode),
	        link: getMethodsForTag(TAG_NAMES.LINK, linkTags, encode),
	        meta: getMethodsForTag(TAG_NAMES.META, metaTags, encode),
	        noscript: getMethodsForTag(TAG_NAMES.NOSCRIPT, noscriptTags, encode),
	        script: getMethodsForTag(TAG_NAMES.SCRIPT, scriptTags, encode),
	        style: getMethodsForTag(TAG_NAMES.STYLE, styleTags, encode),
	        title: getMethodsForTag(TAG_NAMES.TITLE, { title: title, titleAttributes: titleAttributes }, encode)
	    };
	};

	var Helmet = function Helmet(Component) {
	    var _class, _temp;

	    return _temp = _class = function (_React$Component) {
	        inherits(HelmetWrapper, _React$Component);

	        function HelmetWrapper() {
	            classCallCheck(this, HelmetWrapper);
	            return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
	        }

	        HelmetWrapper.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
	            return !reactFastCompare(this.props, nextProps);
	        };

	        HelmetWrapper.prototype.mapNestedChildrenToProps = function mapNestedChildrenToProps(child, nestedChildren) {
	            if (!nestedChildren) {
	                return null;
	            }

	            switch (child.type) {
	                case TAG_NAMES.SCRIPT:
	                case TAG_NAMES.NOSCRIPT:
	                    return {
	                        innerHTML: nestedChildren
	                    };

	                case TAG_NAMES.STYLE:
	                    return {
	                        cssText: nestedChildren
	                    };
	            }

	            throw new Error("<" + child.type + " /> elements are self-closing and can not contain children. Refer to our API for more information.");
	        };

	        HelmetWrapper.prototype.flattenArrayTypeChildren = function flattenArrayTypeChildren(_ref) {
	            var _babelHelpers$extends;

	            var child = _ref.child,
	                arrayTypeChildren = _ref.arrayTypeChildren,
	                newChildProps = _ref.newChildProps,
	                nestedChildren = _ref.nestedChildren;

	            return _extends({}, arrayTypeChildren, (_babelHelpers$extends = {}, _babelHelpers$extends[child.type] = [].concat(arrayTypeChildren[child.type] || [], [_extends({}, newChildProps, this.mapNestedChildrenToProps(child, nestedChildren))]), _babelHelpers$extends));
	        };

	        HelmetWrapper.prototype.mapObjectTypeChildren = function mapObjectTypeChildren(_ref2) {
	            var _babelHelpers$extends2, _babelHelpers$extends3;

	            var child = _ref2.child,
	                newProps = _ref2.newProps,
	                newChildProps = _ref2.newChildProps,
	                nestedChildren = _ref2.nestedChildren;

	            switch (child.type) {
	                case TAG_NAMES.TITLE:
	                    return _extends({}, newProps, (_babelHelpers$extends2 = {}, _babelHelpers$extends2[child.type] = nestedChildren, _babelHelpers$extends2.titleAttributes = _extends({}, newChildProps), _babelHelpers$extends2));

	                case TAG_NAMES.BODY:
	                    return _extends({}, newProps, {
	                        bodyAttributes: _extends({}, newChildProps)
	                    });

	                case TAG_NAMES.HTML:
	                    return _extends({}, newProps, {
	                        htmlAttributes: _extends({}, newChildProps)
	                    });
	            }

	            return _extends({}, newProps, (_babelHelpers$extends3 = {}, _babelHelpers$extends3[child.type] = _extends({}, newChildProps), _babelHelpers$extends3));
	        };

	        HelmetWrapper.prototype.mapArrayTypeChildrenToProps = function mapArrayTypeChildrenToProps(arrayTypeChildren, newProps) {
	            var newFlattenedProps = _extends({}, newProps);

	            Object.keys(arrayTypeChildren).forEach(function (arrayChildName) {
	                var _babelHelpers$extends4;

	                newFlattenedProps = _extends({}, newFlattenedProps, (_babelHelpers$extends4 = {}, _babelHelpers$extends4[arrayChildName] = arrayTypeChildren[arrayChildName], _babelHelpers$extends4));
	            });

	            return newFlattenedProps;
	        };

	        HelmetWrapper.prototype.warnOnInvalidChildren = function warnOnInvalidChildren(child, nestedChildren) {
	            {
	                if (!VALID_TAG_NAMES.some(function (name) {
	                    return child.type === name;
	                })) {
	                    if (typeof child.type === "function") {
	                        return warn("You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information.");
	                    }

	                    return warn("Only elements types " + VALID_TAG_NAMES.join(", ") + " are allowed. Helmet does not support rendering <" + child.type + "> elements. Refer to our API for more information.");
	                }

	                if (nestedChildren && typeof nestedChildren !== "string" && (!Array.isArray(nestedChildren) || nestedChildren.some(function (nestedChild) {
	                    return typeof nestedChild !== "string";
	                }))) {
	                    throw new Error("Helmet expects a string as a child of <" + child.type + ">. Did you forget to wrap your children in braces? ( <" + child.type + ">{``}</" + child.type + "> ) Refer to our API for more information.");
	                }
	            }

	            return true;
	        };

	        HelmetWrapper.prototype.mapChildrenToProps = function mapChildrenToProps(children, newProps) {
	            var _this2 = this;

	            var arrayTypeChildren = {};

	            React.Children.forEach(children, function (child) {
	                if (!child || !child.props) {
	                    return;
	                }

	                var _child$props = child.props,
	                    nestedChildren = _child$props.children,
	                    childProps = objectWithoutProperties(_child$props, ["children"]);

	                var newChildProps = convertReactPropstoHtmlAttributes(childProps);

	                _this2.warnOnInvalidChildren(child, nestedChildren);

	                switch (child.type) {
	                    case TAG_NAMES.LINK:
	                    case TAG_NAMES.META:
	                    case TAG_NAMES.NOSCRIPT:
	                    case TAG_NAMES.SCRIPT:
	                    case TAG_NAMES.STYLE:
	                        arrayTypeChildren = _this2.flattenArrayTypeChildren({
	                            child: child,
	                            arrayTypeChildren: arrayTypeChildren,
	                            newChildProps: newChildProps,
	                            nestedChildren: nestedChildren
	                        });
	                        break;

	                    default:
	                        newProps = _this2.mapObjectTypeChildren({
	                            child: child,
	                            newProps: newProps,
	                            newChildProps: newChildProps,
	                            nestedChildren: nestedChildren
	                        });
	                        break;
	                }
	            });

	            newProps = this.mapArrayTypeChildrenToProps(arrayTypeChildren, newProps);
	            return newProps;
	        };

	        HelmetWrapper.prototype.render = function render() {
	            var _props = this.props,
	                children = _props.children,
	                props = objectWithoutProperties(_props, ["children"]);

	            var newProps = _extends({}, props);

	            if (children) {
	                newProps = this.mapChildrenToProps(children, newProps);
	            }

	            return React.createElement(Component, newProps);
	        };

	        createClass(HelmetWrapper, null, [{
	            key: "canUseDOM",


	            // Component.peek comes from react-side-effect:
	            // For testing, you may use a static peek() method available on the returned component.
	            // It lets you get the current state without resetting the mounted instance stack.
	            // Don’t use it for anything other than testing.

	            /**
	             * @param {Object} base: {"target": "_blank", "href": "http://mysite.com/"}
	             * @param {Object} bodyAttributes: {"className": "root"}
	             * @param {String} defaultTitle: "Default Title"
	             * @param {Boolean} defer: true
	             * @param {Boolean} encodeSpecialCharacters: true
	             * @param {Object} htmlAttributes: {"lang": "en", "amp": undefined}
	             * @param {Array} link: [{"rel": "canonical", "href": "http://mysite.com/example"}]
	             * @param {Array} meta: [{"name": "description", "content": "Test description"}]
	             * @param {Array} noscript: [{"innerHTML": "<img src='http://mysite.com/js/test.js'"}]
	             * @param {Function} onChangeClientState: "(newState) => console.log(newState)"
	             * @param {Array} script: [{"type": "text/javascript", "src": "http://mysite.com/js/test.js"}]
	             * @param {Array} style: [{"type": "text/css", "cssText": "div { display: block; color: blue; }"}]
	             * @param {String} title: "Title"
	             * @param {Object} titleAttributes: {"itemprop": "name"}
	             * @param {String} titleTemplate: "MySite.com - %s"
	             */
	            set: function set$$1(canUseDOM) {
	                Component.canUseDOM = canUseDOM;
	            }
	        }]);
	        return HelmetWrapper;
	    }(React.Component), _class.propTypes = {
	        base: propTypes.object,
	        bodyAttributes: propTypes.object,
	        children: propTypes.oneOfType([propTypes.arrayOf(propTypes.node), propTypes.node]),
	        defaultTitle: propTypes.string,
	        defer: propTypes.bool,
	        encodeSpecialCharacters: propTypes.bool,
	        htmlAttributes: propTypes.object,
	        link: propTypes.arrayOf(propTypes.object),
	        meta: propTypes.arrayOf(propTypes.object),
	        noscript: propTypes.arrayOf(propTypes.object),
	        onChangeClientState: propTypes.func,
	        script: propTypes.arrayOf(propTypes.object),
	        style: propTypes.arrayOf(propTypes.object),
	        title: propTypes.string,
	        titleAttributes: propTypes.object,
	        titleTemplate: propTypes.string
	    }, _class.defaultProps = {
	        defer: true,
	        encodeSpecialCharacters: true
	    }, _class.peek = Component.peek, _class.rewind = function () {
	        var mappedState = Component.rewind();
	        if (!mappedState) {
	            // provide fallback if mappedState is undefined
	            mappedState = mapStateOnServer({
	                baseTag: [],
	                bodyAttributes: {},
	                encodeSpecialCharacters: true,
	                htmlAttributes: {},
	                linkTags: [],
	                metaTags: [],
	                noscriptTags: [],
	                scriptTags: [],
	                styleTags: [],
	                title: "",
	                titleAttributes: {}
	            });
	        }

	        return mappedState;
	    }, _temp;
	};

	var NullComponent = function NullComponent() {
	    return null;
	};

	var HelmetSideEffects = lib(reducePropsToState, handleClientStateChange, mapStateOnServer)(NullComponent);

	var HelmetExport = Helmet(HelmetSideEffects);
	HelmetExport.renderStatic = HelmetExport.rewind;

	function PlaceOrderButtonTitle(props) {
	    switch (props.paymentType) {
	        case exports.PaymentType.CREDITCARD:
	            return h(CreditCardPlaceOrderButtonTitle, __assign({}, props));
	        case exports.PaymentType.DEBITCARD:
	            return h(DebitCardPlaceOrderButtonTitle, __assign({}, props));
	        case undefined:
	            return h(UndefinedPlaceOrderButtonTitle, __assign({}, props));
	        default:
	            throw new Error("Payment type " + props.paymentType + " not implemented");
	    }
	}
	function CreditCardPlaceOrderButtonTitle(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h("span", null, "Pagar com cart\u00E3o de cr\u00E9dito");
	        default:
	            return h("span", null, "Pagar con tarjeta de cr\u00E9dito");
	    }
	}
	function DebitCardPlaceOrderButtonTitle(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h("span", null, "Pagar com cart\u00E3o de d\u00E9bito");
	        default:
	            return h("span", null, "Pagar con tarjeta de d\u00E9bito");
	    }
	}
	function UndefinedPlaceOrderButtonTitle(_a) {
	    var country = _a.country;
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h("span", null, "Selecione um m\u00E9todo de pagamento");
	        default:
	            return h("span", null, "Seleccione una forma de pago");
	    }
	}

	var baseStyle = _e(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  margin: 0;\n  padding: 0;\n  font-family: inherit;\n  font-size: inherit;\n  font-weight: inherit;\n  box-sizing: border-box;\n"], ["\n  margin: 0;\n  padding: 0;\n  font-family: inherit;\n  font-size: inherit;\n  font-weight: inherit;\n  box-sizing: border-box;\n"])));
	var templateObject_1;

	function getSvgImageUrl(name) {
	    return "https://ebanx-js.ebanx.com/v" + "1.35.0" + "/dist/assets/images/" + name + ".svg";
	}

	var Button = Ye.button(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  ", ";\n  background-color: ", ";\n  border: 2px solid ", ";\n  border-radius: 5px;\n  color: ", ";\n  cursor: pointer;\n  font-family: ", ";\n  font-size: 14px;\n  font-weight: 600;\n  height: 48px;\n  letter-spacing: 0.75px;\n  padding: 12px 32px;\n  position: relative;\n  &:disabled {\n    opacity: 0.5;\n  }\n  &:hover {\n    background-color: ", ";\n  }\n  display: ", ";\n  width: ", ";\n  ", "\n"], ["\n  ", ";\n  background-color: ", ";\n  border: 2px solid ", ";\n  border-radius: 5px;\n  color: ", ";\n  cursor: pointer;\n  font-family: ", ";\n  font-size: 14px;\n  font-weight: 600;\n  height: 48px;\n  letter-spacing: 0.75px;\n  padding: 12px 32px;\n  position: relative;\n  &:disabled {\n    opacity: 0.5;\n  }\n  &:hover {\n    background-color: ", ";\n  }\n  display: ", ";\n  width: ", ";\n  ",
	    "\n"])), baseStyle, function (props) { return getBackgroundColor(props); }, function (props) { return getBorderColor(props); }, function (props) { return getColor(props); }, function (props) { return props.theme.fontFamily.sansSerif; }, function (props) { return getHoverBackgroundColor(props); }, function (props) { return props.block ? "block" : "inline-block"; }, function (props) { return props.block ? "100%" : "auto"; }, function (props) { return props.busy && _e(templateObject_1$1 || (templateObject_1$1 = __makeTemplateObject(["\n    color: transparent;\n    &::after {\n      content: \"\";\n      background-image: url(", ");\n      background-size: 20px;\n      position: absolute;\n      width: 20px;\n      height: 20px;\n      top: 50%;\n      margin-top: -10px;\n      left: 50%;\n      margin-left: -10px;\n    }\n  "], ["\n    color: transparent;\n    &::after {\n      content: \"\";\n      background-image: url(", ");\n      background-size: 20px;\n      position: absolute;\n      width: 20px;\n      height: 20px;\n      top: 50%;\n      margin-top: -10px;\n      left: 50%;\n      margin-left: -10px;\n    }\n  "])), getSpinnerUrl(props)); });
	function getBackgroundColor(props) {
	    switch (props.mode) {
	        case "lined":
	        case "blank":
	            return "white";
	        default:
	            return props.theme.primaryColor;
	    }
	}
	function getBorderColor(props) {
	    switch (props.mode) {
	        case "blank":
	            return "white";
	        case "lined":
	        default:
	            return props.theme.primaryColor;
	    }
	}
	function getColor(props) {
	    switch (props.mode) {
	        case "lined":
	        case "blank":
	            return props.theme.primaryColor;
	        default:
	            return "white";
	    }
	}
	function getHoverBackgroundColor(props) {
	    switch (props.mode) {
	        case "lined":
	        case "blank":
	            return "#f4fafd";
	        default:
	            return props.theme.primaryColor;
	    }
	}
	function getSpinnerUrl(props) {
	    switch (props.mode) {
	        case "lined":
	        case "blank":
	            return getSvgImageUrl("spinner-blue");
	        default:
	            return getSvgImageUrl("spinner-white");
	    }
	}
	var templateObject_1$1, templateObject_2;

	var defaultTheme = {
	    fontFamily: {
	        sansSerif: "'Open Sans', sans-serif;",
	        display: "Gilroy, 'Open Sans', sans-serif",
	    },
	    primaryColor: "#2397D4",
	};
	function buildTheme(options) {
	    var _a = options.primaryColor, primaryColor = _a === void 0 ? defaultTheme.primaryColor : _a;
	    return __assign(__assign({}, defaultTheme), { primaryColor: primaryColor });
	}

	var resizeObservers = [];

	var hasActiveObservations = function () {
	    return resizeObservers.some(function (ro) { return ro.activeTargets.length > 0; });
	};

	var hasSkippedObservations = function () {
	    return resizeObservers.some(function (ro) { return ro.skippedTargets.length > 0; });
	};

	var msg = 'ResizeObserver loop completed with undelivered notifications.';
	var deliverResizeLoopError = function () {
	    var event;
	    if (typeof ErrorEvent === 'function') {
	        event = new ErrorEvent('error', {
	            message: msg
	        });
	    }
	    else {
	        event = document.createEvent('Event');
	        event.initEvent('error', false, false);
	        event.message = msg;
	    }
	    window.dispatchEvent(event);
	};

	var ResizeObserverBoxOptions;
	(function (ResizeObserverBoxOptions) {
	    ResizeObserverBoxOptions["BORDER_BOX"] = "border-box";
	    ResizeObserverBoxOptions["CONTENT_BOX"] = "content-box";
	    ResizeObserverBoxOptions["DEVICE_PIXEL_CONTENT_BOX"] = "device-pixel-content-box";
	})(ResizeObserverBoxOptions || (ResizeObserverBoxOptions = {}));

	var DOMRectReadOnly = (function () {
	    function DOMRectReadOnly(x, y, width, height) {
	        this.x = x;
	        this.y = y;
	        this.width = width;
	        this.height = height;
	        this.top = this.y;
	        this.left = this.x;
	        this.bottom = this.top + this.height;
	        this.right = this.left + this.width;
	        return Object.freeze(this);
	    }
	    DOMRectReadOnly.prototype.toJSON = function () {
	        var _a = this, x = _a.x, y = _a.y, top = _a.top, right = _a.right, bottom = _a.bottom, left = _a.left, width = _a.width, height = _a.height;
	        return { x: x, y: y, top: top, right: right, bottom: bottom, left: left, width: width, height: height };
	    };
	    DOMRectReadOnly.fromRect = function (rectangle) {
	        return new DOMRectReadOnly(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
	    };
	    return DOMRectReadOnly;
	}());

	var isSVG = function (target) { return target instanceof SVGElement && 'getBBox' in target; };
	var isHidden = function (target) {
	    if (isSVG(target)) {
	        var _a = target.getBBox(), width = _a.width, height = _a.height;
	        return !width && !height;
	    }
	    var _b = target, offsetWidth = _b.offsetWidth, offsetHeight = _b.offsetHeight;
	    return !(offsetWidth || offsetHeight || target.getClientRects().length);
	};
	var isElement = function (obj) {
	    var _a, _b;
	    var scope = (_b = (_a = obj) === null || _a === void 0 ? void 0 : _a.ownerDocument) === null || _b === void 0 ? void 0 : _b.defaultView;
	    return !!(scope && obj instanceof scope.Element);
	};
	var isReplacedElement = function (target) {
	    switch (target.tagName) {
	        case 'INPUT':
	            if (target.type !== 'image') {
	                break;
	            }
	        case 'VIDEO':
	        case 'AUDIO':
	        case 'EMBED':
	        case 'OBJECT':
	        case 'CANVAS':
	        case 'IFRAME':
	        case 'IMG':
	            return true;
	    }
	    return false;
	};

	var global$1 = typeof window !== 'undefined' ? window : {};

	var cache = new WeakMap();
	var scrollRegexp = /auto|scroll/;
	var verticalRegexp = /^tb|vertical/;
	var IE = (/msie|trident/i).test(global$1.navigator && global$1.navigator.userAgent);
	var parseDimension = function (pixel) { return parseFloat(pixel || '0'); };
	var size = function (inlineSize, blockSize, switchSizes) {
	    if (inlineSize === void 0) { inlineSize = 0; }
	    if (blockSize === void 0) { blockSize = 0; }
	    if (switchSizes === void 0) { switchSizes = false; }
	    return Object.freeze({
	        inlineSize: (switchSizes ? blockSize : inlineSize) || 0,
	        blockSize: (switchSizes ? inlineSize : blockSize) || 0
	    });
	};
	var zeroBoxes = Object.freeze({
	    devicePixelContentBoxSize: size(),
	    borderBoxSize: size(),
	    contentBoxSize: size(),
	    contentRect: new DOMRectReadOnly(0, 0, 0, 0)
	});
	var calculateBoxSizes = function (target, forceRecalculation) {
	    if (forceRecalculation === void 0) { forceRecalculation = false; }
	    if (cache.has(target) && !forceRecalculation) {
	        return cache.get(target);
	    }
	    if (isHidden(target)) {
	        cache.set(target, zeroBoxes);
	        return zeroBoxes;
	    }
	    var cs = getComputedStyle(target);
	    var svg = isSVG(target) && target.ownerSVGElement && target.getBBox();
	    var removePadding = !IE && cs.boxSizing === 'border-box';
	    var switchSizes = verticalRegexp.test(cs.writingMode || '');
	    var canScrollVertically = !svg && scrollRegexp.test(cs.overflowY || '');
	    var canScrollHorizontally = !svg && scrollRegexp.test(cs.overflowX || '');
	    var paddingTop = svg ? 0 : parseDimension(cs.paddingTop);
	    var paddingRight = svg ? 0 : parseDimension(cs.paddingRight);
	    var paddingBottom = svg ? 0 : parseDimension(cs.paddingBottom);
	    var paddingLeft = svg ? 0 : parseDimension(cs.paddingLeft);
	    var borderTop = svg ? 0 : parseDimension(cs.borderTopWidth);
	    var borderRight = svg ? 0 : parseDimension(cs.borderRightWidth);
	    var borderBottom = svg ? 0 : parseDimension(cs.borderBottomWidth);
	    var borderLeft = svg ? 0 : parseDimension(cs.borderLeftWidth);
	    var horizontalPadding = paddingLeft + paddingRight;
	    var verticalPadding = paddingTop + paddingBottom;
	    var horizontalBorderArea = borderLeft + borderRight;
	    var verticalBorderArea = borderTop + borderBottom;
	    var horizontalScrollbarThickness = !canScrollHorizontally ? 0 : target.offsetHeight - verticalBorderArea - target.clientHeight;
	    var verticalScrollbarThickness = !canScrollVertically ? 0 : target.offsetWidth - horizontalBorderArea - target.clientWidth;
	    var widthReduction = removePadding ? horizontalPadding + horizontalBorderArea : 0;
	    var heightReduction = removePadding ? verticalPadding + verticalBorderArea : 0;
	    var contentWidth = svg ? svg.width : parseDimension(cs.width) - widthReduction - verticalScrollbarThickness;
	    var contentHeight = svg ? svg.height : parseDimension(cs.height) - heightReduction - horizontalScrollbarThickness;
	    var borderBoxWidth = contentWidth + horizontalPadding + verticalScrollbarThickness + horizontalBorderArea;
	    var borderBoxHeight = contentHeight + verticalPadding + horizontalScrollbarThickness + verticalBorderArea;
	    var boxes = Object.freeze({
	        devicePixelContentBoxSize: size(Math.round(contentWidth * devicePixelRatio), Math.round(contentHeight * devicePixelRatio), switchSizes),
	        borderBoxSize: size(borderBoxWidth, borderBoxHeight, switchSizes),
	        contentBoxSize: size(contentWidth, contentHeight, switchSizes),
	        contentRect: new DOMRectReadOnly(paddingLeft, paddingTop, contentWidth, contentHeight)
	    });
	    cache.set(target, boxes);
	    return boxes;
	};
	var calculateBoxSize = function (target, observedBox, forceRecalculation) {
	    var _a = calculateBoxSizes(target, forceRecalculation), borderBoxSize = _a.borderBoxSize, contentBoxSize = _a.contentBoxSize, devicePixelContentBoxSize = _a.devicePixelContentBoxSize;
	    switch (observedBox) {
	        case ResizeObserverBoxOptions.DEVICE_PIXEL_CONTENT_BOX:
	            return devicePixelContentBoxSize;
	        case ResizeObserverBoxOptions.BORDER_BOX:
	            return borderBoxSize;
	        default:
	            return contentBoxSize;
	    }
	};

	var ResizeObserverEntry = (function () {
	    function ResizeObserverEntry(target) {
	        var boxes = calculateBoxSizes(target);
	        this.target = target;
	        this.contentRect = boxes.contentRect;
	        this.borderBoxSize = [boxes.borderBoxSize];
	        this.contentBoxSize = [boxes.contentBoxSize];
	        this.devicePixelContentBoxSize = [boxes.devicePixelContentBoxSize];
	    }
	    return ResizeObserverEntry;
	}());

	var calculateDepthForNode = function (node) {
	    if (isHidden(node)) {
	        return Infinity;
	    }
	    var depth = 0;
	    var parent = node.parentNode;
	    while (parent) {
	        depth += 1;
	        parent = parent.parentNode;
	    }
	    return depth;
	};

	var broadcastActiveObservations = function () {
	    var shallowestDepth = Infinity;
	    var callbacks = [];
	    resizeObservers.forEach(function processObserver(ro) {
	        if (ro.activeTargets.length === 0) {
	            return;
	        }
	        var entries = [];
	        ro.activeTargets.forEach(function processTarget(ot) {
	            var entry = new ResizeObserverEntry(ot.target);
	            var targetDepth = calculateDepthForNode(ot.target);
	            entries.push(entry);
	            ot.lastReportedSize = calculateBoxSize(ot.target, ot.observedBox);
	            if (targetDepth < shallowestDepth) {
	                shallowestDepth = targetDepth;
	            }
	        });
	        callbacks.push(function resizeObserverCallback() {
	            ro.callback.call(ro.observer, entries, ro.observer);
	        });
	        ro.activeTargets.splice(0, ro.activeTargets.length);
	    });
	    for (var _i = 0, callbacks_1 = callbacks; _i < callbacks_1.length; _i++) {
	        var callback = callbacks_1[_i];
	        callback();
	    }
	    return shallowestDepth;
	};

	var gatherActiveObservationsAtDepth = function (depth) {
	    resizeObservers.forEach(function processObserver(ro) {
	        ro.activeTargets.splice(0, ro.activeTargets.length);
	        ro.skippedTargets.splice(0, ro.skippedTargets.length);
	        ro.observationTargets.forEach(function processTarget(ot) {
	            if (ot.isActive()) {
	                if (calculateDepthForNode(ot.target) > depth) {
	                    ro.activeTargets.push(ot);
	                }
	                else {
	                    ro.skippedTargets.push(ot);
	                }
	            }
	        });
	    });
	};

	var process$1 = function () {
	    var depth = 0;
	    gatherActiveObservationsAtDepth(depth);
	    while (hasActiveObservations()) {
	        depth = broadcastActiveObservations();
	        gatherActiveObservationsAtDepth(depth);
	    }
	    if (hasSkippedObservations()) {
	        deliverResizeLoopError();
	    }
	    return depth > 0;
	};

	var trigger;
	var callbacks = [];
	var notify = function () { return callbacks.splice(0).forEach(function (cb) { return cb(); }); };
	var queueMicroTask = function (callback) {
	    if (!trigger) {
	        var toggle_1 = 0;
	        var el_1 = document.createTextNode('');
	        var config = { characterData: true };
	        new MutationObserver(function () { return notify(); }).observe(el_1, config);
	        trigger = function () { el_1.textContent = "" + (toggle_1 ? toggle_1-- : toggle_1++); };
	    }
	    callbacks.push(callback);
	    trigger();
	};

	var queueResizeObserver = function (cb) {
	    queueMicroTask(function ResizeObserver() {
	        requestAnimationFrame(cb);
	    });
	};

	var watching = 0;
	var isWatching = function () { return !!watching; };
	var CATCH_PERIOD = 250;
	var observerConfig = { attributes: true, characterData: true, childList: true, subtree: true };
	var events = [
	    'resize',
	    'load',
	    'transitionend',
	    'animationend',
	    'animationstart',
	    'animationiteration',
	    'keyup',
	    'keydown',
	    'mouseup',
	    'mousedown',
	    'mouseover',
	    'mouseout',
	    'blur',
	    'focus'
	];
	var time = function (timeout) {
	    if (timeout === void 0) { timeout = 0; }
	    return Date.now() + timeout;
	};
	var scheduled = false;
	var Scheduler = (function () {
	    function Scheduler() {
	        var _this = this;
	        this.stopped = true;
	        this.listener = function () { return _this.schedule(); };
	    }
	    Scheduler.prototype.run = function (timeout) {
	        var _this = this;
	        if (timeout === void 0) { timeout = CATCH_PERIOD; }
	        if (scheduled) {
	            return;
	        }
	        scheduled = true;
	        var until = time(timeout);
	        queueResizeObserver(function () {
	            var elementsHaveResized = false;
	            try {
	                elementsHaveResized = process$1();
	            }
	            finally {
	                scheduled = false;
	                timeout = until - time();
	                if (!isWatching()) {
	                    return;
	                }
	                if (elementsHaveResized) {
	                    _this.run(1000);
	                }
	                else if (timeout > 0) {
	                    _this.run(timeout);
	                }
	                else {
	                    _this.start();
	                }
	            }
	        });
	    };
	    Scheduler.prototype.schedule = function () {
	        this.stop();
	        this.run();
	    };
	    Scheduler.prototype.observe = function () {
	        var _this = this;
	        var cb = function () { return _this.observer && _this.observer.observe(document.body, observerConfig); };
	        document.body ? cb() : global$1.addEventListener('DOMContentLoaded', cb);
	    };
	    Scheduler.prototype.start = function () {
	        var _this = this;
	        if (this.stopped) {
	            this.stopped = false;
	            this.observer = new MutationObserver(this.listener);
	            this.observe();
	            events.forEach(function (name) { return global$1.addEventListener(name, _this.listener, true); });
	        }
	    };
	    Scheduler.prototype.stop = function () {
	        var _this = this;
	        if (!this.stopped) {
	            this.observer && this.observer.disconnect();
	            events.forEach(function (name) { return global$1.removeEventListener(name, _this.listener, true); });
	            this.stopped = true;
	        }
	    };
	    return Scheduler;
	}());
	var scheduler = new Scheduler();
	var updateCount = function (n) {
	    !watching && n > 0 && scheduler.start();
	    watching += n;
	    !watching && scheduler.stop();
	};

	var skipNotifyOnElement = function (target) {
	    return !isSVG(target)
	        && !isReplacedElement(target)
	        && getComputedStyle(target).display === 'inline';
	};
	var ResizeObservation = (function () {
	    function ResizeObservation(target, observedBox) {
	        this.target = target;
	        this.observedBox = observedBox || ResizeObserverBoxOptions.CONTENT_BOX;
	        this.lastReportedSize = {
	            inlineSize: 0,
	            blockSize: 0
	        };
	    }
	    ResizeObservation.prototype.isActive = function () {
	        var size = calculateBoxSize(this.target, this.observedBox, true);
	        if (skipNotifyOnElement(this.target)) {
	            this.lastReportedSize = size;
	        }
	        if (this.lastReportedSize.inlineSize !== size.inlineSize
	            || this.lastReportedSize.blockSize !== size.blockSize) {
	            return true;
	        }
	        return false;
	    };
	    return ResizeObservation;
	}());

	var ResizeObserverDetail = (function () {
	    function ResizeObserverDetail(resizeObserver, callback) {
	        this.activeTargets = [];
	        this.skippedTargets = [];
	        this.observationTargets = [];
	        this.observer = resizeObserver;
	        this.callback = callback;
	    }
	    return ResizeObserverDetail;
	}());

	var observerMap = new WeakMap();
	var getObservationIndex = function (observationTargets, target) {
	    for (var i = 0; i < observationTargets.length; i += 1) {
	        if (observationTargets[i].target === target) {
	            return i;
	        }
	    }
	    return -1;
	};
	var ResizeObserverController = (function () {
	    function ResizeObserverController() {
	    }
	    ResizeObserverController.connect = function (resizeObserver, callback) {
	        var detail = new ResizeObserverDetail(resizeObserver, callback);
	        observerMap.set(resizeObserver, detail);
	    };
	    ResizeObserverController.observe = function (resizeObserver, target, options) {
	        var detail = observerMap.get(resizeObserver);
	        var firstObservation = detail.observationTargets.length === 0;
	        if (getObservationIndex(detail.observationTargets, target) < 0) {
	            firstObservation && resizeObservers.push(detail);
	            detail.observationTargets.push(new ResizeObservation(target, options && options.box));
	            updateCount(1);
	            scheduler.schedule();
	        }
	    };
	    ResizeObserverController.unobserve = function (resizeObserver, target) {
	        var detail = observerMap.get(resizeObserver);
	        var index = getObservationIndex(detail.observationTargets, target);
	        var lastObservation = detail.observationTargets.length === 1;
	        if (index >= 0) {
	            lastObservation && resizeObservers.splice(resizeObservers.indexOf(detail), 1);
	            detail.observationTargets.splice(index, 1);
	            updateCount(-1);
	        }
	    };
	    ResizeObserverController.disconnect = function (resizeObserver) {
	        var _this = this;
	        var detail = observerMap.get(resizeObserver);
	        detail.observationTargets.slice().forEach(function (ot) { return _this.unobserve(resizeObserver, ot.target); });
	        detail.activeTargets.splice(0, detail.activeTargets.length);
	    };
	    return ResizeObserverController;
	}());

	var ResizeObserver = (function () {
	    function ResizeObserver(callback) {
	        if (arguments.length === 0) {
	            throw new TypeError("Failed to construct 'ResizeObserver': 1 argument required, but only 0 present.");
	        }
	        if (typeof callback !== 'function') {
	            throw new TypeError("Failed to construct 'ResizeObserver': The callback provided as parameter 1 is not a function.");
	        }
	        ResizeObserverController.connect(this, callback);
	    }
	    ResizeObserver.prototype.observe = function (target, options) {
	        if (arguments.length === 0) {
	            throw new TypeError("Failed to execute 'observe' on 'ResizeObserver': 1 argument required, but only 0 present.");
	        }
	        if (!isElement(target)) {
	            throw new TypeError("Failed to execute 'observe' on 'ResizeObserver': parameter 1 is not of type 'Element");
	        }
	        ResizeObserverController.observe(this, target, options);
	    };
	    ResizeObserver.prototype.unobserve = function (target) {
	        if (arguments.length === 0) {
	            throw new TypeError("Failed to execute 'unobserve' on 'ResizeObserver': 1 argument required, but only 0 present.");
	        }
	        if (!isElement(target)) {
	            throw new TypeError("Failed to execute 'unobserve' on 'ResizeObserver': parameter 1 is not of type 'Element");
	        }
	        ResizeObserverController.unobserve(this, target);
	    };
	    ResizeObserver.prototype.disconnect = function () {
	        ResizeObserverController.disconnect(this);
	    };
	    ResizeObserver.toString = function () {
	        return 'function ResizeObserver () { [polyfill code] }';
	    };
	    return ResizeObserver;
	}());

	/**
	 * Returns a function, that, as long as it continues to be invoked, will not
	 * be triggered. The function will be called after it stops being called for
	 * N milliseconds. If `immediate` is passed, trigger the function on the
	 * leading edge, instead of the trailing. The function also has a property 'clear' 
	 * that is a function which will clear the timer to prevent previously scheduled executions. 
	 *
	 * @source underscore.js
	 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
	 * @param {Function} function to wrap
	 * @param {Number} timeout in ms (`100`)
	 * @param {Boolean} whether to execute at the beginning (`false`)
	 * @api public
	 */
	function debounce(func, wait, immediate){
	  var timeout, args, context, timestamp, result;
	  if (null == wait) wait = 100;

	  function later() {
	    var last = Date.now() - timestamp;

	    if (last < wait && last >= 0) {
	      timeout = setTimeout(later, wait - last);
	    } else {
	      timeout = null;
	      if (!immediate) {
	        result = func.apply(context, args);
	        context = args = null;
	      }
	    }
	  }
	  var debounced = function(){
	    context = this;
	    args = arguments;
	    timestamp = Date.now();
	    var callNow = immediate && !timeout;
	    if (!timeout) timeout = setTimeout(later, wait);
	    if (callNow) {
	      result = func.apply(context, args);
	      context = args = null;
	    }

	    return result;
	  };

	  debounced.clear = function() {
	    if (timeout) {
	      clearTimeout(timeout);
	      timeout = null;
	    }
	  };
	  
	  debounced.flush = function() {
	    if (timeout) {
	      result = func.apply(context, args);
	      context = args = null;
	      
	      clearTimeout(timeout);
	      timeout = null;
	    }
	  };

	  return debounced;
	}
	// Adds compatibility for ES modules
	debounce.debounce = debounce;

	var debounce_1 = debounce;

	function useMeasure({
	  debounce: debounce$1,
	  scroll,
	  polyfill
	} = {
	  debounce: 0,
	  scroll: false
	}) {
	  const ResizeObserver = polyfill || (typeof window === 'undefined' ? class ResizeObserver {} : window.ResizeObserver);

	  if (!ResizeObserver) {
	    throw new Error('This browser does not support ResizeObserver out of the box. See: https://github.com/react-spring/react-use-measure/#resize-observer-polyfills');
	  }

	  const [bounds, set] = m$1({
	    left: 0,
	    top: 0,
	    width: 0,
	    height: 0,
	    bottom: 0,
	    right: 0,
	    x: 0,
	    y: 0
	  }); // keep all state in a ref

	  const state = h$1({
	    element: null,
	    scrollContainers: null,
	    resizeObserver: null,
	    lastBounds: bounds
	  }); // set actual debounce values early, so effects know if they should react accordingly

	  const scrollDebounce = debounce$1 ? typeof debounce$1 === 'number' ? debounce$1 : debounce$1.scroll : null;
	  const resizeDebounce = debounce$1 ? typeof debounce$1 === 'number' ? debounce$1 : debounce$1.resize : null; // make sure to update state only as long as the component is truly mounted

	  const mounted = h$1(false);
	  y$1(() => {
	    mounted.current = true;
	    return () => void (mounted.current = false);
	  }); // memoize handlers, so event-listeners know when they should update

	  const [forceRefresh, resizeChange, scrollChange] = _$1(() => {
	    const callback = () => {
	      if (!state.current.element) return;
	      const {
	        left,
	        top,
	        width,
	        height,
	        bottom,
	        right,
	        x,
	        y
	      } = state.current.element.getBoundingClientRect();
	      const size = {
	        left,
	        top,
	        width,
	        height,
	        bottom,
	        right,
	        x,
	        y
	      };
	      Object.freeze(size);
	      if (mounted.current && !areBoundsEqual(state.current.lastBounds, size)) set(state.current.lastBounds = size);
	    };

	    return [callback, resizeDebounce ? debounce_1.debounce(callback, resizeDebounce) : callback, scrollDebounce ? debounce_1.debounce(callback, scrollDebounce) : callback];
	  }, [set, scrollDebounce, resizeDebounce]); // cleanup current scroll-listeners / observers

	  function removeListeners() {
	    if (state.current.scrollContainers) {
	      state.current.scrollContainers.forEach(element => element.removeEventListener('scroll', scrollChange, true));
	      state.current.scrollContainers = null;
	    }

	    if (state.current.resizeObserver) {
	      state.current.resizeObserver.disconnect();
	      state.current.resizeObserver = null;
	    }
	  } // add scroll-listeners / observers


	  function addListeners() {
	    if (!state.current.element) return;
	    state.current.resizeObserver = new ResizeObserver(scrollChange);
	    state.current.resizeObserver.observe(state.current.element);

	    if (scroll && state.current.scrollContainers) {
	      state.current.scrollContainers.forEach(scrollContainer => scrollContainer.addEventListener('scroll', scrollChange, {
	        capture: true,
	        passive: true
	      }));
	    }
	  } // the ref we expose to the user


	  const ref = node => {
	    if (!node || node === state.current.element) return;
	    removeListeners();
	    state.current.element = node;
	    state.current.scrollContainers = findScrollContainers(node);
	    addListeners();
	  }; // add general event listeners


	  useOnWindowScroll(scrollChange, Boolean(scroll));
	  useOnWindowResize(resizeChange); // respond to changes that are relevant for the listeners

	  y$1(() => {
	    removeListeners();
	    addListeners();
	  }, [scroll, scrollChange, resizeChange]); // remove all listeners when the components unmounts

	  y$1(() => removeListeners, []);
	  return [ref, bounds, forceRefresh];
	} // Adds native resize listener to window


	function useOnWindowResize(onWindowResize) {
	  y$1(() => {
	    const cb = onWindowResize;
	    window.addEventListener('resize', cb);
	    return () => void window.removeEventListener('resize', cb);
	  }, [onWindowResize]);
	}

	function useOnWindowScroll(onScroll, enabled) {
	  y$1(() => {
	    if (enabled) {
	      const cb = onScroll;
	      window.addEventListener('scroll', cb, {
	        capture: true,
	        passive: true
	      });
	      return () => void window.removeEventListener('scroll', cb, true);
	    }
	  }, [onScroll, enabled]);
	} // Returns a list of scroll offsets


	function findScrollContainers(element) {
	  const result = [];
	  if (!element || element === document.body) return result;
	  const {
	    overflow,
	    overflowX,
	    overflowY
	  } = window.getComputedStyle(element);
	  if ([overflow, overflowX, overflowY].some(prop => prop === 'auto' || prop === 'scroll')) result.push(element);
	  return [...result, ...findScrollContainers(element.parentElement)];
	} // Checks if element boundaries are equal


	const keys = ['x', 'y', 'top', 'bottom', 'left', 'right', 'width', 'height'];

	const areBoundsEqual = (a, b) => keys.every(key => a[key] === b[key]);

	function useDeviceSize() {
	    var _a = useMeasure({
	        polyfill: ResizeObserver,
	    }), ref = _a[0], measure = _a[1];
	    var size = _$1(function () { return resolveSize(measure); }, [JSON.stringify(measure)]);
	    return [ref, size];
	}
	function resolveSize(measure) {
	    return measure.width <= 480 ? "medium" : "big";
	}

	var Text = Ye.span(templateObject_1$2 || (templateObject_1$2 = __makeTemplateObject(["\n  ", "\n  font-family: ", ";\n  font-weight: ", ";\n"], ["\n  ", "\n  font-family: ", ";\n  font-weight: ", ";\n"])), baseStyle, getFontFamily, function (props) { return props.bold ? "700" : "400"; });
	function getFontFamily(props) {
	    return props.category === "display"
	        ? props.theme.fontFamily.display
	        : props.theme.fontFamily.sansSerif;
	}
	var templateObject_1$2;

	var FormSection = Ye.section(templateObject_1$3 || (templateObject_1$3 = __makeTemplateObject(["\n  ", ";\n  display: flex;\n  flex-wrap: wrap;\n"], ["\n  ", ";\n  display: flex;\n  flex-wrap: wrap;\n"])), baseStyle);
	var FormItem = Ye.div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  ", ";\n  width: ", ";\n  padding: 0.5rem;\n  ", "\n"], ["\n  ", ";\n  width: ", ";\n  padding: 0.5rem;\n  ",
	    "\n"])), baseStyle, function (props) { return props.mode === "half" ? "50%" : "100%"; }, function (props) { return props.first && _e(templateObject_2$1 || (templateObject_2$1 = __makeTemplateObject(["\n    padding-top: 0;\n  "], ["\n    padding-top: 0;\n  "]))); });
	var templateObject_1$3, templateObject_2$1, templateObject_3;

	var Icon = Ye.span.attrs(function (props) { return ({
	    children: props.name,
	    className: "material-icons",
	}); })(templateObject_1$4 || (templateObject_1$4 = __makeTemplateObject(["\n  ", ";\n  font-family: \"Material Icons\";\n  ", "\n  ", "\n"], ["\n  ", ";\n  font-family: \"Material Icons\";\n  ", "\n  ", "\n"])), baseStyle, function (props) { return props.color ? "color: " + props.color + ";" : ""; }, function (props) { return props.size ? "font-size: " + props.size + ";" : ""; });
	var templateObject_1$4;

	function Tooltip(props) {
	    return (h(TooltipStyled, null,
	        h(TooltipContainer, __assign({}, props),
	            h(TooltipBody, null, props.dataContent),
	            h(TooltipArrow, __assign({}, props)))));
	}
	var TooltipStyled = Ye.div(templateObject_1$5 || (templateObject_1$5 = __makeTemplateObject(["\n  display: inline-block;\n  position: relative;\n  width: max-content;\n  max-width: 230px;\n"], ["\n  display: inline-block;\n  position: relative;\n  width: max-content;\n  max-width: 230px;\n"])));
	var getTooltipBackgroundColor = function (props) { return props.backgroundColor ? props.backgroundColor : "#848484"; };
	var TooltipArrow = Ye.i(templateObject_2$2 || (templateObject_2$2 = __makeTemplateObject(["\n  overflow: visible;\n  position: absolute;\n  ", ";\n  &:after {\n    content: \"\";\n    width: 11px;\n    height: 11px;\n    position: absolute;\n    background-color: ", ";\n    transform: ", " rotate(45deg);\n  }\n"], ["\n  overflow: visible;\n  position: absolute;\n  ", ";\n  &:after {\n    content: \"\";\n    width: 11px;\n    height: 11px;\n    position: absolute;\n    background-color: ", ";\n    transform: ", " rotate(45deg);\n  }\n"])), function (props) { return buildTooltipArrowPosition(props); }, function (props) { return getTooltipBackgroundColor(props); }, function (props) { return translateArrow(props); });
	var TooltipBody = Ye.div(templateObject_3$1 || (templateObject_3$1 = __makeTemplateObject(["\n  overflow-wrap: anywhere;\n"], ["\n  overflow-wrap: anywhere;\n"])));
	var TooltipContainer = Ye.div(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  color: ", ";\n  font-size: 10px;\n  font-weight: normal;\n  padding: 16px;\n  width: 100%;\n  border-radius: 4px;\n  box-sizing: border-box;\n  background-color: ", ";\n  font-family: ", ";\n  z-index: 1000;\n"], ["\n  color: ", ";\n  font-size: 10px;\n  font-weight: normal;\n  padding: 16px;\n  width: 100%;\n  border-radius: 4px;\n  box-sizing: border-box;\n  background-color: ", ";\n  font-family: ", ";\n  z-index: 1000;\n"])), function (props) { var _a; return (_a = props.textColor) !== null && _a !== void 0 ? _a : "white"; }, function (props) { return getTooltipBackgroundColor(props); }, function (props) { return props.theme.fontFamily.sansSerif; });
	var buildTooltipArrowPosition = function (props) {
	    var _a = props.position, position = _a === void 0 ? "up" : _a, _b = props.arrowPosition, arrowPosition = _b === void 0 ? "right" : _b;
	    switch (position) {
	        case "left":
	        case "right":
	            return "\n    " + verticalArrowDimensions + "\n    bottom: calc(50% - 8px);\n    " + (position === "left" ? "right: -8px" : "left: -8px") + ";\n  ";
	        case "up":
	        case "down":
	            return "\n    " + horizontalArrowDimensions + "\n    bottom: -8px;\n    " + (position === "up" ? "bottom: -8px" : "top: -8px") + ";\n    " + (arrowPosition === "middle" ? "left: calc(50% - 8px)" : arrowPosition + ": 16px") + ";\n  ";
	    }
	};
	var horizontalArrowDimensions = "\n  width: 16px;\n  height: 8px;\n";
	var verticalArrowDimensions = "\n  width: 8px;\n  height: 16px;\n";
	var translateArrow = function (_a) {
	    var position = _a.position;
	    switch (position) {
	        case "right":
	            return "translate(25%, 25%)";
	        case "down":
	            return "translate(25%, 25%)";
	        case "left":
	            return "translate(-50%, 25%)";
	        case "up":
	        default:
	            return "translate(25%, -50%)";
	    }
	};
	var templateObject_1$5, templateObject_2$2, templateObject_3$1, templateObject_4;

	function InputText(props) {
	    var id = props.id, name = props.name, _a = props.type, type = _a === void 0 ? "text" : _a, value = props.value, placeholder = props.placeholder, autoComplete = props.autoComplete, disabled = props.disabled, inputRef = props.inputRef, onInput = props.onInput, rest = __rest(props, ["id", "name", "type", "value", "placeholder", "autoComplete", "disabled", "inputRef", "onInput"]);
	    return (h(InputTextContainer, __assign({}, rest),
	        h(InputTextFlexBox, null,
	            h(StyledInputText, { id: id, name: name, type: type, value: value, placeholder: placeholder, autoComplete: autoComplete, disabled: disabled, ref: inputRef, onInput: onInput }),
	            props.tip && (h(TipContainer, null,
	                h(Icon, { size: "20px", color: "#848484", style: { marginRight: "-2px", cursor: "pointer" }, name: props.tipIcon || "help_outline" }),
	                h(TipWrapper, null,
	                    h(Tooltip, { dataContent: props.tip, position: "up", arrowPosition: "right" })))))));
	}
	var InputTextContainer = Ye.div(templateObject_1$6 || (templateObject_1$6 = __makeTemplateObject(["\n  ", ";\n  background: white;\n  height: 48px;\n  font-family: ", ";\n  font-size: 14px;\n  border: ", ";\n  border-radius: 3px;\n  display: ", ";\n  width: ", ";\n  outline: 0;\n  &:focus-within {\n    border-color: ", ";\n    box-shadow: 0 0 0 1px ", ";\n  }\n"], ["\n  ", ";\n  background: white;\n  height: 48px;\n  font-family: ", ";\n  font-size: 14px;\n  border: ", ";\n  border-radius: 3px;\n  display: ", ";\n  width: ", ";\n  outline: 0;\n  &:focus-within {\n    border-color: ", ";\n    box-shadow: 0 0 0 1px ", ";\n  }\n"])), baseStyle, function (props) { return props.theme.fontFamily.sansSerif; }, function (props) { return "1px solid " + getBorderColor$1(props); }, function (props) { return props.block ? "block" : "inline-block"; }, function (props) { return props.block ? "100%" : "auto"; }, function (props) { return getFocusBorderColor(props); }, function (props) { return getFocusBorderColor(props); });
	var InputTextFlexBox = Ye.div(templateObject_2$3 || (templateObject_2$3 = __makeTemplateObject(["\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-flow: row nowrap;\n  align-items: center;\n"], ["\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-flow: row nowrap;\n  align-items: center;\n"])));
	var TipWrapper = Ye.div(templateObject_3$2 || (templateObject_3$2 = __makeTemplateObject(["\n  max-width: 230px;\n  position: absolute;\n  bottom: 34px;\n  right: -16px;\n"], ["\n  max-width: 230px;\n  position: absolute;\n  bottom: 34px;\n  right: -16px;\n"])));
	var TipContainer = Ye.div(templateObject_4$1 || (templateObject_4$1 = __makeTemplateObject(["\n  display: flex;\n  align-items: center;\n  position: relative;\n  margin-right: 14px;\n\n  ", " {\n    transition: 200ms all ease-in;\n    transform: translate(0%, -10%);\n    opacity: 0;\n    visibility: hidden;\n  }\n\n  &:hover ", " {\n    transform: translate(0%, -0%);\n    opacity: 1;\n    visibility: visible;\n  }\n"], ["\n  display: flex;\n  align-items: center;\n  position: relative;\n  margin-right: 14px;\n\n  ", " {\n    transition: 200ms all ease-in;\n    transform: translate(0%, -10%);\n    opacity: 0;\n    visibility: hidden;\n  }\n\n  &:hover ", " {\n    transform: translate(0%, -0%);\n    opacity: 1;\n    visibility: visible;\n  }\n"])), TipWrapper, TipWrapper);
	var StyledInputText = Ye.input(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  ", ";\n  background: white;\n  padding: 14px;\n  height: 100%;\n  flex-basis: 100%;\n  outline: 0;\n  border: none;\n  border-radius: 3px;\n  &::placeholder {\n    color: #CBCBCB;\n  }\n"], ["\n  ", ";\n  background: white;\n  padding: 14px;\n  height: 100%;\n  flex-basis: 100%;\n  outline: 0;\n  border: none;\n  border-radius: 3px;\n  &::placeholder {\n    color: #CBCBCB;\n  }\n"])), baseStyle);
	function getBorderColor$1(props) {
	    if (props.disabled)
	        return "#CBCBCB";
	    switch (props.kind) {
	        case "error":
	            return "#fe807c";
	        default:
	            return "#cbcbcb";
	    }
	}
	function getFocusBorderColor(props) {
	    switch (props.kind) {
	        case "error":
	            return "#fe807c";
	        default:
	            return props.theme.primaryColor;
	    }
	}
	var templateObject_1$6, templateObject_2$3, templateObject_3$2, templateObject_4$1, templateObject_5;

	function InputField(props) {
	    var assistiveTextContent = props.assistiveTextContent, children = props.children, disabled = props.disabled, InputElement = props.inputElement, inputElementProps = props.inputElementProps, _a = props.kind, kind = _a === void 0 ? "default" : _a, labelContent = props.labelContent;
	    var id = useUniqueId();
	    var _b = m$1(false), focused = _b[0], setFocused = _b[1];
	    var handleFocus = A$1(function () { return setFocused(true); }, [setFocused]);
	    var lastHandleFocus = h$1(handleFocus);
	    var handleBlur = A$1(function () { return setFocused(false); }, [setFocused]);
	    var lastHandleBlur = h$1(handleBlur);
	    var inputRef = h$1(null);
	    var inputRefCallback = A$1(function (element) {
	        if (inputRef.current) {
	            inputRef.current.removeEventListener("focus", lastHandleFocus.current);
	            inputRef.current.removeEventListener("blur", lastHandleBlur.current);
	        }
	        if (element) {
	            element.addEventListener("focus", handleFocus);
	            element.addEventListener("blur", handleBlur);
	        }
	        inputRef.current = element;
	    }, [handleFocus, handleBlur]);
	    return (h(StyledInputField, __assign({}, props),
	        labelContent && (h(Label, { focused: focused, kind: kind, htmlFor: id }, labelContent)),
	        h(InputElement, __assign({}, inputElementProps, { inputRef: inputRefCallback, disabled: disabled, kind: kind, id: id }), children),
	        assistiveTextContent && (h(AssistiveLabel, { focused: focused, kind: kind, htmlFor: id }, assistiveTextContent))));
	}
	var StyledInputField = Ye.div(templateObject_2$4 || (templateObject_2$4 = __makeTemplateObject(["\n  ", "\n  display: flex;\n  flex-direction: column;\n  font-size: 12px;\n  ", ";\n"], ["\n  ", "\n  display: flex;\n  flex-direction: column;\n  font-size: 12px;\n  ",
	    ";\n"])), baseStyle, function (props) { return props.disabled && _e(templateObject_1$7 || (templateObject_1$7 = __makeTemplateObject(["\n    opacity: 50%;\n  "], ["\n    opacity: 50%;\n  "]))); });
	var Label = Ye.label(templateObject_3$3 || (templateObject_3$3 = __makeTemplateObject(["\n  color: #848484;\n  font-family: ", ";\n  cursor: pointer;\n  margin-bottom: 0.25rem;\n  color: ", ";\n"], ["\n  color: #848484;\n  font-family: ", ";\n  cursor: pointer;\n  margin-bottom: 0.25rem;\n  color: ", ";\n"])), function (props) { return props.theme.fontFamily.sansSerif; }, function (props) { return getLabelColor(props); });
	var AssistiveLabel = Ye(Label)(templateObject_4$2 || (templateObject_4$2 = __makeTemplateObject(["\n  color: ", ";\n  font-size: 0.8em;\n  margin-left: 1rem;\n  margin-top: 0.25rem;\n"], ["\n  color: ", ";\n  font-size: 0.8em;\n  margin-left: 1rem;\n  margin-top: 0.25rem;\n"])), function (props) { return getAssistivelabelColor(props); });
	function getLabelColor(props) {
	    switch (props.kind) {
	        case "error":
	            return "#fe807c";
	        default:
	            return props.focused ? props.theme.primaryColor : "#848484";
	    }
	}
	function getAssistivelabelColor(props) {
	    switch (props.kind) {
	        case "error":
	            return "#fe807c";
	        default:
	            return "#848484";
	    }
	}
	var templateObject_1$7, templateObject_2$4, templateObject_3$3, templateObject_4$2;

	function InputBillingAddressCity() {
	    var country = useConfigCountry();
	    var dataState = useDataState();
	    var _a = useUserInputValueForInputTag("billingAddressCity"), billingAddressCity = _a[0], handleChangeBillingAddressCity = _a[1];
	    var billingAddressCityValidation = useUserInputValueValidation("billingAddressCity");
	    return (h(InputField, { inputElement: InputText, labelContent: h(BillingAddressCityLabelText, { country: country }), kind: dataState.isSent() && !billingAddressCityValidation.valid ? "error" : "default", inputElementProps: {
	            name: "address-city",
	            value: billingAddressCity,
	            autoComplete: "address-level2",
	            onInput: handleChangeBillingAddressCity,
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$4(country, billingAddressCityValidation) : undefined }));
	}
	function resolveErrorMessage$4(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function Select(props) {
	    return h(StyledSelect, __assign({ ref: props.inputRef }, props));
	}
	var StyledSelect = Ye.select(templateObject_1$8 || (templateObject_1$8 = __makeTemplateObject(["\n  ", ";\n  -webkit-appearance: none;\n  appearance: none;\n  position: relative;\n  background: white;\n  height: 48px;\n  padding: 14px;\n  font-family: ", ";\n  font-size: 14px;\n  border: ", ";\n  border-radius: 3px;\n  display: ", ";\n  width: ", ";\n  outline: 0;\n  cursor: pointer;\n  &:focus {\n    border-color: ", ";\n    box-shadow: 0 0 0 1px ", ";\n  }\n  &:disabled {\n    border-color: #CBCBCB;\n  }\n  background-image: url(", ");\n  background-repeat: no-repeat;\n  background-position: right;\n  background-origin: content-box;\n"], ["\n  ", ";\n  -webkit-appearance: none;\n  appearance: none;\n  position: relative;\n  background: white;\n  height: 48px;\n  padding: 14px;\n  font-family: ", ";\n  font-size: 14px;\n  border: ", ";\n  border-radius: 3px;\n  display: ", ";\n  width: ", ";\n  outline: 0;\n  cursor: pointer;\n  &:focus {\n    border-color: ", ";\n    box-shadow: 0 0 0 1px ", ";\n  }\n  &:disabled {\n    border-color: #CBCBCB;\n  }\n  background-image: url(", ");\n  background-repeat: no-repeat;\n  background-position: right;\n  background-origin: content-box;\n"])), baseStyle, function (props) { return props.theme.fontFamily.sansSerif; }, function (props) { return "1px solid " + getBorderColor$2(props); }, function (props) { return props.block ? "block" : "inline-block"; }, function (props) { return props.block ? "100%" : "auto"; }, function (props) { return getFocusBorderColor$1(props); }, function (props) { return getFocusBorderColor$1(props); }, getSvgImageUrl("select-arrow"));
	var SelectOption = Ye.option(templateObject_2$5 || (templateObject_2$5 = __makeTemplateObject([""], [""])));
	function getBorderColor$2(props) {
	    switch (props.kind) {
	        case "error":
	            return "#fe807c";
	        default:
	            return "#cbcbcb";
	    }
	}
	function getFocusBorderColor$1(props) {
	    switch (props.kind) {
	        case "error":
	            return "#fe807c";
	        default:
	            return props.theme.primaryColor;
	    }
	}
	var templateObject_1$8, templateObject_2$5;

	function InputBillingAddressState() {
	    var country = useConfigCountry();
	    var dataState = useDataState();
	    var stateOptions = useCountryStates(country);
	    var _a = useUserInputValueForSelectTag("billingAddressState"), billingAddressState = _a[0], handleChangeBillingAddressState = _a[1];
	    var billingAddressStateValidation = useUserInputValueValidation("billingAddressState");
	    return (h(InputField, { inputElement: Select, labelContent: h(BillingAddressStateLabelText, { country: country }), kind: dataState.isSent() && !billingAddressStateValidation.valid ? "error" : "default", inputElementProps: {
	            name: "address-state",
	            value: billingAddressState,
	            autoComplete: "address-level1",
	            onInput: handleChangeBillingAddressState,
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$5(country, billingAddressStateValidation) : undefined },
	        h(SelectOption, { value: "" }, getBillingAddressStatePlaceholderText(country)),
	        stateOptions.map(function (option) { return (h(SelectOption, { key: option.code, value: option.code }, option.name)); })));
	}
	function resolveErrorMessage$5(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function InputBillingAddressStreet() {
	    var country = useConfigCountry();
	    var dataState = useDataState();
	    var _a = useUserInputValueForInputTag("billingAddressStreet"), billingAddressStreet = _a[0], handleChangeBillingAddressStreet = _a[1];
	    var billingAddressStreetValidation = useUserInputValueValidation("billingAddressStreet");
	    return (h(InputField, { inputElement: InputText, labelContent: h(BillingAddressStreetLabelText, { country: country }), kind: dataState.isSent() && !billingAddressStreetValidation.valid ? "error" : "default", inputElementProps: {
	            name: "address-street-name",
	            value: billingAddressStreet,
	            placeholder: getBillingAddressStreetPlaceholderText(country),
	            autoComplete: "address-line1",
	            onInput: handleChangeBillingAddressStreet,
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$6(country, billingAddressStreetValidation) : undefined }));
	}
	function resolveErrorMessage$6(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function InputBillingAddressStreetNumber() {
	    var country = useConfigCountry();
	    var dataState = useDataState();
	    var _a = useUserInputValueForInputTag("billingAddressStreetNumber"), billingAddressStreetNumber = _a[0], handleChangeBillingAddressStreetNumber = _a[1];
	    var billingAddressStreetNumberValidation = useUserInputValueValidation("billingAddressStreetNumber");
	    return (h(InputField, { inputElement: InputText, labelContent: h(BillingAddressStreetNumberLabelText, { country: country }), kind: dataState.isSent() && !billingAddressStreetNumberValidation.valid ? "error" : "default", inputElementProps: {
	            type: "tel",
	            name: "address-street-number",
	            value: billingAddressStreetNumber,
	            autoComplete: "address-line2",
	            onInput: handleChangeBillingAddressStreetNumber,
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$7(country, billingAddressStreetNumberValidation) : undefined }));
	}
	function resolveErrorMessage$7(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function InputBillingAddressZipcode() {
	    var country = useConfigCountry();
	    var dataState = useDataState();
	    var _a = useUserInputValueForInputTag("billingAddressZipcode"), billingAddressZipcode = _a[0], handleChangeBillingAddressZipcode = _a[1];
	    var billingAddressZipcodeValidation = useUserInputValueValidation("billingAddressZipcode");
	    return (h(InputField, { inputElement: InputText, labelContent: h(BillingAddressZipcodeLabelText, { country: country }), kind: dataState.isSent() && !billingAddressZipcodeValidation.valid ? "error" : "default", inputElementProps: {
	            type: "tel",
	            name: "address-zipcode",
	            value: billingAddressZipcode,
	            autoComplete: "postal-code",
	            onInput: handleChangeBillingAddressZipcode,
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$8(country, billingAddressZipcodeValidation) : undefined }));
	}
	function resolveErrorMessage$8(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function BrazilianBillingAddressForm() {
	    var country = useConfigCountry();
	    var _a = useDeviceSize(), ref = _a[0], deviceSize = _a[1];
	    return (h("div", { ref: ref, style: { marginTop: "1.5rem" } },
	        h(Text, { category: "display", bold: true, style: { fontSize: "20px" } },
	            h(BillingAddressFormTitle, { country: country })),
	        h(FormSection, null,
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputBillingAddressZipcode, null)),
	            deviceSize !== "medium" && (h(FormItem, { mode: "half" })),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputBillingAddressState, null)),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputBillingAddressCity, null)),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputBillingAddressStreet, null)),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputBillingAddressStreetNumber, null)))));
	}

	function BillingAddressForm() {
	    var country = useConfigCountry();
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return h(BrazilianBillingAddressForm, null);
	        case exports.Country.ARGENTINA:
	        case exports.Country.CHILE:
	        case exports.Country.COLOMBIA:
	        case exports.Country.MEXICO:
	        case exports.Country.PERU:
	        case exports.Country.URUGUAY:
	            return h(p, null);
	        default:
	            throw new Error("BillingAddressForm not available for country " + country);
	    }
	}

	function PersonalInfoFormTitle(props) {
	    switch (props.country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "Dados do Comprador");
	        default:
	            return h(p, null, "Detalles del comprador");
	    }
	}
	function CustomerDocumentLabelText(props) {
	    switch (props.country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "CPF ou CNPJ");
	        case exports.Country.CHILE:
	            return h(p, null, "RUT");
	        case exports.Country.URUGUAY:
	            return h(p, null, "C\u00E9dula de Identidad");
	        case exports.Country.ARGENTINA:
	        case exports.Country.COLOMBIA:
	            return h(p, null, "N\u00FAmero del Documento");
	        default:
	            return h(p, null);
	    }
	}
	function CustomerDocumentTypeLabelText(props) {
	    switch (props.country) {
	        case exports.Country.ARGENTINA:
	        case exports.Country.COLOMBIA:
	            return h(p, null, "Tipo de identificaci\u00F3n");
	        default:
	            return h(p, null);
	    }
	}
	function getCustomerDocumentTypePlaceholderText(country) {
	    switch (country) {
	        case exports.Country.ARGENTINA:
	            return "Elije un documento";
	        case exports.Country.COLOMBIA:
	            return "Tipo de identificación";
	        default:
	            return "";
	    }
	}
	function CustomerEmailLabelText(props) {
	    switch (props.country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "Email");
	        default:
	            return h(p, null, "Correo Electr\u00F3nico");
	    }
	}
	function CustomerNameLabelText(props) {
	    switch (props.country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "Nome completo");
	        default:
	            return h(p, null, "Nombre y Apellido");
	    }
	}
	function CustomerPhoneNumberLabelText(props) {
	    switch (props.country) {
	        case exports.Country.BRAZIL:
	            return h(p, null, "Telefone");
	        default:
	            return h(p, null, "Tel\u00E9fono");
	    }
	}
	function getCustomerPhoneNumberPlaceholderText(country) {
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return "Fixo ou Celular";
	        default:
	            return "Fijo o Celular";
	    }
	}

	function ArgentinianInputDocument() {
	    var country = useConfigCountry();
	    var dataState = useDataState();
	    var _a = useUserInputValueForInputTag("customerDocument"), customerDocument = _a[0], handleChangeCustomerDocument = _a[1];
	    var customerDocumentValidation = useUserInputValueValidation("customerDocument");
	    return (h(InputField, { inputElement: InputText, labelContent: h(CustomerDocumentLabelText, { country: country }), kind: dataState.isSent() && !customerDocumentValidation.valid ? "error" : "default", inputElementProps: {
	            name: "customer-document",
	            value: customerDocument,
	            onInput: handleChangeCustomerDocument,
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$9(country, customerDocumentValidation) : undefined }));
	}
	function resolveErrorMessage$9(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function InputCustomerDocumentType() {
	    var country = useConfigCountry();
	    var dataState = useDataState();
	    var _a = useUserInputValueForSelectTag("customerDocumentType"), customerDocumentType = _a[0], handleChangeCustomerDocumentType = _a[1];
	    var customerDocumentTypeValidation = useUserInputValueValidation("customerDocumentType");
	    var documentTypeOptions = _$1(function () {
	        return getDocumentTypesForCountry(country);
	    }, [country]);
	    return (h(InputField, { inputElement: Select, labelContent: h(CustomerDocumentTypeLabelText, { country: country }), kind: dataState.isSent() && !customerDocumentTypeValidation.valid ? "error" : "default", inputElementProps: {
	            name: "customer-document-type",
	            value: customerDocumentType,
	            onInput: handleChangeCustomerDocumentType,
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$a(country, customerDocumentTypeValidation) : undefined },
	        h(SelectOption, { value: "" }, getCustomerDocumentTypePlaceholderText(country)),
	        documentTypeOptions.map(function (option) { return (h(SelectOption, { key: option.documentType, value: option.documentType }, option.name)); })));
	}
	function resolveErrorMessage$a(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function InputCustomerEmail() {
	    var country = useConfigCountry();
	    var _a = useUserInputValueForInputTag("customerEmail"), customerEmail = _a[0], handleChangeCustomerEmail = _a[1];
	    var customerEmailValidation = useUserInputValueValidation("customerEmail");
	    var dataState = useDataState();
	    return (h(InputField, { inputElement: InputText, labelContent: h(CustomerEmailLabelText, { country: country }), kind: dataState.isSent() && !customerEmailValidation.valid ? "error" : "default", inputElementProps: {
	            name: "customer-email",
	            value: customerEmail,
	            onInput: handleChangeCustomerEmail,
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$b(country, customerEmailValidation) : undefined }));
	}
	function resolveErrorMessage$b(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function InputCustomerName() {
	    var country = useConfigCountry();
	    var _a = useUserInputValueForInputTag("customerName"), customerName = _a[0], handleChangeCustomerName = _a[1];
	    var customerNameValidation = useUserInputValueValidation("customerName");
	    var dataState = useDataState();
	    return (h(InputField, { inputElement: InputText, labelContent: h(CustomerNameLabelText, { country: country }), kind: dataState.isSent() && !customerNameValidation.valid ? "error" : "default", inputElementProps: {
	            name: "customer-name",
	            value: customerName,
	            onInput: handleChangeCustomerName,
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$c(country, customerNameValidation) : undefined }));
	}
	function resolveErrorMessage$c(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function ArgentinianPersonalInfoForm() {
	    var country = useConfigCountry();
	    var _a = useDeviceSize(), ref = _a[0], deviceSize = _a[1];
	    return (h("div", { ref: ref },
	        h(Text, { category: "display", bold: true, style: { fontSize: "20px" } },
	            h(PersonalInfoFormTitle, { country: country })),
	        h(FormSection, null,
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputCustomerName, null)),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputCustomerEmail, null)),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputCustomerDocumentType, null)),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(ArgentinianInputDocument, null)))));
	}

	function BrazilianInputDocument() {
	    var country = useConfigCountry();
	    var _a = useUserInputValueForInputTag("customerDocument"), customerDocument = _a[0], handleChangeCustomerDocument = _a[1];
	    var customerDocumentValidation = useUserInputValueValidation("customerDocument");
	    var dataState = useDataState();
	    var _b = useUserInputValue("customerDocumentType"), setCustomerDocumentType = _b[1];
	    y$1(function () {
	        if (customerDocument.replace(/[^0-9]/g, "").length <= 11) {
	            setCustomerDocumentType(DocumentType.BR_CPF);
	        }
	        else {
	            setCustomerDocumentType(DocumentType.BR_CNPJ);
	        }
	    }, [customerDocument, setCustomerDocumentType]);
	    return (h(InputField, { inputElement: InputText, labelContent: h(CustomerDocumentLabelText, { country: country }), kind: dataState.isSent() && !customerDocumentValidation.valid ? "error" : "default", inputElementProps: {
	            name: "customer-document",
	            value: customerDocument,
	            onInput: handleChangeCustomerDocument,
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$d(country, customerDocumentValidation) : undefined }));
	}
	function resolveErrorMessage$d(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function InputCustomerPhoneNumber() {
	    var country = useConfigCountry();
	    var _a = useUserInputValueForInputTag("customerPhoneNumber"), customerPhoneNumber = _a[0], handleChangeCustomerPhoneNumber = _a[1];
	    var customerPhoneNumberValidation = useUserInputValueValidation("customerPhoneNumber");
	    var dataState = useDataState();
	    return (h(InputField, { inputElement: InputText, labelContent: h(CustomerPhoneNumberLabelText, { country: country }), kind: dataState.isSent() && !customerPhoneNumberValidation.valid ? "error" : "default", inputElementProps: {
	            name: "customer-phone-number",
	            value: customerPhoneNumber,
	            placeholder: getCustomerPhoneNumberPlaceholderText(country),
	            onInput: handleChangeCustomerPhoneNumber,
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$e(country, customerPhoneNumberValidation) : undefined }));
	}
	function resolveErrorMessage$e(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function BrazilianPersonalInfoForm() {
	    var country = useConfigCountry();
	    var _a = useDeviceSize(), ref = _a[0], deviceSize = _a[1];
	    return (h("div", { ref: ref },
	        h(Text, { category: "display", bold: true, style: { fontSize: "20px" } },
	            h(PersonalInfoFormTitle, { country: country })),
	        h(FormSection, null,
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputCustomerName, null)),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputCustomerEmail, null)),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputCustomerPhoneNumber, null)),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(BrazilianInputDocument, null)))));
	}

	function ChileanPersonalInfoForm() {
	    var country = useConfigCountry();
	    var _a = useDeviceSize(), ref = _a[0], deviceSize = _a[1];
	    return (h("div", { ref: ref },
	        h(Text, { category: "display", bold: true, style: { fontSize: "20px" } },
	            h(PersonalInfoFormTitle, { country: country })),
	        h(FormSection, null,
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputCustomerName, null)),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputCustomerEmail, null)))));
	}

	function ColombianPersonalInfoForm() {
	    var country = useConfigCountry();
	    var _a = useDeviceSize(), ref = _a[0], deviceSize = _a[1];
	    return (h("div", { ref: ref },
	        h(Text, { category: "display", bold: true, style: { fontSize: "20px" } },
	            h(PersonalInfoFormTitle, { country: country })),
	        h(FormSection, null,
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputCustomerName, null)),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputCustomerEmail, null)))));
	}

	function MexicanPersonalInfoForm() {
	    var country = useConfigCountry();
	    var _a = useDeviceSize(), ref = _a[0], deviceSize = _a[1];
	    return (h("div", { ref: ref },
	        h(Text, { category: "display", bold: true, style: { fontSize: "20px" } },
	            h(PersonalInfoFormTitle, { country: country })),
	        h(FormSection, null,
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputCustomerName, null)),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputCustomerEmail, null)))));
	}

	function PeruvianPersonalInfoForm() {
	    var country = useConfigCountry();
	    var _a = useDeviceSize(), ref = _a[0], deviceSize = _a[1];
	    return (h("div", { ref: ref },
	        h(Text, { category: "display", bold: true, style: { fontSize: "20px" } },
	            h(PersonalInfoFormTitle, { country: country })),
	        h(FormSection, null,
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputCustomerName, null)),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputCustomerEmail, null)))));
	}

	function UruguayanInputDocument() {
	    var country = useConfigCountry();
	    var dataState = useDataState();
	    var _a = useUserInputValueForInputTag("customerDocument"), customerDocument = _a[0], handleChangeCustomerDocument = _a[1];
	    var customerDocumentValidation = useUserInputValueValidation("customerDocument");
	    var _b = useUserInputValue("customerDocumentType"), setCustomerDocumentType = _b[1];
	    y$1(function () {
	        setCustomerDocumentType(DocumentType.UY_CI);
	    }, [setCustomerDocumentType]);
	    return (h(InputField, { inputElement: InputText, labelContent: h(CustomerDocumentLabelText, { country: country }), kind: dataState.isSent() && !customerDocumentValidation.valid ? "error" : "default", inputElementProps: {
	            name: "customer-document",
	            value: customerDocument,
	            onInput: handleChangeCustomerDocument,
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$f(country, customerDocumentValidation) : undefined }));
	}
	function resolveErrorMessage$f(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function UruguayanPersonalInfoForm() {
	    var country = useConfigCountry();
	    var _a = useDeviceSize(), ref = _a[0], deviceSize = _a[1];
	    return (h("div", { ref: ref },
	        h(Text, { category: "display", bold: true, style: { fontSize: "20px" } },
	            h(PersonalInfoFormTitle, { country: country })),
	        h(FormSection, null,
	            h(FormItem, { mode: "full" },
	                h(InputCustomerName, null)),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(InputCustomerEmail, null)),
	            h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                h(UruguayanInputDocument, null)))));
	}

	function PersonalInfoForm() {
	    var country = useConfigCountry();
	    switch (country) {
	        case exports.Country.ARGENTINA:
	            return h(ArgentinianPersonalInfoForm, null);
	        case exports.Country.BRAZIL:
	            return h(BrazilianPersonalInfoForm, null);
	        case exports.Country.CHILE:
	            return h(ChileanPersonalInfoForm, null);
	        case exports.Country.COLOMBIA:
	            return h(ColombianPersonalInfoForm, null);
	        case exports.Country.MEXICO:
	            return h(MexicanPersonalInfoForm, null);
	        case exports.Country.PERU:
	            return h(PeruvianPersonalInfoForm, null);
	        case exports.Country.URUGUAY:
	            return h(UruguayanPersonalInfoForm, null);
	        default:
	            throw new Error("PersonalInfoForm not available for country " + country);
	    }
	}

	var Card = Ye.div(templateObject_1$9 || (templateObject_1$9 = __makeTemplateObject(["\n  ", "\n  background: ", ";\n  padding: ", ";\n  border-radius: 3px;\n  border: ", ";\n"], ["\n  ", "\n  background: ", ";\n  padding: ", ";\n  border-radius: 3px;\n  border: ", ";\n"])), baseStyle, getBackgroundColor$1, function (props) { var _a; return (_a = props.padding) !== null && _a !== void 0 ? _a : "22px"; }, getBorderStyle);
	function getBackgroundColor$1(props) {
	    switch (props.kind) {
	        case "warning":
	            return "#fffae5";
	        case "gray":
	            return "#f9f9fa";
	        default:
	            return "white";
	    }
	}
	function getBorderStyle(props) {
	    if (props.bordered) {
	        return "1px solid " + (props.kind === "warning" ? "#ffd751" : "#dbdbdb");
	    }
	    else {
	        return "";
	    }
	}
	var templateObject_1$9;

	var RadioButton = Ye.input.attrs({ type: "radio" })(templateObject_1$a || (templateObject_1$a = __makeTemplateObject(["\n  ", ";\n  -webkit-appearance: none;\n  appearance: none;\n  width: 16px;\n  height: 16px;\n  border: 1px solid #dfe3e7;\n  border-radius: 50%;\n  position: relative;\n  background-size: 16px;\n  cursor: pointer;\n  &:checked {\n    border: none;\n    background-color: ", ";\n    &::after {\n      content: \"\";\n      width: 6px;\n      height: 6px;\n      top: 5px;\n      right: 5px;\n      position: absolute;\n      border-radius: 50%;\n      background-color: white;\n    }\n  }\n  &:disabled {\n    opacity: 50%;\n  }\n"], ["\n  ", ";\n  -webkit-appearance: none;\n  appearance: none;\n  width: 16px;\n  height: 16px;\n  border: 1px solid #dfe3e7;\n  border-radius: 50%;\n  position: relative;\n  background-size: 16px;\n  cursor: pointer;\n  &:checked {\n    border: none;\n    background-color: ", ";\n    &::after {\n      content: \"\";\n      width: 6px;\n      height: 6px;\n      top: 5px;\n      right: 5px;\n      position: absolute;\n      border-radius: 50%;\n      background-color: white;\n    }\n  }\n  &:disabled {\n    opacity: 50%;\n  }\n"])), baseStyle, function (props) { return props.theme.primaryColor; });
	var templateObject_1$a;

	function Accordion(props) {
	    var children = props.children, isOpen = props.isOpen, _a = props.onRequestChange, onRequestChange = _a === void 0 ? function () { } : _a, rest = __rest(props, ["children", "isOpen", "onRequestChange"]);
	    var handleToggle = A$1(function () {
	        if (onRequestChange) {
	            onRequestChange(!isOpen);
	        }
	    }, [onRequestChange, isOpen]);
	    return (h(StyledAccordion, __assign({}, rest), children({
	        handleToggle: handleToggle,
	        isOpen: Boolean(isOpen),
	        onRequestChange: onRequestChange,
	    })));
	}
	var StyledAccordion = Ye.div(templateObject_1$b || (templateObject_1$b = __makeTemplateObject(["\n  ", "\n"], ["\n  ", "\n"])), baseStyle);
	var templateObject_1$b;

	function PaymentTypeAccordion(props) {
	    var children = props.children, isSelected = props.isSelected, _a = props.onRequestChange, onRequestChange = _a === void 0 ? function (selected) { } : _a, _b = props.onRequestSelect, onRequestSelect = _b === void 0 ? function () { } : _b, paymentTypeTitle = props.paymentTypeTitle, brands = props.brands;
	    var onInput = A$1(function (evt) {
	        var checked = true;
	        if (onRequestChange) {
	            onRequestChange(checked);
	            if ( onRequestSelect) {
	                onRequestSelect();
	            }
	        }
	    }, [onRequestChange, onRequestSelect]);
	    var isSinglePaymentType = useIsSinglePaymentType();
	    return (h(Accordion, { isOpen: isSelected, onRequestChange: onRequestChange }, function (_a) {
	        var handleToggle = _a.handleToggle;
	        return (h(Card, { bordered: true, kind: isSelected ? "gray" : "default", padding: "0" },
	            h("label", { style: {
	                    cursor: "pointer",
	                    display: "flex",
	                    justifyContent: "space-between",
	                    padding: "0.5rem 1.25rem",
	                    flexWrap: "wrap",
	                } },
	                h("div", { style: { display: "flex", alignItems: "center" } },
	                    !isSinglePaymentType &&
	                        h(RadioButton, { checked: isSelected, onInput: onInput }),
	                    h(Text, { bold: true, category: "display", style: { fontSize: "0.95em", marginLeft: (isSinglePaymentType ? "0" : "1rem") } }, paymentTypeTitle)),
	                brands && (h("div", { style: { display: "flex", margin: "0.5rem 0" } }, brands.map(function (brand) { return h(BrandIcon, { key: brand.src, brand: brand }); })))),
	            isSelected && (h("div", null, children))));
	    }));
	}
	function BrandIcon(props) {
	    return h("img", __assign({}, props.brand, { style: { margin: "0 0.2rem" } }));
	}

	function InputCardDueDate(_a) {
	    var userInputValueKey = _a.userInputValueKey;
	    var country = useConfigCountry();
	    var _b = useUserInputValueForInputTag(userInputValueKey), cardDueDate = _b[0], handleChangeCardDueDate = _b[1];
	    var cardDueDateValidation = useUserInputValueValidation(userInputValueKey);
	    var dataState = useDataState();
	    return (h(InputField, { inputElement: InputText, labelContent: h(CardDueDateLabelText, { country: country }), kind: dataState.isSent() && !cardDueDateValidation.valid ? "error" : "default", inputElementProps: {
	            autoComplete: "cc-exp",
	            value: narrowToLocallyManagedUserInputValue(cardDueDate),
	            onInput: handleChangeCardDueDate,
	            placeholder: "MM/AAAA",
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$g(country, cardDueDateValidation) : undefined }));
	}
	function resolveErrorMessage$g(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function InputCardCvv(_a) {
	    var userInputValueKey = _a.userInputValueKey;
	    var country = useConfigCountry();
	    var _b = useUserInputValueForInputTag(userInputValueKey), cardCvv = _b[0], handleChangeCardCvv = _b[1];
	    var cardCvvValidation = useUserInputValueValidation(userInputValueKey);
	    var dataState = useDataState();
	    return (h(InputField, { inputElement: InputText, labelContent: h(CardCvvLabelText, { country: country }), kind: dataState.isSent() && !cardCvvValidation.valid ? "error" : "default", inputElementProps: {
	            type: "tel",
	            autoComplete: "cc-csc",
	            value: narrowToLocallyManagedUserInputValue(cardCvv),
	            onInput: handleChangeCardCvv,
	            tip: h(CardCvvTip, { country: country }),
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$h(country, cardCvvValidation) : undefined }));
	}
	function resolveErrorMessage$h(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function InputCardNumber(_a) {
	    var userInputValueKey = _a.userInputValueKey;
	    var country = useConfigCountry();
	    var _b = useUserInputValueForInputTag(userInputValueKey), cardNumber = _b[0], handleChangeCardNumber = _b[1];
	    var cardNumberValidation = useUserInputValueValidation(userInputValueKey);
	    var dataState = useDataState();
	    return (h(InputField, { inputElement: InputText, labelContent: h(CardNumberLabelText, { country: country }), kind: dataState.isSent() && !cardNumberValidation.valid ? "error" : "default", inputElementProps: {
	            autoComplete: "cc-number",
	            value: narrowToLocallyManagedUserInputValue(cardNumber),
	            onInput: handleChangeCardNumber,
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$i(country, cardNumberValidation) : undefined }));
	}
	function resolveErrorMessage$i(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function InputCreditCardInstalments() {
	    var country = useConfigCountry();
	    var _a = useUserInputValueForSelectTag("selectedInstalmentsNumber"), cardInstalments = _a[0], handleChangeCardInstalments = _a[1];
	    var cardInstalmentsValidation = useUserInputValueValidation("selectedInstalmentsNumber");
	    var dataState = useDataState();
	    var _b = useInstalmentsOptions(country), instalmentsOptions = _b[0], shouldDisplay = _b[1];
	    if (!shouldDisplay) {
	        return h(p, null);
	    }
	    return (h(InputField, { inputElement: Select, labelContent: h(SelectedInstalmentsLabelText, { country: country }), kind: dataState.isSent() && !cardInstalmentsValidation.valid ? "error" : "default", inputElementProps: {
	            autoComplete: "cc-csc",
	            value: cardInstalments,
	            onInput: handleChangeCardInstalments,
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$j(country, cardInstalmentsValidation) : undefined }, instalmentsOptions.map(function (_a) {
	        var label = _a.label, value = _a.value;
	        return (h(SelectOption, { key: value, value: value }, label));
	    })));
	}
	function resolveErrorMessage$j(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function getSvgBrandUrl(brand) {
	    return "https://ebanx-js.ebanx.com/v" + "1.35.0" + "/dist/assets/brands/" + brand + ".svg";
	}

	var PAYMENT_TYPES_BRANDS = {
	    "amex": { alt: "American Express", src: getSvgBrandUrl("amex") },
	    "banco-do-brasil": { alt: "Banco do Brasil", src: getSvgBrandUrl("banco-do-brasil") },
	    "cabal": { alt: "Cabal", src: getSvgBrandUrl("cabal") },
	    "caixa": { alt: "Caixa", src: getSvgBrandUrl("caixa") },
	    "carnet": { alt: "Carnet", src: getSvgBrandUrl("carnet") },
	    "creditel": { alt: "Creditel", src: getSvgBrandUrl("creditel") },
	    "diners": { alt: "Diners", src: getSvgBrandUrl("diners") },
	    "elo": { alt: "Elo", src: getSvgBrandUrl("elo") },
	    "hipercard": { alt: "Hipercard", src: getSvgBrandUrl("hipercard") },
	    "lider": { alt: "Lider", src: getSvgBrandUrl("lider") },
	    "mastercard": { alt: "MasterCard", src: getSvgBrandUrl("mastercard") },
	    "maestro": { alt: "Maestro", src: getSvgBrandUrl("maestro") },
	    "magna": { alt: "Magna", src: getSvgBrandUrl("magna") },
	    "naranja": { alt: "Naranja", src: getSvgBrandUrl("naranja") },
	    "nubank": { alt: "Nubank", src: getSvgBrandUrl("nubank") },
	    "oca": { alt: "Oca", src: getSvgBrandUrl("oca") },
	    "santander": { alt: "Santander", src: getSvgBrandUrl("santander") },
	    "visa": { alt: "Visa", src: getSvgBrandUrl("visa") },
	    "walmart": { alt: "Walmart", src: getSvgBrandUrl("walmart") },
	};
	function getPaymentTypesBrands(brandsNames) {
	    return brandsNames.map(function (name) {
	        return PAYMENT_TYPES_BRANDS[name];
	    });
	}

	function CreditCardForm$1() {
	    var _a = useDeviceSize(), ref = _a[0], deviceSize = _a[1];
	    var country = useConfigCountry();
	    var _b = useUserInputValue("selectedPaymentType"), selectedPaymentType = _b[0], setSelectedPaymentType = _b[1];
	    return (h("div", { style: { padding: "0.5rem" }, ref: ref },
	        h(PaymentTypeAccordion, { paymentTypeTitle: h(PaymentTypeTitle, { paymentType: exports.PaymentType.CREDITCARD, country: country }), isSelected: selectedPaymentType === exports.PaymentType.CREDITCARD, onRequestSelect: function () { return setSelectedPaymentType(exports.PaymentType.CREDITCARD); }, brands: getBrandsByCountry(country) },
	            h(FormSection, { style: { padding: "0 0.5rem 0.5rem" } },
	                h(FormItem, { first: true },
	                    h(InputCardNumber, { userInputValueKey: "creditCardNumber" })),
	                h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                    h(InputCardDueDate, { userInputValueKey: "creditCardDueDate" })),
	                h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                    h(InputCardCvv, { userInputValueKey: "creditCardCvv" })),
	                h(FormItem, null,
	                    h(InputCreditCardInstalments, null))))));
	}
	function getBrandsByCountry(country) {
	    switch (country) {
	        case exports.Country.ARGENTINA:
	            return getPaymentTypesBrands(["mastercard", "visa", "amex", "naranja", "cabal", "walmart"]);
	        case exports.Country.BRAZIL:
	            return getPaymentTypesBrands(["mastercard", "visa", "elo", "amex", "hipercard"]);
	        case exports.Country.CHILE:
	            return getPaymentTypesBrands(["mastercard", "visa", "amex"]);
	        case exports.Country.COLOMBIA:
	            return getPaymentTypesBrands(["mastercard", "visa", "amex", "diners"]);
	        case exports.Country.MEXICO:
	            return getPaymentTypesBrands(["mastercard", "visa", "amex", "carnet"]);
	        case exports.Country.PERU:
	            return getPaymentTypesBrands(["mastercard", "visa", "amex", "diners"]);
	        case exports.Country.URUGUAY:
	            return getPaymentTypesBrands(["mastercard", "visa", "oca", "creditel", "lider"]);
	        default:
	            throw new Error("Brands not set for " + country);
	    }
	}

	function InputCardHolderName(_a) {
	    var userInputValueKey = _a.userInputValueKey;
	    var country = useConfigCountry();
	    var _b = useUserInputValueForInputTag(userInputValueKey), cardHolderName = _b[0], handleChangeCardHolderName = _b[1];
	    var cardHolderNameValidation = useUserInputValueValidation(userInputValueKey);
	    var dataState = useDataState();
	    return (h(InputField, { inputElement: InputText, labelContent: h(CardHolderNameLabelText, { country: country }), kind: dataState.isSent() && !cardHolderNameValidation.valid ? "error" : "default", inputElementProps: {
	            autoComplete: "cc-name",
	            value: narrowToLocallyManagedUserInputValue(cardHolderName),
	            onInput: handleChangeCardHolderName,
	        }, assistiveTextContent: dataState.isSent() ? resolveErrorMessage$k(country, cardHolderNameValidation) : undefined }));
	}
	function resolveErrorMessage$k(country, validation) {
	    if (validation && !validation.valid) {
	        return getErrorMessage({ errorCode: validation.errorCode, country: country });
	    }
	}

	function DebitCardForm$1() {
	    var _a = useDeviceSize(), ref = _a[0], deviceSize = _a[1];
	    var country = useConfigCountry();
	    var _b = useUserInputValue("selectedPaymentType"), selectedPaymentType = _b[0], setSelectedPaymentType = _b[1];
	    return (h("div", { style: { padding: "0.5rem" }, ref: ref },
	        h(PaymentTypeAccordion, { paymentTypeTitle: h(PaymentTypeTitle, { paymentType: exports.PaymentType.DEBITCARD, country: country }), isSelected: selectedPaymentType === exports.PaymentType.DEBITCARD, onRequestSelect: function () { return setSelectedPaymentType(exports.PaymentType.DEBITCARD); }, brands: getBrandsByCountry$1(country) },
	            h(FormSection, { style: { padding: "0 0.5rem 0.5rem" } },
	                h(FormItem, { first: true },
	                    h(InputCardNumber, { userInputValueKey: "debitCardNumber" })),
	                country === exports.Country.BRAZIL && (h(FormItem, null,
	                    h(InputCardHolderName, { userInputValueKey: "debitCardHolderName" }))),
	                h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                    h(InputCardDueDate, { userInputValueKey: "debitCardDueDate" })),
	                h(FormItem, { mode: deviceSize === "medium" ? "full" : "half" },
	                    h(InputCardCvv, { userInputValueKey: "debitCardCvv" }))))));
	}
	function getBrandsByCountry$1(country) {
	    switch (country) {
	        case exports.Country.ARGENTINA:
	            return getPaymentTypesBrands(["visa", "naranja", "maestro"]);
	        case exports.Country.BRAZIL:
	            return getPaymentTypesBrands(["banco-do-brasil", "santander", "nubank", "caixa"]);
	        case exports.Country.CHILE:
	            return getPaymentTypesBrands(["mastercard", "visa", "amex", "magna"]);
	        case exports.Country.COLOMBIA:
	            return getPaymentTypesBrands(["mastercard", "visa"]);
	        case exports.Country.MEXICO:
	            return getPaymentTypesBrands(["mastercard", "visa", "amex", "carnet"]);
	        case exports.Country.PERU:
	            return getPaymentTypesBrands(["mastercard", "visa"]);
	        case exports.Country.URUGUAY:
	            return getPaymentTypesBrands(["visa"]);
	        default:
	            throw new Error("Brands not set for " + country);
	    }
	}

	function PaymentTypesForms() {
	    var allowedPaymentTypes = useAllowedPaymentTypes();
	    var country = useConfigCountry();
	    var isSinglePaymentType = useIsSinglePaymentType();
	    return (h("div", { style: { marginTop: "1.5rem" } },
	        !isSinglePaymentType &&
	            h(Text, { category: "display", bold: true, style: { fontSize: "20px" } }, getPaymentTypesFormsTitle(country)),
	        allowedPaymentTypes.map(renderAllowedPaymentType)));
	}
	function renderAllowedPaymentType(paymentType) {
	    switch (paymentType) {
	        case exports.PaymentType.CREDITCARD:
	            return h(CreditCardForm$1, null);
	        case exports.PaymentType.DEBITCARD:
	            return h(DebitCardForm$1, null);
	        default:
	            throw new Error("Payment type form not available for " + paymentType);
	    }
	}
	function getPaymentTypesFormsTitle(country) {
	    switch (country) {
	        case exports.Country.BRAZIL:
	            return "Selecione o método de pagamento";
	        default:
	            return "Seleccione su método de pago";
	    }
	}

	function VanillaLookAndFeel(_a) {
	    var options = _a.options;
	    return (h(Le, { theme: buildTheme(options) },
	        h(HelmetExport, null,
	            h("link", { rel: "stylesheet", href: "https://fonts.googleapis.com/css?family=Open+Sans:400,400i,600,600i" }),
	            h("link", { rel: "stylesheet", href: "https://cdn-assets.ebanx.com/fonts/gilroy/gilroy.css" }),
	            h("link", { rel: "stylesheet", href: "https://fonts.googleapis.com/icon?family=Material+Icons" })),
	        h("div", { id: "ebanx-dropin", style: { fontFamily: "Open Sans", fontSize: "14px" } },
	            h(PersonalInfoForm, null),
	            h(BillingAddressForm, null),
	            h(PaymentTypesForms, null),
	            h(PlaceOrderButton, null))));
	}
	function PlaceOrderButton() {
	    var country = useConfigCountry();
	    var selectedPaymentType = useUserInputValue("selectedPaymentType")[0];
	    var dataState = useDataState();
	    return (h("div", { style: { padding: "0.5rem", marginTop: "1.5rem" } },
	        h(Button, { block: true, busy: dataState.isSending(), disabled: dataState.isSending(), style: { textTransform: "uppercase" } },
	            h(PlaceOrderButtonTitle, { country: country, paymentType: selectedPaymentType }))));
	}

	function LookAndFeelRender(_a) {
	    var options = _a.options;
	    switch (options.name) {
	        case "raw":
	            return h(RawLookAndFeel, { options: options });
	        case "vanilla":
	            return h(VanillaLookAndFeel, { options: options });
	        default:
	            throw new Error("Invalid LookAndFeelRender options: " + JSON.stringify(options));
	    }
	}

	function buildPersonalInfoData(config, amount, currencyCode, userInputValues, userInputValuesValidation) {
	    return __awaiter(this, void 0, void 0, function () {
	        var billingAddressCountry, error;
	        return __generator(this, function (_a) {
	            billingAddressCountry = userInputValues.billingAddressCountry;
	            error = getPersonalInfoValidationFirstError(userInputValuesValidation, billingAddressCountry);
	            if (error) {
	                throw new Error("Validation error for personal info data");
	            }
	            return [2 /*return*/, __assign({ name: userInputValues.customerName, email: userInputValues.customerEmail, phone_number: userInputValues.customerPhoneNumber }, buildSpecificPersonalInfoByCountry(userInputValues, billingAddressCountry))];
	        });
	    });
	}
	function buildSpecificPersonalInfoByCountry(userInputValues, country) {
	    switch (country) {
	        case exports.Country.ARGENTINA:
	        case exports.Country.BRAZIL:
	        case exports.Country.CHILE:
	        case exports.Country.COLOMBIA:
	        case exports.Country.URUGUAY:
	            return { document: userInputValues.customerDocument };
	        default:
	            return {};
	    }
	}

	function buildBillingAddressData(config, amount, currencyCode, userInputValues, userInputValuesValidation) {
	    return __awaiter(this, void 0, void 0, function () {
	        var billingAddressCountry, error;
	        return __generator(this, function (_a) {
	            billingAddressCountry = userInputValues.billingAddressCountry;
	            error = getBillingAddressValidationFirstError(userInputValuesValidation, billingAddressCountry);
	            if (error) {
	                throw new Error("Validation error for billing address data");
	            }
	            return [2 /*return*/, __assign({ country: getCountryCode(billingAddressCountry).toUpperCase(), zipcode: userInputValues.billingAddressZipcode, state: userInputValues.billingAddressState, city: userInputValues.billingAddressCity, address: userInputValues.billingAddressStreet, street_number: userInputValues.billingAddressStreetNumber }, (userInputValues.billingAddressComplement ? { street_complement: userInputValues.billingAddressComplement } : {}))];
	        });
	    });
	}

	function getDeviceId(config) {
	    return __awaiter(this, void 0, void 0, function () {
	        var fingerprintModule, device_id;
	        return __generator(this, function (_a) {
	            switch (_a.label) {
	                case 0:
	                    fingerprintModule = new DeviceFingerprintModule(config);
	                    return [4 /*yield*/, fingerprintModule.getSession()];
	                case 1:
	                    device_id = (_a.sent()).device_id;
	                    return [2 /*return*/, device_id];
	            }
	        });
	    });
	}

	function tokenizeCard(userInputValues, config) {
	    return __awaiter(this, void 0, void 0, function () {
	        var billingAddressCountry, tokenizer, isDebit, card;
	        return __generator(this, function (_a) {
	            switch (_a.label) {
	                case 0:
	                    billingAddressCountry = userInputValues.billingAddressCountry;
	                    tokenizer = new CardTokenizerModule(config);
	                    isDebit = userInputValues.selectedPaymentType === exports.PaymentType.DEBITCARD;
	                    card = isDebit
	                        ? resolveDebitCardTokenizerOption(userInputValues, config)
	                        : resolveCreditCardTokenizerOption(userInputValues);
	                    return [4 /*yield*/, tokenizer.tokenize({
	                            card: card,
	                            countryCode: getCountryCode(billingAddressCountry),
	                            paymentTypeCode: "creditcard",
	                        })];
	                case 1: return [2 /*return*/, _a.sent()];
	            }
	        });
	    });
	}
	function resolveDebitCardTokenizerOption(userInputValues, config) {
	    var isBrazil = config.country === exports.Country.BRAZIL;
	    return {
	        holderName: userInputValues[isBrazil ? "debitCardHolderName" : "customerName"],
	        number: userInputValues.debitCardNumber,
	        cvv: userInputValues.debitCardCvv,
	        dueDate: formatCardExpDateWithFullYear(userInputValues.debitCardDueDate),
	    };
	}
	function resolveTokenizedCard(userInputValues, config) {
	    if (typeof userInputValues.tokenizedCreditCard === "function") {
	        return userInputValues.tokenizedCreditCard();
	    }
	    return tokenizeCard(userInputValues, config);
	}
	function resolveCreditCardTokenizerOption(userInputValues) {
	    if (isExternallyManagedUserInputValue(userInputValues.creditCardNumber)
	        || isExternallyManagedUserInputValue(userInputValues.creditCardCvv)
	        || isExternallyManagedUserInputValue(userInputValues.creditCardDueDate)) {
	        throw new Error("Could not resolve credit card tokenizer option due to its values being managed externally");
	    }
	    return {
	        holderName: userInputValues.customerName,
	        number: userInputValues.creditCardNumber,
	        cvv: userInputValues.creditCardCvv,
	        dueDate: formatCardExpDateWithFullYear(userInputValues.creditCardDueDate),
	    };
	}

	function buildCreditCardData(config, userInputValues) {
	    return __awaiter(this, void 0, void 0, function () {
	        var deviceId, cardDetails, tokenizedCard;
	        return __generator(this, function (_a) {
	            switch (_a.label) {
	                case 0: return [4 /*yield*/, getDeviceId(config)];
	                case 1:
	                    deviceId = _a.sent();
	                    return [4 /*yield*/, resolveCardDetails(userInputValues)];
	                case 2:
	                    cardDetails = _a.sent();
	                    return [4 /*yield*/, resolveTokenizedCard(userInputValues, config)];
	                case 3:
	                    tokenizedCard = _a.sent();
	                    return [2 /*return*/, {
	                            creditcard: __assign(__assign({}, cardDetails), { token: tokenizedCard.token }),
	                            instalments: parseInt(userInputValues.selectedInstalmentsNumber),
	                            payment_type: "creditcard",
	                            payment_type_code: tokenizedCard.payment_type_code,
	                            device_id: deviceId,
	                        }];
	            }
	        });
	    });
	}
	function resolveCardDetails(userInputValues) {
	    return __awaiter(this, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            if (typeof userInputValues.creditCardDetails === "function") {
	                return [2 /*return*/, userInputValues.creditCardDetails()];
	            }
	            if (isExternallyManagedUserInputValue(userInputValues.creditCardNumber)
	                || isExternallyManagedUserInputValue(userInputValues.creditCardDueDate)) {
	                throw new Error("Could not resolve credit card details due to its values being managed externally");
	            }
	            return [2 /*return*/, {
	                    bin: extractCardBin(userInputValues.creditCardNumber),
	                    exp_date: formatCardExpDateWithFullYear(userInputValues.creditCardDueDate),
	                    last_four: extractCardLastFour(userInputValues.creditCardNumber),
	                }];
	        });
	    });
	}

	function build3DSDebitCardData(config, amount, currencyCode, userInputValues) {
	    return __awaiter(this, void 0, void 0, function () {
	        var billingAddressCountry, threeDSecure, threeDSecureResponse, tokenizedCard, deviceId;
	        return __generator(this, function (_a) {
	            switch (_a.label) {
	                case 0:
	                    billingAddressCountry = userInputValues.billingAddressCountry;
	                    threeDSecure = new ThreeDSecureModule(config);
	                    return [4 /*yield*/, threeDSecure.authenticate({
	                            orderInformation: {
	                                amountDetails: {
	                                    totalAmount: amount,
	                                    currency: currencyCode,
	                                },
	                                billTo: {
	                                    address1: userInputValues.billingAddressStreet,
	                                    administrativeArea: userInputValues.billingAddressState,
	                                    country: getCountryCode(billingAddressCountry),
	                                    email: userInputValues.customerEmail,
	                                    homePhone: userInputValues.customerPhoneNumber,
	                                    locality: userInputValues.billingAddressCity,
	                                    postalCode: userInputValues.billingAddressZipcode,
	                                    mobilePhone: userInputValues.customerPhoneNumber,
	                                },
	                            },
	                            paymentInformation: {
	                                card: {
	                                    number: userInputValues.debitCardNumber,
	                                    expirationMonth: getExpiryMonthFromCardExpiration(userInputValues.debitCardDueDate),
	                                    expirationYear: getExpiryYearFromCardExpiration(userInputValues.debitCardDueDate),
	                                    holderName: userInputValues.debitCardHolderName,
	                                },
	                            },
	                            personalIdentification: {
	                                id: userInputValues.customerDocument,
	                                type: PersonalIdentificationType.CPF,
	                            },
	                        })];
	                case 1:
	                    threeDSecureResponse = _a.sent();
	                    return [4 /*yield*/, tokenizeCard(userInputValues, config)];
	                case 2:
	                    tokenizedCard = _a.sent();
	                    return [4 /*yield*/, getDeviceId(config)];
	                case 3:
	                    deviceId = _a.sent();
	                    return [2 /*return*/, {
	                            card: __assign(__assign(__assign({}, tokenizedCard), threeDSecureResponse), { bin: extractCardBin(userInputValues.debitCardNumber), exp_date: formatCardExpDateWithFullYear(userInputValues.debitCardDueDate), last_four: extractCardLastFour(userInputValues.debitCardNumber) }),
	                            instalments: 1,
	                            payment_type: "debitcard",
	                            payment_type_code: "debitcard",
	                            device_id: deviceId,
	                        }];
	            }
	        });
	    });
	}
	function getExpiryMonthFromCardExpiration(expiryDate) {
	    return expiryDate.substring(0, 2);
	}
	function getExpiryYearFromCardExpiration(expiryDate) {
	    return formatCardExpDateWithFullYear(expiryDate).substring(3);
	}

	function buildDebitCardData(config, amount, currencyCode, userInputValues) {
	    return __awaiter(this, void 0, void 0, function () {
	        var isBrazil, tokenizedCard, deviceId;
	        return __generator(this, function (_a) {
	            switch (_a.label) {
	                case 0:
	                    isBrazil = userInputValues.billingAddressCountry === exports.Country.BRAZIL;
	                    if (isBrazil) {
	                        return [2 /*return*/, build3DSDebitCardData(config, amount, currencyCode, userInputValues)];
	                    }
	                    return [4 /*yield*/, tokenizeCard(userInputValues, config)];
	                case 1:
	                    tokenizedCard = _a.sent();
	                    return [4 /*yield*/, getDeviceId(config)];
	                case 2:
	                    deviceId = _a.sent();
	                    return [2 /*return*/, {
	                            creditcard: {
	                                bin: extractCardBin(userInputValues.debitCardNumber),
	                                exp_date: formatCardExpDateWithFullYear(userInputValues.debitCardDueDate),
	                                last_four: extractCardLastFour(userInputValues.debitCardNumber),
	                                token: tokenizedCard.token,
	                            },
	                            instalments: 1,
	                            payment_type: "debitcard",
	                            payment_type_code: tokenizedCard.payment_type_code,
	                            device_id: deviceId,
	                        }];
	            }
	        });
	    });
	}

	function buildPaymentTypeData(config, amount, currencyCode, userInputValues, userInputValuesValidation) {
	    var billingAddressCountry = userInputValues.billingAddressCountry, selectedPaymentType = userInputValues.selectedPaymentType;
	    var error = getSelectedPaymentTypeValidationFirstError(userInputValuesValidation, billingAddressCountry, selectedPaymentType);
	    if (error) {
	        throw new Error("Validation error for payment type \"" + selectedPaymentType + "\"");
	    }
	    switch (selectedPaymentType) {
	        case "creditcard":
	            return buildCreditCardData(config, userInputValues);
	        case "debitcard":
	            return buildDebitCardData(config, amount, currencyCode, userInputValues);
	        default:
	            throw new Error("Unknown payment type \"" + selectedPaymentType + "\"");
	    }
	}

	function buildPaymentDataFragment(config, amount, currencyCode, userInputValues, userInputValuesValidation) {
	    return __awaiter(this, void 0, void 0, function () {
	        var _a, _b, _c;
	        return __generator(this, function (_d) {
	            switch (_d.label) {
	                case 0:
	                    _a = [{}];
	                    return [4 /*yield*/, buildPersonalInfoData(config, amount, currencyCode, userInputValues, userInputValuesValidation)];
	                case 1:
	                    _b = [__assign.apply(void 0, _a.concat([(_d.sent())]))];
	                    return [4 /*yield*/, buildBillingAddressData(config, amount, currencyCode, userInputValues, userInputValuesValidation)];
	                case 2:
	                    _c = [__assign.apply(void 0, _b.concat([(_d.sent())]))];
	                    return [4 /*yield*/, buildPaymentTypeData(config, amount, currencyCode, userInputValues, userInputValuesValidation)];
	                case 3: return [2 /*return*/, __assign.apply(void 0, [__assign.apply(void 0, _c.concat([(_d.sent())])), { user_value_5: "ebanxjs-dropin" }])];
	            }
	        });
	    });
	}

	function useSetInputsChangeDispatchers(userInputValues, baseUserInputValuesValidation) {
	    var boundUserInputChanges = h$1(new Set());
	    var setBoundUserInputChanges = function (key) { boundUserInputChanges.current.add(key); };
	    var dispatcherOptions = { userInputValues: userInputValues, baseUserInputValuesValidation: baseUserInputValuesValidation, setBoundUserInputChanges: setBoundUserInputChanges };
	    useSetInputChangeDispatcher("billingAddressCountry", dispatcherOptions);
	    useSetInputChangeDispatcher("billingAddressCity", dispatcherOptions);
	    useSetInputChangeDispatcher("billingAddressStreet", dispatcherOptions);
	    useSetInputChangeDispatcher("billingAddressStreetNumber", dispatcherOptions);
	    useSetInputChangeDispatcher("billingAddressState", dispatcherOptions);
	    useSetInputChangeDispatcher("billingAddressZipcode", dispatcherOptions);
	    useSetInputChangeDispatcher("billingAddressComplement", dispatcherOptions);
	    useSetInputChangeDispatcher("customerName", dispatcherOptions);
	    useSetInputChangeDispatcher("customerDocument", dispatcherOptions);
	    useSetInputChangeDispatcher("customerEmail", dispatcherOptions);
	    useSetInputChangeDispatcher("customerPhoneNumber", dispatcherOptions);
	    useSetInputChangeDispatcher("creditCardCvv", dispatcherOptions);
	    useSetInputChangeDispatcher("creditCardDueDate", dispatcherOptions);
	    useSetInputChangeDispatcher("creditCardHolderName", dispatcherOptions);
	    useSetInputChangeDispatcher("creditCardNumber", dispatcherOptions);
	    useSetInputChangeDispatcher("debitCardCvv", dispatcherOptions);
	    useSetInputChangeDispatcher("debitCardDueDate", dispatcherOptions);
	    useSetInputChangeDispatcher("debitCardHolderName", dispatcherOptions);
	    useSetInputChangeDispatcher("debitCardNumber", dispatcherOptions);
	    useSetInputChangeDispatcher("selectedInstalmentsNumber", dispatcherOptions);
	    useSetInputChangeDispatcher("selectedPaymentType", dispatcherOptions);
	    var userInputValuesKeys = Object.keys(userInputValues);
	    var shouldWarnDeveloper = userInputValuesKeys.some(function (key) {
	        if (["customerDocumentType", "tokenizedCreditCard", "creditCardDetails"].includes(key))
	            return false;
	        return !boundUserInputChanges.current.has(key);
	    });
	    if (shouldWarnDeveloper)
	        throw new Error("Dear developer, please call useSetInputChangeDispatcher for each UserInputValues key!");
	}
	function useSetInputChangeDispatcher(inputKey, options) {
	    var userInputValues = options.userInputValues, baseUserInputValuesValidation = options.baseUserInputValuesValidation, setBoundUserInputChanges = options.setBoundUserInputChanges;
	    setBoundUserInputChanges(inputKey);
	    var value = userInputValues[inputKey];
	    var shouldDispatch = h$1(false);
	    y$1(function () {
	        if (shouldDispatch.current && typeof value === "string") {
	            dispatchInputChangeEvent({ inputKey: inputKey, value: value, userInputValues: userInputValues, baseUserInputValuesValidation: baseUserInputValuesValidation });
	        }
	        else {
	            shouldDispatch.current = true;
	        }
	        // We need to update the context only when the exact key change, not the whole object
	        // eslint-disable-next-line react-hooks/exhaustive-deps
	    }, [inputKey, value]);
	}

	function Controller(props) {
	    var _a = m$1(props.amount), amount = _a[0], setAmount = _a[1];
	    var currencyCode = m$1(props.currencyCode)[0];
	    var _b = useUserInputValuesState(props.config, props.values), userInputValues = _b[0], setUserInputValues = _b[1];
	    var _c = useUserInputValuesValidationState(userInputValues), userInputValuesValidation = _c[0], setUserInputValuesValidation = _c[1];
	    var _d = useUiElementsContextState(props.lookAndFeelOptions), uiElementsContext = _d[0], setUiElementsContextStyle = _d[1];
	    var _e = m$1(DataState.NULL), dataState = _e[0], setDataState = _e[1];
	    var delegateBuildPaymentDataFragment = useBuildPaymentDataFragment(props.config, amount, currencyCode, userInputValues, userInputValuesValidation);
	    var delegateHandleSubmit = useHandleSubmit(setDataState, delegateBuildPaymentDataFragment);
	    var resolveTokenizedCard = useResolveTokenizedCard(userInputValues, props.config);
	    y$1(function () {
	        setDefaultPaymentType(props.allowedPaymentTypes, setUserInputValues);
	    }, [props.allowedPaymentTypes, setUserInputValues]);
	    y$1(function () {
	        setUserInputValuesValidation(function (userInputValuesValidation) {
	            return validateUserInputValues(userInputValues, userInputValuesValidation);
	        });
	    }, [userInputValues, setUserInputValuesValidation]);
	    y$1(function () {
	        externalEvents.listen("setAmount", function (amount) {
	            setAmount(amount);
	        });
	    }, []);
	    y$1(function () {
	        externalEvents.listen("setLookAndFeelTheme", function (theme) {
	            setUiElementsContextStyle(resolveUiElementsStyleFromLookAndFeelTheme(theme));
	        });
	    }, [setUiElementsContextStyle]);
	    y$1(function () {
	        externalEvents.dispatch("formReady", null);
	    }, []);
	    useSetInputsChangeDispatchers(userInputValues, userInputValuesValidation);
	    y$1(function () {
	        externalEvents.listenUnique("delegateBuildPaymentDataFragment", delegateBuildPaymentDataFragment);
	    }, [delegateBuildPaymentDataFragment]);
	    y$1(function () {
	        externalEvents.listenUnique("delegateHandleSubmit", delegateHandleSubmit);
	    }, [delegateHandleSubmit]);
	    y$1(function () {
	        externalEvents.listenUnique("delegateCardToken", resolveTokenizedCard);
	    }, [resolveTokenizedCard]);
	    y$1(function () {
	        var firstError = getUserInputValuesValidationFirstError(userInputValuesValidation);
	        externalEvents.dispatch("setFirstError", firstError);
	    }, [userInputValuesValidation]);
	    y$1(function () {
	        var billingAddressCountry = userInputValues.billingAddressCountry;
	        var selectedPaymentType = userInputValues.selectedPaymentType;
	        if (!getFormValidationFirstError(userInputValuesValidation, billingAddressCountry, selectedPaymentType)) {
	            externalEvents.dispatch("formComplete", null);
	        }
	    }, [userInputValuesValidation, userInputValues.billingAddressCountry, userInputValues.selectedPaymentType]);
	    y$1(function () {
	        var billingAddressCountry = userInputValues.billingAddressCountry;
	        var selectedPaymentType = userInputValues.selectedPaymentType;
	        if (!getSelectedPaymentTypeValidationFirstError(userInputValuesValidation, billingAddressCountry, selectedPaymentType)) {
	            externalEvents.dispatch("cardComplete", null);
	        }
	    }, [userInputValuesValidation, userInputValues.billingAddressCountry, userInputValues.selectedPaymentType]);
	    return (h(ConfigContextProvider, { value: props.config },
	        h(OrderDetailsProvider, { value: {
	                allowedPaymentTypes: props.allowedPaymentTypes,
	                amount: amount,
	                currencyCode: currencyCode,
	                instalmentsNumber: props.instalmentsNumber,
	            } },
	            h(UserInputValuesProvider, { value: { userInputValues: userInputValues, setUserInputValues: setUserInputValues } },
	                h(UserInputValuesValidationProvider, { value: { userInputValuesValidation: userInputValuesValidation, setUserInputValuesValidation: setUserInputValuesValidation } },
	                    h(DataStateProvider, { value: dataState },
	                        h(UiElementsContextProvider, { value: uiElementsContext },
	                            h(LookAndFeelRender, { options: props.lookAndFeelOptions }))))))));
	}
	function setDefaultPaymentType(allowedPaymentTypes, setUserInputValues) {
	    var isSinglePaymentType = allowedPaymentTypes.length === 1;
	    if (isSinglePaymentType) {
	        setUserInputValues(function (userInputValues) {
	            return __assign(__assign({}, userInputValues), { selectedPaymentType: allowedPaymentTypes[0] });
	        });
	    }
	}
	function useBuildPaymentDataFragment(config, amount, currencyCode, userInputValues, userInputValuesValidation) {
	    var _this = this;
	    return A$1(function () { return __awaiter(_this, void 0, void 0, function () {
	        var paymentDataFragment, error_1;
	        return __generator(this, function (_a) {
	            switch (_a.label) {
	                case 0:
	                    _a.trys.push([0, 2, , 3]);
	                    return [4 /*yield*/, buildPaymentDataFragment(config, amount, currencyCode, userInputValues, userInputValuesValidation)];
	                case 1:
	                    paymentDataFragment = _a.sent();
	                    externalEvents.dispatch("handlePaymentDataFragment", paymentDataFragment);
	                    return [3 /*break*/, 3];
	                case 2:
	                    error_1 = _a.sent();
	                    externalEvents.dispatch("handlePaymentDataFragment", error_1);
	                    return [3 /*break*/, 3];
	                case 3: return [2 /*return*/];
	            }
	        });
	    }); }, [amount, currencyCode, userInputValues, userInputValuesValidation, config]);
	}
	function useResolveTokenizedCard(userInputValues, config) {
	    var _this = this;
	    return A$1(function () { return __awaiter(_this, void 0, void 0, function () {
	        var tokenizedCard, error_2;
	        return __generator(this, function (_a) {
	            switch (_a.label) {
	                case 0:
	                    _a.trys.push([0, 2, , 3]);
	                    return [4 /*yield*/, resolveTokenizedCard(userInputValues, config)];
	                case 1:
	                    tokenizedCard = _a.sent();
	                    externalEvents.dispatch("cardSuccessfullyTokenized", tokenizedCard);
	                    return [3 /*break*/, 3];
	                case 2:
	                    error_2 = _a.sent();
	                    externalEvents.dispatch("cardSuccessfullyTokenized", error_2);
	                    return [3 /*break*/, 3];
	                case 3: return [2 /*return*/];
	            }
	        });
	    }); }, [userInputValues, config]);
	}
	function useHandleSubmit(setDataState, delegateBuildPaymentDataFragment) {
	    var _this = this;
	    return A$1(function () { return __awaiter(_this, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            switch (_a.label) {
	                case 0:
	                    setDataState(DataState.SENDING);
	                    return [4 /*yield*/, delegateBuildPaymentDataFragment()];
	                case 1:
	                    _a.sent();
	                    setDataState(DataState.SENT);
	                    return [2 /*return*/];
	            }
	        });
	    }); }, [delegateBuildPaymentDataFragment, setDataState]);
	}

	function parseDropinMountOptions(config, options) {
	    if (options === undefined)
	        throw new TypeError("Missing options for mounting EBANX Dropin");
	    if (isNotLiteralObject(options))
	        throw new TypeError("Invalid options for mounting EBANX Dropin");
	    var mountOptions = __assign(__assign({}, getDefaultDropinMountOptions(options.amount)), options);
	    validateDropinMountOptions(mountOptions, config);
	    return sanitizeMountOptions(mountOptions);
	}
	function isNotLiteralObject(value) {
	    return !value || typeof value !== "object" || Array.isArray(value);
	}
	function getDefaultDropinMountOptions(amount) {
	    return {
	        amount: amount,
	        instalments: 1,
	        lookAndFeel: {
	            name: "vanilla",
	        },
	        paymentMethods: "_all",
	        values: {},
	    };
	}
	function sanitizeMountOptions(mountOptions) {
	    return __assign(__assign({}, mountOptions), { values: sanitizeValues(mountOptions.values) });
	}
	function sanitizeValues(values) {
	    return allowedUserInputValuesKeysForMount.reduce(function (sanitizedValues, key) {
	        var _a;
	        if (values[key]) {
	            sanitizedValues = __assign(__assign({}, sanitizedValues), (_a = {}, _a[key] = values[key], _a));
	        }
	        return sanitizedValues;
	    }, {});
	}
	function validateDropinMountOptions(options, config) {
	    validateAmount(options.amount);
	    validateInstalments(options.instalments, config);
	    validateLookAndFeel(options.lookAndFeel);
	    validatePaymentMethods(options.paymentMethods);
	    validateValues(options.values);
	}
	function validateAmount(amount) {
	    var amountRegex = /^\d+(\.\d{1,2})?$/;
	    if (typeof amount !== "string" || !amountRegex.test(amount))
	        handleErrorForInvalidOptionValue("amount", amount);
	}
	function validateInstalments(instalments, config) {
	    if (typeof instalments !== "number")
	        handleErrorForInvalidOptionValue("instalments", instalments);
	    var availableInstalments = getAvailableInstalmentNumbersForCountry(config.country);
	    if (!Number.isInteger(instalments) || !availableInstalments.includes(instalments))
	        handleErrorForOption("instalments", "Country " + config.country + " does not support " + instalments + " instalments");
	}
	function validateLookAndFeel(lookAndFeel) {
	    if (!lookAndFeel || (typeof lookAndFeel !== "string" && isNotLiteralObject(lookAndFeel)))
	        handleErrorForInvalidOptionValue("lookAndFeel", lookAndFeel);
	    var lookAndFeelName = typeof lookAndFeel === "object" ? lookAndFeel.name : lookAndFeel;
	    if (!lookAndFeelName)
	        handleErrorForInvalidOptionValue("lookAndFeel", lookAndFeel);
	    if (!getAllLookAndFeels().includes(lookAndFeelName))
	        handleErrorForOption("lookAndFeel", "Unsupported Look and Feel \"" + lookAndFeel + "\"");
	}
	function validatePaymentMethods(paymentMethods) {
	    if (paymentMethods === "_all")
	        return;
	    if (!Array.isArray(paymentMethods) || paymentMethods.length === 0)
	        handleErrorForInvalidOptionValue("paymentMethods", paymentMethods);
	    var allPaymentTypes = getAllPaymentTypes();
	    var invalidPaymentMethod = paymentMethods.find(function (paymentMethod) { return !allPaymentTypes.includes(paymentMethod); });
	    if (invalidPaymentMethod !== undefined)
	        handleErrorForOption("paymentMethods", "Unsupported payment type \"" + invalidPaymentMethod + "\"");
	}
	function validateValues(values) {
	    if (isNotLiteralObject(values))
	        handleErrorForInvalidOptionValue("values", values);
	    Object.values(values).forEach(function (value) {
	        if (typeof value !== "string")
	            handleErrorForOption("values", "All values must be strings");
	    });
	}
	function handleErrorForOption(optionName, message) {
	    throw new Error("Invalid " + optionName + " option - " + message);
	}
	function handleErrorForInvalidOptionValue(optionName, value) {
	    throw new Error("Invalid value for " + optionName + " option: " + value);
	}
	var allowedUserInputValuesKeysForMount = [
	    "billingAddressCity",
	    "billingAddressStreet",
	    "billingAddressStreetNumber",
	    "billingAddressState",
	    "billingAddressZipcode",
	    "billingAddressComplement",
	    "customerName",
	    "customerDocument",
	    "customerEmail",
	    "customerPhoneNumber",
	    "creditCardCvv",
	    "creditCardDueDate",
	    "creditCardHolderName",
	    "creditCardNumber",
	    "debitCardCvv",
	    "debitCardDueDate",
	    "debitCardHolderName",
	    "debitCardNumber",
	    "selectedInstalmentsNumber",
	    "selectedPaymentType",
	];

	var DropinComponent = /** @class */ (function () {
	    function DropinComponent(config) {
	        var _this = this;
	        this.config = config;
	        this.requestCardToken = function () { return __awaiter(_this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                externalEvents.dispatch("delegateCardToken", null);
	                return [2 /*return*/, this.handleCardToken()];
	            });
	        }); };
	        this.handleSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                event.preventDefault();
	                externalEvents.dispatch("delegateHandleSubmit", event);
	                return [2 /*return*/, this.handlePaymentDataFragment()];
	            });
	        }); };
	        this.requestPaymentData = function () { return __awaiter(_this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                externalEvents.dispatch("delegateBuildPaymentDataFragment", null);
	                return [2 /*return*/, this.handlePaymentDataFragment()];
	            });
	        }); };
	        this.handleCardToken = function () { return __awaiter(_this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                return [2 /*return*/, new Promise(function (resolve, reject) {
	                        externalEvents.listenOnce("cardSuccessfullyTokenized", function (response) {
	                            if (response instanceof Error) {
	                                reject(response);
	                            }
	                            else {
	                                resolve(response);
	                            }
	                        });
	                    })];
	            });
	        }); };
	        this.handlePaymentDataFragment = function () { return __awaiter(_this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                return [2 /*return*/, new Promise(function (resolve, reject) {
	                        externalEvents.listenOnce("handlePaymentDataFragment", function (response) {
	                            if (response instanceof Error) {
	                                reject(response);
	                            }
	                            else {
	                                resolve(response);
	                            }
	                        });
	                    })];
	            });
	        }); };
	    }
	    DropinComponent.prototype.mount = function (target, options) {
	        var mountOptions = parseDropinMountOptions(this.config, options);
	        var controllerProps = this.buildControllerProps(mountOptions);
	        var parent = typeof target === "string" ? document.querySelector(target) : target;
	        this.setFirstErrorListener(parent);
	        var appRoot = document.createElement("div");
	        O(h(Controller, __assign({}, controllerProps)), appRoot);
	        parent.appendChild(appRoot);
	    };
	    DropinComponent.prototype.buildControllerProps = function (mountOptions) {
	        var allowedPaymentTypes = this.getAllowedPaymentTypes(mountOptions.paymentMethods);
	        return {
	            allowedPaymentTypes: allowedPaymentTypes,
	            amount: mountOptions.amount,
	            config: this.config,
	            currencyCode: getLocalCurrencyCodeForCountry(this.config.country),
	            instalmentsNumber: mountOptions.instalments,
	            lookAndFeelOptions: normalizeLookAndFeelOptions(mountOptions.lookAndFeel),
	            values: mountOptions.values,
	        };
	    };
	    DropinComponent.prototype.getAllowedPaymentTypes = function (paymentTypes) {
	        var _this = this;
	        var allowedPaymentTypesForCountry = this.getAllowedPaymentTypesForCurrentCountry();
	        if (paymentTypes === "_all")
	            return allowedPaymentTypesForCountry;
	        var allowedPaymentTypes = paymentTypes.filter(function (paymentType) {
	            var isValid = allowedPaymentTypesForCountry.includes(paymentType);
	            if (!isValid)
	                console.warn("Payment method \"" + paymentType + "\" not supported for country " + _this.config.country);
	            return isValid;
	        });
	        if (allowedPaymentTypes.length === 0)
	            throw new Error("Can not mount Dropin with no payment methods");
	        return allowedPaymentTypes;
	    };
	    DropinComponent.prototype.getAllowedPaymentTypesForCurrentCountry = function () {
	        switch (this.config.country) {
	            case exports.Country.BRAZIL:
	                return [exports.PaymentType.CREDITCARD, exports.PaymentType.DEBITCARD];
	            default:
	                return [exports.PaymentType.CREDITCARD, exports.PaymentType.DEBITCARD];
	        }
	    };
	    DropinComponent.prototype.setFirstErrorListener = function (parent) {
	        externalEvents.listen("setFirstError", function (firstError) {
	            if (firstError) {
	                parent.classList.add("ebanx-dropin--error");
	            }
	            else {
	                parent.classList.remove("ebanx-dropin--error");
	            }
	        });
	    };
	    DropinComponent.prototype.onReady = function (callback) {
	        externalEvents.listen("formReady", callback);
	    };
	    DropinComponent.prototype.onInputChange = function (callback) {
	        externalEvents.listen("inputChange", callback);
	    };
	    DropinComponent.prototype.onComplete = function (callback) {
	        externalEvents.listen("formComplete", callback);
	    };
	    DropinComponent.prototype.onCardComplete = function (callback) {
	        externalEvents.listen("cardComplete", callback);
	    };
	    DropinComponent.prototype.setAmount = function (amount) {
	        externalEvents.dispatch("setAmount", amount);
	    };
	    DropinComponent.prototype.setLookAndFeelTheme = function (theme) {
	        if (typeof theme === "object") {
	            externalEvents.dispatch("setLookAndFeelTheme", theme || {});
	        }
	    };
	    return DropinComponent;
	}());

	var DropinModule = /** @class */ (function () {
	    function DropinModule(config) {
	        this.config = config;
	    }
	    DropinModule.prototype.create = function () {
	        return new DropinComponent(this.config);
	    };
	    return DropinModule;
	}());

	var UtilsDocument = /** @class */ (function () {
	    function UtilsDocument() {
	    }
	    UtilsDocument.prototype.check = function (options) {
	        UtilsDocument.validateOptions(options);
	        var type = options.type, document = options.document;
	        var documentTypeProcessor = DocumentTypeProcessorResolver.resolve(type);
	        var isValid = documentTypeProcessor.validate(document);
	        var maskedField = isValid ? documentTypeProcessor.applyMask(document) : "";
	        return Promise.resolve({
	            status: "success",
	            data: {
	                document: {
	                    isValid: isValid,
	                    maskedField: maskedField,
	                },
	            },
	        });
	    };
	    UtilsDocument.validateOptions = function (_a) {
	        var type = _a.type, document = _a.document;
	        if (!type)
	            throw new Error("Missing document type");
	        if (typeof document === "undefined")
	            throw new Error("Missing document number");
	        if (typeof document !== "string")
	            throw new Error("Document must be a string");
	    };
	    return UtilsDocument;
	}());

	var UtilsModule = /** @class */ (function () {
	    function UtilsModule() {
	        this.document = new UtilsDocument();
	    }
	    return UtilsModule;
	}());

	var ReferenceDataStatesModule = /** @class */ (function () {
	    function ReferenceDataStatesModule(options) {
	        this.options = options;
	    }
	    ReferenceDataStatesModule.prototype.get = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            var country, statesList;
	            return __generator(this, function (_a) {
	                country = new CountryResolver().resolve(this.options.country);
	                statesList = country.getStateList();
	                return [2 /*return*/, {
	                        quantity: statesList.length,
	                        stateList: statesList.map(function (state) { return ({
	                            stateCode: state.code,
	                            stateName: state.name,
	                        }); }),
	                    }];
	            });
	        });
	    };
	    return ReferenceDataStatesModule;
	}());

	var ReferenceDataModule = /** @class */ (function () {
	    function ReferenceDataModule() {
	    }
	    ReferenceDataModule.prototype.states = function (_a) {
	        var countryCode = _a.country;
	        return new ReferenceDataStatesModule({
	            country: getCountryByCode(countryCode),
	        });
	    };
	    return ReferenceDataModule;
	}());

	var deviceFingerprint = new DeviceFingerprintModule(config);
	var threeDSecure = new ThreeDSecureModule(config);
	var cardTokenizer = new CardTokenizerModule(config);
	var dropin = new DropinModule(config);
	var utils = new UtilsModule();
	var referenceData = new ReferenceDataModule();

	exports.cardTokenizer = cardTokenizer;
	exports.deviceFingerprint = deviceFingerprint;
	exports.dropin = dropin;
	exports.init = init;
	exports.referenceData = referenceData;
	exports.threeDSecure = threeDSecure;
	exports.utils = utils;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ebanx.js.map
