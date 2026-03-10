import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CardHeader from './CardHeader';
import {Formik} from 'formik';
import * as yup from 'yup';
import AddPopupMessageForm from './AddPopupMessageForm';
import {useInfoViewActionsContext} from '@anran/utility/AppContextProvider/InfoViewContextProvider';
import {postDataApi, putDataApi} from '@anran/utility/APIHooks';
import dayjs from 'dayjs';
import AppDialog from '@anran/core/AppDialog';
import {useIntl} from 'react-intl';

const AddPopupMessage = ({
  isOpen,
  setOpenDialog,
  reCallAPI,
  isEdit,
  rowData,
  setSelectedMessage,
}) => {
  const intl = useIntl();
  const formatMessage = intl.formatMessage;

  const infoViewActionsContext = useInfoViewActionsContext();
  const [popupImage, setPopupImage] = React.useState(null);
  const [popupImageUrl, setPopupImageUrl] = React.useState(
    isEdit ? rowData?.imageUrl : null,
  );

  const validationSchema = useMemo(() => {
    return yup.object({
      startDate: yup.string().when('always', {
        is: false,
        then: () =>
          yup.string().required(
            formatMessage({id: 'popupMessage.validation.fieldRequired'}),
          ),
      }),
      endDate: yup.string().when('always', {
        is: false,
        then: () =>
          yup.string().required(
            formatMessage({id: 'popupMessage.validation.fieldRequired'}),
          ),
      }),
      messageContentType: yup
        .string()
        .required(formatMessage({id: 'popupMessage.validation.fieldRequired'})),
      messageDetails: yup.array().of(
        yup.object().shape({
          messageTitle: yup
            .string()
            .required(formatMessage({id: 'popupMessage.validation.titleRequired'})),
          messageShortDescription: yup
            .string()
            .required(
              formatMessage({id: 'popupMessage.validation.shortDescriptionRequired'}),
            )
            .max(
              200,
              formatMessage(
                {id: 'popupMessage.validation.shortDescriptionMax'},
                {max: 200},
              ),
            ),
          messageContent: yup
            .string()
            .required(formatMessage({id: 'popupMessage.validation.contentRequired'})),
          country: yup
            .string()
            .required(formatMessage({id: 'popupMessage.validation.languageRequired'})),
        }),
      ),
    });
  }, [formatMessage]);

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
              setPopupImage(null);
              setPopupImageUrl(null);
              setOpenDialog(false);
            }}
            title={
              isEdit
                ? formatMessage({id: 'popupMessage.dialog.editTitle'})
                : formatMessage({id: 'popupMessage.dialog.createTitle'})
            }
          />
        }
      >
        <Formik
          validateOnBlur={true}
          initialValues={{
            startDate: isEdit ? dayjs(rowData.startDate) : dayjs(),
            endDate: isEdit ? dayjs(rowData.endDate) : dayjs().add(1, 'day'),
            publish: isEdit ? rowData.publish : false,
            messageContentType: isEdit ? rowData.messageContentType : '',
            statusActive: isEdit ? rowData.statusActive : true,
            isEdit: isEdit,
            messageDetails: isEdit
              ? rowData.messageDetails
              : [
                  {
                    messageTitle: '',
                    messageShortDescription: '',
                    messageContent: '',
                    country: 'en',
                  },
                ],
          }}
          validationSchema={validationSchema}
          onSubmit={(data, {setSubmitting, setErrors}) => {
            setSubmitting(true);

            if (isEdit) {
              const formData = new FormData();
              formData.append('image', popupImage);

              Object.keys(data).forEach((key) => {
                if (key === 'messageDetails') {
                  formData.append(key, JSON.stringify(data[key]));
                } else {
                  formData.append(key, data[key]);
                }
              });

              formData.set('startDate', data.startDate.format('YYYY-MM-DD'));
              formData.set('endDate', data.endDate.format('YYYY-MM-DD'));

              putDataApi(
                `/api/popup-message/${rowData._id}`,
                infoViewActionsContext,
                formData,
                false,
                {'Content-Type': 'multipart/form-data'},
              )
                .then(() => {
                  reCallAPI();
                  setPopupImage(null);
                  setPopupImageUrl(null);
                  setOpenDialog(false);
                  setSelectedMessage(null);

                  infoViewActionsContext.showMessage(
                    formatMessage({id: 'popupMessage.toast.updatedSuccess'}),
                  );
                })
                .catch((error) => {
                  infoViewActionsContext.fetchError(error.message);
                });
            } else {
              if (!popupImage) {
                setErrors({image: formatMessage({id: 'popupMessage.validation.imageRequired'})});
                setSubmitting(false);
                return;
              }

              const formData = new FormData();
              formData.append('image', popupImage);

              Object.keys(data).forEach((key) => {
                if (key === 'messageDetails') {
                  formData.append(key, JSON.stringify(data[key]));
                } else {
                  formData.append(key, data[key]);
                }
              });

              formData.set('startDate', data.startDate.format('YYYY-MM-DD'));
              formData.set('endDate', data.endDate.format('YYYY-MM-DD'));

              postDataApi(
                '/api/popup-message',
                infoViewActionsContext,
                formData,
                false,
                {'Content-Type': 'multipart/form-data'},
              )
                .then(() => {
                  reCallAPI();
                  setPopupImage(null);
                  setPopupImageUrl(null);
                  setOpenDialog(false);

                  infoViewActionsContext.showMessage(
                    formatMessage({id: 'popupMessage.toast.createdSuccess'}),
                  );
                })
                .catch((error) => {
                  infoViewActionsContext.fetchError(error.message);
                });
            }

            setSubmitting(false);
          }}
        >
          {({values, errors, setFieldValue}) => (
            <AddPopupMessageForm
              values={values}
              errors={errors}
              setFieldValue={setFieldValue}
              isViewOnly={false}
              setPopupImage={setPopupImage}
              setPopupImageUrl={setPopupImageUrl}
              popupImage={values.isEdit ? popupImage : popupImageUrl}
              popupImageUrl={popupImageUrl}
              infoViewActionsContext={infoViewActionsContext}
            />
          )}
        </Formik>
      </AppDialog>
    </Box>
  );
};

export default AddPopupMessage;

AddPopupMessage.propTypes = {
  reCallAPI: PropTypes.func,
  isOpen: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  setOpenDialog: PropTypes.func,
  isEdit: PropTypes.bool,
  rowData: PropTypes.object,
  setSelectedMessage: PropTypes.func,
};
