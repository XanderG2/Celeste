import { createRoot } from "react-dom/client";
import React, { createElement as u, Fragment, useRef, useState, useMemo, FC } from "react";

type CharacterStats = ReturnType<typeof characterStats>;
type ChapterStats = ReturnType<typeof chapterStat>;
type HandleData = ReturnType<typeof handle>;
type SideStats = ReturnType<typeof getStats>;

/**
 * * Parses XML
 * @param contents - XML file as string
 */

function handle(contents: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(contents, "text/xml");

  const characterStatsJSON = characterStats(xmlDoc);
  const chapterStatsJSON = chapterStats(xmlDoc);

  return { important: characterStatsJSON, chapters: chapterStatsJSON };
}

/**
 * * converts input µs to formatted HH:MM:SS.MMM format
 */

function µsToTime(durationUStr: string | null) {
  const durationU = durationUStr != null ? parseFloat(durationUStr) : 0;
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
 * @param xmlDoc - The XML document to parse
 */
function characterStats(xmlDoc: Document) {
  const v = (id: string) => {
    const spaced = id.replace(/([A-Z])/g, " $1").trim();

    let val = xmlDoc.getElementsByTagName(id)[0].childNodes[0].nodeValue; // The value of the stat

    if (id === "Time") val = µsToTime(val); // Change time to time format HH:MM:SS.MMM

    if (val == null) {
      val = ""; // val shouldn't be null, but if it is, set it to an empty string
    }

    return val;
  };

  return {
    Name: v("Name"),
    Time: v("Time"),
    "Total Deaths": v("TotalDeaths"),
    "Total Strawberries": v("TotalStrawberries"),
    "Total Golden Strawberries": v("TotalGoldenStrawberries"),
    "Total Jumps": v("TotalJumps"),
    "Total Wall Jumps": v("TotalWallJumps"),
    "Total Dashes": v("TotalDashes"),
  };
}

/**
 * * Get the stats of a side of a chapter
 */
function getStats(side: Element) {
  return {
    Strawberries: side.getAttribute("TotalStrawberries") ?? "",
    Completed: side.getAttribute("Completed") ?? "",
    Deaths: side.getAttribute("Deaths") ?? "",
    Time: µsToTime(side.getAttribute("TimePlayed")) ?? "",
    BestTime: µsToTime(side.getAttribute("BestTime")) ?? "",
    BestDashes: side.getAttribute("BestDashes") ?? "",
    BestDeaths: side.getAttribute("BestDeaths") ?? "",
    HeartGem: side.getAttribute("HeartGem") ?? "",
  };
}

/**
 * * Get chapter-related stats
 */
function chapterStats(xmlDoc: Document) {
  const areas = xmlDoc.getElementsByTagName("Areas")[0]; // Find the chapter tag in XML
  const allAreaStats = areas.getElementsByTagName("AreaStats"); // Find the statistics for all chapters

  return [...allAreaStats].map(chapterStat);
}

function chapterStat(areaStat: Element) {
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

  return {
    Chapter: chapterName,
    Cassette: areaStat.getAttribute("Cassette"),
    A: AsideStats,
    B: BsideStats,
    C: CsideStats,
  };
}

/**
 * * Toggle a section
 */

function toggle(id: string) {
  const el = document.getElementById(id);
  if (el == null) return;
  const prevStyle = el.style.cssText;
  switch (prevStyle) {
    case "display: none;":
      el.style = "display: block;";
      break;
    case "display: block;":
      el.style = "display: none;";
      break;
  }
}

/**
 * * Self explanatory.
 * @param side
 * @param sideName - Either Prologue, Epilogue, A, B, or C
 */

const Sides: FC<{ side: ChapterStats["A"]; sideName: string }> = ({ side, sideName }) => {
  return (
    <fieldset>
      <legend>{sideName}</legend>
      <div style={{ display: "flex" }}>
        <div style={{ margin: "auto" }}>
          <h3>Deaths</h3>
          {side.Deaths}
        </div>
        <div style={{ margin: "auto" }}>
          <h3>Heart Crystal?</h3>
          {side.HeartGem}
        </div>
        <div style={{ margin: "auto" }}>
          <h3>Strawberries</h3>
          {side.Strawberries}
        </div>
        <div style={{ margin: "auto" }}>
          <h3>Time</h3>
          {side.Time}
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ margin: "auto" }}>
          <h3>Best Deaths</h3>
          {side.BestDeaths}
        </div>
        <div style={{ margin: "auto" }}>
          <h3>Best Time</h3>
          {side.BestTime}
        </div>
        <div style={{ margin: "auto" }}>
          <h3>Best Dashes</h3>
          {side.BestDashes}
        </div>
      </div>
    </fieldset>
  );
};

