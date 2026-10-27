export default async function install(app) {
  const mount = app.getMount("prominence-ramp-controls");
  const layer = app.layers[app.config.layerId];
  app.assert(layer, "Lake District Fells layer is not available.");
  await layer.load();
  const ramps = {
    "Blue to Red": ["#2166ac", "#f7f7f7", "#b2182b"],
    "Blue to Yellow to Red": ["#2c7bb6", "#ffffbf", "#d7191c"],
    "Teal to Gold to Magenta": ["#008080", "#f6c85f", "#8e3b8a"],
    "Purple to Orange": ["#54278f", "#f7f7f7", "#d94801"]
  };
  let colors = ramps["Blue to Red"].slice();
  const panel = document.createElement("calcite-panel");
  panel.setAttribute("heading", "Prominence colour ramp");
  const intro = document.createElement("p");
  intro.textContent = "Triangle size represents height; colour represents topographic prominence.";
  intro.style.margin = "0 0 12px";
  intro.style.color = "var(--calcite-color-text-2)";
  const selectLabel = document.createElement("calcite-label");
  selectLabel.textContent = "Ramp preset";
  const select = document.createElement("calcite-select");
  select.setAttribute("label", "Ramp preset");
  Object.keys(ramps).forEach((name) => {
    const option = document.createElement("calcite-option");
    option.value = name;
    option.textContent = name;
    select.append(option);
  });
  selectLabel.append(select);
  const sampleTitle = document.createElement("p");
  sampleTitle.textContent = "Colour samples";
  sampleTitle.style.margin = "14px 0 6px";
  sampleTitle.style.fontWeight = "600";
  const swatch = document.createElement("div");
  swatch.style.height = "26px";
  swatch.style.borderRadius = "5px";
  swatch.style.border = "1px solid var(--calcite-color-border-1)";
  const sampleRow = document.createElement("div");
  sampleRow.style.display = "grid";
  sampleRow.style.gridTemplateColumns = "repeat(3, 1fr)";
  sampleRow.style.gap = "8px";
  const colorInputs = colors.map((color, i) => {
    const label = document.createElement("calcite-label");
    label.textContent = i === 0 ? "Low" : i === 1 ? "Middle" : "High";
    const input = document.createElement("input");
    input.type = "color";
    input.value = color;
    input.setAttribute("aria-label", label.textContent + " prominence colour");
    input.style.width = "100%";
    input.style.height = "32px";
    input.style.padding = "0";
    input.style.border = "0";
    input.style.background = "transparent";
    label.append(input);
    sampleRow.append(label);
    return input;
  });
  const range = document.createElement("p");
  range.textContent = "0 m  •  456 m  •  912 m prominence";
  range.style.margin = "8px 0 0";
  range.style.fontSize = "0.8rem";
  range.style.color = "var(--calcite-color-text-3)";
  function renderSample() {
    swatch.style.background = "linear-gradient(90deg, " + colors[0] + " 0%, " + colors[1] + " 50%, " + colors[2] + " 100%)";
  }
  function applyRamp() {
    layer.renderer = {
      type: "simple",
      symbol: { type: "simple-marker", style: "triangle", color: colors[0], size: 8, outline: { color: "#ffffff", width: 0.75 } },
      visualVariables: [
        { type: "size", field: app.config.heightField, legendOptions: { title: "Height (m)" }, stops: [
          { value: app.config.heightMin, size: 6, label: String(app.config.heightMin) + " m" },
          { value: app.config.heightMax, size: 30, label: String(app.config.heightMax) + " m" }
        ] },
        { type: "color", field: app.config.prominenceField, legendOptions: { title: "Prominence (m)" }, stops: [
          { value: app.config.prominenceMin, color: colors[0], label: "Low prominence" },
          { value: (app.config.prominenceMin + app.config.prominenceMax) / 2, color: colors[1] },
          { value: app.config.prominenceMax, color: colors[2], label: "High prominence" }
        ] }
      ]
    };
  }
  select.addEventListener("calciteSelectChange", () => {
    colors = ramps[select.value].slice();
    colorInputs.forEach((input, i) => { input.value = colors[i]; });
    renderSample();
    applyRamp();
  });
  colorInputs.forEach((input, i) => input.addEventListener("input", () => {
    colors[i] = input.value;
    renderSample();
    applyRamp();
  }));
  renderSample();
  panel.append(intro, selectLabel, sampleTitle, swatch, sampleRow, range);
  mount.replaceChildren(panel);
  app.onCleanup(() => mount.replaceChildren());
}