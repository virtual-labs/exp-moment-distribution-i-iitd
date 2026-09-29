let data = {};
let values = {};
const misses = {};
const screens = Array.from({ length: 9 }, (_, i) => `canvas${i}`);

function fitSimulation() {
  const screen = document.getElementById("simscreen");
  const scale = Math.min(1, Math.max(0.4, (window.innerWidth - 48) / 800));
  screen.style.setProperty("--simulation-scale", scale);
  const wrapper = document.getElementById("simwrap");
  wrapper.style.width = `${800 * scale}px`;
  wrapper.style.height = `${600 * scale}px`;
}

window.addEventListener("resize", fitSimulation);
fitSimulation();

function showScreen(index) {
  screens.forEach((id, i) => document.getElementById(id).classList.toggle("hidden", i !== index));
}

function fmt(value) {
  if (!Number.isFinite(value)) return "-";
  return Number(value.toFixed(2)).toString();
}

function isClose(actual, expected) {
  return Number.isFinite(actual) && Math.abs(actual - expected) <= 0.01;
}

function calculateBeam() {
  const LAB = data.a + data.b;
  const halfUdl = data.w * data.Lc ** 2 / 12;
  const femAB = data.P * data.a * data.b ** 2 / LAB ** 2;
  const femBA = -data.P * data.a ** 2 * data.b / LAB ** 2;
  const femBC = halfUdl;
  const femCB = -halfUdl;
  const stiffnessBA = 1 / LAB;
  const stiffnessBC = 1 / data.Lc;
  const dfBA = stiffnessBA / (stiffnessBA + stiffnessBC);
  const dfBC = stiffnessBC / (stiffnessBA + stiffnessBC);
  const unbalanced = femBA + femBC;
  const distBA = -unbalanced * dfBA;
  const distBC = -unbalanced * dfBC;
  const carryAB = distBA * 0.5;
  const carryCB = distBC * 0.5;
  const finalAB = femAB + carryAB;
  const finalBA = femBA + distBA;
  const finalBC = femBC + distBC;
  const finalCB = femCB + carryCB;
  const reactionA = (data.P * data.b + finalAB + finalBA) / LAB;
  const reactionB1 = data.P - reactionA;
  const reactionB2 = (data.w * data.Lc ** 2 / 2 + finalBC + finalCB) / data.Lc;
  const reactionC = data.w * data.Lc - reactionB2;
  return {
    LAB, femAB, femBA, femBC, femCB, dfBA, dfBC, unbalanced,
    distBA, distBC, carryAB, carryCB, finalAB, finalBA, finalBC, finalCB,
    reactionA, reactionB1, reactionB2, reactionC, reactionB: reactionB1 + reactionB2
  };
}

function output(id, message, ok = false) {
  const el = document.getElementById(`out-${id}`);
  el.innerHTML = message;
  el.classList.toggle("warning", !ok);
}

function fieldsFilled(id, fields) {
  const empty = fields.filter(([fieldId]) => document.getElementById(fieldId).value.trim() === "");
  if (!empty.length) return true;
  output(id, `Fill all fields before calculating: <strong>${empty.map(([, label]) => label).join(", ")}</strong>.`);
  return false;
}

function limitedToTwoDecimals(id, fields) {
  const invalid = fields.filter(([fieldId]) => !/^[+-]?\d+(?:\.\d{1,2})?$/.test(document.getElementById(fieldId).value.trim()));
  if (!invalid.length) return true;
  output(id, `Use no more than two decimal places in: <strong>${invalid.map(([, label]) => label).join(", ")}</strong>.`);
  return false;
}

function feedback(id, firstHint, calculation) {
  misses[id] = (misses[id] || 0) + 1;
  if (misses[id] === 1) return `<strong>Suggestion:</strong> ${firstHint}`;
  return `<strong>Worked answer:</strong> ${calculation}`;
}

function checkGroup({ id, fields, expected, hint, work, success, next, onCorrect }) {
  if (!fieldsFilled(id, fields) || !limitedToTwoDecimals(id, fields)) return;
  const correct = fields.every(([fieldId], index) => isClose(Number(document.getElementById(fieldId).value), expected[index]));
  if (!correct) {
    output(id, feedback(id, hint, work()));
    return;
  }
  misses[id] = 0;
  if (onCorrect) onCorrect();
  output(id, success, true);
  document.querySelector(`.calc-btn[data-check="${id}"]`).style.display = "none";
  document.getElementById(next).classList.remove("hidden");
}