const Character: FC<{ important: CharacterStats }> = ({ important }) => {
  const importantKVP = Object.entries(important);
  const OneToFour = importantKVP.splice(0, 4); //* Name, Time, Deaths, Strawbs
  const FiveToEight = importantKVP.splice(0, 4); //* Golden Strawbs, Jumps, Wall Jumps, Dashes

  const divs1 = []; // The first line of stats
  for (const [key, value] of OneToFour) {
    divs1.push(
      <div key={key} style={{ margin: "auto" }}>
        <h3>{key}</h3>
        <p>{value}</p>
      </div>
    );
  }

  const divs2 = []; // The second line of stats
  for (const [key, value] of FiveToEight) {
    divs2.push(
      <div key={key} style={{ margin: "auto" }}>
        <h3>{key}</h3>
        <p>{value}</p>
      </div>
    );
  }

  return (
    <fieldset>
      <legend>Total Statistics</legend>
      <div style={{ display: "flex" }}>{divs1}</div>
      <div style={{ display: "flex" }}>{divs2}</div>
    </fieldset>
  );
};

const Chapter: FC<{ chapter: ChapterStats; open: boolean; toggle: () => void }> = ({ chapter, open, toggle }) => {
  console.log(chapter);
  const special = chapter.Chapter[0] !== "C"; // Check if the chapter is prologue or epilogue

  return (
    <div className="chapterDiv">
      <h1 style={{ cursor: "pointer" }} onClick={toggle}>
        {chapter.Chapter}
      </h1>
      {!open ? null : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {chapter.B.HeartGem == "true" ? <img src="redHeart.png" /> : null}
            {chapter.A.HeartGem == "true" ? <img src="blueHeart.png" /> : null}
            {chapter.C.HeartGem == "true" ? <img src="goldHeart.png" /> : null}
          </div>
          {chapter.A.Completed !== "true" ? (
            <p>{chapter.Chapter} not complete.</p>
          ) : (
            <div className="info">
              {special ? (
                <Sides side={chapter.A} sideName={chapter.Chapter} />
              ) : (
                <>
                  <Sides side={chapter.A} sideName="A Side" />
                  {chapter.B.Completed == "true" ? <Sides side={chapter.A} sideName="B Side" /> : null}
                  {chapter.C.Completed == "true" ? <Sides side={chapter.A} sideName="C Side" /> : null}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * * Returns to HTML code formatted well
 */

const Pretty: FC<{ KVP: HandleData }> = (props) => {
  const { KVP: stats } = props;
  const [openChapters, setOpenChapters] = useState<readonly string[]>([]);

  return (
    <div>
      <Character important={stats.important} />
      {stats.chapters.map((chapter) => (
        <Chapter
          chapter={chapter}
          open={openChapters.includes(chapter.Chapter)}
          toggle={() => {
            setOpenChapters((openChapters) => {
              const index = openChapters.indexOf(chapter.Chapter);
              if (index >= 0) {
                return [...openChapters.slice(0, index), ...openChapters.slice(index + 1)];
              } else {
                return [...openChapters, chapter.Chapter];
              }
            });
          }}
        />
      ))}
    </div>
  );
};

function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [KVP, setKVP] = useState<HandleData | null>(null);

  /**
   * * Runs upon submission of a file
   * * Finds file, and passes it off to handle
   */
  function fileSubmit(): void {
    const input = fileInputRef.current;

    if (input == null) {
      console.error("Could not find input button!");
      return;
    }

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
      setKVP(KVP);
      //pretty(KVP); // Display on webpage
    };

    reader.readAsText(file);
  }

  const restart = () => {
    setKVP(null);
  };

  if (KVP) {
    return (
      <div>
        <button onClick={restart}>Restart</button>
        <br />
        <Pretty KVP={KVP} />
      </div>
    );
  }

  return (
    <>
      <div>
        <h1>Upload a .celeste file to get started</h1>
        <p>
          <i style={{ color: "grey" }}>
            .celeste files are usually located in the file path C:\Program Files
            (x86)\Steam\steamapps\common\Celeste\Saves
          </i>
        </p>
        <input type="file" ref={fileInputRef} accept=".celeste" />
        <button id="submit" onClick={fileSubmit}>
          Submit
        </button>
      </div>
      <div id="output"></div>
    </>
  );
}
window.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");
  if (!root) throw new Error("No root element");
  createRoot(root).render(<App />);
});

console.log("loaded");
