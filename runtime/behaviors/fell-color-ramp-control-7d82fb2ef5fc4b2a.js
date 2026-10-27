export default async function install(app) {
  const mount = app.getMount("fell-color-controls");
  const layer = app.layers[app.config.layerId];
  app.assert(layer, "LakeDistrictFells is not on the map.");
  await layer.load();
  const ramps = {
    blueRed: { label: "Blue to Red", low: "#2166ac", mid: "#f7f7f7", high: "#b2182b" },
    purpleYellow: { label: "Purple to Yellow", low: "#5e3c99", mid: "#f7f7f7", high: "#e6ab02" },
    tealOrange: { label: "Teal to Orange", low: "#01665e", mid: "#f5f5f5", high: "#d6604d" }
  };
  const heading = document.createElement("p");
  heading.textContent = "Colour shows prominence; triangle size shows height.";
  heading.style.margin = "0 0 10px";
  const label = document.createElement("label");
  label.textContent = "Prominence colour ramp";
  label.style.display = "block";
  label.style.fontWeight = "600";
  label.style.marginBottom = "6px";
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Prominence colour ramp");
  select.style.width = "100%";
  select.style.marginBottom = "12px";
  Object.entries(ramps).forEach(([value, ramp]) => { const option = document.createElement("option"); option.value = value; option.textContent = ramp.label; select.append(option); });
  const samples = document.createElement("div");
  samples.setAttribute("aria-label", "Colour ramp samples");
  samples.style.display = "grid";
  samples.style.gridTemplateColumns = "repeat(3, 1fr)";
  samples.style.gap = "6px";
  samples.style.marginBottom = "8px";
  const note = document.createElement("small");
  note.textContent = "Click a sample or choose a ramp. Low prominence is the left colour; high is the right.";
  note.style.display = "block";
  function applyRamp(key) {
    const ramp = ramps[key];
    layer.renderer = { type: "simple", symbol: { type: "simple-marker", style: "triangle", color: "#7f7f7f", size: 8, outline: { color: "#ffffff", width: 0.75 } }, visualVariables: [ { type: "size", field: "Metres", legendOptions: { title: "Height (m)" }, stops: [ { value: 37, size: 5, label: "37 m" }, { value: 978.07, size: 28, label: "978 m" } ] }, { type: "color", field: "Drop_", legendOptions: { title: "Prominence (m)" }, stops: [ { value: 0, color: ramp.low, label: "Low prominence" }, { value: 456.1, color: ramp.mid }, { value: 912.2, color: ramp.high, label: "High prominence" } ] } ] };
    select.value = key;
    Array.from(samples.children).forEach((button) => { button.style.outline = button.dataset.ramp === key ? "2px solid #007ac2" : "none"; });
  }
  Object.entries(ramps).forEach(([key, ramp]) => { const button = document.createElement("button"); button.type = "button"; button.dataset.ramp = key; button.title = ramp.label; button.setAttribute("aria-label", ramp.label); button.style.height = "28px"; button.style.border = "1px solid #a9a9a9"; button.style.borderRadius = "3px"; button.style.background = "linear-gradient(90deg, " + ramp.low + ", " + ramp.mid + ", " + ramp.high + ")"; button.addEventListener("click", () => applyRamp(key)); samples.append(button); });
  select.addEventListener("change", () => applyRamp(select.value));
  mount.replaceChildren(heading, label, select, samples, note);
  applyRamp("blueRed");
  app.onCleanup(() => mount.replaceChildren());
}