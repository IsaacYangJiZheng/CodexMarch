import React from 'react';
import PropTypes from 'prop-types';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 8;
const BUFFER = 4;

const VirtualizedListbox = React.forwardRef(function VirtualizedListbox(
  props,
  ref,
) {
  const {children, style, ...other} = props;
  const items = React.Children.toArray(children);
  const totalHeight = items.length * ITEM_HEIGHT;
  const containerHeight = Math.min(items.length, VISIBLE_ITEMS) * ITEM_HEIGHT;
  const [scrollTop, setScrollTop] = React.useState(0);

  const safeScrollTop = Math.min(
    scrollTop,
    Math.max(0, totalHeight - containerHeight),
  );

  const startIndex = Math.max(
    0,
    Math.floor(safeScrollTop / ITEM_HEIGHT) - BUFFER,
  );
  const endIndex = Math.min(
    items.length,
    Math.ceil((safeScrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER,
  );
  const offsetY = startIndex * ITEM_HEIGHT;

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      ref={ref}
      style={{
        ...style,
        maxHeight: containerHeight,
        overflowY: 'auto',
        position: 'relative',
      }}
      onScroll={(event) => setScrollTop(event.target.scrollTop)}
      {...other}
    >
      <div style={{height: totalHeight, position: 'relative'}}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.map((child, index) =>
            React.cloneElement(child, {
              style: {
                ...(child.props.style || {}),
                height: ITEM_HEIGHT,
              },
              key: child.key ?? startIndex + index,
            }),
          )}
        </div>
      </div>
    </div>
  );
});

VirtualizedListbox.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
};

export default VirtualizedListbox;