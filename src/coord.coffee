poly = @poly || {}

class Coordinate
  constructor: (params) ->
    params ?= {}
    @flip = params.flip ? false
    [@x, @y] = if @flip then ['y', 'x'] else ['x', 'y']
  make: (dims) -> @dims = dims
  ranges: () ->

class Cartesian extends Coordinate
  ranges: () ->
    ranges = {}
    ranges[@x] =
      min: @dims.paddingLeft + @dims.guideLeft
      max: @dims.paddingLeft + @dims.guideLeft + @dims.chartWidth
    ranges[@y] =
      min: @dims.paddingTop + @dims.guideTop + @dims.chartHeight
      max: @dims.paddingTop + @dims.guideTop
    ranges
  axisType: (aes) -> @[aes]
  getXY: (mayflip, scales, mark) ->
    if mayflip
      point =
        x: if _.isArray(mark.x) then _.map mark.x, scales.x else scales.x mark.x
        y: if _.isArray(mark.y) then _.map mark.y, scales.y else scales.y mark.y
      return {
        x: point[@x]
        y: point[@y]
      }
    else
      scalex = scales[@x]
      scaley = scales[@y]
      return {
        x: if _.isArray(mark.x) then _.map mark.x, scalex else scalex mark.x
        y: if _.isArray(mark.y) then _.map mark.y, scaley else scaley mark.y
      }

class Polar extends Coordinate
  make: (dims) ->
    @dims = dims
    @cx = @dims.paddingLeft + @dims.guideLeft + @dims.chartWidth/2
    @cy = @dims.paddingTop + @dims.guideTop + @dims.chartHeight/2
  ranges: () ->
    [r, t] = [@x, @y]
    ranges = {}
    ranges[t] = min: 0, max: 2*Math.PI
    ranges[r] =
      min: 0
      max: Math.min(@dims.chartWidth,@dims.chartHeight)/2
    ranges
  axisType: (aes) -> if @[aes] == 'x' then 'r' else 't'
  getXY: (mayflip, scales, mark) ->
    [r, t] = [@x, @y]
    _getxy = (radius, theta) =>
      x: @cx + radius * Math.cos(theta - Math.PI/2)
      y: @cy + radius * Math.sin(theta - Math.PI/2)

    points = x: [], y: []
    if _.isArray mark[r] #and _.isArray mark[t]
      for radius, i in mark[r]
        radius = scales[r] radius
        theta = scales[t] mark[t][i]
        point = _getxy radius, theta
        points.x.push point.x
        points.y.push point.y
    else
      points = _getxy scales[r](mark[r]), scales[t](mark[t])
    return points


poly.coord =
  cartesian : (params) -> new Cartesian(params)
  polar : (params) -> new Polar(params)