function fillMomentLedger() {
  const cells = {
    dfCellBA: values.dfBA, dfCellBC: values.dfBC,
    femCellAB: values.femAB, femCellBA: values.femBA,
    femCellBC: values.femBC, femCellCB: values.femCB
  };
  Object.entries(cells).forEach(([id, value]) => document.getElementById(id).textContent = fmt(value));
  document.getElementById("balanceEquation").innerHTML = `Unbalanced at B = M<sup>F</sup><sub>BA</sub> + M<sup>F</sup><sub>BC</sub> = ${fmt(values.femBA)} + ${fmt(values.femBC)} = <strong>${fmt(values.unbalanced)} kN·m</strong>. Balancing moment = <strong>${fmt(-values.unbalanced)} kN·m</strong>.`;
  document.getElementById("distributionEquation").innerHTML = `D<sub>BA</sub> = ${fmt(-values.unbalanced)} × ${fmt(values.dfBA)} = ${fmt(values.distBA)}; &nbsp; D<sub>BC</sub> = ${fmt(-values.unbalanced)} × ${fmt(values.dfBC)} = ${fmt(values.distBC)} kN·m.`;
  document.getElementById("carryEquation").innerHTML = `Carry-over factor = 0.5: &nbsp; C<sub>AB</sub> = 0.5 × ${fmt(values.distBA)} = ${fmt(values.carryAB)}; &nbsp; C<sub>CB</sub> = 0.5 × ${fmt(values.distBC)} = ${fmt(values.carryCB)} kN·m.`;
}

function fillFinalMomentLedger() {
  const cells = {
    finalCellAB: values.finalAB, finalCellBA: values.finalBA,
    finalCellBC: values.finalBC, finalCellCB: values.finalCB
  };
  Object.entries(cells).forEach(([id, value]) => document.getElementById(id).textContent = fmt(value));
}

function fillFinalMomentReview() {
  document.getElementById("sumAB").innerHTML = `M<sub>AB</sub> = M<sup>F</sup><sub>AB</sub> + C<sub>AB</sub> = ${fmt(values.femAB)} + (${fmt(values.carryAB)}) = <strong>${fmt(values.finalAB)} kN·m</strong>`;
  document.getElementById("sumBA").innerHTML = `M<sub>BA</sub> = M<sup>F</sup><sub>BA</sub> + D<sub>BA</sub> = ${fmt(values.femBA)} + (${fmt(values.distBA)}) = <strong>${fmt(values.finalBA)} kN·m</strong>`;
  document.getElementById("sumBC").innerHTML = `M<sub>BC</sub> = M<sup>F</sup><sub>BC</sub> + D<sub>BC</sub> = ${fmt(values.femBC)} + (${fmt(values.distBC)}) = <strong>${fmt(values.finalBC)} kN·m</strong>`;
  document.getElementById("sumCB").innerHTML = `M<sub>CB</sub> = M<sup>F</sup><sub>CB</sub> + C<sub>CB</sub> = ${fmt(values.femCB)} + (${fmt(values.carryCB)}) = <strong>${fmt(values.finalCB)} kN·m</strong>`;
}

const field = (id, label) => [id, label];

document.getElementById("startBtn").addEventListener("click", () => showScreen(1));
document.getElementById("bringBtn").addEventListener("click", () => {
  document.getElementById("beamFigure").classList.remove("hidden");
  document.getElementById("beamCaption").classList.remove("hidden");
  document.getElementById("bringBtn").style.display = "none";
  document.getElementById("next1").classList.remove("hidden");
});
document.getElementById("next1").addEventListener("click", () => showScreen(2));

document.getElementById("submitData").addEventListener("click", () => {
  const fields = [field("P", "P"), field("w", "w"), field("a", "a"), field("b", "b"), field("Lc", "L BC")];
  if (!fieldsFilled("data", fields) || !limitedToTwoDecimals("data", fields)) return;
  data = Object.fromEntries(fields.map(([id]) => [id, Number(document.getElementById(id).value)]));
  if (Object.values(data).some(value => !Number.isFinite(value) || value <= 0)) {
    output("data", "All loads, offsets, and span lengths must be positive.");
    return;
  }
  if (data.a + data.b <= 0) return;
  values = calculateBeam();
  document.querySelectorAll("[data-result='Lab']").forEach(el => el.textContent = fmt(values.LAB));
  fillMomentLedger();
  output("data", "Beam values accepted. Continue to calculate the fixed-end moments.", true);
  document.getElementById("submitData").style.display = "none";
  document.getElementById("next2").classList.remove("hidden");
});

document.getElementById("next2").addEventListener("click", () => showScreen(3));
document.querySelector('[data-check="fem"]').addEventListener("click", () => checkGroup({
  id: "fem", fields: [field("femAB", "M<sup>F</sup><sub>AB</sub>"), field("femBA", "M<sup>F</sup><sub>BA</sub>"), field("femBC", "M<sup>F</sup><sub>BC</sub>"), field("femCB", "M<sup>F</sup><sub>CB</sub>")],
  expected: [values.femAB, values.femBA, values.femBC, values.femCB],
  hint: "use the point-load fixed-end moment equations on AB and the wL²/12 equations on BC.",
  work: () => `M<sup>F</sup><sub>AB</sub> = ${fmt(data.P)}×${fmt(data.a)}×${fmt(data.b)}²/${fmt(values.LAB)}² = ${fmt(values.femAB)}; M<sup>F</sup><sub>BA</sub> = -${fmt(data.P)}×${fmt(data.a)}²×${fmt(data.b)}/${fmt(values.LAB)}² = ${fmt(values.femBA)}; M<sup>F</sup><sub>BC</sub> = ${fmt(data.w)}×${fmt(data.Lc)}²/12 = ${fmt(values.femBC)}; M<sup>F</sup><sub>CB</sub> = -${fmt(data.w)}×${fmt(data.Lc)}²/12 = ${fmt(values.femCB)} kN·m.`,
  success: "Correct. Fixed-end moments established for both spans.", next: "next3"
}));

