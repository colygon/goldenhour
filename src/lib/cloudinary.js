export async function getUploadSignature() {
  const res = await fetch('/api/upload');
  if (!res.ok) throw new Error('Failed to get upload signature');
  return res.json();
}

export async function uploadMedia(file, onProgress = () => {}) {
  const { signature, timestamp, folder, api_key, cloud_name } =
    await getUploadSignature();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('api_key', api_key);

  if (file.type.startsWith('video/')) {
    formData.append('transformation', 'du_30,q_auto:low,f_mp4,w_720');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });
    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`
    );
    xhr.send(formData);
  });
}
