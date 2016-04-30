# Amaro.js
Like virtual DOM (React, Mithril, vdom, etc) but you write the HTML in the HTML.

## Why

Virtual DOM allows for much cleaner application architectures, but it forces you to write your HTML in the JavaScript which isn't always possible on projects (e.g. you're not a green field project, you're inheriting legacy code, the project is going to be majority CMS-driven, etc). This tool enables you to write virtual DOM-like components in cases where virtual DOM isn't practical or desirable.

### It's Like React
 * Component-based (Amaro and React components have the same lifecycle methods)
 * Re-rendering only updates the parts of the DOM that changed

### But It's Better than React <sub>(in some respects)</sub>
 * Very tiny footprint: less than 3kb minified and gzipped. React is prohibitively large for some applications.
 * Flexible: separation of markup and JS makes it easier to create component variations that look the same but behave differently or behave the same but look differently.
 * Simpler: achieves the same result without the JSX overhead. Amaro templates are driven by data attributes and thus are valid HTML (no compilation step needed).
 * More legible in some areas: conditionals and loops are easier to follow in Amaro. 

## "Hello, world" Example
```html
<div id="js-app">
    <span data-out="{ textContent: state.greeting }"></span>, world!
</div>
<script>
    var element = document.getElementById('js-app');
    window.app = Amaro.mount(element, Amaro.Component, { greeting: 'Hello' });
</script>
```

## Controls
### If `data-if`
```html
<div data-if="state.bool"></div>
```
The element will be detached if the expression is falsey, reattached if truthy.

### Output `data-out`
```html
<button data-out="{ onclick: state.handleClick.bind(this) }">Click me</button>
```
Evaluates an object and applies the properties to the element. It performs a deep merge so properties like `element.style` can be manipulated.

### Component `data-component`
```html
<li data-component="TodoComponent"></li>
```
Turns an element into a component of the type specified. See TODO defining components.

#### Component State `data-state`
```html
<div data-component="ComponentA" data-state="{ a: 'foo' }">
    <div data-component="ComponentB" data-state="{ b: state.a }">
        <div data-out="{ textContent: state.b }">
            <!-- ^ This div's inner text will be 'foo' -->
        </div>
    </div>
</div>
```
The [data-state] attribute maps a parent's state to a child component's state.

### Each `data-each`
```html
<ul data-each="state.definitions">
    <li data-out="{ textContent: loop.val }"></li>
</ul>
```
The "Each" control iterates over an iterable (either an object or array). Outputting the child elements as many times as there are iterations in the iterable.

#### The `loop` variable
```html
<dl data-each="state.definitions">
    <dt data-out="{ textContent: loop.key }"></dt>
    <dd data-out="{ textContent: loop.val}"></dd>
</dl>
```
Inside an "each" control, there's a `loop` variable. `loop` is an object with three properties:
 * __loop.key__: The key of the current iteration.
 * __loop.val__: The value of the current iteration.
 * __loop.outer__: An inner loop's reference to an outer loop object.

## Defining Components

## Order of Operations
TODO: if, out, component, each

## Animations
