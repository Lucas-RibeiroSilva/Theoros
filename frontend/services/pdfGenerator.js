import jsPDF from 'jspdf';
import { useCardStore, getSpendingBreakdown, getRemainingPoints } from '../stores/cardStore.js';

// Função para converter imagem base64 para um formato compatível com jsPDF
const convertImageForPDF = (imageBase64) => {
  if (!imageBase64) return null;
  if (imageBase64.startsWith('data:image')) {
    return imageBase64;
  }
  return `data:image/jpeg;base64,${imageBase64}`;
};

// Função principal para gerar o PDF com temática RPG
export const generateGURPSPDF = async () => {
  const state = useCardStore.getState();
  const breakdown = getSpendingBreakdown(state);
  const remainingPoints = getRemainingPoints(state);
  const totalSpent = state.totalPoints - remainingPoints;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Cores temáticas
  const COLORS = {
    bg: '#f5e6c8',
    bgDark: '#e8d5b8',
    text: '#2c1810',
    textLight: '#5c3d2e',
    border: '#5c3d2e',
    borderLight: '#c89b3c',
    gold: '#c89b3c',
    red: '#8b1a1a',
    purple: '#6b2d6b'
  };

  // Configurações
  const MARGIN = 15;
  let yPos = MARGIN;

  // Função para adicionar borda decorativa
  const addDecoratedBorder = (x, y, w, h) => {
    doc.setFillColor(245, 230, 200);
    doc.setDrawColor(92, 61, 46);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');

    doc.setDrawColor(92, 61, 46);
    doc.setLineWidth(0.3);
    doc.roundedRect(x + 1.5, y + 1.5, w - 3, h - 3, 1.5, 1.5, 'S');
    
    const cornerSize = 3;
    doc.setDrawColor(200, 155, 60);
    doc.setLineWidth(0.5);
    
    doc.line(x + 2, y + 2, x + 2 + cornerSize, y + 2);
    doc.line(x + 2, y + 2, x + 2, y + 2 + cornerSize);
    doc.line(x + w - 2, y + 2, x + w - 2 - cornerSize, y + 2);
    doc.line(x + w - 2, y + 2, x + w - 2, y + 2 + cornerSize);
    doc.line(x + 2, y + h - 2, x + 2 + cornerSize, y + h - 2);
    doc.line(x + 2, y + h - 2, x + 2, y + h - 2 - cornerSize);
    doc.line(x + w - 2, y + h - 2, x + w - 2 - cornerSize, y + h - 2);
    doc.line(x + w - 2, y + h - 2, x + w - 2, y + h - 2 - cornerSize);
  };

  // ========== PÁGINA 1 ==========
  addDecoratedBorder(MARGIN - 3, MARGIN - 3, 180, 277);

  // Título
  yPos = MARGIN + 10;
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 24, 16);
  const titleText = `FICHA DE ${(state.name || 'AVENTUREIRO').toUpperCase()}`;
  doc.text(titleText, 105, yPos, { align: 'center' });
  
  yPos += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(92, 61, 46);
  doc.text('~ Sistema THEOROS - Ficha de Personagem ~', 105, yPos, { align: 'center' });
  yPos += 10;

  // ========== INFORMAÇÕES BÁSICAS COM FOTO ==========
  const infoX = MARGIN + 5;
  const infoY = yPos;
  const infoWidth = 165;
  const infoHeight = 48;
  
  // Fundo das informações
  doc.setFillColor(250, 245, 235);
  doc.setDrawColor(92, 61, 46);
  doc.setLineWidth(0.3);
  doc.roundedRect(infoX, infoY, infoWidth, infoHeight, 2, 2, 'FD');
  doc.roundedRect(infoX, infoY, infoWidth, infoHeight, 2, 2, 'S');

  // ===== LADO ESQUERDO - INFORMAÇÕES =====
  const textX = infoX + 5;
  const textWidth = 110;
  let textY = infoY + 5;
  const lineHeight = 7;

  // Nome
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 24, 16);
  doc.text('Nome:', textX, textY);
  doc.setFont('helvetica', 'normal');
  const nomeText = state.name || 'Nao registrado';
  doc.text(nomeText, textX + 12, textY);
  textY += lineHeight;

  // Raça
  doc.setFont('helvetica', 'bold');
  doc.text('Raça:', textX, textY);
  doc.setFont('helvetica', 'normal');
  doc.text(state.race || 'Nao registrada', textX + 10, textY);
  textY += lineHeight;

  // Gênero
  doc.setFont('helvetica', 'bold');
  doc.text('Genero:', textX, textY);
  doc.setFont('helvetica', 'normal');
  doc.text(state.gender || 'Nao identificado', textX + 14, textY);
  textY += lineHeight;

  // Idade
  doc.setFont('helvetica', 'bold');
  doc.text('Idade:', textX, textY);
  doc.setFont('helvetica', 'normal');
  doc.text(state.age || 'Nao registrada', textX + 11, textY);
  textY += lineHeight;

  // Altura
  doc.setFont('helvetica', 'bold');
  doc.text('Altura:', textX, textY);
  doc.setFont('helvetica', 'normal');
  doc.text(state.height || 'Nao registrada', textX + 11, textY);
  textY += lineHeight;

  // Alinhamento
  doc.setFont('helvetica', 'bold');
  doc.text('Alinhamento:', textX, textY);
  doc.setFont('helvetica', 'normal');
  doc.text(state.alignment || 'Nao registrado', textX + 22, textY);

  // ===== LADO DIREITO - FOTO =====
  if (state.imageBase64) {
    try {
      const imageData = convertImageForPDF(state.imageBase64);
      if (imageData) {
        const imgX = infoX + infoWidth - 45;
        const imgY = infoY + 4;
        const imgSize = 40;
        
        // Moldura da foto
        doc.setDrawColor(200, 155, 60);
        doc.setLineWidth(0.5);
        doc.roundedRect(imgX - 1, imgY - 1, imgSize + 2, imgSize + 2, 1, 1, 'S');
        doc.roundedRect(imgX, imgY, imgSize, imgSize, 1, 1, 'S');
        
        doc.addImage(imageData, 'JPEG', imgX, imgY, imgSize, imgSize);
      }
    } catch (error) {
      console.error('Erro ao adicionar imagem:', error);
    }
  }

  yPos = infoY + infoHeight + 10;

  // ===== PONTOS =====
  // Criando uma linha separada para os pontos
  doc.setFillColor(250, 245, 235);
  doc.setDrawColor(200, 155, 60);
  doc.setLineWidth(0.3);
  doc.roundedRect(infoX, yPos - 3, infoWidth, 10, 2, 2, 'FD');
  doc.roundedRect(infoX, yPos - 3, infoWidth, 10, 2, 2, 'S');

  const pontosY = yPos + 3;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 24, 16);
  
  doc.text('Pontos Totais:', infoX + 10, pontosY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${state.totalPoints}`, infoX + 35, pontosY);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Gastos:', infoX + 65, pontosY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${totalSpent}`, infoX + 80, pontosY);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Restantes:', infoX + 110, pontosY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${remainingPoints}`, infoX + 130, pontosY);

  yPos += 15;

  

  // ========== ATRIBUTOS ==========
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 24, 16);
  doc.text('ATRIBUTOS', MARGIN + 5, yPos);
  
  yPos += 2;
  doc.setDrawColor(200, 155, 60);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 5, yPos, 185, yPos);
  yPos += 6;

  const attrKeys = ['strength', 'life', 'dexterity', 'health', 'fatigue', 'intelligence', 'perception', 'willing'];
  const attrLabels = {
    strength: 'Força',
    life: 'Vida',
    dexterity: 'Destreza',
    health: 'Saúde',
    fatigue: 'Fadiga',
    intelligence: 'Inteligência',
    perception: 'Percepção',
    willing: 'Vontade'
  };
  const attrShort = {
    strength: 'ST',
    life: 'PV',
    dexterity: 'DX',
    health: 'HP',
    fatigue: 'HT',
    intelligence: 'IQ',
    perception: 'Per',
    willing: 'Von'
  };

  const attrCol1X = MARGIN + 8;
  const attrCol2X = MARGIN + 95;
  let attrY = yPos;

  for (let i = 0; i < 4; i++) {
    const key1 = attrKeys[i];
    const key2 = attrKeys[i + 4];
    const attr1 = state.attributes[key1];
    const attr2 = state.attributes[key2];

    // Primeira coluna
    doc.setFillColor(250, 245, 235);
    doc.setDrawColor(200, 155, 60);
    doc.setLineWidth(0.2);
    doc.roundedRect(attrCol1X - 2, attrY - 3, 78, 7, 1, 1, 'FD');
    doc.roundedRect(attrCol1X - 2, attrY - 3, 78, 7, 1, 1, 'S');
    
    doc.setTextColor(44, 24, 16);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${attrShort[key1]} (${attrLabels[key1]}):`, attrCol1X + 2, attrY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Base: ${attr1.base} | Atual: ${attr1.current}`, attrCol1X + 2, attrY + 3.5);

    // Segunda coluna
    doc.setFillColor(250, 245, 235);
    doc.setDrawColor(200, 155, 60);
    doc.setLineWidth(0.2);
    doc.roundedRect(attrCol2X - 2, attrY - 3, 78, 7, 1, 1, 'FD');
    doc.roundedRect(attrCol2X - 2, attrY - 3, 78, 7, 1, 1, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${attrShort[key2]} (${attrLabels[key2]}):`, attrCol2X + 2, attrY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Base: ${attr2.base} | Atual: ${attr2.current}`, attrCol2X + 2, attrY + 3.5);

    attrY += 9;
  }

  yPos = attrY + 5;

