# 🎬 LimaFX — O Estúdio de Edição no Navegador

**LimaFX** é o seu estúdio digital direto no navegador, feito pra ser simples, poderoso e completo.  
Edite **imagens e vídeos** com tudo que o Node.js tem de melhor. Sem limites, sem enrolação, sem travar sua criatividade.

---

## 🚀 O que é o LimaFX?

- 📷 Edição de imagens com filtros, cortes, textos, efeitos e exportação
- 🎞️ Edição de vídeos com corte, efeitos, legendas e exportação final
- 🧠 Cache de projetos por IP (sem precisar de login)
- 📱 Interface responsiva, feita em HTML/CSS/JS puro
- ⚙️ Backend Node.js usando o máximo de recursos de edição
- 🛠️ Código modular e pronto pra evoluir (PWA, IA, timeline, etc.)

---

## 🧰 Tecnologias Utilizadas

### 🎨 Imagens
- `sharp` – resize, crop, rotação, formatos
- `jimp` – filtros como blur, pixelate, sepia, grayscale
- `node-canvas` – desenhar textos, shapes, overlays
- `color-thief-node` – extrair cor dominante de uma imagem
- `tesseract.js` – reconhecimento de texto (OCR)

### 🎥 Vídeos
- `fluent-ffmpeg` – corte, filtro, legendas, exportações
- `ffmpeg-static` – executável FFmpeg embutido
- `get-video-duration` – leitura da duração do vídeo
- (opcional) `node-video-lib` – manipulação de frames/raw

### Outros
- `express` – servidor HTTP
- `multer` – upload de arquivos
- `fs`, `path` – manipulação de arquivos
- Organização e cache por IP do usuário

---

## ⚙️ Como Rodar o Projeto

### 1. Requisitos
- Node.js instalado
- FFmpeg instalado (ou usando `ffmpeg-static`)
- Navegador moderno (Chrome, Firefox, Edge)

### 2. Iniciar o backend
```bash
cd backend
npm install
node index.js
