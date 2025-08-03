function fileSubmit() {
  const input = document.getElementById("file");
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function () {
    const contents = reader.result;
    handle(contents);
  };
  reader.readAsText(file);
}

function handle(contents) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(contents, "text/xml");
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
  for (id of importantInfo) {
    JSON[id] = xmlDoc.getElementsByTagName(id)[0].childNodes[0].nodeValue;
  }
  console.log(JSON);
  document.getElementById("output").innerHTML = `Stats: ${[
    "Name",
    JSON.Name,
    "Time",
    JSON.Time,
    "TotalDeaths",
    JSON.TotalDeaths,
    "TotalStrawberries",
    JSON.TotalStrawberries,
    "TotalGoldenStrawberries",
    JSON.TotalGoldenStrawberries,
    "TotalJumps",
    JSON.TotalJumps,
    "TotalWallJumps",
    JSON.TotalWallJumps,
    "TotalDashes",
    JSON.TotalDashes,
  ]}`;
}
