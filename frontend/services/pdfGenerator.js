import jsPDF from 'jspdf';
import { useCardStore, getSpendingBreakdown } from '../stores/cardStore.js';

// ──────────────────────────────────────────────
// Converte a imagem base64 para um formato aceito pelo jsPDF
// ──────────────────────────────────────────────
const convertImageForPDF = (imageBase64) => {
  if (!imageBase64) return null;
  if (imageBase64.startsWith('data:image')) {
    return imageBase64;
  }
  return `data:image/jpeg;base64,${imageBase64}`;
};

// ──────────────────────────────────────────────
// Mesma regra de custo usada no cardStore, replicada aqui
// para que cada item exiba exatamente o custo já calculado
// pelo sistema (respeitando itens de custo fixo x variável).
// ──────────────────────────────────────────────
const calculateCost = (item, level = 1) => {
  const base = Number(item.baseCost ?? 0);
  const variable = Number(item.variableCost ?? 0);
  if (!item.costIsVariable) return base;
  return base + level * variable;
};

const toRoman = (num) => {
  const table = [
    ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
    ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
    ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1],
  ];
  let n = num;
  let out = '';
  for (const [roman, value] of table) {
    while (n >= value) {
      out += roman;
      n -= value;
    }
  }
  return out;
};

// ──────────────────────────────────────────────
// Paleta "manuscrito antigo" — pergaminho, tinta ferrogálica e ouro
// ──────────────────────────────────────────────
const COLORS = {
  parchment: [244, 232, 202],
  parchmentDark: [230, 213, 174],
  parchmentRow: [250, 243, 225],
  ink: [39, 26, 16],
  inkLight: [88, 59, 41],
  gold: [176, 136, 56],
  goldDark: [128, 96, 38],
  crimson: [116, 24, 24],
  crimsonBg: [248, 231, 227],
  sepia: [104, 71, 40],
  sepiaBg: [239, 227, 204],
  forest: [55, 84, 50],
  forestBg: [228, 236, 218],
  bronze: [107, 79, 45],
  bronzeBg: [241, 232, 214],
  purple: [88, 42, 88],
  purpleBg: [239, 229, 241],
};

const MARGIN = 15;
const CONTENT_RIGHT = 190 - MARGIN; // borda direita útil (185)
const PAGE_BOTTOM = 268; // limite antes de quebrar página

