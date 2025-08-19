function fileSubmit() {
  const input = document.getElementById("file");
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function () {
    const contents = reader.result;
    const KVP = handle(contents);
    pretty(KVP);
  };
  reader.readAsText(file);
}

function handle(contents) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(contents, "text/xml");
  const BaseStatsJSON = BaseStats(xmlDoc);
  const AreaStatsJSON = AreaStats(xmlDoc);
  let JSoN = { ...BaseStatsJSON, ...AreaStatsJSON };
  let KVP = [];
  const K = Object.keys(JSoN);
  const V = Object.values(JSoN);
  for (let i = 0; i < K.length; i++) {
    KVP.push([K[i], V[i]]);
  }
  return JSoN;
}

function BaseStats(xmlDoc) {
  const importantInfo = [
    "Name",
    "Time",
    "TotalDeaths",
    "TotalStrawberries",
    "TotalGoldenStrawberries",
    "TotalJumps",
    "TotalWallJumps",
    "TotalDashes",
  ];
  let JSON = { important: {} };
  for (const id of importantInfo) {
    const spaces = (
      id
        .replace(/([A-Z])/g, " $1")
        .charAt(0)
        .toUpperCase() + id.replace(/([A-Z])/g, " $1").slice(1)
    ).trim();
    JSON.important[spaces] =
      xmlDoc.getElementsByTagName(id)[0].childNodes[0].nodeValue;
  }
  JSON.important.Time = timeToTime(JSON.important.Time);
  return JSON;
}

function timeToTime(durationU) {
  let duration = durationU / 10000;
  let milliseconds = duration % 1000;
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor(duration / (1000 * 60 * 60));

  // Pad with leading zeros
  let h = String(hours).padStart(2, "0");
  let m = String(minutes).padStart(2, "0");
  let s = String(seconds).padStart(2, "0");
  let ms = String(milliseconds).padStart(3, "0"); // always 3 digits

  return `${h}:${m}:${s}.${ms}`;
}

function AreaStats(xmlDoc) {
  const Areas = xmlDoc.getElementsByTagName("Areas")[0];
  const allAreaStats = Areas.getElementsByTagName("AreaStats");
  let JSON = {};
  for (const areaStat of allAreaStats) {
    const id = areaStat.getAttribute("ID");
    let chapter = "";
    if (id == 0) {
      chapter = "Prologue";
    } else if (id > 0 && id < 8) {
      chapter = `${id}`;
    } else if (id == 8) {
      chapter = "Epilogue";
    } else if (id > 8) {
      chapter = `${id - 1}`;
    }
    const areamodestats = areaStat.getElementsByTagName("AreaModeStats");
    const A = areamodestats[0];
    const B = areamodestats[1];
    const C = areamodestats[2];
    const AsideStats = {
      Strawberries: A.getAttribute("TotalStrawberries"),
      Completed: A.getAttribute("Completed"),
      Deaths: A.getAttribute("Deaths"),
      Time: timeToTime(A.getAttribute("TimePlayed")),
      BestTime: A.getAttribute("BestTime"),
      BestDashes: A.getAttribute("BestDashes"),
      BestDeaths: A.getAttribute("BestDeaths"),
      HeartGem: A.getAttribute("HeartGem"),
    };
    const BsideStats = {
      Completed: B.getAttribute("Completed"),
      Deaths: B.getAttribute("Deaths"),
      Time: timeToTime(B.getAttribute("TimePlayed")),
      BestTime: B.getAttribute("BestTime"),
      BestDashes: B.getAttribute("BestDashes"),
      BestDeaths: B.getAttribute("BestDeaths"),
      HeartGem: B.getAttribute("HeartGem"),
    };
    const CsideStats = {
      Completed: C.getAttribute("Completed"),
      Deaths: C.getAttribute("Deaths"),
      Time: timeToTime(C.getAttribute("TimePlayed")),
      BestTime: C.getAttribute("BestTime"),
      BestDashes: C.getAttribute("BestDashes"),
      BestDeaths: C.getAttribute("BestDeaths"),
      HeartGem: C.getAttribute("HeartGem"),
    };
    JSON[id] = {
      Chapter: chapter,
      Cassette: areaStat.getAttribute("Cassette"),
      A: AsideStats,
      B: BsideStats,
      C: CsideStats,
    };
  }
  return JSON;
}

function pretty(stats) {
  const outputDiv = document.getElementById("output");
  const important = stats.important;
  const importantKVP = Object.entries(important);
  const OneToFour = importantKVP.splice(0, 4);
  const FiveToEight = importantKVP.splice(0, 4);
  const importantFieldset = document.createElement("fieldset");
  importantFieldset.innerHTML = `<legend>Statistics</legend>`;
  const div1 = document.createElement("div");
  div1.style = "display:flex;";
  for (KVP of OneToFour) {
    div1.innerHTML += `<div style="margin:auto"><h3>${KVP[0]}</h3><p>${KVP[1]}</p></div>`;
  }
  const div2 = document.createElement("div");
  div2.style = "display:flex;";
  for (KVP of FiveToEight) {
    div2.innerHTML += `<div style="margin:auto"><h3>${KVP[0]}</h3><p>${KVP[1]}</p></div>`;
  }
  importantFieldset.appendChild(div1);
  importantFieldset.appendChild(div2);
  outputDiv.appendChild(importantFieldset);
}
