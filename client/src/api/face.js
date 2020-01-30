import * as faceapi from 'face-api.js';

const SSD_MOBILENETV1 = 'ssd_mobilenetv1';
const TINY_FACE_DETECTOR = 'tiny_face_detector';

let selectedFaceDetector = SSD_MOBILENETV1;

// ssd_mobilenetv1 options
let minConfidence = 0.5;

// tiny_face_detector options
let inputSize = 512;
let scoreThreshold = 0.5;


const maxDescriptorDistance = 0.5;

function getFaceDetectorOptions() {
  return selectedFaceDetector === SSD_MOBILENETV1
    ? new faceapi.SsdMobilenetv1Options({ minConfidence })
    : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
}

function getCurrentFaceDetectionNet() {
  if (selectedFaceDetector === SSD_MOBILENETV1) {
    return faceapi.nets.ssdMobilenetv1;
  }
  if (selectedFaceDetector === TINY_FACE_DETECTOR) {
    return faceapi.nets.tinyFaceDetector;
  }
}

export async function loadModels() {
  const MODEL_URL = process.env.PUBLIC_URL + '/models';
  // await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
  // await faceapi.loadFaceLandmarkTinyModel(MODEL_URL);
  await getCurrentFaceDetectionNet().load(MODEL_URL)
  await faceapi.loadFaceRecognitionModel(MODEL_URL);
  await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
  await faceapi.loadFaceLandmarkModel(MODEL_URL)
}

export async function getFullFaceDescription(blob, inputSize = 512) {
  const OPTION = getFaceDetectorOptions()

  // fetch image to api
  let img = await faceapi.fetchImage(blob);

  // detect all faces and generate full description from image
  // including landmark and descriptor of each face
  let fullDesc = await faceapi
    .detectAllFaces(img, OPTION)
    .withFaceLandmarks()
    .withFaceDescriptors();
  return fullDesc;
}



export async function createMatcher(faceProfile) {
  // Create labeled descriptors of member from profile
  let members = Object.keys(faceProfile);
  let labeledDescriptors = members.map(
    member =>
      new faceapi.LabeledFaceDescriptors(
        faceProfile[member].name,
        faceProfile[member].descriptors.map(
          descriptor => new Float32Array(descriptor)
        )
      )
  );

  // Create face matcher (maximum descriptor distance is 0.5)
  let faceMatcher = new faceapi.FaceMatcher(
    labeledDescriptors,
    maxDescriptorDistance
  );
  return faceMatcher;
}

export function isFaceDetectionModelLoaded() {
  return !!faceapi.nets.tinyFaceDetector.params;
}
