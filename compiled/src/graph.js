(function() {
  var Graph, poly,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  poly = this.poly || {};

  Graph = (function() {

    function Graph(spec) {
      this._legacy = __bind(this._legacy, this);
      this.render = __bind(this.render, this);
      this.merge = __bind(this.merge, this);
      this.reset = __bind(this.reset, this);      this.graphId = _.uniqueId('graph_');
      this.layers = null;
      this.scaleSet = null;
      this.axes = null;
      this.legends = null;
      this.dims = null;
      this.paper = null;
      this.initial_spec = spec;
      this.make(spec);
    }

    Graph.prototype.reset = function() {
      return this.make(this.initial_spec);
    };

    Graph.prototype.make = function(spec) {
      var merge;
      this.spec = spec;
      if (spec.layers == null) spec.layers = [];
      if (this.layers == null) this.layers = this._makeLayers(this.spec);
      merge = _.after(this.layers.length, this.merge);
      return _.each(this.layers, function(layerObj, id) {
        return layerObj.make(spec.layers[id], merge);
      });
    };

    Graph.prototype.merge = function() {
      var domains;
      domains = this._makeDomains(this.spec, this.layers);
      if (this.scaleSet != null) {
        this.scaleSet.setDomains(domains);
      } else {
        this.scaleSet = this._makeScaleSet(this.spec, domains);
      }
      if (this.dims == null) {
        this.dims = this._makeDimensions(this.spec, this.scaleSet);
      }
      if (this.ranges == null) this.ranges = poly.dim.ranges(this.dims);
      this.scaleSet.setRanges(this.ranges);
      return this._legacy(domains);
    };

    Graph.prototype.render = function(dom) {
      var axes, clipping, renderer, scales,
        _this = this;
      if (this.paper == null) {
        this.paper = this._makePaper(dom, this.dims.width, this.dims.height);
      }
      scales = this.scaleSet.getScaleFns();
      clipping = poly.dim.clipping(this.dims);
      renderer = poly.render(this.graphId, this.paper, scales, clipping.main);
      _.each(this.layers, function(layer) {
        return layer.render(renderer);
      });
      axes = this.scaleSet.getAxes();
      axes.y.render(this.dims, poly.render(this.graphId, this.paper, scales, clipping.left));
      return axes.x.render(this.dims, poly.render(this.graphId, this.paper, scales, clipping.bottom));
    };

    Graph.prototype._makeLayers = function(spec) {
      return _.map(spec.layers, function(layerSpec) {
        return poly.layer.make(layerSpec, spec.strict);
      });
    };

    Graph.prototype._makeDomains = function(spec, layers) {
      var domains;
      domains = {};
      if (spec.guides) {
        if (spec.guides == null) spec.guides = {};
        domains = poly.domain.make(layers, spec.guides, spec.strict);
      }
      return domains;
    };

    Graph.prototype._makeScaleSet = function(spec, domains) {
      var tmpRanges;
      tmpRanges = poly.dim.ranges(poly.dim.guess(spec));
      return poly.scale.make(spec.guides, domains, tmpRanges);
    };

    Graph.prototype._makeDimensions = function(spec, scaleSet) {
      return poly.dim.make(spec, scaleSet.getAxes(), scaleSet.getLegends());
    };

    Graph.prototype._makePaper = function(dom, width, height) {
      return poly.paper(document.getElementById(dom), width, height);
    };

    Graph.prototype._legacy = function(domains) {
      var axes,
        _this = this;
      this.domains = domains;
      this.scales = this.scaleSet.getScaleFns();
      axes = this.scaleSet.getAxes();
      this.ticks = {};
      return _.each(axes, function(v, k) {
        return _this.ticks[k] = v.ticks;
      });
    };

    return Graph;

  })();

  poly.chart = function(spec) {
    return new Graph(spec);
  };

  this.poly = poly;

}).call(this);