document.getElementById("next3").addEventListener("click", () => showScreen(4));
document.querySelector('[data-check="df"]').addEventListener("click", () => checkGroup({
  id: "df", fields: [field("dfBA", "D<sup>F</sup><sub>BA</sub>"), field("dfBC", "D<sup>F</sup><sub>BC</sub>")],
  expected: [values.dfBA, values.dfBC],
  hint: "for fixed far ends, K = 4EI/L; the common 4EI cancels when forming each DF.",
  work: () => `D<sup>F</sup><sub>BA</sub> = (1/${fmt(values.LAB)}) / (1/${fmt(values.LAB)} + 1/${fmt(data.Lc)}) = ${fmt(values.dfBA)}; D<sup>F</sup><sub>BC</sub> = (1/${fmt(data.Lc)}) / (1/${fmt(values.LAB)} + 1/${fmt(data.Lc)}) = ${fmt(values.dfBC)}. Their sum is 1.`,
  success: `Correct. D<sup>F</sup><sub>BA</sub> = ${fmt(values.dfBA)} and D<sup>F</sup><sub>BC</sub> = ${fmt(values.dfBC)}.`, next: "next4"
}));

document.getElementById("next4").addEventListener("click", () => showScreen(5));
document.querySelector('[data-check="distribution"]').addEventListener("click", () => checkGroup({
  id: "distribution", fields: [field("distBA", "distributed BA"), field("distBC", "distributed BC"), field("carryAB", "carry-over AB"), field("carryCB", "carry-over CB")],
  expected: [values.distBA, values.distBC, values.carryAB, values.carryCB],
  hint: "negate the unbalanced moment, distribute it with each DF, then carry over half to the far end.",
  work: () => `Unbalanced B = ${fmt(values.femBA)} + ${fmt(values.femBC)} = ${fmt(values.unbalanced)}. Balancing moment = ${fmt(-values.unbalanced)}. BA distribution = ${fmt(-values.unbalanced)}×${fmt(values.dfBA)} = ${fmt(values.distBA)}; BC distribution = ${fmt(-values.unbalanced)}×${fmt(values.dfBC)} = ${fmt(values.distBC)}. Carry-over = 0.5×distribution: AB = ${fmt(values.carryAB)}, CB = ${fmt(values.carryCB)} kN·m.`,
  success: "Correct. Joint B is balanced and the far-end moments are carried over.", next: "next5", onCorrect: fillFinalMomentLedger
}));

document.getElementById("next5").addEventListener("click", () => {
  fillFinalMomentReview();
  showScreen(6);
});

document.getElementById("next6").addEventListener("click", () => showScreen(7));
document.querySelector('[data-check="reactions"]').addEventListener("click", () => checkGroup({
  id: "reactions", fields: [field("reactionA", "R<sub>A</sub>"), field("reactionB1", "R<sub>B1</sub>"), field("reactionB2", "R<sub>B2</sub>"), field("reactionC", "R<sub>C</sub>"), field("reactionB", "R<sub>B</sub> total")],
  expected: [values.reactionA, values.reactionB1, values.reactionB2, values.reactionC, values.reactionB],
  hint: "take moments for each span to find the near reaction, then use vertical equilibrium and add the two B reactions.",
  work: () => `R<sub>A</sub> = (${fmt(data.P)}×${fmt(data.b)} + ${fmt(values.finalAB)} + ${fmt(values.finalBA)})/${fmt(values.LAB)} = ${fmt(values.reactionA)}; R<sub>B1</sub> = ${fmt(data.P)} - ${fmt(values.reactionA)} = ${fmt(values.reactionB1)}. R<sub>B2</sub> = (${fmt(data.w)}×${fmt(data.Lc)}²/2 + ${fmt(values.finalBC)} + ${fmt(values.finalCB)})/${fmt(data.Lc)} = ${fmt(values.reactionB2)}; R<sub>C</sub> = ${fmt(data.w)}×${fmt(data.Lc)} - ${fmt(values.reactionB2)} = ${fmt(values.reactionC)}; R<sub>B</sub> = ${fmt(values.reactionB1)} + ${fmt(values.reactionB2)} = ${fmt(values.reactionB)} kN.`,
  success: "Correct. Reactions satisfy span equilibrium.", next: "next7"
}));

document.getElementById("next7").addEventListener("click", () => {
  document.getElementById("reactionSummary").innerHTML = `<span>R<sub>A</sub> ${fmt(values.reactionA)} kN</span><span>R<sub>B1</sub> ${fmt(values.reactionB1)} kN</span><span>R<sub>B2</sub> ${fmt(values.reactionB2)} kN</span><span>R<sub>C</sub> ${fmt(values.reactionC)} kN</span><span>R<sub>B</sub> ${fmt(values.reactionB)} kN</span>`;
  showScreen(8);
});
document.getElementById("restartBtn").addEventListener("click", () => location.reload());

showScreen(0);
