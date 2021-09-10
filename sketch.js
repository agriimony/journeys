// RANDOMIZER
function random_hash() {
  let x = "0123456789abcdef", hash = '0x'
  for (let i = 64; i > 0; --i) {
    hash += x[Math.floor(Math.random()*x.length)]
  }
  return hash
}

tokenData = {
  "hash": random_hash(),
  "tokenId": "123000456"
}

let hash = tokenData.hash;

class Random { // Source: https://en.wikipedia.org/wiki/Xorshift licensed under CC-BY-SA 3.0.
  constructor(seed) {
    this.seed = seed
  }

  // Random dec from 0 - 1
  random_dec() {
    /* Algorithm "xor" from p. 4 of Marsaglia, "Xorshift RNGs" */
    this.seed ^= this.seed << 13
    this.seed ^= this.seed >> 17
    this.seed ^= this.seed << 5
    return ((this.seed < 0 ? ~this.seed + 1 : this.seed) % 1000) / 1000
  }

  // Random dec from a to b
  random_num(a, b) {
    return a+(b-a)*this.random_dec()
  }

  // Random int from a to b
  random_int(a, b) {
    return Math.floor(this.random_num(a, b+1))
  }
}

// GLOBALS
let W = 1000;
let H = 1000;
let lines = [];
let lineMinDist = 10;
let stationMinDist = 50;
let stationDistScale = 20;
let seed = parseInt(tokenData.hash.slice(0, 16), 16);
let R = new Random(seed);
let noiseScale = 0.005;
let nLines = R.random_int(5,15);


// CLASSES
class Line {
  constructor(id){
    this.id = id;
    if (R.random_dec() < 0.99) {
      this.type = 0; // 0 = linear
    } else {
      this.type = 1; // 1 = cyclic
    }
    
    if (this.type == 0) {
      this.facing = R.random_int(0, 7) //0 = w, 1 = nw, 2 = n, 3 = ne, 4 = e, 5 = se, 6 = s, 7 = sw,
      if (this.facing == 0) {
        this.start = createVector(R.random_int(W * 0.1, W * 0.4), R.random_int(H * 0.4, H * 0.6));
      } else if (this.facing == 1) {
        this.start = createVector(R.random_int(W * 0.1, W * 0.4), R.random_int(H * 0.1, H * 0.4));
      } else if (this.facing == 2) {
        this.start = createVector(R.random_int(W * 0.4, W * 0.6), R.random_int(H * 0.1, H * 0.4));
      } else if (this.facing == 3) {
        this.start = createVector(R.random_int(W * 0.6, W * 0.9), R.random_int(H * 0.1, H * 0.4));
      } else if (this.facing == 4) {
        this.start = createVector(R.random_int(W * 0.6, W * 0.9), R.random_int(H * 0.4, H * 0.6));
      } else if (this.facing == 5) {
        this.start = createVector(R.random_int(W * 0.6, W * 0.9), R.random_int(H * 0.6, H * 0.9));
      } else if (this.facing == 6) {
        this.start = createVector(R.random_int(W * 0.4, W * 0.6), R.random_int(H * 0.6, H * 0.9));
      } else if (this.facing == 7) {
        this.start = createVector(R.random_int(W * 0.1, W * 0.4), R.random_int(H * 0.6, H * 0.9));
      }
    } else if (this.type == 1) {
      this.start = createVector(R.random_int(W * 0.4, W * 0.6), R.random_int(H * 0.4, H * 0.6))
    }
    this.start.x = round(this.start.x / 100) * 100;
    this.start.y = round(this.start.y / 100) * 100;
    this.stations = [this.start];
    this.nStations = R.random_int(10, 20);
    this.stationSize = 10;
    this.lineColor = color(R.random_int(100 / nLines * this.id, 100 / nLines * (this.id + 1)), R.random_int(80,100), R.random_int(50,80));
    this.lineWeight = max(100 / nLines, 3);
    this.stationLineWeight = min(15 - this.lineWeight, 3);
  }

