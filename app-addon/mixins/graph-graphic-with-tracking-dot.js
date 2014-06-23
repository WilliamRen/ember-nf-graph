import Ember from 'ember';
export default Ember.Mixin.create({
	trackingMode: 'none',
  trackedData: null,
  
  _trackingDot: null,

  trackingDot: function(name, value){ 
    if(arguments.length > 1) {
      this.set('_trackingDot', value);
    }
    if(!this.get('_trackingDot')) {
      this.set('_trackingDot', {
        x: 0,
        y: 0,
        visible: false,
        radius: 3
      });
    }
    return this.get('_trackingDot');
  }.property('_trackingDot'),

  updateTrackingDot: function(){
    var trackedData = this.get('trackedData');
    var xScale = this.get('graph.xScale');
    var yScale = this.get('graph.yScale');

    if(!trackedData || !xScale || !yScale) {
      this.set('trackingDot.visible', false);
    } else {
      this.set('trackingDot.visible', true);
      this.set('trackingDot.x', xScale(trackedData.x));
      this.set('trackingDot.y', yScale(trackedData.y));
    }
  }.observes('trackedData', 'graph.xScale', 'graph.yScale'),

  didGraphHoverChange: function(e, data){
    var trackingMode = this.get('trackingMode');
    var selected = this.get('isSelected');

    if(trackingMode === 'none' || (trackingMode.indexOf('selected-') === 0 && !selected)) {
      this.set('trackedData', null);
    } else {
      var found = this.getNearestDataToXValue(data.xValue, this.get('visibleData'));
      this.set('trackedData', found ? {
        x: found[0],
        y: found[1]
      } : null);
    } 
  },

  didGraphHoverEnd: function(){
    this._trackingModeDidChange();
  },

  _trackingModeDidChange: function(){
    var trackingMode = this.get('trackingMode');
    var selected = this.get('isSelected');
    var selectable = this.get('selectable');
    var last = this.get('lastVisibleData');
    var first = this.get('firstVisibleData');
    var data = null;
    switch(trackingMode) {
      case 'selected-snap-last':
        if(selectable && selected) {
          data = last;
        }
        break;
      case 'selected-snap-first':
        if(selectable && selected) {
          data = first;
        }
        break;
      case 'snap-last':
        data = last;
        break;
      case 'snap-first':
        data = first;
        break;
    }
    this.set('trackedData', data ? {
      x: data[0],
      y: data[1],
      data: data.data
    } : null);
  }.observes('trackingMode', 'lastVisibleData', 'firstVisibleData', 'isSelected', 'selectable').on('init'),
});