/*  jquery-dragger
 *  version: 1.4.1
 *  https://github.com/cuth/jquery.dragger
 *  @preserve
 */

/*exported Dragger */

var Dragger = (function ($) {

'use strict';

var defaults = {
    start: null,
    drag: null,
    stop: null,
    initX: 0,
    initY: 0,
    allowVerticalScrolling: false,
    allowHorizontalScrolling: false,
    target: null
};

var defaultBounds = {
    minX: null,
    maxX: null,
    minY: null,
    maxY: null
};

var setBounds = function (newBounds) {
    $.extend(this.bounds, newBounds);
};

var setPosition = function (pos) {
    $.extend(this.handle, pos);
};

var hasDragged = function () {
    return (this.dragStart.diffX !== 0 || this.dragStart.diffY !== 0);
};

var getPageScroll = function () {
    return {
        x: (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
        y: (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop
    };
};

var getNewPos = function (cursorPos, checkDiff) {
    var diffX, diffY, newX, newY;

    // measure the difference from when the drag started till now
    diffX = cursorPos.x - this.dragStart.x;
    diffY = cursorPos.y - this.dragStart.y;

    // check to see if there has been any change since it was called last
    if (checkDiff && diffX === this.dragStart.diffX &&
        diffY === this.dragStart.diffY) {
        return false;
    }

    // store the difference variables to check if position has changed
    this.dragStart.diffX = diffX;
    this.dragStart.diffY = diffY;

    // set the new handle position
    newX = diffX + this.handle.x;
    newY = diffY + this.handle.y;

    // keep the new position inside the bounds
    if (typeof this.bounds.minX === 'number') {
        newX = Math.max(newX, this.bounds.minX);
    }
    if (typeof this.bounds.maxX === 'number') {
        newX = Math.min(newX, this.bounds.maxX);
    }
    if (typeof this.bounds.minY === 'number') {
        newY = Math.max(newY, this.bounds.minY);
    }
    if (typeof this.bounds.maxY === 'number') {
        newY = Math.min(newY, this.bounds.maxY);
    }

    return {
        x: newX,
        y: newY
    };
};

var startDrag = function (cursorPos) {
    var pageScroll = getPageScroll();
    this.dragStart = {
        x: cursorPos.x,
        y: cursorPos.y,
        diffX: 0,
        diffY: 0,
        scrollX: pageScroll.x,
        scrollY: pageScroll.y
    };
    if (typeof this.opts.start === 'function') {
        this.opts.start.call(this, this.handle);
    }
};

var moveHandle = function (cursorPos) {
    var newPos = getNewPos.call(this, cursorPos, true);
    if (newPos && typeof this.opts.drag === 'function') {
        this.opts.drag.call(this, newPos);
    }
};

var stopDrag = function (cursorPos) {
    this.handle = getNewPos.call(this, cursorPos, false);
    var dragSuccess = (hasDragged.call(this) && !this.isScrolling);
    if (typeof this.opts.stop === 'function') {
        this.opts.stop.call(this, this.handle, dragSuccess);
    }
    this.isDragging = false;
};

var eventMouseDown = function (e) {
    document.onselectstart = function () { return false; };
    this.isDragging = true;
    startDrag.call(this, { x: e.clientX, y: e.clientY });
};

var eventMouseMove = function (e) {
    if (!this.isDragging) return;
    moveHandle.call(this, { x: e.clientX, y: e.clientY });
};

var eventMouseUp = function (e) {
    document.onselectstart = null;
    if (!this.isDragging) return;
    stopDrag.call(this, { x: e.clientX, y: e.clientY });
};

var eventTouchStart = function (e) {
    // Allow touch to scroll the page before setting isDragging to true
    this.isDragging = false;
    startDrag.call(this, { x: e.originalEvent.touches[0].clientX, y: e.originalEvent.touches[0].clientY });
};

var didPageScroll = function () {
    var pageScroll = getPageScroll();
    if (this.opts.allowVerticalScrolling && pageScroll.y !== this.dragStart.scrollY) {
        return true;
    }
    if (this.opts.allowHorizontalScrolling && pageScroll.x !== this.dragStart.scrollX) {
        return true;
    }
    return false;
};

var didDragEnough = function (pos) {
    if (!this.opts.allowVerticalScrolling && Math.abs(pos.y - this.dragStart.y) > 10) {
        return true;
    }
    if (!this.opts.allowHorizontalScrolling && Math.abs(pos.x - this.dragStart.x) > 10) {
        return true;
    }
    return false;
};

var eventTouchMove = function (e) {
    if (this.isScrolling) return true;
    var pos = {
        x: e.originalEvent.touches[0].clientX,
        y: e.originalEvent.touches[0].clientY
    };
    if (!this.isDragging) {

        // check to see if the page has scrolled since touch has started
        if (didPageScroll.call(this)) {
            this.isScrolling = true;
            return true;
        }
        if (didDragEnough.call(this, pos)) {
            this.isDragging = true;
        } else {
            return true;
        }
    }
    e.preventDefault();
    moveHandle.call(this, pos);
};

var eventTouchEnd = function (e) {
    var pos = {
        x: (this.isScrolling) ? this.dragStart.x : e.originalEvent.changedTouches[0].clientX,
        y: (this.isScrolling) ? this.dragStart.y : e.originalEvent.changedTouches[0].clientY
    };
    stopDrag.call(this, pos);
    this.isScrolling = false;
};

var preventDragStart = function (e) {
    e.preventDefault();
};

var preventClickWhenDrag = function (e) {
    if (hasDragged.call(this)) {
        e.preventDefault();
    }
};

var bindEvents = function () {
    if (this.opts.target) {
        this.$el.on('mousedown.dragger' + this.id, this.opts.target, eventMouseDown.bind(this));
        $(document)
            .on('mousemove.dragger' + this.id, eventMouseMove.bind(this))
            .on('mouseup.dragger' + this.id, eventMouseUp.bind(this));
        this.$el.on('touchstart.dragger' + this.id, this.opts.target, eventTouchStart.bind(this));
        this.$el.on('touchmove.dragger' + this.id, this.opts.target, eventTouchMove.bind(this));
        this.$el.on('touchend.dragger' + this.id, this.opts.target, eventTouchEnd.bind(this));
        this.$el.on('dragstart.dragger' + this.id, this.opts.target, preventDragStart.bind(this));
        this.$el.on('click.dragger' + this.id, this.opts.target, preventClickWhenDrag.bind(this));
    } else {
        this.$el.on('mousedown.dragger' + this.id, eventMouseDown.bind(this));
        $(document)
            .on('mousemove.dragger' + this.id, eventMouseMove.bind(this))
            .on('mouseup.dragger' + this.id, eventMouseUp.bind(this));
        this.$el.on('touchstart.dragger' + this.id, eventTouchStart.bind(this));
        this.$el.on('touchmove.dragger' + this.id, eventTouchMove.bind(this));
        this.$el.on('touchend.dragger' + this.id, eventTouchEnd.bind(this));
        this.$el.on('dragstart.dragger' + this.id, preventDragStart.bind(this));
        this.$el.on('click.dragger' + this.id, preventClickWhenDrag.bind(this));
    }
};

var unbindEvents = function () {
    if (this.opts.target) {
        this.$el.off('.dragger' + this.id, this.opts.target);
        $(document).off('.dragger' + this.id);
    } else {
        this.$el.add(document).off('.dragger' + this.id);
    }
};

var initCount = 0;

var init = function () {
    if (this.enabled || !this.$el.length) return false;
    this.el = this.$el[0];

    // initial position of the element that will be dragged
    this.handle = { x: this.opts.initX, y: this.opts.initY };

    // set this object at the beginning of the drag
    this.dragStart = { x: 0, y: 0, diffX: 0, diffY: 0, scrollX: 0, scrollY: 0 };

    this.isDragging = false;
    this.isScrolling = false;

    if (this.opts.allowVerticalScrolling) {
        this.el.style.msTouchAction = 'pan-y';
        this.el.style.touchAction = 'pan-y';
    } else if (this.opts.allowHorizontalScrolling) {
        this.el.style.msTouchAction = 'pan-x';
        this.el.style.touchAction = 'pan-x';
    } else {
        this.el.style.msTouchAction = 'none';
        this.el.style.touchAction = 'none';
    }

    bindEvents.call(this);

    this.enabled = true;
};

var uninit = function () {
    if (!this.enabled) return;
    unbindEvents.call(this);
    delete this.handle;
    delete this.dragStart;
    delete this.isDragging;
    delete this.isScrolling;
    this.el.style.msTouchAction = undefined;
    delete this.enabled;
};

var Dragger = function (el, options, bounds) {
    this.$el = $(el);
    this.id = initCount++;
    this.opts = $.extend({}, defaults, options);
    this.bounds = $.extend({}, defaultBounds, bounds);
    init.call(this);
};
Dragger.prototype.setBounds = setBounds;
Dragger.prototype.setPosition = setPosition;
Dragger.prototype.hasDragged = hasDragged;
Dragger.prototype.enable = init;
Dragger.prototype.disable = uninit;

$.fn.Dragger = function (options) {
    return new Dragger(this, options);
};


return Dragger;

}(jQuery || Zepto || ender || $));