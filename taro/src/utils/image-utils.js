export async function requestExternalImage(imageUrl) {
  const res = await fetch('fetch_external_image', {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ imageUrl }),
  });
  if (!(res.status < 400)) {
    console.error(res.status + ' : ' + (await res.text()));
    throw new Error('failed to fetch image from url: ' + imageUrl);
  }

  // let blob;
  // try {
  //   blob = await res.blob();
  //   console.log('blob :', blob);
  //   return await faceapi.bufferToImage(blob);
  // } catch (e) {
  //   console.error('received blob:', blob);
  //   console.error('error:', e);
  //   throw new Error('failed to load image from url: ' + imageUrl);
  // }
}