export const generateGURPSPDF = async () => {
  const state = useCardStore.getState();
  const breakdown = getSpendingBreakdown(state);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let yPos = MARGIN;

  // ──────────────────────────────────────────────
  // Moldura de pergaminho com cantos em losango dourado
  // ──────────────────────────────────────────────
  const addPageFrame = () => {
    const x = MARGIN - 3;
    const y = MARGIN - 3;
    const w = 180;
    const h = 277;

    doc.setFillColor(...COLORS.parchment);
    doc.setDrawColor(...COLORS.inkLight);
    doc.setLineWidth(0.6);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');

    doc.setLineWidth(0.3);
    doc.roundedRect(x + 2, y + 2, w - 4, h - 4, 1.5, 1.5, 'S');
    doc.setLineWidth(0.15);
    doc.roundedRect(x + 3.5, y + 3.5, w - 7, h - 7, 1, 1, 'S');

    const diamond = (cx, cy, r) => {
      doc.setFillColor(...COLORS.gold);
      doc.triangle(cx - r, cy, cx, cy - r, cx + r, cy, 'F');
      doc.triangle(cx - r, cy, cx, cy + r, cx + r, cy, 'F');
      doc.setDrawColor(...COLORS.goldDark);
      doc.setLineWidth(0.2);
      doc.triangle(cx - r, cy, cx, cy - r, cx + r, cy, 'S');
      doc.triangle(cx - r, cy, cx, cy + r, cx + r, cy, 'S');
    };
    diamond(x + 6, y + 6, 2.2);
    diamond(x + w - 6, y + 6, 2.2);
    diamond(x + 6, y + h - 6, 2.2);
    diamond(x + w - 6, y + h - 6, 2.2);
  };

  // Pequeno cabeçalho corrido nas páginas internas
  const addRunningHeader = () => {
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.inkLight);
    doc.text(`Ficha de ${state.name || 'Aventureiro'}`, CONTENT_RIGHT, MARGIN + 4, { align: 'right' });
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.2);
    doc.line(MARGIN + 10, MARGIN + 4, CONTENT_RIGHT, MARGIN + 5);
  };

  // Divisor central ornamentado (usado sob o título da página 1)
  const addDivider = (y, x1 = MARGIN + 5, x2 = 185) => {
    const mid = (x1 + x2) / 2;
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.4);
    doc.line(x1, y, mid - 3, y);
    doc.line(mid + 3, y, x2, y);
    doc.setFillColor(...COLORS.gold);
    doc.triangle(mid - 3, y, mid, y - 2, mid + 3, y, 'F');
    doc.triangle(mid - 3, y, mid, y + 2, mid + 3, y, 'F');
  };

  // Banner tipo "faixa de pergaminho" para títulos de seção
  const addSectionBanner = (title, width = 160) => {
    const x = MARGIN + 8;
    const h = 8;
    const tip = 4;

    doc.setFillColor(...COLORS.ink);
    doc.rect(x, yPos, width, h, 'F');
    doc.triangle(x, yPos, x, yPos + h, x - tip, yPos + h / 2, 'F');
    doc.triangle(x + width, yPos, x + width, yPos + h, x + width + tip, yPos + h / 2, 'F');

    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.3);
    doc.rect(x, yPos, width, h, 'S');

    doc.setTextColor(...COLORS.parchment);
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text(title.toUpperCase(), x + width / 2, yPos + h / 2 + 1, { align: 'center' });

    yPos += h + 6;
  };

  // Garante espaço na página atual; se necessário, abre nova página
  const ensureSpace = (needed = 7) => {
    if (yPos + needed > PAGE_BOTTOM) {
      doc.addPage();
      addPageFrame();
      addRunningHeader();
      yPos = MARGIN + 10;
    }
  };

  // Linha de item de lista (vantagem, desvantagem, limitação, etc.)
  const addListRow = (label, levelText, costText, fillRGB, borderRGB) => {
    ensureSpace(7);
    doc.setFillColor(...fillRGB);
    doc.setDrawColor(...borderRGB);
    doc.setLineWidth(0.2);
    doc.roundedRect(MARGIN + 3, yPos - 4, 168, 5.5, 1, 1, 'FD');

    doc.setTextColor(...COLORS.ink);
    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    doc.text(`- ${label}`, MARGIN + 7, yPos);
    if (levelText) doc.text(levelText, MARGIN + 118, yPos);
    doc.setFont('times', 'bold');
    doc.text(costText, MARGIN + 152, yPos);

    yPos += 7;
  };

  const addEmptyNote = (text) => {
    doc.setTextColor(...COLORS.inkLight);
    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    doc.text(text, MARGIN + 7, yPos);
    yPos += 6;
  };

  // Renderiza uma lista completa de itens (vantagens, técnicas, magias...)
  const renderItemList = (items, emptyText, fillRGB, borderRGB) => {
    if (!items || items.length === 0) {
      addEmptyNote(emptyText);
      return;
    }
    items.forEach((item) => {
      const cost = calculateCost(item, item.level);
      const costText = cost >= 0 ? `+${cost} pts` : `${cost} pts`;
      const levelText = item.level != null ? `Nível: ${item.level}` : '';
      addListRow(item.name, levelText, costText, fillRGB, borderRGB);
    });
    yPos += 4;
  };

  // ════════════════════════════════════════════════
  // PÁGINA 1 — CAPA E ATRIBUTOS
  // ════════════════════════════════════════════════
  addPageFrame();

  yPos = MARGIN + 12;
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.ink);
  const titleText = `FICHA DE ${(state.name || 'AVENTUREIRO').toUpperCase()}`;
  doc.text(titleText, 105, yPos, { align: 'center' });

  yPos += 6;
  doc.setFontSize(9);
  doc.setFont('times', 'italic');
  doc.setTextColor(...COLORS.inkLight);
  doc.text('~ Sistema THEOROS · Registro de Personagem ~', 105, yPos, { align: 'center' });
  yPos += 5;
  addDivider(yPos);
  yPos += 9;

  // ── Informações básicas com retrato ──
  const infoX = MARGIN + 5;
  const infoY = yPos;
  const infoWidth = 165;
  const infoHeight = 48;

  doc.setFillColor(...COLORS.parchmentRow);
  doc.setDrawColor(...COLORS.inkLight);
  doc.setLineWidth(0.3);
  doc.roundedRect(infoX, infoY, infoWidth, infoHeight, 2, 2, 'FD');
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.15);
  doc.roundedRect(infoX + 1, infoY + 1, infoWidth - 2, infoHeight - 2, 1.5, 1.5, 'S');

  const textX = infoX + 5;
  let textY = infoY + 6;
  const lineHeight = 7;

  const infoField = (label, value, labelWidth) => {
    doc.setFontSize(9);
    doc.setFont('times', 'bold');
    doc.setTextColor(...COLORS.ink);
    doc.text(label, textX, textY);
    doc.setFont('times', 'normal');
    doc.setTextColor(...COLORS.inkLight);
    doc.text(String(value || 'Não registrado'), textX + labelWidth, textY);
    textY += lineHeight;
  };

  infoField('Nome:', state.name, 14);
  infoField('Raça:', state.race, 12);
  infoField('Gênero:', state.gender, 16);
  infoField('Idade:', state.age, 13);
  infoField('Altura:', state.height, 13);
  infoField('Alinhamento:', state.alignment, 25);

  if (state.imageBase64) {
    try {
      const imageData = convertImageForPDF(state.imageBase64);
      if (imageData) {
        const imgX = infoX + infoWidth - 45;
        const imgY = infoY + 4;
        const imgSize = 40;
        doc.setDrawColor(...COLORS.gold);
        doc.setLineWidth(0.6);
        doc.roundedRect(imgX - 1.2, imgY - 1.2, imgSize + 2.4, imgSize + 2.4, 1, 1, 'S');
        doc.setLineWidth(0.2);
        doc.roundedRect(imgX, imgY, imgSize, imgSize, 1, 1, 'S');
        doc.addImage(imageData, 'JPEG', imgX, imgY, imgSize, imgSize);
      }
    } catch (error) {
      console.error('Erro ao adicionar imagem:', error);
    }
  }

  yPos = infoY + infoHeight + 8;

  // ── Atributos ──
  addSectionBanner('Atributos');

  const attrKeys = ['strength', 'life', 'dexterity', 'health', 'fatigue', 'intelligence', 'perception', 'willing'];
  const attrLabels = {
    strength: 'Força', life: 'Vida', dexterity: 'Destreza', health: 'Saúde',
    fatigue: 'Fadiga', intelligence: 'Inteligência', perception: 'Percepção', willing: 'Vontade',
  };
  const attrShort = { strength: 'ST', life: 'PV', dexterity: 'DX', health: 'HP', fatigue: 'HT', intelligence: 'IQ', perception: 'Per', willing: 'Von' };

  const attrCol1X = MARGIN + 8;
  const attrCol2X = MARGIN + 95;
  let attrY = yPos;

  for (let i = 0; i < 4; i += 1) {
    const key1 = attrKeys[i];
    const key2 = attrKeys[i + 4];
    const attr1 = state.attributes[key1];
    const attr2 = state.attributes[key2];

    [[attrCol1X, key1, attr1], [attrCol2X, key2, attr2]].forEach(([colX, key, attr]) => {
      doc.setFillColor(...COLORS.parchmentRow);
      doc.setDrawColor(...COLORS.gold);
      doc.setLineWidth(0.2);
      doc.roundedRect(colX - 2, attrY - 3, 78, 7, 1, 1, 'FD');

      doc.setTextColor(...COLORS.ink);
      doc.setFontSize(9);
      doc.setFont('times', 'bold');
      doc.text(`${attrShort[key]} · ${attrLabels[key]}`, colX + 2, attrY);
      doc.setFont('times', 'normal');
      doc.setTextColor(...COLORS.inkLight);
      doc.text(`Base: ${attr.base}   Atual: ${attr.current}`, colX + 2, attrY + 3.5);
    });

    attrY += 9;
  }
  yPos = attrY + 5;

  // ════════════════════════════════════════════════
  // PÁGINA 2 — HISTÓRIA
  // ════════════════════════════════════════════════
  doc.addPage();
  addPageFrame();
  addRunningHeader();
  yPos = MARGIN + 10;
  addSectionBanner('História do Personagem');

  if (state.history) {
    doc.setFillColor(...COLORS.parchmentRow);
    doc.setDrawColor(...COLORS.inkLight);
    doc.setLineWidth(0.3);
    const boxTop = yPos - 3;
    doc.roundedRect(MARGIN + 3, boxTop, 168, 240, 2, 2, 'FD');
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.15);
    doc.roundedRect(MARGIN + 4.5, boxTop + 1.5, 165, 237, 1.5, 1.5, 'S');

    const lines = doc.splitTextToSize(state.history, 158);
    let textY = yPos + 5;
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.ink);

    lines.forEach((line) => {
      if (textY > 275) {
        doc.addPage();
        addPageFrame();
        addRunningHeader();
        textY = MARGIN + 12;
        doc.setFont('times', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...COLORS.ink);
      }
      doc.text(line, MARGIN + 8, textY);
      textY += 5.5;
    });
  } else {
    addEmptyNote('Nenhuma história registrada.');
  }

  // ════════════════════════════════════════════════
  // PÁGINA 3 — VANTAGENS E DESVANTAGENS
  // ════════════════════════════════════════════════
  doc.addPage();
  addPageFrame();
  addRunningHeader();
  yPos = MARGIN + 10;

  addSectionBanner('Vantagens');
  renderItemList(state.advantages, 'Nenhuma vantagem selecionada.', COLORS.parchmentRow, COLORS.gold);

  ensureSpace(15);
  addSectionBanner('Desvantagens');
  renderItemList(state.disadvantages, 'Nenhuma desvantagem selecionada.', COLORS.crimsonBg, COLORS.crimson);

  // ════════════════════════════════════════════════
  // PÁGINA 4 — LIMITAÇÕES E AMPLIAÇÕES
  // ════════════════════════════════════════════════
  doc.addPage();
  addPageFrame();
  addRunningHeader();
  yPos = MARGIN + 10;

  addSectionBanner('Limitações');
  renderItemList(state.limitations, 'Nenhuma limitação selecionada.', COLORS.sepiaBg, COLORS.sepia);

  ensureSpace(15);
  addSectionBanner('Ampliações');
  renderItemList(state.expansions, 'Nenhuma ampliação selecionada.', COLORS.forestBg, COLORS.forest);

  // ════════════════════════════════════════════════
  // PÁGINA 5 — PERÍCIAS, TÉCNICAS E MAGIAS
  // ════════════════════════════════════════════════
  doc.addPage();
  addPageFrame();
  addRunningHeader();
  yPos = MARGIN + 10;

  addSectionBanner('Perícias');
  renderItemList(state.expertises, 'Nenhuma perícia selecionada.', COLORS.bronzeBg, COLORS.bronze);

  ensureSpace(15);
  addSectionBanner('Técnicas');
  renderItemList(state.techniques, 'Nenhuma técnica selecionada.', COLORS.bronzeBg, COLORS.bronze);

  ensureSpace(15);
  addSectionBanner('Magias');
  renderItemList(state.magics, 'Nenhuma magia selecionada.', COLORS.purpleBg, COLORS.purple);

  // ════════════════════════════════════════════════
  // PÁGINA 6 — HISTÓRICO DE GASTOS
  // ════════════════════════════════════════════════
  doc.addPage();
  addPageFrame();
  addRunningHeader();
  yPos = MARGIN + 10;

  addSectionBanner('Histórico de Gastos');
  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.inkLight);
  doc.text('~ Registro de cada poder, fraqueza e talento que moldou este herói ~', 105, yPos, { align: 'center' });
  yPos += 8;

  const colStartX = MARGIN + 3;
  const colWidths = [98, 32, 38];

  const drawTableHeader = () => {
    doc.setFillColor(...COLORS.ink);
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.2);
    doc.rect(colStartX, yPos - 4, colWidths[0] + colWidths[1] + colWidths[2], 6, 'FD');

    doc.setTextColor(...COLORS.parchment);
    doc.setFontSize(8.5);
    doc.setFont('times', 'bold');
    doc.text('Item', colStartX + 4, yPos);
    doc.text('Nível', colStartX + colWidths[0] + 4, yPos);
    doc.text('Custo', colStartX + colWidths[0] + colWidths[1] + 4, yPos);
    yPos += 8;
  };

  drawTableHeader();

  if (breakdown.length === 0) {
    addEmptyNote('Nenhum gasto registrado até o momento.');
  } else {
    breakdown.forEach((entry, index) => {
      if (yPos + 6 > PAGE_BOTTOM) {
        doc.addPage();
        addPageFrame();
        addRunningHeader();
        yPos = MARGIN + 10;
        drawTableHeader();
      }

      const rowFill = index % 2 === 0 ? COLORS.parchmentRow : COLORS.parchmentDark;
      doc.setFillColor(...rowFill);
      doc.rect(colStartX, yPos - 4, colWidths[0] + colWidths[1] + colWidths[2], 6, 'F');

      let levelText = '-';
      if (entry.level != null) {
        levelText = String(entry.level);
      } else if (entry.value != null) {
        levelText = entry.value > 0 ? `+${entry.value}` : String(entry.value);
      }
      const costText = entry.cost >= 0 ? `+${entry.cost} pts` : `${entry.cost} pts`;

      doc.setFont('times', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.ink);
      doc.text(entry.label, colStartX + 4, yPos, { maxWidth: colWidths[0] - 6 });
      doc.text(levelText, colStartX + colWidths[0] + 4, yPos);

      doc.setFont('times', 'bold');
      doc.setTextColor(...(entry.cost >= 0 ? COLORS.forest : COLORS.crimson));
      doc.text(costText, colStartX + colWidths[0] + colWidths[1] + 4, yPos);

      yPos += 6;
    });
  }

  // ════════════════════════════════════════════════
  // RODAPÉ — numeração em algarismos romanos em todas as páginas
  // ════════════════════════════════════════════════
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.25);
    doc.line(MARGIN + 25, 284, 185 - 25, 284);
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.inkLight);
    doc.text(`~ ${toRoman(i)} ~`, 105, 280, { align: 'center' });
  }

  const fileName = `Ficha_${state.name || 'personagem'}.pdf`;
  doc.save(fileName);
};

// Hook para usar no componente React
export const useDownloadPDF = () => {
  const handleDownload = async () => {
    try {
      await generateGURPSPDF();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o PDF. Verifique o console para mais detalhes.');
    }
  };

  return { handleDownload };
};