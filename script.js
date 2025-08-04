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
  return KVP;
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
  let JSON = {};
  for (const id of importantInfo) {
    JSON[id] = xmlDoc.getElementsByTagName(id)[0].childNodes[0].nodeValue;
  }
  return JSON;
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
      Strawbs: A.getAttribute("TotalStrawberries"),
      Completed: A.getAttribute("Completed"),
      Deaths: A.getAttribute("Deaths"),
      Time: A.getAttribute("TimePlayed"),
      BestTime: A.getAttribute("BestTime"),
      BestDashes: A.getAttribute("BestDashes"),
      BestDeaths: A.getAttribute("BestDeaths"),
      HeartGem: A.getAttribute("HeartGem"),
    };
    const BsideStats = {
      Strawbs: B.getAttribute("TotalStrawberries"),
      Completed: B.getAttribute("Completed"),
      Deaths: B.getAttribute("Deaths"),
      Time: B.getAttribute("TimePlayed"),
      BestTime: B.getAttribute("BestTime"),
      BestDashes: B.getAttribute("BestDashes"),
      BestDeaths: B.getAttribute("BestDeaths"),
      HeartGem: B.getAttribute("HeartGem"),
    };
    const CsideStats = {
      Strawbs: C.getAttribute("TotalStrawberries"),
      Completed: C.getAttribute("Completed"),
      Deaths: C.getAttribute("Deaths"),
      Time: C.getAttribute("TimePlayed"),
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

function pretty(KVP) {
  const outputDiv = document.getElementById("output");
  let KVP2 = [];
  for (pair of KVP) {
    const div = document.createElement("div");
    div.id = pair[0];
    if (typeof pair[1] === "object") {
      KVP2.push(pair);
    } else {
      div.innerHTML = `<h1>${pair[0]}</h1> <p>${pair[1]}</p>`;
    }
    outputDiv.appendChild(div);
  }
  for (pair of KVP2) {
    const div = document.createElement("div");
    div.id = pair[0];
    div.innerHTML = `<h1>${pair[0]}</h1>`;
    console.log(pair[1]);
    for (const [K, V] of Object.entries(pair[1])) {
      const div2 = document.createElement("div");
      div2.id = K;
      div2.innerHTML = `<h2>${K}</h2>`;
      if (typeof V === "object") {
        for (const [K2, V2] of Object.entries(V)) {
          const div3 = document.createElement("div");
          div3.id = K2;
          div3.innerHTML = `<h3>${K2}</h3> <p>${V2}</p>`;
          div2.appendChild(div3);
        }
      } else {
        div2.innerHTML += `<p>${V}</p>`;
      }
      div.appendChild(div2);
    }
    outputDiv.appendChild(div);
  }
}