  generate() {
    if (this.type == 0) { //Linear
      var mod = 0;
      var lastAng = -20; 
      var x1 = this.start.x;
      var y1 = this.start.y;
      
      for (let i = 0; i < this.nStations-1; i++) {  
        var count = 0;
        var step = stationMinDist + R.random_int(0, stationDistScale);
        var inBounds = false;

        while (!inBounds & count < 100000) {
          var ang = round(map(noise(x1 * noiseScale, y1 * noiseScale, this.id * noiseScale + this.facing), 0, 1, -3.49 + this.facing, 3.49 + this.facing) + mod) * PI / 4;
          
          
          var xoff = step * cos(ang);
          var yoff = step * sin(ang);

          if (x1 + xoff < W * 0.1 || x1 + xoff > W * 0.9 || y1 + yoff > H * 0.9 || y1 + yoff < H * 0.1) {
            inBounds = false;
            mod += 1;
          } else {
            if (abs(ang - lastAng) == PI) {//Don't allow 180 deg turns
              inBounds = false;
              mod += 1;
            } else {
              //console.log("Ang: " , ang / PI , " , lastAng: " , lastAng / PI);
              lastAng = ang;
              inBounds = true;
            }
            count += 1;
          } 
        }

        this.stations.push(createVector(x1 + xoff, y1 + yoff));

        x1 += xoff;
        y1 += yoff;
      }
    } else if (this.type == 1) { // cyclic
      // Generate circle line stations
  }

  display_line() {
    if (this.type == 0) {
      push();
      noFill();
      stroke(this.lineColor);
      strokeWeight(this.lineWeight);
      beginShape();
      for (let i = 0; i < this.nStations; i++) {
        vertex(this.stations[i].x, this.stations[i].y);
      }
      endShape();
      pop();
    } else if (this.type == 1){
      push();
      noFill();
      stroke(this.lineColor);
      strokeWeight(this.lineWeight);
      ellipse(this.start.x, this.start.y, this.size);
      pop();
    }
  }

  display_stations(bg) {
    push();
    fill(bg);
    stroke(this.lineColor);
    strokeWeight(this.stationLineWeight);
    for (let i = 0; i < this.nStations; i++) {
      ellipse(this.stations[i].x, this.stations[i].y, this.stationSize);
    }
    pop();
  }
}

function setup() {
  colorMode(HSB, 100);
  createCanvas(W, H);

  var bg;
  bg = color(50, 0, 90);
  
  background(bg);


  noiseSeed(seed);

  var id = 0;
  var count = 0;
  while (lines.length < nLines && count < 100000) {
    lines.push(new Line(id));
    lines[lines.length-1].generate();
    if (!checkValidLine(id)) {
      lines.pop();
    } else {
      id += 1;
    }
    console.log(id);
    count += 1;
  }

  for (let i = 0; i < nLines; i++) {
    lines[i].display_line();
  }
  for (let i = 0; i < nLines; i++) {
    lines[i].display_stations(bg);
  }
  
}

function draw() {
  //background(220);
}

// Valid lines are those which do not have a station which maintains some min distance from any line segment on a different line
function checkValidLine(id) {
  valid = true;
  for (let s = 0; s < lines[id].stations.length; s++) { //Loop through all stations in line <id>
    for (let i = 0; i < lines.length; i++) { //Loop through all lines
      if (i == id) {continue} // Skip check for same line
      for (let j = 0; j < lines[i].stations.length - 1; j++)  { //Loop through all line segments in line i
        var s1 = lines[id].stations[s];
        var l1 = lines[i].stations[j];
        var l2 = lines[i].stations[j+1];

        var d = pDistance(s1.x, s1.y, l1.x, l1.y, l2.x, l2.y)

        if (d < lineMinDist) { // too close!
          valid = false;
          return valid;
        }
      }
    }
  }
  return valid;
}

function pDistance(x, y, x1, y1, x2, y2) { //https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

function inRange(x1, y1, x2, y2, x3, y3) { // Check if point x1, y1 is within the area demarcated by x2,y2 and x3,y3
  let minx = min(x2, x3);
  let miny = min(y2, y3);
  let maxx = max(x2, x3);
  let maxy = max(y2, y3);

  if (x1 > minx && x1 < maxx && y1 > miny && y1 < maxy) {
    return true;
  } else {
    return false;
  }
}