// ========== PÁGINA 2 - HISTÓRIA ==========

  doc.addPage();
  yPos = MARGIN + 5;
  addDecoratedBorder(MARGIN - 3, MARGIN - 3, 180, 277);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 24, 16);
  doc.text('HISTORIA DO PERSONAGEM', MARGIN + 5, yPos);
  yPos += 2;
  doc.setDrawColor(200, 155, 60);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 5, yPos, 185, yPos);
  yPos += 8;

  if (state.history) {
    doc.setFillColor(250, 245, 235);
    doc.setDrawColor(92, 61, 46);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN + 3, yPos - 3, 168, 240, 2, 2, 'FD');
    doc.roundedRect(MARGIN + 3, yPos - 3, 168, 240, 2, 2, 'S');
    
    const maxWidth = 240;
    const lines = doc.splitTextToSize(state.history, maxWidth);
    let textY = yPos + 5;
    
    lines.forEach((line) => {
      doc.setTextColor(44, 24, 16);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(line, MARGIN + 8, textY);
      textY += 5.5;
      
      if (textY > 270) {
        doc.addPage();
        textY = MARGIN + 10;
        addDecoratedBorder(MARGIN - 3, MARGIN - 3, 180, 250);
      }
    });
    
  } else {
    doc.setTextColor(92, 61, 46);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Nenhuma historia registrada.', MARGIN + 7, yPos);
  }

  // ========== PÁGINA 3 - VANTAGENS E DESVANTAGENS ==========
  doc.addPage();
  yPos = MARGIN + 5;
  addDecoratedBorder(MARGIN - 3, MARGIN - 3, 180, 277);

  // Vantagens
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 24, 16);
  doc.text('VANTAGENS', MARGIN + 5, yPos);
  yPos += 2;
  doc.setDrawColor(200, 155, 60);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 5, yPos, 185, yPos);
  yPos += 6;

  const advantages = state.advantages;
  if (advantages.length > 0) {
    advantages.forEach((adv) => {
      const cost = adv.baseCost + (adv.variableCost || 0) * adv.level;
      
      doc.setFillColor(250, 245, 235);
      doc.setDrawColor(200, 155, 60);
      doc.setLineWidth(0.2);
      doc.roundedRect(MARGIN + 3, yPos - 4, 168, 5.5, 1, 1, 'FD');
      doc.roundedRect(MARGIN + 3, yPos - 4, 168, 5.5, 1, 1, 'S');
      
      doc.setTextColor(44, 24, 16);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`- ${adv.name}`, MARGIN + 7, yPos);
      doc.text(`Nivel: ${adv.level}`, MARGIN + 120, yPos);
      doc.text(`+${cost} pts`, MARGIN + 155, yPos);
      
      yPos += 7;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = MARGIN + 5;
        addDecoratedBorder(MARGIN - 3, MARGIN - 3, 180, 277);
      }
    });
  } else {
    doc.setTextColor(92, 61, 46);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Nenhuma vantagem selecionada.', MARGIN + 7, yPos);
    yPos += 6;
  }

  yPos += 5;

  // Desvantagens
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 24, 16);
  doc.text('DESVANTAGENS', MARGIN + 5, yPos);
  yPos += 2;
  doc.setDrawColor(200, 155, 60);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 5, yPos, 185, yPos);
  yPos += 6;

  const disadvantages = state.disadvantages;
  if (disadvantages.length > 0) {
    disadvantages.forEach((dis) => {
      const cost = dis.baseCost + (dis.variableCost || 0) * dis.level;
      
      doc.setFillColor(250, 240, 235);
      doc.setDrawColor(139, 26, 26);
      doc.setLineWidth(0.2);
      doc.roundedRect(MARGIN + 3, yPos - 4, 168, 5.5, 1, 1, 'FD');
      doc.roundedRect(MARGIN + 3, yPos - 4, 168, 5.5, 1, 1, 'S');

      doc.setTextColor(44, 24, 16);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`- ${dis.name}`, MARGIN + 7, yPos);
      doc.text(`Nivel: ${dis.level}`, MARGIN + 120, yPos);
      doc.text(`${cost} pts`, MARGIN + 155, yPos);
      
      yPos += 7;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = MARGIN + 5;
        addDecoratedBorder(MARGIN - 3, MARGIN - 3, 180, 277);
      }
    });
  } else {
    doc.setTextColor(92, 61, 46);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Nenhuma desvantagem selecionada.', MARGIN + 7, yPos);
    yPos += 6;
  }

  // ========== PÁGINA 3 - PERÍCIAS, TÉCNICAS E MAGIAS ==========
  doc.addPage();
  yPos = MARGIN + 5;
  addDecoratedBorder(MARGIN - 3, MARGIN - 3, 180, 277);

  // Perícias
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 24, 16);
  doc.text('PERICIAS', MARGIN + 5, yPos);
  yPos += 2;
  doc.setDrawColor(200, 155, 60);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 5, yPos, 185, yPos);
  yPos += 6;

  const expertises = state.expertises;
  if (expertises.length > 0) {
    expertises.forEach((exp) => {
      const cost = exp.baseCost + (exp.variableCost || 0) * exp.level;
      
      doc.setFillColor(245, 240, 230);
      doc.setDrawColor(92, 61, 46);
      doc.setLineWidth(0.2);
      doc.roundedRect(MARGIN + 3, yPos - 4, 168, 5.5, 1, 1, 'FD');
      doc.roundedRect(MARGIN + 3, yPos - 4, 168, 5.5, 1, 1, 'S');
      
      doc.setTextColor(44, 24, 16);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`- ${exp.name}`, MARGIN + 7, yPos);
      doc.text(`Nivel: ${exp.level}`, MARGIN + 120, yPos);
      doc.text(`+${cost} pts`, MARGIN + 155, yPos);
      
      yPos += 7;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = MARGIN + 5;
        addDecoratedBorder(MARGIN - 3, MARGIN - 3, 180, 277);
      }
    });
  } else {
    doc.setTextColor(92, 61, 46);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Nenhuma pericia selecionada.', MARGIN + 7, yPos);
    yPos += 6;
  }

  yPos += 5;

  // Técnicas
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 24, 16);
  doc.text('TECNICAS', MARGIN + 5, yPos);
  yPos += 2;
  doc.setDrawColor(200, 155, 60);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 5, yPos, 190, yPos);
  yPos += 6;

  const techniques = state.techniques;
  if (techniques.length > 0) {
    techniques.forEach((tec) => {
      const cost = tec.baseCost + (tec.variableCost || 0) * tec.level;
      
      doc.setFillColor(245, 240, 230);
      doc.setDrawColor(92, 61, 46);
      doc.setLineWidth(0.2);
      doc.roundedRect(MARGIN + 3, yPos - 4, 168, 5.5, 1, 1, 'FD');
      doc.roundedRect(MARGIN + 3, yPos - 4, 168, 5.5, 1, 1, 'S');
      
      doc.setTextColor(44, 24, 16);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`- ${tec.name}`, MARGIN + 7, yPos);
      doc.text(`Nivel: ${tec.level}`, MARGIN + 120, yPos);
      doc.text(`+${cost} pts`, MARGIN + 155, yPos);
      
      yPos += 7;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = MARGIN + 5;
        addDecoratedBorder(MARGIN - 3, MARGIN - 3, 180, 277);
      }
    });
  } else {
    doc.setTextColor(92, 61, 46);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Nenhuma tecnica selecionada.', MARGIN + 7, yPos);
    yPos += 6;
  }

  yPos += 5;

  // Magias
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 24, 16);
  doc.text('MAGIAS', MARGIN + 5, yPos);
  yPos += 2;
  doc.setDrawColor(200, 155, 60);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 5, yPos, 190, yPos);
  yPos += 6;

  const magics = state.magics;
  if (magics.length > 0) {
    magics.forEach((mag) => {
      const cost = mag.baseCost + (mag.variableCost || 0) * mag.level;
      
      doc.setFillColor(245, 235, 245);
      doc.setDrawColor(107, 45, 107);
      doc.setLineWidth(0.2);
      doc.roundedRect(MARGIN + 3, yPos - 4, 168, 5.5, 1, 1, 'FD');
      doc.roundedRect(MARGIN + 3, yPos - 4, 168, 5.5, 1, 1, 'S');
      
      doc.setTextColor(44, 24, 16);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`- ${mag.name}`, MARGIN + 7, yPos);
      doc.text(`Nivel: ${mag.level}`, MARGIN + 120, yPos);
      doc.text(`+${cost} pts`, MARGIN + 155, yPos);
      
      yPos += 7;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = MARGIN + 5;
        addDecoratedBorder(MARGIN - 3, MARGIN - 3, 180, 277);
      }
    });
  } else {
    doc.setTextColor(92, 61, 46);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Nenhuma magia selecionada.', MARGIN + 7, yPos);
    yPos += 6;
  }


  // ========== PÁGINA 5 - RESUMO ==========
  doc.addPage();
  yPos = MARGIN + 5;
  addDecoratedBorder(MARGIN - 3, MARGIN - 3, 180, 277);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 24, 16);
  doc.text('RESUMO DE GASTOS', 100, yPos, { align: 'center' });
  yPos += 5;
  
  doc.setDrawColor(200, 155, 60);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 10, yPos, 185, yPos);
  yPos += 8;

  const colLabels = ['Item', 'Nivel', 'Custo'];
  const colWidths = [100, 30, 30];
  const startX = MARGIN + 5;

  // Cabeçalho
  doc.setFillColor(44, 24, 16);
  doc.setDrawColor(200, 155, 60);
  doc.setLineWidth(0.3);
  doc.roundedRect(startX, yPos - 3, colWidths[0], 6, 1, 1, 'FD');
  doc.roundedRect(startX + colWidths[0], yPos - 3, colWidths[1], 6, 1, 1, 'FD');
  doc.roundedRect(startX + colWidths[0] + colWidths[1], yPos - 3, colWidths[2], 6, 1, 1, 'FD');
  
  doc.setTextColor(245, 230, 200);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(colLabels[0], startX + 5, yPos);
  doc.text(colLabels[1], startX + colWidths[0] + 5, yPos);
  doc.text(colLabels[2], startX + colWidths[0] + colWidths[1] + 5, yPos);
  yPos += 7;

  // Lista de gastos
  breakdown.forEach((item, index) => {
    if (yPos > 275) {
      doc.addPage();
      yPos = MARGIN + 10;
      addDecoratedBorder(MARGIN - 3, MARGIN - 3, 180, 277);
    }
    
    if (index % 2 === 0) {
      doc.setFillColor(250, 245, 235);
    } else {
      doc.setFillColor(245, 240, 230);
    }
    doc.setDrawColor(200, 155, 60);
    doc.setLineWidth(0.1);
    doc.rect(startX, yPos - 3, colWidths[0] + colWidths[1] + colWidths[2], 5, 'FD');
    
    const label = item.label.length > 25 ? item.label.substring(0, 22) + '...' : item.label;
    const costStr = item.cost >= 0 ? `+${item.cost}` : `${item.cost}`;
    
    doc.setTextColor(44, 24, 16);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(label, startX + 3, yPos);
    doc.text(String(item.level || 1), startX + colWidths[0] + 3, yPos);
    doc.text(costStr, startX + colWidths[0] + colWidths[1] + 3, yPos);
    
    yPos += 5.5;
  });

  yPos += 5;
  doc.setDrawColor(200, 155, 60);
  doc.setLineWidth(0.5);
  doc.line(startX, yPos, startX + colWidths[0] + colWidths[1] + colWidths[2], yPos);
  yPos += 5;

  doc.setFillColor(44, 24, 16);
  doc.setDrawColor(200, 155, 60);
  doc.setLineWidth(0.3);
  doc.roundedRect(startX, yPos - 3, 160, 10, 1, 1, 'FD');
  doc.roundedRect(startX, yPos - 3, 160, 10, 1, 1, 'S');

  doc.setTextColor(200, 155, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL GASTO: ${totalSpent} pts`, startX + 10, yPos + 3);
  doc.text(`PONTOS RESTANTES: ${remainingPoints} pts`, startX + 80, yPos + 3);

  // Rodapé
  yPos += 15;
  doc.setTextColor(92, 61, 46);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('~ Gerado por THEOROS - Sistema de Fichas GURPS ~', 100, 285, { align: 'center' });

  // ========== SALVAR PDF ==========
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