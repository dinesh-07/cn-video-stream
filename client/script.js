const constraints = {
  video: {
    width: { exact: 1280 },
    height: { exact: 720 },
    frameRate: { exact: 30 },
  },
};

let recordedChunks = [];
let mediaRecorder;
let theStream;

let stopInterval;
let count = 0;

function startFunction() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotMedia)
    .catch((e) => {
      console.error("getUserMedia() failed: " + e);
    });
}

function gotMedia(stream) {
  theStream = stream;
  var video = document.querySelector("#video");
  video.srcObject = stream;
  try {
    mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  } catch (e) {
    console.error("Exception while creating MediaRecorder: " + e);
    return;
  }
  theRecorder = mediaRecorder;
  mediaRecorder.ondataavailable = (event) => {
    recordedChunks.push(event.data);
  };
  mediaRecorder.start(100);
  let start = 0;
  stopInterval = setInterval(() => {
    count++;
    const formData = new FormData();
    const length = recordedChunks.length;
    console.log(recordedChunks.slice(start, length));
    const blob = new Blob(recordedChunks.slice(start, length), {
      type: "video/webm",
    });
    start = length;
    formData.append("video", blob, "recorded-chunk.webm");
    fetch("http://localhost:5000/segment", {
      method: "POST",
      headers: {
        "X-segment-id": count,
      },
      body: formData,
    }).then((res) => res);

    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = `segment${count}.webm`;
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 100);
  }, 3000);
}

function stop() {
  clearInterval(stopInterval);
  theRecorder.stop();
  theStream.getTracks().forEach((track) => {
    track.stop();
  });
}

function reset() {
  fetch("http://localhost:5000/");
}

function view() {
  const mediaSource = new MediaSource();
  const video = document.getElementById("myVideo");
  video.src = URL.createObjectURL(mediaSource);

  mediaSource.addEventListener("sourceopen", () => {
    fetch("http://localhost:5000/segment/video")
    .then(response => response.blob())
    .then(blob => {
      const videoUrl = URL.createObjectURL(blob);
      video.src = videoUrl;
    });
  });
}

function download() {
  theRecorder.stop();
  theStream.getTracks().forEach((track) => {
    track.stop();
  });

  var blob = new Blob(recordedChunks, { type: "video/webm" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = "test.webm";
  a.click();
  // setTimeout() here is needed for Firefox.
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 100);
}
