import React, {useRef, useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {Button} from '@mui/material';
import {useLayoutContext} from '../../../../utility/AppContextProvider/LayoutContextProvider';
import Typography from '@mui/material/Typography';
import FooterWrapper from './FooterWrapper';
// import SupportWindow from '../../../../../SupportEngine/SupportWindow';

const AppFooter = () => {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  const {footer, footerType, navStyle} = useLayoutContext();
  const [visible, setVisible] = useState(false);
  const d = new Date();

  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setVisible(false);
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref]);
  }

  const onClickHelpButton = () => {
    setVisible(!visible);
  };

  return (
    <>
      {footer &&
      footerType === 'fluid' &&
      navStyle !== 'h-default' &&
      navStyle !== 'hor-light-nav' &&
      navStyle !== 'hor-dark-layout' ? (
        <FooterWrapper className='footer'>
          <div className='footerContainer'>
            <Typography>
              © {d.getFullYear()} Visualgic Resources (M) Sdn Bhd - All rights
              reserved
            </Typography>
            <Box sx={{ml: 'auto'}}>
              <div ref={wrapperRef}>
                {/* <SupportWindow visible={visible} /> */}
                <Button
                  sx={{
                    px: 5,
                  }}
                  color='primary'
                  onClick={onClickHelpButton}
                >
                  Help
                </Button>
              </div>
            </Box>
          </div>
        </FooterWrapper>
      ) : null}
    </>
  );
};

export default AppFooter;
