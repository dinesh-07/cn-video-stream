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
  var video = document.querySelector("video");
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

  stopInterval = setInterval(() => {
    count++;
    const formData = new FormData();
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    formData.append("video", blob, "myvideo.webm");
    fetch("http://localhost:5000/segment", {
      method: "POST",
      headers: {
        "X-segment-id": count,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((response) => console.log("Success:", JSON.stringify(response)))
      .catch((error) => console.error("Error:", error));

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
    recordedChunks = [];
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
    const sourceBuffer = mediaSource.addSourceBuffer(
      'video/webm; codecs="vp8, opus"'
    );

    for (let i = 1; i < 3; i++) {
      fetch(`http://localhost:5000/segment/${i}`, {
        method: "GET",
        headers: {
          "Content-Type":
            "multipart/form-data; boundary=----WebKitFormBoundaryFHADkzAysWPfmhB3",
        },
      })
        .then((response) => response.arrayBuffer())
        .then((segment) => {
          console.log(segment);
        });
    }
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
