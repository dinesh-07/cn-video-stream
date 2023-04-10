# Application/Transport Layers (A Video Streaming Application)

### Install the following dependencies

#### Node

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
$ nvm install lts/gallium
$ nvm use
```

#### MySQL
```bash
https://www.mysql.com/downloads/
```

### Setup project

Clone Repository (`https://github.com/dinesh-07/cn-video-stream.git`)
```bash
$ git clone https://github.com/dinesh-07/cn-video-stream.git
```

#### Install Server Dependency
```bash
$ cd server
$ npm install
```

#### Start Server
```bash
$ npm start
```

#### Open Client file for live recording
```bash
$ cd client
$ index.html
```

#### Open Client file for watch live recording
```bash
$ cd client
$ view.html
```
### Demo

#### Live Recording
![](videorecord.png)

#### Live Watch
![](watch.png)

#### Live Video Segmentation
![](segment.png)

#### Save segment on database
![](db.png)
