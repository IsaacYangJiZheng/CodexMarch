import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CardHeader from './CardHeader';
import {Formik} from 'formik';
import * as yup from 'yup';
import AddMessageForm from './AddMessageForm';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi, putDataApi} from '@anran/utility/APIHooks';
import dayjs from 'dayjs';
import AppDialog from '@anran/core/AppDialog';
import {useIntl} from 'react-intl';

const AddBanner = ({isOpen, setOpenDialog, reCallAPI, isEdit, rowData}) => {
  const {formatMessage} = useIntl();
  const infoViewActionsContext = useInfoViewActionsContext();
  const [bannerImage, setBannerImage] = React.useState(null);
  // const [bannerImageUrl, setBannerImageUrl] = React.useState(null);
  const [bannerImageUrl, setBannerImageUrl] = React.useState(
    isEdit ? rowData?.imageUrl : null,
  );
  const validationSchema = React.useMemo(
    () =>
      yup.object({
        startDate: yup.string().when('always', {
          is: false,
          then: () =>
            yup
              .string()
              .required(
                formatMessage({id: 'admin.message.validation.required'}),
              ),
        }),
        endDate: yup.string().when('always', {
          is: false,
          then: () =>
            yup
              .string()
              .required(
                formatMessage({id: 'admin.message.validation.required'}),
              ),
        }),
        msg: yup
          .string()
          .required(formatMessage({id: 'admin.message.validation.required'})),
        msgName: yup
          .string()
          .required(formatMessage({id: 'admin.message.validation.required'})),
        msgCode: yup
          .string()
          .required(formatMessage({id: 'admin.message.validation.required'})),
        messageType: yup
          .string()
          .required(formatMessage({id: 'admin.message.validation.required'})),
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
            title={
              isEdit
                ? formatMessage({id: 'admin.message.edit.title'})
                : formatMessage({id: 'admin.message.create.title'})
            }
          />
        }
      >
        <Formik
          validateOnBlur={true}
          initialValues={{
            always: isEdit ? rowData.always : false,
            startDate: isEdit ? dayjs(rowData.startDate) : dayjs(),
            endDate: isEdit ? dayjs(rowData.endDate) : dayjs().add(1, 'day'),
            publish: isEdit ? rowData.publish : false,
            messageType: isEdit ? rowData.msgContentType : 'image',
            msgName: isEdit ? rowData.msgName : '',
            msg: isEdit ? rowData.msg : '',
            msgCode: isEdit ? rowData.msgCode : '',
            msgBgColor: isEdit ? rowData.msgBgColor : 'f2f0b8',
            statusActive: isEdit ? rowData.statusActive : true,
            isEdit: isEdit,
          }}
          validationSchema={validationSchema}
          onSubmit={(data, {setSubmitting}) => {
            setSubmitting(true);
            if (isEdit) {
              const formData = new FormData();
              formData.append('image', bannerImage);
              for (var key in data) {
                formData.append(key, data[key]);
              }
              putDataApi(
                `/api/messages/${rowData._id}`,
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
                    formatMessage({id: 'admin.message.update.success'}),
                  );
                })
                .catch((error) => {
                  infoViewActionsContext.fetchError(error.message);
                });
            } else {
              const formData = new FormData();
              formData.append('image', bannerImage);
              for (var key1 in data) {
                formData.append(key1, data[key1]);
              }
              postDataApi(
                '/api/messages',
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
                    formatMessage({id: 'admin.message.create.success'}),
                  );
                })
                .catch((error) => {
                  infoViewActionsContext.fetchError(error.message);
                });
            }

            setSubmitting(false);
          }}
        >
          {({values, errors, setFieldValue}) => {
            return isEdit ? (
              <AddMessageForm
                values={values}
                errors={errors}
                setFieldValue={setFieldValue}
                isViewOnly={false}
                setBannerImage={setBannerImage}
                setBannerImageUrl={setBannerImageUrl}
                bannerImage={bannerImage}
                bannerImageUrl={bannerImageUrl}
              />
            ) : (
              <AddMessageForm
                values={values}
                errors={errors}
                setFieldValue={setFieldValue}
                isViewOnly={false}
                setBannerImage={setBannerImage}
                setBannerImageUrl={setBannerImageUrl}
                bannerImage={bannerImageUrl}
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
  isEdit: PropTypes.bool,
  rowData: PropTypes.object,
};