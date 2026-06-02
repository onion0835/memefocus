window.memeMaker = function () {
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  return {
    canvas: null,
    ctx: null,
    backgroundImage: null,
    template: "claude",
    format: "square",
    spacingMode: "none",
    backgroundColor: "#111827",
    imageEffect: "none",
    watermark: true,
    drawMode: false,
    brushColor: "#ffffff",
    brushSize: 14,
    selectedId: "top-text",
    status: "",
    outputUrl: "",
    pageUrl: "https://memefocus.com/tools/meme-maker/",
    drag: null,
    layers: [],
    drawings: [],
    templateList: [
      { id: "claude", name: "Claude" },
      { id: "vibe", name: "Vibe Coding" },
      { id: "deploy", name: "Deploy" },
      { id: "terminal", name: "Terminal" },
      { id: "blank", name: "Blank" },
    ],
    formats: {
      square: [1080, 1080],
      fourThree: [1200, 900],
      portrait: [1080, 1620],
      landscape: [1600, 900],
    },
    templates: {
      claude: ["#15162b", "#7c3aed", "#23c55e"],
      vibe: ["#0b1020", "#06b6d4", "#f59e0b"],
      deploy: ["#14151f", "#ef4444", "#a78bfa"],
      terminal: ["#050816", "#22c55e", "#38bdf8"],
      blank: ["#111827", "#1f2937", "#7c3aed"],
    },

    get selectedLayer() {
      return this.layers.find((layer) => layer.id === this.selectedId) || null;
    },

    get textLayers() {
      return this.layers.filter((layer) => layer.type === "text");
    },

    init(canvas) {
      this.canvas = canvas || document.querySelector("[data-meme-canvas]");
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext("2d");
      this.resetLayers(false);
      this.render();
    },

    resetLayers(shouldRender = true) {
      this.layers = [
        this.createTextLayer("top-text", "CLAUDE SAID IT WAS A SMALL FIX", 0.5, 0.08, 0.86, 82),
        this.createTextLayer("bottom-text", "NOW THE TEST SUITE HAS LORE", 0.5, 0.74, 0.86, 82),
      ];
      this.drawings = [];
      this.selectedId = "top-text";
      this.drawMode = false;
      this.outputUrl = "";
      this.status = "";
      if (shouldRender) this.render();
    },

    resetAll() {
      this.backgroundImage = null;
      this.template = "claude";
      this.format = "square";
      this.spacingMode = "none";
      this.imageEffect = "none";
      this.backgroundColor = "#111827";
      this.watermark = true;
      this.resetLayers();
    },

    createTextLayer(id, text, x, y, width, fontSize) {
      return {
        id,
        type: "text",
        text,
        x,
        y,
        width,
        fontSize,
        color: "#ffffff",
        outlineColor: "#000000",
        outlineWidth: 0.14,
        align: "center",
        uppercase: true,
        font: "Impact",
      };
    },

    addText() {
      const id = `text-${Date.now()}`;
      this.layers.push(this.createTextLayer(id, "NEW TEXT", 0.5, 0.42, 0.72, 68));
      this.selectedId = id;
      this.drawMode = false;
      this.outputUrl = "";
      this.render();
    },

    duplicateSelected() {
      const layer = this.selectedLayer;
      if (!layer) return;
      const copy = {
        ...layer,
        id: `${layer.type}-${Date.now()}`,
        x: clamp(layer.x + 0.04, 0.04, 0.96),
        y: clamp(layer.y + 0.04, 0.04, 0.92),
      };
      this.layers.push(copy);
      this.selectedId = copy.id;
      this.outputUrl = "";
      this.render();
    },

    removeSelected() {
      if (!this.selectedLayer) return;
      this.layers = this.layers.filter((layer) => layer.id !== this.selectedId);
      this.selectedId = this.layers[0] ? this.layers[0].id : "";
      this.outputUrl = "";
      this.render();
    },

    selectLayer(id) {
      this.selectedId = id;
      this.drawMode = false;
      this.render();
    },

    moveSelected(direction) {
      const index = this.layers.findIndex((layer) => layer.id === this.selectedId);
      if (index < 0) return;
      const nextIndex = direction === "up" ? index + 1 : index - 1;
      if (nextIndex < 0 || nextIndex >= this.layers.length) return;
      const temp = this.layers[index];
      this.layers[index] = this.layers[nextIndex];
      this.layers[nextIndex] = temp;
      this.outputUrl = "";
      this.render();
    },

    setTemplate(value) {
      this.template = value;
      this.backgroundImage = null;
      this.outputUrl = "";
      this.render();
    },

    setFormat(value) {
      this.format = value;
      this.outputUrl = "";
      this.render();
    },

    loadTemplateUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      this.loadImageFile(file, (img) => {
        this.backgroundImage = img;
        this.template = "upload";
        this.outputUrl = "";
        this.render();
      });
      event.target.value = "";
    },

    addSticker(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      this.loadImageFile(file, (img) => {
        const [canvasWidth, canvasHeight] = this.formats[this.format];
        const width = 0.34;
        const height = clamp((width * canvasWidth * img.height) / img.width / canvasHeight, 0.08, 0.56);
        const id = `image-${Date.now()}`;
        this.layers.push({
          id,
          type: "image",
          image: img,
          x: 0.5,
          y: 0.46,
          width,
          height,
          aspect: height / width,
          opacity: 1,
        });
        this.selectedId = id;
        this.drawMode = false;
        this.outputUrl = "";
        this.render();
      });
      event.target.value = "";
    },

    loadImageFile(file, callback) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => callback(img);
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    },

    setColorPreset(preset) {
      const layer = this.selectedLayer;
      if (!layer || layer.type !== "text") return;
      if (preset === "white") {
        layer.color = "#ffffff";
        layer.outlineColor = "#000000";
      }
      if (preset === "black") {
        layer.color = "#000000";
        layer.outlineColor = "#ffffff";
      }
      if (preset === "violet") {
        layer.color = "#ffffff";
        layer.outlineColor = "#7c3aed";
      }
      this.outputUrl = "";
      this.render();
    },

    resizeSelectedImage() {
      const layer = this.selectedLayer;
      if (!layer || layer.type !== "image") return;
      layer.height = clamp(layer.width * (layer.aspect || 0.75), 0.08, 0.78);
      this.outputUrl = "";
      this.render();
    },

    toggleDrawMode() {
      this.drawMode = !this.drawMode;
      if (this.drawMode) this.selectedId = "";
      this.render();
    },

    clearDrawings() {
      this.drawings = [];
      this.outputUrl = "";
      this.render();
    },

    pointerDown(event) {
      if (!this.canvas) return;
      event.preventDefault();
      const point = this.eventPoint(event);
      if (this.drawMode) {
        const path = {
          color: this.brushColor,
          size: this.brushSize,
          points: [this.toRelative(point)],
        };
        this.drawings.push(path);
        this.drag = { mode: "draw", path };
        this.outputUrl = "";
        this.render();
        return;
      }

      const hit = this.hitTest(point);
      if (!hit) {
        this.selectedId = "";
        this.drag = null;
        this.render();
        return;
      }

      this.selectedId = hit.layer.id;
      this.drag = {
        mode: hit.mode,
        layer: hit.layer,
        start: point,
        startX: hit.layer.x,
        startY: hit.layer.y,
        startWidth: hit.layer.width,
        startHeight: hit.layer.height,
      };
      this.outputUrl = "";
      this.render();
    },

    pointerMove(event) {
      if (!this.drag || !this.canvas) return;
      event.preventDefault();
      const point = this.eventPoint(event);
      const [canvasWidth, canvasHeight] = this.formats[this.format];

      if (this.drag.mode === "draw") {
        this.drag.path.points.push(this.toRelative(point));
        this.outputUrl = "";
        this.render();
        return;
      }

      const layer = this.drag.layer;
      if (this.drag.mode === "move") {
        layer.x = clamp(this.drag.startX + (point.x - this.drag.start.x) / canvasWidth, 0.02, 0.98);
        layer.y = clamp(this.drag.startY + (point.y - this.drag.start.y) / canvasHeight, 0.02, 0.96);
      }

      if (this.drag.mode === "resize") {
        const delta = (point.x - this.drag.start.x) / canvasWidth;
        layer.width = clamp(this.drag.startWidth + delta, 0.14, 0.96);
        if (layer.type === "image") {
          const ratio = this.drag.startHeight / this.drag.startWidth;
          layer.height = clamp(layer.width * ratio, 0.08, 0.78);
        }
      }

      this.outputUrl = "";
      this.render();
    },

    pointerUp() {
      this.drag = null;
    },

    eventPoint(event) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * this.canvas.width,
        y: ((event.clientY - rect.top) / rect.height) * this.canvas.height,
      };
    },

    toRelative(point) {
      return {
        x: point.x / this.canvas.width,
        y: point.y / this.canvas.height,
      };
    },

    render(showSelection = true) {
      if (!this.canvas || !this.ctx) return;
      const [width, height] = this.formats[this.format];
      this.canvas.width = width;
      this.canvas.height = height;
      this.drawBackground(width, height);
      this.layers.forEach((layer) => this.drawLayer(layer, width, height, showSelection));
      this.drawDrawings(width, height);
      if (this.watermark) this.drawWatermark(width, height);
      if (showSelection && this.drawMode) this.drawDrawModeBadge(width);
    },

    drawBackground(width, height) {
      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = this.spacingMode === "none" ? "#0b0f19" : "#ffffff";
      ctx.fillRect(0, 0, width, height);
      const rect = this.contentRect(width, height);

      if (this.backgroundImage) {
        ctx.filter = this.canvasFilter();
        this.drawCoverImage(this.backgroundImage, rect.x, rect.y, rect.width, rect.height);
        ctx.filter = "none";
        ctx.restore();
        return;
      }

      if (this.template === "blank") {
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        this.drawGrid(rect);
        ctx.restore();
        return;
      }

      const colors = this.templates[this.template] || this.templates.claude;
      const bg = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
      bg.addColorStop(0, colors[0]);
      bg.addColorStop(0.58, "#0b0f19");
      bg.addColorStop(1, colors[1]);
      ctx.fillStyle = bg;
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

      this.drawPanel(rect.x + rect.width * 0.09, rect.y + rect.height * 0.2, rect.width * 0.46, rect.height * 0.22, colors[1]);
      this.drawPanel(rect.x + rect.width * 0.47, rect.y + rect.height * 0.42, rect.width * 0.42, rect.height * 0.26, colors[2]);
      this.drawToken(rect.x + rect.width * 0.78, rect.y + rect.height * 0.22, Math.min(rect.width, rect.height) * 0.095, colors[2], "</>");
      this.drawToken(rect.x + rect.width * 0.22, rect.y + rect.height * 0.68, Math.min(rect.width, rect.height) * 0.08, colors[1], "AI");
      ctx.restore();
    },

    contentRect(width, height) {
      const top = this.spacingMode === "top" || this.spacingMode === "both" ? height * 0.12 : 0;
      const bottom = this.spacingMode === "bottom" || this.spacingMode === "both" ? height * 0.12 : 0;
      return { x: 0, y: top, width, height: height - top - bottom };
    },

    canvasFilter() {
      const filters = {
        none: "none",
        grayscale: "grayscale(1)",
        sepia: "sepia(0.9)",
        contrast: "contrast(1.25) saturate(1.2)",
        blur: "blur(2px)",
      };
      return filters[this.imageEffect] || "none";
    },

    drawCoverImage(img, x, y, width, height) {
      const ctx = this.ctx;
      const scale = Math.max(width / img.width, height / img.height);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const drawX = x + (width - drawWidth) / 2;
      const drawY = y + (height - drawHeight) / 2;
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    },

    drawGrid(rect) {
      const ctx = this.ctx;
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 2;
      const step = Math.max(80, rect.width / 10);
      for (let x = rect.x; x <= rect.x + rect.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, rect.y);
        ctx.lineTo(x, rect.y + rect.height);
        ctx.stroke();
      }
      for (let y = rect.y; y <= rect.y + rect.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(rect.x, y);
        ctx.lineTo(rect.x + rect.width, y);
        ctx.stroke();
      }
      ctx.restore();
    },

    drawLayer(layer, width, height, showSelection) {
      if (layer.type === "text") this.drawTextLayer(layer, width, height, showSelection);
      if (layer.type === "image") this.drawImageLayer(layer, width, height, showSelection);
    },

    drawTextLayer(layer, width, height, showSelection) {
      const ctx = this.ctx;
      const raw = (layer.text || "").trim();
      const box = this.textBox(layer, width, height);
      if (!raw) {
        if (showSelection && layer.id === this.selectedId) this.drawSelection(box, "Text");
        return;
      }
      const text = layer.uppercase ? raw.toUpperCase() : raw;
      const lines = this.wrapLines(text, box.width, layer.fontSize, layer.font);
      const lineHeight = layer.fontSize * 1.08;

      ctx.save();
      ctx.font = this.fontString(layer);
      ctx.textAlign = layer.align;
      ctx.textBaseline = "top";
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.strokeStyle = layer.outlineColor;
      ctx.fillStyle = layer.color;
      ctx.lineWidth = Math.max(2, layer.fontSize * layer.outlineWidth);

      const textX = layer.align === "left" ? box.x : layer.align === "right" ? box.x + box.width : box.x + box.width / 2;
      lines.forEach((line, index) => {
        const lineY = box.y + index * lineHeight;
        if (layer.outlineWidth > 0) ctx.strokeText(line, textX, lineY, box.width);
        ctx.fillText(line, textX, lineY, box.width);
      });
      ctx.restore();

      if (showSelection && layer.id === this.selectedId) this.drawSelection(box, "Text");
    },

    drawImageLayer(layer, width, height, showSelection) {
      if (!layer.image) return;
      const ctx = this.ctx;
      const box = this.imageBox(layer, width, height);
      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.drawImage(layer.image, box.x, box.y, box.width, box.height);
      ctx.restore();
      if (showSelection && layer.id === this.selectedId) this.drawSelection(box, "Image");
    },

    drawDrawings(width, height) {
      const ctx = this.ctx;
      ctx.save();
      this.drawings.forEach((path) => {
        if (path.points.length < 2) return;
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        path.points.forEach((point, index) => {
          const x = point.x * width;
          const y = point.y * height;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
      ctx.restore();
    },

    textBox(layer, width, height) {
      const boxWidth = width * layer.width;
      const lines = this.wrapLines(layer.text || "Text", boxWidth, layer.fontSize, layer.font);
      const boxHeight = Math.max(layer.fontSize * 1.12, lines.length * layer.fontSize * 1.08);
      return {
        x: layer.x * width - boxWidth / 2,
        y: layer.y * height,
        width: boxWidth,
        height: boxHeight,
      };
    },

    imageBox(layer, width, height) {
      const boxWidth = width * layer.width;
      const boxHeight = height * layer.height;
      return {
        x: layer.x * width - boxWidth / 2,
        y: layer.y * height - boxHeight / 2,
        width: boxWidth,
        height: boxHeight,
      };
    },

    fontString(layer) {
      const family = layer.font === "Arial" ? "Arial, sans-serif" : layer.font === "System" ? "system-ui, sans-serif" : "Impact, Arial Black, sans-serif";
      return `900 ${layer.fontSize}px ${family}`;
    },

    wrapLines(text, maxWidth, size, font) {
      const ctx = this.ctx;
      ctx.font = `900 ${size}px ${font === "Arial" ? "Arial, sans-serif" : font === "System" ? "system-ui, sans-serif" : "Impact, Arial Black, sans-serif"}`;
      const lines = [];
      text.split(/\n+/).forEach((block) => {
        const words = block.split(/\s+/).filter(Boolean);
        let line = "";
        words.forEach((word) => {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        });
        if (line) lines.push(line);
      });
      return lines.slice(0, 8);
    },

    drawSelection(box, label) {
      const ctx = this.ctx;
      ctx.save();
      ctx.setLineDash([16, 10]);
      ctx.strokeStyle = "#a78bfa";
      ctx.lineWidth = 4;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      ctx.setLineDash([]);
      ctx.fillStyle = "#7c3aed";
      ctx.fillRect(box.x + box.width - 24, box.y + box.height - 24, 24, 24);
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 24px Arial, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(label, box.x + 10, Math.max(30, box.y - 8));
      ctx.restore();
    },

    drawDrawModeBadge(width) {
      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = "rgba(124,58,237,0.92)";
      this.roundRect(24, 24, Math.min(270, width - 48), 54, 12);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 24px Arial, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("Draw mode", 44, 52);
      ctx.restore();
    },

    hitTest(point) {
      for (let i = this.layers.length - 1; i >= 0; i -= 1) {
        const layer = this.layers[i];
        const box = layer.type === "text" ? this.textBox(layer, this.canvas.width, this.canvas.height) : this.imageBox(layer, this.canvas.width, this.canvas.height);
        const inside = point.x >= box.x && point.x <= box.x + box.width && point.y >= box.y && point.y <= box.y + box.height;
        if (!inside) continue;
        const handleSize = 44;
        const resize = point.x >= box.x + box.width - handleSize && point.y >= box.y + box.height - handleSize;
        return { layer, mode: resize ? "resize" : "move" };
      }
      return null;
    },

    drawPanel(x, y, width, height, accent) {
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      this.roundRect(x, y, width, height, 28);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = accent;
      for (let i = 0; i < 5; i += 1) {
        ctx.fillRect(x + 34, y + 42 + i * 34, width * (0.28 + i * 0.08), 12);
      }
      ctx.restore();
    },

    drawToken(x, y, radius, color, label) {
      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `900 ${Math.max(24, radius * 0.52)}px Arial Black, Impact, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x, y + 2);
      ctx.restore();
    },

    drawWatermark(width, height) {
      const ctx = this.ctx;
      const text = "memefocus.com";
      ctx.save();
      ctx.font = `800 ${Math.max(22, width * 0.026)}px Arial, sans-serif`;
      const metrics = ctx.measureText(text);
      const pad = 18;
      const boxWidth = metrics.width + pad * 2;
      const boxHeight = 44;
      const x = width - boxWidth - 24;
      const y = height - boxHeight - 22;
      ctx.fillStyle = "rgba(0,0,0,0.56)";
      this.roundRect(x, y, boxWidth, boxHeight, 12);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x + pad, y + boxHeight / 2 + 1);
      ctx.restore();
    },

    roundRect(x, y, width, height, radius) {
      const ctx = this.ctx;
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + height, r);
      ctx.arcTo(x + width, y + height, x, y + height, r);
      ctx.arcTo(x, y + height, x, y, r);
      ctx.arcTo(x, y, x + width, y, r);
      ctx.closePath();
    },

    async canvasBlob() {
      this.render(false);
      const blob = await new Promise((resolve) => this.canvas.toBlob(resolve, "image/png", 0.95));
      this.render(true);
      return blob;
    },

    async generateMeme() {
      this.render(false);
      this.outputUrl = this.canvas.toDataURL("image/png", 0.95);
      this.render(true);
      this.status = "Meme generated.";
    },

    async downloadPng() {
      const blob = await this.canvasBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "memefocus-meme.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      this.status = "PNG ready.";
    },

    async shareImage() {
      const blob = await this.canvasBlob();
      const file = new File([blob], "memefocus-meme.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "MemeFocus meme",
          text: this.shareText(),
        });
        this.status = "Shared.";
      } else {
        await this.downloadPng();
        this.status = "PNG downloaded.";
      }
    },

    shareToX() {
      const url = new URL("https://twitter.com/intent/tweet");
      url.searchParams.set("text", this.shareText());
      url.searchParams.set("url", this.pageUrl);
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    },

    shareToReddit() {
      const url = new URL("https://www.reddit.com/submit");
      url.searchParams.set("url", this.pageUrl);
      url.searchParams.set("title", this.shareText());
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    },

    shareText() {
      const joined = this.textLayers.map((layer) => (layer.text || "").trim()).filter(Boolean).join(" / ");
      return joined || "Made with MemeFocus";
    },
  };
};
