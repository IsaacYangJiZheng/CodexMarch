import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

const Timer = ({time1}) => {
  const [time, setTime] = useState();
  useEffect(() => {
    let duration = 60;
    let endTime = new dayjs(time1).toDate();
    endTime.setMinutes(endTime.getMinutes() + duration);
    let min = duration;
    let sec = 0;

    let interval = setInterval(() => {
      sec--;
      if (sec === -1) {
        sec = 59;
        min--;
      }
      let newValue = (
        <>
          <span className='minutes'>{formatNumber(min)}</span>
          <span className='divider'>:</span>
          <span className='seconds'>{formatNumber(sec)}</span>
        </>
      );
      if (min === 0 && sec === 0) {
        clearInterval(interval);
      }
      setTime(newValue);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  let formatNumber = (num) => {
    return num.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });
  };
  return <p className='Timer'>{time}</p>;
};

export default Timer;

Timer.propTypes = {
  time1: PropTypes.any,
};
