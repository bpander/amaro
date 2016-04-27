(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        root.Amaro = factory();
    }
}(this, function () {
var Deferred, Util, Animator, Control, Component, IfControl, IterationControl, EachControl, OutputControl, Amarojs;
Deferred = function () {
  function Deferred() {
    this.promise = new Promise(function (resolve, reject) {
      this.resolve = resolve;
      this.reject = reject;
    }.bind(this));
  }
  return Deferred;
}();
Util = function () {
  var Util = {};
  Util.noop = Function.prototype;
  /**
   * Create a deep copy of an object. Adapted from http://stackoverflow.com/a/728694/1159534.
   *
   * @method Util.deepCopy
   * @static
   * @param  {*} obj  The thing to clone.
   * @return {*}      A clone of the input except if the input was a primitive in which case it returns the primitive.
   */
  Util.deepCopy = function (obj) {
    var copy;
    // Handle the 3 simple types, and null or undefined
    if (obj == null || typeof obj !== 'object') {
      return obj;
    }
    // Handle Date
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }
    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = Util.deepCopy(obj[i]);
      }
      return copy;
    }
    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          copy[prop] = Util.deepCopy(obj[prop]);
        }
      }
      return copy;
    }
    throw new Error('Unable to copy input! Its type isn\'t supported.');
  };
  Util.getNextSiblings = function (element) {
    var sibling = element;
    var nextSiblings = [];
    while ((sibling = sibling.nextSibling) !== null) {
      nextSiblings.push(sibling);
    }
    return nextSiblings;
  };
  Util.getTotalTransitionTime = function (element) {
    var totalTransitionTime = 0;
    var computedStyle = getComputedStyle(element);
    var transitionDurations = computedStyle.transitionDuration.split(', ');
    var transitionDelays = computedStyle.transitionDelay.split(', ');
    var i;
    var l;
    for (i = 0, l = transitionDurations.length; i < l; i++) {
      totalTransitionTime = Math.max(totalTransitionTime, parseFloat(transitionDurations[i]) + parseFloat(transitionDelays[i]));
    }
    totalTransitionTime *= 1000;
    // Convert to ms
    return totalTransitionTime;
  };
  Util.forceRedraw = function (element) {
    var display = element.style.display;
    element.style.display = 'none';
    element.offsetWidth;
    element.style.display = display;
  };
  return Util;
}();
Animator = function (Deferred, Util) {
  function Animator() {
    this.enabled = false;
    this.prefix = '';
    this.animation = new Deferred();
  }
  var proto = Animator.prototype;
  Animator.TYPE = {
    APPEAR: '-appear',
    ENTER: '-enter',
    LEAVE: '-leave'
  };
  proto.enable = function () {
    this.enabled = true;
  };
  proto.animate = function (elements, type) {
    if (!this.enabled) {
      return Promise.resolve();
    }
    var initialClass = this.prefix + type;
    var activeClass = initialClass + '-active';
    var always = function () {
      elements.forEach(function (element) {
        element.classList.remove(initialClass, activeClass);
      });
    };
    var transitionTime;
    this.animation.reject();
    this.animation = new Deferred();
    this.animation.promise.then(always, always);
    elements.forEach(function (element) {
      element.classList.add(initialClass);
      Util.forceRedraw(element);
    });
    transitionTime = Math.max.apply(null, elements.map(Util.getTotalTransitionTime));
    if (transitionTime === 0) {
      this.animation.resolve();
      return this.animation.promise;
    }
    elements.forEach(function (element) {
      element.classList.add(activeClass);
    });
    setTimeout(this.animation.resolve, transitionTime);
    return this.animation.promise;
  };
  return Animator;
}(Deferred, Util);
Control = function (Animator) {
  function Control(element) {
    this.element = element;
    this.expression = _defaultExpression;
    this.children = [];
    this.parent = null;
    this.original = this;
    this.id = _id++;
    this.isMounted = false;
    this.animator = new Animator();
  }
  var proto = Control.prototype;
  var _id = 1;
  var _defaultExpression = function (x) {
    return x;
  };
  proto.acceptState = function (state, loop, thisArg) {
    var i;
    var l;
    for (i = 0, l = this.children.length; i < l; i++) {
      this.children[i].acceptState(state, loop, thisArg);
    }
    this.isMounted = true;
  };
  proto.addChild = function (control) {
    control.parent = this;
    this.children.push(control);
    control.element.setAttribute('data-control-' + this.id + '-' + control.id, '');
  };
  proto.cloneOn = function (element) {
    var Constructor = this.constructor;
    var instance = new Constructor(element);
    instance.expression = this.expression;
    if (this.keyExpression !== undefined) {
      instance.keyExpression = this.keyExpression;
    }
    instance.original = this.original;
    instance.copyChildrenFrom(this);
    return instance;
  };
  proto.addToTree = function (control) {
    var children = this.children;
    var child;
    var i;
    var l;
    for (i = 0, l = children.length; i < l; i++) {
      child = children[i];
      if (child.element.contains(control.element) || child.element === control.element) {
        child.addToTree(control);
        return;
      }
    }
    this.addChild(control);
  };
  proto.controlDidParse = function () {
    var i;
    var l;
    for (i = 0, l = this.children.length; i < l; i++) {
      this.children[i].controlDidParse();
    }
  };
  proto.copyChildrenFrom = function (source) {
    this.children = source.children.map(function (child) {
      var element;
      var attribute = 'data-control-' + source.original.id + '-' + child.original.id;
      if (this.element.hasAttribute(attribute)) {
        element = this.element;
      } else {
        element = this.element.querySelector('[' + attribute + ']');
      }
      // TODO: Think of a better way to do this
      if (element === null) {
        element = this.template.querySelector('[' + attribute + ']');
      }
      var clone = child.cloneOn(element);
      clone.parent = this;
      return clone;
    }, this);
  };
  proto.enter = function () {
    var type = this.isMounted ? Animator.TYPE.ENTER : Animator.TYPE.APPEAR;
    return this.animator.animate([this.element], type);
  };
  proto.leave = function () {
    if (!this.isMounted) {
      return Promise.resolve();
    }
    return this.animator.animate([this.element], Animator.TYPE.LEAVE);
  };
  proto.unmount = function () {
    var i;
    var l;
    for (i = 0, l = this.children.length; i < l; i++) {
      this.children[i].unmount();
    }
  };
  return Control;
}(Animator);
Component = function (Control, Util) {
  function Component(element) {
    Control.call(this, element);
    this.state = Util.deepCopy(this.constructor.defaults);
    this.prevState = Util.deepCopy(this.state);
  }
  Component.prototype = Object.create(Control.prototype);
  var proto = Component.prototype;
  proto.constructor = Component;
  Component.defaults = {};
  proto.acceptState = function (state, loop, thisArg) {
    this.setState(this.expression.call(thisArg, state, loop), loop);
    this.isMounted = true;
  };
  proto.setState = function (state, loop) {
    var i;
    var l;
    var prevState = this.prevState;
    var nextState = Object.assign(this.state, state);
    var shouldComponentUpdate = this.isMounted ? this.shouldComponentUpdate(nextState) : true;
    this.prevState = Util.deepCopy(this.state);
    if (shouldComponentUpdate === false) {
      return;
    }
    this.isMounted ? this.componentWillUpdate(nextState) : this.componentWillMount();
    for (i = 0, l = this.children.length; i < l; i++) {
      this.children[i].acceptState(nextState, loop, this);
    }
    this.isMounted ? this.componentDidUpdate(prevState) : this.componentDidMount();
  };
  proto.unmount = function () {
    Control.prototype.unmount.call(this);
    this.componentWillUnmount();
  };
  proto.componentWillMount = function () {
  };
  proto.componentDidMount = function () {
  };
  proto.shouldComponentUpdate = function (nextState) {
    return true;
  };
  proto.componentWillUpdate = function (nextState) {
  };
  proto.componentDidUpdate = function (prevState) {
  };
  proto.componentWillUnmount = function () {
  };
  return Component;
}(Control, Util);
IfControl = function (Control, Util) {
  function IfControl(element) {
    Control.call(this, element);
    this.parentNode = null;
    this.nextSiblings = Util.getNextSiblings(this.element);
    this.isAttached = true;
  }
  IfControl.prototype = Object.create(Control.prototype);
  var proto = IfControl.prototype;
  proto.constructor = IfControl;
  proto.acceptState = function (state, loop, thisArg) {
    if (this.expression.call(thisArg, state, loop)) {
      this.attach();
      Control.prototype.acceptState.call(this, state, loop);
    } else {
      this.detach();
    }
    this.isMounted = true;
  };
  proto.attach = function () {
    if (this.isAttached && this.isMounted) {
      return;
    }
    this.isAttached = true;
    if (!document.body.contains(this.element)) {
      this.parentNode.insertBefore(this.element, this.getReferenceNode());
    }
    this.enter();
  };
  proto.getReferenceNode = function () {
    var i = -1;
    var sibling;
    var ref = null;
    while ((sibling = this.nextSiblings[++i]) !== undefined) {
      if (sibling.parentNode === this.parentNode) {
        ref = sibling;
        break;
      }
    }
    return ref;
  };
  proto.detach = function () {
    if (!this.isAttached) {
      return;
    }
    this.isAttached = false;
    this.leave();
  };
  proto.leave = function () {
    var promise = Control.prototype.leave.call(this);
    promise.then(function () {
      this.parentNode = this.element.parentNode;
      this.parentNode.removeChild(this.element);
    }.bind(this));
    return promise;
  };
  return IfControl;
}(Control, Util);
IterationControl = function (Animator, Control) {
  function IterationControl(element) {
    Control.call(this, element);
    this.childNodes = Array.prototype.slice.call(element.childNodes, 0);
    this.index = -1;
    this.willDestroy = false;
  }
  IterationControl.prototype = Object.create(Control.prototype);
  var proto = IterationControl.prototype;
  proto.constructor = IterationControl;
  proto.enter = function () {
    var type = this.parent.isMounted ? Animator.TYPE.ENTER : Animator.TYPE.APPEAR;
    return this.animator.animate(this.childNodes, type);
  };
  proto.leave = function () {
    if (!this.isMounted) {
      return Promise.resolve();
    }
    var promise = this.animator.animate(this.childNodes, Animator.TYPE.LEAVE);
    promise.then(function () {
      this.childNodes.forEach(function (node) {
        node.parentNode.removeChild(node);
      });
    }.bind(this));
    return promise;
  };
  return IterationControl;
}(Animator, Control);
EachControl = function (Control, IterationControl, Util) {
  function EachControl(element) {
    Control.call(this, element);
    this.keyExpression = Util.noop;
    this.template = document.createElement('template');
    this.iterations = {};
  }
  EachControl.prototype = Object.create(Control.prototype);
  var proto = EachControl.prototype;
  proto.constructor = EachControl;
  proto.acceptState = function (state, loop, thisArg) {
    var obj = this.expression.call(thisArg, state, loop);
    var iterations = {};
    loop = {
      key: null,
      val: null,
      outer: loop
    };
    Object.keys(obj).forEach(function (key, i) {
      // Manage loop vars
      loop.key = key;
      loop.val = obj[key];
      // Grab the cached iteration or create a new one if necessary
      var iterationKey = this.keyExpression.call(thisArg, state, loop);
      var iteration = this.iterations[iterationKey];
      var shouldIterationEnter = false;
      if (iteration === undefined) {
        iteration = this.createIteration();
        shouldIterationEnter = true;
      }
      // Move the iteration from the old hash table to the new one
      delete this.iterations[iterationKey];
      iterations[iterationKey] = iteration;
      // If the iteration has a different index than what it used to, append it now
      if (iteration.index !== i && !iteration.willDestroy) {
        iteration.index = i;
        iteration.childNodes.forEach(function (node) {
          this.element.appendChild(node);
        }, this);
        if (shouldIterationEnter) {
          iteration.enter();
        }
      }
      // Trickle the state down
      iteration.acceptState(state, loop, thisArg);
    }, this);
    // Detach leftover iterations from the old hash table
    Object.keys(this.iterations).forEach(function (key) {
      var iteration = this.iterations[key];
      if (iteration.willDestroy) {
        return;
      }
      iterations[key] = iteration;
      iteration.willDestroy = true;
      iteration.unmount();
      iteration.leave().then(function () {
        delete iterations[key];
      });
    }, this);
    // Store a reference to the new hash table
    this.iterations = iterations;
    this.isMounted = true;
  };
  proto.copyChildrenFrom = function (source) {
    this.template = source.template;
    Control.prototype.copyChildrenFrom.call(this, source);
  };
  proto.controlDidParse = function () {
    Control.prototype.controlDidParse.call(this);
    var childElements = Array.prototype.slice.call(this.element.children);
    var i;
    var l;
    for (i = 0, l = childElements.length; i < l; i++) {
      this.template.appendChild(childElements[i]);
    }
  };
  proto.createIteration = function () {
    var element = this.template.cloneNode(true);
    var iteration = new IterationControl(element);
    iteration.parent = this;
    iteration.animator.enabled = this.animator.enabled;
    iteration.animator.prefix = this.animator.prefix;
    iteration.copyChildrenFrom(this);
    return iteration;
  };
  return EachControl;
}(Control, IterationControl, Util);
OutputControl = function (Control) {
  function OutputControl(element) {
    Control.call(this, element);
  }
  OutputControl.prototype = Object.create(Control.prototype);
  var proto = OutputControl.prototype;
  proto.constructor = OutputControl;
  OutputControl.merge = function (target, props) {
    var prop;
    var oldVal;
    var newVal;
    for (prop in props) {
      if (props.hasOwnProperty(prop)) {
        newVal = props[prop];
        if (typeof newVal === 'object') {
          OutputControl.merge(target[prop], newVal);
          continue;
        }
        oldVal = target[prop];
        if (oldVal !== newVal) {
          target[prop] = props[prop];
        }
      }
    }
  };
  proto.acceptState = function (state, loop, thisArg) {
    var props = this.expression.call(thisArg, state, loop);
    OutputControl.merge(this.element, props);
    this.isMounted = true;
  };
  return OutputControl;
}(Control);
Amarojs = function (Component, IfControl, EachControl, OutputControl) {
  // TODO: Make a router demo
  var Amaro = {};
  Amaro.Component = Component;
  Amaro._componentMap = {};
  Amaro.components = function (componentMap) {
    Object.assign(Amaro._componentMap, componentMap);
  };
  Amaro.processElement = function (element, rootComponent) {
    var ifExpr = element.getAttribute('data-if');
    var outExpr = element.getAttribute('data-out');
    var componentExpr = element.getAttribute('data-component');
    var eachExpr = element.getAttribute('data-each');
    var control;
    var animatorPrefix;
    if (ifExpr !== null) {
      control = new IfControl(element);
      control.expression = Amaro.compileExpression(ifExpr);
      animatorPrefix = element.getAttribute('data-animate');
      if (animatorPrefix !== null) {
        control.animator.prefix = animatorPrefix;
        control.animator.enable();
      }
      rootComponent.addToTree(control);
    }
    if (outExpr !== null) {
      control = new OutputControl(element);
      control.expression = Amaro.compileExpression(outExpr);
      rootComponent.addToTree(control);
    }
    if (componentExpr !== null) {
      // TODO: Think of a better way to do get the ComponentConstructor
      var ComponentConstructor = Amaro._componentMap[componentExpr];
      control = new ComponentConstructor(element);
      control.expression = Amaro.compileExpression(element.getAttribute('data-state'));
      rootComponent.addToTree(control);
    }
    if (eachExpr !== null) {
      control = new EachControl(element);
      control.expression = Amaro.compileExpression(eachExpr);
      control.keyExpression = Amaro.compileExpression(element.getAttribute('data-key') || Amaro.defaultKeyExpression);
      animatorPrefix = element.getAttribute('data-animate-each');
      if (animatorPrefix !== null) {
        control.animator.prefix = animatorPrefix;
        control.animator.enable();
      }
      rootComponent.addToTree(control);
    }
  };
  Amaro.mount = function (element, T, initialState) {
    var rootComponent = new T(element);
    var elements = element.querySelectorAll('[data-if], [data-out], [data-component], [data-each]');
    var i;
    var l;
    for (i = 0, l = elements.length; i < l; i++) {
      Amaro.processElement(elements[i], rootComponent);
    }
    rootComponent.controlDidParse();
    rootComponent.acceptState(initialState);
    return rootComponent;
  };
  Amaro.compileExpression = function (expression) {
    // comma-separated argument definition seems to be a little faster than the `new Function(arg1, arg2, body)` way
    return new Function('state, loop', 'return ' + expression + ';');
  };
  Amaro.defaultKeyExpression = 'loop.key';
  return Amaro;
}(Component, IfControl, EachControl, OutputControl);    return Amarojs;
}));
