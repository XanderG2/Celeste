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
 * @param {string} contents - XML file as string
 * @returns {Object} Object of overall and chapter statistics
 */

function handle(contents) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(contents, "text/xml");

  const characterStatsJSON = characterStats(xmlDoc);
  const chapterStatsJSON = chapterStats(xmlDoc);

  return { important: characterStatsJSON, ...chapterStatsJSON };
}

/**
 * * converts input µs to formatted HH:MM:SS.MMM format
 * @param {*} durationU
 * @returns {string}
 */

function µsToTime(durationU) {
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

/**
 * * Get character-related stats
 * @param {Document} xmlDoc - The XML document to parse
 * @returns {{[stat: string]: string}} An object containing character-related stats
 */

function characterStats(xmlDoc) {
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

  /** @type {{ [stat: string]: string }} */
  let importantStats = {};

  for (const id of importantInfo) {
    const spaced = id.replace(/([A-Z])/g, " $1").trim();
    const key = `${spaced[0].toUpperCase()}${spaced.slice(1)}`; // Converts the id to a human-readable name

    let val = xmlDoc.getElementsByTagName(id)[0].childNodes[0].nodeValue; // The value of the stat

    if (key === "Time") val = µsToTime(val); // Change time to time format HH:MM:SS.MMM

    if (val == null) {
      val = ""; // val shouldn't be null, but if it is, set it to an empty string
    }

    importantStats[key] = val;
  }

  return importantStats;
}

/**
 *
 * @param {Element} side
 * @returns
 */

function getStats(side) {
  return {
    Strawberries: side.getAttribute("TotalStrawberries"),
    Completed: side.getAttribute("Completed"),
    Deaths: side.getAttribute("Deaths"),
    Time: µsToTime(side.getAttribute("TimePlayed")),
    BestTime: side.getAttribute("BestTime"),
    BestDashes: side.getAttribute("BestDashes"),
    BestDeaths: side.getAttribute("BestDeaths"),
    HeartGem: side.getAttribute("HeartGem"),
  };
}

/**
 * * Get chapter-related stats
 * @param {Document} xmlDoc
 * @returns {{[chapter: string]: Object}}
 */

function chapterStats(xmlDoc) {
  const areas = xmlDoc.getElementsByTagName("Areas")[0]; // Find the chapter tag in XML
  const allAreaStats = areas.getElementsByTagName("AreaStats"); // Find the statistics for all chapters

  /** @type {{[chapter: string]: Object}} */
  let chapterStats = {};

  for (const areaStat of allAreaStats) {
    let idAttribute = areaStat.getAttribute("ID");
    if (idAttribute == null) {
      console.error("idAttribute is null!");
      idAttribute = "-1"; // idAttribute shouldn't be null, but if it is, set it -1
    }

    const id = parseInt(idAttribute, 10);

    const chapterName = id === 0 ? "Prologue" : id === 8 ? "Epilogue" : id < 8 ? `Chapter ${id}` : `Chapter ${id - 1}`; // id is stored as a number in the game's code, however is displayed differently

    const sides = areaStat.getElementsByTagName("AreaModeStats");

    const A = sides[0];
    const B = sides[1];
    const C = sides[2];
    const AsideStats = getStats(A);
    const BsideStats = getStats(B);
    const CsideStats = getStats(C);

    chapterStats[id] = {
      Chapter: chapterName,
      Cassette: areaStat.getAttribute("Cassette"),
      A: AsideStats,
      B: BsideStats,
      C: CsideStats,
    };
  }
  return chapterStats;
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
