import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CardHeader from './CardHeader';
import {Formik} from 'formik';
import * as yup from 'yup';
import AddBannerForm from './AddBannerForm';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi} from '@anran/utility/APIHooks';
import dayjs from 'dayjs';
import AppDialog from '@anran/core/AppDialog';
import {useIntl} from 'react-intl';

const AddBanner = ({isOpen, setOpenDialog, reCallAPI}) => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [bannerImage, setBannerImage] = React.useState(null);
  const [bannerImageUrl, setBannerImageUrl] = React.useState(null);
  const validationSchema = React.useMemo(
    () =>
      yup.object({
        startdate: yup.string().when('always', {
          is: false,
          then: () =>
            yup
              .string()
              .required(formatMessage({id: 'admin.banner.validation.required'})),
        }),
        enddate: yup.string().when('always', {
          is: false,
          then: () =>
            yup
              .string()
              .required(formatMessage({id: 'admin.banner.validation.required'})),
        }),
      }),
    [formatMessage],
  );


  return (
    <Box flex={1}>
      <AppDialog
        dividers
        maxWidth='md'
        open={isOpen}
        hideClose
        title={
          <CardHeader
            onCloseAddCard={() => {
              setBannerImage(null);
              setBannerImageUrl(null);
              setOpenDialog(false);
            }}
            title={formatMessage({id: 'admin.banner.create.title'})}
          />
        }
      >
        <Formik
          validateOnBlur={true}
          initialValues={{
            always: false,
            startdate: dayjs(),
            enddate: dayjs().add(1, 'day'),
            publish: false,
          }}
          validationSchema={validationSchema}
          onSubmit={(data, {setSubmitting}) => {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('image', bannerImage);
            for (var key in data) {
              formData.append(key, data[key]);
            }
            postDataApi(
              '/api/banner',
              infoViewActionsContext,
              formData,
              false,
              {
                'Content-Type': 'multipart/form-data',
              },
            )
              .then(() => {
                reCallAPI();
                setBannerImage(null);
                setBannerImageUrl(null);
                setOpenDialog(false);
                infoViewActionsContext.showMessage(
                  formatMessage({id: 'admin.banner.create.success'}),
                );
              })
              .catch((error) => {
                infoViewActionsContext.fetchError(error.message);
              });
            setSubmitting(false);
          }}
        >
          {({values, errors, setFieldValue}) => {
            return (
              <AddBannerForm
                values={values}
                errors={errors}
                setFieldValue={setFieldValue}
                isViewOnly={false}
                setBannerImage={setBannerImage}
                setBannerImageUrl={setBannerImageUrl}
                bannerImage={bannerImage}
                bannerImageUrl={bannerImageUrl}
              />
            );
          }}
        </Formik>
      </AppDialog>
    </Box>
  );
};

export default AddBanner;

AddBanner.propTypes = {
  reCallAPI: PropTypes.func,
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
};
