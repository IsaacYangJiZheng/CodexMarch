import React from 'react';

export default function TImer() {
  const [secondsElapsed, setSecondsElapsed] = React.useState(1800000 / 1000);

  React.useEffect(() => {
    // setSecondsElapsed(1800000 / 1000);
    setInterval(() => {
      setSecondsElapsed(secondsElapsed - 1);
    }, 1000);
  }, []);

  const getHours = () => {
    return ('0' + Math.floor(secondsElapsed / 3600)).slice(-2);
  };

  const getMinutes = () => {
    return ('0' + Math.floor((secondsElapsed % 3600) / 60)).slice(-2);
  };

  const getSeconds = () => {
    return ('0' + (secondsElapsed % 60)).slice(-2);
  };

  return (
    <div>
      <span className='bloc-timer'> {getHours()}</span>
      <span className='bloc-timer'> :{getMinutes()}</span>
      <span className='bloc-timer'> :{getSeconds()}</span>
    </div>
  );
}
