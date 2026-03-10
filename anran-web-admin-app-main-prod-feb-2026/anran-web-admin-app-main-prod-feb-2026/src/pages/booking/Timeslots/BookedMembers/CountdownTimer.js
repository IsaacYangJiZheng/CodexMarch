import React, {useState, useEffect} from 'react';
// import PropTypes from 'prop-types';
import './countdowntimer.css';
// https://medium.com/@primaramadhanip/building-a-countdown-timer-in-react-db93167157b7
// https://medium.com/free-code-camp/how-to-create-a-countdown-component-using-react-momentjs-4717edc4ac3

const CountdownTimer = () => {
  // Initial time in seconds (1 hour)
  const initialTime = 60 * 60;
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime === 0) {
          clearInterval(timerInterval);
          // Perform actions when the timer reaches zero
          console.log('Countdown complete!');
          return 0;
        } else {
          return prevTime - 1;
        }
      });
    }, 1000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(timerInterval);
  }, []); // The empty dependency array ensures the effect runs only once on mount

  // Convert seconds to hours, minutes, and seconds
  //   const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  //   const minutesRadius = mapNumber(minutes, 60, 0, 0, 360);
  //   const secondsRadius = mapNumber(seconds, 60, 0, 0, 360);

  //   const SVGCircle = ({radius}) => (
  //     <svg className='countdown-svg'>
  //       <path
  //         fill='none'
  //         stroke='#333'
  //         strokeWidth='4'
  //         d={describeArc(50, 50, 28, 0, radius)}
  //       />
  //     </svg>
  //   );

  //   SVGCircle.propTypes = {
  //     radius: PropTypes.any,
  //   };

  return (
    <div className='countdown-wrapper'>
      {minutes && (
        <div className='countdown-item'>
          {/* <SVGCircle radius={minutesRadius} /> */}
          {minutes}
          <span>minutes</span>
        </div>
      )}
      {seconds && (
        <div className='countdown-item'>
          {/* <SVGCircle radius={secondsRadius} /> */}
          {seconds}
          <span>seconds</span>
        </div>
      )}
      {/* <p>{`${minutes}m ${seconds}s`}</p> */}
    </div>
  );

  //   function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  //     var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  //     return {
  //       x: centerX + radius * Math.cos(angleInRadians),
  //       y: centerY + radius * Math.sin(angleInRadians),
  //     };
  //   }

  //   function describeArc(x, y, radius, startAngle, endAngle) {
  //     var start = polarToCartesian(x, y, radius, endAngle);
  //     var end = polarToCartesian(x, y, radius, startAngle);
  //     var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  //     var d = [
  //       'M',
  //       start.x,
  //       start.y,
  //       'A',
  //       radius,
  //       radius,
  //       0,
  //       largeArcFlag,
  //       0,
  //       end.x,
  //       end.y,
  //     ].join(' ');

  //     return d;
  //   }

  //   function mapNumber(number, in_min, in_max, out_min, out_max) {
  //     return (
  //       ((number - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
  //     );
  //   }
};

export default CountdownTimer;
