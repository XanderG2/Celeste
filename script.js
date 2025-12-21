// @ts-check

/**
 * * Runs upon submission of a file
 * * Finds file, and passes it off to handle
 * @returns {void}
 */
function fileSubmit() {
  /** @type {HTMLInputElement | null} */
  const input = document.querySelector('input[type="file"]'); // The Choose file button

  if (input == null) {
    console.error("Could not find input button!");
    return;
  }

  /** @type {FileList | null} */
  const chosenFiles = input.files; // The user-selected file(s)

  if (chosenFiles == null) {
    console.error("No submitted file!"); // Can't read no files
    return;
  }

  if (chosenFiles.length !== 1) {
    console.error("Should be 1 file submitted!"); // Can't read 2 files
    return;
  }

  const file = chosenFiles[0]; // There is only one file, so the file will always be the first item

  const reader = new FileReader();
  reader.onload = () => {
    const contents = reader.result; // The contents of the file

    if (typeof contents !== "string") {
      console.error("Contents should be a string!");
      return;
    }

    const KVP = handle(contents);
    pretty(KVP); // Display on webpage
  };

  reader.readAsText(file);
}

/**
 * * Parses XML
 * @param {string} contents
 * @returns {Object}
 */
function handle(contents) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(contents, "text/xml");

  const BaseStatsJSON = BaseStats(xmlDoc);
  const AreaStatsJSON = AreaStats(xmlDoc);

  return { ...BaseStatsJSON, ...AreaStatsJSON };
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

  let JSON = { important: {} }; //TODO: rename to something other than JSON
  for (const id of importantInfo) {
    //TODO: add explanation
    const spaces = (
      id
        .replace(/([A-Z])/g, " $1")
        .charAt(0)
        .toUpperCase() + id.replace(/([A-Z])/g, " $1").slice(1)
    ).trim();
    JSON.important[spaces] = xmlDoc.getElementsByTagName(id)[0].childNodes[0].nodeValue;
  }

  JSON.important.Time = timeToTime(JSON.important.Time);
  return JSON;
}

function timeToTime(durationU) {
  //TODO: add explanation of what this function does
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
  const Areas = xmlDoc.getElementsByTagName("Areas")[0]; //* what does this do?
  const allAreaStats = Areas.getElementsByTagName("AreaStats");
  let JSON = {};

  for (const areaStat of allAreaStats) {
    const id = areaStat.getAttribute("ID");
    let chapter = ""; //TODO: rename this to chapterName

    //TODO: make this better
    if (id == 0) {
      chapter = "Prologue";
    } else if (id > 0 && id < 8) {
      chapter = `Chapter ${id}`;
    } else if (id == 8) {
      chapter = "Epilogue";
    } else if (id > 8) {
      chapter = `Chapter ${id - 1}`;
    }

    const areamodestats = areaStat.getElementsByTagName("AreaModeStats");
    const A = areamodestats[0];
    const B = areamodestats[1];
    const C = areamodestats[2];

    //TODO: use a function for repetitive getAttribute calls
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

    //* The formatted JSON for this chapter, probably shouldn't call it JSON.
    // TODO: change this whole function and rename JSON variable
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
  outputDiv.innerHTML = ""; // Clear the output before replacing it

  const important = stats.important;
  const importantKVP = Object.entries(important);

  const importantFieldset = document.createElement("fieldset");
  importantFieldset.innerHTML = `<legend>Total Statistics</legend>`;

  const OneToFour = importantKVP.splice(0, 4); //* Name, Time, Deaths, Strawbs
  const FiveToEight = importantKVP.splice(0, 4); //* Golden Strawbs, Jumps, Wall Jumps, Dashes

  const div1 = document.createElement("div"); // The first line of stats
  div1.style = "display:flex;";
  for (KVP of OneToFour) {
    div1.innerHTML += `<div style="margin:auto"><h3>${KVP[0]}</h3><p>${KVP[1]}</p></div>`;
  }

  const div2 = document.createElement("div"); // The second line of stats
  div2.style = "display:flex;";
  for (KVP of FiveToEight) {
    div2.innerHTML += `<div style="margin:auto"><h3>${KVP[0]}</h3><p>${KVP[1]}</p></div>`;
  }

  importantFieldset.appendChild(div1);
  importantFieldset.appendChild(div2);
  outputDiv.appendChild(importantFieldset);

  delete stats.important;

  //TODO: change to using a template
  Object.keys(stats).forEach((chapterId) => {
    const chapter = stats[chapterId];
    console.log(chapter);
    const chapterDiv = document.createElement("div");
    if (chapter.A.Completed == "true") {
      chapterDiv.innerHTML = `<h1>${chapter.Chapter}</h1><div></div>`;
    } else {
      chapterDiv.innerHTML = `${chapter.Chapter} Not Completed`;
    }
    outputDiv.appendChild(chapterDiv);
  });
}
