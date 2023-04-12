const constraints = {
  video: {
    width: { exact: 1280 },
    height: { exact: 720 }, // 720p resolution
    frameRate: { exact: 30 }, // 30 fps
    bitrate: { exact: 5000000 }, // 5 Mbps bitrate (5,000,000 bits per second)
    codec: "vp9", // VP9 video codec
  },
  audio: true,
};

let recordedChunks = [];
let mediaRecorder;
let theStream;

let stopInterval;

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
  let newRecording = true;
  let count = 0;
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
        "X-segment-start": newRecording,
      },
      body: formData,
    }).then((res) => res);

    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = `segment${count}.mp4`;
    a.click();
    newRecording = false;
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

const listGroup = document.getElementById("list-group");
if (listGroup) {
  let checked = true;
  fetch("http://localhost:5000/segment/list")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((segment) => {
        const radio = document.createElement("input");
        radio.setAttribute("type", "radio");
        radio.setAttribute("id", segment.id);
        radio.addEventListener("click", () => {
          const radios = document.querySelectorAll("input[type=radio]");
          radios.forEach((r) => {
            if (r.id !== radio.id) {
              r.checked = false;
            } else {
              r.checked = true;
            }
          });
        });

        radio.setAttribute("value", segment.id);
        if (checked) {
          radio.checked = true;
        }
        checked = false;
        const label = document.createElement("label");
        label.innerHTML = "Recorded at " +
          new Date(segment.start_time).toDateString() +
          " " +
          new Date(segment.start_time).toLocaleTimeString();

        const li = document.createElement("li");
        li.setAttribute("id", segment.id);
        li.className = "list-group-item";
        li.appendChild(radio);
        li.appendChild(label);
        listGroup.appendChild(li);
      });
    });
}

function view() {
  const mediaSource = new MediaSource();
  const video = document.getElementById("myVideo");
  video.src = URL.createObjectURL(mediaSource);

  mediaSource.addEventListener("sourceopen", () => {
    fetch("http://localhost:5000/segment/video", {
      method: "GET",
      headers: {
        "X-record-id": +document.querySelector("input:checked").value,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
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
