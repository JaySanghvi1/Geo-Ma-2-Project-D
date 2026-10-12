const incomeData = [
  { label: 'Entry tickets', qty: 220, rate: 30 },
  { label: 'Food stall share', qty: 1, rate: 6000 },
  { label: 'Sponsor support', qty: 1, rate: 3500 }
];

const expenseData = [
  { label: 'Stage & sound setup', type: 'Fixed', qty: 1, rate: 4500 },
  { label: 'Decoration materials', type: 'Variable', qty: 35, rate: 80 },
  { label: 'Games prizes', type: 'Variable', qty: 25, rate: 90 },
  { label: 'Permission & printing', type: 'Fixed', qty: 1, rate: 1200 }
];

const prompts = [
  'Check this school-fest budget for mistakes in multiplication, totals, and balance. Show all corrected values in a clear table.',
  'Suggest 5 realistic ways Class IX can reduce variable costs without reducing student safety or learning value.',
  'If ticket sales fall by 20%, what changes should we make to avoid a deficit? Give a revised budget plan in ₹.',
  'Create a 90-second gallery-walk script explaining our producing budget, assumptions, and surplus/deficit result.',
  'Design 5 viva questions with model answers on fixed cost, variable cost, opportunity cost, and budgeting decisions.',
  'Rewrite our budget explanation in simple Class IX language for a QR-linked page with headings and bullet points.',
  'Generate a checklist to verify if our station data is accurate, audience-friendly, and ready for teacher evaluation.'
];

const incomeBody = document.getElementById('income-body');
const expenseBody = document.getElementById('expense-body');
const incomeTotalEl = document.getElementById('income-total');
const expenseTotalEl = document.getElementById('expense-total');
const balanceEl = document.getElementById('balance');
const fixedLabel = document.getElementById('fixed-label');
const variableLabel = document.getElementById('variable-label');
const fixedBar = document.getElementById('fixed-bar');
const variableBar = document.getElementById('variable-bar');

const formatRupee = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;
const parseNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
};

function renderIncome() {
  incomeBody.innerHTML = incomeData
    .map(
      (row, index) => `
      <tr>
        <th scope="row">${row.label}</th>
        <td><label class="sr-only" for="income-qty-${index}">${row.label} quantity</label><input id="income-qty-${index}" data-kind="income" data-field="qty" data-index="${index}" type="number" min="0" step="1" value="${row.qty}" /></td>
        <td><label class="sr-only" for="income-rate-${index}">${row.label} rate</label><input id="income-rate-${index}" data-kind="income" data-field="rate" data-index="${index}" type="number" min="0" step="1" value="${row.rate}" /></td>
        <td>${formatRupee(row.qty * row.rate)}</td>
      </tr>`
    )
    .join('');
}

function renderExpenses() {
  expenseBody.innerHTML = expenseData
    .map(
      (row, index) => `
      <tr>
        <th scope="row">${row.label}</th>
        <td>
          <label class="sr-only" for="exp-type-${index}">${row.label} type</label>
          <select id="exp-type-${index}" data-kind="expense" data-field="type" data-index="${index}">
            <option value="Fixed" ${row.type === 'Fixed' ? 'selected' : ''}>Fixed</option>
            <option value="Variable" ${row.type === 'Variable' ? 'selected' : ''}>Variable</option>
          </select>
        </td>
        <td><label class="sr-only" for="exp-qty-${index}">${row.label} quantity</label><input id="exp-qty-${index}" data-kind="expense" data-field="qty" data-index="${index}" type="number" min="0" step="1" value="${row.qty}" /></td>
        <td><label class="sr-only" for="exp-rate-${index}">${row.label} rate</label><input id="exp-rate-${index}" data-kind="expense" data-field="rate" data-index="${index}" type="number" min="0" step="1" value="${row.rate}" /></td>
        <td>${formatRupee(row.qty * row.rate)}</td>
      </tr>`
    )
    .join('');
}

function refreshTotals() {
  const totalIncome = incomeData.reduce((sum, row) => sum + row.qty * row.rate, 0);
  const totalExpense = expenseData.reduce((sum, row) => sum + row.qty * row.rate, 0);
  const balance = totalIncome - totalExpense;

  incomeTotalEl.textContent = `Total Income: ${formatRupee(totalIncome)}`;
  expenseTotalEl.textContent = `Total Expense: ${formatRupee(totalExpense)}`;

  balanceEl.classList.remove('positive', 'negative');
  if (balance >= 0) {
    balanceEl.classList.add('positive');
    balanceEl.textContent = `Surplus: ${formatRupee(balance)}`;
  } else {
    balanceEl.classList.add('negative');
    balanceEl.textContent = `Deficit: ${formatRupee(Math.abs(balance))}`;
  }

  const fixedTotal = expenseData.filter((item) => item.type === 'Fixed').reduce((sum, row) => sum + row.qty * row.rate, 0);
  const variableTotal = expenseData.filter((item) => item.type === 'Variable').reduce((sum, row) => sum + row.qty * row.rate, 0);
  const scale = Math.max(fixedTotal, variableTotal, 1);

  fixedLabel.textContent = `Fixed: ${formatRupee(fixedTotal)}`;
  variableLabel.textContent = `Variable: ${formatRupee(variableTotal)}`;
  fixedBar.style.width = `${(fixedTotal / scale) * 100}%`;
  variableBar.style.width = `${(variableTotal / scale) * 100}%`;
}

function renderPrompts() {
  const promptList = document.getElementById('prompt-list');
  promptList.innerHTML = prompts
    .map(
      (prompt, index) => `
      <li class="prompt-item">
        <span id="prompt-${index}">${prompt}</span>
        <button type="button" data-prompt="${index}" aria-describedby="prompt-${index}">Copy</button>
      </li>`
    )
    .join('');
}

function updateData(target) {
  const { kind, field, index } = target.dataset;
  if (kind !== 'income' && kind !== 'expense') {
    return;
  }

  const list = kind === 'income' ? incomeData : expenseData;
  if (!list[Number(index)]) {
    return;
  }

  if (field === 'type') {
    list[index][field] = target.value;
  } else {
    list[index][field] = parseNumber(target.value);
  }

  renderIncome();
  renderExpenses();
  refreshTotals();
}

async function copyPrompt(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'Copied';
  } catch {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'absolute';
    helper.style.left = '-9999px';
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
    button.textContent = 'Copied';
  }

  setTimeout(() => {
    button.textContent = 'Copy';
  }, 1200);
}

document.addEventListener('input', (event) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
    updateData(event.target);
  }
});

document.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLButtonElement)) {
    return;
  }

  const promptIndex = event.target.dataset.prompt;
  if (promptIndex === undefined) {
    return;
  }

  copyPrompt(prompts[promptIndex], event.target);
});

renderIncome();
renderExpenses();
renderPrompts();
refreshTotals();
