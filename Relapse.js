;(function() {
var Control, Component, IfControl, IterationControl, EachControl, OutputControl, Libjs;
Control = function (require) {
  function Control(element, expression) {
    this.element = element;
    this.expression = expression;
    this.children = [];
    this.id = _id++;
  }
  var _id = 1;
  Control.prototype.acceptState = function (state, loop) {
    var i;
    var l;
    for (i = 0, l = this.children.length; i < l; i++) {
      this.children[i].acceptState(state, loop);
    }
  };
  Control.prototype.moldify = function (parentId) {
    this.element.setAttribute('data-control-' + parentId + '-' + this.id, '');
  };
  Control.prototype.cloneOn = function (element) {
    var Constructor = this.constructor;
    var instance = new Constructor();
    var prop;
    for (prop in instance) {
      if (instance.hasOwnProperty(prop)) {
        // TODO: There needs to be a better way of knowing if a property should be a clone or a reference
        if (prop === 'iterations') {
          instance.iterations = {};
        } else {
          instance[prop] = this[prop];
        }
      }
    }
    instance.element = element;
    return instance;
  };
  return Control;
}({});
Component = function (require) {
  var Control = Control;
  function Component(element, expression) {
    Control.call(this, element, expression);
    // TODO: Use a deep merge
    this.state = Object.assign({}, this.constructor.defaults);
  }
  Component.prototype = Object.create(Control.prototype);
  Component.prototype.constructor = Component;
  Component.defaults = {};
  Component.prototype.acceptState = function (state, loop) {
    this.setState(this.expression(state, loop), loop);
  };
  Component.prototype.setState = function (state, loop) {
    // TODO: Use a deep merge
    // TODO: forEach probably not the best for performance, try regular loop?
    Object.assign(this.state, state);
    this.children.forEach(function (c) {
      c.acceptState(this.state, loop);
    }, this);
  };
  return Component;
}({});
IfControl = function (require) {
  var Control = Control;
  function IfControl(element, expression) {
    Control.call(this, element, expression);
    this.parentNode = element.parentNode;
    this.nextSiblings = IfControl.getNextSiblings(element);
  }
  IfControl.prototype = Object.create(Control.prototype);
  IfControl.prototype.constructor = IfControl;
  IfControl.getNextSiblings = function (element) {
    var sibling = element;
    var nextSiblings = [];
    while ((sibling = sibling.nextSibling) !== null) {
      nextSiblings.push(sibling);
    }
    return nextSiblings;
  };
  IfControl.prototype.acceptState = function (state, loop) {
    if (this.expression(state, loop)) {
      this.attach();
      Control.prototype.acceptState.call(this, state, loop);
    } else {
      this.detach();
    }
  };
  IfControl.prototype.attach = function () {
    var i = -1;
    var sibling;
    while ((sibling = this.nextSiblings[++i]) !== undefined) {
      if (sibling.parentNode === this.parentNode) {
        this.parentNode.insertBefore(this.element, sibling);
        return;
      }
    }
    this.parentNode.appendChild(this.element);
  };
  IfControl.prototype.detach = function () {
    if (this.element.parentNode === this.parentNode) {
      this.parentNode.removeChild(this.element);
    }
  };
  return IfControl;
}({});
IterationControl = function (require) {
  var Control = Control;
  function IterationControl(element, expression) {
    Control.call(this, element, expression);
    this.childNodes = Array.prototype.slice.call(element.childNodes, 0);
  }
  IterationControl.prototype = Object.create(Control.prototype);
  IterationControl.prototype.constructor = IterationControl;
  IterationControl.from = function (eachControl) {
    var iteration = new IterationControl(eachControl.template.cloneNode(true));
    IterationControl.copyChildren(iteration, eachControl);
    return iteration;
  };
  IterationControl.copyChildren = function (target, template) {
    target.children = template.children.map(function (c) {
      var selector = '[data-control-' + template.id + '-' + c.id + ']';
      var clone = c.cloneOn(target.element.querySelector(selector));
      IterationControl.copyChildren(clone, c);
      return clone;
    });
  };
  return IterationControl;
}({});
EachControl = function (require) {
  var Control = Control;
  var IterationControl = IterationControl;
  function EachControl(element, expression, keyExpression) {
    Control.call(this, element, expression);
    this.keyExpression = keyExpression;
    this.template = document.createElement('template');
    this.iterations = {};
  }
  EachControl.prototype = Object.create(Control.prototype);
  EachControl.prototype.constructor = EachControl;
  EachControl.prototype.acceptState = function (state, loop) {
    // TODO: This should also be able to iterate over objects
    var arr = this.expression(state, loop);
    loop = {
      key: null,
      val: null,
      outer: loop
    };
    var docFrag = document.createDocumentFragment();
    arr.forEach(function (item, i) {
      loop.key = i;
      loop.val = item;
      // TODO: The default should just key off of the index
      var key = this.keyExpression(state, loop);
      var iteration = this.iterations[key];
      if (iteration === undefined) {
        iteration = IterationControl.from(this);
        this.iterations[key] = iteration;
      }
      iteration.acceptState(state, loop);
      iteration.childNodes.forEach(function (node) {
        docFrag.appendChild(node);
      });
    }, this);
    // TODO: It should probably be smarter about how it updates the list
    // Like, it won't touch the node if it's in the correct spot
    this.element.innerHTML = '';
    this.element.appendChild(docFrag);
  };
  return EachControl;
}({});
OutputControl = function (require) {
  var Control = Control;
  function OutputControl(element, expression) {
    Control.call(this, element, expression);
  }
  OutputControl.prototype = Object.create(Control.prototype);
  OutputControl.prototype.constructor = OutputControl;
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
  OutputControl.prototype.acceptState = function (state, loop) {
    var props = this.expression(state, loop);
    OutputControl.merge(this.element, props);
  };
  return OutputControl;
}({});
Libjs = function (require) {
  var Component = Component;
  var IfControl = IfControl;
  var EachControl = EachControl;
  var OutputControl = OutputControl;
  var Lib = {};
  Lib.componentMap = {};
  Lib.mount = function (element, T, initialState) {
    var rootComponent = new T(element);
    var stack = [rootComponent];
    var eachControls = [];
    // TODO: `addToTree` should probably be refactored.
    var addToTree = function (control) {
      var element = control.element;
      var otherControl;
      var previousLength = stack.length;
      var i;
      if (control.constructor !== OutputControl) {
        stack.push(control);
      }
      i = previousLength;
      while (--i >= 0) {
        otherControl = stack[i];
        if (otherControl instanceof Component) {
          control.expression = control.expression.bind(otherControl);
          break;
        }
      }
      i = previousLength;
      while (--i >= 0) {
        otherControl = stack[i];
        if (otherControl.element.contains(element) || otherControl.element === element) {
          otherControl.children.push(control);
          control.moldify(otherControl.id);
          break;
        }
      }
    };
    var elements = element.querySelectorAll('[data-if], [data-out], [data-component], [data-each]');
    Array.prototype.forEach.call(elements, function (element, i) {
      var outExpr = element.dataset.out;
      var ifExpr = element.dataset.if;
      var componentExpr = element.dataset.component;
      var eachExpr = element.dataset.each;
      var compiled;
      if (ifExpr !== undefined) {
        compiled = Lib.compileExpression(ifExpr);
        addToTree(new IfControl(element, compiled));
      }
      if (outExpr !== undefined) {
        compiled = Lib.compileExpression(outExpr);
        addToTree(new OutputControl(element, compiled));
      }
      if (componentExpr !== undefined) {
        // TODO: Think of a better way to do get the ComponentConstructor
        var ComponentConstructor = Lib.componentMap[componentExpr];
        compiled = Lib.compileExpression(element.dataset.state);
        addToTree(new ComponentConstructor(element, compiled));
      }
      if (eachExpr !== undefined) {
        var control;
        var keyExpression = Lib.compileExpression(element.dataset.key);
        compiled = Lib.compileExpression(eachExpr);
        control = new EachControl(element, compiled, keyExpression);
        addToTree(control);
        eachControls.push(control);
      }
    });
    eachControls.forEach(function (control) {
      Array.prototype.forEach.call(control.element.children, function (node) {
        control.template.appendChild(node);
      });
    });
    rootComponent.setState(initialState);
    return rootComponent;
  };
  Lib.compileExpression = function (expression) {
    // comma-separated argument definition seems to be a little faster than the `new Function(arg1, arg2, body)` way
    return new Function('state, loop', 'return ' + expression + ';');
  };
  return Lib;
}({});
}());