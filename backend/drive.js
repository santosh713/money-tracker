const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "credentials.json"),
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

async function uploadOrUpdateJSON(fileName, data, folderId) {
  const existingFile = await drive.files.list({
    q: `name='${fileName}' and '${folderId}' in parents`,
    fields: "files(id, name)",
  });

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType: "application/json",
    body: JSON.stringify(data, null, 2),
  };

  if (existingFile.data.files.length > 0) {
    const fileId = existingFile.data.files[0].id;
    await drive.files.update({
      fileId,
      media: {
        mimeType: "application/json",
        body: JSON.stringify(data, null, 2),
      },
    });
    return fileId;
  } else {
    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id",
    });
    return file.data.id;
  }
}

async function readJSON(fileName, folderId) {
  const fileList = await drive.files.list({
    q: `name='${fileName}' and '${folderId}' in parents`,
    fields: "files(id, name)",
  });

  if (fileList.data.files.length === 0) return [];

  const fileId = fileList.data.files[0].id;

  const response = await drive.files.get({
    fileId,
    alt: "media",
  });

  return response.data;
}

module.exports = { uploadOrUpdateJSON, readJSON };
