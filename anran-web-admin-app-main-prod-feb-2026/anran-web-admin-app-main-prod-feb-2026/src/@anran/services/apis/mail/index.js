import mock from '../../MockConfig';
import folderList from '../../db/apps/mail/folderList';
import folderListNew from '../../db/apps/mail/folderListNew';
import labelList from '../../db/apps/mail/labelList';
import connectionList from '../../db/apps/mail/connectionList';
import mailData from '../../db/apps/mail/mailList';

let mailList = mailData;

mock.onGet('/messages/folders/list').reply(200, folderListNew);

mock.onGet('/messages/folder/mail/List').reply((config) => {
  const params = config.params;
  let folderMailList = [];
  if (params.type === 'folder') {
    if (params.name === 'starred') {
      folderMailList = mailList.filter((mail) => mail.isStarred);
    } else {
      const folderId = folderListNew.find(
        (folder) => folder.alias === params.name,
      ).id;
      folderMailList = mailList.filter((mail) => mail.folderValue === folderId);
    }
  } else if (params.type === 'label') {
    const labelType = labelList.find((label) => label.alias === params.name).id;
    folderMailList = mailList.filter((mail) => mail.label.id === labelType);
  }
  const index = params.page * 15;
  const count = folderMailList.length;
  const data =
    folderMailList.length > 15
      ? folderMailList.slice(index, index + 15)
      : folderMailList;

  return [200, {data: data, count: count}];
});

mock.onGet('/mailApp/mail/').reply((config) => {
  const params = config.params;
  mailList = mailList.map((mail) => {
    if (params.id === mail.id) {
      mail.isRead = status;
      return mail;
    } else {
      return mail;
    }
  });
  const response = mailList.find((mail) => mail.id === parseInt(params.id));
  return [200, response];
});

mock.onGet('/mailApp/mails/list').reply(200, mailList);

mock.onGet('/mailApp/folders/list').reply(200, folderList);

mock.onGet('/mailApp/labels/list').reply(200, labelList);

mock.onGet('/mailApp/connection/list').reply(200, connectionList);

mock.onGet('/mailApp/folder/mail/List').reply((config) => {
  const params = config.params;
  let folderMailList = [];
  if (params.type === 'folder') {
    if (params.name === 'starred') {
      folderMailList = mailList.filter((mail) => mail.isStarred);
    } else {
      const folderId = folderList.find(
        (folder) => folder.alias === params.name,
      ).id;
      folderMailList = mailList.filter((mail) => mail.folderValue === folderId);
    }
  } else if (params.type === 'label') {
    const labelType = labelList.find((label) => label.alias === params.name).id;
    folderMailList = mailList.filter((mail) => mail.label.id === labelType);
  }
  const index = params.page * 15;
  const count = folderMailList.length;
  const data =
    folderMailList.length > 15
      ? folderMailList.slice(index, index + 15)
      : folderMailList;

  return [200, {data: data, count: count}];
});

mock.onPut('/mailApp/update/mails').reply((request) => {
  const mails = request.data;
  return [200, mails];
});

mock.onPut('/mailApp/update/starred').reply((request) => {
  const {mailIds, status} = JSON.parse(request.data);
  mailList = mailList.map((mail) => {
    if (mailIds.includes(mail.id)) {
      mail.isStarred = !!status;
      return mail;
    } else {
      return mail;
    }
  });
  return [200, mailList];
});

mock.onPut('/mailApp/update/folder').reply((request) => {
  const {mailIds, type} = JSON.parse(request.data);
  mailList = mailList.map((mail) => {
    if (mailIds.includes(mail.id)) {
      mail.folderValue = type;
      return mail;
    } else {
      return mail;
    }
  });
  return [200, mailList];
});

mock.onPut('/mailApp/update/label').reply((request) => {
  const {mailIds, type} = JSON.parse(request.data);
  mailList = mailList.map((mail) => {
    if (mailIds.includes(mail.id)) {
      mail.label = type;
      return mail;
    } else {
      return mail;
    }
  });
  return [200, mailList];
});

mock.onPut('/mailApp/mail/').reply((request) => {
  const {mail} = JSON.parse(request.data);
  mailList = mailList.map((item) => (item.id === mail.id ? mail : item));
  return [200, mail];
});

mock.onPut('/mailApp/update/read').reply((request) => {
  const {mailIds, status} = JSON.parse(request.data);
  mailList = mailList.map((mail) => {
    if (mailIds.includes(mail.id)) {
      mail.isRead = status;
      return mail;
    } else {
      return mail;
    }
  });
  return [200, mailList];
});

mock.onPost('/mailApp/compose').reply((request) => {
  const {mail} = JSON.parse(request.data);
  mailList = [mail, ...mailList];
  return [200, mail];
});
