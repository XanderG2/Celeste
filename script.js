function fileSubmit() {
  const input = document.getElementById("file");
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function () {
    const contents = reader.result;
    console.log(contents);
  };
  reader.readAsText(file);
}
